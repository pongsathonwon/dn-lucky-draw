---
id: TASK-004-C
title: "Multi-prize: wire SpinPage to active prize"
status: open
tags: [frontend, ui]
depends_on: TASK-004-B
created: 2026-04-30
updated: 2026-04-30
---

# TASK-004-C — SpinPage: Wire Active Prize

## Goal

SpinPage reads `wins_required`, `remove_after_win`, prize name, description, and image from the currently selected prize row instead of `spin_settings`. On each confirmed win, increment `prizes.times_won` so the DB trigger can auto-deactivate exhausted prizes.

## Context

Part 3 of 3 in the multi-prize feature. Depends on TASK-004-B (PrizeManager and hook must exist).

## SpinPage changes

`app/frontend/src/pages/SpinPage.tsx`

- Add query for active prize:
  ```ts
  supabase.from("prizes").select("*").eq("is_selected", true).maybeSingle();
  ```
- Replace `effectiveSettings.wins_required` → `activePrize?.wins_required ?? 2`
- Replace `effectiveSettings.remove_after_win` → `activePrize?.remove_after_win ?? false`
- Pass to WinnerPopup: `prizeName`, `prizeText` (description), `prizeImageUrl`
- On confirmed win: `update({ times_won: activePrize.times_won + 1 }).eq('id', activePrize.id)`
  - DB trigger handles auto-deactivation when quantity is exhausted

## WinnerPopup changes

`app/frontend/src/components/spin/WinnerPopup.tsx`

- Add `prizeName?: string` prop — render prominently (bold, larger text) above existing `prizeText`
- Fallback gracefully when no prize is selected (show generic congratulations text)

## Acceptance Criteria

- [ ] With no selected prize: app does not crash; `wins_required` defaults to 2, `remove_after_win` defaults to false
- [ ] On win: WinnerPopup shows prize name, description, and image from the selected prize
- [ ] After winning: `prizes.times_won` increments by 1 in the DB
- [ ] After winning `quantity` times: prize auto-deactivates; SpinPage falls back to safe defaults
- [ ] `npm run typecheck` passes

## Files

- `app/frontend/src/pages/SpinPage.tsx`
- `app/frontend/src/components/spin/WinnerPopup.tsx`

## Blockers

TASK-004-B must be complete.
