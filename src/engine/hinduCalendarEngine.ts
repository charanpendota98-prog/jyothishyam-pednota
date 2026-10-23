/**
 * hinduCalendarEngine.ts — World-class Telugu / Hindu Panchangam engine.
 *
 * Produces a *complete*, computed (never hard-coded) panchangam:
 *   • 5 angas with exact start/end instants (tithi, nakshatra, yoga, karana, vara)
 *   • Sunrise / sunset / moonrise / moonset, dinamana, ratrimana, madhyahna
 *   • Samvatsara (60-year cycle), Shaka / Vikram / Gujarati samvat, Kali year & ahargana,
 *     amanta + purnimanta masa (with automatic *adhika masa* detection), ritu, ayana,
 *     national civil (Shaka solar) & nirayana dates
 *   • All kala windows: Rahu / Yamagandam / Gulika, Durmuhurtam, Abhijit, Vijaya,
 *     Brahma, Godhuli, Nishita, sandhyas, Bhadra (Vishti), Panchaka, Disha Shool
 *   • Choghadiya (day + night) and Hora (24 planetary hours)
 *   • Chandrabalam / Tarabalam
 *   • Festival, Sankranti and eclipse calendars for any year
 *
 * Rules follow the Drik Panchang / Rashtriya Panchang (Chitrapaksha) convention and
 * the classical texts (Surya Siddhanta, Muhurta Chintamani, Dharma Sindhu,
 * Nirnaya Sindhu, Smriti Chandrika). Every number is computed from the ephemeris in
 * astroCore.ts — nothing is hard-coded per year.
 */

import * as Astronomy from 'astronomy-engine';
import {
  ayanamsaDegrees,
  civilDateAt,
  civilWeekdayAt,
  dateFromJd,
  degToDMSString,
  eclipsesInRange,
  findLongitudeCrossing,
  formatDurationHMS,
  formatDurationTe,
  formatLocalHM,
  jdFromDate,
  jdFromMs,
  kaliAhargana,
  localMidnightJd,
  localMs,
  modifiedJulianDay,
  moonLongitude,
  moonSunElongation,
  msFromJd,
  nakshatraIndexAt,
  nakshatraPadaAt,
  nextKaranaBoundaryJd,
  nextTithiBoundaryJd,
  nextNakshatraBoundaryJd,
  karanaWindow,
  nakshatraWindow,
  norm360,
  tithiWindow,
  yogaWindow,
  rataDie,
  riseSetForLocalDate,
  sunriseJdForLocalDate,
  sunsetJdForLocalDate,
  sankrantiJd,
  siderealLongitude,
  sunHorizontal,
  sunLongitude,
  tithiIndex,
  yogaIndexAt,
  type SiderealMode,
} from './astroCore.ts';
import { TELUGU_NAKSHATRAS, TELUGU_RASIS } from './teluguJathakam.ts';

/* ================================================================== *
 *  Nomenclature tables (Telugu + English + Sanskrit)
 * ================================================================== */

export const TITHI_NAMES_TE = [
  'పాడ్యమి', 'విదియ', 'తదియ', 'చవితి', 'పంచమి', 'షష్ఠి', 'సప్తమి', 'అష్టమి', 'నవమి', 'దశమి',
  'ఏకాదశి', 'ద్వాదశి', 'త్రయోదశి', 'చతుర్దశి', 'పూర్ణిమ',
];

export const TITHI_NAMES_EN = [
  'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi', 'Saptami', 'Ashtami',
  'Navami', 'Dashami', 'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima',
];

export const KRISHNA_AMAVASYA_TE = 'అమావాస్య';

export const YOGA_NAMES_TE = [
  'విష్కంభ', 'ప్రీతి', 'ఆయుష్మాన్', 'సౌభాగ్య', 'శోభన', 'అతిగండ', 'సుకర్మ', 'ధృతి', 'శూల',
  'గండ', 'వృద్ధి', 'ధ్రువ', 'వ్యాఘాత', 'హర్షణ', 'వజ్ర', 'సిద్ధి', 'వ్యతీపాత', 'వరీయాన్',
  'పరిఘ', 'శివ', 'సిద్ధ', 'సాధ్య', 'శుభ', 'శుక్ల', 'బ్రహ్మ', 'ఇంద్ర', 'వైధృతి',
];

export const YOGA_NAMES_EN = [
  'Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda', 'Sukarma', 'Dhriti',
  'Shula', 'Ganda', 'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra', 'Siddhi', 'Vyatipata',
  'Variyana', 'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma', 'Indra',
  'Vaibhava',
];

export const INAUSPICIOUS_YOGA_INDEXES = [0, 5, 8, 9, 12, 14, 16, 18, 26];

export const KARANA_MOVABLE_TE = ['బవ', 'బాలవ', 'కౌలవ', 'తైతిల', 'గర', 'వణిజ', 'విష్టి (భద్ర)'];
export const KARANA_MOVABLE_EN = ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara', 'Vanija', 'Vishti'];
export const KARANA_FIXED: { te: string; en: string }[] = [
  { te: 'కింస్తుఘ్న', en: 'Kimstughna' },
  { te: 'శకుని', en: 'Shakuni' },
  { te: 'చతుష్పాద', en: 'Chatushpada' },
  { te: 'నాగ', en: 'Naga' },
];

/** 60 Samvatsara names (Shalivahana Shaka cycle used in Telugu panchangam). */
export const SAMVATSARA_NAMES: { te: string; en: string }[] = [
  { te: 'ప్రభవ', en: 'Prabhava' }, { te: 'విభవ', en: 'Vibhava' }, { te: 'శుక్ల', en: 'Shukla' },
  { te: 'ప్రమోదూత', en: 'Pramodoota' }, { te: 'ప్రజోత్పత్తి', en: 'Prajotpatti' },
  { te: 'అంగీరస', en: 'Angirasa' }, { te: 'శ్రీముఖ', en: 'Shrimukha' }, { te: 'భావ', en: 'Bhava' },
  { te: 'యువ', en: 'Yuva' }, { te: 'ధాత', en: 'Dhata' }, { te: 'ఈశ్వర', en: 'Ishvara' },
  { te: 'బహుధాన్య', en: 'Bahudhanya' }, { te: 'ప్రమాథి', en: 'Pramathi' },
  { te: 'విక్రమ', en: 'Vikrama' }, { te: 'వృష', en: 'Vrisha' },
  { te: 'చిత్రభాను', en: 'Chitrabhanu' }, { te: 'స్వభాను', en: 'Svabhanu' },
  { te: 'తారణ', en: 'Tarana' }, { te: 'పార్థివ', en: 'Parthiva' }, { te: 'వ్యయ', en: 'Vyaya' },
  { te: 'సర్వజిత్', en: 'Sarvajit' }, { te: 'సర్వధారి', en: 'Sarvadhari' },
  { te: 'విరోధి', en: 'Virodhi' }, { te: 'వికృతి', en: 'Vikriti' }, { te: 'ఖర', en: 'Khara' },
  { te: 'నందన', en: 'Nandana' }, { te: 'విజయ', en: 'Vijaya' }, { te: 'జయ', en: 'Jaya' },
  { te: 'మన్మథ', en: 'Manmatha' }, { te: 'దుర్ముఖి', en: 'Durmukhi' },
  { te: 'హేవిళంబి', en: 'Hevilambi' }, { te: 'విళంబి', en: 'Vilambi' },
  { te: 'వికారి', en: 'Vikari' }, { te: 'శార్వరి', en: 'Sharvari' }, { te: 'ప్లవ', en: 'Plava' },
  { te: 'శుభకృత్', en: 'Shubhakrit' }, { te: 'శోభకృత్', en: 'Shobhakrit' },
  { te: 'క్రోధి', en: 'Krodhi' }, { te: 'విశ్వావసు', en: 'Vishvavasu' },
  { te: 'పరాభవ', en: 'Parabhava' }, { te: 'ప్లవంగ', en: 'Plavanga' }, { te: 'కీలక', en: 'Kilaka' },
  { te: 'సౌమ్య', en: 'Saumya' }, { te: 'సాధారణ', en: 'Sadharana' },
  { te: 'విరోధికృత్', en: 'Virodhikrit' }, { te: 'పరిధావి', en: 'Paridhavi' },
  { te: 'ప్రమాది', en: 'Pramadi' }, { te: 'ఆనంద', en: 'Ananda' }, { te: 'రాక్షస', en: 'Rakshasa' },
  { te: 'అనల', en: 'Anala' }, { te: 'పింగళ', en: 'Pingala' }, { te: 'కాలయుక్త', en: 'Kalayukta' },
  { te: 'సిద్ధార్థి', en: 'Siddharthi' }, { te: 'రౌద్ర', en: 'Raudra' },
  { te: 'దుర్మతి', en: 'Durmati' }, { te: 'దుందుభి', en: 'Dundubhi' },
  { te: 'రుధిరోద్గారి', en: 'Rudhirodgari' }, { te: 'రక్తాక్షి', en: 'Raktakshi' },
  { te: 'క్రోధన', en: 'Krodhana' }, { te: 'అక్షయ', en: 'Akshaya' },
];

export const MASA_NAMES: { te: string; en: string; sanskrit: string }[] = [
  { te: 'చైత్రం', en: 'Chaitra', sanskrit: 'Chaitra' },
  { te: 'వైశాఖం', en: 'Vaishakha', sanskrit: 'Vaisakha' },
  { te: 'జ్యేష్ఠం', en: 'Jyeshtha', sanskrit: 'Jyeshtha' },
  { te: 'ఆషాఢం', en: 'Ashadha', sanskrit: 'Ashadha' },
  { te: 'శ్రావణం', en: 'Shravana', sanskrit: 'Shravana' },
  { te: 'భాద్రపదం', en: 'Bhadrapada', sanskrit: 'Bhadrapada' },
  { te: 'ఆశ్వయుజం', en: 'Ashwayuja', sanskrit: 'Asvayuja' },
  { te: 'కార్తీకం', en: 'Karthika', sanskrit: 'Karttika' },
  { te: 'మార్గశిరం', en: 'Margashira', sanskrit: 'Margasirsha' },
  { te: 'పుష్యం', en: 'Pushya', sanskrit: 'Pausha' },
  { te: 'మాఘం', en: 'Magha', sanskrit: 'Magha' },
  { te: 'ఫాల్గుణం', en: 'Phalguna', sanskrit: 'Phalguna' },
];

export const RITU_NAMES: { te: string; en: string }[] = [
  { te: 'వసంత ఋతువు', en: 'Vasanta (Spring)' },
  { te: 'గ్రీష్మ ఋతువు', en: 'Grishma (Summer)' },
  { te: 'వర్ష ఋతువు', en: 'Varsha (Monsoon)' },
  { te: 'శరద్ ఋతువు', en: 'Sharad (Autumn)' },
  { te: 'హేమంత ఋతువు', en: 'Hemanta (Pre-winter)' },
  { te: 'శిశిర ఋతువు', en: 'Shishira (Winter)' },
];

export const VARA_NAMES = [
  { te: 'ఆదివారం', en: 'Sunday', lordTe: 'సూర్యుడు', lordEn: 'Sun', planetId: 'Sun' },
  { te: 'సోమవారం', en: 'Monday', lordTe: 'చంద్రుడు', lordEn: 'Moon', planetId: 'Moon' },
  { te: 'మంగళవారం', en: 'Tuesday', lordTe: 'కుజుడు', lordEn: 'Mars', planetId: 'Mars' },
  { te: 'బుధవారం', en: 'Wednesday', lordTe: 'బుధుడు', lordEn: 'Mercury', planetId: 'Mercury' },
  { te: 'గురువారం', en: 'Thursday', lordTe: 'గురుడు', lordEn: 'Jupiter', planetId: 'Jupiter' },
  { te: 'శుక్రవారం', en: 'Friday', lordTe: 'శుక్రుడు', lordEn: 'Venus', planetId: 'Venus' },
  { te: 'శనివారం', en: 'Saturday', lordTe: 'శని', lordEn: 'Saturn', planetId: 'Saturn' },
];

export const TARA_NAMES = [
  { te: 'జన్మ తార', en: 'Janma', good: false },
  { te: 'సంపత్ తార', en: 'Sampat', good: true },
  { te: 'విపత్ తార', en: 'Vipat', good: false },
  { te: 'క్షేమ తార', en: 'Kshema', good: true },
  { te: 'ప్రత్యరి తార', en: 'Pratyari', good: false },
  { te: 'సాధక తార', en: 'Sadhaka', good: true },
  { te: 'వధ తార', en: 'Vadha', good: false },
  { te: 'మిత్ర తార', en: 'Mitra', good: true },
  { te: 'అతిమిత్ర తార', en: 'Ati-Mitra', good: true },
];

const DISHA_SHOOL_BY_WEEKDAY = ['తూర్పు (East)', 'పడమర (West)', 'ఉత్తరం (North)', 'ఉత్తరం (North)', 'దక్షిణం (South)', 'పడమర (West)', 'తూర్పు (East)'];

/** Muhurta numbers (1..15 of the daytime) of Durmuhurtam per weekday (Muhurta Chintamani). */
const DURMUHURTA_NUMBERS: number[][] = [
  [14],
  [9, 12],
  [4],
  [7],
  [6, 12],
  [4, 9],
  [1, 2],
];

const RAHU_OCTANTS = [8, 2, 7, 5, 6, 4, 3];
const YAMA_OCTANTS = [5, 4, 3, 2, 1, 7, 6];
const GULIKA_OCTANTS = [7, 6, 5, 4, 3, 2, 1];

const CHOGHADIYA_NAMES = [
  { key: 'udveg', te: 'ఉద్వేగం', en: 'Udveg', good: false, planetTe: 'సూర్యుడు' },
  { key: 'char', te: 'చరం', en: 'Char', good: false, planetTe: 'చంద్రుడు' },
  { key: 'labh', te: 'లాభం', en: 'Labh', good: true, planetTe: 'బుధుడు' },
  { key: 'amrit', te: 'అమృతం', en: 'Amrit', good: true, planetTe: 'గురుడు' },
  { key: 'kaal', te: 'కాలం', en: 'Kaal', good: false, planetTe: 'శని' },
  { key: 'shubh', te: 'శుభం', en: 'Shubh', good: true, planetTe: 'శుక్రుడు' },
  { key: 'rog', te: 'రోగం', en: 'Rog', good: false, planetTe: 'కుజుడు' },
] as const;

