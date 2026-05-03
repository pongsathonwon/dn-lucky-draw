# CLAUDE.md

This file guides Claude Code when working in this repository.
The app is a **Thai-language lucky draw wheel** (วงล้อจับฉลาก) running on
Supabase (PostgreSQL + Auth + Storage) + React 18 + Vite + TypeScript.

> The Base44 POC in `poc/` is kept as reference only. All active code lives in `app/`.

---

## Project Layout

```
/
├── .claude/
│   └── commands/             ← Custom slash commands
├── poc/                      ← READ-ONLY Base44 reference
├── app/
│   ├── frontend/             ← React 18 + Vite + TypeScript
│   │   └── src/
│   │       ├── components/
│   │       │   ├── admin/    ← CustomerManager, SpinSettingsForm, PrizeManager
│   │       │   ├── spin/     ← SlotMachine, WinnerPopup, ResultToast, SpinHistory
│   │       │   └── ui/       ← Shadcn/ui primitives (.tsx — do not edit manually)
│   │       ├── hooks/        ← useCustomers.ts, useSpinResults.ts, useSpinSettings.ts, usePrizes.ts
│   │       ├── lib/
│   │       │   ├── supabase.ts       ← typed Supabase client
│   │       │   ├── AuthContext.tsx   ← Supabase Auth context + useAuth()
│   │       │   └── queryClient.ts
│   │       ├── pages/
│   │       │   ├── SpinPage.tsx      ← public
│   │       │   └── AdminPage.tsx     ← auth-gated
│   │       └── types/
│   │           └── supabase.ts       ← generated — never edit manually
│   └── supabase/
│       ├── migrations/       ← versioned SQL migrations
│       └── config.toml
├── tasks/                    ← Feature tracking
└── CLAUDE.md
```

---

## Tech Stack

| Layer        | Technology                                                       |
| ------------ | ---------------------------------------------------------------- |
| Language     | TypeScript — strict mode, `moduleResolution: bundler`            |
| Database     | PostgreSQL via Supabase                                          |
| Auth         | Supabase Auth — email/password, **signup disabled** (admin-only) |
| Storage      | Supabase Storage — `prize-images` bucket                         |
| API          | `supabase-js` typed client                                       |
| Frontend     | React 18 + Vite                                                  |
| Forms        | `react-hook-form` + `zod`                                        |
| Server state | React Query (`@tanstack/react-query`)                            |
| UI           | Shadcn/ui (new-york, neutral) + TailwindCSS                      |
| Animation    | Framer Motion (SlotMachine)                                      |
| Toasts       | `sonner` (hardcoded `theme="light"` — no next-themes)            |

---

## Database Schema

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

### `prizes`

```sql
id                  uuid primary key default gen_random_uuid()
name                text not null
description         text                           -- shown in WinnerPopup
image_url           text                           -- prize-images bucket
wins_required       integer not null default 1     -- spins needed per win
remove_after_win    boolean not null default false
is_won              boolean not null default false
winner_customer_id  uuid references customers(id) on delete set null
is_selected         boolean not null default false -- only one true at a time
created_at          timestamptz not null default now()
```

> **At most one selected prize** enforced by a partial unique index:
> `create unique index prizes_one_selected on prizes (is_selected) where is_selected = true`
>
> `wins_required` and `remove_after_win` **moved here from `spin_settings`** in migration `20260503000000`.

### `spin_settings`

```sql
id                uuid primary key default gen_random_uuid()
spin_duration     integer not null default 3
prize_text        text                           -- fallback when no prize selected
prize_image_url   text                           -- fallback image
updated_at        timestamptz not null default now()
```

> **Singleton enforced by a PostgreSQL trigger** — only one row is ever allowed.
> Do not insert a second row; update the existing one via the hook.

### Storage

- Bucket: `prize-images` (public read, authenticated write)
- Prize images stored per-prize in `prizes.image_url`; fallback in `spin_settings.prize_image_url`

---

## RLS Policies (current)

| Table                 | Anon         | Authenticated |
| --------------------- | ------------ | ------------- |
| `customers`           | SELECT only  | Full access   |
| `spin_results`        | INSERT only  | Full access   |
| `spin_settings`       | SELECT only  | Full access   |
| `prizes`              | SELECT only  | Full access   |
| `prize-images` bucket | GET (public) | Upload/delete |

> SpinPage works fully without a login (anon). AdminPage requires auth.

---

## Auth Model

- **Provider:** email/password
- **Signup:** disabled (`enable_signup = false` in `config.toml`) — admin accounts are created manually in Supabase dashboard
- **SpinPage (`/`):** public — no auth required
- **AdminPage (`/admin`):** wrapped in `<ProtectedRoute>` which redirects to `/login` if no session
- **`useAuth()` exports:** `user`, `session`, `loading`, `logout`

---

## Core Business Logic

### Win condition

```ts
// Lives in SpinPage; winsRequired comes from the selected prize (default 1 when no prize selected)
const isWin = (newSpinCount: number, winsRequired: number): boolean =>
  newSpinCount > 0 && newSpinCount % winsRequired === 0;
```

### Reset all customers

