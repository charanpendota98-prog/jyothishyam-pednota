/**
 * షోడశ వర్గ (16 Varga) + వింశోపక బలం (Vimshopaka Bala) engine
 * ------------------------------------------------------------------
 * Classical rules per Brihat Parashara Hora Shastra (BPHS) Ch. 6 & 7,
 * cross-checked pin-to-pin against a 116-page Telugu reference jathakam
 * (onlinejyotish, 2026-10-22 22:55 Hyderabad) — see scripts/verify-jathaka.ts.
 *
 * The varga sign for each body is read from the already-computed
 * `PlanetPosition.d1..d60` fields (ephemeris.calculateVargaSign) so that there
 * is exactly ONE implementation of the divisional mathematics in the app.
 */
import type { CompleteChartResult } from './ephemeris';
import { TELUGU_RASIS } from './rasiNames';

export const VARGA_ORDER = [
  'D1',
  'D2',
  'D3',
  'D4',
  'D7',
  'D9',
  'D10',
  'D12',
  'D16',
  'D20',
  'D24',
  'D27',
  'D30',
  'D40',
  'D45',
  'D60',
] as const;

export type VargaCode = (typeof VARGA_ORDER)[number];

export const VARGA_NAMES_TE: Record<VargaCode, string> = {
  D1: 'రాశి (D-1)',
  D2: 'హోర (D-2)',
  D3: 'ద్రేక్కాణ (D-3)',
  D4: 'చతుర్థాంశ (D-4)',
  D7: 'సప్తాంశ (D-7)',
  D9: 'నవాంశ (D-9)',
  D10: 'దశాంశ (D-10)',
  D12: 'ద్వాదశాంశ (D-12)',
  D16: 'షోడశాంశ (D-16)',
  D20: 'వింశాంశ (D-20)',
  D24: 'చతుర్వింశాంశ (D-24)',
  D27: 'సప్తవింశాంశ (D-27)',
  D30: 'త్రింశాంశ (D-30)',
  D40: 'ఖవేదాంశ (D-40)',
  D45: 'అక్షవేదాంశ (D-45)',
  D60: 'షష్ట్యంశ (D-60)',
};

export const VARGA_DIVISION_TE: Record<VargaCode, string> = {
  D1: '30°',
  D2: '15°',
  D3: '10°',
  D4: '7°30′',
  D7: '4°17′08″',
  D9: '3°20′',
  D10: '3°',
  D12: '2°30′',
  D16: '1°52′30″',
  D20: '1°30′',
  D24: '1°15′',
  D27: '1°06′40″',
  D30: 'అసమ ఐదు ఖండాలు',
  D40: '45′',
  D45: '40′',
  D60: '30′',
};

export const VARGA_AREA_TE: Record<VargaCode, string> = {
  D1: 'శరీరం, సమగ్ర జీవితం',
  D2: 'ధనం, ఆస్తి, పోషణ',
  D3: 'తోబుట్టువులు, పరాక్రమం',
  D4: 'గృహం, భూమి, స్థిరాస్తి',
  D7: 'సంతానం, సృజన',
  D9: 'ధర్మం, వివాహం, అంతర్బలం',
  D10: 'వృత్తి, హోదా, కీర్తి',
  D12: 'తల్లిదండ్రులు, వంశం',
  D16: 'వాహనం, సుఖభోగాలు',
  D20: 'ఉపాసన, ఆధ్యాత్మికత',
  D24: 'విద్య, నేర్పు',
  D27: 'బలాబలాలు, సహజ శక్తి',
  D30: 'అరిష్టం, చరిత్ర బలం',
  D40: 'మాతృకులం, శుభాశుభాలు',
  D45: 'పితృకులం, సంస్కారం',
  D60: 'సూక్ష్మ కర్మ, పూర్వజన్మ',
};

export type VargaSchemeId = 'shadvarga' | 'saptavarga' | 'dashavarga' | 'shodashavarga';

export interface VimshopakaScheme {
  id: VargaSchemeId;
  nameTe: string;
  /** BPHS Ch. 7 weights — each scheme sums to exactly 20. */
  weights: Partial<Record<VargaCode, number>>;
}

