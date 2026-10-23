/**
 * annualMuhurtaEngine.ts — ఏడాది ముహూర్త ప్లానర్ (కార్యం వారీగా)
 * =================================================================
 * పండితుడు “ఈ ఏడాది వివాహానికి మంచి రోజులు ఏవి?” అని అడిగినప్పుడు —
 * 365 రోజులను నియమాలతో వడపోసి, **నిజమైన లగ్న కిటికీలతో** సమాధానం.
 *
 * పద్ధతి
 * ------
 *  1. ప్రతి రోజూ స్థానిక సూర్యోదయ పంచాంగం (తేలికైన వెర్షన్) → తిథి, నక్షత్రం, వారం,
 *     మాసం, అధిక మాసం. ఇవి కార్య నియమాలతో వడపోత.
 *  2. మిగిలిన రోజులకు మాత్రమే పూర్తి పంచాంగం (రాహు/యమ/గుళిక/దుర్ముహూర్తం, హోర,
 *     చోఘడియ, కరణం) → ఖర్చు తక్కువ, ఫలితం అదే.
 *  3. ఆ రోజు **ముహూర్త లగ్నం** (కార్యానికి శాస్త్రం చెప్పిన లగ్నాలు) ఎప్పుడు ఉదయిస్తుందో
 *     4 నిమిషాల అడుగులతో వెతికి, అశుభ కాలాలను (రాహుకాలం, యమగండం, గుళిక, దుర్ముహూర్తం,
 *     భద్ర) తీసేసి కిటికీలు ఇస్తాము.
 *  4. తారాబలం (జన్మ నక్షత్రం నుంచి) మరియు చంద్రబలం (జన్మ రాశి నుంచి) — జాతకుని
 *     బలం కూడా స్కోరులో కలుపుతాము.
 *
 * శాస్త్ర ఆధారం: ముహూర్త చింతామణి (తిథి-వార-నక్షత్ర-యోగ-కరణ శుద్ధి),
 * కాలామృతం (లగ్న శుద్ధి), బృహత్ సంహిత (రాహు/యమ/గుళిక కాలాలు), BPHS (తారా/చంద్ర బలం).
 */

import {
  ascendantTropical,
  ayanamsaDegrees,
  formatLocalHM,
  siderealLongitude,
  type SiderealMode,
} from './astroCore.ts';
import { computeDayPanchanga, computeLightPanchanga, type DayPanchanga, type GeoContext } from './hinduCalendarEngine.ts';
import {
  MUHURTA_ACTIVITIES,
  type MuhurtaActivityId,
} from './muhurtaEngine.ts';
import { TELUGU_NAKSHATRAS, TELUGU_RASIS } from './teluguJathakam.ts';
import type { CompleteChartResult } from './ephemeris.ts';

const NAK_EN_TO_INDEX: Record<string, number> = Object.fromEntries(
  TELUGU_NAKSHATRAS.map((n) => [n.nameEn.toLowerCase().replace(/[^a-z]/g, ''), n.index])
);

const TARA_NAMES_TE = [
  'జన్మ తార',
  'సంపత్ తార',
  'విపత్ తార',
  'క్షేమ తార',
  'ప్రత్యరి తార',
  'సాధక తార',
  'వధ తార',
  'మిత్ర తార',
  'పరమ మిత్ర తార',
];
const TARA_GOOD = [false, true, false, true, false, true, false, true, true];

/** కార్యానికి శాస్త్రం చెప్పిన ముహూర్త లగ్నాలు (రాశి సూచికలు 0…11). */
export const ACTIVITY_LAGNAS: Record<MuhurtaActivityId, number[]> = {
  vivaha: [1, 2, 5, 6, 8, 11], // వృషభ, మిథున, కన్య, తుల, ధనుస్సు, మీన
  grihapravesham: [1, 4, 7, 10], // స్థిర లగ్నాలు
  vyaparam: [1, 2, 5, 8, 11],
  upanayanam: [0, 1, 2, 5, 8, 11],
  bhumi_puja: [1, 4, 7, 10],
  vahana: [1, 2, 5, 6, 8],
  namakaranam: [1, 2, 5, 6, 8, 11],
  vidyarambham: [2, 5, 8],
  sarva_karya: [1, 2, 5, 6, 8, 11],
};

