import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useStore } from '../store/useStore';
import Reveal from '../components/motion/Reveal';
import { useSeo } from '../components/seo/useSeo';
import { useToast } from '../components/ui/ToastProvider';

export default function Login() {
  useSeo({ title: 'Sign In', description: 'Sign in to FanConnectPro to access your tickets and experiences.', path: '/login' });
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useStore();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: string })?.from;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      // Respect explicit `from` (deep-linked protected route);
      // otherwise route admins straight to the Admin Console.
      const role = useStore.getState().user?.role;
      const target = from ?? (role === 'admin' ? '/admin' : '/dashboard');
      navigate(target, { replace: true });
    } else {
      setError(result.error ?? 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      {/* Background glow */}
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#7C3AED]/8 blur-[120px] pointer-events-none" />

      <Reveal className="w-full max-w-md relative" y={20}>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white mb-2">Welcome back</h1>
          <p className="text-[#A0A0C0]">Sign in to access your tickets and experiences</p>
        </div>

        <div className="bg-[#13132A] border border-[rgba(124,58,237,0.25)] rounded-3xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="px-4 py-3 rounded-xl bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-[#EF4444] text-sm animate-shake">
                {error}
              </div>
            )}

            <div>
              <label className="block text-[#A0A0C0] text-sm font-medium mb-2">Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-[#1C1C3A] border border-[rgba(124,58,237,0.2)] rounded-xl px-4 py-3 text-white placeholder-[#6060A0] focus:outline-none focus:border-[#7C3AED] text-sm transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[#A0A0C0] text-sm font-medium">Password</label>
                <button
                  type="button"
                  onClick={() => toast.info('Password reset is coming in Stage 2. For now, contact support to reset your password.')}
                  className="text-[#A78BFA] hover:text-white text-xs font-semibold transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  required
                  className="w-full bg-[#1C1C3A] border border-[rgba(124,58,237,0.2)] rounded-xl px-4 py-3 pr-11 text-white placeholder-[#6060A0] focus:outline-none focus:border-[#7C3AED] text-sm transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6060A0] hover:text-[#A0A0C0] transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-xl font-bold text-white transition-all ${
                loading ? 'bg-[#7C3AED]/50 cursor-wait' : 'accent-btn'
              }`}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[rgba(124,58,237,0.15)] text-center">
            <p className="text-[#A0A0C0] text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-[#A78BFA] hover:text-white font-semibold transition-colors">
                Create one free
              </Link>
            </p>
          </div>

        </div>
      </Reveal>
    </div>
  );
}
