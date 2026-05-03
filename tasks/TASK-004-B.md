---
id: TASK-004-B
title: "Multi-prize: PrizeManager admin UI"
status: done
tags: [frontend, ui, supabase]
depends_on: TASK-004-A
created: 2026-04-30
updated: 2026-05-03
---

# TASK-004-B — Admin UI: PrizeManager

## Goal

Give admins a UI to create, edit, delete, and select the active prize. Selecting a prize resets all customers (clean slate for the new session).

## Context

Part 2 of 3 in the multi-prize feature. Depends on TASK-004-A (prizes table must exist).

**Model:** 1 prize = 1 physical item. Each prize has `wins_required` (default 1, big prizes = 2) and `remove_after_win`. Won prizes show their winner's name. No quantity/stock fields.

## Hook: `usePrizes.ts`

`app/frontend/src/hooks/usePrizes.ts`

| Export             | Behaviour |
| ------------------ | --------- |
| `usePrizes()`      | Fetch all prizes ordered by `created_at` |
| `useCreatePrize()` | INSERT new prize |
| `useUpdatePrize()` | UPDATE by id (block if `is_won = true`) |
| `useDeletePrize()` | Hard delete — block if `is_selected = true` or `is_won = true` |
| `useSelectPrize()` | 1. Clear `is_selected` on all prizes (`.gte('created_at','1970-01-01')`) 2. Set `is_selected = true` on chosen prize 3. Reset all customers (`spin_count=0, is_winner=false, is_active=true`) |

Follow patterns from `useCustomers.ts` and `useSpinSettings.ts`.

## Component: `PrizeManager.tsx`

`app/frontend/src/components/admin/PrizeManager.tsx`

- Prize list: card per prize showing:
  - Name + `wins_required` chip (e.g. "ต้องหมุน 2 ครั้ง")
  - Selected indicator (highlighted border/badge)
  - Won indicator + winner name if `is_won = true`
- **"เลือกรางวัลนี้"** button — confirmation dialog warning customers will be reset, then calls `useSelectPrize`. Disabled if `is_won = true`.
- **Add / Edit form** (inline or dialog) — fields: name (required), description, image upload, wins_required (1 or 2), remove_after_win
- **Delete** — disabled when `is_selected = true` or `is_won = true`
- Image upload — reuse Supabase Storage pattern from `SpinSettingsForm` (`prize-images` bucket)

## AdminPage changes

`app/frontend/src/pages/AdminPage.tsx`

- Add `<PrizeManager />` as a new section or tab

## SpinSettingsForm changes

`app/frontend/src/components/admin/SpinSettingsForm.tsx`

- Remove `wins_required` and `remove_after_win` inputs (columns no longer exist on `spin_settings`)

## Acceptance Criteria

- [x] Admin can create a prize with all fields; image upload works
- [x] Admin can edit any prize that has not been won
- [x] Selecting a prize shows confirmation dialog, resets customers, marks prize as selected
- [x] Previously selected prize loses its selected indicator
- [x] Cannot select, edit, or delete a prize that is already won
- [x] Cannot delete the currently selected prize
- [x] Won prize card shows winner name (via `winner_customer_id` → customer name lookup)
- [x] `wins_required` and `remove_after_win` inputs gone from SpinSettingsForm
- [x] `npm run typecheck` passes

## Files

- `app/frontend/src/hooks/usePrizes.ts` (new)
- `app/frontend/src/components/admin/PrizeManager.tsx` (new)
- `app/frontend/src/components/admin/SpinSettingsForm.tsx` (remove two fields)
- `app/frontend/src/pages/AdminPage.tsx` (add PrizeManager)

## Blockers

TASK-004-A must be complete.
