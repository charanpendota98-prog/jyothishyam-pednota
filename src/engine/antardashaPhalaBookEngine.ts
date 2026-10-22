/**
 * అంతర దశా ఫల పుస్తకం — Mahādaśā–Bhukti phala book (BPHS ch. 46–47 paddhati).
 *
 * సంప్రదాయ జాతక పత్రికలో (ఉదా. 116 పుటల పత్రికలో 67–107 పుటలు) ప్రతి
 * మహాదశలోని తొమ్మిది భుక్తులకూ విడిగా ఫలితం ఇస్తారు. ఇక్కడ అదే విధంగా
 * 9 × 9 = 81 భుక్తి ఫలాలు లెక్కించబడతాయి.
 *
 * ఫలిత నిర్ణయ సూత్రం (పరాశర / ఫలదీపికా క్రమం):
 *   1. మహాదశాధిపతి ఉన్న భావం → ప్రధాన జీవిత రంగం (ముఖ్య ఫలం).
 *   2. భుక్త్యధిపతి ఉన్న భావం → ఉప రంగం (ఈ కాలపు ప్రధాన కార్యభారం).
 *   3. భుక్త్యధిపతి మహాదశాధిపతి నుండి ఎనిమిదింటిలో (6/8/12) ఉంటే
 *      ఆటంకం–శ్రమ; కేంద్ర (1/4/7/10) లేదా త్రికోణ (5/9) లో ఉంటే అనుకూలం.
 *   4. ఇరువురి నైసర్గిక మైత్రి (మిత్ర/సమ/శత్రు) ఫలాన్ని బలపరుస్తుంది లేదా
 *      బలహీనపరుస్తుంది.
 *   5. భుక్త్యధిపతి స్థితి (ఉచ్చ/స్వక్షేత్రం/నీచ) తుది శ్రేయస్సును నిర్ణయిస్తుంది.
 */
import type { CompleteChartResult } from './ephemeris.ts';
import type { DashaNode } from './vimshottariDeepEngine.ts';
import { computeVimshottariDeep } from './vimshottariDeepEngine.ts';
import { BHAVA_THEMES_TE } from './ashtakavargaPhalaEngine.ts';

export interface BhuktiPhalaRow {
  mahaLord: string;
  mahaLordTe: string;
  bhuktiLord: string;
  bhuktiLordTe: string;
  startLocal: string;
  endLocal: string;
  startMs: number;
  endMs: number;
  widthTe: string;
  /** మహాదశాధిపతి భావం */
  mahaHouse: number;
  /** భుక్త్యధిపతి భావం */
  bhuktiHouse: number;
  /** భుక్త్యధిపతి మహాదశాధిపతి నుండి ఎన్నో భావం */
  bhuktiFromMaha: number;
  relationTe: 'మిత్రత్వం' | 'సమత్వం' | 'శత్రుత్వం';
  dignityTe: string;
  score: number;
  headlineTe: string;
  phalaTe: string;
  cautionTe: string;
  remedyTe: string;
  /** ఈ భుక్తి ఇప్పుడు నడుస్తోందా */
  isRunning: boolean;
}

export interface MahaDashaPhalaSection {
  lord: string;
  lordTe: string;
  startLocal: string;
  endLocal: string;
  house: number;
  summaryTe: string;
  scoreAvg: number;
  rows: BhuktiPhalaRow[];
}

export interface AntardashaPhalaBook {
  sections: MahaDashaPhalaSection[];
  totalBhuktis: number;
  currentPathTe: string;
  methodNoteTe: string;
  sourceNoteTe: string;
}

const PLANET_TE: Record<string, string> = {
  Sun: 'సూర్యుడు', Moon: 'చంద్రుడు', Mars: 'కుజుడు', Mercury: 'బుధుడు',
  Jupiter: 'గురువు', Venus: 'శుక్రుడు', Saturn: 'శని', Rahu: 'రాహువు', Ketu: 'కేతువు',
};

/** నైసర్గిక మైత్రి — సూర్యుని నుండి లెక్కించిన సంప్రదాయ పట్టిక */
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
  Rahu: ['Sun', 'Moon'],
  Ketu: ['Sun', 'Moon'],
};

