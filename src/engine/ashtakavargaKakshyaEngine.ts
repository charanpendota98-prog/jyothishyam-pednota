/**
 * ashtakavargaKakshyaEngine.ts — కక్ష్యా గోచార ఫలం
 * =================================================
 * అష్టకవర్గంలోని సూక్ష్మ స్థాయి — రాశి (30°) ను 3°45′ చొప్పున ఎనిమిది
 * **కక్ష్యలుగా** విభజించి, ఆ కక్ష్యా స్వామి ఆ గ్రహానికి ఆ రాశిలో బిందువు
 * ఇచ్చాడా అని చూస్తారు. బిందువు ఉంటే ఆ కక్ష్యలో ఆ గ్రహం శుభం; లేకపోతే
 * శుభ భావంలో ప్రవేశించినా ఫలం లోపిస్తుంది.
 *
 * శాస్త్ర ఆధారం
 * --------------
 *  • బృహత్ పరాశర హోరా శాస్త్రం — అష్టకవర్గ అధ్యాయం (కక్ష్యా విభాగం).
 *  • కక్ష్యా క్రమం 0° నుంచి: శని, గురు, కుజ, రవి, శుక్ర, బుధ, చంద్ర, లగ్నం —
 *    ప్రతి కక్ష్య 3°45′ (30° ÷ 8).
 *  • బిందు పట్టికలు `ashtakavargaTables.ts` నుంచే (ఒకే నిజం).
 *
 * ఉపయోగం: దిన/మాస ఫలాలు, గోచార సమయ నిర్ణయం — “శని 5వ భావంలో ఉన్నాడు,
 * కానీ ఇప్పుడు బిందువు లేని కక్ష్యలో నడుస్తున్నాడు” అన్న సూక్ష్మం.
 */

import { grahaSiderealLongitude, type GrahaId, type SiderealMode } from './astroCore.ts';
import {
  buildContributorBindus,
  CONTRIBUTORS,
  CONTRIBUTOR_TE,
  KAKSHYA_ORDER,
  KAKSHYA_SPAN,
  type Contributor,
} from './ashtakavargaTables.ts';
import type { CompleteChartResult } from './ephemeris.ts';
import { TELUGU_RASIS } from './rasiNames.ts';

export interface KakshyaPosition {
  signIndex: number;
  degInSign: number;
  /** 0…7 — రాశిలో ఎనిమిదో వంతు సూచిక */
  kakshyaIndex: number;
  contributor: Contributor;
  startDegInSign: number;
  endDegInSign: number;
}

/** ఇచ్చిన నిరయన రేఖాంశం ఏ రాశిలో, ఏ కక్ష్యలో ఉంది. */
export function kakshyaOf(siderealLon: number): KakshyaPosition {
  const lon = ((siderealLon % 360) + 360) % 360;
  const signIndex = Math.floor(lon / 30) % 12;
  const degInSign = lon - signIndex * 30;
  const kakshyaIndex = Math.min(7, Math.floor(degInSign / KAKSHYA_SPAN));
  return {
    signIndex,
    degInSign,
    kakshyaIndex,
    contributor: KAKSHYA_ORDER[kakshyaIndex],
    startDegInSign: kakshyaIndex * KAKSHYA_SPAN,
    endDegInSign: Math.min(30, (kakshyaIndex + 1) * KAKSHYA_SPAN),
  };
}

/** సాక్షి సూచిక (0…7) — బిందు గ్రిడ్‌లో వరుస */
function contributorIdx(c: Contributor): number {
  return CONTRIBUTORS.indexOf(c);
}

/** గ్రహం పేరు (బిందు గ్రహం) — రాహు/కేతులకు కక్ష్య లేదు (అష్టకవర్గం లోనివి కావు). */
const KAKSHYA_GRAHAS: GrahaId[] = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

const GRAHA_TE_MAP: Record<string, string> = {
  Sun: 'సూర్యుడు',
  Moon: 'చంద్రుడు',
  Mars: 'కుజుడు',
  Mercury: 'బుధుడు',
  Jupiter: 'గురువు',
  Venus: 'శుక్రుడు',
  Saturn: 'శని',
};

export type KakshyaVerdict = 'bindu' | 'no-bindu';

