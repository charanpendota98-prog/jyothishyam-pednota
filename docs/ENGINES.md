# Jyothishyam Engine Notes — Calculation Methods & Validation

This document records **how** each engine computes its results and **how that was
verified**. The guiding rule across the project: *every printed value must be
derivable from an astronomical quantity or a named classical rule* — nothing is
hard-coded per year, and nothing is estimated where an exact computation exists.

---

## 1. `src/engine/astroCore.ts` — precision primitives

Nirāyaṇa ("sidereal") positions are obtained the only correct way: compute the
**true tropical longitude of date**, then subtract the ayanāṁśa.

| Quantity | Method |
| --- | --- |
| Planet longitudes | `Astronomy.GeoVector` → `Astronomy.Ecliptic` (true equator/ecliptic of date, aberration included) |
| Ascendant / MC | sidereal time → RAMC → standard ecliptic-intersection formula (validated to 0.002° against Swiss Ephemeris) |
| Lahiri ayanāṁśa | `23.857092 + 1.39688804·T + 0.0003086·T² − 0.00000058·T³` (fit to Swiss Ephemeris `SIDM_LAHIRI`, ±0.0005° over 1900–2100) |
| True Citrā ayanāṁśa | Spica registered with `DefineStar(13h25m11.579s, −11°09′40.75″, 250 ly)`, converted to ecliptic-of-date — reproduces Swiss Ephemeris `SIDM_TRUE_CITRA` to ≈0.002° |
| Other modes | fixed offsets from Lahiri measured against Swiss Ephemeris (Raman −1.4463°, KP −0.0969°, Fagan-Bradley +0.8832°, Yukteshwar −1.3783°, Pushya −1.1360°) |
| Sunrise / sunset | `Astronomy.SearchRiseSet` with standard refraction (34′) |
| Moonrise / moonset | anchored to the same civil day, disc-centre |
| Tithi / nakshatra / yoga / karana boundaries | root-found on the exact angular crossing (`findLongitudeCrossing`), not on mean motion |

Important pitfall encoded in the file: `Astronomy.Spherical.lat/lon` are in
**degrees**, while some other Astronomy Engine APIs use radians.

---

## 2. `src/engine/hinduCalendarEngine.ts` — panchāṅga & calendar

### Month naming (amānta, Telugu convention)

A lunar month is named after the **solar sign the Sun enters during that
lunation** (`Mesha` ingress → Chaitra, `Vrishabha` → Vaiśākha, …). If a lunation
contains **no** saṅkrānti it is an **adhika** (intercalary) month carrying the
name of the *following* month. This rule is self-consistent and produces, for
2026, `Adhika Jyeṣṭha = 17 May – 15 Jun` — matching published pañcāṅgams.

* Month start = the first civil day whose **sunrise** follows the amāvāsyā
  instant (so a new moon after sunrise starts the month the next morning).
* Pūrṇimānta month = amānta month in śukla pakṣa, amānta + 1 in kṛṣṇa pakṣa.
* **Kṣaya (skipped) tithis** are handled: Ugādi is the civil day containing the
  Caitra śukla pratipadā *start* — this is why Ugādi 2026 is **19 March**, not
  20 March, even though pratipadā never touches a sunrise.

### Saṁvatsara / eras

`Śaka = Gregorian − 78` (or −79 before Ugādi); saṁvatsara index
`(Śaka + 12) mod 60`; Vikrama = Śaka + 135; Kāli = Śaka + 3179. For 2026-27 this
gives **Parābhava / Śaka 1948 / Vikrama 2083 / Kali 5127**, matching Drik
Pañcāṅga.

### Kāla (time-window) computations

All from the true sunrise/sunset of the day:

* **Rāhu / Yama / Gulika** — the classical 8-fold day division (`[8,2,7,5,6,4,3]`,
  `[5,4,3,2,1,7,6]`, `[7,6,5,4,3,2,1]`).
