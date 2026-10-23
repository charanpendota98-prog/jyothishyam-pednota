/**
 * grahaDrishtiEngine.ts — గ్రహ దృష్టి విస్తరణ
 * ============================================
 * మూడు పొరలు, ప్రతిదానికీ వేరే ఆధారం:
 *
 *  1. **రాశి దృష్టి (sign drishti)** — చర రాశులు స్థిర రాశులను, స్థిర రాశులు చర
 *     రాశులను, ద్విస్వభావ రాశులు తమలో తాము చూస్తాయి (పక్క రాశిని విడిచి).
 *     ఆధారం: బృహత్ పరాశర హోరా శాస్త్రం, రాశి దృష్టి ప్రకరణం.
 *
 *  2. **గ్రహ దృష్టి (graha drishti)** — 7వ భావం అందరికీ పూర్ణం (60 విరూపాలు);
 *     4/8కి 45, 5/9కి 30, 3/10కి 15. విశేష దృష్టి: కుజుడు 4/8, గురువు 5/9,
 *     శని 3/10 — ఆ భావాలలో పూర్ణం. ఆధారం: బృహత్ పరాశర అ.26, ఫలదీపికా అ.26.
 *     రాహు/కేతువులకు ఫలదీపికా 5/7/9 దృష్టి.
 *
 *  3. **స్ఫుట దృష్టి (sphuta drishti)** — డిగ్రీల మధ్య దూరం నుంచి లెక్కించే
 *     సూక్ష్మ విరూపాలు (drishtiTables.ts, ఒకే నిజం).
 *
 *  దీనిపై **అర్గళా / విరోధార్గళా** (జైమిని సూత్రాలు) — భావానికి 2, 4, 11లోని
 *  గ్రహాలు అర్గళా; 12, 10, 3లోని గ్రహాలు విరోధార్గళా.
 *
 * ఏ వాక్యమూ స్థిర పాఠ్యం కాదు — ప్రతి తీర్పు ఆ కుండలి స్థానాల నుంచే వస్తుంది.
 */

import { norm360 } from './astroCore.ts';
import { sputaDrishti } from './drishtiTables.ts';
import type { CompleteChartResult } from './ephemeris.ts';
import { TELUGU_RASIS } from './rasiNames.ts';

const GRAHA_TE: Record<string, string> = {
  Sun: 'సూర్యుడు',
  Moon: 'చంద్రుడు',
  Mars: 'కుజుడు',
  Mercury: 'బుధుడు',
  Jupiter: 'గురువు',
  Venus: 'శుక్రుడు',
  Saturn: 'శని',
  Rahu: 'రాహువు',
  Ketu: 'కేతువు',
};

const MALEFICS = new Set(['Sun', 'Mars', 'Saturn', 'Rahu', 'Ketu']);
const NINE = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

export type DrishtiStrength = 'full' | 'three-quarter' | 'half' | 'quarter' | 'none';

export interface DrishtiCast {
  from: string;
  fromTe: string;
  /** 1 (తన రాశి) … 12 */
  house: number;
  toSignIndex: number;
  toSignTe: string;
  strength: DrishtiStrength;
  strengthTe: string;
  virupas: number;
  /** విశేష దృష్టి (కుజ 4/8, గురు 5/9, శని 3/10) వల్ల వచ్చిన పూర్ణత */
  special: boolean;
  /** రాహు/కేతు దృష్టి విధానం */
  rule: 'general' | 'special' | 'node-phaladipika';
}

export interface DrishtiPair {
  a: string;
  b: string;
  aTe: string;
  bTe: string;
  aToB: number;
  bToA: number;
  mutual: boolean;
  /** అంశాలు-భావాలు ఒకదానికొకటి 7వవి అయితే “పరస్పర పూర్ణ దృష్టి” */
  noteTe: string;
}

export interface RasiDrishtiRow {
  signIndex: number;
  signTe: string;
  nature: 'movable' | 'fixed' | 'dual';
  natureTe: string;
  sees: number[];
  seesTe: string[];
}

export interface ArgalaRow {
  house: number;
  signIndex: number;
  signTe: string;
  argala: string[];
  argalaTe: string[];
  virodha: string[];
  virodhaTe: string[];
  net: number;
  verdictTe: string;
}

export interface GrahaDrishtiReport {
  casts: DrishtiCast[];
  pairs: DrishtiPair[];
  rasiDrishti: RasiDrishtiRow[];
  argala: ArgalaRow[];
  /** లగ్నంపై పడిన దృష్టులు — ఫల వాక్యాలతో */
  lagnaDrishti: LagnaDrishtiRow[];
  summaryTe: string;
  sourceTe: string;
}

