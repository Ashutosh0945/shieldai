# ShieldAI — Complete Deployment Guide

## STEP 1 — Supabase Setup (5 min)

1. Go to https://supabase.com → "New Project"
2. Name: `shieldai`  |  Region: Singapore (closest to India)
3. Once created → SQL Editor → New Query
4. Paste entire `supabase_schema.sql` → click Run
5. Go to Settings → API:
   - Copy Project URL  → VITE_SUPABASE_URL
   - Copy anon key    → VITE_SUPABASE_ANON_KEY
6. Go to Authentication → Settings:
   - Site URL: your Vercel URL (add after deployment)
   - Confirm Email: can be disabled for demo


## STEP 2 — Local Setup (2 min)

cd shieldai2
cp .env.example .env
# Open .env, paste your Supabase values
npm install
npm run dev
# Open http://localhost:5173


## STEP 3 — Deploy to Vercel (3 min)

### Option A: CLI (fastest)
npm install -g vercel
vercel                              # follow prompts (Vite framework)
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel --prod

### Option B: GitHub + Dashboard
1. Push to GitHub repo
2. vercel.com → Import Project → select repo
3. Framework: Vite  |  Root: .
4. Add env vars: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
5. Deploy → done in ~60 seconds

## STEP 4 — Fix Supabase Auth Redirect

After deployment:
- Supabase Dashboard → Authentication → URL Configuration
- Site URL: https://your-app.vercel.app
- Add to Redirect URLs: https://your-app.vercel.app/**


## Project Structure

shieldai2/
├── src/
│   ├── lib/
│   │   ├── supabase.js      ← Supabase client
│   │   ├── db.js            ← All DB + auth functions
│   │   └── analysis.js      ← Scam + currency AI logic
│   ├── context/
│   │   └── AuthContext.jsx  ← Global auth state
│   ├── components/
│   │   ├── Navbar.jsx       ← Auth-aware navigation
│   │   ├── Footer.jsx
│   │   ├── Modal.jsx
│   │   ├── ScamChecker.jsx  ← Logs to scam_checks table
│   │   ├── CurrencyScanner.jsx
│   │   └── ReportWizard.jsx ← Saves to fraud_reports table
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Tools.jsx
│   │   ├── Dashboard.jsx    ← Reads live_alerts from DB
│   │   ├── ReportFraud.jsx
│   │   ├── About.jsx
│   │   ├── Login.jsx        ← Supabase signIn
│   │   ├── Register.jsx     ← Supabase signUp
│   │   └── Profile.jsx      ← Protected, shows user history
│   ├── App.jsx              ← Routes + ProtectedRoute
│   ├── main.jsx
│   └── styles/global.css
├── supabase_schema.sql      ← Run this in Supabase SQL editor
├── vercel.json              ← SPA routing fix
├── .env.example
└── DEPLOYMENT.md

## Supabase Tables

| Table           | Purpose                           | Auth Required |
|-----------------|-----------------------------------|---------------|
| profiles        | User profile (auto-created)       | Yes           |
| fraud_reports   | Citizen fraud complaints          | No (anon ok)  |
| scam_checks     | Call/message analysis logs        | No (anon ok)  |
| currency_scans  | Currency scan results             | No (anon ok)  |
| live_alerts     | Dashboard feed                    | Public read   |
| city_hotspots   | Map data                          | Public read   |

## Features Built

- Full Supabase Auth (email + password, with email verification)
- Protected /profile route — redirects to login if not signed in
- Auth-aware Navbar (shows user name + sign out when logged in)
- Scam checks saved to DB with user_id (if logged in)
- Fraud reports saved to DB with full details
- Profile page shows history of reports + scam checks
- Auto-created profile row on signup via DB trigger
- Row Level Security: users only see their own data
- Live alerts feed from DB (falls back to mock if DB not configured)
- Dashboard stats from DB
- PWA manifest included

## Emergency Helplines (for demo)

- 1930  — National Cyber Crime Helpline (24x7)
- 14440 — RBI helpline for fake currency
- cybercrime.gov.in — NCRP online complaint portal
