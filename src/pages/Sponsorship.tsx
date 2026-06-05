import { useState, useRef } from 'react';
import type { FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Crown, Check, Users, Globe, TrendingUp, Sparkles, Handshake,
  ArrowRight, CheckCircle, Building2, Star, Calendar, MapPin, Wallet,
} from 'lucide-react';
import { formatPrice, formatDate } from '../lib/format';
import { loadEvents, loadPackages, loadSponsors, loadEvent } from '../lib/content';
import { useApiData } from '../hooks/useApiData';
import { api } from '../lib/api';
import { useStore } from '../store/useStore';
import { SPONSOR_TIER_LABELS } from '../types';
import type { SponsorTier, SponsorshipPackage, Sponsor, Event as EventType } from '../types';
import { heroBackground, withFallback, eventPoster } from '../lib/images';

const HERO_BG = heroBackground();

const TIER_THEME: Record<SponsorTier, { ring: string; chip: string; glow: string; accent: string }> = {
  title:     { ring: 'border-[#F59E0B]/50',   chip: 'bg-[#F59E0B]/15 text-[#FCD34D] border-[#F59E0B]/40', glow: 'shadow-[0_0_40px_rgba(245,158,11,0.15)]', accent: 'text-[#FCD34D]' },
  platinum:  { ring: 'border-[#A78BFA]/50',   chip: 'bg-[#7C3AED]/20 text-[#A78BFA] border-[#7C3AED]/40', glow: 'shadow-[0_0_40px_rgba(124,58,237,0.18)]', accent: 'text-[#A78BFA]' },
  gold:      { ring: 'border-[#FBBF24]/35',   chip: 'bg-[#FBBF24]/12 text-[#FCD34D] border-[#FBBF24]/30', glow: '', accent: 'text-[#FCD34D]' },
  silver:    { ring: 'border-[#94A3B8]/35',   chip: 'bg-[#94A3B8]/12 text-[#CBD5E1] border-[#94A3B8]/30', glow: '', accent: 'text-[#CBD5E1]' },
  community: { ring: 'border-[#7C3AED]/25',   chip: 'bg-[#7C3AED]/10 text-[#A78BFA] border-[#7C3AED]/25', glow: '', accent: 'text-[#A78BFA]' },
};

const REACH_STATS = [
  { icon: Users,      value: '1M+',  label: 'Engaged fans reached' },
  { icon: Globe,      value: '12',   label: 'Countries across Africa & beyond' },
  { icon: TrendingUp, value: '85%',  label: 'Gen-Z & Millennial audience' },
  { icon: Sparkles,   value: '200+', label: 'Premium live events / year' },
];

