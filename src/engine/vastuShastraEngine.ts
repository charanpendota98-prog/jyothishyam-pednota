/**
 * vastuShastraEngine.ts — Vastu Shastra (వాస్తు శాస్త్రం) analysis engine.
 *
 * Implements a complete, classical Vastu workflow:
 *   1. Vastu Purusha Mandala — 45 devatas, Paramasayika 9×9 grid, Brahmasthan,
 *      the 32 Paisachika (boundary) devatas in their documented clockwise order.
 *   2. 16-zone (MahaVastu / BrahmaVastu) analysis with element, planet, chakra.
 *   3. 8-direction (Dik) analysis — deity, element, planet, what to keep / avoid.
 *   4. Nama Vastu — the name's akshara → nakshatra pada → rashi → ruling planet →
 *      the person's auspicious directions, entrance pada and sleep/desk orientation.
 *   5. Grama / Place Vastu — true north vs magnetic north (declination), sunrise &
 *      solstice azimuths for the given latitude/longitude, plot alignment, and the
 *      classical "village gateway" rule relative to the place.
 *   6. Interactive house audit — room-by-room scoring with dosha + remedy, using
 *      Manasara / Mayamata / Vishvakarma Prakasha / Samarangana Sutradhara rules.
 *
 * Classical references: Mayamata, Manasara, Vishvakarma Prakasha, Aparajitaprccha,
 * Samarangana Sutradhara, Vastu Ratnakara, Muhurta Chintamani (Vastu chapter).
 */

import { sunHorizontal, jdFromMs, formatLocalHM, riseSetForLocalDate } from './astroCore.ts';
import { TELUGU_NAKSHATRAS, TELUGU_RASIS } from './teluguJathakam.ts';

/* ================================================================== *
 *  Directions (Dik)
 * ================================================================== */

export interface DikInfo {
  id: 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';
  nameTe: string;
  nameEn: string;
  sanskrit: string;
  deityTe: string;
  deityEn: string;
  elementTe: string;
  elementEn: string;
  planetId: string;
  planetTe: string;
  centerDeg: number; // azimuth from true north
  qualitiesTe: string;
  keepTe: string;
  avoidTe: string;
  remedyTe: string;
  colorTe: string;
}

export const DIK_INFO: DikInfo[] = [
  {
    id: 'N',
    nameTe: 'ఉత్తరం',
    nameEn: 'North',
    sanskrit: 'Uttara',
    deityTe: 'కుబేరుడు',
    deityEn: 'Kubera',
    elementTe: 'జలం (ఆపః)',
    elementEn: 'Water',
    planetId: 'Mercury',
    planetTe: 'బుధుడు',
    centerDeg: 0,
    qualitiesTe: 'ధన, ఐశ్వర్యం, అవకాశాలు, ఉద్యోగ ప్రగతి, మానసిక శాంతి.',
    keepTe: 'నగదు, ఆభరణాలు, పూజా వస్తువులు, నీటి వనరు, ఉద్యోగ పత్రాలు, అద్దం (ఉత్తర గోడకు).',
    avoidTe: 'అగ్ని, పొయ్యి, భారీ యంత్రాలు, చెత్త, మరుగుదొడ్డి, మెట్ల పైభాగం.',
    remedyTe: 'ఉత్తర-ఈశాన్య మూలలో చిన్న నీటి పాత్ర/కుబేర యంత్రం, శుక్రవారం కుబేర స్తోత్రం.',
    colorTe: 'ఆకుపచ్చ, నీలం',
  },
  {
    id: 'NE',
    nameTe: 'ఈశాన్యం',
    nameEn: 'North-East',
    sanskrit: 'Ishanya',
    deityTe: 'ఈశాన్యుడు (శివుడు)',
    deityEn: 'Ishana (Shiva)',
    elementTe: 'జలం + ఆకాశం',
    elementEn: 'Water + Space',
    planetId: 'Jupiter',
    planetTe: 'గురుడు',
    centerDeg: 45,
    qualitiesTe: 'జ్ఞానం, ఆధ్యాత్మికత, ఆరోగ్యం, దైవానుగ్రహం, సంతానం, విద్య.',
    keepTe: 'పూజా మందిరం, ధ్యాన స్థలం, మంచినీటి ట్యాంక్, తులసి, మొక్కలు, తేలికైన వస్తువులు.',
    avoidTe: 'మరుగుదొడ్డి, వంటగది, నిచ్చెన/మెట్లు, భారీ నిర్మాణం, చెత్త, నిల్వ గది.',
    remedyTe: 'ఈశాన్యాన్ని ఎప్పుడూ శుభ్రంగా, తెరిచి ఉంచండి; శివ లింగ/శంఖ/కుబేర యంత్రం, తులసి మొక్క.',
    colorTe: 'పసుపు, తెలుపు',
  },
  {
    id: 'E',
    nameTe: 'తూర్పు',
    nameEn: 'East',
    sanskrit: 'Purva',
    deityTe: 'ఇంద్రుడు',
    deityEn: 'Indra',
    elementTe: 'వాయువు + అగ్ని',
    elementEn: 'Air + Fire',
    planetId: 'Sun',
    planetTe: 'సూర్యుడు',
    centerDeg: 90,
    qualitiesTe: 'ఆరోగ్యం, సామాజిక గౌరవం, నాయకత్వం, కీర్తి, పురుష సంతానం.',
    keepTe: 'ప్రధాన ద్వారం, సందర్శకుల గది, అధ్యయన గది, స్నాన గది తలుపు, సూర్య కిరణాలు.',
    avoidTe: 'మరుగుదొడ్డి, భారీ నిల్వలు, వంటగది మూల.',
    remedyTe: 'తూర్పు ద్వారానికి పసుపు/బంగారు రంగు, సూర్య నమస్కారం కోసం ఖాళీ స్థలం.',
    colorTe: 'తెలుపు, పసుపు',
  },
  {
    id: 'SE',
    nameTe: 'ఆగ్నేయం',
    nameEn: 'South-East',
    sanskrit: 'Agneya',
    deityTe: 'అగ్ని',
    deityEn: 'Agni',
    elementTe: 'అగ్ని',
    elementEn: 'Fire',
    planetId: 'Venus',
    planetTe: 'శుక్రుడు',
    centerDeg: 135,
    qualitiesTe: 'ఆరోగ్యం, జీర్ణశక్తి, ధైర్యం, ఇంధనం, సంతానం, ఆహారం.',
    keepTe: 'వంటగది, పొయ్యి (ఆగ్నేయ మూల), విద్యుత్ పరికరాలు, వేడి నీటి వ్యవస్థ.',
    avoidTe: 'నీటి ట్యాంక్, బోరు, పూజా గది, మంచం తలభాగం, ధన నిల్వ.',
    remedyTe: 'పొయ్యి ఆగ్నేయ మూలకు ఆనించి, వంట చేసే వ్యక్తి తూర్పు ముఖంగా ఉండాలి.',
    colorTe: 'ఎరుపు, నారింజ',
  },
  {
    id: 'S',
    nameTe: 'దక్షిణం',
    nameEn: 'South',
    sanskrit: 'Dakshina',
    deityTe: 'యముడు',
    deityEn: 'Yama',
    elementTe: 'అగ్ని + భూమి',
    elementEn: 'Fire + Earth',
    planetId: 'Mars',
    planetTe: 'కుజుడు',
    centerDeg: 180,
    qualitiesTe: 'క్రమశిక్షణ, ధైర్యం, స్థిరత్వం, ధనం, వంశ వృద్ధి.',
    keepTe: 'నిల్వ గది, మెట్లు, భారీ వస్తువులు, పనిమనిషి గది, ధాన్యం.',
    avoidTe: 'పూజా గది, మంచం తలభాగం (నైరుతి తప్ప), నీటి ట్యాంక్, ప్రధాన ద్వారం.',
    remedyTe: 'దక్షిణ గోడకు ఎరుపు రంగు, హనుమాన్ చాలీసా పఠనం, సోమవారం దీపం.',
    colorTe: 'ఎరుపు, గులాబీ',
  },
  {
    id: 'SW',
    nameTe: 'నైరుతి',
    nameEn: 'South-West',
    sanskrit: 'Nairutya',
    deityTe: 'నిరృతి / పితృ దేవతలు',
    deityEn: 'Nirriti / Pitru',
    elementTe: 'భూమి',
    elementEn: 'Earth',
    planetId: 'Rahu',
    planetTe: 'రాహువు',
    centerDeg: 225,
    qualitiesTe: 'స్థిరత్వం, కుటుంబ బంధం, సంపద రక్షణ, దాంపత్య సుఖం, పితృ అనుగ్రహం.',
    keepTe: 'పెద్దల/యజమాని మంచం (తల దక్షిణం/తూర్పు), బీరువా, ధన నిల్వ, భారీ నిర్మాణం.',
    avoidTe: 'పూజా గది, బోరు, నీటి ట్యాంక్, మెట్లు, ఖాళీ స్థలం, ప్రధాన ద్వారం.',
    remedyTe: 'నైరుతిని ఎప్పుడూ భారీగా ఉంచండి; పితృ తర్పణం, శనివారం నువ్వుల నూనె దీపం.',
    colorTe: 'పసుపు, గోధుమ',
  },
  {
    id: 'W',
    nameTe: 'పడమర',
    nameEn: 'West',
    sanskrit: 'Paschima',
    deityTe: 'వరుణుడు',
    deityEn: 'Varuna',
    elementTe: 'జలం',
    elementEn: 'Water',
    planetId: 'Saturn',
    planetTe: 'శని',
    centerDeg: 270,
    qualitiesTe: 'లాభం, పేరు ప్రతిష్ఠలు, సంతానం, సంతృప్తి, భోజన సుఖం.',
    keepTe: 'భోజన గది, అతిథి గది, పిల్లల చదువు గది, నీటి వసతి, తిన్నని నిల్వలు.',
    avoidTe: 'పూజా గది, ప్రధాన ద్వారం, భారీ చెత్త, తలుపు గట్టిగా మూసి ఉండటం.',
    remedyTe: 'పడమర కిటికీ తెరిచి ఉంచండి; వరుణ మంత్రం, తెల్ల పువ్వులు, ఇంటి ముందు నీటి కుళాయి.',
    colorTe: 'తెలుపు, నీలం',
  },
  {
    id: 'NW',
    nameTe: 'వాయవ్యం',
    nameEn: 'North-West',
    sanskrit: 'Vayavya',
    deityTe: 'వాయుదేవుడు',
    deityEn: 'Vayu',
    elementTe: 'వాయువు',
    elementEn: 'Air',
    planetId: 'Moon',
    planetTe: 'చంద్రుడు',
    centerDeg: 315,
    qualitiesTe: 'గమనం, సంబంధాలు, అతిథి సత్కారం, ఆర్థిక ప్రవాహం, సృజనాత్మకత.',
    keepTe: 'అతిథి గది, నిల్వ గది, వాహనం, పశువులు, గాలి బాగా తగిలే ప్రదేశం, కిటికీలు.',
    avoidTe: 'పొయ్యి, భారీ బరువు, పూజా గది, బోరు, మంచం తలభాగం.',
    remedyTe: 'వాయవ్యంలో తేలికైన వస్తువులు, గాలి ప్రసరణకు కిటికీ, చంద్రుని స్తోత్రం.',
    colorTe: 'తెలుపు, బూడిద',
  },
];

