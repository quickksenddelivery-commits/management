import { useState } from 'react';
import { Calendar, Users, Handshake, Shield, LogOut, Eye, EyeOff, KeyRound } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { getAdminSecret, setAdminSecret, clearAdminSecret } from '../../lib/api';
import AdminEvents from './AdminEvents';
import AdminCelebrities from './AdminCelebrities';
import AdminApplications from './AdminApplications';

type AdminTab = 'events' | 'celebrities' | 'applications';

export default function Admin() {
  const { user } = useStore();
  const [secret, setSecret] = useState(getAdminSecret() ?? '');
  const [secretInput, setSecretInput] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [tab, setTab] = useState<AdminTab>('events');

  const authenticated = !!secret;

  const handleAuthenticate = () => {
    if (!secretInput.trim()) return;
    setAdminSecret(secretInput.trim());
    setSecret(secretInput.trim());
    setSecretInput('');
  };

  const handleLockout = () => {
    clearAdminSecret();
    setSecret('');
  };

  // ── Secret gate ──
  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pt-24 pb-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[rgba(124,58,237,0.15)] border border-[rgba(124,58,237,0.35)] mb-5">
              <Shield size={28} className="text-[#A78BFA]" />
            </div>
            <h1 className="text-3xl font-black text-white mb-2">Admin Console</h1>
            <p className="text-[#A0A0C0] text-sm">Enter your admin secret to continue.</p>
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); handleAuthenticate(); }}
            className="bg-[#13132A] border border-[rgba(124,58,237,0.25)] rounded-3xl p-7 space-y-5"
          >
            <div>
              <label className="block text-[#A0A0C0] text-sm font-medium mb-2">Admin secret</label>
              <div className="relative">
                <KeyRound size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6060A0]" />
                <input
                  type={showSecret ? 'text' : 'password'}
                  value={secretInput}
                  onChange={(e) => setSecretInput(e.target.value)}
                  autoFocus
                  placeholder="Enter the ADMIN_SECRET value"
                  className="w-full bg-[#1C1C3A] border border-[rgba(124,58,237,0.2)] rounded-xl pl-10 pr-11 py-3 text-white placeholder-[#6060A0] focus:outline-none focus:border-[#7C3AED] text-sm font-mono transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6060A0] hover:text-[#A0A0C0]"
                >
                  {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="text-[#6060A0] text-xs mt-2">
                This must match the <code className="text-[#A78BFA]">ADMIN_SECRET</code> in the backend's <code>.env</code>.
                It's sent as the <code>x-admin-secret</code> header on every admin request.
              </p>
            </div>
            <button
              type="submit"
              disabled={!secretInput.trim()}
              className={`w-full py-3.5 rounded-xl font-bold text-white transition-all ${
                secretInput.trim() ? 'accent-btn' : 'bg-[#1C1C3A] text-[#6060A0] cursor-not-allowed'
              }`}
            >
              Authenticate
            </button>
            {user?.role && user.role !== 'admin' && (
              <p className="text-amber-300 text-xs text-center">
                Your account role is <span className="font-bold">{user.role}</span> — admin endpoints will still reject your requests until your role is upgraded.
              </p>
            )}
          </form>
        </div>
      </div>
    );
  }

  // ── Authenticated shell ──
  const TABS: { key: AdminTab; label: string; icon: typeof Calendar; render: () => React.ReactNode }[] = [
    { key: 'events',       label: 'Events',       icon: Calendar,  render: () => <AdminEvents /> },
    { key: 'celebrities',  label: 'Celebrities',  icon: Users,     render: () => <AdminCelebrities /> },
    { key: 'applications', label: 'Applications', icon: Handshake, render: () => <AdminApplications /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield size={14} className="text-[#A78BFA]" />
            <p className="text-[#7C3AED] text-xs font-bold tracking-widest uppercase">Admin</p>
          </div>
          <h1 className="text-3xl font-black text-white">Admin Console</h1>
        </div>
        <button
          onClick={handleLockout}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[rgba(239,68,68,0.3)] text-[#EF4444] hover:bg-[rgba(239,68,68,0.08)] text-sm font-semibold transition-all"
        >
          <LogOut size={14} /> Clear Admin Secret
        </button>
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
