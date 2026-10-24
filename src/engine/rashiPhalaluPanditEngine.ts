/**
 * rashiPhalaluPanditEngine.ts — రాశి ఫలాలు & ముహూర్త స్టూడియో
 * ================================================================
 * ఒక జాతకానికి **ఏ తేదీకైనా** రోజు / వారం / నెల / సంవత్సర ఫలాలు —
 * అన్నీ నిజంగా లెక్కించిన గోచారం, పంచాంగం, దశల నుంచే.
 *
 * ఏదీ స్థిరమైన (fixed) వాక్యం కాదు: ప్రతి వాక్యం ఆ రోజు ఆకాశ స్థితి నుంచి
 * ఉత్పన్నమవుతుంది; లెక్క సాధ్యం కాని చోట "ఆ రోజు చెప్పేది లేదు" అని చెబుతుంది.
 *
 * శాస్త్ర ఆధారం
 * --------------
 *  • చంద్రబలం — జన్మ రాశి నుంచి చంద్రుని సంచార భావం: 1,2,3,5,6,7,9,10,11 శుభ;
 *    4,8,12 అశుభ (ముహూర్త చింతామణి, చంద్రబల ప్రకరణం; పంచాంగ చంద్రబల పట్టిక).
 *  • తారాబలం — జన్మ నక్షత్రం నుంచి 9 తారలు: జన్మ, సంపత్, విపత్, క్షేమ, ప్రత్యరి,
 *    సాధక, వధ, మిత్ర, పరమ మిత్ర (ముహూర్త చింతామణి; తారాబల అధ్యాయం).
 *  • గోచారం — బృహత్ సంహిత 104.4, ఫలదీపిక 26.3–8 చెప్పిన శుభ భావాలు మరియు
 *    వేధ (obstruction) భావాలు; ఇవి `gocharaVedhaEngine` లో ఇప్పటికే నిర్ధారితం.
 *  • తిథి — రిక్త తిథులు (4, 9, 14) శుభ కార్యాలకు వర్జ్యం (ముహూర్త చింతామణి).
 *  • యోగం — విష్కంభ, అతిగండ, శూల, గండ, వ్యాఘాత, వజ్ర, వ్యతీపాత, పరిఘ,
 *    వైధృతి — ఈ 9 యోగాలు అశుభ (సూర్య సిద్ధాంతం, పంచాంగ ప్రకరణం).
 *  • కరణం — విష్టి (భద్ర) నిషిద్ధ (ముహూర్త చింతామణి).
 *  • దశ — వింశోత్తరీ దశా విభజన (బృహత్ పరాశర హోరా శాస్త్రం అధ్యా. 46–47);
 *    దశా స్వామి స్థాన బలం, భావ స్థితి నుంచి రోజు బలం.
 */

import {
  civilWeekdayAt,
  formatLocalHM,
  localMidnightJd,
  siderealLongitude,
  type SiderealMode,
} from './astroCore.ts';
import {
  computeDayPanchanga,
  getMonthCalendar,
  type DayPanchanga,
  type GeoContext,
  type KalaWindow,
} from './hinduCalendarEngine.ts';
import { computeGocharaReport, type GocharaReport } from './gocharaVedhaEngine.ts';
import {
  computeKakshyaTransits,
  kakshyaStrength,
  type KakshyaTransitEntry,
} from './ashtakavargaKakshyaEngine.ts';
import { TELUGU_NAKSHATRAS, TELUGU_RASIS } from './teluguJathakam.ts';
import type { CompleteChartResult } from './ephemeris.ts';

/* ------------------------------------------------------------------ *
 *  పదకోశం
 * ------------------------------------------------------------------ */

export const TARA_NAMES_TE = [
  'జన్మ తార',
  'సంపత్ తార',
  'విపత్ తార',
  'క్షేమ తార',
  'ప్రత్యరి తార',
  'సాధక తార',
  'వధ తార',
  'మిత్ర తార',
  'పరమ మిత్ర తార',
] as const;

/** తారల శుభత్వం — ముహూర్త చింతామణి తారాబల ప్రకరణం. */
const TARA_GOOD = [false, true, false, true, false, true, false, true, true];

/** రిక్త తిథులు — శుభ కార్యాలకు వర్జ్యం. */
const RIKTA_TITHIS = [3, 8, 13, 18, 23, 28]; // 0-based: 4, 9, 14, 19, 24, 29

/** అశుభ యోగాలు (0-based): విష్కంభ, అతిగండ, శూల, గండ, వ్యాఘాత, వజ్ర, వ్యతీపాత, పరిఘ, వైధృతి */
const ASHUBHA_YOGAS = [0, 5, 8, 9, 12, 14, 16, 17, 26];

/** గోచార భారాలు — శని/గురు దీర్ఘకాలిక; చంద్రుడు/బుధుడు తక్కువ భారం. */
const GOCHARA_WEIGHT: Record<string, number> = {
  Saturn: 4,
  Jupiter: 4,
  Sun: 3,
  Mars: 2.5,
  Rahu: 2,
  Ketu: 1.5,
  Moon: 1.5,
  Venus: 1.2,
  Mercury: 1,
};

function grahaTe(id: string): string {
  return GRAHA_TE[id] ?? id;
}

function dignityTe(d: string): string {
  const map: Record<string, string> = {
    Exalted: 'ఉచ్చ',
    Moolatrikona: 'మూలత్రికోణ',
    'Own Sign': 'స్వక్షేత్రం',
    Friendly: 'మిత్ర క్షేత్రం',
    Neutral: 'సమ క్షేత్రం',
    Enemy: 'శత్రు క్షేత్రం',
    Debilitated: 'నీచ',
  };
  return map[d] ?? d;
}

const DIGNITY_SCORE: Record<string, number> = {
  Exalted: 1,
  Moolatrikona: 0.95,
  'Own Sign': 0.9,
  Friendly: 0.7,
  Neutral: 0.5,
  Enemy: 0.3,
  Debilitated: 0.12,
};

export interface PhalaGeo {
  lat: number;
  lng: number;
  tzOffsetHours: number;
  placeNameTe?: string;
  placeNameEn?: string;
}

