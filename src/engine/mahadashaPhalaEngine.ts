/**
 * mahadashaPhalaEngine.ts — మహాదశ ఫలం: వయస్సు + దశానాథుని స్థితి ప్రకారం
 * ---------------------------------------------------------------------------
 * మునుపు ప్రతి మహాదశకూ ఒకటే వాక్యం వచ్చేది — “విద్య, ఉద్యోగ, ధన, గృహ-వాహన మరియు
 * కుటుంబ శుభకార్యాలలో విశేష పురోగతి”. అది 0–2 సం.ల పసిపాపకూ, 60 ఏళ్ల వారికీ ఒకటే
 * చెప్పేది; కుండలి ఏం చెబుతుందో కాదు, టెంప్లేట్ మాత్రమే. ఇక్కడ ఫలం మూడు నిజాల నుంచి
 * వస్తుంది:
 *
 *   1. **వయస్సు** — ఆ వయస్సులో నిజంగా సాధ్యమయ్యే జీవిత రంగాలు మాత్రమే
 *      (5 ఏళ్లకు ఉద్యోగం/వివాహం చెప్పడం అసంబద్ధం).
 *   2. **దశానాథుని స్థానం** — ఏ భావంలో ఉన్నాడు, ఏ భావాలకు అధిపతి (అంటే ఆ కాలంలో
 *      ఏ జీవిత రంగాలు ముఖ్యమవుతాయి), లగ్నానికి శుభుడా/పాపమా.
 *   3. **బలం** — షడ్బల రూపాలు, ఉచ్చ/నీచ స్థితి → ఫలం బలంగా ఉంటుందా, ఆటంకాలతో
 *      ఉంటుందా. బలహీనుడైతే హామీ ఇవ్వము — జాగ్రత్త చెబుతాము.
 *
 * “రాజయోగ కాలం” అనే మాట ఇక్కడ లేదు: అది నిజంగా రాజయోగం ఏర్పడినప్పుడే వేరే
 * అధ్యాయంలో (యోగ విచారం) చెబుతాము.
 */

import { SIGN_LORD, PLANET_TE, type PlanetId9 } from './lagnaFunctionalEngine.ts';

export interface AgeBand {
  id: string;
  labelTe: string;
  /** ఆ వయస్సులో నిజంగా సంబంధిత జీవిత రంగాలు */
  areasTe: string;
}

export const AGE_BANDS: AgeBand[] = [
  { id: 'infancy', labelTe: 'బాల్యం', areasTe: 'ఆరోగ్యం, తల్లిదండ్రుల సంరక్షణ, బాల్య సుఖం' },
  { id: 'school', labelTe: 'పాఠశాల విద్య', areasTe: 'చదువు, స్నేహాలు, క్రీడలు, ఆరోగ్యం' },
  { id: 'college', labelTe: 'ఉన్నత విద్య', areasTe: 'ఉన్నత చదువు, ఉద్యోగ ప్రవేశం, మొదటి సంపాదన' },
  { id: 'earlyCareer', labelTe: 'వృత్తి ఆరంభం', areasTe: 'ఉద్యోగం/వ్యాపారం, వివాహం, స్వతంత్ర ఆదాయం' },
  { id: 'householder', labelTe: 'గృహస్థ జీవితం', areasTe: 'ఉద్యోగ ఎదుగుదల, సంతానం, ఇల్లు-ఆస్తి, కుటుంబ బాధ్యత' },
  { id: 'authority', labelTe: 'అధికార కాలం', areasTe: 'పదవి, ఆస్తి స్థిరీకరణ, సంతాన విద్య/వివాహం, ఆరోగ్య జాగ్రత్త' },
  { id: 'elder', labelTe: 'వృద్ధాప్యం', areasTe: 'ఆరోగ్యం, ధర్మ కార్యాలు, ఆధ్యాత్మికం, వారసత్వం' },
];

export function ageBandOf(age: number): AgeBand {
  if (age < 6) return AGE_BANDS[0];
  if (age < 16) return AGE_BANDS[1];
  if (age < 23) return AGE_BANDS[2];
  if (age < 30) return AGE_BANDS[3];
  if (age < 45) return AGE_BANDS[4];
  if (age < 62) return AGE_BANDS[5];
  return AGE_BANDS[6];
}

/** “5వ భావానికి” (ఒకటి) / “1వ, 4వ భావాలకు” (అనేకం) — తెలుగు వ్యాకరణం */
function housesTe(houses: number[]): string {
  if (houses.length === 0) return 'ఏ భావానికీ';
  if (houses.length === 1) return `${houses[0]}వ భావానికి`;
  return `${houses.map((h) => `${h}వ`).join(', ')} భావాలకు`;
}

/** లగ్నం నుంచి ఏ భావాలకు అధిపతి? (1…12) */
export function housesRuledBy(lagnaSign: number, planetId: string): number[] {
  const out: number[] = [];
  for (let h = 1; h <= 12; h++) {
    if (SIGN_LORD[(lagnaSign + h - 1) % 12] === planetId) out.push(h);
  }
  return out;
}