const CHOGHADIYA_DAY_SEQUENCE: number[][] = [
  [0, 1, 2, 3, 4, 5, 6, 0], // Sunday: Udveg, Char, Labh, Amrit, Kaal, Shubh, Rog, Udveg
  [3, 4, 5, 6, 0, 1, 2, 3], // Monday
  [6, 0, 1, 2, 3, 4, 5, 6], // Tuesday
  [2, 3, 4, 5, 6, 0, 1, 2], // Wednesday
  [5, 6, 0, 1, 2, 3, 4, 5], // Thursday
  [1, 2, 3, 4, 5, 6, 0, 1], // Friday
  [4, 5, 6, 0, 1, 2, 3, 4], // Saturday
];

const CHOGHADIYA_NIGHT_SEQUENCE: number[][] = [
  [5, 3, 1, 6, 4, 2, 0, 5],
  [1, 6, 4, 2, 0, 5, 3, 1],
  [4, 2, 0, 5, 3, 1, 6, 4],
  [0, 5, 3, 1, 6, 4, 2, 0],
  [3, 1, 6, 4, 2, 0, 5, 3],
  [6, 4, 2, 0, 5, 3, 1, 6],
  [2, 0, 5, 3, 1, 6, 4, 2],
];

const HORA_ORDER = ['Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars'];
const HORA_PLANET_TE: Record<string, string> = {
  Sun: 'సూర్యుడు',
  Moon: 'చంద్రుడు',
  Mars: 'కుజుడు',
  Mercury: 'బుధుడు',
  Jupiter: 'గురుడు',
  Venus: 'శుక్రుడు',
  Saturn: 'శని',
};
const HORA_NATURE: Record<string, 'auspicious' | 'neutral' | 'caution'> = {
  Jupiter: 'auspicious',
  Venus: 'auspicious',
  Mercury: 'auspicious',
  Moon: 'auspicious',
  Sun: 'neutral',
  Mars: 'caution',
  Saturn: 'caution',
};

/* ================================================================== *
 *  Types
 * ================================================================== */

export interface GeoContext {
  lat: number;
  lng: number;
  tzOffsetHours: number;
  placeName: string;
  placeNameTe?: string;
}

export interface KalaWindow {
  key: string;
  nameTe: string;
  nameEn: string;
  startJd: number | null;
  endJd: number | null;
  startTime: string;
  endTime: string;
  quality: 'auspicious' | 'inauspicious' | 'neutral';
  noteTe?: string;
}

export interface FestivalEntry {
  id: string;
  nameTe: string;
  nameEn: string;
  dateISO: string;
  descriptionTe: string;
  category: 'major' | 'vratam' | 'solar' | 'monthly' | 'eclipse';
  timingNoteTe?: string;
}

export interface AngaInfo {
  number: number;
  nameTe: string;
  nameEn: string;
  startJd: number | null;
  endJd: number | null;
  startTime: string;
  endTime: string;
  percentElapsed: number;
  nextNameTe?: string;
  noteTe?: string;
  extra?: Record<string, string>;
}

export interface DayPanchanga {
  dateISO: string;
  geo: GeoContext;
  weekday: { index: number; nameTe: string; nameEn: string; lordTe: string; lordEn: string };
  sunriseJd: number;
  sunsetJd: number;
  moonriseJd: number | null;
  moonsetJd: number | null;
  sunrise: string;
  sunset: string;
  moonrise: string;
  moonset: string;
  moonsetNextDay: boolean;
  solarNoon: string;
  dayLengthMs: number;
  nightLengthMs: number;
  dinmanaTe: string;
  ratrimanaTe: string;
  tithi: AngaInfo & { pakshaTe: string; pakshaEn: string; percent: number };
  nakshatra: AngaInfo & {
    pada: number;
    lordTe: string;
    deityTe: string;
    ganaTe: string;
    yoniTe: string;
    nadiTe: string;
  };
  yoga: AngaInfo & { meaningTe: string; isAuspicious: boolean };
  karana: AngaInfo & { typeTe: string; isBhadra: boolean };
  karanaSchedule: { nameTe: string; nameEn: string; startTime: string; endTime: string; isBhadra: boolean }[];
  era: HinduEraInfo;
  kalas: KalaWindow[];
  choghadiya: { day: KalaWindow[]; night: KalaWindow[] };
  hora: KalaWindow[];
  chandrabalam: { moonSignIndex: number; goodRasis: number[]; ashtamaRasis: number[] };
  tarabalam: { nakshatraIndex: number; taras: { index: number; te: string; good: boolean }[] };
  observances: FestivalEntry[];
  specialFlags: { key: string; te: string }[];
  ayanamsaDeg: number;
  ayanamsaFormatted: string;
  sunSignIndex: number;
  moonSignIndex: number;
  sunNakshatraIndex: number;
  sunNakshatraPada: number;
  kaliAhargana: number;
  julianDay: number;
  rataDie: number;
  mjd: number;
}

export interface HinduEraInfo {
  samvatsaraIndex: number; // 1..60
  samvatsaraTe: string;
  samvatsaraEn: string;
  shakaYear: number;
  vikramYear: number;
  gujaratiYear: number;
  kaliYear: number;
  masaIndex: number; // 0..11
  masaTe: string;
  masaEn: string;
  masaIsAdhika: boolean;
  masaLabelTe: string;
  purnimantaMasaIndex: number;
  purnimantaMasaTe: string;
  rituTe: string;
  rituEn: string;
  lunarRituTe: string;
  ayanaTe: string;
  ayanaEn: string;
  pakshaTe: string;
  pakshaEn: string;
  solarMonthTe: string;
  solarMonthDay: number;
  ugadiISO: string;
}

export interface MonthDayCell {
  dateISO: string;
  dayOfMonth: number;
  weekdayIndex: number;
  pakshaTe: string;
  tithiNameTe: string;
  tithiNameEn: string;
  nakshatraNameTe: string;
  festivals: FestivalEntry[];
  isToday: boolean;
  isPurnima: boolean;
  isAmavasya: boolean;
}

export interface AmantaMonthSpan {
  masaIndex: number;
  masaTe: string;
  masaEn: string;
  isAdhika: boolean;
  startISO: string;
  endISO: string;
  purnimantaStartISO: string;
  purnimantaEndISO: string;
}

export interface SankrantiEntry {
  signIndex: number;
  signTe: string;
  signEn: string;
  jd: number;
  dateISO: string;
  timeLocal: string;
  nameTe: string;
  isPunyaKala?: boolean;
}

export interface HinduYearOverview {
  gregorianYear: number;
  geo: GeoContext;
  samvatsaraTe: string;
  samvatsaraEn: string;
  shakaYear: number;
  vikramYear: number;
  kaliYear: number;
  adhikaMasa: AmantaMonthSpan | null;
  months: AmantaMonthSpan[];
  sankrantis: SankrantiEntry[];
  eclipses: { dateISO: string; typeTe: string; kind: 'solar' | 'lunar'; visible: boolean; detailTe: string; timeLocal: string }[];
  festivals: FestivalEntry[];
  ugadiISO: string;
}

/* ================================================================== *
 *  Core utilities
 * ================================================================== */

function jdToMs(jd: number): number {
  return msFromJd(jd);
}

function timeStr(jd: number | null, tz: number): string {
  return jd === null ? '—' : formatLocalHM(jd, tz);
}

function windowFromJd(
  key: string,
  nameTe: string,
  nameEn: string,
  startJd: number | null,
  endJd: number | null,
  tz: number,
  quality: 'auspicious' | 'inauspicious' | 'neutral',
  noteTe?: string
): KalaWindow {
  return {
    key,
    nameTe,
    nameEn,
    startJd,
    endJd,
    startTime: timeStr(startJd, tz),
    endTime: timeStr(endJd, tz),
    quality,
    noteTe,
  };
}

export function tithiNameTe(index: number): string {
  if (index < 15) return `శుక్ల ${TITHI_NAMES_TE[index]}`;
  if (index === 29) return KRISHNA_AMAVASYA_TE;
  return `కృష్ణ ${TITHI_NAMES_TE[index - 15]}`;
}

export function tithiNameEn(index: number): string {
  if (index < 15) return `Shukla ${TITHI_NAMES_EN[index]}`;
  if (index === 29) return 'Amavasya';
  return `Krishna ${TITHI_NAMES_EN[index - 15]}`;
}

export function karanaNameForIndex(k: number): { te: string; en: string; isBhadra: boolean } {
  if (k === 0) return { ...KARANA_FIXED[0], isBhadra: false };
  if (k === 57) return { ...KARANA_FIXED[1], isBhadra: false };
  if (k === 58) return { ...KARANA_FIXED[2], isBhadra: false };
  if (k === 59) return { ...KARANA_FIXED[3], isBhadra: false };
  const idx = (k - 1) % 7;
  return {
    te: KARANA_MOVABLE_TE[idx],
    en: KARANA_MOVABLE_EN[idx],
    isBhadra: idx === 6,
  };
}

/* ---------- new moon helpers ---------- */

const newMoonBeforeCache = new Map<number, number>();
const newMoonAfterCache = new Map<number, number>();
const masaCache = new Map<number, MasaResolution>();
const sankrantiBetweenCache = new Map<string, { signIndex: number; jd: number }[]>();

export function newMoonBeforeJd(jd: number): number {
  const key = Math.round(jd * 4);
  const hit = newMoonBeforeCache.get(key);
  if (hit !== undefined) return hit;
  const value = computeNewMoonBefore(jd);
  newMoonBeforeCache.set(key, value);
  return value;
}

function computeNewMoonBefore(jd: number): number {
  const elong = moonSunElongation(jd);
  let est = jd - elong / 12.1907; // mean synodic rate
  let best: number | null = null;
  // Search from a safe distance before the estimate
  let cursor = est - 2.5;
  for (let i = 0; i < 6; i++) {
    const t = searchMoonPhaseFrom(0, cursor, 6);
    if (t === null) break;
    if (t <= jd + 1e-9) {
      best = t;
      cursor = t + 0.5;
    } else break;
  }
  return best ?? est;
}

export function newMoonAfterJd(jd: number): number {
  const key = Math.round(jd * 4);
  const hit = newMoonAfterCache.get(key);
  if (hit !== undefined) return hit;
  const value = computeNewMoonAfter(jd);
  newMoonAfterCache.set(key, value);
  return value;
}

function computeNewMoonAfter(jd: number): number {
  const elong = moonSunElongation(jd);
  let est = jd + ((360 - elong) % 360) / 12.1907;
  if (est - jd < 0.2) est += 29.53;
  let t = searchMoonPhaseFrom(0, est - 2.5, 6);
  if (t === null) return est;
  if (t <= jd + 1e-9) {
    const t2 = searchMoonPhaseFrom(0, t + 1, 30);
    return t2 ?? est + 29.53;
  }
  return t;
}

function searchMoonPhaseFrom(targetLon: number, startJd: number, limitDays: number): number | null {
  const time = Astronomy.SearchMoonPhase(targetLon, dateFromJd(startJd), limitDays);
  return time ? jdFromDate(time.date) : null;
}

/* ---------- solar ingress helpers ---------- */

export function nextSankrantiAfterJd(jd: number, mode: SiderealMode = 'lahiri'): { signIndex: number; jd: number } {
  const sunSid = siderealLongitude('Sun', jd, mode);
  const sign = Math.floor(sunSid / 30) % 12;
  const nextSign = (sign + 1) % 12;
  const target = nextSign * 30;
  return {
    signIndex: nextSign,
    jd: findLongitudeCrossing((j) => siderealLongitude('Sun', j, mode), target, jd, 0.9856),
  };
}

/** All solar ingresses (sankrantis) between two JDs. */
export function sankrantisBetween(
  startJd: number,
  endJd: number,
  mode: SiderealMode = 'lahiri'
): { signIndex: number; jd: number }[] {
  const cacheKey = `${Math.round(startJd * 100)}|${Math.round(endJd * 100)}|${mode}`;
  const cached = sankrantiBetweenCache.get(cacheKey);
  if (cached) return cached;
  const out: { signIndex: number; jd: number }[] = [];
  let cursor = startJd;
  for (let i = 0; i < 30; i++) {
    const next = nextSankrantiAfterJd(cursor, mode);
    if (next.jd > endJd) break;
    out.push(next);
    cursor = next.jd + 0.05;
  }
  sankrantiBetweenCache.set(cacheKey, out);
  return out;
}

/* ---------- month / masa resolution ---------- */

export interface MasaResolution {
  masaIndex: number;
  isAdhika: boolean;
  lunationStartJd: number;
  lunationEndJd: number;
  ingress: { signIndex: number; jd: number } | null;
}

export function resolveMasa(jd: number, mode: SiderealMode = 'lahiri'): MasaResolution {
  const nm1 = newMoonBeforeJd(jd);
  const cacheKey = Math.round(nm1 * 1000) + (mode === 'lahiri' ? 0 : 1);
  const cached = masaCache.get(cacheKey);
  if (cached) return cached;
  const resolved = resolveMasaUncached(jd, mode, nm1);
  masaCache.set(cacheKey, resolved);
  return resolved;
}

function resolveMasaUncached(jd: number, mode: SiderealMode, nm1: number): MasaResolution {
  const nm2 = newMoonAfterJd(nm1 + 0.5);
  const ingresses = sankrantisBetween(nm1, nm2, mode);
  if (ingresses.length > 0) {
    return {
      masaIndex: ingresses[0].signIndex % 12,
      isAdhika: false,
      lunationStartJd: nm1,
      lunationEndJd: nm2,
      ingress: ingresses[0],
    };
  }
  // Adhika maasa: no sankranti inside the lunation → named after the following month
  const nm3 = newMoonAfterJd(nm2 + 0.5);
  const nextIngress = sankrantisBetween(nm2, nm3, mode);
  const nameSign = nextIngress.length > 0 ? nextIngress[0].signIndex % 12 : Math.floor(siderealLongitude('Sun', nm2, mode) / 30) % 12;
  return {
    masaIndex: nameSign,
    isAdhika: true,
    lunationStartJd: nm1,
    lunationEndJd: nm2,
    ingress: null,
  };
}

/* ---------- Ugadi / samvatsara ---------- */

const ugadiCache = new Map<number, string>();

