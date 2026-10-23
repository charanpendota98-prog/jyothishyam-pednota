/**
 * pillarBalaEngine.ts — జీవిత స్తంభాల (Life Pillars) బల గణన
 * ---------------------------------------------------------------------------
 * సమస్య: మునుపు స్తంభాల స్కోరు (91, 94, 92, 88, 86, 89) చేతితో రాసిన స్థిరాంకాలు
 * లేదా “ఒక భావంలో ఉంటే 91, లేకపోతే 82” అన్న ద్వంద్వ నిర్ణయం. అలాగే అనుకూల దశల
 * జాబితాలో గ్రహాల పేర్లు స్థిరంగా కలిపేవి (“బుధ, గురు, శుక్ర దశలు”) — కుండలితో
 * సంబంధం లేకుండా, కొన్నిసార్లు అదే గ్రహం రెండుసార్లు.
 *
 * ఇక్కడ ప్రతి స్తంభానికీ బలం ఐదు కొలతల నుంచి వస్తుంది; ప్రతి కొలతా ఒక సంఖ్యతో
 * సహా చూపబడుతుంది (గ్రంథం: బృహత్ పరాశర హోరా శాస్త్రం — భావ బల, కారక, అష్టకవర్గ,
 * శుభ-పాప స్థితి అధ్యాయాలు):
 *
 *   1. ప్రధాన భావాధిపతి స్థానం      — కేంద్రం / త్రికోణం / దుష్ట స్థానం
 *   2. ఆ అధిపతి ఉచ్చ-నీచ స్థితి      — నీచ బిందువు నుంచి కోణం ÷ 180 (0 … 1)
 *   3. ప్రధాన భావ రాశి సర్వాష్టక     — బిందువులు − సగటు (28.08)
 *   4. ఆ రాశిలో శుభ/పాప నివాసులు
 *   5. కారక గ్రహాల కేంద్రాది స్థితి
 *
 * మొత్తం 5 … 98 మధ్య ఉంటుంది. అనుకూల దశలు కూడా ఇక్కడే లెక్కిస్తాము — ఆ స్తంభానికి
 * సంబంధించిన గ్రహాలను మాత్రమే, డూప్లికేట్ లేకుండా, షడ్బల క్రమంలో, ప్రతి దానికీ
 * కారణం + నిజమైన మహాదశ తేదీలతో.
 */

import type { CompleteChartResult } from './ephemeris.ts';
import { SIGN_LORD, RASI_TE, PLANET_TE, type PlanetId9 } from './lagnaFunctionalEngine.ts';
import { computeShadbalaDeep, DEBILITATION_POINT } from './shadbalaDeepEngine.ts';
import { computeVimshottariDeep } from './vimshottariDeepEngine.ts';
import { housesRuledBy } from './mahadashaPhalaEngine.ts';

/** ఏ స్తంభానికి ఏ భావాలు/కారకులు */
export interface PillarSpec {
  /** ప్రధాన భావం (స్కోరులో ఎక్కువ బరువు) */
  primaryHouse: number;
  /** సహాయక భావాలు */
  houses: number[];
  /** కారక గ్రహాలు (గ్రహ ఐడీలు) */
  karakas: string[];
}

export type PillarBand = 'bala' | 'madhyama' | 'misra' | 'shraddha' | 'durbala';

export interface PillarScorePart {
  nameTe: string;
  points: number;
  noteTe: string;
}

export interface PillarScore {
  /** 5 … 98 */
  score: number;
  band: PillarBand;
  bandTe: string;
  /** బలహీనత/బలం ఏ కారణం నుంచి వచ్చిందో — ఒక వాక్యం (సంఖ్యలతో) */
  leadTe: string;
  /** స్కోరు ఎలా వచ్చిందో — ప్రతి భాగం విడివిడిగా */
  parts: PillarScorePart[];
  /** పట్టిక కోసం సంక్షిప్త వివరణ */
  derivationTe: string;
  /** ఈ స్తంభానికి నిజంగా సంబంధించిన అనుకూల దశలు (డూప్లికేట్ లేదు) */
  favorableTe: string;
  /** అనుకూల గ్రహాల ఐడీలు — గేట్ కోసం */
  favorableIds: string[];
}

const BENEFICS: PlanetId9[] = ['Jupiter', 'Venus', 'Mercury', 'Moon'];

