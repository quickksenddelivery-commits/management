import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Plus, Pencil, Trash2, Save, XCircle, Loader, AlertCircle, Calendar } from 'lucide-react';
import { api, ApiError } from '../../lib/api';
import { loadCelebrities } from '../../lib/content';
import type { Event, Celebrity, CelebrityCategory } from '../../types';
import { formatDate } from '../../data/mock';

const CATEGORIES: CelebrityCategory[] = ['musician', 'dj', 'comedian', 'actor', 'athlete', 'influencer', 'pastor', 'politician'];
const STATUSES = ['upcoming', 'live', 'past', 'sold_out'] as const;

interface EventFormData {
  title: string;
  subtitle: string;
  celebrityId: string;
  category: CelebrityCategory;
  date: string;
  venue: string;
  city: string;
  country: string;
  image: string;
  description: string;
  status: typeof STATUSES[number];
  isFeatured: boolean;
}

const emptyForm: EventFormData = {
  title: '', subtitle: '', celebrityId: '', category: 'musician',
  date: '', venue: '', city: '', country: '',
  image: '', description: '', status: 'upcoming', isFeatured: false,
};

function toFormData(ev: Event): EventFormData {
  return {
    title: ev.title,
    subtitle: ev.subtitle ?? '',
    celebrityId: ev.celebrityId,
    category: ev.category,
    date: ev.date ? new Date(ev.date).toISOString().slice(0, 16) : '',
    venue: ev.venue,
    city: ev.city,
    country: ev.country,
    image: ev.image,
    description: ev.description ?? '',
    status: ev.status,
    isFeatured: ev.isFeatured,
  };
}

