import React, { useEffect } from 'react';

interface SeoHeadProps {
  title: string;
  description: string;
  canonicalPath: string;
  ogImage?: string;
  ogType?: 'website' | 'product';
  breadcrumbs?: Array<{ name: string; path: string }>;
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
  noIndex?: boolean;
}

const DEFAULT_OG_IMAGE = '/assets/hero-slides/slide-2-structural-products.jpg';

export const SeoHead: React.FC<SeoHeadProps> = ({
  title,
  description,
  canonicalPath,
  ogImage,
  ogType = 'website',
  breadcrumbs,
  jsonLd,
  noIndex = false,
}) => {
  useEffect(() => {
    document.title = title;

    const setMeta = (selector: string, attr: 'name' | 'property', key: string, content: string) => {
      let el = document.querySelector(selector) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    const origin = window.location.origin;
    const fullUrl = `${origin}${canonicalPath}`;
    const rawImg = ogImage && !ogImage.startsWith('data:') ? ogImage : DEFAULT_OG_IMAGE;
    const resolvedImage = rawImg.startsWith('http') ? rawImg : `${origin}${rawImg.startsWith('/') ? rawImg : `/${rawImg}`}`;

    setMeta('meta[name="description"]', 'name', 'description', description);
    setMeta('meta[property="og:type"]', 'property', 'og:type', ogType);
    setMeta('meta[property="og:site_name"]', 'property', 'og:site_name', 'Nav Durga Ispat Pvt. Ltd.');
    setMeta('meta[property="og:title"]', 'property', 'og:title', title);
    setMeta('meta[property="og:description"]', 'property', 'og:description', description);
    setMeta('meta[property="og:url"]', 'property', 'og:url', fullUrl);
    setMeta('meta[property="og:image"]', 'property', 'og:image', resolvedImage);
    setMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title);
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', resolvedImage);
    setMeta('meta[name="robots"]', 'name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow');

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', fullUrl);

    // Dynamic JSON-LD structured data
    const schemaScriptId = 'nd-dynamic-schema';
    let scriptEl = document.getElementById(schemaScriptId) as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = schemaScriptId;
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }

    const graphs: Record<string, unknown>[] = [];
    if (breadcrumbs && breadcrumbs.length > 0) {
      graphs.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((b, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: b.name,
          item: `${origin}${b.path}`,
        })),
      });
    }
    if (Array.isArray(jsonLd)) {
      graphs.push(...jsonLd);
    } else if (jsonLd) {
      graphs.push(jsonLd);
    }

    scriptEl.textContent = graphs.length > 0 ? JSON.stringify(graphs.length === 1 ? graphs[0] : graphs) : '';
  }, [title, description, canonicalPath, ogImage, ogType, breadcrumbs, jsonLd, noIndex]);

  return null;
};
