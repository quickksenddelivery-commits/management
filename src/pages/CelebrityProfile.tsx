import { useParams, Link } from 'react-router-dom';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { getCelebrity, getEventsByCelebrity, formatFollowers } from '../data/mock';
import { withFallback, celebrityPortrait, celebrityCover } from '../lib/images';
import { useStore } from '../store/useStore';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '../types';
import EventCard from '../components/common/EventCard';

export default function CelebrityProfile() {
  const { id } = useParams<{ id: string }>();
  const celebrity = getCelebrity(id ?? '');
  const { user, toggleFollow } = useStore();
  const isFollowing = user?.following.includes(id ?? '') ?? false;

  if (!celebrity) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <p className="text-6xl mb-4">🌟</p>
        <h2 className="text-2xl font-bold text-white mb-2">Celebrity not found</h2>
        <Link to="/celebrities" className="text-[#A78BFA] hover:text-white transition-colors">← Back to Celebrities</Link>
      </div>
    );
  }

  const celebEvents = getEventsByCelebrity(celebrity.id);
  const upcomingEvents = celebEvents.filter(e => e.status === 'upcoming');
  const pastEvents = celebEvents.filter(e => e.status === 'past' || e.status === 'sold_out');

  return (
    <div>
      {/* Cover */}
      <div className="relative h-64 sm:h-80 overflow-hidden">
        <img
          src={celebrity.coverImage}
          alt=""
          {...withFallback(celebrity._coverFallback ?? celebrityCover(celebrity.name, celebrity.category))}
          className="w-full h-full object-cover"
        />
        <div className="hero-overlay absolute inset-0" />
        <div className="absolute top-20 left-6">
          <Link
            to="/celebrities"
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/40 backdrop-blur-sm border border-white/10 text-white text-sm hover:bg-black/60 transition-all"
          >
            <ArrowLeft size={15} /> Back
          </Link>
        </div>
      </div>

      {/* Profile header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-20 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
            <img
              src={celebrity.image}
              alt={celebrity.name}
              {...withFallback(celebrity._imageFallback ?? celebrityPortrait(celebrity.name, celebrity.category))}
              className="w-32 h-32 rounded-3xl object-cover object-top border-4 border-[#0D0D1A] shadow-2xl"
            />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-3xl sm:text-4xl font-black text-white">{celebrity.name}</h1>
                {celebrity.verified && (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(124,58,237,0.2)] border border-[rgba(124,58,237,0.4)]">
                    <CheckCircle size={14} className="text-[#7C3AED] fill-[#7C3AED]" />
                    <span className="text-[#A78BFA] text-xs font-semibold">Verified</span>
                  </div>
                )}
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${CATEGORY_COLORS[celebrity.category]}`}>
                  {CATEGORY_LABELS[celebrity.category]}
                </span>
              </div>
              <p className="text-[#A0A0C0] text-sm">
                {celebrity.nationality}{celebrity.genre ? ` · ${celebrity.genre}` : ''}
              </p>
            </div>

            <button
              onClick={() => toggleFollow(celebrity.id)}
              className={`shrink-0 px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
                isFollowing
                  ? 'bg-[rgba(124,58,237,0.2)] border border-[rgba(124,58,237,0.5)] text-[#A78BFA] hover:bg-[rgba(124,58,237,0.3)]'
                  : 'accent-btn text-white'
              }`}
            >
              {isFollowing ? '✓ Following' : '+ Follow'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-16">
          {/* Left: bio + stats */}
          <div className="lg:col-span-1 space-y-5">
            <div className="bg-[#13132A] border border-[rgba(124,58,237,0.2)] rounded-2xl p-5">
              <h3 className="text-white font-bold mb-3">About</h3>
              <p className="text-[#A0A0C0] text-sm leading-relaxed">{celebrity.bio}</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Followers', value: formatFollowers(celebrity.followers) },
                { label: 'Events', value: celebEvents.length.toString() },
                { label: 'Upcoming', value: upcomingEvents.length.toString() },
              ].map(stat => (
                <div key={stat.label} className="bg-[#13132A] border border-[rgba(124,58,237,0.2)] rounded-xl p-3 text-center">
                  <p className="text-white font-black text-lg gradient-text">{stat.value}</p>
                  <p className="text-[#6060A0] text-xs mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Events */}
          <div className="lg:col-span-2 space-y-8">
            {upcomingEvents.length > 0 && (
              <div>
                <h2 className="text-white font-bold text-xl mb-4">Upcoming Events</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {upcomingEvents.map(e => <EventCard key={e.id} event={e} />)}
                </div>
              </div>
            )}

            {pastEvents.length > 0 && (
              <div>
                <h2 className="text-white font-bold text-xl mb-4">Past Events</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 opacity-70">
                  {pastEvents.map(e => <EventCard key={e.id} event={e} />)}
                </div>
              </div>
            )}

            {celebEvents.length === 0 && (
              <div className="text-center py-16 bg-[#13132A] border border-[rgba(124,58,237,0.15)] rounded-2xl">
                <p className="text-4xl mb-3">🎭</p>
                <p className="text-[#A0A0C0]">No events listed yet. Check back soon.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