/**
 * పారాశరీ క్రియాత్మక స్వభావం — ఏ భావాలకు అధిపతో దాని నుంచి.
 * త్రికోణ (1, 5, 9) మరియు 11వ భావాధిపతులు శుభులు; 3, 6, 8, 12 అధిపతులు పాప గ్రహాలు;
 * 2, 7, 10 అధిపతులు మిశ్రమం (సంయోగాన్ని బట్టి). కేంద్రాధిపత్య దోషం (4, 7, 10) శుభ
 * గ్రహాలకు ఉంటుంది — అందుకే అవి “మిశ్రమం”.
 */
export function functionalNature(
  lagnaSign: number,
  planetId: string
): { natureTe: string; reasonTe: string } {
  const houses = housesRuledBy(lagnaSign, planetId);
  if (houses.length === 0) return { natureTe: 'తటస్థం', reasonTe: 'భావాధిపత్యం లేదు' };
  const benefic = houses.filter((h) => [1, 5, 9, 11].includes(h));
  const malefic = houses.filter((h) => [3, 6, 8, 12].includes(h));
  const neutral = houses.filter((h) => [2, 4, 7, 10].includes(h));
  const houseListTe = houses.map((h) => `${h}వ`).join(', ');
  const kendraDoṣaPlanets = ['Jupiter', 'Venus', 'Mercury', 'Moon'];
  const hasKendraDosa =
    kendraDoṣaPlanets.includes(planetId) && houses.some((h) => [4, 7, 10].includes(h));
  if (benefic.length > 0 && malefic.length === 0 && !hasKendraDosa) {
    return { natureTe: 'శుభుడు', reasonTe: `${houseListTe} భావాధిపతి — త్రికోణ/లాభ అధిపత్యం` };
  }
  if (malefic.length > 0 && benefic.length === 0) {
    return { natureTe: 'పాప గ్రహం', reasonTe: `${houseListTe} భావాధిపతి — దుష్ట స్థాన అధిపత్యం` };
  }
  return {
    natureTe: 'మిశ్రమం',
    reasonTe: hasKendraDosa
      ? `${houseListTe} భావాధిపతి — కేంద్రాధిపత్య దోషం (శుభత్వం తగ్గుతుంది)`
      : `${houseListTe} భావాధిపతి — శుభ-పాప అధిపత్యాల కలయిక`,
  };
}

export interface MahadashaPhalaInput {
  lordId: string;
  lordNameTe: string;
  house: number;
  dignityTe: string;
  shadbalaRupas: number;
  requiredRupas: number;
  nakshatraTe: string;
  startAge: number;
  endAge: number;
  lagnaSign: number;
  isRetrograde?: boolean;
  ashtakavargaOfSign?: number;
  /** రాహు/కేతువుకు షడ్బలం ఉండదు — రాశ్యధిపతి బలాన్ని వాడతాము */
  isNode?: boolean;
  dispositorTe?: string;
}

export interface MahadashaPhala {
  predictionTe: string;
  ratingTe: string;
  ageBandTe: string;
  natureTe: string;
  strengthTe: string;
}

const DUSTHANA = [6, 8, 12];
const isFunctionalNatureMalefic = (n: string) => n === 'పాప గ్రహం';