/* ------------------------------------------------------------------ *
 *  పొర 1 & 2 — రాశి దృష్టి మరియు గ్రహ దృష్టి
 * ------------------------------------------------------------------ */

/** రాశి స్వభావం: 0 చర, 1 స్థిర, 2 ద్విస్వభావ */
export function signNature(signIndex: number): 0 | 1 | 2 {
  return (signIndex % 3) as 0 | 1 | 2;
}

const NATURE_TE = ['చర', 'స్థిర', 'ద్విస్వభావ'];

/**
 * రాశి దృష్టి — ఇచ్చిన రాశి చూసే రాశులు.
 * చర ↔ స్థిర (పక్కది విడిచి), ద్వి ↔ ద్వి. ఇది పరస్పరం (A చూస్తే B కూడా చూస్తుంది).
 */
export function rasiDrishtiOf(signIndex: number): number[] {
  const s = ((signIndex % 12) + 12) % 12;
  const nature = signNature(s);
  const out: number[] = [];
  for (let t = 0; t < 12; t++) {
    if (t === s) continue;
    const gap = (t - s + 12) % 12;
    if (gap === 1 || gap === 11) continue; // పక్క రాశి — దృష్టి లేదు
    const tNat = signNature(t);
    if (nature === 2) {
      if (tNat === 2) out.push(t);
    } else if (tNat !== 2 && tNat !== nature) {
      out.push(t);
    }
  }
  return out;
}

/** గ్రహ దృష్టి విరూపాలు — భావ దూరం (1…12) నుంచి. */
export function signDrishtiVirupas(id: string, houseDistance: number): number {
  const d = ((houseDistance - 1) % 12 + 12) % 12 + 1;
  if (d === 1) return 0;
  if (d === 7) return 60;
  if (id === 'Mars' && (d === 4 || d === 8)) return 60;
  if (id === 'Jupiter' && (d === 5 || d === 9)) return 60;
  if (id === 'Saturn' && (d === 3 || d === 10)) return 60;
  if (id === 'Rahu' || id === 'Ketu') return d === 5 || d === 7 || d === 9 ? 60 : 0;
  if (d === 4 || d === 8) return 45;
  if (d === 5 || d === 9) return 30;
  if (d === 3 || d === 10) return 15;
  return 0;
}

function strengthOf(virupas: number): { key: DrishtiStrength; te: string } {
  if (virupas >= 60) return { key: 'full', te: 'పూర్ణ దృష్టి' };
  if (virupas >= 45) return { key: 'three-quarter', te: 'ముప్పావు దృష్టి' };
  if (virupas >= 30) return { key: 'half', te: 'అర్ధ దృష్టి' };
  if (virupas > 0) return { key: 'quarter', te: 'పాద దృష్టి' };
  return { key: 'none', te: 'దృష్టి లేదు' };
}

/** ఒక గ్రహం ఏయే రాశులను చూస్తుంది (బలంతో సహా). */
export function castDrishti(id: string, signIndex: number): DrishtiCast[] {
  const out: DrishtiCast[] = [];
  for (let d = 2; d <= 12; d++) {
    const v = signDrishtiVirupas(id, d);
    if (v <= 0) continue;
    const target = (signIndex + d - 1) % 12;
    const special =
      (id === 'Mars' && (d === 4 || d === 8)) ||
      (id === 'Jupiter' && (d === 5 || d === 9)) ||
      (id === 'Saturn' && (d === 3 || d === 10)) ||
      d === 7;
    const st = strengthOf(v);
    out.push({
      from: id,
      fromTe: GRAHA_TE[id] ?? id,
      house: d,
      toSignIndex: target,
      toSignTe: TELUGU_RASIS[target].nameTe,
      strength: st.key,
      strengthTe: st.te,
      virupas: v,
      special,
      rule:
        id === 'Rahu' || id === 'Ketu'
          ? 'node-phaladipika'
          : special && d !== 7
            ? 'special'
            : 'general',
    });
  }
  return out;
}

/* ------------------------------------------------------------------ *
 *  పొర 3 — అర్గళా / విరోధార్గళా
 * ------------------------------------------------------------------ */

const ARGALA_HOUSES = [2, 4, 11];
const VIRODHA_HOUSES = [12, 10, 3];

/** రాశ్యధిపతులు (0 = మేషం … 11 = మీనం) */
const SIGN_LORD: string[] = [
  'Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury',
  'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter',
];

