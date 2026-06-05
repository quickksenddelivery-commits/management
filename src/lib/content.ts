/**
 * Catalog data layer — backend-only. Every loader calls the API; on failure
 * it returns an empty / undefined value so the caller's loading/empty states
 * can render rather than silently substituting mock data.
 *
 * Sponsors come back from the backend without a `logo` field, so we generate
 * the branded SVG wordmark client-side from their name + color.
 */
import { api } from './api';
import { sponsorLogo } from './images';
import type { Event, Celebrity, Sponsor, SponsorshipPackage } from '../types';
import type { PendingSponsor } from './api';

/** Backend sponsors aren't seeded with a logo — generate the branded one client-side. */
const withLogos = (list: Sponsor[]): Sponsor[] =>
  list.map((s) => ({ ...s, logo: s.logo || sponsorLogo(s.name, s.color || '#A78BFA') }));

export async function loadEvents(): Promise<Event[]> {
  const { events } = await api.events.list({ limit: 100 });
  return events;
}

export async function loadCelebrities(): Promise<Celebrity[]> {
  const { celebrities } = await api.celebrities.list({ limit: 100 });
  return celebrities;
}

export async function loadEvent(id: string): Promise<Event | undefined> {
  return api.events.get(id);
}

export async function loadCelebrity(id: string): Promise<Celebrity | undefined> {
  return api.celebrities.get(id);
}

export async function loadCelebrityEvents(id: string): Promise<Event[]> {
  return api.celebrities.events(id);
}

export async function loadSponsors(
  params: { eventId?: string; platform?: boolean } = {}
): Promise<Sponsor[]> {
  return withLogos(await api.sponsorship.sponsors(params));
}

export async function loadPackages(): Promise<SponsorshipPackage[]> {
  return api.sponsorship.packages();
}

/** Saved events for the signed-in user (server is the source of truth). */
export async function loadSavedEvents(): Promise<Event[]> {
  return api.users.getSavedEvents();
}

/** Followed celebrities for the signed-in user (server is the source of truth). */
export async function loadFollowing(): Promise<Celebrity[]> {
  return api.users.getFollowing();
}

export async function loadPendingSponsors(eventId: string): Promise<PendingSponsor[]> {
  return api.sponsorship.pending(eventId);
}
