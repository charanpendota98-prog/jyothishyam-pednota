import {
  formatDMS,
  norm360,
  type CompleteChartResult,
  type MahadashaPeriod,
} from './ephemeris.ts';
import {
  TELUGU_NAKSHATRAS,
  TELUGU_PLANETS,
  TELUGU_RASIS,
} from './teluguJathakam.ts';

export type DashaTimelineMarkerCategory =
  | 'sade_sati'
  | 'kantaka_shani'
  | 'planetary_return'
  | 'life_milestone';

export interface DashaTimelineEventMarker {
  id: string;
  category: DashaTimelineMarkerCategory;
  categoryLabelTe: string;
  titleTe: string;
  subtitleTe: string;
  startAge: number;
  endAge: number;
  startDateStr: string;
  endDateStr: string;
  isCurrentNow: boolean;
  severityOrNature: 'auspicious' | 'caution' | 'critical_test' | 'spiritual_milestone';
  badgeTe: string;
  transitPlanetId: string;
  transitSignIdx: number;
  transitSignTe: string;
  houseFromMoon: number;
  overlappingMahaLordId: string;
  overlappingMahaLordTe: string;
  overlappingBhuktiLordTe: string;
  dashaGocharaSangamaTe: string;
  pariharaTe: string;
}

export interface SadeSatiPhaseRow {
  cycleNumber: 1 | 2 | 3;
  cycleTitleTe: string;
  phaseNameTe: string; // ఆరంభ పాదం (12వ ఇల్లు), మధ్య/జన్మ పాదం (1వ ఇల్లు), అంత్య పాదం (2వ ఇల్లు)
  bodyPartTe: string; // శిరస్సు, హృదయం/ఉదరం, పాదములు
  transitRasiTe: string;
  houseFromMoon: 12 | 1 | 2;
  startDateStr: string;
  endDateStr: string;
  startAge: string;
  endAge: string;
  overlappingDashaTe: string;
  isCurrent: boolean;
  phalaAndPariharaTe: string;
}

export interface AstroVisionAdrushtaSoochika {
  janmaSankhya: number;
  janmaSankhyaPlanetTe: string;
  bhagyaSankhya: number;
  bhagyaSankhyaPlanetTe: string;
  luckyNumbers: string;
  friendlyNumbers: string;
  avoidNumbers: string;
  luckyDaysTe: string;
  avoidDaysTe: string;
  luckyColorsTe: string;
  avoidColorsTe: string;
  favorableDirectionTe: string;
  favorableMetalTe: string;
  compatibleRasisTe: string;
  lifeGemstoneTe: string; // లగ్నాధిపతి రత్నం (జీవిత రత్నం)
  beneficGemstoneTe: string; // పంచమాధిపతి రత్నం (ప్రజ్ఞా/అదృష్ట రత్నం)
  fortuneGemstoneTe: string; // భాగ్యాధిపతి రత్నం (భాగ్య రత్నం)
  numerologySynthesisTe: string;
}

export interface PapaSamyamPlanetRow {
  planetId: string;
  planetNameTe: string;
  fromLagnaHouse: number;
  fromLagnaPoints: number;
  fromMoonHouse: number;
  fromMoonPoints: number;
  fromVenusHouse: number;
  fromVenusPoints: number;
}

export interface AstroVisionPapaSamyamReport {
  rows: PapaSamyamPlanetRow[];
  totalFromLagna: number;
  totalFromMoon: number;
  totalFromVenus: number;
  grandWeightedTotal: number;
  kujaDoshaStatusTe: string;
  marriageMatchingVerdictTe: string;
}

export interface NirayanaSphutaSubLordRow {
  bodyId: string;
  bodyNameTe: string;
  glyph: string;
  rasiNameTe: string;
  degreeInSignDMS: string;
  absoluteSiderealDMS: string;
  nakshatraNameTe: string;
  pada: number;
  rasiLordTe: string;
  nakshatraLordTe: string;
  subLordTe: string; // KP / Vimshottari Sub-Lord (ఉపనక్షత్రాధిపతి)
  subSubLordTe: string; // ప్రాణ/ఉప-ఉపనక్షత్రాధిపతి
  houseNumber: number;
  dignityTe: string;
  motionStatusTe: string;
}

export interface AstroVisionMasterReport {
  kaliDinaSankhya: number;
  dinamanaHoursTe: string;
  ratrimanaHoursTe: string;
  nirayanaSphutaTable: NirayanaSphutaSubLordRow[];
  adrushtaSoochika: AstroVisionAdrushtaSoochika;
  papaSamyam: AstroVisionPapaSamyamReport;
  sadeSatiPhases: SadeSatiPhaseRow[];
  timelineEventMarkers: DashaTimelineEventMarker[];
}

const VIMSHOTTARI_LORDS_ORDER = [
  { id: 'Ketu', years: 7 },
  { id: 'Venus', years: 20 },
  { id: 'Sun', years: 6 },
  { id: 'Moon', years: 10 },
  { id: 'Mars', years: 7 },
  { id: 'Rahu', years: 18 },
  { id: 'Jupiter', years: 16 },
  { id: 'Saturn', years: 19 },
  { id: 'Mercury', years: 17 },
];

