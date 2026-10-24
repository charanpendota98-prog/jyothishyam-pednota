/**
 * అవకహడ చక్రం, ఘాత చక్రం, పంచధా మైత్రి — సంపూర్ణ పరిశీలన
 * -----------------------------------------------------------------
 * • అవకహడ చక్రం (Avakahada Chakra): వర్ణ, వశ్య, యోని, గణ, నాడి, రజ్జు,
 *   రాశి/రాశ్యధిపతి, యుంజ, హంసక (తత్వం), జన్మాక్షరం — వివాహ పొంతనలలో
 *   వాడే సంప్రదాయ పట్టిక.
 * • ఘాత చక్రం (Ghata Chakra): జన్మ రాశికి ఆధారంగా శాస్త్రీయ ముహూర్త
 *   పట్టిక — ఘాత మాసం, తిథి గణం, వారం, నక్షత్రం, యోగం, కరణం, ప్రహరం,
 *   ఘాత చంద్ర రాశి (పురుష/స్త్రీ).
 * • పంచధా మైత్రి (Panchadha Maitri): నైసర్గిక + తాత్కాలిక మైత్రి కలిపి
 *   అతిమిత్ర/మిత్ర/సమ/శత్రు/అతిశత్రు నిర్ణయం.
 */
import type { CompleteChartResult } from './ephemeris';
import { TELUGU_NAKSHATRAS, TELUGU_RASIS } from './teluguJathakam';

export type AvakahadaRowTe = { key: string; labelTe: string; valueTe: string; noteTe?: string };

const VARNA_BY_ELEMENT: Record<string, string> = {
  'అగ్ని తత్వం': 'క్షత్రియ',
  'భూ తత్వం': 'వైశ్య',
  'వాయు తత్వం': 'శూద్ర',
  'జల తత్వం': 'బ్రాహ్మణ',
};

const VASHYA_BY_RASI: string[] = [
  'చతుష్పాద (Chatushpada)',
  'చతుష్పాద (Chatushpada)',
  'మానవ (Manava)',
  'జలచర (Jalachara)',
  'వనచర (Vanachara)',
  'మానవ (Manava)',
  'మానవ (Manava)',
  'కీట (Keeta)',
  'మానవ (Manava)',
  'జలచర-చతుష్పాద సంధి',
  'మానవ (Manava)',
  'జలచర (Jalachara)',
];

/** Nakshatra groups of nine → యుంజ. */
function yunjaFor(nakIndex: number): string {
  if (nakIndex < 9) return 'ఆది యుంజ';
  if (nakIndex < 18) return 'మధ్య యుంజ';
  return 'అంత్య యుంజ';
}

export const GHATA_TABLE: {
  rasiTe: string;
  masaTe: string;
  tithiGroupTe: string;
  varaTe: string;
  nakshatraTe: string;
  yogaTe: string;
  karanaTe: string;
  prahara: number;
  chandraMale: number;
  chandraFemale: number;
}[] = [
  { rasiTe: 'మేషం', masaTe: 'కార్తీక మాసం', tithiGroupTe: 'నంద', varaTe: 'ఆదివారం', nakshatraTe: 'మఘ', yogaTe: 'విష్కంభ', karanaTe: 'బవ', prahara: 1, chandraMale: 1, chandraFemale: 1 },
  { rasiTe: 'వృషభం', masaTe: 'మార్గశిర మాసం', tithiGroupTe: 'పూర్ణ', varaTe: 'శనివారం', nakshatraTe: 'హస్త', yogaTe: 'శుక్ల', karanaTe: 'శకుని', prahara: 4, chandraMale: 5, chandraFemale: 8 },
  { rasiTe: 'మిథునం', masaTe: 'ఆషాఢ మాసం', tithiGroupTe: 'భద్ర', varaTe: 'సోమవారం', nakshatraTe: 'స్వాతి', yogaTe: 'పరిఘ', karanaTe: 'కౌలవ', prahara: 3, chandraMale: 9, chandraFemale: 7 },
  { rasiTe: 'కర్కాటకం', masaTe: 'పుష్య మాసం', tithiGroupTe: 'భద్ర', varaTe: 'బుధవారం', nakshatraTe: 'అనూరాధ', yogaTe: 'వ్యాఘాత', karanaTe: 'నాగ', prahara: 1, chandraMale: 2, chandraFemale: 9 },
  { rasiTe: 'సింహం', masaTe: 'జ్యేష్ఠ మాసం', tithiGroupTe: 'జయ', varaTe: 'శనివారం', nakshatraTe: 'మూల', yogaTe: 'ధృతి', karanaTe: 'బవ', prahara: 1, chandraMale: 6, chandraFemale: 4 },
  { rasiTe: 'కన్య', masaTe: 'భాద్రపద మాసం', tithiGroupTe: 'పూర్ణ', varaTe: 'శనివారం', nakshatraTe: 'శ్రవణం', yogaTe: 'శుక్ల', karanaTe: 'కౌలవ', prahara: 1, chandraMale: 10, chandraFemale: 3 },
  { rasiTe: 'తుల', masaTe: 'మాఘ మాసం', tithiGroupTe: 'రిక్త', varaTe: 'గురువారం', nakshatraTe: 'శతభిష', yogaTe: 'శుక్ల', karanaTe: 'తైతిల', prahara: 4, chandraMale: 3, chandraFemale: 6 },
  { rasiTe: 'వృశ్చికం', masaTe: 'ఆశ్వయుజ మాసం', tithiGroupTe: 'నంద', varaTe: 'శుక్రవారం', nakshatraTe: 'రేవతి', yogaTe: 'వ్యతీపాత', karanaTe: 'గర', prahara: 1, chandraMale: 7, chandraFemale: 2 },
  { rasiTe: 'ధనుస్సు', masaTe: 'శ్రావణ మాసం', tithiGroupTe: 'జయ', varaTe: 'శుక్రవారం', nakshatraTe: 'భరణి', yogaTe: 'వజ్ర', karanaTe: 'తైతిల', prahara: 1, chandraMale: 4, chandraFemale: 10 },
  { rasiTe: 'మకరం', masaTe: 'వైశాఖ మాసం', tithiGroupTe: 'రిక్త', varaTe: 'మంగళవారం', nakshatraTe: 'రోహిణి', yogaTe: 'వైధృతి', karanaTe: 'శకుని', prahara: 4, chandraMale: 8, chandraFemale: 11 },
  { rasiTe: 'కుంభం', masaTe: 'చైత్ర మాసం', tithiGroupTe: 'జయ', varaTe: 'గురువారం', nakshatraTe: 'ఆర్ద్ర', yogaTe: 'గండ', karanaTe: 'కింస్తుఘ్న', prahara: 3, chandraMale: 11, chandraFemale: 5 },
  { rasiTe: 'మీనం', masaTe: 'ఫాల్గుణ మాసం', tithiGroupTe: 'పూర్ణ', varaTe: 'శుక్రవారం', nakshatraTe: 'ఆశ్లేష', yogaTe: 'వజ్ర', karanaTe: 'చతుష్పాద', prahara: 4, chandraMale: 12, chandraFemale: 12 },
];

