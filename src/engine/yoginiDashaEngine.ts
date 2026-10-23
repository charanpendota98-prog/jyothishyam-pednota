/**
 * yoginiDashaEngine.ts — యోగినీ దశ (36 సంవత్సరాల చక్రం)
 * ======================================================
 * జన్మ నక్షత్రం నుంచి లెక్కించే నక్షత్రిక దశ. క్రమం:
 *
 *  1 మంగళ (చంద్రుడు, 1 సం.) · 2 పింగళ (సూర్యుడు, 2) · 3 ధాన్య (గురువు, 3) ·
 *  4 భ్రామరి (కుజుడు, 4) · 5 భద్రిక (బుధుడు, 5) · 6 ఉల్క (శని, 6) ·
 *  7 సిద్ధ (శుక్రుడు, 7) · 8 శంకట (రాహువు, 8) — మొత్తం 36 సంవత్సరాలు.
 *
 * సూత్రం (అన్ని సంప్రదాయాలలో ఒకటే):
 *   యోగినీ సూచిక = (చంద్రుని నక్షత్ర క్రమ సంఖ్య + 3) mod 8   [0 → 8, శంకట]
 *   జన్మనాటి శేషం = (నక్షత్రంలో మిగిలిన భాగం) × ఆ యోగినీ సంవత్సరాలు
 *
 * స్వతంత్ర ధృవీకరణ: సారావళి యోగినీ దశ పట్టికలో ప్రతి యోగినీకి ఇచ్చిన
 * నక్షత్రాల జాబితా (ఉదా. భద్రిక — 2, 10, 18, 26) ఈ సూత్రంతో 27 నక్షత్రాలకూ
 * సరిపోతుంది (గేట్ చూడండి).
 *
 * సంవత్సరం = 365.25 రోజులు — వింశోత్తరీతో ఒకే మూలం (పత్రికా సంప్రదాయం).
 */

import type { CompleteChartResult } from './ephemeris.ts';

const MS_PER_YEAR = 365.25 * 86400 * 1000;
const NAK_SPAN = 360 / 27;

export interface YoginiInfo {
  index: number;
  nameTe: string;
  nameEn: string;
  lord: string;
  lordTe: string;
  years: number;
  nature: 'శుభ' | 'పాప';
  natureTe: string;
}

export const YOGINIS: YoginiInfo[] = [
  { index: 1, nameTe: 'మంగళ', nameEn: 'Mangala', lord: 'Moon', lordTe: 'చంద్రుడు', years: 1, nature: 'శుభ', natureTe: 'శుభ — ప్రారంభ శక్తి, ఉత్సాహం' },
  { index: 2, nameTe: 'పింగళ', nameEn: 'Pingala', lord: 'Sun', lordTe: 'సూర్యుడు', years: 2, nature: 'పాప', natureTe: 'పాప — తీవ్రత, నాయకత్వం' },
  { index: 3, nameTe: 'ధాన్య', nameEn: 'Dhanya', lord: 'Jupiter', lordTe: 'గురువు', years: 3, nature: 'శుభ', natureTe: 'శుభ — సమృద్ధి, జ్ఞానం' },
  { index: 4, nameTe: 'భ్రామరి', nameEn: 'Bhramari', lord: 'Mars', lordTe: 'కుజుడు', years: 4, nature: 'పాప', natureTe: 'పాప — క్రియ, పోరాటం' },
  { index: 5, nameTe: 'భద్రిక', nameEn: 'Bhadrika', lord: 'Mercury', lordTe: 'బుధుడు', years: 5, nature: 'శుభ', natureTe: 'శుభ — వ్యాపారం, విద్య, సంభాషణ' },
  { index: 6, nameTe: 'ఉల్క', nameEn: 'Ulka', lord: 'Saturn', lordTe: 'శని', years: 6, nature: 'పాప', natureTe: 'పాప — క్రమశిక్షణ, ఓపిక' },
  { index: 7, nameTe: 'సిద్ధ', nameEn: 'Siddha', lord: 'Venus', lordTe: 'శుక్రుడు', years: 7, nature: 'శుభ', natureTe: 'శుభ — సౌఖ్యం, కళ, సంబంధాలు' },
  { index: 8, nameTe: 'శంకట', nameEn: 'Shankata', lord: 'Rahu', lordTe: 'రాహువు', years: 8, nature: 'పాప', natureTe: 'పాప — ఒడిదుడుకులు, పరీక్ష' },
];

