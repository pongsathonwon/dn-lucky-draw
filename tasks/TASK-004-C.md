---
id: TASK-004-C
title: "Multi-prize: wire SpinPage to active prize"
status: done
tags: [frontend, ui]
depends_on: TASK-004-B
created: 2026-04-30
updated: 2026-05-03
---

# TASK-004-C — SpinPage: Wire Active Prize

## Goal

SpinPage reads `wins_required`, `remove_after_win`, prize name, description, and image from the currently selected prize. On a confirmed win, stamp `winner_customer_id` and set `is_won = true` on the prize row.

## Context

Part 3 of 3 in the multi-prize feature. Depends on TASK-004-B (PrizeManager and hook must exist).

**Model:** 1 prize = 1 physical item. Win stamps the winner's customer id on the prize and marks it as won. No stock counting.

## SpinPage changes

`app/frontend/src/pages/SpinPage.tsx`

- Query selected prize:
  ```ts
  supabase.from("prizes").select("*").eq("is_selected", true).maybeSingle()
  ```
- Replace `effectiveSettings.wins_required` → `activePrize?.wins_required ?? 1`
- Replace `effectiveSettings.remove_after_win` → `activePrize?.remove_after_win ?? false`
- Pass to WinnerPopup: `prizeName`, `prizeText` (description), `prizeImageUrl`
- On confirmed win:
  ```ts
  supabase.from("prizes")
    .update({ is_won: true, winner_customer_id: winner.id, is_selected: false })
    .eq("id", activePrize.id)
  ```
  After this, `activePrize` becomes null — SpinPage falls back to safe defaults until admin picks the next prize.

## WinnerPopup changes

`app/frontend/src/components/spin/WinnerPopup.tsx`

- Add `prizeName?: string` prop — render prominently (bold, larger text) above existing `prizeText`
- Fallback gracefully when no prize is selected (show generic congratulations text)

## Acceptance Criteria

- [x] With no selected prize: app does not crash; `wins_required` defaults to 1, `remove_after_win` defaults to false
- [x] On win: WinnerPopup shows prize name, description, and image from the selected prize
- [x] After win confirmed: `prizes.is_won = true`, `winner_customer_id` stamped, `is_selected = false`
- [x] SpinPage gracefully shows no active prize after a win (admin must pick next prize)
- [x] `npm run typecheck` passes

## Files

- `app/frontend/src/pages/SpinPage.tsx`
- `app/frontend/src/components/spin/WinnerPopup.tsx`

## Blockers

TASK-004-B must be complete.