export const DIK_BY_ID: Record<DikInfo['id'], DikInfo> = DIK_INFO.reduce(
  (acc, d) => {
    acc[d.id] = d;
    return acc;
  },
  {} as Record<DikInfo['id'], DikInfo>
);

/* ================================================================== *
 *  16 zones (MahaVastu style, sub-divided Dik)
 * ================================================================== */

export interface ZoneInfo {
  index: number;
  nameTe: string;
  nameEn: string;
  dik: DikInfo['id'];
  startDeg: number;
  endDeg: number;
  elementTe: string;
  planetTe: string;
  chakraTe: string;
  lifeAreaTe: string;
  keepTe: string;
  avoidTe: string;
  imbalanceTe: string;
  remedyTe: string;
}

const ZONE_TEMPLATES: {
  nameTe: string;
  nameEn: string;
  dik: DikInfo['id'];
  elementTe: string;
  planetTe: string;
  chakraTe: string;
  lifeAreaTe: string;
  keepTe: string;
  avoidTe: string;
  imbalanceTe: string;
  remedyTe: string;
}[] = [
  { nameTe: 'ఉత్తరం (N)', nameEn: 'North', dik: 'N', elementTe: 'జలం', planetTe: 'బుధుడు', chakraTe: 'విశుద్ధి', lifeAreaTe: 'ఆదాయం, అవకాశాలు, ఉద్యోగం', keepTe: 'ధన నిల్వ, ఫైల్లు, అద్దం, నీరు', avoidTe: 'అగ్ని, మురికి, భారీ యంత్రం', imbalanceTe: 'ఆదాయం ఆగిపోవడం, అవకాశాలు తగ్గడం', remedyTe: 'ఉత్తర గోడకు అద్దం, నీటి పాత్ర, ఆకుపచ్చ రంగు' },
  { nameTe: 'ఉత్తర-ఈశాన్యం (NNE)', nameEn: 'North-North-East', dik: 'NE', elementTe: 'జలం', planetTe: 'గురుడు', chakraTe: 'ఆజ్ఞ', lifeAreaTe: 'సంతానం, ఆరోగ్యం, విద్య', keepTe: 'పూజ, ఔషధాలు, మొక్కలు', avoidTe: 'మరుగుదొడ్డి, చెత్త, భారీ నిర్మాణం', imbalanceTe: 'ఆరోగ్య సమస్యలు, సంతాన కష్టం', remedyTe: 'తులసి, శంఖం, పసుపు రంగు, శుభ్రత' },
  { nameTe: 'ఈశాన్యం (NE)', nameEn: 'North-East', dik: 'NE', elementTe: 'జలం + ఆకాశం', planetTe: 'గురుడు', chakraTe: 'సహస్రార', lifeAreaTe: 'ఆధ్యాత్మికత, జ్ఞానం, ముక్తి', keepTe: 'పూజా మందిరం, ధ్యానం, మంచినీరు', avoidTe: 'వంటగది, మరుగుదొడ్డి, మెట్లు', imbalanceTe: 'మానసిక అశాంతి, భయం, నిర్ణయ స్తంభన', remedyTe: 'ఈశాన్యం తెరిచి, శుభ్రంగా; శివ లింగం, కుబేర యంత్రం' },
  { nameTe: 'తూర్పు-ఈశాన్యం (ENE)', nameEn: 'East-North-East', dik: 'NE', elementTe: 'ఆకాశం', planetTe: 'గురుడు', chakraTe: 'విశుద్ధి', lifeAreaTe: 'శ్రద్ధ, ధ్యానం, సృజన', keepTe: 'ధ్యానం, చదువు, సంగీతం', avoidTe: 'శబ్దం, గందరగోళం, వంటగది', imbalanceTe: 'నిరాశ, స్ఫూర్తి లోపం', remedyTe: 'ప్రశాంత మూల, తెలుపు పువ్వులు, ధూపం' },
  { nameTe: 'తూర్పు (E)', nameEn: 'East', dik: 'E', elementTe: 'వాయువు + అగ్ని', planetTe: 'సూర్యుడు', chakraTe: 'అనాహత', lifeAreaTe: 'గౌరవం, ఆరోగ్యం, నాయకత్వం', keepTe: 'ప్రధాన ద్వారం, సందర్శకులు, సూర్య కిరణాలు', avoidTe: 'మురికి, బరువు, మూసిన కిటికీలు', imbalanceTe: 'గుర్తింపు లోపం, ఆత్మవిశ్వాసం తగ్గడం', remedyTe: 'తూర్పు తలుపు పసుపు/తెలుపు రంగు, సూర్యారాధన' },
  { nameTe: 'తూర్పు-ఆగ్నేయం (ESE)', nameEn: 'East-South-East', dik: 'SE', elementTe: 'అగ్ని', planetTe: 'శుక్రుడు', chakraTe: 'మణిపూర', lifeAreaTe: 'ఆనందం, సౌందర్యం, సంబంధాలు', keepTe: 'స్నాన గది, అలంకరణ, సౌందర్య వస్తువులు', avoidTe: 'అగ్ని, భారీ నిర్మాణం', imbalanceTe: 'అసంతృప్తి, సంబంధ కలహాలు', remedyTe: 'తెలుపు/గులాబీ రంగు, సుగంధాలు, శుభ్రత' },
  { nameTe: 'ఆగ్నేయం (SE)', nameEn: 'South-East', dik: 'SE', elementTe: 'అగ్ని', planetTe: 'శుక్రుడు', chakraTe: 'మణిపూర', lifeAreaTe: 'ఆరోగ్యం, ధైర్యం, ఇంధనం', keepTe: 'వంటగది, పొయ్యి, విద్యుత్', avoidTe: 'నీరు, బోరు, పూజ, ధన నిల్వ', imbalanceTe: 'జీర్ణ సమస్యలు, ఆర్థిక నష్టం', remedyTe: 'పొయ్యి ఆగ్నేయ మూలకు; ఎరుపు రంగు; నీటిని దూరంగా' },
  { nameTe: 'దక్షిణ-ఆగ్నేయం (SSE)', nameEn: 'South-South-East', dik: 'SE', elementTe: 'అగ్ని + భూమి', planetTe: 'శుక్రుడు', chakraTe: 'స్వాధిష్ఠాన', lifeAreaTe: 'ఆత్మవిశ్వాసం, పోటీ', keepTe: 'వ్యాయామం, పరికరాలు', avoidTe: 'మంచం, పూజ', imbalanceTe: 'ఆందోళన, కోపం', remedyTe: 'ఎరుపు/నారింజ రంగు, గ్రౌండింగ్' },
  { nameTe: 'దక్షిణం (S)', nameEn: 'South', dik: 'S', elementTe: 'అగ్ని + భూమి', planetTe: 'కుజుడు', chakraTe: 'మూలాధార', lifeAreaTe: 'క్రమశిక్షణ, ధనం, స్థిరత్వం', keepTe: 'నిల్వ, మెట్లు, భారీ వస్తువులు', avoidTe: 'పూజ, ప్రధాన ద్వారం, నీరు', imbalanceTe: 'అలసట, భయం, ధన వ్యయం', remedyTe: 'ఎరుపు రంగు, హనుమాన్ ఆరాధన, బరువు సరిగ్గా' },
  { nameTe: 'దక్షిణ-నైరుతి (SSW)', nameEn: 'South-South-West', dik: 'SW', elementTe: 'భూమి', planetTe: 'రాహువు', chakraTe: 'స్వాధిష్ఠాన', lifeAreaTe: 'నిద్ర, ఆరోగ్యం, సౌఖ్యం', keepTe: 'నిద్ర గది, ప్రశాంతత', avoidTe: 'పూజ, నీరు, ఖాళీ', imbalanceTe: 'నిద్ర లోపం, భయం', remedyTe: 'పసుపు రంగు, ప్రశాంతత, రాత్రి దీపం' },
  { nameTe: 'నైరుతి (SW)', nameEn: 'South-West', dik: 'SW', elementTe: 'భూమి', planetTe: 'రాహువు', chakraTe: 'మూలాధార', lifeAreaTe: 'సంపద రక్షణ, దాంపత్యం, స్థిరత్వం', keepTe: 'యజమాని మంచం, బీరువా, భారీ నిర్మాణం', avoidTe: 'నీరు, పూజ, ఖాళీ స్థలం', imbalanceTe: 'అస్థిరత, ఆర్థిక నష్టం, కుటుంబ కలహాలు', remedyTe: 'బరువు పెంచడం, పసుపు/గోధుమ రంగు, తల దక్షిణం' },
  { nameTe: 'పడమర-నైరుతి (WSW)', nameEn: 'West-South-West', dik: 'W', elementTe: 'జలం', planetTe: 'శని', chakraTe: 'మణిపూర', lifeAreaTe: 'పొదుపు, గ్రహణ శక్తి, విశ్లేషణ', keepTe: 'అధ్యయనం, నిల్వ', avoidTe: 'చెత్త, తడి, మూసిన గాలి', imbalanceTe: 'నిరాశ, ఆలస్యం', remedyTe: 'నీలం/నలుపు రంగు, శుభ్రత, ఓం శనైశ్చరాయ నమః' },
  { nameTe: 'పడమర (W)', nameEn: 'West', dik: 'W', elementTe: 'జలం', planetTe: 'శని', chakraTe: 'అనాహత', lifeAreaTe: 'లాభం, ప్రతిష్ఠ, సంతానం', keepTe: 'భోజనం, అతిథులు, చదువు', avoidTe: 'పూజ, ప్రధాన ద్వారం', imbalanceTe: 'లాభాలు ఆగడం, సంతాన కష్టం', remedyTe: 'వరుణ మంత్రం, తెలుపు రంగు, నీటి కుళాయి' },
  { nameTe: 'పడమర-వాయవ్యం (WNW)', nameEn: 'West-North-West', dik: 'NW', elementTe: 'వాయువు', planetTe: 'చంద్రుడు', chakraTe: 'ఆజ్ఞ', lifeAreaTe: 'ఆలోచన, మానసిక స్థిరత్వం', keepTe: 'నిల్వ, ప్రశాంతత', avoidTe: 'శబ్దం, గందరగోళం', imbalanceTe: 'ఆందోళన, నిర్ణయాలు ఆలస్యం', remedyTe: 'తెలుపు రంగు, చంద్ర స్తోత్రం, గాలి ప్రసరణ' },
  { nameTe: 'వాయవ్యం (NW)', nameEn: 'North-West', dik: 'NW', elementTe: 'వాయువు', planetTe: 'చంద్రుడు', chakraTe: 'విశుద్ధి', lifeAreaTe: 'సంబంధాలు, అతిథి, వాహనం', keepTe: 'అతిథి గది, వాహనం, నిల్వ, కిటికీలు', avoidTe: 'అగ్ని, బరువు, పూజ', imbalanceTe: 'సంబంధాల్లో దూరం, ఆర్థిక అస్థిరత', remedyTe: 'తేలికైన వస్తువులు, తెలుపు రంగు, ఓం సోమాయ నమః' },
  { nameTe: 'ఉత్తర-వాయవ్యం (NNW)', nameEn: 'North-North-West', dik: 'N', elementTe: 'జలం + వాయువు', planetTe: 'బుధుడు', chakraTe: 'అనాహత', lifeAreaTe: 'ఆదాయం, ఆశలు, ప్రేరణ', keepTe: 'ధనం, ప్రేరణా బోర్డు, నీరు', avoidTe: 'చెత్త, భారీ పరికరాలు', imbalanceTe: 'ఆశ నష్టం, ఆదాయం తగ్గడం', remedyTe: 'ఆకుపచ్చ రంగు, నీటి పాత్ర, కుబేర స్తోత్రం' },
];

