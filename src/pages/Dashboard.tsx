import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Ticket, Heart, Users, Calendar, MapPin, QrCode, X, Receipt, Settings, Handshake, Shield } from 'lucide-react';
import type { Order } from '../lib/api';
import type { SponsorshipApplication } from '../types';
import { useStore } from '../store/useStore';
import { api } from '../lib/api';
import { useApiData } from '../hooks/useApiData';
import { formatDate, formatPrice } from '../lib/format';
import { loadSavedEvents, loadFollowing } from '../lib/content';
import { withFallback, celebrityPortrait } from '../lib/images';
import type { Ticket as TicketType, Event as EventType, Celebrity as CelebrityType } from '../types';
import EventCard from '../components/common/EventCard';

type Tab = 'tickets' | 'orders' | 'applications' | 'saved' | 'following';

const ORDER_STATUS_STYLES: Record<string, string> = {
  pending:   'bg-amber-500/15 text-amber-300 border-amber-500/30',
  paid:      'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  cancelled: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
  expired:   'bg-red-500/15 text-red-400 border-red-500/30',
};

const APPLICATION_STATUS_STYLES: Record<string, string> = {
  pending:   'bg-amber-500/15 text-amber-300 border-amber-500/30',
  reviewing: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  approved:  'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
};

function QRModal({ ticket, onClose }: { ticket: TicketType; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative bg-[#13132A] border border-[rgba(124,58,237,0.3)] rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-[#A0A0C0] hover:text-white">
          <X size={20} />
        </button>

        <div className="mb-4">
          <p className="text-[#A78BFA] text-xs font-semibold tracking-widest uppercase mb-1">Your Ticket</p>
          <h3 className="text-white font-bold text-lg leading-tight">{ticket.eventTitle}</h3>
          <p className="text-[#A0A0C0] text-sm mt-1">{ticket.tierName}</p>
        </div>

        <div className="bg-white rounded-2xl p-4 mb-4 inline-block">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${ticket.qrCode}&bgcolor=ffffff&color=000000`}
            alt="Ticket QR Code"
            className="w-40 h-40"
          />
        </div>

        <p className="font-mono text-[#A78BFA] text-xs mb-4 break-all">{ticket.qrCode}</p>

        <div className="space-y-2 text-sm text-left">
          <div className="flex items-center gap-2 text-[#A0A0C0]">
            <Calendar size={14} className="text-[#7C3AED]" />
            <span>{formatDate(ticket.eventDate)}</span>
          </div>
          <div className="flex items-center gap-2 text-[#A0A0C0]">
            <MapPin size={14} className="text-[#7C3AED]" />
            <span>{ticket.eventVenue}, {ticket.eventCity}</span>
          </div>
          <div className="flex items-center gap-2 text-[#A0A0C0]">
            <Ticket size={14} className="text-[#7C3AED]" />
            <span>{ticket.attendeeName}</span>
          </div>
        </div>

        <div className="mt-4 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
          <p className="text-emerald-400 text-xs font-semibold">● Active Ticket</p>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, sponsorshipApplications: localApplications } = useStore();
  const [tab, setTab] = useState<Tab>('tickets');
  const [qrTicket, setQrTicket] = useState<TicketType | null>(null);

  // Live tickets from the API (falls back to locally-purchased tickets when offline).
  const tickets = useApiData<TicketType[]>(() => api.tickets.list(), user?.tickets ?? []);
  // Order history (only populated when the user signed in via the API; empty otherwise).
  const orders = useApiData<Order[]>(() => api.orders.list(), []);
  // Sponsorship applications the user submitted (server first, local store as fallback).
  const myApplications = useApiData<SponsorshipApplication[]>(
    () => api.sponsorship.myApplications(),
    localApplications.filter(a => a.email?.toLowerCase() === user?.email.toLowerCase())
  );
  // Saved events & followed celebrities — backend is the source of truth.
  const savedEventList = useApiData<EventType[]>(
    loadSavedEvents, [], [(user?.savedEvents ?? []).join(',')]
  );
  const followingCelebs = useApiData<CelebrityType[]>(
    loadFollowing, [], [(user?.following ?? []).join(',')]
  );

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <p className="text-6xl mb-4">🎫</p>
        <h2 className="text-2xl font-bold text-white mb-2">Sign in to view your dashboard</h2>
        <Link to="/login" className="mt-4 accent-btn px-6 py-3 rounded-xl text-white font-semibold">
          Sign In
        </Link>
      </div>
    );
  }

  const TABS: { key: Tab; label: string; icon: typeof Ticket; count: number }[] = [
    { key: 'tickets', label: 'My Tickets', icon: Ticket, count: tickets.length },
    { key: 'orders', label: 'My Orders', icon: Receipt, count: orders.length },
    { key: 'applications', label: 'Sponsorships', icon: Handshake, count: myApplications.length },
    { key: 'saved', label: 'Saved Events', icon: Heart, count: savedEventList.length },
    { key: 'following', label: 'Following', icon: Users, count: followingCelebs.length },
  ];

  return (
    <>
      {qrTicket && <QRModal ticket={qrTicket} onClose={() => setQrTicket(null)} />}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt=""
              className="w-14 h-14 rounded-2xl object-cover border border-[rgba(124,58,237,0.4)]"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-[rgba(124,58,237,0.2)] border border-[rgba(124,58,237,0.3)] flex items-center justify-center text-2xl font-black text-[#A78BFA]">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-white">Hey, {user.name.split(' ')[0]} 👋</h1>
              {user.role === 'admin' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase bg-[rgba(245,158,11,0.15)] border border-[rgba(245,158,11,0.4)] text-[#FCD34D]">
                  <Shield size={10} /> Admin
                </span>
              )}
            </div>
            <p className="text-[#A0A0C0] text-sm truncate">{user.email}</p>
          </div>
          <div className="shrink-0 hidden sm:flex items-center gap-2">
            {user.role === 'admin' && (
              <Link
                to="/admin"
                className="flex items-center gap-2 px-4 py-2 rounded-xl gold-btn text-sm font-bold"
              >
                <Shield size={14} /> Admin Console
              </Link>
            )}
            <Link
              to="/profile"
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[rgba(124,58,237,0.3)] text-[#A78BFA] hover:bg-[rgba(124,58,237,0.1)] transition-all text-sm font-semibold"
            >
              <Settings size={14} /> Edit Profile
            </Link>
          </div>
        </div>

        {/* Admin shortcut banner (mobile + reinforcement) */}
        {user.role === 'admin' && (
          <Link
            to="/admin"
            className="flex sm:hidden items-center justify-center gap-2 mb-6 px-4 py-3 rounded-xl gold-btn text-sm font-bold"
          >
            <Shield size={14} /> Open Admin Console
          </Link>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {TABS.map(t => (
            <div key={t.key} className="bg-[#13132A] border border-[rgba(124,58,237,0.2)] rounded-2xl p-4 text-center">
              <p className="text-2xl font-black gradient-text">{t.count}</p>
              <p className="text-[#A0A0C0] text-xs mt-1">{t.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#13132A] border border-[rgba(124,58,237,0.15)] rounded-xl p-1 mb-8">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                tab === t.key
                  ? 'bg-[rgba(124,58,237,0.2)] text-[#A78BFA] border border-[rgba(124,58,237,0.3)]'
                  : 'text-[#A0A0C0] hover:text-white'
              }`}
            >
              <t.icon size={15} />
              <span className="hidden sm:block">{t.label}</span>
              {t.count > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#7C3AED] text-white text-[10px] font-bold flex items-center justify-center">
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* My Tickets */}
        {tab === 'tickets' && (
          <div>
            {tickets.length === 0 ? (
              <div className="text-center py-16 bg-[#13132A] border border-[rgba(124,58,237,0.15)] rounded-2xl">
                <p className="text-5xl mb-4">🎫</p>
                <h3 className="text-white font-bold text-lg mb-2">No tickets yet</h3>
                <p className="text-[#A0A0C0] mb-6">Browse events and book your first experience</p>
                <Link to="/events" className="accent-btn px-6 py-3 rounded-xl text-white font-semibold">
                  Browse Events
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {tickets.map(ticket => (
                  <div key={ticket.id} className="bg-[#13132A] border border-[rgba(124,58,237,0.2)] rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-white font-bold truncate">{ticket.eventTitle}</p>
                        <span className="shrink-0 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold">
                          Active
                        </span>
                      </div>
                      <p className="text-[#A78BFA] text-sm font-medium mb-2">{ticket.tierName}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-[#A0A0C0]">
                        <span className="flex items-center gap-1"><Calendar size={11} /> {formatDate(ticket.eventDate)}</span>
                        <span className="flex items-center gap-1"><MapPin size={11} /> {ticket.eventVenue}, {ticket.eventCity}</span>
                        <span className="text-[#6060A0]">Holder: {ticket.attendeeName}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-white font-bold">{formatPrice(ticket.price, ticket.currency)}</p>
                      <button
                        onClick={() => setQrTicket(ticket)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[rgba(124,58,237,0.3)] text-[#A78BFA] text-sm font-medium hover:bg-[rgba(124,58,237,0.1)] transition-all"
                      >
                        <QrCode size={15} /> View QR
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* My Orders */}
        {tab === 'orders' && (
          <div>
            {orders.length === 0 ? (
              <div className="text-center py-16 bg-[#13132A] border border-[rgba(124,58,237,0.15)] rounded-2xl">
                <p className="text-5xl mb-4">🧾</p>
                <h3 className="text-white font-bold text-lg mb-2">No orders yet</h3>
                <p className="text-[#A0A0C0] mb-6">
                  When you complete a ticket purchase your order will appear here.
                </p>
                <Link to="/events" className="accent-btn px-6 py-3 rounded-xl text-white font-semibold">
                  Browse Events
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => {
                  const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);
                  const firstItem = order.items[0];
                  return (
                    <Link
                      key={order._id}
                      to={`/orders/${order._id}`}
                      className="block bg-[#13132A] border border-[rgba(124,58,237,0.2)] rounded-2xl p-5 hover:border-[rgba(124,58,237,0.45)] transition-all"
                    >
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <p className="text-white font-bold text-sm">Order {order.reference}</p>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${ORDER_STATUS_STYLES[order.status] ?? ''}`}>
                              {order.status.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-[#A78BFA] text-sm font-medium truncate">
                            {firstItem?.eventTitle}{order.items.length > 1 ? ` + ${order.items.length - 1} more` : ''}
                          </p>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-[#A0A0C0]">
                            <span className="flex items-center gap-1"><Calendar size={11} /> {formatDate(order.createdAt)}</span>
                            <span className="flex items-center gap-1"><Ticket size={11} /> {itemCount} ticket{itemCount > 1 ? 's' : ''}</span>
                            {order.paidAt && <span className="text-emerald-400">Paid {formatDate(order.paidAt)}</span>}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[#6060A0] text-[10px] uppercase tracking-wider">Total</p>
                          <p className="text-white font-black">{order.cryptoAmount} {order.coin.symbol}</p>
                          <p className="text-[#6060A0] text-xs">≈ ${order.usdTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                      </div>
                      {order.txHash && (
                        <p className="mt-3 pt-3 border-t border-[rgba(124,58,237,0.12)] text-[10px] text-[#6060A0] truncate">
                          tx: <code className="text-[#A78BFA]">{order.txHash}</code>
                        </p>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* My Sponsorship Applications */}
        {tab === 'applications' && (
          <div>
            {myApplications.length === 0 ? (
              <div className="text-center py-16 bg-[#13132A] border border-[rgba(124,58,237,0.15)] rounded-2xl">
                <p className="text-5xl mb-4">🤝</p>
                <h3 className="text-white font-bold text-lg mb-2">No sponsorship applications yet</h3>
                <p className="text-[#A0A0C0] mb-6">
                  Apply to sponsor an event or the platform and track your application status here.
                </p>
                <Link to="/sponsorship" className="accent-btn px-6 py-3 rounded-xl text-white font-semibold">
                  Become a Sponsor
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {myApplications.map(app => (
                  <div key={app.id} className="bg-[#13132A] border border-[rgba(124,58,237,0.2)] rounded-2xl p-5">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <p className="text-white font-bold text-sm">{app.companyName}</p>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${APPLICATION_STATUS_STYLES[app.status] ?? ''}`}>
                            {app.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[#A78BFA] text-sm font-medium">{app.packageName || 'Sponsorship Package'}</p>
                        <p className="text-[#6060A0] text-xs mt-1">
                          {app.eventId ? 'Event-specific sponsorship' : 'Platform-wide partnership'}
                        </p>
                        {app.message && (
                          <p className="text-[#A0A0C0] text-xs mt-2 line-clamp-2 italic">"{app.message}"</p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[#6060A0] text-[10px] uppercase tracking-wider">Submitted</p>
                        <p className="text-white text-sm font-semibold">{formatDate(app.submittedAt)}</p>
                        {app.budget && (
                          <p className="text-[#6060A0] text-xs mt-1">Budget: {app.budget}</p>
                        )}
                      </div>
                    </div>
                    {app.status === 'pending' && (
                      <p className="text-[#6060A0] text-xs mt-3 pt-3 border-t border-[rgba(124,58,237,0.12)]">
                        ⏳ Our partnerships team is reviewing your application — we'll be in touch within 48 hours.
                      </p>
                    )}
                    {app.status === 'reviewing' && (
                      <p className="text-blue-300 text-xs mt-3 pt-3 border-t border-[rgba(124,58,237,0.12)]">
                        🔎 Under active review — expect a follow-up email shortly.
                      </p>
                    )}
                    {app.status === 'approved' && (
                      <p className="text-emerald-400 text-xs mt-3 pt-3 border-t border-[rgba(124,58,237,0.12)]">
                        ✓ Approved — welcome to Rachead's partner network.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Saved Events */}
        {tab === 'saved' && (
          <div>
            {savedEventList.length === 0 ? (
              <div className="text-center py-16 bg-[#13132A] border border-[rgba(124,58,237,0.15)] rounded-2xl">
                <p className="text-5xl mb-4">❤️</p>
                <h3 className="text-white font-bold text-lg mb-2">No saved events</h3>
                <p className="text-[#A0A0C0] mb-6">Save events you're interested in to find them easily</p>
                <Link to="/events" className="accent-btn px-6 py-3 rounded-xl text-white font-semibold">
                  Browse Events
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {savedEventList.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Following */}
        {tab === 'following' && (
          <div>
            {followingCelebs.length === 0 ? (
              <div className="text-center py-16 bg-[#13132A] border border-[rgba(124,58,237,0.15)] rounded-2xl">
                <p className="text-5xl mb-4">🌟</p>
                <h3 className="text-white font-bold text-lg mb-2">Not following anyone yet</h3>
                <p className="text-[#A0A0C0] mb-6">Follow your favorite celebrities to stay updated</p>
                <Link to="/celebrities" className="accent-btn px-6 py-3 rounded-xl text-white font-semibold">
                  Discover Celebrities
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {followingCelebs.map(celeb => (
                  <Link key={celeb.id} to={`/celebrity/${celeb.id}`} className="block">
                    <div className="glow-card bg-[#13132A] rounded-2xl p-4 flex items-center gap-3">
                      <img
                        src={celeb.image}
                        alt={celeb.name}
                        {...withFallback(celeb._imageFallback ?? celebrityPortrait(celeb.name, celeb.category))}
                        className="w-12 h-12 rounded-xl object-cover object-top border border-[rgba(124,58,237,0.3)]"
                      />
                      <div className="min-w-0">
                        <p className="text-white font-semibold text-sm truncate">{celeb.name}</p>
                        <p className="text-[#A0A0C0] text-xs">{celeb.nationality}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
