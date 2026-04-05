/**
 * omer.js — Public utility module
 * Place at: src/public/omer.js in Wix Studio
 *
 * Handles all Omer calendar calculations:
 *  - Which day number is today
 *  - Which week (sefirah) it belongs to
 *  - The sefirah name for any given day
 *  - Hebrew number strings
 *
 * No external dependencies. Pure JS, runs on frontend.
 */

// ─── CONFIGURATION ────────────────────────────────────────────────
// Day 1 of the Omer = the morning of April 2, 2026
// Sunset of April 1 → April 2 morning = Day 1 begins
// For date calculation we use midnight April 2 as Day 1 start.
// In the real app, sunset-aware logic is handled by getSunsetAwareDay().
export const OMER_START_DATE = '2026-04-02'; // Update each year

// ─── SEFIROT ──────────────────────────────────────────────────────
export const SEFIROT = [
  'חסד', 'גבורה', 'תפארת', 'נצח', 'הוד', 'יסוד', 'מלכות'
];

export const WEEK_COLORS = [
  { a: '#2E9B55', b: '#E8F5EE', k: '#185C30', l: '#D0ECDA' }, // Week 1 חסד
  { a: '#3E9E38', b: '#E9F5E8', k: '#1C5818', l: '#CEECC8' }, // Week 2 גבורה
  { a: '#5EA020', b: '#EDF5DF', k: '#2E5408', l: '#D6ECC0' }, // Week 3 תפארת
  { a: '#7E9E10', b: '#F0F4D6', k: '#3E4E00', l: '#DCE8B0' }, // Week 4 נצח
  { a: '#A09A10', b: '#F4F2D0', k: '#504800', l: '#E2DCA0' }, // Week 5 הוד
  { a: '#C09418', b: '#F6F0CA', k: '#604800', l: '#E8D890' }, // Week 6 יסוד
  { a: '#CCA230', b: '#F8F2C8', k: '#685000', l: '#EEE090' }, // Week 7 מלכות
];

// Hebrew number strings for days 1–49
export const HEB_NUMS = [
  '', 'א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ז׳', 'ח׳', 'ט׳', 'י׳',
  'י״א', 'י״ב', 'י״ג', 'י״ד', 'ט״ו', 'ט״ז', 'י״ז', 'י״ח', 'י״ט', 'כ׳',
  'כ״א', 'כ״ב', 'כ״ג', 'כ״ד', 'כ״ה', 'כ״ו', 'כ״ז', 'כ״ח', 'כ״ט', 'ל׳',
  'ל״א', 'ל״ב', 'ל״ג', 'ל״ד', 'ל״ה', 'ל״ו', 'ל״ז', 'ל״ח', 'ל״ט', 'מ׳',
  'מ״א', 'מ״ב', 'מ״ג', 'מ״ד', 'מ״ה', 'מ״ו', 'מ״ז', 'מ״ח', 'מ״ט',
];

// ─── CALCULATIONS ─────────────────────────────────────────────────

/**
 * Get the current Omer day number (1–49) based on today's calendar date.
 * Does NOT account for sunset — for that, use getSunsetAwareDay().
 * @returns {number} 1–49
 */
export function getTodayOmerDay() {
  const start = new Date(OMER_START_DATE);
  start.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diff = Math.floor((now - start) / 86400000) + 1;
  return Math.max(1, Math.min(49, diff));
}

/**
 * Get the Omer day number accounting for sunset.
 * If current time is AFTER today's sunset → return tomorrow's day.
 *
 * @param {Date|null} sunsetTime - Today's sunset time. If null, uses calendar day only.
 * @returns {number} 1–49
 */
export function getSunsetAwareDay(sunsetTime = null) {
  const calendarDay = getTodayOmerDay();
  if (!sunsetTime) return calendarDay;
  const now = new Date();
  if (now >= sunsetTime) {
    return Math.min(49, calendarDay + 1);
  }
  return calendarDay;
}

/**
 * Get week index (0–6) for a given day number.
 * @param {number} dayNum - 1–49
 * @returns {number} 0–6
 */
export function getWeekIndex(dayNum) {
  return Math.floor((dayNum - 1) / 7);
}

/**
 * Get day-in-week index (0–6) for a given day number.
 * @param {number} dayNum - 1–49
 * @returns {number} 0–6
 */
export function getDayInWeekIndex(dayNum) {
  return (dayNum - 1) % 7;
}

/**
 * Get the sefirah name for a given day number.
 * Format: "[day sefirah] שב[week sefirah]"
 * @param {number} dayNum - 1–49
 * @returns {string} e.g. "תפארת שבחסד"
 */
export function getSefirahForDay(dayNum) {
  const wi = getWeekIndex(dayNum);
  const di = getDayInWeekIndex(dayNum);
  return `${SEFIROT[di]} שב${SEFIROT[wi]}`;
}

/**
 * Get the week name (sefirah) for a given day number.
 * @param {number} dayNum - 1–49
 * @returns {string} e.g. "חסד"
 */
export function getWeekName(dayNum) {
  return SEFIROT[getWeekIndex(dayNum)];
}

/**
 * Get the Hebrew number string for a day.
 * @param {number} dayNum - 1–49
 * @returns {string} e.g. "ג׳"
 */
export function getHebNum(dayNum) {
  return HEB_NUMS[dayNum] || String(dayNum);
}

/**
 * Get the CMS slug for a given day number.
 * Matches the slug field in the Days CMS collection.
 * @param {number} dayNum - 1–49
 * @returns {string} e.g. "day-3"
 */
export function getDaySlug(dayNum) {
  return `day-${dayNum}`;
}

/**
 * Get color tokens for a given day number.
 * @param {number} dayNum - 1–49
 * @returns {{a, b, k, l}} color object
 */
export function getColorsForDay(dayNum) {
  return WEEK_COLORS[getWeekIndex(dayNum)];
}

/**
 * Get full day info object — used throughout the app.
 * @param {number} dayNum - 1–49
 * @returns {object}
 */
export function getDayInfo(dayNum) {
  const safe = Math.max(1, Math.min(49, dayNum));
  const wi = getWeekIndex(safe);
  const di = getDayInWeekIndex(safe);
  return {
    dayNum: safe,
    hebNum: getHebNum(safe),
    weekIndex: wi,
    weekName: SEFIROT[wi],
    dayInWeekIndex: di,
    sefirah: getSefirahForDay(safe),
    accentWord: SEFIROT[di],
    colors: WEEK_COLORS[wi],
    slug: getDaySlug(safe),
    daysRemaining: 49 - safe,
    tomorrow: safe < 49 ? getDaySlug(safe + 1) : null,
    yesterday: safe > 1 ? getDaySlug(safe - 1) : null,
  };
}