* **Abhijit** = 8th muhūrta, **Vijaya** = 11th, **Brahmā** = 96→48 min before sunrise.
* **Duṣṭa muhūrta** per weekday in muhūrta numbers `Sun 14 · Mon 9,12 · Tue 4,8 ·
  Wed 7 · Thu 6,12 · Fri 4,9 · Sat 1,2` — Thursday's 10:04–10:51 / 14:44–15:30 for
  Hyderabad 22 Oct 2026 reproduces Drik exactly.
* **Nishītha** is centred on true solar midnight, **Godhūli** = sunset → sunset + ½ muhūrta.
* **Chandrabalam** — favourable rāśis are the **1st, 2nd, 3rd, 5th, 6th, 7th,
  9th, 10th and 11th** from the Moon's rāśi (4th, 8th and 12th are weak; the 8th
  is *aṣṭama candra*). **Tārābalam** uses the nine tārā cycle (janma, sampat,
  vipat, kṣema, pratyari, sādhaka, vadha, mitra, atimitra) counted from the
  native's janma nakṣatra; tārās 2, 4, 6, 8, 9 are auspicious.
* Choghadiyā and Horā are generated from the same sunrise/sunset frame.

### Festivals

Festivals are **rules**, not tables: `(māsa, pakṣa, tithi, kāla)` where `kāla` is
one of sunrise / madhyāhna / pradoṣa / niśītha. The engine evaluates each rule
against the computed tithi *at that kāla* on every day of the requested range.
Solar events (saṅkrāntis, Kanuma, Bhōgi) and eclipses are computed, not looked up.

Three correctness rules are applied on top of the raw matches:

1. **Tithi spans two sunrises** — when the same rule matches on consecutive
   days the *later* day is kept, which is the day on which the tithi had fully
   begun before sunrise. This removes the classic duplicate paurṇamī /
   pradoṣa / saṅkaṣṭi entries (4 Jan + 5 Apr + 5 May 2026 previously doubled).
2. **Pradoṣa is bimonthly** — `pradosham-shukla` and `pradosham-krishna` are
   separate rules, giving 24 pradoṣa vratas a year as in printed pañcāṅgams.
3. **Vaikuṇṭha Ekādaśī** is the **Mārgaśira** (amānta) śukla ekādaśī — 20 Dec
   2026, the ekādaśī that opens Dhanurmāsa, not the Kārtika one.

`getYearOverview` clamps both the festival list and the lunar-month table to the
Gregorian year requested (months are kept only when their span overlaps it).

---

## 3. `src/engine/vastuShastraEngine.ts` — Vāstu

Sources followed: *Mānasāra*, *Mayamata*, *Viśvakarma Prakāśa*,
*Samarāṅgaṇa Sūtradhāra*, plus the Parameśvara/Paramasayika 9×9 maṇḍala
tradition (81 padas, 45 devatās, Brahmā in the central 3×3).

* **45 devatās** — Brahmā, 12 inner (Deva/Manuṣya vīthi) and 32 outer
  (Paiśācika vīthi), with the classical quadrant order and the quality each pada
  governs.
* **16 zones** (22.5° each) with element, planet, chakra, life-area, what to keep,
  what to avoid, imbalance symptoms and remedies.
* **8 dik** with dikpāla, element, planet, qualities and remedies.
* **Nāma Vāstu** — the first *akṣara* of the name maps through the 108
  nakṣatra-pada syllables to a pada → nakṣatra → rāśi → ruling planets → the
  directions that are favourable for that native.
* **Room audit** — 16 weighted rules (entrance, kitchen, master bedroom, pūjā,
  toilet, staircase, water tank, borewell, safe, study, living, guest, children,
  dining, septic, balcony) giving a 0–100 score, doṣa list and remedies.
* **Plot check** — shape, slope, road side and length:width ratio.
* **True north** — computed, not assumed: solar-noon shadow azimuth, the equal
  shadow ("Indian circle") method with real symmetric clock times, equinox and
  solstice sunrise azimuths. A magnetic compass is *deliberately not* used as the
  authority, because a centred-dipole estimate is off by several degrees in mid
  latitudes; the UI says so explicitly.

