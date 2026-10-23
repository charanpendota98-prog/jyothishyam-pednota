/**
 * astroCore.ts — High-precision astronomical primitives for the panchangam / muhurta
 * / vastu layers of AstroSphere.
 *
 * Everything in this module is expressed in Julian Day (UT) and verified against
 * the Swiss Ephemeris 2.10.03 (pyswisseph, FLG_SWIEPH) golden fixtures shipped in
 * `scripts/golden/ephemeris-golden.json` — 30 epochs (1899–2035), max deviation
 * 0.007° (≈24″). Run `npm run verify:astro` to re-check.
 *
 * Sources of the algorithms:
 *  • Planetary positions  : VSOP87 (truncated) + ELP2000 lunar theory via astronomy-engine
 *  • Ecliptic frame       : TRUE ecliptic & equinox of date (precession + nutation applied)
 *  • Lahiri ayanamsa      : Chitrapaksha, calibrated to the Rashtriya Panchang (verified <0.001°)
 *  • Other ayanamsas      : verified against Swiss Ephemeris sidereal modes
 *  • True Chitra          : computed from Spica's true tropical longitude (proper motion +
 *                           aberration + precession), so it drifts correctly with time.
 */

import * as Astronomy from 'astronomy-engine';

export const MS_PER_DAY = 86_400_000;
export const JD_UNIX_EPOCH = 2_440_587.5;
/** Ardra-2 / reference: mean obliquity at J2000 */
export const J2000_OBLIQUITY = 23.4392911111;

/**
 * `'sayana'` = సాయన (ఖగోళ/ట్రాపికల్) చట్రం — అయనాంశం సున్నా. జ్యోతిష ప్రమాణం
 * కాదు (నిరయనమే ప్రమాణం), కానీ వెబ్/యాప్ పంచాంగాలతో పోల్చుకోవడానికి.
 */
export type SiderealMode =
  | 'lahiri'
  | 'sayana'
  | 'raman'
  | 'kp'
  | 'fagan_bradley'
  | 'yukteshwar'
  | 'true_citra'
  | 'pushya';

export interface SiderealModeInfo {
  id: SiderealMode;
  nameTe: string;
  nameEn: string;
  noteTe: string;
  /** J2000 క్షణంలో లహిరి నుండి భేదం (డిగ్రీలు) */
  deltaFromLahiri: number;
  /** శతాబ్దానికి ఆ భేదం ఎంత మారుతుందో (నక్షత్ర స్వకీయ చలనం — చిత్రా, పుష్య) */
  deltaPerCentury: number;
}

/**
 * Offsets verified against Swiss Ephemeris SIDM_* modes at 1950 / 1998 / 2000 / 2026
 * (max deviation < 0.0002° except true_citra which is computed from Spica directly).
 */
export const SIDEREAL_MODES: SiderealModeInfo[] = [
  {
    id: 'lahiri',
    nameTe: 'చిత్రపక్ష (లహిరి) — భారత ప్రామాణికం',
    nameEn: 'Chitrapaksha (Lahiri)',
    noteTe: 'రాష్ట్రీయ పంచాంగ్ ప్రామాణికం; చిత్ర నక్షత్రం 180° అని నిర్ణయించబడింది.',
    deltaFromLahiri: 0,
    deltaPerCentury: 0,
  },
  {
    id: 'raman',
    nameTe: 'బి.వి. రామన్ అయనాంశ',
    nameEn: 'B. V. Raman',
    noteTe: 'డా. బి.వి. రామన్ గ్రంథాల ఆధారిత అయనాంశ.',
    deltaFromLahiri: -1.446303,
    deltaPerCentury: 0,
  },
  {
    id: 'kp',
    nameTe: 'కృష్ణమూర్తి పద్ధతి (KP)',
    nameEn: 'Krishnamurti Paddhati',
    noteTe: 'కే.ఎస్. కృష్ణమూర్తి సుబ్-లార్డ్ పద్ధతికి ప్రామాణిక అయనాంశ.',
    deltaFromLahiri: -0.096854,
    deltaPerCentury: 0,
  },
  {
    id: 'fagan_bradley',
    nameTe: 'ఫాగన్-బ్రాడ్లీ (పాశ్చాత్య సైడెరియల్)',
    nameEn: 'Fagan–Bradley',
    noteTe: 'ఆల్డెబరాన్ 15° వృషభంలో స్థిరపరచబడిన పాశ్చాత్య సైడెరియల్ విధానం.',
    deltaFromLahiri: 0.883206,
    deltaPerCentury: 0,
  },
  {
    id: 'yukteshwar',
    nameTe: 'శ్రీ యుక్తేశ్వర్ అయనాంశ',
    nameEn: 'Sri Yukteshwar',
    noteTe: 'యుగ ప్రక్రియ ఆధారిత అయనాంశ (The Holy Science).',
    deltaFromLahiri: -1.378291,
    deltaPerCentury: 0,
  },
  {
    id: 'true_citra',
    nameTe: 'నిజ చిత్రా (డైనమిక్ స్పైకా)',
    nameEn: 'True Chitra Paksha',
    noteTe: 'చిత్ర (స్పైకా) నక్షత్ర నిజ స్థానం ఆధారంగా ప్రతి క్షణం మారే అయనాంశ.',
    deltaFromLahiri: -0.017096,
    deltaPerCentury: -0.001308,
  },
  {
    id: 'pushya',
    nameTe: 'పుష్య పక్షం',
    nameEn: 'True Pushya',
    noteTe: 'పుష్య (డెల్టా కర్కాటక) నక్షత్రాన్ని 16° కర్కాటకంలో స్థిరపరచిన విధానం.',
    deltaFromLahiri: -1.130015,
    deltaPerCentury: 0.001146,
  },
];

export const SIDEREAL_MODE_BY_ID: Record<string, SiderealModeInfo> = SIDEREAL_MODES.reduce(
  (acc, m) => {
    acc[m.id] = m;
    return acc;
  },
  {} as Record<string, SiderealModeInfo>
);

/* ------------------------------------------------------------------ *
 *  Time helpers
 * ------------------------------------------------------------------ */

export function jdFromMs(ms: number): number {
  return ms / MS_PER_DAY + JD_UNIX_EPOCH;
}

export function msFromJd(jd: number): number {
  return (jd - JD_UNIX_EPOCH) * MS_PER_DAY;
}

export function jdFromDate(date: Date): number {
  return jdFromMs(date.getTime());
}

export function dateFromJd(jd: number): Date {
  return new Date(msFromJd(jd));
}

export function norm360(deg: number): number {
  const m = deg % 360;
  return m < 0 ? m + 360 : m;
}

export function julianCenturies(jd: number): number {
  return (jd - 2451545.0) / 36525;
}

/** Local clock (wall time) epoch-ms of a given civil date+time at a fixed UTC offset. */
export function localMs(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0,
  tzOffsetHours = 5.5
): number {
  return (
    Date.UTC(year, month - 1, day, hour, minute, second) - tzOffsetHours * 3_600_000
  );
}

/** Parse "YYYY-MM-DD" + tz offset into the JD of local midnight. */
export function localMidnightJd(dateISO: string, tzOffsetHours: number): number {
  // "2026-10-23T00:00:00+05:30" లాంటి పూర్తి ISO వచ్చినా మొదటి 10 అక్షరాలే తీసుకోవాలి —
  // లేకపోతే మూడో భాగం "23T00:00:00+05:30" అయ్యి NaN ఏర్పడి ఖగోళ గణన క్రాష్ అవుతుంది.
  const [y, m, d] = dateISO.slice(0, 10).split('-').map(Number);
  return jdFromMs(localMs(y, m, d, 0, 0, 0, tzOffsetHours));
}