export interface PhalaScorePart {
  key: string;
  labelTe: string;
  labelEn: string;
  score: number;
  max: number;
  reasonTe: string;
  sourceTe: string;
}

export interface PhalaWindow {
  labelTe: string;
  labelEn: string;
  startTime: string;
  endTime: string;
  quality: 'auspicious' | 'neutral' | 'inauspicious';
  reasonTe: string;
}

export type PhalaGrade = 'ఉత్తమం' | 'శుభం' | 'మధ్యమం' | 'జాగ్రత్త' | 'అశుభం';

export interface DayPhala {
  dateISO: string;
  weekdayTe: string;
  weekdayEn: string;
  placeTe: string;
  /** 0–100 మొత్తం బలం */
  score: number;
  grade: PhalaGrade;
  gradeEn: string;
  parts: PhalaScorePart[];
  panchangaTe: string;
  tithiTe: string;
  nakshatraTe: string;
  yogaTe: string;
  karanaTe: string;
  chandrabalaTe: string;
  tarabalaTe: string;
  dashaTe: string;
  dashaChain: { maha: string; antar: string; pratyantar: string };
  favourable: string[];
  avoid: string[];
  windows: PhalaWindow[];
  cautions: string[];
  gocharaHighlights: { grahaTe: string; houseFromMoon: number; verdictTe: string; themeTe: string }[];
  /** ఏడు గ్రహాల కక్ష్యా స్థానం (3°45′ సూక్ష్మత) */
  kakshya: KakshyaTransitEntry[];
  /** శని స్థితి — సాడే సాతి / అష్టమ / కంటక శని */
  shaniSthiti: { sadeSatiActive: boolean; phaseTe: string | null; ashtama: boolean; kantaka: boolean };
  sourceNoteTe: string;
}

export interface PeriodDay {
  dateISO: string;
  weekdayTe: string;
  score: number;
  grade: PhalaGrade;
  tithiTe: string;
  nakshatraTe: string;
  moonHouse: number;
}

export interface WeekPhala {
  startISO: string;
  endISO: string;
  averageScore: number;
  grade: PhalaGrade;
  days: PeriodDay[];
  bestISO: string;
  weakestISO: string;
  themeTe: string;
  summaryTe: string;
}

export interface MonthPhala {
  year: number;
  month: number;
  labelTe: string;
  averageScore: number;
  grade: PhalaGrade;
  days: PeriodDay[];
  bestDays: PeriodDay[];
  weakestDays: PeriodDay[];
  weekScores: { startISO: string; endISO: string; average: number }[];
  themeTe: string;
  summaryTe: string;
  keyTransitsTe: string[];
}

export interface YearPhala {
  year: number;
  averageScore: number;
  grade: PhalaGrade;
  months: { month: number; labelTe: string; average: number; grade: PhalaGrade }[];
  strongestMonth: number;
  weakestMonth: number;
  dashaChangesTe: string[];
  ingressesTe: string[];
  summaryTe: string;
}

/* ------------------------------------------------------------------ *
 *  సహాయకాలు
 * ------------------------------------------------------------------ */

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function isoOf(year: number, month1: number, day: number): string {
  return `${year}-${pad2(month1)}-${pad2(day)}`;
}

function addDaysISO(dateISO: string, delta: number): string {
  const [y, m, d] = dateISO.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + delta));
  return `${dt.getUTCFullYear()}-${pad2(dt.getUTCMonth() + 1)}-${pad2(dt.getUTCDate())}`;
}

function daysInMonth(year: number, month1: number): number {
  return new Date(Date.UTC(year, month1, 0)).getUTCDate();
}

export function gradeOf(score: number): { grade: PhalaGrade; gradeEn: string } {
  if (score >= 85) return { grade: 'ఉత్తమం', gradeEn: 'Excellent' };
  if (score >= 70) return { grade: 'శుభం', gradeEn: 'Favourable' };
  if (score >= 55) return { grade: 'మధ్యమం', gradeEn: 'Mixed' };
  if (score >= 40) return { grade: 'జాగ్రత్త', gradeEn: 'Caution' };
  return { grade: 'అశుభం', gradeEn: 'Unfavourable' };
}

const WEEKDAY_TE = ['ఆదివారం', 'సోమవారం', 'మంగళవారం', 'బుధవారం', 'గురువారం', 'శుక్రవారం', 'శనివారం'];
const WEEKDAY_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH_TE = [
  'జనవరి',
  'ఫిబ్రవరి',
  'మార్చి',
  'ఏప్రిల్',
  'మే',
  'జూన్',
  'జూలై',
  'ఆగస్టు',
  'సెప్టెంబర్',
  'అక్టోబర్',
  'నవంబర్',
  'డిసెంబర్',
];

/** జాతకం నుంచి జన్మ రాశి, జన్మ నక్షత్రం సూచికలు */
function natalAnchors(chart: CompleteChartResult) {
  const moon = chart.planets.find((p) => p.id === 'Moon') ?? chart.planets[0];
  const moonSignIndex = moon.d1Sign;
  const moonLon = moon.siderealLon;
  const moonNakIndex = Math.floor(moonLon / (360 / 27)) % 27;
  return { moonSignIndex, moonNakIndex, moon };
}

/** ఇచ్చిన తేదీకి దశా చక్రం (మహా / అంతర / ప్రత్యంతర) */
export function dashaAt(chart: CompleteChartResult, dateISO: string) {
  const inRange = (s: string, e: string) => dateISO >= s && dateISO <= e;
  const fallback = { maha: '—', antar: '—', pratyantar: '—' };
  const maha =
    chart.dashas.find((d) => inRange(d.startDate, d.endDate)) ??
    (chart.dashas[0] ? chart.dashas[0] : null);
  if (!maha) return fallback;
  const antar = maha.antardashas.find((a) => inRange(a.startDate, a.endDate)) ?? maha.antardashas[0];
  if (!antar) return { maha: maha.lord, antar: '—', pratyantar: '—' };
  const pratyantar =
    antar.pratyantardashas.find((p) => inRange(p.startDate, p.endDate)) ?? antar.pratyantardashas[0];
  return { maha: maha.lord, antar: antar.lord, pratyantar: pratyantar?.lord ?? '—' };
}

