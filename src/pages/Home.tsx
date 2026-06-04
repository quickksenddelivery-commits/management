import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight, Crown, Star, Zap, Shield } from 'lucide-react';
import EventCard from '../components/common/EventCard';
import CelebrityCard from '../components/common/CelebrityCard';
import { celebrities as mockCelebrities, events as mockEvents, formatPrice } from '../data/mock';
import { sponsors as mockSponsors } from '../data/sponsors';
import { loadEvents, loadCelebrities, loadSponsors } from '../lib/content';
import { useApiData } from '../hooks/useApiData';
import { heroBackground, withFallback, celebrityPortrait, celebrityCover, eventPoster } from '../lib/images';
import type { CelebrityCategory } from '../types';

const HERO_BG = heroBackground();

/* ── Scroll-reveal hook ── */
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.section-fade');
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.08 }
    );
    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

/* ── Animated counter ── */
function useCounter(target: number, duration = 1800) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      let start = 0;
      const step = target / (duration / 16);
      const tick = () => {
        start = Math.min(start + step, target);
        el.textContent = Math.floor(start).toLocaleString() + (target >= 1000000 ? 'M+' : target >= 1000 ? 'K+' : '+');
        if (start < target) requestAnimationFrame(tick);
        else el.textContent = target >= 1000000 ? (target / 1000000) + 'M+' : target >= 1000 ? (target / 1000) + 'K+' : target + '+';
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.5 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);
  return ref;
}

const STATS = [
  { value: 200, label: 'Live Events', suffix: '+' },
  { value: 50, label: 'Verified Celebrities', suffix: '+' },
  { value: 12, label: 'Countries', suffix: '' },
  { value: 1000000, label: 'Fans Served', suffix: '' },
];

const CATEGORIES: { label: string; cat: CelebrityCategory; emoji: string; count: number }[] = [
  { label: 'Musicians', cat: 'musician', emoji: '🎤', count: mockEvents.filter(e => e.category === 'musician').length },
  { label: 'DJs', cat: 'dj', emoji: '🎧', count: mockEvents.filter(e => e.category === 'dj').length },
  { label: 'Comedians', cat: 'comedian', emoji: '😂', count: mockEvents.filter(e => e.category === 'comedian').length },
  { label: 'Actors', cat: 'actor', emoji: '🎬', count: 0 },
  { label: 'Athletes', cat: 'athlete', emoji: '🏆', count: 0 },
  { label: 'Influencers', cat: 'influencer', emoji: '📱', count: 0 },
];

const TICKER_ITEMS = [
  '⚡ The Crown Experience', '✦ Electric Nights Vol. 3', '★ Afrobeats London',
  '◈ Nairobi Soundwave', '✦ Lagos Comedy Festival', '★ Zara Musa Live in Accra',
  '⚡ Full Moon Festival', '◈ DJ Spice World Tour', '✦ Meet & Greet Packages',
];

const VIP_TIERS = [
  { icon: Star, name: 'VIP Section', desc: 'Premium seating with complimentary drinks and a dedicated entrance.', color: 'text-[#A78BFA]', bg: 'bg-[rgba(124,58,237,0.1)]', border: 'border-[rgba(124,58,237,0.3)]' },
  { icon: Crown, name: 'VVIP Table', desc: 'Private table with bottle service and the best view in the venue.', color: 'text-[#F59E0B]', bg: 'bg-[rgba(245,158,11,0.08)]', border: 'border-[rgba(245,158,11,0.35)]' },
  { icon: Zap, name: 'Meet & Greet', desc: 'Personal meet with the celebrity, signed merch, and a photo session.', color: 'text-[#FCD34D]', bg: 'bg-[rgba(252,211,77,0.08)]', border: 'border-[rgba(252,211,77,0.3)]' },
];

function StatCounter({ target }: { target: number }) {
  const ref = useCounter(target);
  return <span ref={ref}>0</span>;
}

