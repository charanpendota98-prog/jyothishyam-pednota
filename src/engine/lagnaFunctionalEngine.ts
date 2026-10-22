/**
 * లగ్న క్రియాత్మక గ్రహ విశ్లేషణ — functional lordship engine (BPHS ch. 34).
 *
 * సమస్య: యాప్‌లో 12 లగ్నాలకూ చేతితో రాసిన పట్టిక ఉంది. అందులో కొన్ని
 * చోట్ల యోగకారకులు, మారకులు తప్పుగా ఉన్నాయి (ఉదా. మిథునానికి బుధుడిని
 * రాజయోగకారకుడని చెప్పడం; వృషభానికి గురువును మారకుడని చెప్పడం).
 * ఇది "విశ్లేషణ తప్పు" అనే ఫిర్యాదికి మూలం.
 *
 * ఇక్కడ ప్రతిదీ **గణించబడుతుంది** — చేతి పట్టిక లేదు:
 *   1. రాశ్యధిపతులు (BPHS) → ప్రతి భావాధిపతి
 *   2. త్రికోణ (1/5/9) అధిపతి = శుభుడు; కేంద్ర (1/4/7/10) అధిపతి = శుభుడు
 *   3. 3/6/11 అధిపతి = పాపగ్రహం; 8/12 అధిపతి = పాప/తటస్థం
 *   4. కేంద్రాధిపత్య దోషం — సహజ శుభుడు కేవలం కేంద్రాలను మాత్రమే పాలిస్తే
 *      తటస్థుడు/పాపగ్రహం అవుతాడు
 *   5. యోగకారకుడు = ఒకే గ్రహం కేంద్రం + త్రికోణం రెండూ పాలించినప్పుడు మాత్రమే.
 *      ఎవరూ లేకపోతే "ఏకగ్ర యోగకారకుడు లేడు" అని నిజాయితీగా చెప్పి,
 *      అత్యుత్తమ క్రియాత్మక శుభుడిని ఇస్తాము.
 *   6. మారకుడు = 2వ మరియు 7వ భావాధిపతులు (మాత్రమే)
 *   7. బాధకుడు = చర లగ్నానికి 11వ, స్థిరానికి 9వ, ద్విస్వభావానికి 7వ భావాధిపతి
 */

import type { CompleteChartResult } from './ephemeris.ts';

export type PlanetId9 = 'Sun' | 'Moon' | 'Mars' | 'Mercury' | 'Jupiter' | 'Venus' | 'Saturn' | 'Rahu' | 'Ketu';

export const SIGN_LORD: PlanetId9[] = [
  'Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury',
  'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter',
];

export const RASI_TE = [
  'మేషం', 'వృషభం', 'మిథునం', 'కర్కాటకం', 'సింహం', 'కన్యా',
  'తులా', 'వృశ్చికం', 'ధనుస్సు', 'మకరం', 'కుంభం', 'మీనం',
];

export const PLANET_TE: Record<string, string> = {
  Sun: 'సూర్యుడు', Moon: 'చంద్రుడు', Mars: 'కుజుడు', Mercury: 'బుధుడు',
  Jupiter: 'గురువు', Venus: 'శుక్రుడు', Saturn: 'శని', Rahu: 'రాహువు', Ketu: 'కేతువు',
};

const SEVEN: PlanetId9[] = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

/** సహజ శుభులు — కేంద్రాధిపత్య దోషం వీరికే వర్తిస్తుంది */
const NATURAL_BENEFIC: PlanetId9[] = ['Jupiter', 'Venus', 'Mercury', 'Moon'];

const KENDRA = [1, 4, 7, 10];
const TRIKONA = [1, 5, 9];
const DUSTHANA = [6, 8, 12];
const UPACHAYA = [3, 6, 10, 11];

export interface PlanetFunction {
  id: PlanetId9;
  nameTe: string;
  /** ఈ లగ్నానికి ఆ గ్రహం పాలించే భావాలు */
  ownsHouses: number[];
  /** శుభ / పాప / తటస్థ */
  nature: 'shubha' | 'papa' | 'samana';
  natureTe: string;
  isLagnaLord: boolean;
  isKendraLord: boolean;
  isTrikonaLord: boolean;
  isKendradhipatiDosha: boolean;
  isMaraka: boolean;
  isBadhaka: boolean;
  isYogakaraka: boolean;
  /** −100 … +100 క్రియాత్మక అనుకూలత */
  functionalScore: number;
  reasonTe: string;
}

