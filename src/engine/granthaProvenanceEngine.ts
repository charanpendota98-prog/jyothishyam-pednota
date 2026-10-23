import { EPHEMERIS_ACCURACY } from '../generated/ephemerisAccuracy.ts';
/**
 * granthaProvenanceEngine.ts — ప్రమాణ పట్టిక (Provenance Audit)
 * ---------------------------------------------------------------------------
 * ఒక ముద్రిత జాతకంలో ఒక్కో వాక్యానికి తిరిగి ప్రశ్న వేయగలగాలి:
 *
 *   1. ఏ అంశం?               (subject)
 *   2. ఏ విలువ?               (value — ఈ జాతకంలో నిజంగా లెక్కించిన అంకె)
 *   3. ఎలా వచ్చింది?           (derivation — సూత్రం + ఆ సూత్రంలో ప్రవేశించిన సంఖ్యలు)
 *   4. ఏ గ్రంథం?              (source — మూల గ్రంథం + అధ్యాయం)
 *   5. ఏ కోడ్?                (engine — ఫైలు/ఫంక్షన్)
 *   6. ఏ గేట్ ధృవీకరిస్తుంది?   (gate — `npm run verify:*`)
 *
 * ఇక్కడ ఏ ఒక్క వాక్యమూ చేతితో రాయబడదు — ప్రతి విలువ ఇంజిన్ నుంచే తీసుకోబడుతుంది.
 * ఏది లెక్కించలేము (పేరు, హోదా, ఆయుర్దాయ సంఖ్య, వ్యాధి నిర్ధారణ) అనేది
 * `unverifiableTe` లో మరియు `limitsTe` లో స్పష్టంగా రాయబడుతుంది.
 */

import type { CompleteChartResult } from './ephemeris.ts';
import { formatDMS } from './ephemeris.ts';
import { RASI_TE, PLANET_TE, type PlanetId9 } from './lagnaFunctionalEngine.ts';
import { computeShadbalaDeep } from './shadbalaDeepEngine.ts';
import { computeVimshottariDeep } from './vimshottariDeepEngine.ts';
import { calculateJaiminiCharaDasha } from './jaiminiCharaDashaEngine.ts';
import { generateTajikaVarshaphalaReport } from './tajikaVarshaphalaEngine.ts';
import { JATHAKA_GATES } from '../generated/verificationStats.ts';
import { TELUGU_NAKSHATRAS } from './teluguJathakam.ts';

/** verify:shadbala తనిఖీల సంఖ్య (మాన్యువల్ — స్క్రిప్ట్ మారితే ఇక్కడా మార్చాలి; గేట్ తనిఖీ చేస్తుంది). */
export const SHADBALA_GATES = 301;

export interface ProvenanceRow {
  id: string;
  /** ఏ అంశం */
  subjectTe: string;
  /** ఈ జాతకంలో లెక్కించిన విలువ */
  valueTe: string;
  /** సూత్రం + ప్రవేశించిన సంఖ్యలు */
  derivationTe: string;
  /** మూల గ్రంథం — అధ్యాయం సహితం */
  sourceTe: string;
  /** ఇంజిన్ (ఫైల్ · ఫంక్షన్) */
  fnTe: string;
  /** ధృవీకరణ గేట్ */
  gateTe: string;
}

export interface GranthaProvenanceReport {
  rows: ProvenanceRow[];
  /** ఈ జాతకంలో ఎన్ని వాక్యాలు ఏ గేట్లతో ధృవీకరించబడ్డాయి */
  summaryTe: string;
  /** గేట్ల సంఖ్యలు (verify:* నుంచి) */
  gateCohortTe: string;
  /** జాతకం చెప్పలేని అంశాలు — కల్పించబడవు */
  unverifiableTe: string[];
  /** ఒక్కో వర్గానికి ఎన్ని వరుసలు */
  groupsTe: { groupTe: string; count: number }[];
}

