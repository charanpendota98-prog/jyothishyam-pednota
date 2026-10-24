/**
 * గ్రహ సహాయక సూచిక — planet × life-area favour matrix.
 *
 * సంపూర్ణ జాతక పత్రికలో (ఉదా. 116 పుటల పత్రికలో 29వ పుట) "దశాంతర్దశలకు
 * వివిధ అంశాలలో గ్రహాల సహాయక సూచికలు" అనే పట్టిక ఉంటుంది: 9 గ్రహాలు ×
 * 7 జీవితాంశాలు, ప్రతి గడి −100 నుండి +100 మధ్య స్కోరు. ఆ పత్రిక స్పష్టంగా
 * చెబుతుంది — "ఇవి ఫలితం జరిగే శాతాలు కావు, సాంప్రదాయ షడ్బలం కాదు".
 *
 * ఇక్కడ అదే పట్టిక **పారదర్శక సూత్రంతో** లెక్కించబడుతుంది. ప్రతి గడికి
 * మూడు కారకాలు:
 *
 *   1. భావ సంబంధం (45%)  — గ్రహం ఉన్న భావం ఆ అంశానికి ప్రధాన/ఉప/సాధారణ
 *      స్థానమా; 6/8/12 ప్రభావం ఉంటే ఋణాత్మకం.
 *   2. సహజ కారకత్వం (35%) — ఆ గ్రహం సహజంగా ఆ అంశానికి కారకుడా
 *      (బుధుడు–తెలివి, శుక్రుడు–ప్రేమ, శని–వృత్తి శ్రమ …).
 *   3. స్థితి బలం (20%)   — ఉచ్చ/మూలత్రికోణ/స్వక్షేత్రం/మిత్ర/సమ/శత్రు/నీచ.
 *
 * మొత్తం −100…+100 కి కుదించి, చివరి వరుసలో 9 గ్రహాల సగటు ఇవ్వబడుతుంది —
 * పత్రికలో ఉన్నట్టుగానే. ఇది ఫలిత సంభావ్యత కాదు; ఏ అంశంలో ఎంత కృషి,
 * జాగ్రత్త అవసరమో తెలిపే సూచిక మాత్రమే.
 */

import type { CompleteChartResult } from './ephemeris.ts';

export type AreaId =
  | 'intellect'
  | 'capability'
  | 'loveFamily'
  | 'health'
  | 'society'
  | 'career'
  | 'finance';

export interface AreaMeta {
  id: AreaId;
  labelTe: string;
  /** ప్రధాన భావాలు */
  primaryHouses: number[];
  secondaryHouses: number[];
  tertiaryHouses: number[];
  karakaTe: string;
}

export const AREAS: AreaMeta[] = [
  {
    id: 'intellect',
    labelTe: 'తెలివి',
    primaryHouses: [5],
    secondaryHouses: [1, 9],
    tertiaryHouses: [3, 11],
    karakaTe: 'బుధుడు, గురువు',
  },
  {
    id: 'capability',
    labelTe: 'సమర్థత',
    primaryHouses: [3, 10],
    secondaryHouses: [1],
    tertiaryHouses: [6, 11],
    karakaTe: 'కుజుడు, సూర్యుడు',
  },
  {
    id: 'loveFamily',
    labelTe: 'ప్రేమ / కుటుంబం',
    primaryHouses: [7, 4],
    secondaryHouses: [2, 5],
    tertiaryHouses: [11, 12],
    karakaTe: 'శుక్రుడు, చంద్రుడు',
  },
  {
    id: 'health',
    labelTe: 'ఆరోగ్యం',
    primaryHouses: [1],
    secondaryHouses: [6, 8],
    tertiaryHouses: [10, 3],
    karakaTe: 'సూర్యుడు, చంద్రుడు',
  },
  {
    id: 'society',
    labelTe: 'సమాజం',
    primaryHouses: [11, 10],
    secondaryHouses: [7, 3],
    tertiaryHouses: [9, 5],
    karakaTe: 'గురువు, బుధుడు',
  },
  {
    id: 'career',
    labelTe: 'వృత్తి / వ్యాపారం',
    primaryHouses: [10],
    secondaryHouses: [6, 7, 2],
    tertiaryHouses: [3, 11],
    karakaTe: 'శని, సూర్యుడు, బుధుడు',
  },
  {
    id: 'finance',
    labelTe: 'ఆర్థిక స్థితి',
    primaryHouses: [2, 11],
    secondaryHouses: [5, 9],
    tertiaryHouses: [4, 7],
    karakaTe: 'గురువు, శుక్రుడు',
  },
];