export default function Sponsorship() {
  const { submitSponsorship, user } = useStore();
  const formRef = useRef<HTMLDivElement>(null);
  const [params] = useSearchParams();
  const targetEventId = params.get('event') ?? '';

  const packages = useApiData<SponsorshipPackage[]>(loadPackages, []);
  const partners = useApiData<Sponsor[]>(() => loadSponsors(), []);
  const allEvents = useApiData<EventType[]>(loadEvents, []);
  const targetEvent = useApiData<EventType | undefined>(
    () => (targetEventId ? loadEvent(targetEventId) : Promise.resolve(undefined)),
    undefined,
    [targetEventId]
  );
  const targetEventSponsors = useApiData<Sponsor[]>(
    () => (targetEventId ? loadSponsors({ eventId: targetEventId }) : Promise.resolve([])),
    [],
    [targetEventId]
  );
  const findPkg = (pid: string) => packages.find(p => p.id === pid);

  const [form, setForm] = useState({
    companyName: '',
    contactName: user?.name ?? '',
    email: user?.email ?? '',
    phone: '',
    packageId: params.get('package') ?? '',
    eventId: targetEventId,
    budget: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const choosePackage = (id: string) => {
    setForm(f => ({ ...f, packageId: id }));
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.companyName || !form.contactName || !form.email || !form.packageId) {
      setError('Please fill in company, contact, email, and choose a package.');
      return;
    }
    setLoading(true);
    try {
      await api.sponsorship.apply({
        companyName: form.companyName,
        contactName: form.contactName,
        email: form.email,
        phone: form.phone,
        packageId: form.packageId,
        eventId: form.eventId || undefined,
        budget: form.budget,
        message: form.message,
      });
    } catch {
      // Backend offline — record locally so it still shows as a pending sponsor.
      submitSponsorship({
        companyName: form.companyName,
        contactName: form.contactName,
        email: form.email,
        phone: form.phone,
        packageId: form.packageId,
        packageName: findPkg(form.packageId)?.name ?? '',
        eventId: form.eventId,
        budget: form.budget,
        message: form.message,
      });
    }
    setLoading(false);
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const sponsorableEvents = allEvents.filter(e => e.status === 'upcoming');

  if (submitted) {
    const pkg = findPkg(form.packageId);
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pt-24 pb-16">
        <div className="max-w-lg w-full text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500/50 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-emerald-400" />
          </div>
          <h1 className="text-3xl font-black text-white mb-3">Application Received!</h1>
          <p className="text-[#A0A0C0] mb-6 leading-relaxed">
            Thank you, <span className="text-white font-semibold">{form.companyName}</span>. Our partnerships
            team will review your interest in the{' '}
            <span className="text-[#A78BFA] font-semibold">{pkg?.name}</span> package and reach out to{' '}
            <span className="text-white">{form.email}</span> within 48 hours.
          </p>
          <div className="bg-[#13132A] border border-[rgba(124,58,237,0.25)] rounded-2xl p-5 mb-8 text-left">
            <div className="flex justify-between py-1.5 text-sm">
              <span className="text-[#6060A0]">Package</span>
              <span className="text-white font-semibold">{pkg?.name}</span>
            </div>
            <div className="flex justify-between py-1.5 text-sm border-t border-[rgba(124,58,237,0.12)]">
              <span className="text-[#6060A0]">Scope</span>
              <span className="text-white font-semibold">
                {form.eventId ? allEvents.find(e => e.id === form.eventId)?.title : 'Platform-wide'}
              </span>
            </div>
            <div className="flex justify-between py-1.5 text-sm border-t border-[rgba(124,58,237,0.12)]">
              <span className="text-[#6060A0]">Contact</span>
              <span className="text-white font-semibold">{form.contactName}</span>
            </div>
          </div>
          {form.eventId && (
            <p className="text-[#FCD34D] text-sm mb-6">
              Your brand now appears as a <span className="font-bold">pending sponsor</span> on this event.
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {form.eventId ? (
              <Link to={`/events/${form.eventId}`} className="accent-btn px-6 py-3.5 rounded-xl text-white font-bold text-center">
                View My Sponsorship on the Event
              </Link>
            ) : (
              <Link to="/" className="accent-btn px-6 py-3.5 rounded-xl text-white font-bold text-center">Back to Home</Link>
            )}
            <Link to="/events" className="px-6 py-3.5 rounded-xl bg-[#13132A] border border-[rgba(124,58,237,0.3)] text-[#A78BFA] font-bold text-center hover:bg-[rgba(124,58,237,0.1)] transition-all">
              Browse Events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* ════════ HERO ════════ */}
      <section className="relative min-h-[60vh] flex items-center overflow-hidden">
        <div className="hero-bg-animate absolute inset-0" />
        <img src={HERO_BG} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover opacity-70 mix-blend-screen" />
        <div className="grid-pattern absolute inset-0 opacity-50" />
        <div className="hero-overlay absolute inset-0" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-[#F59E0B]/8 blur-[140px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-24 pb-12">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[rgba(245,158,11,0.4)] bg-[rgba(245,158,11,0.1)] backdrop-blur-md mb-6">
              <Handshake size={14} className="text-[#F59E0B]" />
              <span className="text-[#FCD34D] text-xs font-bold tracking-widest uppercase">Partner With Rachead</span>
            </div>
            <h1 className="font-black text-white leading-[0.98] tracking-tight mb-6" style={{ fontSize: 'clamp(2.6rem,6vw,5rem)' }}>
              Put Your Brand
              <br />
              <span className="gradient-text-gold">On The Main Stage.</span>
            </h1>
            <p className="text-[#A0A0C0] text-lg leading-relaxed max-w-xl mb-8">
              Sponsor Africa's biggest celebrity events and platform. Reach millions of engaged
              fans, activate your brand live, and create unforgettable moments alongside the stars.
            </p>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => formRef.current?.scrollIntoView({ behavior: 'smooth' })} className="gold-btn flex items-center gap-2 px-7 py-4 rounded-xl text-base">
                Become a Sponsor <ArrowRight size={17} />
              </button>
              <a href="#packages" className="flex items-center gap-2 px-7 py-4 rounded-xl bg-white/8 border border-white/15 text-white font-bold backdrop-blur-sm hover:bg-white/12 transition-all">
                View Packages
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ TARGET EVENT CONTEXT ════════ */}
      {targetEvent && (
        <section className="relative z-20 -mt-10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="luxury-border bg-[#13132A] rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-5 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
              <img
                src={targetEvent.image}
                alt={targetEvent.title}
                {...withFallback(targetEvent._imageFallback ?? eventPoster(targetEvent.title, targetEvent.category))}
                className="w-full sm:w-48 h-28 rounded-xl object-cover shrink-0"
              />
              <div className="flex-1 min-w-0 text-center sm:text-left">
                <p className="text-[#FCD34D] text-[11px] font-bold tracking-widest uppercase mb-1">You're sponsoring</p>
                <h3 className="text-white font-black text-xl leading-tight">{targetEvent.title}</h3>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 justify-center sm:justify-start text-[#A0A0C0] text-xs">
                  <span className="flex items-center gap-1"><Calendar size={12} className="text-[#7C3AED]" /> {formatDate(targetEvent.date)}</span>
                  <span className="flex items-center gap-1"><MapPin size={12} className="text-[#7C3AED]" /> {targetEvent.venue}, {targetEvent.city}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-3 justify-center sm:justify-start">
                  {targetEventSponsors.length > 0 ? (
                    <>
                      <span className="text-[#6060A0] text-[11px]">Current sponsors:</span>
                      {targetEventSponsors.map(s => (
                        <img key={s.id} src={s.logo} alt={s.name} className="h-4 object-contain opacity-70" />
                      ))}
                    </>
                  ) : (
                    <span className="text-[#6060A0] text-[11px]">Be the first brand to sponsor this event.</span>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2 shrink-0 w-full sm:w-auto">
                <button onClick={() => formRef.current?.scrollIntoView({ behavior: 'smooth' })} className="gold-btn px-5 py-3 rounded-xl text-sm">
                  Choose Package
                </button>
                <Link to={`/events/${targetEvent.id}`} className="text-center text-[#A78BFA] hover:text-white text-xs font-semibold transition-colors">
                  View event details
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ════════ REACH STATS ════════ */}
      <section className="py-16 bg-[#0A0A16] border-y border-[rgba(124,58,237,0.12)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-[#7C3AED] text-xs font-bold tracking-widest uppercase mb-2">Why Sponsor</p>
          <h2 className="text-center text-3xl font-black text-white mb-12">A Stage In Front Of Millions</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {REACH_STATS.map(({ icon: Icon, value, label }) => (
              <div key={label} className="bg-[#13132A] border border-[rgba(124,58,237,0.2)] rounded-2xl p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-[rgba(124,58,237,0.12)] border border-[rgba(124,58,237,0.3)] flex items-center justify-center mx-auto mb-4">
                  <Icon size={22} className="text-[#A78BFA]" />
                </div>
                <p className="text-3xl font-black gradient-text mb-1">{value}</p>
                <p className="text-[#A0A0C0] text-sm leading-snug">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ PACKAGES ════════ */}
      <section id="packages" className="py-20 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[#7C3AED] text-xs font-bold tracking-widest uppercase mb-2">Choose Your Level</p>
            <h2 className="text-4xl font-black text-white mb-4">Sponsorship <span className="gradient-text-gold">Packages</span></h2>
            <p className="text-[#A0A0C0] max-w-xl mx-auto">Flexible tiers for every budget — from owning an entire event to joining as a community partner.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map(pkg => {
              const t = TIER_THEME[pkg.tier];
              const soldOut = pkg.slotsAvailable === 0;
              return (
                <div
                  key={pkg.id}
                  className={`relative bg-[#13132A] rounded-2xl border ${t.ring} ${t.glow} p-6 flex flex-col ${pkg.tier === 'title' ? 'lg:col-span-3 lg:flex-row lg:items-center lg:gap-8' : ''}`}
                >
                  {pkg.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#7C3AED] text-white text-[10px] font-black tracking-wider uppercase shadow-[0_0_14px_rgba(124,58,237,0.6)]">
                      ★ Most Popular
                    </span>
                  )}

                  <div className={pkg.tier === 'title' ? 'lg:flex-1' : ''}>
                    <div className="flex items-center gap-2 mb-2">
                      {pkg.tier === 'title' && <Crown size={18} className="text-[#FCD34D]" />}
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${t.chip}`}>
                        {SPONSOR_TIER_LABELS[pkg.tier]}
                      </span>
                    </div>
                    <h3 className="text-white font-black text-2xl mb-1">{pkg.name}</h3>
                    <p className="text-[#6060A0] text-sm mb-4">{pkg.tagline}</p>
                    <div className="flex items-end gap-1 mb-1">
                      <span className={`text-4xl font-black ${t.accent}`}>{formatPrice(pkg.price, pkg.currency)}</span>
                      <span className="text-[#6060A0] text-sm mb-1.5">/ event</span>
                    </div>
                    <p className="text-[#6060A0] text-xs mb-5">
                      {soldOut ? <span className="text-orange-400 font-semibold">Fully booked</span> : `${pkg.slotsAvailable} of ${pkg.slotsTotal} slots available`}
                    </p>
                  </div>

                  <div className={pkg.tier === 'title' ? 'lg:flex-1' : 'flex-1'}>
                    <ul className={`space-y-2.5 mb-6 ${pkg.tier === 'title' ? 'lg:grid lg:grid-cols-2 lg:gap-x-6 lg:space-y-0 lg:gap-y-2.5' : ''}`}>
                      {pkg.benefits.map(b => (
                        <li key={b} className="flex items-start gap-2.5 text-sm">
                          <Check size={15} className={`shrink-0 mt-0.5 ${t.accent}`} />
                          <span className="text-[#A0A0C0]">{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className={pkg.tier === 'title' ? 'lg:w-56 lg:shrink-0' : ''}>
                    <button
                      onClick={() => choosePackage(pkg.id)}
                      disabled={soldOut}
                      className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all ${
                        soldOut
                          ? 'bg-[#1C1C3A] text-[#6060A0] cursor-not-allowed'
                          : pkg.tier === 'title'
                            ? 'gold-btn'
                            : pkg.popular
                              ? 'accent-btn text-white'
                              : 'bg-[rgba(124,58,237,0.12)] border border-[rgba(124,58,237,0.35)] text-[#A78BFA] hover:bg-[rgba(124,58,237,0.22)]'
                      }`}
                    >
                      {soldOut ? 'Fully Booked' : 'Choose ' + pkg.name}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════ SPONSOR A SPECIFIC EVENT ════════ */}
      <section className="py-16 bg-[#0A0A16]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <p className="text-[#7C3AED] text-xs font-bold tracking-widest uppercase mb-2">Targeted Reach</p>
            <h2 className="text-3xl font-black text-white">Sponsor A Specific Event</h2>
            <p className="text-[#A0A0C0] mt-2">Pick a flagship event to align your brand with — or sponsor the whole platform.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sponsorableEvents.slice(0, 6).map(ev => {
              const selected = form.eventId === ev.id;
              return (
                <button
                  key={ev.id}
                  onClick={() => { setForm(f => ({ ...f, eventId: ev.id })); formRef.current?.scrollIntoView({ behavior: 'smooth' }); }}
                  className={`text-left glow-card bg-[#13132A] rounded-2xl p-4 flex items-center gap-4 group ${selected ? 'border-[#F59E0B]/50 shadow-[0_0_24px_rgba(245,158,11,0.15)]' : ''}`}
                >
                  <img
                    src={ev.image}
                    alt=""
                    {...withFallback(ev._imageFallback ?? eventPoster(ev.title, ev.category))}
                    className="w-16 h-16 rounded-xl object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-bold text-sm truncate group-hover:text-[#A78BFA] transition-colors">{ev.title}</p>
                    <p className="text-[#6060A0] text-xs">{ev.city} · {ev.country}</p>
                    <span className={`inline-block mt-1.5 text-xs font-semibold ${selected ? 'text-[#FCD34D]' : 'text-[#A78BFA]'}`}>
                      {selected ? '✓ Selected' : 'Sponsor this event →'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════ APPLICATION FORM ════════ */}
      <section ref={formRef} className="py-20 scroll-mt-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.3)] mb-5">
              <Building2 size={14} className="text-[#F59E0B]" />
              <span className="text-[#FCD34D] text-xs font-bold tracking-widest uppercase">Apply Now</span>
            </div>
            <h2 className="text-4xl font-black text-white mb-3">Become a Sponsor</h2>
            <p className="text-[#A0A0C0]">Tell us about your brand and we'll craft the perfect partnership.</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-[#13132A] border border-[rgba(124,58,237,0.25)] rounded-3xl p-6 sm:p-8 space-y-5">
            {error && (
              <div className="px-4 py-3 rounded-xl bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-[#EF4444] text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Company / Brand name *">
                <input type="text" value={form.companyName} onChange={set('companyName')} placeholder="Acme Inc." className={inputCls} />
              </Field>
              <Field label="Contact person *">
                <input type="text" value={form.contactName} onChange={set('contactName')} placeholder="Your full name" className={inputCls} />
              </Field>
              <Field label="Work email *">
                <input type="email" value={form.email} onChange={set('email')} placeholder="you@company.com" className={inputCls} />
              </Field>
              <Field label="Phone">
                <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+234 ..." className={inputCls} />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Package *">
                <select value={form.packageId} onChange={set('packageId')} className={inputCls}>
                  <option value="">Select a package</option>
                  {packages.map(p => (
                    <option key={p.id} value={p.id} disabled={p.slotsAvailable === 0}>
                      {p.name} — {formatPrice(p.price, p.currency)}{p.slotsAvailable === 0 ? ' (booked)' : ''}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Scope">
                <select value={form.eventId} onChange={set('eventId')} className={inputCls}>
                  <option value="">Platform-wide partnership</option>
                  {sponsorableEvents.map(ev => (
                    <option key={ev.id} value={ev.id}>{ev.title} — {ev.city}</option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Estimated budget (optional)">
              <input type="text" value={form.budget} onChange={set('budget')} placeholder="e.g. $25,000" className={inputCls} />
            </Field>

            <Field label="Tell us about your goals">
              <textarea value={form.message} onChange={set('message')} rows={4} placeholder="What does your brand want to achieve with this partnership?" className={`${inputCls} resize-none`} />
            </Field>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold text-base transition-all ${loading ? 'bg-[#7C3AED]/50 text-white cursor-wait' : 'gold-btn'}`}
            >
              {loading ? 'Submitting...' : 'Submit Sponsorship Application'}
            </button>
            <p className="text-center text-[#6060A0] text-xs flex items-center justify-center gap-1.5">
              <Wallet size={12} className="text-[#A78BFA]" />
              Sponsorship fees are settled in crypto (USDT / USDC). Our team responds within 48 hours.
            </p>
          </form>
        </div>
      </section>

      {/* ════════ CURRENT PARTNERS WALL ════════ */}
      <section className="py-16 bg-[#0A0A16] border-t border-[rgba(124,58,237,0.12)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Star size={14} className="text-[#F59E0B]" />
            <p className="text-[#7C3AED] text-xs font-bold tracking-widest uppercase">Trusted By</p>
          </div>
          <h2 className="text-center text-3xl font-black text-white mb-12">Our Partners & Sponsors</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {partners.map(s => (
              <div key={s.id} className="bg-[#13132A] border border-[rgba(124,58,237,0.15)] rounded-2xl p-6 flex flex-col items-center justify-center gap-3 hover:border-[rgba(124,58,237,0.35)] transition-all group">
                <img src={s.logo} alt={s.name} className="h-7 object-contain opacity-75 group-hover:opacity-100 transition-opacity" />
                <div className="text-center">
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold border ${TIER_THEME[s.tier].chip}`}>
                    {SPONSOR_TIER_LABELS[s.tier]}
                  </span>
                  <p className="text-[#6060A0] text-[10px] mt-1.5">{s.industry}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

const inputCls =
  'w-full bg-[#1C1C3A] border border-[rgba(124,58,237,0.2)] rounded-xl px-4 py-3 text-white placeholder-[#6060A0] focus:outline-none focus:border-[#7C3AED] text-sm transition-colors';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[#A0A0C0] text-sm font-medium mb-2">{label}</span>
      {children}
    </label>
  );
}
