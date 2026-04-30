---
id: TASK-004-A
title: "Multi-prize: prizes table migration"
status: open
tags: [supabase, migration, rls]
created: 2026-04-30
updated: 2026-04-30
---

# TASK-004-A — Database: `prizes` Table

## Goal

Introduce a `prizes` table that stores named, configurable prizes. Move `wins_required` and `remove_after_win` off `spin_settings` and onto each prize row. Seed the first prize from existing `spin_settings` data.

## Context

Part 1 of 3 in the multi-prize feature (TASK-004). No frontend changes — schema only.

## New Table: `prizes`

```sql
id               uuid primary key default gen_random_uuid()
name             text not null
description      text                          -- shown in winner popup
image_url        text                          -- prize image (prize-images bucket)
wins_required    integer not null default 2    -- spins needed to trigger a win
remove_after_win boolean not null default false
quantity         integer not null default 0    -- 0 = unlimited
times_won        integer not null default 0    -- auto-incremented on each win
is_active        boolean not null default true -- false when quantity exhausted
is_selected      boolean not null default false -- only one row true at a time
created_at       timestamptz not null default now()
```

## Acceptance Criteria

- [ ] `prizes` table created with all columns above
- [ ] Partial unique index enforces at most one `is_selected = true` row
- [ ] Trigger: when `times_won` is updated and `quantity > 0` and `times_won >= quantity`, set `is_active = false` and `is_selected = false`
- [ ] RLS: anon SELECT, authenticated full access
- [ ] Seed migration inserts one prize row from current `spin_settings` values (`prize_text` → `description`, `prize_image_url` → `image_url`, `wins_required` → `wins_required`, `remove_after_win` → `remove_after_win`) with `is_selected = true`
- [ ] `wins_required` and `remove_after_win` columns dropped from `spin_settings`
- [ ] `supabase db reset` applies cleanly with no errors
- [ ] `supabase gen types` regenerated and committed alongside migration

## Files

- `app/supabase/migrations/<timestamp>_add_prizes_table.sql` (new)
- `app/frontend/src/types/supabase.ts` (regenerate)

## Verification

```sql
select * from prizes;                          -- 1 row, is_selected = true
select wins_required from spin_settings;       -- ERROR: column does not exist
```

## Blockers

None.
