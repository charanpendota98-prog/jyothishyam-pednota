# OnlineJyotish Public-Site Parity Audit

**Reference:** https://www.onlinejyotish.com/  
**Sitemap index checked:** `https://www.onlinejyotish.com/sitemap.xml` → dated sitemap; sitemap is split into 95 fetch chunks and contains many language variants and editorial pages.  
**Purpose:** Reproduce useful public behavior with our own, auditable calculations. This is not a copy of OnlineJyotish's private backend or proprietary text/code.

## Audit status

This is an in-progress audit, not a claim that every sitemap URL has been manually tested.

### Sequential defect log

| Status | Area | Finding | Action / next evidence |
|---|---|---|---|
| Fixed + regression-tested | Panchanga naming | 27th nitya yoga was labelled `Vaibhava` in English; correct name is `Vaidhriti` (వైధృతి). | Corrected in `hinduCalendarEngine.ts`; `verify:panchanga-nomenclature` checks aligned names and correct index. |
| Fixed + regression-tested | Birth-time precision | The chart form/API previously discarded seconds and the ephemeris conversion ignored them, even though OnlineJyotish accepts seconds. This could shift Lagna and time-sensitive chart factors. | UI accepts seconds; API preserves `HH:mm:ss`; UTC conversion and chart Julian Day retain seconds. `verify:birth-time` checks a 30-second delta; `/v1/chart` smoke test returned `1995-08-14T00:55:30.000Z` for Hyderabad 06:25:30 IST. |
| Implemented + regression-tested | Historical IANA timezone/DST | A fixed offset alone can calculate foreign/historic births at the wrong UTC instant. OnlineJyotish asks users to choose the exact birthplace and timezone. | Added IANA zone selection to birth entry and exact local-time resolver. DST winter/summer offsets, nonexistent spring-forward clocks and repeated fall-back times are tested; ambiguous times require a matching recorded UTC offset. Birth dates, clock values and UTC-offset bounds are validated instead of normalized silently. `verify:iana-birth-time` and `verify:birth-time` pass. |
| Fixed + regression-tested | Impossible birth dates silently normalized | Fixed-offset chart conversion used `Date.UTC` directly, so invalid dates such as February 30 could roll into March. v1 date validation also accepted shape-valid but impossible dates. | Both chart conversion and v1 date gates now reject impossible dates; invalid time and out-of-range UTC offsets are also rejected. Regression checks added to `verify:birth-time`; invalid v1 date returned HTTP 400. |
| Fixed + regression-tested | Selected Rahu node could be reported as the wrong mode | Chart computation honored `nodeConvention`, but result metadata always reported the global default. Invalid API node/tradition options also silently fell back. | Result metadata now reports the selected node; v1 validates ayanamsha, node, house system, calculation method and tradition instead of silently substituting defaults. API smoke test confirmed True Node + topocentric output and HTTP 400 on invalid node/tradition. |
| Fixed | Invalid local birth input could crash the whole chart UI | An IANA DST-fold ambiguity or an incomplete date/time propagated out of `calculateChart` during React rendering. | The app retains the last valid chart and presents a localized alert with the resolver error until the user corrects the local time or offset. |
| Investigating | Hyderabad Panchang, 2026-10-24 | Screenshot-derived day duration differs by about one minute; Durmuhurta display/interval does not line up with the current local listing. | Do not tune on rounded values. Need compare exact same city/date/mode and determine whether the mismatch is solar-event convention, duration rounding, or a field-label/observance rule before changing calculation. Existing fixture covers 15 fields, not these unresolved items. |
| Implemented; exact-reference validation open | Birth-chart calculation profile | OnlineJyotish exposes geocentric standard and topocentric observer-based options. | Birth chart now exposes both; geocentric remains default, mean node remains default. A deterministic test confirms topocentric observer parallax affects the Moon (0.7684° in the Hyderabad fixture). Exact topocentric degree parity against a public reference case is still open. Panchang's own topocentric selector/anga calculations are not yet implemented. |
 Sitemap chunks 0–48 of 95 have been inspected to date. The public sitemap contains hundreds of routes across locales, editorial content and services. Status below distinguishes pages actually inspected from families only inventoried from navigation/sitemap.

### Interactive calculation pages inspected