/** Convert JD(UT) to a "YYYY-MM-DD" civil date string at the given tz offset. */
export function civilDateAt(jd: number, tzOffsetHours: number): string {
  const d = new Date(msFromJd(jd) + tzOffsetHours * 3_600_000);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(
    d.getUTCDate()
  ).padStart(2, '0')}`;
}

export function civilWeekdayAt(jd: number, tzOffsetHours: number): number {
  const d = new Date(msFromJd(jd) + tzOffsetHours * 3_600_000);
  return d.getUTCDay();
}

/** "HH:MM" (24h) of a JD rendered in local mean time of the given offset. */
export function formatLocalHM(jd: number, tzOffsetHours: number): string {
  const d = new Date(msFromJd(jd) + tzOffsetHours * 3_600_000);
  return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
}

export function formatLocalHMS(jd: number, tzOffsetHours: number): string {
  const d = new Date(msFromJd(jd) + tzOffsetHours * 3_600_000);
  return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(
    2,
    '0'
  )}:${String(d.getUTCSeconds()).padStart(2, '0')}`;
}

/** Fractional local hours of a JD (e.g. 13.65 = 13:39). */
export function localHoursOfDay(jd: number, tzOffsetHours: number): number {
  const d = new Date(msFromJd(jd) + tzOffsetHours * 3_600_000);
  return d.getUTCHours() + d.getUTCMinutes() / 60 + d.getUTCSeconds() / 3600;
}

/** "12h 34m 56s" style duration from milliseconds. */
export function formatDurationHMS(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
}

/** Telugu-style duration "గం 12 ని 34 సె 56" */
export function formatDurationTe(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${h} గం ${String(m).padStart(2, '0')} ని ${String(s).padStart(2, '0')} సె`;
}

export function degToDMSString(degInSign: number): string {
  const d = Math.floor(degInSign);
  const mFloat = (degInSign - d) * 60;
  const m = Math.floor(mFloat);
  let s = Math.round((mFloat - m) * 60);
  let mm = m;
  if (s === 60) {
    s = 0;
    mm += 1;
  }
  return `${String(d).padStart(2, '0')}° ${String(mm).padStart(2, '0')}' ${String(s).padStart(2, '0')}"`;
}

/* ------------------------------------------------------------------ *
 *  Ayanamsa
 * ------------------------------------------------------------------ */

/**
 * Chitrapaksha (Lahiri) ayanamsa. Fitted to Swiss Ephemeris SIDM_LAHIRI
 * (max error 0.0001° between 1900-2100).
 */
export function lahiriAyanamsa(jd: number): number {
  const T = julianCenturies(jd);
  return 23.857092 + 1.39688804 * T + 0.0003086 * T * T - 0.00000058 * T * T * T;
}

const SPICA_RA_HOURS = 13 + 25 / 60 + 11.579 / 3600;
const SPICA_DEC_DEG = -(11 + 9 / 60 + 40.75 / 3600);
/** డెల్టా కర్కాటక (ఆసెల్లస్ ఆస్ట్రాలిస్) — పుష్య నక్షత్రపు ప్రధాన తార */
const DELTA_CNC_RA_HOURS = 8 + 44 / 60 + 41.099 / 3600;
const DELTA_CNC_DEC_DEG = 18 + 9 / 60 + 15.35 / 3600;
const registeredStars = new Set<Astronomy.Body>();

/**
 * ఒక నక్షత్రపు *నిజ* (apparent) నిరయన రేఖాంశం — అయనాంశ కోసం.
 * నక్షత్ర స్థానం: J2000 భూమధ్యరేఖీయ నిర్దేశాంకాలు; తర్వాత భూమధ్యరేఖ-ఆఫ్-డేట్ →
 * నేటి సత్య క్రాంతివృత్తం (అయన చలనం + పోషణ + వార్షిక విపర్యయం సహితం).
 * స్విస్ ఎఫెమెరిస్ SIDM_TRUE_CITRA / SIDM_TRUE_PUSHYA తో భేదం < 0.006°.
 */
function starApparentLongitude(
  jd: number,
  body: Astronomy.Body,
  raHours: number,
  decDeg: number
): number {
  if (!registeredStars.has(body)) {
    Astronomy.DefineStar(body, raHours, decDeg, 200);
    registeredStars.add(body);
  }
  const time = Astronomy.MakeTime(dateFromJd(jd));
  const eq = Astronomy.Equator(body, time, new Astronomy.Observer(0, 0, 0), true, true);
  const vec = Astronomy.VectorFromSphere(new Astronomy.Spherical(eq.dec, eq.ra * 15, 1), time);
  const ecl = Astronomy.SphereFromVector(Astronomy.RotateVector(Astronomy.Rotation_EQD_ECT(time), vec));
  return norm360(ecl.lon);
}

/** True (apparent) tropical longitude of Spica = true Chitra ayanamsa + 180°. */
export function spicaTrueTropicalLongitude(jd: number): number {
  return starApparentLongitude(jd, Astronomy.Body.Star1, SPICA_RA_HOURS, SPICA_DEC_DEG);
}

/** True Pushya ayanamsa: డెల్టా కర్కాటక నిజ రేఖాంశం − 106° (కర్కాటకం 16°). */
export function deltaCancriTrueTropicalLongitude(jd: number): number {
  return starApparentLongitude(jd, Astronomy.Body.Star2, DELTA_CNC_RA_HOURS, DELTA_CNC_DEC_DEG);
}

/** Ayanamsa (deg) for a given JD and sidereal mode. */
export function ayanamsaDegrees(jd: number, mode: SiderealMode = 'lahiri'): number {
  // సాయనం = అయనాంశం లేని (ట్రాపికల్) చట్రం.
  if (mode === 'sayana') return 0;
  // నిజ చిత్రా / పుష్య — స్థిర గుణకం కాదు; నక్షత్రపు నిజ స్థానం నుండి ప్రతి క్షణం లెక్కిస్తాము.
  // నక్షత్రాల నిజ స్థానాలు సత్య (apparent) చట్రంలో ఉంటాయి; అయనాంశం మాత్రం
  // మధ్యమ (mean) చట్రంలో నిర్వచించబడుతుంది — అందుకే పోషణ తీసివేయడం.
  if (mode === 'true_citra')
    return norm360(spicaTrueTropicalLongitude(jd) - nutationLongitudeDeg(jd) - 180);
  if (mode === 'pushya')
    return norm360(deltaCancriTrueTropicalLongitude(jd) - nutationLongitudeDeg(jd) - 106);
  const meta = SIDEREAL_MODE_BY_ID[mode] ?? SIDEREAL_MODE_BY_ID.lahiri;
  return lahiriAyanamsa(jd) + meta.deltaFromLahiri + meta.deltaPerCentury * julianCenturies(jd);
}

/* ------------------------------------------------------------------ *
 *  Planetary longitudes (tropical, true ecliptic of date)
 * ------------------------------------------------------------------ */

export const TROPICAL_BODY_IDS = [
  'Sun',
  'Moon',
  'Mercury',
  'Venus',
  'Mars',
  'Jupiter',
  'Saturn',
  'Uranus',
  'Neptune',
  'Pluto',
] as const;

export type TropicalBodyId = (typeof TROPICAL_BODY_IDS)[number];

const BODY_MAP: Record<TropicalBodyId, Astronomy.Body> = {
  Sun: Astronomy.Body.Sun,
  Moon: Astronomy.Body.Moon,
  Mercury: Astronomy.Body.Mercury,
  Venus: Astronomy.Body.Venus,
  Mars: Astronomy.Body.Mars,
  Jupiter: Astronomy.Body.Jupiter,
  Saturn: Astronomy.Body.Saturn,
  Uranus: Astronomy.Body.Uranus,
  Neptune: Astronomy.Body.Neptune,
  Pluto: Astronomy.Body.Pluto,
};

