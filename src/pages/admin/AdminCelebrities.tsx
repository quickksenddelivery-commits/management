import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import { api, ApiError } from '../../lib/api';
import type { Celebrity } from '../../types';
import { CATEGORY_LABELS } from '../../types';
import { formatFollowers } from '../../lib/format';

export default function AdminCelebrities() {
  const [celebs, setCelebs] = useState<Celebrity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      setCelebs((cs) => cs.filter((c) => c.id !== id));
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
        <Link
          to="/admin/celebrities/new"
          className="accent-btn flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-bold"
        >
          <Plus size={15} /> New Celebrity
        </Link>
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
              <img
                src={c.image}
                alt={c.name}
                className="w-14 h-14 rounded-xl object-cover object-top border border-[rgba(124,58,237,0.3)] shrink-0"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              />
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
                <Link
                  to={`/admin/celebrities/${c.id}/edit`}
                  className="p-2 rounded-lg bg-[rgba(124,58,237,0.12)] text-[#A78BFA] hover:bg-[rgba(124,58,237,0.22)] transition-all"
                  title="Edit"
                  aria-label={`Edit ${c.name}`}
                >
                  <Pencil size={14} />
                </Link>
                <button onClick={() => handleDelete(c.id, c.name)} className="p-2 rounded-lg bg-[rgba(239,68,68,0.1)] text-[#EF4444] hover:bg-[rgba(239,68,68,0.2)] transition-all" title="Delete" aria-label={`Delete ${c.name}`}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