| Reference route | Public inputs/output observed | Local parity area | Status |
|---|---|---|---|
| `/free-astrology/daily-panchanga.php` and `/telugu-astrology/telugu-panchangam.php` | Date/place/timezone, geocentric/topocentric choice, 5 limbs, sunrise/sunset, kalas, padas, sign ingress, rashi, sankalpa, muhurta divisions | `HinduCalendarView`, `hinduCalendarEngine`, `astroCore`; Hyderabad 2026-10-24 screenshot gate | Core screenshot fixture 15/15; full page inventory not complete |
| `/free-astrology/panchang-calendar.php` | Monthly grid, local sunrise tithi markers, date drilldown, day-specific suitable intervals | `getMonthCalendar`, `HinduCalendarView`, Muhurta engine | Inspected public structure; parity not fully tested |
| `/hindu-festival-calendar.php?lang=te` | Monthly/yearly festival and vrata listing; local place; tithi/kala rules; tradition caveats | `festivalsOnDate`, `upcomingFestivals`, `getYearOverview` | Page inspected; current local golden fixture 31/31, not complete-calendar parity |
| `/ekadashi-days.php?lang=te` | Smarta and Vaishnava observance separation, parana, Harivasara | Festival and vrata engines | Inspected; local tradition-specific year-by-year comparison outstanding |
| `/masa-sivaratri.php?lang=te` | Monthly/Maha Shivaratri, Nishita window, next-day parana | Festival and kala engines | Inspected; full date/time parity outstanding |
| `/pradosh-vrat-date-time.php?lang=te` | Tithi at sunset, local Pradosha and puja intervals | Tithi-window and twilight calculations | Inspected; full location/year parity outstanding |
| `/sankranti-dates.php?lang=te` | Transit instant, local civil date, Sankranti-specific punya kala | `sankrantiJd`, `makaraSankrantiDayISO`, yearly Sankranti data | Inspected; custom punya-kala rules still need comparison |
| `/sankastahara-chaturthi-telugu.php` | Krishna Chaturthi observance and local moonrise | Moonrise + tithi-based observance | Inspected; monthly city-by-city parity outstanding |
| `/astrology-tools/today-muhurta-times.php` | 15 day + 15 night muhurtas based on local sunrise/sunset | `computeDayPanchanga`, kala windows | Inspected; 30 slots need dedicated golden tests |
| `/astrology-tools/today-hora-times.php` | 24 planetary hours split across day/night | Hora engine | Inspected; exact time-table parity outstanding |
| `/astrology-tools/today-chowghati-times.php` | Eight day/night Choghadiya intervals | Choghadiya engine | Inspected; exact time-table parity outstanding |
| `/astrology-tools/vastu-planner.php` | Room/direction selector, Vastu result and remedy checklist | Vastu planner and plan engine | Inspected; input/output model differs; full parity not targeted |
| `/free-astrology/vedic-horoscope.php` | Birth inputs, Lahiri, nodes, charts, Vimshottari and report sections | Jathaka engines and PDF | Inspected; report-by-report parity outstanding |
| `/free-astrology/kp-horoscope.php` | KP cusps, star/sub-lords, significators, ruling planets, node and chart settings | KP-related local engines | Inspected; exact report parity outstanding |
| `/free-astrology/newborn-horoscope.php` | Birth record, Rashi/Nakshatra/Pada, naming, avakahada, charts, Gandamoola indicator | Jathaka and Namakarana engines | Inspected; complete output parity outstanding |
| `/free-astrology/marriage-matching-report.php` | Two full birth charts, Ashtakoota, Mangal Dosha and other factors | Marriage matching engine | Inspected; case-by-case parity outstanding |
| `/free-astrology/star-match.php` | Rashi/Nakshatra/Pada-only Ashtakoota, max 36 | Star-matching / compatibility engines | Inspected; distinct limited-input workflow needs parity gate |
| `/free-astrology/dasha-koota-star-match.php` | Ten South Indian Poruthams, 36-point distribution, Rajju/Vedha | Dasha Koota / marriage matching | Inspected; distinct ruleset parity outstanding |
| `/free-astrology/ascendant-calculator.php` | Birth place/time and sidereal Lagna degree | `ascendantTropical`, ephemeris | Inspected; core Lagna has Swiss Ephemeris gates, UI parity outstanding |
| `/sadesathi/mesha-rashi.php` | Aries Moon sign; Saturn's 12th/1st/2nd-from-Moon phases and retrograde return segments, dated sign-ingress table | Saturn Lahiri sign ingresses + Sade-Sati phase engine | Public reference dates 2020–2032 independently matched in new `verify:onlinejyotish-transits` fixture (12/12) |
| `/rashiphal/daily-horoscope/mesha-rashi.php` | Daily forecast keyed to sidereal birth Moon sign and Moon's current sign/nakshatra | Rashi-phala studio currently computes chart-specific day/week/month/year results; generalized Janma-Rashi forecast is a distinct parity path | Page inspected; no claim of content/calculation parity; fixed narrative is not to be copied |
| `/rashiphal/year-horoscope/mesha-rashi.php` | Yearly Janma-Rashi forecast references dated Jupiter, Saturn, Rahu/Ketu, Mars transits | Transit timeline + chart-based annual phala | Page inspected; transit dates and prediction content require separate fixture/careful interpretation |
| `/rashiphal/ugadi-rashiphal/panchanga-peethika.php` | Lunar-year start, month starts, Rajadhi Navanayaka, rainfall/crop/market indicators; year and city selection | Lunar calendar and annual Panchanga engines | Page inspected; inputs/results require location-specific golden tests; not yet fully parity-tested |
| `/horo/kp-horary-report.php` | KP Horary number 1–249, judgment date/time/place, selected question, chart styles, ruling planets, significators and dasha | KP chart/hora query engines | Form/content inspected; submission/output not independently verified |
| `/chinese-astrology/sai-prashnavali.php` | Random reflective text, explicitly not an astrological prediction or a yes/no answer | No Jyotish calculation should be inferred | Page inspected; not a calculator-parity target |

