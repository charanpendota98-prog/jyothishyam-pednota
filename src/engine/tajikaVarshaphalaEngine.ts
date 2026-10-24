import {
  calculateChart,
  type BirthInput,
  type CompleteChartResult,
  type PlanetPosition,
} from './ephemeris.ts';
import {
  TELUGU_RASIS,
  TELUGU_PLANETS,
  TELUGU_NAKSHATRAS,
} from './teluguJathakam.ts';

export interface TajikaOfficeHolder {
  roleTe: string;
  roleEn: string;
  planetId: string;
  planetNameTe: string;
  rasiNameTe: string;
  houseInVarsha: number;
  panchavargiyaScore: number;
  isVarsheshwara: boolean;
}

export interface TajikaYogaItem {
  id: string;
  nameTe: string;
  nameEn: string;
  planetsTe: string;
  natureTe: 'రాజయోగప్రదం (Highly Auspicious)' | 'మిశ్రమ ఫలం (Moderate/Mixed)' | 'జాగ్రత్త అవసరం (Cautionary)';
  sanskritRuleTe: string;
  vivaranaTe: string;
}

export interface TajikaSahamItem {
  id: string;
  nameTe: string;
  formulaTe: string;
  longitudeDeg: number;
  rasiIndex: number;
  rasiNameTe: string;
  degreeFormatted: string;
  houseInVarsha: number;
  sahamLordTe: string;
  phalamTe: string;
}

export interface MuddaDashaPeriod {
  lordId: string;
  lordNameTe: string;
  startDate: string;
  endDate: string;
  daysCount: number;
  houseInVarsha: number;
  rasiNameTe: string;
  isCurrent: boolean;
  phalamTe: string;
}

export interface MonthlyVarshaForecast {
  monthNumber: number; // 1 to 12
  calendarMonthLabelTe: string;
  dateRangeTe: string;
  sunTransitRasiTe: string;
  monthlyHouseFromMoon: number;
  monthlyHouseFromVarshaLagna: number;
  fortuneScorePct: number;
  statusBadgeTe: string;
  careerAndWealthTe: string;
  familyAndHealthTe: string;
  auspiciousDatesTe: string;
  cautionDatesTe: string;
  monthlyRemedyTe: string;
}

export interface TajikaVarshaphalaReport {
  targetYear: number;
  completedAge: number;
  runningYearOfLife: number;
  varshaPraveshaDate: string;
  varshaPraveshaTime: string;
  varshaPraveshaWeekdayTe: string;
  natalSunSiderealLon: number;
  varshaChart: CompleteChartResult;

  // Varsha Lagna & Muntha
  janmaLagnaRasiTe: string;
  varshaLagnaRasiIndex: number;
  varshaLagnaRasiTe: string;
  varshaLagnaLordTe: string;
  munthaRasiIndex: number;
  munthaRasiTe: string;
  munthaHouseFromVarshaLagna: number;
  munthaHouseFromJanmaLagna: number;
  muntheshPlanetId: string;
  muntheshPlanetTe: string;
  muntheshHouseInVarsha: number;
  munthaDetailedVerdictTe: string;
  munthaRemedyTe: string;

  // Varsheshwara (Year Lord) & Panchadhikaris
  varsheshwaraPlanetId: string;
  varsheshwaraPlanetTe: string;
  varsheshwaraPanchavargiyaBala: number;
  varsheshwaraVerdictTe: string;
  panchadhikaris: TajikaOfficeHolder[];

  // Tajika Yogas, Sahams, Mudda Dasha & 12-Month Forecast
  tajikaYogas: TajikaYogaItem[];
  sahams: TajikaSahamItem[];
  muddaDashas: MuddaDashaPeriod[];
  twelveMonthForecasts: MonthlyVarshaForecast[];
  annualExecutiveSummaryTe: string;
  annualOverallScorePct: number;
}

const SIGN_LORD_ID: string[] = [
  'Mars',    // 0 Mesha
  'Venus',   // 1 Vrishabha
  'Mercury', // 2 Mithuna
  'Moon',    // 3 Karkataka
  'Sun',     // 4 Simha
  'Mercury', // 5 Kanya
  'Venus',   // 6 Tula
  'Mars',    // 7 Vrishchika
  'Jupiter', // 8 Dhanu
  'Saturn',  // 9 Makara
  'Saturn',  // 10 Kumbha
  'Jupiter', // 11 Meena
];

const VIMSHOTTARI_ORDER = [
  'Ketu',
  'Venus',
  'Sun',
  'Moon',
  'Mars',
  'Rahu',
  'Jupiter',
  'Saturn',
  'Mercury',
];

const VIMSHOTTARI_YEARS: Record<string, number> = {
  Ketu: 7,
  Venus: 20,
  Sun: 6,
  Moon: 10,
  Mars: 7,
  Rahu: 18,
  Jupiter: 16,
  Saturn: 19,
  Mercury: 17,
};

// Classical Tajika Planet Speed Order (fastest to slowest): Moon > Mercury > Venus > Sun > Mars > Jupiter > Saturn
const TAJIKA_SPEED_RANK: Record<string, number> = {
  Moon: 1,
  Mercury: 2,
  Venus: 3,
  Sun: 4,
  Mars: 5,
  Jupiter: 6,
  Saturn: 7,
};

// Tajika Deeptamsa (Orb of Aspect in Degrees) from Tajika Nilakanthi
const TAJIKA_DEEPTAMSA: Record<string, number> = {
  Sun: 15,
  Moon: 12,
  Mars: 8,
  Mercury: 7,
  Jupiter: 9,
  Venus: 7,
  Saturn: 9,
};

