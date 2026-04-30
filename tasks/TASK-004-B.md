---
id: TASK-004-B
title: "Multi-prize: PrizeManager admin UI"
status: open
tags: [frontend, ui, supabase]
depends_on: TASK-004-A
created: 2026-04-30
updated: 2026-04-30
---

# TASK-004-B — Admin UI: PrizeManager

## Goal

Give admins a UI to create, edit, delete, and select the active prize. Selecting a prize resets all customers (clean slate for the new session).

## Context

Part 2 of 3 in the multi-prize feature. Depends on TASK-004-A (prizes table must exist).

## Hook: `usePrizes.ts`

`app/frontend/src/hooks/usePrizes.ts`

| Export             | Behaviour                                                                                                                                                                                     |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `usePrizes()`      | Fetch all prizes ordered by `created_at`                                                                                                                                                      |
| `useCreatePrize()` | INSERT new prize                                                                                                                                                                              |
| `useUpdatePrize()` | UPDATE by id                                                                                                                                                                                  |
| `useDeletePrize()` | Hard delete — caller must block if `is_selected = true`                                                                                                                                       |
| `useSelectPrize()` | 1. Clear `is_selected` on all prizes (`.gte('created_at','1970-01-01')`) 2. Set `is_selected = true` on chosen prize 3. Reset all customers (`spin_count=0, is_winner=false, is_active=true`) |

Follow patterns from `useCustomers.ts` and `useSpinSettings.ts`.

## Component: `PrizeManager.tsx`

`app/frontend/src/components/admin/PrizeManager.tsx`

- Prize list: card per prize showing name, `wins_required` chip, quantity/times_won badge, selected indicator
- **"เลือกรางวัลนี้"** button — confirmation dialog warning customers will be reset, then calls `useSelectPrize`
- **Add / Edit form** (inline or dialog) — fields: name (required), description, image upload, wins_required, remove_after_win, quantity (`0` displayed as "ไม่จำกัด")
- **Delete** — disabled when `is_selected = true`
- Image upload — reuse Supabase Storage pattern from `SpinSettingsForm` (`prize-images` bucket)

## AdminPage changes

`app/frontend/src/pages/AdminPage.tsx`

- Add `<PrizeManager />` as a new section or tab

## SpinSettingsForm changes

`app/frontend/src/components/admin/SpinSettingsForm.tsx`

- Remove `wins_required` and `remove_after_win` inputs (columns no longer exist on `spin_settings`)

## Acceptance Criteria

- [ ] Admin can create a prize with all fields; image upload works
- [ ] Admin can edit any prize
- [ ] Selecting a prize shows confirmation dialog, resets customers, marks prize as selected
- [ ] Previously selected prize loses its selected indicator
- [ ] Cannot delete the currently selected prize (button disabled)
- [ ] `wins_required` and `remove_after_win` inputs gone from SpinSettingsForm
- [ ] `npm run typecheck` passes

## Files

- `app/frontend/src/hooks/usePrizes.ts` (new)
- `app/frontend/src/components/admin/PrizeManager.tsx` (new)
- `app/frontend/src/components/admin/SpinSettingsForm.tsx` (remove two fields)
- `app/frontend/src/pages/AdminPage.tsx` (add PrizeManager)

## Blockers

TASK-004-A must be complete.
