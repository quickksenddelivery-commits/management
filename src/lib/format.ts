/**
 * Display formatters used across the app.
 * Pure presentation logic — no data dependencies.
 */

export const formatFollowers = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  NGN: '₦', ZAR: 'R', GBP: '£', USD: '$', KES: 'KSh', GHS: 'GH₵',
};

export const formatPrice = (price: number, currency: string): string => {
  const symbol = CURRENCY_SYMBOLS[currency] ?? `${currency} `;
  return `${symbol}${price.toLocaleString()}`;
};

export const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });

export const formatTime = (iso: string): string =>
  new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
