/**
 * ashtakavargaTables.ts — అష్టకవర్గ బిందు పట్టికలు (ఒకే నిజం)
 * ============================================================
 * బృహత్ పరాశర హోరా శాస్త్రం, అష్టకవర్గ అధ్యాయం — ప్రతి గ్రహానికి
 * ఎనిమిది సాక్షుల (సూర్య…శని + లగ్నం) నుంచి శుభ స్థానాలు.
 *
 * ఈ ఫైలు ఒకే చోట పట్టికలను ఉంచుతుంది; `ephemeris.ts` (భిన్న/సముదాయ
 * అష్టకవర్గం) మరియు `ashtakavargaKakshyaEngine.ts` (కక్ష్య) — రెండూ ఇక్కడి
 * నుంచే తీసుకుంటాయి. పట్టికలు రెండు చోట్ల ఉంటే ఒకటి మారి మరొకటి మిగిలే
 * ప్రమాదం ఉండదు.
 */

/** బిందు రేఖకర్తల క్రమం — ప్రతి గ్రహపు అష్టకవర్గంలోని ఎనిమిది మంది సాక్షులు. */
export const CONTRIBUTORS = [
  'Sun',
  'Moon',
  'Mars',
  'Mercury',
  'Jupiter',
  'Venus',
  'Saturn',
  'Lagna',
] as const;

export type Contributor = (typeof CONTRIBUTORS)[number];

export const CONTRIBUTOR_TE: Record<Contributor, string> = {
  Sun: 'సూర్యుడు',
  Moon: 'చంద్రుడు',
  Mars: 'కుజుడు',
  Mercury: 'బుధుడు',
  Jupiter: 'గురువు',
  Venus: 'శుక్రుడు',
  Saturn: 'శని',
  Lagna: 'లగ్నం',
};

/**
 * కక్ష్యా క్రమం — రాశి 30° ను 3°45′ చొప్పున ఎనిమిది కక్ష్యలుగా విభజిస్తారు.
 * 0° నుంచి ఆరోహణ క్రమంలో: శని, గురు, కుజ, రవి, శుక్ర, బుధ, చంద్ర, లగ్నం.
 * (బరాహా / పి.వి.ఆర్. నారసింహరావు పద్ధతి; సూర్య సిద్ధాంత కక్ష్యా విభాగం.)
 */
export const KAKSHYA_ORDER: Contributor[] = [
  'Saturn',
  'Jupiter',
  'Mars',
  'Sun',
  'Venus',
  'Mercury',
  'Moon',
  'Lagna',
];

/** ఒక కక్ష్య వెడల్పు — 30° / 8 = 3.75°. */
export const KAKSHYA_SPAN = 3.75;

/**
 * ప్రతి గ్రహం (బిందు గ్రహం) కి, ప్రతి సాక్షికి, ఆ సాక్షి ఇచ్చే శుభ స్థానాలు
 * (1 = ఆ సాక్షి స్థానం నుంచి లెక్కించిన 1వ రాశి).
 */
export const ASHTAKAVARGA_OFFSETS: Record<string, number[][]> = {
  Sun: [
    [1, 2, 4, 7, 8, 9, 10, 11],
    [3, 6, 10, 11],
    [1, 2, 4, 7, 8, 9, 10, 11],
    [3, 5, 6, 9, 10, 11, 12],
    [5, 6, 9, 11],
    [6, 7, 12],
    [1, 2, 4, 7, 8, 9, 10, 11],
    [3, 4, 6, 10, 11, 12],
  ],
  Moon: [
    [3, 6, 7, 8, 10, 11],
    [1, 3, 6, 7, 10, 11],
    [2, 3, 5, 6, 9, 10, 11],
    [1, 3, 4, 5, 7, 8, 10, 11],
    [1, 4, 7, 8, 10, 11, 12],
    [3, 4, 5, 7, 9, 10, 11],
    [3, 5, 6, 11],
    [3, 6, 10, 11],
  ],
  Mars: [
    [3, 5, 6, 10, 11],
    [3, 6, 11],
    [1, 2, 4, 7, 8, 10, 11],
    [3, 5, 6, 11],
    [6, 10, 11, 12],
    [6, 8, 11, 12],
    [1, 4, 7, 8, 9, 10, 11],
    [1, 3, 6, 10, 11],
  ],
  Mercury: [
    [5, 6, 9, 11, 12],
    [2, 4, 6, 8, 10, 11],
    [1, 2, 4, 7, 8, 9, 10, 11],
    [1, 3, 5, 6, 9, 10, 11, 12],
    [6, 8, 11, 12],
    [1, 2, 3, 4, 5, 8, 9, 11],
    [1, 2, 4, 7, 8, 9, 10, 11],
    [1, 2, 4, 6, 8, 10, 11],
  ],
  Jupiter: [
    [1, 2, 3, 4, 7, 8, 9, 10, 11],
    [2, 5, 7, 9, 11],
    [1, 2, 4, 7, 8, 10, 11],
    [1, 2, 4, 5, 6, 9, 10, 11],
    [1, 2, 3, 4, 7, 8, 10, 11],
    [2, 5, 6, 9, 10, 11],
    [3, 5, 6, 12],
    [1, 2, 4, 5, 6, 7, 9, 10, 11],
  ],
  Venus: [
    [8, 11, 12],
    [1, 2, 3, 4, 5, 8, 9, 11, 12],
    [3, 5, 6, 9, 11, 12],
    [3, 5, 6, 9, 11],
    [5, 8, 9, 10, 11],
    [1, 2, 3, 4, 5, 8, 9, 10, 11],
    [3, 4, 5, 8, 9, 10, 11],
    [1, 2, 3, 4, 5, 8, 9, 11],
  ],
  Saturn: [
    [1, 2, 4, 7, 8, 10, 11],
    [3, 6, 11],
    [3, 5, 6, 10, 11, 12],
    [6, 8, 9, 10, 11, 12],
    [5, 6, 11, 12],
    [6, 11, 12],
    [3, 5, 6, 11],
    [1, 3, 4, 6, 10, 11],
  ],
};

/** సాక్షి స్థానాలు (రాశి సూచికలు): [సూర్యుడు, చంద్రుడు, కుజుడు, బుధుడు, గురువు, శుక్రుడు, శని, లగ్నం] */
export function contributorSignIndices(
  planetSigns: Record<string, number>,
  lagnaSign: number
): number[] {
  return CONTRIBUTORS.map((c) => (c === 'Lagna' ? lagnaSign : planetSigns[c] ?? 0));
}

/**
 * బిందు గ్రహం వారీగా, సాక్షి వారీగా — ఏ రాశికి బిందువు ఇచ్చారు.
 * ఫలితం: bindus[planet][contributorIndex][signIndex] = true/false
 */
export function buildContributorBindus(
  planetSigns: Record<string, number>,
  lagnaSign: number
): Record<string, boolean[][]> {
  const refSigns = contributorSignIndices(planetSigns, lagnaSign);
  const out: Record<string, boolean[][]> = {};
  for (const planet of Object.keys(ASHTAKAVARGA_OFFSETS)) {
    const rules = ASHTAKAVARGA_OFFSETS[planet];
    const grid: boolean[][] = CONTRIBUTORS.map(() => new Array(12).fill(false));
    for (let c = 0; c < CONTRIBUTORS.length; c++) {
      for (const offset of rules[c]) {
        grid[c][(refSigns[c] + offset - 1) % 12] = true;
      }
    }
    out[planet] = grid;
  }
  return out;
}
