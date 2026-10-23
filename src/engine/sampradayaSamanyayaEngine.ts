/**
 * sampradayaSamanyayaEngine.ts — సప్త-సంప్రదాయ సమన్వయ విచారణ
 * ---------------------------------------------------------------------------
 * ఒక్క పద్ధతి చెప్పినది “తీర్పు” కాదు. ఒక పెద్ద పండితుడు ఒకే విషయాన్ని
 * ఆరు స్వతంత్ర సంప్రదాయాలతో పరిశీలించి, అవి ఏకీభవిస్తే బలంగా చెబుతాడు;
 * భిన్నిస్తే ఎందుకు భిన్నించాయో విడమర్చి చెబుతాడు.
 *
 * ఈ ఇంజిన్ ప్రతి భావానికి (1–12) ఏడు స్వతంత్ర గణనలను నిర్వహిస్తుంది:
 *   1. పారాశరీ   — భావేశుడు ఎక్కడ (శుభ/పాప స్థానం), క్షేత్ర బలం, భావ నివాసులు
 *   2. అష్టకవర్గ — ఆ భావ రాశి సాముదాయిక బిందువులు (సగటు 337/12 = 28.08)
 *   3. జైమిని    — కారకుడు (AK/AmK/BK/MK/PiK/PK/GK/DK) స్థానం, లేక చర దశా రాశి
 *                  కు ఆ భావ రాశితో రాశి దృష్టి సంబంధం
 *   4. వింశోత్తరి — నడుస్తున్న మహాదశా/భుక్తి ఆ భావానికి కారకమా; రాబోయే
 *                  భుక్తుల్లో ఏ తేదీల్లో ఆ భావం సక్రియమవుతుంది
 *   5. కేపీ       — భావ కస్ప్ సబ్-లార్డ్ (249 ఉప-విభాగం) ఆ భావానికి
 *                  సిగ్నిఫికేటరా, లేక 6/8/12 కి చెందినదా
 *   6. చరదశ      — నడుస్తున్న జైమిని చర దశా రాశి, ఆ భావ రాశితో సంబంధం
 *                  (స్వదశ / రాశి దృష్టి / దుష్ట స్థానం)
 *   7. తాజిక      — ఈ సంవత్సరపు వర్షఫలం: ముంథ స్థానం, వర్షేశుడు
 *                  (తాజిక నీలకంఠి — వర్ష లగ్న, ముంథ సిద్ధాంతం)
 *
 * ఏ వాక్యమూ “ఊహ” కాదు: ప్రతి తీర్పు వెనుక ఒక సంఖ్య ఉంటుంది (భావం, రాశి,
 * క్షేత్రం, బిందువు, దశా తేదీ, సబ్-లార్డ్). ఏది జాతకం చెప్పలేదో కూడా
 * (pariseelana — పరిమితులు) స్పష్టంగా రాస్తాము.
 */

import type { CompleteChartResult, PlanetPosition } from './ephemeris.ts';
import { SIGN_LORD, RASI_TE, PLANET_TE, type PlanetId9 } from './lagnaFunctionalEngine.ts';
import {
  computeVimshottariDeep,
  expandNine,
  DA_SHA_YEAR_DAYS,
} from './vimshottariDeepEngine.ts';
import { computeKpStarAndSubLord } from './kundaliSookshmaNadiEngine.ts';
import {
  getJaiminiRasiDrishtiSigns,
  calculateJaiminiCharaDasha,
} from './jaiminiCharaDashaEngine.ts';
import { generateTajikaVarshaphalaReport } from './tajikaVarshaphalaEngine.ts';

const SEVEN: PlanetId9[] = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
const ALL9: PlanetId9[] = [...SEVEN, 'Rahu', 'Ketu'];
const KENDRA = [1, 4, 7, 10];
const TRIKONA = [1, 5, 9];
const DUSTHANA = [6, 8, 12];

/** డిగ్రీ → DD° MM' SS" */
const fmtDMS = (deg: number) => {
  const d = Math.floor(deg);
  const mf = (deg - d) * 60;
  const m = Math.floor(mf);
  const sec = Math.round((mf - m) * 60);
  return `${d}° ${String(m).padStart(2, '0')}' ${String(sec).padStart(2, '0')}"`;
};

/** రాశి పేరుకు 3వ విభక్తి (మిథునం → మిథునానికి, తులా → తులాకి) */
const rasiDative = (sign: number) => {
  const name = RASI_TE[sign];
  return name.endsWith('ం') ? `${name.slice(0, -1)}ానికి` : `${name}కి`;
};
const fmtScore = (v: number) => (Math.abs(v) < 0.05 ? '0' : `${v > 0 ? '+' : ''}${v.toFixed(2)}`);
const roundScore = (v: number) => (Math.abs(v) < 0.15 ? 0 : Number(v.toFixed(2)));

const clamp = (v: number, lo = -2, hi = 2) => Math.max(lo, Math.min(hi, v));
const signOfLon = (lon: number) => ((Math.floor(lon / 30) % 12) + 12) % 12;

/** క్షేత్ర బలం — పారాశరీ దృష్టి (ఉచ్ఛ ±2) */
const DIGNITY_SCORE: Record<string, number> = {
  Exalted: 2,
  Moolatrikona: 1.5,
  'Own Sign': 1,
  Friendly: 0.5,
  Neutral: 0,
  Enemy: -0.75,
  Debilitated: -2,
};

/** భావ స్థాన బలం — భావేశుడు ఎక్కడ ఉన్నాడు (కేంద్ర/త్రికోణ శుభం, దుష్ట స్థానం అశుభం) */
const PLACEMENT_SCORE: Record<number, number> = {
  1: 1.5, 2: 0.75, 3: -0.5, 4: 1, 5: 1.5, 6: -1.5,
  7: 1, 8: -1.75, 9: 1.5, 10: 1.25, 11: 0.75, 12: -1.5,
};

