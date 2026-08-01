import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import EventCard from '../components/common/EventCard';
import { EventCardSkeleton } from '../components/common/Skeleton';
import { staggerDelay } from '../lib/animation';
import { loadEvents } from '../lib/content';
import type { Event } from '../types';
import { useApiDataLoading } from '../hooks/useApiData';
import type { CelebrityCategory } from '../types';
import { CATEGORY_LABELS } from '../types';
import Reveal from '../components/motion/Reveal';
import { useSeo } from '../components/seo/useSeo';

const ALL_CATEGORIES: CelebrityCategory[] = ['musician', 'dj', 'comedian', 'actor', 'athlete', 'influencer'];
const ALL_COUNTRIES = ['United States', 'United Kingdom', 'Canada', 'Australia'];
const ALL_STATUSES = ['upcoming', 'live', 'sold_out'] as const;

export default function Events() {
  useSeo({
    title: 'Browse Events',
    description: 'Find concerts, Top Fan experiences, and meet-and-greets from your favorite celebrities across the US, UK, and beyond.',
    path: '/events',
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') ?? '');

  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (search) next.set('search', search);
    else next.delete('search');
    if (next.toString() !== searchParams.toString()) {
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);
  const [category, setCategory] = useState<CelebrityCategory | ''>(
    (searchParams.get('category') as CelebrityCategory) || ''
  );
  const [country, setCountry] = useState('');
  const [status, setStatus] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const { data: events, loading } = useApiDataLoading<Event[]>(loadEvents, []);

  const filtered = useMemo(() => {
    return events.filter(e => {
      if (search && !e.title.toLowerCase().includes(search.toLowerCase()) &&
          !e.city.toLowerCase().includes(search.toLowerCase())) return false;
      if (category && e.category !== category) return false;
      if (country && e.country !== country) return false;
      if (status && e.status !== status) return false;
      return true;
    });
  }, [events, search, category, country, status]);

  const hasFilters = category || country || status;

  const clearFilters = () => {
    setCategory('');
    setCountry('');
    setStatus('');
    setSearch('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
      {/* Header */}
      <Reveal className="mb-10">
        <p className="text-[#7C3AED] text-sm font-semibold tracking-widest uppercase mb-2">All Events</p>
        <h1 className="text-4xl font-black text-white mb-2">Browse Events</h1>
        <p className="text-[#A0A0C0]">
          {loading ? 'Loading events…' : `${filtered.length} event${filtered.length !== 1 ? 's' : ''} found`}
        </p>
      </Reveal>

      {/* Search + Filter toggle */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by event name or city..."
          className="flex-1 bg-[#13132A] border border-[rgba(124,58,237,0.25)] rounded-xl px-4 py-3 text-white placeholder-[#6060A0] focus:outline-none focus:border-[#7C3AED] text-sm transition-colors"
        />
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
            showFilters || hasFilters
              ? 'bg-[rgba(124,58,237,0.2)] border-[rgba(124,58,237,0.5)] text-[#A78BFA]'
              : 'bg-[#13132A] border-[rgba(124,58,237,0.25)] text-[#A0A0C0] hover:text-white'
          }`}
        >
          <SlidersHorizontal size={16} />
          Filters
          {hasFilters && <span className="w-5 h-5 bg-[#7C3AED] rounded-full text-white text-[10px] font-bold flex items-center justify-center">!</span>}
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-[#13132A] border border-[rgba(124,58,237,0.2)] rounded-2xl p-5 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Category */}
          <div>
            <label className="text-[#6060A0] text-xs uppercase tracking-wider font-semibold mb-2 block">Category</label>
            <div className="flex flex-wrap gap-2">
              {ALL_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(category === cat ? '' : cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    category === cat
                      ? 'bg-[rgba(124,58,237,0.25)] border-[rgba(124,58,237,0.5)] text-[#A78BFA]'
                      : 'bg-transparent border-[rgba(255,255,255,0.1)] text-[#A0A0C0] hover:text-white'
                  }`}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>

          {/* Country */}
          <div>
            <label className="text-[#6060A0] text-xs uppercase tracking-wider font-semibold mb-2 block">Country</label>
            <div className="flex flex-wrap gap-2">
              {ALL_COUNTRIES.map(c => (
                <button
                  key={c}
                  onClick={() => setCountry(country === c ? '' : c)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    country === c
                      ? 'bg-[rgba(124,58,237,0.25)] border-[rgba(124,58,237,0.5)] text-[#A78BFA]'
                      : 'bg-transparent border-[rgba(255,255,255,0.1)] text-[#A0A0C0] hover:text-white'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="text-[#6060A0] text-xs uppercase tracking-wider font-semibold mb-2 block">Status</label>
            <div className="flex flex-wrap gap-2">
              {ALL_STATUSES.map(s => (
                <button
                  key={s}
                  onClick={() => setStatus(status === s ? '' : s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    status === s
                      ? 'bg-[rgba(124,58,237,0.25)] border-[rgba(124,58,237,0.5)] text-[#A78BFA]'
                      : 'bg-transparent border-[rgba(255,255,255,0.1)] text-[#A0A0C0] hover:text-white'
                  }`}
                >
                  {s === 'sold_out' ? 'Sold Out' : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {hasFilters && (
            <div className="sm:col-span-3 pt-2 border-t border-[rgba(124,58,237,0.1)]">
              <button onClick={clearFilters} className="flex items-center gap-1.5 text-[#EF4444] text-sm hover:text-red-300 transition-colors">
                <X size={14} /> Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Category quick pills */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-8">
        <button
          onClick={() => setCategory('')}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
            !category
              ? 'bg-[#7C3AED] border-[#7C3AED] text-white'
              : 'bg-transparent border-[rgba(124,58,237,0.25)] text-[#A0A0C0] hover:text-white'
          }`}
        >
          All
        </button>
        {ALL_CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(category === cat ? '' : cat)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
              category === cat
                ? 'bg-[#7C3AED] border-[#7C3AED] text-white'
                : 'bg-transparent border-[rgba(124,58,237,0.25)] text-[#A0A0C0] hover:text-white'
            }`}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }, (_, i) => <EventCardSkeleton key={i} />)}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((event, i) => (
            <div key={event.id} className="card-in" style={{ animationDelay: staggerDelay(i) }}>
              <EventCard event={event} />
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-6xl mb-4">🎭</p>
          <h3 className="text-white text-xl font-bold mb-2">No events yet</h3>
          <p className="text-[#A0A0C0]">Check back soon — new events are added regularly.</p>
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-6xl mb-4">🎭</p>
          <h3 className="text-white text-xl font-bold mb-2">No events found</h3>
          <p className="text-[#A0A0C0] mb-6">Try adjusting your search or filters</p>
          <button onClick={clearFilters} className="accent-btn px-6 py-3 rounded-xl text-white font-semibold">
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
