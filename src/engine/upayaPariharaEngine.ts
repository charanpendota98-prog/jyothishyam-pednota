import type { CompleteChartResult, PlanetPosition } from './ephemeris.ts';
import { TELUGU_PLANETS, TELUGU_RASIS, TELUGU_NAKSHATRAS } from './teluguJathakam.ts';

export type AfflictionSeverity = 'critical' | 'moderate' | 'mild' | 'benefic_support';

export interface PlanetaryMaleficInfluence {
  planetId: string;
  planetNameTe: string;
  planetNameEn: string;
  rasiNameTe: string;
  house: number;
  degreeFormatted: string;
  isRetrograde: boolean;
  isCombust: boolean;
  combustDistanceDeg?: number;
  dignityTe: string;
  functionalRoleTe: string;
  ruledHouses: number[];
  isFunctionalMalefic: boolean;
  isDusthanaPlaced: boolean;
  isMarakaOrBadhaka: boolean;
  isCurrentDashaOrBhukti: boolean;
  shadbalaPercent: number;
  ashtakavargaBindus: number;
  afflictionScore: number; // 0 to 100
  severity: AfflictionSeverity;
  severityLabelTe: string;
  afflictionReasonsTe: string[];
  shastricReferenceTe: string;
  // Specific Vedic Remedies for this planet
  mantraUpaya: {
    beejaMantraTe: string;
    vedicMantraTe: string;
    stotraOrSuktamTe: string;
    japaCountTe: string;
    dailyCountTe: string;
    homaSamidhaTe: string;
    bestTimeAndDirectionTe: string;
    adhidevataTe: string;
  };
  danaUpaya: {
    danaItemsTe: string;
    vastramColorTe: string;
    metalOrVesselTe: string;
    recipientTe: string;
    dayAndHoraTe: string;
    phalaTe: string;
  };
  templeAndSevaUpaya: {
    kshetraNameTe: string;
    abhishekamOrArchanaTe: string;
    vrataOrKarmaUpayaTe: string;
  };
}

export interface RatnaRecommendationItem {
  roleTe: string; // e.g., లగ్నాధిపతి (జీవన రత్నం), పంచమాధిపతి (విద్యా-పుణ్య రత్నం), భాగ్యాధిపతి (భాగ్య రత్నం)
  houseNum: number;
  planetId: string;
  planetNameTe: string;
  primaryGemTe: string;
  primaryGemEn: string;
  subGemTe: string;
  weightRattiOrCaratTe: string;
  metalTe: string;
  fingerTe: string;
  wearingDayAndHoraTe: string;
  pranaPratishthaMantraTe: string;
  rudrakshaMukhiTe: string;
  whyWearInThisChartTe: string;
  statusType: 'recommended' | 'caution';
}

export interface ProhibitedRatnaItem {
  planetId: string;
  planetNameTe: string;
  gemNameTe: string;
  ruledHousesTe: string;
  reasonToAvoidTe: string;
  alternativeRemedyTe: string;
}

export interface UpayaPariharaReport {
  lagnaNameTe: string;
  lagnaLordTe: string;
  badhakaSthana: number;
  badhakaLordTe: string;
  marakaLordsTe: string[];
  overallAfflictionSummaryTe: string;
  activeDashaRemedyFocusTe: {
    mahaLordTe: string;
    bhuktiLordTe: string;
    antarLordTe: string;
    periodRange: string;
    combinedSynthesisTe: string;
    immediatePariharaTe: string;
  };
  maleficInfluences: PlanetaryMaleficInfluence[];
  ratnaShastra: {
    shastricRuleTe: string;
    recommendedGems: RatnaRecommendationItem[];
    prohibitedGems: ProhibitedRatnaItem[];
    rudrakshaKavachamTe: {
      lagnaRudrakshaTe: string;
      nakshatraRudrakshaTe: string;
      dashaRudrakshaTe: string;
      wearingRulesTe: string;
    };
  };
  panchaMahaUpayasTe: {
    categoryTe: string;
    titleTe: string;
    prescriptionTe: string;
    timingTe: string;
    shastricBenefitTe: string;
  }[];
}

const SIGN_LORDS_ID: Record<number, string> = {
  0: 'Mars',
  1: 'Venus',
  2: 'Mercury',
  3: 'Moon',
  4: 'Sun',
  5: 'Mercury',
  6: 'Venus',
  7: 'Mars',
  8: 'Jupiter',
  9: 'Saturn',
  10: 'Saturn',
  11: 'Jupiter',
};

const EXALTATION_SIGN: Record<string, number> = {
  Sun: 0,
  Moon: 1,
  Mars: 9,
  Mercury: 5,
  Jupiter: 3,
  Venus: 11,
  Saturn: 6,
  Rahu: 1,
  Ketu: 7,
};

const DEBILITATION_SIGN: Record<string, number> = {
  Sun: 6,
  Moon: 7,
  Mars: 3,
  Mercury: 11,
  Jupiter: 9,
  Venus: 5,
  Saturn: 0,
  Rahu: 7,
  Ketu: 1,
};

const OWN_SIGNS: Record<string, number[]> = {
  Sun: [4],
  Moon: [3],
  Mars: [0, 7],
  Mercury: [2, 5],
  Jupiter: [8, 11],
  Venus: [1, 6],
  Saturn: [9, 10],
  Rahu: [10],
  Ketu: [7],
};

const COMBUSTION_ORBS: Record<string, number> = {
  Moon: 12,
  Mars: 17,
  Mercury: 14,
  Jupiter: 11,
  Venus: 10,
  Saturn: 15,
};

interface GrahaPariharaMaster {
  beejaMantraTe: string;
  vedicMantraTe: string;
  stotraOrSuktamTe: string;
  japaCountTe: string;
  dailyCountTe: string;
  homaSamidhaTe: string;
  bestTimeAndDirectionTe: string;
  adhidevataTe: string;
  danaItemsTe: string;
  vastramColorTe: string;
  metalOrVesselTe: string;
  recipientTe: string;
  dayAndHoraTe: string;
  danaPhalaTe: string;
  kshetraNameTe: string;
  abhishekamOrArchanaTe: string;
  vrataOrKarmaUpayaTe: string;
  primaryGemTe: string;
  primaryGemEn: string;
  subGemTe: string;
  metalTe: string;
  fingerTe: string;
  wearingDayAndHoraTe: string;
  rudrakshaMukhiTe: string;
}

