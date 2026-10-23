/**
 * yogaVicharaEngine.ts — యోగ విచారణ (Yoga Vichara)
 * ---------------------------------------------------------------------------
 * 116-పుటల ప్రామాణిక తెలుగు జాతక పత్రికలో "యోగ విచారణ" అనే ప్రత్యేక అధ్యాయం
 * ఉంటుంది. కేవలం గ్రహ స్థితి చెప్పడం కాదు — ఏ గ్రహాలు కలిసి ఏ *యోగాన్ని*
 * ఏర్పరుస్తున్నాయి, ఆ యోగం ఎంత బలంగా ఉంది, దాని ఫలం ఏమిటి అనేది
 * శాస్త్రీయ సూత్రంతో సహా వివరించడం.
 *
 * ఇక్కడ లెక్కించే యోగాలు (మూల గ్రంథాలు క్రింద ఇవ్వబడ్డాయి):
 *   • పంచ మహాపురుష యోగాలు — రుచక (కుజ), భద్ర (బుధ), హంస (గురు),
 *     మాళవ్య (శుక్ర), శశ (శని) — BPHS, చాణక్య నీతి శ్లోకం
 *   • గజకేసరి — చంద్రుని నుండి కేంద్రంలో గురువు — జాతక పారిజాతం
 *   • బుధాదిత్య — సూర్య-బుధ యుతి (బుధుడు మౌఢ్యం కాకూడదు)
 *   • చంద్ర-మంగళ — చంద్ర, కుజ యుతి/పరస్పర దృష్టి
 *   • అమల — చంద్ర/లగ్నం నుండి 10వ భావంలో కేవలం శుభ గ్రహం
 *   • సరస్వతి — గురు, శుక్ర, బుధ లు కేంద్ర/త్రికోణ/2వ భావంలో
 *   • లక్ష్మీ — 9వ అధిపతి స్వక్షేత్ర/ఉచ్ఛలో కేంద్ర-త్రికోణంలో
 *   • విపరీత రాజయోగం — హర్ష / సరళ / విమల (6-8-12 అధిపతుల వ్యత్యయం)
 *   • నీచభంగ రాజయోగం — నీచ గ్రహానికి భంగం (4 ప్రామాణిక నియమాలు)
 *   • కేమద్రుమ — చంద్రునికి 2/12 భావాలలో గ్రహం లేకపోవడం + భంగం
 *   • చంద్ర యోగాలు — సునఫా / అనఫా / దురుధురా
 *   • సూర్య యోగాలు — వేశి / వాసి / ఉభయచరి, ఆది / దుర్ యోగం
 *   • ధన యోగం, రాజ యోగం — 2/11 మరియు కేంద్ర-త్రికోణ అధిపతుల సంబంధం
 *
 * బల నిర్ణయం: యోగం ఏర్పడటం (presence) వేరు, దాని *బలం* వేరు. ఇక్కడ ప్రతి
 * యోగానికి 0–100 శాతం బలం ఇవ్వబడుతుంది — క్షేత్ర బలం (ఉచ్ఛ/మూలత్రికోణ/
 * స్వక్షేత్ర), కేంద్ర స్థితి, మౌఢ్యం / నీచత్వం, వక్రత్వం, దృష్టి — ఇవి
 * పరిగణనలోకి తీసుకోబడతాయి. ఇది "ఉంది/లేదు" అనే ద్వంద్వ సమాధానం కంటే
 * చాలా ఉపయోగకరం, ఎందుకంటే బలహీన యోగం ఫలం ఆలస్యంగా, పరిమితంగా ఇస్తుంది.
 */

import type { CompleteChartResult, PlanetPosition } from './ephemeris.ts';
import { SIGN_LORD, RASI_TE, PLANET_TE, type PlanetId9 } from './lagnaFunctionalEngine.ts';

const SEVEN: PlanetId9[] = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
const KENDRA = [1, 4, 7, 10];
const TRIKONA = [1, 5, 9];

/** ఉచ్ఛ రాశులు (0 = మేషం) */
const EXALT_SIGN: Partial<Record<PlanetId9, number>> = {
  Sun: 0, Moon: 1, Mars: 9, Mercury: 5, Jupiter: 3, Venus: 11, Saturn: 6,
};
/** స్వక్షేత్ర రాశులు */
const OWN_SIGNS: Partial<Record<PlanetId9, number[]>> = {
  Sun: [4], Moon: [3], Mars: [0, 7], Mercury: [2, 5], Jupiter: [8, 11],
  Venus: [1, 6], Saturn: [9, 10],
};

const DIGNITY_TE: Record<string, string> = {
  Exalted: 'ఉచ్ఛ',
  Moolatrikona: 'మూలత్రికోణ',
  'Own Sign': 'స్వక్షేత్ర',
  Friendly: 'మిత్ర క్షేత్రం',
  Neutral: 'సమ క్షేత్రం',
  Enemy: 'శత్రు క్షేత్రం',
  Debilitated: 'నీచ',
};

const signOf = (p: PlanetPosition) => ((Math.floor(p.siderealLon / 30) % 12) + 12) % 12;
const degInSign = (p: PlanetPosition) => ((p.siderealLon % 30) + 30) % 30;
const houseFrom = (fromSign: number, toSign: number) => ((toSign - fromSign + 12) % 12) + 1;
const isKendra = (h: number) => KENDRA.includes(h);
const isTrikona = (h: number) => TRIKONA.includes(h);

/** పూర్ణ పరాశరీ దృష్టి (రాశి ఆధారితం) — యోగ నిర్ణయానికి సరిపోతుంది */
function aspectsSign(from: PlanetId9, fromSign: number, toSign: number): boolean {
  const d = houseFrom(fromSign, toSign);
  if (d === 1) return false;
  if (d === 7) return true;
  if (from === 'Mars') return d === 4 || d === 8;
  if (from === 'Jupiter') return d === 5 || d === 9;
  if (from === 'Saturn') return d === 3 || d === 10;
  return false;
}

export type YogaTier = 'raja' | 'dhana' | 'mahapurusha' | 'chandra' | 'surya' | 'dosha' | 'general';

export interface YogaFinding {
  id: string;
  nameTe: string;
  nameEn: string;
  tier: YogaTier;
  /** యోగం ఏర్పడిందా */
  present: boolean;
  /** 0–100 — ఏర్పడిన యోగం బలం */
  strengthPct: number;
  strengthTe: string;
  /** ఏ గ్రహాలు/రాశులు/భావాలు ఈ యోగాన్ని ఏర్పరిచాయి */
  evidenceTe: string;
  /** శాస్త్ర సూత్రం (గ్రంథం పేరుతో) */
  sutraTe: string;
  /** ఫలితం — సులభ తెలుగులో వివరణ */
  phalamTe: string;
  /** బలహీనత లేదా దోషం ఉన్నప్పుడు జాగ్రత్త / పరిహారం */
  cautionTe?: string;
}

