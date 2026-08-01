import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import AppLoader from './components/AppLoader';
import Home from './pages/Home';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import Celebrities from './pages/Celebrities';
import CelebrityProfile from './pages/CelebrityProfile';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Checkout from './pages/Checkout';
import Sponsorship from './pages/Sponsorship';
import Profile from './pages/Profile';
import OrderDetail from './pages/OrderDetail';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Admin from './pages/admin/Admin';
import EventForm from './pages/admin/EventForm';
import CelebrityForm from './pages/admin/CelebrityForm';
import { ToastProvider } from './components/ui/ToastProvider';
import { ConfirmProvider } from './components/ui/ConfirmDialog';
import { useStore } from './store/useStore';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user } = useStore();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user } = useStore();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return <>{children}</>;
}

// Minimum splash time so the logo doesn't just flash on fast connections —
// not a fake progress bar, just enough to read as intentional branding.
const MIN_SPLASH_MS = 700;

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const start = Date.now();
    useStore.getState().initAuth().finally(() => {
      if (!alive) return;
      const elapsed = Date.now() - start;
      timeoutId = setTimeout(() => { if (alive) setReady(true); }, Math.max(0, MIN_SPLASH_MS - elapsed));
    });
    return () => { alive = false; clearTimeout(timeoutId); };
  }, []);

  if (!ready) return <AppLoader />;

  return (
    <div className="app-reveal">
    <ToastProvider>
    <ConfirmProvider>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="events" element={<Events />} />
          <Route path="events/:id" element={<EventDetail />} />
          <Route path="celebrities" element={<Celebrities />} />
          <Route path="celebrity/:id" element={<CelebrityProfile />} />
          <Route path="sponsorship" element={<Sponsorship />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="terms" element={<Terms />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="profile" element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="orders/:id" element={<RequireAuth><OrderDetail /></RequireAuth>} />
          <Route path="checkout" element={<RequireAuth><Checkout /></RequireAuth>} />
          <Route path="admin" element={<RequireAdmin><Admin /></RequireAdmin>} />
          <Route path="admin/events/new" element={<RequireAdmin><EventForm /></RequireAdmin>} />
          <Route path="admin/events/:id/edit" element={<RequireAdmin><EventForm /></RequireAdmin>} />
          <Route path="admin/celebrities/new" element={<RequireAdmin><CelebrityForm /></RequireAdmin>} />
          <Route path="admin/celebrities/:id/edit" element={<RequireAdmin><CelebrityForm /></RequireAdmin>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </ConfirmProvider>
    </ToastProvider>
    </div>
  );
}