export const ZONE_INFO: ZoneInfo[] = ZONE_TEMPLATES.map((z, i) => ({
  index: i,
  ...z,
  startDeg: i * 22.5 - 11.25 < 0 ? i * 22.5 - 11.25 + 360 : i * 22.5 - 11.25,
  endDeg: i * 22.5 + 11.25,
}));

/* ================================================================== *
 *  45 Vastu Purusha devatas
 * ================================================================== */

export interface VastuDevata {
  nameTe: string;
  nameEn: string;
  vithiTe: string;
  zoneTe: string;
  governsTe: string;
}

const OUTER_32_ORDER: { te: string; en: string; governs: string }[] = [
  // North-East quadrant
  { te: 'ఆదితి', en: 'Aditi', governs: 'స్వాతంత్ర్యం, విస్తారం, రక్షణ' },
  { te: 'దితి', en: 'Diti', governs: 'నిరాశ, ఓర్పు, సంయమనం' },
  { te: 'శిఖి', en: 'Shikhi', governs: 'సృజనాత్మక ఆలోచన, దృష్టి' },
  { te: 'పర్జన్యుడు', en: 'Parjanya', governs: 'వర్షం, ఫలసమృద్ధి, పోషణ' },
  // East
  { te: 'జయంతుడు', en: 'Jayanta', governs: 'విజయం, ఉత్సాహం, నాయకత్వం' },
  { te: 'మహేంద్రుడు', en: 'Mahendra', governs: 'అధికారం, పరిపాలన' },
  { te: 'సూర్యుడు', en: 'Surya', governs: 'ఆరోగ్యం, తేజస్సు, కీర్తి' },
  { te: 'సత్యుడు', en: 'Satya', governs: 'సత్యం, ప్రతిష్ఠ, విశ్వాసం' },
  // South-East quadrant
  { te: 'భృశుడు', en: 'Bhrisa', governs: 'పరిశ్రమ, క్రమశిక్షణ' },
  { te: 'ఆకాశం', en: 'Akasha', governs: 'విస్తరణ, ఆవిష్కరణ' },
  { te: 'అనిలుడు', en: 'Anila', governs: 'చలనం, ఊపిరి, శక్తి' },
  { te: 'పూషుడు', en: 'Pusha', governs: 'పోషణ, ఆహారం, సంరక్షణ' },
  // South
  { te: 'వితథుడు', en: 'Vitatha', governs: 'మానసిక స్థిరత, వివేకం' },
  { te: 'గృహక్షతుడు', en: 'Grihakshata', governs: 'గృహ రక్షణ, సంతానం' },
  { te: 'యముడు', en: 'Yama', governs: 'ధర్మం, మరణం, క్రమం' },
  { te: 'గంధర్వుడు', en: 'Gandharva', governs: 'కళలు, సంగీతం, ఆనందం' },
  // South-West quadrant
  { te: 'భృంగరాజుడు', en: 'Bhringaraja', governs: 'ఆరోగ్యం, చైతన్యం' },
  { te: 'మృగుడు', en: 'Mriga', governs: 'జిజ్ఞాస, నైపుణ్యం' },
  { te: 'పితృ దేవతలు', en: 'Pitru', governs: 'పితృ అనుగ్రహం, వంశం' },
  { te: 'దౌవారికుడు', en: 'Dauvarika', governs: 'ద్వార రక్షణ, భయ నివారణ' },
  // West
  { te: 'సుగ్రీవుడు', en: 'Sugriva', governs: 'నేతృత్వం, సమన్వయం' },
  { te: 'పుష్పదంతుడు', en: 'Pushpadanta', governs: 'సౌందర్యం, ఆకర్షణ' },
  { te: 'వరుణుడు', en: 'Varuna', governs: 'జలం, ప్రేమ, కీర్తి' },
  { te: 'అసురుడు', en: 'Asura', governs: 'పోటీ, ధైర్యం, మాయ' },
  // North-West quadrant
  { te: 'శోషుడు', en: 'Shosha', governs: 'శుద్ధి, విసర్జన' },
  { te: 'పాపయక్ష్ముడు', en: 'Papayakshma', governs: 'రోగ నివారణ, విముక్తి' },
  { te: 'రోగుడు', en: 'Roga', governs: 'ఆరోగ్య పరీక్ష, సహనం' },
  { te: 'నాగుడు', en: 'Naga', governs: 'కోరికలు, సంపద, చైతన్యం' },
  // North
  { te: 'ముఖ్యుడు', en: 'Mukhya', governs: 'ముఖ్యత, నిర్దేశం' },
  { te: 'భల్లాటుడు', en: 'Bhallata', governs: 'ధన వృద్ధి, ఫలితం' },
  { te: 'సోముడు', en: 'Soma', governs: 'ధన ప్రవాహం, మనస్సు' },
  { te: 'భుజగుడు', en: 'Bhujaga', governs: 'భూగర్భ సంపద, స్థిరత్వం' },
];

const INNER_DEVATAS: { te: string; en: string; zone: string; governs: string }[] = [
  { te: 'పృథ్వీధరుడు', en: 'Prithvidhara', zone: 'ఉత్తర మధ్య', governs: 'భూమి ధారణ, స్థిరత్వం' },
  { te: 'ఆపః', en: 'Apaha', zone: 'ఈశాన్య మధ్య', governs: 'నీరు, ప్రాణ శక్తి, శుద్ధి' },
  { te: 'ఆపవత్సుడు', en: 'Apavatsa', zone: 'ఈశాన్య మధ్య', governs: 'ఆరోగ్యం, క్షేమం' },
  { te: 'అర్యముడు', en: 'Aryama', zone: 'తూర్పు మధ్య', governs: 'మైత్రి, సామాజిక సంబంధాలు' },
  { te: 'సవిత', en: 'Savita', zone: 'ఆగ్నేయ మధ్య', governs: 'ప్రేరణ, ఆరంభం' },
  { te: 'సవిత్ర', en: 'Savitra', zone: 'ఆగ్నేయ మధ్య', governs: 'నిరంతరత, పట్టుదల' },
  { te: 'వివస్వానుడు', en: 'Vivasvan', zone: 'దక్షిణ మధ్య', governs: 'తేజస్సు, ప్రకాశం' },
  { te: 'మిత్రుడు', en: 'Mitra', zone: 'పడమర మధ్య', governs: 'మైత్రి, ఒప్పందాలు' },
  { te: 'ఇంద్రుడు', en: 'Indra', zone: 'నైరుతి మధ్య', governs: 'శక్తి, సంరక్షణ' },
  { te: 'ఇంద్రజయుడు', en: 'Indrajaya', zone: 'నైరుతి మధ్య', governs: 'జయం, ఆధిపత్యం' },
  { te: 'రుద్రుడు', en: 'Rudra', zone: 'వాయవ్య మధ్య', governs: 'పరివర్తన, అడ్డంకుల నివారణ' },
  { te: 'రాజయక్ష్ముడు', en: 'Rajayakshma', zone: 'వాయవ్య మధ్య', governs: 'రాజ్యం, మానసిక బలం' },
];

export const VASTU_DEVATAS: VastuDevata[] = [
  {
    nameTe: 'బ్రహ్మ',
    nameEn: 'Brahma',
    vithiTe: 'బ్రహ్మ వీథి (కేంద్రం)',
    zoneTe: 'బ్రహ్మస్థానం (మధ్య 3×3)',
    governsTe: 'సృష్టి, సమతుల్యం, ప్రాణ శక్తి — ఎప్పుడూ ఖాళీ, శుభ్రం, ప్రకాశవంతంగా ఉండాలి',
  },
  ...INNER_DEVATAS.map((d) => ({
    nameTe: d.te,
    nameEn: d.en,
    vithiTe: 'దేవ / మనుష్య వీథి (లోపలి వలయం)',
    zoneTe: d.zone,
    governsTe: d.governs,
  })),
  ...OUTER_32_ORDER.map((d) => ({
    nameTe: d.te,
    nameEn: d.en,
    vithiTe: 'పైశాచిక వీథి (బాహ్య వలయం)',
    zoneTe: 'సరిహద్దు పదాలు',
    governsTe: d.governs,
  })),
];

