/**
 * storage.js — Frontend storage utility
 * Place at: public/storage.js in Wix Studio
 *
 * Wraps Wix's wix-storage-frontend (equivalent to localStorage)
 * with typed helpers for Etgar49 progress tracking.
 *
 * Wix API used: wix-storage-frontend
 * Docs: https://dev.wix.com/docs/velo/api-reference/wix-storage-v2/local-storage
 *
 * Usage:
 *   import { markDayDone, isDayDone, getStreak } from 'public/storage';
 */

import { local } from 'wix-storage-frontend';

const PREFIX = 'etgar49_done_';

// ─── CORE ──────────────────────────────────────────────────────────────────

/**
 * Mark a day as completed.
 * @param {number} dayNum - 1–49
 */
export function markDayDone(dayNum) {
  local.setItem(`${PREFIX}${dayNum}`, '1');
}

/**
 * Check if a day is marked as done.
 * @param {number} dayNum - 1–49
 * @returns {boolean}
 */
export function isDayDone(dayNum) {
  return local.getItem(`${PREFIX}${dayNum}`) === '1';
}

/**
 * Calculate current streak ending at `upToDay`.
 * Counts backward from upToDay: how many consecutive days are marked done.
 * @param {number} upToDay - 1–49
 * @returns {number}
 */
export function getStreak(upToDay) {
  let streak = 0;
  for (let d = upToDay; d >= 1; d--) {
    if (isDayDone(d)) streak++;
    else break;
  }
  return streak;
}

/**
 * Get all completed day numbers.
 * @returns {number[]} sorted array of completed day numbers
 */
export function getAllDoneDays() {
  const done = [];
  for (let d = 1; d <= 49; d++) {
    if (isDayDone(d)) done.push(d);
  }
  return done;
}

/**
 * Get total count of completed days (non-consecutive).
 * @returns {number}
 */
export function getTotalDone() {
  return getAllDoneDays().length;
}

/**
 * Save user's email for reminders.
 * @param {string} email
 */
export function saveReminderEmail(email) {
  local.setItem('etgar49_email', email);
}

/**
 * Get saved reminder email.
 * @returns {string|null}
 */
export function getReminderEmail() {
  return local.getItem('etgar49_email');
}

/**
 * Check if user has set up reminders.
 * @returns {boolean}
 */
export function hasReminder() {
  return !!getReminderEmail();
}

/**
 * Clear all stored progress (use with caution — for testing).
 */
export function clearAll() {
  for (let d = 1; d <= 49; d++) {
    local.removeItem(`${PREFIX}${d}`);
  }
  local.removeItem('etgar49_email');
}

// ─── STREAK TEXT ────────────────────────────────────────────────────────────

/**
 * Get localized streak display text.
 * @param {number} streak
 * @param {number} dayNum - current day (used for week boundary detection)
 * @returns {string}
 */
export function getStreakText(streak, dayNum) {
  if (streak === 0) {
    return 'ספירה ראשונה';
  }
  if (streak === 1) {
    return 'יום ראשון ברצף';
  }
  // Week boundary celebration
  if (streak === 7)  return 'שבוע שלם · שבע ספירות';
  if (streak === 14) return 'שבועיים · ארבעה עשר ספירות';
  if (streak === 21) return 'שלושה שבועות ברצף';
  if (streak === 49) return 'ארבעים ותשע ספירות — הגעת לשבועות';

  return `${streak} ימים ברצף`;
}