/* ------------------------------------------------------------------ *
 *  పోషణ (nutation) — నిరయన (సిడెరియల్) చట్రం కోసం
 * ------------------------------------------------------------------ *
 *  జ్యోతిష నిరయన రాశులు *మధ్యమ* విషువత్తు (mean equinox) ఆధారితం —
 *  అంటే స్థిర నక్షత్ర చట్రం. స్విస్ ఎఫెమెరిస్ `FLG_SIDEREAL` కూడా ఇదే
 *  చేస్తుంది: సిడెరియల్ రేఖాంశం = సాయన (apparent) రేఖాంశం − పోషణ − అయనాంశం.
 *  పోషణను విడిచిపెడితే 16″ (0.004°) వరకు తప్పు — సంక్రమణి సమయాలు
 *  ఆరు నిమిషాల వరకు జరుగుతాయి. క్రింది సిరీస్ Meeus, *Astronomical
 *  Algorithms* (2వ సం.) అధ్యాయం 22, పట్టిక 22.A నుండి (13 ప్రధాన పదాలు;
 *  శేషం < 0.05″).
 */
export function nutationInLongitudeArcsec(jd: number): number {
  const T = julianCenturies(jd);
  const d2r = Math.PI / 180;
  const D = (297.85036 + 445267.11148 * T - 0.0019142 * T * T + (T * T * T) / 189474) * d2r;
  const M = (357.52772 + 35999.05034 * T - 0.0001603 * T * T - (T * T * T) / 300000) * d2r;
  const Mp = (134.96298 + 477198.867398 * T + 0.0086972 * T * T + (T * T * T) / 56250) * d2r;
  const F = (93.27191 + 483202.017538 * T - 0.0036825 * T * T + (T * T * T) / 327270) * d2r;
  const Om = (125.04452 - 1934.136261 * T + 0.0020708 * T * T + (T * T * T) / 450000) * d2r;

  // [D, M, M', F, Ω, A(0.0001″), B(0.0001″/శతాబ్దం)]
  const terms: [number, number, number, number, number, number, number][] = [
    [0, 0, 0, 0, 1, -171996, -174.2],
    [-2, 0, 0, 2, 2, -13187, -1.6],
    [0, 0, 0, 2, 2, -2274, -0.2],
    [0, 0, 0, 0, 2, 2062, 0.2],
    [0, 1, 0, 0, 0, 1426, -3.4],
    [0, 0, 1, 0, 0, 712, 0.1],
    [-2, 1, 0, 2, 2, -517, 1.2],
    [0, 0, 0, 2, 1, -386, -0.4],
    [0, 0, 1, 2, 2, -301, 0],
    [-2, -1, 0, 2, 2, 217, -0.5],
    [-2, 0, 1, 0, 0, -158, 0],
    [-2, 0, 0, 2, 1, 129, 0.1],
    [0, 0, -1, 2, 2, 123, 0],
  ];
  let sum = 0;
  for (const [cd, cm, cmp, cf, com, a, b] of terms) {
    const arg = cd * D + cm * M + cmp * Mp + cf * F + com * Om;
    sum += (a + b * T) * Math.sin(arg);
  }
  return sum * 0.0001;
}

/** పోషణ వాలు (nutation in obliquity, ఆర్క్-సెకన్లు) — ప్రధాన నాలుగు పదాలు. */
export function nutationInObliquityArcsec(jd: number): number {
  const T = julianCenturies(jd);
  const r = Math.PI / 180;
  const Om = (125.04452 - 1934.136261 * T) * r;
  const L = (280.4665 + 36000.7698 * T) * r;
  const Lp = (218.3165 + 481267.8813 * T) * r;
  return (
    9.2 * Math.cos(Om) + 0.57 * Math.cos(2 * L) + 0.1 * Math.cos(2 * Lp) - 0.09 * Math.cos(2 * Om)
  );
}

/** సత్య (true) క్రాంతి వాలు = మధ్యమ + పోషణ వాలు. */
export function trueObliquityDeg(jd: number): number {
  return meanObliquityDeg(jd) + nutationInObliquityArcsec(jd) / 3600;
}

/** మధ్యమ క్రాంతి వాలు (mean obliquity, డిగ్రీలు) — IAU 1980. */
export function meanObliquityDeg(jd: number): number {
  const T = julianCenturies(jd);
  return 23.439291111 - 0.0130041667 * T - 1.638889e-7 * T * T + 5.036111e-7 * T * T * T;
}

/** పోషణ రేఖాంశ సర్దుబాటు (డిగ్రీలు) — సాయనం → మధ్యమ క్రాంతివృత్తం. */
export function nutationLongitudeDeg(jd: number): number {
  return nutationInLongitudeArcsec(jd) / 3600;
}

/**
 * సాయన (apparent) రేఖాంశాన్ని మధ్యమ (mean) క్రాంతివృత్తానికి మార్చడం.
 * నిరయన రేఖాంశాలు ఈ చట్రం నుండే తీసుకోబడతాయి.
 */
export function toMeanEclipticLongitude(apparentLon: number, jd: number): number {
  return norm360(apparentLon - nutationLongitudeDeg(jd));
}

export function tropicalLongitude(body: TropicalBodyId, jd: number): number {
  const time = Astronomy.MakeTime(dateFromJd(jd));
  const vec = Astronomy.GeoVector(BODY_MAP[body], time, true);
  return norm360(Astronomy.Ecliptic(vec).elon);
}

export function sunLongitude(jd: number): number {
  return tropicalLongitude('Sun', jd);
}

export function moonLongitude(jd: number): number {
  return tropicalLongitude('Moon', jd);
}

export function siderealLongitude(
  body: TropicalBodyId,
  jd: number,
  mode: SiderealMode = 'lahiri'
): number {
  // సిడెరియల్ = సాయనం − పోషణ − అయనాంశం  (స్విస్ ఎఫెమెరిస్ FLG_SIDEREAL సమానం)
  return norm360(
    tropicalLongitude(body, jd) - nutationLongitudeDeg(jd) - ayanamsaDegrees(jd, mode)
  );
}

/** Moon − Sun elongation in degrees (0 = amavasya, 180 = purnima). */
export function moonSunElongation(jd: number): number {
  return norm360(moonLongitude(jd) - sunLongitude(jd));
}

/* ------------------------------------------------------------------ *
 *  Panchanga angular indices
 * ------------------------------------------------------------------ */

export const NAKSHATRA_SPAN = 360 / 27; // 13°20'
export const TITHI_SPAN = 12;
export const YOGA_SPAN = 360 / 27;
export const KARANA_SPAN = 6;

/** 0-based tithi index (0..29): 0 = Shukla Pratipada, 14 = Purnima, 15 = Krishna Pratipada, 29 = Amavasya */
export function tithiIndex(jd: number): number {
  return Math.min(29, Math.floor(moonSunElongation(jd) / TITHI_SPAN));
}

export function nakshatraIndexAt(jd: number, mode: SiderealMode = 'lahiri'): number {
  const moon = siderealLongitude('Moon', jd, mode);
  return Math.floor(moon / NAKSHATRA_SPAN) % 27;
}

export function nakshatraPadaAt(jd: number, mode: SiderealMode = 'lahiri'): number {
  const moon = siderealLongitude('Moon', jd, mode);
  const within = moon % NAKSHATRA_SPAN;
  return Math.min(4, Math.floor(within / (NAKSHATRA_SPAN / 4)) + 1);
}

export function yogaIndexAt(jd: number, mode: SiderealMode = 'lahiri'): number {
  const ayan = ayanamsaDegrees(jd, mode);
  const sum = norm360(sunLongitude(jd) - ayan + (moonLongitude(jd) - ayan));
  return Math.floor(sum / YOGA_SPAN) % 27;
}

export function karanaIndexAt(jd: number): number {
  return Math.min(59, Math.floor(moonSunElongation(jd) / KARANA_SPAN));
}

/* ------------------------------------------------------------------ *
 *  Root finder for "next angular crossing"
 * ------------------------------------------------------------------ */

/**
 * Finds the JD at which a monotonically increasing angular quantity next crosses
 * `target`. Uses a signed ±180° difference so wrapped angles are handled safely.
 */
