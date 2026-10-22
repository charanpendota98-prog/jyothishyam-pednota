# Jyothishyam Pednota — Engineering Audit & Roadmap

_Last updated: 22 Oct 2026 · branch `arena/0eca0bd4-jyothishyam-pednota`_

This document is the honest state of the system: what is computed, how it is
verified, where it is still weak, and what to build next. It is deliberately
written for a jyotiṣa practitioner as much as for an engineer — every claim below
points at a function or a fixture you can run.

---

## 1. What the app is

A Telugu-first jyotiṣa workspace:

| Layer | Stack |
| --- | --- |
| UI | React 19 + Vite 8 + Tailwind 4 (single-page, 11 tabs) |
| Server | Express (`server.ts`, `0.0.0.0:3000`) — chart, synastry, pañcāṅga, gōcara, RAG, AI, profiles |
| Astronomy | `astronomy-engine` + a hand-written precision layer (`astroCore.ts`) |
| Validation | `scripts/verify-panchanga.ts` + Swiss-Ephemeris golden fixture |

~43,000 lines of TypeScript across 21 engines and 16 view components.

### Tabs

1. **సంపూర్ణ జాతకం** — the full janma patrika (interactive + 14-page printable grantha)
2. **వర్షఫలం** — Tājika varshaphala, 12-month forecast
3. **నామకరణం** — name-syllable / nakṣatra naming
4. **దశలు & వర్గాలు** — viṁśottarī, Jaimini chara, aṣṭakavarga, D1–D60
5. **పంచాంగం & ముహూర్తం** — daily pañcāṅga + muhūrta search
6. **వివాహ పొందిక** — 36-guṇa synastry
7. **జ్యోతిష్య AI** — cited classical synthesis (RAG over the corpus)
8. **ప్రశ్న** — horary
9. **హిందూ పంచాంగం & క్యాలెండర్** — month grid, year overview, festivals
10. **గోచార ఫలం** — transits from the janma rāśi, vedha, sāḍe-sātī, chandra/tārā bala
11. **వాస్తు శాస్త్రం** — nāma vastu, 81-pada mandala, true north, house audit
12. **గ్రంథ మండలం** — the source registry every calculation cites

---

## 2. Numerical foundation

* **Planetary positions** — Swiss Ephemeris grade. Sun/Moon/Mercury/Venus/Mars/
  Jupiter/Ascendant agree with Swiss Ephemeris to **≤ 0.003°**; Saturn 0.002°.
* **Ayanāṁśa** — Lahiri (Chitrapakṣa) as the reference; Rāmaṇ, KP, Fagan-Bradley,
  Yukteśvar, Puṣya and True-Citra are supported and fitted to the Swiss values
  (`lahiri = 23.857092 + 1.39688804T + 0.0003086T² − 0.00000058T³`). Residuals
  are documented in §6.
* **Rāhu/Ketu** — mean node in the natal chart (tradition), **true** node in
  transits. The choice is explicit, not accidental.
* **Sunrise/sunset** — disc-centre + refraction; within **1 min** of published
  pañcāṅgams over all 365 days of the 2026 fixture.

### Golden fixture (runnable)

```
npm run verify:panchanga
days checked          : 365
tithi/nakshatra/yoga  : ALL MATCH ✓
max sunrise delta     : 1 min (days > 2 min: 0)
```

The fixture (`scripts/golden/panchanga-hyderabad-2026.json`) is generated with
Swiss Ephemeris 2.10.03 (`SIDM_LAHIRI`), so this is a genuine third-party check,
not a snapshot of our own output.

---

## 3. Correctness decisions that are easy to get wrong

| Decision | Why it matters | Where |
| --- | --- | --- |
| Kṣaya (skipped) tithi assigned to the day it *begins* | Ugādi 2026 is 19 Mar, not 20 Mar | `lunarMonthStartISO`, `ugadiDateISO` |
| Adhika māsa = lunation with no saṅkrānti | Adhika Jyeṣṭha 17 May – 15 Jun 2026 | `resolveMasa` |
| Festival dedupe keeps the *later* of two sunrise matches | removes duplicate paurṇamī/pradoṣa/saṅkaṣṭi | `collectFestivalsBetween` |
| Pradoṣa is twice monthly (śukla + kṛṣṇa) | 24 vratas a year, as printed | `pradosham-shukla/-krishna` |
| Vaikuṇṭha Ekādaśī = the ekādaśī **inside Dhanurmāsa** | 2025-01-10, 2026-12-20 (not the Kārtika one) | `sunSign: 8` constraint |
| Solar-month day = *praviṣṭe* count from the saṅkrānti | 22 Oct 2026 = 5, matching Drik | `resolveHinduEra` |
| Vedha exemptions Sun↔Saturn, Moon↔Mercury | otherwise every Sun/Saturn transit looks blocked | `gocharaVedhaEngine` |
| Sāḍe-sātī boundaries from real sign ingress instants | Saturn 2023-01-17 / 2029-08-08 exactly | `nextSignIngressJd` (direction-agnostic) |
| True north from solar shadow, not compass | magnetic declination in India is 0–2° and local | `analysePlaceVastu` |
| Amṛta-kāla / varjyam are **not** shown | the classical ghāṭikā table is traditionally specific and we have not verified it | `realtimePanchangaEngine` (fields removed rather than faked) |

