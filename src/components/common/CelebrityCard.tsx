import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import type { Celebrity } from '../../types';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '../../types';
import { formatFollowers } from '../../data/mock';
import { withFallback, celebrityPortrait } from '../../lib/images';
import { useStore } from '../../store/useStore';

interface Props { celebrity: Celebrity }

export default function CelebrityCard({ celebrity }: Props) {
  const { user, toggleFollow } = useStore();
  const isFollowing = user?.following.includes(celebrity.id) ?? false;
  const fallback    = celebrity._imageFallback ?? celebrityPortrait(celebrity.name, celebrity.category);

  const handleFollow = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation(); toggleFollow(celebrity.id);
  };

  return (
    <Link to={`/celebrity/${celebrity.id}`} className="block group">
      <div className="glow-card bg-[#13132A] rounded-2xl overflow-hidden">

        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden">
          <img
            src={celebrity.image}
            alt={celebrity.name}
            {...withFallback(fallback)}
            className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#13132A] via-[rgba(13,13,26,.3)] to-transparent" />
          <div className="absolute inset-0 bg-[#7C3AED]/0 group-hover:bg-[#7C3AED]/6 transition-all duration-500" />

          {/* Category */}
          <div className="absolute top-3 left-3">
            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border backdrop-blur-sm ${CATEGORY_COLORS[celebrity.category]}`}>
              {CATEGORY_LABELS[celebrity.category]}
            </span>
          </div>

          {celebrity.verified && (
            <div className="absolute top-3 right-3">
              <div className="w-6 h-6 rounded-full bg-[#7C3AED] shadow-[0_0_10px_rgba(124,58,237,.6)] flex items-center justify-center">
                <span className="text-white text-[9px] font-black">✓</span>
              </div>
            </div>
          )}

          {/* Name at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-3.5">
            <div className="flex items-center gap-1.5 mb-0.5">
              <h3 className="text-white font-black text-sm leading-tight group-hover:text-[#A78BFA] transition-colors">{celebrity.name}</h3>
              {celebrity.verified && <CheckCircle size={13} className="text-[#7C3AED] fill-[#7C3AED] shrink-0" />}
            </div>
            <p className="text-[#A0A0C0] text-[10px]">
              {celebrity.nationality}{celebrity.genre ? ` · ${celebrity.genre.split('/')[0].trim()}` : ''}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-3.5 py-3 flex items-center justify-between">
          <div>
            <p className="text-[#6060A0] text-[9px] uppercase tracking-wider font-bold">Followers</p>
            <p className="text-white font-black text-sm gradient-text">{formatFollowers(celebrity.followers)}</p>
          </div>
          <button
            onClick={handleFollow}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
              isFollowing
                ? 'bg-[rgba(124,58,237,.2)] border-[rgba(124,58,237,.5)] text-[#A78BFA] shadow-[0_0_8px_rgba(124,58,237,.2)]'
                : 'bg-transparent border-[rgba(255,255,255,.12)] text-[#A0A0C0] hover:border-[rgba(124,58,237,.4)] hover:text-[#A78BFA]'
            }`}
          >
            {isFollowing ? '✓ Following' : '+ Follow'}
          </button>
        </div>
      </div>
    </Link>
  );
}
