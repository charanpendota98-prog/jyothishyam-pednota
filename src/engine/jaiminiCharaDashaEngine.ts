import type { CompleteChartResult, PlanetPosition } from './ephemeris.ts';
import { TELUGU_PLANETS, TELUGU_RASIS } from './teluguJathakam.ts';

export type JaiminiDashaSchool = 'kn_rao' | 'parashara_traditional';

export interface JaiminiCharaKarakaInfo {
  karakaCode: 'AK' | 'AmK' | 'BK' | 'MK' | 'PK' | 'GK' | 'DK';
  karakaNameTe: string;
  karakaNameEn: string;
  significanceTe: string;
  planetId: string;
  planetNameTe: string;
  degreeInSign: number;
  degreeDMS: string;
  rasiIndex: number;
  rasiNameTe: string;
  navamsaIndex: number;
  navamsaNameTe: string;
}

export interface JaiminiCharaPratyantardasha {
  rasiIndex: number;
  rasiNameTe: string;
  rasiNameEn: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  isCurrent: boolean;
}

export interface JaiminiCharaAntardasha {
  rasiIndex: number;
  rasiNameTe: string;
  rasiNameEn: string;
  lordId: string;
  lordNameTe: string;
  startDate: string;
  endDate: string;
  durationMonths: number;
  houseFromLagna: number;
  houseFromMahadasha: number;
  houseFromAL: number;
  houseFromUL: number;
  occupantsTe: string[];
  karakasInSignTe: string[];
  rasiDrishtiKarakasTe: string[];
  predictionSummaryTe: string;
  isCurrent: boolean;
  pratyantardashas: JaiminiCharaPratyantardasha[];
}

export interface JaiminiCharaMahadasha {
  cycleIndex: number; // 1 for 1st cycle, 2 for 2nd cycle
  orderIndex: number; // 0..11
  rasiIndex: number;
  rasiNameTe: string;
  rasiNameEn: string;
  countingDirection: 'savya' | 'apasavya';
  countingDirectionTe: string;
  lordId: string;
  lordNameTe: string;
  lordRasiIndex: number;
  lordRasiNameTe: string;
  rawCountYears: number;
  exaltationDebilitationAdj: number;
  durationYears: number;
  calculationExplanationTe: string;
  startDate: string;
  endDate: string;
  startAge: number;
  endAge: number;
  houseFromLagna: number;
  houseFromAL: number;
  houseFromUL: number;
  houseFromKarakamsha: number;
  occupantsTe: string[];
  karakasInSignTe: string[];
  rasiDrishtiSignsTe: string[];
  rasiDrishtiPlanetsAndKarakasTe: string[];
  argalaSummaryTe: string;
  virodhargalaSummaryTe: string;
  overlappingVimshottariTe: string;
  auspiciousnessGrade: 'raja_yoga' | 'shubha' | 'misrama' | 'pariksha';
  auspiciousnessLabelTe: string;
  detailedPhalaTe: string;
  isCurrent: boolean;
  antardashas: JaiminiCharaAntardasha[];
}

export interface JaiminiCharaDashaReport {
  school: JaiminiDashaSchool;
  schoolTitleTe: string;
  lagnaRasiIndex: number;
  lagnaRasiNameTe: string;
  ninthHouseRasiIndex: number;
  ninthHouseRasiNameTe: string;
  mahadashaProgressionDirection: 'savya' | 'apasavya';
  mahadashaProgressionTe: string;
  mahadashaProgressionReasonTe: string;
  atmakaraka: JaiminiCharaKarakaInfo;
  karakamshaRasiIndex: number;
  karakamshaRasiNameTe: string;
  swamshaPlanetIds: string[];
  arudhaLagnaIndex: number;
  arudhaLagnaNameTe: string;
  upapadaLagnaIndex: number;
  upapadaLagnaNameTe: string;
  rajyaPadaA10Index: number;
  rajyaPadaA10NameTe: string;
  charaKarakas: JaiminiCharaKarakaInfo[];
  firstCycleTotalYears: number;
  mahadashas: JaiminiCharaMahadasha[]; // Includes Cycle 1 (12 signs) + Cycle 2 extension up to ~100+ years
}

/**
 * Vishamapada (Savya / Direct Counting) Signs:
 * Aries (0), Taurus (1), Gemini (2), Libra (6), Scorpio (7), Sagittarius (8)
 */
const SAVYA_SIGNS = new Set<number>([0, 1, 2, 6, 7, 8]);

const STANDARD_SIGN_LORD: Record<number, string> = {
  0: 'Mars',
  1: 'Venus',
  2: 'Mercury',
  3: 'Moon',
  4: 'Sun',
  5: 'Mercury',
  6: 'Venus',
  7: 'Mars', // Co-lord Ketu in Jaimini
  8: 'Jupiter',
  9: 'Saturn',
  10: 'Saturn', // Co-lord Rahu in Jaimini
  11: 'Jupiter',
};

