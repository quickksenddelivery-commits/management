/**
 * Loading placeholders shaped like the real cards they precede — shown
 * while the first Firestore read is in flight, so a genuinely empty
 * catalog ("no events yet") is never confused with "still loading".
 */

export function EventCardSkeleton({ featured = false }: { featured?: boolean }) {
  return (
    <div className="bg-[#13132A] border border-[rgba(124,58,237,0.15)] rounded-2xl overflow-hidden animate-pulse">
      <div className={`${featured ? 'aspect-video' : 'aspect-[16/10]'} bg-[#1C1C3A]`} />
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#1C1C3A] shrink-0" />
          <div className="h-3 w-24 rounded bg-[#1C1C3A]" />
        </div>
        <div className="h-4 w-4/5 rounded bg-[#1C1C3A]" />
        <div className="h-3 w-3/5 rounded bg-[#1C1C3A]" />
        <div className="h-3 w-2/5 rounded bg-[#1C1C3A]" />
        <div className="flex items-center justify-between pt-3 border-t border-[rgba(124,58,237,0.1)]">
          <div className="h-5 w-16 rounded bg-[#1C1C3A]" />
          <div className="h-7 w-24 rounded-lg bg-[#1C1C3A]" />
        </div>
      </div>
    </div>
  );
}

export function CelebrityCardSkeleton() {
  return (
    <div className="bg-[#13132A] border border-[rgba(124,58,237,0.15)] rounded-2xl overflow-hidden animate-pulse">
      <div className="aspect-[3/4] bg-[#1C1C3A]" />
      <div className="px-3.5 py-3 flex items-center justify-between">
        <div className="space-y-1.5">
          <div className="h-2 w-14 rounded bg-[#1C1C3A]" />
          <div className="h-3.5 w-10 rounded bg-[#1C1C3A]" />
        </div>
        <div className="h-6 w-16 rounded-lg bg-[#1C1C3A]" />
      </div>
    </div>
  );
}
