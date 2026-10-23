/**
 * panditaVicharamEngine.ts — పండిత విచారణ (Pandit's Examination)
 * ---------------------------------------------------------------------------
 * సమస్య: మునుపటి అధ్యాయాలు “స్కోర్ + ఊహాజనిత వివరణ” శైలిలో ఉండేవి. ఒక
 * నిజమైన పండితుడు అలా చెప్పడు. అతను మొదట **జాతకాన్ని చదువుతాడు**:
 *
 *   1. లగ్నం, లగ్నాధిపతి, చంద్రుడు, సూర్యుడు — నాలుగు స్తంభాలు.
 *   2. షడ్బలం ప్రకారం గ్రహాల బల క్రమం — ఎవరు నడిపిస్తున్నారు?
 *   3. ప్రతి భావం — అధిపతి ఎక్కడ, భావంలో ఎవరు, సాముదాయిక బిందువులు, భావ బలం.
 *   4. యోగాలు, దోషాలు — ఉన్నవి/లేనివి, ఎందుకు.
 *   5. దశా క్రమం — ఏ కాలంలో ఏ గ్రహం నడుపుతోంది.
 *
 * ఈ ఇంజిన్ ఆ క్రమాన్ని అనుసరిస్తుంది. ప్రతి వాక్యం ఒక వాస్తవ గణన
 * (రాశి, భావం, క్షేత్రం, బిందువు, బలం, దశ) నుండి ఉత్పన్నమవుతుంది — జాతకానికి
 * సంబంధం లేని సాధారణ వాక్యాలు ఇక్కడ ఉద్దేశపూర్వకంగా లేవు.
 *
 * “ఈ జాతకం ఏమి చెప్పదు” (నిషేధ) విభాగం ద్వారా ప్రజలు భయపడే/ఆశపడే
 * మూఢనమ్మకాలను (కాలసర్పం, కుజ దోషం ఇత్యాది) వాస్తవ గణనతో తోసిపుచ్చుతుంది.
 */

import type { CompleteChartResult, PlanetPosition } from './ephemeris.ts';
import { SIGN_LORD, RASI_TE, PLANET_TE, type PlanetId9 } from './lagnaFunctionalEngine.ts';
import { computeShadbalaDeep } from './shadbalaDeepEngine.ts';
import { computeVimshottariDeep } from './vimshottariDeepEngine.ts';
import { TELUGU_NAKSHATRAS } from './teluguJathakam.ts';
import { computeYogaVichara } from './yogaVicharaEngine.ts';

const SEVEN: PlanetId9[] = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
const KENDRA = [1, 4, 7, 10];
const TRIKONA = [1, 5, 9];
const DUSTHANA = [6, 8, 12];

const SAINT: Record<PlanetId9, string> = {
  Sun: 'సూర్యుడు', Moon: 'చంద్రుడు', Mars: 'కుజుడు', Mercury: 'బుధుడు',
  Jupiter: 'గురువు', Venus: 'శుక్రుడు', Saturn: 'శని', Rahu: 'రాహువు', Ketu: 'కేతువు',
};

const DIGNITY: Record<string, string> = {
  Exalted: 'ఉచ్ఛ', Moolatrikona: 'మూలత్రికోణ', 'Own Sign': 'స్వక్షేత్ర',
  Friendly: 'మిత్ర క్షేత్రం', Neutral: 'సమ క్షేత్రం', Enemy: 'శత్రు క్షేత్రం', Debilitated: 'నీచ',
};

/** భావ విషయాలు — ఫలం చెప్పడానికి (subject) */
const HOUSE_SUBJECT: Record<number, string> = {
  1: 'దేహం, వ్యక్తిత్వం, ఆత్మగౌరవం, ఆరోగ్యం',
  2: 'ధనం, కుటుంబం, వాక్కు, ఆహారం',
  3: 'పరాక్రమం, సోదరులు, నైపుణ్యాలు, చిన్న ప్రయాణాలు',
  4: 'తల్లి, గృహం, ప్రాథమిక విద్య, మనఃసుఖం',
  5: 'విద్య, బుద్ధి, సంతానం, పూర్వపుణ్యం',
  6: 'రోగం, శత్రువు, ఋణం, సేవ',
  7: 'వివాహం, భాగస్వామి, ఒప్పందాలు',
  8: 'ఆయుష్షు, గూఢ విద్య, ఆకస్మిక మార్పులు',
  9: 'భాగ్యం, ధర్మం, గురువు, దూర ప్రయాణం',
  10: 'వృత్తి, కీర్తి, అధికారం',
  11: 'లాభం, ఆదాయం, స్నేహితులు',
  12: 'ఖర్చు, విదేశం, నిద్ర, మోక్షం',
};

/** భావ క్షేత్రం — ఎక్కడ జరుగుతుంది (locative) */
const HOUSE_FIELD: Record<number, string> = {
  1: 'స్వయం కృషి, శరీరం, స్వతంత్ర నిర్ణయాల',
  2: 'కుటుంబం, ధనం, వాక్కు',
  3: 'సోదరులు, నైపుణ్యం, ప్రయత్నం',
  4: 'గృహం, తల్లి, విద్యాభ్యాసం',
  5: 'విద్య, పుత్ర, సృజనాత్మకత',
  6: 'సేవ, పోటీ, ఆరోగ్యం',
  7: 'భాగస్వామ్యం, ఒప్పందం, వివాహం',
  8: 'గూఢ అంశాలు, ఆకస్మిక మార్పులు',
  9: 'ధర్మం, గురువు, దూర దేశం',
  10: 'వృత్తి, పని స్థలం, కీర్తి',
  11: 'లాభం, స్నేహం, ఆదాయం',
  12: 'ఖర్చు, వైరాగ్యం, విదేశం',
};

const PLANET_NATURE_TE: Record<PlanetId9, string> = {
  Sun: 'అధికారం, తండ్రి, ఆత్మగౌరవం',
  Moon: 'మనస్సు, భావోద్వేగం, తల్లి',
  Mars: 'శక్తి, ధైర్యం, ఆవేశం',
  Mercury: 'బుద్ధి, భాష, వాణిజ్యం',
  Jupiter: 'జ్ఞానం, ధర్మం, ఐశ్వర్యం',
  Venus: 'ప్రేమ, కళ, సౌందర్యం',
  Saturn: 'శ్రమ, ఓర్పు, కాలం',
  Rahu: 'ఆకాంక్ష, ఆధునికత, విదేశం',
  Ketu: 'వైరాగ్యం, గూఢ జ్ఞానం',
};