/* ================================================================== *
 *  Nama Vastu — syllable → nakshatra pada
 * ================================================================== */

/** Standard 108 nakshatra-pada name syllables (English transliteration). */
export const NAMA_SYLLABLES_EN: { nakshatraIndex: number; pada: number; syllable: string }[] = [
  ...[['Chu', 'Che', 'Cho', 'La'], ['Li', 'Lu', 'Le', 'Lo'], ['A', 'I', 'U', 'E'], ['O', 'Va', 'Vi', 'Vu'],
    ['Ve', 'Vo', 'Ka', 'Ki'], ['Ku', 'Gha', 'Nga', 'Chha'], ['Ke', 'Ko', 'Ha', 'Hi'], ['Hu', 'He', 'Ho', 'Da'],
    ['Di', 'Du', 'De', 'Do'], ['Ma', 'Mi', 'Mu', 'Me'], ['Mo', 'Ta', 'Ti', 'Tu'], ['Te', 'To', 'Pa', 'Pi'],
    ['Pu', 'Sha', 'Na', 'Tha'], ['Pe', 'Po', 'Ra', 'Ri'], ['Ru', 'Re', 'Ro', 'Ta'], ['Ti', 'Tu', 'Te', 'To'],
    ['Na', 'Ni', 'Nu', 'Ne'], ['No', 'Ya', 'Yi', 'Yu'], ['Ye', 'Yo', 'Bha', 'Bhi'], ['Bhu', 'Dha', 'Pha', 'Dha'],
    ['Bhe', 'Bho', 'Ja', 'Ji'], ['Khi', 'Khu', 'Khe', 'Kho'], ['Ga', 'Gi', 'Gu', 'Ge'], ['Go', 'Sa', 'Si', 'Su'],
    ['Se', 'So', 'Da', 'Di'], ['Du', 'Tha', 'Jha', 'Na'], ['De', 'Do', 'Cha', 'Chi'],
  ].flatMap((syllables, nakIdx) =>
    syllables.map((s, padaIdx) => ({ nakshatraIndex: nakIdx, pada: padaIdx + 1, syllable: s }))
  ),
];

export interface NamaVastuResult {
  name: string;
  matchedSyllable: string;
  nakshatraIndex: number;
  nakshatraTe: string;
  nakshatraEn: string;
  pada: number;
  rasiIndex: number;
  rasiTe: string;
  rasiLordTe: string;
  nakshatraLordTe: string;
  nameDeityTe: string;
  nameElementTe: string;
  favourableDiks: DikInfo['id'][];
  entranceDik: DikInfo['id'];
  sleepHeadDik: DikInfo['id'];
  studyFaceDik: DikInfo['id'];
  safeDik: DikInfo['id'];
  nameNumber: number;
  nameNumerologyTe: string;
  noteTe: string;
}

const RASI_ELEMENT: Record<number, string> = {
  0: 'అగ్ని తత్వం',
  1: 'భూమి తత్వం',
  2: 'వాయు తత్వం',
  3: 'జల తత్వం',
  4: 'అగ్ని తత్వం',
  5: 'భూమి తత్వం',
  6: 'వాయు తత్వం',
  7: 'జల తత్వం',
  8: 'అగ్ని తత్వం',
  9: 'భూమి తత్వం',
  10: 'వాయు తత్వం',
  11: 'జల తత్వం',
};

const RASI_FAVOURABLE_DIKS: Record<number, DikInfo['id'][]> = {
  0: ['E', 'NE', 'S'],
  1: ['S', 'SW', 'N'],
  2: ['N', 'NW', 'E'],
  3: ['N', 'NE', 'W'],
  4: ['E', 'NE', 'S'],
  5: ['S', 'SW', 'N'],
  6: ['W', 'NW', 'N'],
  7: ['N', 'NE', 'W'],
  8: ['E', 'NE', 'NW'],
  9: ['S', 'SW', 'W'],
  10: ['W', 'NW', 'N'],
  11: ['N', 'NE', 'E'],
};

const NUMEROLOGY_PLANET: Record<number, { te: string; natureTe: string; dik: DikInfo['id'][] }> = {
  1: { te: 'సూర్యుడు (1)', natureTe: 'నాయకత్వం, ఆత్మవిశ్వాసం', dik: ['E', 'NE'] },
  2: { te: 'చంద్రుడు (2)', natureTe: 'భావోద్వేగం, సృజన', dik: ['NW', 'N'] },
  3: { te: 'గురుడు (3)', natureTe: 'జ్ఞానం, విస్తరణ', dik: ['NE', 'N'] },
  4: { te: 'రాహువు (4)', natureTe: 'ఆవిష్కరణ, అస్థిరత', dik: ['SW', 'W'] },
  5: { te: 'బుధుడు (5)', natureTe: 'బుద్ధి, వాణిజ్యం', dik: ['N', 'NW'] },
  6: { te: 'శుక్రుడు (6)', natureTe: 'సౌందర్యం, సుఖం', dik: ['SE', 'E'] },
  7: { te: 'కేతువు (7)', natureTe: 'ఆధ్యాత్మికత, విరక్తి', dik: ['NE', 'S'] },
  8: { te: 'శని (8)', natureTe: 'క్రమశిక్షణ, ఓర్పు', dik: ['W', 'SW'] },
  9: { te: 'కుజుడు (9)', natureTe: 'శక్తి, ధైర్యం', dik: ['S', 'SE'] },
};

function numerologyNumber(name: string): number {
  const clean = name.replace(/[^A-Za-z\u0C00-\u0C7F]/g, '');
  let sum = 0;
  for (const ch of clean.toUpperCase()) {
    const code = ch.charCodeAt(0);
    if (code >= 65 && code <= 90) {
      // Pythagorean: A=1 … I=9, J=1 … R=9, S=1 … Z=8
      sum += ((code - 65) % 9) + 1;
    } else if (code >= 0x0c00 && code <= 0x0c7f) {
      // Telugu codepoints folded to 1..9
      sum += ((code - 0x0c00) % 9) + 1;
    }
  }
  if (sum === 0) return 1;
  const root = ((sum - 1) % 9) + 1;
  return root;
}

/**
 * Resolves a person's nakshatra pada from the *name* (Nama Vastu).
 * Telugu names match the padasTe syllable table, Latin names the standard
 * 108-syllable transliteration table.
 */
/** First Telugu akshara (consonant + vowel sign) of a string. */
function firstAkshara(str: string): string {
  const chars = Array.from(str.normalize('NFC').toLowerCase());
  if (chars.length === 0) return '';
  let out = chars[0];
  for (let i = 1; i < chars.length; i++) {
    const cp = chars[i].codePointAt(0) ?? 0;
    if (cp >= 0x0c3e && cp <= 0x0c56) out += chars[i];
    else break;
  }
  return out;
}

export function analyseNamaVastu(name: string): NamaVastuResult {
  const trimmed = name.trim();
  const akshara = firstAkshara(trimmed);
  const baseChar = Array.from(akshara)[0] ?? '';
  let matched: { nakshatraIndex: number; pada: number; syllable: string } | null = null;

  // 1) Exact Telugu akshara match (చ, చూ, చే …) against the 108 pada syllables
  for (let n = 0; n < TELUGU_NAKSHATRAS.length && !matched; n++) {
    const padas = TELUGU_NAKSHATRAS[n].padasTe;
    for (let p = 0; p < padas.length; p++) {
      if (firstAkshara(padas[p]) === akshara) {
        matched = { nakshatraIndex: n, pada: p + 1, syllable: padas[p] };
        break;
      }
    }
  }
  // 2) Same base consonant — pick the pada whose vowel is closest to a bare consonant
  if (!matched && baseChar) {
    const VOWEL_RANK: Record<string, number> = {
      '': 0, 'ా': 1, 'ి': 2, 'ీ': 3, 'ు': 4, 'ూ': 5, 'ె': 6, 'ే': 7, 'ై': 8, 'ొ': 9, 'ో': 10, 'ౌ': 11,
    };
    let bestRank = 99;
    for (let n = 0; n < TELUGU_NAKSHATRAS.length; n++) {
      const padas = TELUGU_NAKSHATRAS[n].padasTe;
      for (let p = 0; p < padas.length; p++) {
        const chars = Array.from(padas[p]);
        if (chars[0] !== baseChar) continue;
        const vowel = chars.slice(1).join('');
        const rank = VOWEL_RANK[vowel] ?? 10;
        if (rank < bestRank) {
          bestRank = rank;
          matched = { nakshatraIndex: n, pada: p + 1, syllable: padas[p] };
        }
      }
    }
  }
  // 3) Latin transliteration — longest syllable that prefixes the name
  if (!matched) {
    const latinUpper = trimmed.toUpperCase().replace(/[^A-Z]/g, '');
    const sorted = [...NAMA_SYLLABLES_EN].sort((a, b) => b.syllable.length - a.syllable.length);
    const foundLatin = sorted.find((sy) => latinUpper.startsWith(sy.syllable.toUpperCase())) ?? null;
    if (foundLatin) matched = foundLatin;
    else {
      const byLetter = sorted.find((sy) => sy.syllable.toUpperCase().startsWith(latinUpper.charAt(0)));
      if (byLetter) matched = byLetter;
    }
  }

  if (!matched) {
    matched = { nakshatraIndex: 0, pada: 1, syllable: akshara || 'A' };
  }

  const nak = TELUGU_NAKSHATRAS[matched.nakshatraIndex];
  const rasiIndex = Math.floor((matched.nakshatraIndex * 4 + (matched.pada - 1)) / 9) % 12;
  const rasi = TELUGU_RASIS[rasiIndex];
  const favourable = RASI_FAVOURABLE_DIKS[rasiIndex] ?? ['E', 'NE', 'N'];
  const num = numerologyNumber(trimmed);
  const numInfo = NUMEROLOGY_PLANET[num] ?? NUMEROLOGY_PLANET[1];

  return {
    name: trimmed,
    matchedSyllable: matched.syllable,
    nakshatraIndex: matched.nakshatraIndex,
    nakshatraTe: nak?.nameTe ?? '',
    nakshatraEn: nak?.nameEn ?? '',
    pada: matched.pada,
    rasiIndex,
    rasiTe: rasi?.nameTe ?? '',
    rasiLordTe: rasi?.lordTe ?? '',
    nakshatraLordTe: nak?.lordTe ?? '',
    nameDeityTe: nak?.deityTe ?? '',
    nameElementTe: RASI_ELEMENT[rasiIndex] ?? '',
    favourableDiks: favourable,
    // Entrance should be in the person's most auspicious dik (east/north preferred)
    entranceDik: favourable.find((d) => d === 'E') ?? favourable.find((d) => d === 'N') ?? favourable[0],
    sleepHeadDik: rasiIndex % 2 === 0 ? 'S' : 'E',
    studyFaceDik: favourable.includes('N') ? 'N' : favourable.includes('E') ? 'E' : favourable[0],
    safeDik: 'SW',
    nameNumber: num,
    nameNumerologyTe: `${numInfo.te} — ${numInfo.natureTe}. అనుకూల దిక్కులు: ${numInfo.dik
      .map((d) => DIK_BY_ID[d].nameTe)
      .join(', ')}`,
    noteTe:
      'పేరు మొదటి అక్షరం → నక్షత్ర పాదం → జన్మ రాశి → దిక్ నిర్ణయం (నామ వాస్తు). జన్మ నక్షత్రం తెలిస్తే అదే ప్రామాణికం; పేరు ఆధారిత విశ్లేషణ సహాయక మార్గదర్శనం మాత్రమే.',
  };
}