export interface MuhurtaWindow {
  startTime: string;
  endTime: string;
  lagnaTe: string;
  noteTe: string;
}

export interface AnnualMuhurtaCandidate {
  dateISO: string;
  weekdayTe: string;
  score: number;
  /** ముద్రించే స్కోరు 100కి కుదించబడుతుంది; క్రమం కోసం ముడి మొత్తం */
  rawScore: number;
  gradeTe: string;
  tithiTe: string;
  nakshatraTe: string;
  tarabalaTe: string;
  chandrabalaTe: string;
  windows: MuhurtaWindow[];
  reasonsTe: string[];
  warningsTe: string[];
}

export interface AnnualMuhurtaReport {
  activityId: MuhurtaActivityId;
  activityTitleTe: string;
  year: number;
  placeTe: string;
  scanned: number;
  passed: number;
  candidates: AnnualMuhurtaCandidate[];
  summaryTe: string;
  sourceTe: string;
}

function makeWindow(startJd: number, endJd: number, lagna: number, tz: number): MuhurtaWindow {
  // కనిష్ఠ క్షణాల ప్రదర్శనలో ఒక నిమిషం జాగ్రత్త మార్జిన్ — కిటికీ అంచు
  // రాహుకాలం/యమగండం అంచుని తాకినట్టు కనిపించకూడదు.
  const MARGIN = 1 / (24 * 60);
  return {
    startTime: formatLocalHM(startJd + MARGIN, tz),
    endTime: formatLocalHM(endJd - MARGIN, tz),
    lagnaTe: lagnaNameTe(lagna),
    noteTe: `${lagnaNameTe(lagna)} — ఈ కార్యానికి శాస్త్రం చెప్పిన లగ్నం; రాహుకాలాది అశుభ కాలాలు తీసేయబడ్డాయి.`,
  };
}

function minutesBetween(a: string, b: string): number {
  const [ah, am] = a.split(':').map(Number);
  const [bh, bm] = b.split(':').map(Number);
  return bh * 60 + bm - (ah * 60 + am);
}

