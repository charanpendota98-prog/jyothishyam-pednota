import * as Astronomy from 'astronomy-engine';
import {
  calculatePanchanga,
  type PanchangaData,
} from './ephemeris.ts';
import { TELUGU_NAKSHATRAS, TELUGU_RASIS } from './teluguJathakam.ts';

export interface RealtimePanchangaFeed {
  timestampMs: number;
  localTimeStr: string;
  localDateStr: string;
  dayOfWeekNameTe: string;
  dayOfWeekNameEn: string;
  locationName: string;
  latitude: number;
  longitude: number;
  tzOffsetHours: number;

  // Sun & Moon Astronomical Realtime Data
  sunriseLocal: string;
  sunsetLocal: string;
  moonriseLocal: string;
  moonsetLocal: string;
  dayLengthStr: string;
  nightLengthStr: string;
  isDaytime: boolean;

  // Core 5 Panchanga Elements (పంచాంగములు)
  tithi: {
    number: number; // 1..30
    nameTe: string;
    pakshaTe: string;
    pakshaEn: string;
    lordTe: string;
    percentElapsed: number;
    endTimeLocal: string;
    nextTithiNameTe: string;
    isShubha: boolean;
    deityTe: string;
  };

  nakshatra: {
    number: number; // 1..27
    nameTe: string;
    nameEn: string;
    pada: number; // 1..4
    lordTe: string;
    deityTe: string;
    ganaTe: string;
    yoniTe: string;
    percentElapsed: number;
    endTimeLocal: string;
    nextNakshatraNameTe: string;
    isShubha: boolean;
  };

  yoga: {
    number: number; // 1..27
    nameTe: string;
    nameEn: string;
    meaningTe: string;
    isShubha: boolean;
  };

  karana: {
    nameTe: string;
    nameEn: string;
    typeTe: string;
    isBhadraVishti: boolean;
    bhadraWarningTe?: string;
  };

  vaara: {
    nameTe: string;
    nameEn: string;
    lordTe: string;
    shubhaColorTe: string;
    deityTe: string;
  };

  // Live Kala Status Right Now
  kalaStatus: {
    activeKalaNameTe: string | null;
    activeKalaType: 'auspicious' | 'inauspicious' | 'neutral';
    activeKalaRemainingMinutes: number;
    rahuKalam: { window: string; isActive: boolean; remainingMinutes: number };
    yamagandam: { window: string; isActive: boolean; remainingMinutes: number };
    gulikaKalam: { window: string; isActive: boolean; remainingMinutes: number };
    abhijitMuhurta: { window: string; isActive: boolean; remainingMinutes: number };
    brahmaMuhurta: { window: string; isActive: boolean };
    amritKalam: { window: string; isActive: boolean };
    durmuhurtham: { window: string; isActive: boolean };
    varjyam: { window: string; isActive: boolean };
  };

  // Live Hora Right Now
  currentHora: {
    planetId: string;
    planetNameTe: string;
    nature: 'auspicious' | 'neutral' | 'caution';
    badgeTe: string;
    bestActivitiesTe: string;
    endTimeLocal: string;
    remainingMinutes: number;
    nextHoraPlanetTe: string;
  };

  // Live Choghadiya Right Now
  currentChoghadiya: {
    nameTe: string;
    nameEn: string;
    rulerTe: string;
    nature: 'amrit' | 'shubh' | 'labh' | 'char' | 'rog' | 'kaal' | 'udveg';
    badgeTe: string;
    isAuspicious: boolean;
    endTimeLocal: string;
    remainingMinutes: number;
    nextChoghadiyaTe: string;
  };

  // Traditional Vedic Calendar Epochs
  vedicEra: {
    samvatsaraNameTe: string;
    ayanaNameTe: string;
    rituNameTe: string;
    maasaNameTe: string;
    kalyugYear: number;
    shakaEraYear: number;
  };
}

const TELUGU_TITHIS = [
  'శుక్ల పాడ్యమి', 'శుక్ల విదియ', 'శుక్ల తదియ', 'శుక్ల చవితి', 'శుక్ల పంచమి',
  'శుక్ల షష్ఠి', 'శుక్ల సప్తమి', 'శుక్ల అష్టమి', 'శుక్ల నవమి', 'శుక్ల దశమి',
  'శుక్ల ఏకాదశి', 'శుక్ల ద్వాదశి', 'శుక్ల త్రయోదశి', 'శుక్ల చతుర్దశి', 'పూర్ణిమ',
  'కృష్ణ పాడ్యమి', 'కృష్ణ విదియ', 'కృష్ణ తదియ', 'కృష్ణ చవితి', 'కృష్ణ పంచమి',
  'కృష్ణ షష్ఠి', 'కృష్ణ సప్తమి', 'కృష్ణ అష్టమి', 'కృష్ణ నవమి', 'కృష్ణ దశమి',
  'కృష్ణ ఏకాదశి', 'కృష్ణ ద్వాదశి', 'కృష్ణ త్రయోదశి', 'కృష్ణ చతుర్దశి', 'అమావాస్య',
];

