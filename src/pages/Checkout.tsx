import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingCart, ArrowRight, CheckCircle } from 'lucide-react';
import { useStore, useCartTotal } from '../store/useStore';
import { formatDate, formatPrice } from '../data/mock';

export default function Checkout() {
  const navigate = useNavigate();
  const { user, cart, removeFromCart, updateQty, clearCart, purchaseTickets } = useStore();
  const cartTotal = useCartTotal();
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'cart' | 'details' | 'success'>('cart');

  const mainCurrency = cart[0]?.currency ?? 'NGN';

  const handlePurchase = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    purchaseTickets(name, email);
    setLoading(false);
    setStep('success');
  };

  if (step === 'success') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500/50 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-emerald-400" />
          </div>
          <h1 className="text-3xl font-black text-white mb-3">Booking Confirmed!</h1>
          <p className="text-[#A0A0C0] mb-8">
            Your tickets have been added to your wallet. Present the QR code at the event entrance.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/dashboard" className="accent-btn px-6 py-3.5 rounded-xl text-white font-semibold text-center">
              View My Tickets
            </Link>
            <Link to="/events" className="px-6 py-3.5 rounded-xl bg-[#13132A] border border-[rgba(124,58,237,0.3)] text-[#A78BFA] font-semibold text-center hover:bg-[rgba(124,58,237,0.1)] transition-all">
              Browse More Events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0 && step === 'cart') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <ShoppingCart size={56} className="text-[#6060A0] mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Your cart is empty</h2>
        <p className="text-[#A0A0C0] mb-6">Find an event you love and grab your tickets</p>
        <Link to="/events" className="accent-btn px-6 py-3.5 rounded-xl text-white font-semibold">
          Browse Events
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
      <div className="mb-8">
        <p className="text-[#7C3AED] text-sm font-semibold tracking-widest uppercase mb-2">Checkout</p>
        <h1 className="text-3xl font-black text-white">Complete Your Booking</h1>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-10">
        {(['cart', 'details'] as const).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              s === step ? 'bg-[#7C3AED] text-white' : step === 'details' && i === 0 ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400' : 'bg-[#1C1C3A] text-[#6060A0]'
            }`}>
              {step === 'details' && i === 0 ? '✓' : i + 1}
            </div>
            <span className={`text-sm font-medium ${s === step ? 'text-white' : 'text-[#6060A0]'}`}>
              {s === 'cart' ? 'Review Cart' : 'Your Details'}
            </span>
            {i === 0 && <div className="w-8 h-px bg-[rgba(124,58,237,0.2)] mx-1" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

        {/* Left panel */}
        <div className="lg:col-span-3">
          {step === 'cart' && (
            <div className="space-y-4">
              <h2 className="text-white font-bold text-lg mb-4">Cart Items</h2>
              {cart.map(item => (
                <div key={`${item.eventId}-${item.tierId}`} className="bg-[#13132A] border border-[rgba(124,58,237,0.2)] rounded-2xl p-4 flex gap-4">
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
                </div>
              ))}

              <div className="flex justify-between mt-2">
                <button onClick={clearCart} className="text-[#EF4444] text-sm hover:text-red-300 transition-colors">
                  Clear cart
                </button>
                <button
                  onClick={() => {
                    if (!user) { navigate('/login', { state: { from: '/checkout' } }); return; }
                    setStep('details');
                  }}
                  className="accent-btn flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold"
                >
                  Continue <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {step === 'details' && (
            <form onSubmit={handlePurchase} className="space-y-5">
              <h2 className="text-white font-bold text-lg mb-4">Attendee Details</h2>

              <div>
                <label className="block text-[#A0A0C0] text-sm font-medium mb-2">Full name on ticket</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className="w-full bg-[#1C1C3A] border border-[rgba(124,58,237,0.2)] rounded-xl px-4 py-3 text-white placeholder-[#6060A0] focus:outline-none focus:border-[#7C3AED] text-sm transition-colors"
                />
              </div>

              <div>
                <label className="block text-[#A0A0C0] text-sm font-medium mb-2">Email for confirmation</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full bg-[#1C1C3A] border border-[rgba(124,58,237,0.2)] rounded-xl px-4 py-3 text-white placeholder-[#6060A0] focus:outline-none focus:border-[#7C3AED] text-sm transition-colors"
                />
              </div>

              <div className="px-4 py-3 rounded-xl bg-[rgba(124,58,237,0.08)] border border-[rgba(124,58,237,0.2)]">
                <p className="text-[#A0A0C0] text-xs leading-relaxed">
                  <span className="text-[#A78BFA] font-semibold">Demo mode:</span> No real payment is processed. Your tickets will be added to your wallet instantly.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button type="button" onClick={() => setStep('cart')} className="px-5 py-3 rounded-xl border border-[rgba(124,58,237,0.3)] text-[#A0A0C0] hover:text-white font-medium text-sm transition-all">
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 py-3.5 rounded-xl font-bold text-white transition-all ${
                    loading ? 'bg-[#7C3AED]/50 cursor-wait' : 'accent-btn'
                  }`}
                >
                  {loading ? 'Processing...' : `Confirm Booking · ${formatPrice(cartTotal, mainCurrency)}`}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Order summary */}
        <div className="lg:col-span-2">
          <div className="sticky top-20 bg-[#13132A] border border-[rgba(124,58,237,0.2)] rounded-2xl p-5">
            <h3 className="text-white font-bold mb-4">Order Summary</h3>
            <div className="space-y-2 mb-4">
              {cart.map(item => (
                <div key={`${item.eventId}-${item.tierId}`} className="flex justify-between text-sm">
                  <span className="text-[#A0A0C0] truncate flex-1 mr-2">
                    {item.tierName} × {item.quantity}
                  </span>
                  <span className="text-white font-medium shrink-0">{formatPrice(item.price * item.quantity, item.currency)}</span>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-[rgba(124,58,237,0.15)]">
              <div className="flex justify-between">
                <span className="text-[#A0A0C0] text-sm">Service fee</span>
                <span className="text-white text-sm font-medium">Free</span>
              </div>
              <div className="flex justify-between mt-3">
                <span className="text-white font-bold">Total</span>
                <span className="text-white font-black text-lg">{formatPrice(cartTotal, mainCurrency)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
