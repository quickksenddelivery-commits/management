import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2, ShoppingCart, ArrowRight, ArrowLeft, CheckCircle,
  Wallet, Copy, Check, ShieldCheck, Globe, Zap, Lock,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { api } from '../lib/api';
import { useApiData } from '../hooks/useApiData';
import { formatDate, formatPrice } from '../lib/format';
import { COINS, cartUsdTotal, toCrypto, formatCrypto, formatUSD, WHY_CRYPTO } from '../lib/crypto';
import type { Coin } from '../lib/crypto';
import { RevealGroup, RevealItem } from '../components/motion/Reveal';
import { useSeo } from '../components/seo/useSeo';

type Step = 'cart' | 'details' | 'payment' | 'success';

const WHY_ICONS = [Globe, Zap, ShieldCheck, Lock];

export default function Checkout() {
  useSeo({ title: 'Checkout', description: 'Complete your booking on FanConnectPro.', index: false, path: '/checkout' });
  const navigate = useNavigate();
  const { user, cart, removeFromCart, updateQty, clearCart } = useStore();
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [coin, setCoin] = useState<Coin>(COINS[0]);
  const [copied, setCopied] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<Step>('cart');
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);
  const [pendingConfirm, setPendingConfirm] = useState(false);
  const [orderError, setOrderError] = useState('');

  const coins = useApiData<Coin[]>(() => api.payments.coins(), COINS);

  const usdTotal = cartUsdTotal(cart);
  const cryptoAmount = toCrypto(usdTotal, coin);
  const mainCurrency = cart[0]?.currency ?? 'USD';
  const fiatTotal = cart.reduce((t, i) => t + i.price * i.quantity, 0);

  const goToDetails = () => {
    if (!user) { navigate('/login', { state: { from: '/checkout' } }); return; }
    setStep('details');
  };

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(coin.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* clipboard unavailable */ }
  };

  const handlePay = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPendingConfirm(false);
    setOrderError('');

    // Create the order (reserves seats + returns crypto payment info)
    let createdOrderId: string | null = null;
    try {
      const { order } = await api.orders.create({
        items: cart.map(i => ({ eventId: i.eventId, tierId: i.tierId, quantity: i.quantity })),
        attendeeName: name,
        attendeeEmail: email,
        coin: coin.symbol,
      });
      createdOrderId = order._id;
      setLastOrderId(createdOrderId);
    } catch (err) {
      setOrderError(err instanceof Error ? err.message : 'Could not create your order. Please try again.');
      setLoading(false);
      return;
    }

    // Confirm payment → backend issues one ticket per seat
    try {
      await api.orders.confirm(createdOrderId, txHash.trim() || undefined);
    } catch {
      // Order is on the server but couldn't be confirmed yet — leave it 'pending'
      // so the user can retry from the Order Detail page.
      setPendingConfirm(true);
    }
    clearCart();

    setLoading(false);
    setStep('success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* ── Success ── */
  if (step === 'success') {
    const pending = pendingConfirm;
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 pt-24 pb-16">
        <div className="text-center max-w-md">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border-2 animate-scale-in ${
            pending ? 'bg-amber-500/20 border-amber-500/50' : 'bg-emerald-500/20 border-emerald-500/50'
          }`}>
            <CheckCircle size={40} className={pending ? 'text-amber-400' : 'text-emerald-400'} />
          </div>
          <h1 className="text-3xl font-black text-white mb-3">
            {pending ? 'Order Placed — Awaiting Confirmation' : 'Payment Confirmed!'}
          </h1>
          {pending ? (
            <p className="text-[#A0A0C0] mb-8">
              Your order is on the books. We'll release your tickets as soon as the
              {' '}<span className="text-[#A78BFA] font-semibold">{coin.symbol}</span> payment lands on-chain.
              You can paste the transaction hash to speed it up.
            </p>
          ) : (
            <>
              <p className="text-[#A0A0C0] mb-2">
                We've received your <span className="text-[#A78BFA] font-semibold">{coin.symbol}</span> payment on-chain.
              </p>
              <p className="text-[#A0A0C0] mb-8">
                Your tickets are now in your wallet — show the QR code at the entrance.
              </p>
            </>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {lastOrderId ? (
              <Link to={`/orders/${lastOrderId}`} className="accent-btn px-6 py-3.5 rounded-xl text-white font-bold text-center">
                View Order Details
              </Link>
            ) : (
              <Link to="/dashboard" className="accent-btn px-6 py-3.5 rounded-xl text-white font-bold text-center">
                View My Tickets
              </Link>
            )}
            <Link to="/events" className="px-6 py-3.5 rounded-xl bg-[#13132A] border border-[rgba(124,58,237,0.3)] text-[#A78BFA] font-bold text-center hover:bg-[rgba(124,58,237,0.1)] transition-all">
              Browse More Events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ── Empty cart ── */
  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 pt-24">
        <ShoppingCart size={56} className="text-[#6060A0] mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Your cart is empty</h2>
        <p className="text-[#A0A0C0] mb-6">Find an event you love and grab your tickets</p>
        <Link to="/events" className="accent-btn px-6 py-3.5 rounded-xl text-white font-bold">Browse Events</Link>
      </div>
    );
  }

  const steps: { key: Step; label: string }[] = [
    { key: 'cart', label: 'Review Cart' },
    { key: 'details', label: 'Your Details' },
    { key: 'payment', label: 'Crypto Payment' },
  ];
  const stepIndex = steps.findIndex(s => s.key === step);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
      <div className="mb-6">
        <p className="text-[#7C3AED] text-sm font-semibold tracking-widest uppercase mb-2">Checkout</p>
        <h1 className="text-3xl font-black text-white">Complete Your Booking</h1>
      </div>

      {/* Crypto-only banner */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[rgba(124,58,237,0.1)] border border-[rgba(124,58,237,0.3)] mb-8">
        <Wallet size={18} className="text-[#A78BFA] shrink-0" />
        <p className="text-[#A0A0C0] text-sm">
          <span className="text-white font-semibold">All payments on FanConnectPro are made in cryptocurrency</span>
          {' '}— borderless, low-fee, and fraud-proof. Pay with USDT, USDC, BTC, ETH or BNB.
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-10 flex-wrap">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              i === stepIndex ? 'bg-[#7C3AED] text-white'
              : i < stepIndex ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400'
              : 'bg-[#1C1C3A] text-[#6060A0]'
            }`}>
              {i < stepIndex ? '✓' : i + 1}
            </div>
            <span className={`text-sm font-medium ${i === stepIndex ? 'text-white' : 'text-[#6060A0]'}`}>{s.label}</span>
            {i < steps.length - 1 && <div className="w-6 h-px bg-[rgba(124,58,237,0.25)] mx-1" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

        {/* ─────────── Left panel ─────────── */}
        <div className="lg:col-span-3">

          {/* CART */}
          {step === 'cart' && (
            <div className="space-y-4">
              <h2 className="text-white font-bold text-lg mb-4">Cart Items</h2>
              <RevealGroup className="space-y-4">
              {cart.map(item => (
                <RevealItem key={`${item.eventId}-${item.tierId}`} y={10} className="bg-[#13132A] border border-[rgba(124,58,237,0.2)] rounded-2xl p-4 flex gap-4">
                  <img src={item.eventImage} alt="" className="w-20 h-20 rounded-xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm truncate mb-1">{item.eventTitle}</p>
                    <p className="text-[#A78BFA] text-xs mb-1">{item.tierName}</p>
                    <p className="text-[#6060A0] text-xs">{formatDate(item.eventDate)} · {item.eventCity}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQty(item.eventId, item.tierId, item.quantity - 1)} className="w-6 h-6 rounded-md bg-[rgba(255,255,255,0.08)] text-white text-sm flex items-center justify-center hover:bg-[rgba(124,58,237,0.3)] transition-all">-</button>
                        <span className="text-white text-sm font-bold w-5 text-center">{item.quantity}</span>
                        <button onClick={() => updateQty(item.eventId, item.tierId, item.quantity + 1)} className="w-6 h-6 rounded-md bg-[rgba(255,255,255,0.08)] text-white text-sm flex items-center justify-center hover:bg-[rgba(124,58,237,0.3)] transition-all">+</button>
                      </div>
                      <span className="text-white font-bold text-sm">{formatPrice(item.price * item.quantity, item.currency)}</span>
                    </div>
                  </div>
                  <button onClick={() => removeFromCart(item.eventId, item.tierId)} className="text-[#6060A0] hover:text-[#EF4444] transition-colors shrink-0">
                    <Trash2 size={16} />
                  </button>
                </RevealItem>
              ))}
              </RevealGroup>
              <div className="flex justify-between mt-2">
                <button onClick={clearCart} className="text-[#EF4444] text-sm hover:text-red-300 transition-colors">Clear cart</button>
                <button onClick={goToDetails} className="accent-btn flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold">
                  Continue <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* DETAILS */}
          {step === 'details' && (
            <form onSubmit={(e) => { e.preventDefault(); setStep('payment'); }} className="space-y-5">
              <h2 className="text-white font-bold text-lg mb-4">Attendee Details</h2>
              <div>
                <label className="block text-[#A0A0C0] text-sm font-medium mb-2">Full name on ticket</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required
                  className="w-full bg-[#1C1C3A] border border-[rgba(124,58,237,0.2)] rounded-xl px-4 py-3 text-white placeholder-[#6060A0] focus:outline-none focus:border-[#7C3AED] text-sm transition-colors" />
              </div>
              <div>
                <label className="block text-[#A0A0C0] text-sm font-medium mb-2">Email for confirmation & tickets</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  className="w-full bg-[#1C1C3A] border border-[rgba(124,58,237,0.2)] rounded-xl px-4 py-3 text-white placeholder-[#6060A0] focus:outline-none focus:border-[#7C3AED] text-sm transition-colors" />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button type="button" onClick={() => setStep('cart')} className="px-5 py-3 rounded-xl border border-[rgba(124,58,237,0.3)] text-[#A0A0C0] hover:text-white font-medium text-sm transition-all flex items-center gap-2">
                  <ArrowLeft size={15} /> Back
                </button>
                <button type="submit" className="flex-1 accent-btn py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2">
                  Continue to Payment <ArrowRight size={16} />
                </button>
              </div>
            </form>
          )}

          {/* PAYMENT */}
          {step === 'payment' && (
            <form onSubmit={handlePay} className="space-y-6">
              <div>
                <h2 className="text-white font-bold text-lg mb-1">Pay with Crypto</h2>
                <p className="text-[#6060A0] text-sm">Select a coin, send the exact amount to the address, then confirm.</p>
              </div>

              {/* Coin selector */}
              <div>
                <label className="block text-[#A0A0C0] text-sm font-medium mb-3">Choose your coin</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {coins.map(c => {
                    const active = c.symbol === coin.symbol;
                    return (
                      <button
                        type="button"
                        key={c.symbol}
                        onClick={() => setCoin(c)}
                        className={`relative flex items-center gap-2.5 px-3 py-3 rounded-xl border text-left transition-all ${
                          active ? 'border-[#7C3AED] bg-[rgba(124,58,237,0.12)]' : 'border-[rgba(124,58,237,0.2)] bg-[#13132A] hover:border-[rgba(124,58,237,0.4)]'
                        }`}
                      >
                        <span className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0" style={{ background: c.color }}>
                          {c.symbol}
                        </span>
                        <span className="min-w-0">
                          <span className="block text-white text-sm font-bold leading-tight">{c.name}</span>
                          <span className="block text-[#6060A0] text-[10px]">{c.symbol}</span>
                        </span>
                        {c.recommended && (
                          <span className="absolute -top-2 right-2 px-1.5 py-0.5 rounded text-[8px] font-black bg-[#10B981] text-white">BEST</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Payment card */}
              <div className="bg-[#13132A] border border-[rgba(124,58,237,0.25)] rounded-2xl p-5">
                <div className="flex flex-col sm:flex-row gap-5">
                  {/* QR */}
                  <div className="shrink-0 mx-auto sm:mx-0">
                    <div className="bg-white rounded-2xl p-3">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(coin.address)}`}
                        alt="Payment address QR"
                        className="w-36 h-36"
                      />
                    </div>
                  </div>
                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-end justify-between mb-3">
                      <div>
                        <p className="text-[#6060A0] text-xs uppercase tracking-wider">Amount due</p>
                        <p className="text-2xl font-black text-white">{formatCrypto(cryptoAmount, coin)}</p>
                        <p className="text-[#6060A0] text-xs">≈ {formatUSD(usdTotal)} · {formatPrice(fiatTotal, mainCurrency)}</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold border border-[rgba(124,58,237,0.3)] text-[#A78BFA]">
                        {coin.network}
                      </span>
                    </div>

                    <label className="block text-[#6060A0] text-xs uppercase tracking-wider mb-1.5">Send to address</label>
                    <div className="flex items-center gap-2 bg-[#0D0D1A] border border-[rgba(124,58,237,0.2)] rounded-xl px-3 py-2.5">
                      <code className="text-[#A78BFA] text-xs truncate flex-1">{coin.address}</code>
                      <button type="button" onClick={copyAddress} className="shrink-0 flex items-center gap-1 text-xs font-semibold text-[#A0A0C0] hover:text-white transition-colors">
                        {copied ? <><Check size={13} className="text-emerald-400" /> Copied</> : <><Copy size={13} /> Copy</>}
                      </button>
                    </div>

                    <div className="flex items-start gap-2 mt-3 text-[#6060A0] text-xs">
                      <ShieldCheck size={13} className="text-[#7C3AED] shrink-0 mt-0.5" />
                      <span>Send only <span className="text-white font-semibold">{coin.symbol}</span> on the <span className="text-white font-semibold">{coin.network}</span> network. Sending another asset or network may result in loss of funds.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Optional transaction hash for faster reconciliation */}
              <div>
                <label className="block text-[#A0A0C0] text-sm font-medium mb-2">
                  Transaction hash <span className="text-[#6060A0] font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  placeholder="0x… or tx id from your wallet"
                  className="w-full bg-[#1C1C3A] border border-[rgba(124,58,237,0.2)] rounded-xl px-4 py-3 text-white placeholder-[#6060A0] focus:outline-none focus:border-[#7C3AED] text-sm font-mono transition-colors"
                />
                <p className="text-[#6060A0] text-xs mt-1.5">
                  Pasting the tx hash speeds up confirmation. If left blank, we'll detect the on-chain payment automatically.
                </p>
              </div>

              {/* Why crypto */}
              <div className="bg-[rgba(124,58,237,0.06)] border border-[rgba(124,58,237,0.2)] rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Wallet size={15} className="text-[#A78BFA]" />
                  <h3 className="text-white font-bold text-sm">Why payments are made in crypto</h3>
                </div>
                <RevealGroup className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {WHY_CRYPTO.map((r, i) => {
                    const Icon = WHY_ICONS[i] ?? Globe;
                    return (
                      <RevealItem key={r.title} y={10} className="flex items-start gap-3">
                        <span className="w-8 h-8 rounded-lg bg-[rgba(124,58,237,0.12)] border border-[rgba(124,58,237,0.25)] flex items-center justify-center shrink-0">
                          <Icon size={15} className="text-[#A78BFA]" />
                        </span>
                        <div>
                          <p className="text-white text-sm font-semibold leading-tight">{r.title}</p>
                          <p className="text-[#A0A0C0] text-xs leading-snug mt-0.5">{r.body}</p>
                        </div>
                      </RevealItem>
                    );
                  })}
                </RevealGroup>
              </div>

              {orderError && (
                <div className="px-4 py-3 rounded-xl bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-[#EF4444] text-sm animate-shake">
                  {orderError}
                </div>
              )}

              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setStep('details')} className="px-5 py-3 rounded-xl border border-[rgba(124,58,237,0.3)] text-[#A0A0C0] hover:text-white font-medium text-sm transition-all flex items-center gap-2">
                  <ArrowLeft size={15} /> Back
                </button>
                <button type="submit" disabled={loading}
                  className={`flex-1 py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all ${loading ? 'bg-[#7C3AED]/50 cursor-wait' : 'accent-btn'}`}>
                  {loading ? 'Confirming payment on-chain…' : <>I've Sent {formatCrypto(cryptoAmount, coin)}</>}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* ─────────── Order summary ─────────── */}
        <div className="lg:col-span-2">
          <div className="sticky top-24 bg-[#13132A] border border-[rgba(124,58,237,0.2)] rounded-2xl p-5">
            <h3 className="text-white font-bold mb-4">Order Summary</h3>
            <div className="space-y-2 mb-4">
              {cart.map(item => (
                <div key={`${item.eventId}-${item.tierId}`} className="flex justify-between text-sm">
                  <span className="text-[#A0A0C0] truncate flex-1 mr-2">{item.tierName} × {item.quantity}</span>
                  <span className="text-white font-medium shrink-0">{formatPrice(item.price * item.quantity, item.currency)}</span>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-[rgba(124,58,237,0.15)] space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#A0A0C0]">Service fee</span>
                <span className="text-white font-medium">Free</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#A0A0C0]">Settlement</span>
                <span className="text-[#A78BFA] font-semibold flex items-center gap-1"><Wallet size={12} /> Crypto</span>
              </div>
              <div className="flex justify-between items-end pt-2">
                <span className="text-white font-bold">Total</span>
                <div className="text-right">
                  <p className="text-white font-black text-lg">{formatPrice(fiatTotal, mainCurrency)}</p>
                  <p className="text-[#6060A0] text-xs">≈ {formatCrypto(cryptoAmount, coin)} · {formatUSD(usdTotal)}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 mt-5 pt-4 border-t border-[rgba(124,58,237,0.12)] text-[#6060A0] text-xs">
              <Lock size={12} className="text-emerald-400" />
              Secured by on-chain settlement
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