const EXALTATION_SIGN: Record<string, number> = {
  Sun: 0, // Aries
  Moon: 1, // Taurus
  Mars: 9, // Capricorn
  Mercury: 5, // Virgo
  Jupiter: 3, // Cancer
  Venus: 11, // Pisces
  Saturn: 6, // Libra
  Rahu: 1, // Taurus
  Ketu: 7, // Scorpio
};

const DEBILITATION_SIGN: Record<string, number> = {
  Sun: 6, // Libra
  Moon: 7, // Scorpio
  Mars: 3, // Cancer
  Mercury: 11, // Pisces
  Jupiter: 9, // Capricorn
  Venus: 5, // Virgo
  Saturn: 0, // Aries
  Rahu: 7, // Scorpio
  Ketu: 1, // Taurus
};

const HOUSE_THEME_TE: Record<number, string> = {
  1: 'ఆత్మబలం, ఆరోగ్యం, గౌరవం & నూతన ప్రారంభములు (1వ భావం)',
  2: 'ధన వృద్ధి, కుటుంబ సౌఖ్యం, వాక్ ప్రభావం & నిల్వ ఆస్తులు (2వ భావం)',
  3: 'స్వయం పరాక్రమం, నూతన ఒప్పందాలు, సహోదర వర్గం & ప్రయాణములు (3వ భావం)',
  4: 'గృహ-భూమి-వాహన ప్రాప్తి, మాతృ సౌఖ్యం & విద్యా సిద్ధి (4వ భావం)',
  5: 'పూర్వపుణ్య ఫలం, సంతాన సౌఖ్యం, ప్రతిభ & రాజయోగ గుర్తింపు (5వ భావం)',
  6: 'పోటీలలో విజయం, శత్రు జయం, రుణ-రోగ నివారణ & సేవా రంగం (6వ భావం)',
  7: 'వివాహ శుభకార్యం, దాంపత్య సౌఖ్యం, వ్యాపార భాగస్వామ్యం & ప్రజాదరణ (7వ భావం)',
  8: 'ఆకస్మిక మార్పులు, పరిశోధన, వారసత్వం & ఆయుర్దాయ రక్షణ (8వ భావం)',
  9: 'భాగ్యోదయం, ధర్మ కార్యాలు, గురు-దైవ అనుగ్రహం & దూర ప్రయాణములు (9వ భావం)',
  10: 'ఉద్యోగ ఉన్నతి, రాజ్యాధికారం, కీర్తి ప్రతిష్ఠలు & కర్మ సిద్ధి (10వ భావం)',
  11: 'సర్వతోముఖ ఆదాయ వృద్ధి, అభీష్ట సిద్ధి & పెద్దల ఆశీస్సులు (11వ భావం)',
  12: 'విదేశీ యానం, శుభ వ్యయం, తీర్థయాత్రలు & ఆధ్యాత్మిక చింతన (12వ భావం)',
};

function isSavyaSign(signIdx: number): boolean {
  return SAVYA_SIGNS.has(((signIdx % 12) + 12) % 12);
}

function addDaysToIso(baseIso: string, daysToAdd: number): string {
  const baseMs = Date.parse(baseIso);
  const targetMs = (Number.isNaN(baseMs) ? Date.now() : baseMs) + daysToAdd * 86400000;
  return new Date(targetMs).toISOString().slice(0, 10);
}

function houseDistance(fromSign: number, toSign: number): number {
  return ((toSign - fromSign + 12) % 12) + 1;
}

/**
 * Returns the signs that aspect `targetSign` by Jaimini Rasi Drishti:
 * - Chara (0, 3, 6, 9) <-> Sthira (1, 4, 7, 10) except adjacent sign
 * - Dwiswabhava (2, 5, 8, 11) <-> other 3 Dwiswabhava signs
 */
export function getJaiminiRasiDrishtiSigns(targetSign: number): number[] {
  const modality = targetSign % 3; // 0 = Chara, 1 = Sthira, 2 = Dwiswabhava
  if (modality === 0) {
    // Chara sign is aspected by Sthira signs (1, 4, 7, 10) except the one immediately following it ((targetSign + 1) % 12)
    const adjacentSthira = (targetSign + 1) % 12;
    return [1, 4, 7, 10].filter((s) => s !== adjacentSthira);
  }
  if (modality === 1) {
    // Sthira sign is aspected by Chara signs (0, 3, 6, 9) except the one immediately preceding it ((targetSign + 11) % 12)
    const adjacentChara = (targetSign + 11) % 12;
    return [0, 3, 6, 9].filter((s) => s !== adjacentChara);
  }
  // Dwiswabhava sign is aspected by the other 3 Dwiswabhava signs
  return [2, 5, 8, 11].filter((s) => s !== targetSign);
}

/**
 * Calculates Jaimini Arudha Pada for a given house from Lagna, including
 * the classical Swasthe Daridra (1st/7th house exception -> 10th from it).
 */
