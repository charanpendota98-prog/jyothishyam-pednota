/**
 * scripts/verify-astro.ts — స్విస్ ఎఫెమెరిస్ గోల్డెన్ ఫిక్చర్ తో గ్రహ స్ఫుట పరీక్ష
 * ---------------------------------------------------------------------------
 * 30 జనన క్షణాలు (1899–2035, ఉత్తర/దక్షిణ అక్షాంశాలు, తూర్పు/పడమర రేఖాంశాలు)
 * Swiss Ephemeris 2.10.03 (SIDM_LAHIRI, TRUE_NODE, FLG_SWIEPH) తో లెక్కించి
 * `scripts/golden/ephemeris-golden.json` లో నిల్వ చేయబడ్డాయి. ఈ స్క్రిప్ట్ మన
 * ఇంజిన్ (`calculateChart`) ఫలితాన్ని ఆ ఫిక్చర్ తో పోలుస్తుంది.
 *
 * ప్రమాణాలు (గేట్లు):
 *   • అయనాంశం      ≤ 0.0005°  (1.8 ఆర్క్-సెకన్లు)
 *   • సూర్యుడు       ≤ 0.010°   (36 ఆర్క్-సెకన్లు)
 *   • చంద్రుడు      ≤ 0.020°
 *   • గ్రహాలు       ≤ 0.030°
 *   • రాహు/కేతు    ≤ 0.030°  (సత్య నోడ్)
 *   • యురేనస్/నెప్ట్యూన్/ప్లూటో ≤ 0.030°
 *   • లగ్నం         ≤ 0.030°  (సంపూర్ణ రాశి భావ పద్ధతి)
 *   • మధ్యాకాశం     ≤ 0.050°
 *   • అయనాంశ విధానాలు (7): లహిరి/రామన్/కేపీ/ఫాగన్-బ్రాడ్లీ/యుక్తేశ్వర్ ≤ 0.001°
 *                            నిజ చిత్రా / పుష్య (నక్షత్ర ఆధారిత) ≤ 0.008°
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { calculateChart } from '../src/engine/ephemeris.ts';

interface GoldenCase {
  label: string;
  utc: string;
  lat: number;
  lon: number;
  ayanamsa: number;
  ayanamsaModes: Record<string, number>;
  asc: number;
  mc: number;
  planets: Record<string, number>;
}

const golden = JSON.parse(readFileSync('scripts/golden/ephemeris-golden.json', 'utf8')) as {
  source: string;
  cases: GoldenCase[];
};

const TOL: Record<string, number> = {
  ayanamsa: 0.0005,
  Sun: 0.01,
  Moon: 0.02,
  Mars: 0.03,
  Mercury: 0.03,
  Jupiter: 0.03,
  Venus: 0.03,
  Saturn: 0.03,
  Uranus: 0.03,
  Neptune: 0.03,
  Pluto: 0.03,
  Rahu: 0.03,
  Ketu: 0.03,
  asc: 0.03,
  mc: 0.05,
};

/** అయనాంశ విధానాల సహనం — నక్షత్ర ఆధారిత నిజ చిత్రా/పుష్య కొంచెం విశాలం */
const AYANAMSA_MODES: { id: string; label: string; tol: number }[] = [
  { id: 'lahiri', label: 'లహిరి (చిత్రపక్ష)', tol: 0.001 },
  { id: 'raman', label: 'రామన్', tol: 0.001 },
  { id: 'kp', label: 'కృష్ణమూర్తి (KP)', tol: 0.001 },
  { id: 'fagan_bradley', label: 'ఫాగన్-బ్రాడ్లీ', tol: 0.001 },
  { id: 'yukteshwar', label: 'యుక్తేశ్వర్', tol: 0.001 },
  { id: 'true_citra', label: 'నిజ చిత్రా', tol: 0.008 },
  { id: 'pushya', label: 'పుష్య', tol: 0.008 },
];

/** రెండు స్ఫుటాల మధ్య చిన్నదైన కోణీయ భేదం (0…180°) */
const diff = (a: number, b: number) => {
  const d = ((a - b + 540) % 360) - 180;
  return Math.abs(d);
};

const maxErr: Record<string, { err: number; label: string; ours: number; ref: number }> = {};
const failures: string[] = [];
let checks = 0;
let pass = 0;

const record = (key: string, err: number, label: string, ours: number, ref: number) => {
  checks += 1;
  const cur = maxErr[key];
  if (!cur || err > cur.err) maxErr[key] = { err, label, ours, ref };
  if (err <= (TOL[key] ?? AYANAMSA_MODES.find((m) => 'ay:' + m.id === key)?.tol ?? 0.03)) pass += 1;
  else failures.push(`${key}: ${err.toFixed(4)}° (${label}) — app ${ours.toFixed(3)} / ref ${ref.toFixed(3)}`);
};

console.log('\n══════════════════════════════════════════════════════════════');
console.log('  గ్రహ స్ఫుట ఖచ్చితత్వ పరీక్ష — Swiss Ephemeris 2.10.03 గోల్డెన్ ఫిక్చర్');
console.log(`  ఫిక్చర్: ${golden.cases.length} జనన క్షణాలు · ${golden.source}`);
console.log('══════════════════════════════════════════════════════════════');

