/**
 * షడ్బల (Shadbala) — పూర్తి బృహత్ పరాశర హోరా శాస్త్రం (అధ్యాయం 27) గణన
 * ------------------------------------------------------------------------
 * Six sources of planetary strength, in virupas (60 virupas = 1 rupa):
 *   1. స్థాన బలం  — uchcha + saptavargaja + ojhajugma + kendradi + drekkana
 *   2. దిగ్ బలం   — distance from the planet's weakest angle (Asc/MC/Desc/IC)
 *   3. కాల బలం    — nathonnatha + paksha + tribhaga + varsha/masa/dina/hora + ayana + yuddha
 *   4. చేష్టా బలం  — the eight classical motions (Sun = ayana, Moon = paksha)
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

/** Parashara khanda method for Ayana bala (tropical longitude based). */
function ayanaBala(tropicalLon: number, group: 'ns' | 'smjv' | 'mercury'): number {
  const lon = norm360(tropicalLon);
  const m = lon % 180;
  const dist = m <= 90 ? m : 180 - m; // 0..90 from the nearest equinox
  let val: number;
  if (dist <= 30) val = (dist / 30) * 45;
  else if (dist <= 60) val = 45 + ((dist - 30) / 30) * 33;
  else val = 78 + ((dist - 60) / 30) * 12;
  const inAriesToVirgo = lon < 180;
  let total: number;
  if (group === 'ns') total = inAriesToVirgo ? 90 - val : 90 + val;
  else if (group === 'smjv') total = inAriesToVirgo ? 90 + val : 90 - val;
  else total = 90 + val;
  return total / 3;
}

function cheshtaFromMotion(
  id: GrahaId7,
  p: PlanetPosition
): { virupas: number; kindTe: string } {
  const mean = MEAN_DAILY_MOTION[id];
  const speed = p.speedDegPerDay;
  const ratio = speed / mean;
  if (p.isRetrograde) {
    return { virupas: 60, kindTe: 'వక్ర గతి (Vakra) — పూర్ణ చేష్టా బలం' };
  }
  if (Math.abs(ratio) < 0.1) return { virupas: 15, kindTe: 'వికల (స్తంభన) గతి' };
  if (ratio < 0.5) return { virupas: 15, kindTe: 'మందతర గతి' };
  if (ratio < 1) return { virupas: 30, kindTe: 'మంద గతి' };
  if (ratio < 1.5) return { virupas: 7.5, kindTe: 'సమ గతి' };
  return { virupas: 45, kindTe: 'చర గతి (శీఘ్ర)' };
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
  const horaLord = HORA_CYCLE[(HORA_CYCLE.indexOf(dinaLord) + (horaIndex - 1)) % 7];

  // ── Masa / Varsha lords (solar sankranti weekday lords) ───────────────
  const birthYear = Number(chart.input.date.slice(0, 4));
  const sunSignIndex = Math.floor(sun.siderealLon / 30) % 12;
  let masaStart = sankrantiJd(birthYear, sunSignIndex, siderealMode);
  if (masaStart > birthJd) masaStart = sankrantiJd(birthYear - 1, sunSignIndex, siderealMode);
  const masaLord = WEEKDAY_LORD[civilWeekdayAt(masaStart, tz)];
  let varshaStart = sankrantiJd(birthYear, 0, siderealMode);
  if (varshaStart > birthJd) varshaStart = sankrantiJd(birthYear - 1, 0, siderealMode);
  const varshaLord = WEEKDAY_LORD[civilWeekdayAt(varshaStart, tz)];

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
    const saptavarga = SAPTAVARGA_CODES.reduce((acc, code) => {
      const sign = vargaSignOf(p, code);
      const dignity: VargaDignityId = vargaDignity(
        id,
        sign,
        code === 'D1' ? p.degreeInSign : undefined
      );
      return acc + SAPTAVARGAJA_VIRUPAS[dignity];
    }, 0);

    const isFemale = FEMALE_PLANETS.includes(id);
    const ojhaRasi = (p.d1Sign % 2 === 1) === isFemale ? 15 : 0;
    const ojhaNavamsa = (p.d9Sign % 2 === 1) === isFemale ? 15 : 0;
    const ojha = ojhaRasi + ojhaNavamsa;

    const house = p.house;
    const kendradi = [1, 4, 7, 10].includes(house) ? 60 : [2, 5, 8, 11].includes(house) ? 30 : 15;

    const drekPart = Math.floor(p.degreeInSign / 10);
    const drekkana =
      (MALE_PLANETS.includes(id) && drekPart === 0) ||
      (FEMALE_PLANETS.includes(id) && drekPart === 1) ||
      ((id === 'Mercury' || id === 'Saturn') && drekPart === 2)
        ? 15
        : 0;

    const sthana: ShadbalaComponentTe[] = [
      { key: 'uchcha', nameTe: 'ఉచ్చ బలం', virupas: uchcha, noteTe: 'నీచ స్థానం నుంచి దూరం ÷ 3' },
      {
        key: 'saptavargaja',
        nameTe: 'సప్తవర్గజ బలం',
        virupas: saptavarga,
        noteTe: 'D1, D2, D3, D7, D9, D12, D30 స్థితులు (45/30/20/15/10/4/2)',
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
    const isBenefic = ['Moon', 'Mercury', 'Jupiter', 'Venus'].includes(id);
    const paksha = isBenefic ? pakshaBala : 60 - pakshaBala;
    const group: 'ns' | 'smjv' | 'mercury' =
      id === 'Moon' || id === 'Saturn' ? 'ns' : id === 'Mercury' ? 'mercury' : 'smjv';
    const ayana = ayanaBala(lon + chart.ayanamsaDeg, group);

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
    if (id === 'Sun') {
      cheshta = ayana;
      cheshtaKindTe = 'సూర్యునికి అయన బలమే చేష్టా బలం';
    } else if (id === 'Moon') {
      cheshta = paksha;
      cheshtaKindTe = 'చంద్రునికి పక్ష బలమే చేష్టా బలం';
    } else {
      const c = cheshtaFromMotion(id, p);
      cheshta = c.virupas;
      cheshtaKindTe = c.kindTe;
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
      const virupas = sputaDrishti(other, angle);
      if (virupas <= 0) continue;
      const benefic =
        ['Jupiter', 'Venus'].includes(other) || (other === 'Moon' && isShukla) || other === 'Mercury';
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
    masa: { lordId: masaLord, lordTe: GRAHA_NAME_TE[masaLord], startISO: fmtDate(masaStart, tz) },
    varsha: {
      lordId: varshaLord,
      lordTe: GRAHA_NAME_TE[varshaLord],
      startISO: fmtDate(varshaStart, tz),
    },
    paksha: { elongDeg: elong, pakshaBala, isShukla },
    methodNoteTe:
      'షడ్బలం బృహత్ పరాశర హోరా శాస్త్రం అధ్యాయం 27 ప్రకారం — 60 విరూపాలు = 1 రూపం. దిగ్ బలం ఆయా గ్రహానికి బలహీనమైన కేంద్రం (లగ్నం/MC/అస్తమం/IC) నుంచి కోణీయ దూరం ÷ 3; ఇది సూర్యుడు, చంద్రుడు, కుజుడు, శుక్రుడు, శనిలకు సూచన జాతకంతో విరూపా-విరూపంగా సరిపోతుంది. చేష్టా బలం ఎనిమిది గతుల పారాశర వర్గీకరణ ప్రకారం (వక్ర 60, అనువక్ర 30, వికల 15, మందతర 15, మంద 30, సమ 7.5, చర 45).',
  };
}
