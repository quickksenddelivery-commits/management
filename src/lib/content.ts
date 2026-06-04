/**
 * Catalog data layer. Each loader prefers the live API and falls back to the
 * bundled mock data when the backend is unreachable or returns nothing — so the
 * app works fully online (live) and offline (demo).
 */
import { api, getToken } from './api';
import { sponsorLogo } from './images';
import {
  events as mockEvents,
  celebrities as mockCelebrities,
  getEvent as mockGetEvent,
  getCelebrity as mockGetCelebrity,
  getEventsByCelebrity as mockCelebEvents,
} from '../data/mock';
import {
  sponsorshipPackages as mockPackages,
  sponsors as mockSponsors,
  getEventSponsors as mockEventSponsors,
} from '../data/sponsors';
import type { Event, Celebrity, Sponsor, SponsorshipPackage } from '../types';
import type { PendingSponsor } from './api';

/** Backend sponsors aren't seeded with a logo — generate the branded one client-side. */
const withLogos = (list: Sponsor[]): Sponsor[] =>
  list.map((s) => ({ ...s, logo: s.logo || sponsorLogo(s.name, s.color || '#A78BFA') }));

export async function loadEvents(): Promise<Event[]> {
  try {
    const { events } = await api.events.list({ limit: 100 });
    return events.length ? events : mockEvents;
  } catch {
    return mockEvents;
  }
}

export async function loadCelebrities(): Promise<Celebrity[]> {
  try {
    const { celebrities } = await api.celebrities.list({ limit: 100 });
    return celebrities.length ? celebrities : mockCelebrities;
  } catch {
    return mockCelebrities;
  }
}

export async function loadEvent(id: string): Promise<Event | undefined> {
  try {
    return await api.events.get(id);
  } catch {
    return mockGetEvent(id);
  }
}

export async function loadCelebrity(id: string): Promise<Celebrity | undefined> {
  try {
    return await api.celebrities.get(id);
  } catch {
    return mockGetCelebrity(id);
  }
}

export async function loadCelebrityEvents(id: string): Promise<Event[]> {
  try {
    return await api.celebrities.events(id);
  } catch {
    return mockCelebEvents(id);
  }
}

export async function loadSponsors(params: { eventId?: string; platform?: boolean } = {}): Promise<Sponsor[]> {
  try {
    return withLogos(await api.sponsorship.sponsors(params));
  } catch {
    return params.eventId ? mockEventSponsors(params.eventId) : mockSponsors;
  }
}

export async function loadPackages(): Promise<SponsorshipPackage[]> {
  try {
    const packages = await api.sponsorship.packages();
    return packages.length ? packages : mockPackages;
  } catch {
    return mockPackages;
  }
}

/**
 * Saved events for the signed-in user. Prefers the authoritative API list; falls
 * back to resolving the user's saved ids against the catalog (mock) when offline
 * or in a local demo session (no token).
 */
export async function loadSavedEvents(savedIds: string[]): Promise<Event[]> {
  if (getToken()) {
    try {
      return await api.users.getSavedEvents();
    } catch { /* fall through to local resolution */ }
  }
  return mockEvents.filter((e) => savedIds.includes(e.id));
}

/** Followed celebrities for the signed-in user (same strategy as loadSavedEvents). */
export async function loadFollowing(followingIds: string[]): Promise<Celebrity[]> {
  if (getToken()) {
    try {
      return await api.users.getFollowing();
    } catch { /* fall through to local resolution */ }
  }
  return mockCelebrities.filter((c) => followingIds.includes(c.id));
}

export async function loadPendingSponsors(eventId: string): Promise<PendingSponsor[]> {
  try {
    return await api.sponsorship.pending(eventId);
  } catch {
    return [];
  }
}