for (const c of golden.cases) {
  // UTC ఇన్‌పుట్ → స్థానిక సమయం (tz = 0) గా ఇంజిన్‌కు ఇవ్వడం
  const date = c.utc.slice(0, 10);
  const time = c.utc.slice(11, 16);
  const chart = calculateChart({
    name: 'golden',
    gender: 'male',
    date,
    time,
    lat: c.lat,
    lng: c.lon,
    tzOffsetHours: 0,
    city: c.label,
    country: 'test',
    ayanamsa: 'lahiri',
    houseSystem: 'whole_sign',
  } as Parameters<typeof calculateChart>[0]);

  for (const mode of AYANAMSA_MODES) {
    const ref = c.ayanamsaModes?.[mode.id];
    if (ref === undefined) continue;
    const modeChart = calculateChart({
      name: 'golden',
      gender: 'male',
      date,
      time,
      lat: c.lat,
      lng: c.lon,
      tzOffsetHours: 0,
      city: c.label,
      country: 'test',
      ayanamsa: mode.id,
      houseSystem: 'whole_sign',
    } as Parameters<typeof calculateChart>[0]);
    record('ay:' + mode.id, Math.abs(modeChart.ayanamsaDeg - ref), c.label, modeChart.ayanamsaDeg, ref);
  }
  record('asc', diff(chart.ascendant.siderealLon, c.asc), c.label, chart.ascendant.siderealLon, c.asc);
  record('mc', diff(chart.midheaven.siderealLon, c.mc), c.label, chart.midheaven.siderealLon, c.mc);

  for (const [id, ref] of Object.entries(c.planets)) {
    const p = chart.planets.find((x) => x.id === id);
    if (!p) {
      failures.push(`${id} గ్రహం ఇంజిన్‌లో లేదు (${c.label})`);
      continue;
    }
    record(id, diff(p.siderealLon, ref), c.label, p.siderealLon, ref);
  }
}

const LABEL: Record<string, string> = {
  ayanamsa: 'అయనాంశం', Sun: 'సూర్యుడు', Moon: 'చంద్రుడు', Mars: 'కుజుడు', Mercury: 'బుధుడు',
  Jupiter: 'గురువు', Venus: 'శుక్రుడు', Saturn: 'శని', Uranus: 'యురేనస్', Neptune: 'నెప్ట్యూన్',
  Pluto: 'ప్లూటో', Rahu: 'రాహు', Ketu: 'కేతు', asc: 'లగ్నం', mc: 'మధ్యాకాశం',
  ...Object.fromEntries(AYANAMSA_MODES.map((m) => ['ay:' + m.id, m.label])),
};

console.log('\n  గ్రహం          గరిష్ఠ భేదం   సహనం     స్థితి   ఎక్కడ');
console.log('  ─────────────────────────────────────────────────────────────────────────');
const tolOf = (k: string) => TOL[k] ?? AYANAMSA_MODES.find((m) => 'ay:' + m.id === k)?.tol ?? 0.03;

for (const key of Object.keys(maxErr)) {
  const m = maxErr[key];
  const ok = m.err <= tolOf(key);
  console.log(
    `  ${(LABEL[key] ?? key).padEnd(16)} ${m.err.toFixed(4).padStart(8)}°  ${tolOf(key).toFixed(3).padStart(6)}°   ${ok ? '✓' : '✗'}     ${m.label}`
  );
}

// ── యాప్ లో చూపడానికి యంత్ర-పఠనీయ ఫలితం ─────────────────────────────────
const ledger = {
  source: golden.source,
  fixtureEpochs: golden.cases.length,
  firstUtc: golden.cases.map((c) => c.utc).sort()[0],
  lastUtc: golden.cases.map((c) => c.utc).sort().slice(-1)[0],
  measurements: checks,
  passed: pass,
  failed: failures.length,
  rows: Object.keys(maxErr).map((k) => ({
    key: k,
    labelTe: LABEL[k] ?? k,
    maxDeg: Number(maxErr[k].err.toFixed(6)),
    maxArcsec: Number((maxErr[k].err * 3600).toFixed(2)),
    tolDeg: tolOf(k),
    where: maxErr[k].label,
  })),
  // ప్రధాన ఏడు గ్రహాలు + లగ్నం/అయనాంశం మాత్రమే (యురేనస్ మొ. బాహ్య గ్రహాలు విడిగా)
  classicalMaxDeg: Math.max(
    ...['ayanamsa', 'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu', 'asc', 'mc']
      .filter((k) => maxErr[k])
      .map((k) => maxErr[k].err)
  ),
};
mkdirSync('src/generated', { recursive: true });
const tsOut = `/**
 * AUTO-GENERATED — ఈ ఫైలును చేతితో మార్చవద్దు.
 * మూలం: scripts/verify-astro.ts (npm run verify:astro)
 * ప్రమాణం: ${ledger.source}
 * తయారీ: scripts/golden/make-ephemeris-golden.py (pyswisseph)
 */
export interface EphemerisAccuracyRow {
  key: string;
  labelTe: string;
  maxDeg: number;
  maxArcsec: number;
  tolDeg: number;
  where: string;
}

export const EPHEMERIS_ACCURACY = ${JSON.stringify(ledger, null, 2)} as {
  source: string;
  fixtureEpochs: number;
  firstUtc: string;
  lastUtc: string;
  measurements: number;
  passed: number;
  failed: number;
  rows: EphemerisAccuracyRow[];
  classicalMaxDeg: number;
};
`;
writeFileSync('src/generated/ephemerisAccuracy.ts', tsOut);
console.log('  ↳ src/generated/ephemerisAccuracy.ts నవీకరించబడింది');

console.log('\n══════════════════════════════════════════════════════════════');
console.log(`  మొత్తం కొలతలు: ${checks} — సరిపోయినవి: ${pass} — విఫలం: ${failures.length}`);
if (failures.length) {
  console.log('\n  విఫలమైన కొలతలు:');
  for (const f of failures.slice(0, 20)) console.log('   ✗ ' + f);
  process.exit(1);
}
console.log('  ✓ గ్రహ స్ఫుటాలు, లగ్నం, అయనాంశం — అన్నీ స్విస్ ఎఫెమెరిస్ సరిహద్దులో ఉన్నాయి\n');