/* ── Floating particle ── */
function Particle({ style }: { style: React.CSSProperties }) {
  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={{
        animation: `particle-rise ${Math.random() * 8 + 6}s ease-in-out infinite`,
        ...style,
      }}
    />
  );
}

export default function Home() {
  useScrollReveal();

  const allEvents = useApiData(loadEvents, mockEvents);
  const allCelebs = useApiData(loadCelebrities, mockCelebrities);
  const allSponsors = useApiData(() => loadSponsors(), mockSponsors);

  const featured = allEvents.filter(e => e.isFeatured);
  const upcoming = allEvents.filter(e => e.status === 'upcoming' && !e.isFeatured).slice(0, 6);
  const spotlight = allCelebs[0] ?? mockCelebrities[0];
  const spotlightEvents = allEvents.filter(e => e.celebrityId === spotlight.id).slice(0, 2);
  const vipEvent = allEvents.find(e => e.ticketTiers?.some(t => t.tier === 'meetgreet'));
  const vipTier = vipEvent?.ticketTiers.find(t => t.tier === 'meetgreet');

  return (
    <div>
      {/* ════════════ HERO ════════════ */}
      <section className="relative h-screen min-h-[680px] flex items-center overflow-hidden">

        {/* ── Animated gradient base ── */}
        <div className="hero-bg-animate absolute inset-0" />

        {/* ── Generated mesh-gradient art (always present, on-brand) ── */}
        <img
          src={HERO_BG}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover opacity-70 mix-blend-screen"
        />

        {/* ── Optional cinematic video — drop a file at public/hero.mp4 to enable ── */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ background: 'transparent' }}
        >
          <source src="/hero.mp4" type="video/mp4" />
        </video>

        {/* ── Grid pattern overlay ── */}
        <div className="grid-pattern absolute inset-0 opacity-60" />

        {/* ── Cinematic gradient overlay ── */}
        <div className="hero-overlay absolute inset-0" />

        {/* ── Ambient light spots ── */}
        <div className="absolute top-1/4 left-1/3 w-[700px] h-[500px] rounded-full bg-[#7C3AED]/12 blur-[160px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[300px] rounded-full bg-[#A78BFA]/8 blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/4 w-[300px] h-[200px] rounded-full bg-[#F59E0B]/5 blur-[100px] pointer-events-none" />

        {/* ── Floating particles ── */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[
            { left: '10%', top: '60%', width: 3, height: 3, background: 'rgba(167,139,250,0.8)', animationDelay: '0s' },
            { left: '20%', top: '40%', width: 2, height: 2, background: 'rgba(245,158,11,0.7)', animationDelay: '2s' },
            { left: '35%', top: '70%', width: 2, height: 2, background: 'rgba(167,139,250,0.6)', animationDelay: '4s' },
            { left: '55%', top: '80%', width: 3, height: 3, background: 'rgba(124,58,237,0.9)', animationDelay: '1s' },
            { left: '70%', top: '55%', width: 2, height: 2, background: 'rgba(252,211,77,0.7)', animationDelay: '3s' },
            { left: '80%', top: '75%', width: 2, height: 2, background: 'rgba(167,139,250,0.5)', animationDelay: '5s' },
            { left: '88%', top: '65%', width: 3, height: 3, background: 'rgba(245,158,11,0.6)', animationDelay: '1.5s' },
            { left: '45%', top: '85%', width: 2, height: 2, background: 'rgba(124,58,237,0.7)', animationDelay: '2.5s' },
          ].map((p, i) => (
            <Particle key={i} style={{ left: p.left, top: p.top, width: p.width, height: p.height, background: p.background, animationDelay: p.animationDelay }} />
          ))}
        </div>

        {/* ── Hero content ── */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-3xl">

            {/* Badge */}
            <div
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-[rgba(124,58,237,0.45)] bg-[rgba(124,58,237,0.12)] backdrop-blur-md mb-8 animate-fade-in-up"
              style={{ animationDelay: '.1s' }}
            >
              <span className="w-2 h-2 rounded-full bg-[#7C3AED] animate-pulse" />
              <span className="text-[#A78BFA] text-xs font-bold tracking-widest uppercase">Africa's Premier Celebrity Platform</span>
            </div>

            {/* Headline */}
            <h1
              className="font-black text-white leading-[.95] tracking-tight mb-8 animate-fade-in-up"
              style={{ animationDelay: '.2s', fontSize: 'clamp(3.2rem, 8vw, 7rem)' }}
            >
              <span className="block">Experience</span>
              <span className="block text-shimmer">Celebrities</span>
              <span className="block text-[#A0A0C0] font-bold italic" style={{ fontSize: '0.75em' }}>
                Up Close.
              </span>
            </h1>

            {/* Sub */}
            <p
              className="text-[#A0A0C0] text-lg leading-relaxed max-w-xl mb-10 animate-fade-in-up"
              style={{ animationDelay: '.35s' }}
            >
              Book exclusive tickets to concerts, VIP tables, backstage access, and
              meet-and-greets with the biggest names in entertainment.
            </p>

            {/* CTAs */}
            <div
              className="flex flex-wrap items-center gap-3 animate-fade-in-up"
              style={{ animationDelay: '.5s' }}
            >
              <Link
                to="/events"
                className="accent-btn flex items-center gap-2 px-7 py-4 rounded-xl text-white font-bold text-base"
              >
                Explore Events <ArrowRight size={17} />
              </Link>
              <Link
                to="/celebrities"
                className="flex items-center gap-2 px-7 py-4 rounded-xl bg-white/8 border border-white/15 text-white font-bold backdrop-blur-sm hover:bg-white/12 transition-all"
              >
                Browse Celebrities
              </Link>
            </div>

            {/* Scroll indicator */}
            <div
              className="flex items-center gap-3 mt-14 animate-fade-in-up"
              style={{ animationDelay: '.7s' }}
            >
              <div className="flex flex-col gap-0.5 animate-float">
                <div className="w-5 h-0.5 bg-[#7C3AED] rounded" />
                <div className="w-3 h-0.5 bg-[#A78BFA]/50 rounded ml-1" />
                <div className="w-1.5 h-0.5 bg-[#A78BFA]/25 rounded ml-2" />
              </div>
              <span className="text-[#6060A0] text-xs tracking-widest uppercase">Scroll to explore</span>
            </div>
          </div>
        </div>

        {/* ── Gradient bottom fade ── */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0D0D1A] to-transparent pointer-events-none" />
      </section>

      {/* ════════════ TICKER ════════════ */}
      <div className="bg-[rgba(124,58,237,0.1)] border-y border-[rgba(124,58,237,0.2)] py-4 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="inline-flex items-center gap-3 mx-8 text-[#A78BFA] text-sm font-semibold tracking-wide">
              {item}
              <span className="w-1 h-1 rounded-full bg-[#7C3AED]/60" />
            </span>
          ))}
        </div>
      </div>

      {/* ════════════ STATS ════════════ */}
      <section className="py-20 section-fade">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="luxury-border bg-[#13132A] rounded-2xl p-7 text-center animate-glow-pulse"
                style={{ animationDelay: `${Math.random() * 2}s` }}
              >
                <div className="text-4xl font-black gradient-text mb-2 glow-text">
                  <StatCounter target={stat.value} />
                </div>
                <p className="text-[#A0A0C0] text-sm font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ FEATURED EVENTS ════════════ */}
      <section className="py-16 section-fade">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[#7C3AED] text-xs font-bold tracking-widest uppercase mb-2">Don't Miss</p>
              <h2 className="text-4xl font-black text-white leading-tight">
                Featured <span className="gradient-text">Events</span>
              </h2>
            </div>
            <Link
              to="/events"
              className="hidden sm:flex items-center gap-1.5 text-[#A78BFA] hover:text-white text-sm font-semibold transition-colors group"
            >
              View all <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map(event => (
              <EventCard key={event.id} event={event} featured />
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ CELEBRITY SPOTLIGHT ════════════ */}
      <section className="py-20 bg-[#0A0A16] section-fade">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[#7C3AED] text-xs font-bold tracking-widest uppercase mb-2 text-center">Spotlight</p>
          <h2 className="text-4xl font-black text-white text-center mb-14">
            Artist <span className="gradient-text">Spotlight</span>
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Image side */}
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-[#7C3AED]/20 to-transparent blur-2xl" />
              <div className="relative luxury-border rounded-3xl overflow-hidden">
                <img
                  src={spotlight.coverImage}
                  alt={spotlight.name}
                  {...withFallback(spotlight._coverFallback ?? celebrityCover(spotlight.name, spotlight.category))}
                  className="w-full aspect-[4/3] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A16] via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 flex items-center gap-4">
                  <img
                    src={spotlight.image}
                    alt={spotlight.name}
                    {...withFallback(spotlight._imageFallback ?? celebrityPortrait(spotlight.name, spotlight.category))}
                    className="w-16 h-16 rounded-2xl object-cover object-top border-2 border-[rgba(124,58,237,0.5)]"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-white font-black text-lg">{spotlight.name}</p>
                      <span className="text-[#7C3AED]">✓</span>
                    </div>
                    <p className="text-[#A0A0C0] text-sm">{spotlight.genre}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Text side */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(124,58,237,0.12)] border border-[rgba(124,58,237,0.3)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                <span className="text-[#A78BFA] text-xs font-bold tracking-wider uppercase">Now Touring Africa 2026</span>
              </div>

              <h3 className="text-5xl font-black text-white leading-tight">
                {spotlight.name.split(' ')[0]}{' '}
                <span className="gradient-text">{spotlight.name.split(' ')[1]}</span>
              </h3>

              <p className="text-[#A0A0C0] text-base leading-relaxed">{spotlight.bio}</p>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[rgba(124,58,237,0.08)] border border-[rgba(124,58,237,0.2)] rounded-xl p-4">
                  <p className="text-2xl font-black gradient-text">4.2M</p>
                  <p className="text-[#6060A0] text-xs mt-0.5">Followers</p>
                </div>
                <div className="bg-[rgba(124,58,237,0.08)] border border-[rgba(124,58,237,0.2)] rounded-xl p-4">
                  <p className="text-2xl font-black gradient-text">{spotlightEvents.length}</p>
                  <p className="text-[#6060A0] text-xs mt-0.5">Upcoming Events</p>
                </div>
              </div>

              {/* Upcoming events list */}
              <div className="space-y-3">
                {spotlightEvents.map(e => (
                  <Link key={e.id} to={`/events/${e.id}`} className="flex items-center gap-4 p-3 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(124,58,237,0.15)] hover:border-[rgba(124,58,237,0.35)] transition-all group">
                    <img
                      src={e.image}
                      alt=""
                      {...withFallback(e._imageFallback ?? eventPoster(e.title, e.category))}
                      className="w-14 h-10 rounded-lg object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold truncate group-hover:text-[#A78BFA] transition-colors">{e.title}</p>
                      <p className="text-[#6060A0] text-xs">{e.city} · {new Date(e.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
                    </div>
                    <ChevronRight size={14} className="text-[#6060A0] group-hover:text-[#A78BFA] transition-colors shrink-0" />
                  </Link>
                ))}
              </div>

              <Link to={`/celebrity/${spotlight.id}`} className="inline-flex items-center gap-2 accent-btn px-6 py-3.5 rounded-xl text-white font-bold">
                View Full Profile <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════ VIP EXPERIENCES ════════════ */}
      <section className="py-20 section-fade overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.3)] mb-5">
              <Crown size={14} className="text-[#F59E0B]" />
              <span className="text-[#F59E0B] text-xs font-bold tracking-widest uppercase">Exclusive Access</span>
            </div>
            <h2 className="text-4xl font-black text-white mb-4">
              VIP <span className="gradient-text-gold">Experiences</span>
            </h2>
            <p className="text-[#A0A0C0] max-w-lg mx-auto">
              Go beyond standard admission. Get closer to the artists you love with our exclusive VIP packages.
            </p>
          </div>

          {/* Tiers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {VIP_TIERS.map(({ icon: Icon, name, desc, color, bg, border }) => (
              <div key={name} className={`gold-card rounded-2xl p-7 transition-all duration-300`}>
                <div className={`w-12 h-12 rounded-xl ${bg} border ${border} flex items-center justify-center mb-5`}>
                  <Icon size={22} className={color} />
                </div>
                <h3 className={`text-xl font-black mb-3 ${color}`}>{name}</h3>
                <p className="text-[#A0A0C0] text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          {/* Featured VIP CTA */}
          {vipEvent && vipTier && (
            <div className="relative rounded-3xl overflow-hidden gold-card p-8 sm:p-12">
              {/* Glow orb */}
              <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-[#F59E0B]/8 blur-[100px] pointer-events-none" />

              <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(245,158,11,0.12)] border border-[rgba(245,158,11,0.35)] mb-6">
                    <Star size={12} className="text-[#F59E0B]" />
                    <span className="text-[#F59E0B] text-xs font-bold tracking-wider">Limited Availability</span>
                  </div>

                  <h3 className="text-3xl font-black text-white mb-3">
                    Meet & Greet with{' '}
                    <span className="gradient-text-gold">
                      {allCelebs.find(c => c.id === vipEvent.celebrityId)?.name}
                    </span>
                  </h3>
                  <p className="text-[#A0A0C0] mb-6 leading-relaxed">
                    {vipTier.perks.slice(0, 4).join(' · ')}
                  </p>

                  <div className="flex items-center gap-6 mb-8">
                    <div>
                      <p className="text-[#6060A0] text-xs uppercase tracking-wider">From</p>
                      <p className="text-3xl font-black gradient-text-gold">
                        {formatPrice(vipTier.price, vipTier.currency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[#6060A0] text-xs uppercase tracking-wider">Remaining</p>
                      <p className="text-2xl font-black text-white">{vipTier.available} <span className="text-sm text-[#6060A0] font-normal">spots</span></p>
                    </div>
                  </div>

                  <Link to={`/events/${vipEvent.id}`} className="gold-btn inline-flex items-center gap-2 px-7 py-4 rounded-xl font-bold">
                    Book VIP Experience <Crown size={16} />
                  </Link>
                </div>

                <div className="hidden lg:block">
                  <div className="relative">
                    <div className="absolute -inset-3 rounded-2xl bg-[#F59E0B]/10 blur-xl animate-gold-pulse" />
                    <img
                      src={vipEvent.image}
                      {...withFallback(vipEvent._imageFallback ?? eventPoster(vipEvent.title, vipEvent.category))}
                      alt={vipEvent.title}
                      className="relative w-full aspect-video rounded-2xl object-cover border border-[rgba(245,158,11,0.3)]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ════════════ TRENDING CELEBRITIES ════════════ */}
      <section className="py-20 bg-[#0A0A16] section-fade">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[#7C3AED] text-xs font-bold tracking-widest uppercase mb-2">Follow Them</p>
              <h2 className="text-4xl font-black text-white">
                Trending <span className="gradient-text">Celebrities</span>
              </h2>
            </div>
            <Link to="/celebrities" className="hidden sm:flex items-center gap-1.5 text-[#A78BFA] hover:text-white text-sm font-semibold transition-colors group">
              See all <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {allCelebs.map(celeb => (
              <CelebrityCard key={celeb.id} celebrity={celeb} />
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ CATEGORIES ════════════ */}
      <section className="py-20 section-fade">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <p className="text-[#7C3AED] text-xs font-bold tracking-widest uppercase mb-2">Browse By</p>
            <h2 className="text-4xl font-black text-white">
              Event <span className="gradient-text">Categories</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map(({ label, cat, emoji, count }) => (
              <Link
                key={cat}
                to={`/events?category=${cat}`}
                className="group glow-card bg-[#13132A] rounded-2xl p-6 text-center"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">{emoji}</div>
                <p className="text-white text-sm font-bold group-hover:text-[#A78BFA] transition-colors">{label}</p>
                <p className="text-[#6060A0] text-xs mt-1">{count > 0 ? `${count} events` : 'Coming soon'}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ UPCOMING EVENTS ════════════ */}
      <section className="py-20 bg-[#0A0A16] section-fade">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[#7C3AED] text-xs font-bold tracking-widest uppercase mb-2">Book Now</p>
              <h2 className="text-4xl font-black text-white">
                Upcoming <span className="gradient-text">Events</span>
              </h2>
            </div>
            <Link to="/events" className="hidden sm:flex items-center gap-1.5 text-[#A78BFA] hover:text-white text-sm font-semibold transition-colors group">
              View all <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcoming.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/events" className="accent-btn inline-flex items-center gap-2 px-8 py-4 rounded-xl text-white font-bold text-base">
              Browse All Events <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════ PARTNERS / SPONSORS ════════════ */}
      <section className="py-16 section-fade">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-[#7C3AED] text-xs font-bold tracking-widest uppercase mb-2">Trusted By Leading Brands</p>
            <h2 className="text-4xl font-black text-white">
              Our <span className="gradient-text-gold">Partners</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {allSponsors.map(s => (
              <div key={s.id} className="bg-[#13132A] border border-[rgba(124,58,237,0.15)] rounded-2xl px-4 py-7 flex items-center justify-center hover:border-[rgba(124,58,237,0.35)] transition-all group">
                <img src={s.logo} alt={s.name} className="h-7 object-contain opacity-65 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link to="/sponsorship" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.3)] text-[#FCD34D] font-bold text-sm hover:bg-[rgba(245,158,11,0.18)] transition-all">
              <Crown size={15} /> Become a Sponsor
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════ FINAL CTA ════════════ */}
      <section className="py-20 section-fade">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden luxury-border bg-[#13132A]">

            {/* Background effect */}
            <div className="absolute inset-0 hero-bg-animate opacity-60" />
            <div className="absolute inset-0 grid-pattern opacity-40" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#7C3AED]/15 blur-[100px] pointer-events-none" />

            <div className="relative px-8 sm:px-16 py-16 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(124,58,237,0.15)] border border-[rgba(124,58,237,0.35)] mb-6">
                <Shield size={14} className="text-[#A78BFA]" />
                <span className="text-[#A78BFA] text-xs font-bold tracking-widest uppercase">Are You a Celebrity or Organizer?</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
                List Your Event on{' '}
                <span className="text-shimmer">RACHEAD</span>
              </h2>
              <p className="text-[#A0A0C0] text-lg max-w-xl mx-auto mb-10 leading-relaxed">
                Reach millions of fans. Sell tickets. Host unforgettable experiences.
                Join Africa's fastest-growing celebrity platform.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link to="/register" className="accent-btn flex items-center gap-2 px-8 py-4 rounded-xl text-white font-bold text-base">
                  Get Started Free <ArrowRight size={17} />
                </Link>
                <div className="flex items-center gap-3 text-[#A0A0C0] text-sm">
                  <div className="flex -space-x-2">
                    {allCelebs.slice(0, 4).map((c, i) => (
                      <img
                        key={i}
                        src={c.image}
                        alt=""
                        {...withFallback(c._imageFallback ?? celebrityPortrait(c.name, c.category))}
                        className="w-8 h-8 rounded-full border-2 border-[#13132A] object-cover object-top"
                      />
                    ))}
                  </div>
                  <span>Join <span className="text-white font-semibold">50+</span> verified celebrities</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
