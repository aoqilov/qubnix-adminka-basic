# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`qubnix-basic-admin` is a **small internal admin panel** for the qubnix SaaS. Only four sections: **Дашборд**, **Тарифы** (subscription plan CRUD), **Пользователи** (read-only list), **Компании** (team companies with their subscription and purchase history). It is a separate project from `D:/qubnix` (main app) and `D:/qubnix-admin` (marketing/analytics panel); it was scaffolded from `qubnix-admin` (UI kit, tokens, layout, chart components) with all analytics removed. **All data comes from the real backend — the qubnix Dashboard API, spec in `swigerjsonDash.json`. There is no mock layer; don't add one.** Web/desktop only (~1280px+). UI language: `ru` only.

## Commands

```bash
npm install                 # if ENOSPC on C: → npm install --cache "D:/temp-npm-cache"
npm run dev                 # http://localhost:5175 (5173 = qubnix, 5174 = qubnix-admin)
npm run build               # tsc -b && vite build
npm run typecheck           # tsc -b --noEmit — the only automated check; run after every non-trivial change
```

No lint, no test runner. `.env` needs `VITE_API_URL=https://app.qubnix.uz` (see `.env.example`; on Vercel set it in project env). CORS on the backend allows `http://localhost:5175`. Log in with a real dashboard account (`owner` or `admin`) — there are no demo credentials.

## Architecture

```
src/
  api-config/        axiosInstance (baseURL = VITE_API_URL), interceptors (Bearer token, 401 → clear session), queryClient
  api/<resource>/    <resource>.api.ts (thin axios calls) · <resource>.types.ts (swagger shapes)
                     resources: auth · plans · users · companies · dashboard
  widgets/features/<feature>/  FeatureX.tsx · hooks/useApiX.ts · components/ · modals/
  pages/<Name>Page.tsx         one-line wrapper that renders the Feature
  components/ui/     Cus* kit (Chakra v3) · components/shared/ charts, kpi, badges, query-state
  routes/ const/navigation.ts  routes and sidebar must list the same paths
```

Adding a section: feature folder → page wrapper → route in `routes/routes.tsx` → item in `const/navigation.ts` → `layout.nav.*` and `sections.*` i18n keys. A `CusDrawer`/`CusDialog` belongs in the feature's `modals/`.

### Backend contract (`swigerjsonDash.json`)

- All paths are `/api/v1/dashboard/*`. Responses are `{ statusCode, data }`, request bodies `{ data: ... }`, errors `{ statusCode, message, code }`. Types in `api/*/*.types.ts` mirror the swagger 1:1 (snake_case) — when the swagger changes, update the type first.
- **Ids and money are strings** except plan/price ids (integers): users, companies, owners, events have 19-digit string ids; all `*_uzs` amounts are decimal strings. `fmt.money` accepts `number | string`; `CusTable` rows accept `id: number | string`. Don't `Number()` an id.
- Auth: `POST /auth/login` → `access_token` (24 h, stateless) + `user`; `GET /auth/me`. No logout endpoint — logout only clears the local session. Roles: `owner` can write plans, `admin` is read-only (backend 403) — `FeatureTariffs` hides write actions for `admin`.
- Plans: `PATCH /subscription-plans/{id}` does not take prices. Prices are added with `POST /{id}/prices` and edited with `PATCH /{id}/prices/{priceID}`; there is no price delete (only `is_active: false`). `savePlan` in `tariffs/hooks/useApiTariffs.ts` diffs the form and runs: enable/add prices → patch plan (changed fields only) → disable prices, because an active paid plan must always keep an active price. `is_free` is set only on create; discount is 0..99. Delete is soft and returns 409 for the default plan or a plan in use.
- Users: `GET /client-users` (search, sort, pagination). Companies: `GET /organizations` (search + sort only — no plan/status filter) and `GET /organizations/history?organization_id=` (purchase/renewal/plan-change/cancel events, not payment orders).
- Dashboard is composed client-side in `dashboard/hooks/useApiDashboard.ts` from `/stats` (twice: this month and the same days of last month), `/stats/revenue/monthly`, `/stats/users/monthly`, `/stats/plans` (12 months) and `/organizations/history` (recent payments). All stats take `from`/`to` as Asia/Tashkent dates (`tashkentTodayApiDate`). Only revenue has a previous-period comparison; user/company/subscription counts are current totals with `previous: null`.
- Backend `message` is English; `getApiErrorMessage` shows Russian text by HTTP status and appends the backend message for 400/409.
- Unused endpoints that exist: `POST /dashboard/users` (owner creates dashboard accounts), `GET /client-users/{id}`, `/client-users/{id}/organizations`, `/client-users/{id}/payments`, `GET /organizations/{id}`.

### Other

- Design tokens live in `src/styles/globals.css` (same as qubnix); use semantic tokens/Tailwind classes, no hex in components.
- Text: i18next, `ru` only (`src/i18n/locales/ru/*`). Plan names (Start/Pro/Business) are brand/admin data and are not translated.
- Don't put a `.ts` and `.d.ts` with the same base name in one folder.
- Cus* kit: if a component is missing, build it here (no need to ask) — this differs from the main qubnix repo.