function calculateArudhaPadaSign(
  houseNum: number,
  ascSign: number,
  planets: PlanetPosition[]
): number {
  const bhavaSign = (ascSign + houseNum - 1) % 12;
  const lordId = STANDARD_SIGN_LORD[bhavaSign];
  const lordPos = planets.find((p) => p.id === lordId);
  const lordSign = lordPos ? lordPos.signIndex : bhavaSign;

  const distFromBhavaToLord = (lordSign - bhavaSign + 12) % 12;
  let padaSign = (lordSign + distFromBhavaToLord) % 12;

  // Jaimini Exception: If Arudha falls in the 1st or 7th from the Bhava, take the 10th from that position
  const distFromBhavaToPada = ((padaSign - bhavaSign + 12) % 12) + 1;
  if (distFromBhavaToPada === 1 || distFromBhavaToPada === 7) {
    padaSign = (padaSign + 9) % 12;
  }
  return padaSign;
}

/**
 * Resolves stronger co-lord for Scorpio (Mars vs Ketu) and Aquarius (Saturn vs Rahu)
 * per Maharshi Jaimini Sutras.
 */
function resolveJaiminiSignLord(
  signIdx: number,
  planets: PlanetPosition[]
): { lordId: string; lordPos: PlanetPosition; coLordNoteTe: string } {
  if (signIdx !== 7 && signIdx !== 10) {
    const id = STANDARD_SIGN_LORD[signIdx];
    const pos = planets.find((p) => p.id === id) ?? planets[0];
    return { lordId: id, lordPos: pos, coLordNoteTe: '' };
  }

  const primaryId = signIdx === 7 ? 'Mars' : 'Saturn';
  const nodeId = signIdx === 7 ? 'Ketu' : 'Rahu';
  const p1 = planets.find((p) => p.id === primaryId) ?? planets[0];
  const p2 = planets.find((p) => p.id === nodeId) ?? planets[0];

  // Rule 1: If one lord is in the sign itself and the other is outside, the one outside gives the years
  if (p1.signIndex === signIdx && p2.signIndex !== signIdx) {
    return {
      lordId: nodeId,
      lordPos: p2,
      coLordNoteTe: `${TELUGU_PLANETS[primaryId]?.nameTe.split(' ')[0]} స్వరాశిలో ఉన్నందున ద్వి-అధిపతి ${TELUGU_PLANETS[nodeId]?.nameTe.split(' ')[0]} ప్రమాణం`,
    };
  }
  if (p2.signIndex === signIdx && p1.signIndex !== signIdx) {
    return {
      lordId: primaryId,
      lordPos: p1,
      coLordNoteTe: `${TELUGU_PLANETS[nodeId]?.nameTe.split(' ')[0]} స్వరాశిలో ఉన్నందున ద్వి-అధిపతి ${TELUGU_PLANETS[primaryId]?.nameTe.split(' ')[0]} ప్రమాణం`,
    };
  }

  // Rule 2: Planet conjoined with more planets is stronger
  const countConj1 = planets.filter((p) => p.signIndex === p1.signIndex && p.id !== p1.id).length;
  const countConj2 = planets.filter((p) => p.signIndex === p2.signIndex && p.id !== p2.id).length;
  if (countConj1 !== countConj2) {
    const winner = countConj1 > countConj2 ? p1 : p2;
    return {
      lordId: winner.id,
      lordPos: winner,
      coLordNoteTe: `గ్రహ యుతి బలంచే ద్వి-అధిపతి ${TELUGU_PLANETS[winner.id]?.nameTe.split(' ')[0]} ఎన్నిక`,
    };
  }

  // Rule 3: Higher longitude in sign (for Rahu/Ketu, 30 - degreeInSign)
  const deg1 = p1.degreeInSign;
  const deg2 = 30 - p2.degreeInSign;
  const winner = deg1 >= deg2 ? p1 : p2;
  return {
    lordId: winner.id,
    lordPos: winner,
    coLordNoteTe: `డిగ్రీ బలంచే ద్వి-అధిపతి ${TELUGU_PLANETS[winner.id]?.nameTe.split(' ')[0]} ఎన్నిక`,
  };
}

/**
 * Computes the 7 Jaimini Chara Karakas sorted by degree in sign descending.
 */
