# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`qubnix-basic-admin` is a **small internal admin panel** for the qubnix SaaS. Only four sections: **Дашборд**, **Тарифы** (subscription plan CRUD), **Пользователи** (read-only list), **Компании** (companies that bought a subscription, with their payment history). It is a separate project from `D:/qubnix` (main app) and `D:/qubnix-admin` (marketing/analytics panel); it was scaffolded from `qubnix-admin` (UI kit, tokens, layout, mock auth, chart components) with all analytics removed. **All data is mocked.** Web/desktop only (~1280px+). UI language: `ru` only.

## Commands

```bash
npm install                 # if ENOSPC on C: → npm install --cache "D:/temp-npm-cache"
npm run dev                 # http://localhost:5175 (5173 = qubnix, 5174 = qubnix-admin)
npm run build               # tsc -b && vite build
npm run typecheck           # tsc -b --noEmit — the only automated check; run after every non-trivial change
```

No lint, no test runner. Mock login: `admin` / `admin123`.

## Architecture

```
src/
  api-config/        axiosInstance, interceptors, queryClient, mock.ts (USE_MOCK, mockDelay, MockApiError)
  api/<resource>/    <resource>.api.ts · <resource>.types.ts · <resource>.mock.ts
                     resources: auth · plans · users · companies · dashboard
  mocks/             seeded in-memory "database" (db.ts) + random.ts + names.ts — only *.mock.ts import it
  widgets/features/<feature>/  FeatureX.tsx · hooks/useApiX.ts · components/ · modals/
  pages/<Name>Page.tsx         one-line wrapper that renders the Feature
  components/ui/     Cus* kit (Chakra v3) · components/shared/ charts, kpi, badges, query-state
  routes/ const/navigation.ts  routes and sidebar must list the same paths
```

Adding a section: feature folder → page wrapper → route in `routes/routes.tsx` → item in `const/navigation.ts` → `layout.nav.*` and `sections.*` i18n keys. A `CusDrawer`/`CusDialog` belongs in the feature's `modals/`.

### Types follow the qubnix swagger

`RawSubscriptionPlan`, `RawPlanPrice`, `RawSubscriptionOrder`, `RawUser` are the same snake_case shapes as the qubnix API (`GET /subscription-plans`, `/subscription/payments/{id}`, `/users/me`). **Admin endpoints and the admin-only shapes are proposals, not agreed with backend**: `/api/v1/admin/subscription-plans` (GET/POST/PATCH/DELETE), `/admin/users`, `/admin/companies`, `/admin/companies/{id}/orders`, `/admin/dashboard`; `AdminUserRow`, `AdminCompanyRow`, `AdminDashboard`, `PlanInput`. Every response is wrapped as `{ statusCode, data }`; request bodies as `{ data: ... }`.

### Mock layer — one switch

- `api-config/mock.ts` has one `USE_MOCK = true`; each `*.api.ts` function branches on it (`USE_MOCK ? mock : axios`). When the backend lands, flip the flag — hooks, screens and types stay. Don't add a second mock path.
- `mocks/db.ts` builds once (seed fixed): 3 plans (Start free, Pro, Business with 1/3/6/12-month prices), 120 users, 40 companies that each have at least one paid order, ~90 orders. Dashboard, companies and users are all computed from these raw records, so they agree (e.g. plan-share companies add up to the active-subscription KPI). Never hardcode a number.
- Plan CRUD mutates `getDb().plans` in memory (lost on reload). Delete is soft (`deleted_at`) and is refused for the default plan (Start) and for plans with active companies. A plan with every price disabled counts as free. Only one plan can be `recommended`.
- Mock errors are `MockApiError(status, message)`; `getApiErrorMessage` shows the message (Russian).

### Other

- Design tokens live in `src/styles/globals.css` (same as qubnix); use semantic tokens/Tailwind classes, no hex in components.
- Text: i18next, `ru` only (`src/i18n/locales/ru/*`). Plan names (Start/Pro/Business) are brand/admin data and are not translated.
- Don't put a `.ts` and `.d.ts` with the same base name in one folder.
- Cus* kit: if a component is missing, build it here (no need to ask) — this differs from the main qubnix repo.