const DEITY_TE: Record<string, string> = {
  Sun: 'సూర్యనారాయణ (ఆదిత్య హృదయం)',
  Moon: 'శివుడు (సోమవార ఉపవాసం)',
  Mars: 'హనుమంతుడు (సుందరకాండ)',
  Mercury: 'విష్ణువు (విష్ణు సహస్రనామం)',
  Jupiter: 'దక్షిణామూర్తి (గురు చరిత్ర)',
  Venus: 'లక్ష్మీదేవి (శ్రీ సూక్తం)',
  Saturn: 'శనీశ్వరుడు / హనుమాన్',
  Rahu: 'దుర్గాదేవి (దుర్గా సప్తశతి)',
  Ketu: 'గణపతి (గణేశ పంచరత్నం)',
};

const DANA_TE: Record<string, string> = {
  Sun: 'గోధుమలు, బెల్లం, ఎరుపు వస్త్ర దానం',
  Moon: 'అన్నదానం, పాలు, తెల్ల వస్త్ర దానం',
  Mars: 'కందులు, ఎరుపు చేతి గుడ్డ, హనుమాన్ సేవ',
  Mercury: 'పెసలు, పసుపు, పుస్తక దానం',
  Jupiter: 'శనగపప్పు, పసుపు, విద్యార్థులకు సహాయం',
  Venus: 'పెరుగు, తెల్ల పుష్పాలు, కన్యకలకు దానం',
  Saturn: 'నువ్వులు, ఇనుము, వృద్ధుల సేవ',
  Rahu: 'నల్ల నువ్వులు, నల్ల వస్త్రం, దుర్గా ఉపాసన',
  Ketu: 'కుక్కలకు ఆహారం, గణపతి పూజ, కంబళి దానం',
};

const DUSTHANA = [6, 8, 12];

const houseTheme = (h: number) => BHAVA_THEMES_TE[(h - 1) % 12] ?? '';

const relationOf = (a: string, b: string): 'మిత్రత్వం' | 'సమత్వం' | 'శత్రుత్వం' => {
  if (a === b) return 'మిత్రత్వం';
  if (NATURAL_FRIENDS[a]?.includes(b)) return 'మిత్రత్వం';
  if (NATURAL_ENEMIES[a]?.includes(b)) return 'శత్రుత్వం';
  return 'సమత్వం';
};

const DIGNITY_TE: Record<string, string> = {
  Exalted: 'ఉచ్చ స్థితి',
  Moolatrikona: 'మూలత్రికోణం',
  'Own Sign': 'స్వక్షేత్రం',
  Friendly: 'మిత్ర క్షేత్రం',
  Neutral: 'సమ క్షేత్రం',
  Enemy: 'శత్రు క్షేత్రం',
  Debilitated: 'నీచ స్థితి',
};

const DIGNITY_POINTS: Record<string, number> = {
  Exalted: 16,
  Moolatrikona: 13,
  'Own Sign': 12,
  Friendly: 8,
  Neutral: 4,
  Enemy: -4,
  Debilitated: -10,
};

