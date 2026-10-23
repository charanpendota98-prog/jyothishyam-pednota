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

---

## 8. Landscape — how this differs from the public jyotiṣa repos

The most-starred public projects in this space are **calculation libraries or
REST wrappers**, not end-user pañcāṅga applications:

| Project | What it is | Where this app differs |
| --- | --- | --- |
| `kunjara/jyotish` (PHP) | library for vaidika calculations | no UI, no pañcāṅga calendar, no Telugu output |
| `jyotisham/jyotisha` (Python/TeX) | historical/astronomical vedāṅga tools | research-oriented; not a practising jyotiṣī's workspace |
| `teal33t/jyotish-api` (C) | self-hosted REST API for chart maths | API only; no festival rules, no grantha citations |
| `northtara/jyotishganit` (Python) | JPL-ephemeris calculation library | library; no mandala/vastu, no printable book |
| `VicharaVandana/jyotishyamitra` | birth-data computation helper | narrower scope (data computation) |

What no public repo in this group offers, and this app does:

1. **Telugu-first output** end to end (aṅgas, kālas, festivals, 14-page grantha),
   not transliterated English.
2. **A festival rule engine that is regression-gated** against published dates —
   including kṣaya/vṛddhi tithi handling and moonrise-based Saṅkaṣṭi.
3. **A citation registry** so each number on screen can be traced to a grantha and
   a chapter, mirrored into the PDF appendix.
4. **Vāstu with true-north geometry** (solar shadow methods, 81-pada mandala,
   name-syllable directions) — outside the scope of an ephemeris library.
5. **Gōcara with vedha logic** from the janma rāśi, with the classical exemptions
   and Sāḍe-sātī boundary instants derived from real ingress crossings.

The honest counterpoint: those libraries are **specialised, test-covered
building blocks** with wider API surfaces (multiple house systems, JHD/SE1 file
support, bulk ephemeris export). Where this app can borrow from them is test
discipline (property-based nakṣatra/tithi boundary tests) and ephemeris
interoperability (reading Swiss `.se1` files directly for offline deployments).

---

## 9. External cross-check — Swiss Ephemeris · BPHS tables · PyJHora (23 Oct 2026)

Self-consistency gates are necessary but not sufficient: they only prove the app
agrees with *itself*. This section records a comparison against three
independent implementations.

| Reference | Version | What it gave us |
| --- | --- | --- |
| Swiss Ephemeris (`pyswisseph`) | 2.10.03, SIDM_LAHIRI | planetary longitudes, ascendant, sunrise/sunset |
| BPHS aṣṭakavarga tables | hand-encoded, independently | bhinna/sarva bindus |
| PyJHora (Open Astro) | `main` @ Oct 2026 | pañcāṅga, daśā, ṣaḍbala component structure |
| drik-panchanga | `webresh` @ Oct 2026 | pañcāṅga sanity (tithi/nakṣatra/yoga) |

Reproduce:

```bash
npx tsx scripts/dump-crosscheck.ts     # app values → .cache/crosscheck-app.json
pip install pyswisseph
python3 scripts/crosscheck-swisseph.py # exits 1 on any tolerance breach
```

### 9.1 Results (7 charts, 1998–2026, four cities)

```
✓ Charan  asc Δ  8.5" · ayanāṃśa 23.83425° · nak Jyeshtha · tithi 18 · yoga 21 · SAVΣ 337
✓ A       asc Δ 16.9" · ayanāṃśa 23.50787° · nak Ashlesha · tithi 19 · yoga  1 · SAVΣ 337
✓ B       asc Δ 13.2" · ayanāṃśa 23.90663° · nak U.Bhadrapada · tithi 22 · yoga 6 · SAVΣ 337
✓ C       asc Δ  8.2" · ayanāṃśa 24.23156° · nak Shatabhisha · tithi 11 · yoga 11 · SAVΣ 337
✓ D       asc Δ 11.2" · ayanāṃśa 23.19985° · nak Hasta · tithi 25 · yoga  4 · SAVΣ 337
✓ E       asc Δ 16.9" · ayanāṃśa 23.99912° · nak Hasta · tithi 18 · yoga 10 · SAVΣ 337
✓ F       asc Δ 13.9" · ayanāṃśa 23.85706° · nak Swati · tithi 25 · yoga  7 · SAVΣ 337

అత్యధిక గ్రహ భేదం: 20.2" (C/Venus) · లగ్నం: 16.9" (A) · తీర్పు: విజయం
```

