/**
 * scripts/verify-calendar-lunar.ts — అమావాస్య · సంక్రమణి · మాసం · అధిక మాసం · ఉగాది
 * ---------------------------------------------------------------------------
 * సూచన: `scripts/golden/lunar-golden.json` (స్విస్ ఎఫెమెరిస్ 2.10.03, 2023–2030)
 *   102 అమావాస్యలు · 98 సంక్రమణులు · 101 అమాంత మాసాలు · 3 అధిక మాసాలు · 8 ఉగాదులు
 *
 * ఇది తెలుగు పంచాంగపు వెన్నెముక: నెల పేరు, అధిక మాసం, ఉగాది — అన్నీ ఇక్కడే
 * నిర్ణయమవుతాయి. తప్పు జరిగితే ఏడాది పంచాంగం మొత్తం తప్పు.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import {
  newMoonAfterJd,
  newMoonBeforeJd,
  nextSankrantiAfterJd,
  resolveMasa,
  ugadiDateISO,
} from '../src/engine/hinduCalendarEngine.ts';

interface Lunar {
  source: string;
  newMoons: { jd: number; utc: string }[];
  sankrantis: { signIndex: number; jd: number; rasi: string; utc: string }[];
  months: {
    startJd: number;
    endJd: number;
    startUTC: string;
    masaIndex: number;
    masaEn: string;
    masaTe: string;
    isAdhika: boolean;
  }[];
  adhikaMonths: { masaEn: string; startUTC: string; endUTC: string }[];
  ugadi: { date: string; kshaya?: boolean }[];
}

const golden = JSON.parse(readFileSync('scripts/golden/lunar-golden.json', 'utf8')) as Lunar;

let pass = 0;
const failures: string[] = [];
const check = (label: string, ok: boolean, detail: string) => {
  if (ok) pass += 1;
  else failures.push(`${label} — ${detail}`);
};

/**
 * సహనాలు:
 *  • అమావాస్య — 2 నిమిషాలు (చంద్ర స్ఫుటం 20″ వరకు భేదం → ≈40 సె.)
 *  • సంక్రమణి — 6 నిమిషాలు (సూర్యుడు రోజుకు 0.9856° కదులుతాడు; 16″ భేదం
 *    అంటే ≈6 నిమిషాలు. ప్రచురిత పంచాంగాల మధ్య కూడా ఇంత భేదం సహజం.)
 */
const NEW_MOON_TOL = 2;
const SANKRANTI_TOL = 2;
const dayDiff = (a: number, b: number) => Math.abs(a - b) * 1440;

console.log('\n══════════════════════════════════════════════════════════════');
console.log('  అమావాస్య · సంక్రమణి · మాసం · అధిక మాసం · ఉగాది పరీక్ష');
console.log(`  సూచన: ${golden.source}`);
console.log('══════════════════════════════════════════════════════════════');

let worstNewMoon = 0;
let worstNewMoonAt = '';
for (const nm of golden.newMoons) {
  const after = newMoonAfterJd(nm.jd - 6);
  const before = newMoonBeforeJd(nm.jd + 6);
  const da = dayDiff(after, nm.jd);
  const db = dayDiff(before, nm.jd);
  if (da > worstNewMoon) {
    worstNewMoon = da;
    worstNewMoonAt = nm.utc;
  }
  check('అమావాస్య (తర్వాత)', da <= NEW_MOON_TOL, `${nm.utc} — Δ ${da.toFixed(2)} నిమి.`);
  check('అమావాస్య (మునుపు)', db <= NEW_MOON_TOL, `${nm.utc} — Δ ${db.toFixed(2)} నిమి.`);
}

let worstSankranti = 0;
let worstSankrantiAt = '';
for (const s of golden.sankrantis) {
  const got = nextSankrantiAfterJd(s.jd - 6);
  const d = dayDiff(got.jd, s.jd);
  if (d > worstSankranti) {
    worstSankranti = d;
    worstSankrantiAt = `${s.rasi} ${s.utc}`;
  }
  check(
    `సంక్రమణి ${s.rasi}`,
    got.signIndex === s.signIndex && d <= SANKRANTI_TOL,
    `${s.utc} — యాప్ రాశి ${got.signIndex}, Δ ${d.toFixed(2)} నిమి.`
  );
}

