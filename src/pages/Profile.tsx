import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User as UserIcon, ArrowLeft, Check } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function Profile() {
  const navigate = useNavigate();
  const { user, updateProfile } = useStore();

  const [name, setName] = useState(user?.name ?? '');
  const [avatar, setAvatar] = useState(user?.avatar ?? '');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 pt-24">
        <p className="text-6xl mb-4">👤</p>
        <h2 className="text-2xl font-bold text-white mb-2">Sign in to edit your profile</h2>
        <Link to="/login" className="mt-4 accent-btn px-6 py-3 rounded-xl text-white font-semibold">Sign In</Link>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('Name is required.'); return; }
    setLoading(true);
    try {
      await updateProfile({ name: name.trim(), avatar: avatar.trim() || undefined });
      setSaved(true);
      setTimeout(() => setSaved(false), 2200);
    } catch {
      setError('Could not save changes. Please try again.');
    }
    setLoading(false);
  };

  const previewAvatar = avatar.trim() || user.avatar;
  const initial = name.trim().charAt(0).toUpperCase() || 'U';

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-[#A0A0C0] hover:text-white text-sm font-medium mb-6 transition-colors"
      >
        <ArrowLeft size={15} /> Back
      </button>

      <div className="mb-8">
        <p className="text-[#7C3AED] text-xs font-bold tracking-widest uppercase mb-2">Account</p>
        <h1 className="text-3xl font-black text-white">Edit Profile</h1>
        <p className="text-[#A0A0C0] text-sm mt-1">Update how you appear on Rachead.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#13132A] border border-[rgba(124,58,237,0.25)] rounded-3xl p-6 sm:p-8 space-y-6">
        {/* Avatar preview */}
        <div className="flex items-center gap-5">
          {previewAvatar ? (
            <img
              src={previewAvatar}
              alt=""
              className="w-20 h-20 rounded-2xl object-cover border border-[rgba(124,58,237,0.4)]"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-[rgba(124,58,237,0.2)] border border-[rgba(124,58,237,0.4)] flex items-center justify-center text-3xl font-black text-[#A78BFA]">
              {initial}
            </div>
          )}
          <div>
            <p className="text-white font-bold">{name || 'Your name'}</p>
            <p className="text-[#6060A0] text-sm">{user.email}</p>
          </div>
        </div>

        {error && (
          <div className="px-4 py-3 rounded-xl bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-[#EF4444] text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-[#A0A0C0] text-sm font-medium mb-2">Display name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
            className="w-full bg-[#1C1C3A] border border-[rgba(124,58,237,0.2)] rounded-xl px-4 py-3 text-white placeholder-[#6060A0] focus:outline-none focus:border-[#7C3AED] text-sm transition-colors"
          />
        </div>

        <div>
          <label className="block text-[#A0A0C0] text-sm font-medium mb-2">Avatar URL <span className="text-[#6060A0] font-normal">(optional)</span></label>
          <input
            type="url"
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
            placeholder="https://…/avatar.jpg"
            className="w-full bg-[#1C1C3A] border border-[rgba(124,58,237,0.2)] rounded-xl px-4 py-3 text-white placeholder-[#6060A0] focus:outline-none focus:border-[#7C3AED] text-sm transition-colors"
          />
          <p className="text-[#6060A0] text-xs mt-1.5">Paste any public image URL. Direct upload comes in Stage 2.</p>
        </div>

        <div className="pt-2 flex items-center gap-3">
          <Link
            to="/dashboard"
            className="px-5 py-3 rounded-xl border border-[rgba(124,58,237,0.3)] text-[#A0A0C0] hover:text-white font-medium text-sm transition-all"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading || saved}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white transition-all ${
              loading ? 'bg-[#7C3AED]/50 cursor-wait' : saved ? 'bg-emerald-600' : 'accent-btn'
            }`}
          >
            {saved ? <><Check size={16} /> Saved</> : loading ? 'Saving…' : <><UserIcon size={15} /> Save Changes</>}
          </button>
        </div>
      </form>
    </div>
  );
}
