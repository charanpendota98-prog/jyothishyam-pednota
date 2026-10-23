/**
 * dump-crosscheck.ts — బాహ్య పరిశీలన కోసం యాప్ లెక్కలను JSON గా దించుతుంది
 * ---------------------------------------------------------------------------
 * `scripts/crosscheck-swisseph.py` ఇదే JSON ను Swiss Ephemeris తో పోలుస్తుంది.
 *   npx tsx scripts/dump-crosscheck.ts          → .cache/crosscheck-app.json
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { calculateChart } from '../src/engine/ephemeris.ts';
import { computeDayPanchanga } from '../src/engine/hinduCalendarEngine.ts';

interface Case {
  name: string;
  date: string;
  time: string;
  lat: number;
  lng: number;
  tz: number;
}

const CASES: Case[] = [
  { name: 'Charan', date: '1998-05-14', time: '08:45', lat: 17.385, lng: 78.4867, tz: 5.5 },
  { name: 'A', date: '1975-01-01', time: '00:05', lat: 13.0827, lng: 80.2707, tz: 5.5 },
  { name: 'B', date: '2003-07-19', time: '23:50', lat: 19.076, lng: 72.8777, tz: 5.5 },
  { name: 'C', date: '2026-10-22', time: '10:30', lat: 17.385, lng: 78.4867, tz: 5.5 },
  { name: 'D', date: '1952-12-11', time: '16:20', lat: 28.6139, lng: 77.209, tz: 5.5 },
  { name: 'E', date: '2010-03-03', time: '05:10', lat: 22.5726, lng: 88.3639, tz: 5.5 },
  { name: 'F', date: '1999-12-31', time: '23:59', lat: 15.3173, lng: 75.7139, tz: 5.5 },
];

const PLANETS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

const out: unknown[] = [];
for (const c of CASES) {
  const chart: any = calculateChart(
    {
      name: c.name,
      gender: 'male',
      date: c.date,
      time: c.time,
      lat: c.lat,
      lng: c.lng,
      tzOffsetHours: c.tz,
      city: 'X',
      country: 'India',
      ayanamsa: 'lahiri',
      houseSystem: 'whole_sign',
    } as never,
    'vedic'
  );

  const grahas: Record<string, { lon: number; nak: string; pada: number; d9: number; house: number }> = {};
  for (const id of PLANETS) {
    const p = chart.planets.find((x: any) => x.id === id);
    if (!p) continue;
    grahas[id] = { lon: p.siderealLon, nak: p.nakshatra, pada: p.pada, d9: p.d9Sign, house: p.house };
  }

  const day: any = computeDayPanchanga(c.date, {
    lat: c.lat,
    lng: c.lng,
    tzOffsetHours: c.tz,
  } as never);

  out.push({
    ...c,
    jdLocalNoon: chart.julianDay,
    ayanamsa: chart.ayanamsaDeg,
    asc: chart.ascendant.siderealLon,
    ascSign: chart.ascendant.signIndex,
    grahas,
    nakshatra: chart.panchanga.nakshatra.name,
    pada: chart.panchanga.nakshatra.pada,
    tithi: chart.panchanga.tithi.number,
    yoga: chart.panchanga.yoga.number,
    karana: chart.panchanga.karana.name,
    sunrise: day?.sunTimes?.sunrise ?? null,
    sunset: day?.sunTimes?.sunset ?? null,
    dayTithi: day?.tithi?.number ?? null,
    sav: chart.ashtakavarga.sarvashtakavarga,
    bav: chart.ashtakavarga.bhinnashtakavarga,
  });
}

mkdirSync('.cache', { recursive: true });
writeFileSync('.cache/crosscheck-app.json', JSON.stringify(out, null, 1));
console.log(`దించబడింది: ${out.length} జాతకాలు → .cache/crosscheck-app.json`);
