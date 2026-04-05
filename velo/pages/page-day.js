/**
 * page-day.js — Dynamic Day Page Code
 * Place at: Pages → day (dynamic page) → Page Code in Wix Studio
 *
 * This file controls the daily challenge page.
 * It connects the Wix CMS dataset to the UI elements,
 * handles the sunset timer, progress tracking, and all interactions.
 *
 * ── WIX ELEMENT IDs REQUIRED ON THE PAGE ───────────────────────────────────
 * All elements must have these IDs set in the Wix Studio editor:
 *
 * HEADER:
 *   #hdrDay        — Text element: "יום ג׳ · 3/49"
 *   #hdrTime       — Text element: "03:22 · עד שקיעה"
 *   #hdrProgress   — Box (progress bar fill, width controlled by JS)
 *   #btnMap        — Button: opens journey map
 *
 * HERO:
 *   #ctxPill       — Text element: "חסד · תפארת שבחסד"
 *   #heroTitle1    — Text element: accent word (e.g. "לשמוע")
 *   #heroTitle2    — Text element: second line (e.g. "בלי לפתור")
 *
 * CHALLENGE:
 *   #challengeText — Text element: the challenge body
 *   #contextText   — Text element: the context line below
 *
 * DONE ZONE:
 *   #streakText    — Text element: "7 ימים ברצף"
 *   #btnDone       — Button: "הייתי כאן"
 *   #tomorrowPeek  — Container box (hidden until done)
 *   #tomorrowDay   — Text: "מחר · יום ד׳"
 *   #tomorrowSef   — Text: "גבורה שבחסד"
 *   #tomorrowSub   — Text: "יתגלה עם שקיעת הלילה"
 *   #emailRow      — Container box (hidden until done)
 *   #emailInput    — Input field
 *   #btnEmail      — Button: "שלח"
 *   #emailSuccess  — Text element (hidden until email sent)
 *
 * SECTIONS:
 *   #sectionDeepen   — Container (accordion)
 *   #readingContent  — Rich text or text element
 *   #sectionQuestions — Container (accordion)
 *   #q1, #q2, #q3   — Text elements for questions
 *
 * VIDEO:
 *   #videoBlock    — Container
 *   #videoTitle    — Text element
 *   #videoDuration — Text element
 *   #videoPlayer   — Video component (or iframe)
 *
 * SONG:
 *   #songTitle     — Text element
 *   #songArtist    — Text element
 *   #btnPlaySong   — Button
 *
 * NAV:
 *   #btnPrev       — Button: yesterday
 *   #btnNext       — Button: tomorrow (locked until done)
 *
 * ── ─────────────────────────────────────────────────────────────────────── */

import wixLocation from 'wix-location';
import wixWindow   from 'wix-window';
import { local }   from 'wix-storage-frontend';

import {
  getDayInfo,
  getHebNum,
  getSefirahForDay,
} from 'public/omer';

import {
  markDayDone,
  isDayDone,
  getStreak,
  getStreakText,
  saveReminderEmail,
  hasReminder,
} from 'public/storage';

import { getSunsetTime } from 'backend/sunset';

// ─── STATE ─────────────────────────────────────────────────────────────────

let dayInfo = null;
let sunsetMs = null;
let timerInterval = null;
let isDone = false;

// ─── PAGE READY ────────────────────────────────────────────────────────────

$w.onReady(async function () {
  // 1. Get current day from URL slug (Wix provides this automatically)
  const slug = wixLocation.path[0]; // "day-3"
  const dayNum = parseInt(slug.replace('day-', ''), 10);

  if (!dayNum || dayNum < 1 || dayNum > 49) {
    wixLocation.to('/');
    return;
  }

  dayInfo = getDayInfo(dayNum);
  isDone  = isDayDone(dayNum);

  // 2. Load CMS data (Wix dataset is auto-connected, but we can also query)
  // The dynamic page auto-populates #dataset1 with the matching Day item.
  // We use dataset events to know when data is ready.
  $w('#dataset1').onReady(() => {
    loadFromDataset();
  });

  // 3. Apply week colors
  applyWeekColors();

  // 4. Populate static (non-CMS) elements
  populateStaticElements();

  // 5. Set up sunset timer
  initSunsetTimer();

  // 6. Set up interactions
  setupInteractions();

  // 7. Restore done state if already done
  if (isDone) {
    showDoneState(false);
  }
});

// ─── CMS DATA ──────────────────────────────────────────────────────────────

