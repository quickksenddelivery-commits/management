import type { SponsorshipPackage, Sponsor } from '../types';
import { sponsorLogo } from '../lib/images';

/* ── Sponsorship packages (platform-wide pricing, USD) ── */
export const sponsorshipPackages: SponsorshipPackage[] = [
  {
    id: 'pkg-title',
    tier: 'title',
    name: 'Title Sponsor',
    tagline: 'Own the event. Your name in lights.',
    price: 50000,
    currency: 'USD',
    slotsTotal: 1,
    slotsAvailable: 1,
    benefits: [
      'Naming rights — "Event presented by [Your Brand]"',
      'Top-billing logo on all stages, screens & LED walls',
      '20 VVIP passes + private hospitality suite',
      'Full backstage & meet-and-greet access',
      'Dedicated social media campaign (5M+ reach)',
      'Press release & media mentions',
      'Category exclusivity (no competing brands)',
      'On-stage brand moment / shout-out',
    ],
  },
  {
    id: 'pkg-platinum',
    tier: 'platinum',
    name: 'Platinum',
    tagline: 'Premium visibility across the experience.',
    price: 25000,
    currency: 'USD',
    slotsTotal: 4,
    slotsAvailable: 3,
    benefits: [
      'Main-stage branding & screen placement',
      '10 VIP passes',
      'Branded activation booth (prime location)',
      'Logo on event page, tickets & emails',
      'Social media features (3 posts)',
      'Inclusion in event press kit',
    ],
    popular: true,
  },
  {
    id: 'pkg-gold',
    tier: 'gold',
    name: 'Gold',
    tagline: 'Strong presence, great value.',
    price: 10000,
    currency: 'USD',
    slotsTotal: 8,
    slotsAvailable: 6,
    benefits: [
      'Logo on event page & on-site materials',
      '4 VIP passes',
      'Activation booth space',
      'One social media mention',
    ],
  },
  {
    id: 'pkg-silver',
    tier: 'silver',
    name: 'Silver',
    tagline: 'Get your brand in front of the crowd.',
    price: 5000,
    currency: 'USD',
    slotsTotal: 15,
    slotsAvailable: 11,
    benefits: [
      'Logo on event website',
      '2 VIP passes',
      'Newsletter mention',
    ],
  },
  {
    id: 'pkg-community',
    tier: 'community',
    name: 'Community Partner',
    tagline: 'Support the movement.',
    price: 1500,
    currency: 'USD',
    slotsTotal: 30,
    slotsAvailable: 22,
    benefits: [
      'Logo on event website',
      'Listed as an official supporter',
      'Social media thank-you',
    ],
  },
];

/* ── Existing sponsors / partners ── */
type SponsorSeed = Omit<Sponsor, 'logo'>;

const SPONSOR_SEEDS: SponsorSeed[] = [
  { id: 'spo-1', name: 'Pulse Telecom',  industry: 'Telecommunications', tier: 'title',     color: '#A78BFA', eventId: 'event-1' },
  { id: 'spo-2', name: 'Zenith Capital', industry: 'Banking & Finance',  tier: 'platinum',  color: '#F59E0B', eventId: 'event-1' },
  { id: 'spo-3', name: 'Savanna',        industry: 'Beverages',          tier: 'gold',      color: '#34D399', eventId: 'event-2' },
  { id: 'spo-4', name: 'NovaTel',        industry: 'Telecommunications', tier: 'platinum',  color: '#60A5FA' },
  { id: 'spo-5', name: 'AeroLux',        industry: 'Aviation',           tier: 'gold',      color: '#22D3EE' },
  { id: 'spo-6', name: 'Vibe',           industry: 'Streaming & Media',  tier: 'platinum',  color: '#FB7185' },
  { id: 'spo-7', name: 'Lumina',         industry: 'Technology',         tier: 'silver',    color: '#FBBF24' },
  { id: 'spo-8', name: 'GoldCrest',      industry: 'Luxury Goods',       tier: 'community', color: '#F472B6' },
];

export const sponsors: Sponsor[] = SPONSOR_SEEDS.map(s => ({
  ...s,
  logo: sponsorLogo(s.name, s.color),
}));

export const getEventSponsors    = (eventId: string) => sponsors.filter(s => s.eventId === eventId);
export const getPlatformSponsors = () => sponsors.filter(s => !s.eventId);
export const getPackage          = (id: string) => sponsorshipPackages.find(p => p.id === id);
