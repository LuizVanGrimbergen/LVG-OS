# LVG OS

A personal, mobile-first PWA to keep track of my planning, goals, travel and personal growth. For my own use only.

## Stack

- [Next.js](https://nextjs.org) 16 (App Router, TypeScript, `src/` directory)
- [Tailwind CSS](https://tailwindcss.com) v4 + [shadcn/ui](https://ui.shadcn.com)
- [Motion](https://motion.dev) for animations
- [lucide-react](https://lucide.dev) for icons
- [Supabase](https://supabase.com) (`@supabase/supabase-js` + `@supabase/ssr`)
- [Serwist](https://serwist.pages.dev) for the service worker (PWA)
- [d3-geo](https://d3js.org/d3-geo) + [world-atlas](https://github.com/topojson/world-atlas) for the travel map (rendered on the server)

## Running locally

```bash
npm install
cp .env.local.example .env.local   # fill in your Supabase URL and publishable key
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

The service worker is disabled during `npm run dev`. To test the PWA:

```bash
npm run build && npm run start
```

## Supabase setup (once)

1. Run [`supabase/schema.sql`](supabase/schema.sql) in the Supabase SQL Editor.
2. Authentication → Emails → **Magic Link** template: include `{{ .Token }}` so the email contains a 6-digit code.
3. Authentication → URL Configuration → Site URL: `https://lvg-os.vercel.app`.
4. After your first sign-in: turn off **Allow new users to sign up**.
5. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `.env.local` and in Vercel.

## Structure

```
src/
  app/            routes: / (Home), /tasks, /goals, /travel, /about
  components/
    ui/           shadcn/ui components
    layout/       menu button, page header, bottom sheet
  features/       modules: planning, goals, travel, about
  hooks/          shared React hooks
  lib/            helpers, incl. supabase/client.ts and supabase/server.ts
  types/          shared types
```
