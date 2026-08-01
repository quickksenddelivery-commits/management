import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, Menu, X, Zap, User, LogOut, Home, Calendar, Users, Handshake, Shield } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useStore, useCartCount } from '../../store/useStore';

const LINK_ICONS: Record<string, typeof Home> = {
  '/': Home, '/events': Calendar, '/celebrities': Users, '/sponsorship': Handshake, '/admin': Shield,
};

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useStore();
  const cartCount = useCartCount();

  // Bump the cart icon whenever an item is added (count goes up).
  const [cartBump, setCartBump] = useState(false);
  const prevCartCount = useRef(cartCount);
  useEffect(() => {
    if (cartCount > prevCartCount.current) {
      setCartBump(true);
      const t = setTimeout(() => setCartBump(false), 400);
      prevCartCount.current = cartCount;
      return () => clearTimeout(t);
    }
    prevCartCount.current = cartCount;
  }, [cartCount]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    navigate(`/events?search=${encodeURIComponent(q)}`);
    setSearchOpen(false);
    setSearchQuery('');
  };

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
    ...(user?.role === 'admin' ? [{ to: '/admin', label: 'Admin' }] : []),
  ];

  const isActive = (to: string) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[#0D0D1A]/92 backdrop-blur-sm border-b border-[rgba(124,58,237,0.25)] shadow-[0_8px_32px_rgba(0,0,0,0.4)]'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-2.5 shrink-0 min-w-0 group">
            <div className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 bg-[#7C3AED] rounded-xl flex items-center justify-center shadow-[0_0_16px_rgba(124,58,237,0.55)] group-hover:shadow-[0_0_24px_rgba(124,58,237,0.75)] transition-shadow duration-300">
              <Zap size={16} className="text-white fill-white" />
            </div>
            <div className="flex flex-col leading-none min-w-0">
              <span className="text-xs tracking-tight sm:text-base sm:tracking-[0.2em] font-black text-white whitespace-nowrap">FANCONNECTPRO</span>
              <span className="hidden sm:block text-[8px] text-[#7C3AED] font-bold tracking-[0.15em] uppercase">Celebrity Events</span>
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
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label={searchOpen ? 'Close search' : 'Search'}
              aria-expanded={searchOpen}
              className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg transition-all ${
                searchOpen ? 'bg-[rgba(124,58,237,0.2)] text-[#A78BFA]' : 'text-[#A0A0C0] hover:text-white hover:bg-white/6'
              }`}
            >
              <Search size={17} />
            </button>

            <Link
              to="/checkout"
              aria-label={`View cart${cartCount > 0 ? ` (${cartCount} item${cartCount > 1 ? 's' : ''})` : ''}`}
              className="relative w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg text-[#A0A0C0] hover:text-white hover:bg-white/6 transition-all"
            >
              <ShoppingCart size={17} className={cartBump ? 'animate-cart-bump' : ''} />
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
                  aria-label="Sign out"
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
              className="md:hidden w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg text-[#A0A0C0] hover:text-white"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <form onSubmit={handleSearch} className="pb-3 bg-[#0D0D1A]/98 backdrop-blur-sm animate-menu-drop">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events, celebrities, cities..."
              className="w-full bg-[#13132A] border border-[rgba(124,58,237,0.35)] rounded-xl px-4 py-3 text-white placeholder-[#6060A0] focus:outline-none focus:border-[#7C3AED] text-sm transition-colors"
              autoFocus
            />
          </form>
        )}

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="md:hidden overflow-hidden border-t border-[rgba(124,58,237,0.15)] bg-[#0D0D1A]/98 backdrop-blur-sm shadow-[0_16px_32px_rgba(0,0,0,0.4)]"
            >
              <nav className="pt-3 pb-2 px-2 space-y-1">
                {links.map((link, i) => {
                  const Icon = LINK_ICONS[link.to] ?? Home;
                  const active = isActive(link.to);
                  return (
                    <motion.div
                      key={link.to}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.2 }}
                    >
                      <Link
                        to={link.to}
                        className={`relative flex items-center gap-3 pl-4 pr-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                          active ? 'text-[#A78BFA] bg-[rgba(124,58,237,0.12)]' : 'text-[#A0A0C0] hover:text-white hover:bg-white/4'
                        }`}
                      >
                        {active && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-full bg-[#7C3AED] shadow-[0_0_8px_rgba(124,58,237,0.6)]" />
                        )}
                        <Icon size={16} className={active ? 'text-[#A78BFA]' : 'text-[#6060A0]'} />
                        {link.label}
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              <div className="mx-2 mt-2 pt-3 pb-3 border-t border-[rgba(124,58,237,0.12)] px-2">
                <p className="px-2 mb-2 text-[#6060A0] text-[10px] font-bold tracking-widest uppercase">Account</p>
                {user ? (
                  <>
                    <div className="flex items-center gap-3 px-2 py-2 mb-1">
                      {user.avatar ? (
                        <img src={user.avatar} alt="" className="w-9 h-9 rounded-xl object-cover border border-[rgba(124,58,237,0.3)] shrink-0" />
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-[rgba(124,58,237,0.2)] border border-[rgba(124,58,237,0.3)] flex items-center justify-center text-sm font-black text-[#A78BFA] shrink-0">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-white text-sm font-semibold truncate">{user.name}</p>
                        <p className="text-[#6060A0] text-xs truncate">{user.email}</p>
                      </div>
                    </div>
                    <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-[#A0A0C0] hover:text-white hover:bg-white/4 transition-all">
                      <User size={16} className="text-[#6060A0]" /> My Dashboard
                    </Link>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-[#EF4444] hover:bg-[rgba(239,68,68,0.08)] transition-all">
                      <LogOut size={16} /> Sign Out
                    </button>
                  </>
                ) : (
                  <Link to="/login" className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl accent-btn text-white text-sm font-bold">
                    Sign In
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