export const VIMSHOPAKA_SCHEMES: VimshopakaScheme[] = [
  {
    id: 'shadvarga',
    nameTe: 'షడ్వర్గ వింశోపకం',
    weights: { D1: 6, D2: 2, D3: 4, D9: 5, D12: 2, D30: 1 },
  },
  {
    id: 'saptavarga',
    nameTe: 'సప్తవర్గ వింశోపకం',
    weights: { D1: 5, D2: 2, D3: 3, D7: 2.5, D9: 4.5, D12: 2, D30: 1 },
  },
  {
    id: 'dashavarga',
    nameTe: 'దశవర్గ వింశోపకం',
    weights: {
      D1: 3,
      D2: 1.5,
      D3: 1.5,
      D7: 1.5,
      D9: 1.5,
      D10: 1.5,
      D12: 1.5,
      D16: 1.5,
      D30: 1.5,
      D60: 5,
    },
  },
  {
    id: 'shodashavarga',
    nameTe: 'షోడశవర్గ వింశోపకం',
    weights: {
      D1: 3.5,
      D2: 1,
      D3: 1,
      D4: 0.5,
      D7: 0.5,
      D9: 3,
      D10: 0.5,
      D12: 0.5,
      D16: 2,
      D20: 0.5,
      D24: 0.5,
      D27: 0.5,
      D30: 1,
      D40: 0.5,
      D45: 0.5,
      D60: 4,
    },
  },
];

