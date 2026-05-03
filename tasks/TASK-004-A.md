---
id: TASK-004-A
title: "Multi-prize: prizes table migration"
status: done
tags: [supabase, migration, rls]
created: 2026-04-30
updated: 2026-05-03
---

# TASK-004-A — Database: `prizes` Table

## Goal

Introduce a `prizes` table that stores named, configurable prizes. Move `wins_required` and `remove_after_win` off `spin_settings` and onto each prize row. Seed the first prize from existing `spin_settings` data.

## Context

Part 1 of 3 in the multi-prize feature (TASK-004). No frontend changes — schema only.

**Model:** 1 prize = 1 physical item. `wins_required` defaults to 1; big prizes set to 2. When won, the prize is stamped with the winner's customer id and marked `is_won = true`. No quantity/stock counting needed.

## New Table: `prizes`

```sql
id                  uuid primary key default gen_random_uuid()
name                text not null
description         text                           -- shown in winner popup
image_url           text                           -- prize image (prize-images bucket)
wins_required       integer not null default 1     -- spins needed to trigger a win (usually 1, big prizes = 2)
remove_after_win    boolean not null default false
is_won              boolean not null default false -- true once this prize has been claimed
winner_customer_id  uuid references customers(id) on delete set null  -- stamped on win
is_selected         boolean not null default false -- only one row true at a time
created_at          timestamptz not null default now()
```

**Constraint:** enforce only-one-selected via a partial unique index:
```sql
create unique index prizes_one_selected on prizes (is_selected) where is_selected = true;
```

No trigger needed — `is_won` and `winner_customer_id` are set by the app on win.

## Migration Steps

1. `supabase migration new add_prizes_table`
2. Write SQL:
   - Create `prizes` table with all columns above
   - Partial unique index for `is_selected`
   - RLS: anon SELECT, authenticated full access
   - Seed one prize row from current `spin_settings` values:
     - `prize_text` → `description`
     - `prize_image_url` → `image_url`
     - `wins_required` → `wins_required`
     - `remove_after_win` → `remove_after_win`
     - `is_selected = true`
   - Drop `wins_required` and `remove_after_win` columns from `spin_settings`
3. `supabase db push`
4. `supabase gen types --local --schema public > frontend/src/types/supabase.ts`

## Acceptance Criteria

- [x] `prizes` table created with all columns above
- [x] Partial unique index enforces at most one `is_selected = true` row
- [x] RLS: anon SELECT, authenticated full access
- [x] Seed migration inserts one prize row with `is_selected = true` from existing `spin_settings` data
- [x] `wins_required` and `remove_after_win` columns dropped from `spin_settings`
- [x] `supabase db reset` applies cleanly with no errors
- [x] `supabase gen types` regenerated and committed alongside migration

## Files

- `app/supabase/migrations/<timestamp>_add_prizes_table.sql` (new)
- `app/frontend/src/types/supabase.ts` (regenerate)

## Verification

```sql
select * from prizes;                          -- 1 row, is_selected = true, is_won = false
select wins_required from spin_settings;       -- ERROR: column does not exist
```

## Blockers

None.