const TELUGU_YOGAS = [
  { nameTe: 'విష్కంభం', isShubha: false, meaningTe: 'ప్రారంభ ఆటంకం, కానీ పరిహారంతో జయం' },
  { nameTe: 'ప్రీతి', isShubha: true, meaningTe: 'స్నేహం, ప్రేమ, సర్వ కార్య సాధక యోగం' },
  { nameTe: 'ఆయుష్మాన్', isShubha: true, meaningTe: 'దీర్ఘాయుష్షు, ఆరోగ్య వృద్ధి శుభ యోగం' },
  { nameTe: 'సౌభాగ్యం', isShubha: true, meaningTe: 'సకల సౌభాగ్యాలు, కుటుంబ ఆనందం' },
  { nameTe: 'శోభనం', isShubha: true, meaningTe: 'మంగళకరం, నూతన ప్రారంభాలకు ఉత్తమం' },
  { nameTe: 'అతిగండం', isShubha: false, meaningTe: 'గండ ప్రదోషం — ప్రయాణాల్లో జాగ్రత్త అవసరం' },
  { nameTe: 'సుకర్మ', isShubha: true, meaningTe: 'సత్కర్మ సిద్ధి, ధర్మ కార్యాచరణ ఉత్తమం' },
  { nameTe: 'ధృతి', isShubha: true, meaningTe: 'స్థిరత్వం, మానసిక ధైర్యం, ఆస్తి వృద్ధి' },
  { nameTe: 'శూలం', isShubha: false, meaningTe: 'కలహాలు, వివాదాల నివారణకు ప్రార్థన అవసరం' },
  { nameTe: 'గండం', isShubha: false, meaningTe: 'ఆటంకాలు, ఖర్చులు — శాంతి ఆవశ్యకం' },
  { nameTe: 'వృద్ధి', isShubha: true, meaningTe: 'వ్యాపార, ధన వృద్ధి, సర్వోన్నత ప్రగతి' },
  { nameTe: 'ధ్రువం', isShubha: true, meaningTe: 'శాశ్వత పనులు, గృహ నిర్మాణాలకు అత్యుత్తమం' },
  { nameTe: 'వ్యాఘాతం', isShubha: false, meaningTe: 'ఆకస్మిక ఆటంకం — నెమ్మదిగా సాగవలెను' },
  { nameTe: 'హర్షణం', isShubha: true, meaningTe: 'సంతోషం, ఉల్లాసం, బంధుమిత్ర కలయిక' },
  { nameTe: 'వజ్రం', isShubha: false, meaningTe: 'కఠిన పరీక్ష, శత్రు భయం — ఆంజనేయ ఆరాధన' },
  { nameTe: 'సిద్ధి', isShubha: true, meaningTe: 'కార్యసిద్ధి, సంకల్పిత కోరికలు నెరవేరును' },
  { nameTe: 'వ్యతీపాతం', isShubha: false, meaningTe: 'మహాపాత యోగం — శుభకార్యాలు వర్జ్యం' },
  { nameTe: 'వరీయాన్', isShubha: true, meaningTe: 'శ్రేష్ఠమైన ఫలాలు, కీర్తి ప్రతిష్ఠలు' },
  { nameTe: 'పరిఘం', isShubha: false, meaningTe: 'అవరోధం — నిదానంగా పరిష్కరించవలెను' },
  { nameTe: 'శివం', isShubha: true, meaningTe: 'పరమ మంగళం, ఈశ్వర అనుగ్రహ సిద్ధి' },
  { nameTe: 'సిద్ధం', isShubha: true, meaningTe: 'విజయవంతమైన ఫలితాలు, అధికార లాభం' },
  { nameTe: 'సాధ్యం', isShubha: true, meaningTe: 'అసాధ్యమైన పనులు కూడా సుసాధ్యమగును' },
  { nameTe: 'శుభం', isShubha: true, meaningTe: 'సకల శుభకార్యములకు అనుకూలమైన యోగం' },
  { nameTe: 'శుక్లం', isShubha: true, meaningTe: 'స్వచ్ఛమైన మనస్సు, పవిత్ర కార్యాలు' },
  { nameTe: 'బ్రహ్మం', isShubha: true, meaningTe: 'జ్ఞానం, విద్యాభ్యాసం, ఆధ్యాత్మిక సాధన' },
  { nameTe: 'ఐంద్రం', isShubha: true, meaningTe: 'నాయకత్వం, ఉద్యోగ లాభం, అధికార హోదా' },
  { nameTe: 'వైధృతి', isShubha: false, meaningTe: 'ప్రతికూల యోగం — శాంతి మంత్ర జపం శ్రేయస్కరం' },
];

const TELUGU_KARANAS: Record<string, { nameTe: string; typeTe: string; isBhadra: boolean }> = {
  Bava: { nameTe: 'బవ', typeTe: 'చర కరణం (శుభం)', isBhadra: false },
  Balava: { nameTe: 'బాలవ', typeTe: 'చర కరణం (శుభం)', isBhadra: false },
  Kaulava: { nameTe: 'కౌలవ', typeTe: 'చర కరణం (మిత్రత్వం)', isBhadra: false },
  Taitila: { nameTe: 'తైతుల', typeTe: 'చర కరణం (శుభం)', isBhadra: false },
  Garija: { nameTe: 'గరజ', typeTe: 'చర కరణం (భూమి/వ్యవసాయం)', isBhadra: false },
  Vanija: { nameTe: 'వణిజ', typeTe: 'చర కరణం (వ్యాపార లాభం)', isBhadra: false },
  'Vishti (Bhadra)': {
    nameTe: 'విష్టి (భద్ర కరణం)',
    typeTe: 'చర కరణం (అశుభం — వర్జ్యం)',
    isBhadra: true,
  },
  Shakuni: { nameTe: 'శకుని', typeTe: 'స్థిర కరణం (ఔషధ సేవనం)', isBhadra: false },
  Chatushpada: { nameTe: 'చతుష్పాత్', typeTe: 'స్థిర కరణం (పశు పోషణ)', isBhadra: false },
  Naga: { nameTe: 'నాగ', typeTe: 'స్థిర కరణం (నాగారాధన)', isBhadra: false },
  Kimstughna: { nameTe: 'కింస్తుఘ్న', typeTe: 'స్థిర కరణం (శుభ కార్యం)', isBhadra: false },
};