const SIGN_LORDS_ID: Record<number, string> = {
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

const NUMEROLOGY_PLANET_MAP: Record<
  number,
  {
    planetId: string;
    planetTe: string;
    luckyNums: string;
    friendlyNums: string;
    avoidNums: string;
    natureTe: string;
  }
> = {
  1: {
    planetId: 'Sun',
    planetTe: 'రవి (సూర్యుడు — నాయకత్వ సంఖ్య 1)',
    luckyNums: '1, 3, 5, 9',
    friendlyNums: '2, 3, 9',
    avoidNums: '6, 8',
    natureTe: 'ఆత్మవిశ్వాసం, రాజసము, పరిపాలనా దక్షత మరియు స్వతంత్ర వ్యక్తిత్వం.',
  },
  2: {
    planetId: 'Moon',
    planetTe: 'చంద్రుడు (మనో సంఖ్య 2)',
    luckyNums: '2, 1, 5, 7',
    friendlyNums: '1, 5',
    avoidNums: '8, 9',
    natureTe: 'సున్నిత మనస్తత్వం, సృజనాత్మకత, ప్రజాదరణ మరియు కళాభిరుచి.',
  },
  3: {
    planetId: 'Jupiter',
    planetTe: 'గురుడు (బృహస్పతి — విజ్ఞాన సంఖ్య 3)',
    luckyNums: '3, 1, 2, 9',
    friendlyNums: '1, 2, 9',
    avoidNums: '5, 6',
    natureTe: 'ఉన్నత విద్యాబుద్ధులు, ధర్మ నిష్ఠ, గురుత్వం మరియు ఆర్థిక క్రమశిక్షణ.',
  },
  4: {
    planetId: 'Rahu',
    planetTe: 'రాహువు / యురేనస్ (పరిశోధన సంఖ్య 4)',
    luckyNums: '4, 1, 5, 6, 7',
    friendlyNums: '5, 6, 8',
    avoidNums: '2, 9',
    natureTe: 'నూతన ఆవిష్కరణలు, సాంకేతిక నైపుణ్యం, పట్టుదల మరియు వ్యావహారిక దక్షత.',
  },
  5: {
    planetId: 'Mercury',
    planetTe: 'బుధుడు (వాణిజ్య & మేధా సంఖ్య 5)',
    luckyNums: '5, 1, 4, 6',
    friendlyNums: '1, 4, 6',
    avoidNums: '2',
    natureTe: 'చురుకైన బుద్ధి, వాక్చాతుర్యం, వ్యాపార దక్షత మరియు బహుముఖ ప్రజ్ఞ.',
  },
  6: {
    planetId: 'Venus',
    planetTe: 'శుక్రుడు (ఐశ్వర్య & ఆకర్షణ సంఖ్య 6)',
    luckyNums: '6, 4, 5, 8, 9',
    friendlyNums: '4, 5, 8',
    avoidNums: '1, 2',
    natureTe: 'సౌందర్య ఆరాధన, లక్ష్మీ కటాక్షం, కుటుంబ సౌఖ్యం మరియు ఆకర్షణ శక్తి.',
  },
  7: {
    planetId: 'Ketu',
    planetTe: 'కేతువు / నెప్ట్యూన్ (ఆధ్యాత్మిక సంఖ్య 7)',
    luckyNums: '7, 1, 2, 4',
    friendlyNums: '2, 4, 5',
    avoidNums: '8, 9',
    natureTe: 'తాత్విక చింతన, లోతైన పరిశోధన, అంతర్ముఖ ప్రజ్ఞ మరియు దైవ భక్తి.',
  },
  8: {
    planetId: 'Saturn',
    planetTe: 'శని (న్యాయ & కర్మ సంఖ్య 8)',
    luckyNums: '8, 4, 5, 6',
    friendlyNums: '4, 5, 6',
    avoidNums: '1, 2, 9',
    natureTe: 'కఠిన శ్రమ, నిరంతర పట్టుదల, న్యాయబద్ధత మరియు స్థిరమైన ఉన్నతి.',
  },
  9: {
    planetId: 'Mars',
    planetTe: 'కుజుడు (పరాక్రమ & విజయ సంఖ్య 9)',
    luckyNums: '9, 1, 2, 3, 6',
    friendlyNums: '1, 2, 3',
    avoidNums: '4, 5',
    natureTe: 'ధైర్య సాహసాలు, కార్యదీక్ష, రక్షణ తత్వం మరియు పోటీలలో విజయం.',
  },
};

const PLANET_GEM_COLORS_DIRECTIONS: Record<
  string,
  {
    gemTe: string;
    dayTe: string;
    colorTe: string;
    directionTe: string;
    metalTe: string;
  }
> = {
  Sun: {
    gemTe: 'మాణిక్యం (Ruby - 3–5 క్యారెట్లు)',
    dayTe: 'ఆదివారం',
    colorTe: 'బంగారు ఎరుపు, కాషాయం (Saffron & Gold)',
    directionTe: 'తూర్పు (East)',
    metalTe: 'బంగారం / రాగి (Gold / Copper)',
  },
  Moon: {
    gemTe: 'స్వచ్ఛమైన ముత్యం (Natural Pearl - 4–6 క్యారెట్లు)',
    dayTe: 'సోమవారం',
    colorTe: 'తెలుపు, వెండి, లేత క్రీమ్ (White & Silver)',
    directionTe: 'వాయువ్యం (North-West)',
    metalTe: 'వెండి (Silver)',
  },
  Mars: {
    gemTe: 'ఎర్ర పగడం (Red Coral - 5–7 క్యారెట్లు)',
    dayTe: 'మంగళవారం',
    colorTe: 'ఎరుపు, సింధూరం (Crimson & Coral)',
    directionTe: 'దక్షిణం (South)',
    metalTe: 'రాగి / బంగారం (Copper / Gold)',
  },
  Mercury: {
    gemTe: 'మరకతము / పచ్చ (Emerald - 3–5 క్యారెట్లు)',
    dayTe: 'బుధవారం',
    colorTe: 'ఆకుపచ్చ, లేత పచ్చ (Emerald Green)',
    directionTe: 'ఉత్తరం (North)',
    metalTe: 'బంగారం / కంచు (Gold / Bronze)',
  },
  Jupiter: {
    gemTe: 'కనకపుష్యరాగం (Yellow Sapphire - 4–5 క్యారెట్లు)',
    dayTe: 'గురువారం',
    colorTe: 'పసుపు, బంగారు వర్ణం (Golden Yellow)',
    directionTe: 'ఈశాన్యం (North-East)',
    metalTe: 'బంగారం (22K Gold)',
  },
  Venus: {
    gemTe: 'వజ్రం / శ్వేత పుష్యరాగం (Diamond / White Sapphire)',
    dayTe: 'శుక్రవారం',
    colorTe: 'తెలుపు, గులాబీ, ఆకాశ నీలం (Pastel Pink & White)',
    directionTe: 'ఆగ్నేయం (South-East)',
    metalTe: 'ప్లాటినం / వెండి / బంగారం',
  },
  Saturn: {
    gemTe: 'ఇంద్రనీలం (Blue Sapphire - పరీక్షించి ధరించాలి)',
    dayTe: 'శనివారం',
    colorTe: 'ముదురు నీలం, ఊదా (Navy Blue & Indigo)',
    directionTe: 'పడమర (West)',
    metalTe: 'పంచలోహం / వెండి',
  },
};

function reduceToSingleDigit(n: number): number {
  let sum = n;
  while (sum > 9) {
    sum = String(sum)
      .split('')
      .reduce((acc, d) => acc + parseInt(d, 10), 0);
  }
  return sum === 0 ? 1 : sum;
}

function formatAgeAndDate(birthDateUTC: Date, ageYears: number): { dateStr: string; yearNum: number } {
  const ms = birthDateUTC.getTime() + ageYears * 365.2425 * 86400 * 1000;
  const d = new Date(ms + 5.5 * 3600 * 1000);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  return { dateStr: `${y}-${m}`, yearNum: y };
}

function findOverlappingDashaAndBhukti(
  dashas: MahadashaPeriod[],
  birthDateUTC: Date,
  targetAgeYears: number
): {
  mahaLordId: string;
  mahaLordTe: string;
  bhuktiLordId: string;
  bhuktiLordTe: string;
} {
  const targetMs = birthDateUTC.getTime() + targetAgeYears * 365.2425 * 86400 * 1000;
  const targetIso = new Date(targetMs + 5.5 * 3600 * 1000).toISOString().slice(0, 10);

  for (const m of dashas) {
    if (targetIso >= m.startDate && targetIso <= m.endDate) {
      const mahaLordTe = TELUGU_PLANETS[m.lord]?.nameTe.split(' ')[0] ?? m.lord;
      for (const b of m.antardashas) {
        if (targetIso >= b.startDate && targetIso <= b.endDate) {
          const bhuktiLordTe = TELUGU_PLANETS[b.lord]?.nameTe.split(' ')[0] ?? b.lord;
          return {
            mahaLordId: m.lord,
            mahaLordTe,
            bhuktiLordId: b.lord,
            bhuktiLordTe,
          };
        }
      }
      return {
        mahaLordId: m.lord,
        mahaLordTe,
        bhuktiLordId: m.lord,
        bhuktiLordTe: mahaLordTe,
      };
    }
  }

  const fallback = dashas[0];
  const fTe = TELUGU_PLANETS[fallback.lord]?.nameTe.split(' ')[0] ?? fallback.lord;
  return {
    mahaLordId: fallback.lord,
    mahaLordTe: fTe,
    bhuktiLordId: fallback.lord,
    bhuktiLordTe: fTe,
  };
}

/**
 * Calculates KP / Vimshottari Sub-Lord (ఉపనక్షత్రాధిపతి) and Sub-Sub-Lord (ప్రాణ నాథుడు)
 * for any sidereal longitude (0°–360°).
 */
export function calculateKpSubLord(siderealLon: number): {
  nakIdx: number;
  nakLordId: string;
  subLordId: string;
  subSubLordId: string;
} {
  const lon = norm360(siderealLon);
  const nakSpan = 360 / 27; // 13.333333°
  const nakIdx = Math.floor(lon / nakSpan);
  const degInNak = lon - nakIdx * nakSpan;
  const startLordIdx = nakIdx % 9;

  let accDeg = 0;
  let subLordId = VIMSHOTTARI_LORDS_ORDER[startLordIdx].id;
  let subStartIdx = startLordIdx;
  let degInSub = 0;
  let subSpanDeg = nakSpan;

  for (let i = 0; i < 9; i++) {
    const idx = (startLordIdx + i) % 9;
    const lordObj = VIMSHOTTARI_LORDS_ORDER[idx];
    const span = (lordObj.years / 120) * nakSpan;
    if (degInNak <= accDeg + span || i === 8) {
      subLordId = lordObj.id;
      subStartIdx = idx;
      degInSub = Math.max(0, degInNak - accDeg);
      subSpanDeg = span;
      break;
    }
    accDeg += span;
  }

  // Sub-Sub Lord inside Sub
  let accSubSub = 0;
  let subSubLordId = subLordId;
  for (let j = 0; j < 9; j++) {
    const idx = (subStartIdx + j) % 9;
    const lordObj = VIMSHOTTARI_LORDS_ORDER[idx];
    const span = (lordObj.years / 120) * subSpanDeg;
    if (degInSub <= accSubSub + span || j === 8) {
      subSubLordId = lordObj.id;
      break;
    }
    accSubSub += span;
  }

  return {
    nakIdx,
    nakLordId: VIMSHOTTARI_LORDS_ORDER[startLordIdx].id,
    subLordId,
    subSubLordId,
  };
}

export function generateAstroVisionMasterReport(
  chart: CompleteChartResult
): AstroVisionMasterReport {
  const moon = chart.planets.find((p) => p.id === 'Moon')!;
  const saturn = chart.planets.find((p) => p.id === 'Saturn')!;
  const venus = chart.planets.find((p) => p.id === 'Venus')!;
  const ascSignIdx = chart.ascendant.signIndex;
  const moonSignIdx = moon.signIndex;
  const venusSignIdx = venus.signIndex;

  // Birth Date UTC & Current Age
  const birthDateUTC = new Date(chart.utcIso);
  const bD = Number(chart.input.date.split('-')[2]);
  const currentAgeYears = Math.max(
    0,
    (Date.now() - birthDateUTC.getTime()) / (365.2425 * 86400 * 1000)
  );

  // 1. Kali Dina Sankhya & Dinamana / Ratrimana
  // Kali Yuga epoch JD = 588465.5
  const kaliDinaSankhya = Math.floor(chart.julianDay - 588465.5);
  const [srH, srM] = chart.panchanga.sunTimes.sunriseLocal.split(':').map(Number);
  const [ssH, ssM] = chart.panchanga.sunTimes.sunsetLocal.split(':').map(Number);
  const dayMins = Math.max(600, (ssH * 60 + ssM) - (srH * 60 + srM));
  const nightMins = 1440 - dayMins;
  const dinamanaHoursTe = `${Math.floor(dayMins / 60)} గం. ${dayMins % 60} ని. (${(dayMins / 24).toFixed(1)} ఘడియలు)`;
  const ratrimanaHoursTe = `${Math.floor(nightMins / 60)} గం. ${nightMins % 60} ని. (${(nightMins / 24).toFixed(1)} ఘడియలు)`;

  // 2. Nirayana Spashta Graha Sphutam & KP Sub-Lord Table
  const ascKp = calculateKpSubLord(chart.ascendant.siderealLon);
  const nirayanaSphutaTable: NirayanaSphutaSubLordRow[] = [
    {
      bodyId: 'Ascendant',
      bodyNameTe: 'జన్మ లగ్నం (Lagna)',
      glyph: 'Asc',
      rasiNameTe: TELUGU_RASIS[ascSignIdx]?.nameTe.split(' ')[0] ?? '',
      degreeInSignDMS: chart.ascendant.formattedDMS,
      absoluteSiderealDMS: formatDMS(chart.ascendant.siderealLon),
      nakshatraNameTe: TELUGU_NAKSHATRAS[ascKp.nakIdx]?.nameTe ?? chart.ascendant.nakshatra,
      pada: chart.ascendant.pada,
      rasiLordTe:
        TELUGU_PLANETS[SIGN_LORDS_ID[ascSignIdx]]?.nameTe.split(' ')[0] ?? '',
      nakshatraLordTe:
        TELUGU_PLANETS[ascKp.nakLordId]?.nameTe.split(' ')[0] ?? ascKp.nakLordId,
      subLordTe:
        TELUGU_PLANETS[ascKp.subLordId]?.nameTe.split(' ')[0] ?? ascKp.subLordId,
      subSubLordTe:
        TELUGU_PLANETS[ascKp.subSubLordId]?.nameTe.split(' ')[0] ?? ascKp.subSubLordId,
      houseNumber: 1,
      dignityTe: 'లగ్న కేంద్రం',
      motionStatusTe: 'స్థిరం',
    },
    ...chart.planets.slice(0, 9).map((p) => {
      const kp = calculateKpSubLord(p.siderealLon);
      const rasiLordId = SIGN_LORDS_ID[p.signIndex];
      return {
        bodyId: p.id,
        bodyNameTe: TELUGU_PLANETS[p.id]?.nameTe.split(' ')[0] ?? p.name,
        glyph: p.glyph,
        rasiNameTe: TELUGU_RASIS[p.signIndex]?.nameTe.split(' ')[0] ?? p.signName,
        degreeInSignDMS: p.formattedDMS,
        absoluteSiderealDMS: formatDMS(p.siderealLon),
        nakshatraNameTe: TELUGU_NAKSHATRAS[kp.nakIdx]?.nameTe ?? p.nakshatra,
        pada: p.pada,
        rasiLordTe: TELUGU_PLANETS[rasiLordId]?.nameTe.split(' ')[0] ?? rasiLordId,
        nakshatraLordTe:
          TELUGU_PLANETS[kp.nakLordId]?.nameTe.split(' ')[0] ?? kp.nakLordId,
        subLordTe:
          TELUGU_PLANETS[kp.subLordId]?.nameTe.split(' ')[0] ?? kp.subLordId,
        subSubLordTe:
          TELUGU_PLANETS[kp.subSubLordId]?.nameTe.split(' ')[0] ?? kp.subSubLordId,
        houseNumber: p.house,
        dignityTe:
          p.dignity === 'Exalted'
            ? 'ఉచ్చ స్థితి'
            : p.dignity === 'Moolatrikona'
              ? 'మూలత్రికోణం'
              : p.dignity === 'Own Sign'
                ? 'స్వక్షేత్రం'
                : p.dignity === 'Debilitated'
                  ? 'నీచ స్థితి'
                  : 'సమ/మిత్ర స్థితి',
        motionStatusTe: p.isRetrograde ? 'వక్రం (Rx)' : 'సవ్య గమనం',
      };
    }),
  ];

  // 3. Astro-Vision Favorable Points & Numerology (అదృష్ట సూచికల పట్టిక)
  const janmaSankhya = reduceToSingleDigit(bD || 1);
  const allDigitsSum = chart.input.date
    .replace(/-/g, '')
    .split('')
    .reduce((acc, ch) => acc + (parseInt(ch, 10) || 0), 0);
  const bhagyaSankhya = reduceToSingleDigit(allDigitsSum);

  const janmaNumMeta = NUMEROLOGY_PLANET_MAP[janmaSankhya] ?? NUMEROLOGY_PLANET_MAP[1];
  const bhagyaNumMeta = NUMEROLOGY_PLANET_MAP[bhagyaSankhya] ?? NUMEROLOGY_PLANET_MAP[1];

  const lagnaLordId = SIGN_LORDS_ID[ascSignIdx];
  const fifthLordId = SIGN_LORDS_ID[(ascSignIdx + 4) % 12];
  const ninthLordId = SIGN_LORDS_ID[(ascSignIdx + 8) % 12];
  const eighthLordId = SIGN_LORDS_ID[(ascSignIdx + 7) % 12];

  const lagnaGemMeta = PLANET_GEM_COLORS_DIRECTIONS[lagnaLordId] ?? PLANET_GEM_COLORS_DIRECTIONS.Sun;
  const fifthGemMeta = PLANET_GEM_COLORS_DIRECTIONS[fifthLordId] ?? PLANET_GEM_COLORS_DIRECTIONS.Jupiter;
  const ninthGemMeta = PLANET_GEM_COLORS_DIRECTIONS[ninthLordId] ?? PLANET_GEM_COLORS_DIRECTIONS.Venus;
  const eighthGemMeta = PLANET_GEM_COLORS_DIRECTIONS[eighthLordId] ?? PLANET_GEM_COLORS_DIRECTIONS.Saturn;

  const compatibleRasiIndices = [
    (moonSignIdx + 2) % 12,
    (moonSignIdx + 4) % 12,
    (moonSignIdx + 6) % 12,
    (moonSignIdx + 8) % 12,
    (moonSignIdx + 10) % 12,
  ];
  const compatibleRasisTe = compatibleRasiIndices
    .map((idx) => TELUGU_RASIS[idx]?.nameTe.split(' ')[0])
    .join(', ');

  const adrushtaSoochika: AstroVisionAdrushtaSoochika = {
    janmaSankhya,
    janmaSankhyaPlanetTe: janmaNumMeta.planetTe,
    bhagyaSankhya,
    bhagyaSankhyaPlanetTe: bhagyaNumMeta.planetTe,
    luckyNumbers: janmaNumMeta.luckyNums,
    friendlyNumbers: janmaNumMeta.friendlyNums,
    avoidNumbers: janmaNumMeta.avoidNums,
    luckyDaysTe: `${lagnaGemMeta.dayTe}, ${fifthGemMeta.dayTe}, ${ninthGemMeta.dayTe}`,
    avoidDaysTe: `${eighthGemMeta.dayTe} (అష్టమాధిపతి వారం — కీలక ఒప్పందాలకు నివారించండి)`,
    luckyColorsTe: `${lagnaGemMeta.colorTe} & ${ninthGemMeta.colorTe}`,
    avoidColorsTe: 'నలుపు & ముదురు బూడిద రంగు (శుభకార్యాలలో నివారించండి)',
    favorableDirectionTe: `${lagnaGemMeta.directionTe} & ${ninthGemMeta.directionTe}`,
    favorableMetalTe: lagnaGemMeta.metalTe,
    compatibleRasisTe,
    lifeGemstoneTe: `${lagnaGemMeta.gemTe} — లగ్నాధిపతి (${TELUGU_PLANETS[lagnaLordId]?.nameTe.split(' ')[0]})`,
    beneficGemstoneTe: `${fifthGemMeta.gemTe} — పంచమాధిపతి (${TELUGU_PLANETS[fifthLordId]?.nameTe.split(' ')[0]})`,
    fortuneGemstoneTe: `${ninthGemMeta.gemTe} — భాగ్యాధిపతి (${TELUGU_PLANETS[ninthLordId]?.nameTe.split(' ')[0]})`,
    numerologySynthesisTe: `జన్మ తేదీ (${bD}) ఆధారంగా మీ జన్మ సంఖ్య ${janmaSankhya} (${janmaNumMeta.planetTe}) మరియు సంపూర్ణ తేదీ ఆధారంగా భాగ్యాంకం ${bhagyaSankhya} (${bhagyaNumMeta.planetTe}). ${janmaNumMeta.natureTe} ముఖ్యమైన వాహన, గృహ, వ్యాపార మరియు బ్యాంకు సంఖ్యలలో ${janmaNumMeta.luckyNums} సంఖ్యలను ఎంచుకోవడం విశేష శుభప్రదం.`,
  };

  // 4. Astro-Vision Papa Samyam (Dosha Samya Point Table from Lagna, Moon, Venus)
  const maleficDefs = [
    { id: 'Mars', weight: 1.0 },
    { id: 'Saturn', weight: 0.75 },
    { id: 'Sun', weight: 0.5 },
    { id: 'Rahu', weight: 0.75 },
    { id: 'Ketu', weight: 0.5 },
  ];
  const papaHouses: Record<number, number> = {
    1: 1,
    2: 1,
    4: 1,
    7: 2,
    8: 2,
    12: 1,
  };

  let totalFromLagna = 0;
  let totalFromMoon = 0;
  let totalFromVenus = 0;

  const papaRows: PapaSamyamPlanetRow[] = maleficDefs.map((m) => {
    const pl = chart.planets.find((p) => p.id === m.id)!;
    const hLagna = ((pl.signIndex - ascSignIdx + 12) % 12) + 1;
    const hMoon = ((pl.signIndex - moonSignIdx + 12) % 12) + 1;
    const hVenus = ((pl.signIndex - venusSignIdx + 12) % 12) + 1;

    const ptLagna = (papaHouses[hLagna] ?? 0) * m.weight;
    const ptMoon = (papaHouses[hMoon] ?? 0) * m.weight;
    const ptVenus = (papaHouses[hVenus] ?? 0) * m.weight;

    totalFromLagna += ptLagna;
    totalFromMoon += ptMoon;
    totalFromVenus += ptVenus;

    return {
      planetId: m.id,
      planetNameTe: TELUGU_PLANETS[m.id]?.nameTe.split(' ')[0] ?? m.id,
      fromLagnaHouse: hLagna,
      fromLagnaPoints: ptLagna,
      fromMoonHouse: hMoon,
      fromMoonPoints: ptMoon,
      fromVenusHouse: hVenus,
      fromVenusPoints: ptVenus,
    };
  });

  const grandWeightedTotal = Number(
    (totalFromLagna + totalFromMoon * 0.5 + totalFromVenus * 0.5).toFixed(2)
  );
  const marsRow = papaRows[0];
  const hasKujaDosha =
    marsRow.fromLagnaPoints > 0 || marsRow.fromMoonPoints > 0;

  const papaSamyam: AstroVisionPapaSamyamReport = {
    rows: papaRows,
    totalFromLagna: Number(totalFromLagna.toFixed(2)),
    totalFromMoon: Number(totalFromMoon.toFixed(2)),
    totalFromVenus: Number(totalFromVenus.toFixed(2)),
    grandWeightedTotal,
    kujaDoshaStatusTe: hasKujaDosha
      ? `కుజ స్థితి: లగ్నం నుండి ${marsRow.fromLagnaHouse}వ ఇంట, చంద్రుని నుండి ${marsRow.fromMoonHouse}వ ఇంట కలదు (సమాన పాప సామ్యం ఉన్న జాతకంతో పొంతన శ్రేష్టం)`
      : 'నిర్దోష కుజ స్థితి (లగ్న, చంద్రుల నుండి కుజ దోషం లేదు)',
    marriageMatchingVerdictTe:
      grandWeightedTotal <= 3.5
        ? `మొత్తం పాప సామ్య విలువ ${grandWeightedTotal} పాయింట్లు (తక్కువ పాప భారం — అల్ప/నిర్దోష జాతకములతో వివాహ పొంతన ఉత్తమం).`
        : grandWeightedTotal <= 6.5
          ? `మొత్తం పాప సామ్య విలువ ${grandWeightedTotal} పాయింట్లు (మధ్యమ పాప సామ్యం — సమాన గ్రహ బలం గల వధూవరులతో వివాహ పొంతన శ్రేయస్కరం).`
          : `మొత్తం పాప సామ్య విలువ ${grandWeightedTotal} పాయింట్లు (అధిక పాప సామ్యం — తప్పనిసరిగా సమాన కుజ/పాప సామ్యం గల జాతకంతోనే వివాహం జరిపించాలి).`,
  };

  // 5. Lifetime Sade Sati (ఏలినాటి శని) & Timeline Event Markers Calculation
  // Saturn's mean sidereal speed = 360° / 29.4577 years = 12.220913° / year
  const saturnDegPerYear = 360 / 29.4577;
  const signYears = 30 / saturnDegPerYear; // ~2.4548 years per sign
  const saturnBirthLon = norm360(saturn.siderealLon);
  const sadeSatiStartLon = ((moonSignIdx + 11) % 12) * 30; // 0° of 12th sign from Moon

  // Distance in degrees from Saturn's natal position forward to 0° of 12th sign from Moon
  const rawDeltaDeg = norm360(sadeSatiStartLon - saturnBirthLon);
  let firstCycleStartAge = rawDeltaDeg / saturnDegPerYear;

  // If Saturn at birth was already inside the 90° Sade Sati arc (12th, 1st, or 2nd from Moon),
  // then rawDeltaDeg will be between 270° and 360°, meaning the cycle started slightly before birth!
  if (rawDeltaDeg > 270) {
    firstCycleStartAge = (rawDeltaDeg - 360) / saturnDegPerYear; // negative start age (started before birth)
  }

  const sadeSatiPhases: SadeSatiPhaseRow[] = [];
  const timelineEventMarkers: DashaTimelineEventMarker[] = [];

  const cycleTitles: Record<1 | 2 | 3, string> = {
    1: '1వ విడత ఏలినాటి శని (మొదటి చక్రం — విద్యా/ప్రారంభ పరీక్ష)',
    2: '2వ విడత ఏలినాటి శని (రెండవ చక్రం — వృత్తి/కుటుంబ పరిపక్వత)',
    3: '3వ విడత ఏలినాటి శని (మూడవ చక్రం — ఆరోగ్య/ఆధ్యాత్మిక రక్షణ)',
  };

  for (let c = 1; c <= 3; c++) {
    const cycleNum = c as 1 | 2 | 3;
    const cycleBaseAge = firstCycleStartAge + (c - 1) * 29.4577;

    const phases: {
      idx: 0 | 1 | 2;
      phaseNameTe: string;
      bodyPartTe: string;
      houseFromMoon: 12 | 1 | 2;
      signIdx: number;
      phalaTe: string;
    }[] = [
      {
        idx: 0,
        phaseNameTe: 'ఆరంభ పాదం (ద్వాదశ శని - 12వ ఇంట)',
        bodyPartTe: 'శిరస్సు (ఆలోచనలు & వ్యయం)',
        houseFromMoon: 12,
        signIdx: (moonSignIdx + 11) % 12,
        phalaTe: 'అనవసర వ్యయం, స్థాన చలనం, నిద్రలేమి నివారణకు శని స్తోత్ర పారాయణం & నువ్వుల దానం.',
      },
      {
        idx: 1,
        phaseNameTe: 'మధ్య పాదం (జన్మ శని - 1వ ఇంట)',
        bodyPartTe: 'హృదయం & దేహం (కర్మ పరీక్ష)',
        houseFromMoon: 1,
        signIdx: moonSignIdx,
        phalaTe: 'వృత్తి-కుటుంబ బాధ్యతల భారం, కఠిన శ్రమ. శనివారం తిల తైలాభిషేకం & ఆంజనేయ ఆరాధన.',
      },
      {
        idx: 2,
        phaseNameTe: 'అంత్య పాదం (ద్వితీయ శని - 2వ ఇంట)',
        bodyPartTe: 'పాదములు (వాక్కు & కుటుంబం)',
        houseFromMoon: 2,
        signIdx: (moonSignIdx + 1) % 12,
        phalaTe: 'వాక్ సంయమనం, ఆర్థిక పొదుపు అవసరం. రుద్ర నమక-చమక పారాయణం & అన్నదానం.',
      },
    ];

    for (const ph of phases) {
      const pStartAge = cycleBaseAge + ph.idx * signYears;
      const pEndAge = pStartAge + signYears;
      if (pEndAge <= 0 || pStartAge > 102) continue;

      const clampedStart = Math.max(0, pStartAge);
      const clampedEnd = Math.min(105, pEndAge);
      const midAge = (clampedStart + clampedEnd) / 2;

      const startFmt = formatAgeAndDate(birthDateUTC, clampedStart);
      const endFmt = formatAgeAndDate(birthDateUTC, clampedEnd);
      const overlap = findOverlappingDashaAndBhukti(chart.dashas, birthDateUTC, midAge);
      const isCurrent = currentAgeYears >= clampedStart && currentAgeYears <= clampedEnd;

      sadeSatiPhases.push({
        cycleNumber: cycleNum,
        cycleTitleTe: cycleTitles[cycleNum],
        phaseNameTe: ph.phaseNameTe,
        bodyPartTe: ph.bodyPartTe,
        transitRasiTe: TELUGU_RASIS[ph.signIdx]?.nameTe.split(' ')[0] ?? '',
        houseFromMoon: ph.houseFromMoon,
        startDateStr: startFmt.dateStr,
        endDateStr: endFmt.dateStr,
        startAge: `${clampedStart.toFixed(1)} సం.`,
        endAge: `${clampedEnd.toFixed(1)} సం.`,
        overlappingDashaTe: `${overlap.mahaLordTe} మహాదశ — ${overlap.bhuktiLordTe} భుక్తి`,
        isCurrent,
        phalaAndPariharaTe: ph.phalaTe,
      });
    }

    // Add full 7.5-year Sade Sati cycle marker to the visual timeline
    const fullStart = Math.max(0, cycleBaseAge);
    const fullEnd = Math.min(115, cycleBaseAge + 3 * signYears);
    if (fullEnd > 0 && fullStart < 105) {
      const mid = (fullStart + fullEnd) / 2;
      const overlap = findOverlappingDashaAndBhukti(chart.dashas, birthDateUTC, mid);
      const sFmt = formatAgeAndDate(birthDateUTC, fullStart);
      const eFmt = formatAgeAndDate(birthDateUTC, fullEnd);
      const isCurr = currentAgeYears >= fullStart && currentAgeYears <= fullEnd;

      const isBeneficDasha = ['Jupiter', 'Venus', 'Mercury', 'Moon'].includes(
        overlap.mahaLordId
      );

      timelineEventMarkers.push({
        id: `sade-sati-cycle-${c}`,
        category: 'sade_sati',
        categoryLabelTe: 'ఏలినాటి శని (7.5 సం.)',
        titleTe: `${c}వ విడత ఏలినాటి శని (${sFmt.yearNum}–${eFmt.yearNum})`,
        subtitleTe: `చంద్ర రాశి (${TELUGU_RASIS[moonSignIdx]?.nameTe.split(' ')[0]}) కి 12, 1, 2 స్థానములలో శని సంచారం`,
        startAge: Number(fullStart.toFixed(1)),
        endAge: Number(fullEnd.toFixed(1)),
        startDateStr: sFmt.dateStr,
        endDateStr: eFmt.dateStr,
        isCurrentNow: isCurr,
        severityOrNature: 'critical_test',
        badgeTe: `ఏలినాటి శని - ${c}వ చక్రం`,
        transitPlanetId: 'Saturn',
        transitSignIdx: moonSignIdx,
        transitSignTe: TELUGU_RASIS[moonSignIdx]?.nameTe.split(' ')[0] ?? '',
        houseFromMoon: 1,
        overlappingMahaLordId: overlap.mahaLordId,
        overlappingMahaLordTe: overlap.mahaLordTe,
        overlappingBhuktiLordTe: overlap.bhuktiLordTe,
        dashaGocharaSangamaTe: isBeneficDasha
          ? `ఈ ఏలినాటి శని కాలంలో మీకు శుభగ్రహమైన ${overlap.mahaLordTe} మహాదశ (${overlap.bhuktiLordTe} భుక్తి) నడుస్తున్నందున, ఫలదీపిక నియమం ప్రకారం ఏలినాటి శని కష్టాలు 70% తగ్గి, శ్రమకు తగిన స్థిర విజయం లభిస్తుంది.`
          : `ఈ ఏలినాటి శని కాలంలో ${overlap.mahaLordTe} మహాదశ (${overlap.bhuktiLordTe} భుక్తి) నడుస్తున్నందున దశా-గోచార పరీక్ష తీవ్రంగా ఉంటుంది. తొందరపాటు నిర్ణయాలు మాని, సహనంతో వ్యవహరించాలి.`,
        pariharaTe:
          'ప్రతి శనివారం శని భగవానునికి నువ్వుల నూనెతో అభిషేకం, హనుమాన్ చాలీసా పారాయణం మరియు నల్ల నువ్వుల దానం.',
      });
    }
  }

  // 6. Kantaka Shani: Ardhashtama (4th from Moon) & Ashtama Shani (8th from Moon)
  const fourthSignLon = ((moonSignIdx + 3) % 12) * 30;
  const eighthSignLon = ((moonSignIdx + 7) % 12) * 30;
  const firstFourthAge = norm360(fourthSignLon - saturnBirthLon) / saturnDegPerYear;
  const firstEighthAge = norm360(eighthSignLon - saturnBirthLon) / saturnDegPerYear;

  for (let c = 0; c < 3; c++) {
    const a4Start = firstFourthAge + c * 29.4577;
    const a4End = a4Start + signYears;
    if (a4Start < 95 && a4End > 0) {
      const mid = (a4Start + a4End) / 2;
      const overlap = findOverlappingDashaAndBhukti(chart.dashas, birthDateUTC, mid);
      const sFmt = formatAgeAndDate(birthDateUTC, a4Start);
      const eFmt = formatAgeAndDate(birthDateUTC, a4End);
      timelineEventMarkers.push({
        id: `ardhashtama-shani-${c + 1}`,
        category: 'kantaka_shani',
        categoryLabelTe: 'అర్ధాష్టమ శని (4వ ఇంట)',
        titleTe: `అర్ధాష్టమ శని - ${c + 1}వ చక్రం (${sFmt.yearNum}–${eFmt.yearNum})`,
        subtitleTe: `చంద్రుని నుండి 4వ ఇంట (${TELUGU_RASIS[(moonSignIdx + 3) % 12]?.nameTe.split(' ')[0]}) శని సంచారం`,
        startAge: Number(a4Start.toFixed(1)),
        endAge: Number(a4End.toFixed(1)),
        startDateStr: sFmt.dateStr,
        endDateStr: eFmt.dateStr,
        isCurrentNow: currentAgeYears >= a4Start && currentAgeYears <= a4End,
        severityOrNature: 'caution',
        badgeTe: 'అర్ధాష్టమ శని (2.5 సం.)',
        transitPlanetId: 'Saturn',
        transitSignIdx: (moonSignIdx + 3) % 12,
        transitSignTe: TELUGU_RASIS[(moonSignIdx + 3) % 12]?.nameTe.split(' ')[0] ?? '',
        houseFromMoon: 4,
        overlappingMahaLordId: overlap.mahaLordId,
        overlappingMahaLordTe: overlap.mahaLordTe,
        overlappingBhuktiLordTe: overlap.bhuktiLordTe,
        dashaGocharaSangamaTe: `${overlap.mahaLordTe} మహాదశ — ${overlap.bhuktiLordTe} భుక్తి కాలంలో అర్ధాష్టమ శని వల్ల గృహ మార్పు, వాహన/మాతృ సంబంధిత బాధ్యతలు పెరుగుతాయి.`,
        pariharaTe: 'శనివారం శివాభిషేకం మరియు ఆంజనేయ స్వామికి తమలపాకుల పూజ.',
      });
    }

    const a8Start = firstEighthAge + c * 29.4577;
    const a8End = a8Start + signYears;
    if (a8Start < 95 && a8End > 0) {
      const mid = (a8Start + a8End) / 2;
      const overlap = findOverlappingDashaAndBhukti(chart.dashas, birthDateUTC, mid);
      const sFmt = formatAgeAndDate(birthDateUTC, a8Start);
      const eFmt = formatAgeAndDate(birthDateUTC, a8End);
      timelineEventMarkers.push({
        id: `ashtama-shani-${c + 1}`,
        category: 'kantaka_shani',
        categoryLabelTe: 'అష్టమ శని (8వ ఇంట)',
        titleTe: `అష్టమ శని - ${c + 1}వ చక్రం (${sFmt.yearNum}–${eFmt.yearNum})`,
        subtitleTe: `చంద్రుని నుండి 8వ ఇంట (${TELUGU_RASIS[(moonSignIdx + 7) % 12]?.nameTe.split(' ')[0]}) శని సంచారం`,
        startAge: Number(a8Start.toFixed(1)),
        endAge: Number(a8End.toFixed(1)),
        startDateStr: sFmt.dateStr,
        endDateStr: eFmt.dateStr,
        isCurrentNow: currentAgeYears >= a8Start && currentAgeYears <= a8End,
        severityOrNature: 'critical_test',
        badgeTe: 'అష్టమ శని (2.5 సం.)',
        transitPlanetId: 'Saturn',
        transitSignIdx: (moonSignIdx + 7) % 12,
        transitSignTe: TELUGU_RASIS[(moonSignIdx + 7) % 12]?.nameTe.split(' ')[0] ?? '',
        houseFromMoon: 8,
        overlappingMahaLordId: overlap.mahaLordId,
        overlappingMahaLordTe: overlap.mahaLordTe,
        overlappingBhuktiLordTe: overlap.bhuktiLordTe,
        dashaGocharaSangamaTe: `${overlap.mahaLordTe} మహాదశలో అష్టమ శని సంచారం వల్ల ఆరోగ్య శ్రద్ధ, ఆర్థిక పెట్టుబడులలో జాగ్రత్త అవసరం. ఆకస్మిక ఆటంకాలు దాటడానికి మహామృత్యుంజయ జపం రక్షాకవచం.`,
        pariharaTe: 'శని త్రయోదశి నాడు తిల తైలాభిషేకం మరియు మహామృత్యుంజయ మంత్ర జపం.',
      });
    }
  }

  // 7. Major Planetary Returns (గురు పుష్కర పునరాగమనం & శని కర్మ పునరాగమనం)
  const jupiter = chart.planets.find((p) => p.id === 'Jupiter')!;
  const guruReturnAges = [11.86, 23.72, 35.58, 47.45, 59.31, 71.17, 83.03];
  guruReturnAges.forEach((age, idx) => {
    const sAge = age - 0.5;
    const eAge = age + 0.5;
    const overlap = findOverlappingDashaAndBhukti(chart.dashas, birthDateUTC, age);
    const sFmt = formatAgeAndDate(birthDateUTC, sAge);
    const eFmt = formatAgeAndDate(birthDateUTC, eAge);
    timelineEventMarkers.push({
      id: `guru-return-${idx + 1}`,
      category: 'planetary_return',
      categoryLabelTe: 'గురు పునరాగమనం (12 సం. చక్రం)',
      titleTe: `${idx + 1}వ బృహస్పతి పుష్కర చక్రం (వయస్సు ${Math.round(age)} సం. · ${sFmt.yearNum})`,
      subtitleTe: `జన్మ గురు రాశి (${TELUGU_RASIS[jupiter.signIndex]?.nameTe.split(' ')[0]}) లోకి గోచార గురు పునరాగమనం`,
      startAge: Number(sAge.toFixed(1)),
      endAge: Number(eAge.toFixed(1)),
      startDateStr: sFmt.dateStr,
      endDateStr: eFmt.dateStr,
      isCurrentNow: currentAgeYears >= sAge && currentAgeYears <= eAge,
      severityOrNature: 'auspicious',
      badgeTe: `${Math.round(age)}వ ఏట గురు బలం`,
      transitPlanetId: 'Jupiter',
      transitSignIdx: jupiter.signIndex,
      transitSignTe: TELUGU_RASIS[jupiter.signIndex]?.nameTe.split(' ')[0] ?? '',
      houseFromMoon: ((jupiter.signIndex - moonSignIdx + 12) % 12) + 1,
      overlappingMahaLordId: overlap.mahaLordId,
      overlappingMahaLordTe: overlap.mahaLordTe,
      overlappingBhuktiLordTe: overlap.bhuktiLordTe,
      dashaGocharaSangamaTe: `${overlap.mahaLordTe} మహాదశ (${overlap.bhuktiLordTe} భుక్తి) తో ${idx + 1}వ బృహస్పతి పునరాగమన సంగమం వల్ల ఆత్మజ్ఞానం, ఉన్నత అవకాశాలు, శుభకార్య సిద్ధి మరియు దైవానుగ్రహం కలుగుతాయి.`,
      pariharaTe: 'గురువారం దక్షిణామూర్తి / దత్తాత్రేయ ఆరాధన మరియు శనగల దానం.',
    });
  });

  // Saturn Returns (~29.5, ~59.0, ~88.5)
  [29.46, 58.92, 88.38].forEach((age, idx) => {
    const sAge = age - 1.2;
    const eAge = age + 1.2;
    const overlap = findOverlappingDashaAndBhukti(chart.dashas, birthDateUTC, age);
    const sFmt = formatAgeAndDate(birthDateUTC, sAge);
    const eFmt = formatAgeAndDate(birthDateUTC, eAge);
    timelineEventMarkers.push({
      id: `saturn-return-${idx + 1}`,
      category: 'planetary_return',
      categoryLabelTe: 'శని పునరాగమనం (30 సం. చక్రం)',
      titleTe: `${idx + 1}వ శని కర్మ పునరాగమనం (వయస్సు ${Math.round(age)} సం. · ${sFmt.yearNum})`,
      subtitleTe: `జన్మ శని రాశి (${TELUGU_RASIS[saturn.signIndex]?.nameTe.split(' ')[0]}) లోకి గోచార శని పునరాగమనం`,
      startAge: Number(sAge.toFixed(1)),
      endAge: Number(eAge.toFixed(1)),
      startDateStr: sFmt.dateStr,
      endDateStr: eFmt.dateStr,
      isCurrentNow: currentAgeYears >= sAge && currentAgeYears <= eAge,
      severityOrNature: 'spiritual_milestone',
      badgeTe: `${Math.round(age)}వ ఏట కర్మ మలుపు`,
      transitPlanetId: 'Saturn',
      transitSignIdx: saturn.signIndex,
      transitSignTe: TELUGU_RASIS[saturn.signIndex]?.nameTe.split(' ')[0] ?? '',
      houseFromMoon: ((saturn.signIndex - moonSignIdx + 12) % 12) + 1,
      overlappingMahaLordId: overlap.mahaLordId,
      overlappingMahaLordTe: overlap.mahaLordTe,
      overlappingBhuktiLordTe: overlap.bhuktiLordTe,
      dashaGocharaSangamaTe: `${Math.round(age)}వ ఏట శని పునరాగమనం జీవితంలో కీలక బాధ్యతలు, వృత్తి స్థిరత్వం మరియు కర్మ పరిపక్వతను ఇస్తుంది. ${overlap.mahaLordTe} మహాదశతో కలిసి జీవిత దిశను స్థిరపరుస్తుంది.`,
      pariharaTe: 'శనివారం వేంకటేశ్వర / శివ ఆరాధన మరియు పేదలకు అన్నదానం.',
    });
  });

  // 8. Critical Life Event Milestones (విద్య, వివాహ, రాజయోగ, గృహయోగ, షష్టిపూర్తి ఘట్టాలు)
  const seventhLordId = SIGN_LORDS_ID[(ascSignIdx + 6) % 12];
  const tenthLordId = SIGN_LORDS_ID[(ascSignIdx + 9) % 12];
  const fourthLordId = SIGN_LORDS_ID[(ascSignIdx + 3) % 12];

  // Find favorable Marriage window between ages 21 and 32
  let marriageAge = 25.5;
  for (let a = 21; a <= 31; a += 1) {
    const ov = findOverlappingDashaAndBhukti(chart.dashas, birthDateUTC, a);
    if (
      [seventhLordId, 'Venus', 'Jupiter', 'Moon'].includes(ov.bhuktiLordId) ||
      [seventhLordId, 'Venus', 'Jupiter'].includes(ov.mahaLordId)
    ) {
      marriageAge = a;
      break;
    }
  }
  const marOverlap = findOverlappingDashaAndBhukti(chart.dashas, birthDateUTC, marriageAge);
  const marSFmt = formatAgeAndDate(birthDateUTC, marriageAge - 1);
  const marEFmt = formatAgeAndDate(birthDateUTC, marriageAge + 1.5);
  timelineEventMarkers.push({
    id: 'milestone-vivaha-yoga',
    category: 'life_milestone',
    categoryLabelTe: 'ప్రధాన జీవిత ఘట్టం',
    titleTe: `వివాహ & కుటుంబ యోగ ఘట్టం (${marSFmt.yearNum}–${marEFmt.yearNum})`,
    subtitleTe: `సప్తమాధిపతి (${TELUGU_PLANETS[seventhLordId]?.nameTe.split(' ')[0]}) & శుక్ర/గురు దశా-గోచార అనుగ్రహం`,
    startAge: Number((marriageAge - 1).toFixed(1)),
    endAge: Number((marriageAge + 1.5).toFixed(1)),
    startDateStr: marSFmt.dateStr,
    endDateStr: marEFmt.dateStr,
    isCurrentNow: currentAgeYears >= marriageAge - 1 && currentAgeYears <= marriageAge + 1.5,
    severityOrNature: 'auspicious',
    badgeTe: 'వివాహ / శుభకార్య యోగం',
    transitPlanetId: 'Venus',
    transitSignIdx: (ascSignIdx + 6) % 12,
    transitSignTe: TELUGU_RASIS[(ascSignIdx + 6) % 12]?.nameTe.split(' ')[0] ?? '',
    houseFromMoon: 7,
    overlappingMahaLordId: marOverlap.mahaLordId,
    overlappingMahaLordTe: marOverlap.mahaLordTe,
    overlappingBhuktiLordTe: marOverlap.bhuktiLordTe,
    dashaGocharaSangamaTe: `${marOverlap.mahaLordTe} మహాదశ — ${marOverlap.bhuktiLordTe} భుక్తి కాలంలో కళత్ర కారక బలం మరియు గురు దృష్టి వల్ల వివాహ శుభకార్య సిద్ధి, కుటుంబ వృద్ధి కలుగుతాయి.`,
    pariharaTe: 'శుక్రవారం లక్ష్మీ-నారాయణ / గౌరీ పూజ మరియు రుక్మిణీ కల్యాణ పారాయణం.',
  });

  // Find Career / Rajayoga Peak between ages 28 and 45
  let careerAge = 33.5;
  for (let a = 28; a <= 44; a += 1.5) {
    const ov = findOverlappingDashaAndBhukti(chart.dashas, birthDateUTC, a);
    if (
      [tenthLordId, ninthLordId, lagnaLordId, 'Sun', 'Jupiter'].includes(ov.bhuktiLordId)
    ) {
      careerAge = a;
      break;
    }
  }
  const carOverlap = findOverlappingDashaAndBhukti(chart.dashas, birthDateUTC, careerAge);
  const carSFmt = formatAgeAndDate(birthDateUTC, careerAge - 1.5);
  const carEFmt = formatAgeAndDate(birthDateUTC, careerAge + 2);
  timelineEventMarkers.push({
    id: 'milestone-career-rajayoga',
    category: 'life_milestone',
    categoryLabelTe: 'ప్రధాన జీవిత ఘట్టం',
    titleTe: `వృత్తి, అధికార & రాజయోగ శిఖర ఘట్టం (${carSFmt.yearNum}–${carEFmt.yearNum})`,
    subtitleTe: `దశమాధిపతి (${TELUGU_PLANETS[tenthLordId]?.nameTe.split(' ')[0]}) & భాగ్యాధిపతి (${TELUGU_PLANETS[ninthLordId]?.nameTe.split(' ')[0]}) రాజయోగ కాలం`,
    startAge: Number((careerAge - 1.5).toFixed(1)),
    endAge: Number((careerAge + 2).toFixed(1)),
    startDateStr: carSFmt.dateStr,
    endDateStr: carEFmt.dateStr,
    isCurrentNow: currentAgeYears >= careerAge - 1.5 && currentAgeYears <= careerAge + 2,
    severityOrNature: 'auspicious',
    badgeTe: 'రాజయోగ & ధన శిఖరం',
    transitPlanetId: 'Jupiter',
    transitSignIdx: (ascSignIdx + 9) % 12,
    transitSignTe: TELUGU_RASIS[(ascSignIdx + 9) % 12]?.nameTe.split(' ')[0] ?? '',
    houseFromMoon: 10,
    overlappingMahaLordId: carOverlap.mahaLordId,
    overlappingMahaLordTe: carOverlap.mahaLordTe,
    overlappingBhuktiLordTe: carOverlap.bhuktiLordTe,
    dashaGocharaSangamaTe: `${carOverlap.mahaLordTe} మహాదశ — ${carOverlap.bhuktiLordTe} భుక్తి కాలంలో దశమ-భాగ్య బలం వల్ల ఉద్యోగ/వ్యాపార రంగాలలో ఉన్నత పదవి, స్వంత గృహ/ఆస్తి వృద్ధి మరియు సమాజ గౌరవం లభిస్తాయి.`,
    pariharaTe: 'గురువారం శ్రీ వేంకటేశ్వర / విష్ణు సహస్రనామ పారాయణం.',
  });

  // Gruha & Bhoo Sampada Milestone
  const gruhaAge = careerAge + 5.5;
  const grOverlap = findOverlappingDashaAndBhukti(chart.dashas, birthDateUTC, gruhaAge);
  const grSFmt = formatAgeAndDate(birthDateUTC, gruhaAge - 1);
  const grEFmt = formatAgeAndDate(birthDateUTC, gruhaAge + 1.5);
  timelineEventMarkers.push({
    id: 'milestone-gruha-sampada',
    category: 'life_milestone',
    categoryLabelTe: 'ప్రధాన జీవిత ఘట్టం',
    titleTe: `గృహ నిర్మాణ & స్థిరాస్తి వృద్ధి ఘట్టం (${grSFmt.yearNum}–${grEFmt.yearNum})`,
    subtitleTe: `చతుర్థాధిపతి (${TELUGU_PLANETS[fourthLordId]?.nameTe.split(' ')[0]}) & కుజ-శుక్ర అనుగ్రహ కాలం`,
    startAge: Number((gruhaAge - 1).toFixed(1)),
    endAge: Number((gruhaAge + 1.5).toFixed(1)),
    startDateStr: grSFmt.dateStr,
    endDateStr: grEFmt.dateStr,
    isCurrentNow: currentAgeYears >= gruhaAge - 1 && currentAgeYears <= gruhaAge + 1.5,
    severityOrNature: 'auspicious',
    badgeTe: 'గృహ & భూ సంపద యోగం',
    transitPlanetId: 'Mars',
    transitSignIdx: (ascSignIdx + 3) % 12,
    transitSignTe: TELUGU_RASIS[(ascSignIdx + 3) % 12]?.nameTe.split(' ')[0] ?? '',
    houseFromMoon: 4,
    overlappingMahaLordId: grOverlap.mahaLordId,
    overlappingMahaLordTe: grOverlap.mahaLordTe,
    overlappingBhuktiLordTe: grOverlap.bhuktiLordTe,
    dashaGocharaSangamaTe: `${grOverlap.mahaLordTe} మహాదశ — ${grOverlap.bhuktiLordTe} భుక్తి కాలంలో చతుర్థ-లాభ భావాల బలం వల్ల స్వంత గృహ యోగం, భూమి మరియు వాహన ప్రాప్తి కలుగుతాయి.`,
    pariharaTe: 'వాస్తు పురుష ప్రీతి మరియు లక్ష్మీ-నరసింహ ఆరాధన.',
  });

  timelineEventMarkers.sort((a, b) => a.startAge - b.startAge);

  return {
    kaliDinaSankhya,
    dinamanaHoursTe,
    ratrimanaHoursTe,
    nirayanaSphutaTable,
    adrushtaSoochika,
    papaSamyam,
    sadeSatiPhases,
    timelineEventMarkers,
  };
}

export interface TransitIntensityHeatmapSlice {
  yearIndex: number;
  age: number; // e.g. 28
  calendarYear: number; // e.g. 2026
  activeMahaLord: string;
  activeMahaLordTe: string;
  activeBhuktiLord: string;
  activeBhuktiLordTe: string;

  saturnTransitImpact: {
    transitSignIdx: number;
    transitSignTe: string;
    aspectOrHouseOnLord: string;
    intensityScore: number;
    impactType: 'heavy_pressure' | 'karmic_test' | 'discipline' | 'neutral';
    descriptionTe: string;
  };

  jupiterTransitImpact: {
    transitSignIdx: number;
    transitSignTe: string;
    aspectOrHouseOnLord: string;
    intensityScore: number;
    impactType: 'supreme_blessing' | 'golden_growth' | 'expansion' | 'neutral';
    descriptionTe: string;
  };

  rahuKetuTransitImpact: {
    transitSignIdx: number;
    transitSignTe: string;
    isOverLord: boolean;
    intensityScore: number;
    descriptionTe: string;
  };

  compositeIntensityScore: number; // 0..100
  intensityColor: string;
  intensityLevelTe:
    | 'అత్యున్నత శుభ యోగ తీవ్రత (Supreme Growth)'
    | 'మధ్యమ అనుకూలత (Favorable Flow)'
    | 'సాధారణ సమతుల్యత (Balanced Neutral)'
    | 'తీవ్ర కర్మ పరీక్ష / శని ఒత్తిడి (High Karmic Friction)'
    | 'పరివర్తన కాలం (Karmic Shift)';
  predictiveAccuracyVerdictTe: string;
  recommendedFocusTe: string;
}

/**
 * Computes a detailed year-by-year Transit Intensity Heatmap (Ages 0 to 90)
 * overlaid on the native's Vimshottari Dasha timeline, analyzing how major
 * planetary transits (Saturn, Jupiter, Rahu) directly impact the active Dasha Lord.
 */
export function generateTransitIntensityHeatmap(
  chart: CompleteChartResult
): TransitIntensityHeatmapSlice[] {
  const birthDateUTC = new Date(chart.utcIso);
  const birthYear = birthDateUTC.getUTCFullYear() || 1995;

  const saturn = chart.planets.find((p) => p.id === 'Saturn')!;
  const jupiter = chart.planets.find((p) => p.id === 'Jupiter')!;
  const rahu = chart.planets.find((p) => p.id === 'Rahu')!;

  const slices: TransitIntensityHeatmapSlice[] = [];

  // 1-year slices from age 0 to 90
  for (let age = 0; age <= 90; age++) {
    const calendarYear = birthYear + age;
    const overlap = findOverlappingDashaAndBhukti(chart.dashas, birthDateUTC, age + 0.5);
    const mahaLord = overlap.mahaLordId;
    const mahaLordObj = chart.planets.find((p) => p.id === mahaLord);
    const mahaSignIdx = mahaLordObj?.signIndex ?? 0;

    // Saturn transit position (~2.455 years per sign)
    const satSignIdx = (saturn.signIndex + Math.floor(age / 2.455)) % 12;
    const satSignTe = TELUGU_RASIS[satSignIdx]?.nameTe.split(' ')[0] ?? '';
    const satHouseFromLord = ((satSignIdx - mahaSignIdx + 12) % 12) + 1;

    let satAspectTe = 'సాధారణ సంచారం (సహజ స్థితి)';
    let satIntensity = 25;
    let satImpactType: TransitIntensityHeatmapSlice['saturnTransitImpact']['impactType'] = 'neutral';
    let satDesc = `గోచార శని ${satSignTe} రాశిలో సంచరిస్తున్నాడు. దశానాథునిపై ప్రత్యక్ష పాప దృష్టి లేదు.`;

    if (satHouseFromLord === 1) {
      satAspectTe = 'ఏకరాశి యుతి (1st — దశానాథునిపై ప్రత్యక్ష శని గోచారం)';
      satIntensity = 95;
      satImpactType = 'heavy_pressure';
      satDesc = `గోచార శని నేరుగా మహాదశానాథుడైన ${overlap.mahaLordTe} రాశిలోనే సంచరిస్తున్నందున శరీర అలసట, వృత్తిపరమైన పెను బాధ్యతలు మరియు తీవ్ర క్రమశిక్షణా పరీక్షా కాలం.`;
    } else if (satHouseFromLord === 4) {
      satAspectTe = '10వ కర్మ దృష్టి (Saturn 10th Aspect on Dasha Lord)';
      satIntensity = 85;
      satImpactType = 'karmic_test';
      satDesc = `గోచార శని తన 10వ ప్రత్యేక దృష్టిని మహాదశానాథునిపై సారిస్తున్నందున ఉద్యోగంలో శ్రమ అధికమగును; ఓర్పుతో కూడిన దీర్ఘకాలిక ఫలితాలు అందుతాయి.`;
    } else if (satHouseFromLord === 7) {
      satAspectTe = '7వ సంపూర్ణ సమసప్తక దృష్టి (Opposing Aspect)';
      satIntensity = 80;
      satImpactType = 'karmic_test';
      satDesc = `గోచార శని దశానాథునితో 180° ప్రత్యక్ష సంబంధాన్ని ఏర్పరుస్తున్నాడు. భాగస్వామ్యాలు మరియు మానసిక స్థిరత్వం పట్ల అప్రమత్తత అవసరం.`;
    } else if (satHouseFromLord === 11) {
      satAspectTe = '3వ పరాక్రమ దృష్టి (Saturn 3rd Aspect)';
      satIntensity = 75;
      satImpactType = 'discipline';
      satDesc = `గోచార శని 3వ దృష్టితో దశానాథుని ప్రభావితం చేస్తున్నాడు. స్వయంకృషి, ధైర్యసాహసాలు మరియు కొత్త నైపుణ్యాల ఆర్జనకు ప్రేరణ లభిస్తుంది.`;
    } else if (satHouseFromLord === 8) {
      satAspectTe = 'అష్టమ గోచారం (8th from Dasha Lord — జాప్య కాలం)';
      satIntensity = 85;
      satImpactType = 'heavy_pressure';
      satDesc = `దశానాథునికి 8వ రాశిలో శని సంచారం పనులలో అనుకోని జాప్యం, ఆరోగ్య శ్రద్ధను సూచిస్తుంది. పరిహార జపాలు మేలు చేస్తాయి.`;
    }

    // Jupiter transit position (~0.988 years per sign)
    const jupSignIdx = (jupiter.signIndex + Math.floor(age / 0.988)) % 12;
    const jupSignTe = TELUGU_RASIS[jupSignIdx]?.nameTe.split(' ')[0] ?? '';
    const jupHouseFromLord = ((jupSignIdx - mahaSignIdx + 12) % 12) + 1;

    let jupAspectTe = 'సాధారణ సంచారం';
    let jupIntensity = 30;
    let jupImpactType: TransitIntensityHeatmapSlice['jupiterTransitImpact']['impactType'] = 'neutral';
    let jupDesc = `గోచార బృహస్పతి ${jupSignTe} రాశిలో సంచరిస్తున్నాడు.`;

    if (jupHouseFromLord === 1) {
      jupAspectTe = 'యుతి (1st — దశానాథునితో గురు సంగమం)';
      jupIntensity = 95;
      jupImpactType = 'supreme_blessing';
      jupDesc = `దేవగురువు గోచారంలో నేరుగా దశానాథునితో కలవడంతో ఆత్మవిశ్వాసం, జ్ఞానోదయం, గౌరవ ప్రతిష్టలు మరియు రాజపూజిత యోగం సిద్ధిస్తుంది.`;
    } else if (jupHouseFromLord === 5 || jupHouseFromLord === 9) {
      jupAspectTe = 'అమృత త్రికోణ దృష్టి (5/9 Trine Amrita Drishti)';
      jupIntensity = 98;
      jupImpactType = 'supreme_blessing';
      jupDesc = `గోచార గురుని అత్యుత్తమ అమృత దృష్టి దశానాథునిపై పడుతున్నది! ఇది పూర్వపుణ్య ప్రాప్తి, విద్యా-సంతాన-వివాహ యోగాలు మరియు ఆర్థిక పురోగతిని ప్రసాదిస్తుంది.`;
    } else if ([4, 7, 10].includes(jupHouseFromLord)) {
      jupAspectTe = 'కేంద్ర శుభ దృష్టి / స్థితి (Kendra Activation)';
      jupIntensity = 85;
      jupImpactType = 'golden_growth';
      jupDesc = `దశానాథునికి కేంద్ర స్థానంలో గురు సంచారం గృహ-వాహన సౌఖ్యం, ఉద్యోగంలో పదోన్నతి మరియు పెద్దల ఆశీస్సులను తెస్తుంది.`;
    } else if (jupHouseFromLord === 11) {
      jupAspectTe = 'ఏకాదశ లాభ గోచారం (11th House Gain)';
      jupIntensity = 90;
      jupImpactType = 'expansion';
      jupDesc = `దశానాథునికి 11వ స్థానంలో గురువు అభీష్ట సిద్ధి, వ్యాపార లాభాలు మరియు నూతన ఒప్పందాలను నెరవేరుస్తాడు.`;
    }

    // Rahu/Ketu transit position (~1.5 years per sign retrograde)
    const rahuSignIdx = ((rahu.signIndex - Math.floor(age / 1.5)) % 12 + 12) % 12;
    const isOverLord = rahuSignIdx === mahaSignIdx || ((rahuSignIdx + 6) % 12) === mahaSignIdx;
    const rahuIntensity = isOverLord ? 80 : 20;
    const rahuDesc = isOverLord
      ? `రాహు-కేతువుల అక్షం నేరుగా మహాదశానాథుని మీదుగా సంచరిస్తున్నందున ఆకస్మిక మార్పులు, విదేశీయాన అవకాశాలు లేదా రహస్య పరిణామాలు సంభవిస్తాయి.`
      : `రాహు సంచారం సహజ గతిలో ఉన్నది.`;

    // Composite Calculation
    let compScore = Math.round(jupIntensity * 0.55 + (100 - satIntensity) * 0.35 + (100 - rahuIntensity) * 0.1);
    let color = '#3B82F6';
    let levelTe: TransitIntensityHeatmapSlice['intensityLevelTe'] = 'సాధారణ సమతుల్యత (Balanced Neutral)';
    let predVerdict = '';
    let recFocus = '';

    if (jupIntensity >= 90 && satIntensity <= 50) {
      color = '#10B981'; // Emerald Green
      levelTe = 'అత్యున్నత శుభ యోగ తీవ్రత (Supreme Growth)';
      compScore = Math.max(88, compScore);
      predVerdict = `ఈ కాలంలో ${overlap.mahaLordTe} దశకు గోచార గురుని సంపూర్ణ రక్షణా కవచం లభిస్తోంది. పెద్దల సహాయంతో తలపెట్టిన సకల శుభకార్యాలు, వృత్తి విస్తరణ మరియు ఆస్తి వృద్ధి వేగవంతమవుతాయి.`;
      recFocus = 'నూతన ఒప్పందాలు, స్థిరాస్తి కొనుగోలు, వివాహం లేదా ఉన్నత విద్య ఆరంభానికి అత్యుత్తమ సమయం.';
    } else if (satIntensity >= 85 && jupIntensity < 70) {
      color = '#EF4444'; // Crimson Red
      levelTe = 'తీవ్ర కర్మ పరీక్ష / శని ఒత్తిడి (High Karmic Friction)';
      compScore = Math.min(35, compScore);
      predVerdict = `గోచార శని దశానాథునిపై కఠిన దృష్టిని సారిస్తున్నందున పనిలో అలసత్వం పనికిరాదు. గత తప్పులను సరిదిద్దుకుని, పట్టుదలతో శ్రమించినప్పుడే స్థిరమైన పురోగతి లభిస్తుంది.`;
      recFocus = 'ఆరోగ్య సంరక్షణ, క్రమశిక్షణ, ఋణ నివారణ మరియు శని-శివ ఆరాధనపై దృష్టి పెట్టండి.';
    } else if (jupIntensity >= 80 && satIntensity >= 75) {
      color = '#8B5CF6'; // Purple (Amrita + Crucible Tension)
      levelTe = 'పరివర్తన కాలం (Karmic Shift)';
      compScore = 65;
      predVerdict = `గురు-శనుల ద్వంద్వ ప్రభావం వలన ఒకవైపు బాధ్యతలు పెరుగుతూనే, మరొకవైపు అదృష్ట దారులు తెరుచుకుంటాయి. తీవ్ర శ్రమతో కూడిన గొప్ప ఘనత సాధించే సంధికాలం.`;
      recFocus = 'బాధ్యతలను స్వీకరించండి; సవాళ్లను అవకాశాలుగా మార్చుకునే మానసిక స్థైర్యాన్ని కలిగి ఉండండి.';
    } else if (jupIntensity >= 70) {
      color = '#F59E0B'; // Bright Amber/Gold
      levelTe = 'మధ్యమ అనుకూలత (Favorable Flow)';
      compScore = 74;
      predVerdict = `శుభ ఫలితాల వైపు మొగ్గు ఉన్న కాలం. దశా ప్రణాళికలు సజావుగా ముందుకు సాగుతాయి.`;
      recFocus = 'పనులను వేగవంతం చేసి సకాలంలో పూర్తి చేయడానికి అనుకూలం.';
    } else {
      color = '#64748B'; // Slate Blue
      levelTe = 'సాధారణ సమతుల్యత (Balanced Neutral)';
      compScore = 55;
      predVerdict = `దశానాథునిపై గోచార గ్రహాల ప్రభావం సాధారణంగా ఉన్నది. దినచర్యను యథావిధిగా నిర్వహించుకోవచ్చు.`;
      recFocus = 'స్థిరమైన దినచర్య మరియు ఆధ్యాత్మిక సాధన కొనసాగించండి.';
    }

    slices.push({
      yearIndex: age,
      age,
      calendarYear,
      activeMahaLord: mahaLord,
      activeMahaLordTe: overlap.mahaLordTe,
      activeBhuktiLord: overlap.bhuktiLordId,
      activeBhuktiLordTe: overlap.bhuktiLordTe,
      saturnTransitImpact: {
        transitSignIdx: satSignIdx,
        transitSignTe: satSignTe,
        aspectOrHouseOnLord: satAspectTe,
        intensityScore: satIntensity,
        impactType: satImpactType,
        descriptionTe: satDesc,
      },
      jupiterTransitImpact: {
        transitSignIdx: jupSignIdx,
        transitSignTe: jupSignTe,
        aspectOrHouseOnLord: jupAspectTe,
        intensityScore: jupIntensity,
        impactType: jupImpactType,
        descriptionTe: jupDesc,
      },
      rahuKetuTransitImpact: {
        transitSignIdx: rahuSignIdx,
        transitSignTe: TELUGU_RASIS[rahuSignIdx]?.nameTe.split(' ')[0] ?? '',
        isOverLord,
        intensityScore: rahuIntensity,
        descriptionTe: rahuDesc,
      },
      compositeIntensityScore: compScore,
      intensityColor: color,
      intensityLevelTe: levelTe,
      predictiveAccuracyVerdictTe: predVerdict,
      recommendedFocusTe: recFocus,
    });
  }

  return slices;
}