export interface YoginiSubPeriod {
  nameTe: string;
  startISO: string;
  endISO: string;
}

export interface YoginiPeriod {
  nameTe: string;
  nameEn: string;
  lord: string;
  lordTe: string;
  years: number;
  nature: string;
  startISO: string;
  endISO: string;
  /** జన్మనాటి శేషం (మొదటి దశకు మాత్రమే) — నెలలు, రోజులు */
  balanceTe?: string;
  isBirth: boolean;
  /** ఈ యోగినీ అధిపతి జన్మ కుండలిలో ఎక్కడ ఉన్నాడు */
  lordPositionsTe: string;
  subs: YoginiSubPeriod[];
}

export interface YoginiReport {
  nakshatraTe: string;
  nakshatraNumber: number;
  startYogini: YoginiInfo;
  periods: YoginiPeriod[];
  currentIndex: number;
  currentTe: string;
  summaryTe: string;
  sourceTe: string;
}

const NAK_TE = [
  'అశ్విని', 'భరణి', 'కృత్తిక', 'రోహిణి', 'మృగశిర', 'ఆర్ద్ర', 'పునర్వసు', 'పుష్యమి', 'ఆశ్లేష',
  'మఘ', 'పూర్వ ఫల్గుణి', 'ఉత్తర ఫల్గుణి', 'హస్త', 'చిత్త', 'స్వాతి', 'విశాఖ', 'అనూరాధ', 'జ్యేష్ఠ',
  'మూల', 'పూర్వాషాఢ', 'ఉత్తరాషాఢ', 'శ్రవణ', 'ధనిష్ఠ', 'శతభిష', 'పూర్వాభాద్ర', 'ఉత్తరాభాద్ర', 'రేవతి',
];

/** నక్షత్ర క్రమ సంఖ్య (1…27) నుంచి జన్మ యోగినీ సూచిక (1…8) */
export function yoginiIndexForNakshatra(nakshatraNumber: number): number {
  const r = ((nakshatraNumber + 3 - 1) % 8) + 1; // ((n+3) mod 8), 0 → 8
  return r;
}

function fmtLocal(ms: number, tz: number): string {
  return new Date(ms + tz * 3600000).toISOString().slice(0, 10);
}

function balanceText(ms: number): string {
  const totalDays = ms / 86400000;
  const months = Math.floor(totalDays / 30.4375);
  const days = Math.round(totalDays - months * 30.4375);
  const y = Math.floor(months / 12);
  const m = months % 12;
  const parts: string[] = [];
  if (y) parts.push(`${y} సం.`);
  if (m) parts.push(`${m} మా.`);
  parts.push(`${days} రో.`);
  return parts.join(' ');
}

