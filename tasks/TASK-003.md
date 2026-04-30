---
id: TASK-003
title: Always show spin history panel with empty state
status: done
tags: [frontend, ui]
poc_ref:
created: 2026-04-30
updated: 2026-04-30
---

# TASK-003 — Always Show Spin History Panel

## Goal

The spin history panel must always be visible on `SpinPage`. When there is no history yet, display an empty container with a placeholder message instead of hiding the panel.

## Context

Previously `SpinHistory` returned `null` when `selected.length === 0`, and `SpinPage` wrapped the panel in `{hasHistory && ...}`, so the panel was completely absent before the first spin. This caused a layout shift when the first result appeared and made the UI feel incomplete.

## Acceptance Criteria

- [x] `SpinHistory` always renders its container regardless of history length
- [x] When empty, the panel shows "ยังไม่มีประวัติการจับฉลาก" placeholder text centered in the panel
- [x] `SpinPage` removes the `hasHistory` guard — the panel column is always present in the layout
- [x] Existing animation behaviour (`AnimatePresence` / `motion.div`) unchanged
- [x] Types checked (`npm run typecheck` passes with no errors)

## Implementation Notes

- Removed the `if (selected.length === 0) return null` early-return in `SpinHistory.tsx` and replaced it with a ternary inside the container: empty state vs. the grid.
- Removed `const hasHistory = ...` from `SpinPage.tsx` and unwrapped the conditional render.

## Blockers

None — completed.

## Change Log

| Date       | Note                        |
| ---------- | --------------------------- |
| 2026-04-30 | Task created and completed  |
