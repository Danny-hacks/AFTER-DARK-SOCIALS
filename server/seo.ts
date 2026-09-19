import { storage } from "./storage";

export const SITE_URL = "https://aftr.events";
export const OLD_SITE_HOST = "aftr-the-rave.replit.app";

const DEFAULT_DESCRIPTION =
  "AFTR by After Dark Socials — Mauritius rave events, nightlife experiences, tickets, and the exclusive ACCESS VIP lounge.";
// A real 1200x630 social-card image, not the tiny square favicon — used
// whenever a page has no more specific image of its own (event pages use
// the event's own photo instead, set per-call below).
const DEFAULT_IMAGE = `${SITE_URL}/og-default.jpg`;

// Gives search engines a consistent machine-readable identity for the
// brand across every page, not just event pages.
const ORGANIZATION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "After Dark Socials",
  alternateName: "AFTR",
  url: SITE_URL,
  logo: `${SITE_URL}/favicon.png`,
  sameAs: [
    "https://www.instagram.com/afterdarksocials.mu",
    "https://www.tiktok.com/@afterdarksocials.mu",
  ],
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function absoluteUrl(url: string | null | undefined): string {
  if (!url) return DEFAULT_IMAGE;
  return url.startsWith("http") ? url : `${SITE_URL}${url}`;
}

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

interface HeadData {
  title: string;
  description: string;
  path: string; // used to build the canonical URL and og:url
  image?: string | null;
  type?: "website" | "article";
  /** Extra JSON-LD blocks beyond the Organization one every page gets. */
  jsonLd?: object[];
}

function renderHead(data: HeadData): string {
  const title = escapeHtml(data.title);
  const description = escapeHtml(truncate(data.description, 300));
  const canonical = `${SITE_URL}${data.path}`;
  const image = escapeHtml(absoluteUrl(data.image));

  let html =
    `<!-- SEO:START -->\n` +
    `    <title>${title}</title>\n` +
    `    <meta name="description" content="${description}" />\n` +
    `    <link rel="canonical" href="${escapeHtml(canonical)}" />\n\n` +
    `    <meta property="og:type" content="${data.type ?? "website"}" />\n` +
    `    <meta property="og:site_name" content="AFTR — After Dark Socials" />\n` +
    `    <meta property="og:title" content="${title}" />\n` +
    `    <meta property="og:description" content="${description}" />\n` +
    `    <meta property="og:url" content="${escapeHtml(canonical)}" />\n` +
    `    <meta property="og:image" content="${image}" />\n` +
    `    <meta name="twitter:card" content="summary_large_image" />\n`;

  // Organization schema on every page (site-wide brand identity), plus
  // whatever page-specific JSON-LD (e.g. Event) was passed in.
  const allJsonLd = [ORGANIZATION_JSON_LD, ...(data.jsonLd ?? [])];
  for (const block of allJsonLd) {
    // A literal "</script>" inside a JSON string would close the tag early —
    // escaping the slash keeps the JSON valid while breaking that sequence up.
    const json = JSON.stringify(block).replace(/<\//g, "<\\/");
    html += `    <script type="application/ld+json">${json}</script>\n`;
  }

  html += `    <!-- SEO:END -->`;
  return html;
}

const STATIC_PAGES: Record<string, { title: string; description: string }> = {
  "/": {
    title: "AFTR — After Dark Socials",
    description: DEFAULT_DESCRIPTION,
  },
  "/about": {
    title: "About — AFTR by After Dark Socials",
    description: "The story behind AFTR — Mauritius's rave collective bringing unmatched energy and nightlife experiences to the island.",
  },
  "/services": {
    title: "Services — AFTR by After Dark Socials",
    description: "Private bookings, corporate events, and brand activations curated by After Dark Socials — bespoke nightlife experiences in Mauritius.",
  },
  "/contact": {
    title: "Contact — AFTR by After Dark Socials",
    description: "Get in touch with After Dark Socials for bookings, partnerships, and event enquiries in Mauritius.",
  },
  "/events": {
    title: "Events & Tickets — AFTR by After Dark Socials",
    description: "Get your tickets for the next AFTR rave in Mauritius — every night is a new chapter.",
  },
  "/events/past": {
    title: "Past Events — AFTR by After Dark Socials",
    description: "Relive past AFTR nights in Mauritius — full lineups, dates, and venues from every past volume.",
  },
  "/gallery": {
    title: "Gallery — AFTR by After Dark Socials",
    description: "Photos from AFTR nights in Mauritius — the crowd, the stage, the energy of every past event.",
  },
  "/access": {
    title: "ACCESS — AFTR by After Dark Socials",
    description: "ACCESS is AFTR's private social night — curated guest list, reserved tables, and a premium experience. Not everyone gets in.",
  },
  "/terms": {
    title: "Terms & Conditions — AFTR by After Dark Socials",
    description: "Terms and conditions for AFTR events and ticket purchases by After Dark Socials.",
  },
  "/privacy": {
    title: "Privacy Policy — AFTR by After Dark Socials",
    description: "Privacy policy for After Dark Socials and AFTR event ticketing.",
  },
  "/refund": {
    title: "Refund Policy — AFTR by After Dark Socials",
    description: "Refund policy for AFTR event tickets by After Dark Socials.",
  },
  "/age-requirements": {
    title: "Age Requirements — AFTR by After Dark Socials",
    description: "Age requirements and entry conditions for AFTR events by After Dark Socials.",
  },
};

/** Best-effort ISO datetime from the event's free-text date/time fields —
 * omitted from the JSON-LD entirely if nothing parses, since an invalid
 * startDate is worse for Search Console than no startDate. `time` is
 * usually a free-text range like "10PM — 4AM", not a single instant, so
 * feeding the whole range into Date() as one string ("Oct 9 2026 10PM —
 * 4AM") reliably fails to parse — only the start time is a real instant,
 * so that's extracted first. */
function tryEventStartDate(date: string, time: string | null): string | undefined {
  if (time) {
    const startTime = time.split(/[–—-]|\s+to\s+/i)[0]?.trim();
    if (startTime) {
      const withTime = new Date(`${date} ${startTime}`);
      if (!isNaN(withTime.getTime())) return withTime.toISOString();
    }
  }
  // Fall back to the date alone rather than giving up entirely.
  const dateOnly = new Date(date);
  return isNaN(dateOnly.getTime()) ? undefined : dateOnly.toISOString();
}

async function buildEventHead(path: string, idOrSlug: string): Promise<{ html: string; notFound: boolean }> {
  const event = (await storage.getEventBySlug(idOrSlug)) ?? (await storage.getEvent(idOrSlug));
  if (!event) {
    return { html: renderHead({ title: "Event Not Found — AFTR", description: DEFAULT_DESCRIPTION, path }), notFound: true };
  }

  const tiers = await storage.getTiersByEvent(event.id);
  const description = event.description
    ? event.description
    : `${event.name}${event.venue ? ` at ${event.venue}` : ""}${event.date ? ` on ${event.date}` : ""} — get your tickets now.`;

  const startDate = tryEventStartDate(event.date, event.time ?? null);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.name,
    description,
    ...(startDate ? { startDate } : {}),
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    // schema.org's EventStatusType has no distinct "already happened" value —
    // EventScheduled is correct whether the date is in the future or past.
    eventStatus: "https://schema.org/EventScheduled",
    location: {
      "@type": "Place",
      name: event.venue || "Mauritius",
      address: event.venue || "Mauritius",
    },
    image: [absoluteUrl(event.imageUrl)],
    organizer: {
      "@type": "Organization",
      name: "After Dark Socials",
      url: SITE_URL,
    },
    ...(tiers.length > 0
      ? {
          offers: tiers.map((t) => ({
            "@type": "Offer",
            name: t.name,
            price: t.price,
            priceCurrency: "MUR",
            url: `${SITE_URL}${path}`,
            availability: event.isPast ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
          })),
        }
      : {}),
  };

  return {
    html: renderHead({
      title: `${event.name} — AFTR`,
      description,
      path,
      image: event.imageUrl,
      type: "article",
      jsonLd: [jsonLd],
    }),
    notFound: false,
  };
}

