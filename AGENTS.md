# Mark App — agent coordination

Use this file so parallel Cursor agents do not duplicate work or conflict.

## Project layout

| Path | Purpose |
|------|---------|
| `mark-app/` | Vite + React + Tailwind frontend |
| `supabase/mark-app-schema.sql` | DB tables + RLS (run in Supabase SQL Editor) |
| `supabase/storage-catch-photos.sql` | Storage bucket + policies for catch photos |

## Status (update when you finish a slice)

| Area | Status | Owner notes |
|------|--------|-------------|
| DB schema + RLS | Done | `marks` + `catches` migrated on Supabase; `profiles` extended with `full_name` / `boat_name` |
| Storage `catch-photos` | SQL ready | Run `storage-catch-photos.sql` |
| App shell + nav | Done | Map / Log Book / New Catch |
| Map (MapLibre + OpenFreeMap) | Done | Free tiles, no API key; `FishingMap.tsx` |
| Auth session | Done | `AuthProvider`, `useAuth` |
| Auth UI (login) | Done | `LoginPage`, `AuthBanner`, sign in/out |
| New Catch form | Done | `NewCatchForm.tsx` → Supabase + Storage |
| Log Book (live data) | Done | `useCatches`, photos, refresh, delete catch, pull-to-refresh |
| Profiles (boat name, share spots) | Done | `SettingsPage`, `useProfile`, `share_spots` toggle; RLS shares marks when on |
| Species encyclopedia | Done | `SpeciesPage`, `fishSpecies.ts`, atlas + log book integration |
| Forums | Done | `forum_posts` + `forum_replies`, filters, new post, thread replies |
| Deploy / CI | Not started | |
| `.env` / Supabase keys | Done | Copied from linked Supabase project; login works |
| Mapbox | N/A | Replaced with MapLibre + OpenFreeMap (no key) |

## Env vars (`mark-app/.env`)

```
VITE_SUPABASE_URL=        # set ✓
VITE_SUPABASE_ANON_KEY=   # set ✓
# Map: no env var — uses free OpenFreeMap tiles
```

## Health monitoring

Run in a terminal (checks `/` and `/login` every 20s):

```bash
bash scripts/health-check.sh
```

Dev server: `cd mark-app && npm run dev` → http://localhost:5173

## Conventions

- **Auth:** Always use `useAuth()` from `hooks/useAuth.ts` (not `AuthProvider` directly).
- **Marks:** `useMarks()` — do not duplicate fetch logic.
- **Catches:** `useCatches()` — use for Log Book and after save refresh.
- **Types:** `src/types/database.ts` — extend here before new Supabase calls.
- **No `motion.div` typos** — use plain `motion.div` only if framer-motion is installed (it is not).

## Active assignments (project lead — update when claimed)

| Agent focus | Task | Status |
|-------------|------|--------|
| **Lead (this chat)** | Fix `.env`, dev server, health script, coordination | Done |
| **Agent A** | **Profiles** — Settings: `full_name`, `boat_name` on `profiles` | Done |
| **Agent B** | **Map** — MapLibre + free tiles | Done |
| **Agent C** | **Log Book** — Delete catch, pull-to-refresh polish | Done |
| **Agent D** | **Map features** — Edit/delete mark | Open |

## Suggested next tasks (pick one per agent)

1. **Profiles** — Settings screen: `full_name`, `boat_name` on `profiles`.
2. **Log Book polish** — Photos in list, delete catch, pull-to-refresh.
3. **Map** — Edit/delete mark, long-press drop, offline banner.
4. **Auth** — Magic link or phone OTP if email is too hard on boats.
5. **E2E** — Playwright: login → drop mark → log catch → see log book.

## Handoff checklist

Before ending a session:

- [ ] `npm run build` passes in `mark-app/`
- [ ] Note what you changed in the table above
- [ ] Do not commit `.env` (only `.env.example`)
