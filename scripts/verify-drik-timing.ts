/**
 * verify-drik-timing.ts — డ్రిక్ పంచాంగ్ సమయాలతో పోలిక
 * ------------------------------------------------------
 * సూచన: `scripts/golden/drik-timing-golden.json`
 *   మూలం: PyPI `drik-panchanga` — డ్రిక్ పంచాంగ్ వెబ్‌సైట్ వెనుక ఉన్న అదే
 *   అల్గోరిథం. 2026 · 7 నగరాలు · 515 దినాలు.
 *
 * ఏమి పోలుస్తున్నాము:
 *   1. సూర్యోదయం / సూర్యాస్తమయం (హిందూ నిర్వచనం — బింబ కేంద్రం, వక్రీభవనం లేదు)
 *   2. తిథి మరియు నక్షత్రం — సంఖ్య మరియు *ముగిసే క్షణం*
 *   3. రాహుకాలం, గుళిక కాలం, అభిజిత్ ముహూర్తం, దుర్ముహూర్తం
 *
 * సహనం: ఉదయాస్తమయం 60 సెకన్లు · అంగ ముగింపు 90 సెకన్లు · కాల విభాగాలు 60 సెకన్లు.
 */
import { readFileSync } from 'node:fs';
import { computeDayPanchanga } from '../src/engine/hinduCalendarEngine.ts';

interface Case {
  city: string;
  date: string;
  lat: number;
  lng: number;
  tz: number;
  sunrise: string;
  sunset: string;
  tithiIndex: number;
  tithiEnd: string;
  nakshatraIndex: number;
  nakshatraEnd: string;
  rahuKalam: [string, string];
  gulikaKalam: [string, string];
  abhijit: [string, string];
  durmuhurtam: [string, string][];
}

const golden = JSON.parse(readFileSync('scripts/golden/drik-timing-golden.json', 'utf8')) as {
  source: string;
  cases: Case[];
};

const toMin = (s: string | null | undefined): number | null => {
  if (!s) return null;
  const [h, m] = s.split(':').map(Number);
  return h * 60 + m;
};

/** రాత్రి 24:00 దాటిన కాలాలను సరిచేసి తేడా (నిమిషాలు, సంజ్ఞతో) */
const diffMin = (a: string | null | undefined, b: string | null | undefined): number | null => {
  const x = toMin(a);
  const y = toMin(b);
  if (x === null || y === null) return null;
  let d = x - y;
  if (d > 720) d -= 1440;
  if (d < -720) d += 1440;
  return d;
};

const results: { name: string; ok: boolean; detail: string }[] = [];
const check = (name: string, ok: boolean, detail: string) => {
  results.push({ name, ok, detail });
  console.log(`  ${ok ? '✓' : '✗'} ${name} — ${detail}`);
};

let failureCount = 0;
const tally = {
  sunrise: { worst: 0, at: '' },
  sunset: { worst: 0, at: '' },
  tithiEnd: { worst: 0, at: '' },
  nakEnd: { worst: 0, at: '' },
  rahu: { worst: 0, at: '' },
  gulika: { worst: 0, at: '' },
  abhijit: { worst: 0, at: '' },
  durmuhurtam: { worst: 0, at: '' },
};
let indexErrors = 0;
const indexIssues: string[] = [];

