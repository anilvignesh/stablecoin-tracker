# Stablecoin Tracker

A PWA learning tracker for a 6-week structured self-study program on stablecoins and cross-border payments.

## Stack

- React + Vite
- Tailwind CSS v4
- Supabase (magic link auth + progress sync)
- Deployed on Vercel

## Setup

1. **Clone and install**
   ```bash
   npm install
   ```

2. **Create `.env` from template**
   ```bash
   cp .env.example .env
   ```
   Fill in your Supabase project URL and anon key.

3. **Set up the database**
   Run `supabase-setup.sql` in your Supabase SQL Editor.

4. **Run locally**
   ```bash
   npm run dev
   ```

5. **Deploy to Vercel**
   - Connect the GitHub repo in the Vercel dashboard
   - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables
   - Every push to `main` auto-deploys

## Features

- Magic link authentication (no passwords)
- Progress synced across all devices via Supabase
- Per-resource notes with auto-save on blur
- Overall and per-week progress tracking
- Offline support via service worker (cached app shell)
- Installable PWA (Android + iOS "Add to Home Screen")
