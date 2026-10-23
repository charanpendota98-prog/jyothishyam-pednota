/**
 * grahaAvasthaEngine.ts — గ్రహ అవస్థలు (planetary states) + గ్రహ యుద్ధం + అస్తంగతం.
 *
 * మూలం: బృహత్ పారాశర హోరా శాస్త్రం అధ్యాయం 45 (అవస్థా అధ్యాయం);
 *       బాలాది · దీప్తాది · జాగ్రదాది — మూడూ వేర్వేరు కోణాల నుంచి
 *       "ఈ గ్రహం ఈ కుండలిలో ఎంత బలంగా పనిచేస్తుంది" అని చెబుతాయి.
 *
 * ఇక్కడ ఏ తీర్పూ స్థిరంగా రాయబడదు. ప్రతి వాక్యం ఆ గ్రహం యొక్క
 * గణించిన స్థితి (డిగ్రీ, రాశి సమం, దశ, అస్తంగత, యుద్ధం) నుంచే వస్తుంది.
 */
import type { CompleteChartResult } from './ephemeris.ts';
import { TELUGU_PLANETS } from './teluguJathakam.ts';
import { TELUGU_RASIS } from './rasiNames.ts';

export const NAVAGRAHA_IDS = [
  'Sun',
  'Moon',
  'Mars',
  'Mercury',
  'Jupiter',
  'Venus',
  'Saturn',
  'Rahu',
  'Ketu',
] as const;

export type BaladiKey = 'bala' | 'kumara' | 'yuva' | 'vriddha' | 'mrita';

export interface BaladiState {
  key: BaladiKey;
  nameTe: string;
  /** శాస్త్రం ఇచ్చే ఫల భాగం (0 … 1) */
  fraction: number;
  effectTe: string;
}

/** బాలాది అవస్థ — షడ్బలంలో వాడే ఐదు స్థితులు (బృహత్ పారాశర 45.2–3). */
const BALADI: Record<BaladiKey, BaladiState> = {
  bala: { key: 'bala', nameTe: 'బాల', fraction: 0.25, effectTe: 'బాల్య స్థితి — ఫలం ¼ మాత్రమే; ప్రయత్నం పెట్టుబడి లాంటిది' },
  kumara: { key: 'kumara', nameTe: 'కుమార', fraction: 0.5, effectTe: 'కుమార స్థితి — ఫలం ½; పెరుగుతున్న బలం' },
  yuva: { key: 'yuva', nameTe: 'యువ', fraction: 1, effectTe: 'యువ స్థితి — పూర్ణ ఫలం; గ్రహం నిండు బలంతో పనిచేస్తుంది' },
  vriddha: { key: 'vriddha', nameTe: 'వృద్ధ', fraction: 0.25, effectTe: 'వృద్ధ స్థితి — ఫలం క్షీణిస్తుంది; అనుభవం ఉంది కానీ శక్తి తక్కువ' },
  mrita: { key: 'mrita', nameTe: 'మృత', fraction: 0, effectTe: 'మృత స్థితి — ఫలం శూన్యం; ఆ గ్రహం ఇచ్చే ఫలం ఆధారం కాదు' },
};

/** 0 … 30° ను ఐదు 6° ఖండాలుగా విభజించి, సరి/బేసి రాశి బట్టి క్రమం తిప్పడం. */
function baladiAt(degreeInSign: number, signIndex: number): BaladiState {
  const idx = Math.min(4, Math.floor(Math.max(0, Math.min(29.9999, degreeInSign)) / 6));
  const oddSign = signIndex % 2 === 0; // మేషం(0) బేసి రాశి అని సంప్రదాయ లెక్క
  const order: BaladiKey[] = oddSign
    ? ['bala', 'kumara', 'yuva', 'vriddha', 'mrita']
    : ['mrita', 'vriddha', 'yuva', 'kumara', 'bala'];
  return BALADI[order[idx]];
}

export type DeeptadiKey =
  | 'deepta'
  | 'svastha'
  | 'mudita'
  | 'shanta'
  | 'shakta'
  | 'peedita'
  | 'deena'
  | 'vikala'
  | 'khala';