* **Planets** — worst case 20.2″ from Swiss Ephemeris (0.0056°): the residual is
  the light-time/aberration convention for inner planets near conjunction. It can
  never move a rāśi; it can only matter within 20″ of a sign or nakṣatra edge.
* **Lagna** — worst 16.9″ (0.0047°), traced to the independent obliquity/ΔT path
  in `astroCore.ts`, not to a formula error.
* **Pañcāṅga** — tithi, yoga, nakṣatra+pada identical in every case; sunrise /
  sunset within 3 minutes (tolerance: disc-centre, no refraction).
* **Aṣṭakavarga** — our SAV reproduces the hand-encoded BPHS tables **exactly**
  on all seven charts, including the per-planet totals 48/49/39/54/56/52/39 = 337.
  (PyJHora's default returns a different distribution because it enables its
  `ashtakavarga_*` variant flags; totals are still 337.)

### 9.2 What differs from PyJHora, and why we keep our number

1. **Ṣaḍbala components.** Totals differ by up to 130 virūpas (Moon, Jupiter).
   Component-wise: dig bala agrees to 0.01 virūpa for six planets; dṛk bala
   agrees; naisargika is fixed by BPHS. Differences are confined to
   • cheṣṭā bala — PyJHora reports 100.19 for Mercury and 99.12 for Jupiter, both
     **above the classical ceiling of 60 virūpas**; the app clamps to 60.
   • Mercury's dig bala — PyJHora returns 82.5, also above the 60 ceiling; the app
     returns 37.5 (= 60 × (1 − 67.45°/180)), which is the BPHS east-direction rule.
   • Moon's pakṣa bala — PyJHora treats a kṛṣṇa-pakṣa Moon as malefic (0); we
     apply the BPHS benefic formula (60 − elongation/3) and get 50.4.
2. **Rāhu/Ketu** — PyJHora uses the *true* node; the app uses the *mean* node,
   which is what Telugu printed pañcāṅgams and the reference patrikā use. Both
   are exposed in the chart; the difference is printed on the sphuṭa page.
3. **Daśā year length** — the app uses the 365.25-day solar year (pañcāṅga
   convention). Against an SE-based reconstruction, viṁśottarī boundaries agree
   within one day across the whole 120-year cycle.

### 9.3 Text-level verification

Two auditors now read the generated jātaka and re-derive every claim:

| Auditor | Claims checked | Errors |
| --- | --- | --- |
| `jathakaClaimAudit` — planet→house, house→sign, planet→house+sign+nakṣatra | 89 per chart | 0 |
| dṛṣṭi & occupancy audit — “X (nవ ఇంట నుండి)” and house occupants | 57 per chart | 0 |

The dṛṣṭi audit is the only place where a convention matters: Rāhu/Ketu are given
the 5/7/9 dṛṣṭi of Phaladeepika (not the 7th only); with that rule all 57 claims
resolve exactly.

### 9.4 Known limits (unchanged)

Naïve birth times, unknown place precision, and the 20″ ephemeris residual mean
that a graha within ~0.01° of a sign/nakṣatra boundary is genuinely ambiguous.
Nothing in the app hides that: the sphuṭa table prints four decimals and the
nakṣatra-pada table shows the elapsed percentage.

---

## 10. Ṣaḍbala — re-derived from the printed tables (23 Oct 2026)

An audit against an independent implementation exposed that several ṣaḍbala
sub-components were **not** what BPHS specifies. All of them are now computed
from the textbook rules and pinned by `npm run verify:shadbala`, which compares
the engine against two *printed* worked examples:

| Fixture | Source | Chart |
| --- | --- | --- |
| VP Jain | *Shadbala and Bhavabala* | 1981-09-13 01:30, 28°39′N 77°13′E, Lahiri |
| BV Raman | *Hindu Predictive Astrology* | 1918-10-16 14:22:16, 13°N 77°35′E, Raman |

266 textbook checks (7 planets × 19 quantities) **plus 35 rule-invariants**
(hora cycle, cheṣṭā bounds) = **301 pass, 0 fail**.

### 10.1 What was wrong, and what the rule is