/**
 * Ugadi = Chaitra Shukla Pratipada.
 *
 * Pratipada begins exactly at the amavasya instant, therefore the observance day
 * is the civil day that contains the new moon (when the new moon falls before
 * sunrise, Pratipada already prevails at sunrise; when it falls later in the day,
 * the same day hosts the pratipada-pravesha). Kshaya (skipped) pratipada cases —
 * e.g. 19 Mar 2026 — are handled correctly by this rule and match Drik Panchang.
 */
/**
 * Ugādi — Caitra śukla pratipadā, resolved with the same sunrise rule as month
 * starts (so a kṣaya pratipadā keeps the day it begins on).
 *
 * `lat`/`lng` matter because the answer depends on the local sunrise; they
 * default to Hyderabad (the reference location for the Telugu pañcāṅgam).
 */
export function ugadiDateISO(
  gregorianYear: number,
  mode: SiderealMode = 'lahiri',
  tz = 5.5,
  lat = 17.385,
  lng = 78.4867
): string {
  const cacheKey = gregorianYear * 1000 + (mode === 'lahiri' ? 1 : 2) + Math.round(tz);
  const cached = ugadiCache.get(cacheKey);
  if (cached) return cached;

  const geo: GeoContext = { lat, lng, tzOffsetHours: tz, placeName: 'ఉగాది స్థానం' };
  let cursorJd = jdFromMs(Date.UTC(gregorianYear, 2, 1, 0, 0, 0)) - tz / 24;
  const limit = jdFromMs(Date.UTC(gregorianYear, 3, 25, 0, 0, 0)) - tz / 24;
  let nm = newMoonAfterJd(cursorJd);
  while (nm < limit) {
    const masa = resolveMasa(nm + 0.6, mode);
    // చైత్రము + అధిక చైత్రము కాదు — అధిక చైత్రము ఉన్న సంవత్సరంలో (ఉదా. 2029)
    // ఉగాది నిజ చైత్ర శుక్ల ప్రతిపదకే, అధిక చైత్ర ప్రతిపదకు కాదు.
    if (masa.masaIndex === 0 && !masa.isAdhika) {
      const dateISO = lunarMonthStartISO(nm, geo);
      ugadiCache.set(cacheKey, dateISO);
      return dateISO;
    }
    nm = newMoonAfterJd(nm + 1);
  }
  const fallback = `${gregorianYear}-03-20`;
  ugadiCache.set(cacheKey, fallback);
  return fallback;
}

/**
 * First civil day (at this location) on which Shukla Pratipada is the prevailing
 * tithi at sunrise. When Pratipada is *kshaya* (it begins after sunrise on the
 * new-moon day and ends before the next sunrise, so no sunrise hosts it) the
 * panchangam assigns the skipped tithi to the day on which it begins — this is
 * the "kshaya pratipada" rule that makes Ugadi 19 Mar 2026 (not 20 Mar).
 */
export function lunarMonthStartISO(nmJd: number, geo: GeoContext): string {
  const tz = geo.tzOffsetHours;
  const d0 = civilDateAt(nmJd, tz);
  const sunrise0 = riseSetForLocalDate(d0, geo.lat, geo.lng, tz).sunriseJd;
  // New moon before sunrise → Pratipada already prevails at sunrise on d0.
  if (sunrise0 !== null && nmJd < sunrise0) return d0;
  const d1 = addDaysISO(d0, 1);
  const sunrise1 = riseSetForLocalDate(d1, geo.lat, geo.lng, tz).sunriseJd;
  if (sunrise1 === null) return d1;
  // End of Pratipada = next tithi boundary (12° of elongation past the new moon).
  const pratipadaEnd = nextTithiBoundaryJd(nmJd + 0.02);
  if (pratipadaEnd < sunrise1) return d0; // kshaya pratipada
  return d1;
}

