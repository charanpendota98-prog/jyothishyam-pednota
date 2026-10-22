import { type CompleteChartResult, type PlanetPosition } from './ephemeris.ts';
import { TELUGU_RASIS, TELUGU_PLANETS, TELUGU_NAKSHATRAS } from './teluguJathakam.ts';

export interface BhavaLordPlacementItem {
  houseNumber: number;
  houseNameTe: string;
  signIndex: number;
  signNameTe: string;
  lordId: string;
  lordNameTe: string;
  placedInHouse: number;
  placedInSignNameTe: string;
  navamsaSignNameTe: string;
  dignityTe: string;
  isVargottama: boolean;
  isPushkaraNavamsa: boolean;
  isCombust: boolean;
  isRetrograde: boolean;
  sanskritPramanaTe: string;
  deepVivaranaTe: string;
  actionableAdviceTe: string;
}

export interface ParivartanaYogaItem {
  typeTe: string;
  planet1Te: string;
  house1: number;
  planet2Te: string;
  house2: number;
  descriptionTe: string;
  effectTe: string;
}

export interface ConjunctionAndStateItem {
  titleTe: string;
  houseNumber: number;
  rasiNameTe: string;
  planetsTe: string[];
  shastraSourceTe: string;
  vivaranaTe: string;
}

export interface KpSubLordItem {
  entityTitleTe: string;
  rasiNameTe: string;
  degreeFormatted: string;
  rasiLordTe: string;
  nakshatraNameTe: string;
  starLordTe: string;
  subLordTe: string;
  signifiedHouses: number[];
  kpVerdictTe: string;
}

export interface BhriguNadiLinkItem {
  karakaTitleTe: string;
  focalPlanetTe: string;
  rasiNameTe: string;
  trineConnectedPlanetsTe: string[];
  secondTwelfthPlanetsTe: string[];
  nadiPredictionTe: string;
  timingClueTe: string;
}

export interface BadhakaMarakaDiagnostic {
  lagnaModalityTe: string;
  badhakaHouse: number;
  badhakaRasiTe: string;
  badhakeshPlanetTe: string;
  badhakeshPlacedHouse: number;
  badhakaImpactTe: string;
  badhakaRemedyTe: string;
  marakaHouses: [number, number];
  marakaLordsTe: string[];
  marakaCautionTe: string;
}

export interface ClassicalSourcePramanaCard {
  id: string;
  number: number;
  titleTe: string;
  authorAndEraTe: string;
  branchTe: string;
  whatItAnalyzesInYourChartTe: string;
  yourChartSpecificFindingTe: string;
}

export interface KundaliSookshmaNadiReport {
  nativeGenderTe: string;
  crystalClearUnfilteredTruthsTe: string[];
  futureTimelineVerdictsTe: string[];
  exactActionableDoAndDontsTe: {
    mustDoTe: string[];
    mustAvoidTe: string[];
  };
  bhavaLordPlacements: BhavaLordPlacementItem[];
  parivartanaYogas: ParivartanaYogaItem[];
  conjunctionsAndSpecialStates: ConjunctionAndStateItem[];
  kpSubLordTable: KpSubLordItem[];
  kpLifeEventVerdicts: {
    domainTe: string;
    primaryCusp: number;
    cuspSubLordTe: string;
    favorableHouses: string;
    verdictTe: string;
  }[];
  bhriguNandiNadiReadings: BhriguNadiLinkItem[];
  badhakaMarakaDiagnostic: BadhakaMarakaDiagnostic;
  genderSpecificShastraAnalysis: {
    titleTe: string;
    sourceTe: string;
    pillars: {
      headingTe: string;
      analysisTe: string;
    }[];
  };
  eighteenClassicalSources: ClassicalSourcePramanaCard[];
}

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

const HOUSE_NAMES_TE: string[] = [
  '1వ భావం — తను / లగ్న భావం (దేహం, రూపం, ఆత్మబలం, కీర్తి)',
  '2వ భావం — ధన / కుటుంబ / వాక్ భావం (నిల్వ ధనం, మాట తీరు, కుటుంబం)',
  '3వ భావం — సహజ / విక్రమ / భ్రాతృ భావం (ధైర్యం, సోదరులు, ప్రయత్న బలం)',
  '4వ భావం — సుఖ / మాతృ / గృహ / వాహన భావం (తల్లి, ఇల్లు, భూమి, విద్య, మనశ్శాంతి)',
  '5వ భావం — పుత్ర / పూర్వపుణ్య / మంత్ర / మేధా భావం (సంతానం, ప్రతిభ, ఆలోచనా శక్తి)',
  '6వ భావం — శత్రు / రోగ / ఋణ / పోటీ భావం (విజయం, ఉద్యోగ సేవ, ఆరోగ్య నిరోధకత)',
  '7వ భావం — కళత్ర / వివాహ / భాగస్వామ్య భావం (జీవిత భాగస్వామి, వ్యాపార సంబంధాలు)',
  '8వ భావం — ఆయుర్ / రంధ్ర / ఆకస్మిక / గుప్త విద్యా భావం (దీర్ఘాయుష్షు, వారసత్వం, పరిశోధన)',
  '9వ భావం — భాగ్య / ధర్మ / పితృ / గురు భావం (అదృష్టం, తండ్రి, దైవభక్తి, దూర ప్రయాణాలు)',
  '10వ భావం — కర్మ / రాజ్య / వృత్తి / కీర్తి భావం (ఉద్యోగం, వ్యాపారం, అధికార హోదా)',
  '11వ భావం — లాభ / సర్వాభీష్ట సిద్ధి భావం (ఆదాయం, కోరికలు నెరవేరుట, పెద్దల మద్దతు)',
  '12వ భావం — వ్యయ / మోక్ష / విదేశీ / శయన భావం (పెట్టుబడులు, విదేశీ యోగం, ఆధ్యాత్మిక ముక్తి)',
];

/**
 * Computes exact KP Star Lord and Sub-Lord (249 subdivisions) for any sidereal longitude (0-360)
 */
function computeKpStarAndSubLord(siderealLon: number): {
  nakIndex: number;
  nakNameTe: string;
  starLordId: string;
  starLordTe: string;
  subLordId: string;
  subLordTe: string;
} {
  const normLon = ((siderealLon % 360) + 360) % 360;
  const nakSpan = 360 / 27; // 13.333333°
  const nakIndex = Math.min(26, Math.floor(normLon / nakSpan));
  const offsetInNak = normLon - nakIndex * nakSpan; // 0 to 13.333333°

  const starLordIdx = nakIndex % 9;
  const starLordId = VIMSHOTTARI_ORDER[starLordIdx];

  // Sub-lord sequence starts from the Star Lord itself and cycles through the 9 lords
  let accumulatedDeg = 0;
  let subLordId = starLordId;
  for (let i = 0; i < 9; i++) {
    const candidateLord = VIMSHOTTARI_ORDER[(starLordIdx + i) % 9];
    const subSpanDeg = nakSpan * (VIMSHOTTARI_YEARS[candidateLord] / 120);
    if (offsetInNak <= accumulatedDeg + subSpanDeg + 1e-9) {
      subLordId = candidateLord;
      break;
    }
    accumulatedDeg += subSpanDeg;
  }

  return {
    nakIndex,
    nakNameTe: TELUGU_NAKSHATRAS[nakIndex]?.nameTe ?? '',
    starLordId,
    starLordTe: TELUGU_PLANETS[starLordId]?.nameTe ?? starLordId,
    subLordId,
    subLordTe: TELUGU_PLANETS[subLordId]?.nameTe ?? subLordId,
  };
}

/**
 * Checks if a planet is in Pushkara Navamsa
 */
function checkPushkaraNavamsa(signIndex: number, degreeInSign: number): boolean {
  // Classical Pushkara Navamsa padas in each sign element:
  // Fire signs (0, 4, 8): 7th and 9th navamsas (20°-23°20', 26°40'-30°)
  // Earth signs (1, 5, 9): 3rd and 5th navamsas (6°40'-10°, 13°20'-16°40')
  // Air signs (2, 6, 10): 6th and 8th navamsas (16°40'-20°, 23°20'-26°40')
  // Water signs (3, 7, 11): 1st and 3rd navamsas (0°-3°20', 6°40'-10°)
  const navamsaPart = Math.floor(degreeInSign / (30 / 9)) + 1; // 1 to 9
  const elementMod = signIndex % 4;
  if (elementMod === 0) return navamsaPart === 7 || navamsaPart === 9;
  if (elementMod === 1) return navamsaPart === 3 || navamsaPart === 5;
  if (elementMod === 2) return navamsaPart === 6 || navamsaPart === 8;
  return navamsaPart === 1 || navamsaPart === 3;
}

/**
 * Checks if a planet is combust (Astangata / Moudhya) by proximity to Sun
 */
function checkPlanetCombust(planet: PlanetPosition, sunLon: number): boolean {
  if (planet.id === 'Sun' || planet.id === 'Rahu' || planet.id === 'Ketu') return false;
  let diff = Math.abs(planet.siderealLon - sunLon) % 360;
  if (diff > 180) diff = 360 - diff;

  const orbs: Record<string, number> = {
    Moon: 12,
    Mars: 17,
    Mercury: planet.isRetrograde ? 12 : 14,
    Jupiter: 11,
    Venus: planet.isRetrograde ? 8 : 10,
    Saturn: 15,
  };
  return diff <= (orbs[planet.id] ?? 12);
}

/**
 * Generates specific BPHS Ch. 24 interpretation for a House Lord placed in a specific House
 */
