/**
 * verify-festivals.ts
 *
 * Telugu festival-date regression gate. The golden fixture records the civil day
 * printed by Telugu pañcāṅgams (Drik Panchang, prokerala Telugu calendar and the
 * Andhra Pradesh / Telangana government festival lists) for Hyderabad. Every case
 * carries its own sources, so a date can never be "adjusted" without evidence.
 *
 * Run with:  npm run verify:festivals
 * Exits non-zero when any festival is missing from the expected day.
 */
import fs, { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { festivalsOnDate } from '../src/engine/hinduCalendarEngine.ts';

const here = path.dirname(fileURLToPath(import.meta.url));
const fixture = JSON.parse(
  fs.readFileSync(path.join(here, 'golden', 'festival-golden.json'), 'utf8')
) as {
  source: string;
  hyderabad: { lat: number; lng: number; tz: number };
  cases: { date: string; id: string; note?: string; sources: string[] }[];
};

const geo = {
  lat: fixture.hyderabad.lat,
  lng: fixture.hyderabad.lng,
  tzOffsetHours: fixture.hyderabad.tz,
  placeName: 'Hyderabad',
};

let pass = 0;
const failures: string[] = [];
for (const c of fixture.cases) {
  const ids = festivalsOnDate(c.date, geo).map((f) => f.id);
  if (ids.includes(c.id)) {
    pass += 1;
  } else {
    failures.push(`${c.date}  ${c.id}  — లభించినవి: ${ids.join(', ') || 'ఏమీ లేదు'}`);
  }
}

/* ---- UI కోసం ప్రమాణ స్థిరాంకాలు ---- */
{
  const body = `/**
 * AUTO-GENERATED — ఈ ఫైలును చేతిమీద మార్చవద్దు.
 * మూలం: scripts/verify-festivals.ts (npm run verify:festivals)
 * ప్రమాణం: తెలుగు పంచాంగ పర్వ తేదీలు — దృక్ పంచాంగం, ప్రొకేరళ తెలుగు క్యాలెండర్,
 * ఆంధ్రప్రదేశ్ / తెలంగాణ ప్రభుత్వ పండుగ జాబితాలు. ప్రతి తేదీకి ఆధారం
 * scripts/golden/festival-golden.json లో నమోదై ఉంది.
 */
export const FESTIVAL_ACCURACY = {
  cases: ${fixture.cases.length},
  passed: ${pass},
  failed: ${failures.length},
  firstDate: ${JSON.stringify(fixture.cases[0]?.date ?? '')},
  lastDate: ${JSON.stringify(fixture.cases[fixture.cases.length - 1]?.date ?? '')},
} as const;
`;
  writeFileSync('src/generated/festivalAccuracy.ts', body, 'utf8');
}

console.log(`\n  పర్వాల గోల్డెన్: ${fixture.cases.length} తనిఖీలు — విజయం: ${pass} — విఫలం: ${failures.length}`);
for (const f of failures) console.log(`  ✗ ${f}`);
if (failures.length === 0) {
  console.log('  ✓ అన్ని పర్వ తేదీలు తెలుగు పంచాంగ ప్రమాణంతో సరిపోయాయి\n');
  process.exit(0);
}
console.log('');
process.exit(1);
