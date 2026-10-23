/**
 * షడ్బల (Shadbala) — పూర్తి బృహత్ పరాశర హోరా శాస్త్రం (అధ్యాయం 27) గణన
 * ------------------------------------------------------------------------
 * Six sources of planetary strength, in virupas (60 virupas = 1 rupa):
 *   1. స్థాన బలం  — uchcha + saptavargaja + ojhajugma + kendradi + drekkana
 *   2. దిగ్ బలం   — distance from the planet's weakest angle (Asc/MC/Desc/IC)
 *   3. కాల బలం    — nathonnatha + paksha + tribhaga + varsha/masa/dina/hora + ayana + yuddha
 *   4. చేష్టా బలం  — చేష్టా కేంద్రం ÷ 3 (గరిష్ఠం 60); సూర్య/చంద్రులకు 0
 *                     (వారి చలన బలం అయన/పక్ష బలాలలో ఇప్పటికే లెక్కించబడుతుంది)
 *   5. నైసర్గిక బలం — fixed natural luminosity
 *   6. దృక్ బలం    — aspectual strength (Parashara rasi drishti, one fourth)
 *
 * Every component is exposed separately so a Telugu reader can audit the
 * arithmetic, and scripts/verify-jathaka.ts pins the deterministic parts
 * (dig bala, paksha, ayana, nathonnatha, tribhaga) against the reference
 * 116-page jathakam to the last virupa.
 */
import type { CompleteChartResult, PlanetPosition } from './ephemeris';
import type { SiderealMode, RiseSetTimes } from './astroCore';
import { riseSetForLocalDate, civilWeekdayAt, sankrantiJd } from './astroCore';
import { SAPTAVARGAJA_VIRUPAS, vargaDignity, type VargaDignityId } from './vargaVimsopakaEngine';

export const SEVEN_GRAHAS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'] as const;
export type GrahaId7 = (typeof SEVEN_GRAHAS)[number];

export const GRAHA_NAME_TE: Record<GrahaId7, string> = {
  Sun: 'సూర్యుడు',
  Moon: 'చంద్రుడు',
  Mars: 'కుజుడు',
  Mercury: 'బుధుడు',
  Jupiter: 'గురువు',
  Venus: 'శుక్రుడు',
  Saturn: 'శని',
};

export const GRAHA_GLYPH: Record<GrahaId7, string> = {
  Sun: '☉',
  Moon: '☽',
  Mars: '♂',
  Mercury: '☿',
  Jupiter: '♃',
  Venus: '♀',
  Saturn: '♄',
};

/** BPHS minimum requirement, in virupas (rupa × 60). */
export const REQUIRED_VIRUPAS: Record<GrahaId7, number> = {
  Sun: 390,
  Moon: 360,
  Mars: 300,
  Mercury: 420,
  Jupiter: 390,
  Venus: 330,
  Saturn: 300,
};

const NAISARGIKA: Record<GrahaId7, number> = {
  Sun: 60,
  Moon: 51.43,
  Venus: 42.86,
  Jupiter: 34.29,
  Mercury: 25.71,
  Mars: 17.14,
  Saturn: 8.57,
};

/** Deepest debilitation (Paramaneecha) longitudes, BPHS Ch. 3. */
export const DEBILITATION_POINT: Record<GrahaId7, number> = {
  Sun: 190,
  Moon: 213,
  Mars: 118,
  Mercury: 345,
  Jupiter: 275,
  Venus: 177,
  Saturn: 20,
};

const MEAN_DAILY_MOTION: Record<GrahaId7, number> = {
  Sun: 0.9856,
  Moon: 13.176,
  Mars: 0.524,
  Mercury: 4.092,
  Jupiter: 0.0831,
  Venus: 1.6021,
  Saturn: 0.0334,
};

const MALE_PLANETS: GrahaId7[] = ['Sun', 'Mars', 'Jupiter'];

// ── సప్తవర్గజ బలం — బృహత్ పరాశర హోరా అ.27 ──────────────────────────────────
/** బృహత్ పరాశర సప్తవర్గజ విరూపాలు (వి.పి. జైన్, షడ్బల-భావబల తులన). */
const SAPTAVARGAJA_BALA_VIRUPAS = {
  moolatrikona: 45,
  own: 30,
  adhimitra: 22.5,
  mitra: 15,
  sama: 7.5,
  satru: 3.75,
  adhisatru: 1.875,
} as const;

const OWN_SIGNS_MAP: Record<GrahaId7, number[]> = {
  Sun: [4],
  Moon: [3],
  Mars: [0, 7],
  Mercury: [2, 5],
  Jupiter: [8, 11],
  Venus: [1, 6],
  Saturn: [9, 10],
};

const MOOLATRIKONA_SIGN: Record<GrahaId7, number> = {
  Sun: 4,
  Moon: 1,
  Mars: 0,
  Mercury: 5,
  Jupiter: 8,
  Venus: 6,
  Saturn: 10,
};

const RASI_LORD: GrahaId7[] = [
  'Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury',
  'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter',
];

const NATURAL_FRIEND: Record<GrahaId7, GrahaId7[]> = {
  Sun: ['Moon', 'Mars', 'Jupiter'],
  Moon: ['Sun', 'Mercury'],
  Mars: ['Sun', 'Moon', 'Jupiter'],
  Mercury: ['Sun', 'Venus'],
  Jupiter: ['Sun', 'Moon', 'Mars'],
  Venus: ['Mercury', 'Saturn'],
  Saturn: ['Mercury', 'Venus'],
};

const NATURAL_ENEMY: Record<GrahaId7, GrahaId7[]> = {
  Sun: ['Venus', 'Saturn'],
  Moon: [],
  Mars: ['Mercury'],
  Mercury: ['Moon'],
  Jupiter: ['Mercury', 'Venus'],
  Venus: ['Sun', 'Moon'],
  Saturn: ['Sun', 'Moon', 'Mars'],
};

