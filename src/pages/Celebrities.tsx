import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import CelebrityCard from '../components/common/CelebrityCard';
import { CelebrityCardSkeleton } from '../components/common/Skeleton';
import { staggerDelay } from '../lib/animation';
import { loadCelebrities } from '../lib/content';
import { useApiDataLoading } from '../hooks/useApiData';
import type { Celebrity, CelebrityCategory } from '../types';
import { CATEGORY_LABELS } from '../types';
import Reveal from '../components/motion/Reveal';
import { useSeo } from '../components/seo/useSeo';

const ALL_CATS: CelebrityCategory[] = ['musician', 'dj', 'comedian', 'actor', 'athlete', 'influencer'];

export default function Celebrities() {
  useSeo({
    title: 'Celebrities',
    description: 'Discover verified musicians, DJs, comedians, actors, athletes, and influencers hosting events on FanConnectPro.',
    path: '/celebrities',
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [category, setCategory] = useState<CelebrityCategory | ''>('');

  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (search) next.set('search', search);
    else next.delete('search');
    if (next.toString() !== searchParams.toString()) {
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const { data: celebrities, loading } = useApiDataLoading<Celebrity[]>(loadCelebrities, []);

  const filtered = useMemo(() =>
    celebrities.filter(c => {
      if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (category && c.category !== category) return false;
      return true;
    }),
    [celebrities, search, category]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
      <Reveal className="mb-10">
        <p className="text-[#7C3AED] text-sm font-semibold tracking-widest uppercase mb-2">Discover</p>
        <h1 className="text-4xl font-black text-white mb-2">Celebrities</h1>
        <p className="text-[#A0A0C0]">{loading ? 'Loading celebrities…' : `${filtered.length} celebrity profiles`}</p>
      </Reveal>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search celebrities..."
          className="flex-1 bg-[#13132A] border border-[rgba(124,58,237,0.25)] rounded-xl px-4 py-3 text-white placeholder-[#6060A0] focus:outline-none focus:border-[#7C3AED] text-sm transition-colors"
        />
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setCategory('')}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
              !category ? 'bg-[#7C3AED] border-[#7C3AED] text-white' : 'bg-transparent border-[rgba(124,58,237,0.25)] text-[#A0A0C0] hover:text-white'
            }`}
          >All</button>
          {ALL_CATS.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(category === cat ? '' : cat)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                category === cat ? 'bg-[#7C3AED] border-[#7C3AED] text-white' : 'bg-transparent border-[rgba(124,58,237,0.25)] text-[#A0A0C0] hover:text-white'
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }, (_, i) => <CelebrityCardSkeleton key={i} />)}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {filtered.map((c, i) => (
            <div key={c.id} className="card-in" style={{ animationDelay: staggerDelay(i) }}>
              <CelebrityCard celebrity={c} />
            </div>
          ))}
        </div>
      ) : celebrities.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-6xl mb-4">🌟</p>
          <h3 className="text-white text-xl font-bold mb-2">No celebrities yet</h3>
          <p className="text-[#A0A0C0]">Check back soon — new profiles are added regularly.</p>
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-6xl mb-4">🌟</p>
          <h3 className="text-white text-xl font-bold mb-2">No celebrities found</h3>
          <p className="text-[#A0A0C0]">Try a different search</p>
        </div>
      )}
    </div>
  );
}
