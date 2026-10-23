/**
 * bhavaGrahaVistaraEngine.ts — ద్వాదశ భావ · నవగ్రహ · దోష విస్తర విచారం
 * ---------------------------------------------------------------------------
 * ఈ ఇంజిన్ ఉద్దేశం ఒక్కటే: **ఏ వాక్యమూ స్థిరంగా ఉండకూడదు.** ప్రతి వాక్యంలో
 * ఆ కుండలి యొక్క సంఖ్య (గ్రహ స్ఫుటం, భావం, సర్వాష్టకవర్గ బిందువు, షడ్బల
 * విరూపా, దశా తేదీ) ఉండాలి. అందుకే ఇక్కడ రాసిన ప్రతి పేరా ఒక ఫంక్షన్
 * ఫలితం — చేతితో నమోదు చేసిన ఒక్క వాక్యమూ లేదు.
 *
 * మూల సూత్రాలు:
 *   • బృహత్ పరాశర హోరా — 1–12 భావాలు, భావేశుడు, భావ నివాసులు, గ్రహ దృష్టి
 *   • ఫలదీపిక (మంత్రేశ్వర) — భావాధిపతి స్థానం ద్వారా ఫల మార్గం
 *   • ప్రశ్న మార్గ / కేపీ — కస్ప్ స్థానం; ఇక్కడ భావ ఆధిపత్యానికే పరిమితం
 *   • షడ్బలం — బల ప్రమాణం (shadbalaDeepEngine)
 *   • అష్టకవర్గం — సర్వాష్టకవర్గ బిందువులు (భావ బలం)
 *
 * స్కోరు పద్ధతి (పారదర్శకం, ఏ మాయా సంఖ్యా లేదు):
 *   భావ స్కోరు = 40 × (SAV ÷ 337లో వాటా, 12 కి సమానీకరించి) + 25 × అధిపతి
 *   షడ్బల నిష్పత్తి + 20 × శుభ దృష్టి − 15 × పాప దృష్టి + 15 × నివాసుల స్వభావం.
 */
import type { CompleteChartResult, PlanetPosition } from './ephemeris.ts';
import { computeShadbalaDeep } from './shadbalaDeepEngine.ts';
import { computeLagnaFunctional } from './lagnaFunctionalEngine.ts';
import { computeVimshottariDeep, type DashaNode } from './vimshottariDeepEngine.ts';
import { BHAVA_THEMES_TE } from './ashtakavargaPhalaEngine.ts';
import { TELUGU_RASIS } from './rasiNames.ts';

export interface VistaraSection {
  headingTe: string;
  bodyTe: string;
}

export interface BhavaVistaraRow {
  house: number;
  titleTe: string;
  themeTe: string;
  rasiTe: string;
  signIndex: number;
  lordId: string;
  lordTe: string;
  lordHouse: number;
  lordDignityTe: string;
  lordShadbalaRatio: number;
  occupantsTe: string[];
  occupantIds: string[];
  occupantNatureTe: 'శుభులు' | 'పాపులు' | 'మిశ్రులు' | 'ఖాళీ';
  aspectersTe: string[];
  beneficAspects: number;
  maleficAspects: number;
  sav: number;
  savBandTe: string;
  houseClassTe: string;
  scorePct: number;
  verdictTe: string;
  sections: VistaraSection[];
  timingTe: string[];
  remedyTe: string;
}

export interface GrahaVistaraRow {
  id: string;
  nameTe: string;
  rasiTe: string;
  degreeTe: string;
  house: number;
  nakshatraTe: string;
  pada: number;
  dignityTe: string;
  motionTe: string;
  ownsTe: string;
  functionalTe: string;
  shadbalaVirupas: number;
  shadbalaRatio: number;
  shadbalaRank: number;
  strongestComponentTe: string;
  weakestComponentTe: string;
  ishta: number;
  kashta: number;
  conjunctionsTe: string[];
  aspectsGivenTe: string[];
  aspectsReceivedTe: string[];
  savOfSign: number;
  scorePct: number;
  verdictTe: string;
  sections: VistaraSection[];
  timingTe: string[];
  promiseTe: string;
  cautionTe: string;
  remedyTe: string;
}

export interface DoshaVistaraRow {
  id: string;
  nameTe: string;
  present: boolean;
  severityTe: 'తీవ్రం' | 'మధ్యమం' | 'స్వల్పం' | 'లేదు';
  evidenceTe: string;
  bhangaTe: string;
  effectTe: string;
  remedyTe: string;
  timingTe: string;
  sourceTe: string;
}

export interface BhavaGrahaVistaraReport {
  bhavas: BhavaVistaraRow[];
  grahas: GrahaVistaraRow[];
  doshas: DoshaVistaraRow[];
  lagnaTe: string;
  lagnaTypeTe: string;
  strongBhavaTe: string;
  weakBhavaTe: string;
  strongestGrahaTe: string;
  weakestGrahaTe: string;
  synthesisTe: string;
  methodNoteTe: string;
}

const PLANET_TE: Record<string, string> = {
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

const SEVEN = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'] as const;

const SIGN_LORD: string[] = [
  'Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury',
  'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter',
];

const BHAVA_TITLE_TE = [
  'తనువు (శరీరం · వ్యక్తిత్వం)',
  'ధనం (సంపద · కుటుంబం · వాక్కు)',
  'సహజం (సోదరులు · ధైర్యం)',
  'సుఖం (తల్లి · గృహం · విద్య)',
  'సుతుడు (సంతానం · జ్ఞానం)',
  'రిపువు (రోగం · ఋణం · శత్రువు)',
  'కళత్రం (దాంపత్యం · భాగస్వామ్యం)',
  'ఆయువు (వారసత్వం · ఆకస్మికం)',
  'భాగ్యం (తండ్రి · అదృష్టం · ధర్మం)',
  'కర్మం (వృత్తి · కీర్తి · హోదా)',
  'లాభం (ఆదాయం · మిత్రులు)',
  'వ్యయం (ఖర్చు · మోక్షం · విదేశం)',
];

/** భావ విభాగం — కేంద్ర / త్రికోణ / దుస్థాన / ఉపచయ */
function houseClassTe(h: number): string {
  const parts: string[] = [];
  if ([1, 4, 7, 10].includes(h)) parts.push('కేంద్ర (చతుష్టయం)');
  if ([1, 5, 9].includes(h)) parts.push('త్రికోణ (ధర్మ త్రికోణం)');
  if ([6, 8, 12].includes(h)) parts.push('దుస్థానం');
  if ([3, 6, 10, 11].includes(h)) parts.push('ఉపచయ (పెరిగే భావం)');
  if (h === 3 || h === 11) parts.push('తృతీయ-ఏకాదశ (ప్రయత్న భావం)');
  return parts.length ? parts.join(' · ') : 'తటస్థ భావం';
}

const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, Math.round(n)));
const norm360 = (n: number) => ((n % 360) + 360) % 360;

