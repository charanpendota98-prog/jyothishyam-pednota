import type { CompleteChartResult } from './ephemeris.ts';
import {
  TELUGU_PLANETS,
  TELUGU_RASIS,
  TELUGU_NAKSHATRAS,
  type CompleteTeluguJathakamReport,
} from './teluguJathakam.ts';
import type { CompleteVerificationAndAnalysisReport } from './jathakaVerifications.ts';
import type { AstroVisionMasterReport } from './astroVisionAndTransitEngine.ts';
import type { SiddhantaAdvancedAppendicesReport } from './siddhantaAdvancedAppendices.ts';
import {
  calculateJaiminiCharaDasha,
  type JaiminiCharaDashaReport,
} from './jaiminiCharaDashaEngine.ts';

export interface LifeEpochChronicleTe {
  epochNumber: number;
  ageRangeTe: string;
  calendarYearsTe: string;
  titleTe: string;
  subtitleTe: string;
  governingHousesTe: string;
  activeVimshottariDashasTe: string;
  activeJaiminiCharaDashasTe: string;
  fortuneScorePct: number;
  statusBadgeTe: 'రాజయోగ స్వర్ణయుగం' | 'శుభ వృద్ధి పర్వం' | 'పునాది & క్రమ వృద్ధి' | 'మిశ్రమ & జాగ్రత్త పర్వం';
  physicalAndMentalTe: string;
  educationCareerWealthTe: string;
  familyMarriageProgenyTe: string;
  cautionsAndGuidanceTe: string;
}

export interface NavagrahaIndividualLifePredictionTe {
  planetId: string;
  planetNameTe: string;
  glyph: string;
  lordshipHousesTe: string;
  functionalRoleTe: string;
  rasiAndDegreeTe: string;
  houseNumber: number;
  nakshatraAndPadaTe: string;
  nakshatraLordTe: string;
  kpSubLordTe: string;
  navamsaRasiTe: string;
  dasamsaRasiTe: string;
  dignityAndAvasthaTe: string;
  shadbalaAndIshtaTe: string;
  drishtiImpactTe: string;
  positionalPhalamTe: string;
  careerAndWealthImpactTe: string;
  dashaBhuktiPhalamTe: string;
  specificPariharaTe: string;
}

export interface MarriageAndSpouseBlueprintTe {
  seventhHouseRasiTe: string;
  seventhLordTe: string;
  seventhLordHouse: number;
  navamsaSeventhRasiTe: string;
  darakarakaPlanetTe: string;
  upapadaLagnaRasiTe: string;
  spouseNatureAndAppearanceTe: string;
  spouseCareerAndFamilyTe: string;
  marriageDirectionAndTimingTe: string;
  maritalHarmonyAndPapaSamyaTe: string;
}

export interface CareerAndWealthBlueprintTe {
  tenthHouseRasiTe: string;
  tenthLordTe: string;
  tenthLordHouse: number;
  dasamsaLagnaRasiTe: string;
  amatyakarakaPlanetTe: string;
  jobVsBusinessVerdictTe: string;
  recommendedSectorsTe: string[];
  wealthAndPropertyYogasTe: string;
  foreignTravelAndSettlementTe: string;
  peakFinancialAgesTe: string;
}

export interface SampoornaLifeChronicleReport {
  horoscopeExecutiveIdentity: {
    swaroopaTitleTe: string;
    physicalAndMentalConstitutionTe: string;
    atmakarakaAndSoulMissionTe: string;
    lagnaAndChandraSynthesisTe: string;
    keyLifeStrengthsTe: string[];
    keyLifePrecautionsTe: string[];
    overallLifeFortuneScore: number;
  };
  sevenLifeEpochs: LifeEpochChronicleTe[];
  navagrahaLifePredictions: NavagrahaIndividualLifePredictionTe[];
  marriageBlueprint: MarriageAndSpouseBlueprintTe;
  careerWealthBlueprint: CareerAndWealthBlueprintTe;
  jaiminiCharaDashaReport: JaiminiCharaDashaReport;
}

/** Strips English parenthetical suffixes like "శుక్రుడు (Venus)" -> "శుక్రుడు" so Telugu prose reads cleanly */
function pureTe(str: string | undefined): string {
  if (!str) return '';
  return str.replace(/\s*\([^)]*\)/g, '').trim();
}

const SIGN_LORDS: Record<number, string> = {
  0: 'Mars',
  1: 'Venus',
  2: 'Mercury',
  3: 'Moon',
  4: 'Sun',
  5: 'Mercury',
  6: 'Venus',
  7: 'Mars',
  8: 'Jupiter',
  9: 'Saturn',
  10: 'Saturn',
  11: 'Jupiter',
};

const SIGN_DIRECTIONS_TE: Record<number, string> = {
  0: 'తూర్పు దిక్కు',
  1: 'దక్షిణ-ఆగ్నేయ దిక్కు',
  2: 'పడమర దిక్కు',
  3: 'ఉత్తర దిక్కు',
  4: 'తూర్పు-ఈశాన్య దిక్కు',
  5: 'దక్షిణ దిక్కు',
  6: 'పడమర-వాయువ్య దిక్కు',
  7: 'ఉత్తర-ఈశాన్య దిక్కు',
  8: 'తూర్పు దిక్కు',
  9: 'దక్షిణ దిక్కు',
  10: 'పడమర దిక్కు',
  11: 'ఉత్తర దిక్కు',
};

