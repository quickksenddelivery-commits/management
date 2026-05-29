import type { CartItem } from '../types';

/**
 * Rachead settles ALL payments in cryptocurrency.
 * This module holds the supported coins, indicative rates, and conversion helpers.
 * Rates are static/indicative for the Stage-1 demo — a live rate feed comes in Stage 2.
 */

export interface Coin {
  symbol: string;
  name: string;
  /** 1 coin = X USD (indicative) */
  usdPrice: number;
  color: string;
  network: string;
  address: string;
  stable?: boolean;
  recommended?: boolean;
}

export const COINS: Coin[] = [
  { symbol: 'USDT', name: 'Tether',    usdPrice: 1,      color: '#26A17B', network: 'TRC-20 · Tron',       address: 'TRchD8GtvRacheAd9xKq7vN2mB4tZ8wL5sD', stable: true, recommended: true },
  { symbol: 'USDC', name: 'USD Coin',  usdPrice: 1,      color: '#2775CA', network: 'ERC-20 · Ethereum',   address: '0x7C3AeD9b2E4c8D6a05Fe3b71C9d2A48ReDc', stable: true },
  { symbol: 'BTC',  name: 'Bitcoin',   usdPrice: 68000,  color: '#F7931A', network: 'Bitcoin',             address: 'bc1qr4ch3ad0xqeventtckt5p2y8gtv0n9rsdkmq3' },
  { symbol: 'ETH',  name: 'Ethereum',  usdPrice: 3500,   color: '#627EEA', network: 'ERC-20 · Ethereum',   address: '0xE7h3RacheAd1f9b2E4c8D6a05Fe3b71C9d2A48' },
  { symbol: 'BNB',  name: 'BNB',       usdPrice: 600,    color: '#F3BA2F', network: 'BEP-20 · BNB Chain',  address: '0xBnbRacheAd5sD6gtv0n9rsKmq3p2y8x7k2acFE' },
];

/** 1 unit of fiat = X USD (indicative) */
const FIAT_USD: Record<string, number> = {
  USD: 1,
  NGN: 1 / 1600,
  ZAR: 1 / 18,
  GBP: 1.27,
  KES: 1 / 130,
  GHS: 1 / 15,
};

export const toUSD = (amount: number, currency: string) =>
  amount * (FIAT_USD[currency] ?? 1);

export const cartUsdTotal = (cart: CartItem[]) =>
  cart.reduce((sum, i) => sum + toUSD(i.price * i.quantity, i.currency), 0);

export const toCrypto = (usd: number, coin: Coin) => usd / coin.usdPrice;

export const formatUSD = (usd: number) =>
  `$${usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const formatCrypto = (amount: number, coin: Coin) => {
  const decimals = coin.stable ? 2 : amount < 1 ? 6 : 4;
  return `${amount.toFixed(decimals)} ${coin.symbol}`;
};

/** The professional rationale shown to users for crypto-only settlement. */
export const WHY_CRYPTO: { title: string; body: string }[] = [
  {
    title: 'Borderless access',
    body: 'Fans in any country can buy tickets without card restrictions, bank approvals, or currency barriers.',
  },
  {
    title: 'Lower fees, more for the artists',
    body: 'No heavy card-processing or FX charges — a larger share of every ticket reaches the celebrities and organizers.',
  },
  {
    title: 'Secure & fraud-proof',
    body: 'On-chain payments confirm instantly and cannot be reversed, eliminating chargeback fraud and fake-ticket scams.',
  },
  {
    title: 'Stable & inclusive',
    body: 'Pay with stablecoins (USDT/USDC) to avoid local-currency volatility — and no bank account is required.',
  },
];
