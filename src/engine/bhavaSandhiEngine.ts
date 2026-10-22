/**
 * శ్రీపతి భావ సంధి చక్రం — Śrīpati (Porphyry) bhāva-sandhi chakra.
 *
 * The classical Indian bhāva scheme (Śrīpati Paddhati, also the "Porphyry"
 * division in Western terminology) does NOT use the sign boundaries as house
 * boundaries. Instead:
 *
 *   1. The four angles are the bhāva *madhya* (mid-points) of houses 1, 4, 7, 10
 *      — i.e. the exact ascendant is the 1st bhāva madhya and the exact
 *      midheaven (MC / daśama-bhāva-madhya) is the 10th bhāva madhya.
 *   2. Each quadrant between two angles is trisected, giving the madhya of the
 *      intermediate houses (2, 3, 5, 6, 8, 9, 11, 12).
 *   3. The bhāva *ārambha* (beginning) and *anta* (end) are the exact mid-points
 *      between the neighbouring madhyas, so every bhāva is a continuous arc and
 *      a graha belongs to the bhāva whose arc actually contains it.
 *
 * This is the scheme printed in classical Telugu jātaka patrikās, and it is
 * what the reference chart in `scripts/verify-jathaka.ts` uses (ascendant
 * మిథున 22°37′, 4th madhya కన్య 17°35′, 2nd మధ్య కర్క 20°56′ …).
 *
 * Every sandhi is also resolved to a **rising time** (the clock time at which
 * that degree of the ecliptic crosses the eastern horizon on the birth day),
 * which is how the patrikā's "భావారంభము / భావమధ్య / భావ అంతము" columns are to
 * be read.
 */

import { norm360 } from './astroCore.ts';
import type { CompleteChartResult, PlanetPosition } from './ephemeris.ts';

const NAK_TE = [
  'అశ్విని', 'భరణి', 'కృత్తిక', 'రోహిణి', 'మృగశిర', 'ఆర్ద్ర', 'పునర్వసు',
  'పుష్యమి', 'ఆశ్లేష', 'మఘ', 'పూర్వఫల్గుణి', 'ఉత్తరఫల్గుణి', 'హస్త',
  'చిత్త', 'స్వాతి', 'విశాఖ', 'అనూరాధ', 'జ్యేష్ఠ', 'మూల', 'పూర్వాషాఢ',
  'ఉత్తరాషాఢ', 'శ్రవణం', 'ధనిష్ఠ', 'శతభిష', 'పూర్వాభాద్ర', 'ఉత్తరాభాద్ర', 'రేవతి',
];

export const BHAVA_RASI_TE = [
  'మేషం', 'వృషభం', 'మిథునం', 'కర్కాటకం', 'సింహం', 'కన్యా',
  'తులా', 'వృశ్చికం', 'ధనుస్సు', 'మకరం', 'కుంభం', 'మీనం',
];

export const BHAVA_RASI_SHORT_TE = [
  'మేష', 'వృష', 'మిథు', 'కర్క', 'సింహ', 'కన్య',
  'తుల', 'వృశ్చి', 'ధను', 'మకర', 'కుంభ', 'మీన',
];

export const BHAVA_NAMES_TE = [
  'తనువు (1)',
  'ధనం (2)',
  'సహజం (3)',
  'సుఖం (4)',
  'పుత్రం (5)',
  'రిపు (6)',
  'కళత్రం (7)',
  'మరణం (8)',
  'భాగ్యం (9)',
  'కర్మం (10)',
  'లాభం (11)',
  'వ్యయం (12)',
];

export const BHAVA_PURPOSE_TE = [
  'శరీరం, వ్యక్తిత్వం, ఆయుర్దాయం',
  'ధనం, కుటుంబ వనరులు, వాక్కు',
  'తోబుట్టువులు, పరాక్రమం, ప్రయత్నం',
  'గృహం, మాతృ సుఖం, మనశ్శాంతి',
  'సంతానం, విద్య, పూర్వ పుణ్యం',
  'శత్రువులు, రోగం, ఋణం, సేవ',
  'భాగస్వామ్యం, దాంపత్యం, వ్యాపారం',
  'మరణం, సంక్షోభం, గుప్త విషయాలు',
  'భాగ్యం, ధర్మం, గురువు, తండ్రి',
  'కర్మ, వృత్తి, ప్రతిష్ఠ, రాజ్యం',
  'లాభం, ఆశ, స్నేహితులు',
  'వ్యయం, మోక్షం, విదేశ యాత్ర',
];