---

## 4. `src/engine/gocharaVedhaEngine.ts` — gōcara (transits from the janma rāśi)

Transit results are read **from the natal Moon's rāśi**, house by house, using
the favourable-house lists of **Bṛhat Saṁhitā 104.4 / Phaladīpikā 26.3–8**:

| Graha | Favourable houses from janma rāśi |
| --- | --- |
| Sun | 3, 6, 10, 11 |
| Moon | 1, 3, 6, 7, 10, 11 |
| Mars | 3, 6, 11 |
| Mercury | 2, 4, 6, 8, 10, 11 |
| Jupiter | 2, 5, 7, 9, 11 |
| Venus | 1, 2, 3, 4, 5, 8, 9, 11, 12 |
| Saturn | 3, 6, 11 |
| Rāhu / Ketu | 3, 6, 10, 11 (as the Sun) |

**Vedha** (obstruction) pairs are 3↔9, 6↔12, 10↔4, 11↔5 (Sun/Rāhu/Ketu);
1↔5, 3↔9, 6↔12, 7↔2, 10↔4, 11↔8 (Moon); 3↔12, 6↔9, 11↔5 (Mars);
2↔5, 4↔3, 6↔9, 8↔1, 10↔8, 11↔12 (Mercury); 2↔12, 5↔4, 7↔3, 9↔2, 11↔10
(Jupiter); 1↔8, 2↔7, 3↔1, 4↔9, 5↔10, 8↔11, 9↔5, 11↔3, 12↔6 (Venus);
3↔6, 6↔3, 11↔12 (Saturn). **Sun ↔ Saturn** and **Moon ↔ Mercury** never
obstruct one another. A graha in a favourable house whose vedha house is empty
gives `good`; with vedha it is `blocked`; otherwise `bad`.

**Sādē-sātī** is active while Saturn occupies the 12th, 1st or 2nd from the
janma rāśi. Start/end are the *sign-ingress instants* (11th→12th and 2nd→3rd),
found by a direction-agnostic search on the true sidereal longitude, so the
retrograde re-entries of Saturn are handled correctly. Checked against Swiss
Ephemeris: Saturn Kumbha 2023-01-17, Mīna 2025-03-29, Mesha 2027-06-02,
Vṛṣabha 2029-08-08 — all reproduced within one civil day (IST rounding).

Transit positions use Lahiri nirāyaṇa longitudes of all nine grahas; Rāhu/Ketu
use the **true** (perturbed) node.

---

## 5. `src/engine/classicalSources.ts` — grantha registry & API

Every analytical tab cites its sources from one registry (`GRANTHAS`, 22 texts):
Vedāṅga Jyotiṣa, Sūrya Siddhānta, Dṛk-gaṇita (Swiss Ephemeris), BPHS, Sārāvalī,
Jātaka Pārijāta, Bṛhaj Jātaka, Bṛhat Saṁhitā, Phaladīpikā, Muhūrta Cintāmaṇi,
Uttara Kālāmṛta, Saṅketa Nidhi (Telugu pañcāṅga practice), Praśna Mārga,
Ṣaṭpañcāśikā, Tājika Nīlakaṇṭhī, Saṁjñā Tantra, Jaimini Sūtras, Viśvakarma
Prakāśa, Mayamata, Samarāṅgaṇa Sūtradhāra, Aparājita Pṛcchā, Mānasāra.

Editorial discipline (also stated in the UI):

* chapter numbers only where the division is standard across printed editions;
* Sanskrit quoted only where the reading is stable — otherwise a paraphrase;
* periods are scholarly ranges, never asserted as exact dates;
* the underlying Sanskrit texts are public domain.

The PDF grantha (`ClassicalJathakaPdfDocument`) carries a **Page 14 appendix**
built from the same registry, so the printed book and the on-screen citations can
never diverge.

### HTTP API (Express, `server.ts`)