function computeSevenCharaKarakas(chart: CompleteChartResult): JaiminiCharaKarakaInfo[] {
  const sevenIds = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
  const sorted = chart.planets
    .filter((p) => sevenIds.includes(p.id))
    .sort((a, b) => b.degreeInSign - a.degreeInSign);

  const karakaMeta: {
    code: JaiminiCharaKarakaInfo['karakaCode'];
    nameTe: string;
    nameEn: string;
    sigTe: string;
  }[] = [
    {
      code: 'AK',
      nameTe: 'ఆత్మకారకుడు (AK)',
      nameEn: 'Atmakaraka',
      sigTe: 'ఆత్మ స్వరూపం, జీవన పరమార్థం, ఆరోగ్యం & రాజయోగ మూలం',
    },
    {
      code: 'AmK',
      nameTe: 'అమాత్యకారకుడు (AmK)',
      nameEn: 'Amatyakaraka',
      sigTe: 'ఉద్యోగం, వృత్తి, మంత్రిత్వం, ఆర్థిక ఉన్నతి & సలహాదారులు',
    },
    {
      code: 'BK',
      nameTe: 'భ్రాతృకారకుడు (BK)',
      nameEn: 'Bhratrikaraka',
      sigTe: 'సహోదరులు, గురువులు, ధైర్యం & స్వయం పరాక్రమం',
    },
    {
      code: 'MK',
      nameTe: 'మాతృకారకుడు (MK)',
      nameEn: 'Matrikaraka',
      sigTe: 'తల్లి, గృహ-భూమి-వాహన సౌఖ్యం & మానసిక ప్రశాంతత',
    },
    {
      code: 'PK',
      nameTe: 'పుత్రకారకుడు (PK)',
      nameEn: 'Putrakaraka',
      sigTe: 'సంతానం, ప్రతిభ, విద్య, పూర్వపుణ్యం & సృజనాత్మకత',
    },
    {
      code: 'GK',
      nameTe: 'జ్ఞాతికారకుడు (GK)',
      nameEn: 'Jnatikaraka',
      sigTe: 'దాయాదులు, పోటీలు, శత్రువులు, రుణ-రోగ నివారణ & సవాళ్లు',
    },
    {
      code: 'DK',
      nameTe: 'దారకారకుడు (DK)',
      nameEn: 'Darakaraka',
      sigTe: 'జీవిత భాగస్వామి (వివాహం), వ్యాపార భాగస్వామ్యం & దాంపత్యం',
    },
  ];

  return sorted.map((p, idx) => {
    const meta = karakaMeta[idx] ?? karakaMeta[6];
    return {
      karakaCode: meta.code,
      karakaNameTe: meta.nameTe,
      karakaNameEn: meta.nameEn,
      significanceTe: meta.sigTe,
      planetId: p.id,
      planetNameTe: TELUGU_PLANETS[p.id]?.nameTe.split(' ')[0] ?? p.name,
      degreeInSign: p.degreeInSign,
      degreeDMS: p.formattedDMS,
      rasiIndex: p.signIndex,
      rasiNameTe: TELUGU_RASIS[p.signIndex]?.nameTe.split(' ')[0] ?? '',
      navamsaIndex: p.d9Sign,
      navamsaNameTe: TELUGU_RASIS[p.d9Sign]?.nameTe.split(' ')[0] ?? '',
    };
  });
}