const PLANET_CAREER_SECTORS_TE: Record<string, string[]> = {
  Sun: [
    'ప్రభుత్వ ఉన్నత ఉద్యోగాలు & పరిపాలన (IAS/IPS/Group-1)',
    'వైద్య రంగం, ఫార్మసీ & హాస్పిటల్ మేనేజ్‌మెంట్',
    'రాజకీయాలు & సంస్థాగత డైరెక్టర్ పదవులు',
  ],
  Moon: [
    'ప్రజా సంబంధాలు (HR), హాస్పిటాలిటీ & టూరిజం',
    'ఆహార, డెయిరీ, వ్యవసాయ & జల వనరుల వాణిజ్యం',
    'వైద్య సేవలు, కౌన్సెలింగ్ & విదేశీ వాణిజ్యం',
  ],
  Mars: [
    'ఇంజనీరింగ్, నిర్మాణ & రియల్ ఎస్టేట్ రంగం',
    'రక్షణ రంగం (Defence), పోలీస్ & సైబర్ సెక్యూరిటీ',
    'పరిశ్రమల స్థాపన, మెషినరీ & భూ-ఆస్తి వ్యాపారం',
  ],
  Mercury: [
    'సాఫ్ట్‌వేర్ ఇంజనీరింగ్, AI/డేటా సైన్స్ & IT రంగం',
    'చార్టర్డ్ అకౌంటెన్సీ (CA), బ్యాంకింగ్, ఫైనాన్స్ & వాణిజ్యం',
    'విద్య, మీడియా, న్యాయ శాస్త్రం & బిజినెస్ కన్సల్టెన్సీ',
  ],
  Jupiter: [
    'బ్యాంకింగ్, ఆర్థిక సలహాదారులు & కార్పొరేట్ మేనేజ్‌మెంట్',
    'విద్యా సంస్థలు, ప్రొఫెసర్, పరిశోధన & న్యాయ వృత్తి',
    'ధార్మిక, సలహా & ఉన్నత ప్రభుత్వ పదవులు',
  ],
  Venus: [
    'సాఫ్ట్‌వేర్ డిజైన్, మీడియా, కళలు & ఆర్కిటెక్చర్',
    'జ్యువెలరీ, వస్త్ర, లగ్జరీ హోటల్స్ & ఆటోమొబైల్స్',
    'ఫైనాన్షియల్ మేనేజ్‌మెంట్ & ఎంటర్‌టైన్‌మెంట్ రంగం',
  ],
  Saturn: [
    'భారీ పరిశ్రమలు, సివిల్ ఇన్‌ఫ్రాస్ట్రక్చర్ & మాన్యుఫ్యాక్చరింగ్',
    'కోర్ ఇంజనీరింగ్, ఎంటర్‌ప్రైజ్ ఆర్కిటెక్చర్ & లాజిస్టిక్స్',
    'న్యాయ వ్యవస్థ, వ్యవసాయ భూములు & దీర్ఘకాలిక పెట్టుబడులు',
  ],
  Rahu: [
    'అడ్వాన్స్‌డ్ సాఫ్ట్‌వేర్, AI, సెమీకండక్టర్స్ & ఏవియేషన్',
    'విదేశీ వాణిజ్యం (MNCs), ఇంపొర్ట్/ఎక్స్‌పోర్ట్ & రీసెర్చ్',
    'డిజిటల్ మీడియా, ఫార్మా & టెక్నాలజీ స్టార్టప్స్',
  ],
  Ketu: [
    'పరిశోధన (R&D), డేటా అనలిటిక్స్ & సైబర్ సెక్యూరిటీ',
    'వైద్య నిర్ధారణ, ఆయుర్వేదం, ఫార్మసీ & ఆధ్యాత్మిక బోధన',
    'స్పెషలైజ్డ్ టెక్నికల్ కన్సల్టింగ్ & గణిత రంగాలు',
  ],
};

const HOUSE_SIMPLE_MEANING_TE: Record<number, string> = {
  1: 'ఆత్మవిశ్వాసం, ఆరోగ్యం మరియు స్వయంకృషితో ఎదిగే నాయకత్వ బలం లభిస్తాయి.',
  2: 'కుటుంబ వృద్ధి, ధన సంపాదన మరియు చక్కని వాక్చాతుర్యం సిద్ధిస్తాయి.',
  3: 'ధైర్య సాహసాలు, సొంత ప్రయత్న విజయం మరియు సహోదర సహకారం లభిస్తాయి.',
  4: 'సొంత ఇల్లు, వాహన యోగం, తల్లి ఆశీస్సులు మరియు మానసిక ప్రశాంతత కలుగుతాయి.',
  5: 'উన్నత తెలివితేటలు, సంతాన సౌఖ్యం మరియు పూర్వజన్మ పుణ్య ఫలం లభిస్తాయి.',
  6: 'పోటీలలో విజయం, శత్రు జయం మరియు వృత్తిలో కష్టపడి ఎదిగే శక్తి లభిస్తాయి.',
  7: 'మంచి జీవిత భాగస్వామి, వ్యాపార అనుకూలత మరియు సామాజిక గౌరవం లభిస్తాయి.',
  8: 'దీర్ఘాయుష్షు, పరిశోధనా శక్తి మరియు ఆకస్మిక ధన లాభాలు కలుగుతాయి.',
  9: 'తండ్రి ఆశీస్సులు, దైవ బలం, దూర ప్రయాణాలు మరియు విశేష అదృష్టం కలిసివస్తాయి.',
  10: 'ఉద్యోగ/వ్యాపార రంగాలలో ఉన్నత పదవి, అధికారం మరియు కీర్తి ప్రతిష్టలు లభిస్తాయి.',
  11: 'నిరంతర ఆదాయం, కోరికల నెరవేర్పు మరియు పెద్దల సహకారం లభిస్తాయి.',
  12: 'విదేశీ యోగం, శుభకార్య ఖర్చులు మరియు ఆధ్యాత్మిక ప్రశాంతత లభిస్తాయి.',
};

function getHousesOwnedByPlanet(planetId: string, lagnaSign: number): number[] {
  const houses: number[] = [];
  for (let s = 0; s < 12; s++) {
    if (SIGN_LORDS[s] === planetId) {
      houses.push(((s - lagnaSign + 12) % 12) + 1);
    }
  }
  return houses;
}

