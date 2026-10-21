import { type CompleteChartResult } from './ephemeris.ts';
import { TELUGU_NAKSHATRAS, TELUGU_RASIS, TELUGU_PLANETS } from './teluguJathakam.ts';

export interface BabyNameSuggestion {
  nameTe: string;
  nameEn: string;
  syllableTe: string;
  syllableEn: string;
  gender: 'male' | 'female';
  meaningTe: string;
  ashrayaCategoryTe:
    | 'దేవతా ఆశ్రయం (Divine/Deity)'
    | 'వేద & ఇతిహాస ఆశ్రయం (Vedic/Epic)'
    | 'ప్రకృతి & తేజో ఆశ్రయం (Nature/Radiance)'
    | 'రాజస & విజయ ఆశ్రయం (Royal/Victory)';
  aksharaCount: number;
  numerologyNumber: number;
  isExactPadaMatch: boolean;
  isNakshatraMatch: boolean;
}

export interface NamingAshrayaPillar {
  id: string;
  titleTe: string;
  subtitleEn: string;
  sanskritRuleTe: string;
  explanationTe: string;
  specificRecommendationTe: string;
  examplesTe: string[];
}

export interface CustomNameValidationResult {
  inputName: string;
  scoreOutOf100: number;
  matchesExactPada: boolean;
  matchesNakshatra: boolean;
  matchesRasi: boolean;
  detectedStartTe: string;
  chaldeanTotal: number;
  chaldeanSingleDigit: number;
  isNumerologyHarmonious: boolean;
  syllableCountEstimate: number;
  isGenderPhoneticIdeal: boolean;
  verdictTitleTe: string;
  detailedFeedbackTe: string[];
}

export interface NamakaranaReport {
  gender: 'male' | 'female';
  genderLabelTe: string;
  birthDate: string;
  birthTime: string;
  city: string;
  moonLonSidereal: number;
  nakshatraIndex: number; // 0-26
  nakshatraNameTe: string;
  nakshatraNameEn: string;
  pada: number; // 1-4
  rasiIndex: number; // 0-11
  rasiNameTe: string;
  rasiLordTe: string;
  lagnaIndex: number;
  lagnaNameTe: string;
  lagnaLordTe: string;
  nakshatraLordTe: string;
  nakshatraDeityTe: string;
  ganamTe: string;
  yoniTe: string;
  nadiTe: string;
  tattvamTe: string;

  // Syllables (Aksharalu)
  exactPadaSyllableTe: string;
  exactPadaSyllableEn: string;
  allFourPadaSyllables: {
    pada: number;
    syllableTe: string;
    syllableEn: string;
    isBirthPada: boolean;
  }[];
  rasiAllSyllablesTe: string[];
  secondaryLuckyRasiNameTe: string;
  secondaryLuckySyllablesTe: string[];

  // Numerology from DOB
  mulankNumber: number; // Birth day root number (1-9)
  mulankPlanetTe: string;
  bhagyankNumber: number; // Full DOB root number (1-9)
  bhagyankPlanetTe: string;
  luckyNameNumbers: number[];
  avoidNameNumbers: number[];

  // 6 Ashraya Pillars
  ashrayaPillars: NamingAshrayaPillar[];

  // Classical Ceremonial Muhurta & Procedure
  ceremonyDaysTe: string;
  sankalpamMantraTe: string;
  whisperEarProcedureTe: string;

  // Curated Name Suggestions
  suggestedNames: BabyNameSuggestion[];
}

// English transliteration for the 27 x 4 = 108 Pada syllables
const NAKSHATRA_SYLLABLES_EN: [string, string, string, string][] = [
  ['Chu', 'Che', 'Cho', 'La'],      // 1. Ashwini
  ['Li', 'Lu', 'Le', 'Lo'],         // 2. Bharani
  ['A', 'Ee', 'U', 'Ae'],           // 3. Krittika
  ['O', 'Va', 'Vi', 'Vu'],          // 4. Rohini
  ['Ve', 'Vo', 'Ka', 'Ki'],         // 5. Mrigashira
  ['Ku', 'Gha', 'Nga', 'Cha'],      // 6. Ardra
  ['Ke', 'Ko', 'Ha', 'Hi'],         // 7. Punarvasu
  ['Hu', 'He', 'Ho', 'Da'],         // 8. Pushya
  ['Di', 'Du', 'De', 'Do'],         // 9. Ashlesha
  ['Ma', 'Mi', 'Mu', 'Me'],         // 10. Magha
  ['Mo', 'Ta', 'Ti', 'Tu'],         // 11. Purva Phalguni
  ['Te', 'To', 'Pa', 'Pi'],         // 12. Uttara Phalguni
  ['Pu', 'Sha', 'Na', 'Tha'],       // 13. Hasta
  ['Pe', 'Po', 'Ra', 'Ri'],         // 14. Chitra
  ['Ru', 'Re', 'Ro', 'Ta'],         // 15. Swati
  ['Ti', 'Tu', 'Te', 'To'],         // 16. Vishakha
  ['Na', 'Ni', 'Nu', 'Ne'],         // 17. Anuradha
  ['No', 'Ya', 'Yi', 'Yu'],         // 18. Jyeshtha
  ['Ye', 'Yo', 'Bha', 'Bhi'],       // 19. Mula
  ['Bhu', 'Dha', 'Pha', 'Dha'],     // 20. Purva Ashadha
  ['Bhe', 'Bho', 'Ja', 'Ji'],       // 21. Uttara Ashadha
  ['Ju', 'Je', 'Jo', 'Gha'],        // 22. Shravana
  ['Ga', 'Gi', 'Gu', 'Ge'],         // 23. Dhanishta
  ['Go', 'Sa', 'Si', 'Su'],         // 24. Shatabhisha
  ['Se', 'So', 'Da', 'Di'],         // 25. Purva Bhadrapada
  ['Du', 'Thha', 'Jha', 'Daa'],     // 26. Uttara Bhadrapada
  ['De', 'Do', 'Cha', 'Chi'],       // 27. Revati
];

// Presiding Deities & Attributes in Telugu for all 27 Nakshatras
const NAKSHATRA_DEITY_DETAILS: {
  deityTe: string;
  deityBlessingTe: string;
  boyAshrayaThemesTe: string;
  girlAshrayaThemesTe: string;
}[] = [
  {
    deityTe: 'అశ్వినీ దేవతలు (దేవ వైద్యులు)',
    deityBlessingTe: 'ఆరోగ్యం, వేగం, నిత్య యవ్వనం, తేజస్సు మరియు ఆరంభ విజయాలు',
    boyAshrayaThemesTe: 'తేజస్సు, వేగం, అశ్వినీ కుమారుల అనుగ్రహం, సూర్య-కుజ శక్తి కలిగిన పేర్లు',
    girlAshrayaThemesTe: 'చైతన్యం, కాంతి, సౌందర్యం, ఆరోగ్య లక్ష్మిని సూచించే పేర్లు',
  },
  {
    deityTe: 'యమధర్మరాజు (ధర్మ దేవత)',
    deityBlessingTe: 'సత్యనిষ্ঠ, ధర్మపాలన, క్రమశిక్షణ మరియు అచంచలమైన మనోబలం',
    boyAshrayaThemesTe: 'ధర్మం, సత్యం, లక్ష్మీనారాయణ, శివ-శక్తి ఆశ్రయ నామాలు',
    girlAshrayaThemesTe: 'శ్రీ మహాలక్ష్మి, లలితా దేవి, కళాత్మకత మరియు సౌభాగ్య నామాలు',
  },
  {
    deityTe: 'అగ్ని దేవుడు (తేజోమూర్తి)',
    deityBlessingTe: 'అపారమైన మేధస్సు, ఆత్మవిశ్వాసం, పవిత్రత మరియు నాయకత్వ లక్షణాలు',
    boyAshrayaThemesTe: 'సూర్య తేజస్సు, కార్తికేయ (సుబ్రహ్మణ్య), అగ్ని-జ్యోతి ఆశ్రయ నామాలు',
    girlAshrayaThemesTe: 'గాయత్రీ, తేజస్విని, ఆదిశక్తి, నిర్మల కాంతిని సూచించే నామాలు',
  },
  {
    deityTe: 'బ్రహ్మదేవుడు (సృష్టికర్త / ప్రజాపతి)',
    deityBlessingTe: 'సృజనాత్మకత, ఆకర్షణ, ఐశ్వర్యం, కళాపోషణ మరియు వంశ వృద్ధి',
    boyAshrayaThemesTe: 'శ్రీకృష్ణ (రోహిణీ నందనుడు), వాసుదేవ, విష్ణు, చంద్ర ఆశ్రయ నామాలు',
    girlAshrayaThemesTe: 'వసుంధర, వాణి, సరస్వతి, వెన్నెల, ప్రకృతి సౌందర్య నామాలు',
  },
  {
    deityTe: 'సోముడు (అమృత చంద్రుడు)',
    deityBlessingTe: 'పరిశోధనా జ్ఞానం, మృదుస్వభావం, ఉత్సాహం మరియు వాక్చాతుర్యం',
    boyAshrayaThemesTe: 'వేద జ్ఞానం, కృష్ణ-విష్ణు, విజేత, కుమారస్వామి ఆశ్రయ నామాలు',
    girlAshrayaThemesTe: 'వైష్ణవి, కావ్య, కీర్తి, అమృత తుల్యమైన మధుర నామాలు',
  },
  {
    deityTe: 'రుద్రుడు (పరమశివుడు)',
    deityBlessingTe: 'తీక్షణమైన బుద్ధి, పరిశోధన, అడ్డంకులను ఛేదించే శక్తి మరియు కరుణ',
    boyAshrayaThemesTe: 'శివ-రుద్ర, కుమార, ఘనశ్యామ, చైతన్య ఆశ్రయ నామాలు',
    girlAshrayaThemesTe: 'కుందన, చందన, గౌరీ-పార్వతి, జ్ఞాన ప్రదాయిని నామాలు',
  },
  {
    deityTe: 'అదితి (దేవమాత)',
    deityBlessingTe: 'పునరుజ్జీవనం, క్షమాగుణం, సమృద్ధి, ధార్మిక చింతన మరియు సకల సంపదలు',
    boyAshrayaThemesTe: 'శ్రీరామ (పునర్వసు జాతకుడు), కేశవ, హరి, కోదండరామ ఆశ్రయ నామాలు',
    girlAshrayaThemesTe: 'కీర్తన, హరిణి, హైమవతి, హిమబిందు, దేవమాత ఆశ్రయ నామాలు',
  },
  {
    deityTe: 'బృహస్పతి (దేవగురువు)',
    deityBlessingTe: 'బ్రహ్మజ్ఞానం, ధర్మబుద్ధి, పోషణ శక్తి, రాజగౌరవం మరియు సకల విద్యాసిద్ధి',
    boyAshrayaThemesTe: 'హృషీకేశ, హేమంత్, దత్తాత్రేయ, దక్షిణామూర్తి, విష్ణు ఆశ్రయ నామాలు',
    girlAshrayaThemesTe: 'హైమా, హిరణ్మయి, దేవిక, దివ్యలక్ష్మి ఆశ్రయ నామాలు',
  },
  {
    deityTe: 'నాగ దేవతలు (సర్పరాజులు)',
    deityBlessingTe: 'లోతైన అంతర్దృష్టి, రహస్య విద్యా జ్ఞానం, కుండలినీ శక్తి మరియు రక్షణ',
    boyAshrayaThemesTe: 'దివాకర, దుర్గాప్రసాద్, దేవేంద్ర, దామోదర, సుబ్రహ్మణ్య ఆశ్రయ నామాలు',
    girlAshrayaThemesTe: 'దివ్య, దీపిక, దేవయాని, దాక్షాయణి ఆశ్రయ నామాలు',
  },
  {
    deityTe: 'పితృ దేవతలు (వంశ మూల పురుషులు)',
    deityBlessingTe: 'రాజస గౌరవం, వంశ ప్రతిష్ఠ, అధికార పదవులు మరియు ఉన్నత ఆశయాలు',
    boyAshrayaThemesTe: 'మాధవ, మహేంద్ర, మురళీకృష్ణ, మేఘనాథ, మహావిష్ణు ఆశ్రయ నామాలు',
    girlAshrayaThemesTe: 'మహాలక్ష్మి, మీనాక్షి, మైథిలి, మేధా, మానస ఆశ్రయ నామాలు',
  },
  {
    deityTe: 'భగుడు (సౌభాగ్య ఆదిత్యుడు)',
    deityBlessingTe: 'సౌభాగ్యం, దాంపత్య సుఖం, కళాభిరుచి, ధన-ధాన్య సమృద్ధి మరియు ఆనందం',
    boyAshrayaThemesTe: 'మోహన, తారకరామ, తిరుమలేశ, తులసీదాస్, సూర్య-శుక్ర ఆశ్రయ నామాలు',
    girlAshrayaThemesTe: 'మోహిని, తార, త్రిపురసుందరి, తులసి, సౌభాగ్య ఆశ్రయ నామాలు',
  },
  {
    deityTe: 'అర్యముడు (నియమ & మిత్ర ఆదిత్యుడు)',
    deityBlessingTe: 'স্থిరమైన బంధాలు, పరోపకారం, రాజయోగం మరియు సమాజంలో శాశ్వత కీర్తి',
    boyAshrayaThemesTe: 'తేజోమయ, తోషిత్, పార్థసారథి, పవన్, పద్మనాభ ఆశ్రయ నామాలు',
    girlAshrayaThemesTe: 'తేజస్వి, పావని, పద్మావతి, ప్రియదర్శిని ఆశ్రయ నామాలు',
  },
  {
    deityTe: 'సవితృడు (గాయత్రీ సూర్య భగవానుడు)',
    deityBlessingTe: 'హస్తవాసి, కౌశలం, బుద్ధి ప్రచోదనం, వ్యాపార దక్షత మరియు కీర్తి',
    boyAshrayaThemesTe: 'పురుషోత్తమ, శంకర, నరసింహ, నందగోపాల, సూర్య ఆశ్రయ నామాలు',
    girlAshrayaThemesTe: 'পূజిత, శారద, నందిని, నవ్యశ్రీ, గాయత్రీ ఆశ్రయ నామాలు',
  },
  {
    deityTe: 'త్వష్ట / విశ్వకర్మ (దేవ శిల్పి)',
    deityBlessingTe: 'అద్భుత రూపలావణ్యం, నిర్మాణ కౌశలం, రత్న-ఆభరణ యోగం మరియు ప్రతిభ',
    boyAshrayaThemesTe: 'ప్రహ్లాద, రాఘవేంద్ర, రిషికేశ్, రాజశేఖర, రామచంద్ర ఆశ్రయ నామాలు',
    girlAshrayaThemesTe: 'ప్రేరణ, రాధిక, రిషిత, రాజేశ్వరి, రమ్యశ్రీ ఆశ్రయ నామాలు',
  },
  {
    deityTe: 'వాయు దేవుడు (ప్రాణశక్తి స్వరూపుడు)',
    deityBlessingTe: 'స్వతంత్ర భావాలు, వేగవంతమైన ప్రగతి, వాణిజ్య విజయం మరియు వినయం',
    boyAshrayaThemesTe: 'రుద్రేశ్, రేవంత్, రోహిత్, తారకేశ్వర, హనుమత్ ఆశ్రయ నామాలు',
    girlAshrayaThemesTe: 'రుక్మిణి, రేణుక, రోహిణి, తన్మయి, సరస్వతీ ఆశ్రయ నామాలు',
  },
  {
    deityTe: 'ఇంద్రాగ్నులు (విజయ & తేజో దేవతలు)',
    deityBlessingTe: 'లక్ష్య సాధన, ద్విగుణీకృత శక్తి, అధికార ప్రాప్తి మరియు ధైర్యం',
    boyAshrayaThemesTe: 'తిరుపతి, తుషార్, తేజేశ్వర్, తోమర్, సుబ్రహ్మణ్య-గురు ఆశ్రయ నామాలు',
    girlAshrayaThemesTe: 'తిలోత్తమ, తులసి, తేజశ్రీ, తోషిణి ఆశ్రయ నామాలు',
  },
  {
    deityTe: 'మిత్రుడు (మైత్రీ ఆదిత్యుడు)',
    deityBlessingTe: 'అచంచల భక్తి, స్నేహశీలత, విదేశీ యోగం, ధనలాభం మరియు శాంతి',
    boyAshrayaThemesTe: 'నారాయణ, నిఖిల్, నూతన్, నేతాజీ, వేంకటేశ్వర ఆశ్రయ నామాలు',
    girlAshrayaThemesTe: 'నాగలక్ష్మి, నిహారిక, నూపుర, నేహా, లక్ష్మీ ఆశ్రయ నామాలు',
  },
  {
    deityTe: 'దేవేంద్రుడు (దేవతల రాజు)',
    deityBlessingTe: 'పెద్దరికం, రక్షణా శక్తి, ఉన్నత పదవులు, మేధాశక్తి మరియు గౌరవం',
    boyAshrayaThemesTe: 'యశ్వంత్, యుగంధర్, యోగేశ్వర, యాదగిరి, ఇంద్ర-విష్ణు ఆశ్రయ నామాలు',
    girlAshrayaThemesTe: 'యశోద, యామిని, యుక్త, యోగిత ఆశ్రయ నామాలు',
  },
  {
    deityTe: 'నిరృతి / అలక్ష్మీ నివారిణి మూల చండిక',
    deityBlessingTe: 'మూల పరిశోధన, ఆధ్యాత్మిక పునాది, అడ్డంకుల నిర్మూలన మరియు సత్యదర్శనం',
    boyAshrayaThemesTe: 'యజ్ఞేశ్వర, భరత్, భార్గవ్, భీమసేన, ఆంజనేయ ఆశ్రయ నామాలు',
    girlAshrayaThemesTe: 'యశస్విని, భవాని, భార్గవి, భువనేశ్వరి ఆశ్రయ నామాలు',
  },
  {
    deityTe: 'ఆపః దేవతలు (దివ్య జల దేవతలు)',
    deityBlessingTe: 'అపజయం లేని విజయం (అపరాజిత శక్తి), పవిత్రత, కీర్తి మరియు విశాల హృదయం',
    boyAshrayaThemesTe: 'భువనేశ్, ధనుంజయ, ధీరజ్, ఫణీంద్ర, విష్ణు ఆశ్రయ నామాలు',
    girlAshrayaThemesTe: 'భూమిక, ధనలక్ష్మి, ధరణి, ఫాల్గుణి ఆశ్రయ నామాలు',
  },
  {
    deityTe: 'విశ్వేదేవతలు (సమస్త ధర్మ దేవతలు)',
    deityBlessingTe: 'శాశ్వత విజయం, నాయకత్వం, ధార్మిక నిষ্ঠ మరియు విశ్వজনీన ఆదరణ',
    boyAshrayaThemesTe: 'భోగేశ్వర, జగదీశ్వర, జితేంద్ర, జయరామ, సూర్య-గురు ఆశ్రయ నామాలు',
    girlAshrayaThemesTe: 'భ్రమరాంబ, జానకి, జయలక్ష్మి, జీవిత ఆశ్రయ నామాలు',
  },
  {
    deityTe: 'శ్రీ మహావిష్ణువు (వామన / నారాయణ మూర్తి)',
    deityBlessingTe: 'శ్రవణ జ్ఞానం, విద్యా వైదుష్యం, విష్ణు కటాక్షం, సకల సంపదలు మరియు కీర్తి',
    boyAshrayaThemesTe: 'జయదేవ్, జিতేశ్, జోగేశ్వర, ఘనశ్యామ్, వేంకటరమణ ఆశ్రయ నామాలు',
    girlAshrayaThemesTe: 'జ్యోత్స్న, జయశ్రీ, జాహ్నవి, శ్రీదేవి ఆశ్రయ నామాలు',
  },
  {
    deityTe: 'అష్ట వసువులు (సంపద & తేజో దేవతలు)',
    deityBlessingTe: 'సంగీత-సాహిత్య ప్రజ్ఞ, ధన సమృద్ధి, ధైర్యం మరియు భూ-గృహ యోగాలు',
    boyAshrayaThemesTe: 'గణేశ్, గిరిధర్, గురుదత్, గౌతమ్, సుబ్రహ్మణ్య ఆశ్రయ నామాలు',
    girlAshrayaThemesTe: 'గాయత్రి, గిరిజ, గుణవతి, గీతాంజలి ఆశ్రయ నామాలు',
  },
  {
    deityTe: 'వరుణ దేవుడు (సముద్ర & భేషజ దేవుడు)',
    deityBlessingTe: 'వంద మంది వైద్యుల శక్తి (శతభిషం), రహస్య విజ్ఞానం, రోగనివారణ మరియు సత్యం',
    boyAshrayaThemesTe: 'గోవింద, సాకేత్, సిద్ధార్థ, సుదర్శన, శివ-వరుణ ఆశ్రయ నామాలు',
    girlAshrayaThemesTe: 'గోదాదేవి, సాహితి, సింధుజ, సుహాసిని ఆశ్రయ నామాలు',
  },
  {
    deityTe: 'అజైకపాదుడు (ఏకపాద రుద్ర మూర్తి)',
    deityBlessingTe: 'తపశ్శక్తి, ఆధ్యాత్మిక తేజస్సు, ఉన్నత విద్యాబోధన మరియు లోకకళ్యాణ బుద్ధి',
    boyAshrayaThemesTe: 'సేతుమాధవ, సోమశేఖర, దయానంద, దిలీప్, గురు-రుద్ర ఆశ్రయ నామాలు',
    girlAshrayaThemesTe: 'సౌందర్య, సోమ్య, దామిని, దివ్యవాణి ఆశ్రయ నామాలు',
  },
  {
    deityTe: 'అహిర్బుధ్న్యుడు (లోతైన జల-శివ తత్వ దేవుడు)',
    deityBlessingTe: 'স্থిర ప్రజ్ఞ, శాంతి, అపార ధన-ధాన్య వృద్ధి, యోగసిద్ధి మరియు ఆయుర్దాయం',
    boyAshrayaThemesTe: 'దుష్యంత్, ఝాన్సీరామ్, త్రివిక్రమ్, జ్ఞానేశ్వర్ ఆశ్రయ నామాలు',
    girlAshrayaThemesTe: 'దుర్గాభవాని, ఝాన్సీ, జ్ఞానప్రసూన, త్రివేణి ఆశ్రయ నామాలు',
  },
  {
    deityTe: 'పూషణుడు (మార్గదర్శక & పోషక ఆదిత్యుడు)',
    deityBlessingTe: 'సురక్షిత ప్రయాణాలు, సంపూర్ణ ఐశ్వర్యం, పరోపకారం మరియు మోక్ష మార్గం',
    boyAshrayaThemesTe: 'దేవव्रత్, దోణేశ్, చరణ్‌తేజ్, చిరంజీవి, విష్ణు-బుధ ఆశ్రయ నామాలు',
    girlAshrayaThemesTe: 'దేవసేన, చైత్ర, చిన్మయి, చారులత ఆశ్రయ నామాలు',
  },
];