export interface LagnaFunctionalReport {
  lagnaSignIndex: number;
  lagnaRasiTe: string;
  lagnaTypeTe: 'చర' | 'స్థిర' | 'ద్విస్వభావ';
  houseLords: { house: number; signIndex: number; signTe: string; lordId: PlanetId9; lordTe: string }[];
  planets: PlanetFunction[];
  benefics: PlanetId9[];
  malefics: PlanetId9[];
  neutrals: PlanetId9[];
  yogakarakas: PlanetId9[];
  yogakarakaNoteTe: string;
  bestBenefic: PlanetId9;
  marakaLords: PlanetId9[];
  badhakaHouse: number;
  badhakaSignTe: string;
  badhakaLord: PlanetId9;
  kendradhipatiDoshaTe: string;
  shubhaTe: string;
  papaTe: string;
  marakaTe: string;
  yogakarakaTe: string;
  badhakaTe: string;
  auditNoteTe: string;
}

const isMovable = (s: number) => s % 3 === 0;
const isFixed = (s: number) => s % 3 === 1;
// ద్విస్వభావం = s % 3 === 2

export function computeLagnaFunctional(lagnaSignIndex: number): LagnaFunctionalReport {
  const lagna = ((lagnaSignIndex % 12) + 12) % 12;

  const houseLords = Array.from({ length: 12 }, (_, i) => {
    const signIndex = (lagna + i) % 12;
    const lordId = SIGN_LORD[signIndex];
    return {
      house: i + 1,
      signIndex,
      signTe: RASI_TE[signIndex],
      lordId,
      lordTe: PLANET_TE[lordId],
    };
  });

  const planets: PlanetFunction[] = SEVEN.map((id) => {
    const ownsHouses = houseLords.filter((h) => h.lordId === id).map((h) => h.house);
    const isLagnaLord = ownsHouses.includes(1);
    const isKendraLord = ownsHouses.some((h) => KENDRA.includes(h));
    const isTrikonaLord = ownsHouses.some((h) => TRIKONA.includes(h));
    // యోగకారక నిర్ణయానికి 1వ భావాన్ని "త్రికోణం"గా లెక్కించకూడదు —
    // లగ్నాధిపతి ప్రతి లగ్నానికీ ఉంటాడు, అది యోగకారకత్వం కాదు.
    const ownsKendraForYoga = ownsHouses.some((h) => [4, 7, 10].includes(h));
    const ownsTrikonaForYoga = ownsHouses.some((h) => [5, 9].includes(h));
    const ownsDusthana = ownsHouses.some((h) => DUSTHANA.includes(h));
    const ownsOnlyKendras = ownsHouses.length > 0 && ownsHouses.every((h) => KENDRA.includes(h));
    const isKendradhipatiDosha =
      NATURAL_BENEFIC.includes(id) && ownsOnlyKendras && !isLagnaLord;

    const isYogakaraka = ownsKendraForYoga && ownsTrikonaForYoga && !isKendradhipatiDosha;

    // ── స్కోరు (భావ స్వభావం ఆధారంగా) ────────────────────────
    const hasTrikona59 = ownsHouses.some((h) => [5, 9].includes(h));
    let score = 0;
    for (const h of ownsHouses) {
      if (h === 1) score += 12; // లగ్నం — కేంద్రం; త్రికోణంగా రెట్టింపు లెక్కించము
      else if ([5, 9].includes(h)) score += 32; // త్రికోణం — అత్యంత శుభం
      else if ([4, 7, 10].includes(h)) score += 14; // కేంద్రం
      else if (h === 2) score += 0; // ధనం — మారక స్వభావం
      else if (h === 11) score -= 14; // లాభం — పాప స్థానం
      else if (h === 3) score -= 14; // విక్రమం — పాప స్థానం
      else if (h === 6) score -= 18; // శత్రు — పాప స్థానం
      else if (h === 8) score -= hasTrikona59 ? 10 : 20; // ఆయుః — త్రికోణ ఉంటే సగం
      else if (h === 12) score -= 14; // వ్యయం — పాప స్థానం
    }
    if (isLagnaLord && ownsHouses.length === 1) score += 10; // కేవలం లగ్నాధిపతి
    if (isLagnaLord && ownsHouses.length === 2 && ownsHouses.includes(2)) score += 8; // లగ్నం + ధనం
    if (isYogakaraka) score += 20;
    if (isKendradhipatiDosha) score -= 14;
    if ((ownsHouses.includes(2) || ownsHouses.includes(7)) && !hasTrikona59) score -= 8;
    score = Math.max(-100, Math.min(100, Math.round(score)));

    const isMaraka = ownsHouses.includes(2) || ownsHouses.includes(7);
    const badhakaHouse = isMovable(lagna) ? 11 : isFixed(lagna) ? 9 : 7;
    const isBadhaka = ownsHouses.includes(badhakaHouse);

    let nature: PlanetFunction['nature'];
    if (isYogakaraka || score >= 16) nature = 'shubha';
    else if (score <= -10) nature = 'papa';
    else nature = 'samana';

    const houseList = ownsHouses.join(', ');
    const bits: string[] = [];
    bits.push(`${PLANET_TE[id]} ఈ లగ్నానికి ${houseList}వ భావాలకు అధిపతి`);
    if (isYogakaraka) bits.push('కేంద్ర + త్రికోణ రెండింటినీ పాలించడం వల్ల నిజమైన యోగకారకుడు');
    else if (isTrikonaLord && isKendraLord)
      bits.push('కేంద్ర-త్రికోణ అధిపత్యం ఉన్నా కేంద్రాధిపత్య దోషం/సహజ స్వభావం వల్ల పూర్ణ యోగకారకుడు కాదు');
    else if (isTrikonaLord) bits.push('త్రికోణాధిపతి కావడం వల్ల శుభుడు');
    else if (isKendraLord) bits.push(isKendradhipatiDosha ? 'కేంద్రాధిపత్య దోషం — శుభఫలం తగ్గుతుంది' : 'కేంద్రాధిపతి');
    if (ownsDusthana) bits.push(`${ownsHouses.filter((h) => DUSTHANA.includes(h)).join(', ')}వ దుష్ఠానాధిపత్యం వల్ల కొంత పాప ప్రభావం`);
    if (isMaraka) bits.push('2/7 భావాధిపతి కావడం వల్ల మారక స్వభావం');
    if (isBadhaka) bits.push(`బాధక స్థానాధిపతి`);
    if (ownsHouses.some((h) => UPACHAYA.includes(h))) bits.push('ఉపచయ స్థానాధిపత్యం (శ్రమతో వృద్ధి)');

    return {
      id,
      nameTe: PLANET_TE[id],
      ownsHouses,
      nature,
      natureTe: nature === 'shubha' ? 'క్రియాత్మక శుభుడు' : nature === 'papa' ? 'క్రియాత్మక పాపగ్రహం' : 'తటస్థుడు',
      isLagnaLord,
      isKendraLord,
      isTrikonaLord,
      isKendradhipatiDosha,
      isMaraka,
      isBadhaka,
      isYogakaraka,
      functionalScore: score,
      reasonTe: `${bits.join('; ')}.`,
    };
  });

  const benefics = planets.filter((p) => p.nature === 'shubha').map((p) => p.id);
  const malefics = planets.filter((p) => p.nature === 'papa').map((p) => p.id);
  const neutrals = planets.filter((p) => p.nature === 'samana').map((p) => p.id);
  const yogakarakas = planets.filter((p) => p.isYogakaraka).map((p) => p.id);

  const sortedBenefics = [...planets].sort((a, b) => b.functionalScore - a.functionalScore);
  const bestBenefic = sortedBenefics[0].id;

  const badhakaHouse = isMovable(lagna) ? 11 : isFixed(lagna) ? 9 : 7;
  const badhakaSignTe = RASI_TE[(lagna + badhakaHouse - 1) % 12];
  const badhakaLord = SIGN_LORD[(lagna + badhakaHouse - 1) % 12];

  const marakaLords = Array.from(
    new Set([SIGN_LORD[(lagna + 1) % 12], SIGN_LORD[(lagna + 6) % 12]]),
  ) as PlanetId9[];

  const lagnaTypeTe = isMovable(lagna) ? 'చర' : isFixed(lagna) ? 'స్థిర' : 'ద్విస్వభావ';

  const withHouses = (ids: PlanetId9[]) =>
    ids
      .map((id) => {
        const p = planets.find((x) => x.id === id)!;
        return `${p.nameTe} (${p.ownsHouses.join(', ')}వ)`;
      })
      .join(', ') || '—';

  const yogakarakaNoteTe = yogakarakas.length
    ? `${withHouses(yogakarakas)} — కేంద్ర మరియు త్రికోణ రెండింటినీ పాలించే ఏకగ్ర యోగకారకుడు.`
    : `${RASI_TE[lagna]} లగ్నానికి ఒకే గ్రహం కేంద్ర + త్రికోణ రెండింటినీ పాలించడం లేదు, కాబట్టి శాస్త్రీయంగా "ఏకగ్ర యోగకారకుడు" లేడు. అత్యుత్తమ క్రియాత్మక శుభుడు ${PLANET_TE[bestBenefic]} (${planets
        .find((p) => p.id === bestBenefic)!
        .ownsHouses.join(', ')}వ భావాధిపతి) — ఈయన బలంగా ఉన్న దశలలో ఉన్నతి.`;

  const kendradhipati = planets.filter((p) => p.isKendradhipatiDosha);
  const kendradhipatiDoshaTe = kendradhipati.length
    ? `${kendradhipati.map((p) => `${p.nameTe} (${p.ownsHouses.join(', ')}వ)`).join(', ')} — సహజ శుభుడు కేవలం కేంద్రాలను మాత్రమే పాలిస్తున్నందున కేంద్రాధిపత్య దోషం; శుభఫలం తగ్గి తటస్థంగా ప్రవర్తిస్తారు.`
    : 'ఈ లగ్నానికి కేంద్రాధిపత్య దోషం పొందిన సహజ శుభ గ్రహం లేదు.';

  return {
    lagnaSignIndex: lagna,
    lagnaRasiTe: RASI_TE[lagna],
    lagnaTypeTe,
    houseLords,
    planets,
    benefics,
    malefics,
    neutrals,
    yogakarakas,
    yogakarakaNoteTe,
    bestBenefic,
    marakaLords,
    badhakaHouse,
    badhakaSignTe,
    badhakaLord,
    kendradhipatiDoshaTe,
    shubhaTe: `${withHouses(benefics)} — త్రికోణ/కేంద్ర అధిపతులు కావడం వల్ల క్రియాత్మక శుభులు.`,
    papaTe: `${withHouses(malefics)} — 3/6/8/11/12 అధిపత్యం, కేంద్రాధిపత్య దోషం వల్ల క్రియాత్మక పాపగ్రహాలు.`,
    marakaTe: `${withHouses(marakaLords)} — 2వ మరియు 7వ భావాధిపతులు మాత్రమే మారకులు (ఇతర గ్రహాలను మారకులని చెప్పడం శాస్త్రీయం కాదు).`,
    yogakarakaTe: yogakarakaNoteTe,
    badhakaTe: `${badhakaHouse}వ భావం (${badhakaSignTe}) — ${lagnaTypeTe} లగ్నానికి బాధక స్థానం; అధిపతి ${PLANET_TE[badhakaLord]}.`,
    auditNoteTe:
      'ఈ పట్టిక చేతితో రాసినది కాదు — రాశ్యధిపతుల నుండి ప్రతి లగ్నానికి నేరుగా గణించబడుతుంది (BPHS అధ్యాయం 34: క్రియాత్మక శుభ/పాప నిర్ణయం). అందుకే 12 లగ్నాలకూ ఒకే సూత్రం, వైరుధ్యం ఉండదు.',
  };
}

/** చార్ట్ నుండి నేరుగా (లగ్న స్థితి ఆధారంగా) లెక్కించే సహాయక ఫంక్షన్. */
export function lagnaFunctionalOfChart(chart: CompleteChartResult): LagnaFunctionalReport {
  return computeLagnaFunctional(chart.ascendant.signIndex);
}
