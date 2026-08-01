/**
 * FanConnectPro API client — integrates every endpoint of the fanconnectpro-backend
 * (Node + Express + Mongoose) at `VITE_API_URL` (default http://localhost:5001/api).
 *
 * Usage:
 *   import { api } from '../lib/api';
 *   const { token, user } = await api.auth.login(email, password); // token is stored automatically
 *   const { events, meta } = await api.events.list({ category: 'musician' });
 *   const { order, payment } = await api.orders.create({ items, attendeeName, attendeeEmail, coin: 'USDT' });
 *
 * Every backend response uses the envelope `{ status, data?, meta?, message?, token? }`.
 * Each method below unwraps it and returns just the useful payload.
 * Auth token is persisted in localStorage and attached as `Authorization: Bearer <token>`.
 */

import type {
  Celebrity,
  Event,
  Ticket,
  TicketTier,
  User,
  SponsorshipPackage,
  Sponsor,
  SponsorshipApplication,
  SponsorTier,
  CelebrityCategory,
} from '../types';

/** Event create/update payload — ticket tiers have no `id` yet; the server generates one per tier. */
export type EventInput = Partial<Omit<Event, 'ticketTiers'>> & { ticketTiers?: Omit<TicketTier, 'id'>[] };
import type { Coin } from './crypto';

/* ───────────────── Config ───────────────── */

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5001/api';
const API_ORIGIN = BASE_URL.replace(/\/api\/?$/, '');
const TOKEN_KEY = 'fanconnectpro-token';
const ADMIN_SECRET_KEY = 'fanconnectpro-admin-secret';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t: string) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export const getAdminSecret = () => localStorage.getItem(ADMIN_SECRET_KEY);
export const setAdminSecret = (s: string) => localStorage.setItem(ADMIN_SECRET_KEY, s);
export const clearAdminSecret = () => localStorage.removeItem(ADMIN_SECRET_KEY);

export class ApiError extends Error {
  status: number;
  body?: unknown;
  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

/* ───────────────── API-specific types ───────────────── */

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface OrderItem {
  eventId: string;
  tierId: string;
  tierName: string;
  eventTitle: string;
  eventDate: string;
  eventVenue: string;
  eventCity: string;
  eventImage?: string;
  quantity: number;
  price: number;
  currency: string;
}

export type OrderStatus = 'pending' | 'paid' | 'cancelled' | 'expired';

export interface Order {
  _id: string;
  id?: string;
  reference: string;
  user: string;
  items: OrderItem[];
  attendee: { name: string; email: string };
  coin: { symbol: string; network: string; address: string };
  usdTotal: number;
  cryptoAmount: number;
  status: OrderStatus;
  txHash?: string;
  paidAt?: string;
  createdAt: string;
}

export interface PaymentInstructions {
  coin: string;
  network: string;
  address: string;
  usdTotal: number;
  cryptoAmount: number;
}

export interface PendingSponsor {
  id: string;
  companyName: string;
  packageName: string;
  tier?: SponsorTier;
  status: string;
}

export interface AuthResult {
  token: string;
  user: User;
}

type Query = Record<string, string | number | boolean | undefined>;

interface Envelope<T> {
  status: string;
  data?: T;
  meta?: Pagination;
  message?: string;
  token?: string;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  auth?: boolean;
  adminSecret?: string;
  /** When true, attach the stored admin secret automatically if no explicit one is given */
  admin?: boolean;
  query?: Query;
}

/* ───────────────── Core request ───────────────── */

function buildUrl(path: string, query?: Query): string {
  if (!query) return `${BASE_URL}${path}`;
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined && v !== '') params.append(k, String(v));
  }
  const qs = params.toString();
  return `${BASE_URL}${path}${qs ? `?${qs}` : ''}`;
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<Envelope<T>> {
  const { method = 'GET', body, auth = false, adminSecret, admin, query } = opts;

  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth) {
    const token = getToken();
    // No token (e.g. local demo session) — fail fast without a doomed 401 round-trip.
    if (!token) throw new ApiError('Not authenticated', 401);
    headers['Authorization'] = `Bearer ${token}`;
  }
  const secret = adminSecret ?? (admin ? getAdminSecret() ?? undefined : undefined);
  if (secret) headers['x-admin-secret'] = secret;

  let res: Response;
  try {
    res = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Network error — is the backend running?', 0);
  }

  let json: Envelope<T> & { error?: string } = { status: 'error' };
  const text = await res.text();
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      /* non-JSON response */
    }
  }

  if (!res.ok) {
    const message = json.message || json.error || `Request failed (${res.status})`;
    if (res.status === 401) clearToken();
    throw new ApiError(message, res.status, json);
  }

  return json;
}

