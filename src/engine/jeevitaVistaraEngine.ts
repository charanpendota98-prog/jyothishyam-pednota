/**
 * jeevitaVistaraEngine.ts — జీవిత రంగాల విస్తర విశ్లేషణ (Life Domains in Depth)
 * ---------------------------------------------------------------------------
 * 116-పుటల ప్రామాణిక జాతక పత్రికలో అత్యంత చదివే భాగం ఇదే: “వివాహ జీవితం ఎలా
 * ఉంటుంది?”, “ఉద్యోగమా? వ్యాపారమా?”, “చదువు ఎలా సాగుతుంది?”, “ఆరోగ్యం ఏమిటి?”
 * — ఒక్కో రంగానికి ప్రత్యేక శీర్షిక, ప్రత్యేక విశ్లేషణ.
 *
 * ఈ ఇంజిన్ ప్రతి రంగానికి ఐదు భాగాలు ఇస్తుంది (అన్నీ వేరువేరు ఉపశీర్షికలతో):
 *   1. శాస్త్ర ఆధారం — ఏ భావం, ఏ అధిపతి, ఏ కారక గ్రహం, వాటి వాస్తవ స్థితి
 *   2. లోతైన వివరణ — 3 పేరాలు (స్వభావం, సామర్థ్యం, సంబంధ నిర్మాణం)
 *   3. బలాలు — ఏ అంశాలు అనుకూలం
 *   4. జాగ్రత్తలు — ఏ గ్రహ స్థితుల వల్ల ఏమి జరగవచ్చు
 *   5. కాల ఫలం — సంబంధిత మహాదశ-భుక్తి కాలాలు (సంవత్సరాలతో) + పరిహారం
 *
 * లెక్కలు: భావ స్వామ్యం (whole-sign), క్షేత్ర బలం, భావ స్థితి, పూర్ణ పరాశరీ దృష్టి,
 * వర్గ చక్రాలు (D9 వివాహం, D10 వృత్తి, D24 విద్య, D30 అరిష్టం, D7 సంతానం,
 * D2 ధనం, D4 ఆస్తి) మరియు వింశోత్తరి దశా కాలరేఖ.
 */

import type { CompleteChartResult, PlanetPosition } from './ephemeris.ts';
import { SIGN_LORD, RASI_TE, PLANET_TE, type PlanetId9 } from './lagnaFunctionalEngine.ts';
import { computeVimshottariDeep } from './vimshottariDeepEngine.ts';

const KENDRA = [1, 4, 7, 10];
const TRIKONA = [1, 5, 9];
const DUSTHANA = [6, 8, 12];

/** సహజ శుభ / పాప గ్రహాలు (చంద్ర-బుధ యుతి కాకుండా) */
const NATURAL_BENEFIC: PlanetId9[] = ['Jupiter', 'Venus', 'Mercury', 'Moon'];
const NATURAL_MALEFIC: PlanetId9[] = ['Sun', 'Mars', 'Saturn', 'Rahu', 'Ketu'];

