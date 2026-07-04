import { useEffect } from "react";

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  canonicalUrl?: string;
  schema?: object;
  noIndex?: boolean;
}

const SITE_NAME = "Urgențe Brașov";
const DEFAULT_DESCRIPTION = "Găsește rapid servicii de urgență și intervenție în Brașov și împrejurimi. Electricieni, instalatori, service auto, tractări, medici, stomatologi și multe altele — disponibili 24/7.";
const DEFAULT_OG_IMAGE = "https://urgentebrasov.ro/og-image.jpg";

export function SEOHead({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = "website",
  canonicalUrl,
  schema,
  noIndex = false,
}: SEOHeadProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const currentUrl = canonicalUrl ?? (typeof window !== "undefined" ? window.location.href : "");

  useEffect(() => {
    // Title
    document.title = fullTitle;

    // Meta tags
    setMeta("description", description);
    if (keywords) setMeta("keywords", keywords);
    if (noIndex) setMeta("robots", "noindex,nofollow");
    else setMeta("robots", "index,follow");

    // Open Graph
    setOgMeta("og:title", fullTitle);
    setOgMeta("og:description", description);
    setOgMeta("og:image", ogImage);
    setOgMeta("og:type", ogType);
    setOgMeta("og:url", currentUrl);
    setOgMeta("og:site_name", SITE_NAME);
    setOgMeta("og:locale", "ro_RO");

    // Twitter Card
    setOgMeta("twitter:card", "summary_large_image");
    setOgMeta("twitter:title", fullTitle);
    setOgMeta("twitter:description", description);
    setOgMeta("twitter:image", ogImage);

    // Canonical
    if (canonicalUrl) {
      let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (!link) {
        link = document.createElement("link");
        link.rel = "canonical";
        document.head.appendChild(link);
      }
      link.href = canonicalUrl;
    }

    // Schema.org JSON-LD
    if (schema) {
      const existingScript = document.getElementById("schema-jsonld");
      if (existingScript) existingScript.remove();
      const script = document.createElement("script");
      script.id = "schema-jsonld";
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    }

    return () => {
      // Cleanup schema on unmount
      const schemaScript = document.getElementById("schema-jsonld");
      if (schemaScript) schemaScript.remove();
    };
  }, [fullTitle, description, keywords, ogImage, ogType, currentUrl, canonicalUrl, schema, noIndex]);

  return null;
}

function setMeta(name: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.name = name;
    document.head.appendChild(el);
  }
  el.content = content;
}

function setOgMeta(property: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", property);
    document.head.appendChild(el);
  }
  el.content = content;
}

// Schema.org helpers
export function createLocalBusinessSchema(company: {
  name: string;
  description?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  lat?: number | null;
  lng?: number | null;
  averageRating?: number | null;
  reviewCount?: number | null;
  website?: string | null;
  logo?: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: company.name,
    description: company.description ?? undefined,
    telephone: company.phone ?? undefined,
    email: company.email ?? undefined,
    url: company.website ?? undefined,
    logo: company.logo ?? undefined,
    address: company.address ? {
      "@type": "PostalAddress",
      streetAddress: company.address,
      addressLocality: company.city ?? "Brașov",
      addressCountry: "RO",
    } : undefined,
    geo: company.lat && company.lng ? {
      "@type": "GeoCoordinates",
      latitude: company.lat,
      longitude: company.lng,
    } : undefined,
    aggregateRating: company.averageRating && company.reviewCount ? {
      "@type": "AggregateRating",
      ratingValue: company.averageRating,
      reviewCount: company.reviewCount,
    } : undefined,
  };
}

export function createBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function createWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: "https://urgentebrasov.ro",
    description: DEFAULT_DESCRIPTION,
    potentialAction: {
      "@type": "SearchAction",
      target: "https://urgentebrasov.ro/cautare?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };
}
