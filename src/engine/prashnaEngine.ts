import {
  calculateChart,
  norm360,
  type BirthInput,
  type CompleteChartResult,
  type PlanetPosition,
} from './ephemeris.ts';
import { TELUGU_PLANETS, TELUGU_RASIS } from './teluguJathakam.ts';

export type PrashnaCategoryId =
  | 'lost_item' // నష్ట ద్రవ్య విచారము (Lost / Stolen Item)
  | 'work_delay' // కార్య సిద్ధి & ఆలస్య విచారము (Work Completion, Delays & Obstacles)
  | 'job_career' // ఉద్యోగ, ప్రమోషన్ & వ్యాపార ప్రశ్న
  | 'marriage' // వివాహ సంబంధ & దాంపత్య ప్రశ్న
  | 'health_disease' // ఆరోగ్య, రోగ విముక్తి & శస్త్రచికిత్స
  | 'travel_foreign' // ప్రయాణ, విదేశీయాన & వీసా ప్రశ్న
  | 'legal_dispute' // కోర్టు కేసులు, వివాదాలు & శత్రు జయం
  | 'property_vehicle' // ఆస్తి, భూమి, గృహ నిర్మాణం & వాహన ప్రశ్న
  | 'progeny' // సంతాన ప్రాప్తి & గర్భధారణ విచారము
  | 'general_wish'; // సర్వ మనోవాంఛా సిద్ధి

export interface PrashnaCategoryMeta {
  id: PrashnaCategoryId;
  titleTe: string;
  titleEn: string;
  karyaBhavaNumber: number;
  secondaryBhavaNumber?: number;
  karyaKarakaPlanet: string;
  sanskritTopicTe: string;
  shastraReferenceTe: string;
  defaultQuestionTe: string;
  descriptionTe: string;
}

export const PRASHNA_CATEGORIES: Record<PrashnaCategoryId, PrashnaCategoryMeta> = {
  lost_item: {
    id: 'lost_item',
    titleTe: 'నష్ట ద్రవ్య విచారము (పోయిన వస్తువు దొరుకుతుందా?)',
    titleEn: 'Lost / Stolen Item Recovery',
    karyaBhavaNumber: 4, // 4th = hidden treasures & lost property, 2nd = wealth
    secondaryBhavaNumber: 2,
    karyaKarakaPlanet: 'Moon',
    sanskritTopicTe: 'నష్టద్రవ్య లాభ-స్థాన విచారః',
    shastraReferenceTe: 'ప్రశ్న మార్గం (అధ్యాయం 23) & దైవజ్ఞ వల్లభ (అధ్యాయం 5)',
    defaultQuestionTe: 'నా విలువైన వస్తువు/ఆభరణం కనిపించట్లేదు — అది ఎక్కడుంది? దొరుకుతుందా?',
    descriptionTe: 'వస్తువు ఉన్న దిక్కు, స్థలం రకం, పోవడానికి కారణం (విస్మృతియా లేదా చోరత్వమా), మరియు లభించే కాల నిర్ధారణ.',
  },
  work_delay: {
    id: 'work_delay',
    titleTe: 'కార్య సిద్ధి & ఆలస్య విచారము (పని నెరవేరుతుందా?)',
    titleEn: 'Work Completion, Delays & Obstacles',
    karyaBhavaNumber: 10, // 10th = Karma/work, 11th = fulfillment
    secondaryBhavaNumber: 11,
    karyaKarakaPlanet: 'Jupiter',
    sanskritTopicTe: 'కార్యసిద్ధి విలంబ హేతు విచారః',
    shastraReferenceTe: 'తాజిక నీలకంఠి (ఇత్థశాల విచారః) & ప్రశ్న తంత్రం',
    defaultQuestionTe: 'తలపెట్టిన పనిలో తీవ్ర ఆటంకాలు వస్తున్నాయి — కార్యం ఎప్పుడు నెరవేరుతుంది?',
    descriptionTe: 'కార్యం సిద్ధించే సంభావ్యత, ఆలస్యానికి గల మూల కారణం (శత్రువులా, అధికార యంత్రాంగమా, లేక దోషమా), మరియు పరిహారాలు.',
  },
  job_career: {
    id: 'job_career',
    titleTe: 'ఉద్యోగ, ప్రమోషన్ & వ్యాపార ప్రశ్న',
    titleEn: 'Career, Job Change & Promotion',
    karyaBhavaNumber: 10,
    secondaryBhavaNumber: 6,
    karyaKarakaPlanet: 'Sun',
    sanskritTopicTe: 'రాజ్య-వృత్తి-ఉద్యోగ విచారః',
    shastraReferenceTe: 'దైవజ్ఞ వల్లభ & ప్రశ్న మార్గం',
    defaultQuestionTe: 'నాకు నూతన ఉద్యోగం లేదా కోరుకున్న బదిలీ/పదోన్నతి లభిస్తుందా?',
    descriptionTe: 'ఉద్యోగ లాభం, ఉన్నతాధికారుల అనుగ్రహం, మరియు వ్యాపార పురోగతికి శుభ సమయం.',
  },
  marriage: {
    id: 'marriage',
    titleTe: 'వివాహ సంబంధ & దాంపత్య ప్రశ్న',
    titleEn: 'Marriage Proposal & Timing',
    karyaBhavaNumber: 7,
    secondaryBhavaNumber: 2,
    karyaKarakaPlanet: 'Venus',
    sanskritTopicTe: 'వివాహ-కళత్ర యోగ విచారః',
    shastraReferenceTe: 'ప్రశ్న మార్గం (అధ్యాయం 20)',
    defaultQuestionTe: 'ప్రస్తుతం చూస్తున్న సంబంధం కుదురుతుందా? వివాహం ఎప్పుడు జరుగుతుంది?',
    descriptionTe: 'సప్తమ భావం, శుక్రుని బలంతో సంబంధం సానుకూలత మరియు వివాహ ముహూర్త సూచన.',
  },
  health_disease: {
    id: 'health_disease',
    titleTe: 'ఆరోగ్య, రోగ విముక్తి & శస్త్రచికిత్స',
    titleEn: 'Health & Disease Recovery',
    karyaBhavaNumber: 1, // 1st = vitality, 6th = disease, 8th = longevity
    secondaryBhavaNumber: 6,
    karyaKarakaPlanet: 'Sun',
    sanskritTopicTe: 'రోగోపశమన-ఆరోగ్య విచారః',
    shastraReferenceTe: 'ప్రశ్న మార్గం (రోగాధ్యాయం)',
    defaultQuestionTe: 'ఈ అనారోగ్యం ఎప్పటికి నయమవుతుంది? వైద్యం/వైద్యుడిని మార్చాలా?',
    descriptionTe: 'వ్యాధి తీవ్రత, ఔషధ గుణం, రోగ విముక్తి లభించే కాలం మరియు శాంతి పరిహారాలు.',
  },
  travel_foreign: {
    id: 'travel_foreign',
    titleTe: 'ప్రయాణ, విదేశీయాన & వీసా ప్రశ్న',
    titleEn: 'Travel, Foreign Visit & Visa',
    karyaBhavaNumber: 9,
    secondaryBhavaNumber: 12,
    karyaKarakaPlanet: 'Moon',
    sanskritTopicTe: 'దేశాంతర-ప్రయాణ సిద్ధి విచారః',
    shastraReferenceTe: 'దైవజ్ఞ వల్లభ & తాజిక నీలకంఠి',
    defaultQuestionTe: 'నా విదేశీ వీసా/ప్రయాణం సఫలమవుతుందా? క్షేమంగా తిరిగి రాగలనా?',
    descriptionTe: 'ప్రయాణ శుభత్వం, విదేశీ కార్యసిద్ధి మరియు వీసా మంజూరు సూచన.',
  },
  legal_dispute: {
    id: 'legal_dispute',
    titleTe: 'కోర్టు కేసులు, వివాదాలు & శత్రు జయం',
    titleEn: 'Legal Disputes & Litigation',
    karyaBhavaNumber: 6,
    secondaryBhavaNumber: 1,
    karyaKarakaPlanet: 'Mars',
    sanskritTopicTe: 'వివాద-శత్రుజయ విచారః',
    shastraReferenceTe: 'ప్రశ్న మార్గం (అధ్యాయం 25)',
    defaultQuestionTe: 'ఈ కోర్టు కేసు లేదా వివాదం నాకు అనుకూలంగా ముగుస్తుందా? రాజీ పడాలా?',
    descriptionTe: 'వాది-ప్రతివాదుల బలాబలాలు, న్యాయాధికారి దృష్టి మరియు అంతిమ తీర్పు అనుకూలత.',
  },
  property_vehicle: {
    id: 'property_vehicle',
    titleTe: 'ఆస్తి, భూమి, గృహ నిర్మాణం & వాహన ప్రశ్న',
    titleEn: 'Property, Land & Vehicle',
    karyaBhavaNumber: 4,
    secondaryBhavaNumber: 11,
    karyaKarakaPlanet: 'Mars',
    sanskritTopicTe: 'భూమి-గృహ-వాహన ప్రాప్తి విచారః',
    shastraReferenceTe: 'బృహత్ పరాశర హోరా శాస్త్రం & ప్రశ్న మార్గం',
    defaultQuestionTe: 'ఈ భూమి/ఇల్లు లేదా వాహనం కొనడం లాభదాయకమేనా? ఆస్తి సొంతమవుతుందా?',
    descriptionTe: 'స్థిరాస్తి యోగం, దస్త్రాల పరిశీలన అనుకూలత మరియు క్రయవిక్రయ సమయం.',
  },
  progeny: {
    id: 'progeny',
    titleTe: 'సంతాన ప్రాప్తి & గర్భధారణ విచారము',
    titleEn: 'Progeny & Childbirth',
    karyaBhavaNumber: 5,
    secondaryBhavaNumber: 9,
    karyaKarakaPlanet: 'Jupiter',
    sanskritTopicTe: 'సంతాన భాగ్య విచారః',
    shastraReferenceTe: 'ప్రశ్న మార్గం & ఫలదీపిక',
    defaultQuestionTe: 'సంతాన ప్రాప్తి ఎప్పుడు కలుగుతుంది? ఏ పరిహారం ఆచరించాలి?',
    descriptionTe: 'పంచమ స్థానం, గురు దృష్టి మరియు పుత్ర-పుత్రికా యోగాల విశ్లేషణ.',
  },
  general_wish: {
    id: 'general_wish',
    titleTe: 'సర్వ మనోవాంఛా సిద్ధి (సాధారణ ప్రశ్న)',
    titleEn: 'General Wish Fulfillment',
    karyaBhavaNumber: 11,
    secondaryBhavaNumber: 1,
    karyaKarakaPlanet: 'Jupiter',
    sanskritTopicTe: 'మనోవాంఛా సిద్ధి విచారః',
    shastraReferenceTe: 'దైవజ్ఞ వల్లభ & తాజిక గ్రంథాలు',
    defaultQuestionTe: 'నేను కోరుకున్న కోరిక లేదా సంకల్పం నెరవేరుతుందా?',
    descriptionTe: 'లగ్నేశ-లాభేశ సమన్వయం, చంద్ర బలం మరియు సంకల్ప సిద్ధి కాలం.',
  },
};