const TITHI_GROUP_TE: Record<number, string> = {
  1: 'నంద (1, 6, 11)',
  2: 'భద్ర (2, 7, 12)',
  3: 'జయ (3, 8, 13)',
  4: 'రిక్త (4, 9, 14)',
  5: 'పూర్ణ (5, 10, 15)',
};

const GRAHA9 = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'] as const;
const GRAHA9_TE: Record<string, string> = {
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

const NATURAL_FRIENDS: Record<string, string[]> = {
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
const NATURAL_ENEMIES: Record<string, string[]> = {
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

export type MaitriId = 'adhimitra' | 'mitra' | 'sama' | 'satru' | 'adhisatru';

export const MAITRI_TE: Record<MaitriId, string> = {
  adhimitra: 'అతిమిత్ర',
  mitra: 'మిత్ర',
  sama: 'సమ',
  satru: 'శత్రు',
  adhisatru: 'అతిశత్రు',
};

export interface MaitriMatrixRow {
  from: string;
  fromTe: string;
  cells: {
    to: string;
    toTe: string;
    house: number;
    naturalTe: string;
    temporalTe: string;
    compound: MaitriId;
    compoundTe: string;
  }[];
}

export interface AvakahadaReport {
  rows: AvakahadaRowTe[];
  ghata: {
    janmaRasiTe: string;
    row: (typeof GHATA_TABLE)[number];
    tithiGroupTe: string;
    meaningTe: string;
  };
  maitri: MaitriMatrixRow[];
  summaryTe: string;
}

export function computeAvakahada(chart: CompleteChartResult): AvakahadaReport {
  const moon = chart.planets.find((p) => p.id === 'Moon')!;
  const moonSignIndex = Math.floor(moon.siderealLon / 30) % 12;
  const nakIndex = Math.floor(moon.siderealLon / (360 / 27)) % 27;
  const pada = Math.floor((moon.siderealLon % (360 / 27)) / (360 / 108)) + 1;
  const nak = TELUGU_NAKSHATRAS[nakIndex];
  const rasi = TELUGU_RASIS[moonSignIndex];

  const tithiNumber = chart.panchanga?.tithi?.number ?? 1;
  const tithiGroup = TITHI_GROUP_TE[(((tithiNumber - 1) % 15) % 5) + 1] ?? '—';

  const rows: AvakahadaRowTe[] = [
    { key: 'nakshatra', labelTe: 'నక్షత్రం', valueTe: `${nak.nameTe} — పాదం ${pada}`, noteTe: nak.deityTe },
    { key: 'nakshatraLord', labelTe: 'నక్షత్రాధిపతి', valueTe: nak.lordTe },
    { key: 'nadi', labelTe: 'నాడి', valueTe: nak.nadiTe },
    { key: 'yoni', labelTe: 'యోని', valueTe: nak.yoniTe },
    { key: 'gana', labelTe: 'గణం', valueTe: nak.ganaTe },
    { key: 'rajju', labelTe: 'రజ్జు', valueTe: nak.rajjuTe },
    { key: 'rasi', labelTe: 'జన్మ రాశి', valueTe: rasi.nameTe },
    { key: 'rasiLord', labelTe: 'రాశ్యధిపతి', valueTe: rasi.lordTe },
    {
      key: 'varna',
      labelTe: 'వర్ణ కూటం',
      valueTe: VARNA_BY_ELEMENT[rasi.tattvamTe] ?? '—',
      noteTe: `${rasi.tattvamTe} ప్రకారం`,
    },
    { key: 'vashya', labelTe: 'వశ్య కూటం', valueTe: VASHYA_BY_RASI[moonSignIndex] ?? '—' },
    { key: 'yunja', labelTe: 'యుంజ', valueTe: yunjaFor(nakIndex), noteTe: 'నక్షత్ర సమూహం (9×3)' },
    { key: 'hansaka', labelTe: 'హంసక / తత్వం', valueTe: rasi.tattvamTe },
    {
      key: 'nama',
      labelTe: 'జన్మ నామాక్షరం',
      valueTe: nak.padasTe[pada - 1] ?? '—',
      noteTe: `పాదాక్షరాలు: ${nak.padasTe.join(', ')}`,
    },
    { key: 'swabhava', labelTe: 'రాశి స్వభావం', valueTe: rasi.swabhavamTe },
  ];

  const ghataRow = GHATA_TABLE[moonSignIndex];

  const maitri: MaitriMatrixRow[] = GRAHA9.map((from) => {
    const fromPlanet = chart.planets.find((p) => p.id === from);
    return {
      from,
      fromTe: GRAHA9_TE[from],
      cells: GRAHA9.map((to) => {
        const toPlanet = chart.planets.find((p) => p.id === to);
        const house = fromPlanet && toPlanet
          ? ((Math.floor(toPlanet.siderealLon / 30) - Math.floor(fromPlanet.siderealLon / 30) + 12) % 12) + 1
          : 1;
        const isNaturalFriend = NATURAL_FRIENDS[from]?.includes(to) ?? false;
        const isNaturalEnemy = NATURAL_ENEMIES[from]?.includes(to) ?? false;
        const temporalFriend = [2, 3, 4, 10, 11, 12].includes(house);
        const compound: MaitriId =
          isNaturalFriend && temporalFriend
            ? 'adhimitra'
            : isNaturalEnemy && temporalFriend
              ? 'mitra'
              : isNaturalFriend && !temporalFriend
                ? 'sama'
                : isNaturalEnemy && !temporalFriend
                  ? 'satru'
                  : temporalFriend
                    ? 'mitra'
                    : 'sama';
        return {
          to,
          toTe: GRAHA9_TE[to],
          house,
          naturalTe: isNaturalFriend ? 'మిత్ర' : isNaturalEnemy ? 'శత్రు' : 'సమ',
          temporalTe: temporalFriend ? 'తాత్కాలిక మిత్ర' : 'తాత్కాలిక శత్రు',
          compound,
          compoundTe: MAITRI_TE[compound],
        };
      }),
    };
  });

  return {
    rows,
    ghata: {
      janmaRasiTe: rasi.nameTe,
      row: ghataRow,
      tithiGroupTe: tithiGroup,
      meaningTe:
        'ఘాత దినం, ఘాత తిథి, ఘాత నక్షత్రం మరియు ఘాత యోగం వచ్చిన రోజులలో కొత్త పనులు, ప్రయాణాలు, గృహప్రవేశం మొదలైనవి నిషిద్ధం. వివాహం, ఉపనయనం, యజ్ఞం, తీర్థయాత్రలకు ఈ నిషేధం వర్తించదు (శాస్త్రీయ మినహాయింపు).',
    },
    maitri,
    summaryTe: `${rasi.nameTe} జన్మ రాశి, ${nak.nameTe} నక్షత్రం (పాదం ${pada}) — ${VARNA_BY_ELEMENT[rasi.tattvamTe] ?? ''} వర్ణం, ${VASHYA_BY_RASI[moonSignIndex]} వశ్యం, ${nak.nadiTe}, ${nak.yoniTe} యోని, ${nak.ganaTe}. ఘాత చక్రం ప్రకారం ${ghataRow.masaTe}, ${ghataRow.tithiGroupTe} తిథులు, ${ghataRow.varaTe}, ${ghataRow.nakshatraTe} నక్షత్రం, ${ghataRow.yogaTe} యోగం, ${ghataRow.karanaTe} కరణం — ఈ కాలాలలో శుభ కార్యాలు మానుకోవాలి.`,
  };
}