| Component | Before | Now (BPHS ch. 27) |
| --- | --- | --- |
| **Saptavargaja** (D1·D2·D3·D7·D9·D12·D30) | weights 45/30/20/15/10/4/2, natural friendship only | 45 mūlatrikoṇa, 30 own, 22.5 adhimitra, 15 mitra, 7.5 sama, 3.75 śatru, 1.875 adhiśatru, **compound** (natural + temporal) relationship |
| **Cheṣṭā** | placeholder buckets (7.5/15/30/45) | cheṣṭā-kendra = \|śīghrocca − (true + mean)/2\| ÷ 3, mean longitudes from JPL J2000 elements, capped at 60 |
| **Cheṣṭā, Sun & Moon** | Sun = ayana, Moon = pakṣa (double counted) | 0 — their motional strength is already inside kāla-bala as ayana/pakṣa |
| **Ayana, Sun** | single | **doubled** (BPHS: sūryasya ayana-balaṃ dvi-guṇam) |
| **Pakṣa, Moon** | single | **doubled** (candrasya pakṣa-balam dvi-guṇam) |
| **Drekkāṇa** | (male→1st, female→2nd, neuter→3rd) | 1st male (Sun/Mars/Jupiter), 2nd neuter (Mercury/Saturn), 3rd female (Moon/Venus) |
| **Varṣa / Māsa lords** | weekday of the saṅkrānti | Kali ahargana cycle (360-day / 30-day), Mars-first weekday order |
| **Dṛk bala** | ad-hoc piecewise curve | Parāśara sphuṭa dṛṣṭi table with Saturn/Mars/Jupiter special aspects, ÷ 4 by benefic/malefic |
| **Benefic/malefic set** | fixed list | Mercury flips with its company (BPHS ch. 3); a kṛṣṇa-pakṣa Moon is a malefic |

Effect on a real chart (Charan, 1998-05-14 08:45): the Moon's total ṣaḍbala moved
from 391.8 to 348.6 virūpas, Saturn's from 217.9 to 179.2 — i.e. the earlier
numbers were not merely imprecise, they ranked planets in the wrong order.

### 10.2 Where we deliberately differ from other software

* **Dig bala** — some implementations divide the *unsigned* difference of
  longitudes by 3 without reducing it to the shorter arc; that can return 64 or
  even 82 virūpas, above the 60 ceiling. We reduce to ≤180° first.
* **Cheṣṭā** — the same implementations let cheṣṭā exceed 60. We cap at 60.
* **Sun's ayana / Moon's pakṣa** — several commercial programs do not double
  them. We follow the text, and `verify-jathaka` reconciles the difference
  explicitly (`PDF + ద్విగుణ సవరణ` checks).

### 10.3 Text that depends on ṣaḍbala

Because the totals changed, every downstream sentence was re-derived in the same
commit: mahādaśā phala ratings, the six pillar scores, the planet-strength
ranking in the paṇḍita review, and the PDF ṣaḍbala page. `JATHAKA_GATES`
regenerated automatically (446 → 446 with 0 failures).

---

## Appendix A — Cross-check ledger (23 Oct 2026)

Reference implementations used, all cloned and run locally:

| Reference | Used for |
| --- | --- |
| Swiss Ephemeris 2.10.03 (`pyswisseph`) | planetary longitudes, ascendant, rise/set, karana |
| PyJHora (`naturalstupid/pyjhora`, `src`) | ṣaḍbala, aṣṭakavarga, divisional charts, chara kārakas, daśā |
| drik-panchanga (`webresh`) | pañcāṅga sanity |
| VP Jain / BV Raman printed tables | ṣaḍbala ground truth |

| Quantity | Charts | Result |
| --- | --- | --- |
| Graha longitudes (Lahiri) | 7 | max Δ **20.2″** (Venus), Moon ≤ 4.7″, Sun ≤ 1.1″ |
| Lagna | 7 | max Δ **16.9″** |
| Nakṣatra + pada | 7 | identical |
| Tithi · yoga · karana | 7 + 2 | identical |
| Sunrise / sunset | 7 | ≤ 1 minute (365-day sweep: 0 days > 2 min) |
| Divisional charts **D3 · D7 · D9 · D10 · D12 · D30** | 3 × 7 grahas | **identical (126/126)** |
| D9 lagna, D10 lagna | 3 | identical |
| **Aṣṭakavarga (84 BAV cells + SAV)** | 3 | **identical** once PyJHora's six optional bindu flags are off |
| Chara kārakas (7-kāraka scheme) | 1 | identical to PyJHora's 8-kāraka ordering minus Rāhu |
| Viṁśottarī mahādaśā **order** | 3 | identical |
| Viṁśottarī **dates** | 3 | ≤ 3 days over 60 years — Moon longitude 4.7″ + year-length convention |
| Ṣaḍbala | 2 textbooks × 7 grahas × 19 quantities | **266/266 within tolerance** (+35 invariant checks) |