function addDaysISO(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}-${String(
    dt.getUTCDate()
  ).padStart(2, '0')}`;
}

export function resolveHinduEra(dateISO: string, geo: GeoContext, mode: SiderealMode = 'lahiri'): HinduEraInfo {
  const [gy] = dateISO.split('-').map(Number);
  const tz = geo.tzOffsetHours;
  // గమనిక: localMidnightJd ఇప్పటికే స్థానిక అర్ధరాత్రి UT-JD ని ఇస్తుంది —
  // అందుకే మళ్ళీ tz తీసివేయకూడదు (మునుపు 5:30 గంటల లోపు "మధ్యాహ్నం" వచ్చేది,
  // దాంతో అమావాస్య రోజు నెల మార్పు ఆలస్యంగా కనిపించేది).
  const midnightJd = localMidnightJd(dateISO, tz);
  const noonJd = midnightJd + 0.5;
  const rs = riseSetForLocalDate(dateISO, geo.lat, geo.lng, tz);
  const sunriseJd = rs.sunriseJd ?? midnightJd + 6 / 24;

  const ugadiThisYear = ugadiDateISO(gy, mode, tz, geo.lat, geo.lng);
  const shakaYear = dateISO >= ugadiThisYear ? gy - 78 : gy - 79;
  const samvatsaraIndex = ((shakaYear + 12) % 60 + 60) % 60;
  const samvatsara = SAMVATSARA_NAMES[samvatsaraIndex === 0 ? 59 : samvatsaraIndex - 1] ?? SAMVATSARA_NAMES[0];

  const pakshaIdx = tithiIndex(sunriseJd);
  // అమావాస్య రోజు నెల పేరు: ఆమన్తంలో అమావాస్య *ముగిసే* నెలకు చెందుతుంది.
  // కానీ ప్రతిపద క్షయమైతే (ఉదా. ఉగాది 2026-03-19) ఆ రోజే క్రొత్త నెల మొదటి రోజు.
  let masa = resolveMasa(noonJd, mode);
  if (pakshaIdx === 29) {
    const nmToday = newMoonBeforeJd(noonJd);
    if (lunarMonthStartISO(nmToday, geo) !== dateISO) {
      masa = resolveMasa(sunriseJd - 0.2, mode);
    }
  }
  const masaName = MASA_NAMES[masa.masaIndex];
  const isShukla = pakshaIdx < 15;
  const purnimantaIdx = isShukla ? masa.masaIndex : (masa.masaIndex + 1) % 12;

  // Saṅkrānti rule: a civil day belongs to the new solar month as soon as the
  // ingress happens *during* that day, so the sign is taken at the end of the
  // civil day rather than at sunrise. This is the Drik Panchang behaviour
  // (Tulā saṅkrānti 2026-10-17 19:51 → 17 Oct is "Tulā 1", 22 Oct "Tulā 6").
  const endOfDayJd = localMidnightJd(dateISO, tz) + 1 - 1e-5;
  const sunSid = siderealLongitude('Sun', endOfDayJd, mode);
  const sunSign = Math.floor(sunSid / 30) % 12;
  const rituIdx = Math.floor(((sunSign + 12 - 0) % 12) / 2); // Mesha/Vrishabha → Vasanta
  const lunarRituIdx = Math.floor((((masa.masaIndex + 12 - 0) % 12) / 2)) % 6;
  const isUttarayana = sunSign >= 9 || sunSign <= 2; // Makara..Mithuna

  // Days elapsed in the current solar (nirayana) month — days counted from the
  // sankranti by sunrise, which is how panchangams print "Pravishte/Gate".
  const solarMonthDay = (() => {
    const gy = Number(dateISO.slice(0, 4));
    const candidates = [sankrantiJd(gy, sunSign, mode), sankrantiJd(gy - 1, sunSign, mode)];
    const valid = candidates.filter((t) => t <= endOfDayJd + 1e-6);
    if (valid.length === 0) return 1;
    const last = Math.max(...valid);
    // "Pravishte" counting: the civil day on which the saṅkrānti occurs is day 1,
    // irrespective of the clock time of the ingress. This is the Drik Panchang
    // convention (e.g. Tulā saṅkrānti 2026-10-17 19:51 → 2026-10-22 prints
    // "Tulā 6", not "5"), and it is the only way the printed "solar month day"
    // stays continuous across a midnight ingress.
    const ingressISO = civilDateAt(last, tz);
    const [iy, im, id] = ingressISO.split('-').map(Number);
    const [dy, dm, dd] = dateISO.split('-').map(Number);
    const diff = Math.round(
      (Date.UTC(dy, dm - 1, dd) - Date.UTC(iy, im - 1, id)) / 86_400_000
    );
    return Math.max(1, diff + 1);
  })();

  return {
    samvatsaraIndex: samvatsaraIndex === 0 ? 60 : samvatsaraIndex,
    samvatsaraTe: samvatsara.te,
    samvatsaraEn: samvatsara.en,
    shakaYear,
    vikramYear: shakaYear + 135,
    gujaratiYear: shakaYear + 134,
    kaliYear: shakaYear + 3179,
    masaIndex: masa.masaIndex,
    masaTe: masaName.te,
    masaEn: masaName.en,
    masaIsAdhika: masa.isAdhika,
    masaLabelTe: masa.isAdhika ? `అధిక ${masaName.te}` : masaName.te,
    purnimantaMasaIndex: purnimantaIdx,
    purnimantaMasaTe: MASA_NAMES[purnimantaIdx].te,
    rituTe: RITU_NAMES[Math.min(5, Math.max(0, rituIdx))].te,
    rituEn: RITU_NAMES[Math.min(5, Math.max(0, rituIdx))].en,
    lunarRituTe: RITU_NAMES[Math.min(5, Math.max(0, lunarRituIdx))].te,
    ayanaTe: isUttarayana ? 'ఉత్తరాయణం (దేవమార్గం)' : 'దక్షిణాయనం (పితృమార్గం)',
    ayanaEn: isUttarayana ? 'Uttarayana' : 'Dakshinayana',
    pakshaTe: isShukla ? 'శుక్ల పక్షం' : 'కృష్ణ పక్షం',
    pakshaEn: isShukla ? 'Shukla Paksha' : 'Krishna Paksha',
    solarMonthTe: TELUGU_RASIS[sunSign]?.nameTe ?? MASA_NAMES[sunSign].te,
    solarMonthDay,
    ugadiISO: ugadiThisYear,
  };
}

/* ================================================================== *
 *  Festival rules
 * ================================================================== */

interface FestivalRule {
  id: string;
  nameTe: string;
  nameEn: string;
  descriptionTe: string;
  category: FestivalEntry['category'];
  masa?: number; // amanta masa index
  paksha?: 'shukla' | 'krishna';
  tithi?: number; // 1..15
  kala?: 'sunrise' | 'madhyahna' | 'pradosha' | 'nishita' | 'moonrise';
  /** Optional solar constraint — the Sun's nirāyaṇa rāśi at sunrise (0 = Meṣa). */
  sunSign?: number;
  weekday?: number;
  timingNoteTe?: string;
}

const FESTIVAL_RULES: FestivalRule[] = [
  {
    id: 'ugadi',
    nameTe: 'ఉగాది (తెలుగు నూతన సంవత్సరం)',
    nameEn: 'Ugadi',
    descriptionTe:
      'చైత్ర శుక్ల పాడ్యమి — శాలివాహన సంవత్సరారంభం. పంచాంగ శ్రవణం, ఉగాది పచ్చడి, బ్రహ్మదేవ ఆరాధన.',
    category: 'major',
    masa: 0,
    paksha: 'shukla',
    tithi: 1,
    kala: 'sunrise',
    timingNoteTe: 'సూర్యోదయ వ్యాప్తి ప్రధానం',
  },
  {
    id: 'rama-navami',
    nameTe: 'శ్రీరామ నవమి',
    nameEn: 'Sri Rama Navami',
    descriptionTe: 'చైత్ర శుక్ల నవమి — శ్రీరామ పట్టాభిషేకం. రామాయణ పారాయణం, సీతారామ కల్యాణం.',
    category: 'major',
    masa: 0,
    paksha: 'shukla',
    tithi: 9,
    kala: 'madhyahna',
    timingNoteTe: 'మధ్యాహ్న కాలం ప్రధానం',
  },
  {
    id: 'hanuman-jayanti',
    nameTe: 'హనుమాన్ జయంతి',
    nameEn: 'Hanuman Jayanti',
    descriptionTe: 'చైత్ర పౌర్ణమి — ఆంజనేయ స్వామి ఆవిర్భావం. హనుమాన్ చాలీసా, సుందరకాండ పారాయణం.',
    category: 'major',
    masa: 0,
    paksha: 'shukla',
    tithi: 15,
    kala: 'sunrise',
  },
  {
    id: 'akshaya-tritiya',
    nameTe: 'అక్షయ తృతీయ',
    nameEn: 'Akshaya Tritiya',
    descriptionTe: 'వైశాఖ శుక్ల తదియ — బంగారం, భూమి కొనుగోలు, దాన ధర్మాలకు అత్యంత శుభం.',
    category: 'major',
    masa: 1,
    paksha: 'shukla',
    tithi: 3,
    kala: 'sunrise',
  },
  {
    id: 'nrusimha-jayanti',
    nameTe: 'నృసింహ జయంతి',
    nameEn: 'Nrusimha Jayanti',
    descriptionTe: 'వైశాఖ శుక్ల చతుర్దశి — లక్ష్మీనృసింహ ఆవిర్భావం. స్తోత్ర పారాయణం, ఉపవాసం.',
    category: 'major',
    masa: 1,
    paksha: 'shukla',
    tithi: 14,
    kala: 'pradosha',
  },
  {
    id: 'vata-savitri',
    nameTe: 'వట సావిత్రి వ్రతం',
    nameEn: 'Vata Savitri Vratam',
    descriptionTe: 'జ్యేష్ఠ పౌర్ణమి — సౌభాగ్య ప్రాప్తికి మర్రిచెట్టు పూజ.',
    category: 'vratam',
    masa: 2,
    paksha: 'shukla',
    tithi: 15,
    kala: 'sunrise',
  },
  {
    id: 'guru-purnima',
    nameTe: 'గురు పౌర్ణమి',
    nameEn: 'Guru Purnima',
    descriptionTe: 'ఆషాఢ పౌర్ణమి — వేదవ్యాస, గురుపరంపర ఆరాధన.',
    category: 'major',
    masa: 3,
    paksha: 'shukla',
    tithi: 15,
    kala: 'sunrise',
  },
  {
    id: 'varalakshmi-vratam',
    nameTe: 'వరలక్ష్మీ వ్రతం',
    nameEn: 'Varalakshmi Vratam',
    descriptionTe: 'శ్రావణ శుక్ల శుక్రవారం (పౌర్ణమికి ముందు) — లక్ష్మీదేవి పూజ, వర ప్రాప్తి.',
    category: 'vratam',
    masa: 4,
    paksha: 'shukla',
    weekday: 5,
    timingNoteTe: 'శుక్ల పక్ష శుక్రవారం, పౌర్ణమికి పూర్వం',
  },
  {
    id: 'raksha-bandhan',
    nameTe: 'రాఖీ పౌర్ణమి / శ్రావణ పౌర్ణమి',
    nameEn: 'Raksha Bandhan / Shravana Purnima',
    descriptionTe: 'శ్రావణ పౌర్ణమి — రక్షాబంధనం, ఉపాకర్మ, ఋగ్వేద ఉపాకర్మ తదితరాలు.',
    category: 'major',
    masa: 4,
    paksha: 'shukla',
    tithi: 15,
    kala: 'sunrise',
  },
  {
    id: 'krishna-janmashtami',
    nameTe: 'శ్రీకృష్ణ జన్మాష్టమి',
    nameEn: 'Krishna Janmashtami',
    descriptionTe: 'శ్రావణ కృష్ణ అష్టమి — నిశీథ కాలంలో కృష్ణాష్టమి పూజ, ఉపవాసం, రాత్రి జాగరణ.',
    category: 'major',
    masa: 4,
    paksha: 'krishna',
    tithi: 8,
    kala: 'sunrise',
    timingNoteTe: 'అష్టమి సూర్యోదయ వ్యాప్తి; రాత్రి జాగరణ, నిశీథ పూజ',
  },
  {
    id: 'rishi-panchami',
    nameTe: 'ఋషి పంచమి',
    nameEn: 'Rishi Panchami',
    descriptionTe: 'భాద్రపద శుక్ల పంచమి — సప్త ఋషుల ఆరాధన.',
    category: 'vratam',
    masa: 5,
    paksha: 'shukla',
    tithi: 5,
    kala: 'madhyahna',
  },
  {
    id: 'vinayaka-chavithi',
    nameTe: 'వినాయక చవితి',
    nameEn: 'Vinayaka Chavithi',
    descriptionTe: 'భాద్రపద శుక్ల చతుర్థి — గణపతి ప్రతిష్ఠాపన. మధ్యాహ్న కాల పూజ ప్రధానం.',
    category: 'major',
    masa: 5,
    paksha: 'shukla',
    tithi: 4,
    kala: 'madhyahna',
    timingNoteTe: 'మధ్యాహ్న కాలం ప్రధానం (చంద్రోదయం కాదు)',
  },
  {
    id: 'ananta-chaturdashi',
    nameTe: 'అనంత చతుర్దశి',
    nameEn: 'Ananta Chaturdashi',
    descriptionTe: 'భాద్రపద శుక్ల చతుర్దశి — అనంత పద్మనాభ వ్రతం.',
    category: 'vratam',
    masa: 5,
    paksha: 'shukla',
    tithi: 14,
    kala: 'sunrise',
  },
  {
    id: 'pitru-paksha-start',
    nameTe: 'పితృ పక్షారంభం (మహాలయ పక్షం)',
    nameEn: 'Pitru Paksha begins',
    descriptionTe: 'భాద్రపద పౌర్ణమి తర్వాత — పదహారు రోజుల పితృ కర్మలు (శ్రాద్ధాలు).',
    category: 'major',
    masa: 5,
    paksha: 'krishna',
    tithi: 1,
    kala: 'sunrise',
  },
  {
    id: 'mahalaya-amavasya',
    nameTe: 'మహాలయ అమావాస్య',
    nameEn: 'Mahalaya Amavasya',
    descriptionTe:
      'భాద్రపద అమావాస్య (పితృ అమావాస్య) — పితృ దేవతలకు తర్పణాలు, శ్రాద్ధం, మహాలయ పక్ష సమాప్తి.',
    category: 'major',
    masa: 5,
    paksha: 'krishna',
    tithi: 15,
    kala: 'madhyahna',
  },
  {
    id: 'navaratri-start',
    nameTe: 'శరన్నవరాత్రులు ఆరంభం',
    nameEn: 'Sharad Navaratri begins',
    descriptionTe: 'ఆశ్వయుజ శుక్ల పాడ్యమి — దుర్గా ఉపాసన, ఘటస్థాపన.',
    category: 'major',
    masa: 6,
    paksha: 'shukla',
    tithi: 1,
    kala: 'sunrise',
  },
  {
    id: 'atla-taddi',
    nameTe: 'అట్ల తద్ది',
    nameEn: 'Atla Taddi',
    descriptionTe:
      'ఆశ్వయుజ బహుళ తదియ — పౌర్ణమి తర్వాత మూడో రోజు. తెలుగు మహిళల ఉపవాస వ్రతం; అట్లు (అట్టు) నైవేద్యం, చంద్ర దర్శనం తర్వాత పారణ.',
    category: 'vratam',
    masa: 6,
    paksha: 'krishna',
    tithi: 3,
    kala: 'sunrise',
    timingNoteTe: 'చంద్రోదయం తర్వాత పారణ (అట్ల తద్ది నోము)',
  },
  {
    id: 'durga-ashtami',
    nameTe: 'దుర్గాష్టమి',
    nameEn: 'Durga Ashtami',
    descriptionTe: 'ఆశ్వయుజ శుక్ల అష్టమి — దుర్గా పూజ, ఆయుధ పూజ.',
    category: 'major',
    masa: 6,
    paksha: 'shukla',
    tithi: 8,
    kala: 'sunrise',
  },
  {
    id: 'maha-navami',
    nameTe: 'మహా నవమి',
    nameEn: 'Maha Navami',
    descriptionTe: 'ఆశ్వయుజ శుక్ల నవమి — సరస్వతీ పూజ, సద్దుల బతుకమ్మ (తెలంగాణ).',
    category: 'major',
    masa: 6,
    paksha: 'shukla',
    tithi: 9,
    kala: 'sunrise',
  },
  {
    id: 'vijayadasami',
    nameTe: 'విజయ దశమి (దసరా)',
    nameEn: 'Vijayadasami / Dasara',
    descriptionTe: 'ఆశ్వయుజ శుక్ల దశమి — రావణ వధ, శమీ పూజ, విద్యారంభానికి శుభం.',
    category: 'major',
    masa: 6,
    paksha: 'shukla',
    tithi: 10,
    kala: 'sunrise',
  },
  {
    id: 'deepavali',
    nameTe: 'దీపావళి (నరక చతుర్దశి)',
    nameEn: 'Deepavali / Naraka Chaturdashi',
    descriptionTe:
      'ఆశ్వయుజ కృష్ణ చతుర్దశి — తెలుగు సంప్రదాయంలో అభ్యంగన స్నానం, లక్ష్మీ పూజ, దీపోత్సవం.',
    category: 'major',
    masa: 6,
    paksha: 'krishna',
    tithi: 14,
    kala: 'sunrise',
  },
  {
    id: 'naga-panchami',
    nameTe: 'నాగ పంచమి',
    nameEn: 'Naga Panchami',
    descriptionTe:
      'శ్రావణ శుక్ల పంచమి — నాగేంద్రుల ఆరాధన, పుట్టలకు పాలు, నువ్వుల నూనె. ఆయురారోగ్య, సర్ప భయ నివారణ.',
    category: 'major',
    masa: 4,
    paksha: 'shukla',
    tithi: 5,
    kala: 'sunrise',
    timingNoteTe: 'సూర్యోదయ వ్యాప్తి ప్రధానం',
  },
  {
    id: 'bheemana-amavasya',
    nameTe: 'భీమన అమావాస్య',
    nameEn: 'Bheemana Amavasya',
    descriptionTe:
      'ఆషాఢ అమావాస్య — స్త్రీలు భీమేశ్వరుడికి (శివుడు) ప్రదీప పూజ చేసి, ముడుపులు కట్టి సౌభాగ్యం కోరుకుంటారు.',
    category: 'vratam',
    masa: 3,
    paksha: 'krishna',
    tithi: 15,
    kala: 'sunrise',
    timingNoteTe: 'ఆషాఢ అమావాస్య — ప్రదోష కాలంలో ముడుపు పూజ',
  },
  {
    id: 'nagula-chavithi',
    nameTe: 'నాగుల చవితి',
    nameEn: 'Nagula Chavithi',
    descriptionTe: 'కార్తీక శుక్ల చతుర్థి — నాగ దేవతల పూజ, పుట్టలో పాలు పోయడం.',
    category: 'vratam',
    masa: 7,
    paksha: 'shukla',
    tithi: 4,
    kala: 'sunrise',
  },
  {
    id: 'karthika-purnima',
    nameTe: 'కార్తీక పౌర్ణమి / కార్తీక దీపం',
    nameEn: 'Karthika Purnima',
    descriptionTe: 'కార్తీక పౌర్ణమి — దీపోత్సవం, తులసి కల్యాణం, దీప దానం.',
    category: 'major',
    masa: 7,
    paksha: 'shukla',
    tithi: 15,
    kala: 'sunrise',
  },
  {
    id: 'vaikunta-ekadashi',
    nameTe: 'వైకుంఠ ఏకాదశి',
    nameEn: 'Vaikunta Ekadashi',
    descriptionTe:
      'ధనుర్మాసంలో (సూర్యుడు ధనుస్సు రాశిలో ఉన్నప్పుడు) వచ్చే శుక్ల ఏకాదశి — విష్ణు ద్వార దర్శనం, మోక్ష ప్రదాయిని. ధనుర్మాసం బయట వచ్చే మార్గశిర ఏకాదశిని కాదు; ధనుర్మాసంలోని ఏకాదశినే వైకుంఠ ఏకాదశిగా ఆచరిస్తారు.',
    category: 'major',
    sunSign: 8,
    paksha: 'shukla',
    tithi: 11,
    kala: 'sunrise',
  },
  {
    id: 'datta-jayanti',
    nameTe: 'దత్తాత్రేయ జయంతి',
    nameEn: 'Datta Jayanti',
    descriptionTe: 'మార్గశిర పౌర్ణమి — దత్తాత్రేయ ఆవిర్భావం.',
    category: 'major',
    masa: 8,
    paksha: 'shukla',
    tithi: 15,
    kala: 'sunrise',
  },
  {
    id: 'bhishma-ekadashi',
    nameTe: 'భీష్మ ఏకాదశి',
    nameEn: 'Bhishma Ekadashi',
    descriptionTe: 'మాఘ శుక్ల ఏకాదశి — విష్ణు సహస్రనామ ప్రకటన దినం.',
    category: 'major',
    masa: 10,
    paksha: 'shukla',
    tithi: 11,
    kala: 'sunrise',
  },
  {
    id: 'vasanta-panchami',
    nameTe: 'వసంత పంచమి (శ్రీ పంచమి)',
    nameEn: 'Vasanta Panchami',
    descriptionTe: 'మాఘ శుక్ల పంచమి — సరస్వతీ పూజ, విద్యారంభం.',
    category: 'major',
    masa: 10,
    paksha: 'shukla',
    tithi: 5,
    kala: 'madhyahna',
  },
  {
    id: 'rathasapthami',
    nameTe: 'రథ సప్తమి',
    nameEn: 'Ratha Saptami',
    descriptionTe: 'మాఘ శుక్ల సప్తమి — సూర్య భగవానుని ఆరాధన, సూర్య నమస్కారం.',
    category: 'major',
    masa: 10,
    paksha: 'shukla',
    tithi: 7,
    kala: 'sunrise',
  },
  {
    id: 'maha-shivaratri',
    nameTe: 'మహా శివరాత్రి',
    nameEn: 'Maha Shivaratri',
    descriptionTe: 'మాఘ కృష్ణ చతుర్దశి — నిశీథ కాల శివ లింగాభిషేకం, చతుర్థ ప్రహర పూజ.',
    category: 'major',
    masa: 10,
    paksha: 'krishna',
    tithi: 14,
    kala: 'nishita',
    timingNoteTe: 'నిశీథ కాలం ప్రధానం',
  },
  {
    id: 'holi',
    nameTe: 'హోలీ (కామ దహనం)',
    nameEn: 'Holi / Kama Dahana',
    descriptionTe: 'ఫాల్గుణ పౌర్ణమి — కామ దహనం (హోలికా దహనం), మరుసటి రోజు రంగుల పండుగ.',
    category: 'major',
    masa: 11,
    paksha: 'shukla',
    tithi: 15,
    kala: 'sunrise',
  },
  {
    id: 'ekadashi-shukla',
    nameTe: 'శుక్ల ఏకాదశి',
    nameEn: 'Shukla Ekadashi',
    descriptionTe: 'నెలవారీ శుక్ల ఏకాదశి — విష్ణు ఉపవాస వ్రతం.',
    category: 'monthly',
    paksha: 'shukla',
    tithi: 11,
    kala: 'sunrise',
  },
  {
    id: 'ekadashi-krishna',
    nameTe: 'కృష్ణ ఏకాదశి',
    nameEn: 'Krishna Ekadashi',
    descriptionTe: 'నెలవారీ కృష్ణ ఏకాదశి — విష్ణు ఉపవాస వ్రతం.',
    category: 'monthly',
    paksha: 'krishna',
    tithi: 11,
    kala: 'sunrise',
  },
  {
    id: 'purnima',
    nameTe: 'పౌర్ణమి',
    nameEn: 'Purnima',
    descriptionTe: 'నెలవారీ పౌర్ణమి — సత్యనారాయణ వ్రతానికి ఉత్తమ దినం.',
    category: 'monthly',
    paksha: 'shukla',
    tithi: 15,
    kala: 'sunrise',
  },
  {
    id: 'amavasya',
    nameTe: 'అమావాస్య',
    nameEn: 'Amavasya',
    descriptionTe: 'నెలవారీ అమావాస్య — పితృ తర్పణాలు, దీప దానం.',
    category: 'monthly',
    paksha: 'krishna',
    tithi: 15,
    kala: 'sunrise',
  },
  {
    id: 'sankashti',
    nameTe: 'సంకష్టి చతుర్థి',
    nameEn: 'Sankashti Chaturthi',
    descriptionTe:
      'నెలవారీ కృష్ణ చతుర్థి — చంద్రోదయ కాలంలో చతుర్థి వ్యాపించిన రోజున గణపతి ఉపవాసం, చంద్ర దర్శనం.',
    category: 'monthly',
    paksha: 'krishna',
    tithi: 4,
    kala: 'moonrise',
  },
  {
    id: 'pradosham-shukla',
    nameTe: 'ప్రదోష వ్రతం (శుక్ల)',
    nameEn: 'Pradosham (Shukla)',
    descriptionTe: 'శుక్ల త్రయోదశి ప్రదోష కాలం — శివ పూజ, నంది వాహన సేవ.',
    category: 'monthly',
    paksha: 'shukla',
    tithi: 13,
    kala: 'pradosha',
  },
  {
    id: 'pradosham-krishna',
    nameTe: 'ప్రదోష వ్రతం (కృష్ణ)',
    nameEn: 'Pradosham (Krishna)',
    descriptionTe: 'కృష్ణ త్రయోదశి ప్రదోష కాలం — శివ పూజ, అభిషేకం.',
    category: 'monthly',
    paksha: 'krishna',
    tithi: 13,
    kala: 'pradosha',
  },
];

/* ================================================================== *
 *  Main day panchanga computation
 * ================================================================== */

/* ------------------------------------------------------------------ *
 *  సూర్యోదయం / సూర్యాస్తమయం — ఇక సుమారు గణన కాదు
 * ------------------------------------------------------------------ *
 *  మునుపు ఇక్కడ NOAA యొక్క సుమారు సూత్రం (±2 నిమిషాలు) వాడబడేది. అది
 *  పంచాంగ దినాన్ని (సూర్యోదయాది) సరిగ్గా నిర్ణయించలేక, తిథి/నక్షత్రం
 *  సరిహద్దుల్లో పొరపాట్లు చేసేది — ముఖ్యంగా సంక్రమణి, ఏకాదశి, శివరాత్రి
 *  వంటి సందర్భాల్లో. ఇప్పుడు ప్రతి రోజూ దృక్ పంచాంగ నిర్వచనంతో
 *  (పై అంచు + 34′ వక్రీభవనం) కచ్చితంగా లెక్కిస్తాము, మరియు ఫలితాన్ని
 *  కాష్ చేస్తాము — ఏడాది స్కాన్ కూడా వేగంగానే ఉంటుంది.
 */
const sunTimeCache = new Map<string, { sunriseJd: number; sunsetJd: number }>();
const sunKey = (dateISO: string, lat: number, lng: number, tz: number) =>
  `${dateISO}|${lat.toFixed(4)}|${lng.toFixed(4)}|${tz}`;

export function approximateSunTimes(
  dateISO: string,
  lat: number,
  lng: number,
  tzOffsetHours: number
): { sunriseJd: number; sunsetJd: number } {
  const key = sunKey(dateISO, lat, lng, tzOffsetHours);
  const hit = sunTimeCache.get(key);
  if (hit) return hit;
  const [y, m, d] = dateISO.split('-').map(Number);
  const fallbackNoon = jdFromMs(Date.UTC(y, m - 1, d, 12)) - tzOffsetHours / 24;
  const sunriseJd = sunriseJdForLocalDate(dateISO, lat, lng, tzOffsetHours) ?? fallbackNoon - 6 / 24;
  const sunsetJd = sunsetJdForLocalDate(dateISO, lat, lng, tzOffsetHours) ?? fallbackNoon + 6 / 24;
  const value = { sunriseJd, sunsetJd };
  if (sunTimeCache.size > 4000) sunTimeCache.clear();
  sunTimeCache.set(key, value);
  return value;
}

interface LightPanchanga {
  tithiAtSunrise: number;
  tithiAtMadhyahna: number;
  tithiAtPradosha: number;
  tithiAtNishita: number;
  nakshatraAtSunrise: number;
  masaIndex: number;
  masaIsAdhika: boolean;
  weekday: number;
  sunriseJd: number;
  sunsetJd: number;
  madhyahnaJd: number;
  pradoshaJd: number;
  nishitaJd: number;
  sunSignIndex: number;
  /** Chandrodaya — needed by Saṅkaṣṭi Caturthī, which is a moonrise rule. */
  moonriseJd: number | null;
  tithiAtMoonrise: number | null;
}

export function computeLightPanchanga(dateISO: string, geo: GeoContext, mode: SiderealMode): LightPanchanga {
  const { sunriseJd, sunsetJd } = approximateSunTimes(dateISO, geo.lat, geo.lng, geo.tzOffsetHours);
  const moonriseJd = riseSetForLocalDate(dateISO, geo.lat, geo.lng, geo.tzOffsetHours).moonriseJd;
  const dayLen = Math.max(0.25, sunsetJd - sunriseJd);
  const nightLen = Math.max(0.25, 1 - dayLen);
  const madhyahnaJd = sunriseJd + dayLen / 2;
  const pradoshaJd = sunsetJd + nightLen * 0.1;
  const nishitaJd = sunsetJd + nightLen * 0.5;
  const masa = resolveMasa(sunriseJd + 1e-3, mode);
  return {
    tithiAtSunrise: tithiIndex(sunriseJd),
    tithiAtMadhyahna: tithiIndex(madhyahnaJd),
    tithiAtPradosha: tithiIndex(pradoshaJd),
    tithiAtNishita: tithiIndex(nishitaJd),
    nakshatraAtSunrise: nakshatraIndexAt(sunriseJd, mode),
    masaIndex: masa.masaIndex,
    masaIsAdhika: masa.isAdhika,
    weekday: civilWeekdayAt(sunriseJd, geo.tzOffsetHours),
    sunriseJd,
    sunsetJd,
    madhyahnaJd,
    pradoshaJd,
    nishitaJd,
    sunSignIndex: Math.floor(siderealLongitude('Sun', sunriseJd, mode) / 30) % 12,
    moonriseJd: moonriseJd,
    tithiAtMoonrise: moonriseJd === null ? null : tithiIndex(moonriseJd),
  };
}

function tithiMatches(light: LightPanchanga, rule: FestivalRule): boolean {
  const num = rule.tithi ?? 0;
  const targetIndex =
    rule.paksha === 'shukla' ? num - 1 : rule.paksha === 'krishna' ? 15 + (num - 1) : -1;
  if (targetIndex < 0) return false;
  const kala = rule.kala ?? 'sunrise';
  const val =
    kala === 'madhyahna'
      ? light.tithiAtMadhyahna
      : kala === 'pradosha'
        ? light.tithiAtPradosha
        : kala === 'nishita'
          ? light.tithiAtNishita
          : kala === 'moonrise'
            ? (light.tithiAtMoonrise ?? light.tithiAtSunrise)
            : light.tithiAtSunrise;
  if (val !== targetIndex) return false;
  if (rule.sunSign !== undefined && light.sunSignIndex !== rule.sunSign) return false;
  if (rule.masa !== undefined) {
    if (light.masaIndex !== rule.masa) return false;
    // For adhika months the festival is observed in the nija (normal) month
    if (light.masaIsAdhika && rule.category !== 'monthly') return false;
  }
  return true;
}

/**
 * మకర సంక్రమణ పర్వ దినం — తెలుగు పంచాంగ సంప్రదాయం.
 *
 * ప్రవేశం మధ్యాహ్నానికి పూర్వం (సూర్యోదయం తర్వాత) జరిగితే అదే పౌర దినం;
 * మధ్యాహ్నం తర్వాత లేదా రాత్రి జరిగితే మరుసటి సూర్యోదయం పడే దినం.
 *   • 2023-01-14 20:44 → 15 జనవరి   • 2024-01-15 02:43 → 15 జనవరి
 *   • 2025-01-14 08:55 → 14 జనవరి   • 2026-01-14 15:07 → 15 జనవరి
 * ఇదే భోగి (ముందు రోజు) / కనుమ (మరుసటి రోజు) తేదీలను నిర్ణయిస్తుంది.
 * (దృక్ పంచాంగం ప్రవేశ పౌర దినాన్ని 2026లో 14 జనవరి అని చూపిస్తుంది; తెలుగు
 *  పంచాంగాలు — ప్రొకేరళ తెలుగు క్యాలెండర్, ఆంధ్రప్రదేశ్/తెలంగాణ ప్రభుత్వ పండుగలు —
 *  14 భోగి / 15 సంక్రమణి / 16 కనుమ అని చూపిస్తాయి. తెలుగు సంప్రదాయమే ఇక్కడ ప్రమాణం.)
 */
export function makaraSankrantiDayISO(
  ingressJd: number,
  lat: number,
  lng: number,
  tz: number
): string {
  const ingressISO = civilDateAt(ingressJd, tz);
  const noon = localMidnightJd(ingressISO, tz) + 0.5;
  const srToday = riseSetForLocalDate(ingressISO, lat, lng, tz).sunriseJd;
  if (srToday !== null && ingressJd > srToday && ingressJd <= noon) return ingressISO;
  if (srToday !== null && ingressJd <= srToday) return ingressISO; // రాత్రి → ఈ ఉదయమే
  return civilDateAt(ingressJd + 1, tz);
}

/* ---------- సంక్రమణ దినాలు (సంవత్సరానికి ఒకసారి) ---------- */
const sankrantiDayCache = new Map<string, Map<string, { sign: number; jd: number }>>();

/**
 * "సంక్రమణ దినం" = ప్రవేశ క్షణం పడే పౌర దినం (దృక్ పంచాంగ ప్రమాణం).
 * సూర్యోదయ రాశి మార్పు ఆధారంగా చూస్తే, ప్రవేశం సూర్యోదయానికి ముందు జరిగినప్పుడు
 * ఒక రోజు ముందుకు జరుగుతుంది (ఉదా. ధనుర్మాసం 2025-12-16 04:20 → 16వ తేదీనే).
 */
function sankrantiDaysForYear(
  year: number,
  mode: SiderealMode,
  tz: number,
  lat = 17.385,
  lng = 78.4867
): Map<string, { sign: number; jd: number }> {
  const key = `${year}|${mode}|${tz}|${lat.toFixed(3)}|${lng.toFixed(3)}`;
  const hit = sankrantiDayCache.get(key);
  if (hit) return hit;
  const map = new Map<string, { sign: number; jd: number }>();
  for (let sign = 0; sign < 12; sign++) {
    const jd = sankrantiJd(year, sign, mode);
    let dateISO = civilDateAt(jd, tz);
    if (sign === 9) {
      // మకర సంక్రమణం — తెలుగు పంచాంగ పర్వ దిన నియమం
      dateISO = makaraSankrantiDayISO(jd, lat, lng, tz);
    }
    if (Number(dateISO.slice(0, 4)) !== year) continue;
    map.set(dateISO, { sign, jd });
  }
  sankrantiDayCache.set(key, map);
  return map;
}

/**
 * సూర్య సంబంధ పర్వాలు + ఉగాది — రాశి ప్రవేశం, భోగి, కనుమ, ధనుర్మాసం.
 * ఇవి తిథి నియమాలతో రావు, కాబట్టి రోజు వీక్షణలు మరియు సంవత్సర/రాబోయే పర్వాల
 * జాబితా — రెండూ ఇదే ఒకే ఫంక్షన్ నుంచి తీసుకుంటాయి (ఒకే నిజం).
 */
function computedObservances(
  dateISO: string,
  geo: GeoContext,
  mode: SiderealMode,
  sunriseJd: number,
  nextSunriseJd: number
): FestivalEntry[] {
  const tz = geo.tzOffsetHours;
  const out: FestivalEntry[] = [];

  // ---- ఉగాది (చైత్ర శుక్ల పాడ్యమి; క్షయ పాడ్యమి సహా లెక్కించబడుతుంది)
  const gy = Number(dateISO.slice(0, 4));
  if (ugadiDateISO(gy, mode, tz, geo.lat, geo.lng) === dateISO) {
    out.push({
      id: 'ugadi',
      nameTe: 'ఉగాది (తెలుగు నూతన సంవత్సరం)',
      nameEn: 'Ugadi',
      dateISO,
      descriptionTe:
        'చైత్ర శుక్ల పాడ్యమి — శాలివాహన సంవత్సరారంభం. పంచాంగ శ్రవణం, ఉగాది పచ్చడి, బ్రహ్మదేవ ఆరాధన.',
      category: 'major',
      timingNoteTe: 'సూర్యోదయ వ్యాప్తి ప్రధానం',
    });
  }

  // ---- సంక్రమణం (సూర్యుడు నిరయన రాశి మార్చే పౌర దినం)
  const SIGN_TE = ['మేష', 'వృషభ', 'మిథున', 'కర్కాటక', 'సింహ', 'కన్య', 'తులా', 'వృశ్చిక', 'ధనుస్సు', 'మకర', 'కుంభ', 'మీన'];
  const days = sankrantiDaysForYear(gy, mode, tz, geo.lat, geo.lng);
  const todayIngress = days.get(dateISO);
  if (todayIngress) {
    const entering = todayIngress.sign;
    const ingress = todayIngress.jd;
    let nameTe = `${SIGN_TE[entering]} సంక్రమణం`;
    let descTe = `సూర్యుడు ${SIGN_TE[entering]} రాశిలోకి ప్రవేశించే పుణ్యకాలం. స్నాన, దాన, జప కర్మలకు శుభం.`;
    let category: FestivalEntry['category'] = 'solar';
    if (entering === 9) {
      nameTe = 'మకర సంక్రమణం (పెద్ద పండుగ / పొంగల్)';
      descTe =
        'మకర సంక్రమణం — పెద్దలకు పాద పూజ, నువ్వుల నూనె, బెల్లం, పండ్ల దానం. ఉత్తరాయణ పుణ్యకాలం ఆరంభం. స్నాన దాన జపాలకు మహా పుణ్యం.';
      category = 'major';
    } else if (entering === 0) {
      nameTe = 'మేష సంక్రమణం (విషువత్)';
      descTe = 'మేష సంక్రమణం — వసంత విషువత్ పర్వం; నవాన్న ప్రాశనం, సూర్యారాధన, ఉగాది సన్నాహం.';
      category = 'major';
    } else if (entering === 6) {
      nameTe = 'తులా సంక్రమణం';
      descTe = 'తులా సంక్రమణం — దక్షిణాయన పుణ్యకాలం; పితృ తర్పణాలు, దాన ధర్మాలు, మహాలయ పక్ష ఆరంభం.';
      category = 'major';
    } else if (entering === 8) {
      nameTe = 'ధనుర్మాసారంభం (ధనుస్సు సంక్రమణం)';
      descTe = 'ధనుర్మాసం ఆరంభం — మార్గశిర ధనుర్మాస పూజలు, తిరుప్పావై, సూర్య నమస్కారాలు.';
      category = 'major';
    }
    out.push({
      id: `sankranti-${entering}`,
      nameTe,
      nameEn: `${TELUGU_RASIS[entering]?.nameEn ?? ''} Sankranti`,
      dateISO,
      descriptionTe: descTe,
      category,
      timingNoteTe: `సంక్రమణ సమయం: ${formatLocalHM(ingress, tz)}`,
    });
  }

  // ---- భోగి / కనుమ — మకర సంక్రమణం చుట్టూ తెలుగు సంప్రదాయం
  if (days.get(addDaysISO(dateISO, 1))?.sign === 9) {
    out.push({
      id: 'bhogi',
      nameTe: 'భోగి (మకర సంక్రమణ పూర్వ దినం)',
      nameEn: 'Bhogi',
      dateISO,
      descriptionTe: 'భోగి మంటలు, పాత వస్తు త్యాగం, ఇంద్ర పూజ, గంగా స్నానం.',
      category: 'major',
    });
  }
  if (days.get(addDaysISO(dateISO, -1))?.sign === 9) {
    out.push({
      id: 'kanuma',
      nameTe: 'కనుమ (మకర సంక్రమణం మరుసటి రోజు)',
      nameEn: 'Kanuma',
      dateISO,
      descriptionTe: 'పశు పూజ, రైతు సన్మానం, గ్రామ దేవతల ఆరాధన.',
      category: 'major',
    });
  }

  return out;
}

function festivalsForLightPanchanga(
  dateISO: string,
  light: LightPanchanga,
  geo: GeoContext,
  mode: SiderealMode,
  rules = FESTIVAL_RULES
): FestivalEntry[] {
  const out: FestivalEntry[] = [];
  for (const rule of rules) {
    // ఉగాది నియమాన్ని ఇక్కడ అమలు చేయము — ugadiDateISO లెక్క (క్షయ పాడ్యమి సహా)
    // ఒక్కటే ప్రామాణిక మార్గం. computedObservances లో చేరుస్తాము.
    if (rule.id === 'ugadi') continue;
    let matched = false;
    if (rule.weekday !== undefined) {
      // వార + పక్ష ఆధారిత వ్రతాలు (ఉదా. వరలక్ష్మీ వ్రతం):
      // శ్రావణ శుక్ల పక్షంలోని *చివరి* శుక్రవారం — సంప్రదాయ నిర్వచనం.
      const inPaksha =
        rule.paksha === 'shukla' ? light.tithiAtSunrise < 15 : light.tithiAtSunrise >= 15;
      const tithiNum = (light.tithiAtSunrise % 15) + 1;
      // "శ్రావణ పౌర్ణమికి ముందు చివరి శుక్రవారం" — దక్షిణ (తెలుగు) సంప్రదాయం.
      // పౌర్ణమి దినం సూర్యోదయాన పౌర్ణమి తిథి ఉన్న రోజు; ఆ రోజు కంటే ముందున్న
      // చివరి శుక్రవారమే వ్రతం. (2026: పౌర్ణమి 28 ఆగస్టు → వ్రతం 21 ఆగస్టు.)
      let daysToPurnima = -1;
      if (rule.weekday === light.weekday && light.masaIndex === rule.masa && !light.masaIsAdhika) {
        for (let k = 1; k <= 7; k++) {
          const ahead = computeLightPanchanga(addDaysISO(dateISO, k), geo, mode);
          if (ahead.tithiAtSunrise === 14 && !ahead.masaIsAdhika) {
            daysToPurnima = k;
            break;
          }
        }
      }
      matched =
        light.weekday === rule.weekday &&
        light.masaIndex === rule.masa &&
        !light.masaIsAdhika &&
        inPaksha &&
        tithiNum <= 14 &&
        daysToPurnima > 0;
    } else {
      matched = tithiMatches(light, rule);
    }
    if (matched) {
      out.push({
        id: rule.id,
        nameTe: rule.nameTe,
        nameEn: rule.nameEn,
        dateISO,
        descriptionTe: rule.descriptionTe,
        category: rule.category,
        timingNoteTe: rule.timingNoteTe,
      });
    }
  }
  return out;
}

/**
 * Collects festivals day-by-day between two dates and removes the classical
 * "tithi spans two sunrises" duplicates. When the same rule matches on two
 * consecutive civil days the *later* day is kept — that is the day on which the
 * tithi has fully begun before sunrise, which is what panchangams print.
 * The scan is padded by two days on each side so a span that starts before the
 * window is still resolved correctly.
 */
function collectFestivalsBetween(
  startISO: string,
  endISO: string,
  geo: GeoContext,
  mode: SiderealMode
): FestivalEntry[] {
  const tz = geo.tzOffsetHours;
  const padStart = addDaysISO(startISO, -3);
  const padEnd = addDaysISO(endISO, 3);
  const raw: FestivalEntry[] = [];
  /** tithi index → civil day on which that tithi *begins* */
  const tithiBeginDays = new Map<number, string[]>();
  /** tithi index → civil days on which that tithi prevails at sunrise */
  const tithiSunriseDays = new Map<number, Set<string>>();
  /** tithi index → civil days on which that tithi prevails at moonrise */
  const tithiMoonriseDays = new Map<number, Set<string>>();
  let [y, m, d] = padStart.split('-').map(Number);
  const cursor = new Date(Date.UTC(y, m - 1, d));
  for (let i = 0; i < 800; i++) {
    const dateISO = `${cursor.getUTCFullYear()}-${String(cursor.getUTCMonth() + 1).padStart(2, '0')}-${String(
      cursor.getUTCDate()
    ).padStart(2, '0')}`;
    if (dateISO > padEnd) break;
    const light = computeLightPanchanga(dateISO, geo, mode);
    raw.push(
      ...festivalsForLightPanchanga(dateISO, light, geo, mode),
      ...computedObservances(
        dateISO,
        geo,
        mode,
        light.sunriseJd,
        approximateSunTimes(addDaysISO(dateISO, 1), geo.lat, geo.lng, tz).sunriseJd
      )
    );

    const sunriseIdx = light.tithiAtSunrise;
    tithiSunriseDays.set(sunriseIdx, (tithiSunriseDays.get(sunriseIdx) ?? new Set()).add(dateISO));
    if (light.tithiAtMoonrise !== null) {
      tithiMoonriseDays.set(light.tithiAtMoonrise, (tithiMoonriseDays.get(light.tithiAtMoonrise) ?? new Set()).add(dateISO));
    }

    // Walk the tithi boundaries inside this sunrise-to-sunrise day so that a
    // kṣaya (skipped) tithi — one that never touches a sunrise — is still dated.
    const nextSunrise = approximateSunTimes(addDaysISO(dateISO, 1), geo.lat, geo.lng, tz).sunriseJd;
    const win = tithiWindow(light.sunriseJd);
    let idx = win.index;
    let start = win.startJd;
    let end = win.endJd;
    for (let guard = 0; guard < 4 && start < nextSunrise; guard++) {
      const beginISO = civilDateAt(start, tz);
      tithiBeginDays.set(idx, [...(tithiBeginDays.get(idx) ?? []), beginISO]);
      idx = (idx + 1) % 30;
      start = end;
      end = nextTithiBoundaryJd(start + 1e-6);
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  // ---- kṣaya tithis: monthly observances that would otherwise be missing ----
  const monthlyByTithi = new Map<number, FestivalRule>();
  for (const rule of FESTIVAL_RULES) {
    if (rule.category !== 'monthly' || rule.masa !== undefined || rule.tithi === undefined) continue;
    if (rule.kala && rule.kala !== 'sunrise') continue;
    const target = rule.paksha === 'shukla' ? rule.tithi - 1 : rule.paksha === 'krishna' ? 15 + rule.tithi - 1 : -1;
    if (target >= 0) monthlyByTithi.set(target, rule);
  }
  // ---- moonrise rules (Saṅkaṣṭi Caturthī): one observance per lunation ----
  for (const rule of FESTIVAL_RULES) {
    if (rule.category !== 'monthly' || rule.kala !== 'moonrise' || rule.tithi === undefined) continue;
    const target = rule.paksha === 'shukla' ? rule.tithi - 1 : rule.paksha === 'krishna' ? 15 + rule.tithi - 1 : -1;
    if (target < 0) continue;
    const days = [
      ...new Set([...(tithiSunriseDays.get(target) ?? []), ...(tithiBeginDays.get(target) ?? [])]),
    ].sort();
    const moonriseDays = tithiMoonriseDays.get(target) ?? new Set<string>();
    // group consecutive dates into lunation occurrences
    const runs: string[][] = [];
    for (const day of days) {
      const run = runs[runs.length - 1];
      if (run && addDaysISO(run[run.length - 1], 1) === day) run.push(day);
      else runs.push([day]);
    }
    for (const run of runs) {
      if (run.some((day) => moonriseDays.has(day))) continue; // moonrise match already produced
      const fallback = run[0];
      if (raw.some((f) => f.id === rule.id && f.dateISO === fallback)) continue;
      raw.push({
        id: rule.id,
        nameTe: rule.nameTe,
        nameEn: rule.nameEn,
        dateISO: fallback,
        descriptionTe: rule.descriptionTe,
        category: rule.category,
        timingNoteTe:
          'ఈ నెలలో చతుర్థి చంద్రోదయ కాలాన్ని తాకలేదు — తిథి ఆరంభ దినాన్ని ప్రామాణికంగా తీసుకున్నాము',
      });
    }
  }

  for (const [tithiIdx, rule] of monthlyByTithi) {
    const begins = tithiBeginDays.get(tithiIdx) ?? [];
    const sunriseDays = tithiSunriseDays.get(tithiIdx) ?? new Set<string>();
    for (const beginISO of begins) {
      const alsoNextSunrise = sunriseDays.has(addDaysISO(beginISO, 1));
      if (sunriseDays.has(beginISO) || alsoNextSunrise) continue; // normal or vṛddhi
      // kṣaya: the tithi begins after sunrise and ends before the next sunrise
      if (raw.some((f) => f.id === rule.id && f.dateISO === beginISO)) continue;
      raw.push({
        id: rule.id,
        nameTe: rule.nameTe,
        nameEn: rule.nameEn,
        dateISO: beginISO,
        descriptionTe: rule.descriptionTe,
        category: rule.category,
        timingNoteTe: 'క్షయ తిథి — తిథి ఆరంభ దినం ప్రకారం నిర్ణయించబడింది',
      });
    }
  }

  // group by rule id → keep the last day of each consecutive run
  const byId = new Map<string, FestivalEntry[]>();
  for (const f of raw) {
    const key = f.id;
    byId.set(key, [...(byId.get(key) ?? []), f]);
  }
  const kept: FestivalEntry[] = [];
  for (const list of byId.values()) {
    const sorted = [...list].sort((a, b) => (a.dateISO < b.dateISO ? -1 : 1));
    const runs: FestivalEntry[][] = [];
    for (const item of sorted) {
      const run = runs[runs.length - 1];
      if (run && addDaysISO(run[run.length - 1].dateISO, 1) === item.dateISO) run.push(item);
      else runs.push([item]);
    }
    for (const run of runs) kept.push(run[run.length - 1]);
  }

  void tz;
  return kept
    .filter((f) => f.dateISO >= startISO && f.dateISO <= endISO)
    .sort((a, b) => (a.dateISO < b.dateISO ? -1 : a.dateISO > b.dateISO ? 1 : 0));
}

/** Festivals for a single civil day (span-resolved, so a day never shows a duplicate). */
export function festivalsOnDate(dateISO: string, geo: GeoContext, mode: SiderealMode = 'lahiri'): FestivalEntry[] {
  return collectFestivalsBetween(dateISO, dateISO, geo, mode);
}

export function computeDayPanchanga(
  dateISO: string,
  geo: GeoContext,
  options: { siderealMode?: SiderealMode } = {}
): DayPanchanga {
  const mode = options.siderealMode ?? 'lahiri';
  const tz = geo.tzOffsetHours;
  const midnightJd = localMidnightJd(dateISO, tz);
  const rs = riseSetForLocalDate(dateISO, geo.lat, geo.lng, tz);
  const sunriseJd = rs.sunriseJd ?? midnightJd + 6 / 24;
  const sunsetJd = rs.sunsetJd ?? midnightJd + 18 / 24;
  const nextSunriseJd = (() => {
    const nextISO = civilDateAt(midnightJd + 1.2, tz);
    const nextRs = riseSetForLocalDate(nextISO, geo.lat, geo.lng, tz);
    return nextRs.sunriseJd ?? sunriseJd + 1;
  })();

  const dayLenJd = sunsetJd - sunriseJd;
  const nightLenJd = nextSunriseJd - sunsetJd;
  const muhurtaJd = dayLenJd / 15;
  const nightMuhurtaJd = nightLenJd / 15;
  const octantJd = dayLenJd / 8;
  const solarNoonJd = sunriseJd + dayLenJd / 2;
  const midnightJdNight = sunsetJd + nightLenJd / 2;

  const weekdayIndex = civilWeekdayAt(sunriseJd, tz);
  const vara = VARA_NAMES[weekdayIndex];

  // ----- Tithi
  const tWindow = tithiWindow(sunriseJd);
  const tIdx = tWindow.index;
  const tEnd = tWindow.endJd;
  const elong = moonSunElongation(sunriseJd);
  const tPercent = tWindow.percent;
  const pakshaTe = tIdx < 15 ? 'శుక్ల పక్షం' : 'కృష్ణ పక్షం';
  const pakshaEn = tIdx < 15 ? 'Shukla Paksha' : 'Krishna Paksha';

  // ----- Nakshatra
  const nWindow = nakshatraWindow(sunriseJd, mode);
  const nIdx = nWindow.index;
  const nEnd = nWindow.endJd;
  const nPercent = nWindow.percent;
  const nak = TELUGU_NAKSHATRAS[nIdx];

  // ----- Yoga
  const yWindow = yogaWindow(sunriseJd, mode);
  const yIdx = yWindow.index;
  const yEnd = yWindow.endJd;
  const yPercent = yWindow.percent;

  // ----- Karana
  const kWindow = karanaWindow(sunriseJd);
  const kIdx = kWindow.index;
  const kEnd = kWindow.endJd;
  const kName = karanaNameForIndex(kIdx);

  // Karana schedule across the civil day
  const karanaSchedule: DayPanchanga['karanaSchedule'] = [];
  const karanaJdWindows: { startJd: number; endJd: number; isBhadra: boolean }[] = [];
  {
    const dayEndJd = nextSunriseJd;
    let cursor = kWindow.startJd;
    let guard = 0;
    while (cursor < dayEndJd - 1e-4 && guard < 12) {
      const win = karanaWindow(cursor + 1e-4);
      const idx = win.index;
      const end = Math.min(win.endJd, dayEndJd);
      const info = karanaNameForIndex(idx);
      karanaJdWindows.push({
        startJd: Math.max(cursor, sunriseJd),
        endJd: end,
        isBhadra: info.isBhadra,
      });
      karanaSchedule.push({
        nameTe: info.te,
        nameEn: info.en,
        startTime: timeStr(Math.max(cursor, sunriseJd), tz),
        endTime: timeStr(end, tz),
        isBhadra: info.isBhadra,
      });
      cursor = end + 1e-5;
      guard += 1;
    }
  }

  // ----- Era / masa
  const era = resolveHinduEra(dateISO, geo, mode);

  // ----- Kala windows
  const kalas: KalaWindow[] = [];
  const rahuIdx = RAHU_OCTANTS[weekdayIndex] - 1;
  kalas.push(
    windowFromJd(
      'rahu',
      'రాహుకాలం',
      'Rahu Kalam',
      sunriseJd + rahuIdx * octantJd,
      sunriseJd + (rahuIdx + 1) * octantJd,
      tz,
      'inauspicious',
      'శుభ కార్యాలు, ప్రయాణాలు, గృహ ప్రవేశం నిషేధం'
    )
  );
  const yamaIdx = YAMA_OCTANTS[weekdayIndex] - 1;
  kalas.push(
    windowFromJd(
      'yamaganda',
      'యమగండం',
      'Yamagandam',
      sunriseJd + yamaIdx * octantJd,
      sunriseJd + (yamaIdx + 1) * octantJd,
      tz,
      'inauspicious',
      'మంగళ కార్యాలు, నూతన వ్యాపారారంభం నిషేధం'
    )
  );
  const gulikaIdx = GULIKA_OCTANTS[weekdayIndex] - 1;
  kalas.push(
    windowFromJd(
      'gulika',
      'గుళిక కాలం',
      'Gulika Kalam',
      sunriseJd + gulikaIdx * octantJd,
      sunriseJd + (gulikaIdx + 1) * octantJd,
      tz,
      'inauspicious',
      'దానం, జపం తప్ప శుభ కార్యాలు వర్జించాలి'
    )
  );

  DURMUHURTA_NUMBERS[weekdayIndex].forEach((num, i) => {
    kalas.push(
      windowFromJd(
        `durmuhurta-${i}`,
        'దుర్ముహూర్తం',
        'Durmuhurtam',
        sunriseJd + (num - 1) * muhurtaJd,
        sunriseJd + num * muhurtaJd,
        tz,
        'inauspicious',
        'శుభ కార్యాలు పూర్తిగా వర్జించాలి'
      )
    );
  });

  kalas.push(
    windowFromJd(
      'abhijit',
      'అభిజిత్ ముహూర్తం',
      'Abhijit Muhurta',
      sunriseJd + 7 * muhurtaJd,
      sunriseJd + 8 * muhurtaJd,
      tz,
      'auspicious',
      'బుధ, గురు వారాలు తప్ప అన్ని కార్యాలకు శుభం (దశమి/ద్వాదశి తిథులతో అత్యుత్తమం)'
    )
  );
  kalas.push(
    windowFromJd(
      'vijaya',
      'విజయ ముహూర్తం',
      'Vijaya Muhurta',
      sunriseJd + 10 * muhurtaJd,
      sunriseJd + 11 * muhurtaJd,
      tz,
      'auspicious',
      'విజయ ప్రయాణం, పోటీలు, కొత్త ప్రయత్నాలకు శుభం'
    )
  );
  kalas.push(
    windowFromJd(
      'brahma',
      'బ్రహ్మ ముహూర్తం',
      'Brahma Muhurta',
      sunriseJd - 2 * muhurtaJd,
      sunriseJd - muhurtaJd,
      tz,
      'auspicious',
      'ధ్యానం, ఉపాసన, అధ్యయనానికి అత్యుత్తమ సమయం'
    )
  );
  kalas.push(
    windowFromJd('pratah-sandhya', 'ప్రాతః సంధ్య', 'Pratah Sandhya', sunriseJd - muhurtaJd, sunriseJd, tz, 'auspicious')
  );
  kalas.push(
    windowFromJd(
      'godhuli',
      'గోధూళి ముహూర్తం',
      'Godhuli Muhurta',
      sunsetJd,
      sunsetJd + muhurtaJd / 2,
      tz,
      'auspicious',
      'సంధ్యా కాలం — ప్రయాణం, గృహ ప్రవేశానికి శుభం'
    )
  );
  kalas.push(
    windowFromJd(
      'sayahna',
      'సాయంకాల సంధ్య',
      'Sayahna Sandhya',
      sunsetJd,
      sunsetJd + muhurtaJd * 1.5,
      tz,
      'neutral'
    )
  );
  kalas.push(
    windowFromJd(
      'nishita',
      'నిశీథ ముహూర్తం',
      'Nishita Muhurta',
      midnightJdNight - nightMuhurtaJd / 2,
      midnightJdNight + nightMuhurtaJd / 2,
      tz,
      'auspicious',
      'శివరాత్రి, జన్మాష్టమి, తాంత్రిక సాధనలకు ప్రధానం'
    )
  );

  // Bhadra (Vishti) window
  const bhadraWindows = karanaJdWindows.filter((k) => k.isBhadra);
  for (let i = 0; i < bhadraWindows.length; i++) {
    const w = bhadraWindows[i];
    const startsAtSunrise = Math.abs(w.startJd - sunriseJd) < 1e-4;
    kalas.push({
      key: bhadraWindows.length > 1 ? `bhadra-${i}` : 'bhadra',
      nameTe: 'భద్ర (విష్టి కరణం)',
      nameEn: 'Bhadra',
      startJd: w.startJd,
      endJd: w.endJd,
      startTime: timeStr(w.startJd, tz),
      endTime: timeStr(w.endJd, tz),
      quality: 'inauspicious',
      noteTe: startsAtSunrise
        ? 'విష్టి కరణం సూర్యోదయం నుంచే కొనసాగుతోంది — మునుపటి రాత్రి నుంచి వచ్చిన భద్ర; నూతన కార్యాలు, ప్రయాణాలు, వివాహాలు వర్జించాలి'
        : 'విష్టి కరణంలో నూతన కార్యాలు, ప్రయాణాలు, వివాహాలు వర్జించాలి',
    });
  }

  // ----- Choghadiya
  const daySequence = CHOGHADIYA_DAY_SEQUENCE[weekdayIndex];
  const nightSequence = CHOGHADIYA_NIGHT_SEQUENCE[weekdayIndex];
  const choghadiyaDay: KalaWindow[] = daySequence.map((idx, i) => {
    const item = CHOGHADIYA_NAMES[idx];
    return windowFromJd(
      `choghadiya-day-${i}`,
      item.te,
      `Choghadiya (${item.en})`,
      sunriseJd + (i * dayLenJd) / 8,
      sunriseJd + ((i + 1) * dayLenJd) / 8,
      tz,
      item.good ? 'auspicious' : 'inauspicious',
      `అధిపతి: ${item.planetTe}`
    );
  });
  const choghadiyaNight: KalaWindow[] = nightSequence.map((idx, i) => {
    const item = CHOGHADIYA_NAMES[idx];
    return windowFromJd(
      `choghadiya-night-${i}`,
      item.te,
      `Choghadiya (${item.en})`,
      sunsetJd + (i * nightLenJd) / 8,
      sunsetJd + ((i + 1) * nightLenJd) / 8,
      tz,
      item.good ? 'auspicious' : 'inauspicious',
      `అధిపతి: ${item.planetTe}`
    );
  });

  // ----- Hora (24 planetary hours)
  const dayLord = vara.planetId;
  const startIdx = HORA_ORDER.indexOf(dayLord);
  const hora: KalaWindow[] = [];
  for (let i = 0; i < 24; i++) {
    const planet = HORA_ORDER[(startIdx + i) % 7];
    const isDay = i < 12;
    const start = isDay ? sunriseJd + (i * dayLenJd) / 12 : sunsetJd + ((i - 12) * nightLenJd) / 12;
    const end = isDay ? sunriseJd + ((i + 1) * dayLenJd) / 12 : sunsetJd + ((i - 11) * nightLenJd) / 12;
    hora.push(
      windowFromJd(
        `hora-${i}`,
        `${HORA_PLANET_TE[planet]} హోర`,
        `${planet} Hora`,
        start,
        end,
        tz,
        HORA_NATURE[planet] === 'auspicious'
          ? 'auspicious'
          : HORA_NATURE[planet] === 'caution'
            ? 'inauspicious'
            : 'neutral',
        i < 12 ? 'పగటి హోర' : 'రాత్రి హోర'
      )
    );
  }

  // ----- Chandrabalam / Tarabalam
  const moonSign = Math.floor(siderealLongitude('Moon', sunriseJd, mode) / 30);
  // చంద్రబలం: జన్మ రాశి నుంచి 1,2,3,5,6,7,9,10,11 భావాలు శుభం; 4, 8, 12 అశుభం.
  const goodRasis = [0, 1, 2, 4, 5, 6, 8, 9, 10].map((o) => (moonSign + o) % 12);
  const ashtamaRasis = [(moonSign + 7) % 12];
  const taras = Array.from({ length: 9 }, (_, i) => ({
    index: i,
    te: TARA_NAMES[i].te,
    good: TARA_NAMES[i].good,
  }));

  // ----- Festivals, flags
  const light = computeLightPanchanga(dateISO, geo, mode);
  const observances = [
    ...festivalsForLightPanchanga(dateISO, light, geo, mode),
    ...computedObservances(dateISO, geo, mode, sunriseJd, nextSunriseJd),
  ];

  const specialFlags: { key: string; te: string }[] = [];
  if (tIdx === 14) specialFlags.push({ key: 'purnima', te: 'పౌర్ణమి' });
  if (tIdx === 29) specialFlags.push({ key: 'amavasya', te: 'అమావాస్య' });
  if (tIdx === 10 || tIdx === 25) specialFlags.push({ key: 'ekadashi', te: 'ఏకాదశి (ఉపవాసం)' });
  if (kName.isBhadra) specialFlags.push({ key: 'bhadra', te: 'భద్ర / విష్టి కరణం' });
  if (INAUSPICIOUS_YOGA_INDEXES.includes(yIdx)) specialFlags.push({ key: 'ashubha-yoga', te: 'అశుభ యోగం' });
  if (nIdx >= 22 || (nIdx === 22 && nPercent > 50)) {
    specialFlags.push({ key: 'panchaka', te: 'పంచక (అశుభ కాలం)' });
  }
  if (weekdayIndex === 1 && tIdx % 15 === 0) specialFlags.push({ key: 'somavara-pradosha', te: 'సోమ ప్రదోషం' });

  const sunSid = siderealLongitude('Sun', sunriseJd, mode);
  const sunNak = Math.floor(sunSid / (360 / 27)) % 27;

  return {
    dateISO,
    geo,
    weekday: {
      index: weekdayIndex,
      nameTe: vara.te,
      nameEn: vara.en,
      lordTe: vara.lordTe,
      lordEn: vara.lordEn,
    },
    sunriseJd,
    sunsetJd,
    moonriseJd: rs.moonriseJd,
    moonsetJd: rs.moonsetJd,
    sunrise: timeStr(sunriseJd, tz),
    sunset: timeStr(sunsetJd, tz),
    moonrise: timeStr(rs.moonriseJd, tz),
    moonset: timeStr(rs.moonsetJd, tz),
    moonsetNextDay: rs.moonsetJd !== null && civilDateAt(rs.moonsetJd, tz) !== dateISO,
    solarNoon: timeStr(solarNoonJd, tz),
    dayLengthMs: dayLenJd * 86_400_000,
    nightLengthMs: nightLenJd * 86_400_000,
    dinmanaTe: formatDurationTe(dayLenJd * 86_400_000),
    ratrimanaTe: formatDurationTe(nightLenJd * 86_400_000),
    tithi: {
      number: tIdx + 1,
      nameTe: tithiNameTe(tIdx),
      nameEn: tithiNameEn(tIdx),
      startJd: tWindow.startJd,
      endJd: tEnd,
      startTime: timeStr(tWindow.startJd, tz),
      endTime: timeStr(tEnd, tz),
      percentElapsed: Number(tPercent.toFixed(1)),
      nextNameTe: tithiNameTe((tIdx + 1) % 30),
      pakshaTe,
      pakshaEn,
      percent: Number(tPercent.toFixed(1)),
    },
    nakshatra: {
      number: nIdx + 1,
      nameTe: nak?.nameTe ?? '—',
      nameEn: nak?.nameEn ?? '—',
      startJd: nWindow.startJd,
      endJd: nEnd,
      startTime: timeStr(nWindow.startJd, tz),
      endTime: timeStr(nEnd, tz),
      percentElapsed: Number(nPercent.toFixed(1)),
      pada: nakshatraPadaAt(sunriseJd, mode),
      lordTe: nak?.lordTe ?? '—',
      deityTe: nak?.deityTe ?? '—',
      ganaTe: nak?.ganaTe ?? '—',
      yoniTe: nak?.yoniTe ?? '—',
      nadiTe: nak?.nadiTe ?? '—',
    },
    yoga: {
      number: yIdx + 1,
      nameTe: YOGA_NAMES_TE[yIdx],
      nameEn: YOGA_NAMES_EN[yIdx],
      nextNameTe: YOGA_NAMES_TE[(yIdx + 1) % 27],
      startJd: yWindow.startJd,
      endJd: yEnd,
      startTime: timeStr(yWindow.startJd, tz),
      endTime: timeStr(yEnd, tz),
      percentElapsed: Number(yPercent.toFixed(1)),
      meaningTe: INAUSPICIOUS_YOGA_INDEXES.includes(yIdx) ? 'అశుభ యోగం — శుభ కార్యాలు వర్జించాలి' : 'శుభ యోగం',
      isAuspicious: !INAUSPICIOUS_YOGA_INDEXES.includes(yIdx),
    },
    karana: {
      number: kIdx + 1,
      nameTe: kName.te,
      nameEn: kName.en,
      nextNameTe: karanaNameForIndex((kIdx + 1) % 60).te,
      startJd: kWindow.startJd,
      endJd: kEnd,
      startTime: timeStr(kWindow.startJd, tz),
      endTime: timeStr(kEnd, tz),
      percentElapsed: Number((((elong % 6) / 6) * 100).toFixed(1)),
      typeTe: kName.isBhadra ? 'చర కరణం (భద్ర)' : 'చర కరణం',
      isBhadra: kName.isBhadra,
    },
    karanaSchedule,
    era,
    kalas,
    choghadiya: { day: choghadiyaDay, night: choghadiyaNight },
    hora,
    chandrabalam: { moonSignIndex: moonSign, goodRasis, ashtamaRasis },
    tarabalam: { nakshatraIndex: nIdx, taras },
    observances,
    specialFlags,
    ayanamsaDeg: ayanamsaDegrees(sunriseJd, mode),
    ayanamsaFormatted: degToDMSString(ayanamsaDegrees(sunriseJd, mode)),
    sunSignIndex: Math.floor(sunSid / 30) % 12,
    moonSignIndex: moonSign,
    sunNakshatraIndex: sunNak,
    sunNakshatraPada: Math.min(4, Math.floor((sunSid % (360 / 27)) / (360 / 108)) + 1),
    kaliAhargana: kaliAhargana(jdToMs(sunriseJd) / 86_400_000 + 2_440_587.5),
    julianDay: jdToMs(sunriseJd) / 86_400_000 + 2_440_587.5,
    rataDie: rataDie(jdToMs(sunriseJd) / 86_400_000 + 2_440_587.5),
    mjd: modifiedJulianDay(jdToMs(sunriseJd) / 86_400_000 + 2_440_587.5),
  };
}

/* ================================================================== *
 *  Month / year calendars
 * ================================================================== */

export function getMonthCalendar(
  year: number,
  month: number,
  geo: GeoContext,
  options: { siderealMode?: SiderealMode; todayISO?: string } = {}
): MonthDayCell[] {
  const mode = options.siderealMode ?? 'lahiri';
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const cells: MonthDayCell[] = [];
  const monthStartISO = `${year}-${String(month).padStart(2, '0')}-01`;
  const monthEndISO = `${year}-${String(month).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;
  const monthFestivals = collectFestivalsBetween(monthStartISO, monthEndISO, geo, mode);
  const festivalsByDate = new Map<string, FestivalEntry[]>();
  for (const f of monthFestivals) festivalsByDate.set(f.dateISO, [...(festivalsByDate.get(f.dateISO) ?? []), f]);
  for (let d = 1; d <= daysInMonth; d++) {
    const dateISO = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const light = computeLightPanchanga(dateISO, geo, mode);
    const tIdx = light.tithiAtSunrise;
    cells.push({
      dateISO,
      dayOfMonth: d,
      weekdayIndex: light.weekday,
      pakshaTe: tIdx < 15 ? 'శుక్ల' : 'కృష్ణ',
      tithiNameTe: TITHI_NAMES_TE[tIdx % 15],
      tithiNameEn: tIdx === 29 ? 'Amavasya' : TITHI_NAMES_EN[tIdx % 15],
      nakshatraNameTe: TELUGU_NAKSHATRAS[light.nakshatraAtSunrise]?.nameTe ?? '',
      festivals: festivalsByDate.get(dateISO) ?? [],
      isToday: options.todayISO === dateISO,
      isPurnima: tIdx === 14,
      isAmavasya: tIdx === 29,
    });
  }
  return cells;
}

