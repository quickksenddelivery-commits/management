import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, CartItem, Ticket, SponsorshipApplication } from '../types';
import { api, getToken, clearToken, ApiError } from '../lib/api';

type AuthResult = { success: boolean; error?: string };

/** Map a backend user document to the frontend User shape. */
type ApiUser = {
  id?: string; _id?: string; name: string; email: string; avatar?: string;
  following?: string[]; savedEvents?: string[];
};
const mapUser = (u: ApiUser): User => ({
  id: u.id || u._id || `user-${Date.now()}`,
  name: u.name,
  email: u.email,
  avatar: u.avatar,
  following: u.following ?? [],
  savedEvents: u.savedEvents ?? [],
  tickets: [],
});

interface AppStore {
  user: User | null;
  cart: CartItem[];
  sponsorshipApplications: SponsorshipApplication[];
  initAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (name: string, email: string, password: string) => Promise<AuthResult>;
  logout: () => void;
  updateProfile: (updates: { name?: string; avatar?: string }) => Promise<void>;
  addToCart: (item: CartItem) => void;
  removeFromCart: (eventId: string, tierId: string) => void;
  updateQty: (eventId: string, tierId: string, qty: number) => void;
  clearCart: () => void;
  toggleSaveEvent: (eventId: string) => void;
  toggleFollow: (celebrityId: string) => void;
  purchaseTickets: (attendeeName: string, attendeeEmail: string) => Ticket[];
  submitSponsorship: (
    app: Omit<SponsorshipApplication, 'id' | 'submittedAt' | 'status'>
  ) => SponsorshipApplication;
}

export const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      user: null,
      cart: [],
      sponsorshipApplications: [],

      // Re-hydrate the logged-in user from the backend if a token is present.
      initAuth: async () => {
        if (!getToken()) return;
        try {
          const u = await api.auth.me();
          set({ user: mapUser(u as ApiUser) });
        } catch {
          /* offline or expired — keep any persisted user */
        }
      },

      login: async (email, password) => {
        if (!email || !password) return { success: false, error: 'Please fill all fields' };
        if (password.length < 6) return { success: false, error: 'Password must be at least 6 characters' };
        try {
          const { user } = await api.auth.login(email, password);
          set({ user: mapUser(user as ApiUser) });
          return { success: true };
        } catch (e) {
          // Real auth error from the server — surface it.
          if (e instanceof ApiError && e.status !== 0) {
            return { success: false, error: e.message };
          }
          // Backend offline — fall back to the local demo session.
          set({
            user: {
              id: `user-${Date.now()}`,
              name: email.split('@')[0].replace(/[._]/g, ' '),
              email, following: [], savedEvents: [], tickets: [],
            },
          });
          return { success: true };
        }
      },

      register: async (name, email, password) => {
        if (!name || !email || !password) return { success: false, error: 'Please fill all fields' };
        if (password.length < 6) return { success: false, error: 'Password must be at least 6 characters' };
        try {
          const { user } = await api.auth.register(name, email, password);
          set({ user: mapUser(user as ApiUser) });
          return { success: true };
        } catch (e) {
          if (e instanceof ApiError && e.status !== 0) {
            return { success: false, error: e.message };
          }
          set({
            user: { id: `user-${Date.now()}`, name, email, following: [], savedEvents: [], tickets: [] },
          });
          return { success: true };
        }
      },

      logout: () => {
        api.auth.logout().catch(() => {});
        clearToken();
        set({ user: null, cart: [] });
      },

      updateProfile: async (updates) => {
        const { user } = get();
        if (!user) return;
        // Optimistic local update
        set({ user: { ...user, ...updates } });
        // Sync to backend when signed in via API
        if (getToken()) {
          try { await api.users.updateMe(updates); } catch { /* keep local update */ }
        }
      },

      addToCart: (item) => {
        const { cart } = get();
        const idx = cart.findIndex(c => c.eventId === item.eventId && c.tierId === item.tierId);
        if (idx >= 0) {
          const updated = [...cart];
          updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + item.quantity };
          set({ cart: updated });
        } else {
          set({ cart: [...cart, item] });
        }
      },

      removeFromCart: (eventId, tierId) =>
        set({ cart: get().cart.filter(c => !(c.eventId === eventId && c.tierId === tierId)) }),

      updateQty: (eventId, tierId, qty) => {
        if (qty <= 0) { get().removeFromCart(eventId, tierId); return; }
        set({
          cart: get().cart.map(c =>
            c.eventId === eventId && c.tierId === tierId ? { ...c, quantity: qty } : c
          ),
        });
      },

      clearCart: () => set({ cart: [] }),

      toggleSaveEvent: (eventId) => {
        const { user } = get();
        if (!user) return;
        const saved = user.savedEvents.includes(eventId);
        set({ user: { ...user, savedEvents: saved ? user.savedEvents.filter(id => id !== eventId) : [...user.savedEvents, eventId] } });
        if (getToken()) {
          (saved ? api.users.unsaveEvent(eventId) : api.users.saveEvent(eventId)).catch(() => {});
        }
      },

      toggleFollow: (celebId) => {
        const { user } = get();
        if (!user) return;
        const following = user.following.includes(celebId);
        set({ user: { ...user, following: following ? user.following.filter(id => id !== celebId) : [...user.following, celebId] } });
        if (getToken()) {
          (following ? api.users.unfollow(celebId) : api.users.follow(celebId)).catch(() => {});
        }
      },

      purchaseTickets: (attendeeName, attendeeEmail) => {
        const { cart, user } = get();
        if (!user || cart.length === 0) return [];
        const newTickets: Ticket[] = cart.map(item => ({
          id: `tkt-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
          eventId: item.eventId,
          tierId: item.tierId,
          tierName: item.tierName,
          eventTitle: item.eventTitle,
          eventDate: item.eventDate,
          eventVenue: item.eventVenue,
          eventCity: item.eventCity,
          purchasedAt: new Date().toISOString(),
          qrCode: `RCHDTKT-${Date.now()}-${Math.random().toString(36).slice(2, 9).toUpperCase()}`,
          price: item.price,
          currency: item.currency,
          status: 'active',
          attendeeName,
          attendeeEmail,
        }));
        set({ user: { ...user, tickets: [...user.tickets, ...newTickets] }, cart: [] });
        return newTickets;
      },

      submitSponsorship: (app) => {
        const application: SponsorshipApplication = {
          ...app,
          id: `spo-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
          submittedAt: new Date().toISOString(),
          status: 'pending',
        };
        set({ sponsorshipApplications: [...get().sponsorshipApplications, application] });
        return application;
      },
    }),
    {
      name: 'rachead-store',
      partialize: (s) => ({
        user: s.user,
        cart: s.cart,
        sponsorshipApplications: s.sponsorshipApplications,
      }),
    }
  )
);

export const useCartTotal = () =>
  useStore(s => s.cart.reduce((t, i) => t + i.price * i.quantity, 0));

export const useCartCount = () =>
  useStore(s => s.cart.reduce((t, i) => t + i.quantity, 0));
