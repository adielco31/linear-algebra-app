# אלגברה לינארית — תרגול אינטראקטיבי

PWA לתרגול אלגברה לינארית לסטודנטים. עובד offline, מותקן כאפליקציה, ושומר התקדמות בין סשנים.

## MVP — פרק נוכחי

**דירוג מטריצות ופתרון מערכות משוואות**
- 5 שיעורים עם הסברים, דוגמאות פתורות ותרגול
- 50 שאלות (multiple-choice, numeric-answer, find-the-mistake, conceptual)
- מעקב התקדמות וחזרה על טעויות (SRS)
- עמוד משוב למשתמשי MVP

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + Vite 8 |
| Styling | Tailwind CSS v4 (RTL) |
| Routing | React Router v7 |
| Auth & DB | Supabase JS v2 |
| Math | KaTeX |
| Offline | Service Worker (manual) |

---

## Local Development

### Prerequisites

- Node.js 18+
- npm 9+

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables
cp .env.example .env.local
# Fill in your Supabase URL and anon key (see .env.example for instructions)

# 3. Start dev server
npm run dev
```

The app runs in **localStorage-only mode** if Supabase env vars are absent — no backend required for local development.

### Available scripts

```bash
npm run dev      # Dev server with HMR
npm run build    # Production build → dist/
npm run preview  # Preview the production build locally
npm run lint     # ESLint
```

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the values.

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | No (degrades gracefully) | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | No (degrades gracefully) | Supabase public anon key |

> **Security:** `VITE_*` variables are embedded in the JS bundle — visible to users. Only the public anon key belongs here. Never put `service_role`, Claude API keys, or any secret in `VITE_*` variables.

---

## Deploying to Vercel

### One-click (recommended)

1. Push the repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) → Import the repo
3. Vercel auto-detects Vite — no framework config needed
4. Add environment variables in **Project Settings → Environment Variables**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Click **Deploy**

The `vercel.json` at the root handles SPA routing (all paths → `index.html`).

### Manual (Vercel CLI)

```bash
npm install -g vercel
vercel login
vercel --prod
```

### Other platforms

The `dist/` folder is a plain static site. It deploys to any CDN:

- **Netlify:** Add a `public/_redirects` file: `/*  /index.html  200`
- **GitHub Pages:** Requires a hash router or GitHub Actions workaround (BrowserRouter doesn't work without rewrite support)
- **AWS S3 + CloudFront:** Configure a custom error page to redirect 404 → index.html

---

## PWA

The app is installable as a PWA on Android, iOS (Safari → Add to Home Screen), and desktop Chrome.

- **Manifest:** `public/manifest.webmanifest`
- **Service worker:** `public/sw.js` (stale-while-revalidate for assets, network-first for navigation)
- **Icons:** `public/icons/icon-192.png`, `public/icons/icon-512.png`

After a new deployment, the service worker updates automatically on the next page load.

---

## Architecture Notes

### Data persistence

All progress data is dual-written:
1. **localStorage** — immediate, synchronous, always available
2. **Supabase** — async, fire-and-forget, only when `isSupabaseEnabled`

This means the app works fully offline. Data syncs when Supabase is configured.

### localStorage keys

| Key | Contents |
|-----|----------|
| `la_sessions` | Practice session history |
| `la_mistakes` | Answered questions + mistake log |
| `la_srs` | Spaced repetition scheduling data |
| `la_feedback` | MVP user feedback |

### Adding a new module

1. Add lesson definitions to `src/data/modules.js`
2. Add questions to `src/data/questions.js` (follow existing schema)
3. Add a formula entry to `LESSON_FORMULA` in `src/pages/LessonPage.jsx` if needed
4. Run `npm run build` to verify

### Supabase schema

See `SUPABASE_SCHEMA.md` for the database schema and RLS policies.

---

## Security Checklist

- [x] No API keys or secrets in source code
- [x] Supabase anon key only (RLS enforced server-side)
- [x] `.env.local` in `.gitignore`
- [x] Claude API key design: backend-only (Edge Function), never in frontend bundle
- [x] Auth via Supabase Auth (email/password) — no custom auth logic
