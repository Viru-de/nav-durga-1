import React, { useEffect } from 'react';

interface SeoHeadProps {
  title: string;
  description: string;
  canonicalPath: string;
  breadcrumbs?: Array<{ name: string; path: string }>;
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
  noIndex?: boolean;
}

export const SeoHead: React.FC<SeoHeadProps> = ({
  title,
  description,
  canonicalPath,
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

    setMeta('meta[name="description"]', 'name', 'description', description);
    setMeta('meta[property="og:title"]', 'property', 'og:title', title);
    setMeta('meta[property="og:description"]', 'property', 'og:description', description);
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title);
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    setMeta('meta[name="robots"]', 'name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow');

    const origin = window.location.origin;
    const fullUrl = `${origin}${canonicalPath}`;
    setMeta('meta[property="og:url"]', 'property', 'og:url', fullUrl);

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

    scriptEl.textContent = JSON.stringify(graphs.length === 1 ? graphs[0] : graphs);
  }, [title, description, canonicalPath, breadcrumbs, jsonLd, noIndex]);

  return null;
};