export function computeAntardashaPhalaBook(chart: CompleteChartResult): AntardashaPhalaBook {
  const dasha = computeVimshottariDeep(chart);
  const byId = new Map(chart.planets.map((p) => [p.id, p]));
  const now = Date.now();

  const sections: MahaDashaPhalaSection[] = dasha.mahadashas.map((md: DashaNode) => {
    const mdPlanet = byId.get(md.lord);
    const mdHouse = mdPlanet?.house ?? 1;

    const rows: BhuktiPhalaRow[] = md.children.map((ad: DashaNode) => {
      const adPlanet = byId.get(ad.lord);
      const adHouse = adPlanet?.house ?? 1;
      const bhuktiFromMaha = ((adHouse - mdHouse + 12) % 12) + 1;
      const relationTe = relationOf(md.lord, ad.lord);
      const dignityKey = adPlanet?.dignity ?? 'Neutral';
      const dignityTe = DIGNITY_TE[dignityKey] ?? 'సమ క్షేత్రం';

      // ── బలం స్కోరు (0–100) ─────────────────────────────────
      let score = 50;
      if ([1, 4, 7, 10].includes(bhuktiFromMaha)) score += 8;
      if ([5, 9].includes(bhuktiFromMaha)) score += 12;
      if ([3, 11].includes(bhuktiFromMaha)) score += 6;
      if (DUSTHANA.includes(bhuktiFromMaha)) score -= 16;
      if (relationTe === 'మిత్రత్వం') score += 10;
      if (relationTe === 'శత్రుత్వం') score -= 10;
      score += DIGNITY_POINTS[dignityKey] ?? 0;
      if (DUSTHANA.includes(adHouse)) score -= 6;
      if ([1, 5, 9, 10, 11].includes(adHouse)) score += 6;
      if (ad.lord === md.lord) score += 6;
      score = Math.max(18, Math.min(96, Math.round(score)));

      const dusthanaContact = DUSTHANA.includes(bhuktiFromMaha) || DUSTHANA.includes(adHouse);
      const strongContact = [1, 4, 5, 7, 9, 10, 11].includes(bhuktiFromMaha) && !dusthanaContact;

      const headlineTe = dusthanaContact
        ? `శ్రమ, ఆటంకాలు — ${houseTheme(adHouse).split(',')[0]} రంగంలో జాగ్రత్త`
        : strongContact
          ? `అనుకూల ఫలం — ${houseTheme(adHouse).split(',')[0]} రంగంలో విజయం`
          : `సమతుల్య కాలం — ${houseTheme(adHouse).split(',')[0]} రంగంపై శ్రద్ధ`;

      const phalaTe = [
        `${PLANET_TE[md.lord]} మహాదశలో ${PLANET_TE[ad.lord]} భుక్తి (${ad.startLocal.slice(0, 10)} – ${ad.endLocal.slice(0, 10)}).`,
        `మహాదశాధిపతి ${mdHouse}వ భావంలో (${houseTheme(mdHouse)}), భుక్త్యధిపతి ${adHouse}వ భావంలో (${houseTheme(adHouse)}) — ${dignityTe}.`,
        `భుక్త్యధిపతి మహాదశాధిపతి నుండి ${bhuktiFromMaha}వ స్థానంలో; ఇరువురి మధ్య ${relationTe}.`,
        dusthanaContact
          ? `ఇది 6/8/12 సంబంధ కాలం కాబట్టి ఆరోగ్యం, ఋణం, వ్యర్థ ప్రయాణాలు, అనవసర వ్యయాలపై అప్రమత్తత అవసరం. కొత్త పెద్ద పెట్టుబడులు, హడావిడి నిర్ణయాలు వాయిదా వేయడం మేలు; ఉన్న పనులను పూర్తి చేయడంపై దృష్టి పెట్టండి.`
          : strongContact
            ? `ఇది త్రికోణ/కేంద్ర సంబంధ కాలం కాబట్టి కుటుంబం, వృత్తి, ఆర్థిక రంగాలలో ముందడుగు పడుతుంది. భుక్త్యధిపతి భావం (${adHouse}) సూచించే ${houseTheme(adHouse)} విషయాలలో ప్రయత్నం ఫలిస్తుంది; పెద్దల ఆశీస్సు, లిఖిత ఒప్పందాలు అనుకూలం.`
            : `ఫలితాలు శ్రమానుపాతంగా ఉంటాయి. ${houseTheme(adHouse)} రంగంలో క్రమమైన ప్రయత్నం, ఓర్పు అవసరం; తొందరపాటు నిర్ణయాలు నివారించండి.`,
      ].join(' ');

      const cautionTe = dusthanaContact
        ? 'ఆరోగ్య పరీక్షలు, ఋణ చెల్లింపు క్రమశిక్షణ, ప్రయాణాల్లో జాగ్రత్త; వాహనం/ఆస్తి లావాదేవీలలో పత్రాల తనిఖీ.'
        : relationTe === 'శత్రుత్వం'
          ? 'సహచరులతో అభిప్రాయ భేదాలు రావచ్చు; మాటలో మితత్వం, ఒప్పందాలలో స్పష్టత అవసరం.'
          : 'ఏదీ తీవ్రంగా లేదు; క్రమశిక్షణ కాపాడుకుంటే ఫలితాలు అనుకూలం.';

      const remedyTe = `${DEITY_TE[ad.lord] ?? 'ఇష్టదైవం'} ఆరాధన; ${DANA_TE[ad.lord] ?? 'దానధర్మాలు'}.`;

      return {
        mahaLord: md.lord,
        mahaLordTe: md.lordTe,
        bhuktiLord: ad.lord,
        bhuktiLordTe: ad.lordTe,
        startLocal: ad.startLocal,
        endLocal: ad.endLocal,
        startMs: ad.startMs,
        endMs: ad.endMs,
        widthTe: ad.widthTe,
        mahaHouse: mdHouse,
        bhuktiHouse: adHouse,
        bhuktiFromMaha,
        relationTe,
        dignityTe,
        score,
        headlineTe,
        phalaTe,
        cautionTe,
        remedyTe,
        isRunning: now >= ad.startMs && now < ad.endMs,
      };
    });

    const scoreAvg = Math.round(rows.reduce((s, r) => s + r.score, 0) / (rows.length || 1));
    const summaryTe = `${PLANET_TE[md.lord]} మహాదశ (${md.startLocal.slice(0, 10)} – ${md.endLocal.slice(0, 10)}, ${md.widthTe}) — ${mdHouse}వ భావం (${houseTheme(mdHouse)}) ఆధిపత్యం. మహాదశాధిపతి ${mdPlanet ? DIGNITY_TE[mdPlanet.dignity] ?? 'సమ స్థితి' : 'సమ స్థితి'}, ${mdPlanet?.isRetrograde ? 'వక్ర గమనం — ఫలితాలు ఆలస్యంగా, పునఃప్రారంభంతో' : 'సవ్య గమనం — ఫలితాలు క్రమంగా'}. ఈ మహాదశలో ${houseTheme(mdHouse)} సంబంధిత విషయాలే జీవిత కేంద్రంగా ఉంటాయి; భుక్తుల మార్పుతో ఆ దిశలో ఒడిదుడుకులు వస్తాయి. సగటు అనుకూలత ${scoreAvg}/100.`;

    return {
      lord: md.lord,
      lordTe: md.lordTe,
      startLocal: md.startLocal,
      endLocal: md.endLocal,
      house: mdHouse,
      summaryTe,
      scoreAvg,
      rows,
    };
  });

  const running = sections.flatMap((s) => s.rows).find((r) => r.isRunning);
  const currentPathTe = running
    ? `ప్రస్తుతం ${running.mahaLordTe} మహాదశలో ${running.bhuktiLordTe} భుక్తి (${running.startLocal.slice(0, 10)} – ${running.endLocal.slice(0, 10)}) నడుస్తోంది — ${running.headlineTe}.`
    : 'ప్రస్తుత కాలం లెక్కించిన దశా పరిధి వెలుపల ఉంది.';

  return {
    sections,
    totalBhuktis: sections.reduce((s, x) => s + x.rows.length, 0),
    currentPathTe,
    methodNoteTe:
      'పద్ధతి: మహాదశాధిపతి భావం = ప్రధాన రంగం; భుక్త్యధిపతి భావం = ఉప రంగం. భుక్త్యధిపతి మహాదశాధిపతి నుండి 6/8/12లో ఉంటే ఆటంకం, 1/4/7/10 లేదా 5/9లో ఉంటే అనుకూలం; నైసర్గిక మైత్రి మరియు భుక్త్యధిపతి స్థితి (ఉచ్చ/స్వ/నీచ) ఫలాన్ని సవరిస్తాయి.',
    sourceNoteTe:
      'మూలం: బృహత్ పరాశర హోరా శాస్త్రం అధ్యాయం 46–47 (దశా ఫల), ఫలదీపికా అధ్యాయం 19–20 (భుక్తి ఫల), మానసాగరి దశా ఫల అధ్యాయం.',
  };
}