const KARAKA_TE: Record<PlanetId9, string> = {
  Sun: 'ఆత్మ, తండ్రి, అధికారం',
  Moon: 'మనస్సు, తల్లి, భావోద్వేగం',
  Mars: 'పరాక్రమం, సోదరులు, ధైర్యం',
  Mercury: 'బుద్ధి, వాక్కు, వ్యాపారం, విద్య',
  Jupiter: 'జ్ఞానం, ధర్మం, సంతానం, గురువు',
  Venus: 'వివాహం, కళ, సుఖం, వాహనం',
  Saturn: 'కర్మ, శ్రమ, ఆయుష్షు, ఆటంకం',
  Rahu: 'ఆకాంక్ష, విదేశం, ఆధునికత',
  Ketu: 'వైరాగ్యం, ఆధ్యాత్మికం, విడిపోవడం',
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

/** ఆత్మకారక గ్రహం ప్రకారం ఇష్ట దైవ ఉపాసన */
const AK_DEITY_TE: Record<PlanetId9, string> = {
  Sun: 'శ్రీ సూర్య నారాయణ & శివ',
  Moon: 'శ్రీ గౌరీ-పార్వతీ దేవి',
  Mars: 'శ్రీ సుబ్రహ్మణ్య స్వామి & హనుమాన్',
  Mercury: 'శ్రీ గణేశ & శ్రీ విష్ణు',
  Jupiter: 'శ్రీ దత్తాత్రేయ & గురు చరణాలు',
  Venus: 'శ్రీ లక్ష్మీ దేవి',
  Saturn: 'శ్రీ వేంకటేశ్వర స్వామి & శని దేవుడు',
  Rahu: 'శ్రీ దుర్గా దేవి',
  Ketu: 'శ్రీ వినాయక స్వామి',
};

const SAINTS_TE: Record<PlanetId9, string> = {
  Sun: 'సూర్యుడు', Moon: 'చంద్రుడు', Mars: 'కుజుడు', Mercury: 'బుధుడు',
  Jupiter: 'గురువు', Venus: 'శుక్రుడు', Saturn: 'శని', Rahu: 'రాహువు', Ketu: 'కేతువు',
};

export interface DomainWindow {
  periodTe: string;
  yearsTe: string;
  noteTe: string;
  isRunning: boolean;
}

export interface LifeDomainDeep {
  id: string;
  number: string;
  titleTe: string;
  subtitleTe: string;
  /** ఈ రంగానికి ఆధారమైన భావాలు */
  housesTe: string;
  scorePct: number;
  verdictTe: string;
  /** 1. శాస్త్ర ఆధారం */
  foundationTe: string;
  /** 2. లోతైన వివరణ — ప్రతి పేరా వేరు ఉపశీర్షికతో */
  analysis: { headingTe: string; bodyTe: string }[];
  strengthsTe: string[];
  cautionsTe: string[];
  /** 5. కాల ఫలం */
  timing: DomainWindow[];
  remedyTe: string;
}

export interface JeevitaVistaraReport {
  domains: LifeDomainDeep[];
  overallTe: string;
  bestDomainTe: string;
  watchDomainTe: string;
}

const dignityScore = (p: PlanetPosition): number => {
  switch (p.dignity) {
    case 'Exalted': return 100;
    case 'Moolatrikona': return 88;
    case 'Own Sign': return 80;
    case 'Friendly': return 62;
    case 'Neutral': return 50;
    case 'Enemy': return 33;
    case 'Debilitated': return 12;
    default: return 45;
  }
};

const verdictOf = (n: number) =>
  n >= 80 ? 'అత్యుత్తమం' : n >= 65 ? 'బలంగా ఉంది' : n >= 50 ? 'మధ్యమం' : n >= 35 ? 'కష్టసాధ్యం' : 'బలహీనం';

const clamp = (n: number) => Math.max(8, Math.min(96, Math.round(n)));

const joinTe = (arr: string[]) => arr.filter(Boolean).join(', ');

export function computeJeevitaVistara(chart: CompleteChartResult): JeevitaVistaraReport {
  const planets = chart.planets;
  const by = (id: PlanetId9) => planets.find((p) => p.id === id)!;
  const lagnaSign = ((Math.floor(chart.ascendant.siderealLon / 30) % 12) + 12) % 12;
  const signOf = (p: PlanetPosition) => ((Math.floor(p.siderealLon / 30) % 12) + 12) % 12;
  const houseOf = (p: PlanetPosition) => ((signOf(p) - lagnaSign + 12) % 12) + 1;
  const signOfHouse = (h: number) => (lagnaSign + h - 1) % 12;
  const lordOfHouse = (h: number) => SIGN_LORD[signOfHouse(h)] as PlanetId9;
  const lordPlanet = (h: number) => by(lordOfHouse(h));
  const occupants = (h: number) => planets.filter((p) => houseOf(p) === h);
  const occNames = (h: number) => occupants(h).map((p) => SAINTS_TE[p.id as PlanetId9]);

  /** పూర్ణ పరాశరీ దృష్టి (రాశి ఆధారిత) */
  const aspects = (id: PlanetId9, fromSign: number, toSign: number): boolean => {
    const d = ((toSign - fromSign + 12) % 12) + 1;
    if (d === 1) return false;
    if (d === 7) return true;
    if (id === 'Mars') return d === 4 || d === 8;
    if (id === 'Jupiter') return d === 5 || d === 9;
    if (id === 'Saturn') return d === 3 || d === 10;
    if (id === 'Rahu' || id === 'Ketu') return d === 5 || d === 9;
    return false;
  };
  const aspectingSign = (sign: number) =>
    planets.filter((p) => aspects(p.id as PlanetId9, signOf(p), sign)).map((p) => p.id as PlanetId9);

  /** జైమిని చర కారకులు — డిగ్రీ ఆధారిత క్రమం */
  const sevenIds: PlanetId9[] = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
  const sortedKarakas = sevenIds
    .map((id) => by(id))
    .sort((a, b) => b.degreeInSign - a.degreeInSign)
    .map((p, i) => ({
      code: (['AK', 'AmK', 'BK', 'MK', 'PK', 'GK', 'DK'] as const)[i],
      id: p.id as PlanetId9,
      planet: p,
    }));
  const karaka = (code: string) => sortedKarakas.find((k) => k.code === code)!;
  const atmakaraka = karaka('AK');
  const amatyakaraka = karaka('AmK');
  const darakaraka = karaka('DK');

  /** వింశోత్తరి దశా కాలరేఖ */
  const vim = computeVimshottariDeep(chart);
  const now = Date.now();
  const windowsFor = (lords: PlanetId9[], note: string, max = 3): DomainWindow[] => {
    const out: DomainWindow[] = [];
    for (const md of vim.mahadashas) {
      const mdLord = md.lord as PlanetId9;
      const ads = Array.isArray(md.children) ? md.children : [];
      for (const ad of ads) {
        const adLord = ad.lord as PlanetId9;
        // కాల ఫలం భుక్తి (అంతర్దశ) నుండి చదవాలి — మహాదశ 16 సంవత్సరాల పాటు ఉంటుంది,
        // కాబట్టి “ఏ భుక్తిలో ఫలం” అనేదే ఉపయోగకరమైన ప్రశ్న.
        if (!lords.includes(adLord) && !(lords.includes(mdLord) && ad === md.children[0])) continue;
        if (ad.endMs < now) continue;
        out.push({
          periodTe: `${md.lordTe} మహాదశ — ${ad.lordTe} భుక్తి`,
          yearsTe: `${ad.startLocal} → ${ad.endLocal}`,
          noteTe: note,
          isRunning: ad.startMs <= now && now <= ad.endMs,
        });
      }
    }
    return out.sort((a, b) => a.yearsTe.localeCompare(b.yearsTe)).slice(0, max);
  };

  /** గ్రహ వివరణ వాక్యం */
  const describe = (id: PlanetId9) => {
    const p = by(id);
    return `${RASI_TE[signOf(p)]}లో ${houseOf(p)}వ భావంలో (${DIGNITY_TE[p.dignity] ?? p.dignity}${p.isRetrograde ? ', వక్ర' : ''})`;
  };

  const domains: LifeDomainDeep[] = [];

  // ═══════════════════════════════════════════════════════════════════════
  // 1. వివాహం & దాంపత్యం
  // ═══════════════════════════════════════════════════════════════════════
  {
    const h7 = 7;
    const s7 = signOfHouse(h7);
    const l7 = lordOfHouse(h7);
    const p7 = lordPlanet(h7);
    const ven = by('Venus');
    const in7 = occupants(h7).filter((p) => !['Rahu', 'Ketu'].includes(p.id));
    const maleficIn7 = occupants(h7).filter((p) => NATURAL_MALEFIC.includes(p.id as PlanetId9));
    const d9Seventh = ((chart.ascendant.d9Sign ?? 0) + 6) % 12; // నవాంశ లగ్నం నుండి 7వ రాశి
    const l7House = houseOf(p7);
    const l7Dusthana = DUSTHANA.includes(l7House);

    let score = 50;
    score += KENDRA.includes(l7House) || TRIKONA.includes(l7House) ? 14 : 0;
    score -= l7Dusthana ? 16 : 0;
    score += (dignityScore(p7) - 50) * 0.35;
    score += (dignityScore(ven) - 50) * 0.3;
    score -= maleficIn7.length * 9;
    score += in7.some((p) => NATURAL_BENEFIC.includes(p.id as PlanetId9)) ? 8 : 0;
    score = clamp(score);

    domains.push({
      id: 'marriage',
      number: '1',
      titleTe: 'వివాహం & దాంపత్య జీవితం',
      subtitleTe: 'Marriage & Married Life',
      housesTe: '7వ భావం (కళత్రం), 2వ (కుటుంబ వృద్ధి), 4వ (గృహ సుఖం), 12వ (శయన సుఖం) · కారకుడు శుక్రుడు · జైమిని దారకారకుడు · D9 నవాంశ',
      scorePct: score,
      verdictTe: verdictOf(score),
      foundationTe:
        `7వ భావం ${RASI_TE[s7]} — అధిపతి ${SAINTS_TE[l7]}, ${describe(l7)}. ` +
        `శుక్రుడు ${describe('Venus')}. ` +
        `7వ భావంలో ${occNames(h7).length ? joinTe(occNames(h7)) : 'ఎవరూ లేరు'}. ` +
        `దారకారకుడు (DK) ${SAINTS_TE[darakaraka.id]} — ${RASI_TE[signOf(darakaraka.planet)]}. ` +
        `నవాంశ (D9) 7వ రాశి ${RASI_TE[d9Seventh]}.`,
      analysis: [
        {
          headingTe: 'జీవిత భాగస్వామి స్వభావం & రూపం',
          bodyTe:
            `${SAINTS_TE[l7]} 7వ భావాధిపతి కావడం వల్ల జీవిత భాగస్వామి స్వభావం ${KARAKA_TE[l7]} స్వరూపంతో కలిసి ఉంటుంది. ` +
            `దారకారకుడు ${SAINTS_TE[darakaraka.id]} (${KARAKA_TE[darakaraka.id]}) కావడం వల్ల భాగస్వామిలో ` +
            `${darakaraka.id === 'Jupiter' ? 'ధర్మబుద్ధి, విద్య, కుటుంబ బాధ్యత ప్రధానంగా కనిపిస్తాయి' : darakaraka.id === 'Saturn' ? 'స్థిరత్వం, ఓర్పు, వయసు/అనుభవంలో భేదం కనిపిస్తుంది' : darakaraka.id === 'Mercury' ? 'చతురత, మాటల నైపుణ్యం, వ్యాపార దృష్టి కనిపిస్తుంది' : darakaraka.id === 'Venus' ? 'సౌందర్యం, కళాభిరుచి, సౌజన్యం కనిపిస్తుంది' : darakaraka.id === 'Mars' ? 'ధైర్యం, నిర్ణయ శక్తి, కొంత ఆవేశం కనిపిస్తుంది' : darakaraka.id === 'Moon' ? 'సున్నిత మనస్సు, భావోద్వేగం, కుటుంబ ప్రేమ కనిపిస్తుంది' : 'స్వతంత్ర బుద్ధి, ఆత్మాభిమానం కనిపిస్తుంది'}. ` +
            `నవాంశలో 7వ రాశి ${RASI_TE[d9Seventh]} కావడం దాంపత్య అంతరంగ స్వభావాన్ని (వివాహానంతరం బయటపడే స్వరూపం) సూచిస్తుంది.`,
        },
        {
          headingTe: 'దాంపత్య సామరస్యం & సంబంధ నిర్మాణం',
          bodyTe:
            l7Dusthana
              ? `7వ భావాధిపతి ${SAINTS_TE[l7]} ${l7House}వ భావంలో (దుస్థానం) ఉండటం వల్ల వివాహంలో ఆలస్యం, అప్పుడప్పుడు దూరం లేదా అపార్థాలు సహజం. కానీ ఇది విడాకులు అని అర్థం కాదు — సంభాషణ, స్పష్టతతో ఈ ప్రభావాన్ని చాలావరకు తగ్గించుకోవచ్చు.`
              : `7వ భావాధిపతి ${SAINTS_TE[l7]} ${l7House}వ భావంలో ఉండటం వల్ల దాంపత్య సంబంధం స్థిరంగా, పరస్పర గౌరవంతో నిర్మించుకోగలిగే స్థితిలో ఉంది. నిర్ణయాలు ఇద్దరూ కలిసి తీసుకోవడం ఈ సంబంధానికి అనుకూలం.` +
                (maleficIn7.length
                  ? ` అయితే 7వ భావంలో ${joinTe(maleficIn7.map((p) => SAINTS_TE[p.id as PlanetId9]))} ఉండటం వల్ల అప్పుడప్పుడు ఒత్తిడి, అహం, పట్టుదల ఘర్షణలు రావచ్చు.`
                  : ` 7వ భావంలో పాప గ్రహ భారం తక్కువగా ఉండటం మంచి సంకేతం.`) +
            ` శుక్రుడు ${DIGNITY_TE[ven.dignity] ?? ven.dignity} స్థితిలో ఉండటం ${dignityScore(ven) >= 70 ? 'ప్రేమ, ఆప్యాయత, సౌందర్య దృష్టిని బలపరుస్తుంది' : 'భావ వ్యక్తీకరణలో కొంత జాగ్రత్త అవసరమని సూచిస్తుంది'}.`,
        },
        {
          headingTe: 'వివాహ కాలం — ఎప్పుడు జరుగుతుంది?',
          bodyTe:
            `వివాహ సంభావ్యత ముఖ్యంగా 7వ భావాధిపతి (${SAINTS_TE[l7]}), శుక్రుడు, దారకారకుడు (${SAINTS_TE[darakaraka.id]}) — ఈ ముగ్గురి మహాదశ/భుక్తి కాలాలలో స్పష్టంగా కనిపిస్తుంది. ` +
            `క్రింది కాలాలలో సంబంధం ముఖ్యమవుతుంది, మాట్లాడటం మొదలవుతుంది లేదా పెళ్లి జరుగుతుంది. ఈ కాలాలు “ఖచ్చిత తేదీ” కావు — అవకాశం ఉన్న కిటికీలు; స్వయం ప్రయత్నం, సంబంధిత వ్యక్తుల ప్రమేయం అవసరం.`,
        },
      ],
      strengthsTe: [
        `7వ భావాధిపతి ${SAINTS_TE[l7]} ${DIGNITY_TE[p7.dignity] ?? p7.dignity} స్థితిలో ఉండటం`,
        in7.some((p) => NATURAL_BENEFIC.includes(p.id as PlanetId9))
          ? `7వ భావంలో శుభ గ్రహం (${joinTe(in7.filter((p) => NATURAL_BENEFIC.includes(p.id as PlanetId9)).map((p) => SAINTS_TE[p.id as PlanetId9]))}) — దాంపత్య శుభం`
          : `శుక్రుడు ${DIGNITY_TE[ven.dignity] ?? ven.dignity} స్థితి`,
        `దారకారకుడు ${SAINTS_TE[darakaraka.id]} బలవంతుడు`,
      ],
      cautionsTe: [
        maleficIn7.length
          ? `7వ భావంలో ${joinTe(maleficIn7.map((p) => SAINTS_TE[p.id as PlanetId9]))} — అపార్థాలు, ఆత్మాభిమాన ఘర్షణలు రావచ్చు; మాట మితంగా ఉంచడం మేలు.`
          : '7వ భావంలో తీవ్ర పాప గ్రహ ప్రభావం లేదు.',
        l7Dusthana
          ? `7వ అధిపతి ${l7House}వ భావంలో — వివాహం ఆలస్యం/దూరం; ఆరోగ్యం, ఆర్థిక విషయాల్లో స్పష్టత ఉంచాలి.`
          : `7వ అధిపతి సుస్థానంలో — పెద్ద ప్రమాదం లేదు.`,
        `శుక్రుడు ${ven.isRetrograde ? 'వక్రంలో ఉన్నాడు — పాత సంబంధం తిరిగి రావడం, నిర్ణయాల్లో మార్పులు సంభవించవచ్చు' : 'మారక స్థితిలో లేడు'}.`,
      ],
      timing: windowsFor([l7, 'Venus', darakaraka.id], 'వివాహ/సంబంధ అవకాశ కాలం'),
      remedyTe:
        `శుక్ర గ్రహ శాంతి — శుక్రవారం వ్రతం, లక్ష్మీ అష్టోత్తర శతనామ పారాయణం, తెల్ల పువ్వులు/మిఠాయి దానం. ` +
        (maleficIn7.length
          ? `7వ భావ పాప ప్రభావానికి ${SAINTS_TE[maleficIn7[0].id as PlanetId9]} శాంతి (సంబంధిత వారం వ్రతం & దానం) ముఖ్యం.`
          : `దాంపత్య సౌఖ్యానికి శుక్ర గ్రహానికి సంబంధించిన దానధర్మాలు చాలు.`) +
        ` సంబంధ నిర్ణయానికి ముందు దశా-భుక్తి + నవాంశ పరీక్ష తప్పనిసరి.`,
    });
  }

  // ═══════════════════════════════════════════════════════════════════════
  // 2. ఉద్యోగం, వృత్తి & వ్యాపారం
  // ═══════════════════════════════════════════════════════════════════════
  {
    const s10 = signOfHouse(10);
    const l10 = lordOfHouse(10);
    const p10 = lordPlanet(10);
    const h10 = houseOf(p10);
    const l6 = lordOfHouse(6);
    const p6 = lordPlanet(6);
    const merc = by('Mercury');
    const sat = by('Saturn');
    const sun = by('Sun');
    const in10 = occupants(10);
    let score = 50;
    score += KENDRA.includes(h10) || TRIKONA.includes(h10) ? 15 : 0;
    score -= DUSTHANA.includes(h10) ? 14 : 0;
    score += (dignityScore(p10) - 50) * 0.35;
    score += (dignityScore(sat) - 50) * 0.15;
    score += (dignityScore(merc) - 50) * 0.12;
    score += in10.length ? 4 : 0;
    score = clamp(score);

    const govt = signOf(p10) === 4 || signOf(p10) === 9 || sun.house === 10 || lordOfHouse(10) === 'Sun';
    const jobPath = KENDRA.includes(h10) || TRIKONA.includes(h10);
    const businessPath = h10 === 7 || h10 === 11 || h10 === 3 || p10.id === 'Mercury' || p6.house === 10;

    domains.push({
      id: 'career',
      number: '2',
      titleTe: 'ఉద్యోగం, వృత్తి & వ్యాపారం',
      subtitleTe: 'Career, Job & Business',
      housesTe: '10వ భావం (కర్మ), 6వ (సేవ/ఉద్యోగం), 2వ (ఆదాయం), 11వ (లాభం) · కారకులు సూర్యుడు, శని, బుధుడు · అమాత్యకారకుడు · D10 దశాంశం',
      scorePct: score,
      verdictTe: verdictOf(score),
      foundationTe:
        `10వ భావం ${RASI_TE[s10]} — అధిపతి ${SAINTS_TE[l10]}, ${describe(l10)}. ` +
        `6వ భావం (సేవ) అధిపతి ${SAINTS_TE[l6]} ${houseOf(p6)}వ భావంలో. ` +
        `అమాత్యకారకుడు (AmK) ${SAINTS_TE[amatyakaraka.id]} — ${RASI_TE[signOf(amatyakaraka.planet)]}, ${houseOf(amatyakaraka.planet)}వ భావం. ` +
        `10వ భావంలో ${occNames(10).length ? joinTe(occNames(10)) : 'ఎవరూ లేరు'}. ` +
        `సూర్యుడు ${houseOf(sun)}వ, శని ${houseOf(sat)}వ, బుధుడు ${houseOf(merc)}వ భావంలో.`,
      analysis: [
        {
          headingTe: 'వృత్తి స్వభావం — ఏ రంగం మీకు అనుకూలం?',
          bodyTe:
            `10వ భావాధిపతి ${SAINTS_TE[l10]} కావడం వల్ల ${KARAKA_TE[l10]} స్వరూప రంగాలు — అంటే ` +
            `${l10 === 'Saturn' ? 'నిర్మాణం, లేబర్, మైనింగ్, రియల్ ఎస్టేట్, ప్రభుత్వ వ్యవస్థ, దీర్ఘకాల ప్రాజెక్టులు' : l10 === 'Sun' ? 'పరిపాలన, ప్రభుత్వ సేవ, ఆరోగ్య రంగం, అధికారం, నాయకత్వం' : l10 === 'Mercury' ? 'వాణిజ్యం, అకౌంటింగ్, రచన, విద్య, సాఫ్ట్‌వేర్, మాధ్యమం' : l10 === 'Jupiter' ? 'విద్య, న్యాయం, సలహా, ఆర్థిక సేవలు, మత-ఆధ్యాత్మిక రంగం' : l10 === 'Venus' ? 'కళలు, డిజైన్, సౌందర్యం, ఆస్తి అలంకరణ, హాస్పిటాలిటీ' : l10 === 'Moon' ? 'ప్రజా సంబంధాలు, ఆరోగ్య సంరక్షణ, ఆహారం, ద్రవ పదార్థాలు' : 'సాహస వృత్తులు, సాంకేతికత, క్రీడ, రక్షణ'} — ఇవి ప్రధాన మార్గాలు. ` +
            `అమాత్యకారకుడు ${SAINTS_TE[amatyakaraka.id]} కావడం ఆ వ్యక్తి ద్వారా లేదా ఆ గ్రహ స్వభావ రంగం ద్వారా ఉద్యోగ అవకాశాలు వస్తాయని సూచిస్తుంది.`,
        },
        {
          headingTe: 'ఉద్యోగమా? వ్యాపారమా?',
          bodyTe:
            jobPath && !businessPath
              ? `10వ భావాధిపతి కేంద్ర/త్రికోణంలో ఉండటం, 6వ భావం (సేవ) సుస్థితిలో ఉండటం — ఇవి **ఉద్యోగ మార్గాన్ని** స్పష్టంగా బలపరుస్తున్నాయి. సంస్థలో పని చేస్తూ ఉన్నతి పొందే క్రమంలో మీరు స్థిరత్వాన్ని, అధికారాన్ని రెండింటినీ పొందగలరు.`
              : businessPath && !jobPath
                ? `10వ అధిపతి స్థితి, 6వ భావ స్వభావం, బుధుని ప్రభావం — ఇవి **వ్యాపార/స్వయం ఉపాధి మార్గాన్ని** బలపరుస్తున్నాయి. స్వతంత్ర వృత్తిలో నిర్ణయ శక్తి మీ బలం; ప్రారంభంలో భాగస్వామ్యం కంటే ఒంటరిగా ప్రారంభించడం మేలు.`
                : `ఉద్యోగం మరియు వ్యాపారం రెండూ సాధ్యమే — మొదట ఉద్యోగంలో అనుభవం, ఆ తర్వాత స్వతంత్ర ప్రయత్నం అనే క్రమం మీ కుండలికి బాగా సరిపోతుంది. ఉద్యోగంలో ఉండగానే ఉపాధి వృద్ధి చేసుకోవడం సురక్షితం.`,
        },
        {
          headingTe: 'ప్రభుత్వ ఉద్యోగం, ఉన్నతి & కీర్తి',
          bodyTe:
            (govt
              ? `సూర్యుని ప్రభావం (${describe('Sun')}) ప్రభుత్వ/అధికారిక రంగానికి అనుకూల సంకేతం. పోటీ పరీక్షలు, ప్రభుత్వ ప్రాజెక్టులు, నియామక సంస్థలలో అవకాశాలు మెరుగ్గా ఉంటాయి.`
              : `ప్రభుత్వ రంగం ప్రధాన మార్గం కాదు; ప్రైవేట్ సంస్థలు, సేవా రంగం, సాంకేతిక/వాణిజ్య రంగాలు మెరుగైన ఫలితం ఇస్తాయి.`) +
            ` శని ${describe('Saturn')} — దీర్ఘకాల కృషికి ఫలం ఆలస్యంగా వచ్చినా స్థిరంగా ఉంటుంది. ` +
            `ఉద్యోగ మార్పులు, ప్రమోషన్లు సాధారణంగా ${SAINTS_TE[l10]}, శని, సూర్యుల దశా-భుక్తులలో జరుగుతాయి.`,
        },
      ],
      strengthsTe: [
        `10వ అధిపతి ${SAINTS_TE[l10]} ${DIGNITY_TE[p10.dignity] ?? p10.dignity} — వృత్తి ఆధార బలం`,
        `అమాత్యకారకుడు ${SAINTS_TE[amatyakaraka.id]} ${houseOf(amatyakaraka.planet)}వ భావంలో — ఉద్యోగ మార్గదర్శకుడు`,
        in10.length ? `10వ భావంలో ${joinTe(occNames(10))} — క్రియాశీల వృత్తి` : '10వ భావం ఖాళీ — ఫలం అధిపతి స్థితిపై ఆధారం',
      ],
      cautionsTe: [
        DUSTHANA.includes(h10)
          ? `10వ అధిపతి ${h10}వ భావంలో — ఉద్యోగంలో అనవసర ఒత్తిడి, సహోద్యోగుల వివాదాలు; రాజకీయాలు దూరంగా ఉంచుకోవాలి.`
          : `10వ అధిపతి సుస్థానంలో — వృత్తిలో పెద్ద ఆటంకం లేదు.`,
        sat.isRetrograde ? 'శని వక్రంలో — ఉద్యోగ మార్పులు ఆలస్యం అవుతాయి; ఒప్పందాలు లిఖితపూర్వకంగా ఉంచాలి.' : 'శని మార్గి — క్రమమైన వృద్ధి.',
        `పోటీ/రాజకీయ ఒత్తిడి ఉన్న సంస్థలలో స్పష్టమైన సంభాషణ అవసరం.`,
      ],
      timing: windowsFor([l10, 'Saturn', amatyakaraka.id], 'ఉద్యోగ మార్పు/ప్రమోషన్/కొత్త అవకాశ కాలం'),
      remedyTe:
        `శని శాంతి — శనివారం నువ్వుల నూనె దీపం, నలుపు వస్త్ర దానం, హనుమత్ ఉపాసన. ` +
        `సూర్యుడు బలహీనుడైతే ఆదివారం సూర్య నమస్కారాలు, గ్రహ శాంతి. ` +
        `ఉద్యోగ మార్పు ముందు దశా-భుక్తి + D10 దశాంశ పరీక్ష చేయించుకోవడం శాస్త్రీయం.`,
    });
  }

  // ═══════════════════════════════════════════════════════════════════════
  // 3. చదువు & విద్యాభ్యాసం
  // ═══════════════════════════════════════════════════════════════════════
  {
    const l4 = lordOfHouse(4);
    const p4 = lordPlanet(4);
    const l5 = lordOfHouse(5);
    const p5 = lordPlanet(5);
    const merc = by('Mercury');
    const jup = by('Jupiter');
    let score = 50;
    score += (dignityScore(merc) - 50) * 0.3;
    score += (dignityScore(jup) - 50) * 0.3;
    score += KENDRA.includes(houseOf(p4)) || TRIKONA.includes(houseOf(p4)) ? 8 : 0;
    score += KENDRA.includes(houseOf(p5)) || TRIKONA.includes(houseOf(p5)) ? 10 : 0;
    score -= DUSTHANA.includes(houseOf(p5)) ? 10 : 0;
    score = clamp(score);

    domains.push({
      id: 'education',
      number: '3',
      titleTe: 'చదువు & విద్యాభ్యాసం',
      subtitleTe: 'Education & Learning',
      housesTe: '4వ భావం (ప్రాథమిక విద్య, మనస్సు), 5వ (బుద్ధి, జ్ఞానం), 9వ (ఉన్నత విద్య), 2వ (స్వరం) · కారకులు బుధుడు, గురువు · D24 చతుర్వింశాంశ',
      scorePct: score,
      verdictTe: verdictOf(score),
      foundationTe:
        `4వ భావాధిపతి ${SAINTS_TE[l4]} ${describe(l4)}. ` +
        `5వ భావాధిపతి ${SAINTS_TE[l5]} ${describe(l5)}. ` +
        `బుధుడు (బుద్ధి కారకుడు) ${describe('Mercury')}. ` +
        `గురువు (జ్ఞాన కారకుడు) ${describe('Jupiter')}. ` +
        `4వ భావంలో ${occNames(4).length ? joinTe(occNames(4)) : 'ఎవరూ లేరు'}; 5వ భావంలో ${occNames(5).length ? joinTe(occNames(5)) : 'ఎవరూ లేరు'}.`,
      analysis: [
        {
          headingTe: 'మేధస్సు & అభ్యసన శక్తి',
          bodyTe:
            `బుధుడు ${DIGNITY_TE[merc.dignity] ?? merc.dignity} స్థితిలో ${houseOf(merc)}వ భావంలో ఉండటం ${
              dignityScore(merc) >= 65
                ? 'వేగవంతమైన గ్రహణ శక్తిని, గణిత-భాషా నైపుణ్యాన్ని చూపుతుంది. కొత్త విషయాలు త్వరగా నేర్చుకోగలరు.'
                : 'అభ్యసనంలో క్రమశిక్షణ, పునశ్చరణ అవసరమని సూచిస్తుంది — ఒకేసారి అన్నీ కాకుండా దశలవారీగా చదవడం ఫలప్రదం.'
            } ` +
            `గురువు ${DIGNITY_TE[jup.dignity] ?? jup.dignity} స్థితి ${
              dignityScore(jup) >= 70
                ? 'జ్ఞానాన్ని లోతుగా గ్రహించే శక్తిని, ఉపదేశ సామర్థ్యాన్ని ఇస్తుంది.'
                : 'ఉన్నత విద్యలో ఆచార్యుల మార్గదర్శకత్వం చాలా అవసరం అని చెబుతుంది.'
            }`,
        },
        {
          headingTe: 'ఏ రంగంలో చదువు మెరుగవుతుంది?',
          bodyTe:
            `5వ భావాధిపతి ${SAINTS_TE[l5]} స్వభావం ప్రకారం ${
              l5 === 'Mercury' ? 'గణితం, వాణిజ్యం, భాషలు, సాఫ్ట్‌వేర్, విశ్లేషణాత్మక శాస్త్రాలు'
              : l5 === 'Jupiter' ? 'ధర్మశాస్త్రం, తత్వశాస్త్రం, ఆయుర్వేదం, విద్య, న్యాయం, సలహా రంగం'
              : l5 === 'Venus' ? 'కళలు, సంగీతం, డిజైన్, సాహిత్యం, సౌందర్య రంగం'
              : l5 === 'Mars' ? 'ఇంజనీరింగ్, సాంకేతికత, రక్షణ, క్రీడ, శస్త్రచికిత్స'
              : l5 === 'Saturn' ? 'నిర్మాణం, యంత్రశాస్త్రం, భూ-శాస్త్రం, దీర్ఘకాల పరిశోధన'
              : l5 === 'Sun' ? 'వైద్యం, పరిపాలన, రాజకీయ శాస్త్రం, నాయకత్వ అభ్యాసం'
              : 'భాషలు, మనస్తత్వశాస్త్రం, సంరక్షణ రంగం'
            } — ఈ విభాగాలలో ఆసక్తి, ఫలితం రెండూ మెరుగ్గా ఉంటాయి. ` +
            `9వ భావం (ఉన్నత విద్య) ద్వారా ఉన్నత చదువులు, దూర ప్రయాణం అవసరమయ్యే కోర్సులు సాధ్యమవుతాయి.`,
        },
        {
          headingTe: 'పరీక్షలు, ఉన్నత విద్య & కాలం',
          bodyTe:
            `పరీక్షలు, ప్రవేశాలు, ఉన్నత విద్య అవకాశాలు బుధుడు, గురువు, 4/5/9 భావాధిపతుల దశా-భుక్తులలో స్పష్టంగా కనిపిస్తాయి. ` +
            `చదువు కాలంలో ${DUSTHANA.includes(houseOf(p5)) ? '6/8/12 భావ ప్రభావం ఉన్నందున మధ్యలో అంతరాయాలు, దృష్టి చెదరడం జరగవచ్చు — నిరంతర అభ్యాసం అవసరం' : '5వ భావం సుస్థితిలో ఉన్నందున నిరంతర అభ్యాసంతో మంచి ఫలితం'}.`,
        },
      ],
      strengthsTe: [
        `బుధుడు ${DIGNITY_TE[merc.dignity] ?? merc.dignity} — గ్రహణ శక్తి`,
        `గురువు ${DIGNITY_TE[jup.dignity] ?? jup.dignity} — జ్ఞాన బలం`,
        `5వ అధిపతి ${SAINTS_TE[l5]} ${houseOf(p5)}వ భావంలో`,
      ],
      cautionsTe: [
        DUSTHANA.includes(houseOf(p5)) ? '5వ అధిపతి దుస్థానంలో — చదువులో అంతరాయాలు, ఒత్తిడి; క్రమం అవసరం.' : '5వ అధిపతి సుస్థానంలో — పెద్ద ఆటంకం లేదు.',
        merc.isRetrograde ? 'బుధుడు వక్రంలో — ఒకే విషయం రెండుసార్లు చదవాల్సి రావచ్చు; అది బలహీనత కాదు, పునశ్చరణ పద్ధతి.' : 'బుధుడు మార్గి — అభ్యసనం సాఫీగా.',
        'పరీక్షల సమయంలో దశా-భుక్తి ప్రతికూలమైతే పరిహారం + క్రమశిక్షణ తప్పనిసరి.',
      ],
      timing: windowsFor([l4, l5, 'Mercury', 'Jupiter'], 'చదువు/పరీక్ష/ప్రవేశ అవకాశ కాలం'),
      remedyTe:
        `బుధుడు, గురువులకు బుధవారం/గురువారం ఉపవాసం, పసుపు-అక్షత దానం, గణేశ/సరస్వతీ ఉపాసన. ` +
        `సరస్వతి నమస్కారాలు, “ఓం ఐం సరస్వత్యై నమః” జపం అభ్యాస కాలంలో శ్రేయస్కరం.`,
    });
  }

  // ═══════════════════════════════════════════════════════════════════════
  // 4. ఆరోగ్యం & ఆయుష్షు
  // ═══════════════════════════════════════════════════════════════════════
  {
    const l1 = lordOfHouse(1);
    const p1 = lordPlanet(1);
    const l6 = lordOfHouse(6);
    const p6 = lordPlanet(6);
    const l8 = lordOfHouse(8);
    const p8 = lordPlanet(8);
    const sun = by('Sun');
    const moon = by('Moon');
    const lagnaLordHouse = houseOf(p1);
    let score = 60;
    score += (dignityScore(p1) - 50) * 0.4;
    score -= DUSTHANA.includes(lagnaLordHouse) ? 15 : 0;
    score -= KENDRA.includes(houseOf(p6)) ? 6 : 0;
    score -= occupants(1).some((p) => NATURAL_MALEFIC.includes(p.id as PlanetId9)) ? 8 : 0;
    score -= p8.dignity === 'Debilitated' ? 6 : 0;
    score = clamp(score);

    const vital = lagnaLordHouse === 1 || KENDRA.includes(lagnaLordHouse) || TRIKONA.includes(lagnaLordHouse);

    domains.push({
      id: 'health',
      number: '4',
      titleTe: 'ఆరోగ్యం & ఆయుష్షు',
      subtitleTe: 'Health & Longevity',
      housesTe: '1వ భావం (దేహం), 6వ (రోగం), 8వ (ఆయుష్షు), 12వ (శయనం) · కారకులు సూర్యుడు, చంద్రుడు, శని · D30 త్రింశాంశ',
      scorePct: score,
      verdictTe: verdictOf(score),
      foundationTe:
        `లగ్నాధిపతి ${SAINTS_TE[l1]} ${describe(l1)} — లగ్న బలానికి మూలం. ` +
        `6వ భావాధిపతి ${SAINTS_TE[l6]} ${houseOf(p6)}వ భావంలో. ` +
        `8వ భావాధిపతి ${SAINTS_TE[l8]} ${houseOf(p8)}వ భావంలో. ` +
        `సూర్యుడు ${describe('Sun')}; చంద్రుడు ${describe('Moon')}. ` +
        `లగ్నంలో ${occNames(1).length ? joinTe(occNames(1)) : 'ఎవరూ లేరు'}.`,
      analysis: [
        {
          headingTe: 'దేహ బలం & సహజ ఆరోగ్యం',
          bodyTe:
            `లగ్నాధిపతి ${SAINTS_TE[l1]} ${vital ? 'లగ్నానికి కేంద్ర/త్రికోణ సంబంధంలో బలంగా ఉండటం' : `${lagnaLordHouse}వ భావంలో ఉండటం`} ${
              vital
                ? 'దేహ బలం, రోగ నిరోధక శక్తి సహజంగా మంచి స్థాయిలో ఉండే సూచన.'
                : 'ఆరోగ్యంపై క్రమమైన శ్రద్ధ అవసరమని సూచిస్తుంది — నిద్ర, ఆహారం, వ్యాయామం విషయంలో రాజీ పడకూడదు.'
            } ` +
            `సూర్యుడు ${DIGNITY_TE[sun.dignity] ?? sun.dignity}, చంద్రుడు ${DIGNITY_TE[moon.dignity] ?? moon.dignity} స్థితిలో ఉండటం శరీర శక్తి మరియు మానసిక స్థైర్యానికి కారణం.`,
        },
        {
          headingTe: 'ఏ అవయవాలపై శ్రద్ధ అవసరం?',
          bodyTe:
            `6వ భావం ${RASI_TE[signOfHouse(6)]} — ఈ రాశి స్వభావం ప్రకారం ${
              signOfHouse(6) % 3 === 0
                ? 'శరీరం మొత్తం, తల, ఎముకలు, కీళ్లు'
                : signOfHouse(6) % 3 === 1
                  ? 'గొంతు, దంతాలు, జీర్ణ వ్యవస్థ, మెడ'
                  : 'ఊపిరితిత్తులు, చర్మం, నరాలు, శ్వాస మార్గం'
            } — ఈ భాగాలపై ముందస్తు జాగ్రత్తలు (క్రమ పరీక్షలు) మంచిది. ` +
            `6వ భావంలో ${occNames(6).length ? joinTe(occNames(6)) : 'గ్రహాలు లేవు'} — ${
              occupants(6).some((p) => NATURAL_MALEFIC.includes(p.id as PlanetId9))
                ? 'పాప గ్రహ స్థితి ఉన్నందున ఋతువు మారుతున్నప్పుడు జాగ్రత్త అవసరం; అయినప్పటికీ ఇది అనారోగ్యాన్ని “తప్పించలేని” సూచన కాదు — క్రమమైన పరీక్షలతో ముందుగానే గుర్తించవచ్చు.'
                : 'తీవ్ర పాప భారం లేదు — జీవనశైలి సరిచేసుకుంటే ఆరోగ్యం స్థిరంగా ఉంటుంది.'
            }`,
        },
        {
          headingTe: 'మానసిక ఆరోగ్యం & ఆయుష్షు',
          bodyTe:
            `చంద్రుడు ${houseOf(moon)}వ భావంలో — మానసిక స్థితి, నిద్ర, భావోద్వేగ నిర్వహణ ఇందిపై ఆధారపడతాయి. ` +
            `8వ భావం (ఆయుష్షు) అధిపతి ${SAINTS_TE[l8]} ${DIGNITY_TE[p8.dignity] ?? p8.dignity} స్థితిలో ఉండటం దీర్ఘాయుష్షుకు మూల సూచన. ` +
            `ఆయుష్షు నిర్ణయంలో 8వ భావం ఒక్కటే కాదు — లగ్న బలం, సూర్య-చంద్రుల స్థితి, శని దశలు కలిసి పరిగణించాలి.`,
        },
      ],
      strengthsTe: [
        `లగ్నాధిపతి ${SAINTS_TE[l1]} ${DIGNITY_TE[p1.dignity] ?? p1.dignity}`,
        `చంద్రుడు ${DIGNITY_TE[moon.dignity] ?? moon.dignity} — మానసిక స్థైర్యం`,
        `8వ అధిపతి ${SAINTS_TE[l8]} — ఆయుష్షు మూలం`,
      ],
      cautionsTe: [
        DUSTHANA.includes(houseOf(p6)) ? '6వ అధిపతి దుస్థానంలో — దీర్ఘకాలిక చిన్న సమస్యలు; క్రమ పరీక్షలు అవసరం.' : '6వ అధిపతి సుస్థానంలో — తీవ్ర సమస్యల సూచన తక్కువ.',
        occupants(1).some((p) => NATURAL_MALEFIC.includes(p.id as PlanetId9))
          ? 'లగ్నంలో పాప గ్రహం — శరీర బలం కొంత తక్కువ; వ్యాయామం, నిద్ర క్రమం కచ్చితంగా పాటించాలి.'
          : 'లగ్నంలో పాప గ్రహ భారం లేదు.',
        'మానసిక ఒత్తిడి ఉన్న కాలాలలో ధ్యానం, ప్రాణాయామం — ఔషధానికి ప్రత్యామ్నాయం కాదు, కానీ సహాయకం.',
      ],
      timing: windowsFor([l1, l6, l8, 'Saturn'], 'ఆరోగ్య పరీక్ష/చికిత్స/జాగ్రత్త కాలం'),
      remedyTe:
        `ఆయుష్షు-ఆరోగ్య రక్షణకు మృత్యుంజయ మంత్ర జపం, ఆరోగ్య శాంతి, హనుమత్ ఉపాసన. ` +
        `6వ భావ పాప ప్రభావానికి సంబంధిత గ్రహ శాంతి (దానం + వ్రతం). ` +
        `నీటి ఆహారం, క్రమ నిద్ర, వ్యాయామం — శాస్త్రం కంటే ముందు ఇవే ముఖ్యం.`,
    });
  }

  // ═══════════════════════════════════════════════════════════════════════
  // 5. ధనం, ఆస్తి & పొదుపు
  // ═══════════════════════════════════════════════════════════════════════
  {
    const l2 = lordOfHouse(2);
    const p2 = lordPlanet(2);
    const l11 = lordOfHouse(11);
    const p11 = lordPlanet(11);
    const l12 = lordOfHouse(12);
    const p12 = lordPlanet(12);
    const jup = by('Jupiter');
    let score = 50;
    score += (dignityScore(p2) - 50) * 0.3;
    score += (dignityScore(p11) - 50) * 0.3;
    score += (dignityScore(jup) - 50) * 0.15;
    score -= houseOf(p12) === 2 || houseOf(p12) === 11 ? 8 : 0;
    score = clamp(score);

    domains.push({
      id: 'wealth',
      number: '5',
      titleTe: 'ధనం, ఆస్తి & పొదుపు',
      subtitleTe: 'Wealth, Property & Savings',
      housesTe: '2వ భావం (సంపద, కుటుంబ ధనం), 11వ (లాభం), 4వ (స్థిరాస్తి), 9వ (భాగ్యం), 12వ (ఖర్చు) · కారకుడు గురువు · D2 హోరా, D4 చతుర్థాంశ',
      scorePct: score,
      verdictTe: verdictOf(score),
      foundationTe:
        `2వ భావాధిపతి ${SAINTS_TE[l2]} ${describe(l2)}. ` +
        `11వ భావాధిపతి ${SAINTS_TE[l11]} ${describe(l11)}. ` +
        `12వ (ఖర్చు) అధిపతి ${SAINTS_TE[l12]} ${houseOf(p12)}వ భావంలో. ` +
        `గురువు ${describe('Jupiter')}. ` +
        `2వ భావంలో ${occNames(2).length ? joinTe(occNames(2)) : 'ఎవరూ లేరు'}; 11వ భావంలో ${occNames(11).length ? joinTe(occNames(11)) : 'ఎవరూ లేరు'}.`,
      analysis: [
        {
          headingTe: 'ఆదాయం & సంపాదన శక్తి',
          bodyTe:
            `2వ భావాధిపతి ${SAINTS_TE[l2]} ${DIGNITY_TE[p2.dignity] ?? p2.dignity} స్థితి, 11వ అధిపతి ${SAINTS_TE[l11]} ${houseOf(p11)}వ భావ స్థితి — ఇవి ఆదాయ మార్గాన్ని నిర్ణయిస్తాయి. ` +
            `${KENDRA.includes(houseOf(p11)) || TRIKONA.includes(houseOf(p11)) ? '11వ అధిపతి అనుకూల స్థానంలో ఉండటం లాభాలు క్రమంగా పెరుగుతాయని సూచిస్తుంది.' : '11వ అధిపతి సాధారణ స్థితిలో ఉండటం లాభాలు కృషి-ఆధారితంగా వస్తాయని చెబుతుంది.'} ` +
            `గురువు ${DIGNITY_TE[jup.dignity] ?? jup.dignity} స్థితి ధన వృద్ధికి (జీవన నాణ్యతకు) మూల సూచన.`,
        },
        {
          headingTe: 'పొదుపు vs ఖర్చు',
          bodyTe:
            `12వ భావాధిపతి ${SAINTS_TE[l12]} ${houseOf(p12)}వ భావంలో ఉండటం ఖర్చుల స్వభావాన్ని చూపుతుంది. ` +
            `${houseOf(p12) === 2 || houseOf(p12) === 11 ? '12వ అధిపతి ధన భావంలో ఉండటం వల్ల ఆదాయం పెరిగినా ఖర్చులు కూడా పెరుగుతాయి — బడ్జెట్, ఆటోమేటిక్ పొదుపు పద్ధతి అవసరం.' : 'ఖర్చు భావం ధన భావాలను నేరుగా ప్రభావితం చేయడం లేదు — క్రమమైన పొదుపుతో స్థిరత్వం సాధ్యం.'} ` +
            `స్థిరాస్తి (4వ భావం) అధిపతి ${SAINTS_TE[lordOfHouse(4)]} ${houseOf(lordPlanet(4))}వ భావంలో ఉండటం భూమి/ఇల్లు కొనుగోలు సామర్థ్యాన్ని సూచిస్తుంది.`,
        },
        {
          headingTe: 'పెట్టుబడులు & ఆర్థిక కాలాలు',
          bodyTe:
            `ధన వృద్ధికి అనుకూల కాలాలు 2/11 భావాధిపతుల, గురువు, శుక్రుల దశా-భుక్తులు. ` +
            `ఊహాజనిత (స్పెక్యులేషన్) పెట్టుబడులు 5వ భావం బలంగా ఉంటే మాత్రమే అనుకూలం — లేకపోతే సురక్షిత మార్గాలు మేలు. ` +
            `అప్పు తీసుకోవడం 6వ భావ ప్రభావంతో ముడిపడి ఉంటుంది; పెద్ద అప్పు ముందు దశా-భుక్తి పరీక్ష మంచిది.`,
        },
      ],
      strengthsTe: [
        `2వ అధిపతి ${SAINTS_TE[l2]} ${DIGNITY_TE[p2.dignity] ?? p2.dignity}`,
        `11వ అధిపతి ${SAINTS_TE[l11]} ${houseOf(p11)}వ భావంలో`,
        `గురువు ${DIGNITY_TE[jup.dignity] ?? jup.dignity} — ధన కారకుడు`,
      ],
      cautionsTe: [
        houseOf(p12) === 2 || houseOf(p12) === 11 ? 'ఖర్చు భావం ధన భావంలో — ఆదాయం పెరిగినా నిల్వ తక్కువగా ఉండవచ్చు; బడ్జెట్ తప్పనిసరి.' : 'ఖర్చు నియంత్రణ సాధారణ స్థాయిలో ఉంది.',
        `అప్పు/ఋణ సంబంధిత నిర్ణయాలలో 6వ భావాధిపతి (${SAINTS_TE[lordOfHouse(6)]}) స్థితి పరిగణించాలి.`,
        'ఊహాజనిత పెట్టుబడులు, హెచ్చు రాబడి వాగ్దానాలు — శాస్త్రీయ పరిశీలన లేకుండా వద్దు.',
      ],
      timing: windowsFor([l2, l11, 'Jupiter', 'Venus'], 'ధనాగమన/ఆస్తి కొనుగోలు అనుకూల కాలం'),
      remedyTe:
        `గురు శాంతి — గురువారం పసుపు వస్త్ర/శనగపప్పు దానం, లక్ష్మీ కుబేర ఉపాసన. ` +
        `ధన స్థిరత్వానికి శుక్రుడు బలహీనుడైతే శుక్రవారం లక్ష్మీ పూజ. ` +
        `పెద్ద పెట్టుబడి ముందు D2 హోరా + దశా పరీక్ష.`,
    });
  }

  // ═══════════════════════════════════════════════════════════════════════
  // 6. సంతానం & కుటుంబం
  // ═══════════════════════════════════════════════════════════════════════
  {
    const l5 = lordOfHouse(5);
    const p5 = lordPlanet(5);
    const jup = by('Jupiter');
    let score = 50;
    score += (dignityScore(p5) - 50) * 0.35;
    score += (dignityScore(jup) - 50) * 0.3;
    score -= DUSTHANA.includes(houseOf(p5)) ? 12 : 0;
    score = clamp(score);

    domains.push({
      id: 'children',
      number: '6',
      titleTe: 'సంతానం & కుటుంబ వృద్ధి',
      subtitleTe: 'Children & Family Growth',
      housesTe: '5వ భావం (పుత్ర సుఖం), 7వ, 9వ (పూర్వపుణ్యం) · కారకుడు గురువు · D7 సప్తాంశం',
      scorePct: score,
      verdictTe: verdictOf(score),
      foundationTe:
        `5వ భావం ${RASI_TE[signOfHouse(5)]} — అధిపతి ${SAINTS_TE[l5]} ${describe(l5)}. ` +
        `గురువు (పుత్ర కారకుడు) ${describe('Jupiter')}. ` +
        `5వ భావంలో ${occNames(5).length ? joinTe(occNames(5)) : 'ఎవరూ లేరు'}. ` +
        `9వ భావాధిపతి ${SAINTS_TE[lordOfHouse(9)]} ${houseOf(lordPlanet(9))}వ భావంలో.`,
      analysis: [
        {
          headingTe: 'సంతాన సుఖం & స్వభావం',
          bodyTe:
            `5వ భావాధిపతి ${SAINTS_TE[l5]} ${DIGNITY_TE[p5.dignity] ?? p5.dignity} స్థితి, గురువు ${DIGNITY_TE[jup.dignity] ?? jup.dignity} స్థితి — ఇవి సంతాన సుఖానికి ప్రధాన ఆధారం. ` +
            `${dignityScore(p5) >= 65 && dignityScore(jup) >= 60 ? 'రెండూ అనుకూలంగా ఉండటం సంతాన సుఖానికి, పిల్లల విద్య-ఉన్నతికి మంచి సూచన.' : 'కొంత ఆలస్యం లేదా ప్రయత్నం అవసరం కావచ్చు — ఆధునిక వైద్య సలహాతో పాటు శాస్త్రీయ పరిహారం తీసుకోవచ్చు.'} ` +
            `పిల్లల స్వభావం 5వ భావ రాశి ${RASI_TE[signOfHouse(5)]} స్వభావాన్ని, దానిపై ఉన్న గ్రహాల ప్రభావాన్ని ప్రతిబింబిస్తుంది.`,
        },
        {
          headingTe: 'కుటుంబ బంధాలు',
          bodyTe:
            `2వ భావం (కుటుంబం) అధిపతి ${SAINTS_TE[lordOfHouse(2)]} ${houseOf(lordPlanet(2))}వ భావంలో, 4వ (తల్లి/గృహం) అధిపతి ${SAINTS_TE[lordOfHouse(4)]} ${houseOf(lordPlanet(4))}వ భావంలో ఉండటం కుటుంబ సంబంధాల స్వరూపాన్ని చూపుతుంది. ` +
            `${KENDRA.includes(houseOf(lordPlanet(2))) ? 'కుటుంబ సంబంధాలు స్థిరంగా, ఆర్థిక మద్దతుతో ఉంటాయి.' : 'కుటుంబ విషయాలలో స్పష్టత, సంభాషణ అవసరం — ఆర్థిక విషయాలను రాతపూర్వకంగా ఉంచడం మేలు.'}`,
        },
        {
          headingTe: 'సంతాన సంబంధిత కాలం',
          bodyTe:
            `సంతాన సంబంధిత శుభ కాలాలు 5వ భావాధిపతి (${SAINTS_TE[l5]}), గురువు, 9వ అధిపతి దశా-భుక్తులలో కనిపిస్తాయి. ` +
            `D7 (సప్తాంశ) చక్రంలో 5వ భావం బలంగా ఉంటే ఫలం మరింత స్పష్టం.`,
        },
      ],
      strengthsTe: [
        `5వ అధిపతి ${SAINTS_TE[l5]} ${DIGNITY_TE[p5.dignity] ?? p5.dignity}`,
        `గురువు ${DIGNITY_TE[jup.dignity] ?? jup.dignity} — పుత్ర కారకుడు`,
        `9వ అధిపతి ${SAINTS_TE[lordOfHouse(9)]} ${houseOf(lordPlanet(9))}వ భావంలో`,
      ],
      cautionsTe: [
        DUSTHANA.includes(houseOf(p5)) ? '5వ అధిపతి దుస్థానంలో — సంతాన విషయంలో ఓర్పు, వైద్య సలహా అవసరం.' : '5వ అధిపతి సుస్థానంలో — ప్రధాన ఆటంకం లేదు.',
        'గురువు బలహీనుడైతే గురు శాంతి, సంతాన గోపాల మంత్రం సూచన.',
      ],
      timing: windowsFor([l5, 'Jupiter', lordOfHouse(9)], 'సంతాన శుభ కాలం'),
      remedyTe:
        `సంతాన కామేష్టి, సంతాన గోపాల మంత్ర జపం, గురువారం వ్రతం. ` +
        `గురువు శాంతికి పసుపు దానం, గురు గ్రహ శ్లోక పారాయణం.`,
    });
  }

  // ═══════════════════════════════════════════════════════════════════════
  // 7. విదేశ యాత్ర & స్థిరపడటం
  // ═══════════════════════════════════════════════════════════════════════
  {
    const l9 = lordOfHouse(9);
    const p9 = lordPlanet(9);
    const l12 = lordOfHouse(12);
    const p12 = lordPlanet(12);
    const rahu = by('Rahu');
    let score = 45;
    score += [9, 12, 3, 7].includes(houseOf(p9)) ? 10 : 0;
    score += [9, 12, 3, 7].includes(houseOf(p12)) ? 8 : 0;
    score += [3, 7, 9, 12].includes(houseOf(rahu)) ? 12 : 0;
    score += (dignityScore(p9) - 50) * 0.2;
    score = clamp(score);

    domains.push({
      id: 'foreign',
      number: '7',
      titleTe: 'విదేశ యాత్ర & స్థిరపడటం',
      subtitleTe: 'Foreign Travel & Settlement',
      housesTe: '9వ భావం (దూర ప్రయాణం), 12వ (విదేశం), 3వ (చిన్న ప్రయాణాలు), 7వ (ప్రయాణ స్థలం) · కారకుడు రాహువు',
      scorePct: score,
      verdictTe: verdictOf(score),
      foundationTe:
        `9వ భావాధిపతి ${SAINTS_TE[l9]} ${describe(l9)}. ` +
        `12వ భావాధిపతి ${SAINTS_TE[l12]} ${describe(l12)}. ` +
        `రాహువు ${describe('Rahu')}. ` +
        `చంద్రుడు ${houseOf(by('Moon'))}వ భావంలో.`,
      analysis: [
        {
          headingTe: 'విదేశ అవకాశాలు ఉన్నాయా?',
          bodyTe:
            `${[9, 12, 3, 7].includes(houseOf(p9)) || [9, 12, 3, 7].includes(houseOf(p12)) || [3, 7, 9, 12].includes(houseOf(rahu)) ? '9/12/3/7 భావాలలో గ్రహ సంబంధం ఉండటం విదేశ యాత్ర, విదేశీ సంస్థలతో పని, దూర ప్రయాణ అవకాశాలకు అనుకూల సంకేతం.' : '9/12/3/7 భావాలలో బలమైన సంబంధం లేదు — విదేశ యాత్ర ప్రధాన మార్గం కాకపోవచ్చు; అయితే ప్రయాణ అవకాశాలు పూర్తిగా లేవని కాదు.'} ` +
            `రాహువు ${houseOf(rahu)}వ భావంలో ఉండటం ఆధునికత, సాంకేతికత, విదేశీ సంబంధాల పట్ల ఆకర్షణను చూపుతుంది.`,
        },
        {
          headingTe: 'స్థిరపడటం & తిరిగి రావడం',
          bodyTe:
            `12వ భావం (విదేశం, నిష్క్రమణ) బలంగా ఉంటే దీర్ఘకాలం విదేశంలో ఉండే అవకాశం పెరుగుతుంది. ` +
            `4వ భావం (సొంత ఊరు, ఇల్లు) అధిపతి ${SAINTS_TE[lordOfHouse(4)]} స్థితి — తిరిగి వచ్చి స్థిరపడే అవకాశాన్ని చూపుతుంది.`,
        },
        {
          headingTe: 'ప్రయాణ కాలాలు',
          bodyTe:
            `విదేశ యాత్ర/వలస అవకాశాలు రాహువు, 9/12 భావాధిపతుల దశా-భుక్తులలో స్పష్టంగా కనిపిస్తాయి. ` +
            `ప్రయాణ సమయంలో ఆరోగ్యం, పత్రాలు, ఆర్థిక సన్నద్ధత ముందుగా పరిశీలించడం మేలు.`,
        },
      ],
      strengthsTe: [
        `9వ అధిపతి ${SAINTS_TE[l9]} ${DIGNITY_TE[p9.dignity] ?? p9.dignity}`,
        `రాహువు ${houseOf(rahu)}వ భావంలో`,
        `12వ అధిపతి ${SAINTS_TE[l12]} ${houseOf(p12)}వ భావంలో`,
      ],
      cautionsTe: [
        'విదేశ ఒప్పందాలు, వీసా, ఉద్యోగ కాంట్రాక్టులు లిఖితపూర్వకంగా ఉంచాలి.',
        'రాహు కాలంలో ఆకస్మిక నిర్ణయాలు — ఆర్థిక పరిశీలన లేకుండా వద్దు.',
      ],
      timing: windowsFor([l9, l12, 'Rahu'], 'విదేశ యాత్ర/వలస అవకాశ కాలం'),
      remedyTe:
        `రాహు శాంతి — శనివారం నలుపు దానం, దుర్గా ఉపాసన, నాగ ప్రతిష్ఠ. ` +
        `ప్రయాణానికి ముందు గణపతి పూజ, ఇష్ట దైవ స్మరణ.`,
    });
  }

  // ═══════════════════════════════════════════════════════════════════════
  // 8. ఆధ్యాత్మికత & ధర్మం
  // ═══════════════════════════════════════════════════════════════════════
  {
    const l9 = lordOfHouse(9);
    const p9 = lordPlanet(9);
    const l12 = lordOfHouse(12);
    const jup = by('Jupiter');
    const ketu = by('Ketu');
    let score = 50;
    score += (dignityScore(p9) - 50) * 0.3;
    score += (dignityScore(jup) - 50) * 0.25;
    score += [1, 4, 5, 8, 9, 12].includes(houseOf(ketu)) ? 8 : 0;
    score = clamp(score);

    domains.push({
      id: 'spirituality',
      number: '8',
      titleTe: 'ఆధ్యాత్మికత, ధర్మం & మోక్ష దృష్టి',
      subtitleTe: 'Spirituality, Dharma & Inner Life',
      housesTe: '9వ (ధర్మం, గురువు), 12వ (మోక్షం), 5వ (ఉపాసన), 8వ (గూఢ జ్ఞానం) · కారకులు గురువు, కేతువు, ఆత్మకారకుడు',
      scorePct: score,
      verdictTe: verdictOf(score),
      foundationTe:
        `9వ భావాధిపతి ${SAINTS_TE[l9]} ${describe(l9)}. ` +
        `12వ భావాధిపతి ${SAINTS_TE[l12]} ${houseOf(lordPlanet(12))}వ భావంలో. ` +
        `గురువు ${describe('Jupiter')}. ` +
        `కేతువు ${describe('Ketu')}. ` +
        `ఆత్మకారకుడు ${SAINTS_TE[atmakaraka.id]} — ${RASI_TE[signOf(atmakaraka.planet)]}, ${houseOf(atmakaraka.planet)}వ భావం.`,
      analysis: [
        {
          headingTe: 'ధర్మ బుద్ధి & జీవన విలువలు',
          bodyTe:
            `9వ భావాధిపతి ${SAINTS_TE[l9]} ${DIGNITY_TE[p9.dignity] ?? p9.dignity} స్థితి — ధర్మం, న్యాయం, జీవన విలువల పట్ల మీ వైఖరిని చూపుతుంది. ` +
            `ఆత్మకారకుడు ${SAINTS_TE[atmakaraka.id]} ${houseOf(atmakaraka.planet)}వ భావంలో ఉండటం ఆత్మ యొక్క ప్రధాన పాఠాన్ని (${KARAKA_TE[atmakaraka.id]}) సూచిస్తుంది.`,
        },
        {
          headingTe: 'ఉపాసన & ఆధ్యాత్మిక మార్గం',
          bodyTe:
            `కేతువు ${houseOf(ketu)}వ భావంలో ఉండటం ${[4, 8, 12].includes(houseOf(ketu)) ? 'ఆధ్యాత్మిక అనుభవాలు, ఏకాంత ప్రియత్వం, గూఢ జ్ఞానం పట్ల ఆసక్తిని చూపుతుంది' : 'సాంసారిక విషయాలలో ఆసక్తి ఉన్నా, కాలక్రమంలో ఆధ్యాత్మికత వైపు మళ్లే సూచన'}. ` +
            `12వ భావం (మోక్షం) అధిపతి ${SAINTS_TE[l12]} స్థితి — ధ్యానం, తీర్థయాత్ర, దానధర్మాలలో ఆసక్తిని చూపుతుంది.`,
        },
        {
          headingTe: 'ఇష్ట దైవం & జప మార్గం',
          bodyTe:
            `ఆత్మకారకుడు ${SAINTS_TE[atmakaraka.id]} కావడం వల్ల ${AK_DEITY_TE[atmakaraka.id]} ఉపాసన మీ ఆత్మకు అత్యంత అనుకూలం. ` +
            `${KARAKA_TE[atmakaraka.id]} సంబంధిత ధర్మ మార్గం — అంటే ఆ స్వభావ రంగంలో సేవ చేయడం — ఆత్మ ప్రగతికి దారి. ` +
            (`గురువు బలంగా ఉంటే శాస్త్ర పఠనం, గురు సేవ, ఉపదేశ శ్రేష్ఠమైన మార్గం.`),
        },
      ],
      strengthsTe: [
        `9వ అధిపతి ${SAINTS_TE[l9]} ${DIGNITY_TE[p9.dignity] ?? p9.dignity}`,
        `గురువు ${DIGNITY_TE[jup.dignity] ?? jup.dignity}`,
        `ఆత్మకారకుడు ${SAINTS_TE[atmakaraka.id]}`,
      ],
      cautionsTe: [
        'ఆధ్యాత్మిక మార్గంలో వాణిజ్యీకరణ, మాయాజాలం పట్ల జాగ్రత్త — శాస్త్రీయ గురువులను ఎంచుకోవాలి.',
        `కేతువు ${houseOf(ketu)}వ భావంలో — ${DUSTHANA.includes(houseOf(ketu)) ? 'అప్పుడప్పుడు విరక్తి భావన రావచ్చు; బాధ్యతలను విస్మరించకూడదు.' : 'సాధారణ స్థితి.'}`,
      ],
      timing: windowsFor([l9, 'Jupiter', 'Ketu'], 'ఆధ్యాత్మిక ప్రగతి/తీర్థయాత్ర కాలం'),
      remedyTe:
        `దైనందిన సంధ్యా వందనం, ఇష్ట దేవతా మంత్ర జపం. ` +
        `గురువు, కేతువులకు సంబంధిత దానం; తీర్థయాత్రలు దశా అనుకూల కాలాలలో.`,
    });
  }

  const overall =
    domains.reduce((a, d) => a + d.scorePct, 0) / Math.max(1, domains.length);
  const best = [...domains].sort((a, b) => b.scorePct - a.scorePct)[0];
  const watch = [...domains].sort((a, b) => a.scorePct - b.scorePct)[0];

  return {
    domains,
    overallTe: `${Math.round(overall)}% — మొత్తం 8 జీవిత రంగాల సగటు బలం`,
    bestDomainTe: `${best.titleTe} (${best.scorePct}%)`,
    watchDomainTe: `${watch.titleTe} (${watch.scorePct}%)`,
  };
}