export function findLongitudeCrossing(
  getValue: (jd: number) => number,
  target: number,
  fromJd: number,
  expectedDegPerDay: number
): number {
  const dir = expectedDegPerDay >= 0 ? 1 : -1;
  const rate = Math.max(0.02, Math.abs(expectedDegPerDay));
  const startVal = getValue(fromJd);
  // angular distance still to travel in the direction of motion
  let travel = dir > 0 ? norm360(target - startVal) : norm360(startVal - target);
  if (travel < 1e-7) travel = 360;
  const signedDelta = (j: number) => {
    const d = getValue(j) - target;
    const wrapped = ((((d + 180) % 360) + 360) % 360) - 180;
    return dir * wrapped;
  };
  let lo = fromJd;
  let hi = fromJd + travel / rate + 0.5;
  let guard = 0;
  while (signedDelta(hi) < 0 && guard < 12) {
    hi += Math.max(1, travel / rate / 4);
    guard += 1;
  }
  for (let i = 0; i < 90; i++) {
    const mid = (lo + hi) / 2;
    if (signedDelta(mid) >= 0) hi = mid;
    else lo = mid;
  }
  return (lo + hi) / 2;
}

export interface AngaWindow {
  index: number;
  startJd: number;
  endJd: number;
  percent: number;
}

/** Tithi running at `jd`, with its exact start/end and elapsed percentage. */
export function tithiWindow(jd: number): AngaWindow {
  const idx = tithiIndex(jd);
  const target = idx * TITHI_SPAN;
  const endJd = findLongitudeCrossing((j) => moonSunElongation(j), (idx + 1) * TITHI_SPAN, jd, 11.8);
  const startJd = findLongitudeCrossing((j) => moonSunElongation(j), target === 0 ? 360 : target, jd - 1.6, 11.8);
  const span = endJd - startJd;
  return {
    index: idx,
    startJd,
    endJd,
    percent: span > 0 ? Math.min(100, Math.max(0, ((jd - startJd) / span) * 100)) : 0,
  };
}

export function nakshatraWindow(jd: number, mode: SiderealMode = 'lahiri'): AngaWindow {
  const lon = siderealLongitude('Moon', jd, mode);
  const idx = Math.floor(lon / NAKSHATRA_SPAN) % 27;
  const target = idx * NAKSHATRA_SPAN;
  const endJd = findLongitudeCrossing((j) => siderealLongitude('Moon', j, mode), (idx + 1) * NAKSHATRA_SPAN, jd, 13.2);
  const startJd = findLongitudeCrossing(
    (j) => siderealLongitude('Moon', j, mode),
    target === 0 ? 360 : target,
    jd - 1.6,
    13.2
  );
  const span = endJd - startJd;
  return {
    index: idx,
    startJd,
    endJd,
    percent: span > 0 ? Math.min(100, Math.max(0, ((jd - startJd) / span) * 100)) : 0,
  };
}

export function yogaWindow(jd: number, mode: SiderealMode = 'lahiri'): AngaWindow {
  const getVal = (j: number) => {
    const a = ayanamsaDegrees(j, mode);
    return norm360(sunLongitude(j) - a + (moonLongitude(j) - a));
  };
  const idx = Math.floor(getVal(jd) / YOGA_SPAN) % 27;
  const target = idx * YOGA_SPAN;
  const endJd = findLongitudeCrossing(getVal, (idx + 1) * YOGA_SPAN, jd, 13.2);
  const startJd = findLongitudeCrossing(getVal, target === 0 ? 360 : target, jd - 1.6, 13.2);
  const span = endJd - startJd;
  return {
    index: idx,
    startJd,
    endJd,
    percent: span > 0 ? Math.min(100, Math.max(0, ((jd - startJd) / span) * 100)) : 0,
  };
}

export function karanaWindow(jd: number): AngaWindow {
  const idx = Math.min(59, Math.floor(moonSunElongation(jd) / KARANA_SPAN));
  const target = idx * KARANA_SPAN;
  const endJd = findLongitudeCrossing((j) => moonSunElongation(j), (idx + 1) * KARANA_SPAN, jd, 11.8);
  const startJd = findLongitudeCrossing(
    (j) => moonSunElongation(j),
    target === 0 ? 360 : target,
    jd - 0.9,
    11.8
  );
  const span = endJd - startJd;
  return {
    index: idx,
    startJd,
    endJd,
    percent: span > 0 ? Math.min(100, Math.max(0, ((jd - startJd) / span) * 100)) : 0,
  };
}

export function nextTithiBoundaryJd(jd: number): number {
  return tithiWindow(jd).endJd;
}

export function nextNakshatraBoundaryJd(jd: number, mode: SiderealMode = 'lahiri'): number {
  return nakshatraWindow(jd, mode).endJd;
}

export function nextYogaBoundaryJd(jd: number, mode: SiderealMode = 'lahiri'): number {
  return yogaWindow(jd, mode).endJd;
}

/* ------------------------------------------------------------------ *
 *  వర్జ్యం (విషఘటి / త్యాజ్యం)
 * ------------------------------------------------------------------ *
 *  ఒక నక్షత్రం నడుస్తున్న కాలంలో నిర్దిష్ట భాగం "త్యాజ్యం" — ఆ సమయంలో
 *  శుభ కార్యాలు వర్జించాలి. ప్రతి నక్షత్రానికి ప్రారంభ ఘటి స్థానం స్థిరం
 *  (నక్షత్ర కాలాన్ని 60 ఘటులుగా విభజించి), వర్జ్యం 4 ఘటుల పొడవు.
 *  ఆధారం: డ్రిక్ పంచాంగ ట్యుటోరియల్ "Nakshatra Thyajyam"
 *  (drikpanchang.com/tutorials/panchang-utilities/nakshatra-thyajyam.html),
 *  reliableastrology.com/nakVishGhati.htm — మరియు `drik-panchanga` ప్యాకేజీ
 *  ఇదే పట్టికను వాడుతుంది (varjyam()).
 */
export const VARJYAM_START_GHATIS: readonly number[] = [
  50, 24, 30, 40, 14, 21, 30, 20, 32, 30, 20, 18, 21, 20, 14, 14, 10, 14, 56, 24, 20, 10, 10, 18, 16, 24, 30,
];

/** వర్జ్యం పొడవు — నక్షత్ర కాలంలో 4/60 (నాలుగు ఘటులు) */
const VARJYAM_SPAN_GHATIS = 4;

export interface VarjyamWindow {
  nakIndex: number;
  startJd: number;
  endJd: number;
}

/**
 * సూర్యోదయాది దినంలో (sunrise → next sunrise) ఏ వర్జ్యం కాలమైనా తగిలితే
 * వాటన్నింటిని ఇస్తుంది — డ్రిక్ ఆ రోజు చూపే జాబితాకు సమానం.
 */
export function varjyamWindowsForDay(
  sunriseJd: number,
  nextSunriseJd: number,
  mode: SiderealMode = 'lahiri'
): VarjyamWindow[] {
  const out: VarjyamWindow[] = [];
  // సూర్యోదయానికి కొంచెం ముందు మొదలైన నక్షత్రం కూడా కావాలి → ఒక నక్షత్రం వెనకికి.
  let cursor = sunriseJd - 1.2;
  for (let guard = 0; guard < 5 && cursor < nextSunriseJd; guard++) {
    const win = nakshatraWindow(cursor, mode);
    const duration = win.endJd - win.startJd;
    if (duration > 0) {
      const startGhati = VARJYAM_START_GHATIS[win.index];
      const startJd = win.startJd + (startGhati / 60) * duration;
      const endJd = startJd + (VARJYAM_SPAN_GHATIS / 60) * duration;
      if (endJd > sunriseJd && startJd < nextSunriseJd) {
        out.push({ nakIndex: win.index + 1, startJd, endJd });
      }
    }
    cursor = win.endJd + 1e-4;
  }
  return out;
}

export function nextKaranaBoundaryJd(jd: number): number {
  return karanaWindow(jd).endJd;
}

