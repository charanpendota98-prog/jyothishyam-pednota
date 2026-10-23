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
 *   • లగ్నం         ≤ 0.030°  (శ్రీపతి కాదు — సంపూర్ణ రాశి భావ పద్ధతి)
 */

import { readFileSync } from 'node:fs';
import { calculateChart } from '../src/engine/ephemeris.ts';

interface GoldenCase {
  label: string;
  utc: string;
  lat: number;
  lon: number;
  ayanamsa: number;
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
  Rahu: 0.03,
  Ketu: 0.03,
  asc: 0.03,
  mc: 0.05,
};

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
  if (err <= (TOL[key] ?? 0.03)) pass += 1;
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

  record('ayanamsa', Math.abs(chart.ayanamsaDeg - c.ayanamsa), c.label, chart.ayanamsaDeg, c.ayanamsa);
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
  Jupiter: 'గురువు', Venus: 'శుక్రుడు', Saturn: 'శని', Rahu: 'రాహు', Ketu: 'కేతు', asc: 'లగ్నం', mc: 'మధ్యాకాశం',
};

console.log('\n  గ్రహం          గరిష్ఠ భేదం   సహనం     స్థితి   ఎక్కడ');
console.log('  ─────────────────────────────────────────────────────────────────────────');
for (const key of Object.keys(TOL)) {
  const m = maxErr[key];
  if (!m) continue;
  const ok = m.err <= TOL[key];
  console.log(
    `  ${(LABEL[key] ?? key).padEnd(12)} ${m.err.toFixed(4).padStart(8)}°  ${TOL[key].toFixed(3).padStart(6)}°   ${ok ? '✓' : '✗'}     ${m.label}`
  );
}

console.log('\n══════════════════════════════════════════════════════════════');
console.log(`  మొత్తం కొలతలు: ${checks} — సరిపోయినవి: ${pass} — విఫలం: ${failures.length}`);
if (failures.length) {
  console.log('\n  విఫలమైన కొలతలు:');
  for (const f of failures.slice(0, 20)) console.log('   ✗ ' + f);
  process.exit(1);
}
console.log('  ✓ గ్రహ స్ఫుటాలు, లగ్నం, అయనాంశం — అన్నీ స్విస్ ఎఫెమెరిస్ సరిహద్దులో ఉన్నాయి\n');