export function computeYoginiDasha(chart: CompleteChartResult, asOfISO?: string): YoginiReport {
  const moon = chart.planets.find((p) => p.id === 'Moon');
  if (!moon) throw new Error('చంద్రుడు కుండలిలో లేడు');
  const lon = moon.siderealLon;
  const nakIndex = Math.floor(lon / NAK_SPAN); // 0…26
  const fractionElapsed = (lon - nakIndex * NAK_SPAN) / NAK_SPAN;
  const nakNumber = nakIndex + 1;

  const startIdx = yoginiIndexForNakshatra(nakNumber); // 1…8
  const startYogini = YOGINIS[startIdx - 1];

  const tz = chart.input.tzOffsetHours;
  const birthMs = new Date(chart.utcIso).getTime();
  const elapsedMs = startYogini.years * fractionElapsed * MS_PER_YEAR;
  let cursor = birthMs - elapsedMs;

  const periods: YoginiPeriod[] = [];
  // రెండు పూర్తి చక్రాలు (72 సంవత్సరాలు) — ఆయుష్షు పరిధి కోసం
  for (let i = 0; i < 16; i++) {
    const idx = ((startIdx - 1 + i) % 8) + 1;
    const yog = YOGINIS[idx - 1];
    const startMs = cursor;
    const endMs = startMs + yog.years * MS_PER_YEAR;
    const lordPlanet = chart.planets.find((p) => p.id === yog.lord);
    const rawSubs: { nameTe: string; startMs: number; endMs: number }[] = [];
    const subLen = (endMs - startMs) / 8;
    for (let k = 0; k < 8; k++) {
      const subIdx = ((idx - 1 + k) % 8) + 1;
      rawSubs.push({
        nameTe: YOGINIS[subIdx - 1].nameTe,
        startMs: startMs + k * subLen,
        endMs: startMs + (k + 1) * subLen,
      });
    }
    // జననానికి ముందు గడిచిన అంతర్దశలు చూపము; మొదటి మిగిలిన దాన్ని జననం నుంచి లెక్కిస్తాము
    const kept = rawSubs.filter((x) => x.endMs > birthMs);
    const subs: YoginiSubPeriod[] = kept.map((x, k) => ({
      nameTe: x.nameTe,
      startISO: fmtLocal(k === 0 && i === 0 ? Math.max(birthMs, x.startMs) : x.startMs, tz),
      endISO: fmtLocal(x.endMs, tz),
    }));
    periods.push({
      nameTe: yog.nameTe,
      nameEn: yog.nameEn,
      lord: yog.lord,
      lordTe: yog.lordTe,
      years: yog.years,
      nature: yog.natureTe,
      startISO: fmtLocal(Math.max(birthMs, startMs), tz),
      endISO: fmtLocal(endMs, tz),
      balanceTe: i === 0 ? balanceText(endMs - birthMs) : undefined,
      isBirth: i === 0,
      lordPositionsTe: lordPlanet
        ? `${yog.lordTe} జన్మ కుండలిలో ${lordPlanet.d1Sign + 1}వ రాశిలో (${lordPlanet.house}వ భావం, ${lordPlanet.nakshatra})`
        : `${yog.lordTe} — కుండలిలో లేడు`,
      subs,
    });
    cursor = endMs;
  }

  const refMs = asOfISO ? new Date(`${asOfISO}T00:00:00Z`).getTime() : Date.now();
  const currentIndex = periods.findIndex(
    (p) => new Date(`${p.startISO}T00:00:00Z`).getTime() <= refMs && refMs < new Date(`${p.endISO}T00:00:00Z`).getTime()
  );
  const cur = periods[currentIndex] ?? periods[0];

  const summaryTe =
    `జన్మ నక్షత్రం ${NAK_TE[nakIndex]} (${nakNumber}/27) — ${nakNumber} + 3 = ${nakNumber + 3}, ` +
    `8 తో భాగిస్తే ${((nakNumber + 3 - 1) % 8) + 1} శేషం, కాబట్టి జన్మ యోగినీ **${startYogini.nameTe}** ` +
    `(${startYogini.lordTe}, ${startYogini.years} సం.). జన్మనాటి శేషం ${periods[0].balanceTe}. ` +
    (currentIndex >= 0
      ? `ప్రస్తుతం ${cur.nameTe} యోగినీ (${cur.startISO} – ${cur.endISO}).`
      : 'ప్రస్తుత కాలం జననానికి ముందు.');

  return {
    nakshatraTe: NAK_TE[nakIndex],
    nakshatraNumber: nakNumber,
    startYogini,
    periods,
    currentIndex,
    currentTe: cur.nameTe,
    summaryTe,
    sourceTe:
      'యోగినీ దశ — (నక్షత్ర సంఖ్య + 3) ÷ 8 శేషం; సారావళి యోగినీ దశ పట్టిక (నక్షత్ర సమూహాలు), 36 సంవత్సరాల చక్రం, 365.25 రోజుల సంవత్సరం',
  };
}
