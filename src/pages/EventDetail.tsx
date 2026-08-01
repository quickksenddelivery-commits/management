import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Users, Heart, Share2, CheckCircle, ArrowLeft, Minus, Plus, Wallet, Loader } from 'lucide-react';
import { formatDate, formatTime, formatPrice } from '../lib/format';
import { loadEvent, loadCelebrity, loadCelebrityEvents, loadSponsors, loadPendingSponsors } from '../lib/content';
import { useApiData } from '../hooks/useApiData';
import { withFallback, eventPoster, celebrityPortrait } from '../lib/images';
import { useStore } from '../store/useStore';
import type { TicketTier, Event as EventType, Celebrity as CelebrityType, Sponsor } from '../types';
import type { PendingSponsor } from '../lib/api';
import { TIER_COLORS, SPONSOR_TIER_LABELS } from '../types';
import EventCard from '../components/common/EventCard';
import Reveal, { RevealGroup, RevealItem } from '../components/motion/Reveal';
import { useSeo } from '../components/seo/useSeo';

const TIER_LABELS = { general: 'General', vip: '⭐ Top Fan', vvip: '👑 VVIP', meetgreet: '🤝 Meet & Greet' };
const TIER_BG = {
  general: 'bg-[#13132A]',
  vip: 'bg-gradient-to-br from-[#1C1A10] to-[#13132A]',
  vvip: 'bg-gradient-to-br from-[#221500] to-[#13132A]',
  meetgreet: 'bg-gradient-to-br from-[#1C0A18] to-[#13132A]',
};

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, addToCart, toggleSaveEvent, sponsorshipApplications } = useStore();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [added, setAdded] = useState(false);

  const [event, setEvent] = useState<EventType | undefined>(undefined);
  const [eventLoaded, setEventLoaded] = useState(false);

  useEffect(() => {
    if (!id) { setEventLoaded(true); return; }
    let alive = true;
    setEventLoaded(false);
    loadEvent(id)
      .then((e) => { if (alive) { setEvent(e); setEventLoaded(true); } })
      .catch(() => { if (alive) setEventLoaded(true); });
    return () => { alive = false; };
  }, [id]);
  const celebrity = useApiData<CelebrityType | undefined>(
    () => (event ? loadCelebrity(event.celebrityId) : Promise.resolve(undefined)),
    undefined,
    [event?.celebrityId]
  );
  const moreEvents = useApiData<EventType[]>(
    () => (event ? loadCelebrityEvents(event.celebrityId) : Promise.resolve([])),
    [],
    [event?.celebrityId]
  );
  const apiSponsors = useApiData<Sponsor[]>(
    () => (event ? loadSponsors({ eventId: event.id }) : Promise.resolve([])),
    [],
    [event?.id]
  );
  const apiPending = useApiData<PendingSponsor[]>(
    () => (event ? loadPendingSponsors(event.id) : Promise.resolve([])),
    [],
    [event?.id]
  );

  useSeo({
    title: event ? event.title : 'Event',
    description: event
      ? `${event.title} — ${formatDate(event.date)} at ${event.venue}, ${event.city}. ${event.description.slice(0, 120)}`
      : 'Event details on FanConnectPro.',
    path: `/events/${id}`,
  });

  if (!eventLoaded) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 pt-24">
        <Loader size={32} className="text-[#A78BFA] animate-spin mb-4" />
        <p className="text-[#A0A0C0]">Loading event…</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <p className="text-6xl mb-4">🎭</p>
        <h2 className="text-2xl font-bold text-white mb-2">Event not found</h2>
        <Link to="/events" className="text-[#A78BFA] hover:text-white transition-colors">← Back to Events</Link>
      </div>
    );
  }

  const isSaved = user?.savedEvents.includes(event.id) ?? false;
  const moreByCeleb = moreEvents.filter(e => e.id !== event.id).slice(0, 3);
  const eventSponsors = apiSponsors;
  const localPending = sponsorshipApplications.filter(a => a.eventId === event.id);
  const pendingSponsors = [...apiPending, ...localPending];

  const setQty = (tierId: string, delta: number, max: number) => {
    setQuantities(prev => {
      const cur = prev[tierId] ?? 0;
      const next = Math.max(0, Math.min(max, cur + delta));
      return { ...prev, [tierId]: next };
    });
  };

  const totalItems = Object.values(quantities).reduce((s, q) => s + q, 0);
  const totalPrice = event.ticketTiers.reduce((sum, t) => sum + (quantities[t.id] ?? 0) * t.price, 0);
  const mainCurrency = event.ticketTiers[0]?.currency ?? 'USD';

  const handleAddToCart = () => {
    if (!user) { navigate('/login'); return; }
    let added = false;
    event.ticketTiers.forEach(tier => {
      const qty = quantities[tier.id] ?? 0;
      if (qty > 0) {
        addToCart({
          eventId: event.id,
          tierId: tier.id,
          tierName: tier.name,
          quantity: qty,
          price: tier.price,
          currency: tier.currency,
          eventTitle: event.title,
          eventDate: event.date,
          eventVenue: event.venue,
          eventCity: event.city,
          eventImage: event.image,
        });
        added = true;
      }
    });
    if (added) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
      setQuantities({});
    }
  };

  return (
    <div>
      {/* Banner */}
      <div className="relative h-[50vh] overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          {...withFallback(event._imageFallback ?? eventPoster(event.title, event.category))}
          className="w-full h-full object-cover"
        />
        <div className="hero-overlay absolute inset-0" />
        <div className="absolute top-20 left-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/40 backdrop-blur-sm border border-white/10 text-white text-sm hover:bg-black/60 transition-all"
          >
            <ArrowLeft size={15} /> Back
          </button>
        </div>
        <div className="absolute bottom-6 left-0 right-0 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-2 mb-3">
            {event.isFeatured && <span className="px-3 py-1 rounded-lg bg-[#7C3AED] text-white text-xs font-bold">FEATURED</span>}
            {event.ageRestriction && <span className="px-3 py-1 rounded-lg bg-black/40 backdrop-blur-sm border border-white/15 text-white text-xs">{event.ageRestriction}</span>}
            {event.dresscode && <span className="px-3 py-1 rounded-lg bg-black/40 backdrop-blur-sm border border-white/15 text-white text-xs">👔 {event.dresscode}</span>}
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white drop-shadow-xl">{event.title}</h1>
          {event.subtitle && <p className="text-[#A78BFA] text-lg mt-1">{event.subtitle}</p>}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Left: Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Meta info */}
            <RevealGroup className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: Calendar, label: 'Date', value: formatDate(event.date) },
                { icon: Clock, label: 'Time', value: formatTime(event.date) },
                { icon: MapPin, label: 'Venue', value: event.venue },
                { icon: Users, label: 'Doors Open', value: event.doorsOpen ? formatTime(event.doorsOpen) : 'TBC' },
              ].map(({ icon: Icon, label, value }) => (
                <RevealItem key={label} y={16} className="bg-[#13132A] border border-[rgba(124,58,237,0.2)] rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon size={14} className="text-[#7C3AED]" />
                    <span className="text-[#6060A0] text-xs uppercase tracking-wider">{label}</span>
                  </div>
                  <p className="text-white text-sm font-semibold leading-tight">{value}</p>
                </RevealItem>
              ))}
            </RevealGroup>

            {/* Celebrity */}
            {celebrity && (
              <Reveal className="bg-[#13132A] border border-[rgba(124,58,237,0.2)] rounded-2xl p-5 flex items-center gap-4">
                <img
                  src={celebrity.image}
                  alt={celebrity.name}
                  {...withFallback(celebrity._imageFallback ?? celebrityPortrait(celebrity.name, celebrity.category))}
                  className="w-16 h-16 rounded-2xl object-cover object-top border-2 border-[rgba(124,58,237,0.4)]"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-bold">{celebrity.name}</h3>
                    {celebrity.verified && <CheckCircle size={16} className="text-[#7C3AED] fill-[#7C3AED] shrink-0" />}
                  </div>
                  <p className="text-[#A0A0C0] text-sm">{celebrity.genre ?? celebrity.category} · {celebrity.nationality}</p>
                </div>
                <Link to={`/celebrity/${celebrity.id}`} className="shrink-0 px-4 py-2 rounded-xl border border-[rgba(124,58,237,0.3)] text-[#A78BFA] text-sm font-medium hover:bg-[rgba(124,58,237,0.1)] transition-all">
                  Profile
                </Link>
              </Reveal>
            )}

            {/* Description */}
            <Reveal>
              <h3 className="text-white font-bold text-lg mb-3">About This Event</h3>
              <p className="text-[#A0A0C0] leading-relaxed">{event.description}</p>
            </Reveal>

            {/* Tags */}
            {event.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {event.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 rounded-full bg-[rgba(124,58,237,0.1)] border border-[rgba(124,58,237,0.2)] text-[#A78BFA] text-xs">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Sponsors */}
            <Reveal className="bg-[#13132A] border border-[rgba(124,58,237,0.2)] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold text-lg">
                  {eventSponsors.length > 0 || pendingSponsors.length > 0 ? 'Event Sponsors' : 'Sponsorship'}
                </h3>
                <Link to={`/sponsorship?event=${event.id}`} className="text-[#A78BFA] hover:text-white text-xs font-semibold transition-colors">
                  Sponsor this event →
                </Link>
              </div>

              {eventSponsors.length > 0 || pendingSponsors.length > 0 ? (
                <div className="flex flex-wrap items-center gap-3">
                  {eventSponsors.map(s => (
                    <div key={s.id} className="flex items-center gap-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(124,58,237,0.15)] rounded-xl px-4 py-3">
                      <img src={s.logo} alt={s.name} className="h-5 object-contain" />
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-bold border border-[rgba(124,58,237,0.3)] text-[#A78BFA]">
                        {SPONSOR_TIER_LABELS[s.tier]}
                      </span>
                    </div>
                  ))}
                  {pendingSponsors.map(a => (
                    <div key={a.id} className="flex items-center gap-3 bg-[rgba(245,158,11,0.06)] border border-[rgba(245,158,11,0.3)] rounded-xl px-4 py-3">
                      <span className="text-white text-sm font-bold">{a.companyName}</span>
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-bold border border-[rgba(245,158,11,0.4)] text-[#FCD34D]">
                        {a.packageName} · Pending
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[#6060A0] text-sm">
                  Want your brand here? Become a sponsor and reach thousands of fans at this event.
                </p>
              )}

              {pendingSponsors.length > 0 && (
                <p className="text-[#6060A0] text-xs mt-3">
                  ⏳ Your sponsorship application is under review — our team will confirm shortly.
                </p>
              )}
            </Reveal>

            {/* More events by celebrity */}
            {moreByCeleb.length > 0 && (
              <div>
                <h3 className="text-white font-bold text-lg mb-4">More from {celebrity?.name}</h3>
                <RevealGroup className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {moreByCeleb.map(e => <RevealItem key={e.id}><EventCard event={e} /></RevealItem>)}
                </RevealGroup>
              </div>
            )}
          </div>

          {/* Right: Tickets */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              {/* Actions */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => toggleSaveEvent(event.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    isSaved
                      ? 'bg-[rgba(124,58,237,0.15)] border-[rgba(124,58,237,0.4)] text-[#A78BFA]'
                      : 'bg-[#13132A] border-[rgba(124,58,237,0.2)] text-[#A0A0C0] hover:text-white'
                  }`}
                >
                  <Heart size={15} className={isSaved ? 'fill-current' : ''} />
                  {isSaved ? 'Saved' : 'Save'}
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#13132A] border border-[rgba(124,58,237,0.2)] text-[#A0A0C0] hover:text-white text-sm font-medium transition-all">
                  <Share2 size={15} /> Share
                </button>
              </div>

              {/* Ticket tiers */}
              <div className="space-y-3">
                <h3 className="text-white font-bold text-lg">Select Tickets</h3>
                <RevealGroup className="space-y-3">
                {event.ticketTiers.map((tier: TicketTier) => {
                  const qty = quantities[tier.id] ?? 0;
                  const soldOut = tier.available === 0 || event.status === 'sold_out';
                  return (
                    <RevealItem
                      key={tier.id}
                      y={14}
                      className={`${TIER_BG[tier.tier]} border ${TIER_COLORS[tier.tier]} rounded-2xl p-4 transition-all ${soldOut ? 'opacity-60' : ''}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-white font-bold text-sm">{TIER_LABELS[tier.tier]} {tier.name}</p>
                          <p className="text-[#6060A0] text-xs mt-0.5">{tier.available.toLocaleString()} available</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-black">{formatPrice(tier.price, tier.currency)}</p>
                          <p className="text-[#6060A0] text-[10px]">per ticket</p>
                        </div>
                      </div>

                      <ul className="space-y-1 mb-3">
                        {tier.perks.map(p => (
                          <li key={p} className="flex items-center gap-1.5 text-[#A0A0C0] text-xs">
                            <span className="w-1 h-1 rounded-full bg-[#7C3AED] shrink-0" />
                            {p}
                          </li>
                        ))}
                      </ul>

                      {!soldOut ? (
                        <div className="flex items-center gap-3">
                          <button onClick={() => setQty(tier.id, -1, tier.available)} className="w-7 h-7 rounded-lg bg-[rgba(255,255,255,0.08)] flex items-center justify-center text-white hover:bg-[rgba(124,58,237,0.3)] transition-all">
                            <Minus size={13} />
                          </button>
                          <span className="text-white font-bold w-6 text-center text-sm">{qty}</span>
                          <button onClick={() => setQty(tier.id, 1, tier.available)} className="w-7 h-7 rounded-lg bg-[rgba(255,255,255,0.08)] flex items-center justify-center text-white hover:bg-[rgba(124,58,237,0.3)] transition-all">
                            <Plus size={13} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-orange-400 text-xs font-semibold">Sold Out</span>
                      )}
                    </RevealItem>
                  );
                })}
                </RevealGroup>
              </div>

              {/* Cart summary */}
              {totalItems > 0 && (
                <div className="mt-4 p-4 bg-[rgba(124,58,237,0.1)] border border-[rgba(124,58,237,0.25)] rounded-xl">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[#A0A0C0]">{totalItems} ticket{totalItems > 1 ? 's' : ''}</span>
                    <span className="text-white font-bold">{formatPrice(totalPrice, mainCurrency)}</span>
                  </div>
                </div>
              )}

              <button
                onClick={handleAddToCart}
                disabled={totalItems === 0 || event.status === 'sold_out'}
                className={`w-full mt-3 py-3.5 rounded-xl font-bold text-sm transition-all ${
                  totalItems > 0 && event.status !== 'sold_out'
                    ? added
                      ? 'bg-green-600 text-white'
                      : 'accent-btn text-white'
                    : 'bg-[#1C1C3A] text-[#6060A0] cursor-not-allowed'
                }`}
              >
                {added ? '✓ Added to Cart!' : totalItems > 0 ? `Add to Cart · ${formatPrice(totalPrice, mainCurrency)}` : 'Select Tickets'}
              </button>

              {totalItems > 0 && (
                <Link to="/checkout" className="block w-full mt-2 py-3.5 rounded-xl bg-[#13132A] border border-[rgba(124,58,237,0.3)] text-[#A78BFA] font-bold text-sm text-center hover:bg-[rgba(124,58,237,0.1)] transition-all">
                  Go to Checkout
                </Link>
              )}

              {/* Crypto payment note */}
              <div className="flex items-center justify-center gap-1.5 mt-3 text-[#6060A0] text-xs">
                <Wallet size={12} className="text-[#A78BFA]" />
                <span>Pay securely in crypto — USDT, USDC, BTC, ETH & BNB</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