export function getYearOverview(
  gregorianYear: number,
  geo: GeoContext,
  options: { siderealMode?: SiderealMode } = {}
): HinduYearOverview {
  const mode = options.siderealMode ?? 'lahiri';
  const tz = geo.tzOffsetHours;

  // Lunar months covering the Gregorian year (plus margin)
  const startJd = jdFromMs(Date.UTC(gregorianYear, 0, 1)) - 40;
  const endJd = jdFromMs(Date.UTC(gregorianYear, 11, 31)) + 40;

  const months: AmantaMonthSpan[] = [];
  let cursor = newMoonBeforeJd(startJd);
  for (let i = 0; i < 16; i++) {
    const nmStart = cursor;
    const nmEnd = newMoonAfterJd(nmStart + 0.5);
    const masa = resolveMasa(nmStart + 1, mode);
    // Mid-lunation is safer for resolution
    const midMasa = resolveMasa((nmStart + nmEnd) / 2, mode);
    const startISO = lunarMonthStartISO(nmStart, geo);
    const endNextISO = lunarMonthStartISO(nmEnd, geo);
    const endISO = (() => {
      const [ey, em, ed] = endNextISO.split('-').map(Number);
      const prev = new Date(Date.UTC(ey, em - 1, ed - 1));
      return `${prev.getUTCFullYear()}-${String(prev.getUTCMonth() + 1).padStart(2, '0')}-${String(
        prev.getUTCDate()
      ).padStart(2, '0')}`;
    })();
    const nameIdx = midMasa.masaIndex;
    // Purnimanta span: purnima-to-purnima (amanta + 15 days)
    const purnimaJd = nmStart + (nmEnd - nmStart) / 2;
    months.push({
      masaIndex: nameIdx,
      masaTe: MASA_NAMES[nameIdx].te,
      masaEn: MASA_NAMES[nameIdx].en,
      isAdhika: midMasa.isAdhika,
      startISO,
      endISO,
      purnimantaStartISO: civilDateAt(purnimaJd - (nmEnd - nmStart) / 2 + (nmEnd - nmStart) / 2, tz),
      purnimantaEndISO: civilDateAt(purnimaJd + (nmEnd - nmStart) / 2, tz),
    });
    cursor = nmEnd;
    if (nmEnd > endJd) break;
    if (masa.masaIndex === 0 && months.length > 2) {
      // full cycle completed
    }
  }

  const sankrantis: SankrantiEntry[] = [];
  for (let sign = 0; sign < 12; sign++) {
    const jd = sankrantiJd(gregorianYear, sign, mode);
    const dateISO = civilDateAt(jd, tz);
    if (Number(dateISO.slice(0, 4)) !== gregorianYear) continue;
    sankrantis.push({
      signIndex: sign,
      signTe: TELUGU_RASIS[sign]?.nameTe ?? '',
      signEn: TELUGU_RASIS[sign]?.nameEn ?? '',
      jd,
      dateISO,
      timeLocal: formatLocalHM(jd, tz),
      nameTe: `${MASA_NAMES[sign].te.replace('ం', '')} సంక్రమణం (${TELUGU_RASIS[sign]?.nameTe ?? ''})`,
      isPunyaKala: sign === 0 || sign === 9,
    });
  }
  sankrantis.sort((a, b) => a.jd - b.jd);

  const eclipses = eclipsesInRange(
    jdFromMs(Date.UTC(gregorianYear, 0, 1)),
    jdFromMs(Date.UTC(gregorianYear + 1, 0, 1)),
    geo.lat,
    geo.lng
  ).map((e) => ({
    dateISO: civilDateAt(e.maxJd, tz),
    typeTe: e.typeTe,
    kind: e.kind,
    visible: e.visibleFromPlace,
    detailTe: e.detailTe,
    timeLocal: formatLocalHM(e.maxJd, tz),
  }));

  // Festivals strictly inside the Gregorian year (span-resolved, no duplicates)
  const festivals: FestivalEntry[] = collectFestivalsBetween(
    `${gregorianYear}-01-01`,
    `${gregorianYear}-12-31`,
    geo,
    mode
  );

  // Ugadi + all sankrantis (solar festivals) are added explicitly. The tithi
  // rule can also fire a day early/late when pratipadā is kṣaya, so the
  // computed Ugādi replaces any rule-emitted one.
  const ugadiISO = ugadiDateISO(gregorianYear, mode, tz, geo.lat, geo.lng);
  const withoutUgadi = festivals.filter((f) => f.id !== 'ugadi');
  festivals.length = 0;
  festivals.push(...withoutUgadi);
  festivals.push({
    id: 'ugadi',
    nameTe: 'ఉగాది (తెలుగు నూతన సంవత్సరం)',
    nameEn: 'Ugadi',
    dateISO: ugadiISO,
    descriptionTe:
      'చైత్ర శుక్ల పాడ్యమి — శాలివాహన సంవత్సరారంభం. పంచాంగ శ్రవణం, ఉగాది పచ్చడి.',
    category: 'major',
  });
  for (const sk of sankrantis) {
    festivals.push({
      id: `sankranti-${sk.signIndex}`,
      nameTe: `${sk.signTe.split(' ')[0]} సంక్రమణం`,
      nameEn: `${sk.signEn} Sankranti`,
      dateISO: sk.dateISO,
      descriptionTe: `సూర్యుడు ${sk.signTe} రాశిలోకి ప్రవేశించే పుణ్యకాలం (${sk.timeLocal}). స్నాన, దాన, జప కర్మలకు శుభం.`,
      category: 'solar',
      timingNoteTe: `సంక్రమణ సమయం: ${sk.timeLocal}`,
    });
    if (sk.signIndex === 9) {
      const [sy, sm, sd] = sk.dateISO.split('-').map(Number);
      const kan = new Date(Date.UTC(sy, sm - 1, sd + 1));
      festivals.push({
        id: 'kanuma',
        nameTe: 'కనుమ',
        nameEn: 'Kanuma',
        dateISO: `${kan.getUTCFullYear()}-${String(kan.getUTCMonth() + 1).padStart(2, '0')}-${String(
          kan.getUTCDate()
        ).padStart(2, '0')}`,
        descriptionTe: 'పశు పూజ, రైతు సన్మానం, గ్రామ దేవతల ఆరాధన.',
        category: 'solar',
      });
    }
  }

  const uniqueFestivals = festivals
    .filter((f, i, arr) => arr.findIndex((x) => x.id === f.id && x.dateISO === f.dateISO) === i)
    .sort((a, b) => (a.dateISO < b.dateISO ? -1 : a.dateISO > b.dateISO ? 1 : 0));

  const era = resolveHinduEra(`${gregorianYear}-06-15`, geo, mode);
  const adhika = months.find((m) => m.isAdhika) ?? null;

  return {
    gregorianYear,
    geo,
    samvatsaraTe: era.samvatsaraTe,
    samvatsaraEn: era.samvatsaraEn,
    shakaYear: era.shakaYear,
    vikramYear: era.vikramYear,
    kaliYear: era.kaliYear,
    adhikaMasa: adhika,
    months: months.filter(
      (m) => m.endISO >= `${gregorianYear}-01-01` && m.startISO <= `${gregorianYear}-12-31`
    ),
    sankrantis,
    eclipses,
    festivals: uniqueFestivals,
    ugadiISO,
  };
}

