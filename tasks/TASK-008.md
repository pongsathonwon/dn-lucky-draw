---
id: TASK-008
title: Reset button clears current prize winner and spin history
status: done
tags: [frontend, ui]
poc_ref:
created: 2026-05-04
updated: 2026-05-04
---

# TASK-008 — Reset button clears current prize winner and spin history

## Goal

When the operator clicks รีเซ็ต on SpinPage, the current prize is fully reset so the same prize can be run again from scratch.

## Context

Previously the reset button only reset all customers (`is_winner = false`, `is_active = true`). It left the prize marked as won (`is_won = true`) and left all `customer_prize_spins` rows intact, meaning the spin history panel still showed old data and the spin button stayed disabled.

## Acceptance Criteria

- [x] Reset button sets `is_won = false` and `winner_customer_id = null` on the active prize
- [x] Reset button deletes all `customer_prize_spins` rows for the active prize
- [x] All customers reset to `is_winner = false`, `is_active = true` (existing behaviour)
- [x] Spin button is re-enabled after reset (prize no longer marked as won)
- [x] Spin history panel clears after reset
- [x] If no prize is selected, only customer reset runs (no error)
- [x] Types checked (`npm run typecheck` passes with no errors)

## Implementation Notes

- Added `useResetPrize` to `usePrizes.ts` — updates `is_won` and `winner_customer_id` on the prize row; invalidates both `["prizes"]` and `["prize", id]` query keys so `usePrizeById` in SpinPage re-fetches.
- Added `useDeletePrizeSpins` to `useCustomerPrizeSpins.ts` — deletes all rows for the prize; invalidates `["customerPrizeSpins", prizeId]`.
- `handleReset` in `SpinPage.tsx` runs customer reset first (await), then prize reset and spin-record deletion in parallel (`Promise.all`).

## Change Log

| Date       | Note         |
| ---------- | ------------ |
| 2026-05-04 | Task created and completed |
