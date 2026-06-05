import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Calendar, MapPin, Wallet, Copy, Check, ShieldCheck,
  CheckCircle, Receipt, Loader, AlertCircle,
} from 'lucide-react';
import { api, ApiError } from '../lib/api';
import type { Order } from '../lib/api';
import { formatDate, formatPrice } from '../lib/format';

const STATUS_STYLES: Record<string, string> = {
  pending:   'bg-amber-500/15 text-amber-300 border-amber-500/30',
  paid:      'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  cancelled: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
  expired:   'bg-red-500/15 text-red-400 border-red-500/30',
};

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [txHash, setTxHash] = useState('');
  const [copied, setCopied] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState('');

  // Load the order
  useEffect(() => {
    if (!id) { setError('Missing order id'); setLoading(false); return; }
    let alive = true;
    setLoading(true);
    api.orders.get(id)
      .then((o) => { if (alive) { setOrder(o); setLoading(false); } })
      .catch((e: unknown) => {
        if (!alive) return;
        const msg = e instanceof ApiError ? e.message : 'Could not load this order.';
        setError(msg); setLoading(false);
      });
    return () => { alive = false; };
  }, [id]);

  const copyAddress = async () => {
    if (!order) return;
    try {
      await navigator.clipboard.writeText(order.coin.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* clipboard unavailable */ }
  };

  const confirmPayment = async () => {
    if (!order) return;
    setConfirming(true); setConfirmError('');
    try {
      const { order: updated } = await api.orders.confirm(order._id, txHash.trim() || undefined);
      setOrder(updated);
      setTxHash('');
    } catch (e: unknown) {
      setConfirmError(e instanceof ApiError ? e.message : 'Could not confirm payment.');
    }
    setConfirming(false);
  };

  // ── Loading
  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 pt-24">
        <Loader size={32} className="text-[#A78BFA] animate-spin mb-4" />
        <p className="text-[#A0A0C0]">Loading your order…</p>
      </div>
    );
  }

  // ── Error
  if (error || !order) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 pt-24">
        <AlertCircle size={40} className="text-[#EF4444] mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Order not found</h2>
        <p className="text-[#A0A0C0] mb-6">{error || 'This order may have expired or been removed.'}</p>
        <Link to="/dashboard" className="accent-btn px-6 py-3 rounded-xl text-white font-semibold">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const isPending = order.status === 'pending';
  const isPaid = order.status === 'paid';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-[#A0A0C0] hover:text-white text-sm font-medium mb-6 transition-colors"
      >
        <ArrowLeft size={15} /> Back
      </button>

      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[#7C3AED] text-xs font-bold tracking-widest uppercase mb-2">Order</p>
          <h1 className="text-3xl font-black text-white">{order.reference}</h1>
          <p className="text-[#A0A0C0] text-sm mt-1 flex items-center gap-2">
            <Calendar size={13} className="text-[#7C3AED]" /> Placed {formatDate(order.createdAt)}
            {order.paidAt && <span className="text-emerald-400">· Paid {formatDate(order.paidAt)}</span>}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${STATUS_STYLES[order.status] ?? ''}`}>
          {order.status.toUpperCase()}
        </span>
      </div>

      {/* ── Pending → payment instructions + confirm ── */}
      {isPending && (
        <div className="bg-[#13132A] border border-[rgba(245,158,11,0.3)] rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Wallet size={16} className="text-[#FCD34D]" />
            <h3 className="text-white font-bold">Complete Your Payment</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-5 mb-5">
            {/* QR */}
            <div className="shrink-0 mx-auto sm:mx-0">
              <div className="bg-white rounded-2xl p-3">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(order.coin.address)}`}
                  alt="Payment address QR"
                  className="w-32 h-32"
                />
              </div>
            </div>

            {/* Details */}
            <div className="min-w-0">
              <p className="text-[#6060A0] text-xs uppercase tracking-wider mb-1">Amount due</p>
              <p className="text-2xl font-black text-white mb-1">{order.cryptoAmount} {order.coin.symbol}</p>
              <p className="text-[#6060A0] text-xs mb-3">
                ≈ ${order.usdTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                {' '}· <span className="text-[#A78BFA]">{order.coin.network}</span>
              </p>

              <label className="block text-[#6060A0] text-xs uppercase tracking-wider mb-1.5">Send to address</label>
              <div className="flex items-center gap-2 bg-[#0D0D1A] border border-[rgba(124,58,237,0.2)] rounded-xl px-3 py-2.5">
                <code className="text-[#A78BFA] text-xs truncate flex-1">{order.coin.address}</code>
                <button onClick={copyAddress} className="shrink-0 flex items-center gap-1 text-xs font-semibold text-[#A0A0C0] hover:text-white transition-colors">
                  {copied ? <><Check size={13} className="text-emerald-400" /> Copied</> : <><Copy size={13} /> Copy</>}
                </button>
              </div>

              <div className="flex items-start gap-2 mt-3 text-[#6060A0] text-xs">
                <ShieldCheck size={13} className="text-[#7C3AED] shrink-0 mt-0.5" />
                <span>
                  Send only <span className="text-white font-semibold">{order.coin.symbol}</span> on the
                  {' '}<span className="text-white font-semibold">{order.coin.network}</span> network.
                </span>
              </div>
            </div>
          </div>

          {/* Confirm */}
          <div className="pt-4 border-t border-[rgba(124,58,237,0.15)] space-y-3">
            <div>
              <label className="block text-[#A0A0C0] text-sm font-medium mb-2">
                Transaction hash <span className="text-[#6060A0] font-normal">(optional, speeds up confirmation)</span>
              </label>
              <input
                type="text"
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                placeholder="0x… or tx id from your wallet"
                className="w-full bg-[#1C1C3A] border border-[rgba(124,58,237,0.2)] rounded-xl px-4 py-3 text-white placeholder-[#6060A0] focus:outline-none focus:border-[#7C3AED] text-sm font-mono transition-colors"
              />
            </div>
            {confirmError && (
              <div className="px-4 py-3 rounded-xl bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-[#EF4444] text-sm">
                {confirmError}
              </div>
            )}
            <button
              onClick={confirmPayment}
              disabled={confirming}
              className={`w-full py-3.5 rounded-xl font-bold text-white transition-all ${confirming ? 'bg-[#7C3AED]/50 cursor-wait' : 'accent-btn'}`}
            >
              {confirming ? 'Confirming on-chain…' : `I've Sent ${order.cryptoAmount} ${order.coin.symbol}`}
            </button>
          </div>
        </div>
      )}

      {/* ── Paid receipt ── */}
      {isPaid && (
        <div className="bg-[#13132A] border border-emerald-500/30 rounded-2xl p-6 mb-6 flex items-center gap-4">
          <CheckCircle size={28} className="text-emerald-400 shrink-0" />
          <div className="flex-1">
            <p className="text-white font-bold">Payment received</p>
            <p className="text-[#A0A0C0] text-sm">Your tickets are ready — show the QR at the entrance.</p>
          </div>
          <Link to="/dashboard" className="shrink-0 accent-btn px-5 py-3 rounded-xl text-white text-sm font-bold">
            View Tickets
          </Link>
        </div>
      )}

      {/* ── Items ── */}
      <div className="bg-[#13132A] border border-[rgba(124,58,237,0.2)] rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Receipt size={16} className="text-[#A78BFA]" />
          <h3 className="text-white font-bold">Items ({order.items.length})</h3>
        </div>
        <div className="space-y-3">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-start gap-3 pb-3 border-b border-[rgba(124,58,237,0.12)] last:border-0 last:pb-0">
              {item.eventImage && (
                <img src={item.eventImage} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm truncate">{item.eventTitle}</p>
                <p className="text-[#A78BFA] text-xs">{item.tierName}</p>
                <p className="text-[#6060A0] text-xs mt-1 flex items-center gap-1">
                  <MapPin size={10} /> {item.eventVenue}, {item.eventCity}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-white font-bold text-sm">× {item.quantity}</p>
                <p className="text-[#6060A0] text-xs">{formatPrice(item.price * item.quantity, item.currency)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Attendee + Payment summary ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-[#13132A] border border-[rgba(124,58,237,0.2)] rounded-2xl p-5">
          <p className="text-[#6060A0] text-xs uppercase tracking-wider mb-2">Attendee</p>
          <p className="text-white font-semibold">{order.attendee.name}</p>
          <p className="text-[#A0A0C0] text-sm">{order.attendee.email}</p>
        </div>
        <div className="bg-[#13132A] border border-[rgba(124,58,237,0.2)] rounded-2xl p-5">
          <p className="text-[#6060A0] text-xs uppercase tracking-wider mb-2">Total</p>
          <p className="text-white font-black text-xl">{order.cryptoAmount} {order.coin.symbol}</p>
          <p className="text-[#A0A0C0] text-sm">
            ≈ ${order.usdTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            {' '}· <span className="text-[#A78BFA]">{order.coin.network}</span>
          </p>
        </div>
      </div>

      {order.txHash && (
        <div className="bg-[#13132A] border border-[rgba(124,58,237,0.15)] rounded-2xl p-5 mb-6">
          <p className="text-[#6060A0] text-xs uppercase tracking-wider mb-2">Transaction hash</p>
          <code className="text-[#A78BFA] text-xs break-all">{order.txHash}</code>
        </div>
      )}
    </div>
  );
}