export function calculateJaiminiCharaDasha(
  chart: CompleteChartResult,
  school: JaiminiDashaSchool = 'kn_rao'
): JaiminiCharaDashaReport {
  const ascSign = chart.ascendant.signIndex;
  const ninthSign = (ascSign + 8) % 12;

  // Mahadasha progression direction from Lagna:
  // In K.N. Rao school, determined by whether 9th from Lagna is Savya or Apasavya.
  // In Parashara traditional school, determined by whether Lagna itself is Savya or Apasavya.
  const isMahaProgressionSavya =
    school === 'kn_rao' ? isSavyaSign(ninthSign) : isSavyaSign(ascSign);

  const charaKarakas = computeSevenCharaKarakas(chart);
  const atmakaraka = charaKarakas[0];
  const karakamshaRasiIndex = atmakaraka.navamsaIndex;

  const arudhaLagnaIndex = calculateArudhaPadaSign(1, ascSign, chart.planets);
  const upapadaLagnaIndex = calculateArudhaPadaSign(12, ascSign, chart.planets);
  const rajyaPadaA10Index = calculateArudhaPadaSign(10, ascSign, chart.planets);

  const swamshaPlanetIds = chart.planets
    .filter((p) => p.d9Sign === karakamshaRasiIndex)
    .map((p) => p.id);

  // Build 12 signs sequence for Cycle 1 and Cycle 2 (total 24 periods to span full lifetime)
  const signOrder: number[] = [];
  for (let i = 0; i < 12; i++) {
    const s = isMahaProgressionSavya
      ? (ascSign + i) % 12
      : (ascSign - i + 12) % 12;
    signOrder.push(s);
  }

  const nowIso = new Date().toISOString().slice(0, 10);
  const mahadashas: JaiminiCharaMahadasha[] = [];
  let cursorDateIso = chart.input.date;
  let cumulativeAgeYears = 0;
  let firstCycleTotalYears = 0;

  // Generate Cycle 1 (12 Rasis) + Cycle 2 (until cumulativeAgeYears >= 105)
  for (let cycle = 1; cycle <= 2; cycle++) {
    for (let idx = 0; idx < 12; idx++) {
      if (cycle === 2 && cumulativeAgeYears >= 108) break;

      const rasiIndex = signOrder[idx];
      const rasiObj = TELUGU_RASIS[rasiIndex];
      const rasiNameTe = rasiObj?.nameTe.split(' ')[0] ?? '';
      const rasiNameEn = rasiObj?.nameEn ?? '';
      const rasiSavya = isSavyaSign(rasiIndex);

      const { lordId, lordPos, coLordNoteTe } = resolveJaiminiSignLord(
        rasiIndex,
        chart.planets
      );
      const lordNameTe = TELUGU_PLANETS[lordId]?.nameTe.split(' ')[0] ?? lordId;
      const lordRasiIndex = lordPos.signIndex;
      const lordRasiNameTe = TELUGU_RASIS[lordRasiIndex]?.nameTe.split(' ')[0] ?? '';

      // Count from Rasi to its Lord (Savya = forward, Apasavya = backward) and subtract 1
      let rawCountYears = 0;
      if (lordRasiIndex === rasiIndex) {
        rawCountYears = 12;
      } else if (rasiSavya) {
        rawCountYears = (lordRasiIndex - rasiIndex + 12) % 12;
      } else {
        rawCountYears = (rasiIndex - lordRasiIndex + 12) % 12;
      }

      let exaltDebilAdj = 0;
      if (school === 'parashara_traditional') {
        if (EXALTATION_SIGN[lordId] === lordRasiIndex) exaltDebilAdj = 1;
        else if (DEBILITATION_SIGN[lordId] === lordRasiIndex) exaltDebilAdj = -1;
      }

      const durationYears = Math.max(1, Math.min(12, rawCountYears + exaltDebilAdj));
      if (cycle === 1) firstCycleTotalYears += durationYears;

      const startAge = Number(cumulativeAgeYears.toFixed(1));
      const endAge = Number((cumulativeAgeYears + durationYears).toFixed(1));
      const startDate = cursorDateIso;
      const endDate = addDaysToIso(startDate, Math.round(durationYears * 365.25));

      const isCurrentMaha = nowIso >= startDate && nowIso <= endDate;

      // Build 12 Antardashas inside this Mahadasha
      const antardashas: JaiminiCharaAntardasha[] = [];
      let antarCursorIso = startDate;
      const antarDurationDays = (durationYears * 365.25) / 12;

      for (let aStep = 1; aStep <= 12; aStep++) {
        // Antardasha starts from next/prev sign and ends with the Mahadasha sign itself on step 12
        const antarRasiIndex = rasiSavya
          ? (rasiIndex + aStep) % 12
          : (rasiIndex - aStep + 12) % 12;
        const antarRasiObj = TELUGU_RASIS[antarRasiIndex];
        const antarRasiNameTe = antarRasiObj?.nameTe.split(' ')[0] ?? '';
        const antarRasiNameEn = antarRasiObj?.nameEn ?? '';
        const antarLordInfo = resolveJaiminiSignLord(antarRasiIndex, chart.planets);
        const antarStart = antarCursorIso;
        const antarEnd =
          aStep === 12
            ? endDate
            : addDaysToIso(antarStart, Math.round(antarDurationDays));
        const isCurrentAntar =
          isCurrentMaha && nowIso >= antarStart && nowIso <= antarEnd;

        // Build 12 Pratyantardashas inside this Antardasha
        const pratyantardashas: JaiminiCharaPratyantardasha[] = [];
        const antarSavya = isSavyaSign(antarRasiIndex);
        const pratDurationDays = antarDurationDays / 12;
        let pratCursorIso = antarStart;

        for (let pStep = 1; pStep <= 12; pStep++) {
          const pratRasiIndex = antarSavya
            ? (antarRasiIndex + pStep) % 12
            : (antarRasiIndex - pStep + 12) % 12;
          const pratStart = pratCursorIso;
          const pratEnd =
            pStep === 12
              ? antarEnd
              : addDaysToIso(pratStart, Math.max(1, Math.round(pratDurationDays)));
          const isCurrentPrat =
            isCurrentAntar && nowIso >= pratStart && nowIso <= pratEnd;

          pratyantardashas.push({
            rasiIndex: pratRasiIndex,
            rasiNameTe: TELUGU_RASIS[pratRasiIndex]?.nameTe.split(' ')[0] ?? '',
            rasiNameEn: TELUGU_RASIS[pratRasiIndex]?.nameEn ?? '',
            startDate: pratStart,
            endDate: pratEnd,
            durationDays: Math.max(1, Math.round(pratDurationDays)),
            isCurrent: isCurrentPrat,
          });
          pratCursorIso = pratEnd;
        }

        const antarOccupants = chart.planets
          .filter((p) => p.signIndex === antarRasiIndex)
          .map((p) => TELUGU_PLANETS[p.id]?.nameTe.split(' ')[0] ?? p.name);

        const antarKarakas = charaKarakas
          .filter((k) => k.rasiIndex === antarRasiIndex)
          .map((k) => `${k.karakaCode} (${k.planetNameTe})`);

        const drishtiSignsForAntar = getJaiminiRasiDrishtiSigns(antarRasiIndex);
        const antarDrishtiKarakas = charaKarakas
          .filter((k) => drishtiSignsForAntar.includes(k.rasiIndex))
          .map((k) => `${k.karakaCode} (${k.planetNameTe})`);

        const hFromLagna = houseDistance(ascSign, antarRasiIndex);
        const hFromMaha = houseDistance(rasiIndex, antarRasiIndex);
        const hFromAL = houseDistance(arudhaLagnaIndex, antarRasiIndex);
        const hFromUL = houseDistance(upapadaLagnaIndex, antarRasiIndex);

        const antarPredTe = `${rasiNameTe} మహాదశలో ${antarRasiNameTe} అంతర్దశ (లగ్నం నుండి ${hFromLagna}వ భావం · ఆరూఢ లగ్నం AL నుండి ${hFromAL}వ భావం): ${HOUSE_THEME_TE[hFromLagna] ?? ''}.${
          antarKarakas.length > 0
            ? ` ఈ రాశిలో ${antarKarakas.join(', ')} స్థితి వలన ఆ కారకత్వ ఫలితాలు విశేషంగా అనుభవానికి వస్తాయి.`
            : antarDrishtiKarakas.length > 0
              ? ` ఈ రాశిపై ${antarDrishtiKarakas.join(', ')} జైమిని రాశి దృష్టి ఉన్నందున ఆ కారక ఫలితాలు చురుకుగా పనిచేస్తాయి.`
              : ''
        }`;

        antardashas.push({
          rasiIndex: antarRasiIndex,
          rasiNameTe: antarRasiNameTe,
          rasiNameEn: antarRasiNameEn,
          lordId: antarLordInfo.lordId,
          lordNameTe:
            TELUGU_PLANETS[antarLordInfo.lordId]?.nameTe.split(' ')[0] ??
            antarLordInfo.lordId,
          startDate: antarStart,
          endDate: antarEnd,
          durationMonths: durationYears, // Y years Mahadasha -> Y months per Antardasha
          houseFromLagna: hFromLagna,
          houseFromMahadasha: hFromMaha,
          houseFromAL: hFromAL,
          houseFromUL: hFromUL,
          occupantsTe: antarOccupants,
          karakasInSignTe: antarKarakas,
          rasiDrishtiKarakasTe: antarDrishtiKarakas,
          predictionSummaryTe: antarPredTe,
          isCurrent: isCurrentAntar,
          pratyantardashas,
        });

        antarCursorIso = antarEnd;
      }

      // Mahadasha Jaimini Diagnostics (Rasi Drishti, Chara Karakas, Arudha Padas, Argala)
      const hFromLagna = houseDistance(ascSign, rasiIndex);
      const hFromAL = houseDistance(arudhaLagnaIndex, rasiIndex);
      const hFromUL = houseDistance(upapadaLagnaIndex, rasiIndex);
      const hFromKL = houseDistance(karakamshaRasiIndex, rasiIndex);

      const occupantsTe = chart.planets
        .filter((p) => p.signIndex === rasiIndex)
        .map((p) => TELUGU_PLANETS[p.id]?.nameTe.split(' ')[0] ?? p.name);

      const karakasInSignTe = charaKarakas
        .filter((k) => k.rasiIndex === rasiIndex)
        .map((k) => `${k.karakaNameTe} — ${k.planetNameTe}`);

      const drishtiSignIndices = getJaiminiRasiDrishtiSigns(rasiIndex);
      const rasiDrishtiSignsTe = drishtiSignIndices.map(
        (s) => TELUGU_RASIS[s]?.nameTe.split(' ')[0] ?? ''
      );

      const rasiDrishtiPlanetsAndKarakasTe: string[] = [];
      for (const ds of drishtiSignIndices) {
        const pls = chart.planets.filter((p) => p.signIndex === ds);
        for (const pl of pls) {
          const kMatch = charaKarakas.find((k) => k.planetId === pl.id);
          const plTe = TELUGU_PLANETS[pl.id]?.nameTe.split(' ')[0] ?? pl.name;
          const dsTe = TELUGU_RASIS[ds]?.nameTe.split(' ')[0] ?? '';
          rasiDrishtiPlanetsAndKarakasTe.push(
            kMatch ? `${plTe} (${kMatch.karakaCode} · ${dsTe} నుండి)` : `${plTe} (${dsTe} నుండి)`
          );
        }
      }

      // Argala (2nd, 4th, 11th, 5th from Dasha Rasi) & Virodhargala (12th, 10th, 3rd, 9th)
      const argalaSigns = [
        { offset: 1, label: '2వ ఇంట ధన-అర్గళ' },
        { offset: 3, label: '4వ ఇంట సుఖ-అర్గళ' },
        { offset: 10, label: '11వ ఇంట లాభ-అర్గళ' },
        { offset: 4, label: '5వ ఇంట శుభ-అర్గళ' },
      ];
      const argalaHits: string[] = [];
      for (const ag of argalaSigns) {
        const sIdx = (rasiIndex + ag.offset) % 12;
        const pls = chart.planets
          .filter((p) => p.signIndex === sIdx)
          .map((p) => TELUGU_PLANETS[p.id]?.nameTe.split(' ')[0] ?? p.name);
        if (pls.length > 0) {
          argalaHits.push(`${ag.label}: ${pls.join(', ')}`);
        }
      }

      const virodhaSigns = [
        { offset: 11, label: '12వ ఇంట విరోధార్గళ' },
        { offset: 9, label: '10వ ఇంట విరోధార్గళ' },
        { offset: 2, label: '3వ ఇంట విరోధార్గళ' },
      ];
      const virodhaHits: string[] = [];
      for (const vg of virodhaSigns) {
        const sIdx = (rasiIndex + vg.offset) % 12;
        const pls = chart.planets
          .filter((p) => p.signIndex === sIdx)
          .map((p) => TELUGU_PLANETS[p.id]?.nameTe.split(' ')[0] ?? p.name);
        if (pls.length > 0) {
          virodhaHits.push(`${vg.label}: ${pls.join(', ')}`);
        }
      }

      // Overlapping Vimshottari Mahadasha at midpoint of this Chara Dasha
      const midIso = addDaysToIso(startDate, Math.round((durationYears * 365.25) / 2));
      const matchingVimMaha =
        chart.dashas.find((d) => midIso >= d.startDate && midIso <= d.endDate) ??
        chart.dashas[0];
      const matchingVimAntar = matchingVimMaha?.antardashas.find(
        (a) => midIso >= a.startDate && midIso <= a.endDate
      );
      const vimMahaTe =
        TELUGU_PLANETS[matchingVimMaha?.lord ?? '']?.nameTe.split(' ')[0] ?? '';
      const vimAntarTe = matchingVimAntar
        ? TELUGU_PLANETS[matchingVimAntar.lord]?.nameTe.split(' ')[0] ?? ''
        : '';
      const overlappingVimshottariTe = vimAntarTe
        ? `${vimMahaTe} మహాదశ – ${vimAntarTe} భుక్తి`
        : `${vimMahaTe} మహాదశ`;

      // Determine Auspiciousness Grade
      const hasAKOrAmKOrPK =
        karakasInSignTe.some(
          (s) => s.includes('AK') || s.includes('AmK') || s.includes('PK')
        ) ||
        rasiDrishtiPlanetsAndKarakasTe.some(
          (s) => s.includes('AK') || s.includes('AmK') || s.includes('PK')
        );
      const isKendraOrTrikonaFromLagnaOrAL =
        [1, 4, 5, 7, 9, 10].includes(hFromLagna) ||
        [1, 4, 5, 7, 9, 10, 11].includes(hFromAL);

      let auspiciousnessGrade: JaiminiCharaMahadasha['auspiciousnessGrade'] = 'misrama';
      let auspiciousnessLabelTe = 'మిశ్రమ-పురోగతి దశ (Balanced Period)';

      if (hasAKOrAmKOrPK && isKendraOrTrikonaFromLagnaOrAL) {
        auspiciousnessGrade = 'raja_yoga';
        auspiciousnessLabelTe = 'జైమిని రాజయోగ కారక దశ (High Elevation)';
      } else if (isKendraOrTrikonaFromLagnaOrAL) {
        auspiciousnessGrade = 'shubha';
        auspiciousnessLabelTe = 'శుభ వృద్ధి దశ (Favorable Period)';
      } else if ([6, 8, 12].includes(hFromLagna) && [6, 8, 12].includes(hFromAL)) {
        auspiciousnessGrade = 'pariksha';
        auspiciousnessLabelTe = 'పరివర్తన & పరీక్షా దశ (Caution / Transformation)';
      }

      const calcExplTe = `${rasiNameTe} (${
        rasiSavya ? 'సవ్య/విషమపాద రాశి — ముందుకు లెక్కింపు' : 'అపసవ్య/సమపాద రాశి — వెనుకకు లెక్కింపు'
      }) నుండి రాశ్యాధిపతి ${lordNameTe} ఉన్న ${lordRasiNameTe} రాశి వరకు లెక్కించగా: ${
        lordRasiIndex === rasiIndex
          ? 'స్వరాశి స్థితి వలన పూర్తి 12 సంవత్సరములు'
          : `${rawCountYears + 1} రాశులు − 1 = ${rawCountYears} సంవత్సరములు`
      }${
        exaltDebilAdj !== 0
          ? ` (${exaltDebilAdj > 0 ? 'ఉచ్చ +1 సం.' : 'నీచ -1 సం.'} = ${durationYears} సం.)`
          : ''
      }${coLordNoteTe ? ` [${coLordNoteTe}]` : ''}.`;

      const detailedPhalaTe = `${rasiNameTe} చర మహాదశ (${startAge} నుండి ${endAge} సం. వయస్సు వరకు · ${durationYears} సం.): ఈ దశ జన్మ లగ్నం నుండి ${hFromLagna}వ భావాన్ని (${
        HOUSE_THEME_TE[hFromLagna] ?? ''
      }), ఆరూఢ లగ్నం (AL) నుండి ${hFromAL}వ స్థానాన్ని, మరియు ఉపపాద లగ్నం (UL) నుండి ${hFromUL}వ స్థానాన్ని సక్రియం చేస్తుంది. ${
        karakasInSignTe.length > 0
          ? `ఈ రాశిలో ${karakasInSignTe.join(', ')} స్వయంగా ఉండటం వలన ఆ కారకత్వ రంగాలలో బలమైన మార్పులు, గుర్తింపు లభిస్తాయి. `
          : ''
      }${
        rasiDrishtiPlanetsAndKarakasTe.length > 0
          ? `జైమిని రాశి దృష్టి ద్వారా ${rasiDrishtiPlanetsAndKarakasTe.join(', ')} ఈ దశను ప్రభావితం చేస్తున్నాయి. `
          : ''
      }సమకాలీనంగా వింశోత్తరిలో ${overlappingVimshottariTe} నడుస్తున్నందున ఉభయ దశా సమన్వయ ఫలితం స్పష్టంగా అనుభవానికి వస్తుంది.`;

      mahadashas.push({
        cycleIndex: cycle,
        orderIndex: idx,
        rasiIndex,
        rasiNameTe,
        rasiNameEn,
        countingDirection: rasiSavya ? 'savya' : 'apasavya',
        countingDirectionTe: rasiSavya ? 'సవ్య (Forward)' : 'అపసవ్య (Reverse)',
        lordId,
        lordNameTe,
        lordRasiIndex,
        lordRasiNameTe,
        rawCountYears,
        exaltationDebilitationAdj: exaltDebilAdj,
        durationYears,
        calculationExplanationTe: calcExplTe,
        startDate,
        endDate,
        startAge,
        endAge,
        houseFromLagna: hFromLagna,
        houseFromAL: hFromAL,
        houseFromUL: hFromUL,
        houseFromKarakamsha: hFromKL,
        occupantsTe,
        karakasInSignTe,
        rasiDrishtiSignsTe,
        rasiDrishtiPlanetsAndKarakasTe,
        argalaSummaryTe:
          argalaHits.length > 0
            ? argalaHits.join(' · ')
            : 'ప్రత్యేక అర్గళ గ్రహాలు లేవు (నిర్మల స్థితి)',
        virodhargalaSummaryTe:
          virodhaHits.length > 0
            ? virodhaHits.join(' · ')
            : 'విరోధార్గళ ఆటంకాలు లేవు (శుభం)',
        overlappingVimshottariTe,
        auspiciousnessGrade,
        auspiciousnessLabelTe,
        detailedPhalaTe,
        isCurrent: isCurrentMaha,
        antardashas,
      });

      cursorDateIso = endDate;
      cumulativeAgeYears += durationYears;
    }
  }

  return {
    school,
    schoolTitleTe:
      school === 'kn_rao'
        ? 'మహర్షి జైమిని చర దశ (K.N. Rao సిద్ధాంత ప్రమాణం)'
        : 'మహర్షి పరాశర / నీలకంఠ సాంప్రదాయ చర దశ (ఉచ్చ/నీచ సవరణ సహితం)',
    lagnaRasiIndex: ascSign,
    lagnaRasiNameTe: TELUGU_RASIS[ascSign]?.nameTe.split(' ')[0] ?? '',
    ninthHouseRasiIndex: ninthSign,
    ninthHouseRasiNameTe: TELUGU_RASIS[ninthSign]?.nameTe.split(' ')[0] ?? '',
    mahadashaProgressionDirection: isMahaProgressionSavya ? 'savya' : 'apasavya',
    mahadashaProgressionTe: isMahaProgressionSavya
      ? 'సవ్య క్రమం (Direct / Clockwise Zodiacal Order)'
      : 'అపసవ్య క్రమం (Reverse / Anti-Clockwise Order)',
    mahadashaProgressionReasonTe:
      school === 'kn_rao'
        ? `లగ్నం (${TELUGU_RASIS[ascSign]?.nameTe.split(' ')[0]}) నుండి 9వ భావం (${
            TELUGU_RASIS[ninthSign]?.nameTe.split(' ')[0]
          }) ${
            isSavyaSign(ninthSign) ? 'విషమపాద (సవ్య) రాశి' : 'సమపాద (అపసవ్య) రాశి'
          } అయినందున మహాదశలు ${
            isMahaProgressionSavya ? 'సవ్య (ముందుకు)' : 'అపసవ్య (వెనుకకు)'
          } క్రమంలో నడుస్తాయి.`
        : `జన్మ లగ్నం (${TELUGU_RASIS[ascSign]?.nameTe.split(' ')[0]}) ${
            isSavyaSign(ascSign) ? 'విషమపాద (సవ్య) రాశి' : 'సమపాద (అపసవ్య) రాశి'
          } అయినందున మహాదశలు ${
            isMahaProgressionSavya ? 'సవ్య (ముందుకు)' : 'అపసవ్య (వెనుకకు)'
          } క్రమంలో నడుస్తాయి.`,
    atmakaraka,
    karakamshaRasiIndex,
    karakamshaRasiNameTe: TELUGU_RASIS[karakamshaRasiIndex]?.nameTe.split(' ')[0] ?? '',
    swamshaPlanetIds,
    arudhaLagnaIndex,
    arudhaLagnaNameTe: TELUGU_RASIS[arudhaLagnaIndex]?.nameTe.split(' ')[0] ?? '',
    upapadaLagnaIndex,
    upapadaLagnaNameTe: TELUGU_RASIS[upapadaLagnaIndex]?.nameTe.split(' ')[0] ?? '',
    rajyaPadaA10Index,
    rajyaPadaA10NameTe: TELUGU_RASIS[rajyaPadaA10Index]?.nameTe.split(' ')[0] ?? '',
    charaKarakas,
    firstCycleTotalYears,
    mahadashas,
  };
}
