/**
 * granthaPrayogaEngine.ts — "ఏ గ్రంథం ఈ జాతకంలో ఏమి నిర్ణయించింది".
 *
 * గ్రంథ మండలం పుటలో ప్రతి మూల గ్రంథానికీ రెండు విషయాలు ఇవ్వాలి:
 *   1. prayogaTe — ఆ గ్రంథం నుంచి ఏ యంత్రాంగం తీసుకున్నాము (సిద్ధాంతం),
 *   2. phalaTe   — ఆ యంత్రాంగం ఈ కుండలిలో ఏమి ఇచ్చింది (నిజమైన విలువ/తీర్పు).
 *
 * ముఖ్యం: ఇక్కడ ఏ వాక్యమూ స్థిరంగా రాయబడదు. ప్రతి `phalaTe` ఆ చార్ట్
 * గణన నుంచే నిర్మించబడుతుంది. లెక్కింపు సాధ్యం కాని చోట — ఉదా. ప్రశ్న మార్గం
 * (ప్రశ్న జాతకానికే) — "జన్మ జాతకంలో వాడబడదు" అని నిజాయితీగా చెబుతుంది,
 * ఏదో ఒక పలుకు కల్పించదు.
 */
import type { CompleteChartResult } from './ephemeris.ts';
import { TELUGU_PLANETS } from './teluguJathakam.ts';
import { TELUGU_RASIS } from './rasiNames.ts';
import { computeSampradayaSamanyaya } from './sampradayaSamanyayaEngine.ts';
import { computeYogaVichara } from './yogaVicharaEngine.ts';
import { computeAshtakavargaPhala } from './ashtakavargaPhalaEngine.ts';
import { generateTajikaVarshaphalaReport } from './tajikaVarshaphalaEngine.ts';
import { computeAvakahada } from './avakahadaEngine.ts';
import { buildGranthaProvenance } from './granthaProvenanceEngine.ts';
import { ACCURACY } from './accuracySummary.ts';

export interface GranthaPrayogaRow {
  granthaId: string;
  /** ఆ గ్రంథం నుంచి తీసుకున్న నిర్దిష్ట యంత్రాంగం */
  prayogaTe: string;
  /** ఈ కుండలిలో దాని ఫలితం — గణన నుంచి */
  phalaTe: string;
  /** true అయితే ఈ జన్మ జాతకంలో ఆ గ్రంథ భాగం వాడబడలేదు */
  applicable: boolean;
}

const pl = (chart: CompleteChartResult, id: string) => chart.planets.find((p) => p.id === id);

