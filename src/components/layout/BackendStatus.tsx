import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';
import { api } from '../../lib/api';

/**
 * Subtle floating badge that appears only when the backend can't be reached,
 * so users know they're seeing demo / cached data. Re-probes every 60s.
 */
export default function BackendStatus() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    let alive = true;
    const probe = async () => {
      try {
        const r = await api.health();
        if (alive) setOffline(r?.status !== 'ok');
      } catch {
        if (alive) setOffline(true);
      }
    };
    probe();
    const id = setInterval(probe, 60_000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  if (!offline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-[55] pointer-events-none">
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#13132A]/95 backdrop-blur-md border border-amber-500/40 shadow-[0_8px_24px_rgba(0,0,0,0.4)] pointer-events-auto">
        <WifiOff size={13} className="text-amber-400" />
        <span className="text-amber-300 text-[11px] font-semibold tracking-wide">
          Backend offline — running in demo mode
        </span>
      </div>
    </div>
  );
}