/* ================================================================== *
 *  Grama / place Vastu
 * ================================================================== */



export interface PlaceVastuResult {
  placeName: string;
  lat: number;
  lng: number;
  trueNorthNoteTe: string;
  magneticDeclinationDeg: number;
  magneticDeclinationNoteTe: string;
  solarNoonTime: string;
  solarNoonShadowAzimuth: number;
  sunriseShadowAzimuth: number;
  trueNorthStepsTe: string[];
  sunriseAzimuth: number;
  sunsetAzimuth: number;
  summerSolsticeAzimuth: number;
  winterSolsticeAzimuth: number;
  equinoxAzimuth: number;
  orientationAdviceTe: string;
  gatewayAdviceTe: string;
  placeNakshatraTe: string;
  placeDikTe: string;
  plotRatioAdviceTe: string;
}

/**
 * Centered-dipole magnetic declination (IGRF-13 first degree, epoch 2020 + secular
 * variation). Accuracy ≈ ±3°, adequate for Vastu alignment guidance; the UI states
 * the uncertainty and advises a local compass survey for construction.
 */
/**
 * Coarse geomagnetic dipole estimate (IGRF-2020 first degree, secular variation
 * extrapolated). Kept only as a sanity reference — a centred dipole is off by
 * several degrees in mid latitudes, so the UI ranks the solar (shadow) methods
 * far above it.
 */
export function magneticDeclination(lat: number, lng: number, year: number): number {
  const dt = year - 2020;
  const g10 = -29404.8 + 5.7 * dt;
  const g11 = -1450.9 + 14.0 * dt;
  const h11 = 4652.5 - 25.9 * dt;
  const D = Math.PI / 180;
  const thN = Math.atan2(Math.hypot(g11, h11), -g10);
  const phN = Math.atan2(h11, g11) + Math.PI;
  const theta = (90 - lat) * D;
  const phi = lng * D;
  const mx = Math.sin(thN) * Math.cos(phN);
  const my = Math.sin(thN) * Math.sin(phN);
  const mz = Math.cos(thN);
  const rx = Math.sin(theta) * Math.cos(phi);
  const ry = Math.sin(theta) * Math.sin(phi);
  const rz = Math.cos(theta);
  const md = mx * rx + my * ry + mz * rz;
  const bx = 3 * md * rx - mx;
  const by = 3 * md * ry - my;
  const bz = 3 * md * rz - mz;
  const nx = Math.cos(theta) * Math.cos(phi);
  const ny = Math.cos(theta) * Math.sin(phi);
  const nz = -Math.sin(theta);
  const ex = -Math.sin(phi);
  const ey = Math.cos(phi);
  const bn = bx * nx + by * ny + bz * nz;
  const be = bx * ex + by * ey;
  return Math.atan2(be, bn) / D;
}

export function analysePlaceVastu(
  placeName: string,
  lat: number,
  lng: number,
  tzOffsetHours = 5.5
): PlaceVastuResult {
  const year = new Date().getFullYear();
  const decl = magneticDeclination(lat, lng, year);
  const equinoxISO = `${year}-03-20`;
  const summerISO = `${year}-06-21`;
  const winterISO = `${year}-12-21`;
  const eqRiseSet = riseSetForLocalDate(equinoxISO, lat, lng, tzOffsetHours);
  const riseJd = eqRiseSet.sunriseJd ?? jdFromMs(Date.UTC(year, 2, 20, 0, 0, 0));
  const setJd = eqRiseSet.sunsetJd ?? jdFromMs(Date.UTC(year, 2, 20, 12, 0, 0));
  const jdEquinox = jdFromMs(Date.UTC(year, 2, 20, 6, 0, 0));
  const sumRise = riseSetForLocalDate(summerISO, lat, lng, tzOffsetHours).sunriseJd ?? jdFromMs(Date.UTC(year, 5, 21, 0, 0, 0));
  const winRise = riseSetForLocalDate(winterISO, lat, lng, tzOffsetHours).sunriseJd ?? jdFromMs(Date.UTC(year, 11, 21, 0, 0, 0));
  const rise = sunHorizontal(riseJd, lat, lng);
  const set = sunHorizontal(setJd, lat, lng);
  const sum = sunHorizontal(sumRise, lat, lng);
  const win = sunHorizontal(winRise, lat, lng);

  const placeNama = analyseNamaVastu(placeName);

  // --- Exact true-north geometry (independent of any magnetic model) ---
  const noonJd = (riseJd + setJd) / 2;
  const noonAz = sunHorizontal(noonJd, lat, lng).azimuth; // ≈180° north hemisphere, ≈0° south
  const noonShadow = (noonAz + 180) % 360;
  const shadowAz = (rise.azimuth + 180) % 360;
  // Equal-altitude (Indian circle) method: two instants symmetric about solar noon
  const sha1 = formatLocalHM(noonJd - 0.0833, tzOffsetHours); // solar noon − 2h
  const sha2 = formatLocalHM(noonJd + 0.0833, tzOffsetHours); // solar noon + 2h
  const noonClock = formatLocalHM(noonJd, tzOffsetHours);

  return {
    placeName,
    lat,
    lng,
    trueNorthNoteTe:
      'వాస్తు ప్రామాణికం ఎప్పుడూ "నిజ ఉత్తరం" (True North). దిక్సూచి ముల్లు నిజ ఉత్తరాన్ని చూపదు — స్థానిక అయస్కాంత దిక్పాతం ప్రకారం సరిచేసుకోవాలి.',
    magneticDeclinationDeg: Number(decl.toFixed(2)), // coarse dipole estimate only — never used for alignment
    magneticDeclinationNoteTe:
      'దిక్సూచి ముల్లు అయస్కాంత ఉత్తరాన్ని చూపుతుంది; భారతదేశంలో ఇది నిజ ఉత్తరానికి సుమారు 0°–2° తేడాతో ఉంటుంది (ప్రాంతాన్ని బట్టి మారుతుంది). ఖచ్చితమైన విలువ కోసం ప్రస్తుత WMM/IGRF చార్ట్ లేదా స్థానిక సర్వే చూడండి — క్రింది సూర్య-నీడ పద్ధతులు అయస్కాంత ప్రభావం లేని ఖచ్చిత నిర్ణయం ఇస్తాయి.',
    solarNoonTime: noonClock,
    solarNoonShadowAzimuth: Number(noonShadow.toFixed(1)),
    sunriseShadowAzimuth: Number(shadowAz.toFixed(1)),
    trueNorthStepsTe: [
      `ఖచ్చిత పద్ధతి 1 — మధ్యాహ్న నీడ: ఈ ప్రదేశంలో స్థానిక మధ్యాహ్నం ${noonClock} గంటలకు సూర్యుడు ${noonAz.toFixed(
        1
      )}° దిక్కున ఉంటాడు; ఆ సమయంలో నిలువుగా పాతిన కర్ర నీడ ${noonShadow.toFixed(
        1
      )}° వైపు పడుతుంది. ఆ రేఖ నిజ ఉత్తర-దక్షిణ రేఖ.`,
      `ఖచ్చిత పద్ధతి 2 — సమ నీడ (భారతీయ వృత్త) పద్ధతి: ఉదయం ${sha1} మరియు మధ్యాహ్నం ${sha2} (స్థానిక మధ్యాహ్నానికి సమాన దూరంలో) ఒకే కర్ర నీడ కొనను రెండు సార్లు గుర్తించండి.`,
      'ఆ రెండు గుర్తులను కలిపే రేఖ ఖచ్చితంగా తూర్పు-పడమర. దానికి లంబంగా గీసిన రేఖ నిజ ఉత్తర-దక్షిణం — ఇది అయస్కాంత ప్రభావం లేని జ్యామితీయ పద్ధతి.',
      `విషువత్తు రోజు (మార్చి 20) సూర్యోదయం ${rise.azimuth.toFixed(
        1
      )}° — అంటే దాదాపు ఖచ్చితంగా తూర్పు. ఆ రోజు నీడ పడమర వైపు పడుతుంది; ఇది వేగవంతమైన ధృవీకరణ.`,
      'దిక్సూచి (Compass) వాడితే: అయస్కాంత ఉత్తరం భారతదేశంలో నిజ ఉత్తరానికి సుమారు 0°–2° తేడాతో ఉంటుంది (ప్రాంతాన్ని బట్టి మారుతుంది). నిర్మాణానికి ముందు ప్రస్తుత అయస్కాంత చార్ట్ / స్థానిక సర్వే తప్పనిసరి.',
      'రాత్రి పూట ధ్రువ నక్షత్రం (Polaris) ఉత్తర దిక్కును సూచిస్తుంది — ఉత్తర అర్ధగోళంలో నిర్మాణ స్థలంలో నేరుగా పరిశీలించవచ్చు.',
    ],
    sunriseAzimuth: Number(rise.azimuth.toFixed(1)),
    sunsetAzimuth: Number(set.azimuth.toFixed(1)),
    summerSolsticeAzimuth: Number(sum.azimuth.toFixed(1)),
    winterSolsticeAzimuth: Number(win.azimuth.toFixed(1)),
    equinoxAzimuth: Number(rise.azimuth.toFixed(1)),
    orientationAdviceTe:
      `ఈ అక్షాంశం (${lat.toFixed(2)}°) వద్ద విషువత్తు రోజు సూర్యోదయం ${rise.azimuth.toFixed(
        1
      )}° దిక్కున, సూర్యాస్తమయం ${set.azimuth.toFixed(
        1
      )}° దిక్కున సంభవిస్తాయి. ఇంటి ముఖభాగాన్ని ఈ అక్షానికి సమాంతరంగా (నిజ తూర్పు-పడమర రేఖకు) సరిచేయడం వల్ల సూర్య కిరణాలు సంవత్సరం పొడవునా సరిగ్గా లోపలికి రావు/రావడం సమతుల్యంగా ఉంటుంది.`,
    gatewayAdviceTe: `గ్రామ/కాలనీ ప్రధాన ద్వారం ఈశాన్యం లేదా ఉత్తరం వైపు ఉండటం శ్రేష్ఠం; నైరుతి ద్వారం పితృ దోషానికి దారి తీస్తుంది. ఈ ప్రదేశానికి అనుకూల దిక్కు: ${
      placeNama.favourableDiks.map((d) => DIK_BY_ID[d].nameTe).join(', ')
    }.`,
    placeNakshatraTe: `${placeNama.nakshatraTe} (పాదం ${placeNama.pada}) — నామ వాస్తు ఆధారంగా`,
    placeDikTe: placeNama.favourableDiks.map((d) => DIK_BY_ID[d].nameTe).join(', '),
    plotRatioAdviceTe:
      'స్థలం పొడవు:వెడల్పు నిష్పత్తి 1:1 (చతురస్రం) శ్రేష్ఠం; 1:2 వరకు ఆమోదయోగ్యం. 1:2 దాటితే "దీర్ఘ చతురస్ర దోషం" — మధ్యలో విభజన లేదా నిర్మాణ విస్తరణతో సరిచేయాలి.',
  };
}