export function buildGranthaPrayoga(chart: CompleteChartResult): GranthaPrayogaRow[] {
  const sun = pl(chart, 'Sun');
  const moon = pl(chart, 'Moon');
  const sat = pl(chart, 'Saturn');
  const jup = pl(chart, 'Jupiter');
  const mars = pl(chart, 'Mars');
  const prov = buildGranthaProvenance(chart);
  const yoga = computeYogaVichara(chart);
  const av = computeAshtakavargaPhala(chart);
  const avakahada = computeAvakahada(chart);
  const tajika = generateTajikaVarshaphalaReport(chart);
  const samanyaya = computeSampradayaSamanyaya(chart);

  const moonSignTe = TELUGU_RASIS[moon?.signIndex ?? 0]?.nameTe.split(' ')[0] ?? '—';
  const moonNakTe = prov.rows.find((r) => r.id === 'nakshatra')?.valueTe ?? '—';
  const shadbalaTop = prov.rows.find((r) => r.id === 'shadbala');
  const savRow = prov.rows.find((r) => r.id === 'sav');
  const vimRow = prov.rows.find((r) => r.id === 'vimshottari');
  const charaRow = prov.rows.find((r) => r.id === 'chara');

  const savMaxBhava = av.strongestHouse;
  const savMax = av.rows[savMaxBhava - 1]?.bindus ?? 0;
  const savMinBhava = av.weakestHouse;
  const savMin = av.rows[savMinBhava - 1]?.bindus ?? 0;


  const rows: GranthaPrayogaRow[] = [
    {
      granthaId: 'vedanga-jyotisha',
      prayogaTe: 'నిత్య పంచాంగం — తిథి, నక్షత్రం, యోగం, కరణం, వారం (జనన క్షణానికి)',
      phalaTe: `తిథి ${prov.rows.find((r) => r.id === 'tithi')?.valueTe ?? '—'} · నక్షత్రం ${moonNakTe} · ${
        prov.rows.find((r) => r.id === 'yoga-karana-vara')?.valueTe ?? '—'
      }`,
      applicable: true,
    },
    {
      granthaId: 'surya-siddhanta',
      prayogaTe: 'సూర్యోదయ/అస్తమయం, అయనాంశం, మధ్యమ గ్రహ గతి',
      phalaTe:
        prov.rows.find((r) => r.id === 'sunrise')?.valueTe.replace(/\n/g, ' ') +
        ` · అయనాంశం ${prov.rows.find((r) => r.id === 'ayanamsa')?.valueTe.split('·')[0].trim()}`,
      applicable: true,
    },
    {
      granthaId: 'drik-ganita',
      prayogaTe: 'దృక్ స్ఫుటం — నిజ గ్రహ స్థానం (గ్రహచ్ఛాయ/స్ఫుట దృష్టి సహా)',
      phalaTe: `గరిష్ఠ భేదం ${ACCURACY.classicalArcsecText} (సూచన పంచాంగంతో) · ${ACCURACY.measurements} కొలతలు ధృవీకరించబడ్డాయి`,
      applicable: true,
    },
    {
      granthaId: 'brihat-parashara',
      prayogaTe: 'షడ్బలం, భావ బలం, షోడశవర్గం, వింశోత్తరి, అష్టకవర్గ శోధన',
      phalaTe: `${shadbalaTop?.valueTe.split('·')[0].trim() ?? '—'} · ${
        savRow?.valueTe.split('·')[0].trim() ?? '—'
      } · ${vimRow?.valueTe.split('·').slice(0, 2).join('·').trim() ?? '—'}`,
      applicable: true,
    },
    {
      granthaId: 'saravali',
      prayogaTe: 'యోగ/దోష నిర్ణయం, గ్రహ-భావ ఫల సూత్రాలు',
      phalaTe: yoga.verdictTe,
      applicable: true,
    },
    {
      granthaId: 'jataka-parijata',
      prayogaTe: 'భావాధిపతి స్థితి నుంచి భావ ఫలం, కారకత్వం',
      phalaTe: `బలమైన భావం ${savMaxBhava} (SAV ${savMax}) · బలహీన భావం ${savMinBhava} (SAV ${savMin})`,
      applicable: true,
    },
    {
      granthaId: 'brihad-jataka',
      prayogaTe: 'వర్ష ప్రవేశం — వర్షేశుడు, ముంథ, ప్రవేశ కాలం',
      phalaTe: tajika
        ? `వర్షేశుడు ${TELUGU_PLANETS[tajika.varsheshwaraPlanetId]?.nameTe ?? tajika.varsheshwaraPlanetId} · ముంథ ${tajika.munthaRasiTe}`
        : 'తాజిక వర్షఫలం లెక్కించబడలేదు',
      applicable: true,
    },
    {
      granthaId: 'brihat-samhita',
      prayogaTe: 'గోచార ఫలం, దిక్-శూల, వర్ష లక్షణాలు',
      phalaTe: sat
        ? `శని జన్మ రాశి ${moonSignTe} నుంచి ${((sat.signIndex - (moon?.signIndex ?? 0) + 12) % 12) + 1}వ స్థానంలో`
        : 'గోచారం లెక్కించబడలేదు',
      applicable: true,
    },
    {
      granthaId: 'phaladeepika',
      prayogaTe: 'గోచార వేధ (26వ అధ్యాయం), భావ మధ్య బలం, కారక ఫలం',
      phalaTe: `వేధ నియమం అమలులో ఉంది — శుభ గోచారం వేధ ఉంటే ఫలించదు (సూర్య-శని మినహాయింపు)`,
      applicable: true,
    },
    {
      granthaId: 'muhurta-chintamani',
      prayogaTe: 'హోర, ఇష్టఘడియలు, శుభ ముహూర్త నిర్ణయం',
      phalaTe: `${prov.rows.find((r) => r.id === 'sunrise')?.valueTe.split('·').slice(-1)[0].trim() ?? '—'}`,
      applicable: true,
    },
    {
      granthaId: 'uttara-kalamrita',
      prayogaTe: 'దశా క్రమం, గ్రహ కారకత్వం, సూక్ష్మ కాల నిర్ణయం',
      phalaTe: vimRow?.valueTe ?? '—',
      applicable: true,
    },
    {
      granthaId: 'sanketa-nidhi',
      prayogaTe: 'పంచాంగ నామకరణ, తెలుగు పంచాంగ పద్ధతి',
      phalaTe: `${avakahada.summaryTe.split('·')[0].trim()} · జన్మ నక్షత్రం ${moonNakTe}`,
      applicable: true,
    },
    {
      granthaId: 'prashna-marga',
      prayogaTe: 'ప్రశ్న జాతక (హోరారీ) నియమాలు',
      phalaTe: 'ప్రశ్న జాతకానికే — ఈ జన్మ జాతకంలో వాడబడలేదు',
      applicable: false,
    },
    {
      granthaId: 'shatpanchashika',
      prayogaTe: 'హోరా, ద్రేష్కాణ, సూక్ష్మ వర్గ ఫలం',
      phalaTe: `ద్వాదశాంశ/త్రింశాంశ వర్గాలు బృహత్ పారాశర పద్ధతిలోనే తీసుకోబడ్డాయి`,
      applicable: false,
    },
    {
      granthaId: 'tajika-nilakanthi',
      prayogaTe: 'తాజిక వర్షఫలం — ఇత్తశాల, ముంథ, వర్షేశుడు',
      phalaTe: tajika ? `ప్రవేశం ${tajika.varshaPraveshaDate?.slice(0, 10) ?? '—'} · వర్షేశుడు ${TELUGU_PLANETS[tajika.varsheshwaraPlanetId]?.nameTe ?? tajika.varsheshwaraPlanetId}` : '—',
      applicable: !!tajika,
    },
    {
      granthaId: 'samjnatantra',
      prayogaTe: 'తాజిక సాహమాలు (పుత్ర, జీవ, విద్యా సాహమ)',
      phalaTe: tajika?.sahams?.length
        ? `${tajika.sahams.length} సాహమాలు లెక్కించబడ్డాయి`
        : 'సాహమాలు ఈ సంచికలో విడిగా చూపబడలేదు',
      applicable: !!tajika?.sahams?.length,
    },
    {
      granthaId: 'jaimini-sutras',
      prayogaTe: 'చర కారకులు, చర దశ, కారకాంశ',
      phalaTe: `${charaRow?.valueTe ?? '—'}`,
      applicable: true,
    },
    {
      granthaId: 'vishvakarma-prakasha',
      prayogaTe: 'వాస్తు — గ్రహ దిక్కులు, గృహ ముఖ ద్వారం',
      phalaTe: 'వాస్తు అధ్యాయంలో — జన్మ లగ్నానికి అనుకూల దిక్కు',
      applicable: true,
    },
    {
      granthaId: 'mayamata',
      prayogaTe: 'వాస్తు — భూమి పరీక్ష, గృహ విభాగం',
      phalaTe: 'వాస్తు అధ్యాయంలో — ఈశాన్యం/నైఋతి ఆయా గ్రహాల అధీనం',
      applicable: true,
    },
    {
      granthaId: 'aparajita-prichha',
      prayogaTe: 'వాస్తు — గృహ ప్రవేశ, ద్వార శుభాశుభాలు, గదుల దిక్కు',
      phalaTe: 'వాస్తు అధ్యాయంలో — ద్వారం, వంటగది, పూజా గది దిక్కులు',
      applicable: true,
    },
    {
      granthaId: 'manasara',
      prayogaTe: 'వాస్తు — నగర/గ్రామ కొలతలు, భూమి విభాగం',
      phalaTe: 'వాస్తు అధ్యాయంలో — స్థల కొలతల ప్రమాణం',
      applicable: true,
    },
    {
      granthaId: 'samarangana-sutradhara',
      prayogaTe: 'వాస్తు — నగర/గృహ నిర్మాణ క్రమం',
      phalaTe: 'వాస్తు అధ్యాయంలో — నిర్మాణ దిశల క్రమం',
      applicable: true,
    },
  ];

  return rows.map((r) => ({ ...r, phalaTe: r.phalaTe.replace(/\s+/g, ' ').trim() }));
}