export default function AdminEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [celebs, setCelebs] = useState<Celebrity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editing, setEditing] = useState<Event | null>(null);
  const [creating, setCreating] = useState(false);

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
    if (!confirm(`Delete "${title}"? This is permanent.`)) return;
    try {
      await api.events.remove(id);
      setEvents(events.filter(e => e.id !== id));
    } catch (e) {
      alert(`Delete failed: ${e instanceof ApiError ? e.message : 'unknown error'}`);
    }
  };

  const handleStatusChange = async (id: string, status: typeof STATUSES[number]) => {
    try {
      const updated = await api.events.update(id, { status });
      setEvents(events.map(e => e.id === id ? updated : e));
    } catch (e) {
      alert(`Status update failed: ${e instanceof ApiError ? e.message : 'unknown error'}`);
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
        <button
          onClick={() => setCreating(true)}
          className="accent-btn flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-bold"
        >
          <Plus size={15} /> New Event
        </button>
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
              {events.map(ev => {
                const celeb = celebs.find(c => c.id === ev.celebrityId);
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
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      {ev.isFeatured ? <span className="text-[#FCD34D] text-xs font-bold">★ Yes</span> : <span className="text-[#6060A0] text-xs">No</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-2">
                        <button onClick={() => setEditing(ev)} className="p-2 rounded-lg bg-[rgba(124,58,237,0.12)] text-[#A78BFA] hover:bg-[rgba(124,58,237,0.22)] transition-all" title="Edit">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDelete(ev.id, ev.title)} className="p-2 rounded-lg bg-[rgba(239,68,68,0.1)] text-[#EF4444] hover:bg-[rgba(239,68,68,0.2)] transition-all" title="Delete">
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

      {(editing || creating) && (
        <EventFormModal
          initial={editing ? toFormData(editing) : emptyForm}
          editingId={editing?.id ?? null}
          celebs={celebs}
          onClose={() => { setEditing(null); setCreating(false); }}
          onSaved={async () => { setEditing(null); setCreating(false); await load(); }}
        />
      )}
    </div>
  );
}

/* ── Edit / Create Modal ── */
function EventFormModal({
  initial, editingId, celebs, onClose, onSaved,
}: {
  initial: EventFormData;
  editingId: string | null;
  celebs: Celebrity[];
  onClose: () => void;
  onSaved: () => Promise<void> | void;
}) {
  const [form, setForm] = useState<EventFormData>(initial);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const set = <K extends keyof EventFormData>(k: K, v: EventFormData[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErr('');
    if (!form.title || !form.celebrityId || !form.venue || !form.city || !form.country || !form.image) {
      setErr('Title, celebrity, venue, city, country, and image URL are required.');
      return;
    }
    setSaving(true);
    try {
      const payload: Partial<Event> = {
        title: form.title.trim(),
        subtitle: form.subtitle.trim() || undefined,
        celebrityId: form.celebrityId,
        category: form.category,
        date: form.date ? new Date(form.date).toISOString() : undefined,
        venue: form.venue.trim(),
        city: form.city.trim(),
        country: form.country.trim(),
        image: form.image.trim(),
        description: form.description.trim(),
        status: form.status,
        isFeatured: form.isFeatured,
      };
      if (editingId) await api.events.update(editingId, payload);
      else await api.events.create(payload);
      await onSaved();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Save failed');
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-[#13132A] border border-[rgba(124,58,237,0.3)] rounded-3xl p-6 sm:p-8 max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-[#A78BFA]" />
            <h3 className="text-white font-bold text-lg">{editingId ? 'Edit Event' : 'New Event'}</h3>
          </div>
          <button type="button" onClick={onClose} className="text-[#A0A0C0] hover:text-white">
            <XCircle size={20} />
          </button>
        </div>

        {err && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-[#EF4444] text-sm">
            {err}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Title *">
            <input type="text" value={form.title} onChange={(e) => set('title', e.target.value)} className={inputCls} required />
          </Field>
          <Field label="Subtitle">
            <input type="text" value={form.subtitle} onChange={(e) => set('subtitle', e.target.value)} className={inputCls} />
          </Field>
          <Field label="Celebrity *">
            <select value={form.celebrityId} onChange={(e) => set('celebrityId', e.target.value)} className={inputCls} required>
              <option value="">— select —</option>
              {celebs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Category *">
            <select value={form.category} onChange={(e) => set('category', e.target.value as CelebrityCategory)} className={inputCls}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Date & time">
            <input type="datetime-local" value={form.date} onChange={(e) => set('date', e.target.value)} className={inputCls} />
          </Field>
          <Field label="Status">
            <select value={form.status} onChange={(e) => set('status', e.target.value as typeof STATUSES[number])} className={inputCls}>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Venue *">
            <input type="text" value={form.venue} onChange={(e) => set('venue', e.target.value)} className={inputCls} required />
          </Field>
          <Field label="City *">
            <input type="text" value={form.city} onChange={(e) => set('city', e.target.value)} className={inputCls} required />
          </Field>
          <Field label="Country *">
            <input type="text" value={form.country} onChange={(e) => set('country', e.target.value)} className={inputCls} required />
          </Field>
          <Field label="Image URL *">
            <input type="url" value={form.image} onChange={(e) => set('image', e.target.value)} className={inputCls} required />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Description">
              <textarea rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} className={`${inputCls} resize-none`} />
            </Field>
          </div>
          <label className="sm:col-span-2 flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isFeatured} onChange={(e) => set('isFeatured', e.target.checked)} className="w-4 h-4 accent-[#7C3AED]" />
            <span className="text-[#A0A0C0] text-sm">Feature this event on the homepage</span>
          </label>
        </div>

        <div className="flex items-center gap-3 mt-6 pt-5 border-t border-[rgba(124,58,237,0.15)]">
          <button type="button" onClick={onClose} className="px-5 py-3 rounded-xl border border-[rgba(124,58,237,0.3)] text-[#A0A0C0] hover:text-white font-medium text-sm transition-all">
            Cancel
          </button>
          <button type="submit" disabled={saving} className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white transition-all ${saving ? 'bg-[#7C3AED]/50 cursor-wait' : 'accent-btn'}`}>
            <Save size={15} /> {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Create Event'}
          </button>
        </div>
      </form>
    </div>
  );
}

const inputCls = 'w-full bg-[#1C1C3A] border border-[rgba(124,58,237,0.2)] rounded-xl px-3.5 py-2.5 text-white placeholder-[#6060A0] focus:outline-none focus:border-[#7C3AED] text-sm transition-colors';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[#A0A0C0] text-xs font-medium mb-1.5">{label}</span>
      {children}
    </label>
  );
}