export function upcomingFestivals(
  fromDateISO: string,
  geo: GeoContext,
  options: { siderealMode?: SiderealMode; count?: number } = {}
): FestivalEntry[] {
  const mode = options.siderealMode ?? 'lahiri';
  const count = options.count ?? 12;
  const tz = geo.tzOffsetHours;
  const endISO = addDaysISO(fromDateISO, 420);
  return collectFestivalsBetween(fromDateISO, endISO, geo, mode)
    .filter((f) => f.category === 'major' || f.category === 'vratam')
    .slice(0, count);
}

/* ================================================================== *
 *  Muhurta-quality summary for a day (used by the calendar colouring)
 * ================================================================== */

export function dayAuspiciousnessScore(day: DayPanchanga): { score: number; labelTe: string } {
  let score = 60;
  if (day.tithi.nameTe.includes('ఏకాదశి')) score -= 6;
  if (day.tithi.number === 4 || day.tithi.number === 19) score -= 10; // Chaturthi
  if (day.tithi.number === 8 || day.tithi.number === 23) score -= 8;
  if (day.tithi.number === 14 || day.tithi.number === 29) score -= 6;
  if (day.tithi.number === 15) score += 6;
  if (day.yoga.isAuspicious) score += 8;
  else score -= 10;
  if (day.karana.isBhadra) score -= 10;
  if (day.weekday.index === 3) score += 8; // Wednesday (Mercury)
  if (day.weekday.index === 4) score += 10; // Thursday (Jupiter)
  if (day.weekday.index === 5) score += 6; // Friday (Venus)
  if (day.weekday.index === 2 || day.weekday.index === 6) score -= 6;
  if (day.specialFlags.some((f) => f.key === 'panchaka')) score -= 6;
  const clamped = Math.max(5, Math.min(98, score));
  const labelTe =
    clamped >= 78
      ? 'అత్యుత్తమ శుభ దినం'
      : clamped >= 62
        ? 'శుభ దినం'
        : clamped >= 45
          ? 'సాధారణం'
          : clamped >= 30
            ? 'అశుభం'
            : 'వర్జనీయం';
  return { score: clamped, labelTe };
}