// Mirrors the client's route list in App.tsx. Only used to decide whether an
// unrecognized path is a genuine 404 vs. something this module just doesn't
// have special SEO data for (e.g. /admin/*) — deliberately conservative:
// anything not matched here falls through as "unknown, don't 404" rather
// than risking a false-positive 404 on a real page.
const KNOWN_PATH_PATTERNS: RegExp[] = [
  /^\/$/,
  /^\/(about|services|contact|events|gallery|access|terms|privacy|refund|age-requirements)$/,
  /^\/events\/past$/,
  /^\/admin(\/.*)?$/,
];

/**
 * Server-rendered <head> content for a given request path — real per-page
 * title/description/canonical/OG tags and, for event pages, schema.org
 * Event JSON-LD, computed before any client-side JS runs. `notFound` is
 * true for a /events/:slug that doesn't match any real event, or any other
 * path that doesn't match a known route pattern — so the caller can
 * respond with a real 404 status instead of a silent 200.
 */
export async function buildHeadTags(path: string): Promise<{ html: string; notFound: boolean }> {
  try {
    if (STATIC_PAGES[path]) {
      return { html: renderHead({ ...STATIC_PAGES[path], path }), notFound: false };
    }

    const eventMatch = path.match(/^\/events\/([^/]+)$/);
    if (eventMatch && eventMatch[1] !== "past") {
      return await buildEventHead(path, decodeURIComponent(eventMatch[1]));
    }

    const known = KNOWN_PATH_PATTERNS.some((re) => re.test(path));
    return { html: renderHead({ ...STATIC_PAGES["/"], path }), notFound: !known };
  } catch (error) {
    console.error("Error building SEO head tags (non-blocking):", error);
    return { html: renderHead({ ...STATIC_PAGES["/"], path }), notFound: false };
  }
}

const SEO_BLOCK_RE = /<!-- SEO:START -->[\s\S]*?<!-- SEO:END -->/;

/** Replaces the static SEO:START..SEO:END block in index.html with the
 * route-specific head tags built above. */
export function injectHeadTags(template: string, headHtml: string): string {
  return template.replace(SEO_BLOCK_RE, headHtml);
}
