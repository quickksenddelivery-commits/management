import { useEffect } from 'react';

interface SeoOptions {
  title: string;
  description: string;
  /** Set false for account/checkout pages that shouldn't be indexed. */
  index?: boolean;
  path?: string;
}

const SITE_NAME = 'FanConnectPro';
const SITE_URL = 'https://fanconnectpro.com';

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(href: string) {
  let el = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/** Sets per-page title, meta description, canonical URL, OG/Twitter tags, and robots directive. */
export function useSeo({ title, description, index = true, path }: SeoOptions) {
  useEffect(() => {
    const fullTitle = title === SITE_NAME ? title : `${title} | ${SITE_NAME}`;
    document.title = fullTitle;

    setMeta('name', 'description', description);
    setMeta('name', 'robots', index ? 'index, follow' : 'noindex, nofollow');

    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:site_name', SITE_NAME);

    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', description);

    const canonicalPath = path ?? window.location.pathname;
    const canonicalUrl = `${SITE_URL}${canonicalPath}`;
    setCanonical(canonicalUrl);
    setMeta('property', 'og:url', canonicalUrl);
  }, [title, description, index, path]);
}
