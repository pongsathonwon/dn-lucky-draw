# TASK-005: Per-Prize Spin Tracking + Prize Selector on SpinPage

## Status: Done

## Problem

1. `customers.spin_count` was prize-agnostic — switching prizes reset everyone's progress and no historical record existed for "how many spins toward prize X."
2. Prize selection lived only in AdminPage, forcing operators to switch pages to activate a prize.

## Solution

### Database

- **New table `customer_prize_spins`** — one row per `(customer_id, prize_id)` pair tracking `spin_count` toward that specific prize. Unique constraint on `(customer_id, prize_id)`.
- **`increment_prize_spin` RPC** — atomic upsert: inserts on first spin, increments on subsequent spins, returns the new count.
- **`spin_results.prize_id`** — added to the audit log so every spin record carries prize context.
- **`customers.spin_count` dropped** — no longer needed; count is derived per-prize from `customer_prize_spins`.

Migration: `app/supabase/migrations/20260504000000_per_prize_spin_tracking.sql`

### Prize selector on SpinPage

- A `<select>` in the SpinPage header lists all prizes. Selecting one sets `?prize=<uuid>` in the URL via `useSearchParams` — no DB mutation, no customer reset.
- Falls back to `is_selected = true` on the DB when no URL param is present (backward-compatible with AdminPage selection).
- Won prizes shown with `✓` prefix and remain selectable for history viewing.
- Spin button disabled when the selected prize already has `is_won = true`.

### Spin history per prize

- `SpinHistory` now reads from `customer_prize_spins` filtered by the active `prize_id`.
- Yellow badge when `spin_count >= wins_required` (at threshold, not yet won).
- Switching prizes preserves all history — `useSelectPrize` no longer resets spin counts.

## Files Changed

| File | Change |
|------|--------|
| `app/supabase/migrations/20260504000000_per_prize_spin_tracking.sql` | New migration |
| `app/frontend/src/types/supabase.ts` | Regenerated + convenience type aliases |
| `app/frontend/src/hooks/useCustomerPrizeSpins.ts` | New hook |
| `app/frontend/src/hooks/useSpinResults.ts` | Added `prize_id` to insert payload |
| `app/frontend/src/hooks/useCustomers.ts` | Removed `spin_count` from reset/update |
| `app/frontend/src/hooks/usePrizes.ts` | Removed customer spin reset from `useSelectPrize` |
| `app/frontend/src/pages/SpinPage.tsx` | Prize selector UI, URL param, `upsertPrizeSpin` |
| `app/frontend/src/components/spin/SpinHistory.tsx` | Reads `customer_prize_spins`, yellow badge at threshold |
| `app/frontend/src/components/admin/CustomerListItem.tsx` | Removed `spin_count` badge (field dropped) |
