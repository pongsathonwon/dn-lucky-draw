# CLAUDE.md

This file guides Claude Code when working in this repository.
The goal is to **port the Base44 POC app to a fully self-controlled stack** using
**Supabase** (PostgreSQL + Auth + Realtime) and **React 18 + Vite + TypeScript**.

---

## Project Layout

```
/
├── .claude/                  ← Claude Code config & custom commands
├── poc/                      ← Original Base44 source (READ-ONLY reference)
│   ├── entities/             ← Base44 schema definitions
│   └── src/                  ← Original React source (JavaScript)
├── app/
│   ├── frontend/             ← React 18 + Vite + TypeScript (ported target)
│   └── supabase/             ← Supabase local config & migrations
│       ├── migrations/       ← SQL migration files (versioned)
│       ├── seed.sql          ← Optional seed data
│       └── config.toml       ← Supabase local dev config
├── tasks/                    ← Feature/change tracking
└── CLAUDE.md
```

> ⚠️ **`poc/` is read-only reference material.** Never modify files inside `poc/`.
> All implementation goes in `app/`.

---

## Tech Stack

| Layer         | Technology                               |
| ------------- | ---------------------------------------- |
| Language      | **TypeScript** (strict mode)             |
| Database      | PostgreSQL via Supabase                  |
| Auth          | Supabase Auth                            |
| API           | `supabase-js` client                     |
| Realtime      | Supabase Realtime                        |
| Frontend      | React 18 + Vite                          |
| Server state  | React Query (`@tanstack/react-query`)    |
| UI components | Shadcn/ui (new-york style, neutral base) |
| Styling       | TailwindCSS                              |
| Animation     | Framer Motion (SlotMachine)              |

---

## TypeScript Conventions

- **Strict mode on** — `tsconfig.json` must have `"strict": true`
- **No `any`** — use `unknown` and narrow, or define a proper type
- **Database types are generated** — run `supabase gen types` after every migration (see Commands)
- **File extensions:** `.ts` for logic/hooks, `.tsx` for components
- **Type imports:** use `import type { Foo }` for type-only imports
- **Supabase typed client:**

```ts
// src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase"; // generated

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);
```

- **React Query hooks** are typed via the generated `Database` type, not manually:

```ts
// Good
const { data } = await supabase.from("customers").select("*");
// data is typed as Database['public']['Tables']['customers']['Row'][]

// Alias for readability
type Customer = Database["public"]["Tables"]["customers"]["Row"];
```

---

## POC App — What It Does

A Thai-language lottery/raffle wheel with two pages:

| Page      | Route    | Purpose                                                             |
| --------- | -------- | ------------------------------------------------------------------- |
| SpinPage  | `/`      | Slot-machine spin. Win triggers every 2nd spin. Shows winner popup. |
| AdminPage | `/admin` | Configure spin settings, manage customer list.                      |

---

## Database Schema (PostgreSQL)

### `customers`

```sql
id          uuid primary key default gen_random_uuid()
name        text not null
spin_count  integer not null default 0
is_winner   boolean not null default false
is_active   boolean not null default true
created_at  timestamptz not null default now()
```

### `spin_results`

```sql
id           uuid primary key default gen_random_uuid()
customer_id  uuid references customers(id) on delete cascade
outcome      text not null   -- 'win' | 'no_win'
created_at   timestamptz not null default now()
```

### `spin_settings`

```sql
id                uuid primary key default gen_random_uuid()
spin_duration     integer not null default 3
remove_after_win  boolean not null default false
prize_text        text
prize_image_url   text
updated_at        timestamptz not null default now()
```

> One row only in `spin_settings`. Enforce in app logic or via RLS.

---

## Porting Map — Base44 → Supabase + TypeScript

### Entity calls