const TELUGU_VAARAS = [
  { nameTe: 'ఆదివారం', nameEn: 'Sunday', lordTe: 'రవి (సూర్యుడు)', shubhaColorTe: 'ఎరుపు / కాషాయం', deityTe: 'శ్రీ సూర్యనారాయణ మూర్తి' },
  { nameTe: 'సోమవారం', nameEn: 'Monday', lordTe: 'చంద్రుడు', shubhaColorTe: 'తెలుపు / ముత్యపు వర్ణం', deityTe: 'శ్రీ పరమేశ్వరుడు' },
  { nameTe: 'మంగళవారం', nameEn: 'Tuesday', lordTe: 'కుజుడు (అంగారకుడు)', shubhaColorTe: 'ఎరుపు / కెంపు వర్ణం', deityTe: 'శ్రీ సుబ్రహ్మణ్య స్వామి / ఆంజనేయుడు' },
  { nameTe: 'బుధవారం', nameEn: 'Wednesday', lordTe: 'బుధుడు', shubhaColorTe: 'ఆకుపచ్చ', deityTe: 'శ్రీ మహావిష్ణువు' },
  { nameTe: 'గురువారం', nameEn: 'Thursday', lordTe: 'బృహస్పతి (గురువు)', shubhaColorTe: 'పసుపు / బంగారు వర్ణం', deityTe: 'శ్రీ దత్తాత్రేయుడు / దక్షిణామూర్తి' },
  { nameTe: 'శుక్రవారం', nameEn: 'Friday', lordTe: 'శుక్రుడు', shubhaColorTe: 'తెలుపు / వెండి వర్ణం', deityTe: 'శ్రీ మహాలక్ష్మి అమ్మవారు' },
  { nameTe: 'శనివారం', nameEn: 'Saturday', lordTe: 'శనీశ్వరుడు', shubhaColorTe: 'నీలం / నలుపు', deityTe: 'శ్రీ వేంకటేశ్వర స్వామి / శనీశ్వరుడు' },
];

const CHALDEAN_HORA_PLANETS = [
  'Sun',
  'Venus',
  'Mercury',
  'Moon',
  'Saturn',
  'Jupiter',
  'Mars',
];

const HORA_PLANET_METAS: Record<
  string,
  {
    nameTe: string;
    nature: 'auspicious' | 'neutral' | 'caution';
    badgeTe: string;
    bestActivitiesTe: string;
  }
> = {
  Sun: {
    nameTe: 'రవి హోర (సూర్యుడు)',
    nature: 'neutral',
    badgeTe: 'రాజకీయ & ప్రభుత్వ కార్యాలకు ఉత్తమం',
    bestActivitiesTe: 'ఉద్యోగ దరఖాస్తు, ప్రభుత్వ పనులు, ఉన్నతాధికారుల భేటీ, రాజకీయ సంప్రదింపులు',
  },
  Moon: {
    nameTe: 'చంద్ర హోర',
    nature: 'auspicious',
    badgeTe: 'శుభ ప్రయాణ & సమైక్య హోర ★',
    bestActivitiesTe: 'ప్రయాణాలు, గృహ పనులు, ఆభరణాల ధారణ, జల సంబంధ వ్యాపారాలు',
  },
  Mars: {
    nameTe: 'కుజ హోర (అంగారకుడు)',
    nature: 'caution',
    badgeTe: 'సాహస & భూ సంబంధ పనులకు మాత్రమే',
    bestActivitiesTe: 'భూమి కొనుగోలు, శస్త్రచికిత్స, కోర్టు వాదనలు, వ్యాయామం (వివాహాలకు వర్జ్యం)',
  },
  Mercury: {
    nameTe: 'బుధ హోర',
    nature: 'auspicious',
    badgeTe: 'వ్యాపార & విద్యా హోర ★',
    bestActivitiesTe: 'నూతన వ్యాపారం, అకౌంట్స్, ఒప్పందాలు, రచనలు, విద్యా సంబంధ పరీక్షలు',
  },
  Jupiter: {
    nameTe: 'గురు హోర (బృహస్పతి)',
    nature: 'auspicious',
    badgeTe: 'అమృత సర్వకార్య సాధక హోర ★★★',
    bestActivitiesTe: 'వివాహం, గృహప్రవేశం, ఉపనయనం, విద్యారంభం, ధన లావాదేవీలు, పూజలు',
  },
  Venus: {
    nameTe: 'శుక్ర హోర',
    nature: 'auspicious',
    badgeTe: 'కళ్యాణ & సౌభాగ్య హోర ★★',
    bestActivitiesTe: 'వివాహ సంబంధాలు, నూతన వస్త్రాలు, వాహన కొనుగోలు, కళలు, స్నేహ కలయిక',
  },
  Saturn: {
    nameTe: 'శని హోర',
    nature: 'caution',
    badgeTe: 'పరిమిత పనులకు మాత్రమే (హెచ్చరిక)',
    bestActivitiesTe: 'యంత్రాలు, వ్యవసాయం, పాత వస్తువుల వ్యాపారం, శని శాంతి పూజలు (శుభాలకు వర్జ్యం)',
  },
};