function pad2(n: number) {
  return String(n).padStart(2, '0');
}
function isoOf(y: number, m: number, d: number) {
  return `${y}-${pad2(m)}-${pad2(d)}`;
}
function daysInMonth(y: number, m: number) {
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

/** అత్యంత పొడవైన (ఉపయోగకరమైన) లగ్న కిటికీ */
function bestWindow(c: AnnualMuhurtaCandidate): MuhurtaWindow | null {
  if (!c.windows.length) return null;
  return [...c.windows].sort(
    (a, b) => minutesBetween(b.startTime, b.endTime) - minutesBetween(a.startTime, a.endTime)
  )[0];
}

function gradeTe(score: number): string {
  if (score >= 85) return 'ఉత్తమం';
  if (score >= 72) return 'శుభం';
  if (score >= 60) return 'మధ్యమం';
  if (score >= 45) return 'జాగ్రత్త';
  return 'అశుభం';
}

/** 'మీన రాశి' → 'మీన లగ్నం' */
function lagnaNameTe(signIndex: number): string {
  return `${TELUGU_RASIS[signIndex].nameTe.replace(' రాశి', '').replace('రాశి', '').trim()} లగ్నం`;
}

/** లగ్న కిటికీలు — ఆ రోజు కార్య లగ్నం ఉదయించే కాలాలు, అశుభ కాలాలు తీసేసి. */
function lagnaWindows(
  p: DayPanchanga,
  lagnas: number[],
  mode: SiderealMode,
  lat: number,
  lng: number,
  tz: number
): MuhurtaWindow[] {
  const sunrise = p.sunriseJd;
  const sunset = p.sunsetJd;
  const step = 2 / (24 * 60); // 2 నిమిషాల అడుగు — లగ్న సంధులు ఖచ్చితంగా
  const MIN_WINDOW = 17 / (24 * 60); // 15 నిమిషాలు + 2 నిమిషాల మార్జిన్ (చిన్న కిటికీ ముహూర్తానికి పనికిరాదు)
  const bad = p.kalas.filter((k) => k.quality === 'inauspicious' && k.startJd !== null && k.endJd !== null);
  // అశుభ కాలాన్ని ఇరువైపులా ఒక నిమిషం పెంచి తీసుకుంటాము — నమూనా అడుగు (2 నిమిషాలు)
  // వల్ల అంచున ఒక క్షణం మిగిలిపోకూడదు.
  const PAD = 1 / (24 * 60);
  const inBad = (jd: number) =>
    bad.some((k) => jd >= (k.startJd as number) - PAD && jd < (k.endJd as number) + PAD);

  type Run = { start: number; end: number; lagna: number };
  const runs: Run[] = [];
  let cur: Run | null = null;
  for (let jd = sunrise; jd <= sunset; jd += step) {
    const asc = ((ascendantTropical(jd, lat, lng) - ayanamsaDegrees(jd, mode)) % 360 + 360) % 360;
    const sign = Math.floor(asc / 30) % 12;
    if (lagnas.includes(sign)) {
      if (cur && cur.lagna === sign) cur.end = jd;
      else {
        if (cur) runs.push(cur);
        cur = { start: jd, end: jd, lagna: sign };
      }
    } else if (cur) {
      runs.push(cur);
      cur = null;
    }
  }
  if (cur) runs.push(cur);

  const out: MuhurtaWindow[] = [];
  for (const r of runs) {
    // అశుభ కాలాన్ని మధ్యలో కలిగి ఉంటే, దానిని విడదీసి శుభ భాగాలను మాత్రమే ఇస్తాము
    let segStart = r.start;
    for (let jd = r.start; jd <= r.end; jd += step) {
      if (inBad(jd)) {
        if (jd - segStart >= MIN_WINDOW) out.push(makeWindow(segStart, jd, r.lagna, tz));
        segStart = jd + step;
      }
    }
    if (r.end - segStart >= MIN_WINDOW) out.push(makeWindow(segStart, r.end, r.lagna, tz));
  }

  // ఒకే లగ్నం, ఆరు నిమిషాల లోపు విరామంతో ఉన్న రెండు ముక్కలు → కలిపేయడం (శాంపిలింగ్ కళ)
  const merged: MuhurtaWindow[] = [];
  for (const w of out.sort((a, b) => a.startTime.localeCompare(b.startTime))) {
    const last = merged[merged.length - 1];
    if (last && last.lagnaTe === w.lagnaTe) {
      const gapMin = minutesBetween(last.endTime, w.startTime);
      if (gapMin <= 6) {
        last.endTime = w.endTime;
        continue;
      }
    }
    merged.push({ ...w });
  }
  return merged;
}

/**
 * ఒక కార్యానికి, ఒక సంవత్సరానికి ముహూర్త రోజుల జాబితా.
 * @param chart జాతకం (తారా/చంద్ర బలానికి); లేకపోతే ఆ రెండూ లేకుండా సాధారణ శుద్ధి మాత్రమే.
 */
export function searchYearMuhurta(
  activityId: MuhurtaActivityId,
  year: number,
  lat: number,
  lng: number,
  tzOffsetHours: number,
  options: {
    siderealMode?: SiderealMode;
    chart?: CompleteChartResult | null;
    placeTe?: string;
    limit?: number;
    fromISO?: string;
    toISO?: string;
    minScore?: number;
  } = {}
): AnnualMuhurtaReport {
  const mode = options.siderealMode ?? 'lahiri';
  const config = MUHURTA_ACTIVITIES[activityId];
  const geoCtx: GeoContext = { lat, lng, tzOffsetHours, placeName: options.placeTe ?? '' };
  const limit = options.limit ?? 12;
  const minScore = options.minScore ?? 60;

  const goodNakIdx = new Set(
    config.goodNakshatraNames
      .map((n) => NAK_EN_TO_INDEX[n.toLowerCase().replace(/[^a-z]/g, '')])
      .filter((i): i is number => typeof i === 'number')
  );
  const badNakIdx = new Set(
    config.avoidNakshatraNames
      .map((n) => NAK_EN_TO_INDEX[n.toLowerCase().replace(/[^a-z]/g, '')])
      .filter((i): i is number => typeof i === 'number')
  );

  const moon = options.chart?.planets.find((p) => p.id === 'Moon');
  const janmaNak = moon ? Math.floor(moon.siderealLon / (360 / 27)) % 27 : null;
  const janmaRasi = moon ? moon.d1Sign : null;

  const fromISO = options.fromISO ?? isoOf(year, 1, 1);
  const toISO = options.toISO ?? isoOf(year, 12, 31);

  const candidates: AnnualMuhurtaCandidate[] = [];
  let scanned = 0;
  let passed = 0;

  for (let m = 1; m <= 12; m++) {
    const dim = daysInMonth(year, m);
    for (let d = 1; d <= dim; d++) {
      const dateISO = isoOf(year, m, d);
      if (dateISO < fromISO || dateISO > toISO) continue;
      scanned += 1;

      const light = computeLightPanchanga(dateISO, geoCtx, mode);
      // ---- వడపోత 1: తిథి / నక్షత్రం / వారం ----
      const tithiIdx = light.tithiAtSunrise;
      const nakIdx = light.nakshatraAtSunrise;
      const weekday = light.weekday;
      if (config.avoidTithiIndices.includes(tithiIdx)) continue;
      if (badNakIdx.has(nakIdx)) continue;
      if (config.avoidVaras.includes(weekday)) continue;
      if (light.masaIsAdhika) continue; // అధిక మాసంలో శుభ కార్యాలు నిషిద్ధం

      const tithiGood = config.goodTithiIndices.includes(tithiIdx);
      const nakGood = goodNakIdx.has(nakIdx);
      const varaGood = config.goodVaras.includes(weekday);
      if (!tithiGood && !nakGood) continue; // రెండూ తప్పితే కార్యం నిలబడదు
      passed += 1;

      // ---- పూర్తి పంచాంగం (ఇప్పుడు మాత్రమే) ----
      const p = computeDayPanchanga(dateISO, geoCtx, { siderealMode: mode });
      const reasons: string[] = [];
      const warnings: string[] = [];

      let score = 18;
      if (tithiGood) {
        score += 17;
        reasons.push(`${p.tithi.pakshaTe} ${p.tithi.nameTe} — ${config.titleTe.split(' ')[0]} కార్యానికి శుభ తిథి.`);
      }
      if (nakGood) {
        score += 17;
        reasons.push(`${p.nakshatra.nameTe} నక్షత్రం — ఈ కార్యానికి శాస్త్రం చెప్పిన శుభ నక్షత్రం.`);
      }
      if (varaGood) {
        score += 7;
        reasons.push(`${p.weekday.nameTe} — ${config.titleTe.split(' ')[0]} కార్యానికి శుభ వారం.`);
      }

      // ---- తారా బలం ----
      let taraTe = 'తారాబలం లెక్కించలేదు (జాతకం ఇవ్వలేదు)';
      if (janmaNak !== null) {
        const tara = ((nakIdx - janmaNak + 27) % 27) % 9;
        if (TARA_GOOD[tara]) {
          score += 8;
          taraTe = `${TARA_NAMES_TE[tara]} — శుభం.`;
          reasons.push(taraTe);
        } else {
          score -= tara === 0 ? 4 : 12;
          taraTe = `${TARA_NAMES_TE[tara]} — ${tara === 0 ? 'శరీర శ్రమ' : 'అశుభం'}.`;
          warnings.push(`${taraTe} తారాబలం బలహీనం.`);
        }
      }

      // ---- చంద్ర బలం ----
      let chandraTe = 'చంద్రబలం లెక్కించలేదు';
      if (janmaRasi !== null) {
        const house = ((p.moonSignIndex - janmaRasi + 12) % 12) + 1;
        const good = [1, 2, 3, 5, 6, 7, 9, 10, 11].includes(house);
        if (house === 8) {
          score -= 18;
          warnings.push('చంద్రుడు జన్మ రాశికి 8వ భావంలో — చంద్రాష్టమం; ఈ రోజు ముహూర్తం వద్దు.');
        } else if (house === 12) {
          score -= 10;
          warnings.push('చంద్రుడు 12వ భావంలో — వ్యయ చంద్రుడు; శుభ కార్యానికి బలహీనం.');
        } else if (good) {
          score += 8;
        }
        chandraTe = `చంద్రుడు ${TELUGU_RASIS[p.moonSignIndex].nameTe}లో — జన్మ రాశి నుంచి ${house}వ భావం.`;
      }

      // ---- గురు/శుక్ర స్థితి (వివాహాది కార్యాలకు కారకులు) ----
      {
        const noonJd = light.sunriseJd + 0.25;
        const sunLon = siderealLongitude('Sun', noonJd, mode);
        for (const [gid, nameTe, limitDeg] of [
          ['Jupiter', 'గురువు', 11],
          ['Venus', 'శుక్రుడు', 10],
        ] as const) {
          const lon = siderealLongitude(gid, noonJd, mode);
          const nextLon = siderealLongitude(gid, noonJd + 1, mode);
          const retro = (((nextLon - lon + 540) % 360) - 180) < 0;
          const sep = Math.abs(((lon - sunLon + 540) % 360) - 180);
          if (retro) warnings.push(`${nameTe} వక్రీ — ఈ కార్యానికి బలహీనం.`);
          else if (sep < limitDeg) warnings.push(`${nameTe} అస్తమయం (సూర్యునికి ${sep.toFixed(1)}°) — శుభ కార్యానికి బలహీనం.`);
          else {
            score += 3;
            reasons.push(`${nameTe} మార్గి మరియు అస్తమయం కాదు — కార్య కారకుడు బలంగా ఉన్నాడు.`);
          }
        }
      }

      // ---- కరణం / భద్ర ----
      if (p.karana.isBhadra) {
        score -= 25;
        warnings.push('విష్టి (భద్ర) కరణం — వివాహ/గృహప్రవేశాది శుభ కార్యాలకు నిషిద్ధం.');
      }
      if (p.specialFlags.some((f) => f.key === 'panchaka')) {
        warnings.push('పంచక కాలం — దక్షిణ దిక్కు ప్రయాణం, శయనం నిషిద్ధం.');
      }

      // ---- ముహూర్త లగ్న కిటికీలు ----
      const windows = lagnaWindows(p, ACTIVITY_LAGNAS[activityId], mode, lat, lng, tzOffsetHours);
      if (!windows.length) {
        warnings.push('ఈ రోజు కార్యానికి శాస్త్రం చెప్పిన లగ్నం శుభ కాలంలో ఉదయించదు — ముహూర్తం కుదరదు.');
      } else {
        score += 8;
        const longest = Math.max(...windows.map((w) => minutesBetween(w.startTime, w.endTime)));
        const usable = longest >= 90 ? 4 : longest >= 60 ? 3 : longest >= 45 ? 2 : longest >= 30 ? 1 : 0;
        score += usable;
        reasons.push(
          `ముహూర్త లగ్నం: ${windows
            .map((w) => `${w.lagnaTe} ${w.startTime}–${w.endTime}`)
            .join(' · ')} (అత్యంత పొడవైన కిటికీ ${longest} నిమిషాలు).`
        );
      }

      // ---- శుభ చోఘడియ + గురు/శుక్ర/బుధ హోర ----
      const goodHora = p.hora.some(
        (h) => ['గురు', 'శుక్ర', 'బుధ'].some((n) => h.nameTe.includes(n)) && h.quality === 'auspicious'
      );
      const goodChog = p.choghadiya.day.some((c) => c.quality === 'auspicious');
      if (goodHora) {
        score += 4;
        reasons.push('ఆ రోజు గురు/శుక్ర/బుధ హోరలు శుభ కాలంలో ఉన్నాయి.');
      }
      if (goodChog) score += 5;

      // ---- శుభ కాలం లేకపోతే ----
      if (!windows.length) score -= 12;

      const rawScore = Math.round(score);
      score = Math.max(0, Math.min(99, rawScore));
      if (score < minScore) continue;

      candidates.push({
        dateISO,
        weekdayTe: p.weekday.nameTe,
        score,
        rawScore,
        gradeTe: gradeTe(score),
        tithiTe: `${p.tithi.pakshaTe} ${p.tithi.nameTe}`,
        nakshatraTe: `${p.nakshatra.nameTe} (పాదం ${p.nakshatra.pada})`,
        tarabalaTe: taraTe,
        chandrabalaTe: chandraTe,
        windows,
        reasonsTe: reasons,
        warningsTe: warnings,
      });
    }
  }

  const sorted = candidates.sort(
    (a, b) => b.rawScore - a.rawScore || b.score - a.score || a.dateISO.localeCompare(b.dateISO)
  );
  const top = sorted.slice(0, limit);
  const summaryTe = top.length
    ? `${year} సంవత్సరంలో ${config.titleTe.split(' ')[0]} కార్యానికి ${sorted.length} రోజులు శాస్త్ర నియమాలను దాటాయి; అత్యుత్తమ ${top.length} ఇక్కడ. మొదటి ఎంపిక ${top[0].dateISO} (${top[0].weekdayTe}, ${top[0].score}/100) — ${bestWindow(top[0])?.lagnaTe ?? ''} ${bestWindow(top[0])?.startTime ?? ''} నుంచి ${bestWindow(top[0])?.endTime ?? ''} వరకు.`
    : `${year} సంవత్సరంలో ఈ కార్యానికి శాస్త్ర నియమాలను దాటిన రోజు లేదు — సంవత్సరం/కార్యం మార్చి చూడండి.`;

  return {
    activityId,
    activityTitleTe: config.titleTe,
    year,
    placeTe: options.placeTe ?? '',
    scanned,
    passed,
    candidates: top,
    summaryTe,
    sourceTe:
      'ముహూర్త చింతామణి (తిథి-వార-నక్షత్ర శుద్ధి) · కాలామృతం (లగ్న శుద్ధి) · బృహత్ సంహిత (రాహు/యమ/గుళిక) · BPHS (తారా-చంద్ర బలం)',
  };
}

/** ఏ మాసంలో ఏ కార్యాలకు ఎన్ని శుభ దినాలు ఉన్నాయి — ఏడాది పట్టిక. */
export function yearMuhurtaHeatmap(
  year: number,
  lat: number,
  lng: number,
  tzOffsetHours: number,
  activities: MuhurtaActivityId[],
  options: { siderealMode?: SiderealMode; chart?: CompleteChartResult | null; placeTe?: string } = {}
): { activityId: MuhurtaActivityId; titleTe: string; byMonth: number[] }[] {
  return activities.map((id) => {
    const report = searchYearMuhurta(id, year, lat, lng, tzOffsetHours, {
      ...options,
      limit: 1000,
      minScore: 60,
    });
    const byMonth = new Array(12).fill(0);
    for (const c of report.candidates) {
      const m = Number(c.dateISO.slice(5, 7));
      byMonth[m - 1] += 1;
    }
    return { activityId: id, titleTe: MUHURTA_ACTIVITIES[id].titleTe, byMonth };
  });
}

/** ఈ రోజు ఏ కార్యానికి అనుకూలం — ఒక చిన్న సంక్షిప్త సమాధానం. */
export function todaysMuhurtaAdvice(
  dateISO: string,
  lat: number,
  lng: number,
  tzOffsetHours: number,
  activities: MuhurtaActivityId[],
  options: { siderealMode?: SiderealMode; chart?: CompleteChartResult | null } = {}
): { activityId: MuhurtaActivityId; titleTe: string; ok: boolean; noteTe: string }[] {
  return activities.map((id) => {
    const rep = searchYearMuhurta(id, Number(dateISO.slice(0, 4)), lat, lng, tzOffsetHours, {
      ...options,
      fromISO: dateISO,
      toISO: dateISO,
      minScore: 0,
      limit: 1,
    });
    const hit = rep.candidates[0];
    return {
      activityId: id,
      titleTe: MUHURTA_ACTIVITIES[id].titleTe,
      ok: Boolean(hit),
      noteTe: hit
        ? `${hit.score}/100 — ${hit.windows[0]?.startTime ?? ''} నుంచి ${hit.windows[0]?.lagnaTe ?? ''}.`
        : 'ఈ రోజు ఈ కార్యానికి శుద్ధి లేదు.',
    };
  });
}
