/**
 * masterPage.js — Global Page Code (runs on every page)
 * Place at: masterPage.js (Master Page code) in Wix Studio
 *
 * Handles:
 *  1. Auto-redirect from homepage (/) to today's Omer day
 *  2. Global navigation from the logo (→ today)
 *
 * This runs BEFORE the specific page code.
 */

import wixLocation from 'wix-location';
import { getOmerDayWithSunset } from 'backend/sunset';

$w.onReady(async function () {
  const currentPath = wixLocation.path;

  // Only redirect if we're on the home page
  if (currentPath.length === 0 || currentPath[0] === '') {
    try {
      const { dayNum } = await getOmerDayWithSunset();
      wixLocation.to(`/day/day-${dayNum}`);
    } catch {
      // Fallback: calendar day
      const OMER_START = new Date('2026-04-02T00:00:00');
      const now = new Date(); now.setHours(0, 0, 0, 0);
      const start = new Date(OMER_START); start.setHours(0, 0, 0, 0);
      const day = Math.max(1, Math.min(49, Math.floor((now - start) / 86400000) + 1));
      wixLocation.to(`/day/day-${day}`);
    }
  }

  // Logo click → always go to today
  if ($w('#logoBtn')) {
    $w('#logoBtn').onClick(async () => {
      try {
        const { dayNum } = await getOmerDayWithSunset();
        wixLocation.to(`/day/day-${dayNum}`);
      } catch {
        wixLocation.to('/');
      }
    });
  }
});