/** తారా సూచిక (0=జన్మ … 8=పరమ మిత్ర) */
function taraIndex(todayNak: number, natalNak: number): number {
  return ((todayNak - natalNak + 27) % 27) % 9;
}

/** గ్రహం పేరు (ఇంగ్లీషు id) → తెలుగు స్వామి పేరు */
const GRAHA_TE: Record<string, string> = {
  Sun: 'సూర్యుడు',
  Moon: 'చంద్రుడు',
  Mars: 'కుజుడు',
  Mercury: 'బుధుడు',
  Jupiter: 'గురువు',
  Venus: 'శుక్రుడు',
  Saturn: 'శని',
  Rahu: 'రాహువు',
  Ketu: 'కేతువు',
};

/* ------------------------------------------------------------------ *
 *  స్కోరింగ్
 * ------------------------------------------------------------------ */

interface SkySnapshot {
  dateISO: string;
  jd: number;
  weekdayIndex: number;
  moonSignIndex: number;
  moonNakIndex: number;
  tithiIndex: number;
  yogaIndex: number | null;
  karanaBhadra: boolean | null;
  panchaka: boolean;
  gochara: GocharaReport;
}

/**
 * తేలికైన ఆకాశ స్థితి — స్థానిక మధ్యాహ్నం నాటి చంద్ర/సూర్య స్ఫుటాలు.
 * నెల/సంవత్సర ఫలాల్లో వందల రోజులను లెక్కించాలి కాబట్టి ఇది వేగవంతం.
 */
function skySnapshot(dateISO: string, geo: PhalaGeo, chart: CompleteChartResult, mode: SiderealMode): SkySnapshot {
  const jd = localMidnightJd(dateISO, geo.tzOffsetHours) + 0.5;
  const moonLon = siderealLongitude('Moon', jd, mode);
  const sunLon = siderealLongitude('Sun', jd, mode);
  const { moonSignIndex, moonNakIndex } = natalAnchors(chart);
  return {
    dateISO,
    jd,
    weekdayIndex: civilWeekdayAt(jd, geo.tzOffsetHours),
    moonSignIndex: Math.floor(moonLon / 30) % 12,
    moonNakIndex: Math.floor(moonLon / (360 / 27)) % 27,
    tithiIndex: Math.floor((((moonLon - sunLon) % 360) + 360) % 360 / 12) % 30,
    yogaIndex: null,
    karanaBhadra: null,
    panchaka: false,
    gochara: computeGocharaReport(moonSignIndex, moonNakIndex, {
      siderealMode: mode,
      tzOffsetHours: geo.tzOffsetHours,
      asOfISO: dateISO,
      light: true,
    }),
  };
}

/** పూర్తి పంచాంగం నుంచి అదే స్థితి (ఉదయం ఆధారితం — దిన ఫలానికి). */
function skyFromPanchanga(
  dateISO: string,
  geo: PhalaGeo,
  chart: CompleteChartResult,
  p: DayPanchanga,
  mode: SiderealMode
): SkySnapshot {
  const { moonSignIndex, moonNakIndex } = natalAnchors(chart);
  return {
    dateISO,
    jd: p.sunriseJd,
    weekdayIndex: p.weekday.index,
    moonSignIndex: p.moonSignIndex,
    moonNakIndex: p.nakshatra.number - 1,
    tithiIndex: p.tithi.number - 1,
    yogaIndex: p.yoga.number - 1,
    karanaBhadra: p.karana.isBhadra,
    panchaka: p.specialFlags.some((f) => f.key === 'panchaka'),
    gochara: computeGocharaReport(moonSignIndex, moonNakIndex, {
      siderealMode: mode,
      tzOffsetHours: geo.tzOffsetHours,
      asOfISO: dateISO,
      light: true,
    }),
  };
}

function scoreChandrabala(sky: SkySnapshot, chart: CompleteChartResult): PhalaScorePart {
  const { moonSignIndex: janma } = natalAnchors(chart);
  const house = ((sky.moonSignIndex - janma + 12) % 12) + 1;
  const goodHouses = [1, 2, 3, 5, 6, 7, 9, 10, 11];
  const isGood = goodHouses.includes(house);
  const score = house === 8 || house === 12 ? 4 : house === 4 ? 7 : isGood ? 20 : 11;
  return {
    key: 'chandrabala',
    labelTe: 'చంద్రబలం',
    labelEn: 'Chandrabala',
    score,
    max: 20,
    reasonTe: `చంద్రుడు ${TELUGU_RASIS[sky.moonSignIndex].nameTe}లో — జన్మ రాశి ${TELUGU_RASIS[janma].nameTe} నుంచి ${house}వ భావం. ${
      house === 8
        ? 'అష్టమ చంద్రుడు — శరీరం, మనస్సు నిదానం కావాలి.'
        : house === 12
          ? 'ద్వాదశ చంద్రుడు — వ్యయ భావం; ఖర్చు, నిద్ర లోపం.'
          : house === 4
            ? 'చతుర్థ చంద్రుడు — మనస్సు చంచలం; గృహ విషయాల్లో ఆలోచన.'
            : isGood
              ? `${house}వ భావం శుభం — మనస్సు నిర్మలంగా పని చేస్తుంది.`
              : `${house}వ భావం మధ్యమం — పని జరుగుతుంది కానీ ఒత్తిడి ఉంటుంది.`
    }`,
    sourceTe: 'ముహూర్త చింతామణి — చంద్రబల ప్రకరణం; పంచాంగ చంద్రబల పట్టిక',
  };
}