let worstMasa = 0;
let masaBad = 0;
for (const m of golden.months) {
  const mid = (m.startJd + m.endJd) / 2;
  const got = resolveMasa(mid);
  const ok = got.masaIndex === m.masaIndex && got.isAdhika === m.isAdhika;
  if (!ok) masaBad += 1;
  const d = dayDiff(got.lunationStartJd, m.startJd);
  if (d > worstMasa) worstMasa = d;
  check(
    `మాసం ${m.masaTe}${m.isAdhika ? ' (అధిక)' : ''}`,
    ok && d <= NEW_MOON_TOL,
    `${m.startUTC} — యాప్ ${got.masaIndex}${got.isAdhika ? ' అధిక' : ''}, సూచన ${m.masaIndex}${
      m.isAdhika ? ' అధిక' : ''
    }, Δ ${d.toFixed(2)} నిమి.`
  );
}

console.log('\n  అంశం                        గరిష్ఠ భేదం      ఎక్కడ');
console.log('  ────────────────────────────────────────────────────────────');
console.log(`  అమావాస్య క్షణం              ${worstNewMoon.toFixed(2)} నిమి.       ${worstNewMoonAt}`);
console.log(`  సంక్రమణి క్షణం              ${worstSankranti.toFixed(2)} నిమి.       ${worstSankrantiAt}`);
console.log(`  చాంద్రమాస ఆరంభం             ${worstMasa.toFixed(2)} నిమి.`);
console.log(`  తప్పు పేరు/అధిక మాసాలు       ${masaBad} / ${golden.months.length}`);

// అధిక మాసాలు — విడిగా ప్రదర్శన
console.log('\n  అధిక మాసాలు (స్విస్ ఎఫెమెరిస్):');
for (const a of golden.adhikaMonths) console.log(`   • అధిక ${a.masaEn} — ${a.startUTC.slice(0, 10)} → ${a.endUTC.slice(0, 10)}`);

// ఉగాది
console.log('\n  ఉగాది (చైత్ర శుక్ల ప్రతిపద — హైదరాబాద్):');
for (const u of golden.ugadi) {
  const year = Number(u.date.slice(0, 4));
  const got = ugadiDateISO(year);
  console.log(`   • ${year}: సూచన ${u.date} · యాప్ ${got} ${u.kshaya ? '(క్షయ ప్రతిపద)' : ''} ${got === u.date ? '✓' : '✗'}`);
  check(`ఉగాది ${year}`, got === u.date, `సూచన ${u.date} / యాప్ ${got}`);
}

const total = pass + failures.length;
/* ---- UI కోసం ప్రమాణ స్థిరాంకాలు ---- */
{
  const body = `/**
 * AUTO-GENERATED — ఈ ఫైలును చేతిమీద మార్చవద్దు.
 * మూలం: scripts/verify-calendar-lunar.ts (npm run verify:calendar)
 * ప్రమాణం: స్విస్ ఎఫెమెరిస్ 2.10.03 (SIDM_LAHIRI) — అమావాస్య క్షణం, సంక్రమణి క్షణం,
 * చాంద్రమాస ఆరంభం, అధిక మాసం, ఉగాది (క్షయ ప్రతిపద సహా).
 */
export const LUNAR_CALENDAR_ACCURACY = {
  source: ${JSON.stringify(golden.source)},
  checks: ${total},
  passed: ${pass},
  failed: ${failures.length},
  newMoonTolMinutes: ${NEW_MOON_TOL},
  sankrantiTolMinutes: ${SANKRANTI_TOL},
  maxNewMoonMinutes: ${Number(worstNewMoon.toFixed(2))},
  maxSankrantiMinutes: ${Number(worstSankranti.toFixed(2))},
  maxMasaStartMinutes: ${Number(worstMasa.toFixed(2))},
  newMoons: ${golden.newMoons.length},
  sankrantis: ${golden.sankrantis.length},
  amantaMonths: ${golden.months.length},
  adhikaMonths: ${golden.adhikaMonths.length},
  ugadis: ${golden.ugadi.length},
  frameNoteTe: 'నిరయనం = మధ్యమ విషువత్తు (పోషణ రహిత) చట్రం — లహిరి అయనాంశంతో',
  frameNoteEn: 'sidereal = mean equinox frame (nutation removed) + Lahiri ayanamsa',
} as const;
`;
  writeFileSync('src/generated/calendarAccuracy.ts', body, 'utf8');
}

console.log('\n══════════════════════════════════════════════════════════════');
console.log(`  మొత్తం తనిఖీలు: ${total} — విజయం: ${pass} — విఫలం: ${failures.length}`);
if (failures.length) {
  console.log('\n  విఫలమైన తనిఖీలు (మొదటి 15):');
  for (const f of failures.slice(0, 15)) console.log('   ✗ ' + f);
  process.exit(1);
}
console.log('  ✓ అమావాస్యలు, సంక్రమణులు, మాసాలు, అధిక మాసాలు, ఉగాది — అన్నీ సరిపోయాయి\n');