/** Exact JD of the Sun's entry (sankranti) into a sidereal sign in a given year. */
export function sankrantiJd(year: number, signIndex: number, mode: SiderealMode = 'lahiri'): number {
  // Rough: Sun enters sidereal signs mid-month of each Gregorian month.
  const approxMonth = ((signIndex + 3) % 12) + 1; // Mesha ≈ April, Makara ≈ January
  const approx = jdFromMs(Date.UTC(year, approxMonth - 1, 14, 12));
  const target = signIndex * 30;
  const value = (j: number) => siderealLongitude('Sun', j, mode);
  // Start ~50 days before the expected ingress so the remaining arc stays < 180°
  const start = approx - 50;
  return findLongitudeCrossing(value, target, start, 0.9856);
}

/* ------------------------------------------------------------------ *
 *  Rise / set / horizon helpers
 * ------------------------------------------------------------------ */

export interface RiseSetTimes {
  sunriseJd: number | null;
  sunsetJd: number | null;
  moonriseJd: number | null;
  moonsetJd: number | null;
}

/* ------------------------------------------------------------------ *
 *  ఉదయాస్తమయ నిర్వచనం — దృక్ పంచాంగ ప్రమాణం
 * ------------------------------------------------------------------ *
 *  దృక్ పంచాంగం ("High Calendar") ఉదయాన్ని **బింబ కేంద్రం, వక్రీభవనం
 *  లేకుండా, క్షితిజ సమతలంపై** ఉన్న క్షణం అని నిర్ణయిస్తుంది — స్విస్
 *  ఎఫెమెరిస్ `rise_trans` లో `BIT_DISC_CENTER|BIT_NO_REFRACTION`
 *  (= సూర్యుడికి `BIT_HINDU_RISING`) తో సమానం.
 *
 *  ఖగోళ శాస్త్ర ప్రమాణం (పై అంచు + 34′ వక్రీభవనం = ఎత్తు −0.833°) కంటే ఇది
 *  హైదరాబాద్‌లో ≈4 నిమిషాలు ఆలస్యం — 2026-10-23: 06:14 / 17:46, డ్రిక్ తో
 *  నిమిషం లోపు కుదిరింది. `RISE_CONVENTION` తో రెండూ లభ్యం.
 */

/** క్షితిజ వక్రీభవనం (డిగ్రీలు) — 34′ */
const HORIZON_REFRACTION_DEG = 34 / 60;
const AU_KM = 149_597_870.7;
const SUN_RADIUS_KM = 695_700;
const MOON_RADIUS_KM = 1_737.4;

function semiDiameterDeg(body: Astronomy.Body, jd: number, observer: Astronomy.Observer): number {
  const radiusKm = body === Astronomy.Body.Sun ? SUN_RADIUS_KM : body === Astronomy.Body.Moon ? MOON_RADIUS_KM : 0;
  if (radiusKm === 0) return 0;
  const time = Astronomy.MakeTime(dateFromJd(jd));
  const eq = Astronomy.Equator(body, time, observer, false, false);
  const distKm = eq.dist * AU_KM;
  return (Math.asin(radiusKm / distKm) * 180) / Math.PI;
}

/**
 * ఒక క్షణంలో సూర్య/చంద్ర బింబపు వక్రీభవన సహిత (apparent) క్షితిజోన్నతి.
 * `Astronomy.Horizon(..., 'normal')` ప్రామాణిక వాతావరణ వక్రీభవన నమూనాను
 * (1013.25 hPa, 10 °C) వాడుతుంది.
 */
function apparentAltitude(
  body: Astronomy.Body,
  jd: number,
  observer: Astronomy.Observer
): number {
  const time = Astronomy.MakeTime(dateFromJd(jd));
  const eq = Astronomy.Equator(body, time, observer, true, true);
  const hor = Astronomy.Horizon(time, observer, eq.ra, eq.dec, 'normal');
  return hor.altitude;
}

/**
 * g(jd) = ఉదయాస్తమయ సమీకరణం — నిర్వచనం ప్రకారం:
 *   • `hindu`      : వక్రీభవనం లేని కేంద్రోన్నతి = 0 (బింబ కేంద్రం క్షితిజంపై)
 *   • `upper-limb` : వక్రీభవన సహిత కేంద్రోన్నతి + బింబ వ్యాసార్ధం = 0
 */
function limbFunction(
  body: Astronomy.Body,
  observer: Astronomy.Observer,
  jd: number,
  convention: RiseConvention = RISE_CONVENTION
): number {
  convention = normalizeConvention(convention, body);
  if (convention === 'hindu') {
    const time = Astronomy.MakeTime(dateFromJd(jd));
    // హిందూ సంప్రదాయం (స్విస్ `BIT_HINDU_RISING`):
    //   1. **భూకేంద్ర** స్థానం — చంద్రుని దృష్టి భేదం (parallax ≈ 57′) తీసేయాలి
    //   2. విషువత్ అక్షాంశం (ecliptic latitude) **సున్నా** — గ్రహం భ్రమణ మార్గం
    //      (ecliptic) మీద ఉన్నట్టే లెక్కిస్తారు. చంద్రునికి ఇది ±5° —
    //      హైదరాబాద్ 2026-01-01: 15:43 → **15:49** (డ్రిక్ విలువ)
    //   3. వక్రీభవనం లేదు (airless) — బింబ కేంద్రం క్షితిజంపై
    const geo = Astronomy.GeoVector(body, time, true);
    const ecl = Astronomy.SphereFromVector(Astronomy.RotateVector(Astronomy.Rotation_EQJ_ECL(), geo));
    const onEcliptic = Astronomy.VectorFromSphere({ lon: ecl.lon, lat: 0, dist: ecl.dist }, time);
    const eqOfDate = Astronomy.EquatorFromVector(
      Astronomy.RotateVector(Astronomy.Rotation_ECL_EQD(time), onEcliptic)
    );
    // వక్రీభవనం లేకుండా (geometric altitude) — 'normal' ఇస్తే తిరిగి జోడిస్తుంది.
    const hor = Astronomy.Horizon(time, observer, eqOfDate.ra, eqOfDate.dec);
    return hor.altitude;
  }
  if (convention === 'centre-refraction') {
    const time = Astronomy.MakeTime(dateFromJd(jd));
    const eq = Astronomy.Equator(body, time, observer, true, true);
    // 'normal' → వక్రీభవన సహిత కేంద్రోన్నతి; సున్నా అయిన క్షణమే ఉదయాస్తమయం.
    return Astronomy.Horizon(time, observer, eq.ra, eq.dec, 'normal').altitude;
  }
  const sd = semiDiameterDeg(body, jd, observer);
  return apparentAltitude(body, jd, observer) + sd;
}

/**
 * ద్విభాజన (bisection) ద్వారా `limbFunction` సున్నా అయ్యే క్షణం — సుమారు
 * 0.05 సెకన్ల ఖచ్చితత్వం. ఏ నిర్వచనం వాడాలో `limbFunction` నిర్ణయిస్తుంది:
 *   • `hindu`      : కేంద్రం, వక్రీభవనం లేదు → ఎత్తు 0° (డ్రిక్ ప్రమాణం)
 *   • `upper-limb` : వక్రీభవన సహిత కేంద్రోన్నతి = −బింబ వ్యాసార్ధం
 */