// Tri-Rashi (Day / Night) Lords for the 12 Signs according to Tajika Nilakanthi
const TRI_RASHI_LORDS: { day: string; night: string }[] = [
  { day: 'Venus', night: 'Jupiter' },   // 0 Mesha
  { day: 'Moon', night: 'Venus' },      // 1 Vrishabha
  { day: 'Saturn', night: 'Mercury' },  // 2 Mithuna
  { day: 'Venus', night: 'Mars' },      // 3 Karkataka
  { day: 'Jupiter', night: 'Sun' },     // 4 Simha
  { day: 'Moon', night: 'Venus' },      // 5 Kanya
  { day: 'Saturn', night: 'Mercury' },  // 6 Tula
  { day: 'Venus', night: 'Mars' },      // 7 Vrishchika
  { day: 'Saturn', night: 'Saturn' },   // 8 Dhanu
  { day: 'Mars', night: 'Mars' },       // 9 Makara
  { day: 'Jupiter', night: 'Jupiter' }, // 10 Kumbha
  { day: 'Moon', night: 'Moon' },       // 11 Meena
];

const WEEKDAYS_TE = [
  'ఆదివారం (భానువాసరం)',
  'సోమవారం (ఇందువాసరం)',
  'మంగళవారం (భౌమవాసరం)',
  'బుధవారం (సౌమ్యవాసరం)',
  'గురువారం (బృహస్పతివాసరం)',
  'శుక్రవారం (భృగువాసరం)',
  'శనివారం (స్థిరవాసరం)',
];

const MONTH_NAMES_TE = [
  'జనవరి (January)',
  'ఫిబ్రవరి (February)',
  'మార్చి (March)',
  'ఏప్రిల్ (April)',
  'మే (May)',
  'జూన్ (June)',
  'జూలై (July)',
  'ఆగస్టు (August)',
  'సెప్టెంబర్ (September)',
  'అక్టోబర్ (October)',
  'నవంబర్ (November)',
  'డిసెంబర్ (December)',
];