/** దృష్టి భావానికి సంబంధించిన క్షేత్రం — ఫల వాక్యానికి */
const HOUSE_THEME_TE: Record<number, string> = {
  2: 'ధన, వాక్కు, కుటుంబ వృద్ధి',
  3: 'శ్రమ, సాహసం, సోదరులు, ప్రయత్నం',
  4: 'గృహం, మాతృసుఖం, మనశ్శాంతి',
  5: 'సంతానం, విద్య, సృజన, పూర్వపుణ్యం',
  7: 'భాగస్వామ్యం, వివాహం, బాహ్య ప్రపంచం',
  8: 'మార్పు, గూఢ విద్య, ఆకస్మిక సంఘటనలు',
  9: 'ధర్మం, భాగ్యం, గురుకృప, దీర్ఘ ప్రయాణం',
  10: 'కర్మ, ఉద్యోగం, ప్రతిష్ఠ',
  11: 'లాభం, స్నేహితులు, ఆశల నెరవేర్పు',
};

export interface LagnaDrishtiRow {
  from: string;
  fromTe: string;
  house: number;
  virupas: number;
  strengthTe: string;
  nature: 'benefic' | 'malefic';
  lordshipsTe: string;
  phalaTe: string;
}

function occupantsBySign(chart: CompleteChartResult): Map<number, string[]> {
  const map = new Map<number, string[]>();
  for (const p of chart.planets) {
    if (!NINE.includes(p.id)) continue;
    const s = p.d1Sign;
    map.set(s, [...(map.get(s) ?? []), p.id]);
  }
  return map;
}

function houseLordshipsTe(asc: number, graha: string): string {
  const houses: number[] = [];
  for (let h = 1; h <= 12; h++) {
    if (SIGN_LORD[(asc + h - 1) % 12] === graha) houses.push(h);
  }
  return houses.length ? `${houses.join(', ')} భావాధిపతి` : 'భావాధిపత్యం లేదు';
}

export function lagnaDrishtiRows(chart: CompleteChartResult, casts: DrishtiCast[]): LagnaDrishtiRow[] {
  const asc = chart.ascendant.signIndex;
  return casts
    .filter((c) => c.toSignIndex === asc && c.house !== 1)
    .sort((a, b) => b.virupas - a.virupas)
    .map((c) => {
      const malefic = MALEFICS.has(c.from);
      const theme = HOUSE_THEME_TE[c.house] ?? 'సామాన్య భావం';
      const lords = houseLordshipsTe(asc, c.from);
      return {
        from: c.from,
        fromTe: c.fromTe,
        house: c.house,
        virupas: c.virupas,
        strengthTe: c.strengthTe,
        nature: malefic ? 'malefic' : 'benefic',
        lordshipsTe: lords,
        phalaTe:
          `${c.fromTe} (${lords}) ${c.house}వ స్థానం నుంచి లగ్నంపై ${c.strengthTe} (${c.virupas} విరూపాలు) — ` +
          `${malefic ? 'పాప దృష్టి కాబట్టి శరీరం/మనస్సుపై ఒత్తిడి, క్రమశిక్షణ అవసరం' : 'శుభ దృష్టి కాబట్టి ఆత్మవిశ్వాసం, అనుకూలత పెరుగుతాయి'}; ` +
          `దృష్టి మూలం ${theme} వైపు నడిపిస్తుంది.`,
      };
    });
}