function refineLimbCrossing(
  body: Astronomy.Body,
  observer: Astronomy.Observer,
  guessJd: number,
  direction: 1 | -1,
  convention: RiseConvention = RISE_CONVENTION
): number | null {
  const step = 20 / 1440; // 20 నిమిషాలు
  let lo = guessJd - step;
  let hi = guessJd + step;
  let gLo = limbFunction(body, observer, lo, convention);
  let gHi = limbFunction(body, observer, hi, convention);
  if (direction > 0 ? !(gLo < 0 && gHi >= 0) : !(gLo > 0 && gHi <= 0)) {
    // bracketing విఫలమైతే కొంచెం విస్తరించి మళ్లీ ప్రయత్నం
    lo = guessJd - 4 * step;
    hi = guessJd + 4 * step;
    gLo = limbFunction(body, observer, lo, convention);
    gHi = limbFunction(body, observer, hi, convention);
    if (direction > 0 ? !(gLo < 0 && gHi >= 0) : !(gLo > 0 && gHi <= 0)) return null;
  }
  let a = lo;
  let b = hi;
  for (let i = 0; i < 40 && b - a > 5e-8; i++) {
    const mid = (a + b) / 2;
    const gm = limbFunction(body, observer, mid, convention);
    const rising = direction > 0;
    if (rising ? gm >= 0 : gm <= 0) b = mid;
    else a = mid;
  }
  return (a + b) / 2;
}

/**
 * ఉదయాస్తమయ నిర్వచనం
 * ------------------
 *  • `'hindu'`     — **డ్రిక్ పంచాంగ్ / హిందూ పంచాంగ సంప్రదాయం**: సూర్య బింబ
 *                    *కేంద్రం* రేఖాంశ క్షితిజాన్ని (ఎత్తు 0°) దాటే క్షణం,
 *                    వక్రీభవనం లెక్కించము (స్విస్ `BIT_HINDU_RISING` సమానం).
 *  • `'upper-limb'` — ఖగోళ ప్రమాణం: పై అంచు + 34′ వక్రీభవనం (ఎత్తు −0.878°).
 *
 * తేడా సుమారు 3–4 నిమిషాలు; దానితో రాహుకాలం, యమగండం, గుళిక, అభిజిత్,
 * హోర, దినమానం అన్నీ కదులుతాయి. యాప్ డిఫాల్ట్ = హిందూ (డ్రిక్) సంప్రదాయం,
 * ఎందుకంటే వినియోగదారు పోల్చే ప్రమాణం అదే.
 */
export type RiseConvention = 'hindu' | 'centre-refraction' | 'upper-limb' | 'app';

/**
 * `app` — "హిందూ క్యాలెండర్" (Alok Mandavgane) యాప్ నిర్వచనం:
 *   • సూర్యుడు: **బింబ కేంద్రం + వక్రీభవనం**  → `swe.BIT_DISC_CENTER + CALC_RISE`
 *     (అతని ఓపెన్ సోర్స్ ఇంజిన్ `webresh/drik-panchanga` · `sunrise()`)
 *   • చంద్రుడు: **బింబ పై అంచు + వక్రీభవనం** (స్విస్ డిఫాల్ట్)
 * సిద్ధిపేట 2026-10-23 ప్రమాణం: 06:11:31 / 17:46:01 · చంద్రుడు 15:43:53 / 04:10:41.
 */
function normalizeConvention(convention: RiseConvention, body: Astronomy.Body): RiseConvention {
  if (convention !== 'app') return convention;
  return body === Astronomy.Body.Sun ? 'centre-refraction' : 'upper-limb';
}

/**
 * డిఫాల్ట్ — డ్రిక్ పంచాంగ ప్రమాణం.
 * `'centre-refraction'` = బింబ కేంద్రం + వాతావరణ వక్రీభవనం (ఖగోళ ప్రమాణం;
 * చాలా మొబైల్ పంచాంగ యాప్‌లు ఇదే వాడతాయి — ఉదయం ~3 నిమిషాలు ముందుగా).
 */
export const RISE_CONVENTION: RiseConvention = 'hindu';

/**
 * గ్రహ బింబం క్షితిజాన్ని దాటే క్షణం (JD, UT). కనబడని సందర్భంలో (ధ్రువ ప్రాంతాలు)
 * `null`.
 */
function upperLimbEvent(
  body: Astronomy.Body,
  direction: 1 | -1,
  startJd: number,
  lat: number,
  lng: number,
  limitDays = 1.5,
  convention: RiseConvention = RISE_CONVENTION
): number | null {
  const observer = new Astronomy.Observer(lat, lng, 0);
  // హిందూ (డ్రిక్) సంప్రదాయం: బింబ కేంద్రం, వక్రీభవనం లేదు → ఎత్తు 0°.
  // ఖగోళ ప్రమాణం: పై అంచు + వక్రీభవనం → ఎత్తు −0.878°.
  convention = normalizeConvention(convention, body);
  const horizonAltitude =
    convention === 'hindu' ? 0 : convention === 'centre-refraction' ? 0 : -(0.612 + 0.266);
  // (centre-refraction లో కూడా స్థూల అన్వేషణ 0° దగ్గరే — కానీ refine దాన్ని
  //  వక్రీభవన సహిత కేంద్రంగా సరిచేస్తుంది; అందుకే స్థూల బ్రాకెట్ చాలు.)
  const coarse = Astronomy.SearchAltitude(
    body,
    observer,
    direction,
    dateFromJd(startJd),
    limitDays,
    horizonAltitude
  );
  if (coarse) {
    const refined = refineLimbCrossing(body, observer, jdFromDate(coarse.date), direction, convention);
    if (refined !== null) return refined;
  }
  // బహుళ అక్షాంశాల్లో బింబం క్షితిజాన్ని తాకి తాకనట్టు కదిలే రోజుల్లో స్థూల
  // అన్వేషణ (SearchAltitude) ఘటనను కోల్పోతుంది. అప్పుడు 5 నిమిషాల అడుగులతో
  // స్వయంగా స్కాన్ చేసి, సంజ్ఞ మారే చోట ద్విభాజన చేస్తాము.
  const STEP = 5 / 1440;
  let prevJd = startJd;
  let prevVal = limbFunction(body, observer, prevJd, convention);
  for (let jd = startJd + STEP; jd <= startJd + limitDays; jd += STEP) {
    const val = limbFunction(body, observer, jd, convention);
    const crossed = direction > 0 ? prevVal < 0 && val >= 0 : prevVal > 0 && val <= 0;
    if (crossed) return refineLimbCrossing(body, observer, (prevJd + jd) / 2, direction, convention) ?? jd;
    prevJd = jd;
    prevVal = val;
  }
  return null;
}

function searchEvent(
  body: Astronomy.Body,
  direction: 1 | -1,
  startJd: number,
  lat: number,
  lng: number,
  limitDays = 1.5,
  convention: RiseConvention = RISE_CONVENTION
): number | null {
  const exact = upperLimbEvent(body, direction, startJd, lat, lng, limitDays, convention);
  if (exact !== null) return exact;
  // ధ్రువ రాత్రులు/పగళ్లలో వక్రీభవన సహిత గణన విఫలమైతే — సాధారణ పద్ధతి
  const observer = new Astronomy.Observer(lat, lng, 0);
  const event = Astronomy.SearchRiseSet(body, observer, direction, dateFromJd(startJd), limitDays);
  return event ? jdFromDate(event.date) : null;
}

/**
 * ఒక హిందూ దినానికి (సూర్యోదయం → మరుసటి సూర్యోదయం) ఉదయాస్తమయాలు.
 *
 * సూర్యుని ఘటనలు స్థానిక అర్ధరాత్రి నుండి వెతుకుతాము; చంద్రుని ఘటనలు
 * *సూర్యోదయం* నుండి — ఎందుకంటే పంచాంగ దినం సూర్యోదయాది. అందుకే ఈ రోజు
 * చూపే చంద్రాస్తమయం మరుసటి తేదీకి పడవచ్చు (కాలర్ ఆ విషయం గుర్తిస్తుంది).
 */
const riseSetCache = new Map<string, RiseSetTimes>();

export function riseSetForLocalDate(
  dateISO: string,
  lat: number,
  lng: number,
  tzOffsetHours: number,
  convention: RiseConvention = RISE_CONVENTION
): RiseSetTimes {
  const key = `${dateISO}|${lat.toFixed(4)}|${lng.toFixed(4)}|${tzOffsetHours}|${convention}`;
  const hit = riseSetCache.get(key);
  if (hit) return hit;
  const value = computeRiseSet(dateISO, lat, lng, tzOffsetHours, convention);
  if (riseSetCache.size > 5000) riseSetCache.clear();
  riseSetCache.set(key, value);
  return value;
}

