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
* **Chandrabalam** favourable rāśis = 1, 2, 5, 6, 9, 11 from the Moon's rāśi;
  **Tārābalam** uses the nine tārā cycle from the native's janma nakṣatra.
* Choghadiyā and Horā are generated from the same sunrise/sunset frame.

### Festivals

Festivals are **rules**, not tables: `(māsa, pakṣa, tithi, kāla)` where `kāla` is
one of sunrise / madhyāhna / pradoṣa / niśītha. The engine evaluates each rule
against the computed tithi *at that kāla* on every day of the requested range.
Solar events (saṅkrāntis, Kanuma) and eclipses are computed, not looked up.

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

## 4. Validation

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
* **Solar eclipses 2026** — 17 Feb (annular), 12 Aug (total); lunar — 3 Mar
  (total), 28 Aug (partial); visibility flags computed from the sub-lunar point.

### Known limitations (stated in the UI where relevant)

* Sunrise uses disc-centre + refraction; published pañcāṅgams differ by ≤1 min.
* Festival dates can shift by a day between Smārta/Vaiṣṇava and
  amānta/pūrṇimānta traditions; the engine follows the Telugu amānta practice.
* Tārābalam / Chandrabalam are shown relative to the selected native's
  nakṣatra/rāśi.
* Magnetic declination is **not** published as a construction value — use the
  solar shadow methods or a current WMM/IGRF survey.
