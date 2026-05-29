import { Link } from 'react-router-dom';
import { Zap, Globe, Music, Radio, Wallet } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative bg-[#080812] border-t border-[rgba(124,58,237,0.15)] mt-0 overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-[#7C3AED]/6 blur-[100px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">

        {/* Top: Brand + links */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">

          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-5 group">
              <div className="w-10 h-10 bg-[#7C3AED] rounded-xl flex items-center justify-center shadow-[0_0_16px_rgba(124,58,237,0.5)] group-hover:shadow-[0_0_24px_rgba(124,58,237,0.7)] transition-shadow">
                <Zap size={18} className="text-white fill-white" />
              </div>
              <div>
                <p className="text-base font-black tracking-[0.2em] text-white">RACHEAD</p>
                <p className="text-[9px] text-[#7C3AED] font-bold tracking-[0.15em] uppercase">Celebrity Events</p>
              </div>
            </Link>
            <p className="text-[#6060A0] text-sm leading-relaxed mb-6 max-w-xs">
              The world's premier platform for celebrity events, VIP experiences, and unforgettable live moments.
            </p>
            <div className="flex items-center gap-3">
              {[
                { Icon: Globe, label: 'Web' },
                { Icon: Music, label: 'Music' },
                { Icon: Radio, label: 'Radio' },
              ].map(({ Icon, label }) => (
                <button
                  key={label}
                  aria-label={label}
                  className="w-10 h-10 rounded-xl bg-[rgba(124,58,237,0.08)] border border-[rgba(124,58,237,0.18)] flex items-center justify-center text-[#A0A0C0] hover:text-[#A78BFA] hover:border-[rgba(124,58,237,0.45)] hover:bg-[rgba(124,58,237,0.15)] hover:shadow-[0_0_12px_rgba(124,58,237,0.2)] transition-all"
                >
                  <Icon size={15} />
                </button>
              ))}
            </div>
          </div>

          {/* Discover */}
          <div>
            <h4 className="text-white font-black text-xs mb-5 tracking-[0.15em] uppercase">Discover</h4>
            <ul className="space-y-3">
              {[
                { label: 'Events', to: '/events' },
                { label: 'Celebrities', to: '/celebrities' },
                { label: 'Sponsorship', to: '/sponsorship' },
                { label: 'Cities', to: '/events' },
              ].map(item => (
                <li key={item.label}>
                  <Link to={item.to} className="text-[#6060A0] hover:text-[#A78BFA] text-sm transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-white font-black text-xs mb-5 tracking-[0.15em] uppercase">Account</h4>
            <ul className="space-y-3">
              {[
                { label: 'Sign In', to: '/login' },
                { label: 'Register', to: '/register' },
                { label: 'My Tickets', to: '/dashboard' },
                { label: 'Saved Events', to: '/dashboard' },
              ].map(item => (
                <li key={item.label}>
                  <Link to={item.to} className="text-[#6060A0] hover:text-[#A78BFA] text-sm transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-black text-xs mb-5 tracking-[0.15em] uppercase">Company</h4>
            <ul className="space-y-3">
              {['About Us', 'Contact', 'Privacy Policy', 'Terms of Service'].map(item => (
                <li key={item}>
                  <span className="text-[#6060A0] hover:text-[#A78BFA] text-sm transition-colors cursor-pointer">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-[rgba(124,58,237,0.3)] to-transparent mb-8" />

        {/* Crypto payment strip */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8 px-4 py-3 rounded-xl bg-[rgba(124,58,237,0.06)] border border-[rgba(124,58,237,0.15)]">
          <span className="flex items-center gap-2 text-[#A0A0C0] text-xs font-medium">
            <Wallet size={14} className="text-[#A78BFA]" />
            All payments are made in crypto
          </span>
          <span className="hidden sm:block w-px h-4 bg-[rgba(124,58,237,0.2)]" />
          <div className="flex items-center gap-2">
            {[
              { s: 'USDT', c: '#26A17B' }, { s: 'USDC', c: '#2775CA' }, { s: 'BTC', c: '#F7931A' },
              { s: 'ETH', c: '#627EEA' }, { s: 'BNB', c: '#F3BA2F' },
            ].map(coin => (
              <span key={coin.s} className="w-7 h-7 rounded-full flex items-center justify-center text-[8px] font-black text-white" style={{ background: coin.c }} title={coin.s}>
                {coin.s}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[#6060A0] text-xs">
            © 2026 <span className="text-[#A78BFA] font-semibold">RACHEAD</span>. All rights reserved.
          </p>
          <p className="text-[#6060A0] text-xs">
            Built for <span className="text-[#A78BFA]">celebrities</span> and their fans worldwide.
          </p>
        </div>
      </div>
    </footer>
  );
}