function scoreTarabala(sky: SkySnapshot, chart: CompleteChartResult): PhalaScorePart {
  const { moonNakIndex: janmaNak } = natalAnchors(chart);
  const t = taraIndex(sky.moonNakIndex, janmaNak);
  const nameTe = TARA_NAMES_TE[t];
  const good = TARA_GOOD[t];
  const isJanma = t === 0;
  const score = good ? 15 : isJanma ? 8 : 4;
  return {
    key: 'tarabala',
    labelTe: 'తారాబలం',
    labelEn: 'Tarabala',
    score,
    max: 15,
    reasonTe: `నేటి నక్షత్రం ${TELUGU_NAKSHATRAS[sky.moonNakIndex]?.nameTe ?? ''} — జన్మ నక్షత్రం ${TELUGU_NAKSHATRAS[janmaNak]?.nameTe ?? ''} నుంచి ${nameTe}. ${
      good
        ? 'శుభ తార — ప్రారంభాలు, ప్రయాణం, కొత్త పనులకు అనుకూలం.'
        : isJanma
          ? 'జన్మ తార — శరీర శ్రమ; పెద్ద ప్రారంభాలు వాయిదా మంచిది.'
          : 'అశుభ తార — ఫలం ఆలస్యం; ముఖ్య నిర్ణయాలు వద్దు.'
    }`,
    sourceTe: 'ముహూర్త చింతామణి — తారాబల ప్రకరణం (జన్మాది నవ తారలు)',
  };
}

function scoreGochara(sky: SkySnapshot): PhalaScorePart {
  let total = 0;
  let weight = 0;
  const good: string[] = [];
  const bad: string[] = [];
  for (const g of sky.gochara.grahas) {
    const w = GOCHARA_WEIGHT[g.id] ?? 1;
    const val = g.verdict === 'good' ? 1 : g.verdict === 'blocked' ? 0.45 : 0.05;
    total += w * val;
    weight += w;
    if (g.verdict === 'good') good.push(`${g.nameTe} (${g.houseFromMoon}వ)`);
    else if (g.verdict === 'bad') bad.push(`${g.nameTe} (${g.houseFromMoon}వ)`);
  }
  const ratio = weight > 0 ? total / weight : 0.5;
  return {
    key: 'gochara',
    labelTe: 'గోచారం',
    labelEn: 'Gochara',
    score: Math.round(ratio * 30),
    max: 30,
    reasonTe: `శుభ సంచారం: ${good.length ? good.join(', ') : 'ఏదీ లేదు'}. అశుభ సంచారం: ${
      bad.length ? bad.join(', ') : 'ఏదీ లేదు'
    }. వేధ ఉన్న గ్రహాల ఫలం నిరోధించబడింది.`,
    sourceTe: 'బృహత్ సంహిత 104.4; ఫలదీపిక 26.3–8 (శుభ భావాలు మరియు వేధ)',
  };
}

function scorePanchanga(sky: SkySnapshot): PhalaScorePart {
  const tithiIdx = sky.tithiIndex;
  const isRikta = RIKTA_TITHIS.includes(tithiIdx);
  const isAmavasya = tithiIdx === 29;
  const isPurnima = tithiIdx === 14;
  const tithiVal = isRikta ? 0.3 : isAmavasya ? 0.25 : isPurnima ? 0.8 : 0.75;
  const yogaVal = sky.yogaIndex === null ? 0.6 : ASHUBHA_YOGAS.includes(sky.yogaIndex) ? 0.15 : 0.85;
  const karanaVal = sky.karanaBhadra === null ? 0.6 : sky.karanaBhadra ? 0.15 : 0.85;
  const panchakaVal = sky.panchaka ? 0.4 : 1;
  const avg = (tithiVal + yogaVal + karanaVal + panchakaVal) / 4;
  return {
    key: 'panchanga',
    labelTe: 'పంచాంగ శుద్ధి',
    labelEn: 'Panchanga purity',
    score: Math.round(avg * 15),
    max: 15,
    reasonTe: `తిథి ${isRikta ? 'రిక్త తిథి (వర్జ్యం)' : isAmavasya ? 'అమావాస్య' : isPurnima ? 'పౌర్ణమి' : 'సాధారణ శుభ తిథి'}, యోగం ${
      sky.yogaIndex === null ? 'లెక్కించలేదు' : ASHUBHA_YOGAS.includes(sky.yogaIndex) ? 'అశుభ యోగం' : 'శుభ యోగం'
    }, కరణం ${sky.karanaBhadra === null ? 'లెక్కించలేదు' : sky.karanaBhadra ? 'విష్టి (భద్ర)' : 'సాధారణం'}${
      sky.panchaka ? ', పంచక కాలం' : ''
    }.`,
    sourceTe: 'ముహూర్త చింతామణి — తిథి/కరణ నిషేధాలు; సూర్య సిద్ధాంతం — అశుభ యోగాలు',
  };
}

function scoreDasha(chart: CompleteChartResult, dateISO: string): PhalaScorePart {
  const chain = dashaAt(chart, dateISO);
  const lordPlanet =
    chart.planets.find((p) => p.id === chain.antar) ?? chart.planets.find((p) => p.id === chain.maha);
  if (!lordPlanet) {
    return {
      key: 'dasha',
      labelTe: 'దశా బలం',
      labelEn: 'Dasha strength',
      score: 5,
      max: 10,
      reasonTe: 'దశా స్వామి స్థితి జాతకంలో లెక్కించలేకపోయాం.',
      sourceTe: 'బృహత్ పరాశర హోరా శాస్త్రం అధ్యా. 46–47',
    };
  }
  const dignityVal = DIGNITY_SCORE[lordPlanet.dignity] ?? 0.5;
  const kendraBonus = [1, 4, 7, 10, 5, 9].includes(lordPlanet.house) ? 0.15 : 0;
  const val = Math.min(1, dignityVal + kendraBonus);
  return {
    key: 'dasha',
    labelTe: 'దశా బలం',
    labelEn: 'Dasha strength',
    score: Math.round(val * 10),
    max: 10,
    reasonTe: `${grahaTe(chain.maha)} మహాదశ / ${grahaTe(chain.antar)} అంతర్దశ / ${grahaTe(
      chain.pratyantar
    )} ప్రత్యంతర్దశ. అంతర్దశా స్వామి ${GRAHA_TE[lordPlanet.id] ?? lordPlanet.id} ${
      TELUGU_RASIS[lordPlanet.d1Sign].nameTe
    }లో ${lordPlanet.house}వ భావంలో, గుణం ${dignityTe(lordPlanet.dignity)}.`,
    sourceTe: 'బృహత్ పరాశర హోరా శాస్త్రం అధ్యా. 46–47; ఫలదీపిక 19',
  };
}