/* ================================================================== *
 *  House audit (interactive)
 * ================================================================== */

export type RoomKey =
  | 'entrance'
  | 'kitchen'
  | 'masterBed'
  | 'pooja'
  | 'toilet'
  | 'staircase'
  | 'waterTank'
  | 'borewell'
  | 'safe'
  | 'study'
  | 'living'
  | 'guest'
  | 'children'
  | 'dining'
  | 'septic'
  | 'balcony';

export interface RoomRule {
  key: RoomKey;
  labelTe: string;
  icon: string;
  bestDiks: DikInfo['id'][];
  okDiks: DikInfo['id'][];
  badDiks: DikInfo['id'][];
  bestTe: string;
  badEffectTe: string;
  remedyTe: string;
  weight: number;
}

export const ROOM_RULES: RoomRule[] = [
  {
    key: 'entrance',
    labelTe: 'ప్రధాన ద్వారం',
    icon: '🚪',
    bestDiks: ['E', 'N', 'NE'],
    okDiks: ['W', 'NW'],
    badDiks: ['SW', 'S', 'SE'],
    bestTe: 'తూర్పు, ఉత్తరం, ఈశాన్యం — ఐశ్వర్యం, ఆరోగ్యం, ప్రగతి.',
    badEffectTe: 'నైరుతి/దక్షిణ ద్వారం — ఆర్థిక నష్టం, కుటుంబ కలహాలు, ఆరోగ్య బాధలు.',
    remedyTe: 'ద్వారానికి ఇరువైపులా గణపతి/ద్వారపాలక విగ్రహాలు, పసుపు రంగు, "ఓం" చిహ్నం, త్రిశూలం.',
    weight: 22,
  },
  {
    key: 'kitchen',
    labelTe: 'వంటగది',
    icon: '🔥',
    bestDiks: ['SE'],
    okDiks: ['NW'],
    badDiks: ['NE', 'N', 'SW', 'S'],
    bestTe: 'ఆగ్నేయం — అగ్ని మూల. వంట చేసేవారు తూర్పు ముఖంగా ఉండాలి.',
    badEffectTe: 'ఈశాన్య/ఉత్తర వంటగది — ఆరోగ్య సమస్యలు, ఆర్థిక ఇబ్బందులు, గృహిణి కష్టాలు.',
    remedyTe: 'పొయ్యిని ఆగ్నేయ మూలకు జరపండి; ఎరుపు రంగు, నీటి మూలను దూరంగా ఉంచండి, అగ్ని యంత్రం.',
    weight: 16,
  },
  {
    key: 'masterBed',
    labelTe: 'యజమాని నిద్ర గది',
    icon: '🛏️',
    bestDiks: ['SW'],
    okDiks: ['S', 'W'],
    badDiks: ['NE', 'SE', 'N', 'E'],
    bestTe: 'నైరుతి — స్థిరత్వం, దాంపత్య సుఖం, ఆర్థిక రక్షణ. తల దక్షిణం/తూర్పు వైపు.',
    badEffectTe: 'ఈశాన్య/ఆగ్నేయ నిద్ర — నిద్ర లోపం, ఆరోగ్య సమస్యలు, అశాంతి.',
    remedyTe: 'మంచం తలభాగం దక్షిణానికి; నైరుతి గదిని భారీగా ఉంచండి; ఎరుపు/గులాబీ రంగు.',
    weight: 14,
  },
  {
    key: 'pooja',
    labelTe: 'పూజా మందిరం',
    icon: '🕉️',
    bestDiks: ['NE', 'E', 'N'],
    okDiks: ['W'],
    badDiks: ['S', 'SW', 'SE', 'NW'],
    bestTe: 'ఈశాన్యం — దేవతల మూల. విగ్రహాలు తూర్పు/ఉత్తర ముఖంగా, పూజ చేసేవారు తూర్పు ముఖంగా.',
    badEffectTe: 'దక్షిణ/నైరుతి పూజా గది — ఫలితం ఆలస్యం, మానసిక అశాంతి.',
    remedyTe: 'ఈశాన్యంలో పూజా మందిరం; పసుపు/తెలుపు రంగు, దీపం ఎప్పుడూ వెలుగుతూ ఉండాలి.',
    weight: 12,
  },
  {
    key: 'toilet',
    labelTe: 'మరుగుదొడ్డి',
    icon: '🚽',
    bestDiks: ['NW', 'W'],
    okDiks: ['S'],
    badDiks: ['NE', 'N', 'E', 'SE', 'SW'],
    bestTe: 'వాయవ్యం / పడమర — అశుభ భాగాలు.',
    badEffectTe: 'ఈశాన్య/ఉత్తర మరుగుదొడ్డి — ఆరోగ్యం, ఆర్థికం, పూజా ఫలితం దెబ్బతింటాయి (అత్యంత పెద్ద దోషం).',
    remedyTe: 'తలుపు మూసి ఉంచండి, ఉప్పు/సముద్రపు ఉప్పు పాత్ర, నలుపు-నీలం రంగు, పిరమిడ్ క్యాప్.',
    weight: 14,
  },
  {
    key: 'staircase',
    labelTe: 'మెట్లు',
    icon: '🪜',
    bestDiks: ['SW', 'S', 'W'],
    okDiks: ['NW'],
    badDiks: ['NE', 'E'],
    bestTe: 'నైరుతి/దక్షిణ/పడమర — బరువు భాగాలు. మెట్లు దక్షిణ→ఉత్తరం లేదా పడమర→తూర్పు దిశగా.',
    badEffectTe: 'ఈశాన్య/కేంద్ర మెట్లు — బ్రహ్మస్థాన భంగం, ఆర్థిక నష్టం.',
    remedyTe: 'మెట్ల కింద నిల్వ లేదా శుభ్రత; బ్రహ్మస్థానంలో మెట్లు ఉంటే దాన్ని తేలికగా/తెరిచి ఉంచండి.',
    weight: 8,
  },
  {
    key: 'waterTank',
    labelTe: 'మంచినీటి ట్యాంక్',
    icon: '💧',
    bestDiks: ['NE', 'N', 'E'],
    okDiks: ['NW'],
    badDiks: ['SW', 'S', 'SE'],
    bestTe: 'ఈశాన్యం/ఉత్తరం — జల మూల, ఐశ్వర్యం.',
    badEffectTe: 'నైరుతి/దక్షిణ నీటి ట్యాంక్ — సంపద నష్టం, స్థిరత్వ భంగం.',
    remedyTe: 'ట్యాంక్ను ఈశాన్యానికి జరపండి; తెలుపు/నీలం రంగు, కుబేర యంత్రం.',
    weight: 8,
  },
  {
    key: 'borewell',
    labelTe: 'బోరు / నీటి వనరు',
    icon: '🌀',
    bestDiks: ['NE', 'N', 'E'],
    okDiks: [],
    badDiks: ['SW', 'S', 'SE', 'W'],
    bestTe: 'ఈశాన్యం/ఉత్తరం/తూర్పు.',
    badEffectTe: 'నైరుతి/దక్షిణ బోరు — ధన హాని, గృహ శాంతి భంగం.',
    remedyTe: 'బోరును ఈశాన్యానికి; త్రికోణం/త్రిశూలం గుర్తు, నీటి తలం తెరిచి ఉంచకండి.',
    weight: 6,
  },
  {
    key: 'safe',
    labelTe: 'బీరువా / ధన నిల్వ',
    icon: '💰',
    bestDiks: ['N', 'SW'],
    okDiks: ['NE'],
    badDiks: ['SE', 'S', 'W'],
    bestTe: 'ఉత్తరం (కుబేరుడు) లేదా నైరుతి (స్థిరత్వం); తలుపు ఉత్తరం/తూర్పు ముఖంగా.',
    badEffectTe: 'ఆగ్నేయ/దక్షిణ ధన నిల్వ — వ్యయాలు, నష్టం.',
    remedyTe: 'బీరువాను ఉత్తర/నైరుతి గోడకు ఆనించి, తెరిచేటప్పుడు ఉత్తరం/తూర్పు వైపు; శ్రీ సూక్తం.',
    weight: 6,
  },
  {
    key: 'study',
    labelTe: 'చదువు గది',
    icon: '📚',
    bestDiks: ['E', 'N', 'NE'],
    okDiks: ['W'],
    badDiks: ['S', 'SW'],
    bestTe: 'తూర్పు/ఉత్తరం — జ్ఞాన ప్రాప్తి. చదువుతున్నప్పుడు తూర్పు/ఉత్తర ముఖంగా.',
    badEffectTe: 'దక్షిణ/నైరుతి చదువు — ఏకాగ్రత లోపం.',
    remedyTe: 'బల్లను ఈశాన్య మూలకు, సరస్వతీ చిత్రం, పుస్తకాల అలమారా ఉత్తర గోడకు.',
    weight: 5,
  },
  {
    key: 'living',
    labelTe: 'హాల్ / వరండా',
    icon: '🛋️',
    bestDiks: ['E', 'N', 'NE'],
    okDiks: ['NW', 'W'],
    badDiks: ['SW', 'S'],
    bestTe: 'తూర్పు/ఉత్తరం — స్వాగతం, సామాజిక గౌరవం.',
    badEffectTe: 'నైరుతి హాల్ — అతిథులతో వివాదాలు.',
    remedyTe: 'హాల్లో ఉత్తర/తూర్పు కిటికీలు తెరిచి ఉంచండి; తేలికైన రంగులు.',
    weight: 4,
  },
  {
    key: 'guest',
    labelTe: 'అతిథి గది',
    icon: '🧳',
    bestDiks: ['NW', 'W'],
    okDiks: ['N'],
    badDiks: ['NE', 'SW'],
    bestTe: 'వాయవ్యం/పడమర — గమన భాగం.',
    badEffectTe: 'ఈశాన్య అతిథి గది — పూజా భావం దెబ్బతినడం.',
    remedyTe: 'అతిథి గదిని వాయవ్యంలో; తేలికపాటి వస్తువులు.',
    weight: 3,
  },
  {
    key: 'children',
    labelTe: 'పిల్లల గది',
    icon: '🧸',
    bestDiks: ['E', 'N', 'W'],
    okDiks: ['NW'],
    badDiks: ['SW', 'S'],
    bestTe: 'తూర్పు/ఉత్తరం/పడమర — అభ్యాసం, వృద్ధి.',
    badEffectTe: 'నైరుతి పిల్లల గది — అభ్యాసంలో ఆటంకం.',
    remedyTe: 'పిల్లల మంచం తల తూర్పు/దక్షిణం; గ్రీన్ బోర్డ్, సరస్వతీ చిత్రం.',
    weight: 4,
  },
  {
    key: 'dining',
    labelTe: 'భోజన గది',
    icon: '🍽️',
    bestDiks: ['W', 'E', 'NW'],
    okDiks: ['N'],
    badDiks: ['SW', 'SE'],
    bestTe: 'పడమర/తూర్పు — ఆహార సమృద్ధి. భోజనం చేసేటప్పుడు తూర్పు/ఉత్తర ముఖం.',
    badEffectTe: 'నైరుతి భోజన గది — ఆరోగ్య సమస్యలు.',
    remedyTe: 'వంటగదికి దగ్గరగా, తూర్పు ముఖంగా భోజనం; తేలికైన వెలుతురు.',
    weight: 3,
  },
  {
    key: 'septic',
    labelTe: 'సెప్టిక్ ట్యాంక్',
    icon: '🛢️',
    bestDiks: ['NW', 'W'],
    okDiks: [],
    badDiks: ['NE', 'E', 'N', 'S', 'SW'],
    bestTe: 'వాయవ్యం/పడమర — ఇంటికి వెలుపల, సరిహద్దు దాటి.',
    badEffectTe: 'ఈశాన్య/దక్షిణ సెప్టిక్ — తీవ్ర దోషం, ఆరోగ్య హాని.',
    remedyTe: 'ట్యాంక్ను వాయవ్యానికి; కవర్ గట్టిగా, సముద్రపు ఉప్పు/సున్నం వాడండి.',
    weight: 5,
  },
  {
    key: 'balcony',
    labelTe: 'బాల్కనీ / ముఖ ద్వారం దృశ్యం',
    icon: '🌿',
    bestDiks: ['NE', 'E', 'N'],
    okDiks: ['W'],
    badDiks: ['SW'],
    bestTe: 'ఈశాన్యం/తూర్పు — శుభ దృశ్యం, తెరిచిన ఆకాశం.',
    badEffectTe: 'నైరుతి బాల్కనీ భారం — అస్థిరత.',
    remedyTe: 'మొక్కలు, తులసి, ఇనుప రైలింగ్ తక్కువ; ఎదురుగా భవనం/చెట్టు అడ్డం ఉండకూడదు.',
    weight: 3,
  },
];