function loadFromDataset() {
  const item = $w('#dataset1').getCurrentItem();
  if (!item) return;

  // Hero title (from CMS)
  $w('#heroTitle1').text = item.titleLine1 || dayInfo.accentWord;
  $w('#heroTitle2').text = item.titleLine2 || '';

  // Challenge
  $w('#challengeText').text = item.challengeText || '';
  $w('#contextText').text   = item.contextText   || '';

  // Reading section
  if (item.readingContent) {
    $w('#readingContent').text = item.readingContent;
    $w('#sectionDeepen').show();
  } else {
    $w('#sectionDeepen').hide();
  }

  // Questions
  $w('#q1').text = item.question1 || '';
  $w('#q2').text = item.question2 || '';
  $w('#q3').text = item.question3 || '';

  // Video
  if (item.videoUrl) {
    $w('#videoTitle').text    = item.videoTitle    || dayInfo.sefirah;
    $w('#videoDuration').text = item.videoDuration || '';
    $w('#videoPlayer').src    = item.videoUrl;
    $w('#videoBlock').show();
  } else {
    $w('#videoBlock').hide();
  }

  // Song
  $w('#songTitle').text  = item.songTitle  || '';
  $w('#songArtist').text = item.songArtist || '';
  if (!item.songTitle) $w('#songCard').hide();
}

// ─── STATIC ELEMENTS ───────────────────────────────────────────────────────

function populateStaticElements() {
  const d = dayInfo;

  // Header
  $w('#hdrDay').text = `יום ${d.hebNum} · ${d.dayNum}/49`;

  // Context pill
  $w('#ctxPill').text = `${d.weekName} · ${d.sefirah}`;

  // Tomorrow peek content
  const tmrDay  = Math.min(49, d.dayNum + 1);
  const tmrInfo = getDayInfo(tmrDay);
  $w('#tomorrowDay').text = `מחר · יום ${tmrInfo.hebNum}`;
  $w('#tomorrowSef').text = tmrInfo.sefirah;
  $w('#tomorrowSub').text = 'האתגר יתגלה עם שקיעת הלילה';

  // Streak
  const streak = getStreak(d.dayNum);
  $w('#streakText').text = getStreakText(streak, d.dayNum);

  // Done button label
  $w('#btnDone').label = 'הייתי כאן';

  // Nav buttons
  const prevLabel = d.dayNum > 1
    ? `← יום ${getHebNum(d.dayNum - 1)}`
    : '';
  const nextLabel = d.dayNum < 49
    ? `יום ${getHebNum(d.dayNum + 1)} →`
    : 'יום שבועות';

  $w('#btnPrev').label   = prevLabel;
  $w('#btnNext').label   = nextLabel;
  $w('#btnPrev').disable(); // will enable below if valid
  if (d.dayNum > 1)  $w('#btnPrev').enable();
  if (!isDone)       $w('#btnNext').disable(); // locked until done
}

// ─── WEEK COLORS ───────────────────────────────────────────────────────────
// Note: In Wix Studio, CSS custom properties can't be set via JS directly.
// Use element styles or switch between pre-defined CSS classes per week.
// Convention: add class "week-1" through "week-7" to the page container.

function applyWeekColors() {
  // Method 1: toggle CSS class on the page container
  const container = $w('#pageContainer');
  for (let i = 1; i <= 7; i++) {
    container.classList.remove(`week-${i}`);
  }
  container.classList.add(`week-${dayInfo.weekIndex + 1}`);

  // Method 2: directly set background color on key elements
  // (fallback if CSS classes aren't available)
  const { a: accent, l: light, k: dark } = dayInfo.colors;
  $w('#challengeCard').style.backgroundColor = light;
  $w('#btnDone').style.backgroundColor       = accent;
  $w('#ctxPill').style.backgroundColor       = light;
  $w('#ctxPill').style.color                 = dark;
}

// ─── SUNSET TIMER ──────────────────────────────────────────────────────────

async function initSunsetTimer() {
  try {
    // Get user's location for accurate sunset (requires browser permission)
    const position = await getGeolocation();
    const { sunsetMs: ms } = await getSunsetTime(
      position?.lat || 31.7683,
      position?.lng || 35.2137
    );
    sunsetMs = ms;
  } catch {
    // Fallback: 19:30 local time
    const fallback = new Date();
    fallback.setHours(19, 30, 0, 0);
    sunsetMs = fallback.getTime();
  }

  updateTimer(); // Immediate render
  timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
  if (!sunsetMs) return;

  const now  = Date.now();
  const secs = Math.max(0, Math.floor((sunsetMs - now) / 1000));

  // Format time
  const h = Math.floor(secs / 3600);
  const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  const timeStr = h > 0 ? `${h}:${m}` : `${m}:${s}`;

  // Progress bar (% of 12-hour day elapsed)
  const DAY_SECS = 12 * 3600;
  const pct = Math.min(100, Math.round((1 - secs / DAY_SECS) * 100));
  $w('#hdrProgress').style.width = `${pct}%`;

  if (secs === 0) {
    $w('#hdrTime').text = 'שקיעה · יום חדש מתחיל';
    // Auto-navigate to tomorrow after 5 seconds
    setTimeout(() => {
      if (dayInfo.tomorrow) wixLocation.to(`/day/${dayInfo.tomorrow}`);
    }, 5000);
    clearInterval(timerInterval);
    return;
  }

  $w('#hdrTime').text = `${timeStr} · עד שקיעה`;

  // Urgency state
  if (secs < 1800) {
    // Under 30 min — add "urgent" visual class
    $w('#hdrTime').classList.add('urgent');
  } else {
    $w('#hdrTime').classList.remove('urgent');
  }
}

