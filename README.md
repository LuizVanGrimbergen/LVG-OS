# LVG OS

Een persoonlijke, gsm-first PWA om mijn planning, doelen, reizen en persoonlijke groei bij te houden. Alleen voor eigen gebruik.

## Stack

- [Next.js](https://nextjs.org) 16 (App Router, TypeScript, `src/`-map)
- [Tailwind CSS](https://tailwindcss.com) v4 + [shadcn/ui](https://ui.shadcn.com)
- [Motion](https://motion.dev) voor animaties
- [lucide-react](https://lucide.dev) voor iconen
- [Supabase](https://supabase.com) (`@supabase/supabase-js` + `@supabase/ssr`)
- [Serwist](https://serwist.pages.dev) voor de service worker (PWA)

## Lokaal draaien

```bash
npm install
cp .env.local.example .env.local   # vul je Supabase-URL en anon key in
npm run dev
```

Open daarna [http://localhost:3000](http://localhost:3000).

De service worker staat uit tijdens `npm run dev`. Om de PWA te testen:

```bash
npm run build && npm run start
```

## Structuur

```
src/
  app/            routes: / (Vandaag), /doelen, /reizen, /over-mij
  components/
    ui/           shadcn/ui-componenten
    layout/       tabbar en paginaheaders
  features/       modules: planning, goals, travel, about
  lib/            helpers, o.a. supabase/client.ts en supabase/server.ts
  types/          gedeelde types
```
