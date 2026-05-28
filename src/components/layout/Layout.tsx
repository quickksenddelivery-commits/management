import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);
  return null;
}

export default function Layout() {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen flex flex-col bg-[#0D0D1A]">
      <ScrollToTop />
      <Navbar />
      <main key={pathname} className="flex-1 page-enter">
        <Outlet />
      </main>
      <Footer />
      <div className="grain-overlay" />
    </div>
  );
}
