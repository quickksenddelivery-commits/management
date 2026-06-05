import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Plus, Pencil, Trash2, Save, XCircle, Loader, AlertCircle, Users, CheckCircle } from 'lucide-react';
import { api, ApiError } from '../../lib/api';
import type { Celebrity, CelebrityCategory } from '../../types';
import { CATEGORY_LABELS } from '../../types';
import { formatFollowers } from '../../lib/format';

const CATEGORIES: CelebrityCategory[] = ['musician', 'dj', 'comedian', 'actor', 'athlete', 'influencer', 'pastor', 'politician'];

interface CelebFormData {
  name: string;
  category: CelebrityCategory;
  image: string;
  coverImage: string;
  verified: boolean;
  followers: number;
  bio: string;
  nationality: string;
  genre: string;
}

const emptyForm: CelebFormData = {
  name: '', category: 'musician', image: '', coverImage: '',
  verified: false, followers: 0, bio: '', nationality: '', genre: '',
};

function toFormData(c: Celebrity): CelebFormData {
  return {
    name: c.name,
    category: c.category,
    image: c.image,
    coverImage: c.coverImage,
    verified: c.verified,
    followers: c.followers,
    bio: c.bio,
    nationality: c.nationality,
    genre: c.genre ?? '',
  };
}

export default function AdminCelebrities() {
  const [celebs, setCelebs] = useState<Celebrity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editing, setEditing] = useState<Celebrity | null>(null);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const list = await api.celebrities.list({ limit: 200 });
      setCelebs(list.celebrities);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not load celebrities');
    }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? Their events will keep referencing this id.`)) return;
    try {
      await api.celebrities.remove(id);
      setCelebs(celebs.filter(c => c.id !== id));
    } catch (e) {
      alert(`Delete failed: ${e instanceof ApiError ? e.message : 'unknown error'}`);
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
        <h2 className="text-xl font-bold text-white">Celebrities ({celebs.length})</h2>
        <button onClick={() => setCreating(true)} className="accent-btn flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-bold">
          <Plus size={15} /> New Celebrity
        </button>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-[#EF4444] text-sm flex items-center gap-2">
          <AlertCircle size={15} /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {celebs.map((c) => (
          <div key={c.id} className="bg-[#13132A] border border-[rgba(124,58,237,0.2)] rounded-2xl p-4">
            <div className="flex items-start gap-3 mb-3">
              <img src={c.image} alt={c.name} className="w-14 h-14 rounded-xl object-cover object-top border border-[rgba(124,58,237,0.3)] shrink-0" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1 mb-0.5">
                  <p className="text-white font-bold text-sm truncate">{c.name}</p>
                  {c.verified && <CheckCircle size={12} className="text-[#7C3AED] fill-[#7C3AED] shrink-0" />}
                </div>
                <p className="text-[#A78BFA] text-xs">{CATEGORY_LABELS[c.category]}</p>
                <p className="text-[#6060A0] text-xs mt-0.5">{c.nationality}{c.genre ? ` · ${c.genre}` : ''}</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-[rgba(124,58,237,0.12)]">
              <div>
                <p className="text-[#6060A0] text-[10px] uppercase tracking-wider">Followers</p>
                <p className="text-white font-bold text-sm">{formatFollowers(c.followers)}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditing(c)} className="p-2 rounded-lg bg-[rgba(124,58,237,0.12)] text-[#A78BFA] hover:bg-[rgba(124,58,237,0.22)] transition-all" title="Edit">
                  <Pencil size={14} />
                </button>
                <button onClick={() => handleDelete(c.id, c.name)} className="p-2 rounded-lg bg-[rgba(239,68,68,0.1)] text-[#EF4444] hover:bg-[rgba(239,68,68,0.2)] transition-all" title="Delete">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {(editing || creating) && (
        <CelebFormModal
          initial={editing ? toFormData(editing) : emptyForm}
          editingId={editing?.id ?? null}
          onClose={() => { setEditing(null); setCreating(false); }}
          onSaved={async () => { setEditing(null); setCreating(false); await load(); }}
        />
      )}
    </div>
  );
}

function CelebFormModal({
  initial, editingId, onClose, onSaved,
}: {
  initial: CelebFormData;
  editingId: string | null;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
}) {
  const [form, setForm] = useState<CelebFormData>(initial);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const set = <K extends keyof CelebFormData>(k: K, v: CelebFormData[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErr('');
    if (!form.name || !form.image || !form.coverImage) {
      setErr('Name, image and cover image URL are required.');
      return;
    }
    setSaving(true);
    try {
      const payload: Partial<Celebrity> = {
        name: form.name.trim(),
        category: form.category,
        image: form.image.trim(),
        coverImage: form.coverImage.trim(),
        verified: form.verified,
        followers: Number(form.followers) || 0,
        bio: form.bio.trim(),
        nationality: form.nationality.trim(),
        genre: form.genre.trim() || undefined,
      };
      if (editingId) await api.celebrities.update(editingId, payload);
      else await api.celebrities.create(payload);
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
            <Users size={18} className="text-[#A78BFA]" />
            <h3 className="text-white font-bold text-lg">{editingId ? 'Edit Celebrity' : 'New Celebrity'}</h3>
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
          <Field label="Name *">
            <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)} className={inputCls} required />
          </Field>
          <Field label="Category *">
            <select value={form.category} onChange={(e) => set('category', e.target.value as CelebrityCategory)} className={inputCls}>
              {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c] ?? c}</option>)}
            </select>
          </Field>
          <Field label="Image URL *">
            <input type="url" value={form.image} onChange={(e) => set('image', e.target.value)} className={inputCls} required />
          </Field>
          <Field label="Cover Image URL *">
            <input type="url" value={form.coverImage} onChange={(e) => set('coverImage', e.target.value)} className={inputCls} required />
          </Field>
          <Field label="Nationality">
            <input type="text" value={form.nationality} onChange={(e) => set('nationality', e.target.value)} className={inputCls} />
          </Field>
          <Field label="Genre">
            <input type="text" value={form.genre} onChange={(e) => set('genre', e.target.value)} placeholder="e.g. Afrobeats / R&B" className={inputCls} />
          </Field>
          <Field label="Followers">
            <input type="number" min={0} value={form.followers} onChange={(e) => set('followers', Number(e.target.value))} className={inputCls} />
          </Field>
          <label className="flex items-center gap-2 cursor-pointer pt-7">
            <input type="checkbox" checked={form.verified} onChange={(e) => set('verified', e.target.checked)} className="w-4 h-4 accent-[#7C3AED]" />
            <span className="text-[#A0A0C0] text-sm">Verified account</span>
          </label>
          <div className="sm:col-span-2">
            <Field label="Bio">
              <textarea rows={4} value={form.bio} onChange={(e) => set('bio', e.target.value)} className={`${inputCls} resize-none`} />
            </Field>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6 pt-5 border-t border-[rgba(124,58,237,0.15)]">
          <button type="button" onClick={onClose} className="px-5 py-3 rounded-xl border border-[rgba(124,58,237,0.3)] text-[#A0A0C0] hover:text-white font-medium text-sm transition-all">
            Cancel
          </button>
          <button type="submit" disabled={saving} className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white transition-all ${saving ? 'bg-[#7C3AED]/50 cursor-wait' : 'accent-btn'}`}>
            <Save size={15} /> {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Create Celebrity'}
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