export type TajikaYogaType =
  | 'ithasala' // Applying aspect within orb (Fast success)
  | 'ishrafa' // Separating aspect (Delay / Missed opportunity)
  | 'nakta' // Third faster planet transfers light (Help from mediator/friend)
  | 'yamaya' // Third slower planet receives light (Help from elder/institution)
  | 'kamboola' // Moon joins with dignity (Supreme victory)
  | 'none';

export interface TajikaYogaDiagnosis {
  yogaType: TajikaYogaType;
  nameTe: string;
  verdictTe: string;
  isFavorable: boolean;
  fasterPlanetTe: string;
  slowerPlanetTe: string;
  aspectDegrees: number;
  orbDegrees: number;
  explanationTe: string;
}

export interface ArudhaLagnaDiagnosis {
  signIndex: number;
  signNameTe: string;
  signNameEn: string;
  houseFromLagna: number;
  lordId: string;
  lordNameTe: string;
  lordHouseFromArudha: number;
  karyeshaHouseFromArudha: number;
  karyeshaLordNameTe: string;
  chandraHouseFromArudha: number;
  shubhaPlanetsInKendra: string[];
  paapaPlanetsInDusthana: string[];
  arudhaShastraVerdictTe: string;
  tangibleManifestationTe: string;
  elementNatureTe: string;
  cardinalDirectionTe: string;
  cardinalAngleDeg: number;
}

export interface LostItemDiagnosis {
  isFoundVerdictTe: string;
  probabilityPercent: number;
  directionTe: string;
  directionAngleDeg: number;
  placeDescriptionTe: string;
  environmentTypeTe: string; // జల, అగ్ని, భూమి, వాయు స్థలం
  causeOfLossTe: string; // మర్చిపోయారా, దొంగతనమా, బంధువులా
  culpritDescriptionTe: string;
  recoveryTimingTe: string;
  recoveryHoursOrDaysNumber: number;
  practicalSearchGuideTe: string;

  // Advanced Arudha Cross-Referenced Additions
  arudhaDirectionTe: string;
  arudhaCompassDegree: number;
  arudhaRoomTypeTe: string;
  arudhaHeightLevelTe: string;
  itemConditionTe: string;
  isInsidePremises: boolean;
  timeBoundTargetDateTe: string;
  retrievalActionGuideTe: string;
  shastraClueTe: string;
  targetRecoveryDateStr?: string;
  targetRecoveryHours?: number;
  retrievalGuideTe?: string;
}

export interface WorkDelayDiagnosis {
  willWorkSucceedVerdictTe: string;
  successProbabilityPercent: number;
  primaryCauseOfDelayTe: string;
  obstructionCategoryTe: string; // శత్రు, ప్రభుత్వ, నిర్లక్ష్య, గ్రహదోష
  expectedFruitionTimeTe: string;
  actionableRemedialStepsTe: string[];

  // Advanced Arudha Cross-Referenced Additions
  arudhaFruitionAlignmentTe: string;
  labharudhaLordStatusTe: string;
  timeBoundCompletionDateTe: string;
  keyUnblockingPersonTe: string;
  delayRemedySankalpamTe: string;
  classicalTajikaSignalTe: string;
  delayResolutionTargetDateStr?: string;
  favorableTimeSlotTe?: string;
  keyPersonImpactTe?: string;
}

export interface PrashnaReport {
  timestampIso: string;
  formattedQueryDateTimeTe: string;
  category: PrashnaCategoryMeta;
  querentQuestionText: string;
  kpPrashnaNumber?: number; // 1..249
  ashtamangalaNumber?: number; // 1..108

  // Core Kundali Parameters at Query Moment
  prashnaLagna: {
    signIndex: number;
    signNameTe: string;
    signNameEn: string;
    degreeDMS: string;
    lordId: string;
    lordNameTe: string;
    lordHouse: number;
    lordDignityTe: string;
    modalityTe: string; // చర, స్థిర, ద్విస్వభావ
  };

  prashnaChandra: {
    signIndex: number;
    signNameTe: string;
    degreeDMS: string;
    house: number;
    nakshatraNameTe: string;
    pada: number;
    chandrabalaTe: string;
    mentalStateTe: string;
  };