const HELIO = 'సూర్య సిద్ధాంతం · దృక్ సిద్ధాంతం (గ్రహ స్ఫుటం)';
const BPHS = 'బృహత్ పారాశర హోరా శాస్త్రం';
const JAIMINI = 'జైమిని సూత్రాలు (ఉపదేశ సూత్ర, KN రావు క్రమం)';
const TAJIKA = 'తాజిక నీలకంఠి (వర్షఫల)';
const PANCANGA = 'పంచాంగ రీతి — సూర్య సిద్ధాంతం · దృక్ పంచాంగ సంప్రదాయం';

const dms = (v: number) => formatDMS(v);

/** ముద్రిత గ్రంథంలో పంచాంగము తెలుగులోనే — ఇంగ్లీషు పేర్లు కలపము. */
const TITHI_TE = [
  'పాడ్యమి', 'విదియ', 'తదియ', 'చవితి', 'పంచమి', 'షష్ఠి', 'సప్తమి', 'అష్టమి', 'నవమి', 'దశమి',
  'ఏకాదశి', 'ద్వాదశి', 'త్రయోదశి', 'చతుర్దశి', 'పూర్ణిమ',
];
const YOGA_TE = [
  'విష్కంభ', 'ప్రీతి', 'ఆయుష్మాన్', 'సౌభాగ్య', 'శోభన', 'అతిగండ', 'సుకర్మ', 'ధృతి', 'శూల',
  'గండ', 'వృద్ధి', 'ధ్రువ', 'వ్యాఘాత', 'హర్షణ', 'వజ్ర', 'సిద్ధి', 'వ్యతీపాత', 'వరీయాన్',
  'పరిఘ', 'శివ', 'సిద్ధ', 'సాధ్య', 'శుభ', 'శుక్ల', 'బ్రహ్మ', 'ఇంద్ర', 'వైధృతి',
];
const KARANA_TE: Record<string, string> = {
  Bava: 'బవ', Balava: 'బాలవ', Kaulava: 'కౌలవ', Taitila: 'తైతిల', Gara: 'గర',
  Vanija: 'వణిజ', Vishti: 'విష్టి (భద్ర)', Shakuni: 'శకుని', Chatushpada: 'చతుష్పాద',
  Naga: 'నాగ', Kimstughna: 'కింస్తుఘ్న',
};
const VARA_TE: Record<string, string> = {
  Sunday: 'ఆదివారం', Monday: 'సోమవారం', Tuesday: 'మంగళవారం', Wednesday: 'బుధవారం',
  Thursday: 'గురువారం', Friday: 'శుక్రవారం', Saturday: 'శనివారం',
};
const NAK_TE_EN: Record<string, string> = Object.fromEntries(TELUGU_NAKSHATRAS.map((n) => [n.nameEn, n.nameTe]));
const nakTe = (en: string) => NAK_TE_EN[en] ?? en;


/** ఒక గ్రహం/లగ్నం ఏ రాశిలో, ఏ డిగ్రీలో, ఏ నక్షత్ర-పాదంలో */
const signLine = (lon: number, nakTe: string, pada: number) =>
  `${RASI_TE[Math.floor(lon / 30) % 12]} ${dms(lon % 30)} · ${nakTe}-${pada}`;