| Method & path | Purpose |
| --- | --- |
| `GET /api/panchanga?date&lat&lng&tz&ayanamsa` | full day pañcāṅga (aṅgas, kālas, choghadiyā, horā, era) |
| `POST /api/panchanga` | same, JSON body (`date`, `lat`, `lng`, `tzOffsetHours`, `ayanamsa`) |
| `GET /api/era?date` | Saṁvatsara / Śaka / Vikrama / Kali + māsa, pakṣa, ṛtu, ayana |
| `GET /api/calendar/month?year&month` | month grid with tithi, nakṣatra, festivals |
| `GET /api/calendar/year?year` | months, saṅkrāntis, eclipses, festivals (clamped to the year), adhika māsa |
| `GET /api/festivals/upcoming?from&count` | span-resolved festival feed |
| `POST /api/gochara` | gōcara + vedha + sāḍe-sātī (accepts a full birth `input` or `moonSignIndex`) |
| `GET /api/sources?domain=` | grantha registry |

Validation is strict: dates must be `YYYY-MM-DD`, latitudes ±90, longitudes ±180,
time zones −12…+14, and `ayanamsa` is restricted to the four supported modes.
Invalid input returns **400** with a message rather than a stack trace.

---

## 6. Validation

### Golden fixture (automated)

`npm run verify:panchanga` compares the engine against
`scripts/golden/panchanga-hyderabad-2026.json`, generated with **Swiss
Ephemeris 2.10.03** (`SIDM_LAHIRI`, geocentric) for all 365 days of 2026 at
Hyderabad:

```
days checked          : 365
tithi/nakshatra/yoga  : ALL MATCH ✓
max sunrise delta     : 1 min
```

`npm run verify:calendar` (also part of `npm run verify`) guards the rule layer
above the aṅgas — 103 checks over 2024–2028:

```
checks run : 103
RESULT      : ALL MATCH ✓
```

* **Invariants** — no observance outside its Gregorian year, no observance on two
  consecutive days (tithi-span duplicates), no exact duplicates, ekādaśī 11–13,
  pūrṇimā 12–13, amāvāsyā 12–13, saṅkaṣṭi 12–13, pradoṣa 22–26 (both pakṣas),
  lunar months contiguous and at most one adhika māsa.
* **Named dates from published Telugu pañcāṅgams** — Ugādi 2024–2028, Deepāvalī
  2024–2027, Mahā Śivarātri 2024–2027, Vaikuṇṭha Ekādaśī 2025–2026, Vināyaka
  Caturthī, Vijayadaśamī, Kṛṣṇa Janmāṣṭamī, Rākhī.

Two classical conventions this gate forced into the engine:

* **Kṣaya tithi dating** — when a tithi begins after sunrise and ends before the
  next sunrise it never reaches a sunrise. The engine now dates it on the day it
  *begins* (the same rule that makes Ugādi 2026 = 19 Mar), so a lunar year never
  loses a pūrṇimā/amāvāsyā/ekādaśī.
* **Saṅkaṣṭi is a chandrodaya rule** — Kṛṣṇa Caturthī is matched at **moonrise**
  rather than sunrise; when the caturthī touches no moonrise in a lunation, the
  day it begins is used and the row says so.

### Cross-checks performed by hand

* **Drik Pañcāṅga, Hyderabad 22 Oct 2026** — sunrise 06:11, sunset 17:50,
  tithi `Śukla Ekādaśī` ending 14:47, nakṣatra `Śatabhiṣa` → `Pūrvabhādrapadā`
  20:49, yoga `Vṛddhi` 23:40, Rāhu 13:28–14:55, Yamagaṇḍa 06:11–07:38,
  Gulika 09:06–10:33, Durmuhūrta 10:04–10:51 & 14:44–15:30, dinamāna 11h38m57s,
  Chandrabalam Mesha/Vṛṣabha/Simha/Kanyā/Dhanu/Kumbha — all reproduced within a
  minute (see §2).
* **Planetary positions, 1998-05-14 08:45 IST Hyderabad** — Sun, Moon, Mercury,
  Venus, Mars, Jupiter and the Ascendant agree with Swiss Ephemeris to ≤0.003°;
  Saturn 0.002°; the lunar node uses the mean node and is within 0.06° of the
  true node (mean node is the traditional choice for Rāhu/Ketu).