/**
 * కక్ష్యా బలం — అష్టకవర్గ బిందువు ఉన్న కక్ష్యల్లో గ్రహం నడుస్తున్నాదా.
 * ఇది భావ-స్థాయి గోచారానికి 3°45′ సూక్ష్మతను జోడిస్తుంది.
 */
function scoreKakshya(entries: KakshyaTransitEntry[]): PhalaScorePart {
  const st = kakshyaStrength(entries);
  return {
    key: 'kakshya',
    labelTe: 'కక్ష్యా బలం',
    labelEn: 'Kakshya strength',
    score: Math.round(st.ratio * 10),
    max: 10,
    reasonTe: st.summaryTe,
    sourceTe: 'బృహత్ పరాశర హోరా శాస్త్రం — అష్టకవర్గ కక్ష్యా ఫలం',
  };
}

/* ------------------------------------------------------------------ *
 *  రోజు ఫలం (పూర్తి)
 * ------------------------------------------------------------------ */

/**
 * ఒక తేదీకి సంపూర్ణ దిన ఫలం.
 * @param chart  జన్మ జాతకం (calculateChart ఫలితం)
 * @param dateISO ఏ తేదీకైనా — YYYY-MM-DD
 */
export function computeDayPhala(
  chart: CompleteChartResult,
  dateISO: string,
  geo: PhalaGeo,
  options: { siderealMode?: SiderealMode } = {}
): DayPhala {
  const mode = options.siderealMode ?? 'lahiri';
  const geoCtx: GeoContext = {
    lat: geo.lat,
    lng: geo.lng,
    tzOffsetHours: geo.tzOffsetHours,
    placeName: geo.placeNameTe ?? geo.placeNameEn ?? '',
  } as GeoContext;
  const p = computeDayPanchanga(dateISO, geoCtx, { siderealMode: mode });
  const sky = skyFromPanchanga(dateISO, geo, chart, p, mode);

  const kakshyaTransits = computeKakshyaTransits(chart, sky.jd + 0.5, mode);
  const parts = [
    scoreChandrabala(sky, chart),
    scoreTarabala(sky, chart),
    scoreGochara(sky),
    scorePanchanga(sky),
    scoreKakshya(kakshyaTransits),
    scoreDasha(chart, dateISO),
  ];
  const score = Math.max(0, Math.min(100, Math.round(parts.reduce((s, x) => s + x.score, 0))));
  const { grade, gradeEn } = gradeOf(score);
  const chain = dashaAt(chart, dateISO);

  const { moonSignIndex: janma } = natalAnchors(chart);
  const moonHouse = ((sky.moonSignIndex - janma + 12) % 12) + 1;
  const tara = taraIndex(sky.moonNakIndex, natalAnchors(chart).moonNakIndex);
  const taraGood = TARA_GOOD[tara];

  /* ---- శుభ / అశుభ ఫలాలు గోచారం నుంచే ---- */
  const sorted = [...sky.gochara.grahas].sort(
    (a, b) => (GOCHARA_WEIGHT[b.id] ?? 1) - (GOCHARA_WEIGHT[a.id] ?? 1)
  );
  const favourable: string[] = [];
  const avoid: string[] = [];
  for (const g of sorted) {
    if (g.verdict === 'good' && favourable.length < 3) {
      favourable.push(`${g.nameTe} ${g.houseFromMoon}వ భావంలో (${g.houseThemeTe}) — ${g.verdictTe}.`);
    }
  }
  for (const g of sorted) {
    if ((g.verdict === 'bad' || g.verdict === 'blocked') && avoid.length < 3) {
      avoid.push(`${g.nameTe} ${g.houseFromMoon}వ భావంలో (${g.houseThemeTe}) — ${g.verdictTe}.`);
    }
  }
  if (!favourable.length) {
    favourable.push('ఈ రోజు ఏ గ్రహమూ బలమైన శుభ స్థానంలో లేదు — కొత్త ప్రారంభాలు వద్దు; నిర్వహణ పనులకే పరిమితం కండి.');
  }
  if (!avoid.length) {
    avoid.push('ప్రత్యేక నిషేధం లేదు; అయినా రాహుకాలం, యమగండం లో శుభ కార్యాలు వద్దు.');
  }

  /* ---- కాల విండోలు: పంచాంగ శుభ కాలాలు − అశుభ కాలాలు ---- */
  const windows = buildDayWindows(p);

  const cautions: string[] = [];
  for (const k of p.kalas) {
    if (k.quality === 'inauspicious' && (k.key === 'rahu' || k.key === 'yamaganda' || k.key === 'gulika')) {
      cautions.push(`${k.nameTe} ${k.startTime}–${k.endTime} — శుభ కార్యాలు, ప్రయాణం, కొత్త ప్రారంభం నిషేధం.`);
    }
  }
  if (p.karana.isBhadra) cautions.push('విష్టి (భద్ర) కరణం నడుస్తోంది — వివాహం, గృహప్రవేశం, మొదలు వద్దు.');
  if (p.specialFlags.some((f) => f.key === 'panchaka')) {
    cautions.push('పంచక కాలం — దక్షిణ దిక్కు ప్రయాణం, శయనం, చితి సంబంధ కార్యాలు నిషేధం.');
  }
  if (moonHouse === 8) cautions.push('అష్టమ చంద్రుడు — శరీర శ్రద్ధ, శస్త్రచికిత్స/దీర్ఘ ప్రయాణం వాయిదా.');
  // శని స్థితి — జన్మ రాశి నుంచి సాడే సాతి / అష్టమ / కంటక శని
  if (sky.gochara.sadeSati.active) {
    cautions.push(`సాడే సాతి ${sky.gochara.sadeSati.phaseTe ?? ''} నడుస్తోంది — శని జన్మ రాశి నుంచి ${
      sky.gochara.grahas.find((g) => g.id === 'Saturn')?.houseFromMoon ?? ''
    }వ భావంలో. దీర్ఘకాలిక నిర్ణయాల్లో ఓపిక అవసరం.`);
  }
  if (sky.gochara.ashtamaShani) cautions.push('అష్టమ శని — ఆరోగ్యం, ఖర్చు, ఒత్తిడిపై శ్రద్ధ.');
  if (sky.gochara.kantakaShani) cautions.push('కంటక శని (4వ భావం) — గృహ, మాతృ, వాహన విషయాల్లో జాగ్రత్త.');

  const { grade: _g, gradeEn: _ge } = gradeOf(score);
  void _g;
  void _ge;

  return {
    dateISO,
    weekdayTe: p.weekday.nameTe,
    weekdayEn: p.weekday.nameEn,
    placeTe: geo.placeNameTe ?? p.geo?.placeName ?? '',
    score,
    grade,
    gradeEn,
    parts,
    panchangaTe: `${p.tithi.pakshaTe} ${p.tithi.nameTe} · ${p.nakshatra.nameTe} (పాదం ${p.nakshatra.pada}) · ${p.yoga.nameTe} యోగం · ${p.karana.nameTe} కరణం`,
    tithiTe: `${p.tithi.pakshaTe} ${p.tithi.nameTe} (${p.tithi.percent.toFixed(2)}% గతించింది, ${p.tithi.endTime} వరకు)`,
    nakshatraTe: `${p.nakshatra.nameTe} (పాదం ${p.nakshatra.pada}, ${p.nakshatra.endTime} వరకు) · స్వామి ${p.nakshatra.lordTe}`,
    yogaTe: `${p.yoga.nameTe} — ${p.yoga.meaningTe}`,
    karanaTe: `${p.karana.nameTe} (${p.karana.typeTe})`,
    chandrabalaTe: `చంద్రుడు ${TELUGU_RASIS[p.moonSignIndex].nameTe}లో; మీ జన్మ రాశి నుంచి ${moonHouse}వ భావం.`,
    tarabalaTe: `${TARA_NAMES_TE[tara]} — ${taraGood ? 'శుభం' : tara === 0 ? 'శరీర శ్రమ' : 'అశుభం'}.`,
    dashaTe: `${grahaTe(chain.maha)} మహాదశ · ${grahaTe(chain.antar)} అంతర్దశ · ${grahaTe(
      chain.pratyantar
    )} ప్రత్యంతరం`,
    dashaChain: chain,
    favourable,
    avoid,
    windows,
    cautions,
    gocharaHighlights: sorted.map((g) => ({
      grahaTe: g.nameTe,
      houseFromMoon: g.houseFromMoon,
      verdictTe: g.verdictTe,
      themeTe: g.houseThemeTe,
    })),
    kakshya: kakshyaTransits,
    shaniSthiti: {
      sadeSatiActive: sky.gochara.sadeSati.active,
      phaseTe: sky.gochara.sadeSati.phaseTe,
      ashtama: sky.gochara.ashtamaShani,
      kantaka: sky.gochara.kantakaShani,
    },
    sourceNoteTe:
      'బలాలు: ముహూర్త చింతామణి (చంద్ర/తారా బలం, తిథి-కరణ నిషేధాలు) · బృహత్ సంహిత 104.4, ఫలదీపిక 26 (గోచార-వేధ) · బృహత్ పరాశర హోరా శాస్త్రం అష్టకవర్గ (కక్ష్య) · BPHS 46–47 (వింశోత్తరీ)',
  };
}

