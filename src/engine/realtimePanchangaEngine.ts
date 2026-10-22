import { computeDayPanchanga } from './hinduCalendarEngine.ts';
import { msFromJd } from './astroCore.ts';
import { TELUGU_NAKSHATRAS } from './teluguJathakam.ts';

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
    durmuhurtham: { window: string; isActive: boolean };
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
 * Real-time Panchanga feed.
 *
 * All pañcāṅga elements are delegated to `hinduCalendarEngine.computeDayPanchanga`
 * (true sidereal Sun/Moon, Lahiri ayanāṁśa, sunrise-anchored angas, computed
 * saṁvatsara / ṛtu / ayana / māsa). This function only adds the "live" layer:
 * which kāla, horā and choṣhaḍiyā are running at `targetDate`, and how many
 * minutes remain.
 */
export function getRealtimePanchangaFeed(
  targetDate: Date,
  lat: number,
  lng: number,
  tzOffsetHours: number,
  locationName: string = 'హైదరాబాద్ (తెలంగాణ)'
): RealtimePanchangaFeed {
  const targetMs = targetDate.getTime();
  const localMsValue = targetMs + tzOffsetHours * 3600 * 1000;
  const local = new Date(localMsValue);
  const dateISO = `${local.getUTCFullYear()}-${String(local.getUTCMonth() + 1).padStart(2, '0')}-${String(
    local.getUTCDate()
  ).padStart(2, '0')}`;
  const localTimeStr = `${String(local.getUTCHours()).padStart(2, '0')}:${String(local.getUTCMinutes()).padStart(
    2,
    '0'
  )}:${String(local.getUTCSeconds()).padStart(2, '0')}`;

  const geo = { lat, lng, tzOffsetHours, placeName: locationName };
  const day = computeDayPanchanga(dateISO, geo);

  const toMs = (jd: number | null) => (jd === null ? null : msFromJd(jd));
  const sunriseMs = toMs(day.sunriseJd) ?? localMsValue;
  const sunsetMs = toMs(day.sunsetJd) ?? localMsValue + 6 * 3600 * 1000;
  const isDaytime = targetMs >= sunriseMs && targetMs <= sunsetMs;

  const fmtTime = (ms: number | null) => {
    if (ms === null) return '—';
    const d = new Date(ms + tzOffsetHours * 3600 * 1000);
    return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
  };

  const dayHours = (day.dayLengthMs / 3_600_000).toFixed(1);
  const nightHours = (day.nightLengthMs / 3_600_000).toFixed(1);

  const vaaraInfo = TELUGU_VAARAS[day.weekday.index] ?? TELUGU_VAARAS[0];
  const teluguNak = TELUGU_NAKSHATRAS[day.nakshatra.number - 1];
  const yogaMeta = TELUGU_YOGAS[day.yoga.number - 1];
  const karanaRawName = day.karana.nameEn;
  const karanaMeta =
    TELUGU_KARANAS[karanaRawName] ??
    Object.values(TELUGU_KARANAS).find((k) => k.nameTe === day.karana.nameTe) ?? {
      nameTe: day.karana.nameTe,
      typeTe: 'చర కరణం',
      isBhadra: day.karana.isBhadra,
    };

  const tithiIndex = day.tithi.number - 1;
  const isShukla = tithiIndex < 15;

  /* ---------- live kala detection ---------- */
  const windowByKey = (key: string) => day.kalas.find((k) => k.key === key) ?? null;
  const containsNow = (startJd: number | null, endJd: number | null) => {
    if (startJd === null || endJd === null) return false;
    const s = msFromJd(startJd);
    const e = msFromJd(endJd);
    return e > s ? targetMs >= s && targetMs < e : targetMs >= s || targetMs < e;
  };

  const kalaWindow = (key: string) => {
    const w = windowByKey(key);
    return {
      window: w ? `${w.startTime} – ${w.endTime}` : '—',
      isActive: w ? containsNow(w.startJd, w.endJd) : false,
      remainingMinutes:
        w && w.endJd && containsNow(w.startJd, w.endJd)
          ? Math.max(1, Math.round((msFromJd(w.endJd) - targetMs) / 60000))
          : 0,
    };
  };

  const durmuhurtaWindows = day.kalas.filter((k) => k.key.startsWith('durmuhurta'));
  const activeDurmuhurta = durmuhurtaWindows.find((k) => containsNow(k.startJd, k.endJd)) ?? null;
  const bhadraWindow = windowByKey('bhadra');

  // Which kala is running right now (inauspicious windows take precedence in display)
  const activeWindow =
    day.kalas
      .filter((k) => k.key !== 'bhadra' && containsNow(k.startJd, k.endJd))
      .sort((a, b) => (a.quality === 'inauspicious' ? -1 : 0) - (b.quality === 'inauspicious' ? -1 : 0))[0] ?? null;

  const activeKalaNameTe = activeWindow
    ? activeDurmuhurta && activeWindow.key.startsWith('durmuhurta')
      ? 'దుర్ముహూర్తం'
      : activeWindow.nameTe
    : null;
  const activeKalaType: 'auspicious' | 'inauspicious' | 'neutral' = activeWindow
    ? activeWindow.quality
    : 'neutral';
  const activeKalaRemainingMinutes =
    activeWindow && activeWindow.endJd
      ? Math.max(1, Math.round((msFromJd(activeWindow.endJd) - targetMs) / 60000))
      : 0;

  /* ---------- hora & choghadiya ---------- */
  const horaWindow =
    day.hora.find((h) => containsNow(h.startJd, h.endJd)) ?? day.hora[day.hora.length - 1];
  const nextHoraWindow = day.hora[(day.hora.indexOf(horaWindow) + 1) % day.hora.length];
  const planetKeyFromName = (nameTe: string): string => {
    if (nameTe.includes('రవి') || nameTe.includes('సూర్య')) return 'Sun';
    if (nameTe.includes('చంద్ర')) return 'Moon';
    if (nameTe.includes('కుజ') || nameTe.includes('అంగారక')) return 'Mars';
    if (nameTe.includes('బుధ')) return 'Mercury';
    if (nameTe.includes('గురు') || nameTe.includes('బృహస్పతి')) return 'Jupiter';
    if (nameTe.includes('శుక్ర')) return 'Venus';
    if (nameTe.includes('శని')) return 'Saturn';
    return 'Jupiter';
  };
  const horaPlanetId = planetKeyFromName(horaWindow?.nameTe ?? 'జూపిటర్');
  const nextHoraPlanetId = planetKeyFromName(nextHoraWindow?.nameTe ?? '');
  const horaMeta = HORA_PLANET_METAS[horaPlanetId] ?? HORA_PLANET_METAS.Jupiter;
  const nextHoraMeta = HORA_PLANET_METAS[nextHoraPlanetId] ?? HORA_PLANET_METAS.Venus;
  const horaEndMs = horaWindow?.endJd ? msFromJd(horaWindow.endJd) : targetMs + 3_600_000;

  const chogAll = [...day.choghadiya.day, ...day.choghadiya.night];
  const chogWindow = chogAll.find((c) => containsNow(c.startJd, c.endJd)) ?? chogAll[0];
  const nextChogWindow = chogAll[(chogAll.indexOf(chogWindow) + 1) % chogAll.length];
  const chogKeyFromName = (nameTe: string): string => {
    if (nameTe.includes('అమృత')) return 'Amrit';
    if (nameTe.includes('శుభ')) return 'Shubh';
    if (nameTe.includes('లాభ')) return 'Labh';
    if (nameTe.includes('చర')) return 'Char';
    if (nameTe.includes('రోగ')) return 'Rog';
    if (nameTe.includes('కాల')) return 'Kaal';
    if (nameTe.includes('ఉద్వేగ')) return 'Udveg';
    return 'Shubh';
  };
  const chogMeta = CHOGHADIYA_META[chogKeyFromName(chogWindow?.nameTe ?? 'శుభం')] ?? CHOGHADIYA_META.Shubh;
  const nextChogMeta = CHOGHADIYA_META[chogKeyFromName(nextChogWindow?.nameTe ?? '')] ?? CHOGHADIYA_META.Shubh;
  const chogEndMs = chogWindow?.endJd ? msFromJd(chogWindow.endJd) : targetMs + 45 * 60 * 1000;

  const tithiDeityTe =
    TITHI_DEITIES_TE[tithiIndex] ?? 'బ్రహ్మ';
  const tithiLordTe = ['రవి', 'చంద్ర', 'కుజ', 'బుధ', 'గురు', 'శుక్ర', 'శని', 'రాహు'][tithiIndex % 8];

  return {
    timestampMs: targetMs,
    localTimeStr,
    localDateStr: dateISO,
    dayOfWeekNameTe: day.weekday.nameTe,
    dayOfWeekNameEn: day.weekday.nameEn,
    locationName,
    latitude: lat,
    longitude: lng,
    tzOffsetHours,

    sunriseLocal: day.sunrise,
    sunsetLocal: day.sunset,
    moonriseLocal: day.moonrise,
    moonsetLocal: day.moonset,
    dayLengthStr: `${dayHours} గంటలు`,
    nightLengthStr: `${nightHours} గంటలు`,
    isDaytime,

    tithi: {
      number: day.tithi.number,
      nameTe: day.tithi.nameTe,
      pakshaTe: day.tithi.pakshaTe,
      pakshaEn: day.tithi.pakshaEn,
      lordTe: tithiLordTe,
      percentElapsed: day.tithi.percentElapsed,
      endTimeLocal: day.tithi.endTime,
      nextTithiNameTe: day.tithi.nextNameTe ?? '',
      isShubha: ![4, 9, 14, 19, 24, 29].includes(tithiIndex) && tithiIndex !== 29,
      deityTe: tithiDeityTe,
    },

    nakshatra: {
      number: day.nakshatra.number,
      nameTe: teluguNak.nameTe,
      nameEn: teluguNak.nameEn,
      pada: day.nakshatra.pada,
      lordTe: teluguNak.lordTe,
      deityTe: teluguNak.deityTe,
      ganaTe: teluguNak.ganaTe,
      yoniTe: teluguNak.yoniTe,
      percentElapsed: day.nakshatra.percentElapsed,
      endTimeLocal: day.nakshatra.endTime,
      nextNakshatraNameTe: day.nakshatra.nextNameTe ?? '',
      isShubha: !['భరణి', 'కృత్తిక', 'ఆరుద్ర', 'ఆశ్లేష', 'జ్యేష్ఠ'].includes(teluguNak.nameTe),
    },

    yoga: {
      number: day.yoga.number,
      nameTe: day.yoga.nameTe,
      nameEn: day.yoga.nameEn,
      meaningTe: yogaMeta?.meaningTe ?? day.yoga.meaningTe,
      isShubha: yogaMeta?.isShubha ?? day.yoga.isAuspicious,
    },

    karana: {
      nameTe: karanaMeta.nameTe,
      nameEn: karanaRawName,
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
      rahuKalam: kalaWindow('rahu'),
      yamagandam: kalaWindow('yamaganda'),
      gulikaKalam: kalaWindow('gulika'),
      abhijitMuhurta: kalaWindow('abhijit'),
      brahmaMuhurta: (() => {
        const w = windowByKey('brahma');
        return { window: w ? `${w.startTime} – ${w.endTime}` : '—', isActive: w ? containsNow(w.startJd, w.endJd) : false };
      })(),
      durmuhurtham: {
        window: activeDurmuhurta
          ? `${activeDurmuhurta.startTime} – ${activeDurmuhurta.endTime}`
          : durmuhurtaWindows
              .map((w) => `${w.startTime} – ${w.endTime}`)
              .join(' · ') || '—',
        isActive: Boolean(activeDurmuhurta),
      },
    },

    currentHora: {
      planetId: horaPlanetId,
      planetNameTe: horaMeta.nameTe,
      nature: horaMeta.nature,
      badgeTe: horaMeta.badgeTe,
      bestActivitiesTe: horaMeta.bestActivitiesTe,
      endTimeLocal: fmtTime(horaEndMs),
      remainingMinutes: Math.max(1, Math.round((horaEndMs - targetMs) / 60000)),
      nextHoraPlanetTe: nextHoraMeta.nameTe,
    },

    currentChoghadiya: {
      nameTe: chogMeta.nameTe,
      nameEn: chogKeyFromName(chogWindow?.nameTe ?? 'శుభం'),
      rulerTe: chogMeta.rulerTe,
      nature: chogMeta.nature,
      badgeTe: chogMeta.badgeTe,
      isAuspicious: chogMeta.isAuspicious,
      endTimeLocal: fmtTime(chogEndMs),
      remainingMinutes: Math.max(1, Math.round((chogEndMs - targetMs) / 60000)),
      nextChoghadiyaTe: nextChogMeta.nameTe,
    },

    vedicEra: {
      samvatsaraNameTe: `శ్రీ ${day.era.samvatsaraTe} నామ సంవత్సరం`,
      ayanaNameTe: day.era.ayanaTe,
      rituNameTe: day.era.rituTe,
      maasaNameTe: `${day.era.masaLabelTe} మాసము (${day.era.pakshaTe})`,
      kalyugYear: day.era.kaliYear,
      shakaEraYear: day.era.shakaYear,
    },
  };
}

/** Tithi deities in order (śukla pratipadā → amāvāsyā). */
const TITHI_DEITIES_TE = [
  'అగ్ని', 'బ్రహ్మ', 'గౌరీ', 'గణేశుడు', 'నాగ దేవత', 'కార్తికేయుడు', 'సూర్యుడు', 'శివుడు',
  'దుర్గ', 'యముడు', 'విశ్వేదేవతలు', 'విష్ణువు', 'కామదేవుడు', 'శివుడు', 'చంద్రుడు',
  'అగ్ని', 'బ్రహ్మ', 'గౌరీ', 'గణేశుడు', 'నాగ దేవత', 'కార్తికేయుడు', 'సూర్యుడు', 'శివుడు',
  'దుర్గ', 'యముడు', 'విశ్వేదేవతలు', 'విష్ణువు', 'కామదేవుడు', 'శివుడు', 'పితృ దేవతలు',
];
