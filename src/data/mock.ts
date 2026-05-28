import type { Celebrity, Event } from '../types';
import { celebrityPortrait, celebrityCover, eventPoster } from '../lib/images';

/* ── Unsplash base helper ── */
const U = (id: string, w: number, h: number, crop = 'center') =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&q=85&auto=format&fit=crop&crop=${crop}`;

/* ── Celebrity portrait URLs (3:4) ── */
const P = (id: string) => U(id, 600, 800, 'faces,center');

/* ── Celebrity cover banner URLs (3:1) ── */
const C = (id: string) => U(id, 1200, 420, 'top');

/* ── Event poster URLs (16:9) ── */
const E = (id: string) => U(id, 800, 450, 'center');

export const celebrities: Celebrity[] = [
  {
    id: 'celeb-1',
    name: 'Zara Musa',
    category: 'musician',
    image:      P('1531746020798-e6953c6e8e04'),   // elegant woman portrait
    coverImage: C('1540747913346-19e32dc3e97e'),   // performer on stage
    _imageFallback: celebrityPortrait('Zara Musa', 'musician'),
    _coverFallback: celebrityCover('Zara Musa', 'musician'),
    verified: true,
    followers: 4200000,
    bio: 'Afrobeats powerhouse from Lagos, Nigeria. Known for chart-topping hits and electric live performances that blend traditional African rhythms with contemporary beats. Three-time winner of the African Music Awards.',
    nationality: 'Nigerian',
    genre: 'Afrobeats / R&B',
  },
  {
    id: 'celeb-2',
    name: 'King Dami',
    category: 'dj',
    image:      P('1507003211169-0a1dd7228f2d'),   // confident man portrait
    coverImage: C('1571330735066-03aaa9429d89'),   // DJ at decks
    _imageFallback: celebrityPortrait('King Dami', 'dj'),
    _coverFallback: celebrityCover('King Dami', 'dj'),
    verified: true,
    followers: 1800000,
    bio: "South Africa's premier DJ and music producer. Known for selling out major festivals across Africa and Europe with his signature Amapiano fusion sound. Residencies in Johannesburg, Dubai, and Amsterdam.",
    nationality: 'South African',
    genre: 'Amapiano / House',
  },
  {
    id: 'celeb-3',
    name: 'Tolu B',
    category: 'comedian',
    image:      P('1539571696357-5a69c17a67c6'),   // man portrait with character
    coverImage: C('1585699324551-f6c309eedeca'),   // stage with spotlights
    _imageFallback: celebrityPortrait('Tolu B', 'comedian'),
    _coverFallback: celebrityCover('Tolu B', 'comedian'),
    verified: true,
    followers: 950000,
    bio: "Award-winning Nigerian stand-up comedian and content creator. His relatable humor about everyday African life has earned him a massive fanbase. Best Comedy Act winner at the Nigerian Entertainment Awards 2025.",
    nationality: 'Nigerian',
  },
  {
    id: 'celeb-4',
    name: 'Amara Diallo',
    category: 'actor',
    image:      P('1506794778202-cad84cf45f1d'),   // stylish man portrait
    coverImage: C('1478760329108-5c3ed9d495a0'),   // cinematic/film atmosphere
    _imageFallback: celebrityPortrait('Amara Diallo', 'actor'),
    _coverFallback: celebrityCover('Amara Diallo', 'actor'),
    verified: true,
    followers: 2300000,
    bio: 'Senegalese-born international film star. Having appeared in major Hollywood and Nollywood productions, Amara brings world-class talent to every red carpet appearance and live fan experience.',
    nationality: 'Senegalese',
  },
  {
    id: 'celeb-5',
    name: 'Chike Eze',
    category: 'musician',
    image:      P('1500648767791-00dcc994a43e'),   // charismatic young man
    coverImage: C('1501386761578-eac5c94b800a'),   // concert stage performance
    _imageFallback: celebrityPortrait('Chike Eze', 'musician'),
    _coverFallback: celebrityCover('Chike Eze', 'musician'),
    verified: true,
    followers: 3100000,
    bio: "Afrobeats sensation taking the world by storm. Chike's smooth vocals and high-energy performances have earned him fans from Lagos to London. His debut album went platinum in 6 countries.",
    nationality: 'Nigerian',
    genre: 'Afrobeats / Soul',
  },
  {
    id: 'celeb-6',
    name: 'DJ Spice',
    category: 'dj',
    image:      P('1542178243-bc20204b769f'),      // confident man portrait
    coverImage: C('1429962714451-bb934ecdc4ec'),   // vibrant club/DJ lights
    _imageFallback: celebrityPortrait('DJ Spice', 'dj'),
    _coverFallback: celebrityCover('DJ Spice', 'dj'),
    verified: true,
    followers: 2750000,
    bio: "International DJ with residencies in Ibiza, Dubai and Nairobi. DJ Spice's sets blend Afrohouse, Amapiano and global club music into an unforgettable experience. Ranked #8 in DJ Mag's Top 100.",
    nationality: 'Kenyan',
    genre: 'Afrohouse / Global Club',
  },
];

export const events: Event[] = [
  {
    id: 'event-1',
    title: 'The Crown Experience',
    subtitle: 'Live in Lagos',
    celebrityId: 'celeb-1',
    date: '2026-08-15T20:00:00',
    doorsOpen: '2026-08-15T18:00:00',
    venue: 'Eko Atlantic Arena',
    city: 'Lagos',
    country: 'Nigeria',
    image: E('1540575467063-178a50c2df87'),         // packed arena concert
    _imageFallback: eventPoster('The Crown Experience', 'musician'),
    description: "Zara Musa returns to Lagos for the most anticipated concert of the year. The Crown Experience is a full theatrical production featuring her entire catalog, special guests, and a visual spectacle you won't forget. With a 360-degree stage setup and a $2M LED production, this will redefine what a Nigerian concert can be.",
    category: 'musician',
    isFeatured: true,
    isOnline: false,
    tags: ['Afrobeats', 'Lagos', 'Live Concert', 'Premium'],
    status: 'upcoming',
    ageRestriction: '18+',
    dresscode: 'Smart Casual',
    ticketTiers: [
      { id: 'tier-1-1', name: 'General',      price: 15000,  currency: 'NGN', available: 3200, total: 5000, tier: 'general',   perks: ['Standard admission', 'Access to general area'] },
      { id: 'tier-1-2', name: 'VIP',          price: 45000,  currency: 'NGN', available: 480,  total: 800,  tier: 'vip',       perks: ['VIP section', 'Complimentary drinks ×2', 'Dedicated VIP entrance', 'VIP lounge'] },
      { id: 'tier-1-3', name: 'VVIP Table',   price: 120000, currency: 'NGN', available: 45,   total: 100,  tier: 'vvip',      perks: ['Private table (4 seats)', 'Bottle service', 'Premium view', 'Backstage tour', 'Exclusive merch pack'] },
      { id: 'tier-1-4', name: 'Meet & Greet', price: 250000, currency: 'NGN', available: 8,    total: 20,   tier: 'meetgreet', perks: ['Personal meet with Zara', 'Signed merch bundle', 'Photo session', 'VVIP table included', 'Soundcheck access'] },
    ],
  },
  {
    id: 'event-2',
    title: 'Electric Nights Vol. 3',
    subtitle: 'King Dami × Johannesburg',
    celebrityId: 'celeb-2',
    date: '2026-09-06T22:00:00',
    doorsOpen: '2026-09-06T20:00:00',
    venue: 'Time Square Dome',
    city: 'Johannesburg',
    country: 'South Africa',
    image: E('1516450360452-9312f5e86fc7'),         // neon DJ club night
    _imageFallback: eventPoster('Electric Nights Vol. 3', 'dj'),
    description: "King Dami's legendary Electric Nights series returns for volume 3. Two floors, 10 hours, the best in Amapiano, Afrohouse and global beats. South Africa's unmissable event of the year.",
    category: 'dj',
    isFeatured: true,
    isOnline: false,
    tags: ['Amapiano', 'House', 'Johannesburg', 'Club Night'],
    status: 'upcoming',
    ageRestriction: '21+',
    dresscode: 'Upscale',
    ticketTiers: [
      { id: 'tier-2-1', name: 'Early Bird', price: 350,  currency: 'ZAR', available: 200, total: 500,  tier: 'general', perks: ['Standard admission', 'Early bird price'] },
      { id: 'tier-2-2', name: 'General',    price: 550,  currency: 'ZAR', available: 1800,total: 2000, tier: 'general', perks: ['Standard admission', 'Full night access'] },
      { id: 'tier-2-3', name: 'VIP Table',  price: 3500, currency: 'ZAR', available: 30,  total: 60,   tier: 'vip',     perks: ['Private table (6 seats)', 'Bottle service', 'Dedicated host', 'Best view'] },
    ],
  },
  {
    id: 'event-3',
    title: 'Laugh All Night',
    subtitle: 'Tolu B Comedy Special',
    celebrityId: 'celeb-3',
    date: '2026-07-25T19:00:00',
    doorsOpen: '2026-07-25T17:30:00',
    venue: 'Transcorp Hilton',
    city: 'Abuja',
    country: 'Nigeria',
    image: E('1585699324551-f6c309eedeca'),         // comedian with mic on stage
    _imageFallback: eventPoster('Laugh All Night', 'comedian'),
    description: "Two hours of non-stop laughter with Nigeria's funniest man. Tolu B's brand-new material promises fresh jokes, celebrity roasts, and surprise guest comedians.",
    category: 'comedian',
    isFeatured: false,
    isOnline: false,
    tags: ['Comedy', 'Stand-up', 'Abuja'],
    status: 'upcoming',
    ticketTiers: [
      { id: 'tier-3-1', name: 'Standard', price: 10000, currency: 'NGN', available: 600, total: 800, tier: 'general', perks: ['Standard seating', 'Show admission'] },
      { id: 'tier-3-2', name: 'Premium',  price: 25000, currency: 'NGN', available: 150, total: 200, tier: 'vip',     perks: ['Front row seating', 'Pre-show cocktails', 'Photo opportunity'] },
    ],
  },
  {
    id: 'event-4',
    title: 'Afrobeats London',
    subtitle: 'Chike Eze Live at the O2',
    celebrityId: 'celeb-5',
    date: '2026-10-11T19:30:00',
    doorsOpen: '2026-10-11T18:00:00',
    venue: 'The O2 Arena',
    city: 'London',
    country: 'United Kingdom',
    image: E('1468359601543-843bfaef291a'),         // huge arena concert crowd
    _imageFallback: eventPoster('Afrobeats London', 'musician'),
    description: "Chike Eze makes his UK arena debut at the iconic O2. Joining him will be special guests from across Africa for a once-in-a-lifetime showcase of African music on the world stage.",
    category: 'musician',
    isFeatured: true,
    isOnline: false,
    tags: ['Afrobeats', 'London', 'Arena', 'UK Tour'],
    status: 'upcoming',
    ageRestriction: '16+',
    ticketTiers: [
      { id: 'tier-4-1', name: 'Floor',       price: 75,  currency: 'GBP', available: 3000, total: 5000, tier: 'general',   perks: ['Floor standing'] },
      { id: 'tier-4-2', name: 'Seated',      price: 65,  currency: 'GBP', available: 4200, total: 6000, tier: 'general',   perks: ['Reserved seat'] },
      { id: 'tier-4-3', name: 'VIP Box',     price: 280, currency: 'GBP', available: 45,   total: 80,   tier: 'vip',       perks: ['Private box (8 people)', 'Dedicated server', 'Premium bar'] },
      { id: 'tier-4-4', name: 'Meet & Greet',price: 450, currency: 'GBP', available: 15,   total: 30,   tier: 'meetgreet', perks: ['Personal meet with Chike', 'Signed vinyl', 'Backstage access', 'Floor ticket'] },
    ],
  },
  {
    id: 'event-5',
    title: 'Nairobi Soundwave',
    subtitle: 'DJ Spice Kenya Homecoming',
    celebrityId: 'celeb-6',
    date: '2026-08-30T21:00:00',
    doorsOpen: '2026-08-30T19:00:00',
    venue: 'Uhuru Gardens Grounds',
    city: 'Nairobi',
    country: 'Kenya',
    image: E('1470225620780-dba8ba36b745'),         // outdoor festival night
    _imageFallback: eventPoster('Nairobi Soundwave', 'dj'),
    description: "DJ Spice returns home to Nairobi for a massive open-air festival. Kenya's biggest outdoor music event featuring world-class production and 8+ hours of music.",
    category: 'dj',
    isFeatured: false,
    isOnline: false,
    tags: ['Afrohouse', 'Nairobi', 'Festival', 'Outdoor'],
    status: 'upcoming',
    ticketTiers: [
      { id: 'tier-5-1', name: 'General', price: 3500,  currency: 'KES', available: 5000, total: 8000, tier: 'general', perks: ['Grounds admission', 'All stages'] },
      { id: 'tier-5-2', name: 'VIP',     price: 12000, currency: 'KES', available: 400,  total: 600,  tier: 'vip',     perks: ['VIP zone', 'Exclusive bar', 'VIP entrance'] },
    ],
  },
  {
    id: 'event-6',
    title: 'Zara Musa Live in Accra',
    subtitle: 'African Tour 2026',
    celebrityId: 'celeb-1',
    date: '2026-08-22T20:00:00',
    doorsOpen: '2026-08-22T18:30:00',
    venue: 'Accra Sports Stadium',
    city: 'Accra',
    country: 'Ghana',
    image: E('1493225457124-a3eb161ffa5f'),         // performer in spotlight
    _imageFallback: eventPoster('Zara Musa Live in Accra', 'musician'),
    description: "Zara Musa brings her African Tour to Accra after selling out Lagos. A bigger, more spectacular show with new production elements.",
    category: 'musician',
    isFeatured: false,
    isOnline: false,
    tags: ['Afrobeats', 'Accra', 'African Tour'],
    status: 'upcoming',
    ticketTiers: [
      { id: 'tier-6-1', name: 'General', price: 200, currency: 'GHS', available: 8000, total: 12000, tier: 'general', perks: ['General admission'] },
      { id: 'tier-6-2', name: 'VIP',     price: 800, currency: 'GHS', available: 500,  total: 800,   tier: 'vip',     perks: ['VIP section', 'Welcome drink', 'VIP entrance'] },
    ],
  },
  {
    id: 'event-7',
    title: 'Full Moon Festival',
    subtitle: 'DJ Spice × Cape Town',
    celebrityId: 'celeb-6',
    date: '2026-09-20T20:00:00',
    doorsOpen: '2026-09-20T18:00:00',
    venue: 'Cape Town Stadium',
    city: 'Cape Town',
    country: 'South Africa',
    image: E('1429962714451-bb934ecdc4ec'),         // DJ purple/pink club lights
    _imageFallback: eventPoster('Full Moon Festival', 'dj'),
    description: "An unforgettable night under the full moon at Cape Town Stadium. DJ Spice headline set with incredible support acts and world-class production.",
    category: 'dj',
    isFeatured: false,
    isOnline: false,
    tags: ['Afrohouse', 'Cape Town', 'Stadium'],
    status: 'sold_out',
    ticketTiers: [
      { id: 'tier-7-1', name: 'General', price: 450,  currency: 'ZAR', available: 0, total: 3000, tier: 'general', perks: ['General admission'] },
      { id: 'tier-7-2', name: 'VIP',     price: 1800, currency: 'ZAR', available: 0, total: 400,  tier: 'vip',     perks: ['VIP access', 'Bottle service'] },
    ],
  },
  {
    id: 'event-8',
    title: 'Lagos Comedy Festival',
    subtitle: 'Tolu B & Friends',
    celebrityId: 'celeb-3',
    date: '2026-12-28T18:00:00',
    doorsOpen: '2026-12-28T16:30:00',
    venue: 'Landmark Events Centre',
    city: 'Lagos',
    country: 'Nigeria',
    image: E('1517604931442-7e0c8ed2963c'),         // audience at a show
    _imageFallback: eventPoster('Lagos Comedy Festival', 'comedian'),
    description: "The biggest comedy festival in West Africa. Tolu B headlines alongside 8 top African comedians for a 4-hour comedy marathon with a New Year countdown finale.",
    category: 'comedian',
    isFeatured: false,
    isOnline: false,
    tags: ['Comedy', 'Festival', 'Lagos', 'New Year'],
    status: 'upcoming',
    ticketTiers: [
      { id: 'tier-8-1', name: 'Standard', price: 20000, currency: 'NGN', available: 1500, total: 2000, tier: 'general', perks: ['Standard admission', 'Festival wristband'] },
      { id: 'tier-8-2', name: 'VIP',      price: 60000, currency: 'NGN', available: 200,  total: 300,  tier: 'vip',     perks: ['VIP seating', 'Open bar (2hrs)', 'Meet & greet', 'VIP pack'] },
    ],
  },
];

export const getCelebrity = (id: string) => celebrities.find(c => c.id === id);
export const getEvent     = (id: string) => events.find(e => e.id === id);
export const getEventsByCelebrity = (celebId: string) => events.filter(e => e.celebrityId === celebId);
export const getFeaturedEvents   = () => events.filter(e => e.isFeatured);
export const getUpcomingEvents   = () => events.filter(e => e.status === 'upcoming');

export const formatFollowers = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
};

export const formatPrice = (price: number, currency: string) => {
  const syms: Record<string, string> = {
    NGN: '₦', ZAR: 'R', GBP: '£', USD: '$', KES: 'KSh', GHS: 'GH₵',
  };
  return `${syms[currency] ?? currency + ' '}${price.toLocaleString()}`;
};

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

export const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
