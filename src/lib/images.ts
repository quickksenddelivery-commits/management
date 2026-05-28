import type { CelebrityCategory } from '../types';
import type { SyntheticEvent } from 'react';

/**
 * Returns onError handler that swaps to the branded SVG fallback
 * when an <img> src fails to load.
 */
export function withFallback(
  fallbackSrc: string
): { onError: (e: SyntheticEvent<HTMLImageElement>) => void } {
  return {
    onError(e: SyntheticEvent<HTMLImageElement>) {
      const img = e.currentTarget;
      if (img.src !== fallbackSrc) img.src = fallbackSrc;
    },
  };
}

/**
 * Branded SVG art generator.
 * Produces deterministic, on-brand data-URI artwork for celebrities and events
 * so the platform has zero external image dependencies and nothing can break.
 */

type Palette = { a: string; b: string; deep: string };

const PALETTES: Record<CelebrityCategory, Palette> = {
  musician:   { a: '#8B5CF6', b: '#D946EF', deep: '#2E0A52' },
  dj:         { a: '#3B82F6', b: '#06B6D4', deep: '#0A2547' },
  comedian:   { a: '#F59E0B', b: '#FB923C', deep: '#4A2400' },
  actor:      { a: '#EC4899', b: '#FB7185', deep: '#4A0A30' },
  athlete:    { a: '#10B981', b: '#34D399', deep: '#053524' },
  influencer: { a: '#EF4444', b: '#EC4899', deep: '#4A0A18' },
  pastor:     { a: '#6366F1', b: '#3B82F6', deep: '#1A1840' },
  politician: { a: '#F97316', b: '#F59E0B', deep: '#4A2200' },
};

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function encode(svg: string): string {
  // single-quoted attributes survive encodeURIComponent untouched; '#' becomes %23 as required
  return `data:image/svg+xml,${encodeURIComponent(svg.replace(/\s{2,}/g, ' ').trim())}`;
}

/* ───────────────── Celebrity portrait (3:4) ───────────────── */
export function celebrityPortrait(name: string, cat: CelebrityCategory): string {
  const p = PALETTES[cat];
  const h = hashCode(name);
  const x1 = 130 + (h % 220);
  const y1 = 160 + ((h >> 3) % 240);
  const x2 = 460 - ((h >> 5) % 200);
  const y2 = 540 + ((h >> 7) % 160);
  const ini = initials(name);

  const hLines = Array.from({ length: 7 }, (_, i) =>
    `<line x1='0' y1='${i * 120}' x2='600' y2='${i * 120}'/>`
  ).join('');
  const vLines = Array.from({ length: 5 }, (_, i) =>
    `<line x1='${i * 150}' y1='0' x2='${i * 150}' y2='800'/>`
  ).join('');

  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='800' viewBox='0 0 600 800'>
    <defs>
      <linearGradient id='bg' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0' stop-color='${p.deep}'/>
        <stop offset='1' stop-color='#08081A'/>
      </linearGradient>
      <radialGradient id='vig' cx='0.5' cy='0.42' r='0.78'>
        <stop offset='0.45' stop-color='#000000' stop-opacity='0'/>
        <stop offset='1' stop-color='#000000' stop-opacity='0.62'/>
      </radialGradient>
      <filter id='blur' x='-50%' y='-50%' width='200%' height='200%'>
        <feGaussianBlur stdDeviation='75'/>
      </filter>
    </defs>
    <rect width='600' height='800' fill='url(#bg)'/>
    <circle cx='${x1}' cy='${y1}' r='200' fill='${p.a}' opacity='0.65' filter='url(#blur)'/>
    <circle cx='${x2}' cy='${y2}' r='170' fill='${p.b}' opacity='0.5' filter='url(#blur)'/>
    <g stroke='#FFFFFF' stroke-opacity='0.035'>${hLines}${vLines}</g>
    <circle cx='300' cy='360' r='148' fill='none' stroke='#FFFFFF' stroke-opacity='0.14' stroke-width='2'/>
    <circle cx='300' cy='360' r='172' fill='none' stroke='#FFFFFF' stroke-opacity='0.05' stroke-width='1'/>
    <text x='300' y='360' text-anchor='middle' dominant-baseline='central' font-family='Arial, Helvetica, sans-serif' font-size='168' font-weight='800' fill='#FFFFFF' fill-opacity='0.94'>${ini}</text>
    <rect width='600' height='800' fill='url(#vig)'/>
  </svg>`;
  return encode(svg);
}

/* ───────────────── Celebrity cover banner (3:1) ───────────────── */
export function celebrityCover(name: string, cat: CelebrityCategory): string {
  const p = PALETTES[cat];
  const h = hashCode(name + 'cover');
  const ini = initials(name);

  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='420' viewBox='0 0 1200 420'>
    <defs>
      <linearGradient id='bg' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0' stop-color='${p.deep}'/>
        <stop offset='1' stop-color='#08081A'/>
      </linearGradient>
      <linearGradient id='fade' x1='0' y1='0' x2='1' y2='0'>
        <stop offset='0' stop-color='#0D0D1A' stop-opacity='0.85'/>
        <stop offset='0.6' stop-color='#0D0D1A' stop-opacity='0.1'/>
        <stop offset='1' stop-color='#0D0D1A' stop-opacity='0'/>
      </linearGradient>
      <filter id='blur' x='-50%' y='-50%' width='200%' height='200%'>
        <feGaussianBlur stdDeviation='90'/>
      </filter>
    </defs>
    <rect width='1200' height='420' fill='url(#bg)'/>
    <circle cx='${250 + (h % 300)}' cy='${120 + (h % 120)}' r='230' fill='${p.a}' opacity='0.55' filter='url(#blur)'/>
    <circle cx='${850 + (h % 250)}' cy='${320 - (h % 120)}' r='200' fill='${p.b}' opacity='0.45' filter='url(#blur)'/>
    <text x='980' y='240' text-anchor='middle' dominant-baseline='central' font-family='Arial, Helvetica, sans-serif' font-size='260' font-weight='800' fill='#FFFFFF' fill-opacity='0.07'>${ini}</text>
    <rect width='1200' height='420' fill='url(#fade)'/>
  </svg>`;
  return encode(svg);
}

