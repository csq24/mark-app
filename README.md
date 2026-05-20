# Mark

Fishing log and map app: save marks on the map, log catches, browse species, forums, and optional spot sharing with other anglers.

## Stack

- **Frontend:** Vite + React + TypeScript + Tailwind (`mark-app/`)
- **Backend:** Supabase (Auth, Postgres, Storage, RLS)

## Setup

1. **Clone and install**

   ```bash
   cd mark-app
   npm install
   ```

2. **Supabase**

   - Create a project at [supabase.com](https://supabase.com)
   - In the SQL Editor, run (in order):
     - `supabase/mark-app-schema.sql`
     - `supabase/storage-catch-photos.sql` (optional, for catch photos)
     - `supabase/forums-schema.sql`
     - `supabase/profiles-share-spots.sql`
     - `supabase/seed-demo-bots.sql` (optional, demo anglers on Profile)

3. **Environment**

   ```bash
   cp mark-app/.env.example mark-app/.env
   ```

   Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from Project Settings → API.

4. **Run**

   ```bash
   cd mark-app
   npm run dev
   ```

   Open http://localhost:5173

## Features

- Map with auto satellite ↔ street zoom, country fishing atlas, marks
- Log book and new catch flow with photos
- Species encyclopedia
- Forums
- Profile: name, boat, **share spots** toggle
- Demo bots (Profile → Add demo bots) for testing shared marks

## Agent coordination

See `AGENTS.md` for multi-agent task status and conventions.
