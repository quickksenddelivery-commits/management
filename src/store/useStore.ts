import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, CartItem, Ticket } from '../types';

interface AppStore {
  user: User | null;
  cart: CartItem[];
  login: (email: string, password: string) => { success: boolean; error?: string };
  register: (name: string, email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (eventId: string, tierId: string) => void;
  updateQty: (eventId: string, tierId: string, qty: number) => void;
  clearCart: () => void;
  toggleSaveEvent: (eventId: string) => void;
  toggleFollow: (celebrityId: string) => void;
  purchaseTickets: (attendeeName: string, attendeeEmail: string) => Ticket[];
}

export const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      user: null,
      cart: [],

      login: (email, password) => {
        if (!email || !password) return { success: false, error: 'Please fill all fields' };
        if (password.length < 6) return { success: false, error: 'Password must be at least 6 characters' };
        const existing = get().user;
        if (existing) return { success: true };
        set({
          user: {
            id: `user-${Date.now()}`,
            name: email.split('@')[0].replace(/[._]/g, ' '),
            email,
            following: [],
            savedEvents: [],
            tickets: [],
          },
        });
        return { success: true };
      },

      register: (name, email, password) => {
        if (!name || !email || !password) return { success: false, error: 'Please fill all fields' };
        if (password.length < 6) return { success: false, error: 'Password must be at least 6 characters' };
        set({
          user: {
            id: `user-${Date.now()}`,
            name,
            email,
            following: [],
            savedEvents: [],
            tickets: [],
          },
        });
        return { success: true };
      },

      logout: () => set({ user: null, cart: [] }),

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
      },

      toggleFollow: (celebId) => {
        const { user } = get();
        if (!user) return;
        const following = user.following.includes(celebId);
        set({ user: { ...user, following: following ? user.following.filter(id => id !== celebId) : [...user.following, celebId] } });
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
    }),
    { name: 'rachead-store', partialize: (s) => ({ user: s.user, cart: s.cart }) }
  )
);

export const useCartTotal = () =>
  useStore(s => s.cart.reduce((t, i) => t + i.price * i.quantity, 0));

export const useCartCount = () =>
  useStore(s => s.cart.reduce((t, i) => t + i.quantity, 0));