export function computeGrahaDrishti(chart: CompleteChartResult): GrahaDrishtiReport {
  const asc = chart.ascendant.signIndex;
  const occupants = occupantsBySign(chart);
  const posOf: Record<string, { sign: number; lon: number }> = {};
  for (const p of chart.planets) posOf[p.id] = { sign: p.d1Sign, lon: p.siderealLon };

  /* ---- దృష్టి వేయడం ---- */
  const casts: DrishtiCast[] = [];
  for (const id of NINE) {
    const p = posOf[id];
    if (!p) continue;
    casts.push(...castDrishti(id, p.sign));
  }

  /* ---- జంటల మధ్య స్ఫుట దృష్టి ---- */
  const pairs: DrishtiPair[] = [];
  for (let i = 0; i < NINE.length; i++) {
    for (let j = i + 1; j < NINE.length; j++) {
      const a = NINE[i];
      const b = NINE[j];
      if (!posOf[a] || !posOf[b]) continue;
      const ab = sputaDrishti(a, norm360(posOf[b].lon - posOf[a].lon));
      const ba = sputaDrishti(b, norm360(posOf[a].lon - posOf[b].lon));
      const houseGap = ((posOf[b].sign - posOf[a].sign + 12) % 12) + 1;
      pairs.push({
        a,
        b,
        aTe: GRAHA_TE[a] ?? a,
        bTe: GRAHA_TE[b] ?? b,
        aToB: Number(ab.toFixed(2)),
        bToA: Number(ba.toFixed(2)),
        mutual: ab >= 30 && ba >= 30,
        noteTe:
          houseGap === 7
            ? `${GRAHA_TE[a]} మరియు ${GRAHA_TE[b]} పరస్పరం 7వ స్థానంలో — ఇద్దరికీ పూర్ణ దృష్టి (60 విరూపాలు).`
            : `${GRAHA_TE[a]} నుంచి ${GRAHA_TE[b]}కి ${ab.toFixed(1)} విరూపాలు · తిరిగి ${ba.toFixed(1)} విరూపాలు.`,
      });
    }
  }

  /* ---- రాశి దృష్టి పట్టిక ---- */
  const rasiDrishti: RasiDrishtiRow[] = [];
  for (let s = 0; s < 12; s++) {
    const sees = rasiDrishtiOf(s);
    rasiDrishti.push({
      signIndex: s,
      signTe: TELUGU_RASIS[s].nameTe,
      nature: (['movable', 'fixed', 'dual'] as const)[signNature(s)],
      natureTe: NATURE_TE[signNature(s)],
      sees,
      seesTe: sees.map((x) => TELUGU_RASIS[x].nameTe),
    });
  }

  /* ---- అర్గళా ---- */
  const argala: ArgalaRow[] = [];
  for (let h = 1; h <= 12; h++) {
    const sign = (asc + h - 1) % 12;
    const arg: string[] = [];
    const vir: string[] = [];
    for (const d of ARGALA_HOUSES) {
      const s = (sign + d - 1) % 12;
      arg.push(...(occupants.get(s) ?? []));
    }
    for (const d of VIRODHA_HOUSES) {
      const s = (sign + d - 1) % 12;
      vir.push(...(occupants.get(s) ?? []));
    }
    // 5వ స్థానం అర్గళా 9వ స్థానపు విరోధంతో సమమైతే లెక్కించబడదు (జైమిని)
    const net = arg.length - vir.length;
    const argTe = arg.map((x) => GRAHA_TE[x] ?? x);
    const virTe = vir.map((x) => GRAHA_TE[x] ?? x);
    argala.push({
      house: h,
      signIndex: sign,
      signTe: TELUGU_RASIS[sign].nameTe,
      argala: arg,
      argalaTe: argTe,
      virodha: vir,
      virodhaTe: virTe,
      net,
      verdictTe:
        net > 0
          ? `${h}వ భావానికి అర్గళా ${argTe.join(', ')} — భావం బలపడుతుంది; విరోధార్గళా ${virTe.join(', ') || 'లేదు'}.`
          : net < 0
            ? `${h}వ భావానికి విరోధార్గళా ${virTe.join(', ')} మించింది — భావ ఫలం ఆగుతుంది.`
            : `${h}వ భావానికి అర్గళా-విరోధార్గళా సమం (${argTe.length}/${virTe.length}) — తటస్థం.`,
    });
  }

  /* ---- సారాంశం — లెక్కించిన అంశాల నుంచే ---- */
  const fullCount = casts.filter((c) => c.virupas >= 60).length;
  const lagnaCasts = casts.filter((c) => c.toSignIndex === asc);
  // రాహు–కేతు ఎప్పుడూ 180° దూరంలో ఉంటారు — వారి జంటను “అత్యధిక దృష్టి”గా చెప్పడం అర్థరహితం
  const strongest = [...pairs]
    .filter((p) => !(p.a === 'Rahu' && p.b === 'Ketu'))
    .sort((x, y) => y.aToB + y.bToA - (x.aToB + x.bToA))[0];
  const lagnaName = TELUGU_RASIS[asc].nameTe.replace(' రాశి', '');
  const summaryTe =
    `మొత్తం ${casts.length} దృష్టులు — అందులో ${fullCount} పూర్ణ దృష్టులు. ` +
    `లగ్నం ${lagnaName} పై ${lagnaCasts.length} దృష్టులు ` +
    `(${lagnaCasts.map((c) => `${c.fromTe} ${c.house}వ నుంచి`).join(', ') || 'ఏదీ లేదు'}). ` +
    (strongest
      ? `అత్యధిక పరస్పర దృష్టి: ${strongest.aTe}–${strongest.bTe} (${(
          strongest.aToB + strongest.bToA
        ).toFixed(1)} విరూపాలు).`
      : '');

  return {
    casts,
    pairs,
    rasiDrishti,
    argala,
    lagnaDrishti: lagnaDrishtiRows(chart, casts),
    summaryTe,
    sourceTe:
      'బృహత్ పరాశర హోరా శాస్త్రం అ.26 (స్ఫుట దృష్టి, విశేష దృష్టులు) · ఫలదీపికా అ.26 (రాహు/కేతు దృష్టి) · జైమిని సూత్రాలు (అర్గళా/విరోధార్గళా)',
  };
}