export interface YogaVicharaReport {
  findings: YogaFinding[];
  activeCount: number;
  rajaYogaCount: number;
  dhanaYogaCount: number;
  dashaLordYogas: { planetTe: string; yogasTe: string[] }[];
  summaryTe: string;
  verdictTe: string;
}

const pct = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
const strengthLabel = (n: number) =>
  n >= 80 ? 'పూర్ణ బలం' : n >= 60 ? 'మంచి బలం' : n >= 40 ? 'మధ్యమ బలం' : n > 0 ? 'బలహీనం' : '—';

const listTe = (arr: string[]) => arr.filter(Boolean).join(', ');

export function computeYogaVichara(chart: CompleteChartResult): YogaVicharaReport {
  const planets = chart.planets;
  const byId = (id: PlanetId9) => planets.find((p) => p.id === id)!;
  const lagnaSign = Math.floor(chart.ascendant.siderealLon / 30) % 12;
  const moon = byId('Moon');
  const moonSign = signOf(moon);
  const sun = byId('Sun');

  const houseOf = (p: PlanetPosition) => houseFrom(lagnaSign, signOf(p));
  const inSameSign = (a: PlanetPosition, b: PlanetPosition) => signOf(a) === signOf(b);

  /** క్షేత్ర బలం → 0..100 */
  const dignityScore = (p: PlanetPosition): number => {
    switch (p.dignity) {
      case 'Exalted': return 100;
      case 'Moolatrikona': return 90;
      case 'Own Sign': return 80;
      case 'Friendly': return 62;
      case 'Neutral': return 50;
      case 'Enemy': return 32;
      case 'Debilitated': return 12;
      default: return 45;
    }
  };

  /** గ్రహ మౌఢ్యం (సూర్యుని నుండి నిర్దిష్ట కోణం లోపు) */
  const combustLimit: Partial<Record<PlanetId9, number>> = {
    Moon: 12, Mars: 17, Mercury: 14, Jupiter: 11, Venus: 10, Saturn: 15,
  };
  const isCombust = (id: PlanetId9): boolean => {
    const limit = combustLimit[id];
    if (!limit || id === 'Sun') return false;
    const p = byId(id);
    let d = Math.abs(((p.siderealLon - sun.siderealLon + 540) % 360) - 180);
    d = 180 - d; // సూర్యుని నుండి కోణీయ దూరం
    return d <= limit;
  };

  const findings: YogaFinding[] = [];
  const add = (f: YogaFinding) => findings.push(f);

  // ── 1. పంచ మహాపురుష యోగాలు ───────────────────────────────────────────
  const MAHAPURUSHA: { id: PlanetId9; nameTe: string; nameEn: string }[] = [
    { id: 'Mars', nameTe: 'రుచక యోగం', nameEn: 'Ruchaka Yoga' },
    { id: 'Mercury', nameTe: 'భద్ర యోగం', nameEn: 'Bhadra Yoga' },
    { id: 'Jupiter', nameTe: 'హంస యోగం', nameEn: 'Hamsa Yoga' },
    { id: 'Venus', nameTe: 'మాళవ్య యోగం', nameEn: 'Malavya Yoga' },
    { id: 'Saturn', nameTe: 'శశ యోగం', nameEn: 'Shasha Yoga' },
  ];
  const MAHAPURUSHA_PHALAM: Record<string, string> = {
    Mars: 'ధైర్యం, నాయకత్వం, భూ-ఆస్తి, సాహస వృత్తులు (రక్షణ, ఇంజనీరింగ్, క్రీడ). శత్రు భయం తక్కువ; శరీరంలో తేజస్సు ఎక్కువ.',
    Mercury: 'చురుకైన బుద్ధి, వాక్చాతుర్యం, గణిత-వాణిజ్య ప్రజ్ఞ, దీర్ఘాయుష్షు. రచన, విశ్లేషణ, ఉపదేశ రంగాలలో విజయం.',
    Jupiter: 'ధర్మబుద్ధి, గురుత్వం, ఆధ్యాత్మిక శ్రద్ధ, సమాజ గౌరవం. విద్య, న్యాయ, మత-శిక్షణ రంగాలలో ఉన్నతి.',
    Venus: 'సౌందర్య దృష్టి, కళా ప్రజ్ఞ, సుఖ-సౌకర్యాలు, వాహన-గృహ సంపద. సామరస్యపూర్వక దాంపత్యం.',
    Saturn: 'సహనం, క్రమశిక్షణ, దీర్ఘకాల పోరాట పటిమ, ప్రజా-సేవా శక్తి. ఆలస్యమైనా స్థిరమైన ఉన్నతి.',
  };
  for (const m of MAHAPURUSHA) {
    const p = byId(m.id);
    const h = houseOf(p);
    const own = (OWN_SIGNS[m.id] ?? []).includes(signOf(p));
    const strong = p.dignity === 'Exalted' || p.dignity === 'Moolatrikona' || own;
    const present = strong && isKendra(h);
    const strength = present
      ? pct(
          0.55 * dignityScore(p) +
            0.25 * (h === 1 || h === 10 ? 100 : 85) +
            0.2 * (isCombust(m.id) ? 25 : p.isRetrograde ? 70 : 85)
        )
      : 0;
    add({
      id: `mahapurusha_${m.id.toLowerCase()}`,
      nameTe: m.nameTe,
      nameEn: m.nameEn,
      tier: 'mahapurusha',
      present,
      strengthPct: strength,
      strengthTe: strengthLabel(strength),
      evidenceTe: present
        ? `${PLANET_TE[m.id]} ${RASI_TE[signOf(p)]}లో (${DIGNITY_TE[p.dignity] ?? p.dignity}) ${h}వ భావంలో — కేంద్ర స్థితి.`
        : `${PLANET_TE[m.id]} ${RASI_TE[signOf(p)]}లో ${h}వ భావం — ${strong ? 'కేంద్రంలో లేదు' : 'క్షేత్ర బలం సరిపోదు'}, కాబట్టి యోగం పూర్తిగా ఏర్పడలేదు.`,
      sutraTe: 'బృహత్ పరాశర హోరా శాస్త్రం — “స్వోచ్ఛే స్వక్షేత్రే కేంద్రే చ మహాపురుష యోగః”.',
      phalamTe: present
        ? MAHAPURUSHA_PHALAM[m.id]
        : 'ఈ గ్రహం తన స్వభావ ఫలాలు సాధారణ స్థాయిలో ఇస్తుంది; మహాపురుష యోగ తీవ్రత ఉండదు.',
      cautionTe:
        present && isCombust(m.id)
          ? `${PLANET_TE[m.id]} మౌఢ్యంలో ఉంది — యోగ ఫలం ఆలస్యంగా, తగ్గిన పరిమాణంలో వస్తుంది.`
          : undefined,
    });
  }

  // ── 2. గజకేసరి యోగం ─────────────────────────────────────────────────
  {
    const jup = byId('Jupiter');
    const hFromMoon = houseFrom(moonSign, signOf(jup));
    const present = isKendra(hFromMoon);
    const sep = Math.abs(((jup.siderealLon - moon.siderealLon + 540) % 360) - 180);
    const orbFactor = Math.max(0.45, 1 - sep / 180);
    const strength = present ? pct(0.45 * dignityScore(jup) + 0.35 * orbFactor * 100 + 0.2 * 80) : 0;
    add({
      id: 'gajakesari',
      nameTe: 'గజకేసరి యోగం',
      nameEn: 'Gajakesari Yoga',
      tier: 'raja',
      present,
      strengthPct: strength,
      strengthTe: strengthLabel(strength),
      evidenceTe: present
        ? `గురువు ${RASI_TE[signOf(jup)]}లో, చంద్రుని నుండి ${hFromMoon}వ భావంలో (కేంద్రం).`
        : `గురువు చంద్రుని నుండి ${hFromMoon}వ భావంలో — కేంద్రం కాదు.`,
      sutraTe: 'జాతక పారిజాతం — “కేంద్రే చంద్రాత్ గురౌ సతి గజకేసరి యోగః”.',
      phalamTe: present
        ? 'కీర్తి, ప్రజ్ఞ, విద్య, సత్ప్రవర్తన, ఉన్నత గౌరవం. ముఖ్యంగా విద్యా-ఉపదేశ రంగాలలో పేరు; ధనం క్రమంగా పెరుగుతుంది.'
        : 'గజకేసరి లేదు; గురువు ఫలం దశా కాలంలో మాత్రమే కనిపిస్తుంది.',
      cautionTe: present && (jup.dignity === 'Debilitated' || isCombust('Jupiter'))
        ? 'గురువు నీచ/మౌఢ్య స్థితిలో ఉన్నాడు — యోగం పేరు మాత్రమే, ఫలం తగ్గుతుంది.'
        : undefined,
    });
  }

  // ── 3. బుధాదిత్య యోగం ───────────────────────────────────────────────
  {
    const mer = byId('Mercury');
    const present = inSameSign(sun, mer);
    const combust = isCombust('Mercury');
    const strength = present
      ? pct(0.5 * (combust ? 40 : 90) + 0.3 * dignityScore(mer) + 0.2 * (houseOf(mer) === 1 || houseOf(mer) === 10 ? 95 : 75))
      : 0;
    add({
      id: 'budhaditya',
      nameTe: 'బుధాదిత్య యోగం',
      nameEn: 'Budha-Aditya Yoga',
      tier: 'raja',
      present,
      strengthPct: strength,
      strengthTe: strengthLabel(strength),
      evidenceTe: present
        ? `సూర్యుడు, బుధుడు ఇద్దరూ ${RASI_TE[signOf(sun)]}లో (${houseOf(sun)}వ భావం)${combust ? ' — బుధుడు మౌఢ్యంలో' : ' — బుధుడు మౌఢ్యం కాదు'}.`
        : `సూర్యుడు ${RASI_TE[signOf(sun)]}, బుధుడు ${RASI_TE[signOf(mer)]} — వేరువేరు రాశులు.`,
      sutraTe: 'బృహత్ పరాశర హోరా శాస్త్రం — సూర్య-బుధ యుతి (మౌఢ్య భంగంతో బలం తగ్గుతుంది).',
      phalamTe: present
        ? 'చురుకైన మేధస్సు, ప్రభుత్వ-ఆఫీసు సంబంధాలు, వ్రాత-గణన నైపుణ్యం. ఉద్యోగం, విద్య, నిర్వహణలో గుర్తింపు.'
        : 'బుధ-సూర్య కలయిక లేదు; నిర్ణయ శక్తి స్వతంత్రంగా పనిచేస్తుంది.',
      cautionTe: present && combust
        ? 'బుధుడు సూర్యుని మౌఢ్య పరిధిలో ఉన్నాడు — మేధ ఉన్నా వ్యక్తీకరణలో సందిగ్ధత; వృత్తిలో మార్పులు సహజం.'
        : undefined,
    });
  }

  // ── 4. చంద్ర-మంగళ యోగం ──────────────────────────────────────────────
  {
    const mars = byId('Mars');
    const conjunct = inSameSign(moon, mars);
    const mutual = aspectsSign('Mars', signOf(mars), moonSign) && aspectsSign('Moon', moonSign, signOf(mars));
    const present = conjunct || mutual;
    const strength = present
      ? pct(0.45 * dignityScore(mars) + 0.35 * dignityScore(moon) + 0.2 * (conjunct ? 100 : 80))
      : 0;
    add({
      id: 'chandra_mangala',
      nameTe: 'చంద్ర-మంగళ యోగం',
      nameEn: 'Chandra-Mangala Yoga',
      tier: 'dhana',
      present,
      strengthPct: strength,
      strengthTe: strengthLabel(strength),
      evidenceTe: present
        ? `చంద్రుడు ${RASI_TE[moonSign]}, కుజుడు ${RASI_TE[signOf(mars)]} — ${conjunct ? 'యుతి' : 'పరస్పర పూర్ణ దృష్టి'}.`
        : `చంద్రుడు ${RASI_TE[moonSign]}, కుజుడు ${RASI_TE[signOf(mars)]} — యుతి/పరస్పర దృష్టి లేదు.`,
      sutraTe: 'సారావళి — చంద్ర-కుజ సంబంధం ధనార్జన యోగం (కుజుడు లగ్నాధిపతి అయితే చాలా బలం).',
      phalamTe: present
        ? 'ధనార్జనా వేగం, వ్యాపార చాతుర్యం, ఆస్తి కలిగించే శక్తి. ఖర్చు కూడా ఎక్కువ; ధనం ఉన్నా నిల్వ కష్టం.'
        : 'ఈ యోగం లేదు; ధనాగమనం దశా-నక్షత్ర అనుసారం.',
      cautionTe: present
        ? 'కోపాన్ని, ఆవేశపూరిత నిర్ణయాలను అదుపులో ఉంచాలి; ధన నిర్వహణలో క్రమశిక్షణ అవసరం.'
        : undefined,
    });
  }

  // ── 5. అమల యోగం ────────────────────────────────────────────────────
  {
    const benefic: PlanetId9[] = ['Jupiter', 'Venus', 'Mercury', 'Moon'];
    const malefic: PlanetId9[] = ['Sun', 'Mars', 'Saturn'];
    const checkAmala = (fromSign: number) => {
      const tenthSign = (fromSign + 9) % 12;
      const there = SEVEN.filter((id) => signOf(byId(id)) === tenthSign);
      const onlyBenefic = there.length > 0 && there.every((id) => benefic.includes(id));
      return { there, onlyBenefic, tenthSign };
    };
    const fromLagna = checkAmala(lagnaSign);
    const fromMoon = checkAmala(moonSign);
    const present = fromLagna.onlyBenefic || fromMoon.onlyBenefic;
    const used = fromLagna.onlyBenefic ? fromLagna : fromMoon;
    const strength = present
      ? pct(70 + Math.min(30, used.there.reduce((a, id) => a + dignityScore(byId(id)), 0) / used.there.length / 4))
      : 0;
    add({
      id: 'amala',
      nameTe: 'అమల యోగం',
      nameEn: 'Amala Yoga',
      tier: 'raja',
      present,
      strengthPct: strength,
      strengthTe: strengthLabel(strength),
      evidenceTe: present
        ? `${RASI_TE[used.tenthSign]} (${fromLagna.onlyBenefic ? 'లగ్నం' : 'చంద్రుని'} నుండి 10వ భావం) లో కేవలం శుభ గ్రహాలు: ${listTe(used.there.map((id) => PLANET_TE[id]))} — పాప గ్రహం లేదు.`
        : '10వ భావంలో కేవలం శుభ గ్రహాలు అనే నియమం నెరవేరలేదు.',
      sutraTe: 'జాతక పారిజాతం — “దశమే శుభా చేద్ అమలా యోగః” (శాశ్వత కీర్తి).',
      phalamTe: present
        ? 'శాశ్వత కీర్తి, మంచి పేరు, నిజాయితీ ప్రతిష్ఠ. ఎవరూ కించపరచలేని స్థాయి; సేవా-ధర్మ రంగాలలో గుర్తింపు.'
        : 'అమల యోగం లేదు; కీర్తి వ్యక్తిగత కృషి ఫలం.',
    });
  }

  // ── 6. సరస్వతి యోగం ─────────────────────────────────────────────────
  {
    const ju = byId('Jupiter');
    const ve = byId('Venus');
    const me = byId('Mercury');
    const okHouse = (h: number) => isKendra(h) || isTrikona(h) || h === 2;
    const strongJup = ['Exalted', 'Moolatrikona', 'Own Sign', 'Friendly'].includes(ju.dignity);
    const present = okHouse(houseOf(ju)) && okHouse(houseOf(ve)) && okHouse(houseOf(me)) && strongJup;
    const strength = present
      ? pct((dignityScore(ju) + dignityScore(ve) + dignityScore(me)) / 3 + 5)
      : 0;
    add({
      id: 'saraswati',
      nameTe: 'సరస్వతి యోగం',
      nameEn: 'Saraswati Yoga',
      tier: 'raja',
      present,
      strengthPct: strength,
      strengthTe: strengthLabel(strength),
      evidenceTe: present
        ? `గురువు (${houseOf(ju)}), శుక్రుడు (${houseOf(ve)}), బుధుడు (${houseOf(me)}) — ముగ్గురూ కేంద్ర/త్రికోణ/2వ భావాలలో; గురువు ${DIGNITY_TE[ju.dignity] ?? ju.dignity}.`
        : `గురు ${houseOf(ju)}వ, శుక్ర ${houseOf(ve)}వ, బుధ ${houseOf(me)}వ భావంలో — ముగ్గురూ అనుకూల స్థానాలలో లేరు.`,
      sutraTe: 'బృహత్ పరాశర హోరా శాస్త్రం — గురు-శుక్ర-బుధ కేంద్ర/త్రికోణ స్థితి = సరస్వతి యోగం.',
      phalamTe: present
        ? 'విద్య, కళలు, సాహిత్యం, వక్తృత్వం, శాస్త్ర జ్ఞానం — ఇవి సహజ సిద్ధి. రచన, ఉపదేశం, సంగీతం, భాషలలో విశేష ప్రతిభ.'
        : 'సరస్వతి యోగం పూర్తిగా లేదు; బుధుడు-శుక్రుడు దశలలో విద్యా ఫలం విశేషం.',
    });
  }

  // ── 7. లక్ష్మీ యోగం ─────────────────────────────────────────────────
  {
    const ninthSign = (lagnaSign + 8) % 12;
    const ninthLordId = SIGN_LORD[ninthSign] as PlanetId9;
    const ninthLord = byId(ninthLordId);
    const lagnaLord = byId(SIGN_LORD[lagnaSign] as PlanetId9);
    const h = houseOf(ninthLord);
    const ownExalt = ['Exalted', 'Moolatrikona', 'Own Sign'].includes(ninthLord.dignity);
    const present =
      ownExalt && (isKendra(h) || isTrikona(h)) && lagnaLord.dignity !== 'Debilitated';
    const strength = present
      ? pct(0.5 * dignityScore(ninthLord) + 0.3 * (h === 9 || h === 10 ? 95 : 80) + 0.2 * dignityScore(lagnaLord))
      : 0;
    add({
      id: 'lakshmi',
      nameTe: 'లక్ష్మీ యోగం',
      nameEn: 'Lakshmi Yoga',
      tier: 'dhana',
      present,
      strengthPct: strength,
      strengthTe: strengthLabel(strength),
      evidenceTe: `9వ భావాధిపతి ${PLANET_TE[ninthLordId]} ${RASI_TE[signOf(ninthLord)]}లో (${DIGNITY_TE[ninthLord.dignity] ?? ninthLord.dignity}), ${h}వ భావంలో; లగ్నాధిపతి ${PLANET_TE[SIGN_LORD[lagnaSign] as PlanetId9]} — ${DIGNITY_TE[lagnaLord.dignity] ?? lagnaLord.dignity}.`,
      sutraTe: 'జాతక పారిజాతం — “లగ్నేశే బలిని, భాగ్యేశే స్వోచ్ఛే కేంద్రే చ లక్ష్మీ యోగః”.',
      phalamTe: present
        ? 'ధన, భాగ్య, స్థిరాస్తి, వాహన, కీర్తి — అన్నీ కలిసి వచ్చే యోగం. పైకి వెళ్లే క్రమంలో మంచి సమయాలు ఎక్కువగా ఉంటాయి.'
        : 'లక్ష్మీ యోగం పూర్తిగా ఏర్పడలేదు; ధనం క్రమానుగతంగా, కృషి ఫలంగా వస్తుంది.',
      cautionTe: present
        ? '9వ అధిపతి బలవంతుడైనప్పుడు ధర్మ-సంబంధిత ఖర్చులకు వెనుకాడకూడదు — అవి తిరిగి ఎక్కువగా వస్తాయి.'
        : undefined,
    });
  }

  // ── 8. విపరీత రాజయోగం (హర్ష / సరళ / విమల) ──────────────────────────
  {
    const lords = [6, 8, 12].map((hn) => {
      const signIdx = (lagnaSign + hn - 1) % 12;
      return { house: hn, lordId: SIGN_LORD[signIdx] as PlanetId9 };
    });
    const vipareeta: string[] = [];
    for (const l of lords) {
      const p = byId(l.lordId);
      const h = houseOf(p);
      if ([6, 8, 12].includes(h) && h !== l.house) {
        const name = l.house === 6 ? 'హర్ష యోగం' : l.house === 8 ? 'సరళ యోగం' : 'విమల యోగం';
        vipareeta.push(`${name} (${l.house}వ అధిపతి ${PLANET_TE[l.lordId]} ${h}వ భావంలో)`);
      }
    }
    const present = vipareeta.length > 0;
    const strength = present ? pct(65 + Math.min(30, vipareeta.length * 12)) : 0;
    add({
      id: 'vipareeta_raja',
      nameTe: 'విపరీత రాజయోగం',
      nameEn: 'Vipareeta Raja Yoga',
      tier: 'raja',
      present,
      strengthPct: strength,
      strengthTe: strengthLabel(strength),
      evidenceTe: present
        ? vipareeta.join(' · ')
        : '6/8/12 భావాధిపతులలో ఎవరూ ఇతర దుస్థానంలో లేరు.',
      sutraTe: 'బృహత్ పరాశర హోరా శాస్త్రం — దుస్థానాధిపతి దుస్థానాంతర స్థితి = విపరీత రాజయోగం.',
      phalamTe: present
        ? 'శత్రు, రోగ, ఋణ, నష్టాల నుండి ఆశ్చర్యకరమైన రక్షణ. సంక్షోభాల్లో మేలు — ఎదుటివారు కూలినప్పుడు మీరు నిలబడతారు. దుస్థాన ప్రభావం “మలుపు” అవుతుంది.'
        : 'విపరీత రాజయోగం లేదు; 6-8-12 భావాలను దశా కాలంలో పరిశీలించాలి.',
      cautionTe: present
        ? 'ఈ యోగం “కష్టం ద్వారానే లాభం” అని అర్థం — ఒత్తిడిని ఉపేక్షించకుండా, జాగ్రత్తగా ఉపయోగించుకోవాలి.'
        : undefined,
    });
  }

  // ── 9. నీచభంగ రాజయోగం ───────────────────────────────────────────────
  {
    const debilitated = SEVEN.filter((id) => byId(id).dignity === 'Debilitated');
    const bhangaReasons: string[] = [];
    for (const id of debilitated) {
      const p = byId(id);
      const dispositor = SIGN_LORD[signOf(p)] as PlanetId9;
      const dispo = byId(dispositor);
      const exaltLordSign = EXALT_SIGN[id];
      const exaltLord = exaltLordSign != null ? (SIGN_LORD[exaltLordSign] as PlanetId9) : null;
      const navamsaExalted = p.d9Sign === EXALT_SIGN[id];
      // రాశ్యధిపతి లగ్నం/చంద్రుని నుండి కేంద్రంలో ఉండాలి. రాశ్యధిపతి స్వయం చంద్రుడైతే
      // "చంద్రుని నుండి 1వ భావం" అనేది అప్రయోజనకరం — ఆ నియమాన్ని వదిలేస్తాము.
      const r1 =
        isKendra(houseFrom(lagnaSign, signOf(dispo))) ||
        (dispositor !== 'Moon' && isKendra(houseFrom(moonSign, signOf(dispo))));
      const r2 = exaltLord ? isKendra(houseFrom(lagnaSign, signOf(byId(exaltLord)))) : false;
      const r3 = dispo.dignity === 'Exalted' || dispo.dignity === 'Own Sign' || dispo.dignity === 'Moolatrikona';
      if (r1 || r2 || r3 || navamsaExalted) {
        const why = [
          r1 ? `రాశ్యధిపతి ${PLANET_TE[dispositor]} కేంద్రంలో` : '',
          r2 && exaltLord ? `ఉచ్ఛాధిపతి ${PLANET_TE[exaltLord]} కేంద్రంలో` : '',
          r3 ? `రాశ్యధిపతి బలవంతుడు (${DIGNITY_TE[dispo.dignity] ?? dispo.dignity})` : '',
          navamsaExalted ? 'నవాంశలో ఉచ్ఛత్వం' : '',
        ]
          .filter(Boolean)
          .join(', ');
        bhangaReasons.push(`${PLANET_TE[id]} నీచభంగం — ${why}`);
      }
    }
    const present = bhangaReasons.length > 0;
    const strength = present ? pct(60 + Math.min(30, bhangaReasons.length * 15)) : 0;
    add({
      id: 'neecha_bhanga',
      nameTe: 'నీచభంగ రాజయోగం',
      nameEn: 'Neecha Bhanga Raja Yoga',
      tier: 'raja',
      present,
      strengthPct: strength,
      strengthTe: strengthLabel(strength),
      evidenceTe:
        debilitated.length === 0
          ? 'ఏ గ్రహం నీచ స్థితిలో లేదు — భంగం అవసరం లేదు.'
          : present
            ? bhangaReasons.join(' · ')
            : `నీచ గ్రహం: ${listTe(debilitated.map((id) => PLANET_TE[id]))} — భంగ నియమాలు నెరవేరలేదు.`,
      sutraTe: 'బృహత్ పరాశర హోరా శాస్త్రం — నీచ గ్రహ రాశ్యధిపతి కేంద్రంలో ఉంటే నీచభంగం.',
      phalamTe: present
        ? 'అవమానం తర్వాత ఉన్నతి — మొదట కష్టం, తర్వాత అనుకోని లాభం, అధికారం. ఈ యోగం ఉన్నవారు ఓటమి నుండి వేగంగా లేస్తారు.'
        : debilitated.length
          ? 'నీచ గ్రహ ప్రభావం భంగం లేకుండా ఉంది — ఆ గ్రహ దశలలో ఓర్పు అవసరం.'
          : 'నీచ గ్రహం లేదు; ఈ అంశంలో ప్రత్యేక యోగం లేదు.',
    });
  }

  // ── 10. కేమద్రుమ యోగం (దోషం + భంగం) ────────────────────────────────
  {
    const secondFromMoon = (moonSign + 1) % 12;
    const twelfthFromMoon = (moonSign + 11) % 12;
    const others = SEVEN.filter((id) => id !== 'Moon');
    const inSecond = others.filter((id) => signOf(byId(id)) === secondFromMoon);
    const inTwelfth = others.filter((id) => signOf(byId(id)) === twelfthFromMoon);
    const conjunctMoon = others.filter((id) => signOf(byId(id)) === moonSign);
    const raw = inSecond.length === 0 && inTwelfth.length === 0 && conjunctMoon.length === 0;
    const jup = byId('Jupiter');
    const cancellation: string[] = [];
    if (conjunctMoon.length) cancellation.push(`చంద్రునితో ${listTe(conjunctMoon.map((id) => PLANET_TE[id]))}`);
    if (isKendra(houseFrom(moonSign, signOf(jup)))) cancellation.push('గురువు చంద్రుని నుండి కేంద్రంలో');
    if (others.some((id) => aspectsSign(id, signOf(byId(id)), moonSign) && id === 'Jupiter'))
      cancellation.push('గురు దృష్టి చంద్రునిపై');
    const present = raw && cancellation.length === 0;
    add({
      id: 'kemadruma',
      nameTe: 'కేమద్రుమ యోగం / దోషం',
      nameEn: 'Kemadruma Yoga',
      tier: 'dosha',
      present,
      strengthPct: present ? 70 : 0,
      strengthTe: present ? 'దోషం పూర్తిగా ఉంది' : 'భంగం ఉంది / లేదు',
      evidenceTe: raw
        ? `చంద్రునికి 2వ (${RASI_TE[secondFromMoon]}) మరియు 12వ (${RASI_TE[twelfthFromMoon]}) భావాలలో గ్రహాలు లేవు, చంద్రునితో యుతి లేదు.${
            cancellation.length ? ` భంగం: ${cancellation.join(', ')}.` : ''
          }`
        : `చంద్రునికి ${inSecond.length ? `2వ భావంలో ${listTe(inSecond.map((id) => PLANET_TE[id]))}` : ''}${
            inTwelfth.length ? ` 12వ భావంలో ${listTe(inTwelfth.map((id) => PLANET_TE[id]))}` : ''
          } — కేమద్రుమం ఏర్పడదు.`,
      sutraTe: 'బృహత్ పరాశర హోరా శాస్త్రం — చంద్రునికి 2/12 భావ శూన్యత = కేమద్రుమం; గురు కేంద్ర దృష్టి భంగం.',
      phalamTe: present
        ? 'మనోలోలత, ఒంటరితన భావం, ఆర్థిక హెచ్చుతగ్గులు, ప్రారంభ కాలంలో సహాయం తక్కువ. క్రమశిక్షణ, ఆధ్యాత్మిక అభ్యాసం ద్వారా ఇది బలంగా మారుతుంది.'
        : 'కేమద్రుమ దోషం భంగమైంది — మానసిక స్థైర్యం, సహాయ సహకారాలు సాధారణ స్థాయిలో ఉంటాయి.',
      cautionTe: present
        ? 'పరిహారం: సోమవారం ఉపవాసం, శివారాధన, చంద్ర రత్నం (ముత్యం) — మానసిక స్థైర్యానికి; ఒంటరిగా ఉండే సమయాలలో సృజనాత్మక పనులు చేయడం మేలు.'
        : undefined,
    });
  }

  // ── 11. చంద్ర యోగాలు: సునఫా / అనఫా / దురుధురా ───────────────────────
  {
    const secondFromMoon = (moonSign + 1) % 12;
    const twelfthFromMoon = (moonSign + 11) % 12;
    const exclSunMoon: PlanetId9[] = ['Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
    const inSecond = exclSunMoon.filter((id) => signOf(byId(id)) === secondFromMoon);
    const inTwelfth = exclSunMoon.filter((id) => signOf(byId(id)) === twelfthFromMoon);
    const durudhara = inSecond.length > 0 && inTwelfth.length > 0;
    const sunapha = inSecond.length > 0 && inTwelfth.length === 0;
    const anapha = inTwelfth.length > 0 && inSecond.length === 0;
    const present = durudhara || sunapha || anapha;
    const names = durudhara
      ? 'దురుధురా యోగం'
      : sunapha
        ? 'సునఫా యోగం'
        : anapha
          ? 'అనఫా యోగం'
          : 'చంద్ర యోగం (సునఫా/అనఫా/దురుధురా)';
    const strength = present ? pct(65 + (durudhara ? 20 : 8)) : 0;
    add({
      id: 'chandra_yoga',
      nameTe: names,
      nameEn: 'Sunapha / Anapha / Durudhara',
      tier: 'chandra',
      present,
      strengthPct: strength,
      strengthTe: strengthLabel(strength),
      evidenceTe: present
        ? `చంద్రునికి 2వ భావంలో ${inSecond.length ? listTe(inSecond.map((id) => PLANET_TE[id])) : 'ఎవరూ లేరు'}, 12వ భావంలో ${
            inTwelfth.length ? listTe(inTwelfth.map((id) => PLANET_TE[id])) : 'ఎవరూ లేరు'
          }.`
        : 'చంద్రునికి 2/12 భావాలలో సూర్యుడు తప్ప మరే గ్రహం లేదు (కేమద్రుమ స్థితి).',
      sutraTe: 'బృహత్ పరాశర హోరా శాస్త్రం — చంద్రునికి 2వ భావ గ్రహం సునఫా, 12వ భావ గ్రహం అనఫా, రెండూ ఉంటే దురుధురా.',
      phalamTe: present
        ? durudhara
          ? 'ఇరువైపులా గ్రహ సహాయం — ధనార్జన, సౌఖ్యం, మంచి సమాజ బంధాలు. నిర్ణయాలలో సమతుల్యత.'
          : sunapha
            ? 'స్వయం కృషితో ధనం, ఆత్మవిశ్వాసం, స్థిరమైన సంపద. స్వతంత్ర నిర్ణయాలు ఫలిస్తాయి.'
            : 'అనఫా — సౌజన్యం, కీర్తి, ఇతరుల సహాయం; కుటుంబ బంధాలు బలంగా ఉంటాయి.'
        : 'చంద్ర యోగం లేదు; మానసిక స్థితి గ్రహ దశలపై ఆధారపడుతుంది.',
    });
  }

  // ── 12. సూర్య యోగాలు: వేశి / వాసి / ఉభయచరి ─────────────────────────
  {
    const sunSign = signOf(sun);
    const exclSunMoon2: PlanetId9[] = ['Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
    const inSecond = exclSunMoon2.filter((id) => signOf(byId(id)) === (sunSign + 1) % 12);
    const inTwelfth = exclSunMoon2.filter((id) => signOf(byId(id)) === (sunSign + 11) % 12);
    const ubhaya = inSecond.length > 0 && inTwelfth.length > 0;
    const vesi = inSecond.length > 0 && inTwelfth.length === 0;
    const vasi = inTwelfth.length > 0 && inSecond.length === 0;
    const present = ubhaya || vesi || vasi;
    const strength = present ? pct(60 + (ubhaya ? 25 : 10)) : 0;
    add({
      id: 'surya_yoga',
      nameTe: ubhaya ? 'ఉభయచరి యోగం' : vesi ? 'వేశి యోగం' : vasi ? 'వాసి యోగం' : 'వేశి / వాసి / ఉభయచరి',
      nameEn: 'Vesi / Vasi / Ubhayachari',
      tier: 'surya',
      present,
      strengthPct: strength,
      strengthTe: strengthLabel(strength),
      evidenceTe: present
        ? `సూర్యునికి 2వ భావంలో ${inSecond.length ? listTe(inSecond.map((id) => PLANET_TE[id])) : 'ఎవరూ లేరు'}, 12వ భావంలో ${
            inTwelfth.length ? listTe(inTwelfth.map((id) => PLANET_TE[id])) : 'ఎవరూ లేరు'
          }.`
        : 'సూర్యునికి 2/12 భావాలలో (చంద్రుడు తప్ప) గ్రహాలు లేవు.',
      sutraTe: 'బృహత్ పరాశర హోరా శాస్త్రం — సూర్యునికి 2వ భావ గ్రహం వేశి, 12వ భావ గ్రహం వాసి, రెండూ ఉంటే ఉభయచరి.',
      phalamTe: present
        ? ubhaya
          ? 'ప్రభుత్వ/అధికార సంబంధ అనుకూలం, ఇరువైపుల మద్దతు, స్థిరమైన స్థానం.'
          : 'ఆత్మవిశ్వాసం, స్వతంత్ర ప్రయత్నం, సమాజంలో గుర్తింపు; శ్రమకు తగిన ఫలం.'
        : 'సూర్య యోగం లేదు; నాయకత్వ ఫలం దశా కాలంపై ఆధారపడుతుంది.',
    });
  }

  // ── 13. ధన యోగం ─────────────────────────────────────────────────────
  {
    const lord2 = byId(SIGN_LORD[(lagnaSign + 1) % 12] as PlanetId9);
    const lord11 = byId(SIGN_LORD[(lagnaSign + 10) % 12] as PlanetId9);
    const lord5 = byId(SIGN_LORD[(lagnaSign + 4) % 12] as PlanetId9);
    const lord9 = byId(SIGN_LORD[(lagnaSign + 8) % 12] as PlanetId9);
    const linked = (a: PlanetPosition, b: PlanetPosition) => {
      if (signOf(a) === signOf(b)) return 'యుతి';
      const ha = houseFrom(signOf(a), signOf(b));
      if (isKendra(ha) || isTrikona(ha)) return `${ha}వ భావ స్థితి`;
      if (aspectsSign(a.id as PlanetId9, signOf(a), signOf(b))) return 'దృష్టి';
      return '';
    };
    const pairs: string[] = [];
    const p1 = linked(lord2, lord11);
    const p2 = linked(lord5, lord9);
    if (p1) pairs.push(`2వ అధిపతి ${PLANET_TE[lord2.id as PlanetId9]} ↔ 11వ అధిపతి ${PLANET_TE[lord11.id as PlanetId9]} — ${p1}`);
    if (p2) pairs.push(`5వ అధిపతి ${PLANET_TE[lord5.id as PlanetId9]} ↔ 9వ అధిపతి ${PLANET_TE[lord9.id as PlanetId9]} — ${p2}`);
    const present = pairs.length > 0;
    const strength = present ? pct(65 + pairs.length * 12) : 0;
    add({
      id: 'dhana_yoga',
      nameTe: 'ధన యోగం',
      nameEn: 'Dhana Yoga',
      tier: 'dhana',
      present,
      strengthPct: strength,
      strengthTe: strengthLabel(strength),
      evidenceTe: present
        ? pairs.join(' · ')
        : `2వ అధిపతి (${RASI_TE[(lagnaSign + 1) % 12]}), 11వ అధిపతి (${RASI_TE[(lagnaSign + 10) % 12]}) మధ్య ప్రత్యక్ష సంబంధం లేదు.`,
      sutraTe: 'ఫలదీపిక — 2వ-11వ అధిపతుల సంబంధం, 5వ-9వ (త్రికోణ) అధిపతుల సంబంధం ధన యోగం.',
      phalamTe: present
        ? 'సంపద వృద్ధి, పొదుపు శక్తి, పెట్టుబడులలో మంచి నిర్ణయాలు. ఆదాయం బహుళ మార్గాల నుండి.'
        : 'ప్రత్యక్ష ధన యోగం లేదు; ఆదాయం శ్రమ-ఫలంగా, క్రమంగా పెరుగుతుంది.',
    });
  }

  // ── 14. రాజ యోగం (కేంద్ర + త్రికోణ అధిపతుల సంబంధం) ─────────────────
  {
    const kendraLords = [1, 4, 7, 10].map((hn) => SIGN_LORD[(lagnaSign + hn - 1) % 12] as PlanetId9);
    const trikonaLords = [5, 9].map((hn) => SIGN_LORD[(lagnaSign + hn - 1) % 12] as PlanetId9);
    const found: string[] = [];
    for (const k of Array.from(new Set(kendraLords))) {
      for (const t of Array.from(new Set(trikonaLords))) {
        if (k === t) {
          found.push(`యోగకారకుడు ${PLANET_TE[k]} (కేంద్ర + త్రికోణ అధిపతి)`);
          continue;
        }
        const a = byId(k);
        const b = byId(t);
        if (signOf(a) === signOf(b)) found.push(`${PLANET_TE[k]} + ${PLANET_TE[t]} యుతి`);
        else if (aspectsSign(k, signOf(a), signOf(b)) && aspectsSign(t, signOf(b), signOf(a)))
          found.push(`${PLANET_TE[k]} ↔ ${PLANET_TE[t]} పరస్పర దృష్టి`);
      }
    }
    const present = found.length > 0;
    const strength = present ? pct(70 + Math.min(25, found.length * 10)) : 0;
    add({
      id: 'raja_yoga',
      nameTe: 'రాజ యోగం',
      nameEn: 'Raja Yoga (Kendra-Trikona)',
      tier: 'raja',
      present,
      strengthPct: strength,
      strengthTe: strengthLabel(strength),
      evidenceTe: present ? found.join(' · ') : 'కేంద్ర మరియు త్రికోణ అధిపతుల మధ్య సంబంధం లేదు.',
      sutraTe: 'బృహత్ పరాశర హోరా శాస్త్రం — కేంద్రాధిపతి, త్రికోణాధిపతి యుతి/దృష్టి రాజ యోగం.',
      phalamTe: present
        ? 'అధికారం, ఉన్నత స్థానం, సమాజ గౌరవం. క్రమశిక్షణతో కలిసి ఉన్నప్పుడు ఈ యోగం పాలనా స్థాయి వరకు తీసుకెళ్తుంది.'
        : 'రాజ యోగం లేదు; ఉన్నతి క్రమంగా, కృషి ద్వారా వస్తుంది.',
    });
  }

  // ── 15. ఆది / దుర్ యోగం (సూర్యునికి 6-7-8 భావాలు) ───────────────────
  {
    const benefic: PlanetId9[] = ['Jupiter', 'Venus', 'Mercury', 'Moon'];
    const sunSign = signOf(sun);
    const around = SEVEN.filter((id) => {
      const h = houseFrom(sunSign, signOf(byId(id)));
      return h === 6 || h === 7 || h === 8;
    });
    const onlyBenefic = around.length > 0 && around.every((id) => benefic.includes(id));
    const onlyMalefic = around.length > 0 && around.every((id) => !benefic.includes(id));
    const present = onlyBenefic || onlyMalefic;
    add({
      id: 'adi_dur',
      nameTe: onlyBenefic ? 'ఆది యోగం' : onlyMalefic ? 'దుర్ యోగం' : 'ఆది / దుర్ యోగం',
      nameEn: 'Adi / Dur Yoga',
      tier: 'surya',
      present,
      strengthPct: present ? 72 : 0,
      strengthTe: present ? strengthLabel(72) : '—',
      evidenceTe:
        around.length === 0
          ? 'సూర్యునికి 6/7/8 భావాలలో గ్రహాలు లేవు.'
          : `సూర్యునికి 6-7-8 భావాలలో: ${listTe(around.map((id) => PLANET_TE[id]))} — ${
              onlyBenefic ? 'అందరూ శుభులు' : onlyMalefic ? 'అందరూ పాపులు' : 'శుభ-పాప మిశ్రమం'
            }.`,
      sutraTe: 'బృహత్ పరాశర హోరా శాస్త్రం — సూర్య 6-7-8లో కేవలం శుభులు ఆది యోగం, కేవలం పాపులు దుర్ యోగం.',
      phalamTe: onlyBenefic
        ? 'ఆరోగ్యం, ఆత్మవిశ్వాసం, సమాజ మద్దతు; ప్రారంభ జీవితంలో మంచి సహాయం.'
        : onlyMalefic
          ? 'పోరాటమే జీవిత శైలి — ఒత్తిడి ఎక్కువ, కానీ ఓర్పు అసాధారణం. ఆరోగ్యంపై శ్రద్ధ అవసరం.'
          : 'శుభ-పాప మిశ్రమం; ఫలం దశా కాలంపై ఆధారపడుతుంది.',
    });
  }

  // ── ఇంటెక్స్: దశా అధిపతుల యోగాలు ────────────────────────────────────
  const dashaLordYogas = SEVEN.map((id) => ({
    planetTe: PLANET_TE[id],
    yogasTe: findings.filter((f) => f.present && f.evidenceTe.includes(PLANET_TE[id])).map((f) => f.nameTe),
  })).filter((d) => d.yogasTe.length > 0);

  const active = findings.filter((f) => f.present);
  const rajaYogaCount = active.filter((f) => f.tier === 'raja').length;
  const dhanaYogaCount = active.filter((f) => f.tier === 'dhana').length;

  const top = [...active].sort((a, b) => b.strengthPct - a.strengthPct).slice(0, 3);
  const summaryTe =
    active.length === 0
      ? 'ఈ కుండలిలో ప్రామాణిక శాస్త్ర యోగాలు గుర్తించదగిన స్థాయిలో లేవు — ఫలితాలు గ్రహ స్థితి, దశా కాలం ఆధారంగా నిర్ణయించబడతాయి.'
      : `మొత్తం ${active.length} యోగాలు గుర్తించబడ్డాయి — అందులో ${rajaYogaCount} రాజయోగాలు, ${dhanaYogaCount} ధన యోగాలు. బలంగా ఉన్నవి: ${listTe(
          top.map((t) => `${t.nameTe} (${t.strengthPct}%)`)
        )}.`;
  const verdictTe =
    rajaYogaCount >= 2
      ? 'రాజయోగ సముదాయం బలంగా ఉంది — ఉన్నతి, అధికారం, గుర్తింపు సంభావ్యత ఎక్కువ. క్రమశిక్షణతో ఈ యోగాలు పూర్తిగా ఫలిస్తాయి.'
      : rajaYogaCount === 1
        ? 'ఒక రాజయోగం ఉంది — స్థిరమైన ఉన్నతి. దాని దశా కాలంలో అవకాశాలను ఉపయోగించుకోవడం ముఖ్యం.'
        : active.length > 0
          ? 'ప్రత్యక్ష రాజయోగం లేదు; ధన/చంద్ర యోగాల ద్వారా స్థిరమైన అభివృద్ధి ఉంటుంది.'
          : 'ప్రత్యేక యోగాలు తక్కువ — కృషి, దశా కాలం ఆధారంగా ఫలితం నిర్ణయమవుతుంది.';

  return { findings, activeCount: active.length, rajaYogaCount, dhanaYogaCount, dashaLordYogas, summaryTe, verdictTe };
}