/** శుభ కాల విండోలు — అభిజిత్/విజయ + చోఘడియ శుభాలు, రాహు/యమ/గుళిక/దుర్ముహూర్తం తీసేసి */
function buildDayWindows(p: DayPanchanga): PhalaWindow[] {
  const bad = p.kalas.filter(
    (k) => k.quality === 'inauspicious' && k.startJd !== null && k.endJd !== null
  );
  const overlappingBad = (startJd: number, endJd: number) =>
    bad.some((k) => Math.min(endJd, k.endJd as number) > Math.max(startJd, k.startJd as number));

  const candidates: { labelTe: string; labelEn: string; startJd: number; endJd: number; reasonTe: string }[] = [];
  const pushKala = (k: KalaWindow, reasonTe: string) => {
    if (k.startJd === null || k.endJd === null) return;
    if (overlappingBad(k.startJd, k.endJd)) return;
    candidates.push({
      labelTe: k.nameTe,
      labelEn: k.nameEn,
      startJd: k.startJd,
      endJd: k.endJd,
      reasonTe,
    });
  };
  for (const k of p.kalas) {
    if (k.key === 'abhijit') pushKala(k, 'అభిజిత్ ముహూర్తం — సూర్యుని మధ్యాహ్న బలం; శుభ కార్యాలకు ఉత్తమం (ముహూర్త చింతామణి).');
    if (k.key === 'vijaya') pushKala(k, 'విజయ ముహూర్తం — జయానికి, పోటీలకు, కొత్త ప్రయత్నానికి శుభం.');
    if (k.key === 'brahma') pushKala(k, 'బ్రహ్మ ముహూర్తం — అధ్యయనం, జపం, సాధనకు ఉత్తమం.');
  }
  for (const c of p.choghadiya.day) {
    if (c.quality !== 'auspicious') continue;
    if (c.startJd === null || c.endJd === null) continue;
    if (overlappingBad(c.startJd, c.endJd)) continue;
    candidates.push({
      labelTe: `చోఘడియ ${c.nameTe}`,
      labelEn: `Choghadiya ${c.nameEn}`,
      startJd: c.startJd,
      endJd: c.endJd,
      reasonTe: 'చోఘడియ శుభ స్థానం — దినచర్య, ప్రయాణం, వ్యాపార ప్రారంభానికి అనుకూలం.',
    });
  }

  const tz = p.geo.tzOffsetHours;
  const out = candidates
    .filter((c) => c.endJd > c.startJd)
    .sort((a, b) => a.startJd - b.startJd)
    .map<PhalaWindow>((c) => ({
      labelTe: c.labelTe,
      labelEn: c.labelEn,
      startTime: formatLocalHM(c.startJd, tz),
      endTime: formatLocalHM(c.endJd, tz),
      quality: 'auspicious',
      reasonTe: c.reasonTe,
    }));
  if (!out.length) {
    out.push({
      labelTe: 'ప్రత్యేక శుభ కాలం లేదు',
      labelEn: 'No clean auspicious window',
      startTime: p.sunrise,
      endTime: p.sunset,
      quality: 'neutral',
      reasonTe: 'అన్ని శుభ కాలాలపై రాహు/యమ/గుళిక/దుర్ముహూర్తం ప్రభావం ఉంది — ఈ రోజు ముహూర్త కార్యాలు వాయిదా మంచిది.',
    });
  }
  return out.slice(0, 5);
}