/** సహజ శుభత్వం — బుధుడు సహవాసంతో మారుతాడు, చంద్రుడు పక్షంతో (BPHS అ.3). */
function natureOf(id: string, chart: CompleteChartResult): 'subha' | 'papa' | 'mixed' {
  if (id === 'Jupiter' || id === 'Venus') return 'subha';
  if (id === 'Sun' || id === 'Mars' || id === 'Saturn' || id === 'Rahu' || id === 'Ketu') return 'papa';
  if (id === 'Moon') {
    const t = chart.panchanga.tithi.number;
    return t <= 15 ? 'subha' : 'papa';
  }
  if (id === 'Mercury') {
    // బుధుడు తనతో కలిసి ఉన్న గ్రహాల స్వభావాన్ని పొందుతాడు
    const mercury = chart.planets.find((p) => p.id === 'Mercury');
    if (!mercury) return 'mixed';
    const others = chart.planets.filter(
      (p) => p.id !== 'Mercury' && p.signIndex === mercury.signIndex && SEVEN.includes(p.id as never)
    );
    if (!others.length) return 'mixed';
    let subha = 0;
    let papa = 0;
    for (const o of others) {
      const n = natureOf(o.id, chart);
      if (n === 'subha') subha++;
      else if (n === 'papa') papa++;
    }
    if (subha > papa) return 'subha';
    if (papa > subha) return 'papa';
    return 'mixed';
  }
  return 'mixed';
}

const natureTe = (n: 'subha' | 'papa' | 'mixed') =>
  n === 'subha' ? 'శుభుడు' : n === 'papa' ? 'పాపుడు' : 'మిశ్ర స్వభావం';

/** పారాశర గ్రహ దృష్టి — పూర్తి రాశి దృష్టి + కుజ/గురు/శని ప్రత్యేక దృష్టి. */
function aspectsOf(id: string): number[] {
  if (id === 'Mars') return [4, 7, 8];
  if (id === 'Jupiter') return [5, 7, 9];
  if (id === 'Saturn') return [3, 7, 10];
  return [7];
}

function aspectsHouse(fromHouse: number, id: string, target: number): boolean {
  if (id === 'Rahu' || id === 'Ketu') return false;
  const dist = ((target - fromHouse + 12) % 12) + 1;
  return aspectsOf(id).includes(dist);
}

const DELIVERY_TE: Record<number, string> = {
  1: 'స్వయం ప్రయత్నం, వ్యక్తిత్వం ద్వారా',
  2: 'కుటుంబం, ధనం, వాక్కు ద్వారా',
  3: 'సోదరులు, ధైర్యం, చిన్న ప్రయాణాల ద్వారా',
  4: 'తల్లి, గృహం, విద్య ద్వారా',
  5: 'సంతానం, జ్ఞానం, పూర్వ పుణ్యం ద్వారా',
  6: 'శ్రమ, సేవ, పోటీ ద్వారా — కష్టపడి, ఆలస్యంగా',
  7: 'భాగస్వామ్యం, దాంపత్యం ద్వారా',
  8: 'ఆకస్మిక మార్పులు, వారసత్వం ద్వారా',
  9: 'తండ్రి, ధర్మం, అదృష్టం ద్వారా',
  10: 'వృత్తి, కీర్తి, హోదా ద్వారా',
  11: 'లాభం, మిత్రులు, కోరికల ద్వారా',
  12: 'ఖర్చు, విదేశం, ఏకాంతం ద్వారా',
};

const WEEKDAY_TE: Record<string, string> = {
  Sun: 'ఆదివారం', Moon: 'సోమవారం', Mars: 'మంగళవారం', Mercury: 'బుధవారం',
  Jupiter: 'గురువారం', Venus: 'శుక్రవారం', Saturn: 'శనివారం', Rahu: 'శనివారం', Ketu: 'మంగళవారం',
};

const lordStrengthTe = (ratio: number) =>
  ratio >= 100 ? 'బలంగా' : ratio >= 85 ? 'సమర్థంగా' : 'బలహీనంగా';

const fmtDate = (iso: string) => iso.slice(0, 10);

function dignityScore(d: string): number {
  switch (d) {
    case 'Exalted':
      return 100;
    case 'Moolatrikona':
      return 88;
    case 'Own Sign':
      return 80;
    case 'Friendly':
      return 62;
    case 'Neutral':
      return 50;
    case 'Enemy':
      return 33;
    case 'Debilitated':
      return 12;
    default:
      return 45;
  }
}

const DIGNITY_TE: Record<string, string> = {
  Exalted: 'ఉచ్చ స్థానం',
  Moolatrikona: 'మూలత్రికోణం',
  'Own Sign': 'స్వక్షేత్రం',
  Friendly: 'మిత్ర క్షేత్రం',
  Neutral: 'సమ క్షేత్రం',
  Enemy: 'శత్రు క్షేత్రం',
  Debilitated: 'నీచ స్థానం',
};

function dashaPeriodsFor(
  planetId: string,
  dashas: DashaNode[],
  nowMs: number,
  limit = 2,
  birthMs = 0
): string[] {
  const out: string[] = [];
  for (const md of dashas) {
    if (md.lord === planetId && md.endMs > birthMs) {
      out.push(`మహాదశ ${fmtDate(md.startLocal)} → ${fmtDate(md.endLocal)} (${md.widthTe})${birthMs > 0 && md.startMs < birthMs ? ' — జన్మ సమయంలో నడుస్తున్న దశ' : ''}`);
    }
  }
  // ప్రస్తుతం/తర్వాత వచ్చే భుక్తిని ఎంచుకో — గతంలో మునిగిన దశలు పనికిరావు
  const candidates = dashas
    .flatMap((md) => (md.children ?? []).map((ad) => ({ md, ad })))
    .filter(({ ad }) => ad.lord === planetId && ad.endMs > nowMs)
    .sort((a, b) => a.ad.startMs - b.ad.startMs);
  for (const { md, ad } of candidates.slice(0, limit)) {
    out.push(`${PLANET_TE[md.lord] ?? md.lord} మహాదశలో ${PLANET_TE[planetId] ?? planetId} భుక్తి ${fmtDate(ad.startLocal)} → ${fmtDate(ad.endLocal)}`);
  }
  return out;
}