/* ───────────────── Auth — /api/auth ───────────────── */

const auth = {
  async register(name: string, email: string, password: string): Promise<AuthResult> {
    const r = await request<{ user: User }>('/auth/register', {
      method: 'POST',
      body: { name, email, password },
    });
    if (r.token) setToken(r.token);
    return { token: r.token!, user: r.data!.user };
  },

  async login(email: string, password: string): Promise<AuthResult> {
    const r = await request<{ user: User }>('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    if (r.token) setToken(r.token);
    return { token: r.token!, user: r.data!.user };
  },

  async logout(): Promise<void> {
    try {
      await request('/auth/logout', { method: 'POST', auth: true });
    } finally {
      clearToken();
    }
  },

  async me(): Promise<User> {
    const r = await request<{ user: User }>('/auth/me', { auth: true });
    return r.data!.user;
  },
};

/* ───────────────── Users (self) — /api/users ───────────────── */

const users = {
  async updateMe(updates: { name?: string; avatar?: string }): Promise<User> {
    const r = await request<{ user: User }>('/users/me', { method: 'PATCH', auth: true, body: updates });
    return r.data!.user;
  },

  async getFollowing(): Promise<Celebrity[]> {
    const r = await request<{ celebrities: Celebrity[] }>('/users/me/following', { auth: true });
    return r.data!.celebrities;
  },

  async follow(celebrityId: string): Promise<string[]> {
    const r = await request<{ following: string[] }>(`/users/me/following/${celebrityId}`, { method: 'POST', auth: true });
    return r.data!.following;
  },

  async unfollow(celebrityId: string): Promise<string[]> {
    const r = await request<{ following: string[] }>(`/users/me/following/${celebrityId}`, { method: 'DELETE', auth: true });
    return r.data!.following;
  },

  async getSavedEvents(): Promise<Event[]> {
    const r = await request<{ events: Event[] }>('/users/me/saved-events', { auth: true });
    return r.data!.events;
  },

  async saveEvent(eventId: string): Promise<string[]> {
    const r = await request<{ savedEvents: string[] }>(`/users/me/saved-events/${eventId}`, { method: 'POST', auth: true });
    return r.data!.savedEvents;
  },

  async unsaveEvent(eventId: string): Promise<string[]> {
    const r = await request<{ savedEvents: string[] }>(`/users/me/saved-events/${eventId}`, { method: 'DELETE', auth: true });
    return r.data!.savedEvents;
  },
};

/* ───────────────── Celebrities — /api/celebrities ───────────────── */

const celebrities = {
  async list(params: { category?: CelebrityCategory; search?: string; verified?: boolean; page?: number; limit?: number } = {}) {
    const r = await request<{ celebrities: Celebrity[] }>('/celebrities', { query: params });
    return { celebrities: r.data!.celebrities, meta: r.meta };
  },

  async get(id: string): Promise<Celebrity> {
    const r = await request<{ celebrity: Celebrity }>(`/celebrities/${id}`);
    return r.data!.celebrity;
  },

  async events(id: string): Promise<Event[]> {
    const r = await request<{ events: Event[] }>(`/celebrities/${id}/events`);
    return r.data!.events;
  },

  // Admin (admin secret is auto-attached from storage; pass adminSecret to override)
  async create(payload: Partial<Celebrity>, adminSecret?: string): Promise<Celebrity> {
    const r = await request<{ celebrity: Celebrity }>('/celebrities', { method: 'POST', auth: true, admin: true, adminSecret, body: payload });
    return r.data!.celebrity;
  },
  async update(id: string, payload: Partial<Celebrity>, adminSecret?: string): Promise<Celebrity> {
    const r = await request<{ celebrity: Celebrity }>(`/celebrities/${id}`, { method: 'PATCH', auth: true, admin: true, adminSecret, body: payload });
    return r.data!.celebrity;
  },
  async remove(id: string, adminSecret?: string): Promise<void> {
    await request(`/celebrities/${id}`, { method: 'DELETE', auth: true, admin: true, adminSecret });
  },
};

/* ───────────────── Events — /api/events ───────────────── */

const events = {
  async list(params: {
    category?: CelebrityCategory;
    city?: string;
    country?: string;
    status?: string;
    featured?: boolean;
    celebrityId?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const r = await request<{ events: Event[] }>('/events', { query: params });
    return { events: r.data!.events, meta: r.meta };
  },

  async featured(): Promise<Event[]> {
    const r = await request<{ events: Event[] }>('/events/featured');
    return r.data!.events;
  },

  async get(id: string): Promise<Event> {
    const r = await request<{ event: Event }>(`/events/${id}`);
    return r.data!.event;
  },

  // Admin (admin secret is auto-attached from storage; pass adminSecret to override)
  async create(payload: EventInput, adminSecret?: string): Promise<Event> {
    const r = await request<{ event: Event }>('/events', { method: 'POST', auth: true, admin: true, adminSecret, body: payload });
    return r.data!.event;
  },
  async update(id: string, payload: EventInput, adminSecret?: string): Promise<Event> {
    const r = await request<{ event: Event }>(`/events/${id}`, { method: 'PATCH', auth: true, admin: true, adminSecret, body: payload });
    return r.data!.event;
  },
  async remove(id: string, adminSecret?: string): Promise<void> {
    await request(`/events/${id}`, { method: 'DELETE', auth: true, admin: true, adminSecret });
  },
};

/* ───────────────── Payments — /api/payments ───────────────── */

const payments = {
  async coins(): Promise<Coin[]> {
    const r = await request<{ coins: Coin[] }>('/payments/coins');
    return r.data!.coins;
  },
};

/* ───────────────── Orders — /api/orders ───────────────── */

const orders = {
  async create(payload: {
    items: { eventId: string; tierId: string; quantity: number }[];
    attendeeName: string;
    attendeeEmail: string;
    coin: string;
  }): Promise<{ order: Order; payment: PaymentInstructions }> {
    const r = await request<{ order: Order; payment: PaymentInstructions }>('/orders', {
      method: 'POST',
      auth: true,
      body: payload,
    });
    return r.data!;
  },

  async confirm(orderId: string, txHash?: string): Promise<{ order: Order; tickets: Ticket[] }> {
    const r = await request<{ order: Order; tickets: Ticket[] }>(`/orders/${orderId}/confirm`, {
      method: 'POST',
      auth: true,
      body: { txHash },
    });
    return r.data!;
  },

  async list(): Promise<Order[]> {
    const r = await request<{ orders: Order[] }>('/orders', { auth: true });
    return r.data!.orders;
  },

  async get(orderId: string): Promise<Order> {
    const r = await request<{ order: Order }>(`/orders/${orderId}`, { auth: true });
    return r.data!.order;
  },
};

/* ───────────────── Tickets — /api/tickets ───────────────── */

const tickets = {
  async list(status?: 'active' | 'used' | 'refunded'): Promise<Ticket[]> {
    const r = await request<{ tickets: Ticket[] }>('/tickets', { auth: true, query: { status } });
    return r.data!.tickets;
  },

  async get(ticketId: string): Promise<Ticket> {
    const r = await request<{ ticket: Ticket }>(`/tickets/${ticketId}`, { auth: true });
    return r.data!.ticket;
  },
};

/* ───────────────── Sponsorship — /api/sponsorship ───────────────── */

const sponsorship = {
  async packages(): Promise<SponsorshipPackage[]> {
    const r = await request<{ packages: SponsorshipPackage[] }>('/sponsorship/packages');
    return r.data!.packages;
  },

  async package(id: string): Promise<SponsorshipPackage> {
    const r = await request<{ package: SponsorshipPackage }>(`/sponsorship/packages/${id}`);
    return r.data!.package;
  },

  async sponsors(params: { eventId?: string; platform?: boolean } = {}): Promise<Sponsor[]> {
    const r = await request<{ sponsors: Sponsor[] }>('/sponsorship/sponsors', { query: params });
    return r.data!.sponsors;
  },

  async pending(eventId: string): Promise<PendingSponsor[]> {
    const r = await request<{ pending: PendingSponsor[] }>('/sponsorship/pending', { query: { eventId } });
    return r.data!.pending;
  },

  async apply(payload: {
    companyName: string;
    contactName: string;
    email: string;
    phone?: string;
    packageId: string;
    eventId?: string;
    budget?: string;
    message?: string;
  }): Promise<SponsorshipApplication> {
    const r = await request<{ application: SponsorshipApplication }>('/sponsorship/applications', {
      method: 'POST',
      body: payload,
    });
    return r.data!.application;
  },

  /** Applications submitted by the signed-in user (matched by email). */
  async myApplications(): Promise<SponsorshipApplication[]> {
    const r = await request<{ applications: SponsorshipApplication[] }>('/sponsorship/applications/mine', { auth: true });
    return r.data!.applications;
  },

  // Admin (admin secret is auto-attached from storage; pass adminSecret to override)
  async listApplications(status?: string, adminSecret?: string): Promise<SponsorshipApplication[]> {
    const r = await request<{ applications: SponsorshipApplication[] }>('/sponsorship/applications', {
      auth: true,
      admin: true,
      adminSecret,
      query: { status },
    });
    return r.data!.applications;
  },
  async updateApplication(id: string, status: string, adminSecret?: string): Promise<SponsorshipApplication> {
    const r = await request<{ application: SponsorshipApplication }>(`/sponsorship/applications/${id}`, {
      method: 'PATCH',
      auth: true,
      admin: true,
      adminSecret,
      body: { status },
    });
    return r.data!.application;
  },
};

/* ───────────────── Uploads — /api/uploads ───────────────── */

export interface UploadedImage {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

const uploads = {
  /**
   * Upload a single image file. Multipart/form-data (`file` field) is built
   * here — do NOT route through `request()`, which assumes JSON.
   * `folder` is forwarded to Cloudinary (e.g. "events", "celebrities", "avatars").
   */
  async image(file: File, folder?: string): Promise<UploadedImage> {
    const token = getToken();
    if (!token) throw new ApiError('Sign in required to upload images', 401);

    const fd = new FormData();
    fd.append('file', file);
    if (folder) fd.append('folder', folder);

    let res: Response;
    try {
      res = await fetch(`${BASE_URL}/uploads/image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
    } catch {
      throw new ApiError('Network error — is the backend running?', 0);
    }

    const text = await res.text();
    let body: { status?: string; data?: UploadedImage; message?: string } = {};
    if (text) { try { body = JSON.parse(text); } catch { /* ignore */ } }

    if (!res.ok) {
      if (res.status === 401) clearToken();
      throw new ApiError(body.message || `Upload failed (${res.status})`, res.status, body);
    }
    return body.data!;
  },
};

/* ───────────────── Health ───────────────── */

async function health(): Promise<{ status: string; service: string; timestamp: string }> {
  const res = await fetch(`${API_ORIGIN}/health`);
  return res.json();
}

/* ───────────────── Public API ───────────────── */

export const api = {
  auth,
  users,
  celebrities,
  events,
  payments,
  orders,
  tickets,
  sponsorship,
  uploads,
  health,
  isAuthenticated: () => !!getToken(),
};

export default api;
