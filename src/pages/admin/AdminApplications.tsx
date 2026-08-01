import { useEffect, useState } from 'react';
import { Loader, AlertCircle, Mail, Phone, Building2, Calendar } from 'lucide-react';
import { api, ApiError } from '../../lib/api';
import type { SponsorshipApplication } from '../../types';
import { formatDate } from '../../lib/format';
import { useToast } from '../../components/ui/ToastProvider';

const STATUSES = ['pending', 'reviewing', 'approved'] as const;
type Status = typeof STATUSES[number];

const STATUS_STYLES: Record<Status, string> = {
  pending:   'bg-amber-500/15 text-amber-300 border-amber-500/30',
  reviewing: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  approved:  'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
};

const FILTER_OPTIONS: ('all' | Status)[] = ['all', 'pending', 'reviewing', 'approved'];

export default function AdminApplications() {
  const [apps, setApps] = useState<SponsorshipApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | Status>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const toast = useToast();

  const load = async () => {
    setLoading(true); setError('');
    try {
      const list = await api.sponsorship.listApplications();
      setApps(list);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not load applications');
    }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleStatusChange = async (id: string, status: Status) => {
    setUpdatingId(id);
    try {
      const updated = await api.sponsorship.updateApplication(id, status);
      setApps(apps.map(a => (a.id ?? (a as unknown as { _id: string })._id) === id ? updated : a));
      toast.success(`Application status updated to "${status}".`);
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Update failed — unknown error.');
    }
    setUpdatingId(null);
  };

  const filtered = filter === 'all' ? apps : apps.filter(a => a.status === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader size={28} className="text-[#A78BFA] animate-spin" />
      </div>
    );
  }

  const counts = {
    all: apps.length,
    pending: apps.filter(a => a.status === 'pending').length,
    reviewing: apps.filter(a => a.status === 'reviewing').length,
    approved: apps.filter(a => a.status === 'approved').length,
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h2 className="text-xl font-bold text-white">Sponsorship Applications</h2>
        <div className="flex gap-1.5">
          {FILTER_OPTIONS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                filter === f
                  ? 'bg-[rgba(124,58,237,0.2)] border-[rgba(124,58,237,0.5)] text-[#A78BFA]'
                  : 'bg-transparent border-[rgba(124,58,237,0.2)] text-[#A0A0C0] hover:text-white'
              }`}
            >
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f]})
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-[#EF4444] text-sm flex items-center gap-2">
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-[#13132A] border border-[rgba(124,58,237,0.15)] rounded-2xl">
          <p className="text-5xl mb-4">📋</p>
          <p className="text-white font-bold text-lg mb-2">No applications {filter !== 'all' ? `with status "${filter}"` : 'yet'}</p>
          <p className="text-[#A0A0C0] text-sm">As sponsors apply, you'll review and approve them here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(app => {
            const appId = app.id ?? (app as unknown as { _id: string })._id;
            const status = app.status as Status;
            return (
              <div key={appId} className="bg-[#13132A] border border-[rgba(124,58,237,0.2)] rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Building2 size={14} className="text-[#A78BFA]" />
                      <p className="text-white font-bold">{app.companyName}</p>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_STYLES[status] ?? ''}`}>
                        {status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[#A78BFA] text-sm font-semibold">{app.packageName || 'Sponsorship'}</p>
                    <p className="text-[#6060A0] text-xs mt-0.5">
                      {app.eventId ? `Event sponsorship: ${app.eventId}` : 'Platform-wide partnership'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[#6060A0] text-[10px] uppercase tracking-wider">Submitted</p>
                    <p className="text-white text-sm font-semibold whitespace-nowrap flex items-center gap-1 justify-end">
                      <Calendar size={11} className="text-[#7C3AED]" />
                      {formatDate(app.submittedAt ?? (app as unknown as { createdAt: string }).createdAt)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3 pt-3 border-t border-[rgba(124,58,237,0.12)] text-xs">
                  <div>
                    <p className="text-[#6060A0] mb-0.5">Contact</p>
                    <p className="text-white font-semibold">{app.contactName}</p>
                  </div>
                  {app.budget && (
                    <div>
                      <p className="text-[#6060A0] mb-0.5">Budget</p>
                      <p className="text-white font-semibold">{app.budget}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-[#A0A0C0]">
                    <Mail size={11} className="text-[#7C3AED]" />
                    <a href={`mailto:${app.email}`} className="hover:text-[#A78BFA] transition-colors truncate">{app.email}</a>
                  </div>
                  {app.phone && (
                    <div className="flex items-center gap-2 text-[#A0A0C0]">
                      <Phone size={11} className="text-[#7C3AED]" />
                      <a href={`tel:${app.phone}`} className="hover:text-[#A78BFA] transition-colors">{app.phone}</a>
                    </div>
                  )}
                </div>

                {app.message && (
                  <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(124,58,237,0.1)] rounded-xl p-3 mb-3">
                    <p className="text-[#6060A0] text-[10px] uppercase tracking-wider mb-1">Message</p>
                    <p className="text-[#A0A0C0] text-xs leading-relaxed italic">"{app.message}"</p>
                  </div>
                )}

                {/* Status update */}
                <div className="flex items-center gap-2 pt-3 border-t border-[rgba(124,58,237,0.12)]">
                  <span className="text-[#6060A0] text-xs uppercase tracking-wider font-semibold">Set status:</span>
                  {STATUSES.map(s => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(appId, s)}
                      disabled={updatingId === appId || status === s}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        status === s
                          ? 'bg-[rgba(124,58,237,0.2)] border-[rgba(124,58,237,0.5)] text-[#A78BFA] cursor-default'
                          : 'bg-transparent border-[rgba(124,58,237,0.2)] text-[#A0A0C0] hover:text-white hover:border-[rgba(124,58,237,0.4)]'
                      } ${updatingId === appId ? 'opacity-50' : ''}`}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
