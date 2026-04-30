---
id: TASK-002
title: Configurable win threshold via spin_settings
status: done
tags: [supabase, migration, frontend, ui]
poc_ref:
created: 2026-04-30
updated: 2026-04-30
---

# TASK-002 — Configurable Win Threshold

## Goal

Allow admins to configure how many spins a customer must complete before winning a prize (e.g. 1 spin or 2 spins). The threshold is stored in `spin_settings` and applied at spin time.

## Context

The win condition was hardcoded as `newSpinCount % 2 === 0` in `SpinPage.tsx`.
The admin can now set `wins_required` to any positive integer from the AdminPage settings form.

## Acceptance Criteria

- [x] Migration adds `wins_required integer not null default 2` to `spin_settings`
- [x] Supabase types regenerated after migration
- [x] Win condition in `SpinPage.tsx` reads `settings.wins_required` instead of hardcoded `2`
- [x] `SpinSettingsForm` includes a number input for `wins_required` (min 1, max 10)
- [x] Existing singleton trigger still enforces one row — no second row inserted
- [x] Types checked (`npm run typecheck` passes with no errors)

## Implementation Notes

- Win logic: `isWin(count, winsRequired)` — `count % winsRequired === 0`; default fallback `?? 2` guards against undefined settings during load
- `useSpinSettings.ts` had a broken `SpinSettingsUpdate` import that was never exported from the generated types — replaced with `TablesUpdate<"spin_settings">`
- Regenerating types wiped hand-written aliases (`Customer`, `CustomerInsert`, `CustomerUpdate`) at the bottom of `supabase.ts` — re-added them using `Tables<>` / `TablesInsert<>` / `TablesUpdate<>` helpers
- Pre-existing unused `Trophy` import in `CustomerManager.tsx` removed to pass strict typecheck
- `supabase gen types` prints "Connecting to db…" to stdout — redirect output to a temp file and strip first line, or use `2>/dev/null` next time

## Blockers

None — completed.

## Change Log

| Date       | Note                                      |
| ---------- | ----------------------------------------- |
| 2026-04-30 | Task created                              |
| 2026-04-30 | Task completed in one session             |
