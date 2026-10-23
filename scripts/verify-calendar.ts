/**
 * scripts/verify-calendar.ts — festival & calendar regression gate
 *
 * The pañcāṅga aṅgas are checked against Swiss Ephemeris (`verify-panchanga.ts`).
 * This script guards the layer above it — the *rules* that turn aṅgas into dated
 * observances. It has two halves:
 *
 *   1. Invariants that must hold for every year (no duplicate observances, no
 *      dates leaking outside the Gregorian year, sane counts per festival class,
 *      months contiguous and non-overlapping).
 *   2. Named dates that are published in Telugu pañcāṅgams (hard-coded here, so a
 *      regression shows up immediately rather than being "snapshotted" from our
 *      own output).
 *
 * Exit code is 1 on any failure, so it can gate a release.
 */
import {
  getYearOverview,
  ugadiDateISO,
  type GeoContext,
} from '../src/engine/hinduCalendarEngine.ts';

const GEO: GeoContext = {
  lat: 17.385,
  lng: 78.4867,
  tzOffsetHours: 5.5,
  placeName: 'హైదరాబాద్',
};

const YEARS = [2024, 2025, 2026, 2027, 2028];

/** Published (Telugu pañcāṅga) dates used as ground truth. */
const KNOWN: { id: string; nameTe: string; dates: Record<number, string> }[] = [
  {
    id: 'ugadi',
    nameTe: 'ఉగాది',
    dates: { 2024: '2024-04-09', 2025: '2025-03-30', 2026: '2026-03-19', 2027: '2027-04-07', 2028: '2028-03-27' },
  },
  {
    id: 'vaikunta-ekadashi',
    nameTe: 'వైకుంఠ ఏకాదశి',
    dates: { 2025: '2025-01-10', 2026: '2026-12-20' },
  },
  {
    id: 'deepavali',
    nameTe: 'దీపావళి',
    dates: { 2024: '2024-10-31', 2025: '2025-10-20', 2026: '2026-11-08', 2027: '2027-10-28' },
  },
  {
    id: 'maha-shivaratri',
    nameTe: 'మహా శివరాత్రి',
    dates: { 2024: '2024-03-08', 2025: '2025-02-26', 2026: '2026-02-15', 2027: '2027-03-06' },
  },
  {
    id: 'vinayaka-chavithi',
    nameTe: 'వినాయక చవితి',
    dates: { 2025: '2025-08-27', 2026: '2026-09-14' },
  },
  {
    id: 'vijayadasami',
    nameTe: 'విజయ దశమి',
    dates: { 2025: '2025-10-02', 2026: '2026-10-21' },
  },
  {
    id: 'krishna-janmashtami',
    nameTe: 'కృష్ణ జన్మాష్టమి',
    dates: { 2025: '2025-08-16', 2026: '2026-09-04' },
  },
  {
    id: 'raksha-bandhan',
    nameTe: 'రాఖీ పౌర్ణమి',
    dates: { 2025: '2025-08-09', 2026: '2026-08-28' },
  },
];

let failures = 0;
let checks = 0;

function check(label: string, ok: boolean, detail = ''): void {
  checks += 1;
  if (!ok) {
    failures += 1;
    console.error(`  ✗ ${label}${detail ? ` — ${detail}` : ''}`);
  }
}

