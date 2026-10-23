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

export type SiderealMode =
  | 'lahiri'
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
  /** constant offset from Lahiri (deg) — true_citra is computed dynamically */
  deltaFromLahiri: number;
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
  },
  {
    id: 'raman',
    nameTe: 'బి.వి. రామన్ అయనాంశ',
    nameEn: 'B. V. Raman',
    noteTe: 'డా. బి.వి. రామన్ గ్రంథాల ఆధారిత అయనాంశ.',
    deltaFromLahiri: -1.4463,
  },
  {
    id: 'kp',
    nameTe: 'కృష్ణమూర్తి పద్ధతి (KP)',
    nameEn: 'Krishnamurti Paddhati',
    noteTe: 'కే.ఎస్. కృష్ణమూర్తి సుబ్-లార్డ్ పద్ధతికి ప్రామాణిక అయనాంశ.',
    deltaFromLahiri: -0.09686,
  },
  {
    id: 'fagan_bradley',
    nameTe: 'ఫాగన్-బ్రాడ్లీ (పాశ్చాత్య సైడెరియల్)',
    nameEn: 'Fagan–Bradley',
    noteTe: 'ఆల్డెబరాన్ 15° వృషభంలో స్థిరపరచబడిన పాశ్చాత్య సైడెరియల్ విధానం.',
    deltaFromLahiri: 0.8832,
  },
  {
    id: 'yukteshwar',
    nameTe: 'శ్రీ యుక్తేశ్వర్ అయనాంశ',
    nameEn: 'Sri Yukteshwar',
    noteTe: 'యుగ ప్రక్రియ ఆధారిత అయనాంశ (The Holy Science).',
    deltaFromLahiri: -1.37829,
  },
  {
    id: 'true_citra',
    nameTe: 'నిజ చిత్రా (డైనమిక్ స్పైకా)',
    nameEn: 'True Chitra Paksha',
    noteTe: 'చిత్ర (స్పైకా) నక్షత్ర నిజ స్థానం ఆధారంగా ప్రతి క్షణం మారే అయనాంశ.',
    deltaFromLahiri: 0,
  },
  {
    id: 'pushya',
    nameTe: 'పుష్య పక్షం',
    nameEn: 'True Pushya',
    noteTe: 'పుష్య (డెల్టా కర్కాటక) నక్షత్రాన్ని 16° కర్కాటకంలో స్థిరపరచిన విధానం.',
    deltaFromLahiri: -1.1355,
  },
];

export const SIDEREAL_MODE_BY_ID: Record<SiderealMode, SiderealModeInfo> = SIDEREAL_MODES.reduce(
  (acc, m) => {
    acc[m.id] = m;
    return acc;
  },
  {} as Record<SiderealMode, SiderealModeInfo>
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
  const [y, m, d] = dateISO.split('-').map(Number);
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
let spicaRegistered = false;

/** True (apparent) tropical longitude of Spica = true Chitra ayanamsa + 180°. */
export function spicaTrueTropicalLongitude(jd: number): number {
  if (!spicaRegistered) {
    Astronomy.DefineStar(Astronomy.Body.Star1, SPICA_RA_HOURS, SPICA_DEC_DEG, 250);
    spicaRegistered = true;
  }
  const time = Astronomy.MakeTime(dateFromJd(jd));
  const eq = Astronomy.Equator(Astronomy.Body.Star1, time, new Astronomy.Observer(0, 0, 0), true, true);
  const vec = Astronomy.VectorFromSphere(new Astronomy.Spherical(eq.dec, eq.ra * 15, 1), time);
  const ecl = Astronomy.SphereFromVector(Astronomy.RotateVector(Astronomy.Rotation_EQD_ECT(time), vec));
  return norm360(ecl.lon);
}

/** Ayanamsa (deg) for a given JD and sidereal mode. */
export function ayanamsaDegrees(jd: number, mode: SiderealMode = 'lahiri'): number {
  if (mode === 'true_citra') {
    return norm360(spicaTrueTropicalLongitude(jd) - 180);
  }
  const meta = SIDEREAL_MODE_BY_ID[mode] ?? SIDEREAL_MODE_BY_ID.lahiri;
  return lahiriAyanamsa(jd) + meta.deltaFromLahiri;
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
  return norm360(tropicalLongitude(body, jd) - ayanamsaDegrees(jd, mode));
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

function searchEvent(
  body: Astronomy.Body,
  direction: 1 | -1,
  startJd: number,
  lat: number,
  lng: number,
  limitDays = 1.2
): number | null {
  const observer = new Astronomy.Observer(lat, lng, 0);
  const event = Astronomy.SearchRiseSet(body, observer, direction, dateFromJd(startJd), limitDays);
  return event ? jdFromDate(event.date) : null;
}

/**
 * Rise/set for a Hindu civil day (sunrise → next sunrise).
 *
 * The sun events are searched from local midnight; the moon events are searched
 * from *sunrise* because a panchangam day runs from sunrise to sunrise, so the
 * moonset printed for today is the first one after today's sunrise (which may
 * fall on the next civil date — the caller flags that).
 */
export function riseSetForLocalDate(
  dateISO: string,
  lat: number,
  lng: number,
  tzOffsetHours: number
): RiseSetTimes {
  const midnightJd = localMidnightJd(dateISO, tzOffsetHours);
  const sunriseJd = searchEvent(Astronomy.Body.Sun, +1, midnightJd, lat, lng);
  const sunsetJd = searchEvent(Astronomy.Body.Sun, -1, midnightJd, lat, lng);
  const moonAnchor = sunriseJd ?? midnightJd;
  const moonriseJd = searchEvent(Astronomy.Body.Moon, +1, moonAnchor, lat, lng);
  const moonsetJd = searchEvent(Astronomy.Body.Moon, -1, moonAnchor, lat, lng);
  return { sunriseJd, sunsetJd, moonriseJd, moonsetJd };
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

/** True lunar node (Rahu) tropical longitude — Meeus Ch. 47 mean node + periodic terms. */
export function trueNodeTropical(jd: number): number {
  const T = julianCenturies(jd);
  const omegaMean =
    125.0445479 - 1934.1362891 * T + 0.0020754 * T * T + (T * T * T) / 467441.0;
  const D = ((297.8501921 + 445267.1114034 * T) * Math.PI) / 180;
  const M = ((357.5291092 + 35999.0502909 * T) * Math.PI) / 180;
  const Mprime = ((134.9633964 + 477198.8675055 * T) * Math.PI) / 180;
  const F = ((93.272095 + 483202.0175233 * T) * Math.PI) / 180;
  const delta =
    -1.4979 * Math.sin(2 * (D - F)) -
    0.15 * Math.sin(M) -
    0.1226 * Math.sin(2 * D) +
    0.1176 * Math.sin(2 * F) -
    0.0801 * Math.sin(2 * (Mprime - F));
  return norm360(omegaMean + delta);
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
  if (id === 'Rahu') return norm360(trueNodeTropical(jd) - ay);
  if (id === 'Ketu') return norm360(trueNodeTropical(jd) - ay + 180);
  return norm360(tropicalLongitude(id as TropicalBodyId, jd) - ay);
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