type CompoundRelation = keyof typeof SAPTAVARGAJA_BALA_VIRUPAS;

/**
 * సంయుక్త (క్షేత్ర + తాత్కాలిక) సంబంధం — బృహత్ పరాశర అ.3.
 * తాత్కాలిక మిత్రులు: 2, 3, 4, 10, 11, 12 వ రాశులలో ఉన్నవారు.
 */
function compoundRelation(id: GrahaId7, other: GrahaId7, signOfId: number, signOfOther: number): CompoundRelation {
  const natural: 'friend' | 'neutral' | 'enemy' = NATURAL_FRIEND[id].includes(other)
    ? 'friend'
    : NATURAL_ENEMY[id].includes(other)
      ? 'enemy'
      : 'neutral';
  const dist = ((signOfOther - signOfId) % 12 + 12) % 12;
  const tempFriend = [1, 2, 3, 9, 10, 11].includes(dist);
  if (natural === 'friend') return tempFriend ? 'adhimitra' : 'sama';
  if (natural === 'enemy') return tempFriend ? 'sama' : 'adhisatru';
  return tempFriend ? 'mitra' : 'satru';
}

function saptavargajaBala(
  id: GrahaId7,
  p: PlanetPosition,
  signOf: (code: (typeof SAPTAVARGA_CODES)[number]) => number,
  d1SignOf: (g: GrahaId7) => number
): number {
  let total = 0;
  for (const code of SAPTAVARGA_CODES) {
    const sign = signOf(code);
    if (code === 'D1' && sign === MOOLATRIKONA_SIGN[id]) {
      total += SAPTAVARGAJA_BALA_VIRUPAS.moolatrikona;
      continue;
    }
    if (OWN_SIGNS_MAP[id].includes(sign)) {
      total += SAPTAVARGAJA_BALA_VIRUPAS.own;
      continue;
    }
    const lord = RASI_LORD[sign];
    total += SAPTAVARGAJA_BALA_VIRUPAS[
      compoundRelation(id, lord, d1SignOf(id), d1SignOf(lord))
    ];
  }
  return total;
}

/* ── వర్ష / మాసాధిపతులు — కలి అహర్గణ (బి.వి. రామన్ షడ్బల పట్టిక) ────────── */
const ABDA_WEEKDAY_ORDER: GrahaId7[] = ['Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Sun', 'Moon'];

function daysElapsedSinceBase(year: number, baseYear = 1951, baseDays = 174): number {
  const totalYears = year - baseYear;
  let leap = 0;
  for (let y = baseYear + 1; y <= year; y++) {
    if ((y % 4 === 0 && y % 100 !== 0) || y % 400 === 0) leap++;
  }
  return baseDays + leap * 366 + (totalYears - leap) * 365;
}

function aharganaOf(dateISO: string): number {
  const [y, m, d] = dateISO.split('-').map(Number);
  const doy = Math.floor((Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 1)) / 86400000) + 1;
  return daysElapsedSinceBase(y - 1) + doy;
}

const FEMALE_PLANETS: GrahaId7[] = ['Moon', 'Venus'];
/** Diurnal (day-strong) grahas — BPHS nathonnatha bala. */
const DIURNAL: GrahaId7[] = ['Sun', 'Jupiter', 'Venus'];

/** House from which each graha is directionally strongest. */
const DIG_STRONG_HOUSE: Record<GrahaId7, 1 | 4 | 7 | 10> = {
  Sun: 10,
  Mars: 10,
  Moon: 4,
  Venus: 4,
  Mercury: 1,
  Jupiter: 1,
  Saturn: 7,
};

const SAPTAVARGA_CODES = ['D1', 'D2', 'D3', 'D7', 'D9', 'D12', 'D30'] as const;

const WEEKDAY_LORD = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'] as const;
/** Hora (planetary hour) cycle, counted from the day lord. */
const HORA_CYCLE: GrahaId7[] = ['Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars'];

/**
 * హోరాధిపతి — జన్మదినాధిపతి మొదటి హోరకు, ఆ తర్వాత ప్రతి హోరకు కల్డియన్
 * (శీఘ్ర క్రమ) చక్రంలో ఒక మెట్టు. ఈ నియమం రెండు శాస్త్రీయ నిర్బంధాలను
 * తప్పనిసరిగా నిలబెడుతుంది, అవే ఇక్కడ తనిఖీ చేయబడతాయి:
 *   1. సూర్యోదయ హోర (slot 0) ఎప్పుడూ ఆ వారపు దినాధిపతిదే;
 *   2. 24 హోరల తర్వాత (slot 24 ≡ 0, మరుసటి సూర్యోదయం) అధిపతి
 *      మరుసటి వారపు దినాధిపతి — అందుకే 7 మెట్ల చక్రంలో 24 ≡ 3.
 */
export function horaLordFor(weekdayIndex: number, horaSlot: number): GrahaId7 {
  const dina = WEEKDAY_LORD[((weekdayIndex % 7) + 7) % 7];
  const step = ((horaSlot % 7) + 7) % 7;
  return HORA_CYCLE[(HORA_CYCLE.indexOf(dina) + step) % 7];
}

/** Parashara rasi drishti: which planets see which houses (1st = own sign). */
function rasiDrishtiHouses(id: string): number[] {
  if (id === 'Mars') return [4, 7, 8];
  if (id === 'Jupiter') return [5, 7, 9];
  if (id === 'Saturn') return [3, 7, 10];
  return [7];
}

/**
 * Sphuta Drishti (BPHS Ch. 26 / B.V. Raman) — the graded aspect a graha casts,
 * in virupas (0–60), as a function of the aspect angle `a` (0–360).
 * Mars, Jupiter and Saturn additionally get their special full aspects.
 */