export interface RoomAssessment {
  key: RoomKey;
  labelTe: string;
  icon: string;
  dik: DikInfo['id'];
  dikNameTe: string;
  verdict: 'best' | 'ok' | 'bad';
  verdictTe: string;
  score: number;
  adviceTe: string;
  remedyTe: string;
}

export interface VastuAuditResult {
  rooms: RoomAssessment[];
  totalScore: number;
  gradeTe: string;
  gradeEn: string;
  strongestRoomTe: string;
  weakestRoomTe: string;
  doshas: { nameTe: string; severityTe: string; effectTe: string; remedyTe: string }[];
  topRemediesTe: string[];
}

export type RoomMap = Partial<Record<RoomKey, DikInfo['id']>>;

export const DEFAULT_ROOM_MAP: RoomMap = {
  entrance: 'E',
  kitchen: 'SE',
  masterBed: 'SW',
  pooja: 'NE',
  toilet: 'NW',
  staircase: 'SW',
  waterTank: 'NE',
  borewell: 'NE',
  safe: 'N',
  study: 'E',
  living: 'E',
  guest: 'NW',
  children: 'W',
  dining: 'W',
  septic: 'NW',
  balcony: 'NE',
};

export function auditHouse(rooms: RoomMap): VastuAuditResult {
  const assessments: RoomAssessment[] = [];
  const totalWeight = ROOM_RULES.reduce((sum, r) => sum + r.weight, 0);
  let weighted = 0;

  for (const rule of ROOM_RULES) {
    const dik = rooms[rule.key] ?? DEFAULT_ROOM_MAP[rule.key] ?? 'E';
    const isBest = rule.bestDiks.includes(dik);
    const isOk = rule.okDiks.includes(dik);
    const isBad = rule.badDiks.includes(dik);
    const score = isBest ? 100 : isOk ? 70 : isBad ? 30 : 50;
    weighted += score * rule.weight;
    assessments.push({
      key: rule.key,
      labelTe: rule.labelTe,
      icon: rule.icon,
      dik,
      dikNameTe: DIK_BY_ID[dik].nameTe,
      verdict: isBest ? 'best' : isOk ? 'ok' : 'bad',
      verdictTe: isBest ? 'ఉత్తమం' : isOk ? 'ఆమోదయోగ్యం' : 'దోషం',
      score,
      adviceTe: isBest ? rule.bestTe : isBad ? rule.badEffectTe : 'మధ్యస్థ స్థానం — సాధ్యమైతే మార్చుకోవడం మేలు.',
      remedyTe: rule.remedyTe,
    });
  }

  const totalScore = Math.round(weighted / totalWeight);
  const bad = assessments.filter((a) => a.verdict === 'bad').sort((a, b) => b.score - a.score);
  const best = [...assessments].sort((a, b) => b.score - a.score);

  const doshas = bad.map((b) => ({
    nameTe: `${b.labelTe} — ${b.dikNameTe}`,
    severityTe: b.key === 'toilet' || b.key === 'entrance' || b.key === 'pooja' ? 'తీవ్రం' : 'మధ్యమం',
    effectTe: b.adviceTe,
    remedyTe: b.remedyTe,
  }));

  const grade =
    totalScore >= 88
      ? { te: 'వాస్తు శ్రేష్ఠం (ఉత్తమ గృహం)', en: 'Excellent' }
      : totalScore >= 74
        ? { te: 'వాస్తు శుభం', en: 'Good' }
        : totalScore >= 60
          ? { te: 'మధ్యమ వాస్తు — సరిదిద్దుకోదగినది', en: 'Average' }
          : totalScore >= 45
            ? { te: 'వాస్తు దోష యుక్తం — పరిహారాలు అవసరం', en: 'Needs correction' }
            : { te: 'తీవ్ర వాస్తు దోషం — మార్పులు తప్పనిసరి', en: 'Severe defects' };

  return {
    rooms: assessments,
    totalScore,
    gradeTe: grade.te,
    gradeEn: grade.en,
    strongestRoomTe: `${best[0]?.labelTe ?? ''} (${best[0]?.dikNameTe ?? ''})`,
    weakestRoomTe: bad.length ? `${bad[0].labelTe} (${bad[0].dikNameTe})` : 'ప్రధాన దోషాలు లేవు',
    doshas,
    topRemediesTe: bad.slice(0, 4).map((b) => `${b.labelTe}: ${b.remedyTe}`),
  };
}

/* ================================================================== *
 *  Direction helpers
 * ================================================================== */