const GRAHA_PARIHARA_MASTER: Record<string, GrahaPariharaMaster> = {
  Sun: {
    beejaMantraTe: 'ఓం హ్రాం హ్రీం హ్రౌం సః సూర్యాయ నమః ||',
    vedicMantraTe: 'ఓం ఆకృష్ణేన రజసా వర్తమానో నివేశయన్నమృతం మర్త్యం చ | హిరణ్యయేన సవితా రథేనా దేవో యాతి భువనాని పశ్యన్ ||',
    stotraOrSuktamTe: 'ఆదిత్య హృదయ స్తోత్రం & సూర్యాష్టకం పారాయణ',
    japaCountTe: '7,000 సార్లు (కలియుగ చతుర్గుణ జపం: 28,000 సార్లు)',
    dailyCountTe: 'ప్రతిరోజూ ప్రాతఃకాలంలో 108 సార్లు',
    homaSamidhaTe: 'జిల్లేడు సమిధలు (అర్క సమిధ) + ఆవు నెయ్యి, గోధుమలతో హోమం',
    bestTimeAndDirectionTe: 'ఆదివారం సూర్యోదయ హోరలో · తూర్పు ముఖంగా',
    adhidevataTe: 'అగ్ని దేవుడు (అధిదేవత) · రుద్రుడు (ప్రత్యధిదేవత)',
    danaItemsTe: 'గోధుమలు (7 కిలోలు), తాటి బెల్లం/పాత బెల్లం, ఎర్ర తామర పూలు, రాగి పాత్ర, ఆవు నెయ్యి',
    vastramColorTe: 'ఎరుపు లేదా కాషాయ వర్ణ పట్టు/నూలు వస్త్రం',
    metalOrVesselTe: 'రాగి పాత్ర (Copper Vessel) / బంగారం',
    recipientTe: 'వేద పండితునికి లేదా తండ్రి సమానులైన వృద్ధులకు / శివాలయ అర్చకులకు',
    dayAndHoraTe: 'ఆదివారం ఉదయం సూర్యోదయం నుండి 1 గంట లోపు (రవి హోర)',
    danaPhalaTe: 'పితృ దోష నివారణ, రాజద్వార/ప్రభుత్వ ఆటంకాలు తొలగుట, ఆత్మవిశ్వాసం మరియు నేత్ర-హృదయ ఆరోగ్య సిద్ధి.',
    kshetraNameTe: 'అరసవల్లి సూర్యనారాయణ స్వామి క్షేత్రం (శ్రీకాకుళం) / సూరయనార్ కోయిల్ (కుంభకోణం)',
    abhishekamOrArchanaTe: 'ఆదివారం అరుణ పారాయణ (సూర్య నమస్కారాలు) & ఎర్ర కలువ పూలతో అర్చన',
    vrataOrKarmaUpayaTe: 'ప్రతిరోజూ సూర్యోదయానికి ముందే నిద్రలేచి రాగి చెంబుతో సూర్యునికి అర్ఘ్యం సమర్పించడం, తండ్రిని గౌరవించడం.',
    primaryGemTe: 'కెంపు (Ruby / మాణిక్యం)',
    primaryGemEn: 'Natural Burmese Ruby (Manikyam)',
    subGemTe: 'గార్నెట్ (Red Garnet / తామ్రాశ్మ) లేదా సూర్యకాంతమణి (Sunstone)',
    metalTe: 'బంగారం (Gold) లేదా స్వచ్ఛమైన రాగి (Copper)',
    fingerTe: 'కుడి చేతి ఉంగరపు వేలు (Ring Finger / అనామిక)',
    wearingDayAndHoraTe: 'ఆదివారం ఉదయం రవి హోరలో (శుక్ల పక్ష కృత్తిక, ఉత్తర, ఉత్తరాషాఢ నక్షత్రాలలో)',
    rudrakshaMukhiTe: '1 ముఖి లేదా 12 ముఖి రుద్రాక్ష (ద్వాదశాదిత్య స్వరూపం)',
  },
  Moon: {
    beejaMantraTe: 'ఓం శ్రాం శ్రీం శ్రౌం సః చంద్రమసే నమః ||',
    vedicMantraTe: 'ఓం ఇమం దేవా అసపత్నం సువధ్వం మహతే క్షత్రాయ మహతే జ్యేష్ఠ్యాయ మహతే జానరాజ్యాయేంద్రస్యేంద్రియాయ ||',
    stotraOrSuktamTe: 'శ్రీ లలితా సహస్రనామ స్తోత్రం & చంద్ర కవచం / శివ పంచాక్షరి',
    japaCountTe: '11,000 సార్లు (కలియుగ చతుర్గుణ జపం: 44,000 సార్లు)',
    dailyCountTe: 'సోమవారం / ప్రతిరోజూ సాయంత్రం 108 సార్లు',
    homaSamidhaTe: 'మోదుగ సమిధలు (పలాశ సమిధ) + ఆవు పాలు, బియ్యం, నెయ్యితో హోమం',
    bestTimeAndDirectionTe: 'సోమవారం ఉదయం లేదా పౌర్ణమి సాయంత్రం · వాయువ్య ముఖంగా',
    adhidevataTe: 'జల దేవత / వరుణుడు (అధిదేవత) · గౌరీ దేవి (ప్రత్యధిదేవత)',
    danaItemsTe: 'పచ్చి బియ్యం, ఆవు పాలు, వెండి వస్తువు, తెల్లని పుష్పాలు, కర్పూరం, పంచదార/మిశ్రీ, శంఖం',
    vastramColorTe: 'తెల్లని పట్టు లేదా స్వచ్ఛమైన నూలు వస్త్రం',
    metalOrVesselTe: 'వెండి పాత్ర (Silver) లేదా ముత్యపు శంఖం',
    recipientTe: 'సువాసినులకు లేదా శివాలయ/అమ్మవారి ఆలయ వేద బ్రాహ్మణులకు',
    dayAndHoraTe: 'సోమవారం ఉదయం లేదా సాయంత్రం చంద్ర హోరలో (రోహిణి, హస్త, శ్రవణ నక్షత్రాలు శ్రేష్ఠం)',
    danaPhalaTe: 'మానసిక ఆందోళన, భయాలు, నిద్రలేమి తొలగి మనశ్శాంతి కలుగుట; మాతృ వర్గ సౌఖ్యం మరియు జల గండ నివారణ.',
    kshetraNameTe: 'శ్రీశైలం భ్రమరాంబ మల్లికార్జున స్వామి క్షేత్రం / ద్రాక్షారామం / తిరుపతి (చంద్ర పుష్కరిణి)',
    abhishekamOrArchanaTe: 'సోమవారం శివునికి ఆవు పాలతో రుద్రాభిషేకం & అమ్మవారికి కుంకుమార్చన',
    vrataOrKarmaUpayaTe: 'తల్లి ఆశీస్సులు తీసుకోవడం, పౌర్ణమి చంద్ర దర్శనం, ఆహారం/తాగునీరు వృధా చేయకపోవడం, వెండి గ్లాసులో నీరు త్రాగడం.',
    primaryGemTe: 'ముత్యం (Natural Pearl / మౌక్తికం)',
    primaryGemEn: 'Natural Basra / South Sea Pearl (Mukta)',
    subGemTe: 'చంద్రకాంతమణి (Moonstone)',
    metalTe: 'వెండి (Pure Silver)',
    fingerTe: 'కుడి చేతి చిటికెన వేలు (Little Finger) లేదా ఉంగరపు వేలు',
    wearingDayAndHoraTe: 'సోమవారం ఉదయం శుక్ల పక్ష చంద్ర హోరలో (రోహిణి, హస్త, శ్రవణ నక్షత్రాలలో)',
    rudrakshaMukhiTe: '2 ముఖి రుద్రాక్ష (అర్ధనారీశ్వర స్వరూపం)',
  },
  Mars: {
    beejaMantraTe: 'ఓం క్రాం క్రీం క్రౌం సః భౌమాయ నమః ||',
    vedicMantraTe: 'ఓం అగ్నిర్మూర్ధా దివః కకుత్పతిః పృథివ్యా అయం | అపాం రేతాంసి జిన్వతి ||',
    stotraOrSuktamTe: 'శ్రీ సుబ్రహ్మణ్య భుజంగ స్తోత్రం, అంగారక స్తోత్రం & హనుమాన్ చాలీసా',
    japaCountTe: '10,000 సార్లు (కలియుగ చతుర్గుణ జపం: 40,000 సార్లు)',
    dailyCountTe: 'మంగళవారం ఉదయం 108 సార్లు',
    homaSamidhaTe: 'చండ్ర సమిధలు (ఖదిర సమిధ) + కందులు, బెల్లం, నెయ్యితో హోమం',
    bestTimeAndDirectionTe: 'మంగళవారం ఉదయం కుజ హోరలో · దక్షిణ ముఖంగా',
    adhidevataTe: 'భూదేవి (అధిదేవత) · కుమారస్వామి / స్కందుడు (ప్రత్యధిదేవత)',
    danaItemsTe: 'కందులు (Red Gram / Toor Dal - 5 కిలోలు), ఎర్రని బెల్లం, దానిమ్మ పండ్లు, ఎర్ర చందనం, తేనె',
    vastramColorTe: 'ఎర్రని వస్త్రం (Red Cloth)',
    metalOrVesselTe: 'రాగి పాత్ర (Copper)',
    recipientTe: 'బ్రహ్మచారికి లేదా వేద పండితునికి / సుబ్రహ్మణ్య ఆలయంలో',
    dayAndHoraTe: 'మంగళవారం ఉదయం కుజ హోరలో (మృగశిర, చిత్త, ధనిష్ఠ నక్షత్రాలు శ్రేష్ఠం)',
    danaPhalaTe: 'కుజ దోష తీవ్రత తగ్గుట, వివాహ ఆటంకాలు, రక్తపోటు/శస్త్రచికిత్స భయాలు, భూ-ఆస్తి తగాదాలు మరియు అప్పుల బాధల నివారణ.',
    kshetraNameTe: 'మోపిదేవి / పళని / తిరుత్తణి సుబ్రహ్మణ్యేశ్వర స్వామి క్షేత్రం లేదా వైదీశ్వరన్ కోయిల్',
    abhishekamOrArchanaTe: 'మంగళవారం సుబ్రహ్మణ్య స్వామికి పంచామృతాభిషేకం & ఆంజనేయ స్వామికి సిందూరార్చన',
    vrataOrKarmaUpayaTe: 'మంగళవారం ఉప్పు తగ్గించి సాత్విక ఆహారం తీసుకోవడం, కోపాన్ని నియంత్రించడం, రక్తదానం చేయడం, సోదరులతో సఖ్యత.',
    primaryGemTe: 'పగడం (Red Coral / ప్రవాళం)',
    primaryGemEn: 'Natural Italian / Japanese Red Coral (Moonga)',
    subGemTe: 'కార్నిలియన్ (Red Carnelian)',
    metalTe: 'బంగారం (Gold) లేదా రాగి (Copper)',
    fingerTe: 'కుడి చేతి ఉంగరపు వేలు (Ring Finger / అనామిక)',
    wearingDayAndHoraTe: 'మంగళవారం ఉదయం కుజ హోరలో (శుక్ల పక్ష మృగశిర, చిత్త, ధనిష్ఠ నక్షత్రాలలో)',
    rudrakshaMukhiTe: '3 ముఖి లేదా 6 ముఖి రుద్రాక్ష (కార్తికేయ స్వరూపం)',
  },
  Mercury: {
    beejaMantraTe: 'ఓం బ్రాం బ్రీం బ్రౌం సః బుధాయ నమః ||',
    vedicMantraTe: 'ఓం ఉద్బుధ్యస్వాగ్నే ప్రతిజాగృహి త్వమిష్టాपूर्ते సంసృజేథామయం చ | పునః కృణ్వంస్త్వా పితరం యువానమన్వాతాం సీత్త్వయి తంతుమేతం ||',
    stotraOrSuktamTe: 'శ్రీ విష్ణు సహస్రనామ స్తోత్రం & బుధ కవచం',
    japaCountTe: '9,000 సార్లు (కలియుగ చతుర్గుణ జపం: 36,000 సార్లు)',
    dailyCountTe: 'బుధవారం ఉదయం 108 సార్లు',
    homaSamidhaTe: 'ఉత్తరేణి సమిధలు (అపామార్గ సమిధ) + పెసలు, నెయ్యితో హోమం',
    bestTimeAndDirectionTe: 'బుధవారం ఉదయం బుధ హోరలో · ఉత్తర ముఖంగా',
    adhidevataTe: 'విష్ణుమూర్తి (అధిదేవత) · నారాయణుడు (ప్రత్యధిదేవత)',
    danaItemsTe: 'పెసలు (Green Gram - 5 కిలోలు), ఆకుపచ్చ పండ్లు/కూరగాయలు, కర్పూరం, విద్యా పుస్తకాలు, ఆవు నెయ్యి',
    vastramColorTe: 'ఆకుపచ్చని వస్త్రం (Emerald Green Cloth)',
    metalOrVesselTe: 'కంచు పాత్ర (Bronze / Brass)',
    recipientTe: 'పేద విద్యార్థులకు లేదా విష్ణు ఆలయ వేద పండితులకు',
    dayAndHoraTe: 'బుధవారం ఉదయం బుధ హోరలో (ఆశ్లేష, జ్యేష్ఠ, రేవతి నక్షత్రాలు)',
    danaPhalaTe: 'విద్యా ఆటంకాలు, వ్యాపార నష్టాలు, నరాల బలహీనత, చర్మ వ్యాధులు మరియు వాక్-కమ్యూనికేషన్ దోషాల నివారణ.',
    kshetraNameTe: 'భద్రాచలం / అన్నవరం సత్యనారాయణ స్వామి క్షేత్రం / మధుర మీనాక్షి / తిరువెంగడు',
    abhishekamOrArchanaTe: 'బుధవారం శ్రీ మహావిష్ణువుకు తులసి దళాలతో సహస్రనామార్చన',
    vrataOrKarmaUpayaTe: 'పేద విద్యార్థులకు పుస్తకాలు/పెన్నులు దానం చేయడం, తులసి మొక్కను పెంచడం, అసత్యం ఆడకపోవడం, గోవులకు పచ్చగడ్డి తినిపించడం.',
    primaryGemTe: 'జాతి పచ్చ (Natural Emerald / మరకతం)',
    primaryGemEn: 'Natural Zambian / Colombian Emerald (Panna)',
    subGemTe: 'పెరిడాట్ (Peridot) లేదా ఆకుపచ్చ టూర్మలైన్ (Green Tourmaline)',
    metalTe: 'బంగారం (Gold) లేదా వెండి (Silver)',
    fingerTe: 'కుడి చేతి చిటికెన వేలు (Little Finger / కనిష్ఠిక)',
    wearingDayAndHoraTe: 'బుధవారం ఉదయం బుధ హోరలో (శుక్ల పక్ష ఆశ్లేష, జ్యేష్ఠ, రేవతి నక్షత్రాలలో)',
    rudrakshaMukhiTe: '4 ముఖి రుద్రాక్ష (బ్రహ్మ / సరస్వతీ స్వరూపం)',
  },
  Jupiter: {
    beejaMantraTe: 'ఓం గ్రాం గ్రీం గ్రౌం సః గురవే నమః ||',
    vedicMantraTe: 'ఓం బృహస్పతే అతి యదర్యో అర్హాద్ ద్యుమద్విభాతి క్రతుమజ్జనేషు | యద్దీదయచ్ఛవస ఋతప్రజాత తదస్మాసు ద్రవిణం ధేహి చిత్రమ్ ||',
    stotraOrSuktamTe: 'శ్రీ దక్షిణామూర్తి స్తోత్రం, గురు కవచం & కనకధారా స్తోత్రం',
    japaCountTe: '19,000 సార్లు (కలియుగ చతుర్గుణ జపం: 76,000 సార్లు)',
    dailyCountTe: 'గురువారం ఉదయం 108 సార్లు',
    homaSamidhaTe: 'రావి సమిధలు (అశ్వత్థ సమిధ) + శనగలు, నెయ్యి, పసుపుతో హోమం',
    bestTimeAndDirectionTe: 'గురువారం ఉదయం గురు హోరలో · ఈశాన్య ముఖంగా',
    adhidevataTe: 'బ్రహ్మదేవుడు (అధిదేవత) · ఇంద్రుడు (ప్రత్యధిదేవత)',
    danaItemsTe: 'శనగలు (Bengal Gram / Chana Dal), పసుపు కొమ్ములు, తేనె, కుంకుమపువ్వు, పండిన అరటిపండ్లు, వేద గ్రంథాలు',
    vastramColorTe: 'పసుపు పచ్చని పట్టు వస్త్రం (Yellow Silk Cloth)',
    metalOrVesselTe: 'బంగారం లేదా ఇత్తడి పాత్ర (Gold / Brass)',
    recipientTe: 'సద్గురువులకు, వేద పాఠశాల బ్రాహ్మణులకు లేదా దేవాలయ అర్చకులకు',
    dayAndHoraTe: 'గురువారం ఉదయం గురు హోరలో (పునర్వసు, విశాఖ, పూర్వాభాద్ర నక్షత్రాలు)',
    danaPhalaTe: 'గురు శాప/బ్రాహ్మణ శాప విమోచనం, సంతాన ప్రాప్తి, ధన-ఐశ్వర్య వృద్ధి, ఉన్నత విద్య మరియు ధర్మ బలం చేకూరుట.',
    kshetraNameTe: 'తిరుమల శ్రీ వేంకటేశ్వర స్వామి క్షేత్రం / ఆలంగుడి గురు భగవాన్ క్షేత్రం / మంత్రాలయం',
    abhishekamOrArchanaTe: 'గురువారం శ్రీ దక్షిణామూర్తికి లేదా సాయిబాబా/రాఘవేంద్ర స్వామికి శనగల మాల & పసుపు పూలతో అర్చన',
    vrataOrKarmaUpayaTe: 'గురువులను, పెద్దలను గౌరవించడం, నుదుటన కేసరి/పసుపు తిలకం ధరించడం, రావి చెట్టుకు ప్రదక్షిణ (ఉదయం వేళ).',
    primaryGemTe: 'పుష్యరాగం (Yellow Sapphire / పీత పుష్యరాగం)',
    primaryGemEn: 'Natural Ceylon Yellow Sapphire (Pukhraj)',
    subGemTe: 'సిట్రిన్ (Golden Citrine) లేదా ఎల్లో టోపాజ్ (Yellow Topaz)',
    metalTe: 'బంగారం (22K Gold)',
    fingerTe: 'కుడి చేతి చూపుడు వేలు (Index Finger / తర్జని)',
    wearingDayAndHoraTe: 'గురువారం ఉదయం గురు హోరలో (శుక్ల పక్ష పునర్వసు, విశాఖ, పూర్వాభాద్ర నక్షత్రాలలో)',
    rudrakshaMukhiTe: '5 ముఖి రుద్రాక్ష (కాలాగ్ని రుద్ర / బృహస్పతి స్వరూపం)',
  },
  Venus: {
    beejaMantraTe: 'ఓం ద్రాం ద్రీం ద్రౌం సః శుక్రాయ నమః ||',
    vedicMantraTe: 'ఓం అన్నాత్పరిస్రుతో రసం బ్రహ్మణా వ్యపిబత్ క్షత్రం పయః సోమం ప్రజాపతిః | ఋతేన సత్యమింద్రియం విపానం శుక్రమంధస ఇంద్రస్యేంద్రియమిదం పయోఽమృతమ్మధు ||',
    stotraOrSuktamTe: 'శ్రీ సూక్తం, అష్టలక్ష్మీ స్తోత్రం & శుక్ర కవచం',
    japaCountTe: '16,000 సార్లు (కలియుగ చతుర్గుణ జపం: 64,000 సార్లు)',
    dailyCountTe: 'శుక్రవారం ఉదయం లేదా సాయంత్రం 108 సార్లు',
    homaSamidhaTe: 'మేడి సమిధలు (ఉదుంబర సమిధ) + బొబ్బర్లు, ఆవు నెయ్యి, తామర గింజలతో హోమం',
    bestTimeAndDirectionTe: 'శుక్రవారం ఉదయం శుక్ర హోరలో · ఆగ్నేయ ముఖంగా',
    adhidevataTe: 'ఇంద్రాణి / శచీదేవి (అధిదేవత) · ఇంద్రుడు (ప్రత్యధిదేవత)',
    danaItemsTe: 'బొబ్బర్లు (White Cowpeas / Lobia), ఆవు నెయ్యి, పెరుగు, పటిక బెల్లం, సుగంధ ద్రవ్యాలు, తెల్లని పుష్పాలు',
    vastramColorTe: 'తెల్లని పట్టు వస్త్రం లేదా గులాబీ రంగు జరీ వస్త్రం',
    metalOrVesselTe: 'వెండి పాత్ర (Silver)',
    recipientTe: 'సుమంగళి స్త్రీలకు లేదా పేద కన్యల వివాహానికి సహాయం',
    dayAndHoraTe: 'శుక్రవారం ఉదయం శుక్ర హోరలో (భరణి, పూర్వఫల్గుణి, పూర్వాషాఢ నక్షత్రాలు)',
    danaPhalaTe: 'దాంపత్య కలహాల నివారణ, శీఘ్ర వివాహం, లక్ష్మీ కటాక్షం, వాహన-గృహ సౌఖ్యం మరియు మధుమేహ/మూత్రకోశ వ్యాధుల ఉపశమనం.',
    kshetraNameTe: 'తిరుచానూరు శ్రీ పద్మావతి అమ్మవారి క్షేత్రం / విజయవాడ కనకదుర్గ / శ్రీరంగం / కంజనూర్',
    abhishekamOrArchanaTe: 'శుక్రవారం మహాలక్ష్మి అమ్మవారికి తామర పూలతో అర్చన & ఆవు నెయ్యి దీపారాధన',
    vrataOrKarmaUpayaTe: 'స్త్రీలను, జీవిత భాగస్వామిని గౌరవించడం, శుక్రవారం గోమాతకు అరటిపండ్లు, బెల్లం తినిపించడం, గృహాన్ని సుగంధభరితంగా ఉంచడం.',
    primaryGemTe: 'వజ్రం (Diamond / హీరకం) లేదా తెల్ల పుష్యరాగం (White Sapphire)',
    primaryGemEn: 'Natural Diamond or Ceylon White Sapphire',
    subGemTe: 'జirkాన్ (White Zircon) లేదా ఒపల్ (Fire Opal / స్ఫటికం)',
    metalTe: 'వెండి (Silver) లేదా ప్లాటినం / వైట్ గోల్డ్',
    fingerTe: 'కుడి చేతి మధ్య వేలు లేదా ఉంగరపు వేలు',
    wearingDayAndHoraTe: 'శుక్రవారం ఉదయం శుక్ర హోరలో (శుక్ల పక్ష భరణి, పుబ్బ, పూర్వాషాఢ నక్షత్రాలలో)',
    rudrakshaMukhiTe: '6 ముఖి లేదా 13 ముఖి రుద్రాక్ష (మహాలక్ష్మి / కామదేవ స్వరూపం)',
  },
  Saturn: {
    beejaMantraTe: 'ఓం ప్రాం ప్రీం ప్రౌం సః శనైశ్చరాయ నమః ||',
    vedicMantraTe: 'ఓం శన్నో దేవీరభిష్టయ ఆపో భవంతు పీతయే | శం యోరభిస్రవంతు నః || (మరియు దశరథ కృత శని స్తోత్రం)',
    stotraOrSuktamTe: 'మహాన్యాస పూర్వక రుద్ర నమక-చమక పారాయణ, హనుమాన్ చాలీసా & శని వజ్రపంజర కవచం',
    japaCountTe: '23,000 సార్లు (కలియుగ చతుర్గుణ జపం: 92,000 సార్లు)',
    dailyCountTe: 'శనివారం ఉదయం / సాయంత్రం 108 సార్లు',
    homaSamidhaTe: 'జమ్మి సమిధలు (శమీ సమిధ) + నల్ల నువ్వులు, ఆవు నెయ్యితో హోమం',
    bestTimeAndDirectionTe: 'శనివారం సాయంత్రం ప్రదోష వేళ లేదా శని హోరలో · పశ్చిమ ముఖంగా',
    adhidevataTe: 'యమధర్మరాజు (అధిదేవత) · ప్రజాపతి (ప్రత్యధిదేవత)',
    danaItemsTe: 'నల్ల నువ్వులు (Black Sesame - 1.25 కిలోలు), మినుములు (Black Gram), నువ్వుల నూనె, ఇనుప వస్తువు, గొడుగు, పాదరక్షలు',
    vastramColorTe: 'నలుపు లేదా ముదురు నీలం రంగు వస్త్రం / కంబళి',
    metalOrVesselTe: 'ఇనుప పాత్ర (Iron) లేదా మట్టి ప్రమిద',
    recipientTe: 'వికలాంగులకు, వృద్ధులకు, పారిశుద్ధ్య కార్మికులకు లేదా శని ఆలయంలో',
    dayAndHoraTe: 'శనివారం ఉదయం శని హోరలో (పుష్యమి, అనూరాధ, ఉత్తరాభాద్ర నక్షత్రాలు)',
    danaPhalaTe: 'ఏలినాటి శని, అష్టమ/అర్ధాష్టమ శని పీడల నివారణ, దీర్ఘకాలిక వ్యాధులు, ఉద్యోగ ఆటంకాలు, కీళ్ల నొప్పులు మరియు కర్మ బంధాల విముక్తి.',
    kshetraNameTe: 'మందపల్లి మందేశ్వర స్వామి క్షేత్రం (తూర్పు గోదావరి) / శని శింగణాపూర్ / తిరునల్లార్',
    abhishekamOrArchanaTe: 'శనివారం నల్ల నువ్వుల నూనెతో శనికి తైలాభిషేకం & రావి చెట్టు క్రింద నువ్వుల నూనె దీపం',
    vrataOrKarmaUpayaTe: 'శ్రామికులకు, పేదలకు అన్నదానం చేయడం, కాకులకు/నల్ల కుక్కలకు ఆహారం పెట్టడం, శనివారం మద్యం/మాంసం పూర్తిగా విసర్జించడం, క్రమశిక్షణతో జీవించడం.',
    primaryGemTe: 'నీలం (Blue Sapphire / ఇంద్రనీలం)',
    primaryGemEn: 'Natural Ceylon Blue Sapphire (Neelam)',
    subGemTe: 'అమెథిస్ట్ (Amethyst / కజలి) లేదా లాపిస్ లజులి (Lapis Lazuli)',
    metalTe: 'వెండి (Silver) లేదా పంచలోహం (Panchadhatu)',
    fingerTe: 'కుడి చేతి మధ్య వేలు (Middle Finger / మధ్యమ)',
    wearingDayAndHoraTe: 'శనివారం సాయంత్రం శని హోరలో (3 రోజులు పరీక్షించిన తర్వాతే ధరించాలి)',
    rudrakshaMukhiTe: '7 ముఖి లేదా 14 ముఖి రుద్రాక్ష (మహాలక్ష్మి / దేవమణి హనుమత్ స్వరూపం)',
  },
  Rahu: {
    beejaMantraTe: 'ఓం భ్రాం భ్రీం భ్రౌం సః రాహవే నమః ||',
    vedicMantraTe: 'ఓం కయా నశ్చిత్ర ఆ భువదూతీ సదావృధః సఖా | కయా శచిష్ఠయా వృతా ||',
    stotraOrSuktamTe: 'శ్రీ దుర్గా సప్తశ్లోకీ / దుర్గా కవచం & రాహు అష్టోత్తర శతనామావళి',
    japaCountTe: '18,000 సార్లు (కలియుగ చతుర్గుణ జపం: 72,000 సార్లు)',
    dailyCountTe: 'శనివారం / బుధవారం రాహుకాలంలో 108 సార్లు',
    homaSamidhaTe: 'గరిక సమిధలు (దూర్వా సమిధ) + మినుములు, నెయ్యితో హోమం',
    bestTimeAndDirectionTe: 'శనివారం లేదా మంగళవారం రాహుకాలంలో · నైరుతి ముఖంగా',
    adhidevataTe: 'గోమాత / భద్రకాళి (అధిదేవత) · సర్ప దేవత (ప్రత్యధిదేవత)',
    danaItemsTe: 'మినుములు (Black Gram / Urad Dal - 2.5 కిలోలు), ముల్లంగి, కొబ్బరికాయలు, నువ్వుల నూనె',
    vastramColorTe: 'నీలం లేదా పొగ రంగు (Smoky Blue / Grey) వస్త్రం',
    metalOrVesselTe: 'సీసం (Lead) లేదా పంచలోహ నాగ ప్రతిమ',
    recipientTe: 'కుష్ఠు రోగులకు / అనాథ శరణాలయాలకు లేదా దుర్గా ఆలయానికి',
    dayAndHoraTe: 'శనివారం లేదా బుధవారం రాహుకాల సమయంలో (ఆర్ద్ర, స్వాతి, శతభిషం నక్షత్రాలు)',
    danaPhalaTe: 'కాలసర్ప దోషం, గ్రహణ దోషం, ఆకస్మిక భయాలు, మోసాలు, విదేశీయాన ఆటంకాలు మరియు నిర్ధారణ కాని అనారోగ్యాల నివారణ.',
    kshetraNameTe: 'శ్రీకాళహస్తి రాహు-కేతు క్షేత్రం (తిరుపతి సమీపం) / తిరునాగేశ్వరం రాహు క్షేత్రం',
    abhishekamOrArchanaTe: 'శ్రీకాళహస్తిలో రాహు-కేతు సర్పదోష నివారణ పూజ & రాహుకాలంలో దుర్గాదేవికి నిమ్మకాయ దీపం',
    vrataOrKarmaUpayaTe: 'పక్షులకు సప్తధాన్యాలు వేయడం, ఎలక్ట్రానిక్ వ్యర్థాలు/పాడైన గడియారాలు ఇంట్లో ఉంచకపోవడం, దుర్గా ఆరాధన.',
    primaryGemTe: 'గోమేధికం (Hessonite Garnet / Gomedh)',
    primaryGemEn: 'Natural Ceylon Hessonite (Gomedh)',
    subGemTe: 'సులేమాని అకీక్ (Agate)',
    metalTe: 'వెండి (Silver) లేదా అష్టధాతువు',
    fingerTe: 'కుడి చేతి మధ్య వేలు (Middle Finger)',
    wearingDayAndHoraTe: 'శనివారం సాయంత్రం రాహు కాలం / శని హోరలో (కేవలం రాహు దశలో శుభ స్థానాల్లో ఉంటేనే)',
    rudrakshaMukhiTe: '8 ముఖి రుద్రాక్ష (మహాగణపతి / కాలభైరవ స్వరూపం)',
  },
  Ketu: {
    beejaMantraTe: 'ఓం స్రాం స్రీం స్రౌం సః కేతవే నమః ||',
    vedicMantraTe: 'ఓం కేతుం కృణ్వన్నకేతవే పేశో మర్యా అపేశసే | సముషద్భిరజాయథాః ||',
    stotraOrSuktamTe: 'శ్రీ గణపతి అథర్వశీర్షం, సంకటనాశన గణేశ స్తోత్రం & కేతు కవచం',
    japaCountTe: '7,000 సార్లు (కలియుగ చతుర్గుణ జపం: 28,000 సార్లు)',
    dailyCountTe: 'మంగళవారం / గణపతి ఆరాధన సమయంలో 108 సార్లు',
    homaSamidhaTe: 'దర్భ సమిధలు (కుశ సమిధ) + ఉలవలు, నెయ్యితో హోమం',
    bestTimeAndDirectionTe: 'మంగళవారం లేదా ఆదివారం ఉదయం · వాయువ్య ముఖంగా',
    adhidevataTe: 'చిత్రగుప్తుడు (అధిదేవత) · బ్రహ్మదేవుడు / గణపతి (ప్రత్యధిదేవత)',
    danaItemsTe: 'ఉలవలు (Horse Gram - 2.5 కిలోలు), చిత్రవర్ణ కంబళి (Multi-colored Blanket), నువ్వులు, అరటిపండ్లు, జెండా',
    vastramColorTe: 'చిత్రవర్ణ (Multi-colored) వస్త్రం లేదా ఉన్ని కంబళి',
    metalOrVesselTe: 'పంచలోహం లేదా ఇత్తడి',
    recipientTe: 'ఆధ్యాత్మిక సాధువులకు, యాత్రికులకు లేదా వినాయక ఆలయానికి',
    dayAndHoraTe: 'మంగళవారం లేదా గురువారం ఉదయం (అశ్విని, మఖ, మూల నక్షత్రాలు)',
    danaPhalaTe: 'ఆకస్మిక విరక్తి, ఉద్యోగ/కుటుంబ ఎడబాటు, నరదృష్టి, గుప్త శత్రు బాధలు మరియు పాద/వెన్నెముక రుగ్మతల నివారణ.',
    kshetraNameTe: 'కాణిపాకం వరసిద్ధి వినాయక క్షేత్రం / శ్రీకాళహస్తి / కీళపెరుంపల్లం కేతు క్షేత్రం',
    abhishekamOrArchanaTe: 'గణపతికి గరిక పూజ (21 దూర్వాయుగ్మములు) & కుడుముల నైవేద్యం',
    vrataOrKarmaUpayaTe: 'వీధి కుక్కలకు ఆహారం పెట్టడం, దేవాలయ గోపురంపై ధ్వజం (జెండా) సమర్పించడం, సంకష్టహర చతుర్థి వ్రతం ఆచరించడం.',
    primaryGemTe: 'వైఢూర్యం (Chrysoberyl Cat’s Eye / Lehsuniya)',
    primaryGemEn: 'Natural Chrysoberyl Cat’s Eye (Vaiduryam)',
    subGemTe: 'టైగర్ ఐ (Tiger Eye)',
    metalTe: 'వెండి (Silver) లేదా బంగారం',
    fingerTe: 'కుడి చేతి మధ్య వేలు లేదా చిటికెన వేలు',
    wearingDayAndHoraTe: 'మంగళవారం ఉదయం (కేవలం కేతు దశలో శుభ స్థితిలో ఉంటేనే)',
    rudrakshaMukhiTe: '9 ముఖి రుద్రాక్ష (నవదుర్గా స్వరూపం)',
  },
};