const DEEPTADI_TE: Record<DeeptadiKey, { nameTe: string; effectTe: string }> = {
  deepta: { nameTe: 'దీప్త', effectTe: 'ఉచ్చ స్థానం — పూర్ణ ప్రకాశం, ఇచ్చిన ఫలం నిలుస్తుంది' },
  svastha: { nameTe: 'స్వస్థ', effectTe: 'స్వక్షేత్రం — స్థిరమైన, స్వతంత్ర ఫలం' },
  mudita: { nameTe: 'ముదిత', effectTe: 'మిత్ర క్షేత్రం — సహకారంతో వృద్ధి' },
  shanta: { nameTe: 'శాంత', effectTe: 'శుభ గ్రహ సన్నిధి — ప్రశాంత, సౌమ్య ఫలం' },
  shakta: { nameTe: 'శక్త', effectTe: 'వక్రీ/ఉత్తమ వర్గంలో — శక్తి నిలిచి ఉంది' },
  peedita: { nameTe: 'పీడిత', effectTe: 'గ్రహ యుద్ధంలో ఓటమి — ఫలం ఒత్తిడిలో కుంచించుకుపోతుంది' },
  deena: { nameTe: 'దీన', effectTe: 'శత్రు క్షేత్రం — ఫలం కష్టపడి వస్తుంది' },
  vikala: { nameTe: 'వికల', effectTe: 'అస్తంగత — సూర్యుని కింద మరుగున, ఫలం ఆలస్యం' },
  khala: { nameTe: 'ఖల', effectTe: 'నీచ స్థానం — ఫలం విరుద్ధంగా మారుతుంది' },
};

export type JagradadiKey = 'jagrat' | 'svapna' | 'sushupti';

const JAGRADADI_TE: Record<JagradadiKey, { nameTe: string; effectTe: string }> = {
  jagrat: { nameTe: 'జాగ్రత్', effectTe: 'మేల్కొని ఉంది — ఫలం పూర్తిగా ఇస్తుంది' },
  svapna: { nameTe: 'స్వప్న', effectTe: 'స్వప్న స్థితి — సగం ఫలం, ఊహలో కొంత మిగిలిపోతుంది' },
  sushupti: { nameTe: 'సుషుప్తి', effectTe: 'నిద్రావస్థ — ఫలం మందకొడిగా, ఆలస్యంగా' },
};

/** అస్తంగత (combustion) కోణాలు — సూర్యుని నుంచి (వక్రీ అయితే కుండలీలో చూపిన విలువ). */
const COMBUSTION_ORB: Record<string, { direct: number; retro: number }> = {
  Moon: { direct: 12, retro: 12 },
  Mars: { direct: 17, retro: 17 },
  Mercury: { direct: 14, retro: 12 },
  Jupiter: { direct: 11, retro: 11 },
  Venus: { direct: 10, retro: 8 },
  Saturn: { direct: 15, retro: 15 },
};