const DIGNITY_TE: Record<string, string> = {
  Exalted: 'ఉచ్ఛ',
  Moolatrikona: 'మూలత్రికోణ',
  'Own Sign': 'స్వక్షేత్రం',
  Friendly: 'మిత్ర క్షేత్రం',
  Neutral: 'సమ క్షేత్రం',
  Enemy: 'శత్రు క్షేత్రం',
  Debilitated: 'నీచ',
};

const BENEFICS: PlanetId9[] = ['Jupiter', 'Venus', 'Moon', 'Mercury'];
const MALEFICS: PlanetId9[] = ['Saturn', 'Mars', 'Sun', 'Rahu', 'Ketu'];

/** జైమిని కారకుల అన్వయం — శాస్త్ర నిర్దేశం ప్రకారం */
const HOUSE_KARAKA: Record<number, string> = {
  1: 'AK',
  3: 'BK',
  4: 'MK',
  5: 'PK',
  6: 'GK',
  7: 'DK',
  9: 'PiK',
  10: 'AmK',
};

const KARAKA_TE: Record<string, string> = {
  AK: 'ఆత్మకారకుడు',
  AmK: 'అమాత్యకారకుడు',
  BK: 'భ్రాతృకారకుడు',
  MK: 'మాతృకారకుడు',
  PiK: 'పితృకారకుడు',
  PK: 'పుత్రకారకుడు',
  GK: 'జ్ఞాతికారకుడు',
  DK: 'దారకారకుడు',
};

/** భావ విషయం — ఏ జీవనాంగం? */
export const HOUSE_DOMAIN_TE: Record<number, string> = {
  1: 'దేహం · వ్యక్తిత్వం · ఆరోగ్యం',
  2: 'ధనం · కుటుంబం · వాక్కు',
  3: 'పరాక్రమం · సోదరులు · నైపుణ్యం',
  4: 'గృహం · వాహనం · తల్లి',
  5: 'విద్య · బుద్ధి · సంతానం',
  6: 'రోగం · ఋణం · పోటీ',
  7: 'వివాహం · భాగస్వామి · ఒప్పందం',
  8: 'ఆయుష్షు · ఆకస్మిక మార్పు · గూఢం',
  9: 'భాగ్యం · ధర్మం · గురువు',
  10: 'వృత్తి · కీర్తి · అధికారం',
  11: 'ఆదాయం · లాభం · స్నేహం',
  12: 'వ్యయం · విదేశం · మోక్షం',
};

export interface SchoolVerdict {
  schoolTe: string;
  /** ఏ గ్రంథ నియమం */
  ruleTe: string;
  /** గణన — సంఖ్యలతో */
  evidenceTe: string;
  score: number;
}

export interface DomainWindow {
  fromISO: string;
  toISO: string;
  lordTe: string;
  widthTe: string;
  reasonTe: string;
}

export interface DomainReading {
  house: number;
  domainTe: string;
  /** 7 సంప్రదాయాల తీర్పులు */
  verdicts: SchoolVerdict[];
  /** సగటు — −2 … +2 */
  consensusScore: number;
  /** అత్యధిక/అత్యల్ప తీర్పుల మధ్య వ్యాప్తి */
  spread: number;
  /** ఏకాభిప్రాయం / భిన్నాభిప్రాయం — ఎందుకు */
  consensusTe: string;
  /** ఈ భావ స్కోరును ఎలా చదవాలి (దుష్ట స్థానాల్లో అర్థం మారుతుంది) */
  polarityTe: string;
  /** “ఏం జరుగుతుంది” — స్కోరు + కిటికీల ఆధారంగా ఒక వాక్యం */
  phalaTe: string;
  windows: DomainWindow[];
  pariseelanaTe: string[];
}

export interface SampradayaReport {
  lagnaRasiTe: string;
  lagnaMasaTe: string;
  karakas: { code: string; labelTe: string; planetTe: string; degreeInSign: number }[];
  domains: DomainReading[];
  /** అన్ని భావాల సమగ్ర స్థితి */
  samasyayaTe: string;
  paddhatiTe: string[];
  /** ఏ సంప్రదాయం ఈ జాతకంలో ఎక్కువ బరువు పొందింది */
  prabhutvaTe: string;
}

/**
 * సంవత్సర కొలత — వింశోత్తరి ఇంజిన్ (DA_SHA_YEAR_DAYS = 365.25) తో ఏకరూపంగా
 * 365.25 రోజులు. ముందు 365.2425 వాడటం వల్ల దశా కిటికీలు కొన్ని గంటలు
 * జరిగేవి; ఇప్పుడు ఒకే కొలత.
 */