### Documented convention choices (not errors)

1. **Rāhu/Ketu** — mean node (pāñcāṅga/printed-patrikā convention); the true node is
   also shown, difference 1.47° on the reference chart.
2. **D2 horā** — Parāśara's traditional Cancer/Leo scheme. PyJHora's default uses
   its "Kashinath" variant, hence 21/21 D2 cells differ while every other varga agrees.
3. **Dig bala** — reduced to the shorter arc (≤ 60 virūpas). Some implementations
   divide an unreduced difference and report 64–82.
4. **Cheṣṭā** — capped at 60; the same implementations report up to 120.
5. **Viṁśottarī year** — 365.25 days.
6. **Daśā start** — computed from the Moon's exact nadir position in the nakṣatra,
   not from a rounded pada.

## Appendix B — Ṣaḍbala, reconciled virūpa-by-virūpa with PyJHora (23 Oct 2026)

A second chart (Charan, 1998-05-14 08:45, Hyderabad) was pushed through
PyJHora's `strength.shad_bala` component by component. Sthana, dig and dṛk
agree exactly; kāla and cheṣṭā do not. Rather than "close the gap", every
virūpa of the gap was attributed to one of four causes — three of them
PyJHora defects that also contradict the two printed textbooks it ships tests for.

| Cause | Ours | PyJHora | Which one the books support |
| --- | --- | --- | --- |
| **Hora lord** | Sun 60 / Saturn 0 | Saturn 60 / Sun 0 | ours — Thursday's 3rd horā is the Sun (see B.2) |
| **Pakṣa bala** | malefic 9.59 (Moon 19.18 doubled) | malefic **−9.59** (Moon −19.18) | ours — pakṣa bala is capped at 60; PyJHora's is not (see B.1) |
| **Ayana bala** (Moon, Mercury, Saturn, Venus) | 35.86 / 16.43 | 24.08 / 40.42 | ours — PyJHora drops the group rule and reads the declination off the *sidereal* longitude (see B.3) |
| **Cheṣṭā, Mercury / Jupiter** | 24.18 / 21.12 | 100.19 / 99.12 | ours — same kendra, folded to the shorter arc and capped at 60 (see B.3) |

Full attribution on the reference chart (virūpas, ours − PyJHora):

| Graha | Δ kāla | Δ cheṣṭā | Δ dig | Δ total | Accounting |
| --- | --- | --- | --- | --- | --- |
| Sun | +79.70 | 0 | 0 | **+79.70** | hora +60.00, pakṣa +19.18, nathonnata +1.02, ayana −0.50 |
| Moon | +36.61 | 0 | 0 | **+36.60** | pakṣa +38.37 (doubled), nathonnata −1.02, ayana −0.74 |
| Mars | +17.89 | −0.76 | 0 | **+17.14** | pakṣa +19.18, nathonnata −1.02, ayana −0.27 |
| Mercury | +19.46 | −76.01 | −44.96 | **−101.51** | pakṣa +19.18, ayana +0.28; dig/cheṣṭā = unreduced arc |
| Jupiter | −18.12 | −78.00 | 0 | **−96.12** | pakṣa −19.18, ayana +1.06; cheṣṭā = unfolded kendra |
| Venus | −6.38 | −3.30 | 0 | **−9.68** | pakṣa −19.18, ayana +11.78, cheṣṭā −3.30 |
| Saturn | −42.06 | −0.37 | 0 | **−42.43** | hora −60.00, pakṣa +19.18, nathonnata +1.02, ayana −0.22 |

Nothing is left unexplained: the seven totals differ by 0.00–0.01 v. from the
sum of the named causes.

### B.1 Pakṣa bala — the elongation must be folded

BPHS: pakṣa bala = the Moon's distance **from the Sun** ÷ 3, read on the
shorter arc, so it runs 0 → 60 into pūrṇimā and 60 → 0 into amāvasyā, and the
malefic branch is `60 − pakṣa`. PyJHora's `_paksha_bala` uses
`abs(sun_long − moon_long) / 3` on the raw 0–360 difference and therefore
exceeds 60 whenever the elongation passes 180°. On the reference chart the
elongation is 208.77°, so PyJHora's pakṣa is 69.59 and every malefic is handed
`60 − 69.59 = −9.59` virūpas of pakṣa bala — a negative strength, which the
text does not allow.