export function sputaDrishti(aspectingId: string, aspectAngle: number): number {
  const a = norm360(aspectAngle);
  if (a < 30 || a >= 300) return 0;
  if (a < 60) {
    if (aspectingId === 'Saturn') return (a - 30) * 2;
    return (a - 30) / 2;
  }
  if (a < 90) {
    if (aspectingId === 'Saturn') return 45 + (90 - a) / 2;
    return a - 45;
  }
  if (a < 120) {
    if (aspectingId === 'Mars' || aspectingId === 'Jupiter') return 45 + (a - 90) / 2;
    return 30 + (120 - a) / 2;
  }
  if (a < 150) {
    if (aspectingId === 'Mars' || aspectingId === 'Jupiter') return 2 * (150 - a);
    return 150 - a;
  }
  if (a < 180) return (a - 150) * 2;
  if (a < 210) {
    if (aspectingId === 'Mars') return 60;
    return (300 - a) / 2;
  }
  return (300 - a) / 2;
}

/**
 * దృక్ బలం — పారాశర స్ఫుట దృష్టి (బృహత్ పరాశర అ.26), విరూపాలలో.
 * ఇది వి.పి. జైన్ "షడ్బల-భావబల" పట్టికలోని శుభ/పాప దృష్టి బిందువుల క్రమం:
 * 30°–60° = 0.5×(దూరం−30), 60°–90° = దూరం−45, 90°–120° = 30+0.5×(120−దూరం),
 * 120°–150° = 150−దూరం, 150°–180° = 2×(దూరం−150), 180°–300° = 0.5×(300−దూరం).
 * శని (60–90, 270–300), కుజుడు (90–120, 210–240), గురువు (120–150, 240–270)
 * ప్రత్యేక దృష్టులు విశేష బిందువులు పొందుతాయి.
 */
export function drikBalaVirupas(aspectingId: GrahaId7, aspectAngle: number): number {
  const a = norm360(aspectAngle);
  if (a < 30) return 0;
  if (a < 60) return 0.5 * (a - 30);
  if (a < 90) return a - 45 + (aspectingId === 'Saturn' ? 45 : 0);
  if (a < 120) return 30 + 0.5 * (120 - a) + (aspectingId === 'Mars' ? 15 : 0);
  if (a < 150) return 150 - a + (aspectingId === 'Jupiter' ? 30 : 0);
  if (a < 180) return 2 * (a - 150);
  if (a < 300) {
    const extra =
      (aspectingId === 'Mars' && a >= 210 && a < 240) ? 15 :
      (aspectingId === 'Jupiter' && a >= 240 && a < 270) ? 30 :
      (aspectingId === 'Saturn' && a >= 270 && a < 300) ? 45 : 0;
    return 0.5 * (300 - a) + extra;
  }
  return 0;
}

export interface ShadbalaComponentTe {
  key: string;
  nameTe: string;
  virupas: number;
  noteTe: string;
}

export interface ShadbalaRow {
  id: GrahaId7;
  nameTe: string;
  glyph: string;
  sthana: ShadbalaComponentTe[];
  sthanaTotal: number;
  dig: number;
  kala: ShadbalaComponentTe[];
  kalaTotal: number;
  cheshta: number;
  cheshtaKindTe: string;
  naisargika: number;
  drik: number;
  drikNotesTe: string[];
  totalVirupas: number;
  totalRupas: number;
  requiredVirupas: number;
  ratioPercent: number;
  rank: number;
  ishtaPhala: number;
  kashtaPhala: number;
  verdictTe: string;
}

export interface BhavaBalaRow {
  house: number;
  rasiTe: string;
  lordTe: string;
  lordId: GrahaId7;
  adhipatiVirupas: number;
  drishtiVirupas: number;
  totalVirupas: number;
  rank: number;
  verdictTe: string;
}

export interface ShadbalaDeepReport {
  rows: ShadbalaRow[];
  bhavaBala: BhavaBalaRow[];
  sunriseISO: string;
  sunsetISO: string;
  hora: { index: number; lordTe: string; lordId: GrahaId7 };
  dinaLordTe: string;
  masa: { lordId: GrahaId7; lordTe: string; startISO: string };
  varsha: { lordId: GrahaId7; lordTe: string; startISO: string };
  paksha: { elongDeg: number; pakshaBala: number; isShukla: boolean };
  /** ఈ జాతకంలో శుభులుగా పరిగణించబడిన గ్రహాలు (బుధుని సహవాసం ప్రకారం మారుతుంది). */
  benefics: GrahaId7[];
  malefics: GrahaId7[];
  methodNoteTe: string;
}

const norm360 = (x: number) => ((x % 360) + 360) % 360;
const angDiff = (a: number, b: number) => {
  const d = Math.abs(norm360(a) - norm360(b)) % 360;
  return d > 180 ? 360 - d : d;
};

