---
id: TASK-006
title: Remove server-side is_selected from prizes
status: done
tags: [supabase, migration, frontend, chore]
poc_ref:
created: 2026-05-04
updated: 2026-05-04
---

# TASK-006 — Remove server-side `is_selected` from prizes

## Goal

Drop the `is_selected` column from `prizes` and remove all code that reads or writes it.
Prize selection becomes URL-param-only (`?prize=<uuid>`) — no server-side fallback.

## Context

TASK-005 kept `is_selected` as a fallback for when no `?prize` param is present in the URL.
This fallback is no longer needed; the SpinPage should simply show no active prize when the URL
has no param, and the admin selects a prize by navigating to `/?prize=<id>`.

## Acceptance Criteria

- [x] `is_selected` column dropped from `prizes` table via migration
- [x] `prizes_one_selected` partial unique index dropped
- [x] `useFallbackActivePrize` removed from `SpinPage.tsx`
- [x] `activePrize` derived from `prizeById` (URL param) only
- [x] `useSelectPrize` in `usePrizes.ts` no longer updates `is_selected`
- [x] Prize-won update in `SpinPage.tsx` no longer sets `is_selected: false`
- [x] Types regenerated (`supabase gen types`)
- [x] `npm run typecheck` passes with no errors

## Implementation Notes

- `useSelectPrize` still resets customers (`is_winner: false, is_active: true`) — keep that
- After removing `is_selected`, the `activePrize` query key `["activePrize"]` becomes unused — remove it
- SpinPage with no `?prize` param: `activePrize = null`, `winsRequired = 1` (default), spin works normally

## Blockers

None.

## Change Log

| Date       | Note         |
| ---------- | ------------ |
| 2026-05-04 | Task created |