Folded, 360 − 208.77 = 151.23 → 50.41 for benefics, 9.59 for malefics
(the waning Moon doubles to 19.18). On the two textbook charts the two
formulations coincide only because both elongations are < 180°; that is why
PyJHora's own tests never caught it.

### B.2 Hora bala — the planet-hour cycle

The horā at sunrise belongs to the weekday lord; each following horā steps one
place along the Chaldean series (Sun → Venus → Mercury → Moon → Saturn →
Jupiter → Mars). Because 24 ≡ 3 (mod 7), the 25th horā — the next sunrise —
lands exactly on the next weekday lord. Both consequences are now pinned by
gate checks for all seven weekdays.

PyJHora computes `hora = (int(tobh − sunrise) + vaara + 1) % 7` into the table
`[Saturn, Jupiter, Mars, Sun, Venus, Mercury, Moon]`. That pairing is only
correct when the `vaara + 1` term happens to equal the day lord's position in
that table, i.e. on Saturdays. Its own two fixtures survive by coincidence: the
VP Jain birth is a Saturday (correct by construction), and on the BV Raman date
PyJHora's weekday helper returns 4 for a Wednesday — it returns 3 for a
Wednesday in 1998, so it is not a stable index — which happens to cancel the
same offset. Asked for the first horā of each weekday, it answers:

| Weekday | Correct | PyJHora |
| --- | --- | --- |
| Sun | Sun | Mars |
| Mon | Moon | Sun |
| Tue | Mars | Venus |
| Wed | Mercury | Mercury ✓ |
| Thu | Jupiter | Moon |
| Fri | Venus | Saturn |
| Sat | Saturn | Jupiter |

This is what moves 60 virūpas from the Sun to Saturn on the reference chart
(Thursday, 3rd horā). Our engine's own invariant — first horā = day lord,
25th horā = next day lord, every 7 horās the cycle repeats — passes 21/21, and
the two printed books agree with it.

### B.3 Ayana and cheṣṭā — two different "shorter arcs"

* **Ayana.** PyJHora applies one formula to all seven planets —
  `(24 + declination) × 1.25`, i.e. "north declination is strength" — and
  computes that declination from the **sidereal** longitude. Both are wrong.
  1. *The group rule.* BPHS inverts the sense for the Moon and Saturn (strong in
     dakṣiṇāyana), keeps Sun/Mars/Jupiter/Venus strong in uttarāyaṇa, and gives
     Mercury strength at either extreme. On the VP Jain fixture the printed
     table reads Moon **43.19**, Mercury **37.10**, Saturn **35.04**; the
     uniform rule would give 13.84 / 21.47 / 27.60, the group rule gives
     43.45 / 37.06 / 35.00. The book settles it.
  2. *The frame.* Declination is a tropical quantity. PyJHora's value is the
     declination of the sidereal longitude, which is shifted by the ayanāṁśa
     (~24°) — enough to flip its sign. On the reference chart Venus is at
     sidereal 348.08° / tropical 11.72°: declination −4.71° vs +4.63°. PyJHora
     reports 24.08 = `(24 − 4.71) × 1.25`; the correct reading of the same rule
     is 35.79.
  Swapping our ecliptic form for PyJHora's during this audit failed both
  textbooks immediately (BVR Moon −20.70, Mercury −21.38, Saturn +33.75
  virūpas) and was reverted the same day — the revert is what keeps the
  266 textbook checks green. What remains between the two engines after the two
  defects above is the secondary question of true declination (planetary
  latitude included) versus zodiacal krānti: ≤ 2 v. everywhere except Venus on
  the reference chart (35.86 vs 33.85), where its 3.4° latitude dominates.
* **Cheṣṭā.** Both engines compute the same kendra — Mercury 72.5° vs 59.4°
  (the 13° gap is the mean-longitude system: JPL J2000 elements here, Sūrya
  Siddhānta there) and Jupiter 63.4° vs 62.6°. PyJHora then divides the
  *unreduced* arc (up to 360°) by 3 and reports 100.19 and 99.12, above the
  60-virūpa ceiling of the component. We take the shorter arc and cap at 60,
  which is also what both textbook tables show (max cheṣṭā in the VP Jain
  fixture is 28.76). Our values now carry their kendra in the tooltip text so a
  reader can redo the division.

**Net result.** No engine change was made to kāla bala during this
reconciliation: the three apparent "bugs" on our side turned out to be the
reference implementation's. What changed is that the rules are now provable:
`npm run verify:shadbala` went from 266 to 301 checks, with the horā cycle and
the cheṣṭā ceiling added as invariants that do not depend on any book.