```ts
// .gte workaround — Supabase requires a filter for bulk updates
supabase
  .from("customers")
  .update({ spin_count: 0, is_winner: false })
  .gte("created_at", "1970-01-01");
```

### Active prize

```ts
// SpinPage queries the selected prize; falls back to safe defaults when none selected
const { data: activePrize } = useQuery({ queryFn: () =>
  supabase.from("prizes").select("*").eq("is_selected", true).maybeSingle()
});
const winsRequired = activePrize?.wins_required ?? 1;
```

### On win — stamp the prize

```ts
supabase.from("prizes")
  .update({ is_won: true, winner_customer_id: winner.id, is_selected: false })
  .eq("id", activePrize.id);
// After this activePrize becomes null — admin must pick next prize
```

### Selecting a new prize (useSelectPrize)

1. Clear `is_selected` on all prizes (`.gte('created_at','1970-01-01')`)
2. Set `is_selected = true` on the chosen prize
3. Reset all customers (`spin_count=0, is_winner=false, is_active=true`)

### Image upload

```ts
// Uploads to prize-images bucket; store public URL in prizes.image_url
supabase.storage.from("prize-images").upload(path, file);
```

---

## TypeScript Conventions

- **Strict mode on** (`"strict": true` in tsconfig)
- **`moduleResolution: bundler`** — do not add `baseUrl` (deprecated for this mode)
- **`src/vite-env.d.ts`** must contain `/// <reference types="vite/client" />` to type `import.meta.env`
- **No `any`** — use `unknown` and narrow, or use generated types
- **Generated types** live in `src/types/supabase.ts` — never edit manually
- **Type aliases for readability:**
  ```ts
  type Customer = Database["public"]["Tables"]["customers"]["Row"];
  type CustomerInsert = Database["public"]["Tables"]["customers"]["Insert"];
  type CustomerUpdate = Database["public"]["Tables"]["customers"]["Update"];
  ```
- **File extensions:** `.ts` for logic/hooks, `.tsx` for anything returning JSX
- **Type-only imports:** `import type { Foo } from '...'`

---

## Adding a New Feature — Checklist

### New database table

1. `supabase migration new <name>` → write SQL in the generated file
2. `supabase db push` to apply locally
3. `supabase gen types --local --schema public > frontend/src/types/supabase.ts`
4. Write typed hook in `src/hooks/use<Entity>.ts` (see existing hooks as template)
5. Add RLS policy in the same migration
6. Commit migration file + updated `supabase.ts` types together

### New page

- **Public page:** add route in `App.tsx`, no wrapper needed
- **Auth-gated page:** wrap with `<ProtectedRoute>` in `App.tsx`
- Keep UI labels in Thai where they appear on-screen

### New form

- Use `react-hook-form` + `zod` schema (see `CustomerManager` as reference)
- Validation schema goes in the same file as the form component

### New UI component

- Check if Shadcn/ui has it first: `npx shadcn@latest add <component>`
- Output goes to `src/components/ui/` — do not edit these files manually after generation

---

## Known Gotchas

| Issue                               | Fix                                                                         |
| ----------------------------------- | --------------------------------------------------------------------------- |
| `sonner` needs `next-themes` in POC | Hardcode `theme="light"` — do not install next-themes                       |
| `baseUrl` in tsconfig               | Remove it — breaks `moduleResolution: bundler`; `paths` works without it    |
| Bulk update without a WHERE         | Use `.gte('created_at', '1970-01-01')` as a catch-all filter                |
| `spin_settings` second row          | Never insert — always update the single existing row                        |
| Shadcn `.jsx` → `.tsx`              | All UI primitives must be `.tsx`; `forwardRef` needs explicit generic types  |
| Shadcn UI components need prop types | Components like `Badge`, `DialogHeader`, `AlertDialogHeader` need explicit TypeScript interfaces/parameter types — untyped `forwardRef` or plain function params infer poorly for strict-mode callers |

---

## Commands

### Prerequisites (macOS and Windows)

- [Node.js 18+](https://nodejs.org)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) — must be running for Supabase local
- [Supabase CLI](https://supabase.com/docs/guides/cli): `npm install -g supabase`

### Frontend

```bash
cd app/frontend
npm install
npm run dev          # → http://localhost:5173
npm run build
npm run typecheck    # tsc --noEmit — run before every commit
npm run lint
```

### Supabase (local)

```bash
cd app
supabase start                          # start local stack
supabase stop
supabase db push                        # apply pending migrations
supabase db reset                       # wipe + re-apply all migrations
supabase migration new <name>           # create new migration
supabase gen types --local \
  --schema public \
  > frontend/src/types/supabase.ts      # regenerate after every migration
```

### Environment variables

Copy `.env.example` → `.env.local` and fill in values from `supabase start` output:

```
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=<from supabase start>
```

`.env.local` is gitignored. `.env.example` is committed with placeholder values.

---

## Custom Claude Commands

| Command        | Purpose                                                  |
| -------------- | -------------------------------------------------------- |
| `/port-entity` | Generate migration + types + typed hook for a new entity |
| `/task-status` | Summarise open tasks from `/tasks/`                      |
| `/compare-poc` | Diff a component against its original in `poc/src/`      |