---

## 4. Chapter-and-verse sourcing

`src/engine/classicalSources.ts` holds 22 granthas with doctrine, chapter
references (only where the division is stable across editions), a stable Sanskrit
quote where available, and the exact features that consume them. The same
registry drives:

* the **గ్రంథ మండలం** tab (searchable, filterable),
* the compact **SourceStrip** at the bottom of every analytical tab,
* **Page 14** of the printable jātaka grantha.

Editorial rules: no invented chapter numbers, no uncertain Sanskrit quotations,
dates as scholarly ranges, public-domain originals only.

---

## 5. API surface

Strict, deterministic, and validation-first (400 + message on bad input):

```
GET  /api/panchanga?date&lat&lng&tz&ayanamsa     POST /api/panchanga
GET  /api/era?date
GET  /api/calendar/month?year&month
GET  /api/calendar/year?year
GET  /api/festivals/upcoming?from&count
POST /api/gochara          { input } | { moonSignIndex, moonNakshatraIndex }
GET  /api/sources?domain=
POST /api/chart/calculate  POST /api/chart/synastry
POST /api/rag/search       POST /api/ai/interpret   POST /api/ai/chat
GET/POST/DELETE /api/profiles
```

Measured latency (single core, cold): day pañcāṅga ≈ 100 ms, month ≈ 35 ms,
year ≈ 250 ms, gōcara ≈ 130 ms, upcoming festivals ≈ 95 ms.

---

## 6. Known gaps (ranked, with the honest reason)

1. **Ayanāṁśa residuals for the secondary modes.** Yukteśvar −1.38°,
   Puṣya −1.14°, Rāmaṇ −1.45° versus Swiss Ephemeris; True-Citra and KP are
   within 0.1°. Lahiri (the Telugu default) is exact. Fix = replace the polynomial
   fits with the Swiss definitions per mode.
2. **Rāhu mean-vs-true difference in the natal chart** ≈ 0.06°, which can move a
   nakṣatra pada at a boundary. Traditional default retained; expose a toggle
   rather than silently changing it.
3. **Smārta vs Vaiṣṇava festival divergence.** The engine follows Telugu amānta
   practice; a handful of dates (e.g. some ekādaśīs) differ by a day in other
   sampradāyas. A `sampradaya` option is the correct long-term design.
4. **Amṛta-kāla / varjyam ghāṭikā table** — needs a verified source before it can
   be shown; currently omitted (see §3).
5. **Bimonthly pradoṣa naming** — the UI now distinguishes śukla/kṛṣṇa, but the
   month-by-month pradoṣa *names* (Soma/Kuja/Śani pradoṣa) are not yet derived.
6. **Chandra/tārā bala for the whole day** is computed at the day level; the
   per-hour transitions (Moon changes rāśi mid-day) are shown only in gōcara, not
   in the calendar grid.
7. **Bundle size** — single 2.5 MB chunk. Correctness first, but code-splitting
   per tab would materially improve first paint on low-end Android (the typical
   user in TS/AP).
8. **No automated test for the festival calendar.** The pañcāṅga aṅgas have a
   golden fixture; festivals only have hand-checks. Adding a 3-year festival
   fixture against a published Telugu pañcāṅgam is the next highest-value test.

---

## 7. Next increments (in order)

1. Festival golden fixture (2025–2027, four Telugu pañcāṅgam sources) + CI gate.
2. Ayanāṁśa: replace polynomial fits with Swiss definitions; expose a
   “verify against Swiss” report in the UI.
3. `sampradaya` option (smārta / vaiṣṇava, amānta / pūrṇimānta) threaded through
   the festival engine.
4. Verified amṛta-kāla / varjyam tables with the source named on screen.
5. Per-tab code splitting + a light “print edition” typographic pass.
6. Dasha-boundary tests (viṁśottarī, Jaimini chara) against an independent
   implementation.