## Additional route families discovered in sitemap/navigation

These routes must be catalogued and grouped before they can be called audited:

- Birth charts and specialist astrology: horoscope, KP, newborn, Nadi, prashna/KP prashna, ascendant, Rashi/Nakshatra, name-based Rashi, Pancha-Pakshi, dosha reports, Sade Sati.
- Matching: full kundli matching, star-only matching, Dasha Koota, marriage Nakshatra lists.
- Panchanga/time: daily and monthly Panchang, festival calendar, Ekadashi, Pradosh, Masika Shivaratri, Sankashti, Sankranti, Hora, Choghadiya, Muhurta, Kala, Panchaka lagna, ephemeris, Sankalpam, Shraddha and birthday tithi.
- Transit/observance: monthly planet and Nakshatra transits, retrograde, Guru/Shukra asta, eclipses.
- Vastu/remedies: Vastu planner, house-facing finder, gemstones, Rudraksha/Ishta Devata, stotras/remedies.
- Content/services: astrology lessons/quiz, articles, paid reports, consultations, app/software, policy pages and support.
- Multiple language routes exist (Telugu, English, Hindi, Marathi, Kannada, Bengali, Gujarati, Punjabi, Tamil, Malayalam, Odia, Nepali, Sinhala, French, Russian, German, Japanese and Chinese). Translation variants are not separate calculation engines but still require localization QA.
- Public sitemap also indexes daily/weekly/monthly/yearly Rashi forecasts (12 signs per locale), Sade Sati (per sign and localized Elinati Shani variants), Ugadi annual Rashi outputs (including Panchanga Peethika, Adaya-Vyayam and Kandaya), KP Horary, Sai Prashnavali, marriage Nakshatra guidance, paid Janmakundali service pages, chart-style help, and dedicated A4/A5/white-label PDF marketing pages.
- Further sitemap chunks show a large educational catalog (100+ astrology lesson routes, translated in multiple locales) and remedy/content libraries (Navagraha and individual-planet stotras/mantras/kavachams, Yagya photo/video pages). These are content/localization pages rather than calculation engines; their factual text and source attributions still need review, but should not be reproduced from the competitor.

## Confirmed Hyderabad screenshot benchmark (2026-10-24)

Local settings: Hyderabad 17.385°N, 78.4867°E, Asia/Kolkata; Lahiri sidereal + Hindu/Drik rise; geocentric planetary positions.

Matched in the regression gate (15/15): sunrise 06:15; sunset 17:45; moonrise 16:31; moonset next day 05:08; Shukla Trayodashi ending 13:37; Uttara Bhadrapada ending 20:32; Vyaghata; Taitila; Moon Pisces; Sun Libra; Rahukalam 09:07–10:33; Abhijit 11:37–12:23; Varjyam 06:26–08:00.

Unresolved comparison points from screenshot: displayed day length 11:29 vs local engine 11:30 (about one minute); the screenshot's label/time for Durmuhurta does not match our current separated Gulika/Durmuhurta windows. Do not change the calculation until exact method/field mapping is confirmed against same-city output.

## Implementation direction agreed with user

The user's latest direction makes **OnlineJyotish the primary benchmark** for matching timings and birth-chart outputs. This supersedes the earlier app-default convention where the two conflict; do not silently blend the old convention with the OnlineJyotish profile. Keep other traditions as explicit, separately named options when implemented.

The public Daily Panchang page exposes **Geocentric (Standard)** as the default planetary calculation and **Topocentric (Observer Based)** as an option; its public description says the latter can shift Moon-related Tithi/Nakshatra timing by minutes. Match that selected mode, date, coordinates, IANA timezone, ayanamsha, node type, chart system, and observance tradition before comparing. Current app's Hyderabad screenshot gate covers one geocentric case (15/15 checks); this does not establish broad parity. Topocentric calculation parity is not yet implemented/verified as a selectable calculation profile. The existing screenshot notes still have unresolved day-length rounding and Durmuhurta field/mapping discrepancies.

Implement methods independently; do not claim OnlineJyotish uses a particular hidden setting unless it is publicly exposed or established from a reproducible output. OnlineJyotish's private backend is not accessible and is not being copied. Every found mismatch becomes a failing fixture until investigated and corrected; passing existing fixtures only certifies those fixtures.

## Rules for continuing this audit

1. Match the same city coordinates, timezone, date, geocentric/topocentric option, ayanamsha, node type, house system and tradition before comparing.
2. Separate astronomical instants from the chosen civil observance date and puja window.
3. Record every mismatch as a failing fixture with the reference route/date/location; never tune a general rule to one isolated screenshot.
4. Do not copy private code, page text or assets. Implement equivalent public behavior with our own source trail and tests.
5. Never describe the site as “fully audited” until every interactive route family, its meaningful options, and multilingual labels have an explicit checked/unchecked status.
