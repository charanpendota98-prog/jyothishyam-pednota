# V1 Build Status

This status maps the user's Vedic astrology platform plan to the current repository. “Built” means code exists; “verified” means a reproducible test or HTTP check was run. No row should be read as a claim that all competitor pages or all traditions are complete.

## Current implementation

| Workstream | Status | Notes |
|---|---|---|
| One mobile-first Telugu/English SPA | Built | Existing React/Vite application; Jyotish workspaces are integrated into one app. The all-tools searchable directory links the current modules. |
| Core chart, vargas, dasha and source-linked interpretation | Existing implementation; substantial tests pass | Reuse the current TypeScript calculation engines. Existing Swiss Ephemeris comparison fixtures are test references; the app does not retrieve or copy OnlineJyotish's private backend. |
| Daily/monthly Panchang, calendars, festivals | Existing implementation; substantial golden tests pass | Drik/Hindu convention remains explicit; local day/calendar convention is handled separately where already configured. |
| Marriage matching, KP, Prashna, Vastu, gochara, PDF | Existing modules | Each module still needs a route-by-route/reference-output parity matrix and interaction QA. |
| Eclipse calendar | Newly surfaced in app | Annual solar/lunar maxima and local visibility at maximum; local contact times and Sutak windows are not implemented yet. |
| Versioned REST contract | Newly added | `/v1/panchang`, `/v1/panchang/month`, `/v1/festivals`, `/v1/eclipses`, `/v1/chart`, `/v1/match`; successful responses use `{ apiVersion, settings, data, warnings }`. |
| IANA timezone input | Newly added for v1 | Runtime Intl tzdata resolves local birth time and date-specific calendar offsets. Since calculation engines currently use fixed-offset GeoContext, daily/monthly/yearly routes disclose DST limitations in `warnings`. |
| Privacy | Partial | v1 chart/matching inputs are computed in memory and not persisted. The separate explicit saved-profile feature still persists user-requested profiles; consent, retention and deletion policy need review before launch. |
| License decision | Commercial route indicated; purchase/terms not confirmed | The user wants proprietary software and printed reports. Do not ship Swiss Ephemeris/pyswisseph in a closed production system until a commercial license is obtained; continue the existing TypeScript engine meanwhile. |
| Next.js + FastAPI migration | Not started | The repository currently has React/Vite + Express and a tested TypeScript engine. The v1 contract was added to the existing service to avoid duplicating calculations. A migration needs an explicit decision and parity/contract gates. |

## V1 endpoints

- `GET /v1/panchang`
- `GET /v1/panchang/month`
- `GET /v1/festivals` (Drik is the only accepted value today; other traditions are rejected rather than falsely echoed)
- `GET /v1/eclipses` (maximum and local visibility only; explicit warning for missing contacts/Sutak)
- `POST /v1/chart`
- `POST /v1/match`

## Verification performed

- Full `npm run verify` suite passed after the current UI/API changes; it includes ephemeris, Panchang, calendar, Drik, convention, OnlineJyotish screenshot, festival, Jathaka, Shadbala, Sampradaya and transit fixtures.
- Added OnlineJyotish Aries Sade-Sati transit fixture: 12/12 public Saturn ingress dates match for 2020–2032.
- HTTP smoke tests passed for daily/monthly Panchang, festivals, eclipses, chart and matching v1 routes; invalid chart input is rejected; IANA timezone offsets match New York winter `-5` and summer `-4`; unsupported festival tradition is rejected.
- `npm run lint` and `npm run build` pass. Production build still warns that the main JavaScript chunk is about 3.45 MB minified; feature-level code splitting is still needed.

## Remaining V1 gates

1. Decide ephemeris licensing before adopting a Swiss Ephemeris server implementation.
2. Decide whether to retain the current single-app TypeScript stack or migrate to Next.js + FastAPI; do not keep two independent calculation engines without contract parity tests.
3. Add timezone-aware local event-time calculations, DST ambiguity/nonexistent-time detection, and historical timezone overrides.
4. Add unit/contract tests for every v1 endpoint, all request settings, validation boundaries, and error payloads.
5. Complete matching, Dosha, KP, Eclipse, Pancha-Pakshi and regional festival reference datasets with human-reviewed rule sources.
6. Complete OnlineJyotish sitemap/form audit and public-output comparison. Current site audit is still in progress.
7. Finish Telugu/English/Hindi terminology review, consent/privacy/legal pages, accessibility, E2E and mobile performance release gates.
8. Add paid report/order flows only after privacy, payment, legal and licensing choices are settled.