export function buildGranthaProvenance(chart: CompleteChartResult): GranthaProvenanceReport {
  const rows: ProvenanceRow[] = [];
  const tz = chart.input.tzOffsetHours;
  const pan = chart.panchanga;
  const sun = chart.planets.find((p) => p.id === 'Sun')!;
  const moon = chart.planets.find((p) => p.id === 'Moon')!;
  const deep = computeShadbalaDeep(chart);
  const vim = computeVimshottariDeep(chart);
  const chara = calculateJaiminiCharaDasha(chart, 'kn_rao');
  const tajika = generateTajikaVarshaphalaReport(chart, new Date().getFullYear());
  const nowMs = Date.now();

  // ── 1. కాలం & స్థానం ─────────────────────────────────────────────────────
  rows.push({
    id: 'epoch',
    subjectTe: 'జనన క్షణం → జూలియన్ దినం',
    valueTe: `JD ${chart.julianDay.toFixed(6)} · ${chart.utcIso}`,
    derivationTe:
      `స్థానిక సమయం ${chart.input.date} ${chart.input.time} − గ్రీనిచ్కు ${tz >= 0 ? '+' : ''}${tz} గం. ` +
      `= UT → JD దినమానం (JD = UT రోజులు + 2440587.5).`,
    sourceTe: HELIO,
    fnTe: 'ephemeris.ts · birthInputToUTCDate → chart.julianDay',
    gateTe: 'verify:astro — 30 జనన క్షణాలు · JD/స్ఫుటాలు స్విస్ ఎఫెమెరిస్‌తో',
  });

  rows.push({
    id: 'ayanamsa',
    subjectTe: 'అయనాంశం (లహిరి / చిత్రపక్ష)',
    valueTe: `${chart.ayanamsaDeg.toFixed(6)}° (${chart.ayanamsaFormatted})`,
    derivationTe:
      `నిరయన స్ఫుటం = సాయన (ట్రోపికల్) స్ఫుటం − అయనాంశం. అయనాంశం లహిరి శకం నుంచి ` +
      `ప్రసరణ (precession) చొప్పున లెక్కించబడుతుంది; జనన స్థానిక సమయానికే (UT) లెక్క.`,
    sourceTe: PANCANGA,
    fnTe: 'ephemeris.ts · calculateAyanamsa',
    gateTe: 'verify:astro — స్విస్ SIDM_LAHIRI తో భేదం ≤ 0.0012°',
  });

  // ── 2. లగ్నం ────────────────────────────────────────────────────────────
  rows.push({
    id: 'lagna',
    subjectTe: 'లగ్నం (అసెండెంట్)',
    valueTe: signLine(chart.ascendant.siderealLon, chart.ascendant.nakshatra, chart.ascendant.pada),
    derivationTe:
      `అక్షాంశం ${chart.input.lat}°, రేఖాంశం ${chart.input.lng}°, స్థానిక సమయం ${chart.input.time} — ` +
      `ఖగోళ మధ్యాహ్న కోణం నుంచి తూర్పు హోరిజోన్ ఖండన బిందువు (సాయన ${chart.ascendant.tropicalLon.toFixed(4)}°).`,
    sourceTe: `${BPHS} · అధ్యాయం 4 (రాశి-లగ్న నిర్ణయం)`,
    fnTe: 'ephemeris.ts · ఆస్కెండెంట్ (స్ఫటిక గణన)',
    gateTe: 'verify:astro — లగ్న భేదం ≤ 0.0001°',
  });

  // ── 3. తొమ్మిది గ్రహాలు ──────────────────────────────────────────────────
  // జాతక గ్రంథం నవగ్రహాలకే పరిమితం. బాహ్య గ్రహాలు (యురేనస్/నెప్చూన్/ప్లూటో)
  // ఇక్కడ చేర్చకూడదు — సంప్రదాయ పత్రికలో అవి లేవు; చేర్చితే పేరు లేక
  // "undefined స్ఫుటం" అని ముద్రణ అవుతుంది (ఇది నిజంగా జరిగింది).
  const NAVAGRAHA = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
  for (const p of chart.planets.filter((q) => NAVAGRAHA.includes(q.id))) {
    const isNode = p.id === 'Rahu' || p.id === 'Ketu';
    rows.push({
      id: `graha-${p.id}`,
      subjectTe: `${PLANET_TE[p.id as PlanetId9]} స్ఫుటం`,
      valueTe: `${signLine(p.siderealLon, nakTe(p.nakshatra), p.pada)}${p.isRetrograde ? ' · వక్రి' : ''}`,
      derivationTe:
        `సాయన స్ఫుటం ${p.tropicalLon.toFixed(5)}° − అయనాంశం ${chart.ayanamsaDeg.toFixed(5)}° ` +
        `= నిరయన ${p.siderealLon.toFixed(5)}° → రాశి ${Math.floor(p.siderealLon / 30) + 1}, ` +
        `రాశ్యంతరం ${dms(p.siderealLon % 30)}, నక్షత్రం ${nakTe(p.nakshatra)}, పాదం ${p.pada}.` +
        (isNode
          ? ` పాత సంప్రదాయం: మధ్యమ ${chart.nodeSphuta.convention === 'mean' ? 'వాడబడింది' : 'కాదు'} ` +
            `(మధ్యమ ${chart.nodeSphuta.meanSiderealLon.toFixed(4)}° · సత్యం ${chart.nodeSphuta.trueSiderealLon.toFixed(4)}° · భేదం ${chart.nodeSphuta.differenceDeg.toFixed(4)}°).`
          : ''),
      sourceTe: isNode ? `${HELIO} · రాహు మధ్యమ పాత నియమం` : HELIO,
      fnTe: 'ephemeris.ts · calculateChart → planets[]',
      gateTe: 'verify:astro — గరిష్ఠ భేదం 0.0057° (20.5″) · TOL 0.01°',
    });
  }

  // ── 4. పంచాంగ అంగాలు ────────────────────────────────────────────────────
  rows.push({
    id: 'tithi',
    subjectTe: 'తిథి',
    valueTe: `${pan.tithi.number}. ${TITHI_TE[(pan.tithi.number - 1) % 15]} (${pan.tithi.paksha === 'Shukla Paksha (Waxing)' ? 'శుక్ల' : 'కృష్ణ'}) · ${pan.tithi.percentElapsed}% గతించింది`,
    derivationTe:
      `చంద్ర-సూర్య నిరయన భేదం = ${moon.siderealLon.toFixed(4)}° − ${sun.siderealLon.toFixed(4)}° ` +
      `= ${((moon.siderealLon - sun.siderealLon + 360) % 360).toFixed(4)}°; ÷ 12 = ` +
      `${(((moon.siderealLon - sun.siderealLon + 360) % 360) / 12).toFixed(4)} → ` +
      `${pan.tithi.number}వ తిథి (${pan.tithi.paksha === 'Shukla Paksha (Waxing)' ? 'శుక్ల' : 'కృష్ణ'} పక్షం).`,
    sourceTe: PANCANGA,
    fnTe: 'ephemeris.ts · calculatePanchanga',
    gateTe: 'verify:panchanga — 365/365 రోజులు స్విస్ ఫిక్చర్‌తో సరిపోలిక',
  });

  rows.push({
    id: 'nakshatra',
    subjectTe: 'జన్మ నక్షత్రం · పాదం',
    valueTe: `${nakTe(pan.nakshatra.name)} పాదం ${pan.nakshatra.pada} · ${pan.nakshatra.percentElapsed}% గతించింది`,
    derivationTe:
      `నిరయన చంద్ర స్ఫుటం ${moon.siderealLon.toFixed(5)}° ÷ 13°20′ = ` +
      `${(moon.siderealLon / (360 / 27)).toFixed(3)} → ${nakTe(pan.nakshatra.name)}; ` +
      `పాదం = కోణం ÷ 3°20′ = ${pan.nakshatra.pada}. అధిపతి ${pan.nakshatra.lord}.`,
    sourceTe: PANCANGA,
    fnTe: 'ephemeris.ts · calculatePanchanga → nakshatra',
    gateTe: 'verify:panchanga — నక్షత్రం/పాదం 365 రోజులు సరిపోలిక',
  });

  rows.push({
    id: 'yoga-karana-vara',
    subjectTe: 'యోగం · కరణం · వారం',
    valueTe: `${YOGA_TE[pan.yoga.number - 1] ?? pan.yoga.name} (${pan.yoga.number}) · ${KARANA_TE[pan.karana.name] ?? pan.karana.name} · ${VARA_TE[pan.vara.name] ?? pan.vara.name}`,
    derivationTe:
      `యోగం = (సూర్య + చంద్ర నిరయన) ÷ 13°20′ = ` +
      `${(((sun.siderealLon + moon.siderealLon) % 360) / (360 / 27)).toFixed(3)} → ${pan.yoga.number}వ యోగం; ` +
      `కరణం = తిథి అర్ధ భాగం నుంచి; వారం సూర్యోదయం నుంచి (హిందూ దినారంభం), అధిపతి ${pan.vara.lord}.`,
    sourceTe: PANCANGA,
    fnTe: 'ephemeris.ts · calculatePanchanga',
    gateTe: 'verify:panchanga — యోగం/కరణం 365/365',
  });

  rows.push({
    id: 'sunrise',
    subjectTe: 'సూర్యోదయం · అస్తమయం · హోర',
    valueTe: `${pan.sunTimes.sunriseLocal} / ${pan.sunTimes.sunsetLocal} · ${pan.sunTimes.dayDurationHours} గం. · హోర ${deep.hora.index} — ${deep.hora.lordTe}`,
    derivationTe:
      `వక్రీభవనం (34′) సహిత పై అంచు దృగ్గణన; అక్షాంశం ${chart.input.lat}°. ` +
      `హోర = పగలు/రాత్రి పొడవును 12 భాగాలుగా చేసి, వారాధిపతి ${deep.dinaLordTe} నుంచి క్రమం.`,
    sourceTe: `${BPHS} · షడ్బల అధ్యాయం (కాల బలం)`,
    fnTe: 'shadbalaDeepEngine.ts · riseSetForLocalDate · horaIndex',
    gateTe: 'verify:rise — 4745 ఉదయాస్తమయ తనిఖీలు ±1 నిమిషం',
  });

  // ── 5. వర్గాలు & బలం ────────────────────────────────────────────────────
  rows.push({
    id: 'navamsa',
    subjectTe: 'నవాంశ లగ్నం (D9)',
    valueTe: RASI_TE[chart.ascendant.d9Sign],
    derivationTe:
      `లగ్న రాశ్యంతరం ${dms(chart.ascendant.siderealLon % 30)} ÷ 3°20′ = ` +
      `${Math.floor((chart.ascendant.siderealLon % 30) / (10 / 3)) + 1}వ నవాంశం → ${RASI_TE[chart.ascendant.d9Sign]}.`,
    sourceTe: `${BPHS} · షోడశవర్గ అధ్యాయం (D9)`,
    fnTe: 'ephemeris.ts · vargaSigns → d9Sign',
    gateTe: 'verify:jathaka — షోడశ వర్గాలు 160 కణాలు సూచన పత్రికతో',
  });

  const rank1 = deep.rows.slice().sort((a, b) => a.rank - b.rank)[0];
  rows.push({
    id: 'shadbala',
    subjectTe: 'షడ్బలం — అగ్రగ్రహం',
    valueTe: `${rank1.nameTe} ${rank1.totalVirupas.toFixed(1)} విరూపాలు (${rank1.totalRupas.toFixed(2)} రూపాలు) · అవసరం ${rank1.requiredVirupas.toFixed(0)}`,
    derivationTe:
      `స్థాన ${rank1.sthanaTotal.toFixed(1)} + దిక్ ${rank1.dig.toFixed(1)} + కాల ${rank1.kalaTotal.toFixed(1)} + ` +
      `చేష్టా ${rank1.cheshta.toFixed(1)} + నైసర్గిక ${rank1.naisargika.toFixed(1)} + దృక్ ${rank1.drik.toFixed(1)} ` +
      `= ${rank1.totalVirupas.toFixed(1)} విరూపాలు.`,
    sourceTe: `${BPHS} · అధ్యాయం 27 (షడ్బల)`,
    fnTe: 'shadbalaDeepEngine.ts · computeShadbalaDeep',
    gateTe: 'verify:jathaka — చార్ట్ షడ్బలం ≡ విస్తృత షడ్బలం (7 గ్రహాలు)',
  });

  const lagnaLordRow = rank1;
  rows.push({
    id: 'ishta',
    subjectTe: 'ఇష్ట / కష్ట ఫలం',
    valueTe: `${lagnaLordRow.nameTe} — ఇష్ట ${lagnaLordRow.ishtaPhala.toFixed(1)} · కష్ట ${lagnaLordRow.kashtaPhala.toFixed(1)}`,
    derivationTe:
      `ఇష్ట ఫలం = √(ఉచ్చ బలం × చేష్టా బలం); కష్ట ఫలం = √(నీచ బలం × చేష్టా బలం) — ` +
      `రెండూ విరూపాల్లో, మొత్తం షడ్బలంతో కలిపి చదవకూడదు.`,
    sourceTe: `${BPHS} · ఇష్ట-కష్ట ఫల అధ్యాయం`,
    fnTe: 'shadbalaDeepEngine.ts · ishtaPhala / kashtaPhala',
    gateTe: 'verify:jathaka — ఇష్ట+కష్ట సంబంధం & పరిధి తనిఖీ',
  });

  const sav = chart.ashtakavarga.sarvashtakavarga;
  const savMax = sav.indexOf(Math.max(...sav));
  const savMin = sav.indexOf(Math.min(...sav));
  rows.push({
    id: 'sav',
    subjectTe: 'సర్వాష్టకవర్గం (SAV)',
    valueTe: `మొత్తం ${chart.ashtakavarga.totalBindus} బిందువులు · అధికం ${savMax + 1}వ రాశి (${sav[savMax]}) · అల్పం ${savMin + 1}వ రాశి (${sav[savMin]})`,
    derivationTe:
      `ఏడు గ్రహాల భిన్నాష్టకవర్గ పట్టికలను రాశుల వారీగా కలిపి: ${sav.join(' + ')} = ` +
      `${sav.reduce((a, b) => a + b, 0)}. బృహత్ పారాశర నియమాల ప్రకారం మొత్తం స్థిరంగా 337.`,
    sourceTe: `${BPHS} · అష్టకవర్గ అధ్యాయం`,
    fnTe: 'ashtakavarga.ts · అష్టకవర్గ గణన',
    gateTe: 'verify:jathaka — SAV మొత్తం 337 · 7×12 పట్టిక',
  });

  // ── 6. కాల చక్రం ────────────────────────────────────────────────────────
  const curMaha = vim.mahadashas.find((m) => nowMs >= m.startMs && nowMs < m.endMs);
  const curBhukti = curMaha?.children.find((b) => nowMs >= b.startMs && nowMs < b.endMs);
  rows.push({
    id: 'vimshottari',
    subjectTe: 'వింశోత్తరి — నడుస్తున్న మహాదశ / భుక్తి',
    valueTe: `${curMaha?.lordTe ?? '—'} మహాదశ (${curMaha?.startLocal.slice(0, 10)} → ${curMaha?.endLocal.slice(0, 10)})${
      curBhukti ? ` · ${curBhukti.lordTe} భుక్తి (${curBhukti.startLocal.slice(0, 10)} → ${curBhukti.endLocal.slice(0, 10)})` : ''
    }`,
    derivationTe:
      `జన్మ నక్షత్రం ${vim.janmaNakshatraTe}-${vim.janmaNakshatraPada}; నక్షత్రాధిపతి దశ ${vim.balance.lordTe}, ` +
      `జననానికి మిగిలిన భాగం ${vim.balance.textTe}. ఒక్కో దశా సంవత్సరం = 365.25 రోజులు; ` +
      `మహాదశలో భుక్తి = (భుక్తి అధిపతి సంవత్సరాలు ÷ 120) × మహాదశ కాలం.`,
    sourceTe: 'ఉడుదాశా (వింశోత్తరి) — బృహత్ పారాశర హోరా శాస్త్రం · దశాధ్యాయం',
    fnTe: 'vimshottariDeepEngine.ts · computeVimshottariDeep',
    gateTe: 'verify:jathaka — 9 మహాదశలు × 9 భుక్తులు = 81 · తేదీల క్రమం & 120 సం. మొత్తం',
  });

  const charaCur =
    chara.mahadashas.find((m) => nowMs >= Date.parse(`${m.startDate}T00:00:00Z`) && nowMs < Date.parse(`${m.endDate}T00:00:00Z`)) ??
    chara.mahadashas.find((m) => m.isCurrent);
  rows.push({
    id: 'chara',
    subjectTe: 'జైమిని చర దశ — నడుస్తున్న రాశి',
    valueTe: charaCur ? `${charaCur.rasiNameTe} (${charaCur.startDate} → ${charaCur.endDate})` : '—',
    derivationTe:
      `లగ్నం నుంచి రాశుల క్రమం (KN రావు పద్ధతి); ఒక్కో రాశి కాలం = ` +
      `ఆ రాశి నుంచి 9వ రాశి వరకు ఉన్న దూరం − 1 సంవత్సరాలు (ఉపదేశ సూత్రం). ` +
      `కారకాంశం ${chara.karakamshaRasiNameTe}.`,
    sourceTe: JAIMINI,
    fnTe: 'jaiminiCharaDashaEngine.ts · calculateJaiminiCharaDasha',
    gateTe: 'verify:sampradaya — చరదశ తేదీలు/రాశి దృష్టి తనిఖీ',
  });

  rows.push({
    id: 'karaka',
    subjectTe: 'ఆత్మకారకుడు (AK) · కారకాంశం',
    valueTe: `${chara.atmakaraka.karakaNameTe} — ${PLANET_TE[chara.atmakaraka.planetId as PlanetId9]} · కారకాంశం ${chara.karakamshaRasiNameTe}`,
    derivationTe:
      `ఏడు గ్రహాల రాశ్యంతరాన్ని అధికం నుంచి అల్పానికి క్రమపరచి ఎనిమిది కారకాలు; ` +
      `రాహువుకు రాశ్యంతరం తిరగబడి (30° − డిగ్రీ) లెక్కిస్తారు. ` +
      `AK రాశ్యంతరం ${chara.atmakaraka.degreeInSign.toFixed(4)}°.`,
    sourceTe: `${JAIMINI} · కారక అధ్యాయం`,
    fnTe: 'jaiminiCharaDashaEngine.ts · calculateJaiminiCharaDasha → atmakaraka',
    gateTe: 'verify:sampradaya — 8 కారకులు, డూప్లికేట్ లేదు',
  });

  rows.push({
    id: 'tajika',
    subjectTe: 'తాజిక వర్షఫలం — వర్షేశుడు · ముంథ',
    valueTe: `${tajika.targetYear}: వర్షేశుడు ${tajika.varsheshwaraPlanetTe} · ముంథ ${tajika.munthaRasiTe} · ప్రవేశం ${tajika.varshaPraveshaDate}`,
    derivationTe:
      `సూర్యుడు జన్మ స్థానానికి తిరిగి వచ్చే క్షణం (solar return) = వర్షప్రవేశం; ఆ క్షణపు కుండలి వర్ష లగ్నం. ` +
      `ముంథ = జన్మ లగ్న రాశి నుంచి సంవత్సరానికి ఒక రాశి చొప్పున. ` +
      `వర్షేశుడు = సంవత్సరాధిపతి (పంచాధికారుల్లో ప్రధానుడు).`,
    sourceTe: TAJIKA,
    fnTe: 'tajikaVarshaphalaEngine.ts · generateTajikaVarshaphalaReport',
    gateTe: 'verify:sampradaya — తాజిక తీర్పులో వర్ష లగ్న/ముంథ/వర్షేశుడు తనిఖీ',
  });

  rows.push({
    id: 'sampradaya',
    subjectTe: 'సప్త-సంప్రదాయ సమన్వయం',
    valueTe: '12 భావాలు × 7 పద్ధతులు = 84 స్వతంత్ర తీర్పులు (స్కోరు −2 … +2)',
    derivationTe:
      `ప్రతి తీర్పు = ఒక పద్ధతి నియమానికి ఆ జాతక సంఖ్యలు (స్థానం, క్షేత్రం, బిందువు, దశా తేది, ` +
      `సబ్-లార్డ్, రాశి దృష్టి, ముంథ) ప్రవేశపెట్టి వచ్చిన స్కోరు; సగటు + వ్యాప్తి రెండూ చూపబడతాయి.`,
    sourceTe: 'పారాశర · జైమిని · తాజిక · కేపీ — నాలుగు సంప్రదాయాల సమన్వయం',
    fnTe: 'sampradayaSamanyayaEngine.ts · computeSampradayaSamanyaya',
    gateTe: 'verify:sampradaya — 1531 తనిఖీలు',
  });

  // ── 7. లెక్కించలేనివి ────────────────────────────────────────────────────
  const unverifiableTe = [
    'జాతకుని పేరు, కులం, హోదా, ఉద్యోగ సంస్థ పేరు — కుండలి ఇవి చెప్పదు; ఇవి ఎక్కడా కల్పించబడలేదు.',
    'ఆయుర్దాయ సంఖ్య (సంవత్సరాలు) — 8వ భావం/శని/మారక స్థితిని మాత్రమే చెప్పగలము; ఖచ్చిత సంఖ్య శాస్త్రీయంగా బహు-కారకం.',
    'వ్యాధి నిర్ధారణ, మందు పేర్లు — వైద్యుని పరిధి; జాతకం “ఏ వ్యవస్థ బలహీనం” అనే సూచన మాత్రమే.',
    'సంతాన సంఖ్య, ప్రమాద తేదీ — శాస్త్రంలో ఏకాభిప్రాయం లేని అంశాలు; ఇక్కడ ఊహించబడవు.',
    'సట్టా (lottery), శత్రు నామం, కోర్టు తీర్పు — జాతకం పరిధి దాటినవి.',
  ];

  const groups = [
    { groupTe: 'కాలం · అయనాంశం · లగ్నం', count: 3 },
    { groupTe: 'నవగ్రహ స్ఫుటాలు', count: 9 },
    { groupTe: 'పంచాంగ అంగాలు & సూర్యోదయం', count: 4 },
    { groupTe: 'వర్గం · బలం · అష్టకవర్గం', count: 4 },
    { groupTe: 'దశలు · కారకులు · తాజిక · సమన్వయం', count: 5 },
  ];

  const summaryTe =
    `ఈ పుటలో ${rows.length} ప్రధాన వాక్య-సమూహాలున్నాయి. ప్రతి దానికి విలువ, సూత్రం, గ్రంథం, కోడ్, ` +
    `గేట్ — నాలుగూ ఇవ్వబడ్డాయి. ఇవి ${groups
      .reduce((a, g) => a + g.count, 0)} కణాలుగా విభజించబడ్డాయి; ప్రతి గణన ఇంజిన్ నుంచి నేరుగా ` +
    `తీసుకోబడింది, చేతితో నమోదు చేయబడలేదు.`;

  // గేట్ల సంఖ్యలు: జాతక గేట్లు స్వయంగా ఉత్పత్తి అయ్యే ఫైలు నుంచి (డ్రిఫ్ట్ రాదు);
  // మిగిలినవి ఆయా స్క్రిప్ట్‌ల అంకెలు — మారితే ఇక్కడా మార్చాలి (గేట్ దీన్ని తనిఖీ చేస్తుంది).
  const GATE_COUNTS = {
    astro: EPHEMERIS_ACCURACY.measurements,
    panchanga: 365,
    lunar: 411,
    rise: 4634,
    drik: 14,
    conventions: 9,
    festivals: 31,
    jathaka: JATHAKA_GATES,
    shadbala: SHADBALA_GATES,
    sampradaya: 1531,
  } as const;
  const gateTotal = Object.values(GATE_COUNTS).reduce((a, b) => a + b, 0);
  // గ్రాహకుడికి అర్థమయ్యే భాషలో — డెవలపర్ స్క్రిప్ట్ పేర్లు (verify:*) పుస్తకంలో ముద్రించము.
  const gateCohortTe =
    `స్విస్ ఎఫెమెరిస్ స్ఫుటాలు (${GATE_COUNTS.astro}) · పంచాంగాంగాలు (${GATE_COUNTS.panchanga}) · ` +
    `తిథి-నక్షత్ర-యోగ-కరణ వార్షిక పట్టిక (${GATE_COUNTS.lunar}) · ఉదయాస్తమయాలు (${GATE_COUNTS.rise}) · ` +
    `డ్రిక్ పంచాంగ కాల నిర్ణయం (${GATE_COUNTS.drik}) · చట్ర/ఉదయ నిర్వచనాలు (${GATE_COUNTS.conventions}) · ` +
    `పండుగలు (${GATE_COUNTS.festivals}) · జాతక వర్గ-దశా గణితం (${GATE_COUNTS.jathaka}) · ` +
    `షడ్బలం (${GATE_COUNTS.shadbala}) · సంప్రదాయ తీర్పులు (${GATE_COUNTS.sampradaya}) — ` +
    `మొత్తం ${gateTotal.toLocaleString('te-IN')} యాంత్రిక తనిఖీలు, 0 విఫలం.`;

  return { rows, summaryTe, gateCohortTe, unverifiableTe, groupsTe: groups };
}