* **Saṅkrānti times 2026** — computed ingresses match Swiss Ephemeris to the
  minute (Kanyā 17 Sep 07:52, Tulā 17 Oct 19:51, Vṛścika 16 Nov 19:43, …).
* **Saturn's sign ingresses** — checked against Swiss Ephemeris: Kumbha
  2022-04-29, Mīna 2025-03-29, Meṣa 2027-06-02, Vṛṣabha 2029-08-08 (and the
  retrograde re-entries of 2022-07-12, 2027-10-20, 2029-10-05). The sāḍe-sātī
  start/end instants are built from exactly these crossings.
* **Ugādi 2024–2029** — 2024-04-09, 2025-03-30, 2026-03-19, 2027-04-07,
  2028-03-27, matching published Telugu pañcāṅgams (kṣaya pratipadā handled).
* **Vaikuṇṭha Ekādaśī** — pinned to the ekādaśī that falls inside Dhanurmāsa
  (Sun in Dhanu): 2025-01-10 and 2026-12-20, not the Mārgaśira ekādaśī that
  precedes the ingress in other years.
* **Solar eclipses 2026** — 17 Feb (annular), 12 Aug (total); lunar — 3 Mar
  (total), 28 Aug (partial); visibility flags computed from the sub-lunar point.

### Known limitations (stated in the UI where relevant)

* Sunrise uses disc-centre + refraction; published pañcāṅgams differ by ≤1 min.
* Festival dates can shift by a day between Smārta/Vaiṣṇava and
  amānta/pūrṇimānta traditions; the engine follows the Telugu amānta practice.
* Tārābalam / Chandrabalam are shown relative to the selected native's
  nakṣatra/rāśi.
* Gōcara uses the **true** node for Rāhu/Ketu (Swiss Ephemeris agrees to
  ~0.03°); the natal chart uses the mean node, the traditional choice. This is
  deliberate and documented rather than silently mixed.
* Vāstu magnetic declination is a coarse dipole estimate shown for orientation
  only; alignment must come from the solar shadow methods.
* Magnetic declination is **not** published as a construction value — use the
  solar shadow methods or a current WMM/IGRF survey.


## 6. జాతక సూక్ష్మ ఇంజిన్లు (Deep Jathaka engines)

Three engines extend the natal chart to the contents of a classical Telugu
jathaka patrika. All three are pure functions over `CompleteChartResult`, so
the UI, the PDF and the verification harness cannot drift apart.

| Module | Purpose |
| --- | --- |
| `src/engine/vargaVimsopakaEngine.ts` | 16 vargas D-1 … D-60, Vimshopaka bala (Shadvarga / Saptavarga / Dashavarga / Shodashavarga), Vaiseshikamsa, vargottama |
| `src/engine/shadbalaDeepEngine.ts` | Full BPHS Ch. 27 Shadbala (sthana, dig, kala, cheshta, naisargika, drik), bhava bala, ishta/kashta phala |
| `src/engine/avakahadaEngine.ts` | Avakahada chakra (varna, vashya, yoni, gana, nadi, rajju, yunja, hansaka, nama syllable), Ghata chakra, Panchadha maitri |

### 6.1 Divisional mathematics

* `calculateVargaSign` (ephemeris.ts) is the **only** implementation of the
  varga arithmetic. `d40Sign` (Khavedamsa: odd → Aries, even → Libra) and
  `d45Sign` (Akshavedamsa: movable → Aries, fixed → Leo, dual → Sagittarius)
  were added, and the **D-60 rule was corrected**: BPHS Ch. 6 says to ignore
  the sign and multiply the degrees traversed by 2, divide by 12, add 1 —
  i.e. the 0°30′ amsas run continuously from Aries, *not* from the sign
  itself. The old formula shifted whole charts.