export function durationText(ms: number): string {
  return formatDurationHMS(ms);
}


/* ================================================================== *
 *  Tarabalam for a specific janma nakshatra
 * ================================================================== */

export interface TaraResult {
  taraIndex: number; // 0..8
  taraTe: string;
  taraEn: string;
  isGood: boolean;
  noteTe: string;
}

/**
 * Tara of the day for a person born in `janmaNakshatraIndex`.
 * Counted from janma nakshatra → today's Moon nakshatra (9-tara cycle).
 */
export function taraBalamFor(janmaNakshatraIndex: number, todayNakshatraIndex: number): TaraResult {
  const diff = ((todayNakshatraIndex - janmaNakshatraIndex) % 27 + 27) % 27;
  const taraIndex = diff % 9;
  const entry = TARA_NAMES[taraIndex];
  const noteMap = [
    'శరీరారోగ్యం, మానసిక ఆందోళన — శుభ కార్యాలు వర్జించాలి',
    'ధన లాభం, వ్యాపార విజయం — అత్యంత శుభం',
    'అనుకోని ఆటంకాలు, నష్టం — ప్రయాణాలు వర్జించాలి',
    'క్షేమం, ఆరోగ్యం, కుటుంబ సౌఖ్యం — శుభం',
    'శత్రు బాధ, వివాదాలు — జాగ్రత్త',
    'కార్యసిద్ధి, ప్రయత్నాలు ఫలిస్తాయి — శుభం',
    'విఘ్నాలు, ప్రమాద భయం — వర్జనీయం',
    'మిత్ర సహాయం, సంతోషం — శుభం',
    'అత్యుత్తమ మైత్రి — సర్వ కార్య సిద్ధి',
  ];
  return {
    taraIndex,
    taraTe: entry.te,
    taraEn: entry.en,
    isGood: entry.good,
    noteTe: noteMap[taraIndex],
  };
}
