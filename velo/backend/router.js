/**
 * router.js — Wix Router (backend)
 * Place at: backend/router.js in Wix Studio
 *
 * Handles URL routing for the dynamic day pages:
 *  /          → redirects to today's day (e.g. /day/day-3)
 *  /day/*     → serves the dynamic Days page
 *
 * Wix Router docs:
 * https://support.wix.com/en/article/velo-custom-url-routing
 *
 * To activate: in Wix Studio → Settings → Routing → Add Custom Router
 * Router prefix: "day"
 */

import { ok, redirect, notFound } from 'wix-router';
import { getOmerDayWithSunset } from 'backend/sunset';

// ─── ROUTER ───────────────────────────────────────────────────────────────────

/**
 * Main router function.
 * Called for every request to /{routerPrefix}/*
 */
export async function day_Router(request) {
  const { path } = request;           // e.g. ["day-3"] or [] for /day/
  const prefix   = request.prefix;    // "day"

  // /day/ with no slug → redirect to today
  if (!path || path.length === 0 || path[0] === '') {
    return redirectToToday();
  }

  const slug = path[0]; // e.g. "day-3"

  // Validate slug format
  if (!/^day-([1-9]|[1-4]\d|49)$/.test(slug)) {
    return notFound();
  }

  // Serve the dynamic page
  // Wix will look for a page named "day" in the router's page collection
  return ok('day', { slug });
}

/**
 * Sitemap entry — tells search engines which day pages exist.
 * Called by Wix when generating sitemap.xml
 */
export function day_SiteMap(sitemapRequest) {
  const entries = [];
  for (let i = 1; i <= 49; i++) {
    entries.push({
      pageName: 'day',
      url: `/day/day-${i}`,
      title: `יום ${i} — אתגר 49`,
      changeFrequency: 'yearly',
      priority: i === 1 ? 1.0 : 0.7,
    });
  }
  return entries;
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

async function redirectToToday() {
  try {
    // Try to get geo-aware day from the request
    // In production: pass user's lat/lng from browser geolocation
    // Here we use Jerusalem as default
    const { dayNum } = await getOmerDayWithSunset();
    return redirect(`/day/day-${dayNum}`, '302');
  } catch {
    // Fallback: calendar day without sunset awareness
    const OMER_START = new Date('2026-04-02T00:00:00');
    const now = new Date(); now.setHours(0, 0, 0, 0);
    const start = new Date(OMER_START); start.setHours(0, 0, 0, 0);
    const day = Math.max(1, Math.min(49, Math.floor((now - start) / 86400000) + 1));
    return redirect(`/day/day-${day}`, '302');
  }
}
