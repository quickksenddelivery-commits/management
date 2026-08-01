import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Loader, AlertCircle } from 'lucide-react';
import { api, ApiError } from '../../lib/api';
import { loadCelebrities } from '../../lib/content';
import type { Event, Celebrity } from '../../types';
import { formatDate } from '../../lib/format';
import { useToast } from '../../components/ui/ToastProvider';
import { useConfirm } from '../../components/ui/ConfirmDialog';

const STATUSES = ['upcoming', 'live', 'past', 'sold_out'] as const;

export default function AdminEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [celebs, setCelebs] = useState<Celebrity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const toast = useToast();
  const confirm = useConfirm();

  const load = async () => {
    setLoading(true); setError('');
    try {
      const [list, c] = await Promise.all([api.events.list({ limit: 200 }), loadCelebrities()]);
      setEvents(list.events);
      setCelebs(c);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not load events');
    }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string, title: string) => {
    const ok = await confirm({
      title: `Delete ${title}?`,
      description: 'This is permanent and cannot be undone.',
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!ok) return;
    try {
      await api.events.remove(id);
      setEvents((es) => es.filter((e) => e.id !== id));
      toast.success(`${title} deleted.`);
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Delete failed — unknown error.');
    }
  };

  const handleStatusChange = async (id: string, status: typeof STATUSES[number]) => {
    try {
      const updated = await api.events.update(id, { status });
      setEvents((es) => es.map((e) => e.id === id ? updated : e));
      toast.success(`Status updated to "${status}".`);
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Status update failed — unknown error.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader size={28} className="text-[#A78BFA] animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h2 className="text-xl font-bold text-white">Events ({events.length})</h2>
        <Link
          to="/admin/events/new"
          className="accent-btn flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-bold"
        >
          <Plus size={15} /> New Event
        </Link>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-[#EF4444] text-sm flex items-center gap-2">
          <AlertCircle size={15} /> {error}
        </div>
      )}

      <div className="bg-[#13132A] border border-[rgba(124,58,237,0.2)] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[rgba(124,58,237,0.08)] border-b border-[rgba(124,58,237,0.15)] text-left">
                <th className="px-4 py-3 text-[#A0A0C0] font-semibold text-xs uppercase tracking-wider">Event</th>
                <th className="px-4 py-3 text-[#A0A0C0] font-semibold text-xs uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-[#A0A0C0] font-semibold text-xs uppercase tracking-wider">City</th>
                <th className="px-4 py-3 text-[#A0A0C0] font-semibold text-xs uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-[#A0A0C0] font-semibold text-xs uppercase tracking-wider">Featured</th>
                <th className="px-4 py-3 text-right text-[#A0A0C0] font-semibold text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((ev) => {
                const celeb = celebs.find((c) => c.id === ev.celebrityId);
                return (
                  <tr key={ev.id} className="border-b border-[rgba(124,58,237,0.1)] last:border-0">
                    <td className="px-4 py-3">
                      <p className="text-white font-bold truncate max-w-[260px]">{ev.title}</p>
                      <p className="text-[#6060A0] text-xs">{celeb?.name ?? ev.celebrityId} · {ev.category}</p>
                    </td>
                    <td className="px-4 py-3 text-[#A0A0C0] whitespace-nowrap">{formatDate(ev.date)}</td>
                    <td className="px-4 py-3 text-[#A0A0C0]">{ev.city}</td>
                    <td className="px-4 py-3">
                      <select
                        value={ev.status}
                        onChange={(e) => handleStatusChange(ev.id, e.target.value as typeof STATUSES[number])}
                        className="bg-[#1C1C3A] border border-[rgba(124,58,237,0.25)] rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
                      >
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      {ev.isFeatured ? <span className="text-[#FCD34D] text-xs font-bold">★ Yes</span> : <span className="text-[#6060A0] text-xs">No</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-2">
                        <Link
                          to={`/admin/events/${ev.id}/edit`}
                          className="p-2 rounded-lg bg-[rgba(124,58,237,0.12)] text-[#A78BFA] hover:bg-[rgba(124,58,237,0.22)] transition-all"
                          title="Edit"
                          aria-label={`Edit ${ev.title}`}
                        >
                          <Pencil size={14} />
                        </Link>
                        <button onClick={() => handleDelete(ev.id, ev.title)} className="p-2 rounded-lg bg-[rgba(239,68,68,0.1)] text-[#EF4444] hover:bg-[rgba(239,68,68,0.2)] transition-all" title="Delete" aria-label={`Delete ${ev.title}`}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