  arudhaLagna: ArudhaLagnaDiagnosis;

  karyaBhava: {
    houseNumber: number;
    signIndex: number;
    signNameTe: string;
    lordId: string;
    lordNameTe: string;
    lordHouse: number;
    lordDignityTe: string;
    occupantsTe: string[];
  };

  badhakaDiagnosis: {
    badhakaHouseNumber: number;
    badhakaLordId: string;
    badhakaLordNameTe: string;
    badhakaPlacedHouse: number;
    obstructionAnalysisTe: string;
  };

  // Tajika Alignment
  tajikaYoga: TajikaYogaDiagnosis;

  // Master Astrological Verdict
  verdictBadge: 'favorable' | 'moderate_delay' | 'severe_obstacle' | 'unfavorable';
  verdictTitleTe: string;
  verdictSummaryTe: string;
  confidenceScorePercent: number;

  // Specific Domain Modules
  lostItemDetail?: LostItemDiagnosis;
  workDelayDetail?: WorkDelayDiagnosis;

  // Classical Authority & Sanskrit Shlokas
  classicalShloka: {
    sourceGranthaTe: string;
    sanskritShloka: string;
    teluguMeaning: string;
  };

  // Sacred Vedic Upayas & Mantras
  vedicRemedies: {
    primaryMantraTitleTe: string;
    sanskritMantra: string;
    mantraJapaCountTe: string;
    danamsTe: string;
    kshetraDarshanamTe: string;
    specialProcedureTe: string;
  };

  // Chart result for full Kundali rendering
  chartResult: CompleteChartResult;
}

// Tajika Planetary Orbs (Deepshamsa in degrees)
const TAJIKA_DEEPSHAMSA: Record<string, number> = {
  Sun: 15,
  Moon: 12,
  Mars: 8,
  Mercury: 7,
  Jupiter: 9,
  Venus: 7,
  Saturn: 9,
};

// Tajika Natural Daily Speeds (degrees per day)
const PLANETARY_SPEED_ORDER: Record<string, number> = {
  Moon: 13.176,
  Mercury: 1.383,
  Venus: 1.200,
  Sun: 0.9856,
  Mars: 0.524,
  Jupiter: 0.083,
  Saturn: 0.033,
};

// KP Sub-Lord boundary table helper for 1-249 Horary
export function getKpSubLordForNumber(kpNumber: number): {
  signIndex: number;
  signNameTe: string;
  nakshatraNameTe: string;
  starLordTe: string;
  subLordTe: string;
  cuspDegreeDMS: string;
} {
  const clamped = Math.max(1, Math.min(249, kpNumber));
  // Total span 360° divided roughly by 249 sub-divisions (~1°26'46" on avg)
  const deg = ((clamped - 1) * (360 / 249)) % 360;
  const signIdx = Math.floor(deg / 30);
  const nakIdx = Math.floor(deg / (360 / 27));

  const lords = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
  const starLord = lords[nakIdx % 9];
  const subLord = lords[(clamped - 1) % 9];

  const signDeg = deg % 30;
  const d = Math.floor(signDeg);
  const m = Math.floor((signDeg - d) * 60);

  return {
    signIndex: signIdx,
    signNameTe: TELUGU_RASIS[signIdx]?.nameTe.split(' ')[0] ?? '',
    nakshatraNameTe: lords[nakIdx % 9],
    starLordTe: TELUGU_PLANETS[starLord]?.nameTe.split(' ')[0] ?? starLord,
    subLordTe: TELUGU_PLANETS[subLord]?.nameTe.split(' ')[0] ?? subLord,
    cuspDegreeDMS: `${d}° ${m}'`,
  };
}

/**
 * Executes a full Horary Astrology (ప్రశ్న శాస్త్రం) calculation at the given query time and location.
 */
