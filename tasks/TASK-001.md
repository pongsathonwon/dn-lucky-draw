---
id: TASK-001
title: Port Base44 POC to Supabase + React 18 + Vite + TypeScript
status: done
tags: [supabase, migration, frontend, auth, ui, animation, rls]
poc_ref: poc/src/
created: 2026-04-30
updated: 2026-04-30
---

# TASK-001 — Port Base44 POC to Supabase + React 18 + Vite + TypeScript

## Goal

Replace the Base44-hosted POC with a fully self-controlled stack: Supabase (PostgreSQL + Auth + Storage) backend and React 18 + Vite + TypeScript frontend, preserving all Thai-language UI and spin logic.

## Context

The `poc/` directory contained a working Thai-language lucky draw wheel app built on Base44 (proprietary BaaS). The goal was to eliminate the Base44 dependency and own the full stack.

- POC file(s): `poc/src/pages/SpinPage.jsx`, `poc/src/pages/AdminPage.jsx`, `poc/src/components/spin/`, `poc/src/components/admin/`
- Entity/schema: `poc/entities/Customer.json`, `poc/entities/SpinResult.json`, `poc/entities/SpinSettings.json`

## Acceptance Criteria

- [x] Supabase migrations for `customers`, `spin_results`, `spin_settings`, and `prize-images` storage bucket
- [x] RLS policies: anon read-only for customers/settings; anon insert for spin_results; authenticated full access
- [x] Singleton `spin_settings` row enforced via PostgreSQL trigger
- [x] React 18 + Vite + TypeScript frontend scaffolded in `app/frontend/`
- [x] All Shadcn/ui primitives converted to `.tsx` with proper types
- [x] React Query hooks: `useCustomers`, `useSpinResults`, `useSpinSettings` and mutations
- [x] Supabase Auth replacing Base44 auth — email/password, admin-only (`enable_signup = false`)
- [x] SpinPage public (no auth required); AdminPage behind auth gate
- [x] Win logic: `newSpinCount > 0 && newSpinCount % 2 === 0`
- [x] SpinResult schema: `{ customer_id, outcome: 'win' | 'no_win' }` (no denormalized fields)
- [x] Image upload via Supabase Storage replacing `base44.integrations.Core.UploadFile`
- [x] `CustomerManager` written from scratch (POC was a placeholder)
- [x] Types checked (`npm run typecheck` passes with no errors)

## Implementation Notes

- POC `CustomerManager.jsx` was a copy of `ProtectedRoute` — had to be written from scratch with react-hook-form + zod, bulk import, per-row toggle/delete.
- POC win logic (`newSpinCount >= 2`) differed from CLAUDE.md canonical — used CLAUDE.md version.
- `sonner.jsx` in POC imported `next-themes` (not in new stack) — rewritten with hardcoded `theme="light"`.
- `useResetAllCustomers` uses `.gte('created_at', '1970-01-01')` to match all rows without a dummy UUID.
- `baseUrl` removed from `tsconfig.json` (deprecated in `moduleResolution: bundler`); `paths` works without it.
- `src/vite-env.d.ts` added with `/// <reference types="vite/client" />` to type `import.meta.env`.
- All UI components converted from `.jsx` to `.tsx` by the user to resolve untyped `forwardRef` exports.

## Blockers

None — completed.

## Change Log

| Date       | Note                                    |
| ---------- | --------------------------------------- |
| 2026-04-30 | Task created and completed in one session |