export interface BhavaSandhiRow {
  house: number;
  nameTe: string;
  purposeTe: string;
  /** exact mid-point degree of the bhāva (sidereal) */
  madhyaLon: number;
  madhyaRasiTe: string;
  madhyaDegInSign: number;
  madhyaDms: string;
  madhyaNakshatraTe: string;
  madhyaPada: number;
  /** start of the arc = mid-point between previous and current madhya */
  arambhaLon: number;
  arambhaRasiTe: string;
  arambhaDegInSign: number;
  arambhaDms: string;
  antaLon: number;
  antaRasiTe: string;
  antaDegInSign: number;
  antaDms: string;
  /** arc width in degrees (25°–35° in the Śrīpati scheme) */
  spanDeg: number;
  /** rasi (sign) that contains the madhya — used for rasi-lord display */
  lordTe: string;
  planetsTe: string[];
  planetsEn: string[];
  /** does the birth ascendant itself fall in this arc? */
  holdsLagna: boolean;
}

export interface BhavaSandhiReport {
  rows: BhavaSandhiRow[];
  ayanamsaDeg: number;
  mcSiderealLon: number;
  ascSiderealLon: number;
  methodNoteTe: string;
  caveatTe: string;
  /** cross-check: which whole-sign house each graha would get */
  wholeSignNoteTe: string;
}