export function calculatePrashnaReport(
  queryDate: Date,
  categoryKey: PrashnaCategoryId,
  questionText: string,
  lat: number,
  lng: number,
  tzOffsetHours: number,
  cityName: string,
  countryName: string = 'భారతదేశం',
  kpPrashnaNumber?: number,
  ashtamangalaNumber?: number
): PrashnaReport {
  const category = PRASHNA_CATEGORIES[categoryKey] ?? PRASHNA_CATEGORIES.lost_item;

  const localMs = queryDate.getTime() + tzOffsetHours * 3600 * 1000;
  const localD = new Date(localMs);
  const dateStr = `${localD.getUTCFullYear()}-${String(localD.getUTCMonth() + 1).padStart(2, '0')}-${String(
    localD.getUTCDate()
  ).padStart(2, '0')}`;
  const timeStr = `${String(localD.getUTCHours()).padStart(2, '0')}:${String(localD.getUTCMinutes()).padStart(2, '0')}`;

  const birthInput: BirthInput = {
    name: 'ప్రశ్నకర్త (Querent)',
    date: dateStr,
    time: timeStr,
    lat,
    lng,
    tzOffsetHours,
    city: cityName,
    country: countryName,
    ayanamsa: 'lahiri',
    houseSystem: 'whole_sign',
  };

  const chart = calculateChart(birthInput, 'vedic');

  // Lagna & Lagnesha (Querent)
  const ascHouse = chart.ascendant;
  const lagnaSignIdx = ascHouse.signIndex;
  const lagnaRasi = TELUGU_RASIS[lagnaSignIdx] ?? TELUGU_RASIS[0];

  const lagnaLordId = ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'][lagnaSignIdx];
  const lagnaLordObj = chart.planets.find((p) => p.id === lagnaLordId) ?? chart.planets[0];
  const lagnaLordNameTe = TELUGU_PLANETS[lagnaLordId]?.nameTe.split(' ')[0] ?? lagnaLordId;

  // Moon (Mind of Querent)
  const moonObj = chart.planets.find((p) => p.id === 'Moon') ?? chart.planets[1];
  const moonSignIdx = moonObj.d1Sign;
  const moonRasi = TELUGU_RASIS[moonSignIdx] ?? TELUGU_RASIS[0];
  const moonNakIdx = Math.floor(moonObj.siderealLon / (360 / 27));
  const moonNakNameTe = TELUGU_PLANETS.Moon?.nameTe ?? 'రోహిణి';

  // Karya Bhava & Karyesha (Matter asked)
  const karyaBhavaNum = category.karyaBhavaNumber;
  const karyaSignIdx = (lagnaSignIdx + karyaBhavaNum - 1) % 12;
  const karyaRasi = TELUGU_RASIS[karyaSignIdx] ?? TELUGU_RASIS[0];
  const karyaLordId = ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'][karyaSignIdx];
  const karyaLordObj = chart.planets.find((p) => p.id === karyaLordId) ?? chart.planets[0];
  const karyaLordNameTe = TELUGU_PLANETS[karyaLordId]?.nameTe.split(' ')[0] ?? karyaLordId;

  const occupantsInKarya = chart.planets
    .filter((p) => p.house === karyaBhavaNum)
    .map((p) => TELUGU_PLANETS[p.id]?.nameTe.split(' ')[0] ?? p.name);

  // Badhaka Sthana Diagnosis: Movable(1,4,7,10)=11th, Fixed(2,5,8,11)=9th, Dual(3,6,9,12)=7th
  const isMovable = [0, 3, 6, 9].includes(lagnaSignIdx);
  const isFixed = [1, 4, 7, 10].includes(lagnaSignIdx);
  const badhakaHouse = isMovable ? 11 : isFixed ? 9 : 7;
  const badhakaSignIdx = (lagnaSignIdx + badhakaHouse - 1) % 12;
  const badhakaLordId = ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'][badhakaSignIdx];
  const badhakaLordObj = chart.planets.find((p) => p.id === badhakaLordId) ?? chart.planets[0];
  const badhakaLordNameTe = TELUGU_PLANETS[badhakaLordId]?.nameTe.split(' ')[0] ?? badhakaLordId;

  // Modality of Lagna
  const modalityTe = isMovable
    ? 'చర రాశి (వేగవంతమైన కదలిక / త్వరగా మార్పు)'
    : isFixed
    ? 'స్థిర రాశి (స్థిరమైన ఫలితం / కదలని స్థితి)'
    : 'ద్విస్వభావ రాశి (రెండు ప్రయత్నాలతో పూర్తయ్యే ఫలితం)';

  // Tajika Aspect & Yoga calculation between Lagnesha & Karyesha
  const tajika = calculateTajikaYogaBetween(lagnaLordObj, karyaLordObj, moonObj);

  // Success scoring algorithm
  let score = 50;

  // Lagna Lord strength
  if ([1, 4, 5, 7, 9, 10].includes(lagnaLordObj.house)) score += 15;
  if ([6, 8, 12].includes(lagnaLordObj.house)) score -= 15;

  // Karya Lord strength
  if ([1, 4, 5, 7, 9, 10, 11].includes(karyaLordObj.house)) score += 15;
  if ([6, 8, 12].includes(karyaLordObj.house)) score -= 15;

  // Moon strength
  if ([1, 4, 5, 9, 10, 11].includes(moonObj.house)) score += 10;
  if ([6, 8, 12].includes(moonObj.house)) score -= 10;

  // Tajika Yoga impact
  if (tajika.yogaType === 'ithasala' || tajika.yogaType === 'kamboola') score += 20;
  if (tajika.yogaType === 'nakta' || tajika.yogaType === 'yamaya') score += 10;
  if (tajika.yogaType === 'ishrafa') score -= 20;

  // Retrograde factor
  if (categoryKey === 'lost_item' && (karyaLordObj.isRetrograde || lagnaLordObj.isRetrograde)) {
    // In lost item, retrograde means returning back!
    score += 15;
  } else if (karyaLordObj.isRetrograde) {
    score -= 10;
  }

  score = Math.max(12, Math.min(98, score));

  // Determine Verdict Badges
  let verdictBadge: 'favorable' | 'moderate_delay' | 'severe_obstacle' | 'unfavorable' = 'moderate_delay';
  let verdictTitleTe = 'కొద్దిపాటి ఆలస్యంతో కార్య సిద్ధి';
  let verdictSummaryTe = '';

  if (score >= 75) {
    verdictBadge = 'favorable';
    verdictTitleTe = categoryKey === 'lost_item' ? 'తప్పక లభిస్తుంది (Definite Recovery)' : 'త్వరిత సంపూర్ణ కార్య సిద్ధి (Definite Success)';
    verdictSummaryTe = `ప్రశ్న లగ్నాధిపతి ${lagnaLordNameTe} మరియు కార్యాధిపతి ${karyaLordNameTe} మధ్య శుభ సంబంధం వలన తలపెట్టిన కార్యం నిస్సందేహంగా సఫలమవుతుంది. ఆటంకాలు తొలగి అనుకూల వార్త వింటారు.`;
  } else if (score >= 50) {
    verdictBadge = 'moderate_delay';
    verdictTitleTe = categoryKey === 'lost_item' ? 'ఆలస్యంగా, సహాయంతో లభించును (Recovered with Delay)' : 'ఆలస్యానంతర కార్య సిద్ధి (Success after Delay)';
    verdictSummaryTe = `కార్యం నెరవేరుతుంది, కానీ కొంత సమయం మరియు సహనం అవసరం. తాజిక యోగ ప్రమాణం ప్రకారం మధ్యవర్తి లేదా స్నేహితుల సహకారం తీసుకున్నప్పుడు పని త్వరగా పూర్తవుతుంది.`;
  } else if (score >= 35) {
    verdictBadge = 'severe_obstacle';
    verdictTitleTe = 'తీవ్ర ఆటంకాలు — పునః ప్రయత్నం అవసరం (Obstacles)';
    verdictSummaryTe = `ప్రస్తుత గ్రహ స్థితులలో 6, 8, 12వ స్థానాల ప్రభావం వల్ల పనిలో ఊహించని జాప్యం ఏర్పడుతోంది. శాంతి పరిహారాలు ఆచరించి, కొద్దిరోజుల తర్వాత మళ్లీ ప్రయత్నించడం ఉత్తమం.`;
  } else {
    verdictBadge = 'unfavorable';
    verdictTitleTe = categoryKey === 'lost_item' ? 'లభించుట దుర్లభం (Difficult to Find)' : 'ప్రస్తుతానికి కార్య భంగం (Presently Unfavorable)';
    verdictSummaryTe = `ప్రశ్నా సమయ గ్రహ స్థితులు ఈ సమయానికి అనుకూలంగా లేవు. ఈ పని విషయంలో తొందరపాటు నిర్ణయాలు తీసుకోకుండా, కాల గమనాన్ని గమనిస్తూ వేచి చూడటం శ్రేయస్కరం.`;
  }

  // -------------------------------------------------------------------------
  // ARUDHA LAGNA (ఆరూఢ లగ్నం / AL) & PLANETARY CROSS-REFERENCING (Jaimini & Prashna Marga)
  // -------------------------------------------------------------------------
  const lagnaLordSignIdx = lagnaLordObj.d1Sign;
  const distLagnaToLord = (lagnaLordSignIdx - lagnaSignIdx + 12) % 12;
  let rawArudhaSignIdx = (lagnaLordSignIdx + distLagnaToLord) % 12;

  // Classical Exceptions: If AL falls in 1st, take 10th; if 7th, take 4th
  if (rawArudhaSignIdx === lagnaSignIdx) {
    rawArudhaSignIdx = (lagnaSignIdx + 9) % 12;
  } else if (rawArudhaSignIdx === (lagnaSignIdx + 6) % 12) {
    rawArudhaSignIdx = (lagnaSignIdx + 3) % 12;
  }
  const arudhaSignIdx = rawArudhaSignIdx;
  const arudhaRasi = TELUGU_RASIS[arudhaSignIdx] ?? TELUGU_RASIS[0];
  const arudhaLordId = ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'][arudhaSignIdx];
  const arudhaLordObj = chart.planets.find((p) => p.id === arudhaLordId) ?? chart.planets[0];
  const arudhaLordNameTe = TELUGU_PLANETS[arudhaLordId]?.nameTe.split(' ')[0] ?? arudhaLordId;

  const houseFromLagnaToArudha = ((arudhaSignIdx - lagnaSignIdx + 12) % 12) + 1;
  const lordHouseFromArudha = ((arudhaLordObj.d1Sign - arudhaSignIdx + 12) % 12) + 1;
  const karyeshaHouseFromArudha = ((karyaLordObj.d1Sign - arudhaSignIdx + 12) % 12) + 1;
  const chandraHouseFromArudha = ((moonSignIdx - arudhaSignIdx + 12) % 12) + 1;

  // Benefics in Kendra/Trikona/11th from Arudha Lagna
  const shubhaPlanetsInArudhaKendra = chart.planets
    .filter((p) => ['Jupiter', 'Venus', 'Mercury', 'Moon'].includes(p.id) && [1, 4, 5, 7, 9, 10, 11].includes(((p.d1Sign - arudhaSignIdx + 12) % 12) + 1))
    .map((p) => TELUGU_PLANETS[p.id]?.nameTe.split(' ')[0] ?? p.name);

  const paapaPlanetsInArudhaDusthana = chart.planets
    .filter((p) => ['Saturn', 'Mars', 'Rahu', 'Ketu'].includes(p.id) && [6, 8, 12].includes(((p.d1Sign - arudhaSignIdx + 12) % 12) + 1))
    .map((p) => TELUGU_PLANETS[p.id]?.nameTe.split(' ')[0] ?? p.name);

  // Arudha Element and 8-fold Direction
  const elemMap = ['అగ్ని తత్త్వ రాశి', 'భూ తత్త్వ రాశి', 'వాయు తత్త్వ రాశి', 'జల తత్త్వ రాశి'];
  const arudhaElem = elemMap[arudhaSignIdx % 4];

  const arudhaDirections: Record<number, { dirTe: string; deg: number }> = {
    0: { dirTe: 'తూర్పు (East)', deg: 90 },
    1: { dirTe: 'దక్షిణం (South)', deg: 180 },
    2: { dirTe: 'పశ్చిమం (West)', deg: 270 },
    3: { dirTe: 'ఉత్తరం (North)', deg: 0 },
    4: { dirTe: 'తూర్పు (East)', deg: 90 },
    5: { dirTe: 'దక్షిణం (South)', deg: 180 },
    6: { dirTe: 'పశ్చిమం (West)', deg: 270 },
    7: { dirTe: 'ఉత్తరం (North)', deg: 0 },
    8: { dirTe: 'ఈశాన్యం / తూర్పు (North-East / East)', deg: 45 },
    9: { dirTe: 'దక్షిణం (South)', deg: 180 },
    10: { dirTe: 'వాయవ్యం / పశ్చిమం (North-West / West)', deg: 315 },
    11: { dirTe: 'ఉత్తరం (North)', deg: 0 },
  };
  const arudhaDirInfo = arudhaDirections[arudhaSignIdx] ?? { dirTe: 'తూర్పు (East)', deg: 90 };

  const isArudhaKaryeshaFavorable = [1, 2, 4, 5, 7, 9, 10, 11].includes(karyeshaHouseFromArudha);
  if (isArudhaKaryeshaFavorable) {
    score += 10;
  } else {
    score -= 10;
  }
  score = Math.max(15, Math.min(98, score));

  const arudhaShastraVerdict = isArudhaKaryeshaFavorable
    ? `ఆరూఢ లగ్నం (${arudhaRasi.nameTe.split(' ')[0]}) కి కార్యాధిపతి ${karyaLordNameTe} ${karyeshaHouseFromArudha}వ శుభ స్థానంలో ఉన్నందున భౌతిక రూపంలో కార్యం నెరవేరడం నిశ్చయం.`
    : `ఆరూఢ లగ్నానికి కార్యాధిపతి ${karyeshaHouseFromArudha}వ రంధ్ర/వ్యయ స్థానంలో ఉన్నందున భౌతిక అన్వేషణ లేదా పరిష్కారంలో కాస్త శ్రమ అవసరం.`;

  const tangibleManifestationTe =
    score >= 70
      ? 'కంటికి కనిపించే రీతిలో స్పష్టమైన పరిష్కారం మరియు సానుకూల పరిణామం శీఘ్రంగా కలుగుతుంది.'
      : 'ప్రస్తుతానికి విషయం కొద్దిగా దాగి ఉన్నట్లు లేదా మరుగున పడినట్లు కనిపిస్తోంది; ఆరూఢ సూచనలను అనుసరించడం శ్రేయస్కరం.';

  const arudhaLagnaDiagnosis: ArudhaLagnaDiagnosis = {
    signIndex: arudhaSignIdx,
    signNameTe: arudhaRasi.nameTe.split(' ')[0],
    signNameEn: arudhaRasi.nameEn,
    houseFromLagna: houseFromLagnaToArudha,
    lordId: arudhaLordId,
    lordNameTe: arudhaLordNameTe,
    lordHouseFromArudha,
    karyeshaHouseFromArudha,
    karyeshaLordNameTe: karyaLordNameTe,
    chandraHouseFromArudha,
    shubhaPlanetsInKendra: shubhaPlanetsInArudhaKendra,
    paapaPlanetsInDusthana: paapaPlanetsInArudhaDusthana,
    arudhaShastraVerdictTe: arudhaShastraVerdict,
    tangibleManifestationTe,
    elementNatureTe: arudhaElem,
    cardinalDirectionTe: arudhaDirInfo.dirTe,
    cardinalAngleDeg: arudhaDirInfo.deg,
  };

  // -------------------------------------------------------------------------
  // GENERATE LOST ITEM SPECIFIC DIAGNOSTICS (నష్టద్రవ్య ప్రశ్న విచారము)
  // -------------------------------------------------------------------------
  let lostItemDetail: LostItemDiagnosis | undefined;
  if (categoryKey === 'lost_item') {
    const isFixedArudha = [1, 4, 7, 10].includes(arudhaSignIdx);
    const isMovableArudha = [0, 3, 6, 9].includes(arudhaSignIdx);
    const isInsidePremises = isFixedArudha || [1, 4, 7, 10].includes(karyaLordObj.d1Sign);

    let roomType = '';
    let heightLevel = '';
    if (arudhaSignIdx % 4 === 0) {
      roomType = 'వంటగది, పూజా మందిరం, హీటర్ లేదా విద్యుత్/ఎలక్ట్రానిక్ ఉపకరణాల సమీపంలో';
    } else if (arudhaSignIdx % 4 === 1) {
      roomType = 'భూమికి సమీపంలో, మంచం కింద, బట్టల అల్మారా, డ్రాయరు లేదా తివాచీ కింద';
    } else if (arudhaSignIdx % 4 === 2) {
      roomType = 'ఎత్తైన పుస్తకాల అర, కిటికీ సమీపంలో, టేబుల్ డెస్క్ లేదా ప్రయాణ సంచిలో';
    } else {
      roomType = 'స్నానశాల (బాత్‌రూమ్), సింక్ సమీపంలో, నీటి ఫిల్టర్ లేదా తేమ ఉన్న ప్రాంతం';
    }

    if ([1, 2, 3, 4].includes(karyeshaHouseFromArudha)) {
      heightLevel = 'నేలమట్టం లేదా దిగువ అరల్లో (Floor / Lower Shelf)';
    } else if ([5, 6, 7, 8].includes(karyeshaHouseFromArudha)) {
      heightLevel = 'మధ్యమ ఎత్తు — టేబుల్, కుర్చీ లేదా మడతల్లో (Waist / Table Level)';
    } else {
      heightLevel = 'ఎత్తైన స్థానంలో — కప్‌బోర్డ్ పైభాగం లేదా హ్యాంగర్ (High / Eye Level)';
    }

    // Time-Bound Prediction Calculation based on Ghatikas and Moon Gati
    const targetHours = Math.max(3, Math.round((100 - score) * 0.48));
    const targetDateObj = new Date(queryDate.getTime() + targetHours * 3600 * 1000);
    const targetHoursFormatted = targetDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const targetDateFormatted = `${targetDateObj.toLocaleDateString([], { month: 'short', day: 'numeric' })} (${targetHoursFormatted})`;

    const timeBoundTargetDateTe =
      score >= 75
        ? `సుమారు ${targetHours} నుండి 12 గంటల లోపు (అనగా ${targetDateFormatted} లోపు) తప్పక లభించును.`
        : score >= 50
        ? `రాబోయే 24 నుండి 48 గంటల్లో (${targetDateFormatted} వరకు) గృహంలోనే కంటబడును.`
        : `సుమారు 3 నుండి 7 రోజుల వ్యవధి పట్టవచ్చు; సూచించిన దిశలో తీవ్రంగా వెతకాలి.`;

    const itemCondition =
      shubhaPlanetsInArudhaKendra.length > 0 || karyaLordObj.dignity === 'Exalted' || karyaLordObj.dignity === 'Own Sign'
        ? 'వస్తువు సంపూర్ణ సురక్షితంగా, ఎటువంటి నష్టం లేకుండా భద్రంగా ఉన్నది.'
        : 'వస్తువు సురక్షితంగానే ఉంది, కానీ కొద్దిపాటి దుమ్ము లేదా మరకలు పడి ఉండవచ్చు.';

    const retrievalGuide = `1. మీ గృహ కేంద్రం నుండి సరిగ్గా ${arudhaDirInfo.dirTe} (${arudhaDirInfo.deg}°) కోణంలో ఉన్న ${roomType} పరిశీలించండి.\n2. ${heightLevel} పరిశీలించండి.\n3. శ్రీ కార్తవీర్యార్జున మంత్రాన్ని 21 సార్లు జపించి, మానసిక ప్రశాంతతతో వెతకండి.`;

    lostItemDetail = {
      isFoundVerdictTe: verdictTitleTe,
      probabilityPercent: score,
      directionTe: arudhaDirInfo.dirTe,
      directionAngleDeg: arudhaDirInfo.deg,
      placeDescriptionTe: roomType,
      environmentTypeTe: `${arudhaElem} (${isInsidePremises ? 'ఇంట్లోనే ఉంది' : 'బయటి ప్రదేశంలో/వాహనంలో'})`,
      causeOfLossTe: isInsidePremises ? 'ఏమరుపాటు / స్థలం మర్చిపోవుట' : 'బయటకు తీసుకువెళ్లినప్పుడు జారవిడుచుట',
      culpritDescriptionTe: isInsidePremises
        ? 'ఎవరూ దొంగిలించలేదు; కుటుంబ సభ్యుల చేతి తగిలి స్థానం మారింది.'
        : 'ఇతరుల కంటపడినప్పటికీ ఆరూఢ గురు దృష్టి వల్ల పునః లభించే అవకాశం మెండుగా ఉంది.',
      recoveryTimingTe: timeBoundTargetDateTe,
      recoveryHoursOrDaysNumber: targetHours,
      practicalSearchGuideTe: retrievalGuide,
      arudhaDirectionTe: arudhaDirInfo.dirTe,
      arudhaCompassDegree: arudhaDirInfo.deg,
      arudhaRoomTypeTe: roomType,
      arudhaHeightLevelTe: heightLevel,
      itemConditionTe: itemCondition,
      isInsidePremises,
      timeBoundTargetDateTe,
      retrievalActionGuideTe: retrievalGuide,
      shastraClueTe: `ప్రశ్న మార్గ శ్లోకం: "ఆరూఢ రాశి వశతో వస్తు స్థితిః విచార్యతే" — ఆరూఢ రాశి తత్త్వం మరియు దిశ ఆధారంగా నష్టద్రవ్యం లభ్యమగును.`,
      targetRecoveryDateStr: timeBoundTargetDateTe,
      targetRecoveryHours: targetHours,
      retrievalGuideTe: retrievalGuide,
    };
  }

  // -------------------------------------------------------------------------
  // GENERATE WORK DELAY SPECIFIC DIAGNOSTICS (కార్య విలంబన & సిద్ధి కాల నిర్ధారణ)
  // -------------------------------------------------------------------------
  let workDelayDetail: WorkDelayDiagnosis | undefined;
  if (categoryKey === 'work_delay' || categoryKey === 'job_career' || categoryKey === 'general_wish') {
    let causeOfDelay = '';
    let obCategory = '';
    const delaySteps: string[] = [];

    // Labharudha (11th from Arudha)
    const labharudhaSignIdx = (arudhaSignIdx + 10) % 12;
    const labhaLordId = ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'][labharudhaSignIdx];
    const labhaLordNameTe = TELUGU_PLANETS[labhaLordId]?.nameTe.split(' ')[0] ?? labhaLordId;

    if (badhakaLordObj.house === 10 || badhakaLordObj.house === 11) {
      obCategory = 'అధికార యంత్రాంగం / దస్త్రాల ఆమోదంలో నిబంధనల జాప్యం';
      causeOfDelay = 'అధికారుల బదిలీలు, పత్రాల ధృవీకరణలో అదనపు వివరణలు కోరడం లేదా సర్వర్/సాంకేతిక సమస్యలు ఆలస్యానికి మూల కారణం.';
      delaySteps.push('అధికారులను నేరుగా లేదా సీనియర్ వ్యక్తుల సిఫార్సుతో కలవండి.');
      delaySteps.push('పత్రాలలోని సాంకేతిక వివరాలను సరిచూసుకోండి.');
    } else if (karyaLordObj.isRetrograde || lagnaLordObj.isRetrograde) {
      obCategory = 'గత విషయాల పునఃసమీక్ష / స్వయం అలసత్వం';
      causeOfDelay = 'గతంలో వదిలేసిన చిన్న అంశాన్ని మళ్లీ పూర్తి చేయాల్సి రావడం లేదా అవతలి వారి స్పందన ఆలస్యమవడం.';
      delaySteps.push('గతంలో ఇచ్చిన హామీలను లేదా పంపిన దరఖాస్తును రీ-ఫాలోఅప్ చేయండి.');
      delaySteps.push('రోజువారీ పురోగతిని సమీక్షించండి.');
    } else if (badhakaLordObj.house === 6 || badhakaLordObj.house === 8) {
      obCategory = 'తెరవెనుక అసూయ / శత్రువుల ప్రతికూల ప్రచారం';
      causeOfDelay = 'మీ పురోగతిని అడ్డుకోవడానికి ఇతరులు పరోక్షంగా సృష్టిస్తున్న అడ్డంకులు.';
      delaySteps.push('కార్య వివరాలను రహస్యంగా ఉంచండి; పనులు పూర్తయ్యేంతవరకు ఎవరికీ వెల్లడించవద్దు.');
      delaySteps.push('ఆంజనేయ స్వామికి ఆకుపూజ లేదా సిందూర ధారణ చేయించండి.');
    } else {
      obCategory = 'గ్రహ గోచార సంధి కాలం (సమయ పరిపక్వత కావాలి)';
      causeOfDelay = 'కాలం ఇంకా పూర్తి అనుకూలతను సంతరించుకోలేదు; రాబోయే శుక్ల పక్షం నాటికి గ్రహాలు అనుకూలిస్తాయి.';
      delaySteps.push('ఓపికతో వేచి ఉండండి; తొందరపాటు నిర్ణయాలు వద్దు.');
      delaySteps.push('సంకల్ప పూర్వక గణపతి అధర్వశీర్ష జపం ఆచరించండి.');
    }

    // Time-Bound Completion Target Date
    const daysToFruition = Math.max(3, Math.round((100 - score) * 0.38));
    const fruitionDateObj = new Date(queryDate.getTime() + daysToFruition * 86400 * 1000);
    const fruitionFormattedDate = fruitionDateObj.toLocaleDateString([], {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    const timeBoundCompletionDateTe =
      score >= 75
        ? `సుమారు ${daysToFruition} నుండి 5 రోజులలో (అనగా ${fruitionFormattedDate} నాటికి) కార్యం విజయవంతంగా పూర్తవుతుంది.`
        : score >= 50
        ? `సుమారు 10 నుండి 18 రోజులలో (${fruitionFormattedDate} నాటికి) అనుకూల ఉత్తర్వు లేదా శుభవార్త అందుతుంది.`
        : `సుమారు 3 నుండి 6 వారాల సమయం పట్టవచ్చు; పట్టువిడవక ఫాలో-అప్ చేయవలెను.`;

    let unblockingPerson = 'అనుభవజ్ఞుడైన పెద్దమనిషి లేదా గురుతుల్య వ్యక్తి';
    if (['Sun', 'Jupiter'].includes(karyaLordId)) {
      unblockingPerson = 'ప్రభుత్వ ఉన్నతాధికారి లేదా సంస్థ అధిపతి';
    } else if (['Mercury', 'Venus'].includes(karyaLordId)) {
      unblockingPerson = 'సన్నిహిత మిత్రుడు, లాయర్ లేదా మధ్యవర్తి';
    } else if (karyaLordId === 'Mars') {
      unblockingPerson = 'మీ స్వంత చొరవ మరియు కార్యదక్షత';
    }

    workDelayDetail = {
      willWorkSucceedVerdictTe: verdictTitleTe,
      successProbabilityPercent: score,
      primaryCauseOfDelayTe: causeOfDelay,
      obstructionCategoryTe: obCategory,
      expectedFruitionTimeTe: timeBoundCompletionDateTe,
      actionableRemedialStepsTe: delaySteps,
      arudhaFruitionAlignmentTe: `ఆరూఢ లగ్నానికి లాభస్థానాధిపతి (${labhaLordNameTe}) అనుకూలత వల్ల ఆలస్యమైనప్పటికీ అంతిమ విజయం మీకే దక్కుతుంది.`,
      labharudhaLordStatusTe: `లాభారూఢాధిపతి: ${labhaLordNameTe} (కార్య ఫలప్రదాత)`,
      timeBoundCompletionDateTe,
      keyUnblockingPersonTe: unblockingPerson,
      delayRemedySankalpamTe: 'రోజూ ఉదయం సూర్య నమస్కారాలు చేసి, సంకల్ప సహిత మహాగణపతి అష్టకం పఠించండి.',
      classicalTajikaSignalTe: `తాజిక నీలకంఠి: "${tajika.nameTe}" యోగం ప్రకారం కార్యం సిద్ధించే దిశగా ఉంది.`,
      delayResolutionTargetDateStr: timeBoundCompletionDateTe,
      favorableTimeSlotTe: 'గురు లేదా శుక్ర శుభ హోర / చౌఘడియా',
      keyPersonImpactTe: unblockingPerson,
    };
  }

  // Classical Authority Quote
  const classicalShloka = {
    sourceGranthaTe: 'ప్రశ్న మార్గం (Prashna Marga) & దైవజ్ఞ వల్లభ',
    sanskritShloka: 'ఆరూఢలగ్నే శుభదృష్టయుక్తే కార్యం సమగ్రం సులభేన సిధ్యేత్ | లగ్నేశ కేంద్రాధిపయోః ప్రసాదాత్ లభేత నష్టం విలయంచ యాతి ||',
    teluguMeaning: 'ఆరూఢ లగ్నంపై శుభగ్రహ దృష్టి ఉన్నప్పుడు మరియు లగ్నాధిపతి-కార్యాధిపతులు కేంద్ర-త్రికోణాలలో ఉన్నప్పుడు పోయిన వస్తువు లభించును, ఆటంకాలు సమసి కార్యం సంపూర్ణంగా సిద్ధిస్తుంది.',
  };

  // Sacred Vedic Remedies
  const vedicRemedies = {
    primaryMantraTitleTe:
      categoryKey === 'lost_item'
        ? 'శ్రీ కార్తవీర్యార్జున నష్టద్రవ్య పునఃప్రాప్తి మహా మంత్రం'
        : 'శ్రీ సంకల్ప కార్యసిద్ధి మహా గణపతి మూల మంత్రం',
    sanskritMantra:
      categoryKey === 'lost_item'
        ? 'ఓం కార్తవీర్యార్జునో నామ రాజా బాహు సహస్రవాన్ | తస్య స్మరణ మాత్రేణ గతం నష్టం చ లభ్యతే ||'
        : 'ఓం శ్రీం హ్రీం క్లీం గ్లౌం గం గణపతయే వరవరద సర్వజనం మే వశమానయ స్వాహా ||',
    mantraJapaCountTe: 'ఉదయం పూజా గదిలో నేతి దీపం వెలిగించి 21 సార్లు లేదా 108 సార్లు జపించవలెను.',
    danamsTe: 'ఆవుకు అరటిపండ్లు, బెల్లం-నువ్వులు లేదా పచ్చిగడ్డి సమర్పించడం వలన దోషాలు తొలగి ఆటంకాలు నివారించబడతాయి.',
    kshetraDarshanamTe: 'సమీపంలోని శ్రీ మహాగణపతి లేదా ఆంజనేయ స్వామి ఆలయ దర్శనం శ్రేయస్కరం.',
    specialProcedureTe: 'ప్రశ్నా సమయం నుండి సంకల్ప పూర్వకంగా సానుకూల ధోరణితో ప్రయత్నిస్తే ఆరూఢ బలంతో సత్వర ఫలితం చేకూరుతుంది.',
  };

  return {
    timestampIso: queryDate.toISOString(),
    formattedQueryDateTimeTe: `${dateStr} సమయం: ${timeStr} (IST)`,
    category,
    querentQuestionText: questionText.trim() || category.defaultQuestionTe,
    kpPrashnaNumber,
    ashtamangalaNumber,

    prashnaLagna: {
      signIndex: lagnaSignIdx,
      signNameTe: lagnaRasi.nameTe.split(' ')[0],
      signNameEn: lagnaRasi.nameEn,
      degreeDMS: ascHouse.formattedDMS ?? `${Math.floor(ascHouse.siderealLon % 30)}° ${Math.floor(((ascHouse.siderealLon % 30) % 1) * 60)}'`,
      lordId: lagnaLordId,
      lordNameTe: lagnaLordNameTe,
      lordHouse: lagnaLordObj.house,
      lordDignityTe: lagnaLordObj.dignity,
      modalityTe,
    },

    prashnaChandra: {
      signIndex: moonSignIdx,
      signNameTe: moonRasi.nameTe.split(' ')[0],
      degreeDMS: `${Math.floor(moonObj.siderealLon % 30)}° ${Math.floor(((moonObj.siderealLon % 30) % 1) * 60)}'`,
      house: moonObj.house,
      nakshatraNameTe: moonNakNameTe,
      pada: Math.floor((moonObj.siderealLon % (360 / 27)) / (360 / 108)) + 1,
      chandrabalaTe: [1, 4, 5, 9, 10, 11].includes(moonObj.house) ? 'సంపూర్ణ చంద్రబలం (శుభం)' : 'మధ్యమ చంద్రబలం',
      mentalStateTe: 'ప్రశ్నకర్త మనస్సులో ఆందోళన ఉన్నప్పటికీ కార్యాచరణ వైపు తీవ్ర తపన కనిపిస్తోంది.',
    },

    arudhaLagna: arudhaLagnaDiagnosis,

    karyaBhava: {
      houseNumber: karyaBhavaNum,
      signIndex: karyaSignIdx,
      signNameTe: karyaRasi.nameTe.split(' ')[0],
      lordId: karyaLordId,
      lordNameTe: karyaLordNameTe,
      lordHouse: karyaLordObj.house,
      lordDignityTe: karyaLordObj.dignity,
      occupantsTe: occupantsInKarya,
    },

    badhakaDiagnosis: {
      badhakaHouseNumber: badhakaHouse,
      badhakaLordId,
      badhakaLordNameTe,
      badhakaPlacedHouse: badhakaLordObj.house,
      obstructionAnalysisTe: `ఈ లగ్నానికి ${badhakaHouse}వ స్థానమైన ${TELUGU_RASIS[badhakaSignIdx]?.nameTe.split(' ')[0]} బాధక స్థానం. బాధకాధిపతి ${badhakaLordNameTe} ${badhakaLordObj.house}వ ఇంట ఉన్నందున ఆటంకాలను సులువుగా పరిష్కరించవచ్చు.`,
    },

    tajikaYoga: tajika,
    verdictBadge,
    verdictTitleTe,
    verdictSummaryTe,
    confidenceScorePercent: score,

    lostItemDetail,
    workDelayDetail,
    classicalShloka,
    vedicRemedies,
    chartResult: chart,
  };
}

/**
 * Evaluates Tajika Aspect & Yoga (Ithasala, Ishrafa, Nakta, Yamaya, Kamboola)
 */
function calculateTajikaYogaBetween(
  p1: PlanetPosition,
  p2: PlanetPosition,
  moon: PlanetPosition
): TajikaYogaDiagnosis {
  const p1Speed = PLANETARY_SPEED_ORDER[p1.id] ?? 0.5;
  const p2Speed = PLANETARY_SPEED_ORDER[p2.id] ?? 0.5;

  const faster = p1Speed >= p2Speed ? p1 : p2;
  const slower = p1Speed >= p2Speed ? p2 : p1;

  const fasterNameTe = TELUGU_PLANETS[faster.id]?.nameTe.split(' ')[0] ?? faster.name;
  const slowerNameTe = TELUGU_PLANETS[slower.id]?.nameTe.split(' ')[0] ?? slower.name;

  const angle = norm360(Math.abs(faster.siderealLon - slower.siderealLon));
  const diffAngle = Math.min(angle, 360 - angle);

  const orbLimit = ((TAJIKA_DEEPSHAMSA[faster.id] ?? 8) + (TAJIKA_DEEPSHAMSA[slower.id] ?? 8)) / 2;

  // Major Tajika Aspects: Conjunction (0°), Sextile (60°), Square (90°), Trine (120°), Opposition (180°)
  const aspectTargets = [0, 60, 90, 120, 180];
  let matchedTarget: number | null = null;
  let aspectDeviation = 999;

  for (const t of aspectTargets) {
    const dev = Math.abs(diffAngle - t);
    if (dev <= orbLimit) {
      matchedTarget = t;
      aspectDeviation = dev;
      break;
    }
  }

  // Check applying vs separating
  const isApplying = faster.siderealLon < slower.siderealLon && !faster.isRetrograde;

  if (matchedTarget !== null && isApplying) {
    // If Moon also joins
    const moonAngle = Math.min(
      norm360(Math.abs(moon.siderealLon - slower.siderealLon)),
      360 - norm360(Math.abs(moon.siderealLon - slower.siderealLon))
    );
    if (moonAngle <= 12) {
      return {
        yogaType: 'kamboola',
        nameTe: 'కంబూల యోగం (Kamboola Yoga — అత్యున్నత శుభ యోగం ★★★)',
        verdictTe: 'సంపూర్ణ కార్య సిద్ధి / వస్తువు నిస్సందేహంగా చేతికందును',
        isFavorable: true,
        fasterPlanetTe: fasterNameTe,
        slowerPlanetTe: slowerNameTe,
        aspectDegrees: Number(diffAngle.toFixed(1)),
        orbDegrees: Number(orbLimit.toFixed(1)),
        explanationTe: `లగ్నేశుడు ${fasterNameTe} మరియు కార్యాధిపతి ${slowerNameTe} మధ్య ఇత్థశాల యోగంతో పాటు చంద్రుడు పూర్ణ బలంతో కంబూల యోగాన్ని నిర్మిస్తున్నాడు. ఇది కోరిన ఫలితాన్ని శీఘ్రంగా చేకూరుస్తుంది.`,
      };
    }

    return {
      yogaType: 'ithasala',
      nameTe: 'ఇత్థశాల యోగం (Ithasala Yoga — ప్రత్యక్ష కార్య సిద్ధి ★)',
      verdictTe: 'కార్య సిద్ధి వేగంగా జరుగుతుంది',
      isFavorable: true,
      fasterPlanetTe: fasterNameTe,
      slowerPlanetTe: slowerNameTe,
      aspectDegrees: Number(diffAngle.toFixed(1)),
      orbDegrees: Number(orbLimit.toFixed(1)),
      explanationTe: `శీఘ్ర గ్రహమైన ${fasterNameTe} మంద గ్రహమైన ${slowerNameTe} తో కలయిక/దృష్టి వైపు కదులుతోంది (${aspectDeviation.toFixed(1)}° లోపు ఉంది). ఇది పని త్వరితగతిన సానుకూలమవడాన్ని స్పష్టం చేస్తోంది.`,
    };
  }

  if (matchedTarget !== null && !isApplying) {
    return {
      yogaType: 'ishrafa',
      nameTe: 'ఈశ్రాఫ / ముసరిఫ యోగం (Ishrafa Yoga — ఆలస్యం & తప్పిపోయిన సమయం)',
      verdictTe: 'విలంబం / స్వల్ప ఆటంకం ఏర్పడును',
      isFavorable: false,
      fasterPlanetTe: fasterNameTe,
      slowerPlanetTe: slowerNameTe,
      aspectDegrees: Number(diffAngle.toFixed(1)),
      orbDegrees: Number(orbLimit.toFixed(1)),
      explanationTe: `గ్రహాలు దృష్టి సంబంధం నుండి విడిపోతున్నాయి (Separating aspect). అందువల్ల పాత తప్పుల వల్ల లేదా మునుపటి అలసత్వం వల్ల పనులలో జాప్యం సంభవిస్తోంది. పునఃప్రయత్నం అవసరం.`,
    };
  }

  // Check Nakta Yoga (Moon mediates between Lagnesha & Karyesha)
  const moonToP1 = Math.abs(norm360(moon.siderealLon - p1.siderealLon));
  const moonToP2 = Math.abs(norm360(moon.siderealLon - p2.siderealLon));
  if (moonToP1 <= 12 || moonToP2 <= 12) {
    return {
      yogaType: 'nakta',
      nameTe: 'నక్త యోగం (Nakta Yoga — మధ్యవర్తి లేదా స్నేహితుని ద్వారా జయం)',
      verdictTe: 'ఇతరుల సహాయంతో కార్య సిద్ధి / వస్తువు లభించును',
      isFavorable: true,
      fasterPlanetTe: 'చంద్రుడు',
      slowerPlanetTe: slowerNameTe,
      aspectDegrees: Number(diffAngle.toFixed(1)),
      orbDegrees: Number(orbLimit.toFixed(1)),
      explanationTe: `లగ్నేశ, కార్యాధిపతులకు ప్రత్యక్ష దృష్టి లేకపోయినా, చంద్రుడు వారిద్దరి మధ్య కాంతిని బదిలీ చేస్తున్నాడు (Transfer of Light). కాబట్టి మూడవ వ్యక్తి లేదా స్నేహితుని జోక్యంతో పని పూర్తవుతుంది.`,
    };
  }

  return {
    yogaType: 'none',
    nameTe: 'స్వతంత్ర భావ స్థితి (Neutral Aspect)',
    verdictTe: 'భావ బలాల ఆధారంగా ఫలితం నిర్ణయించబడును',
    isFavorable: true,
    fasterPlanetTe: fasterNameTe,
    slowerPlanetTe: slowerNameTe,
    aspectDegrees: Number(diffAngle.toFixed(1)),
    orbDegrees: Number(orbLimit.toFixed(1)),
    explanationTe: `లగ్నేశ, కార్యాధిపతుల మధ్య ప్రత్యక్ష తాజిక బంధం లేనప్పటికీ, భావ స్థితులు మరియు శుభ గ్రహాల వీక్షణల ఆధారంగా కార్యసిద్ధి నిర్ణయించబడింది.`,
  };
}