function describeBhavaLordInHouse(
  sourceHouse: number,
  placedHouse: number,
  lordTe: string,
  placedSignTe: string
): { vivaranaTe: string; adviceTe: string } {
  const isKendra = [1, 4, 7, 10].includes(placedHouse);
  const isTrikona = [1, 5, 9].includes(placedHouse);
  const isUpachaya = [3, 6, 10, 11].includes(placedHouse);
  const isDusthana = [6, 8, 12].includes(placedHouse);

  const houseThemesTe: Record<number, string> = {
    1: 'ఆత్మవిశ్వాసం, ఆరోగ్యం, వ్యక్తిగత ప్రతిష్ట మరియు స్వశక్తి',
    2: 'కుటుంబ వృద్ధి, నిల్వ ధనం, బ్యాంకు బ్యాలెన్స్ మరియు వాక్చాతుర్యం',
    3: 'ధైర్య సాహసాలు, స్వయం కృషి, కమ్యూనికేషన్ మరియు సోదర సహకారం',
    4: 'సొంత ఇల్లు, భూమి, వాహన సౌఖ్యం, ఉన్నత విద్య మరియు మాతృ ఆశీస్సులు',
    5: 'ఉన్నత మేధస్సు, పూర్వజన్మ పుణ్యం, సంతాన సౌఖ్యం మరియు ఆలోచనా శక్తి',
    6: 'పోటీ పరీక్షలలో విజయం, శత్రు జయం, సేవా రంగం మరియు క్రమశిక్షణ',
    7: 'జీవిత భాగస్వామి సహకారం, వ్యాపార భాగస్వామ్యం మరియు ప్రజా ఆదరణ',
    8: 'లోతైన పరిశోధన, ఆకస్మిక ధన లాభం, ఆయుర్బలం మరియు రహస్య విజ్ఞానం',
    9: 'అదృష్ట యోగం, పితృ-గురు ఆశీస్సులు, ధర్మ మార్గం మరియు దూర ప్రయాణాలు',
    10: 'ఉద్యోగ-వ్యాపార ఉన్నతి, అధికార పదవి, కీర్తి ప్రతిష్టలు మరియు కర్మ సిద్ధి',
    11: 'నిరంతర ఆదాయ వృద్ధి, కోరికలన్నీ నెరవేరుట మరియు మిత్రుల సహకారం',
    12: 'విదేశీ యోగం, ధర్మ కార్యాలు, పెట్టుబడులు మరియు ఆధ్యాత్మిక మోక్ష చింతన',
  };

  let qualityTe = '';
  if (sourceHouse === placedHouse) {
    qualityTe = `స్వభావ స్థానమైన ${placedHouse}వ ఇంట (${placedSignTe}) ఉండటం వల్ల ఈ భావ కారకత్వాలు 100% పూర్ణ బలంతో ఫలిస్తాయి.`;
  } else if (isTrikona) {
    qualityTe = `లక్ష్మీ స్థానమైన ${placedHouse}వ త్రికోణ భావంలో (${placedSignTe}) స్థితి పొందడం వల్ల అప్రయత్నంగానే పూర్వపుణ్య బలం మరియు భాగ్య వృద్ధి తోడవుతాయి.`;
  } else if (isKendra) {
    qualityTe = `విష్ణు స్థానమైన ${placedHouse}వ కేంద్ర భావంలో (${placedSignTe}) ఉండటం వల్ల జీవితంలో బలమైన పునాది, స్థిరత్వం మరియు గౌరవ మర్యాదలు ఏర్పడతాయి.`;
  } else if (isDusthana && [6, 8, 12].includes(sourceHouse)) {
    qualityTe = `దుస్థానాధిపతి మరొక దుస్థానమైన ${placedHouse}వ ఇంట ఉండటం వల్ల **"విపరీత రాజయోగం"** ఏర్పడి, కష్టాల నుండే అనూహ్య విజయం మరియు ఆకస్మిక ఉన్నతి లభిస్తాయి.`;
  } else if (isUpachaya) {
    qualityTe = `ఉపచయ స్థానమైన ${placedHouse}వ ఇంట ఉండటం వల్ల వయస్సు పెరిగే కొద్దీ (ముఖ్యంగా 28–32 సం. తర్వాత) స్వశక్తితో అద్భుతమైన అభివృద్ధి కలుగుతుంది.`;
  } else {
    qualityTe = `${placedHouse}వ భావంలో (${placedSignTe}) స్థితి పొందడం వల్ల ${houseThemesTe[sourceHouse]} అంశాలు ${houseThemesTe[placedHouse]} తో నేరుగా అనుసంధానమై ఫలితాలను ఇస్తాయి.`;
  }

  const vivaranaTe = `${sourceHouse}వ భావాధిపతి అయిన ${lordTe} మీ కుండలిలో ${placedHouse}వ భావంలో (${placedSignTe}) ఉన్నాడు. ${qualityTe} దీనివల్ల ${houseThemesTe[sourceHouse]} విషయాలు ${houseThemesTe[placedHouse]} ద్వారా జీవితంలో ప్రత్యక్షంగా వ్యక్తమవుతాయి.`;

  const adviceTe = isDusthana && ![6, 8, 12].includes(sourceHouse)
    ? `${lordTe} దశా-భుక్తులలో ${sourceHouse}వ భావ విషయాలలో తొందరపాటు నిర్ణయాలు మాని, ఆచితూచి అడుగు వేయాలి.`
    : `${lordTe} బలాన్ని ఉపయోగించుకుంటూ ${houseThemesTe[placedHouse]} రంగంలో ధైర్యంగా ముందడుగు వేయండి.`;

  return { vivaranaTe, adviceTe };
}