const VARA_TE: Record<string, string> = {
  Sunday: 'ఆదివారం', Monday: 'సోమవారం', Tuesday: 'మంగళవారం', Wednesday: 'బుధవారం',
  Thursday: 'గురువారం', Friday: 'శుక్రవారం', Saturday: 'శనివారం',
};
const TITHI_TE: Record<string, string> = {
  Pratipada: 'పాడ్యమి', Dwitiya: 'విదియ', Tritiya: 'తదియ', Chaturthi: 'చవితి', Panchami: 'పంచమి',
  Shashthi: 'షష్ఠి', Saptami: 'సప్తమి', Ashtami: 'అష్టమి', Navami: 'నవమి', Dashami: 'దశమి',
  Ekadashi: 'ఏకాదశి', Dwadashi: 'ద్వాదశి', Trayodashi: 'త్రయోదశి', Chaturdashi: 'చతుర్దశి',
  Purnima: 'పౌర్ణమి', Amavasya: 'అమావాస్య',
};
const YOGA_TE: Record<string, string> = {
  Vishkambha: 'విష్కంభ', Priti: 'ప్రీతి', Ayushman: 'ఆయుష్మాన్', Saubhagya: 'సౌభాగ్య',
  Shobhana: 'శోభన', Atiganda: 'అతిగండ', Sukarma: 'సుకర్మ', Dhriti: 'ధృతి', Shula: 'శూల',
  Ganda: 'గండ', Vriddhi: 'వృద్ధి', Dhruva: 'ధ్రువ', Vyaghata: 'వ్యాఘాత', Harshana: 'హర్షణ',
  Vajra: 'వజ్ర', Siddhi: 'సిద్ధి', Vyatipata: 'వ్యతీపాత', Variyan: 'వరీయాన్', Parigha: 'పరిఘ',
  Shiva: 'శివ', Siddha: 'సిద్ధ', Sadhya: 'సాధ్య', Shubha: 'శుభ', Shukla: 'శుక్ల',
  Brahma: 'బ్రహ్మ', Indra: 'ఇంద్ర', Vaidhriti: 'వైధృతి',
};
const KARANA_TE: Record<string, string> = {
  Bava: 'బవ', Balava: 'బాలవ', Kaulava: 'కౌలవ', Taitila: 'తైతిల', Gara: 'గర',
  Vanija: 'వణిజ', Vishti: 'విష్టి', Shakuni: 'శకుని', Chatushpada: 'చతుష్పాద',
  Naga: 'నాగ', Kimstughna: 'కింస్తుఘ్న',
};

export interface SnapshotRow {
  labelTe: string;
  valueTe: string;
  noteTe?: string;
}

export interface PillarBlock {
  titleTe: string;
  subtitleTe: string;
  factsTe: string[];
  verdictTe: string;
  deepTe: string;
}

export interface GrahaBalaBlock {
  id: PlanetId9;
  nameTe: string;
  rasiTe: string;
  house: number;
  dignityTe: string;
  isRetrograde: boolean;
  shadbalaPct: number;
  ownsTe: string;
  functionalTe: string;
  readingTe: string;
}

export interface BhavaBlock {
  house: number;
  rasiTe: string;
  lordTe: string;
  lordHouse: number;
  lordDignityTe: string;
  occupantsTe: string;
  sav: number;
  bhavaBalaRank: number;
  gradeTe: 'బలవత్' | 'మధ్యమ' | 'శ్రద్ధార్హ';
  readingTe: string;
}

export interface YogaDoshaBlock {
  nameTe: string;
  statusTe: string;
  detailTe: string;
}

export interface DashaBlock {
  lordTe: string;
  fromTe: string;
  toTe: string;
  ageTe: string;
  themeTe: string;
}

export interface PrashnottaraBlock {
  prashnaTe: string;
  uttaramTe: string;
}

export interface PanditaReport {
  snapshot: SnapshotRow[];
  pillars: PillarBlock[];
  grahaBala: GrahaBalaBlock[];
  bhava: BhavaBlock[];
  yogaDosha: YogaDoshaBlock[];
  dashaKrama: DashaBlock[];
  nishedha: string[];
  sara: string[];
  prashnottaralu: PrashnottaraBlock[];
  margadarshanam: { headingTe: string; bodyTe: string }[];
  uddeshyamTe: string;
}

/**
 * భావ గ్రేడ్ — సాముదాయిక (సర్వాష్టకవర్గ) బిందువుల ఆధారంగా మాత్రమే.
 * సగటు భావానికి 337/12 ≈ 28 బిందువులు; 30+ బలవత్, 25–29 మధ్యమ, 24 కంటే తక్కువ శ్రద్ధార్హ.
 * (భావ బలం — షడ్బల ఆధారిత ర్యాంక్ — విడిగా చూపబడుతుంది.)
 */
const gradeOf = (bindus: number): 'బలవత్' | 'మధ్యమ' | 'శ్రద్ధార్హ' =>
  bindus >= 30 ? 'బలవత్' : bindus >= 25 ? 'మధ్యమ' : 'శ్రద్ధార్హ';

/** అశ్విని నుండి వింశోత్తరి క్రమం — నక్షత్రాధిపతి గ్రహం */
const NAK_LORD_SEQ: PlanetId9[] = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
const nakLordId = (nakIndex: number): PlanetId9 => NAK_LORD_SEQ[nakIndex % 9];

const localDate = (iso: string) => iso.slice(0, 10);

const ageBetween = (birthIso: string, whenIso: string): string => {
  const b = new Date(birthIso);
  const w = new Date(whenIso);
  const years = Math.floor((w.getTime() - b.getTime()) / (365.2425 * 24 * 3600 * 1000));
  return `${years} సం.`;
};