/* ------------------------------------------------------------------ *
 *  వారం / నెల / సంవత్సరం
 * ------------------------------------------------------------------ */

function fastDay(
  chart: CompleteChartResult,
  dateISO: string,
  geo: PhalaGeo,
  mode: SiderealMode
): PeriodDay {
  const sky = skySnapshot(dateISO, geo, chart, mode);
  const parts = [
    scoreChandrabala(sky, chart),
    scoreTarabala(sky, chart),
    scoreGochara(sky),
    scorePanchanga(sky),
    scoreKakshya(computeKakshyaTransits(chart, sky.jd, mode)),
    scoreDasha(chart, dateISO),
  ];
  const score = Math.max(0, Math.min(100, Math.round(parts.reduce((s, x) => s + x.score, 0))));
  return {
    dateISO,
    weekdayTe: WEEKDAY_TE[sky.weekdayIndex] ?? '',
    score,
    grade: gradeOf(score).grade,
    tithiTe: tithiLabel(sky.tithiIndex),
    nakshatraTe: TELUGU_NAKSHATRAS[sky.moonNakIndex]?.nameTe ?? '',
    moonHouse: ((sky.moonSignIndex - natalAnchors(chart).moonSignIndex + 12) % 12) + 1,
  };
}

function tithiLabel(idx: number): string {
  const inPaksha = (idx % 15) + 1;
  const paksha = idx < 15 ? 'శుక్ల' : 'కృష్ణ';
  const names = [
    'ప్రథమ',
    'ద్వితీయ',
    'తృతీయ',
    'చతుర్థి',
    'పంచమి',
    'షష్ఠి',
    'సప్తమి',
    'అష్టమి',
    'నవమి',
    'దశమి',
    'ఏకాదశి',
    'ద్వాదశి',
    'త్రయోదశి',
    'చతుర్దశి',
    'పూర్ణిమ/అమావాస్య',
  ];
  return `${paksha} ${names[inPaksha - 1]}`;
}

export function computeWeekPhala(
  chart: CompleteChartResult,
  anchorISO: string,
  geo: PhalaGeo,
  options: { siderealMode?: SiderealMode } = {}
): WeekPhala {
  const mode = options.siderealMode ?? 'lahiri';
  const [y, m, d] = anchorISO.split('-').map(Number);
  const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0 = ఆది
  const startISO = addDaysISO(anchorISO, -wd);
  const days = Array.from({ length: 7 }, (_, i) => fastDay(chart, addDaysISO(startISO, i), geo, mode));
  const average = Math.round(days.reduce((s, x) => s + x.score, 0) / days.length);
  const best = days.reduce((a, b) => (b.score > a.score ? b : a), days[0]);
  const weakest = days.reduce((a, b) => (b.score < a.score ? b : a), days[0]);
  const chain = dashaAt(chart, startISO);
  return {
    startISO,
    endISO: addDaysISO(startISO, 6),
    averageScore: average,
    grade: gradeOf(average).grade,
    days,
    bestISO: best.dateISO,
    weakestISO: weakest.dateISO,
    themeTe: `ఈ వారం ${grahaTe(chain.maha)}/${grahaTe(chain.antar)} దశలో; అత్యుత్తమ రోజు ${best.dateISO} (${best.weekdayTe}, ${best.score}/100), బలహీనమైన రోజు ${weakest.dateISO} (${weakest.weekdayTe}, ${weakest.score}/100).`,
    summaryTe: `వార సగటు ${average}/100 — ${gradeOf(average).grade}. ${best.dateISO} నాడు ${best.tithiTe}, ${best.nakshatraTe} — ముఖ్య కార్యాలకు ఎంచుకోవచ్చు. ${weakest.dateISO} నాడు ${weakest.tithiTe} — పెద్ద నిర్ణయాలు వాయిదా.`,
  };
}

export function computeMonthPhala(
  chart: CompleteChartResult,
  year: number,
  month1: number,
  geo: PhalaGeo,
  options: { siderealMode?: SiderealMode } = {}
): MonthPhala {
  const mode = options.siderealMode ?? 'lahiri';
  const total = daysInMonth(year, month1);
  const days: PeriodDay[] = [];
  for (let d = 1; d <= total; d++) days.push(fastDay(chart, isoOf(year, month1, d), geo, mode));
  const average = Math.round(days.reduce((s, x) => s + x.score, 0) / days.length);
  const sorted = [...days].sort((a, b) => b.score - a.score);
  const weekScores: { startISO: string; endISO: string; average: number }[] = [];
  for (let i = 0; i < days.length; i += 7) {
    const chunk = days.slice(i, i + 7);
    weekScores.push({
      startISO: chunk[0].dateISO,
      endISO: chunk[chunk.length - 1].dateISO,
      average: Math.round(chunk.reduce((s, x) => s + x.score, 0) / chunk.length),
    });
  }
  // నెలలో ముఖ్య గోచార మార్పులు — జాతకం నుంచి ఒకసారి పూర్తి గోచర నివేదిక
  const monthStart = isoOf(year, month1, 1);
  const full = computeGocharaReport(natalAnchors(chart).moonSignIndex, natalAnchors(chart).moonNakIndex, {
    tzOffsetHours: geo.tzOffsetHours,
    asOfISO: monthStart,
    siderealMode: mode,
  });
  const monthEnd = isoOf(year, month1, total);
  const keyTransitsTe = full.upcomingIngresses
    .filter((i) => i.dateISO >= monthStart && i.dateISO <= monthEnd)
    .map((i) => `${i.dateISO} — ${i.grahaTe} ${i.signTe}లో ప్రవేశం (${i.timeLocal}).`);

  const chainStart = dashaAt(chart, monthStart);
  return {
    year,
    month: month1,
    labelTe: `${MONTH_TE[month1 - 1]} ${year}`,
    averageScore: average,
    grade: gradeOf(average).grade,
    days,
    bestDays: sorted.slice(0, 5),
    weakestDays: [...days].sort((a, b) => a.score - b.score).slice(0, 5),
    weekScores,
    themeTe: `ఈ నెల ${grahaTe(chainStart.maha)}/${grahaTe(chainStart.antar)} దశ; సగటు బలం ${average}/100.`,
    summaryTe: `ఉత్తమ తేదీలు: ${sorted
      .slice(0, 5)
      .map((d) => `${d.dateISO} (${d.score})`)
      .join(', ')}. జాగ్రత్త తేదీలు: ${[...days]
      .sort((a, b) => a.score - b.score)
      .slice(0, 3)
      .map((d) => `${d.dateISO} (${d.score})`)
      .join(', ')}.`,
    keyTransitsTe,
  };
}