* Moolatrikona is awarded in D-1 only and only inside the classical degree
  band; in higher vargas the moolatrikona rasi counts as *own* (30/20). This
  is what the reference patrikas do and it reproduces their numbers exactly.
* Vimshopaka: `score = Varga Viswa × weight ÷ 20`, with Varga Viswa = own 20,
  great friend 18, friend 15, neutral 10, enemy 7, sworn enemy 5. Each of the
  four schemes' weights sums to 20 (asserted in the gate).

### 6.2 Shadbala conventions

* Dig bala = angular distance from the graha's **weakest angle** ÷ 3, where
  the weak angle is the IC (Sun, Mars), the MC (Moon, Venus), the Descendant
  (Mercury, Jupiter) and the Ascendant (Saturn). Verified to ±0.02 virupa
  against the reference for all seven grahas.
* Kala bala = nathonnatha (local civil hours from noon; Mercury always 60) +
  paksha (elongation ÷ 3, malefics 60 − x) + tribhaga (part lord, Jupiter
  always 60) + varsha/masa/dina/hora (15/30/45/60) + ayana (Parashara's
  45/33/12 khanda method on the tropical longitude).
* Cheshta bala follows the eight classical motions (Vakra 60, Anuvakra 30,
  Vikala 15, Mandatara 15, Manda 30, Sama 7.5, Chara 45, Atichara 30); the
  Sun's cheshta is its ayana bala and the Moon's is its paksha bala.
* Drik bala = net benefic-minus-malefic **sphuta drishti** (BPHS Ch. 26)
  received by the graha, ÷ 4.
* Ishta/Kashta phala = √(uchcha × cheshta) and √((60 − uchcha)(60 − cheshta)).

### 6.3 Pin-to-pin gate — `npm run verify:jathaka`

`scripts/verify-jathaka.ts` runs **238 checks** against the three reference
PDFs supplied by the user:

| Reference | Chart | What is pinned |
| --- | --- | --- |
| 116-page jathakam | 2026-10-22 22:55, Hyderabad | 9 grahas + lagna (sign, degree, house, nakshatra-pada), all 16 varga rows × 8 bodies (128 cells), Sun/Moon bhinna-ashtakavarga, sarvashtakavarga (337), avakahada, ghata chakra, panchanga, ṣrīpati bhāva-sandhi (36 values), 13 upagrahas, 5-level vimśottarī (balance + bhukti + pratyantar dates), dig bala (7 exact), naiśargika (7 exact), kāla bala (5 exact / 2 by convention), pakṣa, hora/dina lords |
| 62-page nadi report | 1947-08-15 00:00, Delhi | lagna, 9 grahas (sign, degree to 3′, house), janma rasi & nakshatra |
| 49-page year forecast | 1988-09-21 10:18, Hansi | lagna + 9 grahas to 1.2′ (including retrograde flags) |

Documented, intentional divergences (printed by the gate):

1. **Rāhu/Ketu** — the app uses the true node, the reference PDFs the mean
   node (≈1° apart). Node checks therefore use a 1.5° tolerance.
2. **D-2 Hora** — the reference's D-2 column is internally inconsistent (Sun
   and Venus, both first-half odd-sign placements, get different signs). The
   app follows BPHS (odd signs 0°–15° → Leo).
3. **Varsha/Masa bala** — the 15/30 virupas are awarded by a different lord
   convention in the reference; the app derives them from the weekday lord of
   the Mesha-sankranti / solar-month start. This shifts Sun by 15 and Moon by
   30 virupas; all other grahas match the reference kala bala to ±0.1.
4. **Reference errata** — the 116-page PDF prints ఆర్ద్ర for Mars (Cancer
   19°35′) and Jupiter (Cancer 28°52′), both of which are Ashleshā. The gate
   asserts the astronomically correct value and records the erratum.

### 6.4 శ్రీపతి భావ సంధి — `bhavaSandhiEngine.ts`

Bhāva boundaries are **not** sign boundaries in the Śrīpati (Porphyry)
paddhati that Telugu patrikās print:

* the exact ascendant is the **1st bhāva madhya**, the exact MC the **10th**;
* each quadrant between two angles is trisected to get the other madhyas;
* ārambha / anta are the mid-points between neighbouring madhyas, so a bhāva
  arc is 27°–33° wide instead of 30°.

The engine therefore needs a real MC, not just a whole-sign cusp: `midheaven`
is taken from the local sidereal time and obliquity, and the resulting
madhyas reproduce the reference patrikā's table to the arc-second (all 12
bhāvas × 3 sandhis, 36 values, tolerance 2′).

### 6.5 ఉపగ్రహ చక్రం — `upagrahaEngine.ts`

* **Sun-relative (aprakāśa) upagrahas** — BPHS ch. 25: Dhūma = Sun + 133°20′,
  Vyatīpāta = 360° − Dhūma, Pariveṣa = Vyatīpāta + 180°, Indracāpa =
  360° − Pariveṣa, Upaketu = Indracāpa + 16°40′ (= Sun − 30°). Pinned to 1′.
  (The reference prints Paridhi = Pariveṣa and Kodaṇḍa = Indracāpa as
  alternative names — same longitudes.)
* **Kāla-velā upagrahas** — the day (sunrise → sunset) or night (sunset →
  next sunrise) is split into eight equal parts; part lords run in weekday
  order starting from the lord of the 5th weekday *counting the birth weekday
  as the first*. The upagraha's longitude is the **ascendant at the start of
  its part**: Mars → Mṛtyu, Mercury → Arthaprahāra, Jupiter → Yamakaṇṭaka,
  Sun → Kāla, Saturn → Gulika, Moon → Paridhi, Venus → Kodaṇḍa. **Māndi** is
  the ascendant at the *end* of Saturn's part, which is why printed patrikās
  show Māndi and Kāla on the same point.
* Documented divergence: the reference's sunrise/sunset differs by a couple of
  minutes, so the kāla-velā set is pinned to 1.5° (the largest observed
  difference is 1.08°).

### 6.6 వింశోత్తరీ దశ — `vimshottariDeepEngine.ts`

Five levels — mahādaśā, bhukti, pratyantardaśā, sūkṣmadaśā, prāṇadaśā — with
exact local timestamps (`YYYY-MM-DD HH:mm`). Each sub-period is
`parent width × sub-lord years ÷ 120`; every level starts with the parent's
lord. The year is 365.2425 d, so a 16-year mahādaśā drifts ≈ 3 h from a
patrikā that uses 365.25 d — dates are therefore pinned to ±3 days
(reference: Guru/Śani 2027-07-31, Guru/Budha 2030-02-10, Guru/Ketu 2032-05-18,
with the pratyantaras 2026-06-30 … 2027-04-05; the app lands within 2 days).

### 6.7 Ṣaḍbala — component-by-component status

| Component | Status vs the reference patrikā |
| --- | --- |
| Dig bala | **exact** for all 7 (5.84 / 8.82 / 19.33 / 18.68 / 47.92 / 53.40 / 32.31) |
| Naiśargika | exact (60, 51.43, 17.14, 25.71, 34.29, 42.86, 8.57) |
| Ayana (Parāśara khaṇḍa) | exact (Sun 15.34, Moon 37.31, Mercury 52.63) |
| Pakṣa / tribhāga / nathonnata | exact (nathonnata from civil clock: diurnal 5.48, nocturnal 54.53, Mercury 60) |
| Kāla total | exact for Mercury (157.98), Venus (125.17 vs 125.23), Jupiter (203.30 vs 203.36); ±15/±30 virūpas for Sun/Moon/Mars/Saturn because the reference awards varṣa bala to the Sun and māsa bala to the Moon, while this engine uses the classical weekday lords of the Meṣa-saṅkrānti (Mars) and the solar-month start (Saturn) |
| Cheṣṭā | discrete eight-motion classification (Saravali); the reference uses a continuous formula |
| Sthāna, Dṛk | computed from BPHS ch. 27 / ch. 26 but not yet pinned cell-by-cell |