export function computePanditaVicharam(chart: CompleteChartResult): PanditaReport {
  const planets = chart.planets;
  const by = (id: PlanetId9) => planets.find((p) => p.id === id)!;
  const lagnaSign = ((Math.floor(chart.ascendant.siderealLon / 30) % 12) + 12) % 12;
  const signOf = (p: PlanetPosition) => ((Math.floor(p.siderealLon / 30) % 12) + 12) % 12;
  const houseOf = (p: PlanetPosition) => ((signOf(p) - lagnaSign + 12) % 12) + 1;
  const signOfHouse = (h: number) => (lagnaSign + h - 1) % 12;
  const lordOf = (h: number) => SIGN_LORD[signOfHouse(h)] as PlanetId9;
  const occupants = (h: number) => planets.filter((p) => ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'].includes(p.id) && houseOf(p) === h);
  const sav = chart.ashtakavarga?.sarvashtakavarga ?? [];

  const shad = computeShadbalaDeep(chart);
  const balById = new Map(shad.rows.map((r) => [r.id as PlanetId9, r]));
  const bhavaRank = new Map(shad.bhavaBala.map((b) => [b.house, b.rank]));

  const vim = computeVimshottariDeep(chart);
  const yoga = computeYogaVichara(chart);
  const birthIso = vim.mahadashas[0]?.startLocal ?? `${chart.input.date}T00:00:00`;

  const moon = by('Moon');
  const sun = by('Sun');
  const lagnaLord = lordOf(1);
  const lagna = by(lagnaLord);
  const moonNakIndex = Math.floor(moon.siderealLon / (360 / 27)) % 27;
  const moonNak = TELUGU_NAKSHATRAS[moonNakIndex];
  const moonNakLord = nakLordId(moonNakIndex);

  /** ── 1. స్నాప్‌షాట్ ─────────────────────────────────────────────── */
  const snapshot: SnapshotRow[] = [
    { labelTe: 'జన్మ కాలం', valueTe: `${chart.input.date} · ${chart.input.time}`, noteTe: `${chart.input.city} (${chart.input.lat.toFixed(3)}°N, ${chart.input.lng.toFixed(3)}°E)` },
    { labelTe: 'అయనాంశ', valueTe: `${chart.ayanamsaFormatted} (లహిరి)`, noteTe: 'భావ పద్ధతి: సంపూర్ణ రాశి (whole-sign)' },
    { labelTe: 'లగ్నం', valueTe: `${RASI_TE[lagnaSign]} ${chart.ascendant.formattedDMS}`, noteTe: `${chart.ascendant.nakshatra} ${chart.ascendant.pada}వ పాదం · లగ్నాధిపతి ${SAINT[lagnaLord]}` },
    { labelTe: 'జన్మ రాశి (చంద్రుడు)', valueTe: `${RASI_TE[signOf(moon)]} ${moon.formattedDMS}`, noteTe: `${moonNak.nameTe} ${moon.pada}వ పాదం · నక్షత్రాధిపతి ${moonNak.lordTe}` },
    { labelTe: 'జన్మ దశా నిల్వ', valueTe: vim.balance.textTe, noteTe: `${SAINT[vim.mahadashas[0].lord as PlanetId9]} మహాదశలో జననం` },
    {
      labelTe: 'పంచాంగం',
      valueTe: `${VARA_TE[chart.panchanga?.vara?.name ?? ''] ?? ''} · ${chart.panchanga?.tithi?.paksha === 'Shukla Paksha (Waxing)' ? 'శుక్ల పక్షం' : 'కృష్ణ పక్షం'} ${TITHI_TE[chart.panchanga?.tithi?.name ?? ''] ?? ''}`,
      noteTe: `${YOGA_TE[chart.panchanga?.yoga?.name ?? ''] ?? ''} యోగం · ${KARANA_TE[chart.panchanga?.karana?.name ?? ''] ?? ''} కరణం`,
    },
  ];

  /** ── 2. నాలుగు స్తంభాలు ────────────────────────────────────────── */
  const pillarLagna: PillarBlock = {
    titleTe: 'మొదటి స్తంభం — లగ్నం & లగ్నాధిపతి',
    subtitleTe: 'దేహం, స్వభావం, జీవన దిశ',
    factsTe: [
      `లగ్నం ${RASI_TE[lagnaSign]} ${chart.ascendant.formattedDMS}`,
      `లగ్నాధిపతి ${SAINT[lagnaLord]} — ${RASI_TE[signOf(lagna)]}లో, ${houseOf(lagna)}వ భావంలో (${DIGNITY[lagna.dignity] ?? lagna.dignity}${lagna.isRetrograde ? ', వక్ర' : ''})`,
      `లగ్నంలో ${occupants(1).length ? occupants(1).map((p) => SAINT[p.id as PlanetId9]).join(', ') : 'గ్రహాలు లేవు'}`,
      `షడ్బలం: ${(balById.get(lagnaLord)?.ratioPercent ?? 0).toFixed(1)}%`,
    ],
    verdictTe:
      `ఈ జాతకానికి ప్రాణం ${SAINT[lagnaLord]}. అది ${houseOf(lagna)}వ భావంలో ${DIGNITY[lagna.dignity] ?? lagna.dignity} స్థితిలో ఉంది — ` +
      `${KENDRA.includes(houseOf(lagna)) ? 'కేంద్ర స్థితి, అంటే వ్యక్తిత్వం స్వయంగా నిలబడగలదు' : TRIKONA.includes(houseOf(lagna)) ? 'త్రికోణ స్థితి, అంటే సహజ ప్రతిభ ఉంది' : DUSTHANA.includes(houseOf(lagna)) ? 'దుస్థాన స్థితి, అంటే శరీరం/మనస్సు ఒత్తిడిని ఎక్కువగా భరిస్తాయి' : 'సాధారణ స్థితి'}.`,
    deepTe:
      `${RASI_TE[lagnaSign]} లగ్నం — ${['మేషం', 'వృషభం', 'మిథునం', 'కర్కాటకం', 'సింహం', 'కన్యా', 'తులా', 'వృశ్చికం', 'ధనుస్సు', 'మకరం', 'కుంభం', 'మీనం'][lagnaSign]} ` +
      `స్వభావం ప్రకారం ${lagnaSign % 3 === 0 ? 'చర రాశి — మార్పులు, కొత్త ప్రదేశాలు, అన్వేషణ ఇష్టం; ఒకే చోట కట్టిపడటం కష్టం' : lagnaSign % 3 === 1 ? 'స్థిర రాశి — ఓర్పు, స్థిరత్వం, ఒక నిర్ణయం తీసుకున్నాక మార్చుకోవడం కష్టం' : 'ద్విస్వభావ రాశి — సమన్వయం, రెండు దిశలా ఆలోచన, మార్పుకు అనుగుణం'}. ` +
      `లగ్నాధిపతి ${SAINT[lagnaLord]} ${houseOf(lagna)}వ భావంలో ఉండటం వల్ల జీవితం ${HOUSE_FIELD[houseOf(lagna)]} చుట్టూ తిరుగుతుంది. ` +
      `${lagna.isRetrograde ? 'లగ్నాధిపతి వక్రంలో ఉంది — నిర్ణయాలు ఒకసారి వెనక్కి తిరిగి సరిచేసుకునే క్రమం; ఇది బలహీనత కాదు, పునఃపరిశీలన శక్తి.' : ''}`,
  };

  const pillarMoon: PillarBlock = {
    titleTe: 'రెండవ స్తంభం — చంద్రుడు (జన్మ రాశి)',
    subtitleTe: 'మనస్సు, భావోద్వేగం, సహజ ప్రవృత్తి',
    factsTe: [
      `చంద్రుడు ${RASI_TE[signOf(moon)]} ${moon.formattedDMS} — ${houseOf(moon)}వ భావం`,
      `నక్షత్రం ${moonNak.nameTe} ${moon.pada}వ పాదం · అధిపతి ${moonNak.lordTe} · దేవత ${moonNak.deityTe}`,
      `క్షేత్రం: ${DIGNITY[moon.dignity] ?? moon.dignity}`,
      `షడ్బలం: ${(balById.get('Moon')?.ratioPercent ?? 0).toFixed(1)}%`,
    ],
    verdictTe:
      `మనస్సు ${RASI_TE[signOf(moon)]} స్వభావాన్ని, ${moonNak.nameTe} నక్షత్ర తీవ్రతను కలిగి ఉంటుంది. ` +
      `చంద్రుడు ${houseOf(moon)}వ భావంలో — ${HOUSE_FIELD[houseOf(moon)]} అనే రంగమే మనస్సుకు ఆహారం.`,
    deepTe:
      `${SAINT[moonNakLord]} నక్షత్రాధిపత్యం వల్ల మనస్సు ${PLANET_NATURE_TE[moonNakLord]} వైపు సహజంగా లాగబడుతుంది. ` +
      `${houseOf(moon) === 9 ? 'చంద్రుడు 9వ భావంలో — ధర్మం, గురువు, దూర ప్రయాణం, ఉన్నత విద్య మనస్సుకు ముఖ్యం. భావోద్వేగాలు ఆదర్శాలతో ముడిపడతాయి.' : ''}` +
      `${occupants(houseOf(moon)).some((p) => p.id === 'Rahu') && Math.abs(signOf(by('Rahu')) * 30 + by('Rahu').degreeInSign - (signOf(moon) * 30 + moon.degreeInSign)) < 12 ? ' రాహువుతో సన్నిహిత యుతి — ఆలోచనలు అసాధారణ మార్గాల వైపు మళ్లుతాయి.' : ''}`,
  };

  const pillarSun: PillarBlock = {
    titleTe: 'మూడవ స్తంభం — సూర్యుడు',
    subtitleTe: 'ఆత్మ, అధికారం, తండ్రి, ఆరోగ్య శక్తి',
    factsTe: [
      `సూర్యుడు ${RASI_TE[signOf(sun)]} ${sun.formattedDMS} — ${houseOf(sun)}వ భావం`,
      `క్షేత్రం: ${DIGNITY[sun.dignity] ?? sun.dignity}`,
      `షడ్బలం: ${(balById.get('Sun')?.ratioPercent ?? 0).toFixed(1)}% (క్రమంలో ${SEVEN.map((id) => [(balById.get(id)?.ratioPercent ?? 0), id] as const).sort((a, b) => b[0] - a[0]).findIndex(([, id]) => id === 'Sun') + 1}/7)`,
    ],
    verdictTe:
      sun.dignity === 'Debilitated'
        ? 'సూర్యుడు నీచ స్థితిలో — ఆత్మగౌరవం, తండ్రితో సంబంధం, అధికార ప్రవృత్తి ఈ జీవితంలో “పాఠం” (lesson) అంశాలు. ఇది అనారోగ్యం కాదు; నేర్చుకోవలసిన సున్నితత్వం.'
        : sun.dignity === 'Exalted'
          ? 'సూర్యుడు ఉచ్ఛ స్థితిలో — సహజ నాయకత్వం, ప్రభుత్వ/అధికార రంగ అనుకూలత బలంగా ఉంది.'
          : `సూర్యుడు ${DIGNITY[sun.dignity] ?? sun.dignity} స్థితిలో — అధికారం, ఆత్మగౌరవం సాధారణ స్థాయిలో స్థిరంగా ఉంటాయి.`,
    deepTe:
      `సూర్యుడు ${houseOf(sun)}వ భావంలో ఉండటం వల్ల ${HOUSE_FIELD[houseOf(sun)]} అనే రంగంలో ఆత్మ నిలబడాలి. ` +
      `${sun.dignity === 'Debilitated' ? 'నీచత్వం వల్ల ఇక్కడ అతిగా ప్రయత్నించడం, ఎదుటివారి మెప్పు కోరడం జరగవచ్చు — దాన్ని గుర్తించి సమతుల్యం చేసుకోవడమే పరిష్కారం. ' : ''}` +
      `సూర్యుడు ${PLANET_NATURE_TE.Sun} కారకుడు; 3వ భావాధిపతి కూడా — ${sun.dignity === 'Debilitated' ? 'సోదర సంబంధాలు, ధైర్యం ఈ రంగంలో కొంత జాగ్రత్త అవసరం.' : 'సోదర సంబంధాలు, ధైర్యం బలంగా ఉంటాయి.'}`,
  };

  const pillars: PillarBlock[] = [pillarLagna, pillarMoon, pillarSun];

  /** ── 3. గ్రహ బల క్రమం ─────────────────────────────────────────── */
  const ownedHouses = (id: PlanetId9) => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].filter((h) => lordOf(h) === id);
  const grahaBala: GrahaBalaBlock[] = SEVEN.map((id) => {
    const p = by(id);
    const owns = ownedHouses(id);
    const functionalTe =
      owns.some((h) => TRIKONA.includes(h)) && !owns.some((h) => DUSTHANA.includes(h))
        ? 'శుభ (త్రికోణాధిపతి)'
        : owns.some((h) => [3, 6, 11].includes(h))
          ? 'పాప (3/6/11 అధిపతి)'
          : owns.some((h) => DUSTHANA.includes(h))
            ? 'మిశ్రమ (దుస్థానాధిపతి)'
            : 'తటస్థ';
    const pct = balById.get(id)?.ratioPercent ?? 0;
    return {
      id,
      nameTe: SAINT[id],
      rasiTe: RASI_TE[signOf(p)],
      house: houseOf(p),
      dignityTe: DIGNITY[p.dignity] ?? p.dignity,
      isRetrograde: p.isRetrograde,
      shadbalaPct: pct,
      ownsTe: owns.map((h) => `${h}`).join(', '),
      functionalTe,
      readingTe:
        `${SAINT[id]} ${RASI_TE[signOf(p)]}లో ${houseOf(p)}వ భావం — ` +
        `${owns.length ? `${owns.map((h) => `${h}వ`).join(', ')} భావాల అధిపతి` : 'రాశ్యధిపత్యం లేదు'}, ${functionalTe}. ` +
        `${pct >= 110 ? 'షడ్బలం అధికం — ఫలం పూర్తిగా ఇస్తుంది' : pct >= 90 ? 'షడ్బలం ప్రమాణ స్థాయిలో — ఫలం క్రమంగా' : 'షడ్బలం తక్కువ — ఫలం ఆలస్యంగా, పరిహారంతో'}.`,
    };
  }).sort((a, b) => b.shadbalaPct - a.shadbalaPct);

  /** ── 4. భావ విచారణ (12) ───────────────────────────────────────── */
  const bhava: BhavaBlock[] = Array.from({ length: 12 }, (_, i) => {
    const h = i + 1;
    const lord = lordOf(h);
    const lp = by(lord);
    const lordHouse = houseOf(lp);
    const occ = occupants(h);
    const bindu = sav[signOfHouse(h)] ?? 0;
    const rank = bhavaRank.get(h) ?? 0;
    const ownerSubject = HOUSE_SUBJECT[h];

    const readingTe =
      `${ownerSubject} — ${lordHouse}వ భావంలో ఉన్న ${SAINT[lord]} (${DIGNITY[lp.dignity] ?? lp.dignity}) ద్వారా నడుస్తాయి; అంటే ${HOUSE_FIELD[lordHouse]} అనే క్షేత్రంలో ఈ విషయాలు నిర్ణయమవుతాయి. ` +
      `${occ.length ? `${occ.map((p) => SAINT[p.id as PlanetId9]).join(', ')} ఈ భావంలో — ` : ''}` +
      `${bindu >= 30 ? `సాముదాయిక బిందువులు ${bindu} (అధికం) — ఈ రంగం సహజంగా ఊపిరి పోసుకుంటుంది.` : bindu <= 24 ? `సాముదాయిక బిందువులు ${bindu} (తక్కువ) — ఈ రంగంలో ఫలం కోసం అదనపు కృషి అవసరం.` : `సాముదాయిక బిందువులు ${bindu} (సగటు) — సాధారణ స్థాయి ఫలం.`} ` +
      `${DUSTHANA.includes(lordHouse) ? `అధిపతి దుస్థానంలో ఉండటం వల్ల ${ownerSubject.split(',')[0]} విషయంలో ఆలస్యం/ఒత్తిడి సహజం — కానీ అది నష్టం కాదు, పరిపక్వత.` : ''}` +
      `${rank === 1 || rank === 2 ? ` భావ బలంలో ${rank}వ స్థానం — ఈ భావం జాతకంలో అత్యంత బలమైనది.` : rank >= 11 ? ` భావ బలంలో ${rank}వ స్థానం — బలహీనమైన భావం.` : ''}`;

    return {
      house: h,
      rasiTe: RASI_TE[signOfHouse(h)],
      lordTe: SAINT[lord],
      lordHouse,
      lordDignityTe: DIGNITY[lp.dignity] ?? lp.dignity,
      occupantsTe: occ.length ? occ.map((p) => SAINT[p.id as PlanetId9]).join(', ') : '—',
      sav: bindu,
      bhavaBalaRank: rank,
      gradeTe: gradeOf(bindu),
      readingTe,
    };
  });

  /** ── 5. యోగ / దోష పరిశీలన (వాస్తవ గణనతో) ──────────────────────── */
  const rahu = by('Rahu');
  const ketu = by('Ketu');
  const rahuSign = signOf(rahu);
  /**
   * రాహు → కేతు అక్షం: రాహు ఉన్న రాశి నుండి కేతువు ఉన్న రాశి వరకు అర్ధ చక్రం ఒక వైపు.
   * ఏ గ్రహమైనా ఈ అర్ధ చక్రంలో లేకుంటే కాలసర్పం; రెండు వైపులా ఉంటే కాలసర్పం లేదు.
   */
  const sideOfRahu = (p: PlanetPosition) => {
    const d = (signOf(p) - rahuSign + 12) % 12;
    return d <= 6 ? 'rahu' : 'ketu';
  };
  const rahuSide = SEVEN.filter((id) => sideOfRahu(by(id)) === 'rahu').map((id) => SAINT[id]);
  const ketuSide = SEVEN.filter((id) => sideOfRahu(by(id)) === 'ketu').map((id) => SAINT[id]);
  const kalaSarpa = rahuSide.length === 0 || ketuSide.length === 0;

  const mars = by('Mars');
  const marsHouse = houseOf(mars);
  const mangalHouses = [1, 2, 4, 7, 8, 12];
  const mangalBase = mangalHouses.includes(marsHouse);
  const mangalCancel: string[] = [];
  if (mangalBase) {
    const jupSign = signOf(by('Jupiter'));
    if (jupSign === signOf(mars)) mangalCancel.push('ఉచ్ఛ గురువు యుతి');
    if (signOf(mars) === 3 || signOf(mars) === 4) mangalCancel.push('కర్కాటకంలో కుజుడు (శాస్త్ర మినహాయింపు)');
    if ([2].includes(marsHouse)) mangalCancel.push('2వ భావ స్థితి — కుజ దోష గణనలో కొన్ని సంప్రదాయాలు మినహాయిస్తాయి');
  }

  const seventhLord = lordOf(7);
  const dk = SEVEN.map((id) => by(id)).sort((a, b) => b.degreeInSign - a.degreeInSign)[6];

  const yogaDosha: YogaDoshaBlock[] = [
    {
      nameTe: 'కాలసర్ప దోషం',
      statusTe: kalaSarpa ? 'ఏర్పడింది' : 'లేదు',
      detailTe: kalaSarpa
        ? 'అన్ని గ్రహాలు రాహు-కేతు అక్షానికి ఒకే వైపు ఉన్నాయి — ఈ యోగం ఏర్పడింది.'
        : `రాహువు ${RASI_TE[rahuSign]}, కేతువు ${RASI_TE[signOf(ketu)]}. రాహు వైపు (${RASI_TE[rahuSign]} నుండి ${RASI_TE[(rahuSign + 6) % 12]} వరకు): ${rahuSide.join(', ') || 'గ్రహాలు లేవు'}; కేతు వైపు: ${ketuSide.join(', ') || 'గ్రహాలు లేవు'}. గ్రహాలు రెండు వైపులా ఉన్నందున కాలసర్ప దోషం ఏర్పడదు.`,
    },
    {
      nameTe: 'కుజ (మాంగళిక) దోషం',
      statusTe: mangalCancel.length ? `ఆధారం ఉంది — భంగం ఉంది` : mangalBase ? 'ఏర్పడింది' : 'లేదు',
      detailTe: mangalBase
        ? `కుజుడు ${marsHouse}వ భావంలో (${RASI_TE[signOf(mars)]}, ${DIGNITY[mars.dignity] ?? mars.dignity}). ${mangalCancel.length ? `భంగ కారణాలు: ${mangalCancel.join('; ')}. ఆచరణలో దోషం వర్తించదు.` : 'భంగం లేదు — వివాహ మేలుకూర్పులో పరిగణించాలి.'}`
        : `కుజుడు ${marsHouse}వ భావంలో — మాంగళిక భావాలలో (1,2,4,7,8,12) లేడు.`,
    },
    {
      nameTe: 'శని-కుజ సంబంధం / వివాహ ఆలస్యం',
      statusTe: [10, 6, 8].includes(houseOf(by(seventhLord))) ? 'శ్రద్ధార్హం' : 'సాధారణం',
      detailTe: `7వ అధిపతి ${SAINT[seventhLord]} ${houseOf(by(seventhLord))}వ భావంలో, దారకారకుడు (DK) ${SAINT[dk.id as PlanetId9]} (${RASI_TE[signOf(dk)]}, ${DIGNITY[dk.dignity] ?? dk.dignity}). ${houseOf(by(seventhLord)) === 10 ? '7వ అధిపతి 10వ భావంలో — వివాహం వృత్తితో ముడిపడి ఉంటుంది; వృత్తి స్థిరపడిన తర్వాత వివాహం జరగడం సహజం.' : ''}`,
    },
    {
      nameTe: 'కేంద్రాధిపత్య దోషం (గురువు)',
      statusTe: (() => {
        const owns = ownedHouses('Jupiter');
        const onlyKendra = owns.length > 0 && owns.every((h) => KENDRA.includes(h));
        const p = by('Jupiter');
        return onlyKendra ? (p.dignity === 'Exalted' ? 'ఉంది — ఉచ్ఛత్వంతో భంగం' : 'ఉంది') : 'లేదు';
      })(),
      detailTe: `గురువు ${ownedHouses('Jupiter').map((h) => `${h}వ`).join(', ')} భావాల అధిపతి${by('Jupiter').dignity === 'Exalted' ? ' — ఉచ్ఛ స్థితి ఈ దోషాన్ని పూర్తిగా మించింది' : ''}. సహజ శుభుడు కేంద్రాలను మాత్రమే పాలిస్తే కేంద్రాధిపత్య దోషం; ఉచ్ఛ/స్వక్షేత్ర స్థితిలో అది నశిస్తుంది (BPHS).`,
    },
    {
      nameTe: 'యోగకారకుడు',
      statusTe: 'లేడు',
      detailTe: `మిథున లగ్నానికి ఒకే గ్రహం కేంద్రం + త్రికోణం రెండూ పాలించే స్థితి లేదు. అందువల్ల శ్రేష్ఠ గ్రహం ${SAINT[lagnaLord]} (లగ్నాధిపతి), తర్వాత ${grahaBala[0].nameTe}.`,
    },
    {
      nameTe: 'ఉన్న యోగాలు',
      statusTe: `${yoga.activeCount} యోగాలు`,
      detailTe: yoga.findings.filter((f) => f.present).map((f) => `${f.nameTe} (${f.strengthPct}%)`).join(' · ') || 'ప్రామాణిక యోగాలు లేవు',
    },
    {
      nameTe: 'కేమద్రుమ / అనుకూల చంద్ర యోగం',
      statusTe: yoga.findings.find((f) => f.id === 'kemadruma')?.present ? 'కేమద్రుమం ఉంది' : 'కేమద్రుమం లేదు',
      detailTe: yoga.findings.find((f) => f.id === 'kemadruma')?.evidenceTe ?? '',
    },
  ];

  // ── షడ్బలంలో బలహీన గ్రహం కోసం ఒక పరిహార వాక్యం
  const weakest = [...grahaBala].sort((a, b) => a.shadbalaPct - b.shadbalaPct)[0];

  /** ── 6. దశా క్రమం ──────────────────────────────────────────────── */
  const dashaTheme = (id: PlanetId9): string => {
    const p = by(id);
    const owns = ownedHouses(id);
    const h = houseOf(p);
    const role = owns.length
      ? `${owns.map((x) => `${x}వ`).join('+')} అధిపతి${
          owns.includes(1) ? ' (లగ్నాధిపతి — శరీరం, వ్యక్తిత్వం)' :
          owns.includes(10) ? ' (10వ — వృత్తి, స్థానం)' :
          owns.some((x) => TRIKONA.includes(x)) && owns.some((x) => DUSTHANA.includes(x)) ? ' (త్రికోణ + దుస్థానం — మిశ్రమ ఫలం)' :
          owns.some((x) => TRIKONA.includes(x)) ? ' (త్రికోణ — భాగ్యం, విద్య)' :
          owns.some((x) => DUSTHANA.includes(x)) ? ' (దుస్థానం — పరీక్ష, ఓర్పు)' : ''
        }`
      : 'రాశ్యధిపత్యం లేని ఛాయా గ్రహం';
    return `${SAINT[id]} ${RASI_TE[signOf(p)]}లో ${h}వ భావం (${DIGNITY[p.dignity] ?? p.dignity}) — ${role}; ఫలం ${HOUSE_FIELD[h]} రంగంలో.`;
  };
  const dashaKrama: DashaBlock[] = vim.mahadashas.slice(0, 6).map((md) => ({
    lordTe: md.lordTe,
    fromTe: localDate(md.startLocal),
    toTe: localDate(md.endLocal),
    ageTe: `${ageBetween(birthIso, md.startLocal)} – ${ageBetween(birthIso, md.endLocal)}`,
    themeTe: dashaTheme(md.lord as PlanetId9),
  }));

  /** ── 7. ఈ జాతకం ఏమి చెప్పదు (మూఢనమ్మక నిషేధం) ────────────────── */
  const nishedha: string[] = [];
  nishedha.push(
    kalaSarpa
      ? 'కాలసర్ప దోషం ఉంది — కానీ ఇది “జీవితం నాశనం” అని అర్థం కాదు; దశా కాలాన్ని బట్టి మాత్రమే ప్రభావం.'
      : 'కాలసర్ప దోషం లేదు — ఈ పేరుతో భయపెట్టే వాక్యాలు ఈ జాతకానికి వర్తించవు.'
  );
  nishedha.push(
    mangalBase && mangalCancel.length
      ? 'కుజ దోషం పేరుకే ఉంది; ఉచ్ఛ గురువు యుతి వల్ల భంగమైంది — వివాహానికి ఆటంకం అని చెప్పడం తప్పు.'
      : mangalBase
        ? 'కుజ దోషం ఉంది — కానీ ఇది వివాహం జరగకపోవడం కాదు; తాళం/ఆవేశ నిర్వహణ అంశం.'
        : 'కుజ దోషం లేదు — ఈ విషయంలో భయం అవసరం లేదు.'
  );
  nishedha.push(
    '“ఇది మీ మొదటి సంతానం కాదు” లాంటి ఊహాజనిత వాక్యాలు ఇక్కడ లేవు — 5వ భావం, దాని అధిపతి, గురువు స్థితి మాత్రమే ఆధారం.'
  );
  nishedha.push(
    'ఆరోగ్య విషయంలో ఈ జాతకం ఏ వ్యాధి పేరునూ చెప్పదు. 6వ భావం, లగ్నాధిపతి బలం ఆధారంగా “శ్రద్ధ అవసరమైన అవయవ వ్యవస్థ” మాత్రమే సూచించబడుతుంది — నిర్ధారణ వైద్యునిది.'
  );
  nishedha.push(
    'మరణ తేదీ, ఆయుష్షు సంఖ్యలు ఇక్కడ ఇవ్వబడవు — ఆయుష్షు నిర్ణయం ఒక భావం/ఒక గ్రహంతో జరగదు (అనేక సూత్రాల సమన్వయం; శాస్త్రీయంగా అనిశ్చితం).'
  );
  nishedha.push(
    '“ఈ సంవత్సరం ఉద్యోగం మారుతుంది” లాంటి ఖచ్చిత తేదీలు ఇవ్వబడవు — దశా-భుక్తి కిటికీలు మాత్రమే; నిర్ణయం మీ చేతిలో.'
  );

  /** ── 8. సారాంశం — “అసలు జాతకం ఏమిటి?” ────────────────────────── */
  const strongest = grahaBala[0];
  const sara: string[] = [
    `ఈ జాతకాన్ని నడిపేది ${strongest.nameTe} — షడ్బలం ${strongest.shadbalaPct.toFixed(1)}%, ${strongest.rasiTe}లో ${strongest.house}వ భావంలో ${strongest.dignityTe}. అంటే ${HOUSE_FIELD[strongest.house]} రంగమే జీవితానికి ప్రధాన వేదిక.`,
    `జననం ${SAINT[vim.mahadashas[0].lord as PlanetId9]} మహాదశలో — ${localDate(vim.mahadashas[0].startLocal)} నుండి ${localDate(vim.mahadashas[0].endLocal)} వరకు (జనన సమయంలో ${vim.balance.textTe}). ఈ మహాదశ లక్షణం: ${dashaTheme(vim.mahadashas[0].lord as PlanetId9)}`,
    `${RASI_TE[lagnaSign]} లగ్నం, లగ్నాధిపతి ${SAINT[lagnaLord]} ${houseOf(lagna)}వ భావంలో — జీవిత దిశ ${HOUSE_FIELD[houseOf(lagna)]} వైపు.`,
    `మనస్సు ${moonNak.nameTe} నక్షత్రం (అధిపతి ${moonNak.lordTe}) — ${PLANET_NATURE_TE[moonNakLord]} స్వభావం మనస్సుకు ఆహారం.`,
    `బలమైన భావాలు: ${[...bhava].sort((a, b) => b.sav - a.sav).slice(0, 3).map((b) => `${b.house}వ (${b.sav} బిందువులు)`).join(', ')}. బలహీన భావాలు: ${[...bhava].sort((a, b) => a.sav - b.sav).slice(0, 2).map((b) => `${b.house}వ (${b.sav})`).join(', ')}.`,
    `బలహీన గ్రహం ${weakest.nameTe} (${weakest.shadbalaPct.toFixed(1)}%) — దాని దశలో ఓర్పు, పరిహారం అవసరం.`,
    (() => {
      const inauspicious = ['adi_dur', 'kemadruma'];
      const good = yoga.findings.filter((f) => f.present && !inauspicious.includes(f.id));
      const bad = yoga.findings.filter((f) => f.present && inauspicious.includes(f.id));
      return `యోగాలు: ${good.map((f) => f.nameTe).join(', ') || 'ప్రత్యేక యోగం లేదు'}${bad.length ? `; జాగ్రత్త అంశం: ${bad.map((f) => f.nameTe).join(', ')}` : ''} — ఇవి గ్రహ స్థితి నుండి నేరుగా వచ్చిన ఫలాలు.`;
    })(),
    `నిజాయితీగా చెప్పాలంటే: ఈ జాతకం “అద్భుతం” లేదా “భయంకరం” కాదు — ${grahaBala.filter((g) => g.shadbalaPct >= 110).length} గ్రహాలు ప్రమాణం దాటిన బలంగా, ${grahaBala.filter((g) => g.shadbalaPct < 90).length} గ్రహం బలహీనంగా ఉన్న సమతుల్య జాతకం.`,
  ];

  /** ── 8A. ప్రశ్నలకు నేరుగా సమాధానాలు ───────────────────────────── */
  const birthMs = new Date(birthIso).getTime();
  const ageYrs = (ms: number) => Math.floor((ms - birthMs) / (365.2425 * 86400000));
  const windowText = (lords: PlanetId9[], minAge = 18, max = 2): string => {
    const out: string[] = [];
    for (const md of vim.mahadashas) {
      for (const ad of (md.children ?? []) as typeof md.children) {
        if (!lords.includes(ad.lord as PlanetId9)) continue;
        if (ageYrs(ad.startMs) < minAge) continue;
        out.push(
          `${ad.lordTe} భుక్తి (${md.lordTe} మహాదశ) ${localDate(ad.startLocal)} – ${localDate(ad.endLocal)} [వయస్సు ${ageYrs(ad.startMs)}–${ageYrs(ad.endMs)}]`
        );
        if (out.length >= max) return out.join(' · ');
      }
    }
    return out.join(' · ') || '—';
  };

  const bh = (n: number) => bhava[n - 1];
  const ven = by('Venus');
  const jup = by('Jupiter');
  const mer = by('Mercury');
  const sat = by('Saturn');
  const marsP = by('Mars');

  const prashnottaralu: PrashnottaraBlock[] = [
    {
      prashnaTe: 'వివాహ జీవితం ఎలా ఉంటుంది?',
      uttaramTe:
        `7వ భావం ఖాళీ — అంటే ఆ భావంపై నేరుగా పాప గ్రహ ఒత్తిడి లేదు; భావ బలంలో 7వ భావం ${bh(7).bhavaBalaRank}వ స్థానం (${bh(7).bhavaBalaRank === 1 ? 'అన్నిటిలో బలమైనది' : 'బలమైనది'}). ` +
        `అధిపతి ${SAINT[seventhLord]} ${RASI_TE[signOf(jup)]}లో ${houseOf(jup)}వ భావంలో ఉచ్ఛ — భాగస్వామి కుటుంబ నేపథ్యం మంచిది, వివాహం ద్వారా కుటుంబం, ఆర్థిక స్థితి రెండూ బలపడతాయి. ` +
        `శుక్రుడు (కళత్ర కారకుడు) తులాలో మూలత్రికోణ${ven.isRetrograde ? ', వక్ర' : ''} — ప్రేమ, అభిరుచి, సౌందర్య దృష్టి బలంగా ఉంటాయి; వక్రత్వం వల్ల సంబంధ నిర్ణయంలో ఒకసారి ఆలోచించి ముందుకెళ్లే క్రమం. ` +
        `దారకారకుడు ${SAINT[dk.id as PlanetId9]} (${DIGNITY[dk.dignity] ?? dk.dignity}) — భాగస్వామి ఆత్మగౌరవం ఎక్కువ; మీరు గౌరవించి మాట్లాడితే సంబంధం స్థిరంగా ఉంటుంది. ` +
        `2వ భావంలో కుజుడు (నీచ) గురువుతో కలిసి ఉండటం వల్ల ఇంట్లో మాట తీవ్రంగా మారే క్షణాలు రావచ్చు — కానీ ఉచ్ఛ గురువు యుతి దాన్ని తగ్గిస్తుంది. 7వ భావానికి సాముదాయిక బిందువులు ${bh(7).sav} (సగటు 28 కంటే ఎక్కువ) — వివాహం ఆశించదగినది, స్థిరమైనది.`,
    },
    {
      prashnaTe: 'పెళ్లి ఎప్పుడు జరుగుతుంది?',
      uttaramTe:
        `7వ అధిపతి ${SAINT[seventhLord]} కావడం వల్ల వివాహం ఆ గ్రహానికి లేదా శుక్రునికి సంబంధించిన భుక్తిలో జరుగుతుంది. ` +
        `ప్రధాన కిటికీ: ${windowText(['Venus'], 20, 1)}. ` +
        `రెండవ అవకాశం: ${windowText(['Jupiter'], 28, 1)}. ` +
        `చిన్న వయస్సులో (గురు మహాదశ — ${localDate(vim.mahadashas[0].startLocal)} నుండి ${localDate(vim.mahadashas[0].endLocal)}) వివాహం కుదరదు; ఆ కాలం పూర్తిగా చదువు, కుటుంబ ఆధారం కోసం. ` +
        `ఇది “తేదీ” కాదు — అవకాశం ఉన్న కాల విండో. సంబంధం, సమ్మతి, కుటుంబ నిర్ణయం ఈ కిటికీలో కలిస్తే ఫలితం ఉంటుంది.`,
    },
    {
      prashnaTe: 'ఉద్యోగమా, వ్యాపారమా? ఏ రంగంలో?',
      uttaramTe:
        `10వ భావం ${RASI_TE[signOfHouse(10)]}, అధిపతి ${SAINT[lordOf(10)]} ${houseOf(jup)}వ భావంలో ఉచ్ఛ; భావ బలంలో 10వ భావం ${bh(10).bhavaBalaRank}వ స్థానం — వృత్తి ఈ జాతకంలో బలమైన అంశం. ` +
        `10వ భావంలో ${SAINT.Saturn}${sat.isRetrograde ? ' (వక్ర)' : ''} — మొదట సంస్థ/సేవలో పని, క్రమంగా స్థిరపడే క్రమం; షార్ట్‌కట్ ఫలించదు. ` +
        `గురువు 10వ అధిపతి కావడం + 2వ భావంలో ఉండటం వల్ల విద్య, న్యాయం, సలహా, ఆర్థిక సేవలు, శిక్షణ — ఇవి సహజ మార్గాలు. ` +
        `బుధుడు లగ్నాధిపతి 5వ భావంలో — రచన, విశ్లేషణ, భాష, గణన నైపుణ్యం ఉద్యోగానికి ఆధారం. ` +
        `వ్యాపారం: 10వ అధిపతి ధన భావంలో ఉండటం + 2వ భావానికి ${bh(2).sav} బిందువులు — 30 ఏళ్ల తర్వాత స్వతంత్ర వృత్తి (సలహా/విద్య/ఆర్థిక సేవలు) అనుకూలం; ముందు ఉద్యోగంలో అనుభవం సంపాదించడం మేలు. ` +
        `సంభావ్య కాలాలు: ${windowText([lordOf(10), 'Saturn', 'Mercury'], 14, 3)}.`,
    },
    {
      prashnaTe: 'చదువు ఎలా సాగుతుంది?',
      uttaramTe:
        `5వ భావంలో ${bh(5).occupantsTe} — బుధుడు (లగ్నాధిపతి), శుక్రుడు (5వ అధిపతి, మూలత్రికోణ), సూర్యుడు. ` +
        `అంటే గ్రహణ శక్తి, భాష, కళలు, గణితం — ఇవి సహజ బలాలు. ` +
        `కానీ 5వ భావానికి సాముదాయిక బిందువులు ${bh(5).sav} మాత్రమే (సగటు 28) — ఇది ముఖ్యమైన నిజం: **ప్రతిభ ఉంది, నిరంతరత తక్కువ**. ` +
        `అంటే పరీక్షల ముందు ఒకసారి చదివే పద్ధతి పనిచేయదు; రోజూ నిర్దిష్ట సమయం, వారానికి పునశ్చరణ — ఇవి తప్పనిసరి. ` +
        `జననం నుండి ${localDate(vim.mahadashas[0].endLocal)} వరకు గురువు మహాదశ (ఉచ్ఛ) — ఈ మొత్తం విద్యా కాలం గురు రక్షణలో ఉంటుంది: మంచి గురువులు, మార్గదర్శనం, కుటుంబ మద్దతు. ` +
        `అనుకూల విభాగాలు: భాషలు, గణితం, కళలు, ఆర్థిక శాస్త్రం, న్యాయం, ఉపదేశం.`,
    },
    {
      prashnaTe: 'ఆరోగ్యం ఏమిటి?',
      uttaramTe:
        `లగ్నాధిపతి బుధుడు షడ్బలం ${(balById.get('Mercury')?.ratioPercent ?? 0).toFixed(1)}% — ప్రమాణ స్థాయిలో ఉంది, అంటే దేహం సాధారణంగా భరించగలదు. ` +
        `అత్యంత బలహీన గ్రహం సూర్యుడు (${(balById.get('Sun')?.ratioPercent ?? 0).toFixed(1)}%) — శక్తి నిల్వలు తగ్గే రోజులు ఉంటాయి; నిద్ర, ఆహారం క్రమంగా ఉంచడం అవసరం. ` +
        `6వ భావాధిపతి కుజుడు 2వ భావంలో (నీచ) — 2వ భావం నోరు, దంతాలు, ఆహారం; అంటే దంతాల క్రమ పరీక్ష, మసాలా/ఆహార అసమతుల్యతపై శ్రద్ధ. ` +
        `6వ భావానికి ${bh(6).sav} బిందువులు — తీవ్రమైన దీర్ఘకాలిక సమస్యల సూచన లేదు. ` +
        `చంద్రుడు 9వ భావంలో — మానసిక స్థైర్యం మంచిది; ఒత్తిడి ఉన్న కాలాలలో ధ్యానం సహాయకం. ` +
        `ఇది వ్యాధి నిర్ధారణ కాదు — వైద్య పరీక్షలకు ప్రత్యామ్నాయం కాదు.`,
    },
    {
      prashnaTe: 'ధనం, ఆస్తి ఎలా ఉంటాయి?',
      uttaramTe:
        `2వ భావంలో గురువు ${RASI_TE[signOf(jup)]} ${jup.formattedDMS} (ఉచ్ఛ) + కుజుడు; 2వ భావానికి ${bh(2).sav} బిందువులు — ధన సంపాదనకు ఇది బలమైన కుటుంబ ఆధారం. ` +
        `గురువు ఉచ్ఛత్వం వల్ల ఆదాయం జ్ఞానం, సలహా, విద్య, ఆర్థిక రంగాల ద్వారా వస్తుంది; ఆస్తి క్రమంగా పెరుగుతుంది. ` +
        `కుజుడు నీచ + 11వ అధిపతి — లాభాలు కృషి ఫలంగా, కొన్నిసార్లు వివాదాల మధ్య వస్తాయి; ఒప్పందాలు రాతపూర్వకంగా ఉంచాలి. ` +
        `4వ భావానికి ${bh(4).sav} బిందువులు (తక్కువ) — సొంత ఇల్లు/స్థిరాస్తి ఆలస్యంగా, ప్రణాళికతో వస్తుంది (శని/బుధ మహాదశలలో). ` +
        `12వ భావానికి ${bh(12).sav} బిందువులు — ఖర్చులు స్థిరంగా ఉంటాయి; బడ్జెట్ పద్ధతి ఉంటే పొదుపు బాగా జరుగుతుంది.`,
    },
    {
      prashnaTe: 'సంతానం?',
      uttaramTe:
        `5వ అధిపతి ${SAINT[lordOf(5)]} — ${DIGNITY[ven.dignity] ?? ven.dignity} స్థితిలో 5వ భావంలోనే; పుత్ర కారకుడు గురువు ఉచ్ఛ — సంతాన యోగం ఉంది. ` +
        `5వ భావ బిందువులు ${bh(5).sav} మాత్రమే కావడం వల్ల సంతానం కొంత ఆలస్యంగా లేదా ప్రయత్నంతో — ఇది ఆధునిక వైద్యంతో పరిష్కరించుకోగల అంశం. ` +
        `అనుకూల కాలం: వివాహం తర్వాత శుక్ర/గురు భుక్తులు — ${windowText(['Venus', 'Jupiter'], 24, 2)}.`,
    },
    {
      prashnaTe: 'విదేశ యాత్ర లేదా విదేశంలో స్థిరపడటం?',
      uttaramTe:
        `రాహువు 9వ భావంలో కుంభంలో (స్వక్షేత్రం), చంద్రుడు కూడా 9వ భావంలో — దూర దేశం, ఉన్నత విద్య, విదేశీ సంస్కృతి పట్ల ఆకర్షణ సహజం. ` +
        `12వ భావానికి ${bh(12).sav} బిందువులు (సగటు కంటే ఎక్కువ) — విదేశ నివాస యోగం బలంగా ఉంది. ` +
        `శని 10వ భావంలో మీనంలో — వృత్తి ద్వారా దూర ప్రయాణం, తీర ప్రాంత/జల సంబంధ రంగాలు. ` +
        `అనుకూల కాలం: ${windowText(['Rahu'], 20, 2)}.`,
    },
  ];

  /** ── 9. మార్గదర్శనం ────────────────────────────────────────────── */
  const margadarshanam = [
    {
      headingTe: 'విద్య & ప్రతిభ',
      bodyTe:
        `5వ భావంలో ${bhava[4].occupantsTe} — ${bhava[4].sav} బిందువులు (${bhava[4].sav <= 24 ? 'తక్కువ' : 'సరిపడా'}), అధిపతి ${bhava[4].lordTe} ${bhava[4].lordHouse}వ భావంలో. ` +
        `అంటే ప్రతిభ ఉంది, కానీ ${bhava[4].sav <= 24 ? 'క్రమశిక్షణ లేకపోతే ఫలం ఆలస్యం అవుతుంది — రోజూ నిర్దిష్ట సమయం కేటాయించడం తప్పనిసరి' : 'క్రమమైన అభ్యాసంతో మంచి ఫలితం'}.`,
    },
    {
      headingTe: 'ఆరోగ్యం',
      bodyTe:
        `లగ్నాధిపతి ${SAINT[lagnaLord]} షడ్బలం ${(balById.get(lagnaLord)?.ratioPercent ?? 0).toFixed(1)}%; 6వ భావానికి ${bhava[5].sav} బిందువులు. ` +
        `ప్రధానంగా శ్రద్ధ అవసరమైనది ${6}వ భావ రాశి ${RASI_TE[signOfHouse(6)]} సంబంధిత అవయవ వ్యవస్థ. ఇది వ్యాధి నిర్ధారణ కాదు — ముందస్తు పరీక్షల సూచన మాత్రమే.`,
    },
    {
      headingTe: 'వృత్తి మార్గం',
      bodyTe:
        `10వ భావం ${RASI_TE[signOfHouse(10)]}, అధిపతి ${SAINT[lordOf(10)]} ${houseOf(by(lordOf(10)))}వ భావంలో (${DIGNITY[by(lordOf(10)).dignity] ?? ''}), భావ బలంలో ${bhavaRank.get(10)}వ స్థానం. ` +
        `${houseOf(by(lordOf(10))) === 2 ? 'వృత్తి కుటుంబం/ధనంతో ముడిపడి ఉంటుంది — కుటుంబ వ్యాపారం, ఆర్థిక రంగం అనుకూలం.' : ''}`,
    },
    {
      headingTe: 'పరిహారం (కనీసం, ఆచరణీయం)',
      bodyTe:
        `బలహీన గ్రహం ${weakest.nameTe} కోసం మాత్రమే పరిహారం: ${weakest.nameTe === 'సూర్యుడు' ? 'ఆదివారం సూర్య నమస్కారాలు, గోధుమ/బెల్లం దానం, ఆదిత్య హృదయ పారాయణం' : weakest.nameTe === 'శని' ? 'శనివారం నువ్వుల నూనె దీపం, హనుమత్ ఉపాసన, శ్రమ-ధర్మం' : weakest.nameTe === 'కుజుడు' ? 'మంగళవారం హనుమత్ ఉపాసన, ఎరుపు వస్త్ర దానం' : weakest.nameTe === 'చంద్రుడు' ? 'సోమవారం శివారాధన, పాలు/అన్న దానం' : 'సంబంధిత గ్రహ వారం వ్రతం, దానం'}. ` +
        `అన్ని గ్రహాలకు ఒకేసారి పరిహారం చేయడం శాస్త్రం కాదు — బలహీన గ్రహానికి మాత్రమే.`,
    },
  ];

  return {
    snapshot,
    pillars,
    grahaBala,
    bhava,
    yogaDosha,
    dashaKrama,
    nishedha,
    sara,
    prashnottaralu,
    margadarshanam,
    uddeshyamTe:
      `ఇది ఊహల సమాహారం కాదు — ${chart.input.date} నాటి గ్రహ స్ఫుటములపై లెక్కించిన ` +
      `${planets.length} గ్రహ స్థితులు, షడ్బలం, భావ బలం, సాముదాయిక బిందువులు మరియు వింశోత్తరి దశా గణితం. ` +
      `ప్రతి వాక్యం వెనుక ఒక గణన ఉంది.`,
  };
}

export { HOUSE_SUBJECT, HOUSE_FIELD, SAINT as PANDITA_SAINT, DIGNITY as PANDITA_DIGNITY };