| Base44 (`@base44/sdk`)      | Supabase (`supabase-js`)                                       |
| --------------------------- | -------------------------------------------------------------- |
| `Customer.list()`           | `supabase.from('customers').select('*')`                       |
| `Customer.get(id)`          | `supabase.from('customers').select('*').eq('id', id).single()` |
| `Customer.create(data)`     | `supabase.from('customers').insert(data).select().single()`    |
| `Customer.update(id, data)` | `supabase.from('customers').update(data).eq('id', id)`         |
| `Customer.delete(id)`       | `supabase.from('customers').delete().eq('id', id)`             |

Same pattern for `spin_results` and `spin_settings`.

### Auth

| Base44                           | Supabase                                                  |
| -------------------------------- | --------------------------------------------------------- |
| `AuthContext` + `ProtectedRoute` | `supabase.auth` + typed `AuthContext`                     |
| `redirectToLogin()`              | `supabase.auth.signInWithPassword()` or `signInWithOtp()` |
| `user_not_registered` error      | `session === null` check                                  |

### Win Logic (preserve exactly from POC)

```ts
const isWin = (newSpinCount: number): boolean =>
  newSpinCount > 0 && newSpinCount % 2 === 0;
```

---

## Commands

### Prerequisites (install once, works on macOS and Windows)

- [Node.js](https://nodejs.org) v18+ — via installer or `nvm` / `fnm`
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) — required by Supabase local
- [Supabase CLI](https://supabase.com/docs/guides/cli) — `npm install -g supabase`

### Frontend

```bash
cd app/frontend
npm install
npm run dev        # Vite dev server → http://localhost:5173
npm run build
npm run lint
npm run typecheck  # tsc --noEmit
```

### Supabase (local)

```bash
cd app
supabase start                       # start local stack (requires Docker)
supabase stop                        # stop local stack
supabase db push                     # apply pending migrations
supabase db reset                    # wipe + re-apply all migrations + seed
supabase migration new <name>        # create new timestamped migration file
supabase gen types --local \
  --schema public \
  > frontend/src/types/supabase.ts   # regenerate DB types after migrations
```

> Run `supabase gen types` every time a migration is added.
> Commit the generated `supabase.ts` types file alongside the migration.

### Environment variables

Copy `.env.example` to `.env.local` and fill in values printed by `supabase start`:

```
# app/frontend/.env.local
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=<anon key from supabase start output>
```

`.env.local` is gitignored. `.env.example` is committed with placeholder values.

---

## Frontend Structure (`app/frontend/src/`)

```
src/
├── components/
│   ├── admin/        # CustomerManager, SpinSettingForms
│   ├── spin/         # SlotMachine, WinnerPopup, ResultToast, SpinHistory
│   └── ui/           # Shadcn/ui primitives (copy from poc, do not edit manually)
├── hooks/            # useCustomers.ts, useSpinResults.ts, useSpinSettings.ts
├── lib/
│   ├── supabase.ts   # typed Supabase client
│   ├── AuthContext.tsx
│   └── queryClient.ts
├── pages/
│   ├── SpinPage.tsx
│   └── AdminPage.tsx
└── types/
    └── supabase.ts   # generated — do not edit manually
```

---

## Key Conventions

- **UI language:** Thai — preserve all labels (วงล้อจับฉลาก, etc.)
- **Animation:** Framer Motion in `SlotMachine.tsx` — keep as-is
- **Shadcn/ui:** Copy primitives from `poc/src/components/ui/` into `app/frontend/src/components/ui/` — do not regenerate
- **Path alias:** `@/` → `./src/` (configured in `vite.config.ts` and `tsconfig.json`)
- **State:** React Query for server state, React Context for auth — no Redux/Zustand

---

## Task Tracking

All work tracked in `/tasks/`. See `/tasks/README.md` for conventions.
Copy `/tasks/_template.md` to start a new task.

---

## Custom Claude Commands

| Command        | Purpose                                                          |
| -------------- | ---------------------------------------------------------------- |
| `/port-entity` | Port a Base44 entity → migration + generated types + typed hooks |
| `/task-status` | Summarise open tasks from `/tasks/`                              |
| `/compare-poc` | Diff a ported component against its POC counterpart              |