// ─── INTERACTIONS ──────────────────────────────────────────────────────────

function setupInteractions() {
  // Done button
  $w('#btnDone').onClick(() => handleDone());

  // Email button
  $w('#btnEmail').onClick(() => handleEmailSubmit());

  // Navigation
  $w('#btnPrev').onClick(() => {
    if (dayInfo.yesterday) wixLocation.to(`/day/${dayInfo.yesterday}`);
  });
  $w('#btnNext').onClick(() => {
    if (isDone && dayInfo.tomorrow) wixLocation.to(`/day/${dayInfo.tomorrow}`);
  });

  // Map button
  $w('#btnMap').onClick(() => {
    $w('#mapLightbox').open(); // or use wixWindow.openLightbox
  });
}

// ─── DONE FLOW ─────────────────────────────────────────────────────────────

async function handleDone() {
  if (isDone) return;
  isDone = true;

  // Persist
  markDayDone(dayInfo.dayNum);

  // Update button
  $w('#btnDone').label = `הייתי כאן · יום ${dayInfo.hebNum} של הספירה`;
  $w('#btnDone').style.backgroundColor = '#4CAF78';
  $w('#btnDone').disable();

  // Update streak
  const streak = getStreak(dayInfo.dayNum);
  $w('#streakText').text = getStreakText(streak, dayInfo.dayNum);

  // Unlock tomorrow nav
  $w('#btnNext').enable();

  // Animation delay then reveal
  await delay(600);
  $w('#tomorrowPeek').show('fade', { duration: 500 });

  await delay(200);
  $w('#emailRow').show('fade', { duration: 400 });

  // Show WhatsApp CTA after another delay
  await delay(800);
  if ($w('#whatsappCTA')) $w('#whatsappCTA').show('fade', { duration: 400 });
}

function showDoneState(animate) {
  // Called on page load if already done
  $w('#btnDone').label = `הייתי כאן · יום ${dayInfo.hebNum} של הספירה`;
  $w('#btnDone').style.backgroundColor = '#4CAF78';
  $w('#btnDone').disable();
  $w('#btnNext').enable();

  const streak = getStreak(dayInfo.dayNum);
  $w('#streakText').text = getStreakText(streak, dayInfo.dayNum);

  if (animate) {
    $w('#tomorrowPeek').show('fade', { duration: 300 });
    $w('#emailRow').show('fade', { duration: 300 });
  } else {
    $w('#tomorrowPeek').show();
    // If email already saved, show success state
    if (hasReminder()) {
      $w('#emailInput').hide();
      $w('#btnEmail').hide();
      $w('#emailSuccess').show();
      $w('#emailRow').show();
    } else {
      $w('#emailRow').show();
    }
  }
}

// ─── EMAIL ─────────────────────────────────────────────────────────────────

async function handleEmailSubmit() {
  const email = $w('#emailInput').value.trim();
  if (!email || !email.includes('@')) {
    $w('#emailInput').updateValidityIndication();
    return;
  }

  // Save locally
  saveReminderEmail(email);

  // Create Wix CRM contact (sends reminder via Wix Automations)
  try {
    const { createContact } = await import('wix-crm-backend');
    await createContact({
      emails: [{ email, tag: 'etgar49-reminder' }],
      labels: ['etgar49-participant'],
      info: {
        extendedFields: {
          'custom.lastDay': String(dayInfo.dayNum),
          'custom.streak': String(getStreak(dayInfo.dayNum)),
        }
      }
    });
  } catch (e) {
    console.log('CRM contact creation failed (non-critical):', e.message);
  }

  // Update UI
  $w('#emailInput').hide();
  $w('#btnEmail').hide();
  $w('#emailSuccess').text = `קיבלנו · נזכיר לך מחר לפני השקיעה`;
  $w('#emailSuccess').show();
}

// ─── GEOLOCATION ───────────────────────────────────────────────────────────

function getGeolocation() {
  return new Promise((resolve, reject) => {
    if (!navigator?.geolocation) return reject(new Error('no geolocation'));
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      err => reject(err),
      { timeout: 5000 }
    );
  });
}

// ─── UTILS ─────────────────────────────────────────────────────────────────

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
