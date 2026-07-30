import { Link } from 'react-router-dom';
import { Calendar, MapPin, Heart, Users } from 'lucide-react';
import type { Event } from '../../types';
import { formatDate, formatPrice } from '../../lib/format';
import { getCachedCelebrity } from '../../lib/content';
import { withFallback, eventPoster } from '../../lib/images';
import { useStore } from '../../store/useStore';
import TiltCard from '../motion/TiltCard';

interface Props {
  event: Event;
  featured?: boolean;
}

const STATUS_STYLES = {
  upcoming: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  live:     'bg-red-500/15 text-red-400 border-red-500/30',
  past:     'bg-gray-500/15 text-gray-400 border-gray-500/30',
  sold_out: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
};
const STATUS_LABELS = {
  upcoming: 'Upcoming', live: '● LIVE', past: 'Past', sold_out: 'Sold Out',
};

export default function EventCard({ event, featured = false }: Props) {
  const { user, toggleSaveEvent } = useStore();
  const celebrity    = getCachedCelebrity(event.celebrityId);
  const isSaved      = user?.savedEvents.includes(event.id) ?? false;
  const lowestPrice  = event.ticketTiers.reduce((m, t) => t.price < m.price ? t : m, event.ticketTiers[0]);
  const totalAvail   = event.ticketTiers.reduce((s, t) => s + t.available, 0);
  const fallbackSrc  = event._imageFallback ?? eventPoster(event.title, event.category);
  const celebFallback = celebrity?._imageFallback;

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation(); toggleSaveEvent(event.id);
  };

  return (
    <Link to={`/events/${event.id}`} className="block group h-full">
      <TiltCard max={6} className="glow-card bg-[#13132A] rounded-2xl overflow-hidden flex flex-col h-full">

        {/* Image */}
        <div className={`relative overflow-hidden shrink-0 ${featured ? 'aspect-video' : 'aspect-[16/10]'}`}>
          <img
            src={event.image}
            alt={event.title}
            {...withFallback(fallbackSrc)}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#13132A] via-[rgba(13,13,26,.2)] to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/4 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border backdrop-blur-sm ${STATUS_STYLES[event.status]}`}>
              {STATUS_LABELS[event.status]}
            </span>
            <button
              onClick={handleSave}
              aria-label={isSaved ? 'Remove from saved events' : 'Save event'}
              aria-pressed={isSaved}
              className={`w-8 h-8 rounded-lg backdrop-blur-sm border flex items-center justify-center transition-all ${
                isSaved
                  ? 'bg-[#7C3AED]/30 border-[#7C3AED]/60 text-[#A78BFA] shadow-[0_0_12px_rgba(124,58,237,.4)]'
                  : 'bg-black/30 border-white/10 text-white/60 hover:text-white hover:bg-black/50'
              }`}
            >
              <Heart size={13} className={isSaved ? 'fill-current' : ''} />
            </button>
          </div>

          {event.isFeatured && (
            <div className="absolute bottom-3 left-3">
              <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-[#7C3AED] text-white shadow-[0_0_12px_rgba(124,58,237,.5)]">
                ✦ FEATURED
              </span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-4 flex flex-col flex-1">
          {celebrity && (
            <div className="flex items-center gap-2 mb-3">
              <div className="relative">
                <img
                  src={celebrity.image}
                  alt={celebrity.name}
                  {...(celebFallback ? withFallback(celebFallback) : {})}
                  className="w-7 h-7 rounded-full object-cover border-2 border-[rgba(124,58,237,.5)]"
                />
                {celebrity.verified && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#7C3AED] border border-[#13132A] flex items-center justify-center text-[6px] text-white font-black">✓</span>
                )}
              </div>
              <span className="text-[#A78BFA] text-xs font-bold">{celebrity.name}</span>
            </div>
          )}

          <h3 className="text-white font-black text-sm leading-tight mb-1 group-hover:text-[#A78BFA] transition-colors duration-200 line-clamp-2 flex-1">
            {event.title}
          </h3>
          {event.subtitle && <p className="text-[#6060A0] text-xs mb-3">{event.subtitle}</p>}

          <div className="space-y-1.5 mb-4 mt-2">
            <div className="flex items-center gap-2 text-[#A0A0C0] text-xs">
              <Calendar size={11} className="shrink-0 text-[#7C3AED]" />
              <span>{formatDate(event.date)}</span>
            </div>
            <div className="flex items-center gap-2 text-[#A0A0C0] text-xs">
              <MapPin size={11} className="shrink-0 text-[#7C3AED]" />
              <span className="truncate">{event.venue}, {event.city}, {event.country}</span>
            </div>
            {totalAvail > 0 && event.status !== 'sold_out' && (
              <div className="flex items-center gap-2 text-[#A0A0C0] text-xs">
                <Users size={11} className="shrink-0 text-[#7C3AED]" />
                <span>{totalAvail.toLocaleString()} tickets left</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-auto pt-3 border-t border-[rgba(124,58,237,.12)]">
            <div>
              <p className="text-[#6060A0] text-[10px] uppercase tracking-wider font-semibold">From</p>
              <p className="text-white font-black text-sm">
                {lowestPrice ? formatPrice(lowestPrice.price, lowestPrice.currency) : 'Free'}
              </p>
            </div>
            <span className="px-3 py-1.5 rounded-lg bg-[rgba(124,58,237,.12)] border border-[rgba(124,58,237,.3)] text-[#A78BFA] text-xs font-bold group-hover:bg-[rgba(124,58,237,.22)] group-hover:border-[rgba(124,58,237,.5)] transition-all">
              Get Tickets →
            </span>
          </div>
        </div>
      </TiltCard>
    </Link>
  );
}