export function generateSampoornaLifeChronicle(
  chart: CompleteChartResult,
  jathakam: CompleteTeluguJathakamReport,
  verificationReport: CompleteVerificationAndAnalysisReport,
  astroVisionReport: AstroVisionMasterReport,
  advancedAppendices: SiddhantaAdvancedAppendicesReport
): SampoornaLifeChronicleReport {
  const jaiminiCharaDashaReport = calculateJaiminiCharaDasha(chart, 'kn_rao');
  const birthYear = parseInt(chart.input.date.split('-')[0], 10) || 1995;
  const lagnaSign = chart.ascendant.signIndex;
  const lagnaRasiTe = pureTe(TELUGU_RASIS[lagnaSign]?.nameTe) || 'మేష రాశి';
  const lagnaLordId = SIGN_LORDS[lagnaSign] ?? 'Mars';
  const lagnaLordTe = pureTe(TELUGU_PLANETS[lagnaLordId]?.nameTe) || lagnaLordId;
  const lagnaLordObj = chart.planets.find((p) => p.id === lagnaLordId);

  const moonObj = chart.planets.find((p) => p.id === 'Moon')!;
  const sunObj = chart.planets.find((p) => p.id === 'Sun')!;
  const jupiterObj = chart.planets.find((p) => p.id === 'Jupiter')!;
  const saturnObj = chart.planets.find((p) => p.id === 'Saturn')!;
  const venusObj = chart.planets.find((p) => p.id === 'Venus')!;
  const mercuryObj = chart.planets.find((p) => p.id === 'Mercury')!;

  const akRow = jathakam.jaiminiKarakas[0];
  const amkRow = jathakam.jaiminiKarakas[1];
  const dkRow = jathakam.jaiminiKarakas[jathakam.jaiminiKarakas.length - 1];

  const janmaRasiClean = pureTe(jathakam.janmaRasiTe);
  const nakshatraClean = pureTe(jathakam.janmaNakshatramTe);
  const akNameClean = pureTe(akRow?.planetNameTe);
  const amkNameClean = pureTe(amkRow?.planetNameTe);
  const dkNameClean = pureTe(dkRow?.planetNameTe);

  // 1. Executive Horoscope Identity (Crisp, Clear, Zero Jargon Clutter)
  const lagnaHouseOfLord = lagnaLordObj?.house ?? 1;
  const moonNakshatraIdx = Math.floor(moonObj.siderealLon / (360 / 27));
  const moonNakshatraObj =
    TELUGU_NAKSHATRAS[moonNakshatraIdx] ?? TELUGU_NAKSHATRAS[0];

  const swaroopaTitleTe = `${lagnaRasiTe} లగ్నం · ${janmaRasiClean} · ${nakshatraClean} (${jathakam.janmaPadam}వ పాదం) — జాతక ముఖ్యాంశాలు`;

  const physicalAndMentalConstitutionTe = `మీరు ${lagnaRasiTe} లగ్నంలో జన్మించారు. లగ్నాధిపతి ${lagnaLordTe} ${lagnaHouseOfLord}వ భావంలో ఉండటం వల్ల స్వశక్తిపై ఎదిగే పట్టుదల, ఆత్మగౌరవం, నిజాయితీ మీ సహజ లక్షణాలు. ${janmaRasiClean}లో ${nakshatraClean} నక్షత్రం (${pureTe(moonNakshatraObj.ganaTe)}) వల్ల లోతైన ఆలోచనా శక్తి, కుటుంబానికి అండగా నిలిచే బాధ్యత మరియు సమయానుకూల నిర్ణయాలు తీసుకునే నేర్పు ఉంటాయి.`;

  const atmakarakaAndSoulMissionTe = `మీ జాతకంలో ఆత్మకారకుడు "${akNameClean}" మరియు అమాత్యకారకుడు "${amkNameClean}". దీనివల్ల జీవితంలో ధర్మబద్ధంగా సంపాదించడం, వృత్తిలో ఉన్నత స్థానానికి చేరుకోవడం మరియు కుటుంబ గౌరవాన్ని నిలబెట్టడం మీ ప్రధాన జీవన లక్ష్యం. 30 సంవత్సరాల వయస్సు నుండి ఆర్థిక స్థిరత్వం, సొంత ఆస్తులు మరియు సమాజంలో ప్రత్యేక గుర్తింపు లభిస్తాయి.`;

  const lagnaAndChandraSynthesisTe = `లగ్నం (${lagnaRasiTe}), జన్మ రాశి (${janmaRasiClean}) మరియు సూర్య స్థితి (${sunObj.house}వ భావం) సమన్వయం ప్రకారం — ${pureTe(jathakam.lagnaShastraPramanam.yogakarakaGrahaTe)} మీకు అత్యంత శుభ ఫలితాలను ఇచ్చే రాజయోగ గ్రహాలు.`;

  const keyLifeStrengthsTe = [
    `లగ్నాధిపతి ${lagnaLordTe} ${lagnaHouseOfLord}వ భావ బలం వల్ల స్వయంకృషితో ఉన్నత స్థాయికి ఎదిగే సంకల్ప బలం.`,
    `ఆత్మకారకుడు ${akNameClean} అనుగ్రహంతో చురుకైన మేధస్సు, దూరదృష్టి మరియు సత్యనిষ্ঠ.`,
    `అమాత్యకారకుడు ${amkNameClean} మరియు దశాంశ (D10) బలం వల్ల ఉద్యోగ/వ్యాపార రంగాలలో స్థిరమైన పురోగతి.`,
    `శుభ గ్రహాల దశా-భుక్తి కాలాలలో సొంత ఇల్లు, వాహనం మరియు ఆర్థిక వృద్ధి.`,
  ];

  const keyLifePrecautionsTe = [
    `బాధక మరియు మారక గ్రహాల అంతర్దశలలో ఆరోగ్యం మరియు ఆర్థిక లావాదేవీలలో ఆచితూచి వ్యవహరించాలి.`,
    `ఏలినాటి శని లేదా అష్టమ శని నడిచే సమయాల్లో తొందరపాటు పెట్టుబడులు, హామీలు (Guarantees) ఇవ్వకూడదు.`,
    `ముఖ్యమైన నిర్ణయాలు తీసుకునే ముందు జన్మ నక్షత్రం (${nakshatraClean}) తారాబలం చూసుకోవడం శుభప్రదం.`,
  ];

  const avgPillarScore = Math.round(
    jathakam.jeevitaPradhanaRangalu.reduce((acc, r) => acc + r.scorePercent, 0) /
      Math.max(1, jathakam.jeevitaPradhanaRangalu.length)
  );

  // Helper to find overlapping Vimshottari & Chara Dashas for an age window
  const getDashasInAgeWindow = (minAge: number, maxAge: number) => {
    const startYr = birthYear + minAge;
    const endYr = birthYear + maxAge;

    const vimMatches = jathakam.sampoornaDashaKalachakram
      .filter((md) => {
        const sY = parseInt(md.startDate.slice(0, 4), 10) || birthYear;
        const eY = parseInt(md.endDate.slice(0, 4), 10) || birthYear + 100;
        return sY <= endYr && eY >= startYr;
      })
      .map((md) => `${pureTe(md.lordTe)} దశ (${md.startDate.slice(0, 4)}–${md.endDate.slice(0, 4)})`);

    const charaMatches = jaiminiCharaDashaReport.mahadashas
      .filter((cd) => cd.startAge <= maxAge && cd.endAge >= minAge)
      .map((cd) => `${pureTe(cd.rasiNameTe)} (${cd.startAge}–${cd.endAge} సం.)`);

    return {
      vimStr: vimMatches.join(' → ') || pureTe(jathakam.currentDashaPhalamTe.mahadashaTe),
      charaStr: charaMatches.join(' → ') || 'లగ్న చర దశ',
    };
  };

  // 2. Seven Complete Life Epochs (0 to 100 Years) — Crisp, Clear & Direct
  const house2 = jathakam.dwadashaBhavaPhalitalu[1];
  const house4 = jathakam.dwadashaBhavaPhalitalu[3];
  const house5 = jathakam.dwadashaBhavaPhalitalu[4];
  const house7 = jathakam.dwadashaBhavaPhalitalu[6];
  const house8 = jathakam.dwadashaBhavaPhalitalu[7];
  const house9 = jathakam.dwadashaBhavaPhalitalu[8];
  const house10 = jathakam.dwadashaBhavaPhalitalu[9];
  const house11 = jathakam.dwadashaBhavaPhalitalu[10];
  const house12 = jathakam.dwadashaBhavaPhalitalu[11];

  const ep1Dashas = getDashasInAgeWindow(0, 14);
  const ep2Dashas = getDashasInAgeWindow(15, 24);
  const ep3Dashas = getDashasInAgeWindow(25, 34);
  const ep4Dashas = getDashasInAgeWindow(35, 48);
  const ep5Dashas = getDashasInAgeWindow(49, 62);
  const ep6Dashas = getDashasInAgeWindow(63, 75);
  const ep7Dashas = getDashasInAgeWindow(76, 95);

  const sevenLifeEpochs: LifeEpochChronicleTe[] = [
    {
      epochNumber: 1,
      ageRangeTe: '0 – 14 సం.',
      calendarYearsTe: `${birthYear} – ${birthYear + 14}`,
      titleTe: '1. బాల్యం & ప్రాథమిక విద్యా పర్వం',
      subtitleTe: 'ఆరోగ్యం, జ్ఞాపకశక్తి & పాఠశాల విద్య',
      governingHousesTe: '1, 2, 4 భావాలు',
      activeVimshottariDashasTe: ep1Dashas.vimStr,
      activeJaiminiCharaDashasTe: ep1Dashas.charaStr,
      fortuneScorePct: Math.min(94, Math.max(72, avgPillarScore - 2)),
      statusBadgeTe: 'పునాది & క్రమ వృద్ధి',
      physicalAndMentalTe: `చంద్రుడు ${janmaRasiClean}లో ఉండటం వల్ల బాల్యం నుండే చురుకైన జ్ఞాపకశక్తి, పెద్దల పట్ల గౌరవం మరియు మంచి గ్రహణశక్తి ఉంటాయి.`,
      educationCareerWealthTe: `4వ భావాధిపతి ${pureTe(house4.adhipatiTe)} మరియు బుధుని ప్రభావంతో ప్రాథమిక విద్యలో మంచి పునాది పడుతుంది.`,
      familyMarriageProgenyTe: `తల్లిదండ్రుల ఆదరాభిమానాలు, కుటుంబ భద్రత లభిస్తాయి.`,
      cautionsAndGuidanceTe: `జన్మ నక్షత్రం రోజున కులదేవతా అర్చన, సరస్వతీ స్తోత్ర పారాయణం శుభప్రదం.`,
    },
    {
      epochNumber: 2,
      ageRangeTe: '15 – 24 సం.',
      calendarYearsTe: `${birthYear + 15} – ${birthYear + 24}`,
      titleTe: '2. ఉన్నత విద్య & కెరీర్ ప్రారంభ పర్వం',
      subtitleTe: 'డిగ్రీ/ప్రొఫెషనల్ విద్య & తొలి ఉద్యోగ ప్రయత్నాలు',
      governingHousesTe: '4, 5, 9 భావాలు',
      activeVimshottariDashasTe: ep2Dashas.vimStr,
      activeJaiminiCharaDashasTe: ep2Dashas.charaStr,
      fortuneScorePct: Math.min(96, Math.max(75, avgPillarScore + 1)),
      statusBadgeTe: 'శుభ వృద్ధి పర్వం',
      physicalAndMentalTe: `5వ భావాధిపతి ${pureTe(house5.adhipatiTe)} బలంతో స్వతంత్ర ఆలోచన, ఆత్మవిశ్వాసం మరియు లక్ష్య సాధన పట్టుదల పెరుగుతాయి.`,
      educationCareerWealthTe: `బుధ, గురు గ్రహాల బలంతో ఉన్నత విద్య పూర్తవుతుంది. 21–24 సం. మధ్య తొలి ఉద్యోగ అవకాశం లేదా వృత్తి ప్రవేశం జరుగుతుంది.`,
      familyMarriageProgenyTe: `మంచి మిత్ర బృందం ఏర్పడుతుంది; కుటుంబ గౌరవాన్ని పెంచే విజయాలు సాధిస్తారు.`,
      cautionsAndGuidanceTe: `ఏకాగ్రతతో లక్ష్యంపై దృష్టి నిలపాలి; గురువారం దక్షిణామూర్తి ఆరాధన విద్యా విజయాన్ని ఇస్తుంది.`,
    },
    {
      epochNumber: 3,
      ageRangeTe: '25 – 34 సం.',
      calendarYearsTe: `${birthYear + 25} – ${birthYear + 34}`,
      titleTe: '3. ఉద్యోగ స్థిరత్వం & వివాహ యోగ పర్వం',
      subtitleTe: 'కెరీర్ ఎదుగుదల, వివాహం & సంతాన ప్రాప్తి',
      governingHousesTe: '7, 10, 11 భావాలు',
      activeVimshottariDashasTe: ep3Dashas.vimStr,
      activeJaiminiCharaDashasTe: ep3Dashas.charaStr,
      fortuneScorePct: Math.min(97, Math.max(78, avgPillarScore + 3)),
      statusBadgeTe: 'రాజయోగ స్వర్ణయుగం',
      physicalAndMentalTe: `బాధ్యతాయుతమైన పరిపక్వత మరియు ఆర్థిక స్వావలంబన మానసిక ధైర్యాన్ని ఇస్తాయి.`,
      educationCareerWealthTe: `10వ భావాధిపతి ${pureTe(house10.adhipatiTe)} అనుగ్రహంతో 25–29 సం. మధ్య ఉద్యోగంలో ప్రమోషన్, స్థిరమైన ఆదాయం లేదా విదేశీ/వ్యాపార అవకాశం లభిస్తుంది.`,
      familyMarriageProgenyTe: `7వ భావాధిపతి ${pureTe(house7.adhipatiTe)} మరియు దారకారకుడు ${dkNameClean} బలంతో వివాహ యోగం, భాగస్వామి రాకతో అదృష్ట వృద్ధి మరియు సంతాన ఆనందం కలుగుతాయి.`,
      cautionsAndGuidanceTe: `దాంపత్యంలో పరస్పర అవగాహన పాటించడం, శుక్ర/గురు ఆరాధన చేయడం శ్రేయస్కరం.`,
    },
    {
      epochNumber: 4,
      ageRangeTe: '35 – 48 సం.',
      calendarYearsTe: `${birthYear + 35} – ${birthYear + 48}`,
      titleTe: '4. రాజయోగం, సొంత ఇల్లు & ఆర్థిక విస్తరణ పర్వం',
      subtitleTe: 'ఉన్నత పదవి, భూ-గృహ-వాహన ప్రాప్తి & సంపద వృద్ధి',
      governingHousesTe: '2, 4, 9, 10, 11 భావాలు',
      activeVimshottariDashasTe: ep4Dashas.vimStr,
      activeJaiminiCharaDashasTe: ep4Dashas.charaStr,
      fortuneScorePct: Math.min(98, Math.max(82, avgPillarScore + 6)),
      statusBadgeTe: 'రాజయోగ స్వర్ణయుగం',
      physicalAndMentalTe: `జీవితంలో అత్యంత శక్తివంతమైన స్వర్ణయుగం; మీ నిర్ణయాలు పూర్తి ఫలితాలను ఇస్తాయి.`,
      educationCareerWealthTe: `వృత్తి/వ్యాపారంలో ఉన్నత అధికారం లభిస్తుంది. 4వ అధిపతి ${pureTe(house4.adhipatiTe)} మరియు 11వ అధిపతి ${pureTe(house11.adhipatiTe)} బలంతో సొంత ఇల్లు, భూమి, వాహనం మరియు బలమైన ఆర్థిక నిల్వలు సమకూరుతాయి.`,
      familyMarriageProgenyTe: `పిల్లల విద్యా పురోగతి సంతోషాన్ని ఇస్తుంది; బంధువర్గంలో మరియు సమాజంలో మీ మాటకు గౌరవం పెరుగుతుంది.`,
      cautionsAndGuidanceTe: `పని ఒత్తిడి తగ్గించుకొని క్రమబద్ధమైన ఆహార-నిద్ర నియమాలు పాటించాలి.`,
    },
    {
      epochNumber: 5,
      ageRangeTe: '49 – 62 సం.',
      calendarYearsTe: `${birthYear + 49} – ${birthYear + 62}`,
      titleTe: '5. అధికార శిఖరం & సంతాన ఉచ్ఛస్థితి పర్వం',
      subtitleTe: 'సామాజిక ప్రతిష్ట, స్థిరాస్తుల ఆదాయం & కుటుంబ శుభకార్యాలు',
      governingHousesTe: '5, 9, 10, 11 భావాలు',
      activeVimshottariDashasTe: ep5Dashas.vimStr,
      activeJaiminiCharaDashasTe: ep5Dashas.charaStr,
      fortuneScorePct: Math.min(96, Math.max(80, avgPillarScore + 4)),
      statusBadgeTe: 'రాజయోగ స్వర్ణయుగం',
      physicalAndMentalTe: `అనుభవ జ్ఞానం, దూరదృష్టితో అనేక మందికి మార్గదర్శకులుగా నిలుస్తారు.`,
      educationCareerWealthTe: `ఉన్నత గౌరవాలు, స్థిరాస్తులు మరియు దీర్ఘకాలిక పెట్టుబడుల నుండి నిరంతర ఆదాయం లభిస్తుంది.`,
      familyMarriageProgenyTe: `సంతానం ఉన్నత ఉద్యోగ/వివాహ రంగాలలో స్థిరపడటం వల్ల సంపూర్ణ సంతృప్తి కలుగుతుంది.`,
      cautionsAndGuidanceTe: `కాలానుగుణ ఆరోగ్య పరీక్షలు చేయించుకోవడం, నవగ్రహ శాంతి పాటించడం మంచిది.`,
    },
    {
      epochNumber: 6,
      ageRangeTe: '63 – 75 సం.',
      calendarYearsTe: `${birthYear + 63} – ${birthYear + 75}`,
      titleTe: '6. గౌరవ విశ్రాంతి & ఆధ్యాత్మిక ప్రశాంతత పర్వం',
      subtitleTe: 'మనవలు/మనవరాళ్ల ఆనందం & తీర్థయాత్రలు',
      governingHousesTe: '4, 5, 9 భావాలు',
      activeVimshottariDashasTe: ep6Dashas.vimStr,
      activeJaiminiCharaDashasTe: ep6Dashas.charaStr,
      fortuneScorePct: Math.min(94, Math.max(76, avgPillarScore + 1)),
      statusBadgeTe: 'శుభ వృద్ధి పర్వం',
      physicalAndMentalTe: `మానసిక ప్రశాంతత, ఆధ్యాత్మిక చింతనతో కుటుంబ పెద్దగా గౌరవప్రదమైన జీవనం సాగుతుంది.`,
      educationCareerWealthTe: `సంచిత ధనం, ఆస్తుల ఆదాయం వల్ల ఎవరిపైనా ఆధారపడని స్వతంత్ర ఆర్థిక భద్రత ఉంటుంది.`,
      familyMarriageProgenyTe: `కుటుంబ సభ్యుల ఆదరాభిమానాలు, మనవలు-మనవరాళ్ల పురోగతి మరియు పుణ్యక్షేత్ర దర్శనాలు కలుగుతాయి.`,
      cautionsAndGuidanceTe: `సాత్వికాహారం, ప్రాణాయామం మరియు ఇష్టదేవతా ఉపాసన ఆరోగ్యాన్ని కాపాడుతాయి.`,
    },
    {
      epochNumber: 7,
      ageRangeTe: '75+ సం.',
      calendarYearsTe: `${birthYear + 75}+`,
      titleTe: '7. పూర్ణాయుర్దాయం & ధార్మిక పరిపూర్ణత పర్వం',
      subtitleTe: 'దీర్ఘాయుష్షు, వంశ గౌరవం & దైవ చింతన',
      governingHousesTe: '1, 8, 9, 12 భావాలు',
      activeVimshottariDashasTe: ep7Dashas.vimStr,
      activeJaiminiCharaDashasTe: ep7Dashas.charaStr,
      fortuneScorePct: Math.min(93, Math.max(75, avgPillarScore)),
      statusBadgeTe: 'శుభ వృద్ధి పర్వం',
      physicalAndMentalTe: `లగ్నాధిపతి ${lagnaLordTe}, అష్టమాధిపతి ${pureTe(house8.adhipatiTe)} మరియు శని బలంతో పూర్ణాయుర్దాయ యోగం కలదు.`,
      educationCareerWealthTe: `ధార్మిక దానాలు, దేవాలయ సేవ ద్వారా సమాజంలో చిరస్థాయి కీర్తిని పొందుతారు.`,
      familyMarriageProgenyTe: `సంతాన, పౌత్ర, ప్రపౌత్రులతో కలసి గౌరవప్రదమైన, ప్రశాంతమైన జీవితాన్ని గడుపుతారు.`,
      cautionsAndGuidanceTe: `నిత్యం మహామృత్యుంజయ మంత్రం మరియు విష్ణు సహస్రనామ పారాయణం ఆయురారోగ్యాలను ప్రసాదిస్తాయి.`,
    },
  ];

  // 3. Navagraha 9 Planets Complete Individual Life Predictions — Clean, Scannable, Zero Clutter
  const navagrahaLifePredictions: NavagrahaIndividualLifePredictionTe[] =
    jathakam.navagrahaDeepTable.map((ng) => {
      const sphutaRow = astroVisionReport.nirayanaSphutaTable.find(
        (s) => s.bodyId === ng.id
      );
      const ikRow = advancedAppendices.ishtaKashtaTable.find(
        (ik) => ik.planetId === ng.id
      );
      const avRow = verificationReport.triVidhaAvasthas.find(
        (av) => av.planetId === ng.id
      );
      const vargaRow = advancedAppendices.vaisheshikamsaTable.find(
        (v) => v.planetId === ng.id
      );
      const pInfo = TELUGU_PLANETS[ng.id] ?? TELUGU_PLANETS.Sun;

      const ownedHouses = getHousesOwnedByPlanet(ng.id, lagnaSign);
      const lordshipHousesTe =
        ownedHouses.length > 0
          ? `${ownedHouses.join(', ')} భావాధిపతి`
          : 'ఛాయా గ్రహం';

      const isKendraLord = ownedHouses.some((h) => [1, 4, 7, 10].includes(h));
      const isTrikonaLord = ownedHouses.some((h) => [1, 5, 9].includes(h));
      const isDusthanaLord = ownedHouses.some((h) => [6, 8, 12].includes(h));

      let functionalRoleTe = 'సమ ఫలదాత';
      if (isKendraLord && isTrikonaLord) {
        functionalRoleTe = 'రాజయోగకారకుడు';
      } else if (isTrikonaLord) {
        functionalRoleTe = 'శుభ కోణాధిపతి';
      } else if (isKendraLord && !isDusthanaLord) {
        functionalRoleTe = 'కేంద్రాధిపతి';
      } else if (isDusthanaLord) {
        functionalRoleTe = 'విపరీత యోగ / దుస్థానాధిపతి';
      } else if (ng.id === 'Rahu' || ng.id === 'Ketu') {
        functionalRoleTe = 'కర్మ ఛాయా గ్రహం';
      }

      const careerSectors = PLANET_CAREER_SECTORS_TE[ng.id] ?? PLANET_CAREER_SECTORS_TE.Sun;
      const pNameClean = pureTe(ng.nameTe);
      const rasiClean = pureTe(ng.rasiTe);
      const nakClean = pureTe(ng.nakshatraTe);
      const d9Clean = pureTe(ng.d9RasiTe);
      const d10Clean = pureTe(ng.d10RasiTe);
      const houseBenefit = HOUSE_SIMPLE_MEANING_TE[ng.house] ?? '';

      return {
        planetId: ng.id,
        planetNameTe: pNameClean,
        glyph: ng.glyph,
        lordshipHousesTe,
        functionalRoleTe,
        rasiAndDegreeTe: `${rasiClean} (${ng.dms})`,
        houseNumber: ng.house,
        nakshatraAndPadaTe: `${nakClean} - ${ng.pada}వ పాదం`,
        nakshatraLordTe: pureTe(ng.nakshatraLordTe),
        kpSubLordTe: sphutaRow
          ? `${pureTe(sphutaRow.subLordTe)}`
          : pureTe(ng.nakshatraLordTe),
        navamsaRasiTe: d9Clean,
        dasamsaRasiTe: d10Clean,
        dignityAndAvasthaTe: `${pureTe(ng.dignityTe)}${ng.isVargottama ? ' · వర్గోత్తమం' : ''}${ng.isRetrograde ? ' · వక్రం' : ''} · ${pureTe(avRow?.deeptadiAvasthaTe ?? ng.avasthaTe)}`,
        shadbalaAndIshtaTe:
          ng.shadbalaRupas > 0
            ? `షడ్బలం: ${ng.shadbalaRupas.toFixed(1)} రూ. | ఇష్ట ఫలం: ${ikRow?.ishtaPhala ?? 35}/60`
            : `వింశోపక బలం: ${vargaRow?.vimshopakaScore ?? 14}/20`,
        drishtiImpactTe: `${ng.drishtiHousesTe} భావాలపై దృష్టి`,
        positionalPhalamTe: `${pNameClean} ${ng.house}వ భావంలో (${rasiClean} - ${nakClean} నక్షత్రం) స్థితి పొందడం వల్ల ${houseBenefit} నవాంశలో ${d9Clean}, దశాంశలో ${d10Clean} స్థితి వల్ల ఈ గ్రహ బలం జీవిత మధ్యభాగం నుండి విశేషంగా ఫలిస్తుంది.`,
        careerAndWealthImpactTe: `${careerSectors[0]} మరియు ${careerSectors[1]} రంగాలలో మంచి పురోగతి ఉంటుంది. ${ng.drishtiHousesTe} భావాలపై దృష్టి వల్ల ఆర్థిక స్థిరత్వం, గౌరవం పెరుగుతాయి.`,
        dashaBhuktiPhalamTe: `${pNameClean} దశా-భుక్తి కాలాలలో ${ownedHouses.length > 0 ? `${ownedHouses.join(', ')} మరియు ` : ''}${ng.house}వ భావ ఫలితాలు (KP సబ్-లార్డ్: ${pureTe(sphutaRow?.subLordTe ?? ng.nakshatraLordTe)}) వేగంగా నెరవేరుతాయి.`,
        specificPariharaTe: `ఆరాధ్య దైవం: ${pInfo.devataTe} · దానం: ${pInfo.danamTe} · రత్నం: ${pInfo.ratnamTe}`,
      };
    });

  // 4. Marriage & Spouse Blueprint — Clean, Direct & Easy to Read
  const seventhSign = (lagnaSign + 6) % 12;
  const seventhLordId = SIGN_LORDS[seventhSign] ?? 'Venus';
  const seventhLordObj = chart.planets.find((p) => p.id === seventhLordId);
  const navamsaLagnaSign = chart.ascendant.d9Sign;
  const navamsaSeventhSign = (navamsaLagnaSign + 6) % 12;
  const ulItem = jathakam.arudhaPadas[1];

  const marriageDirectionTe =
    SIGN_DIRECTIONS_TE[seventhLordObj?.signIndex ?? seventhSign] ?? 'తూర్పు / ఉత్తర దిక్కు';

  const seventhRasiClean = pureTe(TELUGU_RASIS[seventhSign]?.nameTe);
  const seventhLordClean = pureTe(TELUGU_PLANETS[seventhLordId]?.nameTe);
  const d9SeventhClean = pureTe(TELUGU_RASIS[navamsaSeventhSign]?.nameTe);
  const ulRasiClean = pureTe(ulItem?.rasiNameTe);

  const marriageBlueprint: MarriageAndSpouseBlueprintTe = {
    seventhHouseRasiTe: seventhRasiClean,
    seventhLordTe: seventhLordClean,
    seventhLordHouse: seventhLordObj?.house ?? 7,
    navamsaSeventhRasiTe: d9SeventhClean,
    darakarakaPlanetTe: `${dkNameClean} (${pureTe(dkRow?.rasiTe)})`,
    upapadaLagnaRasiTe: `${ulRasiClean} (${ulItem?.houseFromLagna}వ భావం)`,
    spouseNatureAndAppearanceTe: `7వ భావం (${seventhRasiClean}), సప్తమాధిపతి ${seventhLordClean} (${seventhLordObj?.house ?? 7}వ ఇంట) మరియు దారకారకుడు ${dkNameClean} బలం వల్ల జీవిత భాగస్వామి ఆకర్షణీయమైన రూపం, సంస్కారం, తెలివితేటలు మరియు కుటుంబాన్ని ప్రేమగా నడిపించే గుణం కలిగి ఉంటారు. వివాహం తర్వాత మీ ఆర్థిక, గృహ యోగం రెట్టింపు అవుతుంది.`,
    spouseCareerAndFamilyTe: `ఉపపాద లగ్నం ${ulRasiClean} మరియు శుక్రుడు ${venusObj.house}వ భావంలో ఉండటం వల్ల గౌరవప్రదమైన, విద్యావంతులైన కుటుంబం నుండి సంబంధం కుదురుతుంది. భాగస్వామికి కూడా ఉద్యోగ/వ్యాపార అర్హతలు ఉండి కుటుంబానికి చేదోడుగా నిలుస్తారు.`,
    marriageDirectionAndTimingTe: `జన్మ స్థలం నుండి ప్రధానంగా ${marriageDirectionTe} వైపు నుండి లేదా వృత్తి రీత్యా నివసించే ప్రాంతం నుండి సంబంధం కుదురుతుంది. శుక్ర, గురు మరియు ${seventhLordClean} దశా-భుక్తులు వివాహానికి అత్యంత అనుకూలం.`,
    maritalHarmonyAndPapaSamyaTe: `${astroVisionReport.papaSamyam.kujaDoshaStatusTe} ${astroVisionReport.papaSamyam.marriageMatchingVerdictTe}`,
  };

  // 5. Career & Wealth Blueprint — Clean, Direct & Easy to Read
  const tenthSign = (lagnaSign + 9) % 12;
  const tenthLordId = SIGN_LORDS[tenthSign] ?? 'Saturn';
  const tenthLordObj = chart.planets.find((p) => p.id === tenthLordId);
  const d10LagnaSign = chart.ascendant.d10Sign;
  const d10LordId = SIGN_LORDS[d10LagnaSign] ?? 'Sun';

  const tenthRasiClean = pureTe(TELUGU_RASIS[tenthSign]?.nameTe);
  const tenthLordClean = pureTe(TELUGU_PLANETS[tenthLordId]?.nameTe);
  const d10LagnaClean = pureTe(TELUGU_RASIS[d10LagnaSign]?.nameTe);
  const d10LordClean = pureTe(TELUGU_PLANETS[d10LordId]?.nameTe);

  const primarySectors = [
    ...(PLANET_CAREER_SECTORS_TE[tenthLordId] ?? []),
    ...(PLANET_CAREER_SECTORS_TE[amkRow?.planetId ?? d10LordId] ?? []),
  ].slice(0, 5);

  const careerWealthBlueprint: CareerAndWealthBlueprintTe = {
    tenthHouseRasiTe: tenthRasiClean,
    tenthLordTe: tenthLordClean,
    tenthLordHouse: tenthLordObj?.house ?? 10,
    dasamsaLagnaRasiTe: `${d10LagnaClean} (అధిపతి: ${d10LordClean})`,
    amatyakarakaPlanetTe: `${amkNameClean} (${pureTe(amkRow?.rasiTe)})`,
    jobVsBusinessVerdictTe:
      [1, 4, 7, 10, 11].includes(tenthLordObj?.house ?? 10)
        ? `10వ అధిపతి ${tenthLordClean} ${tenthLordObj?.house}వ భావంలో బలంగా ఉండటం వల్ల — మొదట ఉన్నత ఉద్యోగంలో స్థిరపడి, 32–36 సం. తర్వాత స్వంత సంస్థ / కన్సల్టెన్సీ / వ్యాపార విస్తరణ చేసే రాజయోగం ఉంది.`
        : `మీ జాతకానికి ఉన్నత సాంకేతిక/మేనేజ్‌మెంట్ ఉద్యోగం (85% అనుకూలత) మరియు భాగస్వామ్య రహిత స్వతంత్ర వృత్తి అత్యంత శ్రేయస్కరం.`,
    recommendedSectorsTe: primarySectors,
    wealthAndPropertyYogasTe: `2వ అధిపతి ${pureTe(house2.adhipatiTe)}, 11వ అధిపతి ${pureTe(house11.adhipatiTe)} మరియు 4వ అధిపతి ${pureTe(house4.adhipatiTe)} బలం వల్ల స్వార్జిత ధనంతో పాటు సొంత ఇల్లు, భూమి, వాహనాలు సంపాదించే బలమైన ధన-గృహ యోగం ఉంది.`,
    foreignTravelAndSettlementTe: `9వ అధిపతి ${pureTe(house9.adhipatiTe)} మరియు 12వ అధిపతి ${pureTe(house12.adhipatiTe)} స్థితి వల్ల ఉద్యోగ/వ్యాపార రీత్యా దూర ప్రాంత లేదా విదేశీ ప్రయాణాలు, MNC సంస్థల ద్వారా ధనార్జన యోగం కనిపిస్తున్నాయి.`,
    peakFinancialAgesTe: `27–32 సం. (తొలి ఆర్థిక పురోగతి) · 35–46 సం. (సొంత ఇల్లు, భూమి & రాజయోగం) · 49–60 సం. (అధికార & సంపద స్థిరీకరణ)`,
  };

  return {
    horoscopeExecutiveIdentity: {
      swaroopaTitleTe,
      physicalAndMentalConstitutionTe,
      atmakarakaAndSoulMissionTe,
      lagnaAndChandraSynthesisTe,
      keyLifeStrengthsTe,
      keyLifePrecautionsTe,
      overallLifeFortuneScore: avgPillarScore,
    },
    sevenLifeEpochs,
    navagrahaLifePredictions,
    marriageBlueprint,
    careerWealthBlueprint,
    jaiminiCharaDashaReport,
  };
}