function computeRiseSet(
  dateISO: string,
  lat: number,
  lng: number,
  tzOffsetHours: number,
  convention: RiseConvention = RISE_CONVENTION
): RiseSetTimes {
  const midnightJd = localMidnightJd(dateISO, tzOffsetHours);
  const sunriseJd = searchEvent(Astronomy.Body.Sun, +1, midnightJd, lat, lng, 1.5, convention);
  const sunsetJd = searchEvent(Astronomy.Body.Sun, -1, midnightJd, lat, lng, 1.5, convention);
  // చంద్రోదయ/చంద్రాస్తమయం — పంచాంగ దినం (సూర్యోదయం → మరుసటి సూర్యోదయం)
  // లోని మొదటి ఘటన. డ్రిక్ పంచాంగం కూడా ఇదే గీతను వాడుతుంది (drik-panchanga
  // `_moon_event_in_window`). సూర్యోదయానికి కొన్ని నిమిషాల ముందు/తర్వాత
  // జరిగే ఘటన ఏ రోజుకు చెందుతుందనేది ఈ గీతపై ఆధారపడి ఉంటుంది.
  const moonAnchor = sunriseJd ?? midnightJd;
  const moonriseJd = searchEvent(Astronomy.Body.Moon, +1, moonAnchor, lat, lng, 1.5, convention);
  const moonsetJd = searchEvent(Astronomy.Body.Moon, -1, moonAnchor, lat, lng, 1.5, convention);
  return { sunriseJd, sunsetJd, moonriseJd, moonsetJd };
}

/** సూర్యోదయం మాత్రమే (వేగవంతమైన మార్గం — సంవత్సర స్కాన్‌లకు) */
export function sunriseJdForLocalDate(
  dateISO: string,
  lat: number,
  lng: number,
  tzOffsetHours: number,
  convention: RiseConvention = RISE_CONVENTION
): number | null {
  return searchEvent(Astronomy.Body.Sun, +1, localMidnightJd(dateISO, tzOffsetHours), lat, lng, 1.5, convention);
}

/** సూర్యాస్తమయం మాత్రమే */
export function sunsetJdForLocalDate(
  dateISO: string,
  lat: number,
  lng: number,
  tzOffsetHours: number,
  convention: RiseConvention = RISE_CONVENTION
): number | null {
  return searchEvent(Astronomy.Body.Sun, -1, localMidnightJd(dateISO, tzOffsetHours), lat, lng, 1.5, convention);
}

/** Apparent solar azimuth (deg from true north, clockwise) and altitude. */
export function sunHorizontal(jd: number, lat: number, lng: number): { azimuth: number; altitude: number } {
  const time = Astronomy.MakeTime(dateFromJd(jd));
  const observer = new Astronomy.Observer(lat, lng, 0);
  const eq = Astronomy.Equator(Astronomy.Body.Sun, time, observer, true, true);
  const hor = Astronomy.Horizon(time, observer, eq.ra, eq.dec, 'normal');
  return { azimuth: hor.azimuth, altitude: hor.altitude };
}

export function localSiderealTimeHours(jd: number, lng: number): number {
  const gast = Astronomy.SiderealTime(Astronomy.MakeTime(dateFromJd(jd)));
  return ((gast * 15 + lng) / 15 + 24) % 24;
}

/** Tropical ascendant (deg) for a JD and place. */
export function ascendantTropical(jd: number, lat: number, lng: number): number {
  const ramc = norm360(localSiderealTimeHours(jd, lng) * 15);
  const ramcRad = (ramc * Math.PI) / 180;
  const T = julianCenturies(jd);
  const eps = (23.4392911 - 0.0130042 * T) * (Math.PI / 180);
  const latRad = (Math.max(-66, Math.min(66, lat)) * Math.PI) / 180;
  const y = Math.cos(ramcRad);
  const x = -Math.sin(ramcRad) * Math.cos(eps) - Math.tan(latRad) * Math.sin(eps);
  return norm360((Math.atan2(y, x) * 180) / Math.PI);
}

/* ------------------------------------------------------------------ *
 *  Eclipse helpers
 * ------------------------------------------------------------------ */

export interface EclipseEvent {
  kind: 'solar' | 'lunar';
  typeTe: string;
  typeEn: string;
  maxJd: number;
  magnitude?: number;
  visibleFromPlace: boolean;
  detailTe: string;
}

export function eclipsesInRange(startJd: number, endJd: number, lat: number, lng: number): EclipseEvent[] {
  const out: EclipseEvent[] = [];
  // Solar eclipses
  let cursor = dateFromJd(startJd);
  for (let i = 0; i < 40; i++) {
    let info: Astronomy.GlobalSolarEclipseInfo;
    try {
      info = Astronomy.SearchGlobalSolarEclipse(cursor);
    } catch {
      break;
    }
    const maxJd = jdFromDate(info.peak.date);
    if (maxJd > endJd) break;
    if (maxJd >= startJd) {
      const { altitude } = sunHorizontal(maxJd, lat, lng);
      out.push({
        kind: 'solar',
        typeTe:
          info.kind === Astronomy.EclipseKind.Total
            ? 'పూర్ణ సూర్యగ్రహణం'
            : info.kind === Astronomy.EclipseKind.Annular
              ? 'వలయాకార సూర్యగ్రహణం'
              : info.kind === Astronomy.EclipseKind.Partial
                ? 'పాక్షిక సూర్యగ్రహణం'
                : 'సంకర సూర్యగ్రహణం',
        typeEn: String(info.kind),
        maxJd,
        magnitude: info.obscuration,
        visibleFromPlace: altitude > -1,
        detailTe:
          altitude > -1
            ? 'ఈ ప్రాంతం నుండి గ్రహణం కనిపిస్తుంది (గరిష్ఠ సమయంలో సూర్యుడు క్షితిజం పైన).'
            : 'ఈ ప్రాంతం నుండి గ్రహణం కనిపించదు (గరిష్ఠ సమయంలో సూర్యుడు క్షితిజం కింద).',
      });
    }
    cursor = new Date(info.peak.date.getTime() + 10 * 86_400_000);
  }

  // Lunar eclipses
  cursor = dateFromJd(startJd);
  for (let i = 0; i < 40; i++) {
    let info: Astronomy.LunarEclipseInfo;
    try {
      info = Astronomy.SearchLunarEclipse(cursor);
    } catch {
      break;
    }
    const maxJd = jdFromDate(info.peak.date);
    if (maxJd > endJd) break;
    if (maxJd >= startJd) {
      const time = Astronomy.MakeTime(dateFromJd(maxJd));
      const observer = new Astronomy.Observer(lat, lng, 0);
      const eq = Astronomy.Equator(Astronomy.Body.Moon, time, observer, true, true);
      const alt = Astronomy.Horizon(time, observer, eq.ra, eq.dec, 'normal').altitude;
      out.push({
        kind: 'lunar',
        typeTe:
          info.kind === Astronomy.EclipseKind.Total
            ? 'పూర్ణ చంద్రగ్రహణం'
            : info.kind === Astronomy.EclipseKind.Partial
              ? 'పాక్షిక చంద్రగ్రహణం'
              : 'ఛాయా చంద్రగ్రహణం',
        typeEn: String(info.kind),
        maxJd,
        magnitude: info.obscuration,
        visibleFromPlace: alt > -1,
        detailTe:
          alt > -1
            ? 'ఈ ప్రాంతం నుండి చంద్రగ్రహణం కనిపిస్తుంది.'
            : 'ఈ ప్రాంతం నుండి చంద్రగ్రహణం కనిపించదు.',
      });
    }
    cursor = new Date(info.peak.date.getTime() + 10 * 86_400_000);
  }

  return out.sort((a, b) => a.maxJd - b.maxJd);
}