function nextISO(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + 1));
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}-${String(dt.getUTCDate()).padStart(2, '0')}`;
}

console.log('\ncalendar & festival verification — Hyderabad 17.385N 78.4867E, IST\n');

for (const year of YEARS) {
  const overview = getYearOverview(year, GEO);
  const byId = new Map<string, string[]>();
  for (const f of overview.festivals) byId.set(f.id, [...(byId.get(f.id) ?? []), f.dateISO]);

  /* ---------------- invariants ---------------- */

  // 1. every date inside the Gregorian year
  const leaks = overview.festivals.filter((f) => !f.dateISO.startsWith(`${year}-`));
  check(`${year}: no festival outside the year`, leaks.length === 0, leaks.slice(0, 3).map((f) => `${f.id}@${f.dateISO}`).join(', '));

  // 2. no rule fires on two consecutive days (tithi-span duplicate)
  let dupRuns = 0;
  for (const [id, dates] of byId) {
    const sorted = [...dates].sort();
    for (let i = 1; i < sorted.length; i++) {
      if (nextISO(sorted[i - 1]) === sorted[i]) {
        dupRuns += 1;
        console.error(`     duplicate span: ${id} ${sorted[i - 1]} + ${sorted[i]}`);
      }
    }
  }
  check(`${year}: no observance spans two consecutive days`, dupRuns === 0, `${dupRuns} pairs`);

  // 3. no exact duplicate (same id, same date)
  const exactDupes = [...byId.entries()].filter(([, d]) => new Set(d).size !== d.length);
  check(`${year}: no exact duplicate entries`, exactDupes.length === 0, exactDupes.map(([id]) => id).join(', '));

  // 4. class counts (a lunar year has 12–13 of each; kṣaya/adhika allowed)
  const count = (id: string) => (byId.get(id) ?? []).length;
  check(`${year}: śukla ekādaśī count 11–13`, count('ekadashi-shukla') >= 11 && count('ekadashi-shukla') <= 13, `${count('ekadashi-shukla')}`);
  check(`${year}: kṛṣṇa ekādaśī count 11–13`, count('ekadashi-krishna') >= 11 && count('ekadashi-krishna') <= 13, `${count('ekadashi-krishna')}`);
  check(`${year}: pūrṇimā count 12–13`, count('purnima') >= 12 && count('purnima') <= 13, `${count('purnima')}`);
  check(`${year}: amāvāsyā count 12–13`, count('amavasya') >= 12 && count('amavasya') <= 13, `${count('amavasya')}`);
  check(`${year}: saṅkaṣṭi count 12–13`, count('sankashti') >= 12 && count('sankashti') <= 13, `${count('sankashti')}`);
  const pradoshaTotal = count('pradosham-shukla') + count('pradosham-krishna');
  check(`${year}: pradoṣa total 22–26 (twice monthly)`, pradoshaTotal >= 22 && pradoshaTotal <= 26, `${pradoshaTotal}`);
  check(`${year}: both pradoṣa pakṣas present`, count('pradosham-shukla') > 0 && count('pradosham-krishna') > 0);

  // 5. lunar months: contiguous, non-overlapping, one adhika at most
  const months = [...overview.months].sort((a, b) => (a.startISO < b.startISO ? -1 : 1));
  let monthGaps = 0;
  for (let i = 1; i < months.length; i++) {
    if (nextISO(months[i - 1].endISO) !== months[i].startISO) monthGaps += 1;
  }
  check(`${year}: lunar months contiguous`, monthGaps === 0, `${monthGaps} gaps`);
  check(`${year}: at most one adhika māsa`, months.filter((m) => m.isAdhika).length <= 1);

  // 6. Ugādi is inside March–April and is the Caitra śukla pratipadā day
  const ugadi = byId.get('ugadi') ?? [];
  check(`${year}: exactly one Ugādi`, ugadi.length === 1, ugadi.join(', '));
  if (ugadi.length === 1) {
    const month = Number(ugadi[0].slice(5, 7));
    check(`${year}: Ugādi falls in March or April`, month === 3 || month === 4, ugadi[0]);
    check(`${year}: Ugādi matches ugadiDateISO()`, ugadi[0] === ugadiDateISO(year, 'lahiri', 5.5, GEO.lat, GEO.lng), ugadi[0]);
  }

  // 7. Vaikuṇṭha Ekādaśī is never a duplicate of the plain śukla ekādaśī entry
  const vaikunta = byId.get('vaikunta-ekadashi') ?? [];
  // Dhanurmāsa straddles the Gregorian new year, so a year can legitimately
  // contain the January and the December Vaikuṇṭha Ekādaśī.
  check(`${year}: at most two Vaikuṇṭha Ekādaśī`, vaikunta.length <= 2, vaikunta.join(', '));
}

/* ---------------- known published dates ---------------- */

console.log('\nnamed dates (published pañcāṅgam cross-check):\n');
for (const known of KNOWN) {
  for (const [yearStr, expected] of Object.entries(known.dates)) {
    const year = Number(yearStr);
    const overview = getYearOverview(year, GEO);
    const actual = overview.festivals.filter((f) => f.id === known.id).map((f) => f.dateISO);
    check(
      `${known.nameTe} ${year}`,
      actual.length === 1 && actual[0] === expected,
      `expected ${expected}, got ${actual.join(',') || '—'}`
    );
  }
}

console.log(`\nchecks run : ${checks}`);
console.log(failures === 0 ? 'RESULT      : ALL MATCH ✓\n' : `RESULT      : ${failures} FAILURE(S)\n`);
process.exit(failures === 0 ? 0 : 1);