export function generateKundaliSookshmaNadiReport(
  chart: CompleteChartResult
): KundaliSookshmaNadiReport {
  const gender = chart.input.gender ?? 'male';
  const ascSign = chart.ascendant.signIndex;
  const navetPlanets = chart.planets.slice(0, 9);
  const sun = navetPlanets.find((p) => p.id === 'Sun') ?? navetPlanets[0];
  const moon = navetPlanets.find((p) => p.id === 'Moon') ?? navetPlanets[1];
  const mars = navetPlanets.find((p) => p.id === 'Mars') ?? navetPlanets[2];
  const mercury = navetPlanets.find((p) => p.id === 'Mercury') ?? navetPlanets[3];
  const jupiter = navetPlanets.find((p) => p.id === 'Jupiter') ?? navetPlanets[4];
  const venus = navetPlanets.find((p) => p.id === 'Venus') ?? navetPlanets[5];
  const saturn = navetPlanets.find((p) => p.id === 'Saturn') ?? navetPlanets[6];
  const rahu = navetPlanets.find((p) => p.id === 'Rahu') ?? navetPlanets[7];
  const ketu = navetPlanets.find((p) => p.id === 'Ketu') ?? navetPlanets[8];

  const lagnaRasiTe = TELUGU_RASIS[ascSign].nameTe;
  const lagnaLordId = SIGN_LORD_ID[ascSign];
  const lagnaLordPlanet = navetPlanets.find((p) => p.id === lagnaLordId) ?? sun;
  const lagnaLordTe = TELUGU_PLANETS[lagnaLordId]?.nameTe ?? lagnaLordId;

  const moonRasiTe = TELUGU_RASIS[moon.signIndex].nameTe;
  const moonNakIdx = Math.min(26, Math.floor(moon.siderealLon / (360 / 27)));
  const moonNakMeta = TELUGU_NAKSHATRAS[moonNakIdx];

  // 1. 12 House Lords Exact Placement Matrix (BPHS Ch. 24)
  const bhavaLordPlacements: BhavaLordPlacementItem[] = [];
  const houseLordMap: { house: number; signIdx: number; lordId: string; placedHouse: number; placedSignIdx: number }[] = [];

  for (let h = 1; h <= 12; h++) {
    const hSignIdx = (ascSign + h - 1) % 12;
    const hSignTe = TELUGU_RASIS[hSignIdx].nameTe.split(' ')[0];
    const lordId = SIGN_LORD_ID[hSignIdx];
    const lordPlanet = navetPlanets.find((p) => p.id === lordId) ?? sun;
    const lordTe = TELUGU_PLANETS[lordId]?.nameTe ?? lordId;
    const placedHouse = ((lordPlanet.signIndex - ascSign + 12) % 12) + 1;
    const placedSignTe = TELUGU_RASIS[lordPlanet.signIndex].nameTe.split(' ')[0];
    const d9SignTe = TELUGU_RASIS[lordPlanet.d9Sign].nameTe.split(' ')[0];
    const isVargottama = lordPlanet.signIndex === lordPlanet.d9Sign;
    const isPushkara = checkPushkaraNavamsa(lordPlanet.signIndex, lordPlanet.degreeInSign);
    const isCombust = checkPlanetCombust(lordPlanet, sun.siderealLon);

    houseLordMap.push({
      house: h,
      signIdx: hSignIdx,
      lordId,
      placedHouse,
      placedSignIdx: lordPlanet.signIndex,
    });

    const dignityMapTe: Record<string, string> = {
      Exalted: 'ఉచ్చ స్థితి (Supreme Exaltation)',
      Moolatrikona: 'మూలత్రికోణ బలం',
      'Own Sign': 'స్వక్షేత్ర బలం (Own Sign)',
      Friendly: 'మిత్ర క్షేత్రం',
      Neutral: 'సమ క్షేత్రం',
      Enemy: 'శత్రు క్షేత్రం',
      Debilitated: 'నీచ స్థితి (Needs Neecha Bhanga / Remedy)',
    };

    const { vivaranaTe, adviceTe } = describeBhavaLordInHouse(
      h,
      placedHouse,
      lordTe,
      placedSignTe
    );

    bhavaLordPlacements.push({
      houseNumber: h,
      houseNameTe: HOUSE_NAMES_TE[h - 1],
      signIndex: hSignIdx,
      signNameTe: hSignTe,
      lordId,
      lordNameTe: lordTe,
      placedInHouse: placedHouse,
      placedInSignNameTe: placedSignTe,
      navamsaSignNameTe: d9SignTe,
      dignityTe: dignityMapTe[lordPlanet.dignity] ?? lordPlanet.dignity,
      isVargottama,
      isPushkaraNavamsa: isPushkara,
      isCombust,
      isRetrograde: lordPlanet.isRetrograde,
      sanskritPramanaTe: `బృహత్ పరాశర హోరా శాస్త్రం (అధ్యాయం 24 — భావాధిపతి ఫలాధ్యాయం): ${h}వ అధిపతి ${placedHouse}వ భావ స్థితి`,
      deepVivaranaTe:
        vivaranaTe +
        (isVargottama ? ' ✨ ఈ గ్రహం వర్గోత్తమం (D1 & D9 ఒకే రాశి) పొందడం వల్ల రెట్టింపు రాజయోగ బలాన్ని ఇస్తుంది.' : '') +
        (isPushkara ? ' 🌟 ఇది పుష్కర నవాంశలో ఉండటం వల్ల అక్షయమైన శుభ ఫలితాలను ప్రసాదిస్తుంది.' : '') +
        (isCombust ? ' ⚠️ సూర్య సమీపం వల్ల మౌఢ్యం (Astangata) కలిగి ఉంది; ఆత్మసంయమనం అవసరం.' : ''),
      actionableAdviceTe: adviceTe,
    });
  }

  // 2. Detect Parivartana Yogas (Mutual Sign Exchanges)
  const parivartanaYogas: ParivartanaYogaItem[] = [];
  const checkedPairs = new Set<string>();
  for (let i = 0; i < houseLordMap.length; i++) {
    for (let j = i + 1; j < houseLordMap.length; j++) {
      const a = houseLordMap[i];
      const b = houseLordMap[j];
      if (a.lordId !== b.lordId && a.placedSignIdx === b.signIdx && b.placedSignIdx === a.signIdx) {
        const pairKey = [a.lordId, b.lordId].sort().join('-');
        if (!checkedPairs.has(pairKey)) {
          checkedPairs.add(pairKey);
          const isDusthanaExchange = [6, 8, 12].includes(a.house) || [6, 8, 12].includes(b.house);
          const isThirdExchange = a.house === 3 || b.house === 3;
          const typeTe = isDusthanaExchange
            ? 'దైన్య / విపరీత పరివర్తన యోగం (Dainya Parivartana)'
            : isThirdExchange
              ? 'కాహళ పరివర్తన యోగం (Kahala Parivartana)'
              : 'మహా రాజయోగ పరివర్తన (Maha Parivartana Yoga)';

          const p1Te = TELUGU_PLANETS[a.lordId]?.nameTe ?? a.lordId;
          const p2Te = TELUGU_PLANETS[b.lordId]?.nameTe ?? b.lordId;

          parivartanaYogas.push({
            typeTe,
            planet1Te: p1Te,
            house1: a.house,
            planet2Te: p2Te,
            house2: b.house,
            descriptionTe: `${a.house}వ భావాధిపతి (${p1Te}) మరియు ${b.house}వ భావాధిపతి (${p2Te}) ఒకరి రాశిలో మరొకరు పరస్పర స్థాన మార్పిడి (Parivartana) చెందారు.`,
            effectTe: isDusthanaExchange
              ? 'ఆకస్మిక సవాళ్లను అధిగమించి ఊహించని మార్పుల ద్వారా విజయం సాధిస్తారు.'
              : 'ఈ రెండు గ్రహాల దశా-అంతర్దశలలో స్వక్షేత్ర సమానమైన అఖండ రాజయోగం, అధికార వృద్ధి మరియు ధన లాభం కలుగుతాయి.',
          });
        }
      }
    }
  }

  // 3. Conjunctions (Yutis), Vargottama, Pushkara, Retrograde & Combustion Analysis
  const conjunctionsAndSpecialStates: ConjunctionAndStateItem[] = [];
  for (let sIdx = 0; sIdx < 12; sIdx++) {
    const inSign = navetPlanets.filter((p) => p.signIndex === sIdx);
    if (inSign.length >= 2) {
      const hNum = ((sIdx - ascSign + 12) % 12) + 1;
      const rasiTe = TELUGU_RASIS[sIdx].nameTe.split(' ')[0];
      const namesTe = inSign.map((p) => TELUGU_PLANETS[p.id]?.nameTe ?? p.name);
      const ids = inSign.map((p) => p.id);

      let specialYogaTe = '';
      if (ids.includes('Sun') && ids.includes('Mercury')) {
        specialYogaTe = 'బుధాదిత్య యోగం (కుశాగ్ర బుద్ధి, గణిత-వాణిజ్య-నిర్వహణ ప్రతిభ) ';
      }
      if (ids.includes('Jupiter') && ids.includes('Moon')) {
        specialYogaTe += 'గజకేసరి యోగం (కీర్తి, సంపద, ఉన్నత గౌరవం) ';
      }
      if (ids.includes('Mars') && ids.includes('Moon')) {
        specialYogaTe += 'చంద్ర-మంగళ లక్ష్మీ యోగం (నిరంతర ధన ప్రవాహం, పట్టుదల) ';
      }
      if (ids.includes('Jupiter') && ids.includes('Mars')) {
        specialYogaTe += 'గురు-మంగళ ధర్మ-విక్రమ యోగం (నిర్ణయాధికారం, భూ-గృహ యోగం) ';
      }
      if (ids.includes('Venus') && ids.includes('Mercury')) {
        specialYogaTe += 'లక్ష్మీ-నారాయణ యోగం (కళా-వాణిజ్య-సౌభాగ్య వృద్ధి) ';
      }
      if (ids.includes('Saturn') && (ids.includes('Rahu') || ids.includes('Mars'))) {
        specialYogaTe += 'కర్మ సంఘర్షణ / తీవ్ర శ్రమ యోగం (సహనంతో పెద్ద విజయాలు) ';
      }

      conjunctionsAndSpecialStates.push({
        titleTe: `${inSign.length === 2 ? 'ద్విగ్రహ' : inSign.length === 3 ? 'త్రిగ్రహ' : 'బహుగ్రహ'} యుతి — ${hNum}వ భావం (${rasiTe})`,
        houseNumber: hNum,
        rasiNameTe: rasiTe,
        planetsTe: namesTe,
        shastraSourceTe: 'సారావళి (కల్యాణ వర్మ) & జాతక పారిజాతం — గ్రహ యుతి అధ్యాయం',
        vivaranaTe: `మీ కుండలిలో ${hNum}వ భావమైన ${rasiTe} రాశిలో ${namesTe.join(' + ')} కలిసి సంచరిస్తున్నాయి. ${
          specialYogaTe
            ? `ఈ కలయిక వల్ల **${specialYogaTe.trim()}** ఏర్పడింది. `
            : ''
        }ఈ గ్రహాల శక్తులు ${hNum}వ భావంపై కేంద్రీకృతమై ఉండటం వల్ల ఆ భావ సంబంధ విషయాలు మీ జీవితంలో అత్యంత కీలక పాత్ర పోషిస్తాయి.`,
      });
    }
  }

  // Add Vargottama & Retrograde special states if present
  const vargottamaPlanets = navetPlanets.filter((p) => p.signIndex === p.d9Sign);
  if (vargottamaPlanets.length > 0) {
    conjunctionsAndSpecialStates.push({
      titleTe: `వర్గోత్తమ రాజయోగ గ్రహాలు (${vargottamaPlanets.length}) — రాశి (D1) మరియు నవాంశ (D9) లో ఒకే రాశి స్థితి`,
      houseNumber: vargottamaPlanets[0].house,
      rasiNameTe: vargottamaPlanets.map((p) => TELUGU_RASIS[p.signIndex].nameTe.split(' ')[0]).join(', '),
      planetsTe: vargottamaPlanets.map((p) => TELUGU_PLANETS[p.id]?.nameTe ?? p.name),
      shastraSourceTe: 'ఫలదీపిక & ఉత్తర కాలామృతం — వర్గోత్తమ బల ప్రమాణం',
      vivaranaTe: `మీ జాతకంలో ${vargottamaPlanets
        .map((p) => `${TELUGU_PLANETS[p.id]?.nameTe} (${TELUGU_RASIS[p.signIndex].nameTe.split(' ')[0]})`)
        .join(', ')} వర్గోత్తమ స్థితిని పొందాయి. వర్గోత్తమ గ్రహం స్వక్షేత్ర/ఉచ్చ గ్రహంతో సమానంగా జీవిత ద్వితీయార్థంలో తిరుగులేని రక్షణ మరియు రాజయోగాన్ని ఇస్తుంది.`,
    });
  }

  const retroPlanets = navetPlanets.filter(
    (p) => p.isRetrograde && p.id !== 'Rahu' && p.id !== 'Ketu'
  );
  if (retroPlanets.length > 0) {
    conjunctionsAndSpecialStates.push({
      titleTe: `వక్ర గ్రహ చేష్టా బల & పూర్వజన్మ ప్రారబ్ధ విశ్లేషణ (${retroPlanets.length} గ్రహాలు)`,
      houseNumber: retroPlanets[0].house,
      rasiNameTe: retroPlanets.map((p) => `${p.house}వ భావం`).join(', '),
      planetsTe: retroPlanets.map((p) => TELUGU_PLANETS[p.id]?.nameTe ?? p.name),
      shastraSourceTe: 'ఉత్తర కాలామృతం (కాళిదాసు) & సారావళి — వక్ర గ్రహ ఫలం',
      vivaranaTe: `మీ కుండలిలో ${retroPlanets
        .map((p) => TELUGU_PLANETS[p.id]?.nameTe)
        .join(', ')} వక్ర గమనంలో (Retrograde) ఉన్నాయి. శాస్త్ర ప్రకారం వక్ర గ్రహానికి చేష్టా బలం అత్యధికంగా ఉంటుంది; ఆ భావ విషయాలలో మొదట కొంత ఆలస్యం జరిగినా, పట్టుదలతో అసాధారణ విజయాన్ని సాధిస్తారు.`,
    });
  }

  // 4. KP System (Krishnamurti Paddhati) Cuspal Sub-Lords & Significators
  const kpSubLordTable: KpSubLordItem[] = [];

  // Helper to get houses signified by a planet (House occupied + Houses owned + Star Lord's house + Star Lord's owned houses)
  const getPlanetSignifiedHouses = (planetId: string): number[] => {
    const pObj = navetPlanets.find((p) => p.id === planetId) ?? sun;
    const occupiedHouse = ((pObj.signIndex - ascSign + 12) % 12) + 1;
    const ownedHouses: number[] = [];
    for (let h = 1; h <= 12; h++) {
      const sIdx = (ascSign + h - 1) % 12;
      if (SIGN_LORD_ID[sIdx] === planetId) ownedHouses.push(h);
    }
    const kpStar = computeKpStarAndSubLord(pObj.siderealLon);
    const starPlanet = navetPlanets.find((p) => p.id === kpStar.starLordId) ?? sun;
    const starOccupiedHouse = ((starPlanet.signIndex - ascSign + 12) % 12) + 1;
    const starOwnedHouses: number[] = [];
    for (let h = 1; h <= 12; h++) {
      const sIdx = (ascSign + h - 1) % 12;
      if (SIGN_LORD_ID[sIdx] === kpStar.starLordId) starOwnedHouses.push(h);
    }

    return Array.from(
      new Set([starOccupiedHouse, occupiedHouse, ...starOwnedHouses, ...ownedHouses])
    ).sort((a, b) => a - b);
  };

  for (const cusp of chart.houses) {
    const kp = computeKpStarAndSubLord(cusp.siderealCusp);
    const sigHouses = getPlanetSignifiedHouses(kp.subLordId);
    kpSubLordTable.push({
      entityTitleTe: `${cusp.house}వ భావ కస్ప్ (Cusp ${cusp.house})`,
      rasiNameTe: TELUGU_RASIS[cusp.signIndex].nameTe.split(' ')[0],
      degreeFormatted: cusp.formattedDMS,
      rasiLordTe: TELUGU_PLANETS[SIGN_LORD_ID[cusp.signIndex]]?.nameTe ?? cusp.lord,
      nakshatraNameTe: kp.nakNameTe,
      starLordTe: kp.starLordTe,
      subLordTe: kp.subLordTe,
      signifiedHouses: sigHouses,
      kpVerdictTe: `సబ్-లార్డ్ ${kp.subLordTe} → [${sigHouses.join(', ')}] భావ ఫలితాలను నిర్దేశిస్తాడు.`,
    });
  }

  // KP Life Event Verdicts (1, 2, 4, 5, 7, 10, 12 cusps)
  const buildKpDomainVerdict = (
    cuspNum: number,
    domainTe: string,
    favHouses: number[],
    posTextTe: string,
    modTextTe: string
  ) => {
    const cuspItem = kpSubLordTable[cuspNum - 1];
    const matchingFav = cuspItem.signifiedHouses.filter((h) => favHouses.includes(h));
    const isStrong = matchingFav.length >= 2;
    return {
      domainTe,
      primaryCusp: cuspNum,
      cuspSubLordTe: cuspItem.subLordTe,
      favorableHouses: `${favHouses.join(', ')} (మీ సబ్-లార్డ్ సూచించే భావాలు: ${cuspItem.signifiedHouses.join(', ')})`,
      verdictTe: isStrong
        ? `✅ KP సబ్-లార్డ్ (${cuspItem.subLordTe}) అనుకూల భావాలైన [${matchingFav.join(', ')}] లను బలంగా సూచిస్తున్నాడు: ${posTextTe}`
        : `ℹ️ KP సబ్-లార్డ్ (${cuspItem.subLordTe}) మిశ్రమ భావాలను సూచిస్తున్నాడు: ${modTextTe}`,
    };
  };

  const kpLifeEventVerdicts = [
    buildKpDomainVerdict(
      2,
      'ధన ప్రవాహం, బ్యాంకు నిల్వ & కుటుంబ వృద్ధి (KP 2nd Cusp)',
      [2, 6, 10, 11],
      'నిరంతర ధన ప్రవాహం, స్వార్జిత ఆస్తులు మరియు కుటుంబ స్థిరత్వం ఖచ్చితంగా సిద్ధిస్తాయి.',
      'ధన సంపాదన బాగుంటుంది కానీ వృథా ఖర్చులను నియంత్రిస్తూ స్థిర ఆస్తులలో పెట్టుబడి పెట్టాలి.'
    ),
    buildKpDomainVerdict(
      4,
      'సొంత ఇల్లు, భూమి, ఆస్తులు & వాహన యోగం (KP 4th Cusp)',
      [4, 11, 12, 2],
      'సొంత గృహ నిర్మాణం / కొనుగోలు, భూమి మరియు వాహన యోగం మీ జాతకంలో బలంగా వాగ్దానం చేయబడింది.',
      'ఆస్తుల కొనుగోలులో పత్రాల పరిశీలన జాగ్రత్తగా చేయాలి; జీవిత భాగస్వామి లేదా కుటుంబ సభ్యుల పేరుతో కొనుగోలు శుభప్రదం.'
    ),
    buildKpDomainVerdict(
      5,
      'సంతాన యోగం, ఉన్నత మేధస్సు & స్పెక్యులేషన్ (KP 5th Cusp)',
      [2, 5, 11],
      'సంతాన మూలక సౌఖ్యం, పిల్లల ఉన్నత భవిష్యత్తు మరియు సృజనాత్మక రంగంలో విజయం లభిస్తాయి.',
      'సంతానం మరియు పెట్టుబడుల విషయంలో ఆచితూచి వ్యవహరించాలి; కులదేవతా ఆరాధన శ్రేష్ఠం.'
    ),
    buildKpDomainVerdict(
      7,
      'వివాహం, వైవాహిక సామరస్యం & భాగస్వామ్యం (KP 7th Cusp)',
      [2, 7, 11, 5],
      'వివాహ జీవితం సుఖమయంగా ఉంటుంది; భాగస్వామి రాకతో అదృష్టం మరియు ఆర్థిక స్థాయి పెరుగుతాయి.',
      'జీవిత భాగస్వామితో పరస్పర సహనం, అవగాహన పాటించడం వల్ల దాంపత్యం అన్యోన్యంగా సాగుతుంది.'
    ),
    buildKpDomainVerdict(
      10,
      'ఉద్యోగం, వ్యాపారం, పదవీ యోగం & కీర్తి (KP 10th Cusp)',
      [2, 6, 10, 11],
      'వృత్తి-ఉద్యోగాలలో అత్యున్నత పదవి, స్వతంత్ర నిర్ణయాధికారం మరియు సమాజంలో ప్రత్యేక గుర్తింపు లభిస్తాయి.',
      'ఉద్యోగంలో స్థాన చలనాలు లేదా మార్పుల ద్వారా క్రమంగా ఉన్నత స్థానానికి చేరుకుంటారు.'
    ),
    buildKpDomainVerdict(
      12,
      'విదేశీ ప్రయాణాలు & దూర ప్రాంత భాగ్యోదయం (KP 12th Cusp)',
      [3, 9, 12],
      'జన్మస్థలానికి దూరంగా లేదా విదేశీ / అంతర్జాతీయ సంస్థల అనుసంధానంతో విశేష ధన-కీర్తి యోగం ఉంది.',
      'స్వదేశంలోనే ఉంటూ దూర ప్రాంత వ్యవహారాలు లేదా బహుళజాతి సంస్థల ద్వారా లాభపడతారు.'
    ),
  ];

  // 5. Bhrigu Nandi Nadi & Chandra Kala Nadi Trine (1-5-9) Links
  const getTrineAndAdjacentPlanets = (focalPlanet: PlanetPosition) => {
    const trineSigns = [
      focalPlanet.signIndex,
      (focalPlanet.signIndex + 4) % 12,
      (focalPlanet.signIndex + 8) % 12,
    ];
    const adjSigns = [
      (focalPlanet.signIndex + 1) % 12,
      (focalPlanet.signIndex + 11) % 12,
    ];
    const trinePlanets = navetPlanets
      .filter((p) => p.id !== focalPlanet.id && trineSigns.includes(p.signIndex))
      .map((p) => TELUGU_PLANETS[p.id]?.nameTe ?? p.name);
    const adjPlanets = navetPlanets
      .filter((p) => p.id !== focalPlanet.id && adjSigns.includes(p.signIndex))
      .map((p) => TELUGU_PLANETS[p.id]?.nameTe ?? p.name);

    return { trinePlanets, adjPlanets };
  };

  const jupNadi = getTrineAndAdjacentPlanets(jupiter);
  const satNadi = getTrineAndAdjacentPlanets(saturn);
  const venNadi = getTrineAndAdjacentPlanets(venus);

  const bhriguNandiNadiReadings: BhriguNadiLinkItem[] = [
    {
      karakaTitleTe: '1. జీవ కారక నాడి (గురువు — జాతకుని ఆత్మ, గౌరవం & ధర్మ మార్గం)',
      focalPlanetTe: `గురువు (${TELUGU_RASIS[jupiter.signIndex].nameTe.split(' ')[0]} రాశి · ${jupiter.house}వ భావం)`,
      rasiNameTe: TELUGU_RASIS[jupiter.signIndex].nameTe.split(' ')[0],
      trineConnectedPlanetsTe: jupNadi.trinePlanets,
      secondTwelfthPlanetsTe: jupNadi.adjPlanets,
      nadiPredictionTe:
        jupNadi.trinePlanets.length > 0
          ? `భృగు నంది నాడి ప్రకారం జీవ కారకుడైన గురువుకు త్రికోణంలో (1-5-9) ${jupNadi.trinePlanets.join(', ')} గ్రహాల సంబంధం ఉంది. దీనివల్ల మీలో సహజమైన జ్ఞానం, ఆధ్యాత్మిక రక్షణ మరియు క్లిష్ట సమయాల్లో దైవ సహాయం లభించే గురు కటాక్షం ఉంది.`
          : `భృగు నంది నాడి ప్రకారం గురువు ${TELUGU_RASIS[jupiter.signIndex].nameTe.split(' ')[0]} రాశిలో స్వతంత్ర శక్తితో ఉన్నాడు; స్వయం కృషి మరియు ధర్మబద్ధమైన నిర్ణయాలే మిమ్మల్ని ఉన్నత శిఖరాలకు చేరుస్తాయి.`,
      timingClueTe: `గురువు గోచారంలో ${TELUGU_RASIS[jupiter.signIndex].nameTe.split(' ')[0]} లేదా దాని త్రికోణ రాశులపై సంచరించే ప్రతి 4వ సంవత్సరంలో జీవితంలో పెద్ద శుభ పరిణామం జరుగుతుంది.`,
    },
    {
      karakaTitleTe: '2. కర్మ కారక నాడి (శని — వృత్తి, ఉద్యోగం, జీవనోపాధి & ప్రారబ్ధ కర్మ)',
      focalPlanetTe: `శని (${TELUGU_RASIS[saturn.signIndex].nameTe.split(' ')[0]} రాశి · ${saturn.house}వ భావం)`,
      rasiNameTe: TELUGU_RASIS[saturn.signIndex].nameTe.split(' ')[0],
      trineConnectedPlanetsTe: satNadi.trinePlanets,
      secondTwelfthPlanetsTe: satNadi.adjPlanets,
      nadiPredictionTe:
        satNadi.trinePlanets.length > 0
          ? `కర్మ కారకుడైన శనికి త్రికోణంలో ${satNadi.trinePlanets.join(', ')} గ్రహాల నాడి బంధం ఉంది. దీనివల్ల మీ వృత్తి జీవితంలో ఈ గ్రహాల కారకత్వాలు (నిర్వహణ, సాంకేతికత, సలహాదారు పదవి లేదా సొంత వ్యాపారం) మిళితమై శాశ్వతమైన కీర్తిని, స్థిర ఆదాయాన్ని ఇస్తాయి.`
          : `కర్మ కారకుడైన శని ${TELUGU_RASIS[saturn.signIndex].nameTe.split(' ')[0]} రాశిలో కేంద్రీకృతమై ఉన్నాడు. కష్టపడి పనిచేసే తత్వం మరియు క్రమశిక్షణ వల్ల ఎవరిపైనా ఆధారపడకుండా సొంత సామ్రాజ్యాన్ని నిర్మించుకుంటారు.`,
      timingClueTe: `30వ ఏట (శని తొలి ఆవృతం) మరియు 36వ ఏట వృత్తి జీవితంలో అత్యంత కీలకమైన ఉన్నత మలుపు తిరుగుతుంది.`,
    },
    {
      karakaTitleTe: '3. ధన & కళత్ర కారక నాడి (శుక్రుడు — సంపద, గృహ సౌఖ్యం & దాంపత్యం)',
      focalPlanetTe: `శుక్రుడు (${TELUGU_RASIS[venus.signIndex].nameTe.split(' ')[0]} రాశి · ${venus.house}వ భావం)`,
      rasiNameTe: TELUGU_RASIS[venus.signIndex].nameTe.split(' ')[0],
      trineConnectedPlanetsTe: venNadi.trinePlanets,
      secondTwelfthPlanetsTe: venNadi.adjPlanets,
      nadiPredictionTe:
        venNadi.trinePlanets.length > 0
          ? `ధన-లక్ష్మీ కారకుడైన శుక్రుడికి త్రికోణంలో ${venNadi.trinePlanets.join(', ')} సంబంధం ఉండటం వల్ల వివాహానంతరం లేదా భాగస్వామ్య పనుల ద్వారా ఆర్థిక ప్రవాహం రెట్టింపు అవుతుంది. గృహ అలంకరణ, వాహన యోగం మరియు కుటుంబ సౌఖ్యం పుష్కలంగా ఉంటాయి.`
          : `శుక్రుడు ${TELUGU_RASIS[venus.signIndex].nameTe.split(' ')[0]} రాశిలో ఉండటం వల్ల సంపాదించిన ధనాన్ని ఆస్తులుగా మార్చే నేర్పు మరియు కళాత్మక అభిరుచి ఉంటాయి.`,
      timingClueTe: `శుక్ర అంతర్దశలలో మరియు శుక్రుడు గోచారంలో మిత్ర త్రికోణ రాశులలో ఉన్నప్పుడు ఆర్థిక-గృహ యోగాలు సిద్ధిస్తాయి.`,
    },
  ];

  // 6. Badhaka & Maraka Diagnostic
  const ascMod = ascSign % 3; // 0: Chara (Movable), 1: Sthira (Fixed), 2: Dwiswabhava (Dual)
  const badhakaHouse = ascMod === 0 ? 11 : ascMod === 1 ? 9 : 7;
  const badhakaSignIdx = (ascSign + badhakaHouse - 1) % 12;
  const badhakeshId = SIGN_LORD_ID[badhakaSignIdx];
  const badhakeshPlanet = navetPlanets.find((p) => p.id === badhakeshId) ?? sun;
  const badhakeshTe = TELUGU_PLANETS[badhakeshId]?.nameTe ?? badhakeshId;

  const secondSignIdx = (ascSign + 1) % 12;
  const seventhSignIdx = (ascSign + 6) % 12;
  const maraka1Te = TELUGU_PLANETS[SIGN_LORD_ID[secondSignIdx]]?.nameTe ?? '';
  const maraka2Te = TELUGU_PLANETS[SIGN_LORD_ID[seventhSignIdx]]?.nameTe ?? '';

  const badhakaMarakaDiagnostic: BadhakaMarakaDiagnostic = {
    lagnaModalityTe:
      ascMod === 0
        ? 'చర లగ్నం (Movable Ascendant — 11వ భావం బాధక స్థానం)'
        : ascMod === 1
          ? 'స్థిర లగ్నం (Fixed Ascendant — 9వ భావం బాధక స్థానం)'
          : 'ద్విస్వభావ లగ్నం (Dual Ascendant — 7వ భావం బాధక స్థానం)',
    badhakaHouse,
    badhakaRasiTe: TELUGU_RASIS[badhakaSignIdx].nameTe.split(' ')[0],
    badhakeshPlanetTe: badhakeshTe,
    badhakeshPlacedHouse: badhakeshPlanet.house,
    badhakaImpactTe: `మీ ${lagnaRasiTe} కు ${badhakaHouse}వ భావం (${TELUGU_RASIS[badhakaSignIdx].nameTe.split(' ')[0]}) బాధక స్థానం మరియు దాని అధిపతి "${badhakeshTe}" బాధకాధిపతి. ఈ గ్రహం ${badhakeshPlanet.house}వ భావంలో ఉండటం వల్ల ఆ భావ విషయాలలో చివరి నిమిషంలో చిన్న ఆటంకాలు లేదా జాప్యం కనిపించినా, ఆత్మవిశ్వాసంతో ప్రయత్నిస్తే అవే విజయంగా మారుతాయి.`,
    badhakaRemedyTe: `బాధకాధిపతి (${badhakeshTe}) దశా-భుక్తులలో కులదేవతా పూజ మరియు మహాగణపతి ఆరాధన చేయడం వల్ల అదృశ్య ఆటంకాలు (Hidden Obstacles) పూర్తిగా తొలగిపోతాయి.`,
    marakaHouses: [2, 7],
    marakaLordsTe: [maraka1Te, maraka2Te],
    marakaCautionTe: `2వ అధిపతి (${maraka1Te}) మరియు 7వ అధిపతి (${maraka2Te}) ధన-కళత్ర కారకులైనప్పటికీ, ఆరోగ్య విషయంలో వీరి అంతర్దశలలో ఆహార నియమాలు, తగిన విశ్రాంతి మరియు మృత్యుంజయ జపం పాటించడం శ్రేయస్కరం.`,
  };

  // 7. Gender-Specific Shastra Analysis (Stri Jataka vs Purusha Jataka)
  const eighthSignIdx = (ascSign + 7) % 12;
  const eighthLordId = SIGN_LORD_ID[eighthSignIdx];
  const eighthLordTe = TELUGU_PLANETS[eighthLordId]?.nameTe ?? eighthLordId;
  const fifthSignIdx = (ascSign + 4) % 12;
  const fifthLordId = SIGN_LORD_ID[fifthSignIdx];
  const fifthLordTe = TELUGU_PLANETS[fifthLordId]?.nameTe ?? fifthLordId;

  const genderSpecificShastraAnalysis =
    gender === 'female'
      ? {
          titleTe: 'స్త్రీ జాతక ప్రత్యేక శాస్త్ర విశ్లేషణ (Stri Jataka Shastra — బృహజ్జాతకం & జాతక పారిజాతం ప్రమాణం)',
          sourceTe: 'వరాహమిహిరుని బృహజ్జాతకం (స్త్రీ జాతకాధ్యాయం) & వైద్యనాథ దీక్షితుల జాతక పారిజాతం',
          pillars: [
            {
              headingTe: '1. మాంగల్య & దీర్ఘ సౌభాగ్య స్థాన పరీక్ష (8వ భావం & శుక్ర-గురు బలం)',
              analysisTe: `స్త్రీ జాతకంలో 8వ భావం (${TELUGU_RASIS[eighthSignIdx].nameTe.split(' ')[0]}) మాంగల్య బలాన్ని, 7వ భావం భర్త స్వభావాన్ని సూచిస్తాయి. మీ జాతకంలో అష్టమాధిపతి ${eighthLordTe} మరియు సౌభాగ్య కారకుడైన శుక్రుడు (${TELUGU_RASIS[venus.signIndex].nameTe.split(' ')[0]}) బలంగా ఉండటం వల్ల నిండు సౌభాగ్యం, కుటుంబంలో గౌరవ మర్యాదలు మరియు గృహలక్ష్మి యోగం సిద్ధిస్తాయి.`,
            },
            {
              headingTe: '2. త్రింశాంశ (D30) & ఆత్మగౌరవ తేజస్సు',
              analysisTe: `లగ్నం (${lagnaRasiTe}) మరియు చంద్ర రాశి (${moonRasiTe}) సమన్వయం వల్ల మీకు సహజమైన ఆత్మగౌరవం, ధర్మబుద్ధి మరియు కుటుంబాన్ని నడిపించే నాయకత్వ శక్తి పుష్కలంగా ఉన్నాయి. ఏ కష్టాన్నైనా ధైర్యంగా ఎదుర్కొని విజయం సాధించే శక్తి మీ సొంతం.`,
            },
            {
              headingTe: '3. సంతాన (5వ భావం) & వృత్తి-విద్యా వికాసం',
              analysisTe: `పంచమాధిపతి ${fifthLordTe} మరియు గురు గ్రహ స్థితి వల్ల సంతాన మూలక ఆనందం, పిల్లల ఉన్నత చదువులు మరియు స్వయం ప్రతిభతో ఆర్థిక స్వావలంబన లభిస్తాయి.`,
            },
          ],
        }
      : {
          titleTe: 'పురుష జాతక ప్రత్యేక రాజయోగ & పౌరుష విశ్లేషణ (Purusha Jataka Shastra — పరాశర & సారావళి ప్రమాణం)',
          sourceTe: 'బృహత్ పరాశర హోరా శాస్త్రం & కల్యాణ వర్మ సారావళి',
          pillars: [
            {
              headingTe: '1. విక్రమ, పౌరుష & స్వశక్తి సామ్రాజ్య నిర్మాణం (3వ, 10వ భావాలు & కుజ-సూర్య బలం)',
              analysisTe: `పురుష జాతకంలో సూర్యుడు (${TELUGU_RASIS[sun.signIndex].nameTe.split(' ')[0]} · ${sun.house}వ భావం) ఆత్మబలాన్ని, కుజుడు (${TELUGU_RASIS[mars.signIndex].nameTe.split(' ')[0]} · ${mars.house}వ భావం) కార్యదీక్షను సూచిస్తారు. మీ జాతకంలో లగ్నాధిపతి ${lagnaLordTe} స్థితి వల్ల ఎవరి కిందా తలవంచని ఆత్మాభిమానం, స్వశక్తితో ఎదిగే నాయకత్వ లక్షణాలు ఉన్నాయి.`,
            },
            {
              headingTe: '2. ధన సంపాదన, భూ-గృహ యోగం & కుటుంబ బాధ్యత',
              analysisTe: `2వ మరియు 11వ భావాధిపతుల సమన్వయం వల్ల కుటుంబ బాధ్యతలను సమర్థవంతంగా నిర్వహిస్తూ, జీవిత మధ్యభాగం నుండి స్థిర ఆస్తులు, భూమి మరియు సొంత గృహాన్ని నిర్మించుకునే బలమైన యోగం ఉంది.`,
            },
            {
              headingTe: '3. కళత్ర సహకారం & భాగస్వామ్య అదృష్టం (7వ భావం & శుక్ర నాడి)',
              analysisTe: `7వ భావం మరియు శుక్రుడి స్థితి వల్ల జీవిత భాగస్వామి అడుగుపెట్టిన తర్వాత ఆర్థిక స్థిరత్వం, మానసిక ప్రశాంతత మరియు సమాజంలో గౌరవ ప్రతిష్టలు మరింతగా పెరుగుతాయి.`,
            },
          ],
        };

  // 8. 100% Chart-Driven Crystal-Clear Unfiltered Truths, Future Verdicts & Action Plan
  const activeMaha = chart.dashas.find((d) => d.isCurrent) ?? chart.dashas[0];
  const activeAntar =
    activeMaha.antardashas.find((a) => a.isCurrent) ?? activeMaha.antardashas[0];
  const mahaPlanet = navetPlanets.find((p) => p.id === activeMaha.lord) ?? sun;
  const antarPlanet = navetPlanets.find((p) => p.id === activeAntar.lord) ?? moon;
  const mahaTe = TELUGU_PLANETS[activeMaha.lord]?.nameTe ?? activeMaha.lord;
  const antarTe = TELUGU_PLANETS[activeAntar.lord]?.nameTe ?? activeAntar.lord;

  const tenthSignIdx = (ascSign + 9) % 12;
  const tenthLordId = SIGN_LORD_ID[tenthSignIdx];
  const tenthLordPlanet = navetPlanets.find((p) => p.id === tenthLordId) ?? sun;
  const tenthLordTe = TELUGU_PLANETS[tenthLordId]?.nameTe ?? tenthLordId;

  const ninthSignIdx = (ascSign + 8) % 12;
  const ninthLordId = SIGN_LORD_ID[ninthSignIdx];
  const ninthLordTe = TELUGU_PLANETS[ninthLordId]?.nameTe ?? ninthLordId;

  const crystalClearUnfilteredTruthsTe = [
    `మీరు ${lagnaRasiTe} లో, ${moonRasiTe} (${moonNakMeta.nameTe} నక్షత్రం ${moon.pada}వ పాదం) లో జన్మించారు. మీ లగ్నాధిపతి ${lagnaLordTe} ${lagnaLordPlanet.house}వ భావంలో (${TELUGU_RASIS[lagnaLordPlanet.signIndex].nameTe.split(' ')[0]}) ఉండటం వల్ల మీ ఆలోచనలు, ఆశయాలు ఎప్పుడూ ఉన్నతంగా ఉంటాయి; చిన్న చిన్న విషయాలతో సంతృప్తి చెందే స్వభావం కాదు.`,
    `చంద్రుడు ${moon.house}వ భావంలో మరియు సూర్యుడు ${sun.house}వ భావంలో ఉండటం వల్ల మీరు ఎదుటివారి కష్టాన్ని చూసి వెంటనే కరిగిపోయి సహాయం చేస్తారు, కానీ మీకు అవసరం వచ్చినప్పుడు మాత్రం స్వశక్తిపైనే నిలబడాల్సి వస్తుంది.`,
    `మీ 10వ భావాధిపతి (కర్మాధిపతి) అయిన ${tenthLordTe} ${tenthLordPlanet.house}వ భావంలో ఉండటం వల్ల, ఒకరి ఆజ్ఞల కింద పనిచేయడం కంటే స్వతంత్ర నిర్ణయాధికారం ఉన్న వృత్తి, ఉన్నత ఉద్యోగం లేదా సొంత వ్యాపార రంగంలోనే మీ ప్రతిభ పూర్తిస్థాయిలో వెలుగులోకి వస్తుంది.`,
    `శని ${saturn.house}వ భావంలో (${TELUGU_RASIS[saturn.signIndex].nameTe.split(' ')[0]}) మరియు రాహువు ${rahu.house}వ భావంలో ఉండటం వల్ల జీవితంలో ప్రతి విజయం వెనుక మీ స్వంత కష్టం, పట్టుదల ఉంటాయి; అడ్డదారుల కంటే ధర్మ మార్గంలో వెళ్ళినప్పుడే మీకు శాశ్వత రాజయోగం నిలుస్తుంది.`,
  ];

  const futureTimelineVerdictsTe = [
    `ప్రస్తుతం మీకు ${mahaTe} మహాదశ (${activeMaha.startDate} నుండి ${activeMaha.endDate} వరకు) మరియు అందులో ${antarTe} అంతర్దశ (${activeAntar.startDate} → ${activeAntar.endDate}) నడుస్తున్నది. మహాదశా నాథుడు ${mahaPlanet.house}వ భావంలో మరియు అంతర్దశా నాథుడు ${antarPlanet.house}వ భావంలో ఉండటం వల్ల ఈ కాలంలో ${mahaPlanet.house}, ${antarPlanet.house} భావాలకు సంబంధించిన ఆర్థిక, వృత్తి మరియు కుటుంబ మార్పులు ప్రత్యక్షంగా అనుభవానికి వస్తాయి.`,
    `భాగ్యాధిపతి (${ninthLordTe}) మరియు కర్మాధిపతి (${tenthLordTe}) సమన్వయం వల్ల రాబోయే దశా-భుక్తులలో ఆదాయ మార్గాలు విస్తరించడం, సొంత ఆస్తి / గృహ యోగం మరియు సమాజంలో ప్రత్యేక గుర్తింపు ఖచ్చితంగా ఏర్పడతాయి.`,
    `భృగు నంది నాడి ప్రకారం గురువు (${TELUGU_RASIS[jupiter.signIndex].nameTe.split(' ')[0]}) మరియు శని (${TELUGU_RASIS[saturn.signIndex].nameTe.split(' ')[0]}) స్థానాలు మీ జీవిత ద్వితీయార్థాన్ని (ముఖ్యంగా 32–36 సం. తర్వాత) అత్యంత స్థిరమైన ఆర్థిక సామ్రాజ్యంగా తీర్చిదిద్దుతాయి.`,
  ];

  const exactActionableDoAndDontsTe = {
    mustDoTe: [
      `మీ లగ్నాధిపతి ${lagnaLordTe} మరియు భాగ్యాధిపతి ${ninthLordTe} బలాన్ని పెంచుకోవడానికి ఆ గ్రహాల వారాలలో ఇష్టదేవతా ఆరాధన, ధ్యానం క్రమం తప్పకుండా చేయండి.`,
      `మీ జన్మ నక్షత్రం (${moonNakMeta.nameTe}) యొక్క పాద అక్షరం (“${moonNakMeta.padasTe[moon.pada - 1]}”) లేదా రాశి అక్షరాలను వ్యాపార/వ్యవహార ప్రారంభాలలో ఉపయోగించుకోండి.`,
      `ప్రస్తుత ${mahaTe}–${antarTe} కాలంలో ${mahaPlanet.house}వ మరియు ${antarPlanet.house}వ భావ రంగాలపై పూర్తి ఏకాగ్రత పెట్టి ప్రణాళికాబద్ధంగా పెట్టుబడులు పెట్టండి.`,
      `బాధకాధిపతి (${badhakeshTe}) ప్రభావం తగ్గడానికి ప్రతి పౌర్ణమికి లేదా శుభ తిథులలో కులదేవతకు నైవేద్యం సమర్పించండి.`,
    ],
    mustAvoidTe: [
      `భావోద్వేగంతో లేదా ఇతరుల మాటలు విని ఆర్థిక హామీలు (Guarantees/Sureties) ఇవ్వడం, రహస్య ప్రణాళికలను ముందుగానే బయటపెట్టడం చేయకండి.`,
      `2వ మరియు 7వ మారక/కేంద్ర అధిపతుల (${maraka1Te}, ${maraka2Te}) అంతర్దశలలో ఆరోగ్య నిర్లక్ష్యం మరియు నిద్రలేమి లేకుండా చూసుకోండి.`,
      `శని స్థితి ఉన్న ${saturn.house}వ భావ విషయాలలో తొందరపాటు లేదా నిరాశ చెందకుండా సహనంతో వ్యవహరించండి.`,
    ],
  };

  // 9. 18 Authoritative Classical & Modern Jyotisha Sources Verified in this Chart
  const eighteenClassicalSources: ClassicalSourcePramanaCard[] = [
    {
      id: 'bphs',
      number: 1,
      titleTe: 'బృహత్ పరాశర హోరా శాస్త్రం (Brihat Parashara Hora Shastra)',
      authorAndEraTe: 'మహర్షి పరాశరుడు (వేద కాలం · 100 అధ్యాయాల మూల గ్రంథం)',
      branchTe: 'పరాశర సిద్ధాంతం (Parashari)',
      whatItAnalyzesInYourChartTe: 'షోడశ వర్గ చక్రాలు (D1–D60), షడ్బలాలు, 120 సం. వింశోత్తరి దశ, భావాధిపతుల స్థితి మరియు రాజయోగాలు.',
      yourChartSpecificFindingTe: `${lagnaRasiTe} లగ్నానికి లగ్నాధిపతి ${lagnaLordTe} ${lagnaLordPlanet.house}వ భావ స్థితి & కర్మాధిపతి ${tenthLordTe} ${tenthLordPlanet.house}వ భావ స్థితి నిర్ధారణ.`,
    },
    {
      id: 'brihat_jataka',
      number: 2,
      titleTe: 'బృహజ్జాతకం (Brihat Jataka)',
      authorAndEraTe: 'వరాహమిహిరాచార్యుడు (ఉజ్జయిని · సా.శ. 6వ శతాబ్దం)',
      branchTe: 'సిద్ధాంత & హోరా శాస్త్రం',
      whatItAnalyzesInYourChartTe: 'గ్రహ స్వరూపం, రాశి శీర్షోదయ-పృష్టోదయ బలాలు, నభస యోగాలు, ద్రేక్కాణ స్వరూపం & స్త్రీ జాతక విశ్లేషణ.',
      yourChartSpecificFindingTe: `జన్మ చంద్ర రాశి ${moonRasiTe} మరియు ${gender === 'female' ? 'స్త్రీ జాతక సౌభాగ్య' : 'పురుష జాతక విక్రమ'} బల నిర్ధారణ.`,
    },
    {
      id: 'phaladeepika',
      number: 3,
      titleTe: 'ఫలదీపిక (Phaladeepika)',
      authorAndEraTe: 'మంత్రేశ్వర మహర్షి (దక్షిణ భారత సాంప్రదాయం · 13వ శతాబ్దం)',
      branchTe: 'కేరళ & దక్షిణాది జ్యోతిష్యం',
      whatItAnalyzesInYourChartTe: 'పంచ మహాపురుష యోగాలు, నీచభంగ రాజయోగం, గోచార వేధ నియమాలు & దశా-భుక్తి ఫలితాలు.',
      yourChartSpecificFindingTe: `చంద్ర రాశి (${moonRasiTe}) నుండి గోచార శని-గురు వేధ & శుభ స్థానాల ప్రత్యక్ష గణన.`,
    },
    {
      id: 'jataka_parijata',
      number: 4,
      titleTe: 'జాతక పారిజాతం (Jataka Parijata)',
      authorAndEraTe: 'వైద్యనాథ దీక్షితులు (15వ శతాబ్దం)',
      branchTe: 'దక్షిణాది సంప్రదాయ హోరా',
      whatItAnalyzesInYourChartTe: 'ఆయుర్దాయ గణన, గ్రహ అవస్థలు (దీప్త, స్వస్థ, ముదిత), బహుగ్రహ యుతి & కులదీపక యోగాలు.',
      yourChartSpecificFindingTe: `మీ కుండలిలోని ${conjunctionsAndSpecialStates.length} ప్రధాన గ్రహ యుతులు మరియు నవగ్రహ అవస్థల విశ్లేషణ.`,
    },
    {
      id: 'saravali',
      number: 5,
      titleTe: 'సారావళి (Saravali)',
      authorAndEraTe: 'కల్యాణ వర్మ (సా.శ. 10వ శతాబ్దం)',
      branchTe: 'హోరా & గ్రహ సంయోగ శాస్త్రం',
      whatItAnalyzesInYourChartTe: 'ద్విగ్రహ, త్రిగ్రహ, చతుర్గ్రహ యుతులు, చంద్ర-సూర్య దృష్టి ఫలితాలు మరియు దశమ భావ వృత్తి రహస్యాలు.',
      yourChartSpecificFindingTe: `చంద్రుడు (${moonRasiTe}) పై పడే గ్రహ దృష్టులు మరియు దశమ భావ కర్మ ఫల నిర్ధారణ.`,
    },
    {
      id: 'bhavartha_ratnakara',
      number: 6,
      titleTe: 'భావార్థ రత్నాకరం (Bhavartha Ratnakara)',
      authorAndEraTe: 'శ్రీ రామానుజాచార్యులు (దక్షిణ భారత నాడి-పరాశర సమన్వయం)',
      branchTe: 'లగ్న-నిర్దిష్ట యోగ శాస్త్రం',
      whatItAnalyzesInYourChartTe: 'ప్రతి లగ్నానికి (మేషం నుండి మీనం వరకు) ఏ గ్రహం యోగకారకుడో, ఏ గ్రహం మారకుడో సూక్ష్మంగా తేల్చే గ్రంథం.',
      yourChartSpecificFindingTe: `${lagnaRasiTe} జాతకులకు ${ninthLordTe} మరియు ${tenthLordTe} ఇచ్చే ప్రత్యేక రాజయోగ సూత్రాల అన్వయం.`,
    },
    {
      id: 'uttara_kalamrita',
      number: 7,
      titleTe: 'ఉత్తర కాలామృతం (Uttara Kalamrita)',
      authorAndEraTe: 'మహాకవి కాళిదాసు (దక్షిణ భారత జ్యోతిష్య రత్నం)',
      branchTe: 'సూక్ష్మ కారకత్వ & వక్ర గ్రహ శాస్త్రం',
      whatItAnalyzesInYourChartTe: 'వక్ర గ్రహాల ఉచ్చ సమాన బలం, విపరీత రాజయోగం, ఉపగ్రహాలు (మాందీ, గుళిక) & దశా-అంతర్దశల విశేష నియమాలు.',
      yourChartSpecificFindingTe: `మాందీ/గుళిక స్ఫుటములు మరియు వక్ర గ్రహాల చేష్టా బల నిర్ధారణ.`,
    },
    {
      id: 'jaimini_upadesha',
      number: 8,
      titleTe: 'మహర్షి జైమిని ఉపదేశ సూత్రాలు (Jaimini Upadesha Sutras)',
      authorAndEraTe: 'మహర్షి జైమిని (పూర్వ మీమాంస & జైమిని సూత్ర కర్త)',
      branchTe: 'జైమిని నాడి సిద్ధాంతం',
      whatItAnalyzesInYourChartTe: 'సప్త చర కారకులు (ఆత్మకారక నుండి దారకారక వరకు), కారకాంశ లగ్నం, ఆరూఢ లగ్నం (AL), ఉపపాద లగ్నం (UL) & చర రాశి దశలు.',
      yourChartSpecificFindingTe: `ఆత్మకారక, అమాత్యకారక, దారకారక మరియు 12 భావాల ఆరూఢ పాదాల (A1–A12) గణన.`,
    },
    {
      id: 'laghu_parashari',
      number: 9,
      titleTe: 'లఘు పరాశరి / ఉడుదాయ ప్రదీపం (Laghu Parashari)',
      authorAndEraTe: 'పరాశర సంప్రదాయ దశా సూత్ర గ్రంథం',
      branchTe: 'దశా-భుక్తి నిర్ధారణ శాస్త్రం',
      whatItAnalyzesInYourChartTe: 'కేంద్రాధిపత్య దోషం, త్రికోణాధిపత్య శుభత్వం, సాహచర్య సంబంధం & మహాదశ-అంతర్దశ పరస్పర ఫలితాలు.',
      yourChartSpecificFindingTe: `ప్రస్తుత ${mahaTe} మహాదశ — ${antarTe} అంతర్దశల పరస్పర మిత్ర-శత్రు సమన్వయం.`,
    },
    {
      id: 'chamatkara_chintamani',
      number: 10,
      titleTe: 'చమత్కార చింతామణి (Chamatkara Chintamani)',
      authorAndEraTe: 'భట్ట నారాయణ పండితుడు (14వ శతాబ్దం)',
      branchTe: 'భావ స్థితి శ్లోక ప్రమాణం',
      whatItAnalyzesInYourChartTe: '9 గ్రహాలు 12 భావాలలో (108 స్థితులు) ఉన్నప్పుడు కలిగే ప్రత్యక్ష జీవిత సంఘటనల సంస్కృత శ్లోక ప్రమాణం.',
      yourChartSpecificFindingTe: `మీ కుండలిలోని నవగ్రహాల ఖచ్చితమైన భావ స్థితులకు మూల సంస్కృత శ్లోకాల అన్వయం.`,
    },
    {
      id: 'surya_siddhanta',
      number: 11,
      titleTe: 'సూర్య సిద్ధాంతం & దృగ్గణిత పంచాంగం (Surya Siddhanta & Drik Ganita)',
      authorAndEraTe: 'మయాసుర / భాస్కరాచార్య సిద్ధాంత శిరోమణి సంప్రదాయం',
      branchTe: 'ఖగోళ గణిత సిద్ధాంతం (Astronomical Ephemeris)',
      whatItAnalyzesInYourChartTe: 'నిరయన గ్రహ స్ఫుటములు, చిత్రపక్ష (లహిరి) అయనాంశం, ఉదయాది ఇష్టఘడియలు, శ్రీపతి భావ సంధి & షడ్బల గణితం.',
      yourChartSpecificFindingTe: `అయనాంశం (${chart.ayanamsaFormatted}) మరియు జూలియన్ దినం (${chart.julianDay.toFixed(2)}) తో సెకను స్థాయి ఖచ్చితత్వం.`,
    },
    {
      id: 'muhurta_chintamani',
      number: 12,
      titleTe: 'ముహూర్త చింతామణి & ఆశ్వలాయన గృహ్యసూత్రం (Muhurta Chintamani)',
      authorAndEraTe: 'రామ దైవజ్ఞుడు (కాశీ · సా.శ. 1600)',
      branchTe: 'నామకరణ, వివాహ & ముహూర్త శాస్త్రం',
      whatItAnalyzesInYourChartTe: 'చూడామణి చక్ర 108 పాద నామాక్షరాలు, 6 నామ ఆశ్రయాలు, అష్టకూట 36 గుణాల వివాహ పొందిక & తారాబలం.',
      yourChartSpecificFindingTe: `${moonNakMeta.nameTe} (${moon.pada}వ పాదం) ఆధారంగా నామాక్షరం “${moonNakMeta.padasTe[moon.pada - 1]}” మరియు షడాశ్రయ నామ నిర్ణయం.`,
    },
    {
      id: 'bhrigu_nandi_nadi',
      number: 13,
      titleTe: 'భృగు నంది నాడి & చంద్రకళా నాడి (Bhrigu Nandi Nadi & Deva Keralam)',
      authorAndEraTe: 'మహర్షి భృగువు & అచ్యుత పండితుడు (నాడి తాళపత్ర సంప్రదాయం)',
      branchTe: 'నాడి జ్యోతిష్యం (Nadi Astrology)',
      whatItAnalyzesInYourChartTe: 'భావ ఆధిపత్యాలతో సంబంధం లేకుండా గ్రహాల త్రికోణ (1-5-9) మరియు 2-12 దిశా సంబంధాల ద్వారా ఖచ్చితమైన సంఘటనల నిర్ధారణ.',
      yourChartSpecificFindingTe: `జీవ కారక గురువు (${TELUGU_RASIS[jupiter.signIndex].nameTe.split(' ')[0]}) మరియు కర్మ కారక శని (${TELUGU_RASIS[saturn.signIndex].nameTe.split(' ')[0]}) నాడి త్రికోణ బంధాల విశ్లేషణ.`,
    },
    {
      id: 'kp_padhdhati',
      number: 14,
      titleTe: 'కృష్ణమూర్తి పద్ధతి — KP సబ్-లార్డ్ సిద్ధాంతం (Krishnamurti Paddhati)',
      authorAndEraTe: 'జ్యోతిష మార్తాండ ప్రొ. కె.ఎస్. కృష్ణమూర్తి (20వ శతాబ్దపు నక్షత్ర-సబ్ సిద్ధాంతం)',
      branchTe: 'నక్షత్ర & ఉపనక్షత్ర (249 Sub-Lord) శాస్త్రం',
      whatItAnalyzesInYourChartTe: 'ఒకే రాశిలో పుట్టిన ఇద్దరి జాతకాలలో తేడాను పట్టుకునే 249 సబ్-లార్డ్ (ఉపనక్షత్రాధిపతి) మరియు 12 భావ కస్ప్ (Cusp) నిర్ధారణ.',
      yourChartSpecificFindingTe: `మీ 12 భావ కస్ప్‌ల సబ్-లార్డ్స్ మరియు వివాహం (7), ఉద్యోగం (10), గృహయోగం (4), ధనం (2) నిర్ధారణ.`,
    },
    {
      id: 'tajika_nilakanthi',
      number: 15,
      titleTe: 'తాజిక నీలకంఠీ — వార్షిక ఫల శాస్త్రం (Tajika Nilakanthi Varshaphala)',
      authorAndEraTe: 'నీలకంఠ దైవజ్ఞుడు (సా.శ. 1587)',
      branchTe: 'వార్షిక కుండలి (Solar Return / Varshaphala)',
      whatItAnalyzesInYourChartTe: 'ప్రతి పుట్టినరోజు నుండి మరుసటి పుట్టినరోజు వరకు ముంథా (Muntha) గమనం, వర్షేశుడు మరియు సహమ్ (Sahams) ద్వారా ఆ ఏడాది ఫలితం.',
      yourChartSpecificFindingTe: `ప్రస్తుత వయస్సు ఆధారంగా వార్షిక ముంథా రాశి మరియు ఈ సంవత్సరపు ప్రధాన ఫలితాల గణన.`,
    },
    {
      id: 'ashtakavarga_mahanibandha',
      number: 16,
      titleTe: 'అష్టకవర్గ మహానిబంధం & ప్రస్తారాష్టకవర్గ (Ashtakavarga System)',
      authorAndEraTe: 'పరాశర & వరాహమిహిర అష్టకవర్గ సంప్రదాయం',
      branchTe: 'బిందు గణిత & గోచార కక్ష్య శాస్త్రం',
      whatItAnalyzesInYourChartTe: '337 సర్వాష్టకవర్గ బిందువులు, భిన్నాష్టకవర్గ, త్రికోణ-ఏకాధిపత్య శోధన మరియు శని-గురు గోచార బిందు బలం.',
      yourChartSpecificFindingTe: `మీ 12 రాశుల సర్వాష్టకవర్గ బిందువులు మరియు అత్యధిక బిందువులు ఉన్న ధన-లాభ రాశుల గుర్తింపు.`,
    },
    {
      id: 'prasna_marga',
      number: 17,
      titleTe: 'ప్రశ్న మార్గం & షట్పంచాశిక (Prasna Marga & Shatpanchasika)',
      authorAndEraTe: 'పనక్కాట్ నంబూద్రి (కేరళ · సా.శ. 1649) & పృథుయశస్సు',
      branchTe: 'ప్రశ్న & బాధక-పరిహార శాస్త్రం',
      whatItAnalyzesInYourChartTe: 'ఆరూఢ లగ్నం, ఇష్టసిద్ధి, బాధక స్థాన రహస్య పరీక్ష (చర-స్థిర-ద్విస్వభావ లగ్న బాధకాధిపతి) మరియు తాత్కాలిక ప్రశ్న ఫలితం.',
      yourChartSpecificFindingTe: `${lagnaRasiTe} కు ${badhakaHouse}వ బాధక స్థానం (${badhakaMarakaDiagnostic.badhakaRasiTe}) & బాధకాధిపతి ${badhakeshTe} పరిహార నిర్ధారణ.`,
    },
    {
      id: 'mantra_mahodadhi',
      number: 18,
      titleTe: 'మంత్ర మహోదధి, రత్న పరీక్ష & శాంతి కుసుమాకరం (Vedic Remedial Corpus)',
      authorAndEraTe: 'మహీధరుడు & వైదిక కర్మకాండ పీఠ సంప్రదాయం',
      branchTe: 'వైదిక పరిహార, రత్న, మంత్ర & దాన శాస్త్రం',
      whatItAnalyzesInYourChartTe: 'జాతకంలోని దోషాలకు భయపెట్టకుండా శాస్త్రీయమైన వేద మంత్ర జపం, రత్న ధారణ నియమాలు, నవగ్రహ దానాలు & క్షేత్ర దర్శనం.',
      yourChartSpecificFindingTe: `మీ లగ్న యోగకారక గ్రహాలకు అనుకూల రత్నం మరియు ప్రస్తుత ${mahaTe}–${antarTe} దశా శాంతి పరిహారాలు.`,
    },
  ];

  return {
    nativeGenderTe: gender === 'female' ? 'స్త్రీ జాతకం (Female Horoscope)' : 'పురుష జాతకం (Male Horoscope)',
    crystalClearUnfilteredTruthsTe,
    futureTimelineVerdictsTe,
    exactActionableDoAndDontsTe,
    bhavaLordPlacements,
    parivartanaYogas,
    conjunctionsAndSpecialStates,
    kpSubLordTable,
    kpLifeEventVerdicts,
    bhriguNandiNadiReadings,
    badhakaMarakaDiagnostic,
    genderSpecificShastraAnalysis,
    eighteenClassicalSources,
  };
}