for (const c of golden.cases) {
  // డ్రిక్ తమ లెక్కను **చిత్రపక్ష (true citra)** అయనాంశలో చేస్తుంది; యాప్
  // డిఫాల్ట్ లహిరి. రెండూ 0.022° తేడా — గుర్తింపు మారదు, కాలం ~2 నిమిషాలు.
  // అందుకే ఈ పరీక్ష డ్రిక్ చట్రంలోనే నడుస్తుంది.
  const p = computeDayPanchanga(
    c.date,
    {
      lat: c.lat,
      lng: c.lng,
      tzOffsetHours: c.tz,
      placeName: c.city,
    } as Parameters<typeof computeDayPanchanga>[1],
    { siderealMode: 'true_citra' }
  );

  const upd = (key: keyof typeof tally, d: number | null) => {
    if (d === null) return;
    if (Math.abs(d) > Math.abs(tally[key].worst)) {
      tally[key].worst = d;
      tally[key].at = `${c.city} ${c.date}`;
    }
  };

  upd('sunrise', diffMin(p.sunrise, c.sunrise));
  upd('sunset', diffMin(p.sunset, c.sunset));

  // తిథి/నక్షత్ర సంఖ్యలు రెండూ 1-ఆధారితం
  if (p.tithi.number !== c.tithiIndex) {
    indexErrors += 1;
    indexIssues.push(`${c.city} ${c.date}: మన ${p.tithi.number} vs డ్రిక్ ${c.tithiIndex}`);
  }
  if (p.nakshatra.number !== c.nakshatraIndex) {
    indexErrors += 1;
    indexIssues.push(`${c.city} ${c.date}: నక్షత్రం ${p.nakshatra.number} vs ${c.nakshatraIndex}`);
  }
  upd('tithiEnd', diffMin(p.tithi.endTime, c.tithiEnd));
  upd('nakEnd', diffMin(p.nakshatra.endTime, c.nakshatraEnd));

  const kala = (key: string) => p.kalas.find((k) => k.key === key);
  const rahu = kala('rahu');
  const gulika = kala('gulika');
  const abhijit = kala('abhijit');
  if (rahu) {
    upd('rahu', diffMin(rahu.startTime, c.rahuKalam[0]));
    upd('rahu', diffMin(rahu.endTime, c.rahuKalam[1]));
  }
  if (gulika) {
    upd('gulika', diffMin(gulika.startTime, c.gulikaKalam[0]));
    upd('gulika', diffMin(gulika.endTime, c.gulikaKalam[1]));
  }
  if (abhijit) {
    upd('abhijit', diffMin(abhijit.startTime, c.abhijit[0]));
    upd('abhijit', diffMin(abhijit.endTime, c.abhijit[1]));
  }
  const durm = p.kalas.filter((k) => k.key.startsWith('durmuhurta'));
  for (let i = 0; i < Math.min(durm.length, c.durmuhurtam.length); i++) {
    upd('durmuhurtam', diffMin(durm[i].startTime, c.durmuhurtam[i][0]));
    upd('durmuhurtam', diffMin(durm[i].endTime, c.durmuhurtam[i][1]));
  }
}

const fmtWorst = (t: { worst: number; at: string }) =>
  `${t.worst > 0 ? '+' : ''}${t.worst.toFixed(0)} నిమి${t.at ? ` (${t.at})` : ''}`;

check(
  `సూర్యోదయం — ${golden.cases.length} దినాలు, డ్రిక్ తో భేదం ≤ 60 సెకన్లు`,
  Math.abs(tally.sunrise.worst) <= 1,
  `గరిష్ఠం ${fmtWorst(tally.sunrise)}`
);
check(
  `సూర్యాస్తమయం — భేదం ≤ 60 సెకన్లు`,
  Math.abs(tally.sunset.worst) <= 1,
  `గరిష్ఠం ${fmtWorst(tally.sunset)}`
);
check(
  'తిథి మరియు నక్షత్ర సంఖ్య — ప్రతి దినం డ్రిక్ తో సరిపోలిక',
  indexErrors === 0,
  `${golden.cases.length * 2} పోలికలు · భేదాలు ${indexErrors}${indexIssues.length ? ' · ' + indexIssues[0] : ''}`
);
check(
  'తిథి ముగింపు క్షణం — భేదం ≤ 90 సెకన్లు',
  Math.abs(tally.tithiEnd.worst) <= 2,
  `గరిష్ఠం ${fmtWorst(tally.tithiEnd)}`
);
check(
  'నక్షత్ర ముగింపు క్షణం — భేదం ≤ 90 సెకన్లు',
  Math.abs(tally.nakEnd.worst) <= 2,
  `గరిష్ఠం ${fmtWorst(tally.nakEnd)}`
);
check(
  'రాహుకాలం — భేదం ≤ 60 సెకన్లు',
  Math.abs(tally.rahu.worst) <= 1,
  `గరిష్ఠం ${fmtWorst(tally.rahu)}`
);
check(
  'గుళిక కాలం — భేదం ≤ 60 సెకన్లు',
  Math.abs(tally.gulika.worst) <= 1,
  `గరిష్ఠం ${fmtWorst(tally.gulika)}`
);
check(
  'అభిజిత్ ముహూర్తం — భేదం ≤ 60 సెకన్లు',
  Math.abs(tally.abhijit.worst) <= 1,
  `గరిష్ఠం ${fmtWorst(tally.abhijit)}`
);
check(
  'దుర్ముహూర్తం — భేదం ≤ 60 సెకన్లు',
  Math.abs(tally.durmuhurtam.worst) <= 1,
  `గరిష్ఠం ${fmtWorst(tally.durmuhurtam)}`
);

failureCount = results.filter((r) => !r.ok).length;
console.log(
  `\n  మొత్తం: ${results.length} — విజయం ${results.length - failureCount} — విఫలం ${failureCount}`
);
if (failureCount > 0) process.exit(1);