export function computeYearPhala(
  chart: CompleteChartResult,
  year: number,
  geo: PhalaGeo,
  options: { siderealMode?: SiderealMode } = {}
): YearPhala {
  const mode = options.siderealMode ?? 'lahiri';
  const months: { month: number; labelTe: string; average: number; grade: PhalaGrade }[] = [];
  for (let m = 1; m <= 12; m++) {
    const total = daysInMonth(year, m);
    let sum = 0;
    for (let d = 1; d <= total; d++) {
      sum += fastDay(chart, isoOf(year, m, d), geo, mode).score;
    }
    const average = Math.round(sum / total);
    months.push({ month: m, labelTe: MONTH_TE[m - 1], average, grade: gradeOf(average).grade });
  }
  const average = Math.round(months.reduce((s, x) => s + x.average, 0) / 12);
  const strongest = months.reduce((a, b) => (b.average > a.average ? b : a), months[0]);
  const weakest = months.reduce((a, b) => (b.average < a.average ? b : a), months[0]);

  // సంవత్సరంలో దశా మార్పులు
  const dashaChangesTe: string[] = [];
  for (const md of chart.dashas) {
    if (md.startDate.startsWith(String(year)))
      dashaChangesTe.push(`${md.startDate} — ${grahaTe(md.lord)} మహాదశ ఆరంభం.`);
    for (const ad of md.antardashas) {
      if (ad.startDate.startsWith(String(year)))
        dashaChangesTe.push(
          `${ad.startDate} — ${grahaTe(md.lord)}/${grahaTe(ad.lord)} అంతర్దశ ఆరంభం.`
        );
    }
  }

  const { moonSignIndex, moonNakIndex } = natalAnchors(chart);
  const full = computeGocharaReport(moonSignIndex, moonNakIndex, {
    tzOffsetHours: geo.tzOffsetHours,
    asOfISO: `${year}-01-01`,
    siderealMode: mode,
  });
  const ingressesTe = full.upcomingIngresses
    .filter((i) => i.dateISO.startsWith(String(year)))
    .map((i) => `${i.dateISO} — ${i.grahaTe} ${i.signTe}లో ప్రవేశం.`);

  return {
    year,
    averageScore: average,
    grade: gradeOf(average).grade,
    months,
    strongestMonth: strongest.month,
    weakestMonth: weakest.month,
    dashaChangesTe: dashaChangesTe.slice(0, 24),
    ingressesTe,
    summaryTe: `${year} సంవత్సర సగటు ${average}/100 — ${gradeOf(average).grade}. బలమైన నెల ${strongest.labelTe} (${strongest.average}), బలహీన నెల ${weakest.labelTe} (${weakest.average}).`,
  };
}

/* ------------------------------------------------------------------ *
 *  ఏడాది పండుగలు & ముహూర్త రూల్ ఇంజిన్
 * ------------------------------------------------------------------ */

export interface FestivalHit {
  dateISO: string;
  nameTe: string;
  nameEn: string;
  kindTe: string;
}

/** ఇచ్చిన సంవత్సరంలోని పండుగలు — పంచాంగ నియమాల నుంచే (స్థిర జాబితా కాదు). */
export function festivalsForYear(
  year: number,
  geo: PhalaGeo,
  options: { siderealMode?: SiderealMode } = {}
): FestivalHit[] {
  const mode = options.siderealMode ?? 'lahiri';
  const geoCtx: GeoContext = {
    lat: geo.lat,
    lng: geo.lng,
    tzOffsetHours: geo.tzOffsetHours,
    placeName: geo.placeNameTe ?? '',
  } as GeoContext;
  const out: FestivalHit[] = [];
  const seen = new Set<string>();
  for (let m = 1; m <= 12; m++) {
    for (const cell of getMonthCalendarCached(year, m, geoCtx, mode)) {
      for (const f of cell.festivals) {
        const key = `${cell.dateISO}|${f.nameTe}`;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push({
          dateISO: cell.dateISO,
          nameTe: f.nameTe,
          nameEn: f.nameEn,
          kindTe: festivalKindTe(f.category),
        });
      }
    }
  }
  return out;
}

/* getMonthCalendar నెలకు ~1 సెకను తీసుకుంటుంది; సంవత్సరానికి ఒకసారి పిలుస్తే
   మెమొరీ కాష్ ఉంటే మళ్లీ లెక్కించదు. */
const monthCache = new Map<string, ReturnType<typeof getMonthCalendar>>();

function getMonthCalendarCached(
  year: number,
  month1: number,
  geo: GeoContext,
  mode: SiderealMode
): ReturnType<typeof getMonthCalendar> {
  const key = `${year}-${month1}-${geo.lat.toFixed(3)}-${geo.lng.toFixed(3)}-${mode}`;
  const hit = monthCache.get(key);
  if (hit) return hit;
  const val = getMonthCalendar(year, month1, geo, { siderealMode: mode });
  monthCache.set(key, val);
  return val;
}

function festivalKindTe(category: string): string {
  switch (category) {
    case 'major':
      return 'పెద్ద పండుగ';
    case 'vratam':
      return 'వ్రతం';
    case 'solar':
      return 'సౌర పర్వం (సంక్రమణం)';
    case 'monthly':
      return 'మాస పర్వం';
    case 'eclipse':
      return 'గ్రహణం';
    default:
      return 'పర్వం';
  }
}
