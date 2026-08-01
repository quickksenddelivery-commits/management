import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Save, AlertCircle, Loader, Trash2, Plus, Ticket } from 'lucide-react';
import { api, ApiError } from '../../lib/api';
import type { EventInput } from '../../lib/api';
import { loadCelebrities } from '../../lib/content';
import ImagePicker from '../../components/common/ImagePicker';
import { useToast } from '../../components/ui/ToastProvider';
import { useConfirm } from '../../components/ui/ConfirmDialog';
import type { Event, Celebrity, CelebrityCategory, TierLevel } from '../../types';

const CATEGORIES: CelebrityCategory[] = ['musician', 'dj', 'comedian', 'actor', 'athlete', 'influencer', 'pastor', 'politician'];
const STATUSES = ['upcoming', 'live', 'past', 'sold_out'] as const;
const TIER_LEVELS: TierLevel[] = ['general', 'vip', 'vvip', 'meetgreet'];

interface TierFormData {
  name: string;
  tier: TierLevel;
  price: string;
  currency: string;
  total: string;
  available: string;
  perks: string;
}

const emptyTier = (): TierFormData => ({
  name: '', tier: 'general', price: '0', currency: 'USD', total: '100', available: '100', perks: '',
});

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
  ticketTiers: TierFormData[];
}

const emptyForm: EventFormData = {
  title: '', subtitle: '', celebrityId: '', category: 'musician',
  date: '', venue: '', city: '', country: '',
  image: '', description: '', status: 'upcoming', isFeatured: false,
  ticketTiers: [emptyTier()],
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
    ticketTiers: ev.ticketTiers.length
      ? ev.ticketTiers.map((t) => ({
          name: t.name,
          tier: t.tier,
          price: String(t.price),
          currency: t.currency,
          total: String(t.total),
          available: String(t.available),
          perks: t.perks.join(', '),
        }))
      : [emptyTier()],
  };
}

