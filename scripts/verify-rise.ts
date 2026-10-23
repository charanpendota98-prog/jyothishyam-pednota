/**
 * scripts/verify-rise.ts — సూర్యోదయ/అస్తమయ, చంద్రోదయ/అస్తమయ & పంచాంగ అంగాల పరీక్ష
 * ---------------------------------------------------------------------------
 * సూచన: `scripts/golden/rise-panchanga-golden.json`
 *   స్విస్ ఎఫెమెరిస్ 2.10.03 · 24 నగరాలు · 2025–2027 · 528 దినాలు
 *   (rise_trans — ఎగువ అంచు + 34′ వక్రీభవనం = భారతీయ పంచాంగ నిర్వచనం)
 *
 * ఈ పరీక్ష రెండు విషయాలను వేరు చేసి చూస్తుంది:
 *   1. సమయ గణన — యాప్ చూపే సూర్యోదయం/అస్తమయం సెకన్లలో ఎంత సరిపోతుంది
 *   2. పంచాంగ అంగాలు — తిథి/నక్షత్రం/యోగం/కరణం సరైనవా
 * అలాగే సూర్యోదయం ఆధారిత వారం (సూర్యోదయాది వారం) సరిపోతుందా అని చూస్తుంది.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { computeDayPanchanga } from '../src/engine/hinduCalendarEngine.ts';

interface Case {
  city: string;
  date: string;
  lat: number;
  lon: number;
  tz: number;
  sunrise: string;
  sunset: string | null;
  moonrise: string | null;
  moonset: string | null;
  tithi: number;
  nakshatra: number;
  yoga: number;
  karana: number;
}

const golden = JSON.parse(readFileSync('scripts/golden/rise-panchanga-golden.json', 'utf8')) as {
  source: string;
  cases: Case[];
};

const TOL_SEC = { sunrise: 60, sunset: 60, moonrise: 120, moonset: 120 };

const hmsToSec = (s: string | null | undefined): number | null => {
  if (!s) return null;
  const m = s.match(/(\d{2}):(\d{2})(?::(\d{2}))?/);
  if (!m) return null;
  return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3] ?? 0);
};

const TITHI_TE = [
  'ప్రతిపద', 'ద్వితీయ', 'తృతీయ', 'చతుర్థి', 'పంచమి', 'షష్ఠి', 'సప్తమి', 'అష్టమి', 'నవమి', 'దశమి',
  'ఏకాదశి', 'ద్వాదశి', 'త్రయోదశి', 'చతుర్దశి', 'పూర్ణిమ/అమావాస్య',
];

const stats: Record<string, { max: number; where: string; fails: number }> = {};
const record = (k: string, diff: number, where: string, tol: number) => {
  const s = stats[k] ?? (stats[k] = { max: 0, where: '', fails: 0 });
  if (diff > s.max) {
    s.max = diff;
    s.where = where;
  }
  if (diff > tol) s.fails += 1;
};

let checks = 0;
let pass = 0;
const failures: string[] = [];

console.log('\n══════════════════════════════════════════════════════════════');
console.log('  సూర్యోదయ · సూర్యాస్తమయ · చంద్రోదయ · చంద్రాస్తమయ పరీక్ష');
console.log(`  సూచన: ${golden.cases.length} దినాలు · ${golden.source}`);
console.log('══════════════════════════════════════════════════════════════');

for (const c of golden.cases) {
  const geo = { lat: c.lat, lng: c.lon, tzOffsetHours: c.tz, city: c.city } as never;
  const day = computeDayPanchanga(c.date, geo, {});
  const where = `${c.city} ${c.date}`;

  const jdOf = (iso: string | null): number | null => {
    if (!iso) return null;
    const m = iso.match(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/);
    if (!m) return null;
    const utc = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]) - c.tz * 3600e3;
    return utc / 86400000 + 2440587.5;
  };
  const appJd: Record<string, number | null> = {
    sunrise: day.sunriseJd,
    sunset: day.sunsetJd,
    moonrise: day.moonriseJd,
    moonset: day.moonsetJd,
  };
  for (const key of ['sunrise', 'sunset', 'moonrise', 'moonset'] as const) {
    const refJd = jdOf(c[key]);
    if (refJd === null) continue;
    const gotJd = appJd[key];
    if (gotJd === null || gotJd === undefined) {
      failures.push(`${key}: ${where} — యాప్ ఇచ్చినది లేదు (సూచన ${c[key]})`);
      checks += 1;
      continue;
    }
    let diff = Math.abs(gotJd - refJd) * 86400;
    if (diff > 12 * 3600) diff = 24 * 3600 - diff;
    record(key, diff, where, TOL_SEC[key]);
    checks += 1;
    if (diff <= TOL_SEC[key]) pass += 1;
    else {
      const local = new Date((gotJd - 2440587.5) * 86400000 + c.tz * 3600e3);
      failures.push(
        `${key}: ${where} — యాప్ ${String(local.getUTCHours()).padStart(2, '0')}:${String(local.getUTCMinutes()).padStart(2, '0')}:${String(local.getUTCSeconds()).padStart(2, '0')} / సూచన ${c[key]} (${Math.round(diff)} సె.)`
      );
    }
  }

  const checks2: [string, number, number][] = [
    ['tithi', day.tithi.number - 1, c.tithi],
    ['nakshatra', day.nakshatra.number - 1, c.nakshatra],
    ['yoga', day.yoga.number - 1, c.yoga],
    ['karana', day.karana.number - 1, c.karana],
  ];
  for (const [name, got, ref] of checks2) {
    checks += 1;
    if (got === ref) pass += 1;
    else
      failures.push(
        `${name}: ${where} — యాప్ ${got}${name === 'tithi' ? ` (${TITHI_TE[got % 15]})` : ''} / సూచన ${ref}${name === 'tithi' ? ` (${TITHI_TE[ref % 15]})` : ''}`
      );
  }

  // సూర్యోదయాది వారం
  checks += 1;
  const refWeekday = new Date(`${c.date}T12:00:00Z`).getUTCDay();
  if (day.weekday.index === refWeekday) pass += 1;
  else failures.push(`వారం: ${where} — యాప్ ${day.weekday.nameEn} / సూచన ${refWeekday}`);
}

console.log('\n  అంశం            గరిష్ఠ భేదం   సహనం    స్థితి   ఎక్కడ');
console.log('  ────────────────────────────────────────────────────────────────');
for (const [k, s] of Object.entries(stats)) {
  const tol = TOL_SEC[k as keyof typeof TOL_SEC];
  console.log(
    `  ${k.padEnd(14)} ${String(Math.round(s.max)).padStart(7)} సె.  ${String(tol).padStart(4)} సె.   ${s.fails === 0 ? '✓' : '✗'}     ${s.where}`
  );
}

/* ---- UI కోసం ప్రమాణ స్థిరాంకాలు రాయడం ---- */
{
  const LABEL: Record<string, string> = {
    sunrise: 'సూర్యోదయం',
    sunset: 'సూర్యాస్తమయం',
    moonrise: 'చంద్రోదయం',
    moonset: 'చంద్రాస్తమయం',
  };
  const rows = Object.entries(stats)
    .filter(([k]) => k in TOL_SEC)
    .map(([k, v]) => ({
      key: k,
      labelTe: LABEL[k] ?? k,
      maxSeconds: Math.round(v.max),
      tolSeconds: TOL_SEC[k as keyof typeof TOL_SEC],
      where: v.where,
    }));
  const body = `/**
 * AUTO-GENERATED — ఈ ఫైలును చేతిమీద మార్చవద్దు.
 * మూలం: scripts/verify-rise.ts (npm run verify:rise)
 * ప్రమాణం: స్విస్ ఎఫెమెరిస్ 2.10.03 rise_trans — బింబపు ఎగువ అంచు + 34′
 * వాతావరణ వక్రీభవనం (1013.25 hPa, 15 °C, సముద్ర మట్టం). ఇదే దృక్ పంచాంగ నిర్వచనం.
 */
export interface RiseSetAccuracyRow {
  key: string;
  labelTe: string;
  maxSeconds: number;
  tolSeconds: number;
  where: string;
}

export const RISE_SET_ACCURACY = {
  source: ${JSON.stringify(golden.source)},
  definitionTe: 'ఎగువ అంచు + వాతావరణ వక్రీభవనం (దృక్ పంచాంగం)',
  definitionEn: 'upper limb + atmospheric refraction (Drik Panchanga standard)',
  cases: ${golden.cases.length},
  checks: ${checks},
  passed: ${pass},
  failed: ${failures.length},
  rows: ${JSON.stringify(rows, null, 2)},
} as const;
`;
  writeFileSync('src/generated/riseSetAccuracy.ts', body, 'utf8');
}

console.log('\n══════════════════════════════════════════════════════════════');
console.log(`  మొత్తం తనిఖీలు: ${checks} — విజయం: ${pass} — విఫలం: ${failures.length}`);
if (failures.length) {
  const byKind = new Map<string, string[]>();
  for (const f of failures) {
    const k = f.split(':')[0];
    byKind.set(k, [...(byKind.get(k) ?? []), f]);
  }
  for (const [k, list] of byKind) {
    console.log(`\n  ${k}: ${list.length} విఫలం`);
    for (const f of list.slice(0, 6)) console.log('   ✗ ' + f);
  }
  process.exit(1);
}
console.log('  ✓ సూర్యోదయ/అస్తమయ, చంద్రోదయ/అస్తమయ, పంచాంగ అంగాలు — అన్నీ స్విస్ ఎఫెమెరిస్ సరిహద్దులో');