const rasiClean = (idx: number) => RASI_TE[idx].replace(' రాశి', '');
/** 3వ విభక్తి — ం తో ముగిసిన పేరుకు 'ానికి', మిగిలినవాటికి 'కి' (మీనానికి, తులాకి) */
const rasiDative = (idx: number) => {
  const name = rasiClean(idx);
  return name.endsWith('ం') ? `${name.slice(0, -1)}ానికి` : `${name}కి`;
};

/** కేంద్ర / త్రికోణ / దుష్ట స్థాన బరువు (విరూపాల భావనను శాతానికి మార్చినది) */
function houseWeight(house: number): { pts: number; noteTe: string } {
  if ([1, 4, 7, 10].includes(house)) return { pts: 16, noteTe: 'కేంద్ర స్థానం (+16)' };
  if ([5, 9].includes(house)) return { pts: 18, noteTe: 'త్రికోణ స్థానం (+18)' };
  if ([3, 11].includes(house)) return { pts: 9, noteTe: '3/11 స్థానం (+9)' };
  if ([2, 12].includes(house)) return { pts: 4, noteTe: `${house}వ స్థానం (+4)` };
  if ([6, 8].includes(house)) return { pts: -12, noteTe: `${house}వ దుష్ట స్థానం (−12)` };
  return { pts: 0, noteTe: `${house}వ స్థానం (0)` };
}

/**
 * ఉచ్చ–నీచ బలం: నీచ బిందువు నుంచి కోణం 0 … 180 → −10 … +10.
 * (సూర్యుడు తులాలో నీచం, మేషంలో ఉచ్చం — ఇదే సూత్రం అన్ని ఏడు గ్రహాలకూ.)
 */
// నీచ బిందువులు షడ్బల ఇంజిన్‌తో ఒకే మూలం (BPHS అ.3) — ఇక్కడ నకలు చేయము.
const DEBILITATION_DEG: Record<string, number> = DEBILITATION_POINT as unknown as Record<string, number>;

function dignityPoints(id: string, siderealLon: number): { pts: number; noteTe: string } | null {
  const deb = DEBILITATION_DEG[id];
  if (deb === undefined) return null;
  let arc = Math.abs(((siderealLon - deb) % 360 + 360) % 360);
  if (arc > 180) arc = 360 - arc;
  const pts = Math.round((arc / 180) * 20) - 10; // −10 … +10
  const stateTe =
    arc >= 165 ? 'ఉచ్చ సమీపం' : arc <= 15 ? 'నీచ సమీపం' : arc >= 90 ? 'మధ్యమ బలం' : 'నీచత్వం వైపు';
  return { pts, noteTe: `నీచ బిందువు నుంచి ${arc.toFixed(1)}° (${stateTe}, ${pts >= 0 ? '+' : ''}${pts})` };
}

