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
import Admin from './pages/admin/Admin';
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

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Kick off backend session hydration immediately so it's done by the time
    // the 5s splash finishes — the main app drops in already authenticated.
    useStore.getState().initAuth();
    const t = setTimeout(() => setReady(true), 5000);
    return () => clearTimeout(t);
  }, []);

  if (!ready) return <AppLoader />;

  return (
    <div className="app-reveal">
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="events" element={<Events />} />
          <Route path="events/:id" element={<EventDetail />} />
          <Route path="celebrities" element={<Celebrities />} />
          <Route path="celebrity/:id" element={<CelebrityProfile />} />
          <Route path="sponsorship" element={<Sponsorship />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="profile" element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="orders/:id" element={<RequireAuth><OrderDetail /></RequireAuth>} />
          <Route path="checkout" element={<RequireAuth><Checkout /></RequireAuth>} />
          <Route path="admin" element={<RequireAdmin><Admin /></RequireAdmin>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </div>
  );
}