const YEAR_MS = DA_SHA_YEAR_DAYS * 24 * 3600 * 1000;
const isoOf = (ms: number, tz: number) => {
  const d = new Date(ms + tz * 3600 * 1000);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())}`;
};

/**
 * జైమిని చర కారకులు — రాశి లోపల డిగ్రీల క్రమం.
 * (రాహువుకు వ్యతిరేక క్రమం — శాస్త్ర సంప్రదాయం ప్రకారం 30° నుంచి వెనుకకు.)
 */
function computeKarakas(planets: PlanetPosition[]) {
  const rows = SEVEN.concat(['Rahu'] as PlanetId9[]).map((id) => {
    const p = planets.find((x) => x.id === id)!;
    const deg = id === 'Rahu' ? 30 - p.degreeInSign : p.degreeInSign;
    return { id, deg };
  });
  rows.sort((a, b) => b.deg - a.deg);
  const codes = ['AK', 'AmK', 'BK', 'MK', 'PiK', 'PK', 'GK', 'DK'];
  return codes.map((code, i) => ({
    code,
    labelTe: KARAKA_TE[code],
    planetTe: PLANET_TE[rows[i].id] ?? rows[i].id,
    planetId: rows[i].id as PlanetId9,
    degreeInSign: Number(rows[i].deg.toFixed(2)),
  }));
}

export function computeSampradayaSamanyaya(chart: CompleteChartResult): SampradayaReport {
  const tz = chart.input.tzOffsetHours;
  const lagnaLon = chart.ascendant.siderealLon;
  const lagnaSign = signOfLon(lagnaLon);
  const planets = chart.planets;
  const byId = (id: PlanetId9) => planets.find((p) => p.id === id)!;
  const signOf = (p: PlanetPosition) => signOfLon(p.siderealLon);
  const houseOf = (p: PlanetPosition) => ((signOf(p) - lagnaSign + 12) % 12) + 1;
  const signOfHouse = (h: number) => (lagnaSign + h - 1) % 12;
  const planetsOfSign = (sign: number) =>
    chart.planets.filter((p) => signOfLon(p.siderealLon) === sign);
  const lordOfHouse = (h: number) => SIGN_LORD[signOfHouse(h)];
  const sav = chart.ashtakavarga?.sarvashtakavarga ?? new Array(12).fill(0);
  const karakas = computeKarakas(planets);
  const kMap = new Map(karakas.map((k) => [k.code, k] as const));

  // ---------- వింశోత్తరి: నడుస్తున్న దశ & రాబోయే భుక్తులు ----------
  const nowMs = Date.now();
  const vim = computeVimshottariDeep(chart);
  const currentMaha =
    vim.mahadashas.find((m) => nowMs >= m.startMs && nowMs < m.endMs) ??
    vim.mahadashas[vim.mahadashas.length - 1];
  const currentBhukti = currentMaha.children?.find(
    (b) => nowMs >= b.startMs && nowMs < b.endMs
  );

  // ---------- జైమిని చర దశ & తాజిక వర్షఫలం (ఒకసారి) ----------
  const chara = calculateJaiminiCharaDasha(chart, 'kn_rao');
  const charaCurrent =
    chara.mahadashas.find((m) => m.isCurrent) ??
    chara.mahadashas.find((m) => {
      const start = Date.parse(`${m.startDate}T00:00:00Z`);
      const end = Date.parse(`${m.endDate}T00:00:00Z`);
      return Number.isFinite(start) && Number.isFinite(end) && nowMs >= start && nowMs < end;
    }) ??
    null;
  const tajika = generateTajikaVarshaphalaReport(chart, new Date().getFullYear());

  /** ఇచ్చిన గ్రహం H భావానికి కారకమా? (అధిపతి / నివాసి / కారకుడు) */
  const relatesToHouse = (id: PlanetId9, h: number): 0 | 1 | 2 => {
    const p = byId(id);
    if (!p) return 0;
    const occupies = houseOf(p) === h;
    const owns = lordOfHouse(h) === id;
    const karakaCode = HOUSE_KARAKA[h];
    const isKaraka = karakaCode ? kMap.get(karakaCode)?.planetId === id : false;
    if (occupies && (owns || isKaraka)) return 2;
    if (occupies || owns || isKaraka) return 1;
    return 0;
  };

  // రాబోయే 15 సంవత్సరాల భుక్తి కిటికీలు (నిజమైన దశా చక్రం నుంచి)
  const horizonEnd = nowMs + 15 * YEAR_MS;
  const bhaktiWindows: { id: PlanetId9; from: number; to: number; maha: PlanetId9 }[] = [];
  for (const m of vim.mahadashas) {
    if (m.endMs < nowMs) continue;
    if (m.startMs > horizonEnd) break;
    const bhuktis = m.children?.length ? m.children : expandNine(m.lord as PlanetId9, m.startMs, m.endMs, 'AD', tz);
    for (const b of bhuktis) {
      if (b.endMs < nowMs || b.startMs > horizonEnd) continue;
      bhaktiWindows.push({
        id: b.lord as PlanetId9,
        from: Math.max(b.startMs, nowMs),
        to: Math.min(b.endMs, horizonEnd),
        maha: m.lord as PlanetId9,
      });
    }
  }

  const domains: DomainReading[] = [];

  for (let h = 1; h <= 12; h++) {
    const houseSign = signOfHouse(h);
    const lord = lordOfHouse(h);
    const lordP = byId(lord);
    const lordHouse = houseOf(lordP);
    const lordDignity = lordP.dignity;
    const occupants = planets.filter((p) => ALL9.includes(p.id as PlanetId9) && houseOf(p) === h);
    const bindus = sav[houseSign] ?? 0;
    const verdicts: SchoolVerdict[] = [];

    // ---------- 1. పారాశరీ ----------
    {
      const placement = PLACEMENT_SCORE[lordHouse] ?? 0;
      const dig = DIGNITY_SCORE[lordDignity] ?? 0;
      const beneficOcc = occupants.filter((p) => BENEFICS.includes(p.id as PlanetId9)).length;
      const maleficOcc = occupants.filter((p) => MALEFICS.includes(p.id as PlanetId9)).length;
      const score = clamp(placement * 0.75 + dig * 0.6 + beneficOcc * 0.5 - maleficOcc * 0.45);
      const occTe =
        occupants.length > 0
          ? occupants.map((p) => `${PLANET_TE[p.id]} (${DIGNITY_TE[p.dignity] ?? 'సాధారణ'}${p.isRetrograde ? ', వక్ర' : ''})`).join(', ')
          : 'నివాసులు లేరు';
      verdicts.push({
        schoolTe: 'పారాశరీ',
        ruleTe: 'భావేశుడు కేంద్ర/త్రికోణంలో ఉంటే భావం బలం; 6/8/12లో ఉంటే శ్రమ/ఆటంకం. (బృహత్ పారాశర హోరా శాస్త్రం, భావ విచారణ)',
        evidenceTe: `${h}వ భావేశుడు ${PLANET_TE[lord]} — ${RASI_TE[signOf(lordP)]}లో ${lordHouse}వ భావంలో, క్షేత్రం ${DIGNITY_TE[lordDignity] ?? lordDignity}. భావంలో ${occTe}.`,
        score: roundScore(score),
      });
    }

    // ---------- 2. అష్టకవర్గ ----------
    {
      const avg = 337 / 12;
      const delta = bindus - avg;
      const score = clamp(delta / 4.5);
      verdicts.push({
        schoolTe: 'అష్టకవర్గ',
        ruleTe: 'సాముదాయిక (సర్వాష్టకవర్గ) బిందువులు — సగటు 28.08 కంటే ఎక్కువ ఉంటే ఆ భావం సుఫలం (బృహత్ పారాశర, అష్టకవర్గ అధ్యాయం)',
        evidenceTe: `${h}వ భావ రాశి ${rasiDative(houseSign)} ${bindus} బిందువులు (సగటు ${avg.toFixed(2)}, భేదం ${delta >= 0 ? '+' : ''}${delta.toFixed(2)}).`,
        score: roundScore(score),
      });
    }

    // ---------- 3. జైమిని ----------
    {
      const code = HOUSE_KARAKA[h];
      const k = code ? kMap.get(code)! : undefined;
      let score = 0;
      let evidence = '';
      if (k) {
        const kp = byId(k.planetId);
        const kHouse = houseOf(kp);
        const kScore = PLACEMENT_SCORE[kHouse] ?? 0;
        score = clamp(kScore * 0.8 + (DIGNITY_SCORE[kp.dignity] ?? 0) * 0.4);
        evidence = `${KARAKA_TE[code]} (${code}) ${k.planetTe} — ${RASI_TE[signOf(kp)]}లో ${kHouse}వ భావంలో, ${kp.degreeInSign.toFixed(2)}°. క్షేత్రం ${DIGNITY_TE[kp.dignity] ?? kp.dignity}.`;
      } else {
        // కారకుడు లేని భావాలు: చర దశా రాశికి రాశి దృష్టి సంబంధం
        const runningSign = currentMaha?.lord
          ? signOf(byId(currentMaha.lord as PlanetId9))
          : lagnaSign;
        const drishti = getJaiminiRasiDrishtiSigns(runningSign);
        const sees = drishti.includes(houseSign);
        score = sees ? 1 : 0;
        evidence = `ఈ భావానికి జైమిని ప్రత్యేక కారకుడు లేడు; నడుస్తున్న ${currentMaha.lordTe} మహాదశ (${RASI_TE[runningSign]}) ఆ రాశిని ${sees ? 'దృష్టి చేస్తోంది' : 'దృష్టించడం లేదు'}.`;
      }
      verdicts.push({
        schoolTe: 'జైమిని',
        ruleTe: 'చర కారకుల స్థానం — కేంద్ర/త్రికోణంలో ఉంటే కార్య సిద్ధి; రాశి దృష్టి ప్రకారం కాల నిర్ణయం (జైమిని సూత్రాలు, కారకాధ్యాయం)',
        evidenceTe: evidence,
        score: roundScore(score),
      });
    }

    // ---------- 4. వింశోత్తరి ----------
    {
      const mahaRel = currentMaha ? relatesToHouse(currentMaha.lord as PlanetId9, h) : 0;
      const bhuktiRel = currentBhukti ? relatesToHouse(currentBhukti.lord as PlanetId9, h) : 0;
      const score = clamp((mahaRel + bhuktiRel) * 0.55);
      verdicts.push({
        schoolTe: 'వింశోత్తరి',
        ruleTe: 'మహాదశా/భుక్తి అధిపతి భావాధిపతి, నివాసి లేదా కారకుడైతే ఆ కాలంలో ఆ భావం సక్రియం (ఉడుదాశా ప్రామాణ్యం)',
        evidenceTe: `నడుస్తున్నది ${currentMaha.lordTe} మహాదశ — ${currentBhukti?.lordTe ?? '—'} భుక్తి. భావ సంబంధం: మహాదశ ${mahaRel}/2, భుక్తి ${bhuktiRel}/2.`,
        score: roundScore(score),
      });
    }

    // ---------- 5. కేపీ సబ్-లార్డ్ ----------
    {
      const cusp = chart.houses?.find((c) => c.house === h);
      // సమ భావ (equal-house) కస్ప్: లగ్నం నుంచి 30° చొప్పున. పూర్ణ-రాశి
      // వ్యవస్థలో కస్ప్ 0°00' అవుతుంది — అప్పుడు సబ్-లార్డ్ అర్థరహితం,
      // కాబట్టి కస్ప్ లగ్నాంశ నుంచి లెక్కిస్తాము (KP లో ఇది సమ-భావ సరళి).
      const equalCusp = (((lagnaLon + (h - 1) * 30) % 360) + 360) % 360;
      const cuspLon =
        cusp && cusp.siderealCusp % 30 > 0.01 ? cusp.siderealCusp : equalCusp;
      const cuspSign = signOfLon(cuspLon);
      let score = 0;
      let evidence = '';
      {
        const kp = computeKpStarAndSubLord(cuspLon);
        const subId = kp.subLordId as PlanetId9;
        const subP = byId(subId);
        const subOwns: number[] = [];
        for (let x = 1; x <= 12; x++) if (lordOfHouse(x) === subId) subOwns.push(x);
        const subHouse = subP ? houseOf(subP) : 0;
        const sig = subHouse === h || subOwns.includes(h);
        const dust = DUSTHANA.includes(subHouse) || subOwns.every((x) => DUSTHANA.includes(x));
        score = sig ? 1.5 : dust ? -1.5 : 0;
        evidence = `${h}వ కస్ప్ ${fmtDMS(cuspLon % 30)} ${RASI_TE[cuspSign]}; నక్షత్రాధిపతి ${kp.starLordTe}, సబ్-లార్డ్ ${kp.subLordTe} — ${subHouse}వ భావంలో, అధిపత్యం ${subOwns.length ? subOwns.join('/') : 'లేదు'}. ${sig ? 'సబ్-లార్డ్ ఈ భావానికి సిగ్నిఫికేటర్ → ఫల సిద్ధి.' : dust ? 'సబ్-లార్డ్ 6/8/12 ప్రధానం → ఆటంకం.' : 'సబ్-లార్డ్ తటస్థం → ఫలం ఆలస్యం/ఆధారపడి.'}`;
      }
      verdicts.push({
        schoolTe: 'కేపీ',
        ruleTe: 'కృష్ణమూర్తి పద్ధతి: కస్ప్ సబ్-లార్డ్ ఆ భావానికి సిగ్నిఫికేటర్ అయితే ఫలం; 6/8/12 ప్రధానమైతే నిషేధం',
        evidenceTe: evidence || 'కస్ప్ లభించలేదు — ఈ విభాగం లెక్కించబడలేదు.',
        score: roundScore(score),
      });
    }

    // ---------- 6. చరదశ (జైమిని) ----------
    {
      const cur = charaCurrent;
      let score = 0;
      let evidence = 'నడుస్తున్న చర దశా రాశి లభించలేదు — ఈ పద్ధతి లెక్కించబడలేదు.';
      if (cur) {
        const rela = ((houseSign - cur.rasiIndex + 12) % 12) + 1; // దశా రాశి నుంచి భావ రాశి
        const drishti = getJaiminiRasiDrishtiSigns(cur.rasiIndex);
        const sees = drishti.includes(houseSign);
        const same = cur.rasiIndex === houseSign;
        const dust = [6, 8, 12].includes(rela);
        const trikona = [5, 9].includes(rela);

        // జైమిని నియమం: దశా రాశ్యధిపతి ఎక్కడ ఉన్నాడు, భావేశుడు దశా రాశిలో ఉన్నాడా
        const dashaRasiLord = SIGN_LORD[cur.rasiIndex as 0] as PlanetId9;
        const dashaLordHere = planetsOfSign(houseSign).some(
          (p) => p.id === dashaRasiLord
        );
        const houseLord = SIGN_LORD[houseSign] as PlanetId9;
        const houseLordInDasha = planetsOfSign(cur.rasiIndex).some(
          (p) => p.id === houseLord
        );

        let base = same ? 1.5 : sees ? 0.8 : dust ? -1.1 : trikona ? 0.5 : 0;
        if (dashaLordHere) base += 0.8;
        if (houseLordInDasha) base += 0.5;
        score = clamp(base);

        const reasons: string[] = [];
        if (same) reasons.push('దశా రాశియే భావ రాశి — ఈ కాలంలో ఈ అంశం నేరుగా ముందుకు వస్తుంది');
        if (sees) reasons.push('దశా రాశి ఈ భావ రాశిని రాశి దృష్టితో చూస్తోంది — పరోక్ష క్రియ');
        if (dust && !same) reasons.push('భావ రాశి దశా రాశి నుంచి దుష్ట స్థానంలో — శ్రమ/ఆటంకం');
        if (trikona) reasons.push('త్రికోణ (5/9) సంబంధం — సహజ సహకారం');
        if (dashaLordHere)
          reasons.push(`దశా రాశ్యధిపతి ${PLANET_TE[dashaRasiLord]} ఈ భావ రాశిలోనే — దశా ఫలం ఇక్కడ కేంద్రీకృతం`);
        if (houseLordInDasha)
          reasons.push(`భావేశుడు ${PLANET_TE[houseLord]} దశా రాశిలో — భావ విషయం ఈ దశలో లాగబడుతోంది`);
        if (reasons.length === 0)
          reasons.push('తటస్థ సంబంధం — ఈ దశలో ఈ అంశం ప్రధానం కాదు');

        evidence =
          `నడుస్తున్న చరదశ ${cur.rasiNameTe} (${cur.startDate} – ${cur.endDate}, ` +
          `${cur.durationYears} సం.). దశా రాశి నుంచి ${h}వ భావ రాశి ${RASI_TE[houseSign]} ${rela}వ స్థానం; ` +
          `రాశి దృష్టి ${sees ? 'ఉంది' : 'లేదు'}. ` +
          reasons.join('; ') + '.';
      }
      verdicts.push({
        schoolTe: 'చరదశ',
        ruleTe: 'జైమిని చర దశ: నడుస్తున్న రాశి దశలో ఆ రాశి/దృష్టి/దుష్ట స్థాన సంబంధం ప్రకారం కాల నిర్ణయం (జైమిని సూత్రాలు, KN రావు క్రమం)',
        evidenceTe: evidence,
        score: roundScore(score),
      });
    }

    // ---------- 7. తాజిక (వర్షఫలం) ----------
    {
      const vl = tajika.varshaChart.ascendant.signIndex;
      const varshaHouseSign = (vl + h - 1) % 12;
      const munthaHouse = ((tajika.munthaRasiIndex - vl + 12) % 12) + 1;
      const varsheshaP = tajika.varshaChart.planets.find(
        (p) => p.id === tajika.varsheshwaraPlanetId
      );
      const varsheshaHouse = varsheshaP
        ? ((signOf(varsheshaP) - vl + 12) % 12) + 1
        : 0;
      const ownsHa = SIGN_LORD[varshaHouseSign] === (tajika.varsheshwaraPlanetId as PlanetId9);
      const sitsHa = varsheshaHouse === h;
      const munthaHere = munthaHouse === h;
      const fromMuntha = ((varshaHouseSign - tajika.munthaRasiIndex + 12) % 12) + 1;
      const munthaDust = [6, 8, 12].includes(fromMuntha);
      // వర్ష కుండలిలో ఆ భావ రాశిలో ఉన్న గ్రహాలు (సంవత్సర సక్రియత)
      const varshaOcc = tajika.varshaChart.planets.filter(
        (p) => signOfLon(p.siderealLon) === varshaHouseSign
      );
      const varBen = varshaOcc.filter((p) => BENEFICS.includes(p.id as PlanetId9));
      const varMal = varshaOcc.filter((p) => !BENEFICS.includes(p.id as PlanetId9));
      let score = 0;
      if (munthaHere) score += 1.25;
      if (ownsHa) score += 0.75;
      if (sitsHa) score += 0.5;
      if (munthaDust && !munthaHere) score -= 0.5;
      score += Math.min(varBen.length, 2) * 0.35;
      score -= Math.min(varMal.length, 2) * 0.35;
      score = clamp(score);
      verdicts.push({
        schoolTe: 'తాజిక',
        ruleTe: 'తాజిక వర్షఫలం: ముంథ స్థానం + వర్షేశుడు (పంచాధికారిలలో ప్రధానుడు) ఏ భావాన్ని చూస్తే ఆ సంవత్సరం ఆ అంశం సక్రియం (నీలకంఠి తాజిక)',
        evidenceTe:
          `${tajika.targetYear} వర్షప్రవేశం ${tajika.varshaPraveshaDate}; వర్ష లగ్నం ${RASI_TE[vl]}, ` +
          `ముంథ ${tajika.munthaRasiTe} (వర్ష లగ్నం నుంచి ${munthaHouse}వ భావం). ` +
          `వర్షేశుడు ${tajika.varsheshwaraPlanetTe} — ${ownsHa ? `${RASI_TE[varshaHouseSign]}కి అధిపతి, ` : ''}${sitsHa ? 'ఈ భావంలోనే ఉన్నాడు' : `${varsheshaHouse}వ భావంలో`}. ` +
          (varshaOcc.length
            ? `వర్ష కుండలిలో ఈ భావ రాశిలో ${varshaOcc.map((p) => PLANET_TE[p.id as PlanetId9]).join(', ')} — ` +
              `${varBen.length} శుభ · ${varMal.length} పాప. `
            : 'వర్ష కుండలిలో ఈ భావ రాశి ఖాళీ. ') +
          (munthaHere
            ? 'ముంథ ఈ భావంలోనే — ఈ సంవత్సరపు ప్రధాన ఇరుసు.'
            : munthaDust
              ? `ముంథ నుంచి భావ రాశి ${fromMuntha}వ స్థానం — ఈ సంవత్సరం శ్రమ.`
              : varBen.length && !varMal.length
                ? 'ఈ సంవత్సరం ఈ భావ రాశిలో శుభగ్రహమే — సానుకూల సంవత్సరం.'
                : varMal.length && !varBen.length
                  ? 'ఈ సంవత్సరం ఈ భావ రాశిలో పాపగ్రహమే — జాగ్రత్త అవసరం.'
                  : 'ఈ సంవత్సరం ఈ అంశం ప్రధాన ఇరుసు కాదు.'),
        score: roundScore(score),
      });
    }

    const scores = verdicts.map((v) => v.score);
    const consensusScore = Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2));
    const spread = Number((Math.max(...scores) - Math.min(...scores)).toFixed(2));

    const positives = verdicts.filter((v) => v.score > 0.4);
    const negatives = verdicts.filter((v) => v.score < -0.4);
    let consensusTe: string;
    if (negatives.length === 0 && positives.length >= 3) {
      consensusTe = `ఏకాభిప్రాయం (బలం): ${positives.map((v) => v.schoolTe).join(', ')} — ఈ భావం సుఫలం. సగటు స్కోరు ${consensusScore}.`;
    } else if (positives.length === 0 && negatives.length >= 3) {
      consensusTe = `ఏకాభిప్రాయం (శ్రమ): ${negatives.map((v) => v.schoolTe).join(', ')} — ఈ భావంలో శ్రమ/ఆటంకం. సగటు ${consensusScore}; పరిహారం తప్పనిసరి.`;
    } else if (positives.length > 0 && negatives.length > 0) {
      consensusTe = `భిన్నాభిప్రాయం: ${positives.map((v) => `${v.schoolTe} (+)`).join(', ')} మరియు ${negatives.map((v) => `${v.schoolTe} (−)`).join(', ')} — వ్యాప్తి ${spread}. అంటే సామర్థ్యం ఉంది కానీ కాలం/పద్ధతి తప్పితే ఫలం ఆలస్యం; రెండూ కలిపి చదవాలి.`;
    } else {
      consensusTe = `మిశ్రమ/తటస్థం: బలమైన ఏకాభిప్రాయం లేదు (వ్యాప్తి ${spread}). ఈ భావం జీవితాన్ని నడిపించే ప్రధాన ఇరుసు కాదు — మిగిలిన భావాలపై ఆధారపడి ఉంటుంది.`;
    }

    // ---------- కాల కిటికీలు ----------
    const windows: DomainWindow[] = bhaktiWindows
      .map((w) => ({ w, rel: relatesToHouse(w.id, h) }))
      .filter((x) => x.rel > 0)
      .sort((a, b) => b.rel - a.rel || a.w.from - b.w.from)
      .slice(0, 4)
      .map(({ w, rel }) => ({
        fromISO: isoOf(w.from, tz),
        toISO: isoOf(w.to, tz),
        lordTe: `${w.maha === w.id ? '' : `${PLANET_TE[w.maha]} మహాదశలో `}${PLANET_TE[w.id]} భుక్తి`,
        widthTe: `${Math.max(1, Math.round((w.to - w.from) / (30.4375 * 24 * 3600 * 1000)))} నెలలు`,
        reasonTe:
          rel === 2
            ? 'భుక్తి అధిపతి భావంలోనూ ఉన్నాడు, భావాన్ని పాలిస్తున్నాడు/కారకుడు — బలమైన కిటికీ'
            : 'భుక్తి అధిపతి భావాధిపతి/నివాసి/కారకుడు — సక్రియ కిటికీ',
      }));

    // ---------- పరిమితులు (జాతకం చెప్పలేనివి) ----------
    const pariseelanaTe: string[] = [];
    if (h === 7) {
      pariseelanaTe.push(
        'భాగస్వామి పేరు, ముఖచిత్రం, కులం — జాతకం చెప్పదు. 7వ భావం + శుక్రుడు + DK స్థితి మాత్రమే “ఎప్పుడు, ఎలాంటి స్వభావం” చెబుతాయి.'
      );
    }
    if (h === 10) {
      pariseelanaTe.push(
        'సరైన ఉద్యోగ శీర్షికను (designation) జాతకం నిర్దేశించదు; 10వ భావం + AmK + D10 స్వభావం (స్వతంత్ర/సేవ/వాణిజ్యం) చెబుతాయి.'
      );
    }
    if (h === 8) {
      pariseelanaTe.push(
        'ఆయుష్షు ఖచ్చిత సంఖ్యను ఇక్కడ ఇవ్వము — 8వ భావం, శని, మారక గ్రహాల స్థితిని మాత్రమే చూపుతాము; ఆయుర్దాయ నిర్ణయం శాస్త్రీయంగా బహు-కారకం.'
      );
    }
    if (h === 6) {
      pariseelanaTe.push(
        'వ్యాధి నిర్ధారణ వైద్యునిది; జాతకం “ఏ వ్యవస్థ బలహీనం” అన్న సూచన మాత్రమే ఇస్తుంది.'
      );
    }
    if (pariseelanaTe.length === 0) {
      pariseelanaTe.push(
        `ఈ భావంపై ప్రధాన తీర్పు ${verdicts
          .slice()
          .sort((a, b) => Math.abs(b.score) - Math.abs(a.score))[0].schoolTe} నుంచి వచ్చింది; మిగిలినవి సహాయక గణనలు.`
      );
    }

    const dusthana = DUSTHANA.includes(h);
    const polarityTe = dusthana
      ? `గమనిక: ${h}వ భావం దుష్ట స్థానం (6/8/12). ఇక్కడ ఎక్కువ స్కోరు అంటే ఆ భావ విషయాలు — ${HOUSE_DOMAIN_TE[h]} — బలంగా సక్రియం అని మాత్రమే; అది “శుభం” అని అర్థం కాదు. తక్కువ స్కోరు అంటే ఆ ప్రమాదాలు/భారాలు తక్కువగా ప్రభావించే అవకాశం.`
      : `గమనిక: ${h}వ భావం శుభ స్థానం — ఎక్కువ స్కోరు ఆ భావ ఫలాలు (${HOUSE_DOMAIN_TE[h]}) అనుకూలంగా ఉంటాయని, తక్కువ స్కోరు శ్రమ/ఆలస్యం అని అర్థం.`;

    const topPositive = verdicts.filter((v) => v.score > 0).sort((a, b) => b.score - a.score)[0];
    const topNegative = verdicts.filter((v) => v.score < 0).sort((a, b) => a.score - b.score)[0];
    const firstWindow = windows[0];
    const phalaTe = dusthana
      ? consensusScore >= 0.4
        ? `ఈ భావ విషయాలు (${HOUSE_DOMAIN_TE[h]}) సక్రియంగా ఉంటాయి — ${topPositive?.schoolTe ?? 'గణన'} దీన్ని బలపరుస్తోంది.${firstWindow ? ` ${firstWindow.fromISO} నుంచి ${firstWindow.toISO} వరకు ${firstWindow.lordTe} కాలంలో ఈ అంశం ముందుకు వస్తుంది — ముందస్తు జాగ్రత్తతో నిర్వహించుకోవాలి.` : ''}`
        : `ఈ భావ ప్రమాదాలు తక్కువగా ఉంటాయి (సగటు ${consensusScore}).${topNegative ? ` ${topNegative.schoolTe} మాత్రం ${topNegative.evidenceTe.split('—')[1]?.trim().slice(0, 70) ?? 'కొంత శ్రమ'} సూచిస్తోంది.` : ''}`
      : consensusScore >= 0.6
        ? `అనుకూలం — ${topPositive?.schoolTe ?? 'గణన'} ప్రధాన సాక్ష్యం.${firstWindow ? ` ${firstWindow.fromISO} నుంచి ${firstWindow.toISO} వరకు (${firstWindow.lordTe}) ఈ భావ ఫలం స్పష్టంగా ముందుకు వస్తుంది.` : ''}`
        : consensusScore <= -0.6
          ? `శ్రమతో కూడినది — ${topNegative?.schoolTe ?? 'గణన'} ప్రధాన సాక్ష్యం.${firstWindow ? ` ${firstWindow.fromISO} నుంచి ${firstWindow.toISO} వరకు (${firstWindow.lordTe}) శ్రద్ధ అవసరం.` : ''}`
          : `మధ్యస్థం — సగటు ${consensusScore}, వ్యాప్తి ${spread}.${firstWindow ? ` ${firstWindow.fromISO} నుండి ${firstWindow.toISO} వరకు ${firstWindow.lordTe} కాలంలో స్పష్టత వస్తుంది.` : ''}`;

    domains.push({
      house: h,
      domainTe: HOUSE_DOMAIN_TE[h],
      verdicts,
      consensusScore,
      spread,
      consensusTe,
      polarityTe,
      phalaTe,
      windows,
      pariseelanaTe,
    });
  }

  // ---------- ఏ సంప్రదాయం ఈ జాతకంలో బలంగా మాట్లాడింది ----------
  const decisive = new Map<string, { n: number; sum: number }>();
  for (const d of domains) {
    for (const v of d.verdicts) {
      if (Math.abs(v.score) < 1) continue; // తటస్థ తీర్పులు లెక్కించము
      const cur = decisive.get(v.schoolTe) ?? { n: 0, sum: 0 };
      decisive.set(v.schoolTe, { n: cur.n + 1, sum: cur.sum + Math.abs(v.score) });
    }
  }
  const ranked = [...decisive.entries()].sort((a, b) => b[1].n - a[1].n || b[1].sum - a[1].sum);
  const prabhutvaTe = ranked.length
    ? `ఈ జాతకంలో నిర్ణాయక తీర్పులు (|స్కోరు| ≥ 1) ఇచ్చిన పద్ధతులు: ${ranked
        .slice(0, 3)
        .map(([s, v]) => `${s} — ${v.n} భావాల్లో`)
        .join(', ')}. ${ranked[0][0]} ఈ కుండలిలో అత్యంత స్పష్టంగా మాట్లాడుతోంది; మిగిలిన సంప్రదాయాలు దానికి సాక్ష్యం/ప్రతిసాక్ష్యం.`
    : 'ఏ పద్ధతీ నిర్ణాయక స్థాయిలో మాట్లాడలేదు — ఈ కుండలి మిశ్రమ స్వభావం కలిగినది; తీర్పులను జాగ్రత్తగా, కాలాన్ని బట్టి చదవాలి.';

  const strong = domains
    .filter((d) => d.consensusScore >= 0.6 && !DUSTHANA.includes(d.house))
    .map((d) => `${d.house}. ${d.domainTe}`);
  const weak = domains
    .filter((d) => d.consensusScore <= -0.6 && !DUSTHANA.includes(d.house))
    .map((d) => `${d.house}. ${d.domainTe}`);
  const activeDusthana = domains
    .filter((d) => d.consensusScore >= 0.6 && DUSTHANA.includes(d.house))
    .map((d) => `${d.house}. ${d.domainTe}`);
  const calmDusthana = domains
    .filter((d) => d.consensusScore <= -0.6 && DUSTHANA.includes(d.house))
    .map((d) => `${d.house}. ${d.domainTe}`);
  const mixed = domains.filter((d) => d.spread >= 2.5).map((d) => `${d.house}. ${d.domainTe}`);

  const samasyayaTe = [
    strong.length ? `బలమైన జీవనాంగాలు: ${strong.join(' · ')}.` : 'ఏ శుభ భావమూ అత్యున్నత స్థాయిలో లేదు.',
    weak.length ? `శ్రమ/పరిహారం అవసరమైనవి: ${weak.join(' · ')}.` : 'ఏ శుభ భావమూ తీవ్రంగా దుర్బలం కాదు.',
    activeDusthana.length
      ? `సక్రియ దుష్ట స్థానాలు (ముందస్తు జాగ్రత్త): ${activeDusthana.join(' · ')}.`
      : '',
    calmDusthana.length ? `శాంతించిన దుష్ట స్థానాలు: ${calmDusthana.join(' · ')}.` : '',
    mixed.length
      ? `పద్ధతుల మధ్య భిన్నాభిప్రాయం ఉన్నవి: ${mixed.join(' · ')} — ఇవి కాలాన్ని బట్టి మారుతాయి.`
      : 'అన్ని భావాల్లో పద్ధతులు ఏకీభవిస్తున్నాయి.',
  ].join(' ');

  return {
    lagnaRasiTe: RASI_TE[lagnaSign],
    lagnaMasaTe: chart.ascendant.nakshatra,
    karakas: karakas.map(({ code, labelTe, planetTe, degreeInSign }) => ({
      code,
      labelTe,
      planetTe,
      degreeInSign,
    })),
    domains,
    samasyayaTe,
    prabhutvaTe,
    paddhatiTe: [
      'పారాశరీ — భావేశ స్థానం, క్షేత్రం, భావ నివాసులు (బృహత్ పారాశర హోరా శాస్త్రం).',
      'అష్టకవర్గ — సర్వాష్టకవర్గ బిందువులు, సగటు 28.08 (బృహత్ పారాశర అష్టకవర్గాధ్యాయం).',
      'జైమిని — చర కారకులు (AK…DK), రాశి దృష్టి, చర దశ (జైమిని సూత్రాలు).',
      'వింశోత్తరి — మహాదశా/భుక్తి అధిపతుల భావ సంబంధం (ఉడుదాశా ప్రామాణ్యం).',
      'కేపీ — భావ కస్ప్ సబ్-లార్డ్ (కృష్ణమూర్తి పద్ధతి, 249 ఉప-విభాగం).',
      'చరదశ — నడుస్తున్న జైమిని రాశి దశ, రాశి దృష్టి, దుష్ట స్థాన సంబంధం (జైమిని సూత్రాలు, KN రావు క్రమం).',
      'తాజిక — ఈ సంవత్సరపు వర్ష లగ్నం, ముంథ స్థానం, వర్షేశుడు (నీలకంఠి తాజిక వర్షఫలం).',
      'ప్రతి స్కోరు −2 … +2; ఒక్క పద్ధతి మాత్రమే తీర్పు ఇవ్వదు — సగటు + వ్యాప్తి రెండూ చూపబడతాయి.',
    ],
  };
}