/** గ్రహ యుద్ధం — తారా గ్రహాలకే (సూర్య/చంద్ర/రాహు/కేతు మినహాయింపు). */
const WAR_CANDIDATES = ['Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

export interface GrahaAvasthaRow {
  id: string;
  nameTe: string;
  rasiTe: string;
  degreeInSign: number;
  /** బాలాది */
  baladiTe: string;
  baladiFraction: number;
  /** దీప్తాది */
  deeptadiTe: string;
  /** జాగ్రదాది */
  jagradadiTe: string;
  /** అస్తంగత అయితే సూర్యుని నుంచి దూరం, లేకపోతే null */
  combustionDeg: number | null;
  /** గ్రహ యుద్ధం ఫలితం — 'won' | 'lost' | null */
  warResult: 'won' | 'lost' | null;
  warNoteTe: string;
  /** 0–3: ఎన్ని బల-స్థితులు అనుకూలించాయి (బాలాది భాగం + దీప్తాది + జాగ్రదాది) */
  strengthSteps: number;
  /** ఈ గ్రహానికి మొత్తం మూల్యాంకనం, ఈ కుండలి నుంచే */
  verdictTe: string;
}

export interface GrahaAvasthaReport {
  rows: GrahaAvasthaRow[];
  /** ఈ కుండలిలో ఏ గ్రహాలు యుద్ధం చేశాయి */
  warsTe: string[];
  summaryTe: string;
  strongestTe: string;
  weakestTe: string;
  methodNoteTe: string;
}

const nameOf = (id: string) => (TELUGU_PLANETS[id]?.nameTe ?? id).split(' (')[0];
const rasiOf = (i: number) => TELUGU_RASIS[i]?.nameTe.split(' ')[0] ?? '—';

function angularDistance(a: number, b: number): number {
  const d = Math.abs((((a - b) % 360) + 360) % 360);
  return Math.min(d, 360 - d); // 0 … 180
}

export function computeGrahaAvastha(chart: CompleteChartResult): GrahaAvasthaReport {
  const sun = chart.planets.find((p) => p.id === 'Sun');
  const grahas = chart.planets.filter((p) => (NAVAGRAHA_IDS as readonly string[]).includes(p.id));

  // గ్రహ యుద్ధం: ఒకే రాశిలో 1° లోపు దూరంలో ఉన్న రెండు తారా గ్రహాలు.
  const warPairs: { winner: string; loser: string; gap: number }[] = [];
  for (let i = 0; i < WAR_CANDIDATES.length; i += 1) {
    for (let j = i + 1; j < WAR_CANDIDATES.length; j += 1) {
      const a = chart.planets.find((p) => p.id === WAR_CANDIDATES[i]);
      const b = chart.planets.find((p) => p.id === WAR_CANDIDATES[j]);
      if (!a || !b || a.signIndex !== b.signIndex) continue;
      const gap = Math.abs(a.siderealLon - b.siderealLon);
      if (gap > 1) continue;
      // ఉత్తర అక్షాంశం (శరం) ఎక్కువ ఉన్న గ్రహం గెలుస్తుంది — BPHS గ్రహ యుద్ధ నియమం.
      const winner = (a.lat ?? 0) >= (b.lat ?? 0) ? a.id : b.id;
      const loser = winner === a.id ? b.id : a.id;
      warPairs.push({ winner, loser, gap });
    }
  }

  const rows: GrahaAvasthaRow[] = grahas.map((p) => {
    const baladi = baladiAt(p.degreeInSign, p.signIndex);
    const dignity = (p.dignity ?? '').toLowerCase();
    const retro = !!p.isRetrograde;

    // ---- దీప్తాది: నవ అవస్థలు, ప్రాధాన్య క్రమంలో ----
    let deeptadi: DeeptadiKey;
    const lostWar = warPairs.some((w) => w.loser === p.id);
    const wonWar = warPairs.some((w) => w.winner === p.id);
    const combustDeg =
      sun && COMBUSTION_ORB[p.id] ? angularDistance(p.siderealLon, sun.siderealLon) : null;
    const combust =
      combustDeg !== null &&
      COMBUSTION_ORB[p.id] !== undefined &&
      combustDeg <= (retro ? COMBUSTION_ORB[p.id].retro : COMBUSTION_ORB[p.id].direct);

    if (dignity.includes('exalt')) deeptadi = 'deepta';
    else if (dignity.includes('mool') || dignity.includes('own')) deeptadi = 'svastha';
    else if (dignity.includes('friend')) deeptadi = 'mudita';
    else if (lostWar) deeptadi = 'peedita';
    else if (dignity.includes('debilit')) deeptadi = 'khala';
    else if (dignity.includes('enem')) deeptadi = 'deena';
    else if (combust) deeptadi = 'vikala';
    else if (retro) deeptadi = 'shakta';
    else deeptadi = 'shanta';

    // ---- జాగ్రదాది: మూడు స్థితులు ----
    let jagradadi: JagradadiKey;
    if (dignity.includes('exalt') || dignity.includes('own') || dignity.includes('mool')) {
      jagradadi = 'jagrat';
    } else if (dignity.includes('enem') || dignity.includes('debilit')) {
      jagradadi = 'sushupti';
    } else {
      jagradadi = 'svapna';
    }

    const isNode0 = p.id === 'Rahu' || p.id === 'Ketu';
    const deeptaGood = ['deepta', 'svastha', 'mudita', 'shanta', 'shakta'].includes(deeptadi);
    const strengthSteps = isNode0
      ? (jagradadi === 'jagrat' ? 1 : jagradadi === 'svapna' ? 0.5 : 0)
      : (baladi.fraction >= 1 ? 1 : baladi.fraction >= 0.5 ? 0.5 : 0) +
        (deeptaGood ? 1 : 0) +
        (jagradadi === 'jagrat' ? 1 : jagradadi === 'svapna' ? 0.5 : 0);

    const isNode = p.id === 'Rahu' || p.id === 'Ketu';
    const bits: string[] = [];
    if (isNode) {
      bits.push('ఛాయా గ్రహం — బాలాది/దీప్తాది/జాగ్రదాది అవస్థలు వర్తించవు');
      bits.push(`స్థానం ${rasiOf(p.signIndex)} ${p.degreeInSign.toFixed(2)}° — స్థాన బలమే ప్రధానం`);
    } else {
      bits.push(`${baladi.nameTe} అవస్థ (ఫలం ${Math.round(baladi.fraction * 100)}%)`);
      bits.push(`${DEEPTADI_TE[deeptadi].nameTe} — ${DEEPTADI_TE[deeptadi].effectTe}`);
      bits.push(`${JAGRADADI_TE[jagradadi].nameTe} — ${JAGRADADI_TE[jagradadi].effectTe}`);
    }
    if (combust) {
      bits.push(
        `సూర్యునికి ${combustDeg?.toFixed(1)}° దూరంలో — అస్తంగత (కోణం ${COMBUSTION_ORB[p.id]?.[retro ? 'retro' : 'direct']}°), ఫలం మరుగున ఉంటుంది`
      );
    }
    if (wonWar) bits.push('గ్రహ యుద్ధంలో గెలిచింది — దాని తీర్పు నిలుస్తుంది');
    if (lostWar) bits.push('గ్రహ యుద్ధంలో ఓడింది — దాని తీర్పు బలహీనపడుతుంది');
    if (retro && !combust) bits.push('వక్ర గతి — ఫలం తిరిగి వచ్చే స్వభావం, ఆలస్యంగా ఫలించే తత్వం');

    return {
      id: p.id,
      nameTe: nameOf(p.id),
      rasiTe: rasiOf(p.signIndex),
      degreeInSign: p.degreeInSign,
      baladiTe: isNode0 ? '—' : baladi.nameTe,
      baladiFraction: isNode0 ? 0 : baladi.fraction,
      deeptadiTe: isNode0 ? '—' : DEEPTADI_TE[deeptadi].nameTe,
      jagradadiTe: isNode0 ? '—' : JAGRADADI_TE[jagradadi].nameTe,
      combustionDeg: combust ? combustDeg : null,
      warResult: wonWar ? 'won' : lostWar ? 'lost' : null,
      warNoteTe: wonWar
        ? `గ్రహ యుద్ధ విజేత — ${nameOf(warPairs.find((w) => w.winner === p.id)?.loser ?? '')} మీద`
        : lostWar
          ? `గ్రహ యుద్ధ ఓటమి — ${nameOf(warPairs.find((w) => w.loser === p.id)?.winner ?? '')} చేతిలో`
          : '—',
      strengthSteps,
      verdictTe: bits.join(' · '),
    };
  });

  // ర్యాంకింగ్‌లో ఛాయా గ్రహాలు లేవు — వాటికి అవస్థలు వర్తించవు.
  const sorted = rows
    .filter((r) => r.id !== 'Rahu' && r.id !== 'Ketu')
    .sort((a, b) => b.strengthSteps - a.strengthSteps);
  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];

  const warsTe = warPairs.length
    ? warPairs.map(
        (w) =>
          `${nameOf(w.winner)} × ${nameOf(w.loser)} — ${w.gap.toFixed(2)}° వ్యత్యాసం, ${nameOf(w.winner)} గెలిచింది`
      )
    : ['ఈ కుండలిలో ఏ ఇద్దరు తారా గ్రహాలు 1° లోపు ఒకే రాశిలో లేవు — గ్రహ యుద్ధం లేదు.'];

  const combustCount = rows.filter((r) => r.combustionDeg !== null).length;

  return {
    rows,
    warsTe,
    summaryTe:
      `అత్యంత బలమైన స్థితి ${strongest?.nameTe} (${strongest?.baladiTe} · ${strongest?.deeptadiTe} · ${strongest?.jagradadiTe}); ` +
      `అత్యంత బలహీన స్థితి ${weakest?.nameTe} (${weakest?.baladiTe} · ${weakest?.deeptadiTe} · ${weakest?.jagradadiTe}). ` +
      `${combustCount} గ్రహాలు అస్తంగతంలో, ${warPairs.length} గ్రహ యుద్ధం.`,
    strongestTe: strongest ? `${strongest.nameTe} — ${strongest.rasiTe} ${strongest.degreeInSign.toFixed(2)}°` : '—',
    weakestTe: weakest ? `${weakest.nameTe} — ${weakest.rasiTe} ${weakest.degreeInSign.toFixed(2)}°` : '—',
    methodNoteTe:
      'బాలాది అవస్థ (బృహత్ పారాశర 45.2–3): రాశిలోని డిగ్రీని 6° ఖండాలుగా విభజించి, బేసి రాశుల్లో బాల→మృత, సరి రాశుల్లో మృత→బాల. ' +
      'దీప్తాది (45.4–7): ఉచ్చ/స్వ/మిత్ర/శత్రు/నీచ స్థితి, యుద్ధ ఓటమి, అస్తంగతం ఆధారం. ' +
      'జాగ్రదాది: స్వ-ఉచ్చ జాగ్రత్, మిత్ర-సమ స్వప్న, శత్రు-నీచ సుషుప్తి. ' +
      'వృద్ధ అవస్థ ఫలభాగం కొన్ని ముద్రణల్లో ¼, కొన్నింటిలో ½ — ఇక్కడ ¼ తీసుకోబడింది.',
  };
}
