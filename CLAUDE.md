# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

- `npm run dev` — dev server (http://localhost:3000)
- `npm run build` / `npm start` — production build / serve
- `npm run lint` — ESLint (flat config, `eslint.config.mjs`)

There is no test runner configured. Copy `.env.example` to `.env.local` and fill it in before running (see Configuration).

## What this is

A concrete quality-control (QC) tracker (Vietnamese/English UI): users log poured concrete elements (cấu kiện), track curing and the compressive-test due date (default 28 days after pour), and record test results/photos. Next.js App Router, React 19, Tailwind v4, shadcn/ui (base-ui) components, zod, zustand.

## Architecture

**Storage is Google Sheets, not a database.** `lib/sheets.ts` is the only module that talks to the Sheets API (service-account JWT). It lazily creates the `Elements`, `Suppliers`, `Categories`, `Projects` and `Buildings` tabs and header rows on first use (`ensureSetup`). Rows are addressed by position: data starts at row 2, and `lib/concrete.ts` / `lib/options.ts` find a record by scanning for its id/name and then `updateRow`/`deleteRow` by row number. Column order is defined by `ELEMENT_HEADERS` in `lib/sheets.ts` and must stay in sync with `rowToElement`/`elementToRow` and `ELEMENT_RANGE` (`A2:Q`) in `lib/concrete.ts`. Array fields (`photoUrls`, `testPhotoUrls`) are stored as JSON strings in a cell.

**Hierarchy:** Project → Building → Element. `lib/projects.ts` manages the `Projects` / `Buildings` tabs; each element points at its building via the `buildingId` column. Projects/buildings can only be deleted when empty (the action returns `notEmpty`). On first setup, elements with no `buildingId` are attached to an auto-created "Default project / Default building" (`attachOrphanElements` in `lib/sheets.ts`). Suppliers/categories are global, not per project.

**Data layer** (`lib/`, all `server-only`): `concrete.ts` (elements CRUD, sample-set count = 1 per 20 m³, status computation), `options.ts` (supplier/category lists), `stats.ts` (dashboard aggregates), `definitions.ts` (zod schemas + `FormState`), `users.ts` (demo credentials from env). Mutations go through server actions in `app/actions/` (`auth.ts`, `elements.ts`, `options.ts`), which call the data layer and `revalidatePath`.

**Routing / i18n:** everything lives under `app/[lang]/` (locales `vi`, `en` — see `lib/i18n.ts`). Authenticated pages are in the `(app)` route group: `/` (project list), `projects/[projectId]` (buildings + aggregate stats), `projects/[projectId]/buildings/[buildingId]` (elements dashboard), plus `suppliers`, `categories`; `login` and `export/route.ts` (Excel export via exceljs, `?buildingId=` filters) sit beside it. Strings come from `app/[lang]/dictionaries/{vi,en}.json` via `getDictionary()`; add keys to both files.

**Auth:** JWT session cookie (`jose`, `lib/session.ts`). `proxy.ts` (Next 16's replacement for `middleware.ts`) does only an optimistic cookie-presence check plus locale detection/redirect (`NEXT_LOCALE` cookie, `Accept-Language`); real verification happens in server code via `verifySession()`.

**Photo uploads** are written to `public/uploads/` on the local filesystem (`uploadElementPhoto` in `app/actions/elements.ts`), so they won't persist on read-only/serverless hosts like Vercel (`vercel.json` pins region `sin1`).

## Configuration

Env vars (`.env.example`): `SESSION_SECRET`, `AUTH_ADMIN_USERNAME`/`AUTH_ADMIN_PASSWORD`, `GOOGLE_SHEET_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY` (quoted, with `\n` escapes). The sheet must be shared (Editor) with the service account.

## Conventions

- Path alias `@/` maps to the repo root.
- Domain comments/field names mix Vietnamese terms (cấu kiện = element, NCC = supplier, hạng mục = category, tổ mẫu = sample set) — keep that vocabulary consistent.