function norm360(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

function formatDegToDMS(degInSign: number): string {
  const d = Math.floor(degInSign);
  const mFloat = (degInSign - d) * 60;
  const m = Math.floor(mFloat);
  const s = Math.round((mFloat - m) * 60);
  return `${String(d).padStart(2, '0')}° ${String(m).padStart(2, '0')}' ${String(Math.min(59, s)).padStart(2, '0')}"`;
}

/**
 * Computes the exact Solar Return (Varsha Pravesha) local date & time in targetYear
 * when the transiting Sun returns to natalSunSiderealLon.
 */
function findExactSolarReturnInput(
  natalInput: BirthInput,
  natalSunSiderealLon: number,
  targetYear: number
): { varshaInput: BirthInput; varshaChart: CompleteChartResult; weekdayTe: string } {
  const [, birthMonthStr, birthDayStr] = natalInput.date.split('-');
  const birthMonth = Number(birthMonthStr) || 5;
  const birthDay = Math.min(28, Number(birthDayStr) || 14);
  const [birthHStr, birthMStr] = natalInput.time.split(':');
  const birthH = Number(birthHStr) || 8;
  const birthM = Number(birthMStr) || 30;

  // Start guess at the native's birthday in targetYear
  let currentMs = Date.UTC(targetYear, birthMonth - 1, birthDay, birthH, birthM);

  const buildInputFromUtcMs = (utcMs: number): BirthInput => {
    const localMs = utcMs + natalInput.tzOffsetHours * 3600 * 1000;
    const d = new Date(localMs);
    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(d.getUTCDate()).padStart(2, '0');
    const hh = String(d.getUTCHours()).padStart(2, '0');
    const min = String(d.getUTCMinutes()).padStart(2, '0');
    return {
      ...natalInput,
      name: `${natalInput.name} — ${targetYear} వర్షఫల కుండలి`,
      date: `${yyyy}-${mm}-${dd}`,
      time: `${hh}:${min}`,
    };
  };

  // Iterative refinement (4 iterations of secant/Newton step using Sun's ~0.9856 deg/day speed)
  let candidateInput = buildInputFromUtcMs(currentMs);
  let candidateChart = calculateChart(candidateInput, 'vedic');

  for (let iter = 0; iter < 4; iter++) {
    const sunObj = candidateChart.planets.find((p) => p.id === 'Sun') ?? candidateChart.planets[0];
    let diffDeg = natalSunSiderealLon - sunObj.siderealLon;
    if (diffDeg > 180) diffDeg -= 360;
    if (diffDeg < -180) diffDeg += 360;
    if (Math.abs(diffDeg) < 0.008) break;

    const deltaDays = diffDeg / 0.985647;
    currentMs += deltaDays * 86400 * 1000;
    candidateInput = buildInputFromUtcMs(currentMs);
    candidateChart = calculateChart(candidateInput, 'vedic');
  }

  const localDateObj = new Date(currentMs + natalInput.tzOffsetHours * 3600 * 1000);
  const weekdayTe = WEEKDAYS_TE[localDateObj.getUTCDay()] ?? WEEKDAYS_TE[0];

  return {
    varshaInput: candidateInput,
    varshaChart: candidateChart,
    weekdayTe,
  };
}

/**
 * Estimates Tajika Panchavargiya Bala (out of 20 Vishwa / Biswa units) for a planet in the Varsha Chart
 */
function computePanchavargiyaBala(planet: PlanetPosition, varshaChart: CompleteChartResult): number {
  let score = 9.5; // Base Kshetra, Uchcha, Hadda, Drekkana, Navamsa composite
  if (planet.dignity === 'Exalted') score += 6.8;
  else if (planet.dignity === 'Moolatrikona' || planet.dignity === 'Own Sign') score += 5.4;
  else if (planet.dignity === 'Friendly') score += 3.2;
  else if (planet.dignity === 'Neutral') score += 1.8;
  else if (planet.dignity === 'Debilitated') score -= 2.0;

  if ([1, 4, 7, 10].includes(planet.house)) score += 2.2;
  else if ([5, 9, 11].includes(planet.house)) score += 1.6;

  if (planet.signIndex === planet.d9Sign) score += 1.5; // Vargottama bonus
  const shadbalaMatch = varshaChart.shadbala.find((s) => s.planet === planet.name);
  if (shadbalaMatch && shadbalaMatch.ratio >= 1.1) score += 1.0;

  return Math.min(19.8, Math.max(5.2, Number(score.toFixed(2))));
}

/**
 * Detailed Muntha House Prediction (1 to 12) according to Tajika Nilakanthi
 */
function getMunthaHouseVerdict(
  munthaHouse: number,
  munthaRasiTe: string,
  muntheshTe: string,
  muntheshHouse: number
): { verdictTe: string; remedyTe: string; scoreBoost: number } {
  const munthaEffects: Record<number, { text: string; remedy: string; boost: number }> = {
    1: {
      text: `ముంథా వర్ష లగ్నంలో (1వ భావం — ${munthaRasiTe}) ఉండటం అత్యంత శుభప్రదం! తాజిక నీలకంఠీ ప్రకారం ఈ సంవత్సరం మీ ఆత్మవిశ్వాసం, ఆరోగ్యం, గౌరవ మర్యాదలు మరియు కార్యసిద్ధి అద్భుతంగా ఉంటాయి. మీరు తలపెట్టిన పనులలో విజయం లభిస్తుంది.`,
      remedy: `ప్రతి ఉదయం సూర్య నమస్కారం మరియు ${muntheshTe} స్తోత్ర పారాయణం చేయండి.`,
      boost: 14,
    },
    2: {
      text: `ముంథా 2వ భావంలో (ధన-కుటుంబ స్థానం — ${munthaRasiTe}) ఉండటం వల్ల ఈ సంవత్సరం ఆర్థిక ఆదాయం పెరుగుతుంది, కుటుంబంలో శుభకార్యాలు జరుగుతాయి మరియు మీ మాటకు విలువ పెరుగుతుంది.`,
      remedy: `శుక్రవారం మహాలక్ష్మి అష్టోత్తరం మరియు అన్నదానం శుభప్రదం.`,
      boost: 12,
    },
    3: {
      text: `ముంథా 3వ భావంలో (విక్రమ-సహజ స్థానం — ${munthaRasiTe}) ఉండటం వల్ల ఈ ఏడాది మీ ధైర్య సాహసాలు, స్వయం కృషి ఫలిస్తాయి. చిన్న ప్రయాణాలు, కమ్యూనికేషన్ మరియు సోదర వర్గం ద్వారా విశేష లాభం కలుగుతుంది.`,
      remedy: `మంగళవారం సుబ్రహ్మణ్య / ఆంజనేయ స్వామి ఆరాధన చేయండి.`,
      boost: 11,
    },
    4: {
      text: `ముంథా 4వ భావంలో (సుఖ-గృహ స్థానం — ${munthaRasiTe}) ఉండటం వల్ల గృహ నవీకరణ, భూ-వాహన సంబంధిత ఆలోచనలు మరియు కుటుంబ సౌఖ్యం కలుగుతాయి. తల్లిగారి ఆరోగ్యం, మానసిక ప్రశాంతతపై శ్రద్ధ వహించాలి.`,
      remedy: `సోమవారం శివాభిషేకం మరియు దుర్గా స్తోత్ర పారాయణం శ్రేయస్కరం.`,
      boost: 8,
    },
    5: {
      text: `ముంథా 5వ భావంలో (పూర్వపుణ్య-పుత్ర-మేధా స్థానం — ${munthaRasiTe}) ఉండటం అఖండ రాజయోగప్రదం! సంతాన మూలక ఆనందం, ఉన్నత విద్యా విజయం, ప్రమోషన్ మరియు ఆర్థిక లాభాలు ఈ ఏడాది మిమ్మల్ని వరిస్తాయి.`,
      remedy: `గురువారం దక్షిణామూర్తి / దత్తాత్రేయ ఆరాధన మరింత శుభాన్నిస్తుంది.`,
      boost: 15,
    },
    6: {
      text: `ముంథా 6వ భావంలో (${munthaRasiTe}) ఉండటం వల్ల పోటీలలో విజయం లభిస్తుంది కానీ ఆరోగ్య విషయంలో (ఆహార నియమాలు, జీర్ణక్రియ) మరియు ఋణ వ్యవహారాలలో జాగ్రత్తగా ఉండాలి.`,
      remedy: `విష్ణు సహస్రనామ పారాయణం మరియు గోసేవ చేయడం వల్ల ఆటంకాలు తొలగుతాయి.`,
      boost: 2,
    },
    7: {
      text: `ముంథా 7వ భావంలో (${munthaRasiTe}) ఉండటం వల్ల భాగస్వామ్య వ్యాపారాలు మరియు జీవిత భాగస్వామితో సంబంధాలలో సహనం పాటించాలి. ప్రజా సంబంధాలలో ఆచితూచి మాట్లాడటం శ్రేష్ఠం.`,
      remedy: `లలితా సహస్రనామ పారాయణం మరియు దంపతుల పూజ శుభప్రదం.`,
      boost: 4,
    },
    8: {
      text: `ముంథా 8వ భావంలో (${munthaRasiTe}) సంచరిస్తున్నందున ఈ సంవత్సరం ఆకస్మిక ఖర్చులు, ప్రయాణాలలో జాగ్రత్త మరియు ఆరోగ్య శ్రద్ధ అవసరం. పరిశోధన, ఆధ్యాత్మిక సాధనలకు మాత్రం అనుకూలం.`,
      remedy: `ప్రతి శనివారం లేదా సోమవారం మహా మృత్యుంజయ మంత్ర జపం & రుద్రాభిషేకం తప్పక చేయించండి.`,
      boost: -4,
    },
    9: {
      text: `ముంథా 9వ భావంలో (భాగ్య-ధర్మ స్థానం — ${munthaRasiTe}) ఉండటం సర్వశ్రేష్ఠమైన భాగ్యోదయ సూచిక! తీర్థయాత్రలు, దూర ప్రయాణాలు, గురు-పెద్దల ఆశీస్సులు మరియు ఆకస్మిక అదృష్ట యోగం ఈ ఏడాది మీకు తోడుంటాయి.`,
      remedy: `గురువారం పీఠాధిపతులు / గురువుల దర్శనం మరియు శ్రీ వేంకటేశ్వర ఆరాధన చేయండి.`,
      boost: 16,
    },
    10: {
      text: `ముంథా 10వ భావంలో (కర్మ-రాజ్య స్థానం — ${munthaRasiTe}) ఉండటం వల్ల ఉద్యోగంలో పదోన్నతి (Promotion), వ్యాపార విస్తరణ, ప్రభుత్వ/ఉన్నతాధికారుల మద్దతు మరియు అఖండ కీర్తి ప్రతిష్టలు లభిస్తాయి.`,
      remedy: `ఆదిత్య హృదయ పారాయణం మరియు కర్మాధిపతి ఉపాసన చేయండి.`,
      boost: 16,
    },
    11: {
      text: `ముంథా 11వ భావంలో (లాభ-సర్వాభీష్ట స్థానం — ${munthaRasiTe}) ఉండటం వల్ల ఈ సంవత్సరం మీ చిరకాల కోరికలు నెరవేరుతాయి! బహుముఖ ఆదాయ వృద్ధి, ఆస్తుల కొనుగోలు మరియు శుభవార్తలు వింటారు.`,
      remedy: `లక్ష్మీ గణపతి ఆరాధన మరియు పేద విద్యార్థులకు సహాయం చేయండి.`,
      boost: 17,
    },
    12: {
      text: `ముంథా 12వ భావంలో (${munthaRasiTe}) ఉండటం వల్ల విదేశీ ప్రయాణాలు లేదా శుభకార్యాల కోసం పెద్ద మొత్తంలో ఖర్చులు/పెట్టుబడులు ఉంటాయి. వృథా వ్యయాన్ని నియంత్రిస్తూ నిద్ర, ఆరోగ్యంపై శ్రద్ధ పెట్టాలి.`,
      remedy: `ఆంజనేయ స్వామి చాలీసా పారాయణం మరియు ధర్మ కార్యాలకు దానం చేయండి.`,
      boost: 0,
    },
  };

  const base = munthaEffects[munthaHouse] ?? munthaEffects[1];
  const muntheshBonus = [1, 2, 4, 5, 9, 10, 11].includes(muntheshHouse)
    ? ` అంతేకాక ముంథాధిపతి అయిన ${muntheshTe} వర్ష కుండలిలో ${muntheshHouse}వ శుభ స్థానంలో ఉండటం వల్ల ఈ సంవత్సరపు రాజయోగ బలం మరింత రెట్టింపు అవుతున్నది.`
    : ` ముంథాధిపతి ${muntheshTe} ${muntheshHouse}వ స్థానంలో ఉన్నందున పట్టుదల మరియు దైవబలంతో ముందుకు సాగాలి.`;

  return {
    verdictTe: base.text + muntheshBonus,
    remedyTe: base.remedy,
    scoreBoost: base.boost + ([1, 2, 4, 5, 9, 10, 11].includes(muntheshHouse) ? 5 : 0),
  };
}

export function generateTajikaVarshaphalaReport(
  natalChart: CompleteChartResult,
  targetYear: number = new Date().getFullYear()
): TajikaVarshaphalaReport {
  const birthYear = Number(natalChart.input.date.split('-')[0]) || 1998;
  const completedAge = Math.max(0, targetYear - birthYear);
  const runningYearOfLife = completedAge + 1;

  const natalSun =
    natalChart.planets.find((p) => p.id === 'Sun') ?? natalChart.planets[0];
  const natalMoon =
    natalChart.planets.find((p) => p.id === 'Moon') ?? natalChart.planets[1];

  const { varshaInput, varshaChart, weekdayTe } = findExactSolarReturnInput(
    natalChart.input,
    natalSun.siderealLon,
    targetYear
  );

  const janmaLagnaIdx = natalChart.ascendant.signIndex;
  const varshaLagnaIdx = varshaChart.ascendant.signIndex;
  const varshaLagnaLordId = SIGN_LORD_ID[varshaLagnaIdx];
  const varshaLagnaLordTe =
    TELUGU_PLANETS[varshaLagnaLordId]?.nameTe ?? varshaLagnaLordId;

  // 1. Muntha Calculation: (Janma Lagna Sign Index + Completed Age) % 12
  const munthaRasiIndex = (janmaLagnaIdx + completedAge) % 12;
  const munthaRasiTe = TELUGU_RASIS[munthaRasiIndex].nameTe;
  const munthaHouseFromVarshaLagna =
    ((munthaRasiIndex - varshaLagnaIdx + 12) % 12) + 1;
  const munthaHouseFromJanmaLagna =
    ((munthaRasiIndex - janmaLagnaIdx + 12) % 12) + 1;

  const muntheshPlanetId = SIGN_LORD_ID[munthaRasiIndex];
  const muntheshPlanetTe =
    TELUGU_PLANETS[muntheshPlanetId]?.nameTe ?? muntheshPlanetId;
  const muntheshObj =
    varshaChart.planets.find((p) => p.id === muntheshPlanetId) ??
    varshaChart.planets[0];
  const muntheshHouseInVarsha = muntheshObj.house;

  const munthaAnalysis = getMunthaHouseVerdict(
    munthaHouseFromVarshaLagna,
    munthaRasiTe.split(' ')[0],
    muntheshPlanetTe,
    muntheshHouseInVarsha
  );

  // 2. Panchadhikaris (5 Office Holders of the Year) & Varsheshwara (Year Lord)
  const varshaHour = Number(varshaInput.time.split(':')[0]) || 12;
  const isDayVarsha = varshaHour >= 6 && varshaHour < 18;

  const janmaLagnaLordId = SIGN_LORD_ID[janmaLagnaIdx];
  const varshaSun =
    varshaChart.planets.find((p) => p.id === 'Sun') ?? varshaChart.planets[0];
  const varshaMoon =
    varshaChart.planets.find((p) => p.id === 'Moon') ?? varshaChart.planets[1];

  const dinaRatriLordId = isDayVarsha
    ? SIGN_LORD_ID[varshaSun.signIndex]
    : SIGN_LORD_ID[varshaMoon.signIndex];
  const triRashiLordId = isDayVarsha
    ? TRI_RASHI_LORDS[varshaLagnaIdx].day
    : TRI_RASHI_LORDS[varshaLagnaIdx].night;

  const candidateRoles: { roleTe: string; roleEn: string; planetId: string }[] = [
    {
      roleTe: '1. ముంథాధిపతి (Munthesh)',
      roleEn: 'Lord of Progressed Muntha',
      planetId: muntheshPlanetId,
    },
    {
      roleTe: '2. జన్మ లగ్నాధిపతి (Janma Lagnesh)',
      roleEn: 'Natal Ascendant Lord',
      planetId: janmaLagnaLordId,
    },
    {
      roleTe: '3. వర్ష లగ్నాధిపతి (Varsha Lagnesh)',
      roleEn: 'Solar Return Ascendant Lord',
      planetId: varshaLagnaLordId,
    },
    {
      roleTe: '4. త్రిరాశ్యాధిపతి (Tri-Rashi Pati)',
      roleEn: 'Tri-Rashi Ruler',
      planetId: triRashiLordId,
    },
    {
      roleTe: isDayVarsha
        ? '5. దిన రాశ్యాధిపతి (Surya Rasi Pati)'
        : '5. రాత్రి రాశ్యాధిపతి (Chandra Rasi Pati)',
      roleEn: 'Day/Night Luminary Sign Lord',
      planetId: dinaRatriLordId,
    },
  ];

  const panchadhikaris: TajikaOfficeHolder[] = candidateRoles.map((cr) => {
    const pObj =
      varshaChart.planets.find((p) => p.id === cr.planetId) ??
      varshaChart.planets[0];
    const pScore = computePanchavargiyaBala(pObj, varshaChart);
    return {
      roleTe: cr.roleTe,
      roleEn: cr.roleEn,
      planetId: cr.planetId,
      planetNameTe: TELUGU_PLANETS[cr.planetId]?.nameTe ?? cr.planetId,
      rasiNameTe: TELUGU_RASIS[pObj.signIndex].nameTe.split(' ')[0],
      houseInVarsha: pObj.house,
      panchavargiyaScore: pScore,
      isVarsheshwara: false,
    };
  });

  // Select Varsheshwara as the officeholder with the highest Panchavargiya Bala
  let bestIdx = 0;
  for (let i = 1; i < panchadhikaris.length; i++) {
    if (panchadhikaris[i].panchavargiyaScore > panchadhikaris[bestIdx].panchavargiyaScore) {
      bestIdx = i;
    }
  }
  panchadhikaris[bestIdx].isVarsheshwara = true;
  const varsheshwara = panchadhikaris[bestIdx];

  const varsheshwaraVerdictTe = `ఈ ${targetYear} వర్ష కుండలిలో పంచవర్గీయ బల గణన ప్రకారం **"${varsheshwara.planetNameTe}"** (${varsheshwara.panchavargiyaScore} విశ్వ బలంతో) **వర్షేశ్వరుడు (Lord of the Year)** గా ఎన్నికయ్యాడు. వర్షేశ్వరుడు ${varsheshwara.houseInVarsha}వ భావంలో (${varsheshwara.rasiNameTe}) ఉండటం వల్ల ఈ సంవత్సరం మొత్తం ${varsheshwara.planetNameTe} కారకత్వాలు మీ జీవితాన్ని నడిపిస్తాయి.`;

  // 3. Tajika Yogas (Ithasala, Ishrafa, Iqbal, Kamboola)
  const tajikaYogas: TajikaYogaItem[] = [];
  const saptaPlanets = varshaChart.planets.slice(0, 7);

  // Check Iqbal Yoga (majority of planets in Kendra 1,4,7,10 or Panapara 2,5,8,11)
  const kendraPanaparaCount = saptaPlanets.filter((p) =>
    [1, 2, 4, 5, 7, 8, 10, 11].includes(p.house)
  ).length;
  if (kendraPanaparaCount >= 5) {
    tajikaYogas.push({
      id: 'iqbal_yoga',
      nameTe: 'ఇక్బాల్ తాజిక రాజయోగం (Iqbal Yoga)',
      nameEn: 'Iqbal Yoga (Kendra-Panapara Concentration)',
      planetsTe: `${kendraPanaparaCount} సప్త గ్రహాలు కేంద్ర-పణపర స్థానాలలో`,
      natureTe: 'రాజయోగప్రదం (Highly Auspicious)',
      sanskritRuleTe: 'కేంద్రే పణపరే వాపి గ్రహాః సర్వే శుభావహాః — ఇక్బాల యోగః ||',
      vivaranaTe: `వర్ష కుండలిలో ${kendraPanaparaCount} ప్రధాన గ్రహాలు కేంద్ర (1, 4, 7, 10) మరియు పణపర (2, 5, 8, 11) స్థానాలలో ఉండటం వల్ల "ఇక్బాల్ యోగం" ఏర్పడింది. ఇది ఈ సంవత్సరం ధన సంపాదన, పదవీ ఉన్నతి మరియు వాహన-గృహ సౌఖ్యాలను ఇస్తుంది.`,
    });
  }

  // Check pairwise Tajika friendly aspects (3/11, 5/9, 1/7, 4/10) for Ithasala / Ishrafa
  for (let i = 0; i < saptaPlanets.length; i++) {
    for (let j = i + 1; j < saptaPlanets.length; j++) {
      const pA = saptaPlanets[i];
      const pB = saptaPlanets[j];
      const signDiff = Math.abs(pA.signIndex - pB.signIndex);
      const normSignDiff = signDiff > 6 ? 12 - signDiff : signDiff;

      // Tajika friendly/active aspect houses: conjunction (0), sextile (2), square (3), trine (4), opposition (6)
      if ([0, 2, 3, 4, 6].includes(normSignDiff)) {
        const faster =
          (TAJIKA_SPEED_RANK[pA.id] ?? 5) < (TAJIKA_SPEED_RANK[pB.id] ?? 5)
            ? pA
            : pB;
        const slower = faster.id === pA.id ? pB : pA;
        const avgOrb =
          ((TAJIKA_DEEPTAMSA[faster.id] ?? 8) +
            (TAJIKA_DEEPTAMSA[slower.id] ?? 8)) /
          2;
        const degDiff = Math.abs(faster.degreeInSign - slower.degreeInSign);

        if (degDiff <= avgOrb) {
          const fasterTe = TELUGU_PLANETS[faster.id]?.nameTe ?? faster.name;
          const slowerTe = TELUGU_PLANETS[slower.id]?.nameTe ?? slower.name;

          if (faster.degreeInSign < slower.degreeInSign) {
            // Ithasala Yoga!
            const isKamboola = faster.id === 'Moon';
            tajikaYogas.push({
              id: `ithasala_${faster.id}_${slower.id}`,
              nameTe: isKamboola
                ? `కంబూల-ఇత్థశాల మహాయోగం (${fasterTe} → ${slowerTe})`
                : `ఇత్థశాల యోగం (Ithasala Yoga: ${fasterTe} → ${slowerTe})`,
              nameEn: isKamboola ? 'Kamboola Ithasala Yoga' : 'Ithasala Yoga',
              planetsTe: `${fasterTe} (${faster.house}వ భావం) & ${slowerTe} (${slower.house}వ భావం)`,
              natureTe: 'రాజయోగప్రదం (Highly Auspicious)',
              sanskritRuleTe: 'శీఘ్రగః పృष्ठతో మందః పురతో దీప్త్యంతరే స్థితౌ — ఇత్థశాలః ||',
              vivaranaTe: `శీఘ్ర గమన గ్రహమైన ${fasterTe} (${faster.degreeInSign.toFixed(1)}°) మంద గమన గ్రహమైన ${slowerTe} (${slower.degreeInSign.toFixed(1)}°) కి దీప్తాంశ పరిధిలో తన తేజస్సును అందిస్తున్నది. దీనివల్ల ${faster.house}వ మరియు ${slower.house}వ భావాలకు సంబంధించిన పనులు ఈ ఏడాది విజయవంతంగా పూర్తవుతాయి!`,
            });
          } else if (tajikaYogas.length < 5) {
            // Ishrafa / Musarpha Yoga
            tajikaYogas.push({
              id: `ishrafa_${faster.id}_${slower.id}`,
              nameTe: `ఇశ్రాఫా / ముసరిఫా యోగం (${fasterTe} – ${slowerTe})`,
              nameEn: 'Ishrafa Yoga (Separating Aspect)',
              planetsTe: `${fasterTe} & ${slowerTe}`,
              natureTe: 'మిశ్రమ ఫలం (Moderate/Mixed)',
              sanskritRuleTe: 'శీఘ్రగోఽగ్రే యదా యాతి మందాత్ సా ముసరిఫా స్మృతా ||',
              vivaranaTe: `${fasterTe} గ్రహం ${slowerTe} డిగ్రీని దాటి ముందుకు వెళ్ళినందున, ${faster.house}వ భావ విషయాలలో వాయిదా వేయకుండా సమయస్ఫూర్తితో వెంటనే నిర్ణయాలు తీసుకుంటేనే ఫలితం దక్కుతుంది.`,
            });
          }
        }
      }
    }
  }

  // 4. 7 Classical Tajika Sahams (Sensitive Mathematical Points)
  const ascLon = varshaChart.ascendant.siderealLon;
  const sunLon = varshaSun.siderealLon;
  const moonLon = varshaMoon.siderealLon;
  const jupLon =
    (varshaChart.planets.find((p) => p.id === 'Jupiter') ?? varshaSun).siderealLon;
  const venLon =
    (varshaChart.planets.find((p) => p.id === 'Venus') ?? varshaSun).siderealLon;
  const merLon =
    (varshaChart.planets.find((p) => p.id === 'Mercury') ?? varshaSun).siderealLon;
  const satLon =
    (varshaChart.planets.find((p) => p.id === 'Saturn') ?? varshaSun).siderealLon;

  const makeSaham = (
    id: string,
    nameTe: string,
    formulaTe: string,
    lonA: number,
    lonB: number,
    lonC: number,
    phalamBaseTe: string
  ): TajikaSahamItem => {
    const rawLon = norm360(lonA - lonB + lonC);
    const rIdx = Math.min(11, Math.floor(rawLon / 30));
    const degInSign = rawLon % 30;
    const hNum = ((rIdx - varshaLagnaIdx + 12) % 12) + 1;
    const lordId = SIGN_LORD_ID[rIdx];
    const lordTe = TELUGU_PLANETS[lordId]?.nameTe ?? lordId;
    return {
      id,
      nameTe,
      formulaTe,
      longitudeDeg: rawLon,
      rasiIndex: rIdx,
      rasiNameTe: TELUGU_RASIS[rIdx].nameTe.split(' ')[0],
      degreeFormatted: formatDegToDMS(degInSign),
      houseInVarsha: hNum,
      sahamLordTe: lordTe,
      phalamTe: `${phalamBaseTe} (${hNum}వ భావం · అధిపతి ${lordTe} అనుగ్రహం).`,
    };
  };

  const punyaLon = norm360(
    isDayVarsha ? moonLon - sunLon + ascLon : sunLon - moonLon + ascLon
  );

  const sahams: TajikaSahamItem[] = [
    makeSaham(
      'punya',
      '1. పుణ్య సహమ్ (Punya Saham — అదృష్టం & ధర్మ సిద్ధి)',
      isDayVarsha ? 'చంద్ర − రవి + లగ్నం' : 'రవి − చంద్ర + లగ్నం',
      isDayVarsha ? moonLon : sunLon,
      isDayVarsha ? sunLon : moonLon,
      ascLon,
      'ఈ ఏడాది పూర్వపుణ్య ఫలం, అనూహ్య అదృష్టం మరియు శుభకార్య సిద్ధిని సూచించే కేంద్ర బిందువు'
    ),
    makeSaham(
      'vidya',
      '2. విద్యా & జ్ఞాన సహమ్ (Vidya Saham)',
      isDayVarsha ? 'రవి − చంద్ర + లగ్నం' : 'చంద్ర − రవి + లగ్నం',
      isDayVarsha ? sunLon : moonLon,
      isDayVarsha ? moonLon : sunLon,
      ascLon,
      'నూతన నైపుణ్యాలు, ఉన్నత విద్య, మేధో సంపత్తి మరియు సలహా శక్తిని ఇచ్చే బిందువు'
    ),
    makeSaham(
      'yashas',
      '3. యశో సహమ్ (Yashas Saham — కీర్తి & గుర్తింపు)',
      'గురు − పుణ్య సహమ్ + లగ్నం',
      jupLon,
      punyaLon,
      ascLon,
      'సమాజంలో పేరు ప్రతిష్టలు, గౌరవం మరియు వృత్తిపరమైన గుర్తింపును ఇచ్చే స్థానం'
    ),
    makeSaham(
      'gaurava',
      '4. గౌరవ & రాజ్య సహమ్ (Gaurava Saham)',
      'గురు − చంద్ర + రవి',
      jupLon,
      moonLon,
      sunLon,
      'ఉన్నతాధికారుల మద్దతు, పదవీ యోగం మరియు అధికార వృద్ధిని సూచించే సహమ్'
    ),
    makeSaham(
      'mitra',
      '5. మిత్ర & సహకార సహమ్ (Mitra Saham)',
      'గురు − పుణ్య సహమ్ + శుక్ర',
      jupLon,
      punyaLon,
      venLon,
      'మిత్రుల సహకారం, నెట్‌వర్క్ విస్తరణ మరియు శుభ సంబంధాలను ఇచ్చే స్థానం'
    ),
    makeSaham(
      'karyasiddhi',
      '6. కార్యసిద్ధి & వృత్తి సహమ్ (Karyasiddhi Saham)',
      'శని − రవి + రవి రాశ్యాధిపతి',
      satLon,
      sunLon,
      merLon,
      'తలపెట్టిన ముఖ్యమైన ప్రాజెక్టులు, వ్యాపార లక్ష్యాలు నెరవేరే స్థానం'
    ),
    makeSaham(
      'vivaha_dhanam',
      '7. వివాహ & సౌభాగ్య సహమ్ (Vivaha / Soubhagya Saham)',
      'శుక్ర − శని + లగ్నం',
      venLon,
      satLon,
      ascLon,
      'కుటుంబ సామరస్యం, వివాహ శుభకార్యాలు మరియు ఆర్థిక సౌభాగ్యాన్ని ఇచ్చే బిందువు'
    ),
  ];

  // 5. 365-Day Mudda Vimshottari Dasha
  const nakSpan = 360 / 27;
  const varshaMoonNakIdx = Math.min(26, Math.floor(moonLon / nakSpan));
  const startLordIdx = varshaMoonNakIdx % 9;

  const startMs = new Date(`${varshaInput.date}T12:00:00Z`).getTime();
  const nowMs = Date.now();
  let cursorMs = startMs;
  const muddaDashas: MuddaDashaPeriod[] = [];

  for (let i = 0; i < 9; i++) {
    const lordId = VIMSHOTTARI_ORDER[(startLordIdx + i) % 9];
    const lordTe = TELUGU_PLANETS[lordId]?.nameTe ?? lordId;
    const daysCount = Math.round((VIMSHOTTARI_YEARS[lordId] / 120) * 365.25);
    const periodEndMs = cursorMs + daysCount * 86400 * 1000;

    const sDate = new Date(cursorMs).toISOString().slice(0, 10);
    const eDate = new Date(periodEndMs).toISOString().slice(0, 10);
    const isCurrent = nowMs >= cursorMs && nowMs <= periodEndMs;

    const pObj =
      varshaChart.planets.find((p) => p.id === lordId) ?? varshaChart.planets[0];
    const rasiTe = TELUGU_RASIS[pObj.signIndex].nameTe.split(' ')[0];

    const isGoodHouse = [1, 2, 3, 4, 5, 9, 10, 11].includes(pObj.house);
    const phalamTe = isGoodHouse
      ? `వర్ష కుండలిలో ${lordTe} ${pObj.house}వ భావంలో (${rasiTe}) ఉండటం వల్ల ఈ ${daysCount} రోజుల ముద్ద దశలో ఆర్థిక పురోగతి, కార్యసిద్ధి మరియు శుభవార్తలు కలుగుతాయి.`
      : `వర్ష కుండలిలో ${lordTe} ${pObj.house}వ భావంలో (${rasiTe}) ఉన్నందున ఈ ${daysCount} రోజుల కాలంలో ఖర్చుల నియంత్రణ, ఆరోగ్య శ్రద్ధ మరియు సహనం పాటించాలి.`;

    muddaDashas.push({
      lordId,
      lordNameTe: lordTe,
      startDate: sDate,
      endDate: eDate,
      daysCount,
      houseInVarsha: pObj.house,
      rasiNameTe: rasiTe,
      isCurrent,
      phalamTe,
    });

    cursorMs = periodEndMs;
  }

  // 6. 12-Month Calendar Forecast (Jan to Dec of targetYear)
  const natalMoonRasiIdx = natalMoon.signIndex;
  const twelveMonthForecasts: MonthlyVarshaForecast[] = [];

  for (let m = 0; m < 12; m++) {
    // Approx Sun transit sign in month m (Jan = Makara 9, Feb = Kumbha 10, ..., Apr = Mesha 0, etc.)
    const sunTransitSignIdx = (m + 9) % 12;
    const sunTransitRasiTe = TELUGU_RASIS[sunTransitSignIdx].nameTe.split(' ')[0];
    const houseFromMoon = ((sunTransitSignIdx - natalMoonRasiIdx + 12) % 12) + 1;
    const houseFromVarshaLagna =
      ((sunTransitSignIdx - varshaLagnaIdx + 12) % 12) + 1;

    const isSunGocharaGood = [3, 6, 10, 11, 1, 2, 5, 9].includes(houseFromMoon);
    const isVarshaHouseGood = [1, 2, 4, 5, 9, 10, 11].includes(
      houseFromVarshaLagna
    );

    let monthScore = 68;
    if ([3, 6, 10, 11].includes(houseFromMoon)) monthScore += 18;
    else if ([1, 2, 5, 9].includes(houseFromMoon)) monthScore += 10;
    else monthScore -= 4;

    if (isVarshaHouseGood) monthScore += 8;
    if (sunTransitSignIdx === munthaRasiIndex) monthScore += 7;
    monthScore = Math.min(96, Math.max(54, monthScore));

    const statusBadgeTe =
      monthScore >= 85
        ? 'అత్యుత్తమ రాజయోగ మాసం'
        : monthScore >= 74
          ? 'శుభప్రదమైన పురోగతి'
          : 'సమతుల్యత & జాగ్రత్త అవసరం';

    const careerAndWealthTe =
      monthScore >= 80
        ? `రవి ${sunTransitRasiTe} రాశి (${houseFromMoon}వ గోచార స్థానం) లో సంచరించడం వల్ల ఉద్యోగ-వ్యాపారాలలో కీలక విజయాలు, రావలసిన బకాయిల వసూలు మరియు నూతన ఆదాయ అవకాశాలు లభిస్తాయి.`
        : `వృత్తిపరమైన బాధ్యతలు పెరుగుతాయి; తొందరపాటు పెట్టుబడులు కాకుండా ప్రణాళికాబద్ధంగా వ్యవహరిస్తే స్థిరమైన ఫలితాలు దక్కుతాయి.`;

    const familyAndHealthTe = isSunGocharaGood
      ? `కుటుంబంలో ఆనందకరమైన వాతావరణం, బంధుమిత్రుల కలయిక మరియు ఉత్సాహభరితమైన ఆరోగ్యం ఉంటాయి.`
      : `పని ఒత్తిడి వల్ల అలసట రాకుండా తగిన విశ్రాంతి తీసుకోవాలి; కుటుంబ సభ్యులతో సామరస్యంగా మాట్లాడాలి.`;

    const b1 = ((m * 3 + natalMoonRasiIdx) % 7) + 2;
    const b2 = b1 + 7;
    const b3 = b2 + 6;
    const b4 = b3 + 5;
    const c1 = ((m * 2 + varshaLagnaIdx) % 8) + 4;
    const c2 = c1 + 11;

    const monthLordTe =
      TELUGU_PLANETS[SIGN_LORD_ID[sunTransitSignIdx]]?.nameTe ?? 'సూర్యుడు';

    twelveMonthForecasts.push({
      monthNumber: m + 1,
      calendarMonthLabelTe: `${MONTH_NAMES_TE[m]} ${targetYear}`,
      dateRangeTe: `${targetYear}-${String(m + 1).padStart(2, '0')}-01 నుండి నెలాఖరు వరకు`,
      sunTransitRasiTe,
      monthlyHouseFromMoon: houseFromMoon,
      monthlyHouseFromVarshaLagna: houseFromVarshaLagna,
      fortuneScorePct: monthScore,
      statusBadgeTe,
      careerAndWealthTe,
      familyAndHealthTe,
      auspiciousDatesTe: `${b1}, ${b2}, ${b3}, ${b4} తేదీలు`,
      cautionDatesTe: `${c1}, ${c2} తేదీలు`,
      monthlyRemedyTe: `ఈ నెలలో ${monthLordTe} ప్రీతికి ఇష్టదేవతా స్మరణ మరియు సూర్యోదయ ప్రార్థన శుభప్రదం.`,
    });
  }

  const avgMonthScore = Math.round(
    twelveMonthForecasts.reduce((acc, cur) => acc + cur.fortuneScorePct, 0) / 12
  );
  const annualOverallScorePct = Math.min(
    97,
    Math.max(60, avgMonthScore + Math.round(munthaAnalysis.scoreBoost / 2))
  );

  const annualExecutiveSummaryTe = `${targetYear} సంవత్సరంలో (${runningYearOfLife}వ ఏట) మీ వర్ష ప్రవేశం ${varshaInput.date} · ${weekdayTe} నాడు ${varshaInput.time} గంటలకు ${TELUGU_RASIS[varshaLagnaIdx].nameTe} లగ్నంలో జరుగుతున్నది. ఈ ఏడాది ముంథా ${munthaRasiTe} లో (వర్ష లగ్నం నుండి ${munthaHouseFromVarshaLagna}వ భావం) ఉండగా, "${varsheshwara.planetNameTe}" వర్షేశ్వరుడిగా (Year Lord) వ్యవహరిస్తున్నాడు. మొత్తం ${tajikaYogas.length} తాజిక యోగాలు మరియు 12 నెలల గ్రహ గమనం ప్రకారం ఈ సంవత్సరం వార్షిక శుభ ఫల స్కోరు ${annualOverallScorePct}% గా నమోదైంది.`;

  return {
    targetYear,
    completedAge,
    runningYearOfLife,
    varshaPraveshaDate: varshaInput.date,
    varshaPraveshaTime: varshaInput.time,
    varshaPraveshaWeekdayTe: weekdayTe,
    natalSunSiderealLon: natalSun.siderealLon,
    varshaChart,
    janmaLagnaRasiTe: TELUGU_RASIS[janmaLagnaIdx].nameTe,
    varshaLagnaRasiIndex: varshaLagnaIdx,
    varshaLagnaRasiTe: TELUGU_RASIS[varshaLagnaIdx].nameTe,
    varshaLagnaLordTe,
    munthaRasiIndex,
    munthaRasiTe,
    munthaHouseFromVarshaLagna,
    munthaHouseFromJanmaLagna,
    muntheshPlanetId,
    muntheshPlanetTe,
    muntheshHouseInVarsha,
    munthaDetailedVerdictTe: munthaAnalysis.verdictTe,
    munthaRemedyTe: munthaAnalysis.remedyTe,
    varsheshwaraPlanetId: varsheshwara.planetId,
    varsheshwaraPlanetTe: varsheshwara.planetNameTe,
    varsheshwaraPanchavargiyaBala: varsheshwara.panchavargiyaScore,
    varsheshwaraVerdictTe,
    panchadhikaris,
    tajikaYogas,
    sahams,
    muddaDashas,
    twelveMonthForecasts,
    annualExecutiveSummaryTe,
    annualOverallScorePct,
  };
}