/** Convert an azimuth (deg) to the nearest of the 8 dik. */
export function azimuthToDik(azimuth: number): DikInfo['id'] {
  const norm = ((azimuth % 360) + 360) % 360;
  const idx = Math.round(norm / 45) % 8;
  return (['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] as DikInfo['id'][])[idx];
}

/** Convert an azimuth to the 16-zone name. */
export function azimuthToZone(azimuth: number): ZoneInfo {
  const norm = ((azimuth % 360) + 360) % 360;
  const idx = Math.round(norm / 22.5) % 16;
  return ZONE_INFO[idx];
}

/** 9×9 mandala cell → which dik / vithi it belongs to (row 0 = north). */
export function mandalaCellInfo(row: number, col: number): {
  ringTe: string;
  dik: DikInfo['id'] | 'Center';
  devataIndex: number | null;
} {
  const isCenter = row >= 3 && row <= 5 && col >= 3 && col <= 5;
  if (isCenter) return { ringTe: 'బ్రహ్మస్థానం', dik: 'Center', devataIndex: 0 };

  const isPerimeter = row === 0 || row === 8 || col === 0 || col === 8;
  const centerRow = row - 4;
  const centerCol = col - 4;
  const angle = (Math.atan2(centerCol, -centerRow) * 180) / Math.PI; // 0 = north, clockwise
  const dik = azimuthToDik((angle + 360) % 360);
  if (!isPerimeter) return { ringTe: 'దేవ / మనుష్య వీథి', dik, devataIndex: null };

  // Perimeter index: 32 cells walked clockwise from the NE corner (row 0, col 8):
  //   east edge (rows 0-7) → south edge (cols 8-1) → west edge (rows 8-1) → north edge (cols 0-7)
  let perimeterIndex = 0;
  if (col === 8) perimeterIndex = row; // 0..7
  else if (row === 8) perimeterIndex = 8 + (8 - col); // 8..15
  else if (col === 0) perimeterIndex = 16 + (8 - row); // 16..23
  else perimeterIndex = 24 + col; // 24..31 (north edge, NW → NE)
  perimeterIndex = Math.min(31, Math.max(0, perimeterIndex));
  return { ringTe: 'పైశాచిక వీథి', dik, devataIndex: 13 + perimeterIndex };
}

/** Builds the 9×9 mandala grid for rendering. */
export function buildMandalaGrid(): {
  row: number;
  col: number;
  ringTe: string;
  dik: DikInfo['id'] | 'Center';
  devata: VastuDevata | null;
  zoneNameTe: string;
}[] {
  const cells: ReturnType<typeof buildMandalaGrid> = [];
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const info = mandalaCellInfo(row, col);
      const angle = (Math.atan2(col - 4, -(row - 4)) * 180) / Math.PI;
      const zone = info.dik === 'Center' ? null : azimuthToZone((angle + 360) % 360);
      cells.push({
        row,
        col,
        ringTe: info.ringTe,
        dik: info.dik,
        devata:
          info.devataIndex !== null && info.devataIndex < VASTU_DEVATAS.length
            ? VASTU_DEVATAS[info.devataIndex]
            : null,
        zoneNameTe: zone?.nameTe ?? 'బ్రహ్మస్థానం',
      });
    }
  }
  return cells;
}

/* ================================================================== *
 *  Plot shape & soil quick checks (purely textual guidance engine)
 * ================================================================== */

export interface PlotCheckResult {
  shapeAdviceTe: string;
  slopeAdviceTe: string;
  roadAdviceTe: string;
  score: number;
}

export function plotGuidance(input: {
  shape: 'square' | 'rectangle' | 'irregular' | 'triangular' | 'l-shaped';
  slope: 'north-east' | 'north' | 'east' | 'south-west' | 'south' | 'flat';
  road: DikInfo['id'];
  lengthFt: number;
  widthFt: number;
}): PlotCheckResult {
  let score = 70;
  let shapeAdviceTe = '';
  switch (input.shape) {
    case 'square':
      score += 20;
      shapeAdviceTe = 'చతురస్ర స్థలం — వాస్తు శాస్త్రంలో అత్యుత్తమం (సమతుల్య శక్తి).';
      break;
    case 'rectangle':
      score += 12;
      shapeAdviceTe = 'దీర్ఘ చతురస్ర స్థలం — ఆమోదయోగ్యం; ఉత్తర-దక్షిణ పొడవు ఎక్కువ ఉండటం మేలు.';
      break;
    case 'l-shaped':
      score -= 15;
      shapeAdviceTe = 'L-ఆకార స్థలం — ఖాళీ మూలాన్ని నిర్మాణంతో పూరించాలి; నైరుతి ఖాళీ ఉంటే తీవ్ర దోషం.';
      break;
    case 'triangular':
      score -= 28;
      shapeAdviceTe = 'త్రికోణ స్థలం — వాస్తు దోషం; సరిహద్దు సరిచేసి చతురస్రంగా మార్చుకోవాలి.';
      break;
    default:
      score -= 22;
      shapeAdviceTe = 'అనియత ఆకారం — మూలలు కత్తిరించబడిన స్థలం దోషం; సమం చేయాలి.';
  }

  let slopeAdviceTe = '';
  if (input.slope === 'north-east' || input.slope === 'north' || input.slope === 'east') {
    score += 10;
    slopeAdviceTe = 'ఈశాన్య/ఉత్తర/తూర్పు వాలుతో ఉన్న స్థలం — జల ప్రవాహం శుభ దిక్కుకు, అత్యుత్తమం.';
  } else if (input.slope === 'south-west' || input.slope === 'south') {
    score -= 12;
    slopeAdviceTe = 'నైరుతి/దక్షిణ వాలు — ధన నష్ట దోషం; నైరుతిని పూరించి, ఈశాన్యానికి వాలు మార్చాలి.';
  } else {
    slopeAdviceTe = 'సమతల స్థలం — మంచిది; ఈశాన్యం కొద్దిగా తక్కువగా ఉండేలా లెవెలింగ్ చేయండి.';
  }

  let roadAdviceTe = '';
  if (input.road === 'N' || input.road === 'E' || input.road === 'NE') {
    score += 10;
    roadAdviceTe = `${DIK_BY_ID[input.road].nameTe} వైపు రోడ్డు — శుభం; ప్రధాన ద్వారం అదే వైపు ఉండవచ్చు.`;
  } else if (input.road === 'SW' || input.road === 'S' || input.road === 'SE') {
    score -= 10;
    roadAdviceTe = `${DIK_BY_ID[input.road].nameTe} వైపు రోడ్డు — ద్వారాన్ని అక్కడ ఉంచకండి; తూర్పు/ఉత్తర ద్వారం ఏర్పాటు చేయండి.`;
  } else {
    roadAdviceTe = `${DIK_BY_ID[input.road].nameTe} వైపు రోడ్డు — ఆమోదయోగ్యం; ద్వారం ఈశాన్యం/తూర్పు వైపు ఉంచడం మేలు.`;
  }

  const ratio = Math.max(input.lengthFt, input.widthFt) / Math.max(1, Math.min(input.lengthFt, input.widthFt));
  if (ratio > 2) {
    score -= 10;
    shapeAdviceTe += ' పొడవు:వెడల్పు నిష్పత్తి 1:2 దాటింది — నిర్మాణాన్ని రెండు భాగాలుగా విభజించడం మేలు.';
  }

  return {
    shapeAdviceTe,
    slopeAdviceTe,
    roadAdviceTe,
    score: Math.max(5, Math.min(100, score)),
  };
}

/* ================================================================== *
 *  Combined report
 * ================================================================== */

export interface CompleteVastuReport {
  nama: NamaVastuResult;
  place: PlaceVastuResult;
  audit: VastuAuditResult;
  plot: PlotCheckResult;
  dikList: DikInfo[];
  zones: ZoneInfo[];
  devatas: VastuDevata[];
  mandala: ReturnType<typeof buildMandalaGrid>;
  personalDirectionsTe: { purposeTe: string; dikTe: string; reasonTe: string }[];
  summaryTe: string;
}

export function generateVastuReport(params: {
  name: string;
  placeName: string;
  lat: number;
  lng: number;
  tzOffsetHours?: number;
  rooms?: RoomMap;
  plot?: {
    shape: 'square' | 'rectangle' | 'irregular' | 'triangular' | 'l-shaped';
    slope: 'north-east' | 'north' | 'east' | 'south-west' | 'south' | 'flat';
    road: DikInfo['id'];
    lengthFt: number;
    widthFt: number;
  };
}): CompleteVastuReport {
  const nama = analyseNamaVastu(params.name);
  const place = analysePlaceVastu(
    params.placeName,
    params.lat,
    params.lng,
    params.tzOffsetHours ?? 5.5
  );
  const audit = auditHouse(params.rooms ?? DEFAULT_ROOM_MAP);
  const plot = plotGuidance(
    params.plot ?? { shape: 'rectangle', slope: 'north-east', road: 'E', lengthFt: 40, widthFt: 30 }
  );

  const personalDirectionsTe = [
    {
      purposeTe: 'నిద్ర (తల భాగం)',
      dikTe: DIK_BY_ID[nama.sleepHeadDik].nameTe,
      reasonTe: 'తల దక్షిణం/తూర్పు వైపు ఉంచడం వల్ల మెదడులో రక్త ప్రసరణ మెరుగవుతుంది; ఉత్తరం వైపు తల ఉంచరాదు.',
    },
    {
      purposeTe: 'చదువు / పని బల్ల (ముఖం)',
      dikTe: DIK_BY_ID[nama.studyFaceDik].nameTe,
      reasonTe: 'జన్మ రాశి అనుకూల దిక్కు వైపు ముఖం ఉంచడం వల్ల ఏకాగ్రత, విజయావకాశాలు పెరుగుతాయి.',
    },
    {
      purposeTe: 'ప్రధాన ద్వారం',
      dikTe: DIK_BY_ID[nama.entranceDik].nameTe,
      reasonTe: 'జన్మ రాశి ప్రభావానికి అనుగుణమైన ద్వార దిక్కు — గృహ ప్రవేశ శుభం.',
    },
    {
      purposeTe: 'ధన నిల్వ / బీరువా',
      dikTe: 'నైరుతి (తలుపు ఉత్తరం/తూర్పు)',
      reasonTe: 'ధనానికి అధిపతి కుబేరుడు (ఉత్తరం), స్థిరత్వానికి నైరుతి — రెండింటి కలయిక శ్రేష్ఠం.',
    },
    {
      purposeTe: 'పూజా మందిరం',
      dikTe: 'ఈశాన్యం',
      reasonTe: 'ఈశాన్యం దేవతల మూల; పూజ చేసేవారు తూర్పు ముఖంగా ఉండాలి.',
    },
  ];

  const summaryTe = `శ్రీ ${params.name} గారి పేరు మొదటి అక్షరం "${nama.matchedSyllable}" → ${nama.nakshatraTe} నక్షత్రం ${nama.pada}వ పాదం → ${nama.rasiTe} రాశి (నామ అంకం ${nama.nameNumber}). ${params.placeName} వాస్తు ప్రకారం నిజ ఉత్తరాన్ని సూర్య-నీడ పద్ధతిలో నిర్ణయించాలి (అయస్కాంత దిక్పాతం అంచనా ${place.magneticDeclinationDeg}°). ప్రస్తుత గృహ వాస్తు స్కోరు ${audit.totalScore}/100 — ${audit.gradeTe}. బలమైన భాగం: ${audit.strongestRoomTe}. సరిదిద్దవలసిన భాగం: ${audit.weakestRoomTe}. స్థల పరిశీలన స్కోరు ${plot.score}/100.`;

  return {
    nama,
    place,
    audit,
    plot,
    dikList: DIK_INFO,
    zones: ZONE_INFO,
    devatas: VASTU_DEVATAS,
    mandala: buildMandalaGrid(),
    personalDirectionsTe,
    summaryTe,
  };
}
