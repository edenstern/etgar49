# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Project Is

**אתגר 49** (Etgar 49) is a Hebrew daily-challenge web app for the 49-day Omer period between Passover and Shavuot (April 2 – May 20, 2026). Each day has a Kabbalistic theme (sefirah), a personal challenge, reflection questions, video, and song.

There are two parallel implementations in this repo:

| File/Dir | What it is |
|---|---|
| `index.html` | Standalone prototype — fully self-contained, no server needed. Open directly in a browser. This is the live demo deployed to GitHub Pages. |
| `redesign.html`, `empathy.html`, `strategy.html` | Design explorations and UX research documents |
| `velo/` | Production implementation targeting **Wix Studio + Velo** (Wix's JS platform) |

## Running Locally

The standalone prototype requires no build step:
```bash
open index.html          # macOS
npx serve .              # or serve via HTTP (needed for some browser APIs)
```

The Velo code (`velo/`) cannot run outside of Wix Studio — it uses Wix-specific APIs (`wix-fetch`, `wix-storage-frontend`, `$w()` element selectors).

## Architecture

### Standalone (`index.html`)

Everything is inline — HTML, CSS, and JS in one file. Key JS sections at the bottom of the file:
- **Data layer**: `DAYS` array (49 entries) and `WEEK_COLORS` define all content and theming
- **State**: `currentDay` (1–49), `isDone` (boolean from `localStorage`)
- **Color system**: 4 CSS variables (`--wa`, `--wb`, `--wk`, `--wl`) are swapped per week to shift the entire UI from green (week 1) to gold (week 7). These map to accent/background/dark/light respectively.
- **Sunset timer**: Countdown to today's sunset, fetched from the Hebcal API (`hebcal.com/zmanim`). After sunset, the next day becomes active.
- **Done flow**: Clicking "הייתי כאן" sets `localStorage` key `etgar49_done_{n}` and animates the done state.

### Wix Velo (`velo/`)

Three-layer architecture:

```
backend/sunset.jsw      ← Server-side: fetches sunset from Hebcal API
                           Exports: getSunsetTime(), getOmerDayWithSunset()

public/omer.js          ← Shared pure-JS library (runs on frontend)
                           Exports: getTodayOmerDay(), getSunsetAwareDay(),
                           getDayInfo(), getSefirahForDay(), WEEK_COLORS, etc.

public/storage.js       ← localStorage wrapper using wix-storage-frontend

pages/masterPage.js     ← Global: homepage redirect to today's /day/{slug}
pages/page-day.js       ← Dynamic page: binds CMS data to element IDs,
                           runs countdown timer, handles done state
backend/router.js       ← URL routing: GET / → redirect to today's day slug
```

Content is stored in two **Wix CMS collections**:
- `Days` — 49 items, slug pattern `day-{n}`, connected to the dynamic page at `/day/{slug}`
- `Weeks` — 7 items with color data per sefirah, referenced from `Days`

### Omer Day Calculation

The calendar anchor is `OMER_START_DATE = '2026-04-02'` (update each year in `velo/public/omer.js`).

The day boundary is **sunset**, not midnight. The flow:
1. Compute calendar day from `OMER_START_DATE`
2. Fetch today's sunset from Hebcal (`shkiah` field)
3. If `now >= sunset` → advance to next day
4. Fallback: estimate sunset at 19:30 if API fails

### Design Tokens

The color palette is encoded as CSS custom properties. Four active tokens change per week:
- `--wa` (accent) · `--wb` (background) · `--wk` (dark/text) · `--wl` (light/surface)

The full 7-week palette is in `omer.js → WEEK_COLORS` and mirrored in `index.html → :root`.

## Wix Studio Setup

Full setup instructions are in `velo/README.md`. The required element IDs for the Wix page are listed there (e.g. `hdrDay`, `btnDone`, `challengeText`, etc.) — these must match exactly between the page designer and `page-day.js`.

## Content

`velo/cms-content.md` contains the authored content for all 49 days. `velo/cms-schema.md` documents the exact CMS field structure.

The `questions` field uses Option A (three separate fields `question1`, `question2`, `question3`) per the schema recommendation.

## GitHub Pages

The live demo (`index.html`) is published at `https://edenstern.github.io/etgar49/` via GitHub Pages from the `main` branch root.
