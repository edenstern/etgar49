# Etgar49 — Wix CMS Schema
# Copy this structure when building collections in Wix Studio

## Collection 1: `Weeks` (7 items)

| Field Key       | Display Name     | Type        | Notes                          |
|-----------------|------------------|-------------|--------------------------------|
| `weekNumber`    | מספר שבוע        | Number      | 1–7, unique                    |
| `sefirahName`   | שם הספירה        | Text        | חסד / גבורה / תפארת…          |
| `colorAccent`   | צבע ראשי         | Text        | hex e.g. #2E9B55               |
| `colorBg`       | צבע רקע          | Text        | hex e.g. #E8F5EE               |
| `colorDark`     | צבע כהה          | Text        | hex e.g. #185C30               |
| `colorLight`    | צבע בהיר         | Text        | hex e.g. #D0ECDA               |
| `slug`          | Slug             | Text        | week-1 … week-7 (auto/manual) |

### Weeks data to enter:
| weekNumber | sefirahName | colorAccent | colorBg  | colorDark | colorLight |
|------------|-------------|-------------|----------|-----------|------------|
| 1 | חסד    | #2E9B55 | #E8F5EE | #185C30 | #D0ECDA |
| 2 | גבורה  | #3E9E38 | #E9F5E8 | #1C5818 | #CEECC8 |
| 3 | תפארת  | #5EA020 | #EDF5DF | #2E5408 | #D6ECC0 |
| 4 | נצח    | #7E9E10 | #F0F4D6 | #3E4E00 | #DCE8B0 |
| 5 | הוד    | #A09A10 | #F4F2D0 | #504800 | #E2DCA0 |
| 6 | יסוד   | #C09418 | #F6F0CA | #604800 | #E8D890 |
| 7 | מלכות  | #CCA230 | #F8F2C8 | #685000 | #EEE090 |

---

## Collection 2: `Days` (49 items)

| Field Key            | Display Name        | Type              | Notes                              |
|----------------------|---------------------|-------------------|------------------------------------|
| `dayNumber`          | מספר יום            | Number            | 1–49, unique, required             |
| `slug`               | Slug                | Text              | day-1 … day-49 (URL identifier)    |
| `sefirahFull`        | ספירה מלאה          | Text              | e.g. תפארת שבחסד                  |
| `accentWord`         | מילת המפתח          | Text              | e.g. תפארת (first word of sefirah) |
| `titleLine1`         | שורת כותרת 1        | Text              | e.g. לשמוע                         |
| `titleLine2`         | שורת כותרת 2        | Text              | e.g. בלי לפתור                     |
| `challengeText`      | טקסט האתגר          | Rich Text / Text  | 2–3 משפטים. הפעולה עצמה.          |
| `contextText`        | טקסט הקשר           | Text              | שורה אחת מתחת לאתגר               |
| `readingTitle`       | כותרת להעמיק        | Text              | optional                           |
| `readingContent`     | תוכן להעמיק         | Rich Text         | 3–5 פסקאות                        |
| `questions`          | שאלות עצמיות        | Repeated (Text)  | 3 שאלות — שדה חוזר               |
| `videoUrl`           | קישור וידאו         | URL               | YouTube / Vimeo embed URL          |
| `videoTitle`         | כותרת וידאו         | Text              | e.g. חסד שבחסד — ההקשבה כמתנה    |
| `videoDuration`      | אורך וידאו          | Text              | e.g. 4:32                          |
| `songTitle`          | שם השיר             | Text              |                                    |
| `songArtist`         | אמן                 | Text              |                                    |
| `songUrl`            | קישור שיר           | URL               | Spotify / YouTube                  |
| `songArtworkUrl`     | תמונת אלבום         | Image             | optional                           |
| `weekRef`            | שבוע (reference)    | Reference         | → Weeks collection                 |
| `published`          | פורסם               | Boolean           | false = טיוטה, true = חי          |

### Slug convention:
- Day 1  → `day-1`
- Day 25 → `day-25`
- Day 49 → `day-49`

### The `questions` field:
Wix Studio doesn't have a native "repeated text" field.
Use one of these approaches:
A) Three separate fields: `question1`, `question2`, `question3` (simplest)
B) Single Rich Text field with line-break separation (parse on frontend)
C) Wix CMS multi-reference to a `Questions` collection (most scalable)

**Recommended: Option A** for 49-day fixed content.

---

## Collection 3: `WeeklySummary` (7 items — optional, for summary screens)

| Field Key        | Display Name   | Type      | Notes                        |
|------------------|----------------|-----------|------------------------------|
| `weekNumber`     | מספר שבוע      | Number    | 1–7                          |
| `summaryTitle`   | כותרת סיכום    | Text      | e.g. "סיימת שבוע חסד"       |
| `reflectionQ`    | שאלת סיכום     | Text      | שאלה אחת לסיום השבוע        |
| `weekRef`        | שבוע           | Reference | → Weeks                      |

---

## Wix Studio Page Structure

```
Pages:
├── / (Home)
│     → Router redirect to today's day (see router.js)
│
├── /day/{slug}  ← DYNAMIC PAGE (connected to Days collection)
│     Slug field: dayNumber formatted as "day-{n}"
│     Template: the full daily page (see page-day.js)
│
├── /about
│     Static. Three-version about text.
│
├── /community  (optional)
│     WhatsApp CTA + social proof
│
└── /week-summary/{weekNumber}  (optional, days 7/14/21…49)
      Dynamic. Connected to WeeklySummary collection.
```

---

## Dynamic Page Setup in Wix Studio

1. In Pages panel → Add Page → Dynamic Page
2. Connect to `Days` collection
3. URL pattern: `/day/{slug}`
4. In page settings → SEO:
   - Title: `{sefirahFull} — אתגר 49`
   - Description: `{challengeText}` (first 120 chars)
5. Connect elements to dataset fields (see page-day.js for programmatic approach)

---

## Dataset on Dynamic Page

- Dataset ID: `"Days"`
- Mode: Read-only
- Page size: 1 (one day at a time)
- Filter: by `slug` (automatically set by dynamic page routing)

---

## Migration Plan: 49 Static Pages → 1 Dynamic Page

1. Export content from existing Wix pages (manually or via Wix API)
2. Create `Days` CMS collection with schema above
3. Import all 49 days as CMS items (CSV import supported in Wix)
4. Build dynamic page template connected to `Days`
5. Set up router to redirect `/` → today's day
6. Set up 301 redirects from old static URLs (if any) → new `/day/day-{n}`
7. Toggle `published: true` per item as content is verified
8. Unpublish / redirect old static pages