function getShortestAngularDistance(lon1: number, lon2: number): number {
  const diff = Math.abs(lon1 - lon2) % 360;
  return diff > 180 ? 360 - diff : diff;
}

function getHousesRuledByPlanet(planetId: string, lagnaSignIdx: number): number[] {
  const houses: number[] = [];
  for (let h = 1; h <= 12; h++) {
    const signIdx = (lagnaSignIdx + h - 1) % 12;
    if (SIGN_LORDS_ID[signIdx] === planetId) {
      houses.push(h);
    }
  }
  return houses;
}

function getBadhakaHouseForLagna(lagnaSignIdx: number): number {
  // Movable (0, 3, 6, 9) -> 11th house
  // Fixed (1, 4, 7, 10) -> 9th house
  // Dual (2, 5, 8, 11) -> 7th house
  const mod = lagnaSignIdx % 3;
  if (mod === 0) return 11;
  if (mod === 1) return 9;
  return 7;
}

export function generateUpayaPariharaReport(chart: CompleteChartResult): UpayaPariharaReport {
  const lagnaSignIdx = chart.ascendant.signIndex;
  const lagnaNameTe = TELUGU_RASIS[lagnaSignIdx]?.nameTe ?? chart.ascendant.signName;
  const lagnaLordId = SIGN_LORDS_ID[lagnaSignIdx] ?? 'Sun';
  const lagnaLordTe = TELUGU_PLANETS[lagnaLordId]?.nameTe ?? lagnaLordId;

  const badhakaSthana = getBadhakaHouseForLagna(lagnaSignIdx);
  const badhakaSignIdx = (lagnaSignIdx + badhakaSthana - 1) % 12;
  const badhakaLordId = SIGN_LORDS_ID[badhakaSignIdx] ?? 'Saturn';
  const badhakaLordTe = TELUGU_PLANETS[badhakaLordId]?.nameTe ?? badhakaLordId;

  const secondSignIdx = (lagnaSignIdx + 1) % 12;
  const seventhSignIdx = (lagnaSignIdx + 6) % 12;
  const marakaIds = Array.from(
    new Set([SIGN_LORDS_ID[secondSignIdx], SIGN_LORDS_ID[seventhSignIdx]])
  );
  const marakaLordsTe = marakaIds.map((id) => TELUGU_PLANETS[id]?.nameTe ?? id);

  const sunPlanet = chart.planets.find((p) => p.id === 'Sun');
  const rahuPlanet = chart.planets.find((p) => p.id === 'Rahu');
  const ketuPlanet = chart.planets.find((p) => p.id === 'Ketu');
  const saturnPlanet = chart.planets.find((p) => p.id === 'Saturn');
  const marsPlanet = chart.planets.find((p) => p.id === 'Mars');

  const currentMaha = chart.dashas.find((d) => d.isCurrent) ?? chart.dashas[0];
  const currentAntar =
    currentMaha?.antardashas.find((a) => a.isCurrent) ?? currentMaha?.antardashas[0];
  const currentPratyantar =
    currentAntar?.pratyantardashas.find((p) => p.isCurrent) ??
    currentAntar?.pratyantardashas[0];

  const vedaPlanets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

  const maleficInfluences: PlanetaryMaleficInfluence[] = vedaPlanets
    .map((pid): PlanetaryMaleficInfluence | null => {
      const p: PlanetPosition | undefined = chart.planets.find((pl) => pl.id === pid);
      if (!p) return null;

      const planetNameTe = TELUGU_PLANETS[pid]?.nameTe ?? pid;
      const rasiNameTe = TELUGU_RASIS[p.signIndex]?.nameTe ?? p.signName;
      const ruledHouses = getHousesRuledByPlanet(pid, lagnaSignIdx);

      // Functional nature
      const rulesTrikona = ruledHouses.some((h) => h === 1 || h === 5 || h === 9);
      const rulesDusthana = ruledHouses.some((h) => h === 6 || h === 8 || h === 12);
      const rulesTrishadaya = ruledHouses.some((h) => h === 3 || h === 6 || h === 11);
      const isMaraka = marakaIds.includes(pid);
      const isBadhaka = pid === badhakaLordId;
      const isShadow = pid === 'Rahu' || pid === 'Ketu';

      const isFunctionalMalefic =
        isShadow || (!rulesTrikona && (rulesDusthana || rulesTrishadaya));

      let functionalRoleTe = '';
      if (isShadow) {
        functionalRoleTe = 'ఛాయా గ్రహం (కర్మ బంధ కారకుడు)';
      } else if (ruledHouses.includes(1)) {
        functionalRoleTe = `లగ్నాధిపతి (${ruledHouses.join(', ')} స్థానాధిపతి — పరమ శుభుడు)`;
      } else if (rulesTrikona && ruledHouses.some((h) => h === 4 || h === 7 || h === 10)) {
        functionalRoleTe = `రాజయోగకారకుడు (${ruledHouses.join(', ')} స్థానాధిపతి)`;
      } else if (rulesTrikona) {
        functionalRoleTe = `త్రికోణాధిపతి (${ruledHouses.join(', ')} స్థానాధిపతి — శుభుడు)`;
      } else if (rulesDusthana) {
        functionalRoleTe = `దుస్థానాధిపతి (${ruledHouses.join(', ')} స్థానాధిపతి — పాప ఫలదাতা)`;
      } else {
        functionalRoleTe = `${ruledHouses.join(', ')} భావాధిపతి`;
      }

      if (isBadhaka && !isShadow) {
        functionalRoleTe += ` · బాధకాధిపతి (${badhakaSthana}వ స్థానం)`;
      } else if (isMaraka && !rulesTrikona && !isShadow) {
        functionalRoleTe += ' · మారకాధిపతి';
      }

      // Dignity
      const isExalted = EXALTATION_SIGN[pid] === p.signIndex;
      const isDebilitated = DEBILITATION_SIGN[pid] === p.signIndex;
      const isOwnSign = OWN_SIGNS[pid]?.includes(p.signIndex) ?? false;
      let dignityTe = 'సమ / మిత్ర క్షేత్రం';
      if (isExalted) dignityTe = 'ఉచ్చ స్థితి (Exalted)';
      else if (isDebilitated) dignityTe = 'నీచ స్థితి (Debilitated)';
      else if (isOwnSign) dignityTe = 'స్వక్షేత్రం (Own Sign)';

      // Combustion check
      let isCombust = false;
      let combustDistanceDeg: number | undefined;
      if (pid !== 'Sun' && pid !== 'Rahu' && pid !== 'Ketu' && sunPlanet) {
        const dist = getShortestAngularDistance(p.siderealLon, sunPlanet.siderealLon);
        const orb = COMBUSTION_ORBS[pid] ?? 12;
        if (dist <= orb) {
          isCombust = true;
          combustDistanceDeg = Number(dist.toFixed(1));
        }
      }

      // Shadbala & Ashtakavarga
      const shadbalaRow = chart.shadbala.find((s) => s.planet === pid);
      const shadbalaPercent = shadbalaRow ? Math.round(shadbalaRow.ratio * 100) : 100;
      const bavRow = chart.ashtakavarga.bhinnashtakavarga[pid];
      const ashtakavargaBindus = bavRow ? (bavRow[p.signIndex] ?? 4) : 4;

      // Detailed Affliction Reasons for THIS chart
      const reasons: string[] = [];
      let score = 0;

      if (isDebilitated) {
        score += 35;
        reasons.push(
          `${planetNameTe} ${rasiNameTe}లో నీచ స్థితి (Debilitated) పొందుట వలన ఆ గ్రహ కారకత్వాలలో ఆలస్యం మరియు ఆత్మవిశ్వాస లోపం కలుగును.`
        );
      }

      const isDusthanaPlaced = p.house === 6 || p.house === 8 || p.house === 12;
      if (isDusthanaPlaced) {
        score += 28;
        const houseMeaning =
          p.house === 6
            ? '6వ భావం (రోగ-రుణ-శత్రు స్థానం)'
            : p.house === 8
              ? '8వ భావం (అష్టమ-ఆకస్మిక విఘ్న స్థానం)'
              : '12వ భావం (వ్యయ-నష్ట స్థానం)';
        reasons.push(
          `జన్మ కుండలిలో ${planetNameTe} దుస్థానమైన ${houseMeaning}లో సంచరించుట వలన ఊహించని ఖర్చులు లేదా ఆటంకాలు ఎదురవుతాయి.`
        );
      }

      if (isCombust && combustDistanceDeg !== undefined) {
        score += 24;
        reasons.push(
          `సూర్యునికి ${combustDistanceDeg}° సమీపంలో ఉండి మౌఢ్య దోషం (Combustion / అస్తంగత్వం) పొందుట వలన శుభ ఫలితాల వేగం తగ్గును.`
        );
      }

      if (p.isRetrograde && pid !== 'Rahu' && pid !== 'Ketu') {
        score += 14;
        reasons.push(
          `${planetNameTe} వక్ర గమనంలో (Retrograde) ఉండుట వలన పూర్వజన్మ కర్మ బాధ్యతలు మరియు పనులలో పునరావృత ప్రయత్నం అవసరమవుతుంది.`
        );
      }

      // Conjunction with Rahu / Ketu / Saturn / Mars
      if (pid !== 'Rahu' && pid !== 'Ketu') {
        if (rahuPlanet && rahuPlanet.signIndex === p.signIndex) {
          score += 25;
          reasons.push(
            `రాహువుతో ఒకే రాశిలో (${rasiNameTe}) యుతి చెందుట వలన రాహు గ్రహణ / చాండాల / అంగారక / శ్రాపిత ప్రభావం ఏర్పడింది.`
          );
        } else if (ketuPlanet && ketuPlanet.signIndex === p.signIndex) {
          score += 20;
          reasons.push(
            `కేతువుతో ఒకే రాశిలో (${rasiNameTe}) యుతి చెందుట వలన ఆకస్మిక మానసిక వైరాగ్యం లేదా కర్మ ఆటంకాలు ఏర్పడవచ్చు.`
          );
        }
        if (pid !== 'Saturn' && saturnPlanet && saturnPlanet.signIndex === p.signIndex) {
          score += 15;
          reasons.push(
            `శని భగవానునితో యుతి చెందుట వలన ఫలితాలు ఆలస్యంగా, కఠిన శ్రమ తర్వాత లభించే స్వభావం ఉంటుంది.`
          );
        }
        if (pid !== 'Mars' && marsPlanet && marsPlanet.signIndex === p.signIndex && (pid === 'Moon' || pid === 'Saturn' || pid === 'Mercury')) {
          score += 12;
          reasons.push(
            `కుజునితో యుతి చెందుట వలన ఆవేశపూరిత నిర్ణయాలు లేదా ఉద్రేక పరిస్థితులు తలెత్తకుండా జాగ్రత్త పడాలి.`
          );
        }
      } else {
        // For Rahu and Ketu themselves, examine what house they occupy and who they afflict
        const conjPlanets = chart.planets.filter(
          (other) => other.id !== pid && vedaPlanets.includes(other.id) && other.signIndex === p.signIndex
        );
        if (conjPlanets.length > 0) {
          score += 26;
          const names = conjPlanets.map((cp) => TELUGU_PLANETS[cp.id]?.nameTe ?? cp.id).join(', ');
          reasons.push(
            `${planetNameTe} ${p.house}వ భావంలో ${names}తో కలిసి సంచరించుట వలన ఆ భావ కారకత్వాలపై ఛాయా గ్రహ ప్రభావం అధికంగా ఉన్నది.`
          );
        } else {
          score += 18;
          reasons.push(
            `ఛాయా గ్రహమైన ${planetNameTe} ${p.house}వ భావంలో (${rasiNameTe}) స్థితి పొందుట వలన ఆ భావ విషయాలలో అకస్మాత్తు మార్పులు, భ్రమలు తొలగుటకు శాంతి అవసరం.`
          );
        }
      }

      if (shadbalaPercent < 95 && pid !== 'Rahu' && pid !== 'Ketu') {
        score += 16;
        reasons.push(
          `షడ్బల గణనలో ${planetNameTe} బలం ${shadbalaPercent}% (కావలసిన ప్రమాణం కంటే తక్కువ) ఉన్నందున ఉపాసన ద్వారా బలాన్ని పెంచుకోవాలి.`
        );
      }

      if (ashtakavargaBindus <= 3 && pid !== 'Rahu' && pid !== 'Ketu') {
        score += 12;
        reasons.push(
          `భిన్నాష్టకవర్గలో ${rasiNameTe} యందు కేవలం ${ashtakavargaBindus} శుభ బిందువులు మాత్రమే ఉన్నందున గోచార సంచారంలో జాగ్రత్త అవసరం.`
        );
      }

      if (isFunctionalMalefic && !isShadow) {
        score += 14;
        reasons.push(
          `${lagnaNameTe} లగ్నానికి ${planetNameTe} ${ruledHouses.join(', ')} భావాధిపతి అగుటచే ఆధిపత్య రీత్యా పాప/బాధక ఫలితాలను నియంత్రించుటకు దానం శ్రేష్ఠం.`
        );
      }

      const isCurrentDashaOrBhukti =
        currentMaha?.lord === pid || currentAntar?.lord === pid;
      if (isCurrentDashaOrBhukti) {
        score += 15;
        reasons.push(
          `ప్రస్తుతం మీ జీవితంలో ${planetNameTe} మహాదశ / అంతర్దశ (భుక్తి) నడుస్తున్నందున ఈ గ్రహ శాంతి తక్షణ ఫలితాన్ని ఇస్తుంది.`
        );
      }

      if (reasons.length === 0) {
        reasons.push(
          `${planetNameTe} ${p.house}వ భావంలో (${rasiNameTe}) అనుకూల స్థితిలో ఉన్నప్పటికీ, నిత్య ఉపాసన వలన పూర్తి రాజయోగ ఫలితాలు సిద్ధిస్తాయి.`
        );
      }

      const clampedScore = Math.min(98, Math.max(12, score));
      let severity: AfflictionSeverity = 'benefic_support';
      let severityLabelTe = 'శుభ బలవర్ధక ఉపాసన (Benefic Enhancement)';
      if (clampedScore >= 52) {
        severity = 'critical';
        severityLabelTe = 'అత్యవసర శాంతి పరిహారం (High Priority Parihara)';
      } else if (clampedScore >= 32) {
        severity = 'moderate';
        severityLabelTe = 'మధ్యమ స్థాయి పరిహారం (Recommended Shanti)';
      } else if (clampedScore >= 20) {
        severity = 'mild';
        severityLabelTe = 'సాధారణ రక్షణ ఉపాయం (Preventive Upaya)';
      }

      const master = GRAHA_PARIHARA_MASTER[pid] ?? GRAHA_PARIHARA_MASTER.Sun;

      return {
        planetId: pid,
        planetNameTe,
        planetNameEn: pid,
        rasiNameTe,
        house: p.house,
        degreeFormatted: p.formattedDMS,
        isRetrograde: p.isRetrograde,
        isCombust,
        combustDistanceDeg,
        dignityTe,
        functionalRoleTe,
        ruledHouses,
        isFunctionalMalefic,
        isDusthanaPlaced,
        isMarakaOrBadhaka: isMaraka || isBadhaka,
        isCurrentDashaOrBhukti,
        shadbalaPercent,
        ashtakavargaBindus,
        afflictionScore: clampedScore,
        severity,
        severityLabelTe,
        afflictionReasonsTe: reasons,
        shastricReferenceTe:
          'బృహత్ పరాశర హోరా శాస్త్రం (గ్రహ శాంతి అధ్యాయం 84) & ఫలదీపిక ప్రమాణం',
        mantraUpaya: {
          beejaMantraTe: master.beejaMantraTe,
          vedicMantraTe: master.vedicMantraTe,
          stotraOrSuktamTe: master.stotraOrSuktamTe,
          japaCountTe: master.japaCountTe,
          dailyCountTe: master.dailyCountTe,
          homaSamidhaTe: master.homaSamidhaTe,
          bestTimeAndDirectionTe: master.bestTimeAndDirectionTe,
          adhidevataTe: master.adhidevataTe,
        },
        danaUpaya: {
          danaItemsTe: master.danaItemsTe,
          vastramColorTe: master.vastramColorTe,
          metalOrVesselTe: master.metalOrVesselTe,
          recipientTe: master.recipientTe,
          dayAndHoraTe: master.dayAndHoraTe,
          phalaTe: master.danaPhalaTe,
        },
        templeAndSevaUpaya: {
          kshetraNameTe: master.kshetraNameTe,
          abhishekamOrArchanaTe: master.abhishekamOrArchanaTe,
          vrataOrKarmaUpayaTe: master.vrataOrKarmaUpayaTe,
        },
      };
    })
    .filter((item): item is PlanetaryMaleficInfluence => item !== null)
    .sort((a, b) => b.afflictionScore - a.afflictionScore);

  // Build strict Vedic Ratna Shastra (Gemstone) recommendations for 1st, 5th, 9th Trikona Lords
  const fifthSignIdx = (lagnaSignIdx + 4) % 12;
  const ninthSignIdx = (lagnaSignIdx + 8) % 12;
  const fifthLordId = SIGN_LORDS_ID[fifthSignIdx] ?? 'Jupiter';
  const ninthLordId = SIGN_LORDS_ID[ninthSignIdx] ?? 'Saturn';

  const trikonaRoles: { houseNum: number; roleTe: string; lordId: string }[] = [
    {
      houseNum: 1,
      roleTe: 'లగ్నాధిపతి — జీవన రత్నం (Life Stone · ఆరోగ్యం, ఆత్మబలం & సర్వ రక్షణ)',
      lordId: lagnaLordId,
    },
    {
      houseNum: 5,
      roleTe: 'పంచమాధిపతి — పూర్వపుణ్య & మేధా రత్నం (Intelligence, Children & Wealth)',
      lordId: fifthLordId,
    },
    {
      houseNum: 9,
      roleTe: 'భాగ్యాధిపతి — దైవకృప & అదృష్ట రత్నం (Fortune Stone · రాజయోగం & ఐశ్వర్యం)',
      lordId: ninthLordId,
    },
  ];

  const seenGemPlanets = new Set<string>();
  const recommendedGems: RatnaRecommendationItem[] = [];

  for (const tr of trikonaRoles) {
    if (seenGemPlanets.has(tr.lordId)) continue;
    seenGemPlanets.add(tr.lordId);

    const pPos = chart.planets.find((p) => p.id === tr.lordId);
    const master = GRAHA_PARIHARA_MASTER[tr.lordId] ?? GRAHA_PARIHARA_MASTER.Sun;
    const planetNameTe = TELUGU_PLANETS[tr.lordId]?.nameTe ?? tr.lordId;
    const isDusthana = pPos ? pPos.house === 6 || pPos.house === 8 || pPos.house === 12 : false;

    recommendedGems.push({
      roleTe: tr.roleTe,
      houseNum: tr.houseNum,
      planetId: tr.lordId,
      planetNameTe,
      primaryGemTe: master.primaryGemTe,
      primaryGemEn: master.primaryGemEn,
      subGemTe: master.subGemTe,
      weightRattiOrCaratTe: '4.5 నుండి 6.25 రత్తీలు (సుమారు 4 నుండి 5.5 క్యారెట్లు — శరీర బరువులో 12వ వంతు)',
      metalTe: master.metalTe,
      fingerTe: master.fingerTe,
      wearingDayAndHoraTe: master.wearingDayAndHoraTe,
      pranaPratishthaMantraTe: master.beejaMantraTe,
      rudrakshaMukhiTe: master.rudrakshaMukhiTe,
      whyWearInThisChartTe: isDusthana
        ? `ఈ జాతకంలో ${planetNameTe} త్రికోణాధిపతి అయినప్పటికీ ${pPos?.house}వ భావంలో ఉన్నందున, ముందుగా 21 రోజులు ${master.rudrakshaMukhiTe} లేదా ఉపరత్నం (${master.subGemTe}) ధరించి పరీక్షించిన పిదప రత్నం ధరించడం శ్రేష్ఠం.`
        : `మీ ${lagnaNameTe} లగ్నానికి ${planetNameTe} పరమ శుభ త్రికోణాధిపతి (${pPos?.house ?? 1}వ భావ స్థితి). ఈ రత్న ధారణ వలన గ్రహ కిరణ బలం పెరిగి ఆరోగ్యం, ధన ప్రవాహం, మనోబలం మరియు రాజయోగ సిద్ధి కలుగుతాయి.`,
      statusType: isDusthana ? 'caution' : 'recommended',
    });
  }

  // Prohibited Gems (6th, 8th, 12th lords that do NOT rule 1, 5, 9 + Rahu/Ketu)
  const prohibitedGems: ProhibitedRatnaItem[] = [];
  for (const pid of vedaPlanets) {
    if (seenGemPlanets.has(pid)) continue;
    const ruled = getHousesRuledByPlanet(pid, lagnaSignIdx);
    const rulesDusthana = ruled.some((h) => h === 6 || h === 8 || h === 12);
    const rules3or11 = ruled.some((h) => h === 3 || h === 11);
    const isShadow = pid === 'Rahu' || pid === 'Ketu';

    if (rulesDusthana || isShadow || rules3or11) {
      const master = GRAHA_PARIHARA_MASTER[pid] ?? GRAHA_PARIHARA_MASTER.Saturn;
      const pNameTe = TELUGU_PLANETS[pid]?.nameTe ?? pid;
      prohibitedGems.push({
        planetId: pid,
        planetNameTe: pNameTe,
        gemNameTe: master.primaryGemTe,
        ruledHousesTe: isShadow ? 'ఛాయా గ్రహం' : `${ruled.join(', ')} భావాధిపతి`,
        reasonToAvoidTe: isShadow
          ? `${pNameTe} ఛాయా గ్రహం. రత్న శాస్త్ర నియమం ప్రకారం రాహు/కేతు రత్నాలను (గోమేధికం/వైఢూర్యం) అనుభవజ్ఞులైన సిద్ధాంతి పర్యవేక్షణ లేకుండా ధరిస్తే మానసిక ఆందోళన మరియు ఆకస్మిక ఒడిదుడుకులు పెరుగుతాయి.`
          : `${lagnaNameTe} లగ్నానికి ${pNameTe} ${ruled.join(', ')} స్థానాధిపతి (పాప/దుస్థాన ఆధిపత్యం). పాప గ్రహాల రత్నం ధరిస్తే ఆ గ్రహపు రోగ, రుణ, శత్రు లేదా వ్యయ కారకత్వాలు రెట్టింపు అవుతాయి.`,
        alternativeRemedyTe: `రత్నానికి బదులుగా ${pNameTe} ప్రీతి కొరకు "${master.danaItemsTe}" దానం చేయడం మరియు "${master.beejaMantraTe}" జపించడం 100% శ్రేయస్కరం.`,
      });
    }
  }

  // Rudraksha Kavacham
  const lagnaMaster = GRAHA_PARIHARA_MASTER[lagnaLordId] ?? GRAHA_PARIHARA_MASTER.Sun;
  const moonPos = chart.planets.find((p) => p.id === 'Moon');
  const nakIdx = moonPos ? Math.floor(moonPos.siderealLon / (360 / 27)) : 0;
  const nakInfo = TELUGU_NAKSHATRAS[nakIdx];
  const mahaLordId = currentMaha?.lord ?? 'Jupiter';
  const mahaMaster = GRAHA_PARIHARA_MASTER[mahaLordId] ?? GRAHA_PARIHARA_MASTER.Jupiter;

  const mahaLordTe = TELUGU_PLANETS[currentMaha?.lord ?? 'Jupiter']?.nameTe ?? currentMaha?.lord ?? '';
  const bhuktiLordTe =
    TELUGU_PLANETS[currentAntar?.lord ?? 'Saturn']?.nameTe ?? currentAntar?.lord ?? '';
  const antarLordTe =
    TELUGU_PLANETS[currentPratyantar?.lord ?? 'Mercury']?.nameTe ?? currentPratyantar?.lord ?? '';

  const mahaInfluence = maleficInfluences.find((m) => m.planetId === currentMaha?.lord);
  const bhuktiInfluence = maleficInfluences.find((m) => m.planetId === currentAntar?.lord);

  const criticalCount = maleficInfluences.filter((m) => m.severity === 'critical').length;
  const topAfflictedNames = maleficInfluences
    .slice(0, 3)
    .map((m) => m.planetNameTe)
    .join(', ');

  const overallAfflictionSummaryTe =
    criticalCount > 0
      ? `మీ ${lagnaNameTe} లగ్న కుండలిలో షడ్బల, అష్టకవర్గ, దుస్థాన (6, 8, 12) మరియు యుతి పరిశీలన ప్రకారం ముఖ్యంగా ${topAfflictedNames} గ్రహాలపై పాప/పీడా ప్రభావం కనిపిస్తున్నది. శాస్త్రోక్తంగా పాప గ్రహాలకు "దానం & మంత్ర జపం" (Shanti & Dana), మరియు శుభ త్రికోణాధిపతులకు "రత్న / రుద్రాక్ష ధారణ" (Bala Vardhana) ఆచరించడం వలన సర్వ ఆటంకాలు తొలగి సంపూర్ణ రాజయోగం సిద్ధిస్తుంది.`
      : `మీ ${lagnaNameTe} లగ్న కుండలిలో బహుళ గ్రహాలు శుభ బలంతో ఉన్నాయి. అయినప్పటికీ ప్రస్తుత దశా-భుక్తి నాథులైన ${mahaLordTe} – ${bhuktiLordTe} మరియు ${topAfflictedNames} గ్రహాలకు క్రింది మంత్ర, దాన, క్షేత్ర పరిహారాలు ఆచరించడం వలన కర్మ ఆటంకాలు తొలగి అఖండ విజయం లభిస్తుంది.`;

  const panchaMahaUpayasTe = [
    {
      categoryTe: '01 · నిత్య గణపతి & కులదేవతా అవిఘ్న ఉపాసన',
      titleTe: 'సర్వ విఘ్న నివారణ & కేతు-రాహు దోష రక్షణ',
      prescriptionTe:
        'ఏ శుభకార్యం లేదా పరిహారం ప్రారంభించే ముందైనా కులదేవతా స్మరణ చేసి, ప్రతి బుధ/మంగళవారాలలో మహాగణపతికి గరిక పూజ మరియు సంకటనాశన గణేశ స్తోత్ర పారాయణ చేయాలి.',
      timingTe: 'ప్రతిరోజూ ఉదయం స్నానానంతరం 5 నిమిషాలు',
      shastricBenefitTe: 'కుండలిలోని గూఢమైన వాస్తు, దృష్టి మరియు పూర్వజన్మ విఘ్నాలు తొలగిపోతాయి.',
    },
    {
      categoryTe: '02 · ప్రస్తుత మహాదశ - అంతర్దశ (భుక్తి) ప్రత్యేక శాంతి',
      titleTe: `${mahaLordTe} మహాదశ — ${bhuktiLordTe} అంతర్దశ అనుకూలత`,
      prescriptionTe: `ప్రస్తుతం నడుస్తున్న ${mahaLordTe} ప్రీతికి "${mahaInfluence?.mantraUpaya.stotraOrSuktamTe ?? 'నవగ్రహ స్తోత్రం'}" మరియు భుక్తి నాథుడైన ${bhuktiLordTe} ప్రీతికి "${bhuktiInfluence?.danaUpaya.danaItemsTe ?? 'అన్నదానం'}" సమర్పించాలి.`,
      timingTe: `${mahaInfluence?.danaUpaya.dayAndHoraTe ?? 'గురువారం'} మరియు ${bhuktiInfluence?.danaUpaya.dayAndHoraTe ?? 'శనివారం'}`,
      shastricBenefitTe: 'ప్రస్తుత కాలంలో వృత్తి, ధన, కుటుంబ రంగాలలో ఎదురయ్యే తాత్కాలిక ఆటంకాలు తొలగి శుభ ఫలితాలు వేగవంతం అవుతాయి.',
    },
    {
      categoryTe: '03 · బాధకాధిపతి & దుస్థాన (6, 8, 12) కర్మ విమోచన',
      titleTe: `${lagnaNameTe} లగ్న బాధకాధిపతి (${badhakaLordTe}) శాంతి`,
      prescriptionTe: `మీ లగ్నానికి ${badhakaSthana}వ స్థానాధిపతి అయిన ${badhakaLordTe} వలన పనులలో చివరి నిమిషంలో వచ్చే ఆటంకాలు తొలగుటకు ${GRAHA_PARIHARA_MASTER[badhakaLordId]?.abhishekamOrArchanaTe ?? 'రుద్రాభిషేకం'} జరిపించాలి.`,
      timingTe: 'నెలకు ఒకసారి జన్మ నక్షత్రం రోజున లేదా మాస శివరాత్రి నాడు',
      shastricBenefitTe: 'కార్య విఘ్నాలు, శత్రు పీడలు, కోర్టు/రికార్డు సమస్యలు మరియు అకారణ ఆలస్యాలు నివారించబడతాయి.',
    },
    {
      categoryTe: '04 · జీవ కారుణ్య & పంచ మహాయజ్ఞ సేవ (Jeeva Karunya Upaya)',
      titleTe: 'గ్రహ దోషాలను హరించే నిత్య భూతయజ్ఞం',
      prescriptionTe:
        'గోమాతకు పచ్చగడ్డి/బెల్లం (శుక్ర, రవి, గురు ప్రీతి), పక్షులకు సప్తధాన్యాలు (బుధ, రాహు ప్రీతి), కాకులకు/నల్ల కుక్కలకు ఆహారం (శని, కేతు ప్రీతి) సమర్పించడం.',
      timingTe: 'ప్రతి శనివారం మరియు అమావాస్య / పౌర్ణమి తిథులలో',
      shastricBenefitTe: 'బృహత్ పరాశర హోరా శాస్త్రం ప్రకారం జీవ కారుణ్య సేవ వలన అతి తీవ్రమైన ప్రారబ్ధ కర్మ దోషాలు కూడా శాంతిస్తాయి.',
    },
    {
      categoryTe: '05 · పితృ-మాతృ ఆశీర్వాదం & అన్నదాన మహా యజ్ఞం',
      titleTe: 'సూర్య-చంద్ర-గురు బలవర్ధక పరమ ఉపాయం',
      prescriptionTe:
        'జన్మ నక్షత్రం రోజున లేదా అమావాస్య నాడు పేదలకు, అనాథలకు, వృద్ధులకు కడుపునిండా అన్నదానం చేయడం మరియు తల్లిదండ్రుల పాదాలకు నమస్కరించడం.',
      timingTe: `ప్రతి నెల మీ జన్మ నక్షత్రం (${TELUGU_NAKSHATRAS[nakIdx]?.nameTe ?? ''}) వచ్చే రోజున`,
      shastricBenefitTe: 'కుండలిలో రవి, చంద్ర, గురు గ్రహాల బలం పెరిగి వంశ వృద్ధి, ఆయురారోగ్యాలు మరియు అఖండ లక్ష్మీ కటాక్షం సిద్ధిస్తాయి.',
    },
  ];

  return {
    lagnaNameTe,
    lagnaLordTe,
    badhakaSthana,
    badhakaLordTe,
    marakaLordsTe,
    overallAfflictionSummaryTe,
    activeDashaRemedyFocusTe: {
      mahaLordTe,
      bhuktiLordTe,
      antarLordTe,
      periodRange: `${currentAntar?.startDate ?? ''} నుండి ${currentAntar?.endDate ?? ''} వరకు`,
      combinedSynthesisTe: `ప్రస్తుతం మీ కుండలిలో ${mahaLordTe} మహాదశ (${currentMaha?.startDate} – ${currentMaha?.endDate}), అందులో ${bhuktiLordTe} అంతర్దశ (భుక్తి) మరియు ${antarLordTe} ప్రత్యంతర్దశ నడుస్తున్నవి. మహాదశ నాథుడు ${mahaInfluence?.house ?? 1}వ భావంలో మరియు భుక్తి నాథుడు ${bhuktiInfluence?.house ?? 1}వ భావంలో స్థితి పొంది ఉన్నారు.`,
      immediatePariharaTe: `ఈ దశా-భుక్తి కాలంలో శుభ ఫలితాల వృద్ధికి ప్రతిరోజూ ఉదయం "${mahaInfluence?.mantraUpaya.beejaMantraTe ?? ''}" (27 సార్లు) మరియు "${bhuktiInfluence?.mantraUpaya.beejaMantraTe ?? ''}" (27 సార్లు) జపించి, ${bhuktiInfluence?.danaUpaya.dayAndHoraTe ?? 'శుభ హోరలో'} "${bhuktiInfluence?.danaUpaya.danaItemsTe ?? 'దానం'}" సమర్పించడం అత్యంత ఫలప్రదం.`,
    },
    maleficInfluences,
    ratnaShastra: {
      shastricRuleTe:
        'శాస్త్ర నియమం (గరుడ పురాణం & జాతక పారిజాతం): జాతకంలో ఎల్లప్పుడూ లగ్నాధిపతి (1), పంచమాధిపతి (5), భాగ్యాధిపతి (9) — ఈ మూడు శుభ త్రికోణాధిపతుల రత్నాలను మాత్రమే బలవర్ధకంగా ధరించాలి. 6, 8, 12 దుస్థానాధిపతులు మరియు పాప గ్రహాల రత్నాలను ఎప్పుడూ ధరించకూడదు; పాప గ్రహాలకు కేవలం మంత్ర జపం & దానం మాత్రమే చేయాలి.',
      recommendedGems,
      prohibitedGems,
      rudrakshaKavachamTe: {
        lagnaRudrakshaTe: `లగ్నాధిపతి రక్షణ కొరకు: ${lagnaMaster.rudrakshaMukhiTe}`,
        nakshatraRudrakshaTe: `జన్మ నక్షత్ర (${nakInfo?.nameTe ?? ''}) రక్షణ కొరకు: ${
          GRAHA_PARIHARA_MASTER[chart.panchanga.nakshatra.lord]?.rudrakshaMukhiTe ?? '5 ముఖి రుద్రాక్ష'
        }`,
        dashaRudrakshaTe: `ప్రస్తుత ${mahaLordTe} మహాదశ రక్షణ కొరకు: ${mahaMaster.rudrakshaMukhiTe}`,
        wearingRulesTe:
          'రుద్రాక్షలను సోమవారం లేదా గురువారం ఉదయం ఆవు పాలు, గంగాజలంతో అభిషేకించి, "ఓం నమః శివాయ" మంత్రాన్ని 108 సార్లు జపించి ఎర్రని/పసుపు దారంలో లేదా వెండి/బంగారు కవచంలో ధరించాలి. రుద్రాక్షలకు ఎటువంటి దుష్ప్రభావాలు (Side Effects) ఉండవు.',
      },
    },
    panchaMahaUpayasTe,
  };
}