const CHOGHADIYA_ORDERS: Record<number, string[]> = {
  // Day choghadiya sequence from sunrise (0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat)
  0: ['Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg'], // Sun
  1: ['Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Char', 'Labh', 'Amrit'], // Mon
  2: ['Rog', 'Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog'], // Tue
  3: ['Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Char', 'Labh'], // Wed
  4: ['Shubh', 'Rog', 'Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh'], // Thu
  5: ['Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Char'], // Fri
  6: ['Kaal', 'Shubh', 'Rog', 'Udveg', 'Char', 'Labh', 'Amrit', 'Kaal'], // Sat
};

const CHOGHADIYA_META: Record<
  string,
  {
    nameTe: string;
    nature: 'amrit' | 'shubh' | 'labh' | 'char' | 'rog' | 'kaal' | 'udveg';
    rulerTe: string;
    badgeTe: string;
    isAuspicious: boolean;
  }
> = {
  Amrit: { nameTe: 'అమృత', nature: 'amrit', rulerTe: 'చంద్రుడు', badgeTe: 'అత్యుత్తమ అమృత ముహూర్తం ★★★', isAuspicious: true },
  Shubh: { nameTe: 'శుభ', nature: 'shubh', rulerTe: 'సూర్యుడు/గురువు', badgeTe: 'సకల శుభకార్య ప్రదం ★★', isAuspicious: true },
  Labh: { nameTe: 'లాభ', nature: 'labh', rulerTe: 'బుధుడు', badgeTe: 'ధన & వ్యాపార లాభకరం ★★', isAuspicious: true },
  Char: { nameTe: 'చర', nature: 'char', rulerTe: 'శుక్రుడు', badgeTe: 'ప్రయాణాలకు అనుకూలం ★', isAuspicious: true },
  Rog: { nameTe: 'రోగ', nature: 'rog', rulerTe: 'కుజుడు', badgeTe: 'అశుభం — ఆటంక భయం (వర్జ్యం)', isAuspicious: false },
  Kaal: { nameTe: 'కాల', nature: 'kaal', rulerTe: 'శని', badgeTe: 'తీవ్ర అశుభం — శని కాలం (వర్జ్యం)', isAuspicious: false },
  Udveg: { nameTe: 'ఉద్వేగ', nature: 'udveg', rulerTe: 'రవి', badgeTe: 'మానసిక ఆందోళన — తొందరపాటు వద్దు', isAuspicious: false },
};

/**
 * Calculates a high-precision, real-time Panchanga feed for the user's specific location & time.
 */