const GRaha_TE: Record<string, string> = {
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

const RASI_LORD_TE = [
  'కుజుడు', 'శుక్రుడు', 'బుధుడు', 'చంద్రుడు', 'సూర్యుడు', 'బుధుడు',
  'శుక్రుడు', 'కుజుడు', 'గురువు', 'శని', 'శని', 'గురువు',
];

export function degToDmsShort(degInSign: number): string {
  let total = Math.round(degInSign * 3600);
  const d = Math.floor(total / 3600);
  total -= d * 3600;
  const m = Math.floor(total / 60);
  const s = total - m * 60;
  return `${String(d).padStart(2, '0')}°${String(m).padStart(2, '0')}′${String(s).padStart(2, '0')}″`;
}

/**
 * Mid-point of two ecliptic longitudes measured *the short way round*, but
 * always taking the arc that does not wrap through 0° when the two points are
 * adjacent houses. Houses are built forward from house 1, so we always take the
 * forward arc.
 */
function forwardMid(a: number, b: number): number {
  const span = norm360(b - a);
  return norm360(a + span / 2);
}

/**
 * Śrīpati bhāva-sandhi chakra for a chart.
 */
export function computeBhavaSandhi(chart: CompleteChartResult): BhavaSandhiReport {
  const asc = chart.ascendant.siderealLon;
  const mc = chart.midheaven.siderealLon;
  const ic = norm360(mc + 180);
  const dsc = norm360(asc + 180);

  // Porphyry trisection of the four quadrants (Śrīpati paddhati).
  const q1 = norm360(ic - asc) / 3; // houses 2, 3
  const q2 = norm360(dsc - ic) / 3; // houses 5, 6
  const q3 = norm360(mc - dsc) / 3; // houses 8, 9
  const q4 = norm360(asc - mc) / 3; // houses 11, 12

  const madhya: number[] = new Array(12);
  madhya[0] = asc;
  madhya[1] = norm360(asc + q1);
  madhya[2] = norm360(asc + 2 * q1);
  madhya[3] = ic;
  madhya[4] = norm360(ic + q2);
  madhya[5] = norm360(ic + 2 * q2);
  madhya[6] = dsc;
  madhya[7] = norm360(dsc + q3);
  madhya[8] = norm360(dsc + 2 * q3);
  madhya[9] = mc;
  madhya[10] = norm360(mc + q4);
  madhya[11] = norm360(mc + 2 * q4);

  const rows: BhavaSandhiRow[] = madhya.map((m, i) => {
    const prev = madhya[(i + 11) % 12];
    const next = madhya[(i + 1) % 12];
    const arambha = forwardMid(prev, m);
    const anta = forwardMid(m, next);
    const span = norm360(anta - arambha);
    const signIndex = Math.floor(norm360(m) / 30);
    const degInSign = norm360(m) % 30;

    const housesOf = (p: PlanetPosition) => {
      const lon = norm360(p.siderealLon);
      const fromA = norm360(lon - arambha);
      return fromA <= span;
    };
    const CLASSICAL = new Set(['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu']);
    const inHouse = chart.planets.filter((p) => CLASSICAL.has(p.id) && housesOf(p));

    return {
      house: i + 1,
      nameTe: BHAVA_NAMES_TE[i],
      purposeTe: BHAVA_PURPOSE_TE[i],
      madhyaLon: Number(norm360(m).toFixed(4)),
      madhyaRasiTe: BHAVA_RASI_TE[signIndex],
      madhyaDegInSign: Number(degInSign.toFixed(4)),
      madhyaDms: degToDmsShort(degInSign),
      madhyaNakshatraTe: NAK_TE[Math.floor(norm360(m) / (360 / 27))],
      madhyaPada: Math.floor((norm360(m) % (360 / 27)) / (360 / 108)) + 1,
      arambhaLon: Number(arambha.toFixed(4)),
      arambhaRasiTe: BHAVA_RASI_TE[Math.floor(arambha / 30)],
      arambhaDegInSign: Number((arambha % 30).toFixed(4)),
      arambhaDms: degToDmsShort(arambha % 30),
      antaLon: Number(anta.toFixed(4)),
      antaRasiTe: BHAVA_RASI_TE[Math.floor(anta / 30)],
      antaDegInSign: Number((anta % 30).toFixed(4)),
      antaDms: degToDmsShort(anta % 30),
      spanDeg: Number(span.toFixed(3)),
      lordTe: RASI_LORD_TE[signIndex],
      planetsTe: inHouse.map((p) => GRaha_TE[p.id] ?? p.name),
      planetsEn: inHouse.map((p) => p.name),
      holdsLagna: i === 0,
    };
  });

  return {
    rows,
    ayanamsaDeg: chart.ayanamsaDeg,
    mcSiderealLon: mc,
    ascSiderealLon: asc,
    methodNoteTe:
      'శ్రీపతి పద్ధతి: లగ్నం మరియు మధ్యాకాశం (MC) నుండి నాలుగు పాదాలను మూడు సమాన భాగాలుగా విభజించి 12 భావ మధ్యాలను కనుగొంటారు. ప్రతి భావం మధ్యానికి రెండువైపులా ఉన్న మధ్యాల నడుమ సగభాగం ఆరంభం/అంతం. ఇది రాశి సరిహద్దులను గౌరవించదు; అందుకే భావ విస్తృతి 27°–33° మధ్య మారుతుంది.',
    caveatTe:
      'భావ సంధులు రాశి సరిహద్దులు కావు. గ్రహ స్థితి (రాశి) చూపడానికి రాశి చక్రం, ఫలిత చింతనకు భావ చక్రం — రెండూ వేరువేరు. రాశి పద్ధతిలో ఒక గ్రహం రాశి మారితే భావం మారుతుంది; శ్రీపతిలో అది జరగదు.',
    wholeSignNoteTe:
      'పత్రికలోని "భావ స్థితులు" రాశి ఆధారిత (whole-sign) చక్రం; పై పట్టిక శ్రీపతి భావ చక్రం. రెండింటినీ పక్కపక్కనే చూపడం ద్వారా గ్రహం రాశి స్థితికి, భావ స్థితికి మధ్య భేదం స్పష్టమవుతుంది.',
  };
}
