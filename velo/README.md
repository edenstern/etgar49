# Etgar49 — Wix Studio Velo Code

## File Structure

```
velo/
├── README.md                   ← this file
├── cms-schema.md               ← CMS collections structure (Days + Weeks)
│
├── backend/
│   ├── router.js               ← URL routing: / → today's day
│   └── sunset.jsw              ← Sunset time via Hebcal API
│
├── public/
│   ├── omer.js                 ← Omer day calculations (pure JS, shared)
│   └── storage.js              ← localStorage wrapper (Wix wix-storage-frontend)
│
└── pages/
    ├── masterPage.js           ← Global code: homepage redirect + logo nav
    └── page-day.js             ← Dynamic day page: CMS + timer + done flow
```

---

## Setup Order in Wix Studio

### Step 1 — CMS Collections
1. Open Wix Studio → CMS
2. Create `Weeks` collection (7 items) — see cms-schema.md
3. Create `Days` collection (49 items) — see cms-schema.md
4. Enter all 49 days of content (or start with week 1 and set published: false for others)

### Step 2 — Dynamic Page
1. Pages → Add Page → Dynamic Page
2. Name: `day`
3. Connect to `Days` collection
4. URL pattern: `/day/{slug}`
5. Design the page layout with all required element IDs (see page-day.js header)
6. Connect dataset to page: Wix Studio → Add Dataset → Days, Read-only

### Step 3 — Backend Router
1. Code Files → Backend → Create `router.js`
2. Paste content from velo/backend/router.js
3. Create `sunset.jsw` — paste content from velo/backend/sunset.jsw
4. In Wix Studio → Router Settings → Add router with prefix `day`

### Step 4 — Public Utilities
1. Code Files → Public → Create `omer.js`
2. Create `storage.js`
3. Paste respective contents

### Step 5 — Page Code
1. Open the `day` dynamic page
2. Code panel (bottom) → paste content of velo/pages/page-day.js
3. Open Master Page → code → paste content of velo/pages/masterPage.js

### Step 6 — Element IDs
Set these IDs on page elements in the Wix Studio editor (right-click → Properties):

| Element | ID | Type |
|---------|-----|------|
| Header day text | `hdrDay` | Text |
| Header time text | `hdrTime` | Text |
| Progress bar fill | `hdrProgress` | Box |
| Map button | `btnMap` | Button |
| Context pill text | `ctxPill` | Text |
| Hero accent word | `heroTitle1` | Text |
| Hero line 2 | `heroTitle2` | Text |
| Challenge body | `challengeText` | Text |
| Context line | `contextText` | Text |
| Streak text | `streakText` | Text |
| Done button | `btnDone` | Button |
| Tomorrow peek container | `tomorrowPeek` | Box |
| Tomorrow day label | `tomorrowDay` | Text |
| Tomorrow sefirah | `tomorrowSef` | Text |
| Tomorrow sub | `tomorrowSub` | Text |
| Email row container | `emailRow` | Box |
| Email input | `emailInput` | Input |
| Send email button | `btnEmail` | Button |
| Email success text | `emailSuccess` | Text |
| Reading content | `readingContent` | Text |
| Question 1 | `q1` | Text |
| Question 2 | `q2` | Text |
| Question 3 | `q3` | Text |
| Video block container | `videoBlock` | Box |
| Video title | `videoTitle` | Text |
| Video duration | `videoDuration` | Text |
| Song title | `songTitle` | Text |
| Song artist | `songArtist` | Text |
| Prev day button | `btnPrev` | Button |
| Next day button | `btnNext` | Button |
| Page container (for week CSS class) | `pageContainer` | Box |
| WhatsApp CTA container | `whatsappCTA` | Box |
| Map lightbox | `mapLightbox` | Lightbox |

### Step 7 — CSS (Week Colors)
In Wix Studio → Site Design → Custom CSS (or Global CSS):

```css
/* Week color classes — applied to #pageContainer by JS */
.week-1 { --wa: #2E9B55; --wb: #E8F5EE; --wk: #185C30; --wl: #D0ECDA; }
.week-2 { --wa: #3E9E38; --wb: #E9F5E8; --wk: #1C5818; --wl: #CEECC8; }
.week-3 { --wa: #5EA020; --wb: #EDF5DF; --wk: #2E5408; --wl: #D6ECC0; }
.week-4 { --wa: #7E9E10; --wb: #F0F4D6; --wk: #3E4E00; --wl: #DCE8B0; }
.week-5 { --wa: #A09A10; --wb: #F4F2D0; --wk: #504800; --wl: #E2DCA0; }
.week-6 { --wa: #C09418; --wb: #F6F0CA; --wk: #604800; --wl: #E8D890; }
.week-7 { --wa: #CCA230; --wb: #F8F2C8; --wk: #685000; --wl: #EEE090; }

.hdr-time.urgent { color: var(--wa); animation: hdr-pulse 1.4s ease-in-out infinite; }
@keyframes hdr-pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
```

### Step 8 — Test
1. Preview the site
2. Navigate to `/day/day-3` — should show Day 3 (תפארת שבחסד)
3. Navigate to `/` — should redirect to today's day
4. Click "הייתי כאן" — done state should appear
5. Check localStorage in browser devtools: `etgar49_done_3` = "1"
6. Refresh page — should show done state without animation

---

## Wix Automations (Email Reminders)

After step 6, set up in Wix Dashboard → Automations:
1. Trigger: Contact created with label "etgar49-participant"
2. Action: Send email (template: "תזכורת לאתגר 49")
3. Schedule: Daily at 17:30 Israel time
4. Condition: Contact has "etgar49-reminder" tag
5. Stop condition: Contact label "etgar49-complete" (set on day 49)

---

## Content Migration (49 Static Pages → CMS)

For each existing static page:
1. Copy challenge text → `challengeText` field
2. Copy reading text → `readingContent` field  
3. Copy 3 questions → `question1/2/3` fields
4. Add video URL → `videoUrl` field
5. Add song info → `songTitle`, `songArtist`, `songUrl`
6. Set `published: true`
7. Verify slug = `day-{n}`

CSV template for bulk import: [dayNumber, slug, sefirahFull, accentWord, titleLine1, titleLine2, challengeText, contextText, ...]