/** సహజ కారకత్వం — ప్రతి గ్రహం ప్రతి అంశానికి (−1 … +1) */
const KARAKATVA: Record<string, Record<AreaId, number>> = {
  Sun: { intellect: 0.45, capability: 0.7, loveFamily: -0.1, health: 0.8, society: 0.5, career: 0.6, finance: 0.2 },
  Moon: { intellect: 0.4, capability: 0.1, loveFamily: 0.6, health: 0.5, society: 0.3, career: 0.0, finance: 0.25 },
  Mars: { intellect: 0.1, capability: 0.9, loveFamily: 0.1, health: 0.4, society: 0.2, career: 0.5, finance: 0.2 },
  Mercury: { intellect: 0.95, capability: 0.5, loveFamily: 0.1, health: 0.1, society: 0.6, career: 0.6, finance: 0.45 },
  Jupiter: { intellect: 0.7, capability: 0.4, loveFamily: 0.7, health: 0.35, society: 0.8, career: 0.5, finance: 0.75 },
  Venus: { intellect: 0.35, capability: 0.2, loveFamily: 0.95, health: 0.3, society: 0.65, career: 0.3, finance: 0.65 },
  Saturn: { intellect: 0.2, capability: 0.5, loveFamily: -0.2, health: -0.1, society: 0.1, career: 0.85, finance: 0.3 },
  Rahu: { intellect: 0.5, capability: 0.55, loveFamily: -0.1, health: -0.15, society: 0.45, career: 0.7, finance: 0.4 },
  Ketu: { intellect: 0.4, capability: 0.45, loveFamily: 0.0, health: -0.05, society: 0.0, career: 0.35, finance: 0.15 },
};

const DIGNITY_SCORE: Record<string, number> = {
  Exalted: 1,
  Moolatrikona: 0.9,
  'Own Sign': 0.8,
  Friendly: 0.3,
  Neutral: 0,
  Enemy: -0.5,
  Debilitated: -1,
};

const DUSTHANA = [6, 8, 12];

export interface PlanetAreaRow {
  id: string;
  nameTe: string;
  house: number;
  dignityTe: string;
  scores: Record<AreaId, number>;
  bestAreaTe: string;
  weakAreaTe: string;
  noteTe: string;
}

export interface GrahaSahayakaReport {
  rows: PlanetAreaRow[];
  averages: Record<AreaId, number>;
  areaRankingTe: string;
  planetRankingTe: string;
  synthesisTe: string;
  methodNoteTe: string;
  scaleNoteTe: string;
}

const PLANET_TE: Record<string, string> = {
  Sun: 'సూర్యుడు', Moon: 'చంద్రుడు', Mars: 'కుజుడు', Mercury: 'బుధుడు',
  Jupiter: 'గురుడు', Venus: 'శుక్రుడు', Saturn: 'శని', Rahu: 'రాహువు', Ketu: 'కేతువు',
};

const DIGNITY_TE: Record<string, string> = {
  Exalted: 'ఉచ్చ',
  Moolatrikona: 'మూలత్రికోణ',
  'Own Sign': 'స్వక్షేత్ర',
  Friendly: 'మిత్ర',
  Neutral: 'సమ',
  Enemy: 'శత్రు',
  Debilitated: 'నీచ',
};

const clamp = (v: number, lo = -100, hi = 100) => Math.max(lo, Math.min(hi, Math.round(v)));

function houseWeight(house: number, area: AreaMeta): number {
  if (area.primaryHouses.includes(house)) return 1;
  if (area.secondaryHouses.includes(house)) return 0.65;
  if (area.tertiaryHouses.includes(house)) return 0.35;
  if (DUSTHANA.includes(house)) return -0.5;
  return 0;
}