const fmtDate = (jd: number, tz: number) => {
  const d = new Date((jd - 2440587.5) * 86400000 + tz * 3600000);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(
    d.getUTCDate()
  ).padStart(2, '0')}`;
};

function vargaSignOf(p: PlanetPosition, code: (typeof SAPTAVARGA_CODES)[number]): number {
  switch (code) {
    case 'D1':
      return p.d1Sign;
    case 'D2':
      return p.d2Sign;
    case 'D3':
      return p.d3Sign;
    case 'D7':
      return p.d7Sign;
    case 'D9':
      return p.d9Sign;
    case 'D12':
      return p.d12Sign;
    default:
      return p.d30Sign;
  }
}

/**
 * అయన బలం — బృహత్ పరాశర అ.27 (క్రాంతి బలం).
 *
 *   క్రాంతి = క్రాంతి-భుజ (సాయన రేఖాంశాన్ని 0–90°కు మడిచిన కోణం) నుంచి
 *   శాస్త్రీయ క్రాంతి పట్టిక — 0°, 15°, 30°, 45°, 60°, 75°, 90° భుజలకు
 *   0, 6°02′, 11°43′, 16°42′, 20°38′, 23°08′, 24°00′ — లాగ్రాంజ్
 *   ఇంటర్పొలేషన్‌తో.
 *
 *   అయన బలం = (24 + సంజ్ఞా × క్రాంతి) × 1.25     … 0–60 విరూపాలు
 *
 *   సంజ్ఞ: చంద్రుడు, శని — దక్షిణ క్రాంతిలో బలం (+, −); సూర్యుడు, కుజుడు,
 *   గురువు, శుక్రుడు — ఉత్తర క్రాంతిలో బలం; బుధుడు ఎల్లప్పుడూ ధన సంజ్ఞ.
 *
 * పట్టిక ఉపయోగించకుండా మూడు సరళ ఖండాలతో అంచనా వేసిన పాత పద్ధతి రెండు
 * పాఠ్యపుస్తకాలలోనూ 2 విరూపాల వరకు జారిపోయేది; ఇప్పుడు పట్టికతో
 * వి.పి. జైన్, బి.వి. రామన్ పట్టికలతో 0.3 విరూపా లోపు కలుస్తుంది.
 */
const KRANTI_BHUJA = [0, 15, 30, 45, 60, 75, 90];
const KRANTI_DEG = [0, 362 / 60, 703 / 60, 1002 / 60, 1238 / 60, 1388 / 60, 1440 / 60];

/** లాగ్రాంజ్ ఇంటర్పొలేషన్ — ఏడు బిందువుల క్రాంతి పట్టిక నుంచి. */
function lagrange(xs: number[], ys: number[], x: number): number {
  let out = 0;
  for (let i = 0; i < xs.length; i++) {
    let term = ys[i];
    for (let j = 0; j < xs.length; j++) {
      if (j !== i) term *= (x - xs[j]) / (xs[i] - xs[j]);
    }
    out += term;
  }
  return out;
}

function ayanaBala(tropicalLon: number, group: 'ns' | 'smjv' | 'mercury'): number {
  const lon = norm360(tropicalLon);
  let bhuja = lon;
  if (bhuja > 90 && bhuja < 180) bhuja = 180 - bhuja;
  else if (bhuja > 180 && bhuja < 270) bhuja = bhuja - 180;
  else if (bhuja >= 270) bhuja = 360 - bhuja;
  let sign: number;
  if (group === 'mercury') sign = 1;
  else if (group === 'ns') sign = lon < 180 ? -1 : 1;
  else sign = lon < 180 ? 1 : -1;
  const kranti = lagrange(KRANTI_BHUJA, KRANTI_DEG, bhuja);
  return (24 + sign * kranti) * 1.25;
}

/**
 * సగటు (మధ్యమ) సాయన దీర్ఘతలు — JPL J2000 సగటు కక్ష్యాంశాలు (deg, deg/శతాబ్దం).
 * చేష్టా-కేంద్రానికి "మధ్యమ గ్రహం" ఇక్కడి నుంచే తీసుకోబడుతుంది; ఇది ఖగోళ
 * మధ్యమ స్థానం (Kepler mean longitude) కాబట్టి 100 సంవత్సరాలలో 0.1° లోపు
 * కచ్చితం — చేష్టా బలంలో అది 0.03 వి. కంటే తక్కువ భేదం.
 */
const MEAN_LONGITUDE_J2000: Record<string, { l0: number; ratePerCentury: number }> = {
  Earth: { l0: 100.46457166, ratePerCentury: 35999.37244981 },
  Mercury: { l0: 252.250906, ratePerCentury: 149472.6746358 },
  Venus: { l0: 181.979801, ratePerCentury: 58517.815676 } ,
  Mars: { l0: 355.43299958, ratePerCentury: 19140.30268499 },
  Jupiter: { l0: 34.35151874, ratePerCentury: 3034.74612775 },
  Saturn: { l0: 50.0774443, ratePerCentury: 1222.49362201 },
};

function meanLongitude(key: keyof typeof MEAN_LONGITUDE_J2000, jd: number): number {
  const e = MEAN_LONGITUDE_J2000[key];
  const T = (jd - 2451545.0) / 36525;
  return norm360(e.l0 + e.ratePerCentury * T);
}

/**
 * చేష్టా బలం — బృహత్ పరాశర హోరా అధ్యాయం 27.
 *
 *   చేష్టా కేంద్రం = |శీఘ్రోచ్చ − (స్ఫుట + మధ్యమ) ÷ 2|
 *   చేష్టా బలం     = కేంద్రం ÷ 3        (గరిష్ఠం 60 విరూపాలు)
 *
 * బాహ్య గ్రహాలకు శీఘ్రోచ్చ = సూర్యుని మధ్యమ స్థానం, మధ్యమం = గ్రహపు
 * సగటు స్థానం; బుధ/శుక్రులకు (అంతర్ గ్రహాలు) ఇవి రెండూ తారుమారవుతాయి —
 * ఇదే సూర్య సిద్ధాంత సంప్రదాయం.  కేంద్రం 180° చిన్న చాపం తీసుకోవడం వల్ల
 * బలం ఎప్పుడూ 0–60 మధ్య ఉంటుంది (శాస్త్రీయ గరిష్ఠం).
 */
export function cheshtaBala(
  id: GrahaId7,
  siderealLon: number,
  ayanamsaDeg: number,
  jd: number
): { virupas: number; kendra: number; kindTe: string } {
  const trueTropical = norm360(siderealLon + ayanamsaDeg);
  const sunMean = norm360(meanLongitude('Earth', jd) + 180);
  const inner = id === 'Mercury' || id === 'Venus';
  const planetMean = meanLongitude(id as keyof typeof MEAN_LONGITUDE_J2000, jd);
  const meanGeo = inner ? sunMean : planetMean;
  const sighra = inner ? planetMean : sunMean;

  const average = 0.5 * (trueTropical + meanGeo);
  const raw = Math.abs(norm360(sighra - average));
  const kendra = raw > 180 ? 360 - raw : raw;
  const virupas = Math.min(60, kendra / 3);

  return {
    virupas,
    kendra,
    kindTe: `చేష్టా కేంద్రం ${kendra.toFixed(1)}° (శీఘ్రోచ్చ ${sighra.toFixed(1)}°, మధ్యమం ${meanGeo.toFixed(1)}°) ÷ 3`,
  };
}

export function computeShadbalaDeep(
  chart: CompleteChartResult,
  siderealMode: SiderealMode = 'lahiri'
): ShadbalaDeepReport {
  const tz = chart.input.tzOffsetHours;
  const birthJd = chart.julianDay;
  const planets = new Map(chart.planets.map((p) => [p.id, p]));
  const sun = planets.get('Sun')!;
  const moon = planets.get('Moon')!;

  const rise: RiseSetTimes = riseSetForLocalDate(chart.input.date, chart.input.lat, chart.input.lng, tz);
  const sunriseJd = rise.sunriseJd ?? birthJd - 0.25;
  const sunsetJd = rise.sunsetJd ?? birthJd + 0.25;

  // ── Paksha bala ────────────────────────────────────────────────────────
  const elong = norm360(moon.siderealLon - sun.siderealLon);
  const pakshaAngle = elong > 180 ? 360 - elong : elong;
  const pakshaBala = pakshaAngle / 3;
  const isShukla = elong < 180;

  // ── శుభ / పాప గ్రహాలు — బృహత్ పరాశర అ.3 + పి.వి.ఆర్. సమన్వయం ────────────
  // గురు, శుక్రులు నిత్య శుభులు; శుక్ల చంద్రుడు శుభుడు; బుధుడు ఒంటరిగా లేదా
  // ఎక్కువ శుభుల మధ్య ఉంటే శుభుడు, పాపుల సహవాసం ఎక్కువైతే పాపుడు.
  const naturalMalefics: GrahaId7[] = ['Sun', 'Mars', 'Saturn'];
  const naturalBenefics: GrahaId7[] = ['Jupiter', 'Venus'];
  if (isShukla) naturalBenefics.push('Moon');
  else naturalMalefics.push('Moon');
  const mercurySign = planets.get('Mercury')!.d1Sign;
  const maleficCompany = naturalMalefics.filter((g) => planets.get(g)!.d1Sign === mercurySign).length;
  const beneficCompany = naturalBenefics.filter((g) => planets.get(g)!.d1Sign === mercurySign).length;
  if (maleficCompany > beneficCompany) naturalMalefics.push('Mercury');
  else naturalBenefics.push('Mercury');
  const isBeneficGraha = (g: GrahaId7) => naturalBenefics.includes(g);

  // ── వారము (sunrise-to-sunrise) ────────────────────────────────────────
  // హిందూ పంచాంగంలో వారము సూర్యోదయమున మారుతుంది.  సూర్యోదయానికి ముందు పుట్టిన
  // జాతకానికి ఆ రోజు కాదు, ముందు రోజు వారాధిపతియే దిన బలానికి మూలం — ఇది
  // పంచాంగంలో చూపే వారంతో తప్పనిసరిగా ఏకీభవించాలి.
  const civilDate = chart.input.date;
  const shiftDate = (iso: string, delta: number) => {
    const [y, m, d] = iso.split('-').map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    dt.setUTCDate(dt.getUTCDate() + delta);
    return dt.toISOString().slice(0, 10);
  };
  const riseOf = (iso: string) => {
    const r = riseSetForLocalDate(iso, chart.input.lat, chart.input.lng, tz);
    return { sunrise: r.sunriseJd ?? null, sunset: r.sunsetJd ?? null };
  };
  const today = riseOf(civilDate);
  const s0 = today.sunrise ?? birthJd - 0.25;
  const isAfterSunrise = birthJd >= s0;
  const hinduDayStart = isAfterSunrise ? s0 : (riseOf(shiftDate(civilDate, -1)).sunrise ?? s0 - 1);
  const hinduDayEnd = isAfterSunrise
    ? (today.sunset ?? s0 + 0.5)
    : (riseOf(shiftDate(civilDate, -1)).sunset ?? s0 - 0.5);
  const hinduNightEnd = isAfterSunrise
    ? (riseOf(shiftDate(civilDate, 1)).sunrise ?? hinduDayEnd + 0.5)
    : s0;
  const dayLength = Math.max(0.1, hinduDayEnd - hinduDayStart);
  const nightLength = Math.max(0.1, hinduNightEnd - hinduDayEnd);
  const isDay = birthJd < hinduDayEnd;

  // ── Tribhaga bala — పగలు/రాత్రి మూడో భాగాధిపతి ────────────────────────
  const tribhagaLord: GrahaId7 = isDay
    ? (['Mercury', 'Sun', 'Saturn'] as GrahaId7[])[
        Math.min(2, Math.max(0, Math.floor(((birthJd - hinduDayStart) / dayLength) * 3)))
      ]
    : (['Moon', 'Venus', 'Mars'] as GrahaId7[])[
        Math.min(2, Math.max(0, Math.floor(((birthJd - hinduDayEnd) / nightLength) * 3)))
      ];

  // ── దిన / హోర అధిపతులు ────────────────────────────────────────────────
  const weekday = civilWeekdayAt(hinduDayStart, tz); // 0 = Sunday
  const dinaLord = WEEKDAY_LORD[weekday];
  // హోర = ఋతు హోర (పగటి పొదుపు/12, రాత్రి పొడవు/12) — నిరంతర 60 నిమిషాల కాదు.
  const horaSlot = isDay
    ? Math.floor((birthJd - hinduDayStart) / (dayLength / 12))
    : 12 + Math.floor((birthJd - hinduDayEnd) / (nightLength / 12));
  const horaIndex = Math.min(23, Math.max(0, horaSlot)) + 1;
  const horaLord = horaLordFor(weekday, horaSlot);

  // ── Masa / Varsha lords (solar sankranti weekday lords) ───────────────
  // బృహత్ పరాశర అ.27 — వర్ష/మాసాధిపతులు కలి అహర్గణ నుంచి (బి.వి. రామన్
  // షడ్బల పట్టిక-I): సంవత్సరాధిపతి 360-రోజుల చక్రానికి, మాసాధిపతి 30-రోజుల
  // చక్రానికి, మంగళవారాది క్రమంలో.
  const ahargana = aharganaOf(chart.input.date);
  const varshaLord = ABDA_WEEKDAY_ORDER[((Math.floor(ahargana / 360) * 3 + 1) % 7 + 7) % 7];
  const masaLord = ABDA_WEEKDAY_ORDER[((Math.floor(ahargana / 30) * 2 + 1) % 7 + 7) % 7];
  const shiftIso = (iso: string, backDays: number) => {
    const [y, m, d] = iso.split('-').map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    dt.setUTCDate(dt.getUTCDate() - backDays);
    return dt.toISOString().slice(0, 10);
  };
  const varshaStartISO = shiftIso(chart.input.date, ((ahargana % 360) + 360) % 360);
  const masaStartISO = shiftIso(chart.input.date, ((ahargana % 30) + 30) % 30);

  const asc = chart.ascendant.siderealLon;
  const mc = chart.midheaven.siderealLon;
  const weakPoint: Record<GrahaId7, number> = {
    Sun: norm360(mc + 180),
    Mars: norm360(mc + 180),
    Moon: mc,
    Venus: mc,
    Mercury: norm360(asc + 180),
    Jupiter: norm360(asc + 180),
    Saturn: asc,
  };

  const rows: ShadbalaRow[] = SEVEN_GRAHAS.map((id) => {
    const p = planets.get(id)!;
    const lon = p.siderealLon;

    // 1) Sthana bala
    const uchchaArc = angDiff(lon, DEBILITATION_POINT[id]);
    const uchcha = uchchaArc / 3;
    const d1SignOf = (g: GrahaId7) => planets.get(g)!.d1Sign;
    const saptavarga = saptavargajaBala(id, p, (code) => vargaSignOf(p, code), d1SignOf);

    const isFemale = FEMALE_PLANETS.includes(id);
    const ojhaRasi = (p.d1Sign % 2 === 1) === isFemale ? 15 : 0;
    const ojhaNavamsa = (p.d9Sign % 2 === 1) === isFemale ? 15 : 0;
    const ojha = ojhaRasi + ojhaNavamsa;

    const house = p.house;
    const kendradi = [1, 4, 7, 10].includes(house) ? 60 : [2, 5, 8, 11].includes(house) ? 30 : 15;

    const drekPart = Math.floor(p.degreeInSign / 10);
    // ద్రేక్కాణ బలం: 1వ ద్రేక్కాణ పురుషులు (సూర్యుడు, కుజుడు, గురువు),
    // 2వ నపుంసకులు (బుధుడు, శని), 3వ స్త్రీలు (చంద్రుడు, శుక్రుడు).
    const drekkana =
      (MALE_PLANETS.includes(id) && drekPart === 0) ||
      ((id === 'Mercury' || id === 'Saturn') && drekPart === 1) ||
      (FEMALE_PLANETS.includes(id) && drekPart === 2)
        ? 15
        : 0;

    const sthana: ShadbalaComponentTe[] = [
      { key: 'uchcha', nameTe: 'ఉచ్చ బలం', virupas: uchcha, noteTe: 'నీచ స్థానం నుంచి దూరం ÷ 3' },
      {
        key: 'saptavargaja',
        nameTe: 'సప్తవర్గజ బలం',
        virupas: saptavarga,
        noteTe: 'D1·D2·D3·D7·D9·D12·D30 — మూలత్రికోణ 45, స్వక్షేత్ర 30, అధిమిత్ర 22.5, మిత్ర 15, సమ 7.5, శత్రు 3.75, అధిశత్రు 1.875',
      },
      { key: 'ojha', nameTe: 'ఓజయుగ్మ బలం', virupas: ojha, noteTe: 'రాశి/నవాంశ సరి-బేసి స్థితి (15+15)' },
      { key: 'kendradi', nameTe: 'కేంద్రాది బలం', virupas: kendradi, noteTe: 'కేంద్రం 60, పణఫర 30, ఆపోక్లిమ 15' },
      { key: 'drekkana', nameTe: 'ద్రేక్కాణ బలం', virupas: drekkana, noteTe: 'పురుష/స్త్రీ/నపుంసక ద్రేక్కాణ 15' },
    ];
    const sthanaTotal = sthana.reduce((a, b) => a + b.virupas, 0);

    // 2) Dig bala
    const dig = angDiff(lon, weakPoint[id]) / 3;

    // 3) Kala bala
    // పక్ష బలం: చంద్రుడు, బుధుడు, గురువు, శుక్రుడు — నిత్య శుభులు (బృహత్ పరాశర
    // హోరా అ.27).  చంద్రుడిని కృష్ణ పక్షంలో పాపుడిగా మార్చడం తప్పు; ఆయనకు
    // కృష్ణ పక్షంలో బలం తగ్గుతుంది, కానీ "60 − పక్ష బలం" సూత్రం వర్తించదు.
    const isBenefic = isBeneficGraha(id);
    // బృహత్ పరాశర అ.27: చంద్రుని పక్ష బలం రెట్టింపు (పక్షానికి మూలమే చంద్రుడు).
    const paksha = (isBenefic ? pakshaBala : 60 - pakshaBala) * (id === 'Moon' ? 2 : 1);
    const group: 'ns' | 'smjv' | 'mercury' =
      id === 'Moon' || id === 'Saturn' ? 'ns' : id === 'Mercury' ? 'mercury' : 'smjv';
    // బృహత్ పరాశర అ.27: సూర్యుని అయన బలం రెట్టింపు.
    const ayana = ayanaBala(lon + chart.ayanamsaDeg, group) * (id === 'Sun' ? 2 : 1);

    // JD starts at 12:00 UT, so shift by 0.5 to get local civil hours.
    const localHours = ((birthJd + 0.5 + tz / 24) % 1) * 24;
    const noonDistance = Math.min(Math.abs(localHours - 12), 12) / 12;
    const nathonnatha =
      id === 'Mercury' ? 60 : DIURNAL.includes(id) ? 60 * (1 - noonDistance) : 60 * noonDistance;

    const tribhaga = id === 'Jupiter' || id === tribhagaLord ? 60 : 0;

    const vmdh =
      (id === varshaLord ? 15 : 0) +
      (id === masaLord ? 30 : 0) +
      (id === dinaLord ? 45 : 0) +
      (id === horaLord ? 60 : 0);

    const kala: ShadbalaComponentTe[] = [
      { key: 'nathonnatha', nameTe: 'నతోన్నత బలం', virupas: nathonnatha, noteTe: 'స్థానిక అర్ధరాత్రి నుంచి కాలం' },
      { key: 'paksha', nameTe: 'పక్ష బలం', virupas: paksha, noteTe: isBenefic ? 'శుభ గ్రహం — చంద్ర-సూర్య కోణం ÷ 3' : 'పాప గ్రహం — 60 − పక్ష బలం' },
      { key: 'tribhaga', nameTe: 'త్రిభాగ బలం', virupas: tribhaga, noteTe: 'దిన/రాత్రి మూడో భాగాధిపతి; గురువుకు ఎల్లప్పుడూ 60' },
      { key: 'varsha', nameTe: 'వర్ష బలం', virupas: id === varshaLord ? 15 : 0, noteTe: 'సంవత్సరాధిపతి 15' },
      { key: 'masa', nameTe: 'మాస బలం', virupas: id === masaLord ? 30 : 0, noteTe: 'మాసాధిపతి 30' },
      { key: 'dina', nameTe: 'దిన బలం', virupas: id === dinaLord ? 45 : 0, noteTe: 'వారాధిపతి 45' },
      { key: 'hora', nameTe: 'హోరా బలం', virupas: id === horaLord ? 60 : 0, noteTe: 'హోరాధిపతి 60' },
      { key: 'ayana', nameTe: 'అయన బలం', virupas: ayana, noteTe: 'పరాశర ఖండ పద్ధతి (త్రోపికల్ అక్షాంశం)' },
    ];
    const kalaTotal = kala.reduce((a, b) => a + b.virupas, 0);

    // 4) Cheshta bala
    let cheshta = 0;
    let cheshtaKindTe = '';
    if (id === 'Sun' || id === 'Moon') {
      // బృహత్ పరాశర అ.27లో సూర్యుని చేష్ట = అయన బలం, చంద్రుని చేష్ట = పక్ష
      // బలం అని ఒక పాఠం ఉంది.  కానీ ఆ రెండూ కాల బలంలో ఇప్పటికే లెక్కించబడతాయి
      // (సూర్యునికి అయన, చంద్రునికి పక్ష); మళ్లీ చేష్టలో కలిపితే రెట్టింపు అవుతుంది.
      // వి.పి. జైన్ షడ్బల పట్టిక, బి.వి. రామన్ పద్ధతి — సూర్య/చంద్రుల చేష్ట 0.
      cheshta = 0;
      cheshtaKindTe =
        id === 'Sun'
          ? 'సూర్యుని చలన బలం అయన బలంగానే కాల బలంలో లెక్కించబడింది — పునరుక్తి తప్పించి 0'
          : 'చంద్రుని చలన బలం పక్ష బలంగానే కాల బలంలో లెక్కించబడింది — పునరుక్తి తప్పించి 0';
    } else {
      const c = cheshtaBala(id, lon, chart.ayanamsaDeg, birthJd);
      cheshta = c.virupas;
      cheshtaKindTe = p.isRetrograde
        ? `వక్ర గతి — ${c.kindTe}`
        : c.kindTe;
    }

    // 5) Naisargika
    const naisargika = NAISARGIKA[id];

    // 6) Drik bala — one fourth of the net Parashara rasi drishti received
    const notes: string[] = [];
    let beneficAspect = 0;
    let maleficAspect = 0;
    for (const other of SEVEN_GRAHAS) {
      if (other === id) continue;
      const o = planets.get(other)!;
      const angle = norm360(lon - o.siderealLon);
      const virupas = drikBalaVirupas(other, angle);
      if (virupas <= 0) continue;
      const benefic = isBeneficGraha(other);
      if (benefic) beneficAspect += virupas;
      else maleficAspect += virupas;
      notes.push(
        `${GRAHA_NAME_TE[other]} నుంచి ${angle.toFixed(1)}° స్ఫుట దృష్టి — ${
          benefic ? 'శుభ' : 'పాప'
        } ${virupas.toFixed(1)} వి.`
      );
    }
    const drik = (beneficAspect - maleficAspect) / 4;

    const totalVirupas = sthanaTotal + dig + kalaTotal + cheshta + naisargika + drik;
    const totalRupas = totalVirupas / 60;
    const required = REQUIRED_VIRUPAS[id];
    const ratioPercent = (totalVirupas / required) * 100;

    const ishta = Math.sqrt(Math.max(0, uchcha) * Math.max(0, cheshta));
    const kashta = Math.sqrt(Math.max(0, 60 - uchcha) * Math.max(0, 60 - cheshta));

    return {
      id,
      nameTe: GRAHA_NAME_TE[id],
      glyph: GRAHA_GLYPH[id],
      sthana,
      sthanaTotal,
      dig,
      kala,
      kalaTotal,
      cheshta,
      cheshtaKindTe,
      naisargika,
      drik,
      drikNotesTe: notes,
      totalVirupas,
      totalRupas,
      requiredVirupas: required,
      ratioPercent,
      rank: 0,
      ishtaPhala: ishta,
      kashtaPhala: kashta,
      verdictTe:
        ratioPercent >= 110
          ? 'అత్యుత్తమ బలం — ఫలాలు పూర్తిగా ఇస్తుంది'
          : ratioPercent >= 100
            ? 'పూర్తి బలం — శాస్త్రీయ ప్రమాణం చేరింది'
            : ratioPercent >= 85
              ? 'మధ్యమ బలం — అనుకూల దశలో ఫలితం'
              : 'బలహీనం — ఉపాయం/పరిహారం అవసరం',
    };
  });

  const sorted = [...rows].sort((a, b) => b.totalVirupas - a.totalVirupas);
  sorted.forEach((r, i) => {
    const target = rows.find((x) => x.id === r.id)!;
    target.rank = i + 1;
  });

  // ── Bhava bala ─────────────────────────────────────────────────────────
  const bhavaBala: BhavaBalaRow[] = chart.houses.map((h) => {
    const lordId = (Object.entries(
      { Mars: [0, 7], Venus: [1, 6], Mercury: [2, 5], Moon: [3], Sun: [4], Jupiter: [8, 11], Saturn: [9, 10] }
    ).find(([, signs]) => (signs as number[]).includes(h.signIndex))?.[0] ?? 'Sun') as GrahaId7;
    const lordRow = rows.find((r) => r.id === lordId)!;
    const cuspMid = norm360(h.siderealCusp + 15);
    let drishti = 0;
    for (const g of SEVEN_GRAHAS) {
      const o = planets.get(g)!;
      const virupas = sputaDrishti(g, norm360(cuspMid - o.siderealLon));
      if (virupas <= 0) continue;
      const benefic =
        ['Jupiter', 'Venus'].includes(g) || (g === 'Moon' && isShukla) || g === 'Mercury';
      drishti += benefic ? virupas / 4 : -virupas / 4;
    }
    const totalVirupas = lordRow.totalVirupas + drishti;
    return {
      house: h.house,
      rasiTe: h.signName,
      lordTe: GRAHA_NAME_TE[lordId],
      lordId,
      adhipatiVirupas: lordRow.totalVirupas,
      drishtiVirupas: drishti,
      totalVirupas,
      rank: 0,
      verdictTe:
        totalVirupas >= 400
          ? 'బలమైన భావం — సహజ సిద్ధి'
          : totalVirupas >= 300
            ? 'మధ్యమ భావం'
            : 'బలహీన భావం — భావాధిపతి ఉపాయం అవసరం',
    };
  });
  [...bhavaBala]
    .sort((a, b) => b.totalVirupas - a.totalVirupas)
    .forEach((r, i) => {
      bhavaBala.find((x) => x.house === r.house)!.rank = i + 1;
    });

  return {
    rows,
    bhavaBala,
    sunriseISO: fmtDate(sunriseJd, tz),
    sunsetISO: fmtDate(sunsetJd, tz),
    hora: { index: horaIndex, lordTe: GRAHA_NAME_TE[horaLord], lordId: horaLord },
    dinaLordTe: GRAHA_NAME_TE[dinaLord],
    masa: { lordId: masaLord, lordTe: GRAHA_NAME_TE[masaLord], startISO: masaStartISO },
    varsha: {
      lordId: varshaLord,
      lordTe: GRAHA_NAME_TE[varshaLord],
      startISO: varshaStartISO,
    },
    paksha: { elongDeg: elong, pakshaBala, isShukla },
    benefics: naturalBenefics,
    malefics: naturalMalefics,
    methodNoteTe:
      'షడ్బలం బృహత్ పరాశర హోరా అధ్యాయం 27 ప్రకారం — 60 విరూపాలు = 1 రూపం. స్థాన బలంలో సప్తవర్గజం D1·D2·D3·D7·D9·D12·D30 సంయుక్త సంబంధాలతో (మూలత్రికోణ 45, స్వ 30, అధిమిత్ర 22.5, మిత్ర 15, సమ 7.5, శత్రు 3.75, అధిశత్రు 1.875). దిగ్ బలం ఆయా గ్రహానికి బలహీన కేంద్రం నుంచి కోణీయ దూరం ÷ 3. కాల బలంలో సూర్యుని అయన బలం, చంద్రుని పక్ష బలం రెట్టింపు (శాస్త్రీయ సూత్రం); వర్ష/మాసాధిపతులు కలి అహర్గణ క్రమంలో. సూర్య/చంద్రుల చేష్టా బలం 0 — వారి చలన బలం అయన/పక్ష బలాలలో ఇప్పటికే ఉంది. తారాగ్రహాల చేష్ట = చేష్టా కేంద్రం ÷ 3 (గరిష్ఠం 60). దృక్ బలం పారాశర స్ఫుట దృష్టి బిందువుల నుంచి, శుభ-పాప భేదంతో ÷ 4.',
  };
}
