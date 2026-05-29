import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, Menu, X, Zap, User, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useStore, useCartCount } from '../../store/useStore';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useStore();
  const cartCount = useCartCount();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  const links = [
    { to: '/', label: 'Home' },
    { to: '/events', label: 'Events' },
    { to: '/celebrities', label: 'Celebrities' },
    { to: '/sponsorship', label: 'Sponsorship' },
  ];

  const isActive = (to: string) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[#0D0D1A]/92 backdrop-blur-2xl border-b border-[rgba(124,58,237,0.25)] shadow-[0_8px_32px_rgba(0,0,0,0.4)]'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-9 h-9 bg-[#7C3AED] rounded-xl flex items-center justify-center shadow-[0_0_16px_rgba(124,58,237,0.55)] group-hover:shadow-[0_0_24px_rgba(124,58,237,0.75)] transition-shadow duration-300">
              <Zap size={17} className="text-white fill-white" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-base font-black tracking-[0.2em] text-white">RACHEAD</span>
              <span className="text-[8px] text-[#7C3AED] font-bold tracking-[0.15em] uppercase">Celebrity Events</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`relative px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  isActive(link.to)
                    ? 'text-[#A78BFA]'
                    : 'text-[#A0A0C0] hover:text-white'
                }`}
              >
                {link.label}
                {isActive(link.to) && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-[#7C3AED]" />
                )}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all ${
                searchOpen ? 'bg-[rgba(124,58,237,0.2)] text-[#A78BFA]' : 'text-[#A0A0C0] hover:text-white hover:bg-white/6'
              }`}
            >
              <Search size={17} />
            </button>

            <Link
              to="/checkout"
              className="relative w-9 h-9 flex items-center justify-center rounded-lg text-[#A0A0C0] hover:text-white hover:bg-white/6 transition-all"
            >
              <ShoppingCart size={17} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-[#7C3AED] rounded-full flex items-center justify-center text-white text-[10px] font-black px-1 shadow-[0_0_8px_rgba(124,58,237,0.6)]">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center gap-1">
                <Link
                  to="/dashboard"
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[rgba(124,58,237,0.12)] border border-[rgba(124,58,237,0.3)] text-[#A78BFA] hover:bg-[rgba(124,58,237,0.2)] transition-all text-sm font-semibold"
                >
                  <User size={13} />
                  {user.name.split(' ')[0]}
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-9 h-9 flex items-center justify-center rounded-lg text-[#A0A0C0] hover:text-[#EF4444] hover:bg-[rgba(239,68,68,0.1)] transition-all"
                  title="Sign out"
                >
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden sm:flex accent-btn items-center px-5 py-2 rounded-xl text-white text-sm font-bold"
              >
                Sign In
              </Link>
            )}

            <button
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-[#A0A0C0] hover:text-white"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="pb-3 animate-fade-in">
            <input
              type="text"
              placeholder="Search events, celebrities, cities..."
              className="w-full bg-[#13132A] border border-[rgba(124,58,237,0.35)] rounded-xl px-4 py-3 text-white placeholder-[#6060A0] focus:outline-none focus:border-[#7C3AED] text-sm transition-colors"
              autoFocus
            />
          </div>
        )}

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-[rgba(124,58,237,0.15)] pt-3 space-y-1 animate-fade-in">
            {links.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`block px-4 py-3 rounded-xl text-sm font-semibold ${
                  isActive(link.to)
                    ? 'text-[#A78BFA] bg-[rgba(124,58,237,0.12)]'
                    : 'text-[#A0A0C0] hover:text-white hover:bg-white/4'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link to="/dashboard" className="block px-4 py-3 rounded-xl text-sm font-semibold text-[#A0A0C0] hover:text-white">My Dashboard</Link>
                <button onClick={handleLogout} className="block w-full text-left px-4 py-3 rounded-xl text-sm font-semibold text-[#EF4444]">Sign Out</button>
              </>
            ) : (
              <Link to="/login" className="block px-4 py-3 mt-2 rounded-xl accent-btn text-white text-sm font-bold text-center">Sign In</Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