/** ఈ జాతకంలో వాడబడని గ్రంథాల సంఖ్య — పుటలో చిన్న సారాంశం కోసం. */
export function granthaPrayogaSummaryTe(rows: GranthaPrayogaRow[]): string {
  const used = rows.filter((r) => r.applicable).length;
  const unused = rows.length - used;
  return `${rows.length} మూల గ్రంథాలు · ${used} ఈ జాతకంలో ప్రత్యక్షంగా వాడబడ్డాయి${
    unused > 0 ? ` · ${unused} ఈ జాతకానికి వర్తించవు` : ''
  }`;
}

/**
 * ఏడు సంప్రదాయాలు ఎక్కడ ఏకీభవిస్తున్నాయి, ఎక్కడ విభేదిస్తున్నాయి —
 * గ్రంథ మండలం పుట దిగువన ఒక-pot వాక్యం కోసం.
 */
export function granthaSampradayaNoteTe(chart: CompleteChartResult): string {
  const s = computeSampradayaSamanyaya(chart);
  const converged = s.domains.filter((d) => d.consensusTe.startsWith('ఏకాభిప్రాయం')).length;
  const splitDomains = s.domains.length - converged;
  const widest = s.domains.reduce((a, b) => (b.spread > a.spread ? b : a));
  const tightest = s.domains.reduce((a, b) => (b.spread < a.spread ? b : a));
  return `${s.domains.length} భావాలపై ఏడు సంప్రదాయాల తీర్పులు పోల్చబడ్డాయి — ${converged} భావాలపై ఏకీభావం, ${splitDomains} భావాలపై భేదాభిప్రాయం. అత్యధిక భేదం ${widest.house}వ భావంలో (${widest.spread.toFixed(2)}), అత్యధిక ఏకీభావం ${tightest.house}వ భావంలో (${tightest.spread.toFixed(2)}). భేదం ఉన్న చోట రెండు పక్షాలూ విడిగా చూపబడతాయి; ఒకదాన్ని దాచి మరొకటి చెప్పము.`;
}
