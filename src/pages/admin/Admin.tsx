import { useSearchParams } from 'react-router-dom';
import { Calendar, Users, Handshake, Shield } from 'lucide-react';
import AdminEvents from './AdminEvents';
import AdminCelebrities from './AdminCelebrities';
import AdminApplications from './AdminApplications';

type AdminTab = 'events' | 'celebrities' | 'applications';
const VALID_TABS: AdminTab[] = ['events', 'celebrities', 'applications'];

/**
 * Admin Console.
 * Access is gated upstream by RequireAdmin (checks user.role === 'admin' on the
 * JWT from the backend). The active tab is reflected in the URL (?tab=) so
 * sub-pages (e.g. /admin/events/new) can come back to the right tab.
 */
export default function Admin() {
  const [params, setParams] = useSearchParams();
  const requested = params.get('tab') as AdminTab | null;
  const tab: AdminTab = requested && VALID_TABS.includes(requested) ? requested : 'events';
  const setTab = (next: AdminTab) => setParams({ tab: next }, { replace: true });

  const TABS: { key: AdminTab; label: string; icon: typeof Calendar; render: () => React.ReactNode }[] = [
    { key: 'events',       label: 'Events',       icon: Calendar,  render: () => <AdminEvents /> },
    { key: 'celebrities',  label: 'Celebrities',  icon: Users,     render: () => <AdminCelebrities /> },
    { key: 'applications', label: 'Applications', icon: Handshake, render: () => <AdminApplications /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Shield size={14} className="text-[#A78BFA]" />
          <p className="text-[#7C3AED] text-xs font-bold tracking-widest uppercase">Admin</p>
        </div>
        <h1 className="text-3xl font-black text-white">Admin Console</h1>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 bg-[#13132A] border border-[rgba(124,58,237,0.15)] rounded-xl p-1 mb-8 overflow-x-auto scrollbar-hide">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`shrink-0 flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === t.key
                ? 'bg-[rgba(124,58,237,0.2)] text-[#A78BFA] border border-[rgba(124,58,237,0.3)]'
                : 'text-[#A0A0C0] hover:text-white'
            }`}
          >
            <t.icon size={15} />
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {TABS.find((t) => t.key === tab)?.render()}
    </div>
  );
}