// Master Curated Names Dictionary keyed by Telugu starting syllable (covering all 27 Nakshatras)
interface RawNameSeed {
  te: string;
  en: string;
  g: 'male' | 'female';
  m: string;
  cat: BabyNameSuggestion['ashrayaCategoryTe'];
}

const SYLLABLE_NAMES_DB: Record<string, RawNameSeed[]> = {
  'చు': [
    { te: 'చుడామణి ధర్', en: 'Chudamanidhar', g: 'male', m: 'శిరస్సున రత్నాన్ని ధరించినవాడు (శ్రీరాముని ఆశ్రయం)', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'చుక్కేశ్వర్', en: 'Chukkeshwar', g: 'male', m: 'నక్షత్రములకు అధిపతి, తేజోమూర్తి', cat: 'ప్రకృతి & తేజో ఆశ్రయం (Nature/Radiance)' },
    { te: 'చుడామణి', en: 'Chudamani', g: 'female', m: 'శిరోరత్నము, శ్రేష్ఠమైన ఆభరణం', cat: 'రాజస & విజయ ఆశ్రయం (Royal/Victory)' },
    { te: 'చుక్కలత', en: 'Chukkalatha', g: 'female', m: 'నక్షత్ర కాంతుల వంటి తీగ', cat: 'ప్రకృతి & తేజో ఆశ్రయం (Nature/Radiance)' },
  ],
  'చే': [
    { te: 'చేతన్ రామ్', en: 'Chetan Ram', g: 'male', m: 'చైతన్య స్వరూపుడైన శ్రీరాముడు', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'చేతనానంద్', en: 'Chetananand', g: 'male', m: 'ఆత్మ చైతన్య ఆనందం కలవాడు', cat: 'వేద & ఇతిహాస ఆశ్రయం (Vedic/Epic)' },
    { te: 'చేతన శ్రీ', en: 'Chetana Sri', g: 'female', m: 'ప్రాణశక్తి మరియు లక్ష్మీ కటాక్షం', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'చేలిక', en: 'Chelika', g: 'female', m: 'స్నేహశీలమైన, మధుర స్వభావం గలది', cat: 'ప్రకృతి & తేజో ఆశ్రయం (Nature/Radiance)' },
  ],
  'చో': [
    { te: 'చోళేంద్ర', en: 'Cholendra', g: 'male', m: 'రాజవంశ శ్రేష్ఠుడు, అజేయుడు', cat: 'రాజస & విజయ ఆశ్రయం (Royal/Victory)' },
    { te: 'చోక్షిత్', en: 'Chokshit', g: 'male', m: 'పవిత్రమైన, నిర్మలమైన మనస్సు కలవాడు', cat: 'వేద & ఇతిహాస ఆశ్రయం (Vedic/Epic)' },
    { te: 'చోళిక', en: 'Cholika', g: 'female', m: 'రాజసమైన తేజస్సు కలిగిన కన్య', cat: 'రాజస & విజయ ఆశ్రయం (Royal/Victory)' },
  ],
  'లా': [
    { te: 'లావణ్య కుమార్', en: 'Lavanya Kumar', g: 'male', m: 'సౌందర్యం మరియు తేజస్సు కల కుమారుడు', cat: 'ప్రకృతి & తేజో ఆశ్రయం (Nature/Radiance)' },
    { te: 'లాస్య ప్రియ', en: 'Lasya Priya', g: 'female', m: 'పార్వతీ దేవి నృత్యానికి ప్రియమైనది', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'లావణ్య శ్రీ', en: 'Lavanya Sri', g: 'female', m: 'అందం మరియు సంపద కలిగిన మహాలక్ష్మి', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'లాభాంశ్', en: 'Labhansh', g: 'male', m: 'సకల శుభ లాభముల అంశం', cat: 'రాజస & విజయ ఆశ్రయం (Royal/Victory)' },
  ],
  'లి': [
    { te: 'లిఖిత్ రామ్', en: 'Likhit Ram', g: 'male', m: 'బ్రహ్మలిఖితమైన శుభ యోగం కలవాడు', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'లింగేశ్వర', en: 'Lingeshwara', g: 'male', m: 'పరమశివుని అనుగ్రహం కలవాడు', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'లిఖిత శ్రీ', en: 'Likhita Sri', g: 'female', m: 'సరస్వతీ-లక్ష్మీ అనుగ్రహం కలది', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'లిపి', en: 'Lipi', g: 'female', m: 'వాగ్దేవి అక్షర స్వరూపిణి', cat: 'వేద & ఇతిహాస ఆశ్రయం (Vedic/Epic)' },
  ],
  'లు': [
    { te: 'లుబ్ధక తేజ్', en: 'Lubdhaka Tej', g: 'male', m: 'ఆకాశంలో అత్యంత ప్రకాశవంతమైన నక్షత్ర తేజస్సు', cat: 'ప్రకృతి & తేజో ఆశ్రయం (Nature/Radiance)' },
    { te: 'లుషిత', en: 'Lushita', g: 'female', m: 'ఐశ్వర్యం మరియు శోభ కలిగినది', cat: 'రాజస & విజయ ఆశ్రయం (Royal/Victory)' },
  ],
  'లే': [
    { te: 'లేఖన్ సాయి', en: 'Lekhan Sai', g: 'male', m: 'శాస్త్ర రచనా చాతుర్యం కలవాడు', cat: 'వేద & ఇతిహాస ఆశ్రయం (Vedic/Epic)' },
    { te: 'లేఖన శ్రీ', en: 'Lekhana Sri', g: 'female', m: 'సరస్వతీ దేవి కలం నుండి జాలువారిన కాంతి', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
  ],
  'లో': [
    { te: 'లోకేశ్వర', en: 'Lokeshwara', g: 'male', m: 'ముల్లోకాలకు అధిపతియైన మహావిష్ణువు/శివుడు', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'లోహితాక్ష', en: 'Lohitaksha', g: 'male', m: 'ఎర్రని తామరల వంటి కన్నులు కల శ్రీమహావిష్ణువు', cat: 'వేద & ఇతిహాస ఆశ్రయం (Vedic/Epic)' },
    { te: 'లోకపావని', en: 'Lokapavani', g: 'female', m: 'లోకాలను పవిత్రం చేసే గంగాదేవి', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'లోచన శ్రీ', en: 'Lochana Sri', g: 'female', m: 'శుభ దృష్టి కలిగిన లక్ష్మీ స్వరూపిణి', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
  ],
  'అ': [
    { te: 'అనిరుద్ధ్', en: 'Anirudh', g: 'male', m: 'ఎవరిచేతనూ అడ్డుకోలేని శక్తి గల శ్రీమహావిష్ణువు', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'అభిరామ్', en: 'Abhiram', g: 'male', m: 'మనోహరమైన శ్రీరామచంద్రుడు', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'అద్వైత్', en: 'Advait', g: 'male', m: 'రెండవది లేని పరబ్రహ్మ తత్వం', cat: 'వేద & ఇతిహాస ఆశ్రయం (Vedic/Epic)' },
    { te: 'అపర్ణ దేవి', en: 'Aparna Devi', g: 'female', m: 'తపస్సు చేసిన పార్వతీ మాత', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'అమూల్య శ్రీ', en: 'Amulya Sri', g: 'female', m: 'వెలకట్టలేని అపురూప లక్ష్మి', cat: 'రాజస & విజయ ఆశ్రయం (Royal/Victory)' },
    { te: 'అనన్య', en: 'Ananya', g: 'female', m: 'సాటిలేని విశిష్ట గుణములు కలది', cat: 'ప్రకృతి & తేజో ఆశ్రయం (Nature/Radiance)' },
  ],
  'ఈ': [
    { te: 'ఈశ్వర ప్రసాద్', en: 'Eshwara Prasad', g: 'male', m: 'పరమశివుని అనుగ్రహ ప్రసాదం', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'ఈశాన్ తేజ్', en: 'Ishaan Tej', g: 'male', m: 'ఈశాన్య దిశాధిపతియైన శివుని తేజస్సు', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'ఈశ్వరి దేవి', en: 'Eshwari Devi', g: 'female', m: 'జగదీశ్వరి, రాజరాజేశ్వరి మాత', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'ఈప్సిత', en: 'Ipsita', g: 'female', m: 'శుభ సంకల్పములతో కోరుకున్న వరము', cat: 'వేద & ఇతిహాస ఆశ్రయం (Vedic/Epic)' },
  ],
  'ఉ': [
    { te: 'ఉపేంద్ర నాథ్', en: 'Upendra Nath', g: 'male', m: 'వామనావతారుడైన శ్రీమహావిష్ణువు', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'ఉదయ్ భాస్కర్', en: 'Uday Bhaskar', g: 'male', m: 'ఉదయించే సూర్య భగవానుడు', cat: 'ప్రకృతి & తేజో ఆశ్రయం (Nature/Radiance)' },
    { te: 'ఉమామహేశ్వరి', en: 'Umamaheshwari', g: 'female', m: 'పార్వతీ పరమేశ్వరుల శక్తి స్వరూపిణి', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'ఉజ్వల శ్రీ', en: 'Ujwala Sri', g: 'female', m: 'ప్రకాశవంతమైన భవిష్యత్తు కల లక్ష్మి', cat: 'ప్రకృతి & తేజో ఆశ్రయం (Nature/Radiance)' },
  ],
  'ఏ': [
    { te: 'ఏకదంత సాయి', en: 'Ekadanta Sai', g: 'male', m: 'విఘ్నేశ్వరుని కృప కలిగినవాడు', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'ఏకాంశ్', en: 'Ekansh', g: 'male', m: 'సంపూర్ణ విశ్వంలో ఏకైక శ్రేష్ఠ అంశం', cat: 'వేద & ఇతిహాస ఆశ్రయం (Vedic/Epic)' },
    { te: 'ఏకాక్షరి', en: 'Ekakshari', g: 'female', m: 'ఓంకార స్వరూపిణియైన ఆదిశక్తి', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
  ],
  'ఓ': [
    { te: 'ఓంకారేశ్వర', en: 'Omkareshwara', g: 'male', m: 'ప్రణవ నాద స్వరూపుడైన శివుడు', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'ఓజస్ తేజ్', en: 'Ojas Tej', g: 'male', m: 'ప్రాణశక్తి మరియు ఆత్మతేజస్సు కలవాడు', cat: 'వేద & ఇతిహాస ఆశ్రయం (Vedic/Epic)' },
    { te: 'ఓజస్విని', en: 'Ojaswini', g: 'female', m: 'తేజోవంతమైన మరియు ధీర గుణములు కలది', cat: 'ప్రకృతి & తేజో ఆశ్రయం (Nature/Radiance)' },
  ],
  'వా': [
    { te: 'వాసుదేవ కృష్ణ', en: 'Vasudeva Krishna', g: 'male', m: 'శ్రీకృష్ణ పరమాత్మ (రోహిణీ నక్షత్ర అధిదేవత ఆశ్రయం)', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'వామన్ రావు', en: 'Vaman Rao', g: 'male', m: 'త్రివిక్రముడైన విష్ణుమూర్తి', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'వాణీశ్రీ', en: 'Vani Sri', g: 'female', m: 'సరస్వతి మరియు లక్ష్మీ దేవుల కలయిక', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'వాసవి కన్యక', en: 'Vasavi Kanyaka', g: 'female', m: 'శ్రీ వాసవీ కన్యకా పరమేశ్వరి మాత', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
  ],
  'వి': [
    { te: 'విష్ణువర్ధన్', en: 'Vishnuvardhan', g: 'male', m: 'శ్రీమహావిష్ణువు అనుగ్రహంతో వృద్ధి చెందువాడు', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'విశ్వనాథ్', en: 'Vishwanath', g: 'male', m: 'కాశీ విశ్వేశ్వరుడు, జగన్నాథుడు', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'విజయలక్ష్మి', en: 'Vijayalakshmi', g: 'female', m: 'సకల విజయాలను ప్రసాదించే అష్టలక్ష్మి', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'విద్యుల్లత', en: 'Vidyullata', g: 'female', m: 'మెరుపు తీగ వంటి కాంతి కలిగినది', cat: 'ప్రకృతి & తేజో ఆశ్రయం (Nature/Radiance)' },
  ],
  'వు': [
    { te: 'వుల్లేశ్వర్', en: 'Vulleshwar', g: 'male', m: 'ఆనందాতিరేకమును కలిగించే ఈశ్వరుడు', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'వుషశ్రీ', en: 'Vushasri', g: 'female', m: 'ఉషోదయ కాంతి మరియు సంపద', cat: 'ప్రకృతి & తేజో ఆశ్రయం (Nature/Radiance)' },
  ],
  'వే': [
    { te: 'వేంకటేశ్వర', en: 'Venkateshwara', g: 'male', m: 'కలియుగ ప్రత్యక్ష దైవం తిరుమల శ్రీనివాసుడు', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'వేదవ్యాస్', en: 'Vedavyas', g: 'male', m: 'చతుర్వేదములను విభజించిన మహర్షి', cat: 'వేద & ఇతిహాస ఆశ్రయం (Vedic/Epic)' },
    { te: 'వేదవతి', en: 'Vedavati', g: 'female', m: 'వేద స్వరూపిణియైన పద్మావతి/లక్ష్మి', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'వేణులత', en: 'Venulata', g: 'female', m: 'మురళీ నాదం వంటి మధురమైనది', cat: 'ప్రకృతి & తేజో ఆశ్రయం (Nature/Radiance)' },
  ],
  'వో': [
    { te: 'వోమకేశ్వర', en: 'Vomakeshwara', g: 'male', m: 'ఆకాశ తత్వ స్వరూపుడైన శివుడు', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'వోమిక', en: 'Vomika', g: 'female', m: 'దేవతా శక్తి మరియు దివ్య కాంతి', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
  ],
  'కా': [
    { te: 'కార్తికేయ', en: 'Karthikeya', g: 'male', m: 'దేవసేనానియైన సుబ్రహ్మణ్య స్వామి', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'కాశీనాథ్', en: 'Kashinath', g: 'male', m: 'మోక్షపురి కాశీ క్షేత్రాధిపతి విశ్వేశ్వరుడు', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'కాత్యాయని', en: 'Katyayani', g: 'female', m: 'నవదుర్గలలో ఆరవ రూపమైన జగన్మాత', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'కావ్యశ్రీ', en: 'Kavyasri', g: 'female', m: 'కవితా సౌందర్యం మరియు లక్ష్మీ కళ', cat: 'వేద & ఇతిహాస ఆశ్రయం (Vedic/Epic)' },
  ],
  'కి': [
    { te: 'కిరణ్ కుమార్', en: 'Kiran Kumar', g: 'male', m: 'సూర్య కిరణం వంటి తేజస్సు గల కుమారుడు', cat: 'ప్రకృతి & తేజో ఆశ్రయం (Nature/Radiance)' },
    { te: 'కిశోర్ చంద్ర', en: 'Kishore Chandra', g: 'male', m: 'బాలచంద్రుని వంటి నిర్మల కాంతి కలవాడు', cat: 'ప్రకృతి & తేజో ఆశ్రయం (Nature/Radiance)' },
    { te: 'కిరణ్మయి', en: 'Kiranmayi', g: 'female', m: 'జ్యోతిర్మయమైన కాంతి పుంజం', cat: 'ప్రకృతి & తేజో ఆశ్రయం (Nature/Radiance)' },
    { te: 'కీర్తి లక్ష్మి', en: 'Keerthi Lakshmi', g: 'female', m: 'యశస్సు మరియు ఐశ్వర్యం ప్రసాదించే దేవి', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
  ],
  'కు': [
    { te: 'కుమారస్వామి', en: 'Kumaraswamy', g: 'male', m: 'షణ్ముఖుడు, శక్తి ఆయుధధారి', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'కుశల తేజ్', en: 'Kushala Tej', g: 'male', m: 'శ్రీరాముని కుమారుడు కుశుని వంటి నేర్పరి', cat: 'వేద & ఇతిహాస ఆశ్రయం (Vedic/Epic)' },
    { te: 'కుందన శ్రీ', en: 'Kundana Sri', g: 'female', m: 'అపరంజి బంగారం వంటి స్వచ్ఛమైన లక్ష్మి', cat: 'రాజస & విజయ ఆశ్రయం (Royal/Victory)' },
    { te: 'కుసుమ ప్రియ', en: 'Kusuma Priya', g: 'female', m: 'పుష్పముల వంటి సున్నిత మనస్సు కలది', cat: 'ప్రకృతి & తేజో ఆశ్రయం (Nature/Radiance)' },
  ],
  'ఘ': [
    { te: 'ఘనశ్యామ్', en: 'Ghanashyam', g: 'male', m: 'నీలమేఘ శ్యాముడైన శ్రీకృష్ణుడు', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'ఘంటాకర్ణ', en: 'Ghantakarna', g: 'male', m: 'శివభక్తుడైన వీర గణనాథుడు', cat: 'వేద & ఇతిహాస ఆశ్రయం (Vedic/Epic)' },
    { te: 'ఘృతలక్ష్మి', en: 'Ghritalakshmi', g: 'female', m: 'యజ్ఞ హవిస్సు వలె పవిత్రమైన సంపద', cat: 'వేద & ఇతిహాస ఆశ్రయం (Vedic/Epic)' },
  ],
  'ఙ': [
    { te: 'జ్ఞానేశ్వర్ (ఙ/జ్ఞ)', en: 'Gnaneshwar', g: 'male', m: 'బ్రహ్మజ్ఞానానికి అధిపతియైన ఈశ్వరుడు', cat: 'వేద & ఇతిహాస ఆశ్రయం (Vedic/Epic)' },
    { te: 'జ్ఞానప్రసూనాంబ', en: 'Gnanaprasunamba', g: 'female', m: 'శ్రీకాళహస్తి జ్ఞానప్రసూనాంబికా దేవి', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
  ],
  'చ': [
    { te: 'చంద్రశేఖర', en: 'Chandrashekhara', g: 'male', m: 'నెలవంకను శిరస్సున ధరించిన పరమశివుడు', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'చక్రపాణి', en: 'Chakrapani', g: 'male', m: 'సుదర్శన చక్రధారియైన శ్రీమహావిష్ణువు', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'చంద్రకళ', en: 'Chandrakala', g: 'female', m: 'పున్నమి వెన్నెల కళ కలిగిన దేవి', cat: 'ప్రకృతి & తేజో ఆశ్రయం (Nature/Radiance)' },
    { te: 'చాముండేశ్వరి', en: 'Chamundeshwari', g: 'female', m: 'దుష్టశిక్షణ చేసే ఆదిపరాశక్తి', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
  ],
  'కే': [
    { te: 'కేశవ నారాయణ', en: 'Keshava Narayana', g: 'male', m: 'చతుర్వింశతి మూర్తులలో మొదటివాడైన కేశవుడు', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'కేదారేశ్వర్', en: 'Kedareshwar', g: 'male', m: 'హిమాలయ కేదార జ్యోతిర్లింగ శివుడు', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'కేతకీ దేవి', en: 'Ketaki Devi', g: 'female', m: 'సువాసనలు వెదజల్లే స్వర్ణ పుష్పం', cat: 'ప్రకృతి & తేజో ఆశ్రయం (Nature/Radiance)' },
  ],
  'కో': [
    { te: 'కోదండరామ్', en: 'Kodandaram', g: 'male', m: 'కోదండ ధనుస్సు ధరించిన శ్రీరామచంద్రుడు', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'కోటేశ్వర రావు', en: 'Koteshwara Rao', g: 'male', m: 'కోటి లింగాల స్వరూపుడైన శివుడు', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'కోమలవల్లి', en: 'Komalavalli', g: 'female', m: 'శ్రీ రంగనాథుని దేవేరి, మృదువైన లక్ష్మి', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'కోకిల వాణి', en: 'Kokila Vani', g: 'female', m: 'కోయిల వంటి మధుర కంఠস্বరం కలది', cat: 'ప్రకృతి & తేజో ఆశ్రయం (Nature/Radiance)' },
  ],
  'హ': [
    { te: 'హరిహర నందన్', en: 'Harihara Nandan', g: 'male', m: 'శివకేశవుల తేజోమూర్తి అయ్యప్ప/ధర్మశాస్త', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'హనుమంత రావు', en: 'Hanumantha Rao', g: 'male', m: 'వాయుపుత్రుడు, ఆంజనేయ స్వామి', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'హరిప్రియ', en: 'Haripriya', g: 'female', m: 'శ్రీమహావిష్ణువుకు అత్యంత ప్రియమైన మహాలక్ష్మి', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'హంసవాహిని', en: 'Hamsavahini', g: 'female', m: 'హంస వాహనంపై విహరించే చదువుల తల్లి సరస్వతి', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
  ],
  'హి': [
    { te: 'హిరణ్య గర్భ', en: 'Hiranya Garbha', g: 'male', m: 'బంగారు కాంతి గల సృష్టికర్త బ్రహ్మ/సూర్యుడు', cat: 'వేద & ఇతిహాస ఆశ్రయం (Vedic/Epic)' },
    { te: 'హిమాంశు', en: 'Himanshu', g: 'male', m: 'చల్లని కిరణములు గల చంద్రుడు', cat: 'ప్రకృతి & తేజో ఆశ్రయం (Nature/Radiance)' },
    { te: 'హిమబిందు', en: 'Himabindu', g: 'female', m: 'మంచు బిందువు వంటి స్వచ్ఛమైనది', cat: 'ప్రకృతి & తేజో ఆశ్రయం (Nature/Radiance)' },
    { te: 'హిరణ్మయి', en: 'Hiranmayi', g: 'female', m: 'స్వర్ణమయమైన కాంతి కలిగిన మహాలక్ష్మి', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
  ],
  'హు': [
    { te: 'హుతాశన తేజ్', en: 'Hutashana Tej', g: 'male', m: 'పవిత్ర యజ్ఞాగ్ని తేజస్సు కలవాడు', cat: 'వేద & ఇతిహాస ఆశ్రయం (Vedic/Epic)' },
    { te: 'హుమాయూన్ శ్రీ', en: 'Humayun Sri', g: 'female', m: 'ఆనందం మరియు శుభయోగం కలది', cat: 'రాజస & విజయ ఆశ్రయం (Royal/Victory)' },
  ],
  'హే': [
    { te: 'హేమచంద్ర', en: 'Hemachandra', g: 'male', m: 'బంగారు కాంతి గల చంద్రుడు', cat: 'ప్రకృతి & తేజో ఆశ్రయం (Nature/Radiance)' },
    { te: 'హేమంత్ కుమార్', en: 'Hemanth Kumar', g: 'male', m: 'బంగారం వంటి విలువైన గుణములు కలవాడు', cat: 'రాజస & విజయ ఆశ్రయం (Royal/Victory)' },
    { te: 'హేమలత', en: 'Hemalatha', g: 'female', m: 'బంగారు తీగ వంటి సౌభాగ్యవతి', cat: 'ప్రకృతి & తేజో ఆశ్రయం (Nature/Radiance)' },
    { te: 'హేమావతి', en: 'Hemavati', g: 'female', m: 'స్వర్ణభూషితయైన పార్వతీ దేవి', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
  ],
  'హో': [
    { te: 'హోమేశ్వర', en: 'Homeshwara', g: 'male', m: 'యజ్ఞయాగాదులకు అధిపతియైన ఈశ్వరుడు', cat: 'వేద & ఇతిహాస ఆశ్రయం (Vedic/Epic)' },
    { te: 'హోత్రిక', en: 'Hotrika', g: 'female', m: 'వేద మంత్ర ఆరాధన స్వరూపిణి', cat: 'వేద & ఇతిహాస ఆశ్రయం (Vedic/Epic)' },
  ],
  'డా': [
    { te: 'డామరేశ్వర (ద/డా)', en: 'Damareshwara', g: 'male', m: 'డమరుక నాదం చేసే నటరాజ స్వామి', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'దామోదర్ రావు', en: 'Damodar Rao', g: 'male', m: 'యశోదా బంధితుడైన శ్రీకృష్ణుడు', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'దాక్షాయణి', en: 'Dakshayani', g: 'female', m: 'ఆదిశక్తియైన సతీదేవి / పార్వతి', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
  ],
  'డి': [
    { te: 'డింభకేశ్వర (ది/డి)', en: 'Dimbhakeshwara', g: 'male', m: 'బాల స్వరూప భగవానుడు', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'దివాకర్ తేజ్', en: 'Divakar Tej', g: 'male', m: 'ప్రత్యక్ష నారాయణుడైన సూర్య భగవానుడు', cat: 'ప్రకృతి & తేజో ఆశ్రయం (Nature/Radiance)' },
    { te: 'దివ్యలక్ష్మి', en: 'Divyalakshmi', g: 'female', m: 'దేవలోకపు ఐశ్వర్య లక్ష్మి', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
  ],
  'డు': [
    { te: 'దుర్గాప్రసాద్ (డు/దు)', en: 'Durgaprasad', g: 'male', m: 'కనకదుర్గమ్మ ఆశీస్సులతో జన్మించినవాడు', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'దుర్గాభవాని', en: 'Durgabhavani', g: 'female', m: 'ఇంద్రకీలాద్రి జగన్మాత దుర్గాదేవి', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
  ],
  'డే': [
    { te: 'దేవేంద్ర నాథ్', en: 'Devendra Nath', g: 'male', m: 'దేవతల రాజైన ఇంద్రుడు', cat: 'రాజస & విజయ ఆశ్రయం (Royal/Victory)' },
    { te: 'దేవయాని', en: 'Devayani', g: 'female', m: 'దేవతా రథం వంటి తేజస్సు గల కన్య', cat: 'వేద & ఇతిహాస ఆశ్రయం (Vedic/Epic)' },
  ],
  'డో': [
    { te: 'దోణేశ్వర', en: 'Doneshwara', g: 'male', m: 'గురు తుల్యమైన జ్ఞానం కలవాడు', cat: 'వేద & ఇతిహాస ఆశ్రయం (Vedic/Epic)' },
    { te: 'డోలావతి', en: 'Dolavati', g: 'female', m: 'ఆనంద డోలికలలో ఊగే లక్ష్మీ స్వరూపిణి', cat: 'ప్రకృతి & తేజో ఆశ్రయం (Nature/Radiance)' },
  ],
  'మ': [
    { te: 'మధుసూదన్ రావు', en: 'Madhusudan Rao', g: 'male', m: 'మధు కైటభులను సంహరించిన మహావిష్ణువు', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'మణికంఠ స్వామి', en: 'Manikanta Swamy', g: 'male', m: 'కంఠమున మణి ధరించిన శబరిమల అయ్యప్ప', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'మహాలక్ష్మి', en: 'Mahalakshmi', g: 'female', m: 'అష్టైశ్వర్యాలను కురిపించే శ్రీ మహాలక్ష్మి', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'మధుమిత', en: 'Madhumita', g: 'female', m: 'తేనె వంటి మధురమైన మాటలు కలది', cat: 'ప్రకృతి & తేజో ఆశ్రయం (Nature/Radiance)' },
  ],
  'మి': [
    { te: 'మిథున్ చక్రవర్తి', en: 'Mithun Chakravarthy', g: 'male', m: 'రాజస తేజస్సు మరియు సమన్వయ శక్తి కలవాడు', cat: 'రాజస & విజయ ఆశ్రయం (Royal/Victory)' },
    { te: 'మిత్రవింద', en: 'Mitravinda', g: 'female', m: 'శ్రీకృష్ణుని అష్టమహిషులలో ఒకరైన దేవి', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'మీనాక్షి దేవి', en: 'Meenakshi Devi', g: 'female', m: 'మధురై మీనాక్షీ సుందరేశ్వరి మాత', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
  ],
  'ము': [
    { te: 'మురళీకృష్ణ', en: 'Muralikrishna', g: 'male', m: 'వేణుగాన లోలుడైన శ్రీకృష్ణ పరమాత్మ', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'ముకుంద రామ్', en: 'Mukunda Ram', g: 'male', m: 'మోక్షమును ప్రసాదించే విష్ణుమూర్తి', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'ముగ్ధ శ్రీ', en: 'Mugdha Sri', g: 'female', m: 'నిర్మలమైన మరియు మనోహరమైన సౌందర్యం', cat: 'ప్రకృతి & తేజో ఆశ్రయం (Nature/Radiance)' },
  ],
  'మే': [
    { te: 'మేఘనాథ్', en: 'Meghanath', g: 'male', m: 'మేఘ గంభీర ధ్వని కల వీరుడు', cat: 'రాజస & విజయ ఆశ్రయం (Royal/Victory)' },
    { te: 'మేధా శ్రీ', en: 'Medha Sri', g: 'female', m: 'అపారమైన బుద్ధిశక్తి గల సరస్వతీ స్వరూపిణి', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'మేనక దేవి', en: 'Menaka Devi', g: 'female', m: 'దేవలోకపు కళా స్వరూపిణి', cat: 'ప్రకృతి & తేజో ఆశ్రయం (Nature/Radiance)' },
  ],
  'మో': [
    { te: 'మోహన కృష్ణ', en: 'Mohana Krishna', g: 'male', m: 'జగత్తును ఆకర్షించే జగన్మోహనుడు', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'మోక్షిత్ రామ్', en: 'Mokshit Ram', g: 'male', m: 'ఆధ్యాత్మిక విముక్తి మరియు శాంతి కలవాడు', cat: 'వేద & ఇతిహాస ఆశ్రయం (Vedic/Epic)' },
    { te: 'మోహిని ప్రియ', en: 'Mohini Priya', g: 'female', m: 'విష్ణుమూర్తి జగన్మోహిని అవతార కళ', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
  ],
  'ట': [
    { te: 'తారకరామ (ట/త)', en: 'Tarakarama', g: 'male', m: 'తారక మంత్ర స్వరూపుడైన శ్రీరాముడు', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'తారకేశ్వరి', en: 'Tarakeshwari', g: 'female', m: 'నక్షత్ర మండల శక్తి స్వరూపిణి', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
  ],
  'టి': [
    { te: 'తిరుమలేశ్ (టి/తి)', en: 'Tirumalesh', g: 'male', m: 'సప్తగిరివాసుడైన శ్రీ వేంకటేశ్వర స్వామి', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'తిలోత్తమ', en: 'Tilottama', g: 'female', m: 'అణువణువునా శ్రేష్ఠమైన గుణములు కలది', cat: 'ప్రకృతి & తేజో ఆశ్రయం (Nature/Radiance)' },
  ],
  'టు': [
    { te: 'తుళసీరామ్ (టు/తు)', en: 'Tulasiram', g: 'male', m: 'తులసీ దళ ప్రియుడైన శ్రీరామచంద్రుడు', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'తులసీ దేవి', en: 'Tulasi Devi', g: 'female', m: 'బృందావన పావనియైన శ్రీ తులసీ మాత', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
  ],
  'టే': [
    { te: 'తేజోమయ్ (టే/తే)', en: 'Tejomay', g: 'male', m: 'సూర్య తేజస్సుతో నిండినవాడు', cat: 'ప్రకృతి & తేజో ఆశ్రయం (Nature/Radiance)' },
    { te: 'తేజస్విని', en: 'Tejaswini', g: 'female', m: 'దివ్య కాంతి మరియు ఆత్మవిశ్వాసం కలది', cat: 'ప్రకృతి & తేజో ఆశ్రయం (Nature/Radiance)' },
  ],
  'టో': [
    { te: 'తోషిత్ కుమార్', en: 'Toshit Kumar', g: 'male', m: 'సదా సంతోషమును, సంతృప్తిని పంచేవాడు', cat: 'రాజస & విజయ ఆశ్రయం (Royal/Victory)' },
    { te: 'తోషిణి శ్రీ', en: 'Toshini Sri', g: 'female', m: 'ఆనంద లక్ష్మి స్వరూపిణి', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
  ],
  'ప': [
    { te: 'పద్మనాభ స్వామి', en: 'Padmanabha Swamy', g: 'male', m: 'నాభియందు కమలము గల శ్రీమహావిష్ణువు', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'పవన్ కళ్యాణ్', en: 'Pavan Kalyan', g: 'male', m: 'వాయుదేవుని వేగం మరియు శుభకళ్యాణ గుణం', cat: 'రాజస & విజయ ఆశ్రయం (Royal/Victory)' },
    { te: 'పద్మావతి దేవి', en: 'Padmavathi Devi', g: 'female', m: 'తిరుచానూరు అలమేలుమంగమ్మ తల్లి', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'పల్లవి శ్రీ', en: 'Pallavi Sri', g: 'female', m: 'చిగురించే వసంత శోభ కలిగినది', cat: 'ప్రకృతి & తేజో ఆశ్రయం (Nature/Radiance)' },
  ],
  'పి': [
    { te: 'పినాకపాణి', en: 'Pinakapani', g: 'male', m: 'పినాక ధనుస్సు ధరించిన పరమశివుడు', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'పింగళాక్షి', en: 'Pingalakshi', g: 'female', m: 'స్వర్ణ కాంతి గల కన్నులు కలిగిన దేవి', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
  ],
  'పు': [
    { te: 'పురుషోత్తమ రావు', en: 'Purushottama Rao', g: 'male', m: 'పురుషులలో కెల్లా ఉత్తముడైన శ్రీరాముడు/కృష్ణుడు', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'పునీత్ రాజ్', en: 'Puneeth Raj', g: 'male', m: 'పవిత్రమైన మనస్సు గల రాజయోగ జాతకుడు', cat: 'రాజస & విజయ ఆశ్రయం (Royal/Victory)' },
    { te: 'పుష్పావతి', en: 'Pushpavathi', g: 'female', m: 'పుష్పమాలికల శోభ కలిగిన లక్ష్మి', cat: 'ప్రకృతి & తేజో ఆశ్రయం (Nature/Radiance)' },
    { te: 'పూజిత శ్రీ', en: 'Poojitha Sri', g: 'female', m: 'అందరిచేత గౌరవింపబడే దేవతా మూర్తి', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
  ],
  'ష': [
    { te: 'షణ్ముఖ ప్రియ', en: 'Shanmukha Priya', g: 'female', m: 'సుబ్రహ్మణ్య స్వామికి ప్రియమైన రాగ స్వరూపిణి', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'షణ్ముఖ తేజ్', en: 'Shanmukha Tej', g: 'male', m: 'ఆరు ముఖముల కార్తికేయ స్వామి తేజస్సు', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
  ],
  'ణ': [
    { te: 'నరసింహ మూర్తి (ణ/న)', en: 'Narasimha Murthy', g: 'male', m: 'భక్త రక్షకుడైన ఉగ్ర-లక్ష్మీ నరసింహ స్వామి', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'నందిని దేవి', en: 'Nandini Devi', g: 'female', m: 'కామధేనువు పుత్రిక, ఆనంద ప్రదాయిని', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
  ],
  'ఠ': [
    { te: 'ఠాకూర్ రామ్ (ఠ/త)', en: 'Thakur Ram', g: 'male', m: 'భగవంతుని రాజస స్వరూపం', cat: 'రాజస & విజయ ఆశ్రయం (Royal/Victory)' },
    { te: 'తన్మయి శ్రీ', en: 'Tanmayi Sri', g: 'female', m: 'భక్తి పారవశ్యంలో లీనమయ్యే మనస్సు కలది', cat: 'వేద & ఇతిహాస ఆశ్రయం (Vedic/Epic)' },
  ],
  'పే': [
    { te: 'ప్రేమ్ సాగర్ (పే/ప్రే)', en: 'Prem Sagar', g: 'male', m: 'ప్రేమ మరియు కరుణ సముద్రం వంటివాడు', cat: 'ప్రకృతి & తేజో ఆశ్రయం (Nature/Radiance)' },
    { te: 'ప్రేరణ శ్రీ', en: 'Prerana Sri', g: 'female', m: 'ఉత్సాహాన్ని, స్ఫూర్తిని నింపే శక్తి', cat: 'రాజస & విజయ ఆశ్రయం (Royal/Victory)' },
  ],
  'పో': [
    { te: 'పోతన రామ్', en: 'Pothana Ram', g: 'male', m: 'భాగవత రచయిత బమ్మెర పోతన భక్తి ఆశ్రయం', cat: 'వేద & ఇతిహాస ఆశ్రయం (Vedic/Epic)' },
    { te: 'పోషిత లక్ష్మి', en: 'Poshitha Lakshmi', g: 'female', m: 'సమస్త లోకాలను పోషించే జగన్మాత', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
  ],
  'రా': [
    { te: 'రామచంద్ర మూర్తి', en: 'Ramachandra Murthy', g: 'male', m: 'సత్యధర్మ స్వరూపుడైన శ్రీ సీతారామచంద్రుడు', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'రాఘవేంద్ర స్వామి', en: 'Raghavendra Swamy', g: 'male', m: 'మంత్రాలయ కామధేనువు శ్రీ గురు రాఘవేంద్రులు', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'రాజరాజేశ్వరి', en: 'Rajarajeshwari', g: 'female', m: 'శ్రీచక్ర అధిষ্ঠాన దేవత లలితా త్రిపురసుందరి', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'రాధికా కృష్ణ', en: 'Radhika Krishna', g: 'female', m: 'శ్రీకృష్ణుని ఆత్మస్వరూపిణియైన రాధాదేవి', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
  ],
  'రి': [
    { te: 'రిషికేశ్ వర్మ', en: 'Rishikesh Varma', g: 'male', m: 'ఇంద్రియములను జయించిన శ్రీమహావిష్ణువు', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'రిత్విక్ తేజ్', en: 'Ritvik Tej', g: 'male', m: 'వేద యజ్ఞమును నిర్వహించే ప్రధాన ఋత్విక్కు', cat: 'వేద & ఇతిహాస ఆశ్రయం (Vedic/Epic)' },
    { te: 'రిషిత శ్రీ', en: 'Rishitha Sri', g: 'female', m: 'ఋషి తుల్యమైన జ్ఞానం మరియు లక్ష్మీ కళ', cat: 'వేద & ఇతిహాస ఆశ్రయం (Vedic/Epic)' },
    { te: 'రిద్ధి సిద్ధి', en: 'Riddhi Siddhi', g: 'female', m: 'వినాయకుని దేవేరులు — ఐశ్వర్యం మరియు కార్యసిద్ధి', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
  ],
  'రు': [
    { te: 'రుద్రేశ్వర రావు', en: 'Rudreshwara Rao', g: 'male', m: 'సర్వ అరిష్టములను హరించే పరమశివుడు', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'రుక్మిణీ దేవి', en: 'Rukmini Devi', g: 'female', m: 'ద్వారకాధీశుడైన శ్రీకృష్ణుని పట్టమహిషి మహాలక్ష్మి', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'రుచిర శ్రీ', en: 'Ruchira Sri', g: 'female', m: 'మనోహరమైన కాంతి మరియు అభిరుచి కలది', cat: 'ప్రకృతి & తేజో ఆశ్రయం (Nature/Radiance)' },
  ],
  'రే': [
    { te: 'రేవంత్ కుమార్', en: 'Revanth Kumar', g: 'male', m: 'సూర్య పుత్రుడైన రేవంతుడు, అశ్వారూఢ విజేత', cat: 'రాజస & విజయ ఆశ్రయం (Royal/Victory)' },
    { te: 'రేణుకా దేవి', en: 'Renuka Devi', g: 'female', m: 'పరశురాముని మాతృమూర్తి, శక్తి స్వరూపిణి', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'రేవతి లక్ష్మి', en: 'Revathi Lakshmi', g: 'female', m: 'బలరాముని దేవేరి, ఐశ్వర్య తార', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
  ],
  'రో': [
    { te: 'రోహిత్ శర్మ', en: 'Rohit Sharma', g: 'male', m: 'ఉదయించే సూర్యుని ఎర్రని కాంతి పుంజం', cat: 'ప్రకృతి & తేజో ఆశ్రయం (Nature/Radiance)' },
    { te: 'రోహన్ కృష్ణ', en: 'Rohan Krishna', g: 'male', m: 'అభివృద్ధి పథంలో నిరంతరం ఎదిగేవాడు', cat: 'రాజస & విజయ ఆశ్రయం (Royal/Victory)' },
    { te: 'రోహిణీ దేవి', en: 'Rohini Devi', g: 'female', m: 'చంద్రునికి అత్యంత ప్రియమైన నక్షత్ర దేవత', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
  ],
  'తా': [
    { te: 'తారకేశ్వర రావు', en: 'Tarakeshwara Rao', g: 'male', m: 'సంసార సాగరాన్ని దాటించే శివుడు', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'తారాదేవి', en: 'Tara Devi', g: 'female', m: 'దశమహావిద్యలలో రెండవ శక్తి, మార్గదర్శిని', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
  ],
  'తి': [
    { te: 'తిరుపతి రావు', en: 'Tirupathi Rao', g: 'male', m: 'శ్రీ లక్ష్మీ రమణుడైన వేంకటాచలపతి', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'త్రివిక్రమ్', en: 'Trivikram', g: 'male', m: 'మూడు అడుగులతో ముల్లోకాలను కొలిచిన విష్ణువు', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'త్రిపురసుందరి', en: 'Tripurasundari', g: 'female', m: 'శ్రీ లలితా మహా త్రిపురసుందరీ దేవి', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
  ],
  'తు': [
    { te: 'తుషార్ కాంత్', en: 'Tushar Kanth', g: 'male', m: 'హిమగిరి మంచు వలె నిర్మలమైన కాంతి కలవాడు', cat: 'ప్రకృతి & తేజో ఆశ్రయం (Nature/Radiance)' },
    { te: 'తులసీ మహాలక్ష్మి', en: 'Tulasi Mahalakshmi', g: 'female', m: 'విష్ణుప్రియయైన తులసీ మాత', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
  ],
  'తే': [
    { te: 'తేజేశ్వర రావు', en: 'Tejeshwara Rao', g: 'male', m: 'సమస్త తేజస్సులకు మూలమైన పరమేశ్వరుడు', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'తేజశ్రీ', en: 'Tejasri', g: 'female', m: 'దివ్య తేజస్సు మరియు సంపద కలది', cat: 'ప్రకృతి & తేజో ఆశ్రయం (Nature/Radiance)' },
  ],
  'తో': [
    { te: 'తోమర్ రాజ్', en: 'Tomar Raj', g: 'male', m: 'క్షత్రియ తేజస్సు మరియు పరాక్రమం కలవాడు', cat: 'రాజస & విజయ ఆశ్రయం (Royal/Victory)' },
    { te: 'తోషిత శ్రీ', en: 'Toshitha Sri', g: 'female', m: 'సంతృప్తి మరియు ఆనందం ప్రసాదించే లక్ష్మి', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
  ],
  'నా': [
    { te: 'నారాయణ మూర్తి', en: 'Narayana Murthy', g: 'male', m: 'సర్వవ్యాపకుడైన శ్రీమన్నారాయణుడు', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'నాగార్జున రావు', en: 'Nagarjuna Rao', g: 'male', m: 'అజేయ శక్తి మరియు రసాయన శాస్త్ర విజ్ఞానం కలవాడు', cat: 'రాజస & విజయ ఆశ్రయం (Royal/Victory)' },
    { te: 'నాగలక్ష్మి', en: 'Nagalakshmi', g: 'female', m: 'నాగదేవతల రక్షణ మరియు లక్ష్మీ కటాక్షం కలది', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
  ],
  'ని': [
    { te: 'నిఖిల్ కృష్ణ', en: 'Nikhil Krishna', g: 'male', m: 'సంపూర్ణమైన విశ్వ స్వరూపుడు', cat: 'వేద & ఇతిహాస ఆశ్రయం (Vedic/Epic)' },
    { te: 'నిరంజన్ రావు', en: 'Niranjan Rao', g: 'male', m: 'నిర్మలుడు, మచ్చలేని పరమేశ్వరుడు', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'నిహారిక శ్రీ', en: 'Niharika Sri', g: 'female', m: 'ఉదయపు మంచు బిందువు మరియు పాలపుంత కాంతి', cat: 'ప్రకృతి & తేజో ఆశ్రయం (Nature/Radiance)' },
    { te: 'నిత్యశ్రీ', en: 'Nithyasri', g: 'female', m: 'శాశ్వతమైన ఐశ్వర్యం మరియు మంగళం కలది', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
  ],
  'ను': [
    { te: 'నూతన్ కుమార్', en: 'Nuthan Kumar', g: 'male', m: 'నిత్య నూతన ఉత్సాహం మరియు సృజనాత్మకత కలవాడు', cat: 'ప్రకృతి & తేజో ఆశ్రయం (Nature/Radiance)' },
    { te: 'నూపుర శ్రీ', en: 'Nupura Sri', g: 'female', m: 'లక్ష్మీదేవి పాద మంజీర నాదం', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
  ],
  'నే': [
    { te: 'నేతాజీ రామ్', en: 'Netaji Ram', g: 'male', m: 'గొప్ప నాయకత్వ పటిమ కలిగిన ధీరుడు', cat: 'రాజస & విజయ ఆశ్రయం (Royal/Victory)' },
    { te: 'నేహా శ్రీ', en: 'Neha Sri', g: 'female', m: 'ప్రేమ, అనురాగం మరియు వర్షపు జల్లు', cat: 'ప్రకృతి & తేజో ఆశ్రయం (Nature/Radiance)' },
    { te: 'నేత్రావతి', en: 'Netravathi', g: 'female', m: 'సుందరమైన నేత్రములు గల పవిత్ర నది', cat: 'ప్రకృతి & తేజో ఆశ్రయం (Nature/Radiance)' },
  ],
  'నో': [
    { te: 'నోమేశ్వర రావు', en: 'Nomeshwara Rao', g: 'male', m: 'నియమ నిষ্ঠలతో పూజింపబడే ఈశ్వరుడు', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'నోమిక శ్రీ', en: 'Nomika Sri', g: 'female', m: 'ధార్మిక వర్తన మరియు దివ్య శోభ కలది', cat: 'వేద & ఇతిహాస ఆశ్రయం (Vedic/Epic)' },
  ],
  'య': [
    { te: 'యశ్వంత్ కుమార్', en: 'Yashwanth Kumar', g: 'male', m: 'కీర్తి ప్రతిష్ఠలు మరియు విజయం కలవాడు', cat: 'రాజస & విజయ ఆశ్రయం (Royal/Victory)' },
    { te: 'యజ్ఞనారాయణ', en: 'Yagnanarayana', g: 'male', m: 'యజ్ఞ భోక్తయైన శ్రీమహావిష్ణువు', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'యశోదా దేవి', en: 'Yashoda Devi', g: 'female', m: 'శ్రీకృష్ణుని పెంచిన వాత్సల్య మాత, కీర్తిని ఇచ్చేది', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'యామిని ప్రియ', en: 'Yamini Priya', g: 'female', m: 'వెన్నెల రాత్రి వంటి ప్రశాంత సౌందర్యం', cat: 'ప్రకృతి & తేజో ఆశ్రయం (Nature/Radiance)' },
  ],
  'యి': [
    { te: 'యింద్రజిత్ (ఇ/యి)', en: 'Indrajit', g: 'male', m: 'ఇంద్రుని వలె పరాక్రమశాలి', cat: 'రాజస & విజయ ఆశ్రయం (Royal/Victory)' },
    { te: 'యిందుమతి (ఇం/యిం)', en: 'Indumathi', g: 'female', m: 'పూర్ణచంద్రుని కాంతి కలిగిన మహారాణి', cat: 'ప్రకృతి & తేజో ఆశ్రయం (Nature/Radiance)' },
  ],
  'యు': [
    { te: 'యుగంధర్ రావు', en: 'Yugandhar Rao', g: 'male', m: 'యుగమును నడిపించే శ్రీకృష్ణ పరమాత్మ', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'యుధిష్ఠిర', en: 'Yudhishthira', g: 'male', m: 'యుద్ధమునందు స్థిరమైన బుద్ధి గల ధర్మరాజు', cat: 'వేద & ఇతిహాస ఆశ్రయం (Vedic/Epic)' },
    { te: 'యుక్త శ్రీ', en: 'Yuktha Sri', g: 'female', m: 'యోగశక్తి మరియు బుద్ధి కుశలత కలిగినది', cat: 'వేద & ఇతిహాస ఆశ్రయం (Vedic/Epic)' },
  ],
  'యే': [
    { te: 'యేడుకొండల స్వామి', en: 'Yedukondala Swamy', g: 'male', m: 'సప్తగిరివాసుడైన తిరుమల శ్రీ వేంకటేశ్వరుడు', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'యేశస్విని', en: 'Yeshaswini', g: 'female', m: 'అఖండ కీర్తి మరియు విజయం కలిగినది', cat: 'రాజస & విజయ ఆశ్రయం (Royal/Victory)' },
  ],
  'యో': [
    { te: 'యోగేశ్వర రావు', en: 'Yogeshwara Rao', g: 'male', m: 'యోగాధిపతియైన శ్రీకృష్ణుడు / పరమశివుడు', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'యోగానంద్', en: 'Yoganand', g: 'male', m: 'యోగ సమాధి ఆనందం కలవాడు', cat: 'వేద & ఇతిహాస ఆశ్రయం (Vedic/Epic)' },
    { te: 'యోగితా లక్ష్మి', en: 'Yogitha Lakshmi', g: 'female', m: 'ధ్యానశక్తి మరియు ఐశ్వర్యం కలది', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
  ],
  'భా': [
    { te: 'భాస్కర రావు', en: 'Bhaskara Rao', g: 'male', m: 'జ్ఞాన జ్యోతిని ప్రసాదించే సూర్య భగవానుడు', cat: 'ప్రకృతి & తేజో ఆశ్రయం (Nature/Radiance)' },
    { te: 'భార్గవ రామ్', en: 'Bhargava Ram', g: 'male', m: 'భృగు వంశోద్ధారకుడైన శ్రీరాముడు', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'భార్గవీ లక్ష్మి', en: 'Bhargavi Lakshmi', g: 'female', m: 'భృగు మహర్షి పుత్రికయైన శ్రీ మహాలక్ష్మి', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'భానుమతి', en: 'Bhanumathi', g: 'female', m: 'సూర్య తేజస్సు కలిగిన తేజోవతి', cat: 'ప్రకృతి & తేజో ఆశ్రయం (Nature/Radiance)' },
  ],
  'భి': [
    { te: 'భీమసేన రావు', en: 'Bheemasena Rao', g: 'male', m: 'వాయుపుత్రుడైన భీముని వంటి మహాబలశాలి', cat: 'రాజస & విజయ ఆశ్రయం (Royal/Victory)' },
    { te: 'భిక్షాటన శివ', en: 'Bhikshatana Shiva', g: 'male', m: 'అహంకారాన్ని నిర్మూలించే పరమశివుడు', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'భిల్వశ్రీ', en: 'Bhilvasri', g: 'female', m: 'బిల్వ దళం వలె శివ-లక్ష్మీ ప్రియమైనది', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
  ],
  'భు': [
    { te: 'భువనేశ్వర రావు', en: 'Bhuvaneshwara Rao', g: 'male', m: 'చతుర్దశ భువనములకు అధిపతి', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'భువనేశ్వరి దేవి', en: 'Bhuvaneshwari Devi', g: 'female', m: 'విశ్వాన్ని పాలించే రాజరాజేశ్వరి మాత', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'భూమిక శ్రీ', en: 'Bhumika Sri', g: 'female', m: 'భూదేవి వంటి సహనం మరియు సంపద కలది', cat: 'ప్రకృతి & తేజో ఆశ్రయం (Nature/Radiance)' },
  ],
  'ధ': [
    { te: 'ధనుంజయ రావు', en: 'Dhanunjaya Rao', g: 'male', m: 'సంపదలను మరియు యుద్ధాలను జయించిన అర్జునుడు', cat: 'రాజస & విజయ ఆశ్రయం (Royal/Victory)' },
    { te: 'ధన్వంతరి తేజ్', en: 'Dhanvantari Tej', g: 'male', m: 'ఆయుర్వేద ఆదిదేవుడైన శ్రీ మహావిష్ణువు', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'ధనలక్ష్మి', en: 'Dhanalakshmi', g: 'female', m: 'ఐశ్వర్య ప్రదాయినియైన అష్టలక్ష్మి స్వరూపం', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'ధరణి ప్రియ', en: 'Dharani Priya', g: 'female', m: 'వసుంధర (భూమాత) స్వరూపిణి', cat: 'ప్రకృతి & తేజో ఆశ్రయం (Nature/Radiance)' },
  ],
  'ఫ': [
    { te: 'ఫణీంద్ర నాథ్', en: 'Phanindra Nath', g: 'male', m: 'ఆదిశేషునిపై శయనించిన శ్రీమన్నారాయణుడు', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'ఫాల్గుణ రావు', en: 'Phalguna Rao', g: 'male', m: 'ఉత్తర ఫల్గుణీ నక్షత్రాన జన్మించిన అర్జునుడు', cat: 'వేద & ఇతిహాస ఆశ్రయం (Vedic/Epic)' },
    { te: 'ఫాల్గుణి శ్రీ', en: 'Phalguni Sri', g: 'female', m: 'వసంత ఋతు శోభ మరియు శుభ ఫలములను ఇచ్చేది', cat: 'ప్రకృతి & తేజో ఆశ్రయం (Nature/Radiance)' },
  ],
  'ఢ': [
    { te: 'ధీరజ్ కుమార్ (ఢ/ధీ)', en: 'Dheeraj Kumar', g: 'male', m: 'అచంచలమైన ధైర్యం మరియు స్థైర్యం కలవాడు', cat: 'రాజస & విజయ ఆశ్రయం (Royal/Victory)' },
    { te: 'ధృతి లక్ష్మి', en: 'Dhriti Lakshmi', g: 'female', m: 'మనోనిబ్బరం మరియు ధైర్యలక్ష్మి', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
  ],
  'భే': [
    { te: 'భేరుండ నరసింహ', en: 'Bherunda Narasimha', g: 'male', m: 'అమిత శక్తిమంతుడైన గండభేరుండ నృసింహుడు', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'భైరవి శ్రీ (భే/భై)', en: 'Bhairavi Sri', g: 'female', m: 'శుభంకరియైన త్రిపుర భైరవీ మాత', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
  ],
  'భో': [
    { te: 'భోగేశ్వర రావు', en: 'Bhogeshwara Rao', g: 'male', m: 'సకల రాజభోగములను అనుగ్రహించే ఈశ్వరుడు', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'భోగలక్ష్మి', en: 'Bhogalakshmi', g: 'female', m: 'సుఖసంతోషాలను, ఐశ్వర్యాన్ని ఇచ్చే దేవి', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
  ],
  'జ': [
    { te: 'జగదీశ్వర రావు', en: 'Jagadeeshwara Rao', g: 'male', m: 'సమస్త జగత్తుకు అధిపతియైన పరమేశ్వరుడు', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'జయరామ కృష్ణ', en: 'Jayarama Krishna', g: 'male', m: 'విజయ రాముడు మరియు శ్రీకృష్ణుని తేజస్సు', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'జానకీ దేవి', en: 'Janaki Devi', g: 'female', m: 'జనక మహారాజు పుత్రికయైన సీతామహాసాధ్వి', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'జయలక్ష్మి', en: 'Jayalakshmi', g: 'female', m: 'నిత్య విజయాన్ని ప్రసాదించే లక్ష్మీదేవి', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
  ],
  'జి': [
    { te: 'జితేంద్ర నాథ్', en: 'Jitendra Nath', g: 'male', m: 'ఇంద్రియములను జయించిన తపోనిధి', cat: 'వేద & ఇతిహాస ఆశ్రయం (Vedic/Epic)' },
    { te: 'జిష్ణు తేజ్', en: 'Jishnu Tej', g: 'male', m: 'విజయశీలుడైన విష్ణువు / అర్జునుడు', cat: 'రాజస & విజయ ఆశ్రయం (Royal/Victory)' },
    { te: 'జిజ్ఞాస శ్రీ', en: 'Jignasa Sri', g: 'female', m: 'జ్ఞాన పిపాస కలిగిన సరస్వతీ స్వరూపిణి', cat: 'వేద & ఇతిహాస ఆశ్రయం (Vedic/Epic)' },
  ],
  'జు': [
    { te: 'జుగాల్ కిశోర్', en: 'Jugal Kishore', g: 'male', m: 'రాధాకృష్ణుల దివ్య యుగళ స్వరూపం', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'జుహీ లక్ష్మి', en: 'Juhi Lakshmi', g: 'female', m: 'మల్లెపువ్వు వంటి సువాసన మరియు స్వచ్ఛత', cat: 'ప్రకృతి & తేజో ఆశ్రయం (Nature/Radiance)' },
  ],
  'జే': [
    { te: 'జేత (జయదేవ్)', en: 'Jayadev', g: 'male', m: 'గీతగోవింద కవి, సదా విజయం సాధించేవాడు', cat: 'రాజస & విజయ ఆశ్రయం (Royal/Victory)' },
    { te: 'జేష్ఠా లక్ష్మి', en: 'Jyeshtha Lakshmi', g: 'female', m: 'శ్రేష్ఠమైన మరియు పెద్దదైన ఐశ్వర్య శక్తి', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
  ],
  'జో': [
    { te: 'జోగేశ్వర రావు', en: 'Jogeshwara Rao', g: 'male', m: 'యోగ సిద్ధులను ప్రసాదించే శివుడు', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'జ్యోత్స్న ప్రియ (జో/జ్యో)', en: 'Jyothsna Priya', g: 'female', m: 'పండు వెన్నెల కాంతి వంటి నిర్మలమైనది', cat: 'ప్రకృతి & తేజో ఆశ్రయం (Nature/Radiance)' },
    { te: 'జ్యోతిర్మయి', en: 'Jyothirmayi', g: 'female', m: 'దివ్య జ్యోతి స్వరూపిణియైన పరాశక్తి', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
  ],
  'గా': [
    { te: 'గణేశ్వర రావు', en: 'Ganeshwara Rao', g: 'male', m: 'సకల విఘ్నములను తొలగించే గణపతి', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'గాయత్రీ దేవి', en: 'Gayatri Devi', g: 'female', m: 'వేదమాతయైన శ్రీ గాయత్రీ మహాదేవి', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'గార్గి శ్రీ', en: 'Gargi Sri', g: 'female', m: 'ఉపనిషత్ కాలపు బ్రహ్మవాదిని మహర్షిణి', cat: 'వేద & ఇతిహాస ఆశ్రయం (Vedic/Epic)' },
  ],
  'గి': [
    { te: 'గిరిధర్ గోపాల్', en: 'Giridhar Gopal', g: 'male', m: 'గోవర్ధన గిరిని ఎత్తిన శ్రీకృష్ణ పరమాత్మ', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'గిరీశ్ చంద్ర', en: 'Girish Chandra', g: 'male', m: 'కైలాస గిరికి అధిపతియైన పరమశివుడు', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'గిరిజా కళ్యాణి', en: 'Girija Kalyani', g: 'female', m: 'హిమవంతుని పుత్రికయైన పార్వతీ దేవి', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
  ],
  'గు': [
    { te: 'గురుదత్త సాయి', en: 'Gurudatta Sai', g: 'male', m: 'త్రిమూర్తి స్వరూపుడైన శ్రీ దత్తాత్రేయ స్వామి', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'గుణశేఖర్', en: 'Gunashekhar', g: 'male', m: 'సద్గుణములకు శిఖరం వంటివాడు', cat: 'రాజస & విజయ ఆశ్రయం (Royal/Victory)' },
    { te: 'గుణవతి శ్రీ', en: 'Gunavathi Sri', g: 'female', m: 'ఉత్తమ శీలము మరియు సుగుణములు కలది', cat: 'వేద & ఇతిహాస ఆశ్రయం (Vedic/Epic)' },
  ],
  'గే': [
    { te: 'గీతానంద్ (గే/గీ)', en: 'Geethanand', g: 'male', m: 'భగవద్గీతా జ్ఞానానందం కలవాడు', cat: 'వేద & ఇతిహాస ఆశ్రయం (Vedic/Epic)' },
    { te: 'గీతాంజలి', en: 'Geethanjali', g: 'female', m: 'భగవంతునికి అర్పించే భక్తి గీత మాలిక', cat: 'వేద & ఇతిహాస ఆశ్రయం (Vedic/Epic)' },
  ],
  'గో': [
    { te: 'గోవింద రాజు', en: 'Govinda Raju', g: 'male', m: 'గోవులను, భూమిని రక్షించే తిరుపతి గోవిందుడు', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'గోపాల కృష్ణ', en: 'Gopala Krishna', g: 'male', m: 'బృందావన గోపాలుడైన శ్రీకృష్ణుడు', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'గోదాదేవి', en: 'Goda Devi', g: 'female', m: 'శ్రీరంగనాథుని వరించిన ఆండాళ్ తల్లి', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'గోమతి శ్రీ', en: 'Gomathi Sri', g: 'female', m: 'పవిత్ర గోమతీ నదీ స్వరూపిణి', cat: 'ప్రకృతి & తేజో ఆశ్రయం (Nature/Radiance)' },
  ],
  'స': [
    { te: 'సత్యనారాయణ మూర్తి', en: 'Satyanarayana Murthy', g: 'male', m: 'అన్నవరం రత్నగిరి శ్రీ సత్యదేవుడు', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'సాకేత్ రామ్', en: 'Saketh Ram', g: 'male', m: 'అయోధ్యాపురి అధిపతియైన శ్రీరాముడు', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'సరస్వతీ దేవి', en: 'Saraswathi Devi', g: 'female', m: 'సకల విద్యలకు అధిదేవతయైన శారదా మాత', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'సాహితి శ్రీ', en: 'Sahithi Sri', g: 'female', m: 'సాహిత్య సౌరభం మరియు విజ్ఞాన కళ', cat: 'వేద & ఇతిహాస ఆశ్రయం (Vedic/Epic)' },
  ],
  'సి': [
    { te: 'సిద్ధార్థ గౌతమ్', en: 'Siddhartha Gautham', g: 'male', m: 'సకల లక్ష్యములను సిద్ధించుకున్న జ్ఞాని', cat: 'వేద & ఇతిహాస ఆశ్రయం (Vedic/Epic)' },
    { te: 'సింహాద్రి అప్పన్న', en: 'Simhadri Appanna', g: 'male', m: 'సింహాచల వరాహ లక్ష్మీనరసింహ స్వామి', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'సింధుజ లక్ష్మి', en: 'Sindhuja Lakshmi', g: 'female', m: 'పాలసముద్రం నుండి జన్మించిన శ్రీ మహాలక్ష్మి', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'సిరివెన్నెల', en: 'Sirivennela', g: 'female', m: 'సంపదల వెన్నెల కురిపించే శుభకరి', cat: 'ప్రకృతి & తేజో ఆశ్రయం (Nature/Radiance)' },
  ],
  'సు': [
    { te: 'సుదర్శన చక్రవర్తి', en: 'Sudarshana Chakravarthy', g: 'male', m: 'శ్రీమహావిష్ణువు సుదర్శన ఆయుధ తేజస్సు', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'సుబ్రహ్మణ్యేశ్వర', en: 'Subrahmanyeshwara', g: 'male', m: 'జ్ఞానశక్తి స్వరూపుడైన కుమారస్వామి', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'సుహాసిని దేవి', en: 'Suhasini Devi', g: 'female', m: 'చిరునవ్వుతో ఆశీర్వదించే లలితా దేవి', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'సుమేధా శ్రీ', en: 'Sumedha Sri', g: 'female', m: 'ఉత్తమ ప్రజ్ఞ మరియు నిర్మల బుద్ధి కలది', cat: 'వేద & ఇతిహాస ఆశ్రయం (Vedic/Epic)' },
  ],
  'సే': [
    { te: 'సేతుమాధవ రావు', en: 'Sethumadhava Rao', g: 'male', m: 'రామేశ్వర సేతువు వద్ద పూజింపబడే మాధవుడు', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'సేనాని కార్తిక్', en: 'Senani Karthik', g: 'male', m: 'దేవతా సైన్యాధ్యక్షుడైన సుబ్రహ్మణ్యుడు', cat: 'రాజస & విజయ ఆశ్రయం (Royal/Victory)' },
    { te: 'సేవంతిక శ్రీ', en: 'Sevanthika Sri', g: 'female', m: 'బంగారు చామంతి పుష్పం వంటి శోభ కలది', cat: 'ప్రకృతి & తేజో ఆశ్రయం (Nature/Radiance)' },
  ],
  'సో': [
    { te: 'సోమశేఖర రావు', en: 'Somashekhara Rao', g: 'male', m: 'చంద్రుని శిరస్సున ధరించిన పరమశివుడు', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'సోమనాథ్', en: 'Somanath', g: 'male', m: 'ద్వాదశ జ్యోతిర్లింగాలలో మొదటివాడైన సోమేశ్వరుడు', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'సౌందర్య లహరి (సో/సౌ)', en: 'Soundarya Lahari', g: 'female', m: 'ఆదిశంకరులు స్తుతించిన జగన్మాత సౌందర్య ప్రవాహం', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
  ],
  'ద': [
    { te: 'దత్తాత్రేయ శర్మ', en: 'Dattatreya Sharma', g: 'male', m: 'అత్రి-అనసూయల పుత్రుడైన గురు దత్తాత్రేయుడు', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'దయానంద్ రామ్', en: 'Dayanand Ram', g: 'male', m: 'కరుణ మరియు ఆనంద స్వరూపుడు', cat: 'వేద & ఇతిహాస ఆశ్రయం (Vedic/Epic)' },
    { te: 'దమయంతి దేవి', en: 'Damayanthi Devi', g: 'female', m: 'నలమహారాజు పట్టమహిషి, పతిव्रతా శిరోమణి', cat: 'వేద & ఇతిహాస ఆశ్రయం (Vedic/Epic)' },
  ],
  'ది': [
    { te: 'దిలీప్ చక్రవర్తి', en: 'Dileep Chakravarthy', g: 'male', m: 'రఘువంశ మూలపురుషుడైన ధర్మ చక్రవర్తి', cat: 'రాజస & విజయ ఆశ్రయం (Royal/Victory)' },
    { te: 'దివ్యతేజ', en: 'Divyateja', g: 'male', m: 'దేవతా కాంతి మరియు తేజస్సు కలవాడు', cat: 'ప్రకృతి & తేజో ఆశ్రయం (Nature/Radiance)' },
    { te: 'దివ్యవాణి', en: 'Divyavani', g: 'female', m: 'సరస్వతీ దేవి దివ్య వీణా నాదం', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'దీపికా లక్ష్మి', en: 'Deepika Lakshmi', g: 'female', m: 'జ్ఞాన దీపికయైన మహాలక్ష్మి', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
  ],
  'దు': [
    { te: 'దుష్యంత్ వర్మ', en: 'Dushyanth Varma', g: 'male', m: 'భరత చక్రవర్తి తండ్రియైన పరాక్రమ రాజు', cat: 'రాజస & విజయ ఆశ్రయం (Royal/Victory)' },
    { te: 'దుర్గామల్లేశ్వర', en: 'Durgamalleshwara', g: 'male', m: 'విజయవాడ కనకదుర్గా మల్లేశ్వర స్వామి', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'దుర్గాదేవి', en: 'Durga Devi', g: 'female', m: 'దుర్గతులను నాశనం చేసే ఆదిపరాశక్తి', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
  ],
  'థ': [
    { te: 'థామేశ్వర (థ/త)', en: 'Thameshwara', g: 'male', m: 'పరమ పవిత్రమైన జ్యోతి స్వరూపుడు', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'తన్విక శ్రీ', en: 'Tanvika Sri', g: 'female', m: 'సున్నితమైన మరియు లావణ్యమైన దేవతా మూర్తి', cat: 'ప్రకృతి & తేజో ఆశ్రయం (Nature/Radiance)' },
  ],
  'ఝ': [
    { te: 'ఝాన్సీ రామ్', en: 'Jhansi Ram', g: 'male', m: 'వీరత్వం మరియు ధర్మరక్షణ కలవాడు', cat: 'రాజస & విజయ ఆశ్రయం (Royal/Victory)' },
    { te: 'ఝాన్సీ లక్ష్మి', en: 'Jhansi Lakshmi', g: 'female', m: 'ధైర్యలక్ష్మి మరియు వీర వనిత', cat: 'రాజస & విజయ ఆశ్రయం (Royal/Victory)' },
    { te: 'ఝరిణి శ్రీ', en: 'Jharini Sri', g: 'female', m: 'నిరంతరం ప్రవహించే అమృత సెలయేరు', cat: 'ప్రకృతి & తేజో ఆశ్రయం (Nature/Radiance)' },
  ],
  'దే': [
    { te: 'దేవव्रత్ భీష్మ', en: 'Devavrat Bhishma', g: 'male', m: 'సత్యప్రతిజ్ఞకు కట్టుబడిన గంగాపుత్రుడు', cat: 'వేద & ఇతిహాస ఆశ్రయం (Vedic/Epic)' },
    { te: 'దేవకీ నందన్', en: 'Devaki Nandan', g: 'male', m: 'దేవకీ వసుదేవుల పుత్రుడైన శ్రీకృష్ణుడు', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'దేవసేన దేవి', en: 'Devasena Devi', g: 'female', m: 'సుబ్రహ్మణ్య స్వామి దేవేరి, ఇంద్రపుత్రిక', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'దేవికా రాణి', en: 'Devika Rani', g: 'female', m: 'దేవతా కళ కలిగిన రాజకుమారి', cat: 'రాజస & విజయ ఆశ్రయం (Royal/Victory)' },
  ],
  'దో': [
    { te: 'దోషిత్ రామ్', en: 'Doshit Ram', g: 'male', m: 'దోషరహితుడైన పుణ్య పురుషుడు', cat: 'వేద & ఇతిహాస ఆశ్రయం (Vedic/Epic)' },
    { te: 'దోలిక శ్రీ', en: 'Dolika Sri', g: 'female', m: 'ఉయ్యాల వలె ఆనందాన్ని ఇచ్చే లక్ష్మి', cat: 'ప్రకృతి & తేజో ఆశ్రయం (Nature/Radiance)' },
  ],
  'చా': [
    { te: 'చాణక్య తేజ్', en: 'Chanakya Tej', g: 'male', m: 'అర్థశాస్త్ర ప్రణీత కౌటిల్యుని వంటి మేధావి', cat: 'వేద & ఇతిహాస ఆశ్రయం (Vedic/Epic)' },
    { te: 'చరణ్ తేజ్', en: 'Charan Tej', g: 'male', m: 'శ్రీహరి పాదపద్మముల తేజస్సు కలవాడు', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'చారులత', en: 'Charulatha', g: 'female', m: 'అందమైన మరియు మనోహరమైన తీగ', cat: 'ప్రకృతి & తేజో ఆశ్రయం (Nature/Radiance)' },
    { te: 'చాందిని శ్రీ', en: 'Chandini Sri', g: 'female', m: 'చల్లని వెన్నెల కాంతి కలిగిన లక్ష్మి', cat: 'ప్రకృతి & తేజో ఆశ్రయం (Nature/Radiance)' },
  ],
  'చి': [
    { te: 'చిరంజీవి రామ్', en: 'Chiranjeevi Ram', g: 'male', m: 'దీర్ఘాయుష్మంతుడు మరియు ఆంజనేయ-రామ కృప కలవాడు', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'చిన్మయానంద్', en: 'Chinmayanand', g: 'male', m: 'శుద్ధ చైతన్య జ్ఞానానంద స్వరూపుడు', cat: 'వేద & ఇతిహాస ఆశ్రయం (Vedic/Epic)' },
    { te: 'చిన్మయి శ్రీ', en: 'Chinmayi Sri', g: 'female', m: 'పరబ్రహ్మ జ్ఞాన చైతన్య స్వరూపిణి', cat: 'దేవతా ఆశ్రయం (Divine/Deity)' },
    { te: 'చిత్రలేఖ', en: 'Chitralekha', g: 'female', m: 'చిత్రకళా సౌందర్యం కలిగిన దేవకన్య', cat: 'ప్రకృతి & తేజో ఆశ్రయం (Nature/Radiance)' },
  ],
};

// Chaldean Numerology Letter Map
const CHALDEAN_MAP: Record<string, number> = {
  A: 1, I: 1, J: 1, Q: 1, Y: 1,
  B: 2, K: 2, R: 2,
  C: 3, G: 3, L: 3, S: 3,
  D: 4, M: 4, T: 4,
  E: 5, H: 5, N: 5, X: 5,
  U: 6, V: 6, W: 6,
  O: 7, Z: 7,
  F: 8, P: 8,
};

function computeChaldeanNumber(nameEn: string): { total: number; single: number } {
  const upper = nameEn.toUpperCase().replace(/[^A-Z]/g, '');
  let sum = 0;
  for (const ch of upper) {
    sum += CHALDEAN_MAP[ch] ?? 1;
  }
  if (sum === 0) sum = 1;
  let single = sum;
  while (single > 9) {
    single = String(single)
      .split('')
      .reduce((acc, d) => acc + Number(d), 0);
  }
  return { total: sum, single };
}

function reduceToSingleDigit(num: number): number {
  let n = Math.abs(num);
  while (n > 9) {
    n = String(n)
      .split('')
      .reduce((acc, d) => acc + Number(d), 0);
  }
  return n || 1;
}

const NUMBER_RULER_TE: Record<number, string> = {
  1: 'సూర్యుడు (రవి — నాయకత్వం, తేజస్సు, రాజయోగం)',
  2: 'చంద్రుడు (సోముడు — మనోబలం, కళలు, మృదుత్వం)',
  3: 'దేవగురువు బృహస్పతి (జ్ఞానం, ధర్మం, ఉన్నత పదవులు)',
  4: 'రాహువు (సాంకేతికత, వినూత్న ఆలోచనలు, విదేశీ యోగం)',
  5: 'బుధుడు (వ్యాపార దక్షత, వాక్చాతుర్యం, మేధస్సు)',
  6: 'శుక్రుడు (సంపద, ఆకర్షణ, కళావైభవం, లక్ష్మీ కటాక్షం)',
  7: 'కేతువు (ఆధ్యాత్మికత, పరిశోధన, అంతర్దృష్టి)',
  8: 'శని భగవానుడు (న్యాయం, పట్టుదల, స్థిరాస్తులు)',
  9: 'కుజుడు (ధైర్యం, పరాక్రమం, కార్యసాధన)',
};

const FRIENDLY_NUMBERS: Record<number, number[]> = {
  1: [1, 2, 3, 5, 9],
  2: [1, 2, 3, 5, 6],
  3: [1, 2, 3, 5, 9],
  4: [1, 5, 6, 7],
  5: [1, 3, 5, 6],
  6: [3, 5, 6, 9],
  7: [1, 2, 5, 6],
  8: [5, 6, 3],
  9: [1, 2, 3, 6, 9],
};

function countTeluguSyllables(nameTe: string): number {
  const clean = nameTe.replace(/\s+/g, '');
  // Count base consonants/vowels excluding virama and vowel signs
  let count = 0;
  for (let i = 0; i < clean.length; i++) {
    const code = clean.charCodeAt(i);
    // Independent vowels (0C05-0C14) or Consonants (0C15-0C39)
    if ((code >= 0x0c05 && code <= 0x0c14) || (code >= 0x0c15 && code <= 0x0c39)) {
      // Check if followed by virama (0x0C4D)
      const nextCode = clean.charCodeAt(i + 1);
      if (nextCode !== 0x0c4d) {
        count++;
      }
    }
  }
  return Math.max(2, count);
}

export function generateNamakaranaReport(
  chart: CompleteChartResult,
  gender: 'male' | 'female' = 'male'
): NamakaranaReport {
  const moon = chart.planets.find((p) => p.id === 'Moon') ?? chart.planets[1];
  const moonLon = ((moon.siderealLon % 360) + 360) % 360;

  const nakSpan = 360 / 27; // 13.3333°
  const padaSpan = nakSpan / 4; // 3.3333°
  const nakIndex = Math.min(26, Math.floor(moonLon / nakSpan));
  const pada = Math.min(4, Math.floor((moonLon % nakSpan) / padaSpan) + 1);
  const rasiIndex = Math.min(11, Math.floor(moonLon / 30));
  const lagnaIndex = Math.min(11, Math.floor(((chart.ascendant.siderealLon % 360) + 360) % 360 / 30));

  const nakMeta = TELUGU_NAKSHATRAS[nakIndex];
  const rasiMeta = TELUGU_RASIS[rasiIndex];
  const lagnaMeta = TELUGU_RASIS[lagnaIndex];
  const deityMeta = NAKSHATRA_DEITY_DETAILS[nakIndex];
  const enSyllables = NAKSHATRA_SYLLABLES_EN[nakIndex];

  const exactPadaSyllableTe = nakMeta.padasTe[pada - 1];
  const exactPadaSyllableEn = enSyllables[pada - 1];

  const allFourPadaSyllables = [1, 2, 3, 4].map((pNum) => ({
    pada: pNum,
    syllableTe: nakMeta.padasTe[pNum - 1],
    syllableEn: enSyllables[pNum - 1],
    isBirthPada: pNum === pada,
  }));

  // Collect all syllables belonging to the Janma Rasi
  // Each Rasi spans 2.25 Nakshatras (9 Padas)
  const startTotalPada = rasiIndex * 9; // 0-indexed out of 108
  const rasiAllSyllablesTe: string[] = [];
  for (let pOffset = 0; pOffset < 9; pOffset++) {
    const absPada = startTotalPada + pOffset;
    const nIdx = Math.floor(absPada / 4);
    const pIdx = absPada % 4;
    const syl = TELUGU_NAKSHATRAS[nIdx]?.padasTe[pIdx];
    if (syl && !rasiAllSyllablesTe.includes(syl)) {
      rasiAllSyllablesTe.push(syl);
    }
  }

  // Secondary Lucky Rasi (5th or 9th Kona Rasi from Janma Rasi or Lagna Rasi)
  const fifthRasiIdx = (rasiIndex + 4) % 12;
  const secondaryLuckyRasiNameTe = TELUGU_RASIS[fifthRasiIdx].nameTe;
  const secondaryLuckySyllablesTe: string[] = [];
  for (let pOffset = 0; pOffset < 9; pOffset++) {
    const absPada = fifthRasiIdx * 9 + pOffset;
    const nIdx = Math.floor(absPada / 4);
    const pIdx = absPada % 4;
    const syl = TELUGU_NAKSHATRAS[nIdx]?.padasTe[pIdx];
    if (syl && !secondaryLuckySyllablesTe.includes(syl)) {
      secondaryLuckySyllablesTe.push(syl);
    }
  }

  // DOB Numerology (Mulank & Bhagyank)
  const [yStr, mStr, dStr] = chart.input.date.split('-');
  const dayNum = Number(dStr) || 1;
  const monthNum = Number(mStr) || 1;
  const yearNum = Number(yStr) || 2026;
  const mulankNumber = reduceToSingleDigit(dayNum);
  const bhagyankNumber = reduceToSingleDigit(dayNum + monthNum + yearNum);

  const luckySet = new Set<number>([
    ...(FRIENDLY_NUMBERS[mulankNumber] ?? [1, 3, 5, 6]),
    ...(FRIENDLY_NUMBERS[bhagyankNumber] ?? [1, 3, 5, 6]),
  ]);
  const luckyNameNumbers = Array.from(luckySet).sort((a, b) => a - b);
  const avoidNameNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((n) => !luckySet.has(n));

  // Build Curated Suggested Names list
  const suggestedNames: BabyNameSuggestion[] = [];

  // 1. Names from all 4 Padas of the birth Nakshatra (prioritizing exact birth pada first)
  const orderedSyllables = [
    { sylTe: exactPadaSyllableTe, sylEn: exactPadaSyllableEn, isExact: true, isNak: true },
    ...allFourPadaSyllables
      .filter((s) => !s.isBirthPada)
      .map((s) => ({ sylTe: s.syllableTe, sylEn: s.syllableEn, isExact: false, isNak: true })),
    ...rasiAllSyllablesTe
      .filter((s) => !nakMeta.padasTe.includes(s))
      .map((s) => ({ sylTe: s, sylEn: s, isExact: false, isNak: false })),
  ];

  for (const item of orderedSyllables) {
    const seeds = SYLLABLE_NAMES_DB[item.sylTe] ?? [];
    for (const seed of seeds) {
      const chaldean = computeChaldeanNumber(seed.en);
      suggestedNames.push({
        nameTe: seed.te,
        nameEn: seed.en,
        syllableTe: item.sylTe,
        syllableEn: item.sylEn,
        gender: seed.g,
        meaningTe: seed.m,
        ashrayaCategoryTe: seed.cat,
        aksharaCount: countTeluguSyllables(seed.te),
        numerologyNumber: chaldean.single,
        isExactPadaMatch: item.isExact,
        isNakshatraMatch: item.isNak,
      });
    }
  }

  // 6 Classical Ashraya Pillars
  const ashrayaPillars: NamingAshrayaPillar[] = [
    {
      id: 'nakshatra_pada_ashraya',
      titleTe: '1. జన్మ నక్షత్ర & పాద అక్షర ఆశ్రయం (Chudamani / Avakahada Chakra Ashraya)',
      subtitleEn: 'Primary Birth Star & Pada Phonetic Vibration',
      sanskritRuleTe: 'నక్షత్ర పాదాక్షర సంప్రయుక్తం నామ ప్రశస్తం సకలార్థ సిద్ధ్యై ||',
      explanationTe: `శిశువు జన్మించిన సమయానికి చంద్రుడు ${nakMeta.nameTe} (${pada}వ పాదం) లో సంచరిస్తున్నాడు. చూడామణి చక్రం ప్రకారం ఈ పాదానికి నిర్దేశించిన మూల బీజాక్షరం "${exactPadaSyllableTe}" (${exactPadaSyllableEn}). ఈ అక్షరంతో పేరు ప్రారంభించడం వల్ల చంద్ర బలం, మనోవికాసం మరియు ఆయురారోగ్యాలు వర్ధిల్లుతాయి.`,
      specificRecommendationTe: `ప్రధాన అక్షరం: "${exactPadaSyllableTe}" (${exactPadaSyllableEn}) · ఇతర పాద అక్షరాలు: ${nakMeta.padasTe.join(', ')}`,
      examplesTe: suggestedNames
        .filter((n) => n.gender === gender && n.isExactPadaMatch)
        .map((n) => `${n.nameTe} (${n.nameEn})`),
    },
    {
      id: 'devata_ashraya',
      titleTe: '2. నక్షత్ర అధిదేవత & ఇష్టదేవతా ఆశ్రయం (Presiding Deity Ashraya)',
      subtitleEn: 'Divine Protection & Nakshatra Devata Alignment',
      sanskritRuleTe: 'దేవతా నామ సంయుక్తం ఆయుర్వర్ధనముత్తమమ్ || (ఆశ్వలాయన గృహ్యసూత్రం)',
      explanationTe: `${nakMeta.nameTe} నక్షత్రానికి అధిదేవత "${deityMeta.deityTe}". ఈ దేవతా తత్వానికి చెందిన పేర్లు లేదా మహావిష్ణువు, లలితాదేవి, శివుడు, శ్రీరాముడు, శ్రీకృష్ణుడు, మహాలక్ష్మి, సరస్వతీ సహస్రనామాలలోని పేర్లు పెట్టడం వల్ల శిశువుకు జీవితాంతం దైవ రక్షణ కవచంలా నిలుస్తుంది.`,
      specificRecommendationTe:
        gender === 'male' ? deityMeta.boyAshrayaThemesTe : deityMeta.girlAshrayaThemesTe,
      examplesTe: suggestedNames
        .filter((n) => n.gender === gender && n.ashrayaCategoryTe === 'దేవతా ఆశ్రయం (Divine/Deity)')
        .slice(0, 4)
        .map((n) => `${n.nameTe}`),
    },
    {
      id: 'rasi_lagna_lord_ashraya',
      titleTe: '3. రాశ్యాధిపతి & లగ్నాధిపతి గ్రహ బల ఆశ్రయం (Planetary Lord Ashraya)',
      subtitleEn: 'Strengthening Moon Sign & Ascendant Lords',
      sanskritRuleTe: 'రాశీశ లగ్నేశ బలానుకూలం నామ ప్రదద్యాత్ శుభకీర్తి వృద్ధ్యై ||',
      explanationTe: `శిశువు జన్మ రాశి "${rasiMeta.nameTe}" (అధిపతి: ${rasiMeta.lordTe}), జన్మ లగ్నం "${lagnaMeta.nameTe}" (అధిపతి: ${lagnaMeta.lordTe}) మరియు నక్షత్రాధిపతి "${nakMeta.lordTe}". జన్మ రాశిలోని 9 పాదాల అక్షరాలు (${rasiAllSyllablesTe.join(', ')}) లేదా త్రికోణ రాశి (${secondaryLuckyRasiNameTe}) అక్షరాలతో వ్యవహార నామం పెట్టడం వల్ల భాగ్య వృద్ధి కలుగుతుంది.`,
      specificRecommendationTe: `రాశి అక్షరాలు: ${rasiAllSyllablesTe.join(', ')} · పంచమ కోణ రాశి (${secondaryLuckyRasiNameTe}): ${secondaryLuckySyllablesTe.slice(0, 5).join(', ')}`,
      examplesTe: suggestedNames
        .filter((n) => n.gender === gender)
        .slice(0, 4)
        .map((n) => `${n.nameTe}`),
    },
    {
      id: 'gender_phonetic_ashraya',
      titleTe:
        gender === 'male'
          ? '4. పురుష (అబ్బాయి) శాస్త్రీయ అక్షర సంఖ్య & ధ్వని నియమం (Boy Phonetic Rule)'
          : '4. స్త్రీ (అమ్మాయి) శాస్త్రీయ అక్షర సంఖ్య & దీర్ఘాంత నియమం (Girl Phonetic Rule)',
      subtitleEn: 'Grihya Sutra & Muhurta Chintamani Syllable Architecture',
      sanskritRuleTe:
        gender === 'male'
          ? 'సమాక్షరం చ పుంసాం స్యాత్ ఘోషవద్వ్యంజనాన్వితమ్ || (మగపిల్లలకు 2 లేదా 4 సమ అక్షరాలు శ్రేష్ఠం)'
          : 'అయుగ్మాక్షరమాకారాన్తం స్త్రీణాం మంగళవర్ధనమ్ || (ఆడపిల్లలకు 3 లేదా 5 అక్షరాలు, ఆ/ఈ దీర్ఘాంతం శ్రేష్ఠం)',
      explanationTe:
        gender === 'male'
          ? 'గృహ్యసూత్రాల ప్రకారం మగపిల్లలకు (అబ్బాయికి) 2 లేదా 4 అక్షరాలు (సమ సంఖ్య) ఉండేలా, పలికేటప్పుడు గంభీరంగా, తేజస్సు-పరాక్రమం-విజయాన్ని స్ఫురింపజేసేలా పేరు ఉండాలి. చివరన విసర్గ లేదా పూర్ణ వ్యంజన ధ్వని ఉండటం రాజయోగాన్ని ఇస్తుంది.'
          : 'గృహ్యసూత్రాలు మరియు ముహూర్త చింతామణి ప్రకారం ఆడపిల్లలకు (అమ్మాయికి) 3 లేదా 5 అక్షరాలు (బేసి సంఖ్య) ఉండేలా, వినడానికి మధురంగా, లలితంగా మరియు పేరు చివర దీర్ఘాక్షరం ("ఆ" లేదా "ఈ" స్వరం — ఉదా: లక్ష్మి, వాణి, దేవి, శ్రీ, రాధిక, గాయత్రి) ఉండేలా పెట్టాలి. ఇది అఖండ సౌభాగ్యాన్ని ఇస్తుంది.',
      specificRecommendationTe:
        gender === 'male'
          ? 'అబ్బాయికి సిఫార్సు: 2 లేదా 4 అక్షరాల గంభీర సంస్కృత/తెలుగు నామం + చివరన రామ్ / తేజ్ / కృష్ణ / వర్మ / రావు / ఈశ్వర్.'
          : 'అమ్మాయికి సిఫార్సు: 3 లేదా 5 అక్షరాల మధుర నామం + చివరన శ్రీ / దేవి / లక్ష్మి / ప్రియ / వాణి / మయి.',
      examplesTe: suggestedNames
        .filter((n) => n.gender === gender)
        .slice(0, 3)
        .map((n) => `${n.nameTe} (${n.aksharaCount} అక్షరాలు)`),
    },
    {
      id: 'tattva_nature_ashraya',
      titleTe: `5. పంచభూత తత్వ & గణ స్వభావ ఆశ్రయం (${rasiMeta.tattvamTe} · ${nakMeta.ganaTe})`,
      subtitleEn: 'Elemental Harmony & Meaning Vibration',
      sanskritRuleTe: 'తత్త్వానుకూల సదర్థం నామ కుర్యాద్ విచక్షణః ||',
      explanationTe: `ఈ జాతకుడి జన్మ రాశి "${rasiMeta.tattvamTe}" (${rasiMeta.swabhavamTe}) మరియు నక్షత్ర గణం "${nakMeta.ganaTe}". కాబట్టి పేరుకు అర్థం లేని ఆధునిక పదాల కంటే, సూర్య-చంద్రుల తేజస్సు, జ్ఞానం, ప్రకృతి సౌందర్యం, ధర్మం మరియు విజయాన్ని సూచించే సార్థకమైన అర్థం ఉండేలా ఎంచుకోవాలి.`,
      specificRecommendationTe: `${rasiMeta.tattvamTe} + ${nakMeta.ganaTe} సమన్వయంతో కూడిన సార్థక నామాలు.`,
      examplesTe: suggestedNames
        .filter(
          (n) =>
            n.gender === gender &&
            (n.ashrayaCategoryTe === 'ప్రకృతి & తేజో ఆశ్రయం (Nature/Radiance)' ||
              n.ashrayaCategoryTe === 'రాజస & విజయ ఆశ్రయం (Royal/Victory)')
        )
        .slice(0, 3)
        .map((n) => `${n.nameTe}`),
    },
    {
      id: 'numerology_sankhya_ashraya',
      titleTe: '6. నామ సంఖ్యాశాస్త్ర సమన్వయ ఆశ్రయం (Vedic & Chaldean Numerology Harmony)',
      subtitleEn: 'Birth Date (Mulank) & Destiny (Bhagyank) Name Resonance',
      sanskritRuleTe: 'జన్మసంఖ్యానుకూలేన నామసంఖ్యా శుభావహా ||',
      explanationTe: `పుట్టిన తేదీ (${chart.input.date}) ప్రకారం శిశువు జన్మ సంఖ్య (మూలాంకం): ${mulankNumber} (${NUMBER_RULER_TE[mulankNumber]}) మరియు పూర్తి తేదీ భాగ్యాంకం: ${bhagyankNumber} (${NUMBER_RULER_TE[bhagyankNumber]}). ఆంగ్లంలో పేరు రాసినప్పుడు దాని అక్షరాల మొత్తం విలువ (Name Number) ${luckyNameNumbers.join(', ')} సంఖ్యలలో వచ్చేలా చూసుకుంటే ఆధునిక వ్యవహారాలలో అద్భుతమైన అదృష్టం కలిసివస్తుంది.`,
      specificRecommendationTe: `అనుకూల నామ సంఖ్యలు: ${luckyNameNumbers.join(', ')} · నివారించాల్సిన సంఖ్యలు: ${avoidNameNumbers.join(', ')}`,
      examplesTe: suggestedNames
        .filter((n) => n.gender === gender && luckyNameNumbers.includes(n.numerologyNumber))
        .slice(0, 3)
        .map((n) => `${n.nameEn} (సంఖ్య ${n.numerologyNumber})`),
    },
  ];

  return {
    gender,
    genderLabelTe: gender === 'male' ? 'పురుష శిశువు (అబ్బాయి / బాలుడు)' : 'స్త్రీ శిశువు (అమ్మాయి / బాలిక)',
    birthDate: chart.input.date,
    birthTime: chart.input.time,
    city: chart.input.city,
    moonLonSidereal: moonLon,
    nakshatraIndex: nakIndex,
    nakshatraNameTe: nakMeta.nameTe,
    nakshatraNameEn: nakMeta.nameEn,
    pada,
    rasiIndex,
    rasiNameTe: rasiMeta.nameTe,
    rasiLordTe: rasiMeta.lordTe,
    lagnaIndex,
    lagnaNameTe: lagnaMeta.nameTe,
    lagnaLordTe: lagnaMeta.lordTe,
    nakshatraLordTe: nakMeta.lordTe,
    nakshatraDeityTe: deityMeta.deityTe,
    ganamTe: nakMeta.ganaTe,
    yoniTe: nakMeta.yoniTe,
    nadiTe: nakMeta.nadiTe,
    tattvamTe: rasiMeta.tattvamTe,
    exactPadaSyllableTe,
    exactPadaSyllableEn,
    allFourPadaSyllables,
    rasiAllSyllablesTe,
    secondaryLuckyRasiNameTe,
    secondaryLuckySyllablesTe,
    mulankNumber,
    mulankPlanetTe: NUMBER_RULER_TE[mulankNumber],
    bhagyankNumber,
    bhagyankPlanetTe: NUMBER_RULER_TE[bhagyankNumber],
    luckyNameNumbers,
    avoidNameNumbers,
    ashrayaPillars,
    ceremonyDaysTe:
      'శాస్త్ర ప్రమాణం ప్రకారం శిశువు జన్మించిన 11వ రోజు, 12వ రోజు, 16వ రోజు, 21వ రోజు లేదా 3వ నెలలో శుభ తిథి (ద్వితీయ, తృతీయ, పంచమి, సప్తమి, దశమి, ఏకాదశి, త్రయోదశి) మరియు శుభ వారములలో నామకరణ మహోత్సవం జరిపించాలి.',
    sankalpamMantraTe: `ఓం అస్య శ్రీ ${rasiMeta.nameTe} రాశౌ, ${nakMeta.nameTe} నక్షత్రే, ${pada} పాదే జాతస్య ${
      gender === 'male' ? 'కుమారస్య' : 'కుమార్యాః'
    } ఆయురారోగ్య ఐశ్వర్యాభివృద్ధ్యర్థం శ్రీ ${deityMeta.deityTe} ప్రీత్యర్థం నామకరణ సంస్కారం కరిష్యే ||`,
    whisperEarProcedureTe: `తండ్రి లేదా మేనమామ తూర్పు దిక్కుగా తిరిగి, బియ్యం పోసిన వెండి/రాగి పళ్ళెంలో బంగారు ఉంగరంతో మొదట జన్మ నక్షత్ర నామాన్ని ("${exactPadaSyllableTe}" అక్షరంతో), ఆపై వ్యవహార నామాన్ని రాసి, శిశువు కుడి చెవిలో మూడుసార్లు మధురంగా పలకాలి.`,
    suggestedNames,
  };
}

/**
 * Validates any user-typed custom name against the baby's Nakshatra, Rasi, Gender Phonetics & Numerology
 */
export function validateCustomBabyName(
  customName: string,
  report: NamakaranaReport
): CustomNameValidationResult {
  const trimmed = customName.trim();
  const chaldean = computeChaldeanNumber(trimmed);
  const isNumerologyHarmonious = report.luckyNameNumbers.includes(chaldean.single);

  // Check if starts with exact pada syllable (Telugu or English)
  const upperEn = trimmed.toUpperCase();
  const matchesExactPada =
    trimmed.startsWith(report.exactPadaSyllableTe) ||
    upperEn.startsWith(report.exactPadaSyllableEn.toUpperCase());

  const matchesNakshatra =
    matchesExactPada ||
    report.allFourPadaSyllables.some(
      (s) =>
        trimmed.startsWith(s.syllableTe) ||
        upperEn.startsWith(s.syllableEn.toUpperCase())
    );

  const matchesRasi =
    matchesNakshatra ||
    report.rasiAllSyllablesTe.some((s) => trimmed.startsWith(s));

  const syllableCountEstimate = /[\u0C00-\u0C7F]/.test(trimmed)
    ? countTeluguSyllables(trimmed)
    : Math.max(2, (trimmed.match(/[aeiouy]+/gi) || []).length);

  const isGenderPhoneticIdeal =
    report.gender === 'male'
      ? syllableCountEstimate % 2 === 0
      : syllableCountEstimate % 2 === 1 || /[aie]$/i.test(trimmed) || /[ాిీశ్రీ]$/.test(trimmed);

  let score = 45;
  const feedback: string[] = [];

  if (matchesExactPada) {
    score += 35;
    feedback.push(
      `✅ జన్మ నక్షత్ర పాద అక్షరం (${report.exactPadaSyllableTe} / ${report.exactPadaSyllableEn}) తో100% సరిపోయింది — అత్యుత్తమ తారాబలం!`
    );
  } else if (matchesNakshatra) {
    score += 28;
    feedback.push(
      `✅ జన్మ నక్షత్రం (${report.nakshatraNameTe}) లోని అక్షరంతో సరిపోయింది — శుభప్రదం.`
    );
  } else if (matchesRasi) {
    score += 20;
    feedback.push(
      `✅ జన్మ రాశి (${report.rasiNameTe}) అక్షర శ్రేణితో సరిపోయింది — వ్యవహార నామానికి అనుకూలం.`
    );
  } else {
    feedback.push(
      `ℹ️ ఇది జన్మ నక్షత్ర అక్షరం (${report.exactPadaSyllableTe}) తో ప్రారంభం కాలేదు. దీనిని వ్యవహార నామంగా ఉంచుకుని, సంకల్పానికి "${report.exactPadaSyllableTe}" అక్షరంతో జన్మనామం జతచేయండి.`
    );
  }

  if (isNumerologyHarmonious) {
    score += 12;
    feedback.push(
      `✅ సంఖ్యాశాస్త్రం: ఈ పేరు సంఖ్య ${chaldean.single} (మొత్తం ${chaldean.total}) శిశువు జన్మ సంఖ్య (${report.mulankNumber}) & భాగ్యాంకం (${report.bhagyankNumber}) తో సంపూర్ణ మిత్రత్వం కలిగి ఉంది.`
    );
  } else {
    score += 4;
    feedback.push(
      `⚠️ సంఖ్యాశాస్త్రం: ఈ పేరు సంఖ్య ${chaldean.single}. అనుకూల సంఖ్యలు (${report.luckyNameNumbers.join(', ')}) రావడానికి స్పెల్లింగ్‌లో ఒక అక్షరం సవరించుకోవచ్చు.`
    );
  }

  if (isGenderPhoneticIdeal) {
    score += 8;
    feedback.push(
      `✅ గృహ్యసూత్ర ధ్వని నియమం: ${report.genderLabelTe} కు తగిన అక్షర లయ (${syllableCountEstimate} అక్షరాలు) కలిగి ఉంది.`
    );
  }

  score = Math.min(100, score);

  const verdictTitleTe =
    score >= 88
      ? 'అత్యుత్తమ రాజయోగ నామం (Supreme Shastra & Numerology Match)'
      : score >= 72
        ? 'శుభప్రదమైన వ్యవహార నామం (Auspicious & Harmonious Name)'
        : 'మధ్యమ సమన్వయం — జన్మనామంతో కలిపి వాడుకోవచ్చు';

  return {
    inputName: trimmed,
    scoreOutOf100: score,
    matchesExactPada,
    matchesNakshatra,
    matchesRasi,
    detectedStartTe: trimmed.slice(0, 2),
    chaldeanTotal: chaldean.total,
    chaldeanSingleDigit: chaldean.single,
    isNumerologyHarmonious,
    syllableCountEstimate,
    isGenderPhoneticIdeal,
    verdictTitleTe,
    detailedFeedbackTe: feedback,
  };
}