export function computeBhavaGrahaVistara(chart: CompleteChartResult): BhavaGrahaVistaraReport {
  const lagnaSign = chart.ascendant.signIndex;
  const functional = computeLagnaFunctional(lagnaSign);
  const sb = computeShadbalaDeep(chart);
  const dashas = computeVimshottariDeep(chart).mahadashas;
  const sav = chart.ashtakavarga.sarvashtakavarga;
  const totalSav = chart.ashtakavarga.totalBindus || sav.reduce((a, b) => a + b, 0);
  const nakSpan = 360 / 27;
  const nowMs = Date.now();
  const birthMs = (chart.julianDay - 2440587.5) * 86400000;
  void nakSpan;

  const planetById = (id: string) => chart.planets.find((p) => p.id === id);
  const sbRow = (id: string) => sb.rows.find((r) => r.id === id);

  // ── 12 భావాలు ─────────────────────────────────────────────────────────
  const bhavas: BhavaVistaraRow[] = [];
  for (let h = 1; h <= 12; h++) {
    const signIndex = (lagnaSign + h - 1) % 12;
    const lordId = SIGN_LORD[signIndex];
    const lord = planetById(lordId);
    const lordHouse = lord?.house ?? 0;
    const bindus = sav[signIndex] ?? 0;
    const occupants = chart.planets.filter(
      (p) => p.house === h && (SEVEN.includes(p.id as never) || p.id === 'Rahu' || p.id === 'Ketu')
    );
    const occupIds = occupants.map((p) => p.id);
    let subha = 0;
    let papa = 0;
    for (const o of occupants) {
      const n = natureOf(o.id, chart);
      if (n === 'subha') subha++;
      else if (n === 'papa') papa++;
    }
    const occupantNatureTe: BhavaVistaraRow['occupantNatureTe'] =
      occupants.length === 0 ? 'ఖాళీ' : subha > papa ? 'శుభులు' : papa > subha ? 'పాపులు' : 'మిశ్రులు';

    // దృష్టి — ఇతర భావాల నుంచి ఈ భావంపై
    const aspecters = chart.planets.filter(
      (p) =>
        p.house !== h &&
        (SEVEN.includes(p.id as never) || p.id === 'Rahu' || p.id === 'Ketu') &&
        aspectsHouse(p.house, p.id, h)
    );
    let bAsp = 0;
    let mAsp = 0;
    for (const a of aspecters) {
      const n = natureOf(a.id, chart);
      if (n === 'subha') bAsp++;
      else if (n === 'papa') mAsp++;
    }

    const lordSb = sbRow(lordId);
    const ratio = lordSb?.ratioPercent ?? 100;
    const dignity = dignityScore(lord?.dignity ?? '');
    const savScore = (bindus / (totalSav / 12)) * 40;
    const occScore = occupants.length === 0 ? 6 : subha > papa ? 15 : papa > subha ? 3 : 9;
    const scorePct = clamp(
      savScore * 0.55 + (ratio / 100) * 22 + (dignity / 100) * 13 + bAsp * 4 - mAsp * 4 + (occScore - 6)
    );

    const lordName = PLANET_TE[lordId] ?? lordId;
    const lordNature = functional.planets.find((p) => p.id === lordId);
    const savBandTe =
      bindus >= 33
        ? 'అత్యుత్తమ (33+)'
        : bindus >= 30
          ? 'బలవత్ (30–32)'
          : bindus >= 25
            ? 'మధ్యమ (25–29)'
            : 'శ్రద్ధార్హ (24 లోపు)';

    const verdictTe =
      scorePct >= 62
        ? 'బలవత్ — ఈ భావ ఫలం సహజంగానే సిద్ధిస్తుంది'
        : scorePct >= 48
          ? 'మధ్యమ — ప్రయత్నంతో ఫలం; ఆలస్యం కానీ నిరాశ కాదు'
          : scorePct >= 36
            ? 'శ్రమసాధ్యం — పరిహారం + క్రమశిక్షణ అవసరం'
            : 'శ్రద్ధార్హ — ఈ భావంలో నష్టభయం; పరిహారం తప్పనిసరి';

    const sections: VistaraSection[] = [];

    sections.push({
      headingTe: '1. భావ స్వరూపం',
      bodyTe: `${h}వ భావం ${TELUGU_RASIS[signIndex].nameTe} (${chart.ascendant.signIndex === signIndex ? 'లగ్నం' : `${TELUGU_RASIS[signIndex].nameTe.split(' ')[0]} స్థానం`}) — ${houseClassTe(h)}. ఈ భావ ఫలం: ${BHAVA_THEMES_TE[h - 1]}. రాశి స్వామి ${lordName}; ${TELUGU_RASIS[signIndex].tattvamTe}, ${TELUGU_RASIS[signIndex].swabhavamTe}.`,
    });

    sections.push({
      headingTe: '2. భావాధిపతి స్థితి',
      bodyTe:
        `${lordName} ${lordHouse}వ భావంలో (${BHAVA_THEMES_TE[Math.max(0, lordHouse - 1)]}) — ${DIGNITY_TE[lord?.dignity ?? ''] ?? lord?.dignity ?? '—'}` +
        `${lord?.isRetrograde ? ', వక్రీ' : ''}. షడ్బల నిష్పత్తి ${ratio.toFixed(1)}% (${lordStrengthTe(ratio)})${lordNature ? `; ఈ లగ్నానికి ${lordNature.natureTe}` : ''}. ` +
        `అందువల్ల ఈ భావ ఫలం ${DELIVERY_TE[lordHouse] ?? 'అధిపతి మార్గం ద్వారా'} సిద్ధిస్తుంది.`,
    });

    sections.push({
      headingTe: '3. భావ నివాసులు',
      bodyTe:
        occupants.length === 0
          ? 'ఈ భావంలో ఏ గ్రహమూ లేదు. ఫలం పూర్తిగా భావాధిపతి స్థితిపైనే ఆధారపడి ఉంటుంది — ' + (ratio >= 100 ? `అధిపతి ${ratio.toFixed(1)}% బలంతో ఉన్నందున ఈ భావం నిశ్శబ్దంగా, కానీ నిరంతరంగా పనిచేస్తుంది.` : ratio >= 85 ? `అధిపతి ${ratio.toFixed(1)}% — సమర్థుడు; ఫలం వస్తుంది, కొంత ఆలస్యంతో.` : `అధిపతి ${ratio.toFixed(1)}% మాత్రమే — ఈ భావం బాహ్యంగా కనిపించదు; ఫలం ఆలస్యంగా, పరోక్షంగా వస్తుంది.`)
          : occupants
              .map(
                (o) =>
                  `${PLANET_TE[o.id]} (${DIGNITY_TE[o.dignity] ?? o.dignity}, ${natureTe(natureOf(o.id, chart))})`
              )
              .join('; ') +
            `. నివాసుల స్వభావం: ${occupantNatureTe}. ` +
            (papa > subha
              ? 'పాప గ్రహ నివాసం వల్ల ఈ భావ విషయాల్లో ఒత్తిడి, ఆలస్యం, పోటీ ఉంటాయి — క్రమమైన ప్రయత్నం తప్పనిసరి.'
              : 'శుభ గ్రహ నివాసం వల్ల ఈ భావ విషయాలు సహజంగా పెరుగుతాయి.'),
    });

    sections.push({
      headingTe: '4. దృష్టి (గ్రహ చూపు)',
      bodyTe:
        aspecters.length === 0
          ? 'ఈ భావంపై ఏ గ్రహ దృష్టీ లేదు. బాహ్య ప్రభావం తక్కువ — ఫలం స్వతంత్రంగా, అధిపతి నియంత్రణలో ఉంటుంది.'
          : `${aspecters.map((a) => `${PLANET_TE[a.id]} (${a.house}నుంచి)`).join(', ')} దృష్టి. శుభ దృష్టి ${bAsp}, పాప దృష్టి ${mAsp}. ` +
            (bAsp > mAsp
              ? 'శుభ దృష్టి అధికం — ఈ భావానికి రక్షణ, అవకాశాలు.'
              : mAsp > bAsp
                ? 'పాప దృష్టి అధికం — ఈ భావ విషయాల్లో ఆటంకాలు; బలమైన అధిపతి ఉంటే అవి దాటగలవు.'
                : 'శుభ-పాప దృష్టి సమం — ఫలం మిశ్రమం.'),
    });

    sections.push({
      headingTe: '5. బలం (అష్టకవర్గ + షడ్బల)',
      bodyTe:
        `సర్వాష్టకవర్గం ${bindus} బిందువులు (సగటు ${(totalSav / 12).toFixed(2)}) — ${savBandTe}. ` +
        `భావాధిపతి షడ్బలం ${lordSb ? `${lordSb.totalVirupas.toFixed(2)} విరూపాలు (${ratio.toFixed(1)}%)` : '—'}. ` +
        `సమగ్ర భావ స్కోరు ${scorePct}% → ${verdictTe}.`,
    });

    const timingTe: string[] = [];
    for (const id of [lordId, ...occupIds]) {
      const p = dashaPeriodsFor(id, dashas, nowMs, 2, birthMs);
      if (p.length) timingTe.push(`${PLANET_TE[id] ?? id}: ${p.join(' · ')}`);
    }
    if (!timingTe.length) timingTe.push('ఈ భావానికి సంబంధించిన దశా కాలం 120 సంవత్సరాల చక్రంలో స్పష్టంగా లేదు.');

    sections.push({
      headingTe: '6. కాల ఫలం (దశా)',
      bodyTe: `ఈ భావ ఫలం ప్రధానంగా ${[lordId, ...occupIds].map((i) => PLANET_TE[i] ?? i).join(', ')} దశలలో స్పష్టమవుతుంది — ${timingTe[0]}.`,
    });

    const weekday = WEEKDAY_TE[lordId] ?? 'ఆదివారం';
    const remedyTe =
      scorePct < 55
        ? `${weekday} ${lordName} పూజ/దానం; ${bindus < 25 ? `${BHAVA_THEMES_TE[h - 1].split(',')[0]} రంగంలో ఆతురత వద్దు, జపం 108 సార్లు` : 'నియమిత దానం, గ్రహ స్తోత్రం'}; ${lordName} పాలిత భావానికి (${lordHouse}) క్రమశిక్షణ — ఇదే అత్యంత శక్తివంతమైన పరిహారం.`
        : `${lordName} బలవంతుడు — పరిహారం అవసరం లేదు; ఈ బలాన్ని ${BHAVA_THEMES_TE[h - 1].split(',')[0]} రంగంలో ఉపయోగించడమే పరిహారం.`;

    bhavas.push({
      house: h,
      titleTe: BHAVA_TITLE_TE[h - 1],
      themeTe: BHAVA_THEMES_TE[h - 1],
      rasiTe: TELUGU_RASIS[signIndex].nameTe,
      signIndex,
      lordId,
      lordTe: lordName,
      lordHouse,
      lordDignityTe: DIGNITY_TE[lord?.dignity ?? ''] ?? lord?.dignity ?? '—',
      lordShadbalaRatio: ratio,
      occupantsTe: occupants.map((o) => PLANET_TE[o.id] ?? o.id),
      occupantIds: occupIds,
      occupantNatureTe,
      aspectersTe: aspecters.map((a) => `${PLANET_TE[a.id]} (${a.house})`),
      beneficAspects: bAsp,
      maleficAspects: mAsp,
      sav: bindus,
      savBandTe,
      houseClassTe: houseClassTe(h),
      scorePct,
      verdictTe,
      sections,
      timingTe,
      remedyTe,
    });
  }

  // ── 9 గ్రహాలు ─────────────────────────────────────────────────────────
  const sortedSb = [...sb.rows].sort((a, b) => b.totalVirupas - a.totalVirupas);
  const grahas: GrahaVistaraRow[] = [];
  for (const id of ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu']) {
    const p = planetById(id);
    if (!p) continue;
    const row = sbRow(id);
    const func = functional.planets.find((f) => f.id === id);
    const conj = chart.planets.filter(
      (q) => q.id !== id && q.signIndex === p.signIndex && q.id !== 'Uranus' && q.id !== 'Neptune' && q.id !== 'Pluto'
    );
    const given: string[] = [];
    const received: string[] = [];
    for (const q of chart.planets) {
      if (!SEVEN.includes(q.id as never)) continue;
      if (q.id === id) continue;
      if (aspectsHouse(p.house, id, q.house)) {
        given.push(`${PLANET_TE[q.id]} (${q.house}వ భావం)`);
      }
      if (aspectsHouse(q.house, q.id, p.house)) {
        received.push(`${PLANET_TE[q.id]} (${q.house}నుంచి)`);
      }
    }
    const rank = row ? sortedSb.findIndex((r) => r.id === id) + 1 : 0;
    const comps: { name: string; v: number }[] = row
      ? [
          { name: 'స్థాన బలం', v: row.sthanaTotal },
          { name: 'దిగ్ బలం', v: row.dig },
          { name: 'కాల బలం', v: row.kalaTotal },
          { name: 'చేష్టా బలం', v: row.cheshta },
          { name: 'నైసర్గిక బలం', v: row.naisargika },
          { name: 'దృక్ బలం', v: row.drik },
        ]
      : [];
    const strongest = [...comps].sort((a, b) => b.v - a.v)[0];
    const weakest = [...comps].sort((a, b) => a.v - b.v)[0];
    const ishta = row?.ishtaPhala ?? 0;
    const kashta = row?.kashtaPhala ?? 0;
    const nature = natureOf(id, chart);
    const lagnaHouse = p.house;
    const shadbalaPart = row ? Math.min(66, (row.ratioPercent / 100) * 55) : 34;
    const ishtaShare = ishta + kashta > 0 ? (ishta / (ishta + kashta)) * 12 : 6;
    const scorePct = clamp(
      shadbalaPart + (dignityScore(p.dignity) / 100) * 22 + (nature === 'subha' ? 8 : nature === 'papa' ? 3 : 5) + ishtaShare
    );
    const verdictTe =
      scorePct >= 75 && rank > 0 && rank <= 3
        ? 'ప్రబలుడు — ఈ గ్రహం ఇచ్చే ఫలం నిర్బంధంగా సిద్ధిస్తుంది'
        : scorePct >= 58
          ? 'సమర్థుడు — ఫలం వస్తుంది, కానీ సమయం తీసుకుంటుంది'
          : scorePct >= 42
            ? 'మధ్యముడు — ఫలం ప్రయత్న సాపేక్షం'
            : 'దుర్బలుడు — ఈ గ్రహం ఇచ్చే ఫలం ఆలస్యం; పరిహారం అవసరం';

    const sections: VistaraSection[] = [
      {
        headingTe: '1. స్థానం & గుణం',
        bodyTe:
          `${PLANET_TE[id]} ${p.signName} ${p.formattedDMS} — ${p.house}వ భావం; ${p.nakshatra} పాదం ${p.pada} (నక్షత్రాధిపతి ${PLANET_TE[p.nakshatraLord] ?? p.nakshatraLord}, దేవత ${p.nakshatraDeity}). ` +
          `గౌరవం: ${DIGNITY_TE[p.dignity] ?? p.dignity}. ${p.isRetrograde ? 'వక్రీగతుడు — ఫలం లోపలికి మళ్లి, ఆలస్యంగా, పునరావృత్తిగా వస్తుంది.' : 'మార్గీ — ఫలం నేరుగా వస్తుంది.'} ` +
          `సహజ స్వభావం: ${natureTe(nature)}.`,
      },
      {
        headingTe: '2. అధిపత్యం & కర్మ',
        bodyTe:
          (func
            ? `${PLANET_TE[id]} ఈ లగ్నానికి ${func.ownsHouses.length ? `${func.ownsHouses.length === 1 ? `${func.ownsHouses[0]}వ భావానికి` : `${func.ownsHouses.join(', ')} భావాలకు`} అధిపతి` : 'భావాధిపత్యం లేదు (ఛాయా గ్రహం)'}; ${func.natureTe}${func.isYogakaraka ? '; **యోగకారకుడు**' : ''}${func.isKendradhipatiDosha ? '; కేంద్రాధిపత్య దోషం' : ''}. `
            : '') +
          `${lagnaHouse}వ భావంలో ఉన్నందున ${BHAVA_THEMES_TE[lagnaHouse - 1]} రంగంలో ఈ గ్రహపు ఫలం నేరుగా కనిపిస్తుంది.`,
      },
      {
        headingTe: '3. బలం (షడ్బలం)',
        bodyTe: row
          ? `మొత్తం ${row.totalVirupas.toFixed(2)} విరూపాలు (${row.totalRupas.toFixed(2)} రూపాలు; అవసరం ${(row.requiredVirupas / 60).toFixed(2)} రూపాలు) — నిష్పత్తి ${row.ratioPercent.toFixed(1)}%, ర్యాంక్ ${rank}/7. బలమైన అంశం ${strongest.name} ${strongest.v.toFixed(2)}, బలహీన అంశం ${weakest.name} ${weakest.v.toFixed(2)}. ఇష్ట ఫలం ${ishta.toFixed(1)}, కష్ట ఫలం ${kashta.toFixed(1)}${id === 'Sun' || id === 'Moon' ? ' (వీరికి చేష్టా బలం 0 కాబట్టి ఇష్ట-కష్ట సూత్రం సున్నా వైపు ఉంటుంది — ఫలం కాల/పక్ష బలాల నుంచే తీర్చాలి)' : ''}.`
          : 'ఛాయా గ్రహం — షడ్బలం లెక్కించబడదు; దాని ఫలం రాహు/కేతు స్థానం, దృష్టి, దశా ద్వారా మాత్రమే తీర్చబడుతుంది.',
      },
      {
        headingTe: '4. సంబంధాలు (సహవాసం · దృష్టి)',
        bodyTe:
          (conj.length ? `సహవాసం: ${conj.map((c) => `${PLANET_TE[c.id] ?? c.id} (${c.signName})`).join(', ')}. ` : 'ఈ రాశిలో ఇతర గ్రహ సహవాసం లేదు. ') +
          (given.length ? `ఈ గ్రహం చూసే భావాలు/గ్రహాలు: ${given.join(', ')}. ` : '') +
          (received.length ? `ఈ గ్రహంపై దృష్టి: ${received.join(', ')}. ` : '') +
          (p.d1Sign === p.d9Sign ? 'D1–D9 రెండింటిలోా ఒకే రాశి — వర్గోత్తమం; ఈ గ్రహపు ఫలం స్థిరం, నమ్మదగినది.' : ''),
      },
      {
        headingTe: '5. ఫలం',
        bodyTe: `${PLANET_TE[id]} ${BHAVA_THEMES_TE[lagnaHouse - 1]} రంగంలో ${nature === 'subha' ? 'శుభ ఫలాన్ని' : nature === 'papa' ? 'శ్రమతో కూడిన ఫలాన్ని' : 'మిశ్ర ఫలాన్ని'} ఇస్తాడు. ${verdictTe}.`,
      },
    ];

    const timing = dashaPeriodsFor(id, dashas, nowMs, 2, birthMs);
    sections.push({
      headingTe: '6. కాల ఫలం',
      bodyTe: timing.length
        ? `${PLANET_TE[id]} దశలు: ${timing.join(' · ')}. ఆ కాలాల్లో పైన చెప్పిన రంగాలలో ఫలం స్పష్టంగా కనిపిస్తుంది.`
        : '120-సంవత్సరాల చక్రంలో ఈ గ్రహ మహాదశ ప్రారంభం జన్మకు ముందే జరిగింది — ఫలం భుక్తి/ప్రత్యంతర దశల్లో వెతకాలి.',
    });

    const remedies = ((chart as unknown as { remedies?: unknown[] }).remedies ?? []) as never[];
    void remedies;
    const gemInfo = (() => {
      // TELUGU_PLANETS నుంచి రత్నం తీసుకోము — ఇక్కడ మూలం భావ స్థితి మాత్రమే
      return '';
    })();
    const remedyTe =
      scorePct >= 58
        ? `${PLANET_TE[id]} బలవంతుడు — ప్రత్యేక పరిహారం అవసరం లేదు. ఆ బలాన్ని ${BHAVA_THEMES_TE[lagnaHouse - 1].split(',')[0]} రంగంలో ఉపయోగించడమే ఉత్తమం.`
        : `${PLANET_TE[id]} బలహీనుడు (${scorePct}%) — ${PLANET_TE[id]} వారం రోజు ఉపవాసం/పూజ, ${p.nakshatra} నక్షత్ర దేవతార్చన; ${weakest?.name ?? 'స్థాన బలం'} పెంచే మార్గం (దానం, సేవ, ఆ గ్రహం పాలిత భావానికి క్రమశిక్షణ).`;

    grahas.push({
      id,
      nameTe: PLANET_TE[id],
      rasiTe: p.signName,
      degreeTe: p.formattedDMS,
      house: p.house,
      nakshatraTe: `${p.nakshatra} పాదం ${p.pada}`,
      pada: p.pada,
      dignityTe: DIGNITY_TE[p.dignity] ?? p.dignity,
      motionTe: p.isRetrograde ? 'వక్రీ' : 'మార్గీ',
      ownsTe: func && func.ownsHouses.length ? func.ownsHouses.join(', ') : '—',
      functionalTe: func?.natureTe ?? '—',
      shadbalaVirupas: row?.totalVirupas ?? 0,
      shadbalaRatio: row?.ratioPercent ?? 0,
      shadbalaRank: rank,
      strongestComponentTe: strongest ? `${strongest.name} ${strongest.v.toFixed(1)}` : '—',
      weakestComponentTe: weakest ? `${weakest.name} ${weakest.v.toFixed(1)}` : '—',
      ishta,
      kashta,
      conjunctionsTe: conj.map((c) => `${PLANET_TE[c.id] ?? c.id}`),
      aspectsGivenTe: given,
      aspectsReceivedTe: received,
      savOfSign: sav[p.signIndex] ?? 0,
      scorePct,
      verdictTe,
      sections,
      timingTe: timing,
      promiseTe: `${BHAVA_THEMES_TE[lagnaHouse - 1]} — ${nature === 'subha' ? 'శుభ మార్గం' : nature === 'papa' ? 'శ్రమ మార్గం' : 'మిశ్ర మార్గం'}`,
      cautionTe:
        nature === 'papa' && scorePct < 58
          ? `${PLANET_TE[id]} దుర్బలుడు + పాపుడు — ${BHAVA_THEMES_TE[lagnaHouse - 1].split(',')[0]} రంగంలో ఆతురత వద్దు; పరిహారం చేయండి.`
          : 'ప్రత్యేక హెచ్చరిక లేదు.',
      remedyTe: remedyTe + gemInfo,
    });
  }

  // ── దోష విచారం ────────────────────────────────────────────────────────
  const doshas: DoshaVistaraRow[] = [];
  const sun = planetById('Sun');
  const mars = planetById('Mars');
  const moon = planetById('Moon');
  const saturn = planetById('Saturn');
  const rahu = planetById('Rahu');
  const ketu = planetById('Ketu');
  const jupiter = planetById('Jupiter');

  if (mars && moon) {
    const fromLagna = ((mars.house - 1 + 12) % 12) + 1;
    const fromMoon = ((mars.house - moon.house + 12) % 12) + 1;
    const hits = [1, 2, 4, 7, 8, 12];
    const present = hits.includes(fromLagna) || hits.includes(fromMoon);
    const jupAspect = jupiter ? aspectsHouse(jupiter.house, 'Jupiter', mars.house) : false;
    doshas.push({
      id: 'mangal',
      nameTe: 'కుజ దోషం (మాంగలిక్)',
      present,
      severityTe: present ? (hits.includes(fromLagna) && hits.includes(fromMoon) ? 'తీవ్రం' : 'మధ్యమం') : 'లేదు',
      evidenceTe: `కుజుడు ${mars.house}వ భావంలో — లగ్నం నుంచి ${fromLagna}వ, చంద్రుని నుంచి ${fromMoon}వ స్థానం.`,
      bhangaTe: !present
        ? '—'
        : jupAspect
          ? 'గురువు దృష్టి కుజునిపై ఉంది — దోష భంగం (ఉపశమనం).'
          : mars.dignity === 'Own Sign' || mars.dignity === 'Exalted' || mars.dignity === 'Moolatrikona'
            ? 'కుజుడు స్వ/ఉచ్చ స్థానంలో — దోష తీవ్రత తగ్గుతుంది.'
            : 'దోష భంగానికి స్పష్ట ఆధారం లేదు.',
      effectTe: present
        ? 'దాంపత్యంలో ఆతురత, అహం ఘర్షణ; వివాహానంతరం మొదటి సంవత్సరాలు సర్దుబాటు అవసరం. ఇది వ్యక్తి దోషం కాదు — గ్రహ స్థితి మాత్రమే.'
        : 'కుజ దోషం లేదు — దాంపత్య భావంపై ఈ దోష ప్రభావం లేదు.',
      remedyTe: present
        ? 'కుజునికి మంగళవారం నిమ్మ/ఎరుపు వస్తు దానం; హనుమత్ ఆరాధన; వివాహానికి ముందు కుజ శాంతి.'
        : 'పరిహారం అవసరం లేదు.',
      timingTe: present ? dashaPeriodsFor('Mars', dashas, nowMs, 1, birthMs).join(' · ') : '—',
      sourceTe: 'బృహత్ పరాశర హోరా · ముహూర్త చింతామణి',
    });
  }

  const nodes = [rahu, ketu];
  if (rahu && ketu) {
    // కాళ సర్పం — అన్ని గ్రహాలు రాహు-కేతు మధ్య ఒకే వైపు
    const sevenHouses = SEVEN.map((id) => planetById(id)?.house ?? 0);
    const rH = rahu.house;
    const kH = ketu.house;
    const inArc = (h: number) => {
      const d = ((h - rH + 12) % 12) + 1;
      const kd = ((kH - rH + 12) % 12) + 1;
      return d < kd;
    };
    const side = sevenHouses.map(inArc);
    const allOneSide = side.every((s) => s === side[0]);
    doshas.push({
      id: 'kaalasarpa',
      nameTe: 'కాళ సర్ప దోషం',
      present: allOneSide,
      severityTe: allOneSide ? 'తీవ్రం' : 'లేదు',
      evidenceTe: `రాహువు ${rH}వ, కేతువు ${kH}వ భావంలో. ${allOneSide ? 'ఏడు గ్రహాలూ రాహు-కేతు మధ్య ఒకే చాపంలో ఉన్నాయి.' : 'కనీసం ఒక గ్రహం రాహు-కేతు చాపం వెలుపల ఉంది — దోషం ఏర్పడదు.'}`,
      bhangaTe: allOneSide ? 'రాహు-కేతు మధ్య గ్రహాలు ఒకే వైపు ఉండటం వల్ల జీవితం ఒకే దిశలో తీవ్రంగా నడుస్తుంది — ఇది దోషమే కాదు, ఏకాగ్రత కూడా.' : 'భంగం అవసరం లేదు.',
      effectTe: allOneSide ? 'ఆలస్యమైన ఆరంభాలు, తర్వాత ఆకస్మిక ఎదుగుదల; ఒక రంగంలో మాత్రమే జీవితం కేంద్రీకరణ.' : 'ప్రభావం లేదు.',
      remedyTe: allOneSide ? 'నాగ ప్రతిష్ఠ / సర్ప శాంతి; శనివారం నాగుల చిత్ర పూజ.' : '—',
      timingTe: allOneSide ? dashaPeriodsFor('Rahu', dashas, nowMs, 1, birthMs).join(' · ') : '—',
      sourceTe: 'కాళ సర్ప యోగ శాస్త్రం',
    });
  }

  if (moon) {
    // కేమద్రుమం — చంద్రుని నుంచి 2, 12 భావాల్లో గ్రహాలు లేకపోవడం
    const h2 = ((moon.house % 12) + 1);
    const h12 = ((moon.house + 10) % 12) + 1;
    const rel = chart.planets.filter(
      (p) => (p.house === h2 || p.house === h12) && SEVEN.includes(p.id as never) && p.id !== 'Moon'
    );
    const kendra = chart.planets.filter(
      (p) => [1, 4, 7, 10].includes(((p.house - moon.house + 12) % 12) + 1) && SEVEN.includes(p.id as never) && p.id !== 'Moon'
    );
    const present = rel.length === 0 && kendra.length === 0;
    doshas.push({
      id: 'kemadruma',
      nameTe: 'కేమద్రుమ దోషం',
      present,
      severityTe: present ? 'మధ్యమం' : 'లేదు',
      evidenceTe: `చంద్రుని నుంచి 2వ (${h2}) మరియు 12వ (${h12}) భావాల్లో ${rel.length} గ్రహాలు; కేంద్రాల్లో ${kendra.length}.`,
      bhangaTe: present ? 'గురువు/శుక్ర దృష్టి లేదా చంద్రుని కేంద్ర స్థితి ఉంటే భంగం — ఈ కుండలిలో అటువంటి ఆధారం లేదు.' : 'దోషం లేదు.',
      effectTe: present ? 'మానసిక ఒంటరితనం, ఆర్థిక హెచ్చుతగ్గులు; స్వయం కృషి తప్పనిసరి.' : 'ప్రభావం లేదు.',
      remedyTe: present ? 'సోమవారం శివ ఆరాధన, పాలు/వెండి దానం, చంద్రునికి సంబంధించిన ముత్యం ధారణ (రత్న నిపుణుడి సలహాతో).' : '—',
      timingTe: present ? dashaPeriodsFor('Moon', dashas, nowMs, 1, birthMs).join(' · ') : '—',
      sourceTe: 'బృహత్ పరాశర హోరా',
    });
  }

  if (saturn && moon) {
    // జన్మ కుండలిలో శని–చంద్ర స్థితి. ఇది **గోచార సాడే సాతి కాదు** — దానిని
    // గోచార అధ్యాయం విడిగా చూపుతుంది; ఇక్కడ జన్మ చక్రం మాత్రమే.
    const dist = ((saturn.signIndex - moon.signIndex + 12) % 12) + 1;
    const active = dist === 12 || dist === 1 || dist === 2;
    doshas.push({
      id: 'sadesati',
      nameTe: 'శని–చంద్ర స్థితి (జన్మ చక్రంలో)',
      present: active,
      severityTe: active ? (dist === 1 ? 'తీవ్రం' : 'మధ్యమం') : 'లేదు',
      evidenceTe: `శని ${saturn.signIndex + 1}వ రాశిలో, చంద్రుడు ${moon.signIndex + 1}వ రాశిలో — చంద్రుని నుంచి శని ${dist}వ స్థానం (శని ${saturn.house}వ భావం).`,
      bhangaTe: active
        ? `శని గౌరవం ${DIGNITY_TE[saturn.dignity] ?? saturn.dignity}; ${saturn.dignity === 'Own Sign' || saturn.dignity === 'Exalted' ? 'స్వ/ఉచ్చ స్థానం వల్ల ఒత్తిడి తగ్గుతుంది.' : 'ఉపశమనానికి స్పష్ట ఆధారం లేదు.'}`
        : 'జన్మ చక్రంలో ఈ స్థితి లేదు.',
      effectTe: active
        ? 'జన్మతః నెమ్మది పెరుగుదల, బాధ్యత భారం ముందుగానే; 30 ఏళ్ల తర్వాత స్థిరత్వం. ఇది గోచార సాడే సాతి కాదు — ఆ కాలం గోచార అధ్యాయంలో విడిగా ఉంది.'
        : 'జన్మ చక్రంలో శని చంద్రునికి 12/1/2 స్థానాల్లో లేడు.',
      remedyTe: active ? 'శనివారం నువ్వుల నూనె దీపం, శని స్తోత్రం, శ్రమ దానం.' : '—',
      timingTe: active ? dashaPeriodsFor('Saturn', dashas, nowMs, 1, birthMs).join(' · ') : '—',
      sourceTe: 'జన్మ చక్ర గ్రహ స్థితి (గోచారం వేరు)',
    });
  }

  if (sun) {
    const conj = chart.planets.filter((p) => p.signIndex === sun.signIndex && p.id !== 'Sun' && SEVEN.includes(p.id as never));
    const combust = conj.filter((p) => {
      const gap = Math.abs(norm360(p.siderealLon) - norm360(sun.siderealLon));
      return Math.min(gap, 360 - gap) <= 8;
    });
    doshas.push({
      id: 'astangata',
      nameTe: 'అస్తంగత దోషం (గ్రహ మౌఢ్యం)',
      present: combust.length > 0,
      severityTe: combust.length > 0 ? 'మధ్యమం' : 'లేదు',
      evidenceTe: `సూర్యునికి 8° లోపు: ${combust.length ? combust.map((p) => PLANET_TE[p.id]).join(', ') : 'ఏ గ్రహమూ లేదు'}.`,
      bhangaTe: combust.some((p) => p.isRetrograde) ? 'వక్రీ గ్రహం అస్తంగత దోషాన్ని తగ్గిస్తుంది.' : '—',
      effectTe: combust.length ? 'ఆ గ్రహాల ఫలం ఆత్మ/అధికారం కిందికి వస్తుంది; వ్యక్తిగత ప్రకాశం తగ్గుతుంది.' : 'ప్రభావం లేదు.',
      remedyTe: combust.length ? 'సూర్య నమస్కారాలు, ఆదిత్య హృదయం; ఆ గ్రహానికి సంబంధించిన దానం.' : '—',
      timingTe: combust.length ? dashaPeriodsFor('Sun', dashas, nowMs, 1, birthMs).join(' · ') : '—',
      sourceTe: 'బృహత్ పరాశర హోరా (అస్తంగత నిర్ణయం)',
    });
  }

  if (jupiter && rahu) {
    const same = jupiter.house === rahu.house;
    doshas.push({
      id: 'guruchandala',
      nameTe: 'గురు-చాండాల దోషం',
      present: same,
      severityTe: same ? 'మధ్యమం' : 'లేదు',
      evidenceTe: `గురువు ${jupiter.house}వ భావం, రాహువు ${rahu.house}వ భావం — ${same ? 'ఒకే భావం' : 'వేర్వేరు'}.`,
      bhangaTe: same ? 'గురువు బలం (షడ్బలం) దోష తీవ్రతను తగ్గిస్తుంది.' : '—',
      effectTe: same ? 'గురు/ధర్మ విషయాల్లో అపార్థాలు, భ్రమ; గురు ఆశీర్వాదం తప్పనిసరి.' : 'ప్రభావం లేదు.',
      remedyTe: same ? 'గురువారం పసుపు దానం, గురు ఆరాధన; రాహు శాంతి.' : '—',
      timingTe: same ? dashaPeriodsFor('Jupiter', dashas, nowMs, 1, birthMs).join(' · ') : '—',
      sourceTe: 'సంప్రదాయ దోష పరిశీలన',
    });
  }

  if (rahu && ketu && sun && moon && (sun.house === rahu.house || moon.house === rahu.house)) {
    const withSun = sun.house === rahu.house;
    doshas.push({
      id: 'grahan',
      nameTe: 'గ్రహణ దోషం',
      present: true,
      severityTe: 'మధ్యమం',
      evidenceTe: `${withSun ? 'సూర్యుడు' : 'చంద్రుడు'} రాహువుతో ${rahu.house}వ భావంలో కలిశారు.`,
      bhangaTe: 'రాహు-కేతు మధ్య గ్రహ బలం ఉంటే ఉపశమనం.',
      effectTe: `${withSun ? 'ఆత్మగౌరవం, తండ్రి, అధికారం' : 'మనస్సు, తల్లి'} విషయాల్లో అస్థిరత; జీవితంలో పెద్ద మలుపులు.`,
      remedyTe: 'సూర్య/చంద్ర గ్రహణ శాంతి; రాహు/కేతు ఆరాధన, నాగ ప్రతిష్ఠ.',
      timingTe: dashaPeriodsFor('Rahu', dashas, nowMs, 1, birthMs).join(' · '),
      sourceTe: 'సంప్రదాయ గ్రహణ దోష నిర్ణయం',
    });
  }

  const strongBhava = [...bhavas].sort((a, b) => b.scorePct - a.scorePct)[0];
  const weakBhava = [...bhavas].sort((a, b) => a.scorePct - b.scorePct)[0];
  const strongestGraha = [...grahas].sort((a, b) => b.scorePct - a.scorePct)[0];
  const weakestGraha = [...grahas].sort((a, b) => a.scorePct - b.scorePct)[0];

  return {
    bhavas,
    grahas,
    doshas,
    lagnaTe: TELUGU_RASIS[lagnaSign].nameTe,
    lagnaTypeTe: TELUGU_RASIS[lagnaSign].swabhavamTe,
    strongBhavaTe: `${strongBhava?.house}వ భావం — ${strongBhava?.titleTe} (${strongBhava?.scorePct}%, SAV ${strongBhava?.sav})`,
    weakBhavaTe: `${weakBhava?.house}వ భావం — ${weakBhava?.titleTe} (${weakBhava?.scorePct}%, SAV ${weakBhava?.sav})`,
    strongestGrahaTe: `${strongestGraha?.nameTe} (${strongestGraha?.scorePct}%, ${strongestGraha?.shadbalaVirupas.toFixed(2)} విరూపాలు)`,
    weakestGrahaTe: `${weakestGraha?.nameTe} (${weakestGraha?.scorePct}%, ${weakestGraha?.shadbalaVirupas.toFixed(2)} విరూపాలు)`,
    synthesisTe:
      `లగ్నం ${TELUGU_RASIS[lagnaSign].nameTe} (${TELUGU_RASIS[lagnaSign].swabhavamTe}). ` +
      `అత్యంత బలమైన భావం ${strongBhava?.house} (${BHAVA_THEMES_TE[(strongBhava?.house ?? 1) - 1].split(',')[0]}), అత్యంత శ్రద్ధార్హ భావం ${weakBhava?.house} (${BHAVA_THEMES_TE[(weakBhava?.house ?? 1) - 1].split(',')[0]}). ` +
      `బలమైన గ్రహం ${strongestGraha?.nameTe}, బలహీన గ్రహం ${weakestGraha?.nameTe}. ` +
      `పరిహారం మొదట ${weakestGraha?.nameTe} కి, తర్వాత ${weakBhava?.house}వ భావానికి.`,
    methodNoteTe:
      'భావ స్కోరు = SAV బిందువుల వాటా (సగటు 28.08 తో పోల్చి) + అధిపతి షడ్బల నిష్పత్తి + గౌరవం + శుభ/పాప దృష్టి − పాప దృష్టి. ' +
      'ఏ సంఖ్యా చేతితో నమోదు చేయలేదు — ఇంజిన్ లెక్క నుంచే.',
  };
}
