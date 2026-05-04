---
id: TASK-007
title: Soft delete for prizes and customers
status: done
tags: [supabase, migration, frontend]
poc_ref:
created: 2026-05-04
updated: 2026-05-04
---

# TASK-007 — Soft delete for prizes and customers

## Goal

Replace hard deletes on `prizes` and `customers` with soft deletes using a `deleted_at` timestamp.
Deleted records are filtered out of all queries but preserved in the database.

## Context

Currently both tables use hard deletes (`.delete()`), which permanently removes rows and their
associated history. Soft delete preserves the data for audit/history purposes while hiding deleted
records from the UI.

## Acceptance Criteria

- [x] `deleted_at timestamptz default null` added to `prizes` via migration
- [x] `deleted_at timestamptz default null` added to `customers` via migration
- [x] `usePrizes` query filters `.is('deleted_at', null)`
- [x] `useDeletePrize` sets `deleted_at` instead of calling `.delete()`
- [x] `useCustomers` query filters `.is('deleted_at', null)`
- [x] `useDeleteCustomer` sets `deleted_at` instead of calling `.delete()`
- [x] `useResetAllCustomers` bulk update excludes soft-deleted customers
- [x] Types regenerated (`supabase gen types`)
- [x] `npm run typecheck` passes with no errors

## Implementation Notes

- `customers` already has `is_active` for temporary deactivation — `deleted_at` is a separate
  concept for permanent soft removal
- `useResetAllCustomers` uses a `.gte('created_at', '1970-01-01')` catch-all; add `.is('deleted_at', null)`
  so it doesn't accidentally revive soft-deleted rows
- No RLS changes needed — filtering is done at the query level in hooks

## Blockers

TASK-006 should be completed first (types will be regenerated again here).

## Change Log

| Date       | Note         |
| ---------- | ------------ |
| 2026-05-04 | Task created |