export function mahadashaPhala(input: MahadashaPhalaInput): MahadashaPhala {
  const {
    lordId,
    lordNameTe,
    house,
    dignityTe,
    shadbalaRupas,
    requiredRupas,
    nakshatraTe,
    startAge,
    endAge,
    lagnaSign,
  } = input;

  const ratio = requiredRupas > 0 ? shadbalaRupas / requiredRupas : 0;
  const strengthBasisTe = input.isNode
    ? `ఛాయా గ్రహానికి (${lordNameTe}) షడ్బలం వర్తించదు; ఇది ${input.dispositorTe} రాశిలో ఉంది — ఆ రాశ్యధిపతి బలం`
    : 'షడ్బలం';
  const b1 = ageBandOf(startAge);
  const b2 = ageBandOf(Math.max(startAge, endAge - 1));
  const bandTe = b1.id === b2.id ? b1.labelTe : `${b1.labelTe} → ${b2.labelTe}`;
  const areasTe = b1.id === b2.id ? b1.areasTe : `${b1.areasTe}; తర్వాత ${b2.areasTe}`;

  const nature = functionalNature(lagnaSign, lordId);
  const houses = housesRuledBy(lagnaSign, lordId);
  const rulingSignificant = houses.filter((h) => [1, 2, 4, 5, 7, 9, 10, 11].includes(h));

  const strengthTe =
    ratio >= 1.1
      ? `${strengthBasisTe} ${shadbalaRupas.toFixed(2)} రూపాలు (అవసరం ${requiredRupas.toFixed(2)} — ${(ratio * 100).toFixed(0)}%) — బలవత్`
      : ratio >= 0.95
        ? `${strengthBasisTe} ${shadbalaRupas.toFixed(2)} రూపాలు (${(ratio * 100).toFixed(0)}%) — సమర్థం`
        : ratio >= 0.8
          ? `${strengthBasisTe} ${shadbalaRupas.toFixed(2)} రూపాలు (${(ratio * 100).toFixed(0)}%) — మధ్యమం`
          : `${strengthBasisTe} ${shadbalaRupas.toFixed(2)} రూపాలు (${(ratio * 100).toFixed(0)}%) — దుర్బలం`;

  const placementTe = `${lordNameTe} ${house}వ భావంలో (${dignityTe}, ${nakshatraTe} నక్షత్రం)`;
  const lordshipTe =
    houses.length > 0
      ? `${housesTe(houses)} అధిపతి; లగ్నానికి ${nature.natureTe}`
      : `ఛాయా గ్రహం — లగ్నానికి ${nature.natureTe}`;

  // బలహీనుడు / దుష్ట స్థానం → హామీ కాదు, జాగ్రత్త
  const caution =
    ratio < 0.95 || DUSTHANA.includes(house)
      ? ` ఈ కాలంలో ఫలం ఆలస్యంగా లేదా ఒడిదుడుకులతో వస్తుంది — ఆరోగ్యం, ఖర్చులు, నిర్ణయాల్లో సావధానత అవసరం; ${lordNameTe} పరిహారం (దానం/ఆరాధన) సహాయపడుతుంది.`
      : house === 6 || house === 8
        ? ' ఆటంకాలు ఎదురైనా పోటీలో ముందంజ, రుణ విముక్తి వంటి ఫలాలు కూడా ఉంటాయి.'
        : house === 12
          ? ' విదేశీ/దూర ప్రయాణాలు, ఆధ్యాత్మిక ఖర్చులు, ఏకాంత ప్రయోజనాలు ఉంటాయి.'
          : '';

  const areaLine =
    rulingSignificant.length > 0
      ? `${housesTe(rulingSignificant)} అధిపతి కావడం వల్ల ${areasTe} ఈ కాలంలో ప్రధానం.`
      : `${areasTe} ఈ కాలంలో ప్రధానం.`;

  const natureNote = isFunctionalNatureMalefic(nature.natureTe)
    ? ' లగ్నానికి పాప గ్రహమైనా బలవంతుడైతే శ్రమ, పోటీ, బాధ్యతల మధ్య నుంచి ఎదుగుదల ఇస్తాడు — సుఖమయ మార్గం కాదు.'
    : '';
  const predictionTe =
    `${placementTe}. ${lordshipTe}. ${strengthTe}.${natureNote} ` +
    `వయస్సు ${Math.max(0, Math.round(startAge))}–${Math.max(1, Math.round(endAge))} సం.ల మధ్య (${bandTe}) ` +
    `${areaLine}${caution}`;

  const isFunctionalMalefic = nature.natureTe === 'పాప గ్రహం';
  const ratingTe =
    ratio >= 1.1 && isFunctionalMalefic
      ? 'బలవత్ · శ్రమసాధ్య కాలం'
      : ratio >= 1.1 && [1, 4, 5, 7, 9, 10, 11].includes(house)
      ? 'బలవత్ · అనుకూల కాలం'
      : ratio >= 0.95 && !DUSTHANA.includes(house)
        ? 'సమర్థ · సానుకూల కాలం'
        : ratio >= 0.8
          ? 'మధ్యమ · మిశ్రమ కాలం'
          : 'దుర్బల · శ్రద్ధార్హ కాలం';

  return { predictionTe, ratingTe, ageBandTe: bandTe, natureTe: nature.natureTe, strengthTe };
}

/** స్తంభాల్లో కారకుల బరువు కోసం — శుభుడు +2, మిశ్రమం +0, పాపం −2 */
export function functionalWeight(lagnaSign: number, planetId: string): number {
  const n = functionalNature(lagnaSign, planetId).natureTe;
  return n === 'శుభుడు' ? 2 : n === 'పాప గ్రహం' ? -2 : 0;
}

/** ప్రస్తుత మహాదశలో ఏ జీవిత రంగం ముఖ్యమో — ఒక్క వాక్యం (వయస్సుతో సహా) */
export function currentAgeAreaTe(age: number, lordId: string, lagnaSign: number): string {
  const band = ageBandOf(age);
  const houses = housesRuledBy(lagnaSign, lordId).filter((h) =>
    [1, 2, 4, 5, 7, 9, 10, 11].includes(h)
  );
  const lord = (PLANET_TE[lordId as PlanetId9] ?? lordId);
  return (
    `${band.labelTe} (${Math.round(age)} సం.) — ${lord} ` +
    (houses.length > 0 ? `${houses.map((h) => `${h}వ`).join(', ')} భావాల అధిపతి` : 'ఛాయా గ్రహం') +
    ` కావడం వల్ల ${band.areasTe} ముఖ్యం.`
  );
}