/** The ten bodies printed in a classical Telugu shodashavarga table. */
export const VARGA_BODY_IDS = [
  'Lagna',
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

export type VargaBodyId = (typeof VARGA_BODY_IDS)[number];

export const VARGA_BODY_SHORT_TE: Record<VargaBodyId, string> = {
  Lagna: 'ల',
  Sun: 'సూ',
  Moon: 'చం',
  Mars: 'కు',
  Mercury: 'బు',
  Jupiter: 'గు',
  Venus: 'శు',
  Saturn: 'శ',
  Rahu: 'రా',
  Ketu: 'కే',
};

const RASI_OWNER: Record<number, VargaBodyId> = {
  0: 'Mars',
  1: 'Venus',
  2: 'Mercury',
  3: 'Moon',
  4: 'Sun',
  5: 'Mercury',
  6: 'Venus',
  7: 'Mars',
  8: 'Jupiter',
  9: 'Saturn',
  10: 'Saturn',
  11: 'Jupiter',
};

/** Natural (naisargika) friends and enemies per BPHS Ch. 3. */
const NATURAL_FRIENDS: Record<string, VargaBodyId[]> = {
  Sun: ['Moon', 'Mars', 'Jupiter'],
  Moon: ['Sun', 'Mercury'],
  Mars: ['Sun', 'Moon', 'Jupiter'],
  Mercury: ['Sun', 'Venus'],
  Jupiter: ['Sun', 'Moon', 'Mars'],
  Venus: ['Mercury', 'Saturn'],
  Saturn: ['Mercury', 'Venus'],
  Rahu: ['Venus', 'Saturn', 'Mercury'],
  Ketu: ['Mars', 'Venus', 'Saturn'],
};

const NATURAL_ENEMIES: Record<string, VargaBodyId[]> = {
  Sun: ['Venus', 'Saturn'],
  Moon: [],
  Mars: ['Mercury'],
  Mercury: ['Moon'],
  Jupiter: ['Mercury', 'Venus'],
  Venus: ['Sun', 'Moon'],
  Saturn: ['Sun', 'Moon', 'Mars'],
  Rahu: ['Sun', 'Moon', 'Mars'],
  Ketu: ['Sun', 'Moon'],
};

const OWN_SIGNS: Record<string, number[]> = {
  Sun: [4],
  Moon: [3],
  Mars: [0, 7],
  Mercury: [2, 5],
  Jupiter: [8, 11],
  Venus: [1, 6],
  Saturn: [9, 10],
  Rahu: [10],
  Ketu: [7],
};

const MOOLATRIKONA: Record<string, number> = {
  Sun: 4,
  Moon: 1,
  Mars: 0,
  Mercury: 5,
  Jupiter: 8,
  Venus: 6,
  Saturn: 10,
  Rahu: 10,
  Ketu: 7,
};

const EXALTATION: Record<string, number> = {
  Sun: 0,
  Moon: 1,
  Mars: 9,
  Mercury: 5,
  Jupiter: 3,
  Venus: 11,
  Saturn: 6,
  Rahu: 1,
  Ketu: 7,
};

export type VargaDignityId =
  | 'moolatrikona'
  | 'own'
  | 'adhimitra'
  | 'mitra'
  | 'sama'
  | 'satru'
  | 'adhisatru';

/** Varga Viswa (BPHS Ch. 7): the share of the 20 points a placement earns. */
export const VARGA_VISWA: Record<VargaDignityId, number> = {
  moolatrikona: 20,
  own: 20,
  adhimitra: 18,
  mitra: 15,
  sama: 10,
  satru: 7,
  adhisatru: 5,
};

export const VARGA_DIGNITY_TE: Record<VargaDignityId, string> = {
  moolatrikona: 'మూలత్రికోణం',
  own: 'స్వక్షేత్రం',
  adhimitra: 'అతిమిత్ర',
  mitra: 'మిత్ర',
  sama: 'సమ',
  satru: 'శత్రు',
  adhisatru: 'అతిశత్రు',
};

/** Two-tier friendship used by the Saptavargaja bala of the Shadbala. */
export const SAPTAVARGAJA_VIRUPAS: Record<VargaDignityId, number> = {
  moolatrikona: 45,
  own: 30,
  adhimitra: 20,
  mitra: 15,
  sama: 10,
  satru: 4,
  adhisatru: 2,
};

interface BodyLike {
  id: string;
  signIndex: number;
  degreeInSign: number;
  d1Sign: number;
  d2Sign: number;
  d3Sign: number;
  d4Sign: number;
  d7Sign: number;
  d9Sign: number;
  d10Sign: number;
  d12Sign: number;
  d16Sign: number;
  d20Sign: number;
  d24Sign: number;
  d27Sign: number;
  d30Sign: number;
  d40Sign: number;
  d45Sign: number;
  d60Sign: number;
}

export function vargaSignField(code: VargaCode): keyof BodyLike {
  return `${code.toLowerCase()}Sign` as keyof BodyLike;
}

/**
 * Dignity of a body inside one varga sign.
 *
 * Moolatrikona is only awarded in D-1 and only inside the classical degree
 * band (BPHS Ch. 3). In higher vargas a varga has no longitude, so a sign that
 * happens to be the planet's moolatrikona rasi is scored as "own" (30/20) —
 * this exactly reproduces the reference jathakam's Saptavargaja numbers.
 */
export function vargaDignity(
  bodyId: string,
  signIndex: number,
  degreeInSign?: number
): VargaDignityId {
  const owner = RASI_OWNER[signIndex];
  const own = OWN_SIGNS[bodyId] ?? [];
  const isMoolatrikonaRasi = MOOLATRIKONA[bodyId] === signIndex;

  if (isMoolatrikonaRasi && degreeInSign !== undefined) {
    const limit: Record<string, number> = {
      Sun: 20,
      Moon: 3,
      Mars: 12,
      Mercury: 20,
      Jupiter: 10,
      Venus: 15,
      Saturn: 20,
      Rahu: 10,
      Ketu: 10,
    };
    if (degreeInSign < (limit[bodyId] ?? 10)) return 'moolatrikona';
  }
  if (own.includes(signIndex)) return own.length === 1 || !isMoolatrikonaRasi ? 'own' : 'own';
  if (owner === bodyId) return 'own';
  if ((NATURAL_FRIENDS[bodyId] ?? []).includes(owner)) return 'mitra';
  if ((NATURAL_ENEMIES[bodyId] ?? []).includes(owner)) return 'satru';
  return 'sama';
}

export interface VargaCellTe {
  code: VargaCode;
  signIndex: number;
  rasiTe: string;
  dignity: VargaDignityId;
  dignityTe: string;
  /** House counted from the varga lagna. */
  house: number;
}

export interface VimshopakaScoreTe {
  scheme: VargaSchemeId;
  nameTe: string;
  score: number;
  maxScore: 20;
  verdictTe: string;
}

export interface VargaBodyRowTe {
  bodyId: VargaBodyId;
  nameTe: string;
  glyph: string;
  cells: VargaCellTe[];
  /** D-1 sign repeated in D-9 — Parashara's classic vargottama definition. */
  vargottama: boolean;
  vargottamaVargas: VargaCode[];
  scores: VimshopakaScoreTe[];
  vaiseshikamsa: {
    count: number;
    total: number;
    nameTe: string;
    noteTe: string;
  };
}

export interface VargaChartTe {
  code: VargaCode;
  nameTe: string;
  areaTe: string;
  lagnaSignIndex: number;
  lagnaRasiTe: string;
  placements: { bodyId: VargaBodyId; signIndex: number; house: number; rasiTe: string }[];
}

export interface VargaVimshopakaReport {
  matrix: { code: VargaCode; nameTe: string; signIndexes: number[] }[];
  rows: VargaBodyRowTe[];
  charts: VargaChartTe[];
  schemes: VimshopakaScheme[];
  methodNoteTe: string;
}

const PLANET_TE: Record<VargaBodyId, { nameTe: string; glyph: string }> = {
  Lagna: { nameTe: 'లగ్నం', glyph: '⟰' },
  Sun: { nameTe: 'సూర్యుడు', glyph: '☉' },
  Moon: { nameTe: 'చంద్రుడు', glyph: '☽' },
  Mars: { nameTe: 'కుజుడు', glyph: '♂' },
  Mercury: { nameTe: 'బుధుడు', glyph: '☿' },
  Jupiter: { nameTe: 'గురువు', glyph: '♃' },
  Venus: { nameTe: 'శుక్రుడు', glyph: '♀' },
  Saturn: { nameTe: 'శని', glyph: '♄' },
  Rahu: { nameTe: 'రాహువు', glyph: '☊' },
  Ketu: { nameTe: 'కేతువు', glyph: '☋' },
};

const VAISESHIKAMSA_TITLES = [
  '', // 0
  '', // 1
  'పారిజాత అంశ',
  'ఉత్తమ అంశ',
  'గోపుర అంశ',
  'సింహాసన అంశ',
  'పారావత అంశ',
  'దేవలోక అంశ',
  'బ్రహ్మలోక అంశ',
  'శక్రవాహన అంశ',
  'శ్రీధామ అంశ',
  'గోలోక అంశ',
];

function verdictForVimshopaka(score: number): string {
  if (score >= 17) return 'అత్యుత్తమ బలం — వర్గ బలం పరిపూర్ణం';
  if (score >= 15) return 'బలమైన వర్గ స్థితి';
  if (score >= 12) return 'మధ్యమ వర్గ బలం';
  if (score >= 8) return 'సాధారణం — అనుకూల దశలో ఫలితం';
  return 'బలహీన వర్గ స్థితి — పరిహారం అవసరం';
}

export function computeVargaVimshopaka(chart: CompleteChartResult): VargaVimshopakaReport {
  const planetById = new Map(chart.planets.map((p) => [p.id, p]));

  const bodies: { id: VargaBodyId; source: BodyLike }[] = [];
  bodies.push({
    id: 'Lagna',
    source: {
      id: 'Lagna',
      signIndex: chart.ascendant.signIndex,
      degreeInSign: chart.ascendant.siderealLon % 30,
      d1Sign: chart.ascendant.signIndex,
      d2Sign: chart.ascendant.d2Sign,
      d3Sign: chart.ascendant.d3Sign,
      d4Sign: chart.ascendant.d4Sign,
      d7Sign: chart.ascendant.d7Sign,
      d9Sign: chart.ascendant.d9Sign,
      d10Sign: chart.ascendant.d10Sign,
      d12Sign: chart.ascendant.d12Sign,
      d16Sign: chart.ascendant.d16Sign,
      d20Sign: chart.ascendant.d20Sign,
      d24Sign: chart.ascendant.d24Sign,
      d27Sign: chart.ascendant.d27Sign,
      d30Sign: chart.ascendant.d30Sign,
      d40Sign: chart.ascendant.d40Sign,
      d45Sign: chart.ascendant.d45Sign,
      d60Sign: chart.ascendant.d60Sign,
    },
  });
  for (const id of VARGA_BODY_IDS) {
    if (id === 'Lagna') continue;
    const p = planetById.get(id);
    if (p) bodies.push({ id, source: p as unknown as BodyLike });
  }

  const signOf = (body: BodyLike, code: VargaCode): number => {
    switch (code) {
      case 'D1':
        return body.d1Sign;
      case 'D2':
        return body.d2Sign;
      case 'D3':
        return body.d3Sign;
      case 'D4':
        return body.d4Sign;
      case 'D7':
        return body.d7Sign;
      case 'D9':
        return body.d9Sign;
      case 'D10':
        return body.d10Sign;
      case 'D12':
        return body.d12Sign;
      case 'D16':
        return body.d16Sign;
      case 'D20':
        return body.d20Sign;
      case 'D24':
        return body.d24Sign;
      case 'D27':
        return body.d27Sign;
      case 'D30':
        return body.d30Sign;
      case 'D40':
        return body.d40Sign;
      case 'D45':
        return body.d45Sign;
      default:
        return body.d60Sign;
    }
  };

  const lagnaByVarga = new Map<VargaCode, number>();
  for (const code of VARGA_ORDER) lagnaByVarga.set(code, signOf(bodies[0].source, code));

  const matrix = VARGA_ORDER.map((code) => ({
    code,
    nameTe: VARGA_NAMES_TE[code],
    signIndexes: bodies.map((b) => signOf(b.source, code)),
  }));

  const rows: VargaBodyRowTe[] = bodies.map((b) => {
    const cells: VargaCellTe[] = VARGA_ORDER.map((code) => {
      const signIndex = signOf(b.source, code);
      const dignity = vargaDignity(
        b.id,
        signIndex,
        code === 'D1' ? b.source.degreeInSign : undefined
      );
      const lagnaSign = lagnaByVarga.get(code) ?? 0;
      return {
        code,
        signIndex,
        rasiTe: TELUGU_RASIS[signIndex]?.nameTe ?? '',
        dignity,
        dignityTe: VARGA_DIGNITY_TE[dignity],
        house: ((signIndex - lagnaSign + 12) % 12) + 1,
      };
    });

    const scores: VimshopakaScoreTe[] = VIMSHOPAKA_SCHEMES.map((scheme) => {
      let total = 0;
      let ownCount = 0;
      for (const [code, weight] of Object.entries(scheme.weights) as [VargaCode, number][]) {
        const cell = cells.find((c) => c.code === code)!;
        total += (weight * VARGA_VISWA[cell.dignity]) / 20;
        if (VARGA_VISWA[cell.dignity] >= 20) ownCount += 1;
      }
      return {
        scheme: scheme.id,
        nameTe: scheme.nameTe,
        score: Number(total.toFixed(2)),
        maxScore: 20 as const,
        verdictTe: verdictForVimshopaka(total),
      };
    });

    // Vaiseshikamsa — counted over the Dashavarga scheme (BPHS Ch. 7).
    const dashWeights = VIMSHOPAKA_SCHEMES.find((s) => s.id === 'dashavarga')!.weights;
    let vaiseshikaCount = 0;
    for (const code of Object.keys(dashWeights) as VargaCode[]) {
      const cell = cells.find((c) => c.code === code)!;
      const sign = cell.signIndex;
      if (sign === EXALTATION[b.id] || (OWN_SIGNS[b.id] ?? []).includes(sign)) vaiseshikaCount += 1;
    }

    const vargottamaVargas = (['D9', 'D2', 'D3', 'D12', 'D30'] as VargaCode[]).filter((code) => {
      const cell = cells.find((c) => c.code === code)!;
      return code === 'D9' ? cell.signIndex === cells[0].signIndex : false;
    });

    return {
      bodyId: b.id,
      nameTe: PLANET_TE[b.id].nameTe,
      glyph: PLANET_TE[b.id].glyph,
      cells,
      vargottama: cells[0].signIndex === cells[5].signIndex,
      vargottamaVargas,
      scores,
      vaiseshikamsa: {
        count: vaiseshikaCount,
        total: 10,
        nameTe: VAISESHIKAMSA_TITLES[Math.min(10, vaiseshikaCount)] || '—',
        noteTe:
          vaiseshikaCount >= 5
            ? 'దశవర్గంలో ఐదు కంటే ఎక్కువ వర్గాలు స్వక్షేత్రం/ఉచ్చంలో — రాజయోగ సహజ బలం.'
            : 'దశవర్గ వైశేషికాంశ గణన (స్వక్షేత్ర/ఉచ్చ వర్గాల సంఖ్య).',
      },
    };
  });

  const charts: VargaChartTe[] = VARGA_ORDER.map((code) => {
    const lagnaSignIndex = lagnaByVarga.get(code) ?? 0;
    return {
      code,
      nameTe: VARGA_NAMES_TE[code],
      areaTe: VARGA_AREA_TE[code],
      lagnaSignIndex,
      lagnaRasiTe: TELUGU_RASIS[lagnaSignIndex]?.nameTe ?? '',
      placements: bodies
        .filter((b) => b.id !== 'Lagna')
        .map((b) => {
          const signIndex = signOf(b.source, code);
          return {
            bodyId: b.id,
            signIndex,
            house: ((signIndex - lagnaSignIndex + 12) % 12) + 1,
            rasiTe: TELUGU_RASIS[signIndex]?.nameTe ?? '',
          };
        }),
    };
  });

  return {
    matrix,
    rows,
    charts,
    schemes: VIMSHOPAKA_SCHEMES,
    methodNoteTe:
      'షోడశ వర్గ స్థితులు బృహత్ పరాశర హోరా శాస్త్రం (అధ్యాయం 6) ప్రకారం; వింశోపక బలం అధ్యాయం 7 ప్రకారం — వర్గ విశ్వ (స్వక్షేత్రం 20, అతిమిత్ర 18, మిత్ర 15, సమ 10, శత్రు 7, అతిశత్రు 5) × వర్గ భారం ÷ 20. D-2 హోరలో బృహత్ పరాశర పద్ధతి (అయిష్య రాశి మొదటి సగం సూర్య హోర/సింహం) వాడబడింది; కొన్ని తెలుగు సాఫ్ట్‌వేర్‌లు దీనిని తారుమారుగా చూపిస్తాయి.',
  };
}
