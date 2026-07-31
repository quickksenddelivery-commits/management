import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Users, Save, AlertCircle, Loader, Trash2 } from 'lucide-react';
import { api, ApiError } from '../../lib/api';
import ImagePicker from '../../components/common/ImagePicker';
import type { Celebrity, CelebrityCategory } from '../../types';
import { CATEGORY_LABELS } from '../../types';

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

export default function CelebrityForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<CelebFormData>(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (!isEdit || !id) return;
    let alive = true;
    (async () => {
      setLoading(true); setLoadError('');
      try {
        const c = await api.celebrities.get(id);
        if (!alive) return;
        if (!c) setLoadError('Celebrity not found.');
        else setForm(toFormData(c));
      } catch (e) {
        if (alive) setLoadError(e instanceof ApiError ? e.message : 'Could not load.');
      }
      if (alive) setLoading(false);
    })();
    return () => { alive = false; };
  }, [id, isEdit]);

  const set = <K extends keyof CelebFormData>(k: K, v: CelebFormData[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.image || !form.coverImage) {
      setError('Name, image and cover image URL are required.');
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
      if (isEdit && id) await api.celebrities.update(id, payload);
      else await api.celebrities.create(payload);
      navigate('/admin?tab=celebrities', { replace: true });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Save failed');
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!isEdit || !id) return;
    if (!confirm(`Delete "${form.name}"? Events that reference this celebrity will keep the orphan id.`)) return;
    setSaving(true);
    try {
      await api.celebrities.remove(id);
      navigate('/admin?tab=celebrities', { replace: true });
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
        <Link to="/admin?tab=celebrities" className="accent-btn px-6 py-3 rounded-xl text-white font-semibold">
          Back to Admin
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
      <Link
        to="/admin?tab=celebrities"
        className="inline-flex items-center gap-2 text-[#A0A0C0] hover:text-white text-sm font-medium mb-6 transition-colors"
      >
        <ArrowLeft size={15} /> Back to Celebrities
      </Link>

      <div className="mb-8 flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-[rgba(124,58,237,0.15)] border border-[rgba(124,58,237,0.35)] flex items-center justify-center">
          <Users size={20} className="text-[#A78BFA]" />
        </div>
        <div>
          <p className="text-[#7C3AED] text-xs font-bold tracking-widest uppercase mb-0.5">Admin · Celebrities</p>
          <h1 className="text-3xl font-black text-white">{isEdit ? 'Edit Celebrity' : 'New Celebrity'}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#13132A] border border-[rgba(124,58,237,0.2)] rounded-3xl p-6 sm:p-8 space-y-5">
        {error && (
          <div className="px-4 py-3 rounded-xl bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-[#EF4444] text-sm flex items-start gap-2 animate-shake">
            <AlertCircle size={15} className="shrink-0 mt-0.5" /> {error}
          </div>
        )}

        {/* Live preview */}
        {form.image && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(124,58,237,0.15)]">
            <img
              src={form.image}
              alt=""
              className="w-14 h-14 rounded-xl object-cover object-top border border-[rgba(124,58,237,0.3)]"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
            <div className="min-w-0">
              <p className="text-white font-bold text-sm truncate">{form.name || 'New celebrity'}</p>
              <p className="text-[#A78BFA] text-xs">{CATEGORY_LABELS[form.category]}</p>
              <p className="text-[#6060A0] text-xs">{form.nationality}{form.genre ? ` · ${form.genre}` : ''}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Name *">
            <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)} className={inputCls} required />
          </Field>
          <Field label="Category *">
            <select value={form.category} onChange={(e) => set('category', e.target.value as CelebrityCategory)} className={inputCls}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c] ?? c}</option>)}
            </select>
          </Field>
          <div className="sm:col-span-2">
            <ImagePicker
              label="Portrait"
              required
              folder="celebrities"
              previewAspect="aspect-[3/4] max-w-xs mx-auto sm:mx-0"
              value={form.image}
              onChange={(url) => set('image', url)}
              hint="Vertical portrait used across cards and the profile page."
            />
          </div>
          <div className="sm:col-span-2">
            <ImagePicker
              label="Cover banner"
              required
              folder="celebrities"
              previewAspect="aspect-[3/1]"
              value={form.coverImage}
              onChange={(url) => set('coverImage', url)}
              hint="Wide banner shown at the top of the celebrity profile page."
            />
          </div>
          <Field label="Nationality">
            <input type="text" value={form.nationality} onChange={(e) => set('nationality', e.target.value)} className={inputCls} />
          </Field>
          <Field label="Genre">
            <input type="text" value={form.genre} onChange={(e) => set('genre', e.target.value)} placeholder="e.g. Pop / R&B" className={inputCls} />
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
              <textarea rows={5} value={form.bio} onChange={(e) => set('bio', e.target.value)} className={`${inputCls} resize-none`} />
            </Field>
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
            to="/admin?tab=celebrities"
            className="px-5 py-3 rounded-xl border border-[rgba(124,58,237,0.3)] text-[#A0A0C0] hover:text-white font-medium text-sm transition-all"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white transition-all ${saving ? 'bg-[#7C3AED]/50 cursor-wait' : 'accent-btn'}`}
          >
            <Save size={15} /> {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Celebrity'}
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
