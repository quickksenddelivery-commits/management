import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Eye, EyeOff } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await register(name, email, password);
    setLoading(false);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error ?? 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#7C3AED]/8 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-[#7C3AED] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.5)]">
              <Zap size={20} className="text-white fill-white" />
            </div>
            <span className="text-2xl font-black tracking-widest text-white">RACHEAD</span>
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Create account</h1>
          <p className="text-[#A0A0C0]">Join millions of fans on the premier celebrity platform</p>
        </div>

        <div className="bg-[#13132A] border border-[rgba(124,58,237,0.25)] rounded-3xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="px-4 py-3 rounded-xl bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-[#EF4444] text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-[#A0A0C0] text-sm font-medium mb-2">Full name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your full name"
                required
                className="w-full bg-[#1C1C3A] border border-[rgba(124,58,237,0.2)] rounded-xl px-4 py-3 text-white placeholder-[#6060A0] focus:outline-none focus:border-[#7C3AED] text-sm transition-colors"
              />
            </div>

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
              <label className="block text-[#A0A0C0] text-sm font-medium mb-2">Password</label>
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
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[rgba(124,58,237,0.15)] text-center">
            <p className="text-[#A0A0C0] text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-[#A78BFA] hover:text-white font-semibold transition-colors">
                Sign in
              </Link>
            </p>
          </div>

          <p className="mt-4 text-center text-[#6060A0] text-xs">
            By creating an account you agree to our{' '}
            <span className="text-[#A78BFA] cursor-pointer">Terms of Service</span> and{' '}
            <span className="text-[#A78BFA] cursor-pointer">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
}