export default function EventForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<EventFormData>(emptyForm);
  const [celebs, setCelebs] = useState<Celebrity[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState('');
  const toast = useToast();
  const confirm = useConfirm();

  // Load celebrities for the dropdown + the event itself (edit mode)
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true); setLoadError('');
      try {
        const [celebList, event] = await Promise.all([
          loadCelebrities(),
          isEdit && id ? api.events.get(id) : Promise.resolve(undefined),
        ]);
        if (!alive) return;
        setCelebs(celebList);
        if (isEdit) {
          if (!event) setLoadError('Event not found.');
          else setForm(toFormData(event));
        }
      } catch (e) {
        if (alive) setLoadError(e instanceof ApiError ? e.message : 'Could not load.');
      }
      if (alive) setLoading(false);
    })();
    return () => { alive = false; };
  }, [id, isEdit]);

  const set = <K extends keyof EventFormData>(k: K, v: EventFormData[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const setTier = <K extends keyof TierFormData>(index: number, k: K, v: TierFormData[K]) =>
    setForm((f) => ({
      ...f,
      ticketTiers: f.ticketTiers.map((t, i) => (i === index ? { ...t, [k]: v } : t)),
    }));

  const addTier = () => setForm((f) => ({ ...f, ticketTiers: [...f.ticketTiers, emptyTier()] }));

  const removeTier = (index: number) =>
    setForm((f) => ({ ...f, ticketTiers: f.ticketTiers.filter((_, i) => i !== index) }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.title || !form.celebrityId || !form.date || !form.venue || !form.city || !form.country || !form.image) {
      setError('Title, celebrity, date & time, venue, city, country, and image URL are required.');
      return;
    }
    const validTiers = form.ticketTiers.filter((t) => t.name.trim());
    if (validTiers.length === 0) {
      setError('Add at least one ticket tier with a name — otherwise nobody can buy tickets to this event.');
      return;
    }
    setSaving(true);
    try {
      const payload: EventInput = {
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
        ticketTiers: validTiers.map((t) => ({
          name: t.name.trim(),
          tier: t.tier,
          price: Number(t.price) || 0,
          currency: t.currency.trim().toUpperCase() || 'USD',
          total: Number(t.total) || 0,
          available: Number(t.available) || 0,
          perks: t.perks.split(',').map((p) => p.trim()).filter(Boolean),
        })),
      };
      if (isEdit && id) await api.events.update(id, payload);
      else await api.events.create(payload);
      toast.success(isEdit ? 'Event updated.' : 'Event created.');
      navigate('/admin?tab=events', { replace: true });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Save failed');
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!isEdit || !id) return;
    const ok = await confirm({
      title: `Delete ${form.title}?`,
      description: 'This is permanent and cannot be undone.',
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!ok) return;
    setSaving(true);
    try {
      await api.events.remove(id);
      toast.success('Event deleted.');
      navigate('/admin?tab=events', { replace: true });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Delete failed');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 pt-24">
        <Loader size={32} className="text-[#A78BFA] animate-spin mb-4" />
        <p className="text-[#A0A0C0]">Loading…</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 pt-24">
        <AlertCircle size={40} className="text-[#EF4444] mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Could not load</h2>
        <p className="text-[#A0A0C0] mb-6">{loadError}</p>
        <Link to="/admin?tab=events" className="accent-btn px-6 py-3 rounded-xl text-white font-semibold">
          Back to Admin
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
      <Link
        to="/admin?tab=events"
        className="inline-flex items-center gap-2 text-[#A0A0C0] hover:text-white text-sm font-medium mb-6 transition-colors"
      >
        <ArrowLeft size={15} /> Back to Events
      </Link>

      <div className="mb-8 flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-[rgba(124,58,237,0.15)] border border-[rgba(124,58,237,0.35)] flex items-center justify-center">
          <Calendar size={20} className="text-[#A78BFA]" />
        </div>
        <div>
          <p className="text-[#7C3AED] text-xs font-bold tracking-widest uppercase mb-0.5">Admin · Events</p>
          <h1 className="text-3xl font-black text-white">{isEdit ? 'Edit Event' : 'New Event'}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#13132A] border border-[rgba(124,58,237,0.2)] rounded-3xl p-6 sm:p-8 space-y-5">
        {error && (
          <div className="px-4 py-3 rounded-xl bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-[#EF4444] text-sm flex items-start gap-2 animate-shake">
            <AlertCircle size={15} className="shrink-0 mt-0.5" /> {error}
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
              {celebs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Category *">
            <select value={form.category} onChange={(e) => set('category', e.target.value as CelebrityCategory)} className={inputCls}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Date & time *">
            <input type="datetime-local" value={form.date} onChange={(e) => set('date', e.target.value)} className={inputCls} required />
          </Field>
          <Field label="Status">
            <select value={form.status} onChange={(e) => set('status', e.target.value as typeof STATUSES[number])} className={inputCls}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
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
          <div className="sm:col-span-2">
            <ImagePicker
              label="Event poster"
              required
              folder="events"
              previewAspect="aspect-video"
              value={form.image}
              onChange={(url) => set('image', url)}
              hint="Wide poster shown across cards and the event detail banner."
            />
          </div>
          <div className="sm:col-span-2">
            <Field label="Description">
              <textarea rows={4} value={form.description} onChange={(e) => set('description', e.target.value)} className={`${inputCls} resize-none`} />
            </Field>
          </div>
          <label className="sm:col-span-2 flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isFeatured} onChange={(e) => set('isFeatured', e.target.checked)} className="w-4 h-4 accent-[#7C3AED]" />
            <span className="text-[#A0A0C0] text-sm">Feature this event on the homepage</span>
          </label>
        </div>

        {/* Ticket tiers */}
        <div className="pt-5 border-t border-[rgba(124,58,237,0.15)]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Ticket size={16} className="text-[#A78BFA]" />
              <h3 className="text-white font-bold text-sm">Ticket Tiers *</h3>
            </div>
            <button
              type="button"
              onClick={addTier}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[rgba(124,58,237,0.12)] border border-[rgba(124,58,237,0.3)] text-[#A78BFA] hover:bg-[rgba(124,58,237,0.22)] text-xs font-bold transition-all"
            >
              <Plus size={13} /> Add Tier
            </button>
          </div>

          <div className="space-y-4">
            {form.ticketTiers.map((t, i) => (
              <div key={i} className="bg-[#1C1C3A] border border-[rgba(124,58,237,0.2)] rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[#6060A0] text-xs font-bold uppercase tracking-wider">Tier {i + 1}</span>
                  {form.ticketTiers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTier(i)}
                      className="text-[#EF4444] hover:text-red-300 transition-colors"
                      aria-label={`Remove tier ${i + 1}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <Field label="Name *">
                    <input type="text" value={t.name} onChange={(e) => setTier(i, 'name', e.target.value)} placeholder="e.g. General" className={inputCls} />
                  </Field>
                  <Field label="Tier level">
                    <select value={t.tier} onChange={(e) => setTier(i, 'tier', e.target.value as TierLevel)} className={inputCls}>
                      {TIER_LEVELS.map((lvl) => <option key={lvl} value={lvl}>{lvl}</option>)}
                    </select>
                  </Field>
                  <Field label="Currency">
                    <input type="text" value={t.currency} onChange={(e) => setTier(i, 'currency', e.target.value.toUpperCase())} maxLength={3} className={inputCls} />
                  </Field>
                  <Field label="Price">
                    <input type="number" min={0} step="0.01" value={t.price} onChange={(e) => setTier(i, 'price', e.target.value)} className={inputCls} />
                  </Field>
                  <Field label="Total seats">
                    <input type="number" min={0} value={t.total} onChange={(e) => setTier(i, 'total', e.target.value)} className={inputCls} />
                  </Field>
                  <Field label="Available now">
                    <input type="number" min={0} value={t.available} onChange={(e) => setTier(i, 'available', e.target.value)} className={inputCls} />
                  </Field>
                  <div className="col-span-2 sm:col-span-3">
                    <Field label="Perks (comma-separated)">
                      <input type="text" value={t.perks} onChange={(e) => setTier(i, 'perks', e.target.value)} placeholder="e.g. VIP lounge, Dedicated entrance" className={inputCls} />
                    </Field>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-5 border-t border-[rgba(124,58,237,0.15)]">
          {isEdit && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-3 rounded-xl border border-[rgba(239,68,68,0.35)] text-[#EF4444] hover:bg-[rgba(239,68,68,0.08)] font-medium text-sm transition-all"
            >
              <Trash2 size={14} /> Delete
            </button>
          )}
          <Link
            to="/admin?tab=events"
            className="px-5 py-3 rounded-xl border border-[rgba(124,58,237,0.3)] text-[#A0A0C0] hover:text-white font-medium text-sm transition-all"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white transition-all ${saving ? 'bg-[#7C3AED]/50 cursor-wait' : 'accent-btn'}`}
          >
            <Save size={15} /> {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Event'}
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
