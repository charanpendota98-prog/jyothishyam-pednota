/**
 * వింశోత్తరీ దశా చక్రం — full five-level Vimśottarī chain with exact timestamps.
 *
 * Levels (classical names used in Telugu patrikās):
 *   1. మహాదశ      (mahādaśā)      — 120-year cycle
 *   2. భుక్తి / అంతర్దశ (antardaśā)   — 9 sub-periods inside a mahādaśā
 *   3. ప్రత్యంతర్దశ (pratyantardaśā)
 *   4. సూక్ష్మదశ   (sūkṣmadaśā)
 *   5. ప్రాణదశ    (prāṇadaśā)
 *
 * Mathematics: each sub-period is `parentWidth × subLordYears / 120`. The
 * starting lord of every level is the parent's lord (BPHS ch. 46–47), and the
 * order is the fixed Vimśottarī order Ketu → Śukra → Sūrya → Candra → Kuja →
 * Rāhu → Guru → Śani → Budha.
 *
 * Year length: the engine uses the sidereal year 365.2425 d (mean Gregorian
 * year). Printed patrikās often use 365.25 d; the difference over a 16-year
 * mahādaśā is ≈ 3 hours, i.e. well under one day. The verification harness
 * therefore pins dates to ±2 days and never to the minute.
 *
 * All dates are emitted as local civil date-times (`YYYY-MM-DD HH:mm`) in the
 * native's timezone, with the *exact* fraction of day preserved — this is what
 * the patrikā's "ఆరంభ తేదీ" column needs, and it also makes it possible to
 * answer "which sūkṣmadaśā is running on a given date?" without drift.
 */

import { msFromJd } from './astroCore.ts';
import type { CompleteChartResult } from './ephemeris.ts';

export const VIMSHOTTARI_ORDER = [
  { id: 'Ketu', nameTe: 'కేతువు', shortTe: 'కే', years: 7, glyph: '☋' },
  { id: 'Venus', nameTe: 'శుక్రుడు', shortTe: 'శు', years: 20, glyph: '♀' },
  { id: 'Sun', nameTe: 'సూర్యుడు', shortTe: 'సూ', years: 6, glyph: '☉' },
  { id: 'Moon', nameTe: 'చంద్రుడు', shortTe: 'చం', years: 10, glyph: '☽' },
  { id: 'Mars', nameTe: 'కుజుడు', shortTe: 'కు', years: 7, glyph: '♂' },
  { id: 'Rahu', nameTe: 'రాహువు', shortTe: 'రా', years: 18, glyph: '☊' },
  { id: 'Jupiter', nameTe: 'గురువు', shortTe: 'గు', years: 16, glyph: '♃' },
  { id: 'Saturn', nameTe: 'శని', shortTe: 'శ', years: 19, glyph: '♄' },
  { id: 'Mercury', nameTe: 'బుధుడు', shortTe: 'బు', years: 17, glyph: '☿' },
] as const;

export type DashaLevelId = 'MD' | 'AD' | 'PD' | 'SD' | 'PrD';

export const DASHA_LEVEL_NAMES_TE: Record<DashaLevelId, string> = {
  MD: 'మహాదశ',
  AD: 'భుక్తి (అంతర్దశ)',
  PD: 'ప్రత్యంతర్దశ',
  SD: 'సూక్ష్మదశ',
  PrD: 'ప్రాణదశ',
};

const MS_PER_YEAR = 365.2425 * 86400 * 1000;
const DAY_MS = 86400 * 1000;

export interface DashaNode {
  level: DashaLevelId;
  lord: string;
  lordTe: string;
  shortTe: string;
  glyph: string;
  /** years of the lord in the 120-year cycle */
  lordYears: number;
  startMs: number;
  endMs: number;
  startLocal: string;
  endLocal: string;
  /** human readable width, e.g. "2 సం. 1 నె. 18 రో." */
  widthTe: string;
  children: DashaNode[];
}