export interface KakshyaTransitEntry {
  graha: string;
  grahaTe: string;
  siderealLon: number;
  signIndex: number;
  signTe: string;
  degInSign: number;
  /** 0…7 */
  kakshyaIndex: number;
  /** 1…8 — పంచాంగ పద్ధతిలో లెక్కించే క్రమం */
  kakshyaNumber: number;
  contributor: Contributor;
  contributorTe: string;
  verdict: KakshyaVerdict;
  /** ఈ కక్ష్యలో ఫలం (తెలుగు వాక్యం) */
  phalaTe: string;
  sourceTe: string;
}

/**
 * జాతకం + క్షణం నుంచి కక్ష్యా గోచార నివేదిక (ఏడు గ్రహాలు).
 * బిందువులు జన్మ కుండలి నుంచే (లగ్నం సహా ఎనిమిది మంది సాక్షులు).
 */
export function computeKakshyaTransits(
  chart: CompleteChartResult,
  jd: number,
  mode: SiderealMode = 'lahiri'
): KakshyaTransitEntry[] {
  const planetSigns: Record<string, number> = {};
  for (const p of chart.planets) planetSigns[p.id] = p.d1Sign;
  const bindus = buildContributorBindus(planetSigns, chart.ascendant.signIndex);

  return KAKSHYA_GRAHAS.map((id) => {
    const lon = grahaSiderealLongitude(id, jd, mode);
    const pos = kakshyaOf(lon);
    const cIdx = contributorIdx(pos.contributor);
    const hasBindu = bindus[id]?.[cIdx]?.[pos.signIndex] ?? false;
    const contributorTe = CONTRIBUTOR_TE[pos.contributor];
    const grahaTe = GRAHA_TE_MAP[id] ?? id;
    return {
      graha: id,
      grahaTe,
      siderealLon: Number(lon.toFixed(4)),
      signIndex: pos.signIndex,
      signTe: TELUGU_RASIS[pos.signIndex].nameTe,
      degInSign: Number(pos.degInSign.toFixed(4)),
      kakshyaIndex: pos.kakshyaIndex,
      kakshyaNumber: pos.kakshyaIndex + 1,
      contributor: pos.contributor,
      contributorTe,
      verdict: hasBindu ? 'bindu' : 'no-bindu',
      phalaTe: hasBindu
        ? `${grahaTe} ${TELUGU_RASIS[pos.signIndex].nameTe} ${pos.startDegInSign.toFixed(2)}°–${pos.endDegInSign.toFixed(2)}° కక్ష్యలో (స్వామి ${contributorTe}) — ఈ కక్ష్యకు ${contributorTe} బిందువు ఇచ్చాడు. కాబట్టి ఇక్కడి సంచారం శుభ ఫలాన్ని ఇస్తుంది.`
        : `${grahaTe} ${TELUGU_RASIS[pos.signIndex].nameTe} ${pos.startDegInSign.toFixed(2)}°–${pos.endDegInSign.toFixed(2)}° కక్ష్యలో (స్వామి ${contributorTe}) — ${contributorTe} ఈ కక్ష్యకు బిందువు ఇవ్వలేదు. భావం శుభమైనా ఈ కక్ష్యలో ఫలం లోపిస్తుంది.`,
      sourceTe: 'బృహత్ పరాశర హోరా శాస్త్రం — అష్టకవర్గ (కక్ష్యా) అధ్యాయం',
    };
  });
}

/**
 * కక్ష్యా బలం 0…1 — బిందువు ఉన్న గ్రహాల నిష్పత్తి (భారాలతో).
 * దిన ఫలంలో ఒక భాగంగా వాడబడుతుంది.
 */
export function kakshyaStrength(entries: KakshyaTransitEntry[]): {
  ratio: number;
  binduCount: number;
  total: number;
  summaryTe: string;
} {
  const weight: Record<string, number> = {
    Saturn: 2,
    Jupiter: 2,
    Sun: 1.4,
    Mars: 1.2,
    Venus: 1,
    Mercury: 1,
    Moon: 0.8,
  };
  let sum = 0;
  let wsum = 0;
  const bindu: string[] = [];
  const noBindu: string[] = [];
  for (const e of entries) {
    const w = weight[e.graha] ?? 1;
    wsum += w;
    if (e.verdict === 'bindu') {
      sum += w;
      bindu.push(e.grahaTe);
    } else {
      noBindu.push(`${e.grahaTe} (${e.kakshyaNumber}వ కక్ష్య)`);
    }
  }
  const ratio = wsum > 0 ? sum / wsum : 0;
  return {
    ratio,
    binduCount: bindu.length,
    total: entries.length,
    summaryTe: `బిందువు ఉన్న కక్ష్యలు: ${bindu.length ? bindu.join(', ') : 'ఏదీ లేదు'}. బిందువు లేని కక్ష్యలు: ${
      noBindu.length ? noBindu.join(', ') : 'ఏదీ లేదు'
    }. గ్రహ సంచారం ఇప్పుడు ${(ratio * 100).toFixed(0)}% శుభ కక్ష్యల్లో నడుస్తోంది.`,
  };
}