export function computeGrahaSahayaka(chart: CompleteChartResult): GrahaSahayakaReport {
  const ids = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

  const rows: PlanetAreaRow[] = ids.map((id) => {
    const p = chart.planets.find((x) => x.id === id);
    const house = p?.house ?? 1;
    const dignityKey = p?.dignity ?? 'Neutral';
    const dignityVal = DIGNITY_SCORE[dignityKey] ?? 0;
    const retroPenalty = p?.isRetrograde && id !== 'Rahu' && id !== 'Ketu' ? -0.15 : 0;

    const scores = {} as Record<AreaId, number>;
    for (const area of AREAS) {
      const hw = houseWeight(house, area);
      const kw = KARAKATVA[id]?.[area.id] ?? 0;
      scores[area.id] = clamp(45 * hw + 35 * kw + 20 * (dignityVal + retroPenalty));
    }

    const sortedAreas = [...AREAS].sort((a, b) => scores[b.id] - scores[a.id]);
    const best = sortedAreas[0];
    const weak = sortedAreas[sortedAreas.length - 1];

    return {
      id,
      nameTe: PLANET_TE[id] ?? id,
      house,
      dignityTe: DIGNITY_TE[dignityKey] ?? 'సమ',
      scores,
      bestAreaTe: best.labelTe,
      weakAreaTe: weak.labelTe,
      noteTe: `${PLANET_TE[id]} ${house}వ భావంలో (${DIGNITY_TE[dignityKey] ?? 'సమ'}) — ${best.labelTe} రంగంలో అత్యధిక సహకారం (${scores[best.id]}), ${weak.labelTe} రంగంలో అత్యల్పం (${scores[weak.id]}).`,
    };
  });

  const averages = {} as Record<AreaId, number>;
  for (const area of AREAS) {
    averages[area.id] = Math.round(rows.reduce((s, r) => s + r.scores[area.id], 0) / rows.length);
  }

  const areaSorted = [...AREAS].sort((a, b) => averages[b.id] - averages[a.id]);
  const planetSorted = [...rows].sort(
    (a, b) =>
      Object.values(b.scores).reduce((s, v) => s + v, 0) / 7 -
      Object.values(a.scores).reduce((s, v) => s + v, 0) / 7,
  );

  const areaRankingTe = `అత్యంత అనుకూల అంశాలు — ${areaSorted
    .slice(0, 3)
    .map((a) => `${a.labelTe} (${averages[a.id]})`)
    .join(', ')}; అత్యంత శ్రద్ధ అవసరమైనవి — ${areaSorted
    .slice(-2)
    .map((a) => `${a.labelTe} (${averages[a.id]})`)
    .join(', ')}.`;

  const planetRankingTe = `సగటు సహకారం ప్రకారం — ${planetSorted
    .map((r) => `${r.nameTe} (${Math.round(Object.values(r.scores).reduce((s, v) => s + v, 0) / 7)})`)
    .join(' > ')}.`;

  const top = areaSorted[0];
  const bottom = areaSorted[areaSorted.length - 1];
  const synthesisTe = `మీ జాతకంలో గ్రహాలు ${top.labelTe} రంగానికి అత్యధిక సహకారం (సగటు ${averages[top.id]}) ఇస్తున్నాయి — ఈ దిశలో ప్రయత్నం సహజంగా ఫలిస్తుంది. ${bottom.labelTe} రంగంలో సగటు ${averages[bottom.id]} మాత్రమే కాబట్టి అక్కడ ఎక్కువ కృషి, నిపుణుల సలహా, క్రమశిక్షణ అవసరం. దశాంతర్దశలో ఆ గ్రహం నడిచినప్పుడు దాని బలమైన అంశాలు ముందుకు వస్తాయి; బలహీన అంశాలలో అప్రమత్తత అవసరం.`;

  return {
    rows,
    averages,
    areaRankingTe,
    planetRankingTe,
    synthesisTe,
    methodNoteTe:
      'సూత్రం: స్కోరు = 45% భావ సంబంధం + 35% సహజ కారకత్వం + 20% స్థితి బలం (ఉచ్చ/స్వ/నీచ); వక్ర గ్రహానికి చిన్న ఋణ సవరణ. ఇది సాంప్రదాయ షడ్బలం కాదు, ఫలిత శాతం కాదు — ఏ అంశంలో ఎంత కృషి అవసరమో తెలిపే సూచిక.',
    scaleNoteTe:
      'పరిధి −100 … +100. సున్నా కంటే తక్కువ = ఆ అంశంలో ఆ గ్రహం ప్రతికూలంగా పనిచేసే అవకాశం; ఎక్కువ ధన = మరింత అనుకూల సహకారం. ఏ గ్రహం ఏ దశలో నడుస్తుందో దానిని బట్టి ఈ సూచికల ప్రభావం మారుతుంది.',
  };
}