export interface DashaBalanceTe {
  lord: string;
  lordTe: string;
  years: number;
  months: number;
  days: number;
  textTe: string;
  /** fraction of the mahādaśā still to run at birth */
  remainingFraction: number;
  /** start of that mahādaśā (before birth) */
  mahadashaStartLocal: string;
  mahadashaEndLocal: string;
}

export interface VimshottariDeepReport {
  balance: DashaBalanceTe;
  janmaNakshatraTe: string;
  janmaNakshatraPada: number;
  moonLon: number;
  mahadashas: DashaNode[];
  /** the five-level chain running at birth */
  birthChain: { level: DashaLevelId; lord: string; lordTe: string; startLocal: string; endLocal: string }[];
  yearLengthTe: string;
  methodNoteTe: string;
}

/** Format absolute ms as local `YYYY-MM-DD HH:mm` for a tz offset. */
export function formatLocalDateTime(ms: number, tzOffsetHours: number): string {
  const d = new Date(ms + tzOffsetHours * 3600 * 1000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

/** `YYYY-MM-DD` only. */
export function formatLocalDateOnly(ms: number, tzOffsetHours: number): string {
  return formatLocalDateTime(ms, tzOffsetHours).slice(0, 10);
}

/** Width in Telugu units, using the classical 30-day month / 360-day year. */
export function widthTeFromMs(ms: number): string {
  const totalDays = ms / DAY_MS;
  if (totalDays >= 365.25) {
    const years = Math.floor(totalDays / 365.25);
    const rem = totalDays - years * 365.25;
    const months = Math.floor(rem / 30.4375);
    const days = Math.round(rem - months * 30.4375);
    return `${years} సం. ${months} నె. ${days} రో.`;
  }
  if (totalDays >= 30.4375) {
    const months = Math.floor(totalDays / 30.4375);
    const days = Math.round(totalDays - months * 30.4375);
    return `${months} నె. ${days} రో.`;
  }
  if (totalDays >= 1) {
    const days = Math.floor(totalDays);
    const hours = Math.round((totalDays - days) * 24);
    return hours > 0 ? `${days} రో. ${hours} గం.` : `${days} రో.`;
  }
  return `${Math.max(1, Math.round(totalDays * 24))} గం.`;
}

function meta(lord: string) {
  const m = VIMSHOTTARI_ORDER.find((v) => v.id === lord)!;
  return m;
}

/**
 * Expand one level: given the parent lord and the parent's window, produce the
 * nine children (which are *not* recursively expanded).
 */
export function expandNine(parentLord: string, startMs: number, endMs: number, level: DashaLevelId, tz: number): DashaNode[] {
  const width = endMs - startMs;
  const parentIndex = VIMSHOTTARI_ORDER.findIndex((v) => v.id === parentLord);
  let cursor = startMs;
  const out: DashaNode[] = [];
  for (let i = 0; i < 9; i++) {
    const m = VIMSHOTTARI_ORDER[(parentIndex + i) % 9];
    const span = (width * m.years) / 120;
    const childStart = cursor;
    const childEnd = cursor + span;
    out.push({
      level,
      lord: m.id,
      lordTe: m.nameTe,
      shortTe: m.shortTe,
      glyph: m.glyph,
      lordYears: m.years,
      startMs: childStart,
      endMs: childEnd,
      startLocal: formatLocalDateTime(childStart, tz),
      endLocal: formatLocalDateTime(childEnd, tz),
      widthTe: widthTeFromMs(span),
      children: [],
    });
    cursor = childEnd;
  }
  return out;
}

/**
 * Full report. `birthMs` comes from the chart's UTC instant; all conversions to
 * local strings use `tz`.
 */
export function computeVimshottariDeep(chart: CompleteChartResult): VimshottariDeepReport {
  const tz = chart.input.tzOffsetHours;
  const birthMs = msFromJd(chart.julianDay);
  const moon = chart.planets.find((p) => p.id === 'Moon')!;
  const moonLon = ((moon.siderealLon % 360) + 360) % 360;
  const nakSpan = 360 / 27;
  const nakIndex = Math.floor(moonLon / nakSpan);
  const degInNak = moonLon - nakIndex * nakSpan;
  const remainingFraction = 1 - degInNak / nakSpan;
  const startLordIndex = nakIndex % 9;
  const startLord = VIMSHOTTARI_ORDER[startLordIndex];

  const mahaSpan = startLord.years * MS_PER_YEAR;
  const remainingMs = mahaSpan * remainingFraction;
  const elapsedMs = mahaSpan - remainingMs;
  const mdStartMs = birthMs - elapsedMs;

  // Balance in classical years / months / days
  const balYearsFloat = remainingMs / MS_PER_YEAR;
  const years = Math.floor(balYearsFloat);
  const remMonthsFloat = (balYearsFloat - years) * 12;
  const months = Math.floor(remMonthsFloat);
  const days = Math.round((remMonthsFloat - months) * 30.4375);

  // Build the 9 mahādaśās starting from the *running* one (which began before birth).
  const mahadashas: DashaNode[] = [];
  let cursor = mdStartMs;
  for (let i = 0; i < 9; i++) {
    const m = VIMSHOTTARI_ORDER[(startLordIndex + i) % 9];
    const span = m.years * MS_PER_YEAR;
    const start = cursor;
    const end = cursor + span;
    mahadashas.push({
      level: 'MD',
      lord: m.id,
      lordTe: m.nameTe,
      shortTe: m.shortTe,
      glyph: m.glyph,
      lordYears: m.years,
      startMs: start,
      endMs: end,
      startLocal: formatLocalDateTime(start, tz),
      endLocal: formatLocalDateTime(end, tz),
      widthTe: `${m.years} సం.`,
      children: expandNine(m.id, start, end, 'AD', tz),
    });
    cursor = end;
  }

  // Pratyantardaśās inside every antardaśā (9 × 9 × 9 = 729 nodes, cheap).
  for (const md of mahadashas) {
    for (const ad of md.children) {
      ad.children = expandNine(ad.lord, ad.startMs, ad.endMs, 'PD', tz);
    }
  }

  // Five-level chain running at birth.
  const birthChain: VimshottariDeepReport['birthChain'] = [];
  let node: DashaNode | undefined = mahadashas[0];
  for (const level of ['MD', 'AD', 'PD', 'SD', 'PrD'] as DashaLevelId[]) {
    if (!node) break;
    birthChain.push({
      level,
      lord: node.lord,
      lordTe: node.lordTe,
      startLocal: node.startLocal,
      endLocal: node.endLocal,
    });
    if (level === 'PD') {
      // sūkṣma + prāṇa inside the running pratyantardaśā
      const sookshma = expandNine(node.lord, node.startMs, node.endMs, 'SD', tz);
      const running = sookshma.find((s) => birthMs >= s.startMs && birthMs < s.endMs) ?? sookshma[0];
      birthChain.push({
        level: 'SD',
        lord: running.lord,
        lordTe: running.lordTe,
        startLocal: running.startLocal,
        endLocal: running.endLocal,
      });
      const prana = expandNine(running.lord, running.startMs, running.endMs, 'PrD', tz);
      const pr = prana.find((s) => birthMs >= s.startMs && birthMs < s.endMs) ?? prana[0];
      birthChain.push({
        level: 'PrD',
        lord: pr.lord,
        lordTe: pr.lordTe,
        startLocal: pr.startLocal,
        endLocal: pr.endLocal,
      });
      break;
    }
    node = node.children.find((c) => birthMs >= c.startMs && birthMs < c.endMs) ?? node.children[0];
  }

  const NAK_TE = [
    'అశ్విని', 'భరణి', 'కృత్తిక', 'రోహిణి', 'మృగశిర', 'ఆర్ద్ర', 'పునర్వసు',
    'పుష్యమి', 'ఆశ్లేష', 'మఘ', 'పూర్వఫల్గుణి', 'ఉత్తరఫల్గుణి', 'హస్త',
    'చిత్త', 'స్వాతి', 'విశాఖ', 'అనూరాధ', 'జ్యేష్ఠ', 'మూల', 'పూర్వాషాఢ',
    'ఉత్తరాషాఢ', 'శ్రవణం', 'ధనిష్ఠ', 'శతభిష', 'పూర్వాభాద్ర', 'ఉత్తరాభాద్ర', 'రేవతి',
  ];

  return {
    balance: {
      lord: startLord.id,
      lordTe: startLord.nameTe,
      years,
      months,
      days,
      textTe: `${startLord.nameTe} మహాదశ ${years} సం. ${months} నె. ${days} రో. శేషం`,
      remainingFraction: Number(remainingFraction.toFixed(6)),
      mahadashaStartLocal: formatLocalDateTime(mdStartMs, tz),
      mahadashaEndLocal: formatLocalDateTime(mdStartMs + mahaSpan, tz),
    },
    janmaNakshatraTe: NAK_TE[nakIndex],
    janmaNakshatraPada: Math.floor((degInNak % (nakSpan / 4)) / (nakSpan / 4)) + 1,
    moonLon: Number(moonLon.toFixed(4)),
    mahadashas,
    birthChain,
    yearLengthTe: '365.2425 రోజులు (సైడీరియల్ సంవత్సరం)',
    methodNoteTe:
      'వింశోత్తరీ దశ: చంద్రుని నక్షత్ర స్థానం నుండి దశాధిపతిని, మిగిలిన అంశాన్ని నిర్ణయిస్తారు. ప్రతి ఉపదశ = మాతృ దశా కాలం × ఉపదశాధిపతి సంవత్సరాలు ÷ 120. ప్రతి స్థాయిలో మొదటి ఉపదశ ఆ స్థాయి అధిపతితోనే ప్రారంభమవుతుంది. పంచ స్థాయిలు — మహాదశ, భుక్తి, ప్రత్యంతర, సూక్ష్మ, ప్రాణ.',
  };
}

/** Chain expansion for an arbitrary instant (used by the UI date picker). */
export function dashaChainAt(ms: number, tz: number, startLord: string, mdStartMs: number): DashaNode[] {
  const out: DashaNode[] = [];
  const idx = VIMSHOTTARI_ORDER.findIndex((v) => v.id === startLord);
  let cursor = mdStartMs;
  let lord = startLord;
  for (let k = 0; k < 9; k++) {
    const m = VIMSHOTTARI_ORDER[(idx + k) % 9];
    const end = cursor + m.years * MS_PER_YEAR;
    if (ms < end) {
      lord = m.id;
      break;
    }
    cursor = end;
  }
  let startMs = cursor;
  let endMs = startMs + meta(lord).years * MS_PER_YEAR;
  for (const level of ['MD', 'AD', 'PD', 'SD', 'PrD'] as DashaLevelId[]) {
    out.push({
      level,
      lord,
      lordTe: meta(lord).nameTe,
      shortTe: meta(lord).shortTe,
      glyph: meta(lord).glyph,
      lordYears: meta(lord).years,
      startMs,
      endMs,
      startLocal: formatLocalDateTime(startMs, tz),
      endLocal: formatLocalDateTime(endMs, tz),
      widthTe: widthTeFromMs(endMs - startMs),
      children: [],
    });
    const kids = expandNine(lord, startMs, endMs, 'AD', tz);
    const running = kids.find((c) => ms >= c.startMs && ms < c.endMs) ?? kids[0];
    lord = running.lord;
    startMs = running.startMs;
    endMs = running.endMs;
  }
  return out;
}

export { MS_PER_YEAR };