export function computePillarScore(chart: CompleteChartResult, spec: PillarSpec): PillarScore {
  const lagnaSign = chart.ascendant.signIndex;
  const signOfHouse = (h: number) => (lagnaSign + h - 1) % 12;
  const primarySign = signOfHouse(spec.primaryHouse);
  const primaryLord = SIGN_LORD[primarySign] as PlanetId9;
  const lordPlanet = chart.planets.find((p) => p.id === primaryLord)!;
  const shadbala = computeShadbalaDeep(chart);
  const strengthOf = (id: string) =>
    shadbala.rows.find((r) => r.id === id)?.totalVirupas ?? 0;

  const parts: PillarScorePart[] = [];

  // 1) ప్రధాన భావాధిపతి స్థానం
  const hw = houseWeight(lordPlanet.house);
  parts.push({
    nameTe: `${spec.primaryHouse}వ భావాధిపతి ${PLANET_TE[primaryLord]} స్థానం`,
    points: hw.pts,
    noteTe: `${lordPlanet.house}వ భావంలో — ${hw.noteTe}`,
  });

  // 2) అధిపతి ఉచ్చ-నీచ స్థితి
  const dig = dignityPoints(primaryLord, lordPlanet.siderealLon);
  if (dig) {
    parts.push({
      nameTe: `${PLANET_TE[primaryLord]} ఉచ్చ-నీచ స్థితి`,
      points: dig.pts,
      noteTe: dig.noteTe,
    });
  }

  // 3) ప్రధాన రాశి సర్వాష్టకవర్గ బిందువులు (సగటు 28.08)
  const sav = chart.ashtakavarga.sarvashtakavarga[primarySign];
  const savPts = Math.max(-14, Math.min(14, Math.round((sav - 28.083) * 1.2)));
  parts.push({
    nameTe: `${rasiClean(primarySign)} సర్వాష్టకవర్గం`,
    points: savPts,
    noteTe: `${sav} బిందువులు (సగటు 28.08 నుంచి ${sav - 28.083 >= 0 ? '+' : ''}${(sav - 28.083).toFixed(2)}, ${savPts >= 0 ? '+' : ''}${savPts})`,
  });

  // 4) ఆ రాశిలో శుభ / పాప నివాసులు
  const occupants = chart.planets.filter(
    (p) => p.signIndex === primarySign && p.id !== 'Uranus' && p.id !== 'Neptune' && p.id !== 'Pluto'
  );
  const ben = occupants.filter((p) => BENEFICS.includes(p.id as PlanetId9));
  const mal = occupants.filter((p) => !BENEFICS.includes(p.id as PlanetId9));
  const occPts = Math.min(10, ben.length * 5) - Math.min(10, mal.length * 5);
  parts.push({
    nameTe: `${rasiClean(primarySign)}లో నివాసులు`,
    points: occPts,
    noteTe:
      occupants.length === 0
        ? 'ఎవరూ లేరు (0)'
        : `${occupants.map((p) => PLANET_TE[p.id as PlanetId9]).join(', ')} — శుభ ${ben.length} · పాప ${mal.length} (${occPts >= 0 ? '+' : ''}${occPts})`,
  });

  // 5) కారక గ్రహాల కేంద్రాది స్థితి
  const karakaRows = spec.karakas
    .map((id) => chart.planets.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => !!p);
  if (karakaRows.length > 0) {
    const avg =
      karakaRows.reduce((a, p) => a + houseWeight(p.house).pts, 0) / karakaRows.length;
    const pts = Math.round(avg * 0.4); // 0.4 బరువు — కారకుడు సహాయకుడు మాత్రమే
    parts.push({
      nameTe: 'కారక గ్రహాల స్థితి',
      points: pts,
      noteTe: `${karakaRows
        .map((p) => `${PLANET_TE[p.id as PlanetId9]} ${p.house}వ భావం`)
        .join(' · ')} (సగటు × 0.4 = ${pts >= 0 ? '+' : ''}${pts})`,
    });
  }

  const raw = 50 + parts.reduce((a, p) => a + p.points, 0);
  const score = Math.max(5, Math.min(98, raw));

  const band: PillarBand =
    score >= 78 ? 'bala' : score >= 64 ? 'madhyama' : score >= 50 ? 'misra' : score >= 36 ? 'shraddha' : 'durbala';
  const bandTe =
    band === 'bala'
      ? 'బలవత్'
      : band === 'madhyama'
        ? 'మధ్యమ'
        : band === 'misra'
          ? 'మిశ్రమ'
          : band === 'shraddha'
            ? 'శ్రద్ధార్హ'
            : 'దుర్బల';

  const best = parts.slice().sort((a, b) => b.points - a.points)[0];
  const worst = parts.slice().sort((a, b) => a.points - b.points)[0];
  const leadTe =
    `${spec.primaryHouse}వ భావాధిపతి ${PLANET_TE[primaryLord]} ${lordPlanet.house}వ భావంలో, ` +
    `${rasiDative(primarySign)} ${sav} బిందువులు — మొత్తం ${score}/100 (${bandTe}). ` +
    `అత్యంత బలమైన కారణం: ${best.nameTe} (${best.points >= 0 ? '+' : ''}${best.points}); ` +
    `అత్యంత బలహీనమైన కారణం: ${worst.nameTe} (${worst.points >= 0 ? '+' : ''}${worst.points}).`;

  const derivationTe = parts
    .map((p) => `${p.nameTe} ${p.points >= 0 ? '+' : ''}${p.points}`)
    .join(' · ') + ` → మొత్తం ${score}/100 (${bandTe})`;

  // ── అనుకూల దశలు — నిజంగా ఈ స్తంభానికి సంబంధించిన గ్రహాలే ─────────────────
  const lagnaLord = SIGN_LORD[lagnaSign] as PlanetId9;
  const reasons = new Map<string, string>();
  const add = (id: string, reasonTe: string) => {
    if (!reasons.has(id)) reasons.set(id, reasonTe);
  };
  add(primaryLord, `${spec.primaryHouse}వ భావాధిపతి`);
  add(lagnaLord, 'లగ్నాధిపతి');
  for (const k of spec.karakas) add(k, 'కారకుడు');
  for (const p of occupants) add(p.id, `${rasiClean(primarySign)} నివాసి`);
  for (const h of spec.houses) {
    if (h === spec.primaryHouse) continue;
    const l = SIGN_LORD[signOfHouse(h)] as PlanetId9;
    add(l, `${h}వ భావాధిపతి`);
  }

  const ranked = [...reasons.entries()]
    .filter(([id]) => ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'].includes(id))
    .sort((a, b) => strengthOf(b[0]) - strengthOf(a[0]))
    .slice(0, 3);

  const vim = computeVimshottariDeep(chart);
  const nowMs = Date.now();
  // జనన క్షణం — మొదటి మహాదశ జననానికి ముందే మొదలవుతుంది; అలాంటప్పుడు
  // “గత మహాదశ 1983…” అని చెప్పడం తప్పు — “జన్మ నుంచి” అని చెప్పాలి.
  const birthMs = Date.parse(`${chart.input.date}T${chart.input.time}:00Z`) -
    (chart.input.tzOffsetHours ?? 0) * 3600 * 1000;

  /**
   * ఒక గ్రహానికి “ఇప్పుడు/రాబోయే” కాలం:
   *   • ఇప్పుడు ఆ గ్రహ మహాదశ నడుస్తుంటే → మహాదశ
   *   • వర్తమాన మహాదశలో ఆ గ్రహ భుక్తి ఇంకా మిగిలి ఉంటే → భుక్తి (ఇదే ఉపయోగకరం)
   *   • లేకపోతే ఆ గ్రహ మహాదశ; అది గతమైతే “గత దశ” అని స్పష్టంగా చెబుతాము.
   */
  const windowOf = (id: string): { labelTe: string; isPast: boolean } => {
    const md = vim.mahadashas.find((m) => m.lord === id);
    if (!md) return { labelTe: 'కాలం లభించలేదు', isPast: true };
    if (md.startMs < birthMs && md.endMs > birthMs) {
      const over = nowMs >= md.endMs;
      return {
        labelTe: `${over ? 'గత మహాదశ — ' : ''}జన్మ నుంచి ${md.endLocal.slice(0, 10)} వరకు (మూల మహాదశ ${md.startLocal.slice(0, 10)} నుంచి)`,
        isPast: over,
      };
    }
    const fmt = (m: { startLocal: string; endLocal: string }) =>
      `${m.startLocal.slice(0, 10)} → ${m.endLocal.slice(0, 10)}`;
    const runningMd = vim.mahadashas.find((m) => nowMs >= m.startMs && nowMs < m.endMs);
    if (runningMd) {
      const ad = runningMd.children.find(
        (b) => b.lord === id && nowMs >= b.startMs && nowMs < b.endMs
      );
      if (ad) return { labelTe: `వర్తమాన మహాదశలో భుక్తి ${fmt(ad)}`, isPast: false };
      if (runningMd.lord === id) return { labelTe: `వర్తమాన మహాదశ ${fmt(md)}`, isPast: false };
    }
    return {
      labelTe: `${nowMs >= md.endMs ? 'గత' : 'రాబోయే'} మహాదశ ${fmt(md)}`,
      isPast: nowMs >= md.endMs,
    };
  };

  // రాబోయే/నడుస్తున్న కాలాలు ముందు, గతించినవి చివర — కానీ ఏదీ దాచబడదు.
  const withWindows = ranked.map(([id, reasonTe]) => ({ id, reasonTe, w: windowOf(id) }));
  withWindows.sort((a, b) => Number(a.w.isPast) - Number(b.w.isPast));

  const listTe = withWindows
    .map(
      ({ id, reasonTe, w }) =>
        `${PLANET_TE[id as PlanetId9]} (${reasonTe}; ${w.labelTe})`
    )
    .join(', ');

  const favorableTe =
    ranked.length === 0
      ? 'ఈ స్తంభానికి కారక గ్రహం లభించలేదు.'
      : `అనుకూల దశలు (షడ్బల క్రమంలో): ${listTe}. ` +
        `ఇవి ఈ స్తంభంతో నేరుగా సంబంధం ఉన్న గ్రహాలు — కుండలి స్థితి నుంచే తీసుకోబడ్డాయి.`;

  return {
    score,
    band,
    bandTe,
    leadTe,
    parts,
    derivationTe,
    favorableTe,
    favorableIds: ranked.map(([id]) => id),
  };
}

/** స్తంభ సంఖ్య → నిర్దిష్ట భావాలు/కారకులు (teluguJathakam తో ఒకే క్రమం) */
export const PILLAR_SPECS: Record<string, PillarSpec> = {
  'education-wisdom': { primaryHouse: 5, houses: [2, 4, 5, 9], karakas: ['Mercury', 'Jupiter'] },
  'career-profession': { primaryHouse: 10, houses: [10, 6, 7, 11], karakas: ['Saturn', 'Sun'] },
  'wealth-property': { primaryHouse: 2, houses: [2, 4, 11], karakas: ['Jupiter', 'Venus'] },
  'marriage-family': { primaryHouse: 7, houses: [7, 2, 4], karakas: ['Venus', 'Jupiter'] },
  'health-longevity': { primaryHouse: 1, houses: [1, 6, 8], karakas: ['Sun', 'Saturn'] },
  'foreign-spirituality': { primaryHouse: 9, houses: [9, 12, 5], karakas: ['Jupiter', 'Rahu'] },
};

// ─────────────────────────────────────────────────────────────────────────────
//  స్తంభ వివరణ — పూర్తిగా కుండలి నుంచి (స్థిర వాక్యాలు, పరిశ్రమల జాబితాలు లేవు)
// ─────────────────────────────────────────────────────────────────────────────

const BENEFIC_SET = ['Jupiter', 'Venus', 'Mercury', 'Moon'];

/**
 * గ్రహ కారక రంగాలు (శాస్త్రీయ కారకత్వం) — పరిశ్రమల “స్థిర జాబితా” కాదు;
 * ఏ గ్రహం ఏ భావానికి అధిపతో ఆ గ్రహపు రంగాలే ఫలం అవుతాయి.
 */
const PLANET_DOMAINS_TE: Record<string, string> = {
  Sun: 'ప్రభుత్వ/అధికార వ్యవస్థ, నిర్వహణ, ఆరోగ్య రంగం',
  Moon: 'ప్రజా సంబంధాలు, సేవా రంగం, ద్రవ్య/ద్రవ పదార్థాలు, ప్రయాణం',
  Mars: 'సాంకేతికం, ఇంజినీరింగ్, రక్షణ/పోలీస్, క్రీడలు, శస్త్ర చికిత్స',
  Mercury: 'గణితం-లెక్కలు, వాణిజ్యం, రచన-విశ్లేషణ, సాఫ్ట్‌వేర్/డేటా',
  Jupiter: 'ఉపదేశం-అధ్యాపకత్వం, న్యాయం, ఆర్థిక సలహా, ఆధ్యాత్మికం',
  Venus: 'కళలు-సౌందర్యం, సంగీతం, డిజైన్, ఆర్థికం, సంబంధాల నిర్వహణ',
  Saturn: 'కార్మిక-నిర్మాణ రంగం, భూమి-గనులు, క్రమశిక్షణ, దీర్ఘకాల ప్రాజెక్టులు',
  Rahu: 'సాంకేతికం, విదేశీ సంబంధాలు, ఇంటర్నెట్/పరిశోధన',
  Ketu: 'పరిశోధన, ఆధ్యాత్మికం, ఏకాంత అధ్యయనం',
};
const MALEFIC_SET = ['Sun', 'Mars', 'Saturn', 'Rahu', 'Ketu'];

/** రాశి దృష్టి (పూర్ణ రాశి): సూర్యుడు/చంద్రుడు/బుధుడు/శుక్రుడు 7వది;
 *  కుజుడు 4, 7, 8; గురువు 5, 7, 9; శని 3, 7, 10 — పరాశరీ సూత్రం. */
export function rasiAspectsOf(planetId: string, fromHouse: number): number[] {
  const offsets =
    planetId === 'Mars'
      ? [4, 7, 8]
      : planetId === 'Jupiter'
        ? [5, 7, 9]
        : planetId === 'Saturn'
          ? [3, 7, 10]
          : [7];
  return offsets.map((o) => ((fromHouse - 1 + o - 1) % 12) + 1);
}

/** ఒక భావాన్ని ఎవరు చూస్తున్నారు (రాశి దృష్టి) */
export function aspectingPlanets(chart: CompleteChartResult, house: number): string[] {
  return chart.planets
    .filter((p) => ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'].includes(p.id))
    .filter((p) => p.house !== house && rasiAspectsOf(p.id, p.house).includes(house))
    .map((p) => p.id);
}

export interface PillarNarrative {
  paragraphsTe: string[];
  /** ఈ అంశంపై కుండలి ఏమి చెప్పదు (నిజాయితీ వాక్యం) */
  silenceTe: string;
}

/**
 * స్తంభానికి రెండు పేరాలు — ప్రతి వాక్యమూ ఒక స్థానం/బలం/వర్గం నుంచి.
 */
export function buildPillarNarrative(
  chart: CompleteChartResult,
  pillarId: string
): PillarNarrative {
  const spec = PILLAR_SPECS[pillarId];
  if (!spec) return { paragraphsTe: [], silenceTe: '' };
  const lagnaSign = chart.ascendant.signIndex;
  const signOfHouse = (h: number) => (lagnaSign + h - 1) % 12;
  const lordOf = (h: number) => SIGN_LORD[signOfHouse(h)] as PlanetId9;
  const planetOf = (id: string) => chart.planets.find((p) => p.id === id)!;
  const shadbala = computeShadbalaDeep(chart);
  const rankOf = (id: string) => {
    const sorted = [...shadbala.rows].sort((a, b) => b.totalVirupas - a.totalVirupas);
    return sorted.findIndex((r) => r.id === id) + 1;
  };
  const rasi = (h: number) => rasiClean(signOfHouse(h));
  const inHouse = (h: number) =>
    chart.planets
      .filter((p) => p.house === h && ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'].includes(p.id))
      .map((p) => p.id);

  const occupLine = (h: number) => {
    const occ = inHouse(h);
    const asp = aspectingPlanets(chart, h);
    const parts: string[] = [];
    parts.push(occ.length === 0 ? `${h}వ భావం ఖాళీ` : `${h}వ భావంలో ${occ.map((p) => PLANET_TE[p as PlanetId9]).join(', ')}`);
    if (asp.length > 0) parts.push(`దానిని ${asp.map((p) => PLANET_TE[p as PlanetId9]).join(', ')} చూస్తున్నారు`);
    return parts.join(', ');
  };

  const savOf = (h: number) => chart.ashtakavarga.sarvashtakavarga[signOfHouse(h)];
  /** మొదటి పేరాలో స్థానం ఇప్పటికే ఉంది — ఇక్కడ బల క్రమం మాత్రమే (పునరుక్తి తప్పించి) */
  const lordRankTe = (h: number) => `${PLANET_TE[lordOf(h)]} షడ్బల క్రమంలో ${rankOf(lordOf(h))}/7`;
  const vargaLine = (key: 'd24Sign' | 'd10Sign' | 'd9Sign' | 'd20Sign', labelTe: string) => {
    const asc = (chart.ascendant as unknown as Record<string, number | undefined>)[key];
    return typeof asc !== 'number' ? '' : `${labelTe} లగ్నం ${rasiClean(asc)}`;
  };

  const paragraphsTe: string[] = [];
  let silenceTe = '';

  switch (pillarId) {
    case 'education-wisdom': {
      paragraphsTe.push(
        `${occupLine(5)}. ${vargaLine('d24Sign', 'విద్యా చతుర్వింశాంశ (D24)')} — ` +
          `${lordRankTe(5)}; బుధుడు ${rankOf('Mercury')}/7, గురువు ${rankOf('Jupiter')}/7. ` +
          `2వ భావానికి ${savOf(2)} బిందువులు, 4వ భావానికి ${savOf(4)} బిందువులు.`
      );
      paragraphsTe.push(
        `చదువు దిశ 5వ భావాధిపతి ${PLANET_TE[lordOf(5)]} కారకత్వం నుంచి: ${PLANET_DOMAINS_TE[lordOf(5)] ?? '—'}. ` +
          `అది ${planetOf(lordOf(5)).house}వ భావంలో ఉండటం వల్ల ${planetOf(lordOf(5)).house}వ భావ విషయాలతో (ఆ భావం పాలించే జీవిత రంగం) కలిసి ఫలిస్తుంది. ` +
          `${inHouse(5).length === 0 ? '5వ భావంలో గ్రహాలు లేకపోవడం వల్ల విద్యా ఫలం పూర్తిగా అధిపతి స్థితి మీదే ఆధారపడి ఉంటుంది.' : ''}`
      );
      silenceTe = 'కుండలిలో లేనివి: ఏ పరీక్ష/సంస్థ, ఏ సబ్జెక్టు ఖచ్చితంగా అనుకూలం అనేది — అది కుండలి చెప్పదు.';
      break;
    }
    case 'career-profession': {
      paragraphsTe.push(
        `${occupLine(10)}. ${vargaLine('d10Sign', 'దశాంశ (D10)')}. ${lordRankTe(10)}. ` +
          `10వ రాశికి ${savOf(10)} బిందువులు, 6వ రాశికి ${savOf(6)} బిందువులు.`
      );
      paragraphsTe.push(
        `వృత్తి స్వభావం 10వ భావాధిపతి ${PLANET_TE[lordOf(10)]} కారకత్వం నుంచే: ${PLANET_DOMAINS_TE[lordOf(10)] ?? '—'}. ` +
          `ఆ గ్రహం ${planetOf(lordOf(10)).house}వ భావంలో ` +
          `${rasiClean(planetOf(lordOf(10)).signIndex)} రాశిలో ఉన్నాడు; ${PLANET_TE[lordOf(10)]} కారకత్వమే (ఆ గ్రహం పాలించే భావాలు: ` +
          `${housesRuledBy(lagnaSign, lordOf(10)).map((h) => `${h}వ`).join(', ') || '—'}) వృత్తి మార్గాన్ని నిర్దేశిస్తుంది. ` +
          `శని ${rankOf('Saturn')}/7, సూర్యుడు ${rankOf('Sun')}/7 — ఇద్దరూ వృత్తి కారకులు.`
      );
      silenceTe = 'కుండలిలో లేనివి: ఖచ్చిత ఉద్యోగ నామం, కంపెనీ, శాఖ — స్థానం + దశలు మాత్రమే చెబుతాయి.';
      break;
    }
    case 'wealth-property': {
      paragraphsTe.push(
        `${lordRankTe(2)}; ${lordRankTe(11)}. 2వ రాశికి ${savOf(2)} బిందువులు, 11వ రాశికి ${savOf(11)} బిందువులు. ` +
          `${occupLine(2)}; ${occupLine(4)}.`
      );
      paragraphsTe.push(
        `ధనం ఎక్కడ నుంచి వస్తుందో 2వ మరియు 11వ భావాధిపతుల స్థానాలే చెబుతాయి: ` +
          `${PLANET_TE[lordOf(2)]} ${planetOf(lordOf(2)).house}వ భావంలో, ${PLANET_TE[lordOf(11)]} ${planetOf(lordOf(11)).house}వ భావంలో. ` +
          `ఆస్తి (4వ) అధిపతి ${PLANET_TE[lordOf(4)]} ${planetOf(lordOf(4)).house}వ భావంలో ఉన్నందున భూమి/గృహ యోగం ఆ గ్రహ దశల్లో చూడాలి.`
      );
      silenceTe = 'కుండలిలో లేనివి: ఖచ్చిత మొత్తాలు, ఏ సంవత్సరంలో ఎంత ఆదాయం — సంఖ్యలు కుండలి చెప్పదు.';
      break;
    }
    case 'marriage-family': {
      const dk = planetOf('Venus');
      paragraphsTe.push(
        `${occupLine(7)}. ${vargaLine('d9Sign', 'నవాంశ (D9)')}. ${lordRankTe(7)}. ` +
          `శుక్రుడు ${rankOf('Venus')}/7 స్థానంలో, ${dk.house}వ భావంలో.`
      );
      paragraphsTe.push(
        `జీవిత భాగస్వామి స్వభావం 7వ భావంలోని గ్రహాల నుంచే: ` +
          `${inHouse(7).length === 0 ? '7వ భావం ఖాళీ — స్వభావం 7వ అధిపతి మరియు శుక్రుని స్థితి నుంచి మాత్రమే తెలుస్తుంది' : `7వ భావంలో ${inHouse(7).map((p) => PLANET_TE[p as PlanetId9]).join(', ')} — ${inHouse(7).filter((p) => BENEFIC_SET.includes(p)).length > 0 ? 'శుభ ప్రభావం' : 'పాప ప్రభావం, సర్దుబాటు అవసరం'}`}. ` +
          `7వ భావాధిపతి ${PLANET_TE[lordOf(7)]} ${planetOf(lordOf(7)).house}వ భావంలో ఉన్నందున దాంపత్య ఫలం ఆ స్థానాన్ని బట్టి ఉంటుంది.`
      );
      silenceTe = 'కుండలిలో లేనివి: భాగస్వామి పేరు, ఖచ్చిత వివాహ తేదీ, వృత్తి — కుండలి ఎవరినీ పేరుతో చెప్పదు.';
      break;
    }
    case 'health-longevity': {
      const lagnaLord = lordOf(1);
      paragraphsTe.push(
        `${occupLine(1)}. ${lordRankTe(1)}. లగ్న రాశికి ${savOf(1)} బిందువులు, 6వ రాశికి ${savOf(6)}, 8వ రాశికి ${savOf(8)}. ` +
          `6వ అధిపతి ${PLANET_TE[lordOf(6)]} ${planetOf(lordOf(6)).house}వ భావంలో, 8వ అధిపతి ${PLANET_TE[lordOf(8)]} ${planetOf(lordOf(8)).house}వ భావంలో.`
      );
      const afflicting = inHouse(1).filter((p) => MALEFIC_SET.includes(p));
      paragraphsTe.push(
        `శరీర ప్రకృతి లగ్నాధిపతి ${PLANET_TE[lagnaLord]} మీద ఆధారపడి ఉంటుంది (షడ్బలంలో ${rankOf(lagnaLord)}/7). ` +
          `${afflicting.length > 0 ? `లగ్నంలో ${afflicting.map((p) => PLANET_TE[p as PlanetId9]).join(', ')} ఉన్నందున ఆ గ్రహాల కారక రంగాలలో (ఆయా గ్రహాలు పాలించే భావాలు) మరియు శరీరంలో ఆయా భాగాలలో శ్రద్ధ అవసరం.` : 'లగ్నంలో పాప గ్రహాలు లేవు — ఇది ఆరోగ్యానికి అనుకూల సంకేతం.'}`
      );
      silenceTe = 'కుండలిలో లేనివి: వ్యాధి నిర్ధారణ, మందుల పేర్లు, ఆయుర్దాయ సంవత్సరాలు — ఇవి జ్యోతిష్యం చెప్పగలిగినవి కావు.';
      break;
    }
    case 'foreign-spirituality': {
      paragraphsTe.push(
        `${occupLine(9)}. ${vargaLine('d20Sign', 'వింశాంశ (D20)')}. ${lordRankTe(9)}. ` +
          `12వ అధిపతి ${PLANET_TE[lordOf(12)]} ${planetOf(lordOf(12)).house}వ భావంలో, రాహువు ${planetOf('Rahu').house}వ భావంలో (${rasiClean(planetOf('Rahu').signIndex)}).`
      );
      const rahuHouse = planetOf('Rahu').house;
      const foreignSignals: string[] = [];
      if ([3, 9, 12].includes(rahuHouse)) foreignSignals.push(`రాహువు ${rahuHouse}వ భావంలో — దూర ప్రయాణ/విదేశ యోగ సంకేతం`);
      if ([9, 12].includes(planetOf(lordOf(12)).house)) foreignSignals.push(`12వ అధిపతి ${planetOf(lordOf(12)).house}వ భావంలో — విదేశ/ఏకాంత సంకేతం`);
      if ([9, 12].includes(planetOf(lordOf(9)).house)) foreignSignals.push(`9వ అధిపతి ${planetOf(lordOf(9)).house}వ భావంలో — ధర్మ/దూర యాత్ర సంకేతం`);
      paragraphsTe.push(
        `${foreignSignals.length > 0 ? foreignSignals.join('; ') + '.' : 'విదేశ యోగానికి బలమైన సంకేతం లేదు — 3, 9, 12 భావాలలో రాహువు/అధిపతులు లేరు.'} ` +
          `ఆధ్యాత్మిక దిశ 9వ భావాధిపతి ${PLANET_TE[lordOf(9)]} మరియు గురువు (${rankOf('Jupiter')}/7) స్థితిని బట్టి ఉంటుంది.`
      );
      silenceTe = 'కుండలిలో లేనివి: ఏ దేశం, ఏ తీర్థం, ఎప్పుడు — ఖచ్చిత ప్రదేశాలు కుండలి చెప్పదు.';
      break;
    }
    default:
      break;
  }

  return { paragraphsTe: paragraphsTe.filter((p) => p.trim().length > 0), silenceTe };
}
