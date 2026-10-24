/**
 * verify-panchanga.ts
 *
 * Golden-fixture regression test for the Hindu calendar / panchanga engine.
 *
 * The fixture `scripts/golden/panchanga-hyderabad-2026.json` was generated with
 * Swiss Ephemeris 2.10.03 (SIDM_LAHIRI, geocentric) for every day of 2026 at
 * Hyderabad (17.385 N, 78.4867 E, tz +5.5): tithi, nakshatra and yoga numbers
 * prevailing at local sunrise, plus the sunrise clock time.
 *
 * Run with:  npm run verify:panchanga
 *
 * Exits non-zero when any tithi / nakshatra / yoga differs from the reference.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { computeDayPanchanga } from '../src/engine/hinduCalendarEngine.ts';

const here = path.dirname(fileURLToPath(import.meta.url));
const fixturePath = path.join(here, 'golden', 'panchanga-hyderabad-2026.json');

interface GoldenDay {
  date: string;
  tithi: number;
  nakshatra: number;
  yoga: number;
  sunrise: string;
}

const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8')) as {
  source: string;
  days: GoldenDay[];
};

const geo = { lat: 17.385, lng: 78.4867, tzOffsetHours: 5.5, placeName: 'Hyderabad' };

let angaMismatches = 0;
let sunriseOffByMoreThan2Min = 0;
let maxSunriseDelta = 0;

const minutesOf = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

for (const g of fixture.days) {
  const p = computeDayPanchanga(g.date, geo);
  if (p.tithi.number !== g.tithi || p.nakshatra.number !== g.nakshatra || p.yoga.number !== g.yoga) {
    angaMismatches += 1;
    console.log(
      `✗ ${g.date}  expected tithi ${g.tithi} nak ${g.nakshatra} yoga ${g.yoga}` +
        `  got tithi ${p.tithi.number} nak ${p.nakshatra.number} yoga ${p.yoga.number}`
    );
  }
  const delta = Math.abs(minutesOf(p.sunrise) - minutesOf(g.sunrise));
  maxSunriseDelta = Math.max(maxSunriseDelta, delta);
  if (delta > 2) sunriseOffByMoreThan2Min += 1;
}

console.log('');
console.log(`fixture: ${fixture.source}`);
console.log(`days checked          : ${fixture.days.length}`);
console.log(`tithi/nakshatra/yoga  : ${angaMismatches === 0 ? 'ALL MATCH ✓' : `${angaMismatches} mismatches ✗`}`);
console.log(`max sunrise delta     : ${maxSunriseDelta} min (days > 2 min: ${sunriseOffByMoreThan2Min})`);

if (angaMismatches > 0) process.exit(1);