/* ───────────────── Event poster (16:9, abstract — title overlaid by UI) ───────────────── */
export function eventPoster(seed: string, cat: CelebrityCategory): string {
  const p = PALETTES[cat];
  const h = hashCode(seed);

  const bars = Array.from({ length: 48 }, (_, i) => {
    const bh = 24 + (hashCode(seed + ':' + i) % 170);
    return `<rect x='${i * 25}' y='${675 - bh}' width='12' height='${bh}' rx='6' fill='#FFFFFF' fill-opacity='0.07'/>`;
  }).join('');

  const grid = Array.from({ length: 9 }, (_, i) =>
    `<line x1='${i * 150}' y1='0' x2='${i * 150}' y2='675'/>`
  ).join('');

  const w1 = 360 + (h % 90);
  const w2 = 470 + ((h >> 4) % 70);

  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='675' viewBox='0 0 1200 675'>
    <defs>
      <linearGradient id='bg' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0' stop-color='${p.deep}'/>
        <stop offset='1' stop-color='#08081A'/>
      </linearGradient>
      <linearGradient id='wave' x1='0' y1='0' x2='1' y2='0'>
        <stop offset='0' stop-color='${p.a}'/>
        <stop offset='1' stop-color='${p.b}'/>
      </linearGradient>
      <filter id='blur' x='-50%' y='-50%' width='200%' height='200%'>
        <feGaussianBlur stdDeviation='95'/>
      </filter>
    </defs>
    <rect width='1200' height='675' fill='url(#bg)'/>
    <circle cx='${200 + (h % 800)}' cy='${110 + (h % 180)}' r='230' fill='${p.a}' opacity='0.55' filter='url(#blur)'/>
    <circle cx='${1000 - (h % 650)}' cy='470' r='210' fill='${p.b}' opacity='0.42' filter='url(#blur)'/>
    <path d='M0,${w1} C300,${w1 - 90} 700,${w1 + 80} 1200,${w1 - 30} L1200,675 L0,675 Z' fill='url(#wave)' opacity='0.20'/>
    <path d='M0,${w2} C400,${w2 - 70} 800,${w2 + 70} 1200,${w2 - 20} L1200,675 L0,675 Z' fill='url(#wave)' opacity='0.13'/>
    <g>${bars}</g>
    <g stroke='#FFFFFF' stroke-opacity='0.03'>${grid}</g>
  </svg>`;
  return encode(svg);
}

/* ───────────────── Hero mesh-gradient background ───────────────── */
export function heroBackground(): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1600' height='900' viewBox='0 0 1600 900'>
    <defs>
      <radialGradient id='r1' cx='0.28' cy='0.30' r='0.55'>
        <stop offset='0' stop-color='#7C3AED' stop-opacity='0.60'/>
        <stop offset='1' stop-color='#7C3AED' stop-opacity='0'/>
      </radialGradient>
      <radialGradient id='r2' cx='0.76' cy='0.62' r='0.55'>
        <stop offset='0' stop-color='#D946EF' stop-opacity='0.42'/>
        <stop offset='1' stop-color='#D946EF' stop-opacity='0'/>
      </radialGradient>
      <radialGradient id='r3' cx='0.60' cy='0.18' r='0.45'>
        <stop offset='0' stop-color='#F59E0B' stop-opacity='0.22'/>
        <stop offset='1' stop-color='#F59E0B' stop-opacity='0'/>
      </radialGradient>
      <radialGradient id='r4' cx='0.18' cy='0.82' r='0.5'>
        <stop offset='0' stop-color='#2563EB' stop-opacity='0.34'/>
        <stop offset='1' stop-color='#2563EB' stop-opacity='0'/>
      </radialGradient>
    </defs>
    <rect width='1600' height='900' fill='#08081A'/>
    <rect width='1600' height='900' fill='url(#r1)'/>
    <rect width='1600' height='900' fill='url(#r2)'/>
    <rect width='1600' height='900' fill='url(#r3)'/>
    <rect width='1600' height='900' fill='url(#r4)'/>
  </svg>`;
  return encode(svg);
}
