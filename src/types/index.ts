export type CelebrityCategory =
  | 'musician' | 'dj' | 'comedian' | 'actor'
  | 'athlete' | 'influencer' | 'pastor' | 'politician';

export const CATEGORY_LABELS: Record<CelebrityCategory, string> = {
  musician: 'Musician', dj: 'DJ', comedian: 'Comedian', actor: 'Actor',
  athlete: 'Athlete', influencer: 'Influencer', pastor: 'Pastor', politician: 'Politician',
};

export const CATEGORY_COLORS: Record<CelebrityCategory, string> = {
  musician: 'bg-purple-600/20 text-purple-300 border-purple-500/30',
  dj: 'bg-blue-600/20 text-blue-300 border-blue-500/30',
  comedian: 'bg-yellow-600/20 text-yellow-300 border-yellow-500/30',
  actor: 'bg-pink-600/20 text-pink-300 border-pink-500/30',
  athlete: 'bg-green-600/20 text-green-300 border-green-500/30',
  influencer: 'bg-red-600/20 text-red-300 border-red-500/30',
  pastor: 'bg-indigo-600/20 text-indigo-300 border-indigo-500/30',
  politician: 'bg-orange-600/20 text-orange-300 border-orange-500/30',
};

export interface Celebrity {
  id: string;
  name: string;
  category: CelebrityCategory;
  image: string;
  coverImage: string;
  verified: boolean;
  followers: number;
  bio: string;
  nationality: string;
  genre?: string;
  /** On-brand SVG fallback used if the primary image URL fails */
  _imageFallback?: string;
  /** On-brand SVG fallback for the cover banner */
  _coverFallback?: string;
}

export type TierLevel = 'general' | 'vip' | 'vvip' | 'meetgreet';

export const TIER_COLORS: Record<TierLevel, string> = {
  general: 'border-[rgba(124,58,237,0.3)]',
  vip: 'border-[#F59E0B]/40',
  vvip: 'border-[#F59E0B]/70',
  meetgreet: 'border-pink-500/60',
};

export interface TicketTier {
  id: string;
  name: string;
  price: number;
  currency: string;
  available: number;
  total: number;
  perks: string[];
  tier: TierLevel;
}

export interface Event {
  id: string;
  title: string;
  subtitle?: string;
  celebrityId: string;
  date: string;
  doorsOpen?: string;
  venue: string;
  city: string;
  country: string;
  image: string;
  description: string;
  category: CelebrityCategory;
  ticketTiers: TicketTier[];
  isFeatured: boolean;
  isOnline: boolean;
  tags: string[];
  status: 'upcoming' | 'live' | 'past' | 'sold_out';
  ageRestriction?: string;
  dresscode?: string;
  /** On-brand SVG fallback used if the primary image URL fails */
  _imageFallback?: string;
}

export interface CartItem {
  eventId: string;
  tierId: string;
  tierName: string;
  quantity: number;
  price: number;
  currency: string;
  eventTitle: string;
  eventDate: string;
  eventVenue: string;
  eventCity: string;
  eventImage: string;
}

export interface Ticket {
  id: string;
  eventId: string;
  tierId: string;
  tierName: string;
  eventTitle: string;
  eventDate: string;
  eventVenue: string;
  eventCity: string;
  purchasedAt: string;
  qrCode: string;
  price: number;
  currency: string;
  status: 'active' | 'used' | 'refunded';
  attendeeName: string;
  attendeeEmail: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: 'user' | 'admin';
  following: string[];
  savedEvents: string[];
  tickets: Ticket[];
}

/* ───────────────── Sponsorship ───────────────── */

export type SponsorTier = 'title' | 'platinum' | 'gold' | 'silver' | 'community';

export const SPONSOR_TIER_LABELS: Record<SponsorTier, string> = {
  title: 'Title Sponsor',
  platinum: 'Platinum',
  gold: 'Gold',
  silver: 'Silver',
  community: 'Community',
};

export interface SponsorshipPackage {
  id: string;
  tier: SponsorTier;
  name: string;
  tagline: string;
  price: number;
  currency: string;
  slotsTotal: number;
  slotsAvailable: number;
  benefits: string[];
  popular?: boolean;
}

export interface Sponsor {
  id: string;
  name: string;
  industry: string;
  tier: SponsorTier;
  color: string;
  logo: string;
  /** Event sponsored, or undefined for platform-wide partners */
  eventId?: string;
}

export interface SponsorshipApplication {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  packageId: string;
  packageName: string;
  /** '' = platform-wide */
  eventId: string;
  budget: string;
  message: string;
  submittedAt: string;
  status: 'pending' | 'reviewing' | 'approved';
}