/* ------------------------------------------------------------------ *
 *  Misc astronomical reference values used by the panchangam footer
 * ------------------------------------------------------------------ */

export function kaliAhargana(jd: number): number {
  // Kali epoch: 18 Feb 3102 BCE (Julian) = JD 588465.5 (mean sunrise epoch)
  return Math.floor(jd + 0.5 - 588_465.5);
}

export function rataDie(jd: number): number {
  return Math.floor(jd + 0.5) - 1_721_425;
}

export function modifiedJulianDay(jd: number): number {
  return jd - 2_400_000.5;
}

/* ================================================================== *
 *  Grahas (nine) — sidereal longitudes & sign ingresses
 * ================================================================== */

export type GrahaId =
  | 'Sun'
  | 'Moon'
  | 'Mars'
  | 'Mercury'
  | 'Jupiter'
  | 'Venus'
  | 'Saturn'
  | 'Rahu'
  | 'Ketu';

/**
 * సత్య రాహు — ఆస్కులేటింగ్ (true) పాతం యొక్క సాయన రేఖాంశం.
 *
 * చంద్రుని క్షణిక స్థితి-వేగ వెక్టర్ల నుండి కక్ష్యా తలానికి లంబ వెక్టర్
 *   h = r × v
 * లెక్కించి, ఆ తలం క్రాంతివృత్తాన్ని ఉత్తర దిశగా దాటే బిందువును తీసుకుంటాము.
 * ఇది స్విస్ ఎఫెమెరిస్ `TRUE_NODE` కి సమానం (గరిష్ఠ భేదం ≈24″, 30 క్షణాల్లో).
 *
 * మునుపు వాడిన Meeus అధ్యాయం 47 సగం-సిరీస్ 0.16° వరకు తేడా ఇచ్చేది.
 */
export function trueNodeTropical(jd: number): number {
  const time = Astronomy.MakeTime(dateFromJd(jd));
  const state = Astronomy.RotateState(
    Astronomy.Rotation_EQJ_ECT(time),
    Astronomy.GeoMoonState(time)
  );
  const { x, y, z, vx, vy, vz } = state;
  const hx = y * vz - z * vy;
  const hy = z * vx - x * vz;
  // బిందువు సత్య క్రాంతివృత్తం (ECT) లో లెక్కించబడుతుంది; మధ్యమ చట్రానికి మార్చడం
  const apparent = norm360((Math.atan2(hx, -hy) * 180) / Math.PI);
  return norm360(apparent - nutationLongitudeDeg(jd));
}

/**
 * మధ్యమ రాహు — పంచాంగ సంప్రదాయం (mean ascending node, mean equinox of date).
 *
 * సూర్యసిద్ధాంత / తెలుగు పంచాంగ పత్రికలు రాహును *మధ్యమ* పాతంతోనే గణిస్తాయి —
 * Astro-Vision ముద్రిత జాతకాలు కూడా అదే.  Meeus, Astronomical Algorithms,
 * అధ్యాయం 47 సూత్రం (T = జూలియన్ శతాబ్దాలు, J2000 నుంచి):
 *   Ω = 125.0445479° − 1934.1362891°·T + 0.0020754°·T² + T³/467441 − T⁴/60616000
 * స్విస్ ఎఫెమెరిస్ MEAN_NODE తో భేదం < 0.5″ (పరీక్షించబడింది).
 */
export function meanNodeTropical(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  const om =
    125.0445479 -
    1934.1362891 * T +
    0.0020754 * T * T +
    (T * T * T) / 467441 -
    T ** 4 / 60616000;
  return norm360(om);
}

/** Mean daily motion (deg/day) used to seed the crossing search. */
export function grahaMeanMotion(id: GrahaId): number {
  switch (id) {
    case 'Moon':
      return 13.176;
    case 'Sun':
      return 0.9856;
    case 'Mercury':
      return 1.383;
    case 'Venus':
      return 1.2;
    case 'Mars':
      return 0.524;
    case 'Jupiter':
      return 0.083;
    case 'Saturn':
      return 0.0334;
    case 'Rahu':
    case 'Ketu':
      return -0.0529;
  }
}

/** Nirāyaṇa longitude of any of the nine grahas. */
export function grahaSiderealLongitude(id: GrahaId, jd: number, mode: SiderealMode = 'lahiri'): number {
  const ay = ayanamsaDegrees(jd, mode);
  // నిరయనం = సాయన (సత్య విషువత్) − పోషణ − అయనాంశం — స్విస్ ఎఫెమెరిస్ FLG_SIDEREAL క్రమం.
  // పోషణ (nutation) తీసేయకపోతే గ్రహాలు ±17″ తేడాతో, సూర్య-చంద్రుల కంటే వేరే
  // చట్రంలో ఉంటాయి — కక్ష్యా/నక్షత్ర సరిహద్దుల సమయం నిమిషాల తేడా వస్తుంది.
  if (id === 'Rahu') return norm360(toMeanEclipticLongitude(trueNodeTropical(jd), jd) - ay);
  if (id === 'Ketu') return norm360(toMeanEclipticLongitude(trueNodeTropical(jd), jd) - ay + 180);
  return norm360(toMeanEclipticLongitude(tropicalLongitude(id as TropicalBodyId, jd), jd) - ay);
}

export interface SignIngress {
  jd: number;
  signIndex: number;
}

/** Direction of motion (+1 prograde, −1 retrograde) measured from real longitudes. */
export function grahaDirection(id: GrahaId, jd: number, mode: SiderealMode = 'lahiri'): 1 | -1 {
  const a = grahaSiderealLongitude(id, jd - 0.5, mode);
  const b = grahaSiderealLongitude(id, jd + 0.5, mode);
  let diff = b - a;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return diff >= 0 ? 1 : -1;
}

/**
 * Next sign ingress of a graha after `jd`.
 *
 * Direction-agnostic by construction: the longitude is sampled forward until the
 * sign actually changes, then the boundary is bisected. This is the only safe way
 * to handle retrograde loops and stations (a retrograde planet that stations
 * before reaching the previous boundary simply ingresses forward later).
 */
export function nextSignIngressJd(id: GrahaId, jd: number, mode: SiderealMode = 'lahiri'): SignIngress {
  const signOf = (j: number) => Math.floor(grahaSiderealLongitude(id, j, mode) / 30) % 12;
  const sign0 = signOf(jd);
  const step = id === 'Moon' ? 0.25 : 1;
  let lo = jd;
  for (let i = 0; i < 1500; i++) {
    const hi = lo + step;
    const s = signOf(hi);
    if (s !== sign0) {
      let a = lo;
      let b = hi;
      for (let k = 0; k < 45; k++) {
        const m = (a + b) / 2;
        if (signOf(m) === sign0) a = m;
        else b = m;
      }
      return { jd: (a + b) / 2, signIndex: s };
    }
    lo = hi;
  }
  return { jd: jd + 500, signIndex: (sign0 + 1) % 12 };
}

/**
 * Previous sign ingress of a graha strictly before `jd`.
 * Robust bisection: step back one day at a time until the sign differs, then
 * bisect the boundary (works for retrograde Rahu/Ketu as well).
 */
export function previousSignIngressJd(id: GrahaId, jd: number, mode: SiderealMode = 'lahiri'): SignIngress {
  const sign = Math.floor(grahaSiderealLongitude(id, jd, mode) / 30) % 12;
  const span = id === 'Moon' ? 4 : id === 'Rahu' || id === 'Ketu' ? 760 : 460;
  let lo = jd - span;
  for (let t = jd - 1; t > jd - span; t -= 1) {
    if (Math.floor(grahaSiderealLongitude(id, t, mode) / 30) % 12 !== sign) {
      lo = t;
      break;
    }
  }
  let hi = lo + 1;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (Math.floor(grahaSiderealLongitude(id, mid, mode) / 30) % 12 === sign) hi = mid;
    else lo = mid;
  }
  return { jd: hi, signIndex: sign };
}