export function getRealtimePanchangaFeed(
  targetDate: Date,
  lat: number,
  lng: number,
  tzOffsetHours: number,
  locationName: string = 'హైదరాబాద్ (తెలంగాణ)'
): RealtimePanchangaFeed {
  const targetMs = targetDate.getTime();
  const localMs = targetMs + tzOffsetHours * 3600 * 1000;
  const localDate = new Date(localMs);

  const localTimeStr = `${String(localDate.getUTCHours()).padStart(2, '0')}:${String(
    localDate.getUTCMinutes()
  ).padStart(2, '0')}:${String(localDate.getUTCSeconds()).padStart(2, '0')}`;

  const localDateStr = `${localDate.getUTCFullYear()}-${String(
    localDate.getUTCMonth() + 1
  ).padStart(2, '0')}-${String(localDate.getUTCDate()).padStart(2, '0')}`;

  const dayOfWeek = localDate.getUTCDay(); // 0=Sun..6=Sat
  const vaaraInfo = TELUGU_VAARAS[dayOfWeek];

  const observer = new Astronomy.Observer(lat, lng, 0);

  // Day start in UTC
  const startOfLocalDayUTC = new Date(
    Date.UTC(localDate.getUTCFullYear(), localDate.getUTCMonth(), localDate.getUTCDate(), 0, 0, 0) -
      tzOffsetHours * 3600 * 1000
  );

  // Sun and Moon Rise/Set
  const sunRiseEvent = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, +1, startOfLocalDayUTC, 1);
  const sunSetEvent = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, -1, startOfLocalDayUTC, 1);
  const moonRiseEvent = Astronomy.SearchRiseSet(Astronomy.Body.Moon, observer, +1, startOfLocalDayUTC, 1.5);
  const moonSetEvent = Astronomy.SearchRiseSet(Astronomy.Body.Moon, observer, -1, startOfLocalDayUTC, 1.5);

  const sunriseMs = sunRiseEvent ? sunRiseEvent.date.getTime() : startOfLocalDayUTC.getTime() + 6 * 3600 * 1000;
  const sunsetMs = sunSetEvent ? sunSetEvent.date.getTime() : startOfLocalDayUTC.getTime() + 18 * 3600 * 1000;

  const dayDurationMs = Math.max(4 * 3600 * 1000, sunsetMs - sunriseMs);
  const nightDurationMs = Math.max(4 * 3600 * 1000, 24 * 3600 * 1000 - dayDurationMs);
  const isDaytime = targetMs >= sunriseMs && targetMs <= sunsetMs;

  const fmtTime = (ms: number) => {
    const d = new Date(ms + tzOffsetHours * 3600 * 1000);
    return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
  };

  const sunriseLocal = fmtTime(sunriseMs);
  const sunsetLocal = fmtTime(sunsetMs);
  const moonriseLocal = moonRiseEvent ? fmtTime(moonRiseEvent.date.getTime()) : 'రాత్రి సంచారం';
  const moonsetLocal = moonSetEvent ? fmtTime(moonSetEvent.date.getTime()) : 'పగటి సంచారం';

  const dayHours = (dayDurationMs / (3600 * 1000)).toFixed(1);
  const nightHours = (nightDurationMs / (3600 * 1000)).toFixed(1);

  // Calculate planetary Sidereal Longitudes for Sun and Moon
  const timeAstro = Astronomy.MakeTime(targetDate);
  const sunEquator = Astronomy.Equator(Astronomy.Body.Sun, timeAstro, observer, true, true);
  const moonEquator = Astronomy.Equator(Astronomy.Body.Moon, timeAstro, observer, true, true);

  // Approximate Lahiri Ayanamsa: 23.85° at J2000 + 50.29"/year
  const yearFrac = 2000.0 + (targetMs - Date.UTC(2000, 0, 1)) / (365.25 * 86400000);
  const ayanamsaLahiri = 23.85 + (yearFrac - 2000) * (50.29 / 3600);

  const sunTropicalLon = sunEquator.ra * 15; // approximate RA to ecliptic
  const sunSidLon = (sunTropicalLon - ayanamsaLahiri + 360) % 360;

  const moonTropicalLon = moonEquator.ra * 15;
  const moonSidLon = (moonTropicalLon - ayanamsaLahiri + 360) % 360;

  const panchanga: PanchangaData = calculatePanchanga(
    targetDate,
    sunSidLon,
    moonSidLon,
    lat,
    lng,
    tzOffsetHours
  );

  // Tithi calculations
  const elongation = (moonSidLon - sunSidLon + 360) % 360;
  const tithiIdx = Math.floor(elongation / 12);
  const tithiPercent = Number((((elongation % 12) / 12) * 100).toFixed(1));
  const tithiDegRemaining = 12 - (elongation % 12);
  // Avg relative speed: ~12.19 deg/day => ~0.508 deg/hour
  const tithiMsRemaining = (tithiDegRemaining / 0.508) * 3600 * 1000;
  const tithiEndTimeLocal = fmtTime(targetMs + tithiMsRemaining);

  const tithiNameTe = TELUGU_TITHIS[tithiIdx] ?? 'శుక్ల పాడ్యమి';
  const nextTithiNameTe = TELUGU_TITHIS[(tithiIdx + 1) % 30];
  const isShukla = tithiIdx < 15;

  const tithiDeities = [
    'అగ్ని దేవుడు', 'బ్రహ్మ దేవుడు', 'గౌరీ దేవి', 'శ్రీ మహాగణపతి', 'సర్ప దేవతలు',
    'సుబ్రహ్మణ్య స్వామి', 'సూర్య భగవానుడు', 'శివ-దుర్గా దేవి', 'శ్రీరామ చంద్రుడు', 'యమధర్మరాజు',
    'శ్రీ మహావిష్ణువు', 'శ్రీహరి / వామన మూర్తి', 'మన్మథుడు / కామదేవుడు', 'పరమేశ్వరుడు', 'శ్రీ లక్ష్మీనారాయణులు',
  ];
  const tithiDeityTe = tithiDeities[tithiIdx % 15] ?? 'శ్రీ మహావిష్ణువు';

  // Nakshatra calculations
  const nakSpan = 360 / 27;
  const nakIdx = Math.floor(moonSidLon / nakSpan);
  const degInNak = moonSidLon % nakSpan;
  const pada = Math.floor(degInNak / (nakSpan / 4)) + 1;
  const nakDegRemaining = nakSpan - degInNak;
  // Avg Moon speed: ~13.176 deg/day => ~0.549 deg/hour
  const nakMsRemaining = (nakDegRemaining / 0.549) * 3600 * 1000;
  const nakEndTimeLocal = fmtTime(targetMs + nakMsRemaining);

  const teluguNak = TELUGU_NAKSHATRAS[nakIdx] ?? TELUGU_NAKSHATRAS[0];
  const nextNak = TELUGU_NAKSHATRAS[(nakIdx + 1) % 27] ?? TELUGU_NAKSHATRAS[0];

  // Yoga
  const sumLon = (sunSidLon + moonSidLon) % 360;
  const yogaIdx = Math.floor(sumLon / nakSpan);
  const yogaItem = TELUGU_YOGAS[yogaIdx] ?? TELUGU_YOGAS[0];

  // Karana
  const karanaNameRaw = panchanga.karana.name;
  const karanaMeta = TELUGU_KARANAS[karanaNameRaw] ?? {
    nameTe: karanaNameRaw,
    typeTe: 'కరణం',
    isBhadra: false,
  };

  // Live Kala Timings
  const octantMs = dayDurationMs / 8;
  const rahuOctants = [8, 2, 7, 5, 6, 4, 3];
  const yamaOctants = [5, 4, 3, 2, 1, 7, 6];
  const gulikaOctants = [7, 6, 5, 4, 3, 2, 1];

  const rahuStartMs = sunriseMs + (rahuOctants[dayOfWeek] - 1) * octantMs;
  const rahuEndMs = rahuStartMs + octantMs;
  const isRahuActive = targetMs >= rahuStartMs && targetMs <= rahuEndMs;

  const yamaStartMs = sunriseMs + (yamaOctants[dayOfWeek] - 1) * octantMs;
  const yamaEndMs = yamaStartMs + octantMs;
  const isYamaActive = targetMs >= yamaStartMs && targetMs <= yamaEndMs;

  const gulikaStartMs = sunriseMs + (gulikaOctants[dayOfWeek] - 1) * octantMs;
  const gulikaEndMs = gulikaStartMs + octantMs;
  const isGulikaActive = targetMs >= gulikaStartMs && targetMs <= gulikaEndMs;

  // Abhijit Muhurta (Midday 8th muhurta of 15 daylight muhurtas)
  const muhurtaSpanMs = dayDurationMs / 15;
  const solarNoonMs = sunriseMs + dayDurationMs / 2;
  const abhijitStartMs = solarNoonMs - muhurtaSpanMs / 2;
  const abhijitEndMs = solarNoonMs + muhurtaSpanMs / 2;
  const isAbhijitActive = targetMs >= abhijitStartMs && targetMs <= abhijitEndMs;

  // Brahma Muhurta (96 mins to 48 mins before sunrise)
  const brahmaStartMs = sunriseMs - 96 * 60 * 1000;
  const brahmaEndMs = sunriseMs - 48 * 60 * 1000;
  const isBrahmaActive = targetMs >= brahmaStartMs && targetMs <= brahmaEndMs;

  // Durmuhurtham (based on weekday)
  // Sun: 14th muhurta, Mon: 9th & 12th, Tue: 4th & 11th, Wed: 5th, Thu: 6th & 13th, Fri: 4th & 9th, Sat: 2nd & 3rd
  const durmuhurthaOffsets: Record<number, number[]> = {
    0: [14],
    1: [9, 12],
    2: [4, 11],
    3: [5],
    4: [6, 13],
    5: [4, 9],
    6: [2, 3],
  };
  const activeDurmuhurthaSlot = durmuhurthaOffsets[dayOfWeek]?.some((slot) => {
    const s = sunriseMs + (slot - 1) * muhurtaSpanMs;
    const e = s + muhurtaSpanMs;
    return targetMs >= s && targetMs <= e;
  }) ?? false;

  // Amrit Kalam & Varjyam (Approximate for nakshatra span)
  const amritStartMs = abhijitStartMs + 2 * muhurtaSpanMs;
  const isAmritActive = targetMs >= amritStartMs && targetMs <= amritStartMs + muhurtaSpanMs;

  // Determine active primary Kala Right Now
  let activeKalaNameTe: string | null = null;
  let activeKalaType: 'auspicious' | 'inauspicious' | 'neutral' = 'neutral';
  let activeKalaRemainingMinutes = 0;

  if (isRahuActive) {
    activeKalaNameTe = 'రాహు కాలం (అశుభం)';
    activeKalaType = 'inauspicious';
    activeKalaRemainingMinutes = Math.max(1, Math.round((rahuEndMs - targetMs) / 60000));
  } else if (isYamaActive) {
    activeKalaNameTe = 'యమగండం (అశుభం)';
    activeKalaType = 'inauspicious';
    activeKalaRemainingMinutes = Math.max(1, Math.round((yamaEndMs - targetMs) / 60000));
  } else if (isGulikaActive) {
    activeKalaNameTe = 'గుళిక కాలం (మధ్యమం)';
    activeKalaType = 'neutral';
    activeKalaRemainingMinutes = Math.max(1, Math.round((gulikaEndMs - targetMs) / 60000));
  } else if (isAbhijitActive) {
    activeKalaNameTe = 'అభిజిత్ ముహూర్తం (విజయ శుభం ★)';
    activeKalaType = 'auspicious';
    activeKalaRemainingMinutes = Math.max(1, Math.round((abhijitEndMs - targetMs) / 60000));
  } else if (isBrahmaActive) {
    activeKalaNameTe = 'బ్రహ్మ ముహూర్తం (దివ్య సాధనా కాలం ★)';
    activeKalaType = 'auspicious';
    activeKalaRemainingMinutes = Math.max(1, Math.round((brahmaEndMs - targetMs) / 60000));
  } else if (activeDurmuhurthaSlot) {
    activeKalaNameTe = 'దుర్ముహూర్తం (వర్జ్యం)';
    activeKalaType = 'inauspicious';
    activeKalaRemainingMinutes = 24;
  }

  // Live Hora Calculation
  // 12 day horas from sunrise + 12 night horas from sunset
  const dayHoraMs = dayDurationMs / 12;
  const nightHoraMs = nightDurationMs / 12;
  const dayLordPlanet = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'][dayOfWeek];
  const startHoraIdx = CHALDEAN_HORA_PLANETS.indexOf(dayLordPlanet);

  let currentHoraPlanetId = 'Jupiter';
  let horaEndTimeMs = targetMs + 30 * 60 * 1000;
  let nextHoraPlanetId = 'Venus';

  if (isDaytime) {
    const elapsedSinceSunrise = targetMs - sunriseMs;
    const horaIndex = Math.min(11, Math.floor(elapsedSinceSunrise / dayHoraMs));
    currentHoraPlanetId = CHALDEAN_HORA_PLANETS[(startHoraIdx + horaIndex) % 7];
    horaEndTimeMs = sunriseMs + (horaIndex + 1) * dayHoraMs;
    nextHoraPlanetId = CHALDEAN_HORA_PLANETS[(startHoraIdx + horaIndex + 1) % 7];
  } else {
    const elapsedSinceSunset = (targetMs - sunsetMs + 24 * 3600 * 1000) % (24 * 3600 * 1000);
    const horaIndex = Math.min(11, Math.floor(elapsedSinceSunset / nightHoraMs));
    currentHoraPlanetId = CHALDEAN_HORA_PLANETS[(startHoraIdx + 12 + horaIndex) % 7];
    horaEndTimeMs = sunsetMs + (horaIndex + 1) * nightHoraMs;
    nextHoraPlanetId = CHALDEAN_HORA_PLANETS[(startHoraIdx + 12 + horaIndex + 1) % 7];
  }

  const horaMeta = HORA_PLANET_METAS[currentHoraPlanetId] ?? HORA_PLANET_METAS.Jupiter;
  const nextHoraMeta = HORA_PLANET_METAS[nextHoraPlanetId] ?? HORA_PLANET_METAS.Venus;

  // Live Choghadiya Calculation (8 day slots from sunrise)
  const choghadiyaSlotMs = dayDurationMs / 8;
  const choghadiyaOrder = CHOGHADIYA_ORDERS[dayOfWeek] ?? CHOGHADIYA_ORDERS[0];
  let currentChoghadiyaName = 'Amrit';
  let choghadiyaEndMs = targetMs + 45 * 60 * 1000;
  let nextChoghadiyaName = 'Shubh';

  if (isDaytime) {
    const chogIdx = Math.min(7, Math.floor((targetMs - sunriseMs) / choghadiyaSlotMs));
    currentChoghadiyaName = choghadiyaOrder[chogIdx] ?? 'Amrit';
    choghadiyaEndMs = sunriseMs + (chogIdx + 1) * choghadiyaSlotMs;
    nextChoghadiyaName = choghadiyaOrder[(chogIdx + 1) % 8] ?? 'Shubh';
  } else {
    // Night choghadiya starts with 5th day choghadiya
    const nightSlotMs = nightDurationMs / 8;
    const elapsedSinceSunset = (targetMs - sunsetMs + 24 * 3600 * 1000) % (24 * 3600 * 1000);
    const chogIdx = Math.min(7, Math.floor(elapsedSinceSunset / nightSlotMs));
    const nightStartOrder = choghadiyaOrder.slice(4).concat(choghadiyaOrder.slice(0, 4));
    currentChoghadiyaName = nightStartOrder[chogIdx] ?? 'Shubh';
    choghadiyaEndMs = sunsetMs + (chogIdx + 1) * nightSlotMs;
    nextChoghadiyaName = nightStartOrder[(chogIdx + 1) % 8] ?? 'Amrit';
  }

  const chogMeta = CHOGHADIYA_META[currentChoghadiyaName] ?? CHOGHADIYA_META.Amrit;
  const nextChogMeta = CHOGHADIYA_META[nextChoghadiyaName] ?? CHOGHADIYA_META.Shubh;

  // Vedic Samvatsara & Ritu calculations
  // Current year (2024-2025 is Krodhi / 2025-2026 is Vishvavasu)
  const isAfterChaitra = localDate.getUTCMonth() >= 3;
  const currentSamvatsara = isAfterChaitra ? 'శ్రీ క్రోధినామ సంవత్సరం' : 'శ్రీ శోభకృత్ నామ సంవత్సరం';
  const isUttarayana = localDate.getUTCMonth() >= 0 && localDate.getUTCMonth() < 6;
  const ayanaNameTe = isUttarayana ? 'ఉత్తరాయణం (దేవమార్గం)' : 'దక్షిణాయనం (పితృమార్గం)';

  const rituNames = [
    'శిశిర ఋతువు', 'వసంత ఋతువు', 'వసంత ఋతువు', 'గ్రీష్మ ఋతువు', 'గ్రీష్మ ఋతువు',
    'వర్ష ఋతువు', 'వర్ష ఋతువు', 'శరద్ ఋతువు', 'శరద్ ఋతువు', 'హేమంత ఋతువు', 'హేమంత ఋతువు', 'శిశిర ఋతువు',
  ];
  const rituNameTe = rituNames[localDate.getUTCMonth()] ?? 'శరద్ ఋతువు';

  const maasaNames = [
    'పుష్య - మాఘ మాసము', 'మాఘ - ఫాల్గుణ మాసము', 'ఫాల్గుణ - చైత్ర మాసము',
    'చైత్ర మాసము', 'వైశాఖ మాసము', 'జ్యేష్ఠ మాసము', 'ఆషాఢ మాసము',
    'శ్రావణ మాసము', 'భాద్రపద మాసము', 'ఆశ్వయుజ మాసము', 'కార్తీక మాసము', 'మార్గశిర మాసము',
  ];
  const maasaNameTe = maasaNames[localDate.getUTCMonth()] ?? 'ఆశ్వయుజ మాసము';

  return {
    timestampMs: targetMs,
    localTimeStr,
    localDateStr,
    dayOfWeekNameTe: vaaraInfo.nameTe,
    dayOfWeekNameEn: vaaraInfo.nameEn,
    locationName,
    latitude: lat,
    longitude: lng,
    tzOffsetHours,

    sunriseLocal,
    sunsetLocal,
    moonriseLocal,
    moonsetLocal,
    dayLengthStr: `${dayHours} గంటలు`,
    nightLengthStr: `${nightHours} గంటలు`,
    isDaytime,

    tithi: {
      number: tithiIdx + 1,
      nameTe: tithiNameTe,
      pakshaTe: isShukla ? 'శుక్ల పక్షం (చంద్రవృద్ధి)' : 'కృష్ణ పక్షం (చంద్రక్షయ)',
      pakshaEn: isShukla ? 'Shukla Paksha' : 'Krishna Paksha',
      lordTe: ['రవి', 'చంద్ర', 'కుజ', 'బుధ', 'గురు', 'శుక్ర', 'శని', 'రాహు'][tithiIdx % 8],
      percentElapsed: tithiPercent,
      endTimeLocal: tithiEndTimeLocal,
      nextTithiNameTe,
      isShubha: ![4, 9, 14, 19, 24, 29].includes(tithiIdx),
      deityTe: tithiDeityTe,
    },

    nakshatra: {
      number: nakIdx + 1,
      nameTe: teluguNak.nameTe,
      nameEn: teluguNak.nameEn,
      pada,
      lordTe: teluguNak.lordTe,
      deityTe: teluguNak.deityTe,
      ganaTe: teluguNak.ganaTe,
      yoniTe: teluguNak.yoniTe,
      percentElapsed: Number(((degInNak / nakSpan) * 100).toFixed(1)),
      endTimeLocal: nakEndTimeLocal,
      nextNakshatraNameTe: nextNak.nameTe,
      isShubha: !['భరణి', 'కృత్తిక', 'ఆరుద్ర', 'ఆశ్లేష', 'జ్యేష్ఠ'].includes(teluguNak.nameTe),
    },

    yoga: {
      number: yogaIdx + 1,
      nameTe: yogaItem.nameTe,
      nameEn: panchanga.yoga.name,
      meaningTe: yogaItem.meaningTe,
      isShubha: yogaItem.isShubha,
    },

    karana: {
      nameTe: karanaMeta.nameTe,
      nameEn: karanaNameRaw,
      typeTe: karanaMeta.typeTe,
      isBhadraVishti: karanaMeta.isBhadra,
      bhadraWarningTe: karanaMeta.isBhadra
        ? 'ప్రస్తుతం విష్టి (భద్ర) కరణం నడుస్తోంది — నూతన గృహప్రవేశం, వివాహం, ఒప్పందాలు వర్జ్యం.'
        : undefined,
    },

    vaara: {
      nameTe: vaaraInfo.nameTe,
      nameEn: vaaraInfo.nameEn,
      lordTe: vaaraInfo.lordTe,
      shubhaColorTe: vaaraInfo.shubhaColorTe,
      deityTe: vaaraInfo.deityTe,
    },

    kalaStatus: {
      activeKalaNameTe,
      activeKalaType,
      activeKalaRemainingMinutes,
      rahuKalam: {
        window: `${fmtTime(rahuStartMs)} – ${fmtTime(rahuEndMs)}`,
        isActive: isRahuActive,
        remainingMinutes: isRahuActive ? Math.max(1, Math.round((rahuEndMs - targetMs) / 60000)) : 0,
      },
      yamagandam: {
        window: `${fmtTime(yamaStartMs)} – ${fmtTime(yamaEndMs)}`,
        isActive: isYamaActive,
        remainingMinutes: isYamaActive ? Math.max(1, Math.round((yamaEndMs - targetMs) / 60000)) : 0,
      },
      gulikaKalam: {
        window: `${fmtTime(gulikaStartMs)} – ${fmtTime(gulikaEndMs)}`,
        isActive: isGulikaActive,
        remainingMinutes: isGulikaActive ? Math.max(1, Math.round((gulikaEndMs - targetMs) / 60000)) : 0,
      },
      abhijitMuhurta: {
        window: `${fmtTime(abhijitStartMs)} – ${fmtTime(abhijitEndMs)}`,
        isActive: isAbhijitActive,
        remainingMinutes: isAbhijitActive ? Math.max(1, Math.round((abhijitEndMs - targetMs) / 60000)) : 0,
      },
      brahmaMuhurta: {
        window: `${fmtTime(brahmaStartMs)} – ${fmtTime(brahmaEndMs)}`,
        isActive: isBrahmaActive,
      },
      amritKalam: {
        window: `${fmtTime(amritStartMs)} – ${fmtTime(amritStartMs + muhurtaSpanMs)}`,
        isActive: isAmritActive,
      },
      durmuhurtham: {
        window: `${fmtTime(sunriseMs + 3 * muhurtaSpanMs)} – ${fmtTime(sunriseMs + 4 * muhurtaSpanMs)}`,
        isActive: activeDurmuhurthaSlot,
      },
      varjyam: {
        window: `${fmtTime(sunriseMs + 6 * muhurtaSpanMs)} – ${fmtTime(sunriseMs + 7.5 * muhurtaSpanMs)}`,
        isActive: false,
      },
    },

    currentHora: {
      planetId: currentHoraPlanetId,
      planetNameTe: horaMeta.nameTe,
      nature: horaMeta.nature,
      badgeTe: horaMeta.badgeTe,
      bestActivitiesTe: horaMeta.bestActivitiesTe,
      endTimeLocal: fmtTime(horaEndTimeMs),
      remainingMinutes: Math.max(1, Math.round((horaEndTimeMs - targetMs) / 60000)),
      nextHoraPlanetTe: nextHoraMeta.nameTe,
    },

    currentChoghadiya: {
      nameTe: chogMeta.nameTe,
      nameEn: currentChoghadiyaName,
      rulerTe: chogMeta.rulerTe,
      nature: chogMeta.nature,
      badgeTe: chogMeta.badgeTe,
      isAuspicious: chogMeta.isAuspicious,
      endTimeLocal: fmtTime(choghadiyaEndMs),
      remainingMinutes: Math.max(1, Math.round((choghadiyaEndMs - targetMs) / 60000)),
      nextChoghadiyaTe: nextChogMeta.nameTe,
    },

    vedicEra: {
      samvatsaraNameTe: currentSamvatsara,
      ayanaNameTe,
      rituNameTe,
      maasaNameTe,
      kalyugYear: 5126,
      shakaEraYear: 1946,
    },
  };
}