/* ================================================================== *
 *  సంవత్సరపు బిందు/నిర్బిందు కక్ష్యా విభాగాలు
 * ================================================================== */

export interface KakshyaSegment {
  graha: string;
  grahaTe: string;
  verdict: KakshyaVerdict;
  /** స్థానిక కాలం (YYYY-MM-DD HH:MM), UTC కాదు */
  startLocal: string;
  endLocal: string;
  days: number;
  signTe: string;
  kakshyaNumber: number;
  contributorTe: string;
  /** ఒకే రాశిలో కక్ష్య మారినప్పుడు మాత్రమే రాశి పేరు మారుతుంది — ముద్రణకు సిద్ధమైన వాక్యం */
  phalaTe: string;
}

const SEGMENT_GRAHAS: GrahaId[] = ['Sun', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

function isoAt(jd: number, tz: number): string {
  const d = new Date((jd - 2440587.5) * 86400000 + tz * 3600000);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}`;
}

/**
 * ఒక సంవత్సరంలో ప్రతి గ్రహం ఏ కక్ష్యలో, ఎప్పటి నుంచి ఎప్పటి వరకు నడిచింది.
 * బిందువు ఉన్న (శుభ) విభాగాలు మాత్రమే కాకుండా రెండూ ఇస్తాము — ఫలం లోపించే
 * కాలాన్ని కూడా చెప్పగలగాలి. 6 గంటల నమూనా + సరిహద్దు వద్ద ద్విభాజనం (1 నిమిషం).
 */
export function kakshyaSegmentsForYear(
  chart: CompleteChartResult,
  year: number,
  tzOffsetHours: number,
  mode: SiderealMode = 'lahiri',
  opts: { binduOnly?: boolean; minDays?: number } = {}
): KakshyaSegment[] {
  const planetSigns: Record<string, number> = {};
  for (const p of chart.planets) planetSigns[p.id] = p.d1Sign;
  const bindus = buildContributorBindus(planetSigns, chart.ascendant.signIndex);

  const startJd = Date.UTC(year, 0, 1) / 86400000 + 2440587.5 - tzOffsetHours / 24;
  const endJd = Date.UTC(year + 1, 0, 1) / 86400000 + 2440587.5 - tzOffsetHours / 24;
  const step = 0.25; // 6 గంటలు
  const minDays = opts.minDays ?? 0.5;

  const stateOf = (id: GrahaId, jd: number) => {
    const lon = grahaSiderealLongitude(id, jd, mode);
    const pos = kakshyaOf(lon);
    const hasBindu = bindus[id]?.[contributorIdx(pos.contributor)]?.[pos.signIndex] ?? false;
    return { pos, hasBindu };
  };

  const out: KakshyaSegment[] = [];
  for (const id of SEGMENT_GRAHAS) {
    let segStart = startJd;
    let cur = stateOf(id, startJd);
    let prevJd = startJd;
    const flush = (endJdAt: number) => {
      const days = endJdAt - segStart;
      if (days >= minDays && (opts.binduOnly !== true || cur.hasBindu)) {
        const grahaTe = GRAHA_TE_MAP[id] ?? id;
        const signTe = TELUGU_RASIS[cur.pos.signIndex].nameTe;
        const contributorTe = CONTRIBUTOR_TE[cur.pos.contributor];
        out.push({
          graha: id,
          grahaTe,
          verdict: cur.hasBindu ? 'bindu' : 'no-bindu',
          startLocal: isoAt(segStart, tzOffsetHours),
          endLocal: isoAt(endJdAt, tzOffsetHours),
          days: Number(days.toFixed(2)),
          signTe,
          kakshyaNumber: cur.pos.kakshyaIndex + 1,
          contributorTe,
          phalaTe: cur.hasBindu
            ? `${grahaTe} ${signTe} ${cur.pos.startDegInSign.toFixed(2)}°–${cur.pos.endDegInSign.toFixed(
                2
              )}° కక్ష్యలో — ${contributorTe} బిందువు ఇచ్చిన కక్ష్య. ఈ కాలంలో గ్రహం తన శుభ ఫలాన్ని పూర్తిగా ఇస్తుంది.`
            : `${grahaTe} ${signTe} ${cur.pos.startDegInSign.toFixed(2)}°–${cur.pos.endDegInSign.toFixed(
                2
              )}° కక్ష్యలో — ${contributorTe} బిందువు ఇవ్వలేదు. ఈ కాలంలో ఆ గ్రహ ఫలం లోపిస్తుంది.`,
        });
      }
    };

    for (let jd = startJd + step; jd < endJd; jd += step) {
      const st = stateOf(id, jd);
      if (st.pos.kakshyaIndex !== cur.pos.kakshyaIndex || st.pos.signIndex !== cur.pos.signIndex) {
        // సరిహద్దు — 1 నిమిషం కచ్చితత్వానికి ద్విభాజనం
        let lo = prevJd;
        let hi = jd;
        for (let k = 0; k < 24; k++) {
          const mid = (lo + hi) / 2;
          const m = stateOf(id, mid);
          if (m.pos.kakshyaIndex === cur.pos.kakshyaIndex && m.pos.signIndex === cur.pos.signIndex) lo = mid;
          else hi = mid;
        }
        flush(hi);
        segStart = hi;
        cur = st;
      }
      prevJd = jd;
    }
    flush(endJd);
  }
  return out;
}

/**
 * రెండు (లేక ఎక్కువ) మంది గ్రహాలు ఒకేసారి బిందువు ఉన్న కక్ష్యల్లో నడిచే కాలాలు.
 * ఉదా: గురువు + శని ఇద్దరూ — దీర్ఘకాల శుభ సంధి. ఇది కల్పితం కాదు; రెండు
 * విభాగాల జాబితాల ఖండనం నుంచే వస్తుంది.
 */
export function kakshyaBinduOverlaps(
  segments: KakshyaSegment[],
  grahas: string[]
): { startLocal: string; endLocal: string; days: number; grahasTe: string[] }[] {
  const lists = grahas.map((g) =>
    segments.filter((s) => s.graha === g && s.verdict === 'bindu')
  );
  if (lists.some((l) => l.length === 0)) return [];
  const toJd = (local: string) => {
    const [d, t] = local.split(' ');
    const [y, m, dd] = d.split('-').map(Number);
    const [hh, mm] = t.split(':').map(Number);
    return Date.UTC(y, m - 1, dd, hh, mm) / 86400000 + 2440587.5;
  };
  let current: { start: number; end: number }[] = lists[0].map((s) => ({
    start: toJd(s.startLocal),
    end: toJd(s.endLocal),
  }));
  for (let i = 1; i < lists.length; i++) {
    const next: { start: number; end: number }[] = [];
    for (const a of current) {
      for (const s of lists[i]) {
        const b = { start: toJd(s.startLocal), end: toJd(s.endLocal) };
        const start = Math.max(a.start, b.start);
        const end = Math.min(a.end, b.end);
        if (end - start > 0.02) next.push({ start, end });
      }
    }
    current = next;
  }
  // ఒకే గ్రహం కక్ష్య మారినా బిందువు కొనసాగితే విభాగాలు అతుక్కుంటాయి — ఒకటిగా చూపుతాము
  const merged: { start: number; end: number }[] = [];
  for (const w of current.sort((a, b) => a.start - b.start)) {
    const last = merged[merged.length - 1];
    if (last && w.start - last.end < 1 / 24) last.end = Math.max(last.end, w.end);
    else merged.push({ ...w });
  }
  const grahasTe = grahas.map((g) => GRAHA_TE_MAP[g] ?? g);
  return merged
    .sort((a, b) => a.start - b.start)
    .map((w) => {
      const pad = (n: number) => String(n).padStart(2, '0');
      const fmt = (jd: number) => {
        const d = new Date((jd - 2440587.5) * 86400000);
        return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(
          d.getUTCHours()
        )}:${pad(d.getUTCMinutes())}`;
      };
      return {
        startLocal: fmt(w.start),
        endLocal: fmt(w.end),
        days: Number((w.end - w.start).toFixed(2)),
        grahasTe,
      };
    });
}
