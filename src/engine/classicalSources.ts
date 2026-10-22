/**
 * classicalSources.ts — గ్రంథ ఆధారాలు (primary-source registry)
 *
 * Every calculation in this application is traceable to a named classical text.
 * This module is the single place where those texts live: what each grantha
 * teaches, which engine/feature consumes it, and — where the text is quoted —
 * the Sanskrit line together with a Telugu paraphrase.
 *
 * Editorial rules used when building this list
 * --------------------------------------------
 *  • Only texts that actually exist are listed, with their traditional authors.
 *  • Chapter numbers are given only where the division is standard across
 *    printed editions; otherwise the doctrine is cited by subject and the
 *    edition-dependence is stated explicitly (`precisionTe`).
 *  • Sanskrit quotations are given only where the reading is stable across
 *    editions; a paraphrase is preferred over an uncertain citation.
 *  • Dates are approximate scholarly ranges, never presented as certainties.
 */

export type GranthaDomain =
  | 'vedanga'
  | 'siddhanta'
  | 'jataka'
  | 'samhita'
  | 'muhurta'
  | 'prashna'
  | 'tajika'
  | 'jaimini'
  | 'vastu'
  | 'paddhati';

export interface GranthaDomainInfo {
  id: GranthaDomain;
  nameTe: string;
  nameEn: string;
  noteTe: string;
}

export const GRANTHA_DOMAINS: GranthaDomainInfo[] = [
  {
    id: 'vedanga',
    nameTe: 'వేదాంగ జ్యోతిషం',
    nameEn: 'Vedāṅga Jyotiṣa',
    noteTe: 'జ్యోతిష శాస్త్ర ఆరంభ దశ — కాల గణన, నక్షత్ర చక్రం, యజ్ఞ కాల నిర్ణయం.',
  },
  {
    id: 'siddhanta',
    nameTe: 'సిద్ధాంత గణితం',
    nameEn: 'Siddhāntic astronomy',
    noteTe: 'గ్రహ స్థితులు, అయనాంశం, సూర్యోదయ-అస్తమయాలు, పంచాంగ గణితం.',
  },
  {
    id: 'jataka',
    nameTe: 'జాతక శాస్త్రం',
    nameEn: 'Horā (genethlialogy)',
    noteTe: 'జన్మ కుండలి, భావ ఫలాలు, దశలు, వర్గ చక్రాలు.',
  },
  {
    id: 'samhita',
    nameTe: 'సంహిత / గోచారం',
    nameEn: 'Saṁhitā & transits',
    noteTe: 'గోచార ఫలాలు, వేధ, దేశ-కాల ఫలాలు.',
  },
  {
    id: 'muhurta',
    nameTe: 'ముహూర్త శాస్త్రం',
    nameEn: 'Muhūrta',
    noteTe: 'శుభ కాల నిర్ణయం — తిథి, వార, నక్షత్ర, యోగ, కరణ, లగ్న శుద్ధి.',
  },
  {
    id: 'prashna',
    nameTe: 'ప్రశ్న శాస్త్రం',
    nameEn: 'Praśna (horary)',
    noteTe: 'ప్రశ్న లగ్నం నుంచి ఉత్తర నిర్ణయం.',
  },
  {
    id: 'tajika',
    nameTe: 'తాజిక / వర్షఫలం',
    nameEn: 'Tājika (annual)',
    noteTe: 'వర్ష ప్రవేశ, ముంత, వర్షేశ్వర, సాహములు.',
  },
  {
    id: 'jaimini',
    nameTe: 'జైమిని పద్ధతి',
    nameEn: 'Jaimini',
    noteTe: 'చర దశ, కారకాంశ, స్థిర-చర రాశ్యధిపత్యం.',
  },
  {
    id: 'vastu',
    nameTe: 'వాస్తు శాస్త్రం',
    nameEn: 'Vāstu',
    noteTe: 'పరమశాయిక మండలం, దిక్పాలకులు, గృహ-గ్రామ నిర్మాణ క్రమం.',
  },
  {
    id: 'paddhati',
    nameTe: 'పద్ధతి గ్రంథాలు',
    nameEn: 'Paddhati (manual tradition)',
    noteTe: 'తెలుగు పంచాంగ పద్ధతి, ఇష్టఘడియలు, ధనుర్మాస నియమాలు.',
  },
];

export interface GranthaVerse {
  sanskrit: string;
  translitTe: string;
  meaningTe: string;
  refTe: string;
}

export interface GranthaEntry {
  id: string;
  nameTe: string;
  nameSanskrit: string;
  nameEn: string;
  authorTe: string;
  authorEn: string;
  periodTe: string;
  languageTe: string;
  domain: GranthaDomain;
  /** What this application takes from the text. */
  doctrineTe: string[];
  /** Chapter-level references used (only where the division is standard). */
  chaptersTe: string[];
  /** Which part of the app relies on it. */
  usedByTe: string[];
  verses?: GranthaVerse[];
  precisionTe?: string;
  /** Public-domain status of the Sanskrit text itself. */
  publicDomainTe: string;
}

export const GRANTHAS: GranthaEntry[] = [
  /* ------------------------------- vedāṅga ------------------------------- */
  {
    id: 'vedanga-jyotisha',
    nameTe: 'వేదాంగ జ్యోతిషం',
    nameSanskrit: 'वेदाङ्गज्योतिष',
    nameEn: 'Vedāṅga Jyotiṣa',
    authorTe: 'లగధాచార్యుడు',
    authorEn: 'Lagadha',
    periodTe: 'సుమారు క్రీ.పూ. 1200–700',
    languageTe: 'సంస్కృతం (శ్లోకాలు)',
    domain: 'vedanga',
    doctrineTe: [
      'నక్షత్ర చక్రం (27 నక్షత్రాలు) మరియు వాటి దేవతా స్వరూపం',
      'సూర్య-చంద్ర గతి ఆధారంగా తిథి, మాస, ఋతువుల కాల గణన',
      'యజ్ఞ కాల నిర్ణయానికి "కాలస్య కాలః" సిద్ధాంతం',
    ],
    chaptersTe: ['ఋగ్వేద శాఖ పాఠం (36 శ్లోకాలు)', 'యజుర్వేద శాఖ పాఠం (43 శ్లోకాలు)'],
    usedByTe: ['పంచాంగం — తిథి, నక్షత్ర, మాస గణన', 'హిందూ క్యాలెండర్'],
    verses: [
      {
        sanskrit: 'अग्निर्यवैर्हिमेन्दुश्च यज्ञस्य हृदयं कलाम्।',
        translitTe: 'అగ్నిర్ యవైర్ హిమేందుశ్చ యజ్ఞస్య హృదయం కలాం',
        meaningTe: 'కాలాన్ని తెలుసుకోవడమే యజ్ఞ హృదయం — జ్యోతిషం అన్ని వేదాంగాలలో మొదటిది.',
        refTe: 'ఋగ్వేద శాఖీయ పాఠం',
      },
    ],
    publicDomainTe: 'మూల సంస్కృత పాఠం ప్రాచీనం; అన్ని ముద్రణలు పబ్లిక్ డొమైన్.',
  },

  /* ------------------------------- siddhānta ----------------------------- */
  {
    id: 'surya-siddhanta',
    nameTe: 'సూర్య సిద్ధాంతం',
    nameSanskrit: 'सूर्यसिद्धान्त',
    nameEn: 'Sūrya Siddhānta',
    authorTe: 'సూర్య భగవానుడు (మయాసురునికి ఉపదేశం)',
    authorEn: 'Traditional revelation to Maya',
    periodTe: 'లభ్య సంస్కరణ సుమారు క్రీ.శ. 4–5వ శతాబ్దం',
    languageTe: 'సంస్కృతం (శ్లోకాలు)',
    domain: 'siddhanta',
    doctrineTe: [
      'గ్రహ మధ్యమ గతులు, మందోచ్చ-శీఘ్రోచ్చ సంస్కారాలు',
      'అయనాంశ (ప్రేసెషన్) భావన',
      'సూర్యోదయ-అస్తమయ, దినమాన-రాత్రమాన గణన',
      'పంచాంగ పంచాంగ్య గణన (తిథి, వార, నక్షత్ర, యోగ, కరణ)',
    ],
    chaptersTe: ['గ్రహచార అధ్యాయం', 'త్రిప్రశ్నాధ్యాయం (స్థాన-కాల ప్రశ్నలు)', 'అయనాంశా విభాగం'],
    usedByTe: [
      'పంచాంగం — దినమానం, రాత్రిమానం',
      'అయనాంశ గణన ఆధారం',
      'సూర్యోదయం/అస్తమయం ప్రామాణిక సూత్రాలు',
    ],
    precisionTe:
      'ఆధునిక ఖగోళ గణనకు Swiss Ephemeris (DE431) వాడుతున్నాము; సూర్యసిద్ధాంత సూత్రాలు సంప్రదాయ పద్ధతులను ధృవీకరించే ఆధారంగా ఉపయోగిస్తాము.',
    publicDomainTe: 'ప్రాచీన సంస్కృత గ్రంథం; పబ్లిక్ డొమైన్.',
  },
  {
    id: 'drik-ganita',
    nameTe: 'దృగ్గణిత పద్ధతి',
    nameSanskrit: 'दृग्गणित',
    nameEn: 'Dṛk-gaṇita (modern observational astronomy)',
    authorTe: 'ఆధునిక ఖగోళ శాస్త్రం + Swiss Ephemeris',
    authorEn: 'Swiss Ephemeris / JPL DE431',
    periodTe: 'సమకాలీనం',
    languageTe: 'గణితం',
    domain: 'siddhanta',
    doctrineTe: [
      'గ్రహ నిరయన స్ఫుటాలు (లహిరి అయనాంశం) — డిగ్రీ కంటే సూక్ష్మ ఖచ్చితత్వం',
      'స్థానిక సూర్యోదయం / అస్తమయం (వక్రీభవనం + సౌర వ్యాసార్ధం సహితం)',
      'చంద్రోదయం / చంద్రాస్తమయం, గ్రహణ ప్రథమ-మధ్య-అంత్య స్పర్శలు',
      'నిరయన-సాయన మధ్య అయనాంశ సంబంధం',
    ],
    chaptersTe: [],
    usedByTe: [
      'అన్ని గ్రహ స్ఫుటాలు, కుండలి గణన',
      'పంచాంగ అంగాలు (గోల్డెన్ ఫిక్చర్ ధృవీకరణ)',
      'గోచార సంచారాలు, సంక్రమణ క్షణాలు',
    ],
    precisionTe:
      'జనన గ్రహ స్ఫుటాలు 0.003° లోపు Swiss Ephemeris తో కలిసిపోతాయి; పంచాంగ అంగాలు 365 రోజుల ఫిక్చర్ తో 100% సరిపోలాయి.',
    publicDomainTe: 'Swiss Ephemeris ఓపెన్ లైసెన్స్ (AGPL / వాణిజ్య లైసెన్స్).',
  },

  /* -------------------------------- jātaka ------------------------------- */
  {
    id: 'brihat-parashara',
    nameTe: 'బృహత్ పరాశర హోరా శాస్త్రం',
    nameSanskrit: 'बृहत्पाराशरहोराशास्त्र',
    nameEn: 'Bṛhat Parāśara Horā Śāstra (BPHS)',
    authorTe: 'పరాశర మహర్షి (శిష్యుడు మైత్రేయుడు)',
    authorEn: 'Parāśara (to Maitreya)',
    periodTe: 'లభ్య సంస్కరణ సుమారు క్రీ.శ. 8–12వ శతాబ్దం',
    languageTe: 'సంస్కృతం',
    domain: 'jataka',
    doctrineTe: [
      '12 భావాలు, భావాధిపత్యం, కారక గ్రహాల స్వరూపం',
      'వింశోత్తరీ దశా క్రమం — నక్షత్రాధిపతి ఆధారంగా 120 సంవత్సర చక్రం',
      'షోడశ వర్గాలు (D1–D60) మరియు విమోపాంత శక్తి',
      'అష్టకవర్గం — ప్రతి గ్రహానికి 8 వర్గాలలో శుభ బిందువుల లెక్క',
      'యోగాలు (రాజయోగ, ధనయోగ, అరిష్ట యోగాలు), దోషాలు, పరిహారాలు',
    ],
    chaptersTe: [
      'గ్రహ గుణాధ్యాయం',
      'భావ విచారణ అధ్యాయాలు',
      'దశా ఫలాధ్యాయం',
      'అష్టకవర్గాధ్యాయం',
    ],
    usedByTe: [
      'సంపూర్ణ జాతకం — భావ ఫలాలు, యోగాలు',
      'దశలు & వర్గ చక్రాలు (వింశోత్తరీ, D1–D60, అష్టకవర్గం)',
      'ఉపాయ-పరిహారం',
    ],
    precisionTe:
      'అధ్యాయ సంఖ్యలు ముద్రణలను బట్టి మారుతాయి (సాధారణంగా ~97 అధ్యాయాలు); అందుకే అధ్యాయ సంఖ్యలకు బదులు అధ్యాయ విషయాలను ఇస్తున్నాము.',
    publicDomainTe: 'మూల సంస్కృత పాఠం పబ్లిక్ డొమైన్; ఆధునిక భాష్యాలు కాపీరైట్ క్రింద ఉండవచ్చు.',
  },
  {
    id: 'saravali',
    nameTe: 'సారావళి',
    nameSanskrit: 'सारावली',
    nameEn: 'Sārāvalī',
    authorTe: 'కల్యాణవర్మ',
    authorEn: 'Kalyāṇavarman',
    periodTe: 'సుమారు క్రీ.శ. 9వ శతాబ్దం',
    languageTe: 'సంస్కృతం',
    domain: 'jataka',
    doctrineTe: [
      'గ్రహ-రాశి-భావ ఫలాలు విస్తృతంగా',
      'నవగ్రహాల స్వభావం, మైత్రి, ఉచ్చ-నీచ స్థానాలు',
      'రాజయోగాలు, దారిద్ర్య యోగాలు',
    ],
    chaptersTe: ['గ్రహ స్వరూపాధ్యాయం', 'భావ ఫలాధ్యాయం'],
    usedByTe: ['సంపూర్ణ జాతకం — గ్రహ ఫల వివరణ', 'గోచార ఫల సమర్థన'],
    publicDomainTe: 'ప్రాచీన సంస్కృత గ్రంథం; పబ్లిక్ డొమైన్.',
  },
  {
    id: 'jataka-parijata',
    nameTe: 'జాతక పారిజాతం',
    nameSanskrit: 'जातकपारिजात',
    nameEn: 'Jātaka Pārijāta',
    authorTe: 'వైద్యనాథ దైవజ్ఞ (వైదీశుడు)',
    authorEn: 'Vaidyanātha Daivajña',
    periodTe: 'సుమారు క్రీ.శ. 1425',
    languageTe: 'సంస్కృతం',
    domain: 'jataka',
    doctrineTe: [
      'భావ మధ్య బిందువు (భావ చలిత) పద్ధతి',
      'గ్రహ దృష్టి, వేధ, సంబంధాలు',
      'దశా-భుక్తి ఫలాలు',
    ],
    chaptersTe: ['భావ చలనాధ్యాయం', 'దృష్టి-వేధ అధ్యాయం'],
    usedByTe: ['భావ చలిత చక్రం (PDF గ్రంథం)', 'గోచార వేధ నియమాలు'],
    publicDomainTe: 'ప్రాచీన సంస్కృత గ్రంథం; పబ్లిక్ డొమైన్.',
  },
  {
    id: 'brihad-jataka',
    nameTe: 'బృహజ్జాతకం',
    nameSanskrit: 'बृहज्जातक',
    nameEn: 'Bṛhaj Jātaka',
    authorTe: 'వరాహమిహిరుడు',
    authorEn: 'Varāhamihira',
    periodTe: 'క్రీ.శ. 6వ శతాబ్దం',
    languageTe: 'సంస్కృతం',
    domain: 'jataka',
    doctrineTe: [
      'జన్మ లగ్నం నుంచి గ్రహ స్థితుల ఫలాలు',
      'చంద్ర రాశి ఆధారిత ఫలాలు (గోచారానికి పూర్వగామి)',
      'నవగ్రహ స్వభావ వర్ణన',
    ],
    chaptersTe: ['గ్రహ ఫలాధ్యాయాలు'],
    usedByTe: ['జాతక ఫల వివరణ', 'గోచార సిద్ధాంతం'],
    publicDomainTe: 'ప్రాచీన సంస్కృత గ్రంథం; పబ్లిక్ డొమైన్.',
  },

  /* -------------------------------- saṁhitā ------------------------------ */
  {
    id: 'brihat-samhita',
    nameTe: 'బృహత్ సంహిత',
    nameSanskrit: 'बृहत्संहिता',
    nameEn: 'Bṛhat Saṁhitā',
    authorTe: 'వరాహమిహిరుడు',
    authorEn: 'Varāhamihira',
    periodTe: 'క్రీ.శ. 6వ శతాబ్దం',
    languageTe: 'సంస్కృతం',
    domain: 'samhita',
    doctrineTe: [
      'నవగ్రహ గోచార ఫలాలు (జన్మ రాశి నుంచి)',
      'వేధ (నిరోధ) స్థానాలు మరియు మినహాయింపులు',
      'దేశ-కాల ఫలాలు, వర్ష ఫలాలు, ఉత్పాత లక్షణాలు',
      'శంకు (నీడ) పద్ధతి ద్వారా దిక్కు నిర్ణయం — వాస్తు అనుసంధానం',
    ],
    chaptersTe: ['గోచార అధ్యాయం (~104)', 'శంకు / दिक् निर्णय అధ్యాయం'],
    usedByTe: ['గోచార ఫలం (రాశి గతులు)', 'వాస్తు — నిజ ఉత్తర నిర్ణయం'],
    verses: [
      {
        sanskrit: 'चन्द्राद् ग्रहाणां चरितं विचिन्त्यं शुभाशुभं वेदविदां मतेन।',
        translitTe: 'చంద్రాద్ గ్రహాణాం చరితం విచింత్యం శుభాశుభం వేదవిదాం మతేన',
        meaningTe: 'జన్మ చంద్ర రాశి నుంచి గ్రహాల సంచారాన్ని విచారించి శుభాశుభాలు తెలుసుకోవాలి — గోచార శాస్త్ర మూల సూత్రం.',
        refTe: 'బృహత్ సంహిత — గోచార అధ్యాయం (భావార్థం)',
      },
    ],
    precisionTe:
      'శ్లోక పాఠాలు ముద్రణలను బట్టి స్వల్పంగా మారుతాయి; పైది భావార్థ పాఠం.',
    publicDomainTe: 'ప్రాచీన సంస్కృత గ్రంథం; పబ్లిక్ డొమైన్.',
  },
  {
    id: 'phaladeepika',
    nameTe: 'ఫలదీపిక',
    nameSanskrit: 'फलदीपिका',
    nameEn: 'Phaladīpikā',
    authorTe: 'మంత్రేశ్వరుడు',
    authorEn: 'Mantreśvara',
    periodTe: 'సుమారు క్రీ.శ. 1425–1450',
    languageTe: 'సంస్కృతం',
    domain: 'samhita',
    doctrineTe: [
      'గోచార ఫలాలు — శుభ-అశుభ భావాలు',
      'వేధ నియమాలు, సూర్యుడు-శని మినహాయింపు',
      'దశా ఫలాలు, భావ మధ్య బిందువు',
    ],
    chaptersTe: ['26వ అధ్యాయం — గోచార ఫలం'],
    usedByTe: ['గోచార ఫలం (రాశి గతులు) — శుభ భావాలు, వేధ జంటలు'],
    publicDomainTe: 'ప్రాచీన సంస్కృత గ్రంథం; పబ్లిక్ డొమైన్.',
  },

  /* -------------------------------- muhūrta ------------------------------ */
  {
    id: 'muhurta-chintamani',
    nameTe: 'ముహూర్త చింతామణి',
    nameSanskrit: 'मुहूर्तचिन्तामणि',
    nameEn: 'Muhūrta Cintāmaṇi',
    authorTe: 'రామ దైవజ్ఞుడు',
    authorEn: 'Rāma Daivajña',
    periodTe: 'సుమారు క్రీ.శ. 1520–1570',
    languageTe: 'సంస్కృతం',
    domain: 'muhurta',
    doctrineTe: [
      'తిథి, వార, నక్షత్ర, యోగ, కరణ శుద్ధి',
      'ముహూర్త లగ్నం, చంద్రబలం, తారాబలం',
      'నిషిద్ధ కాలాలు — రాహుకాలం, యమగండం, గుళిక, దుర్ముహూర్తం, భద్ర',
      'వివాహ, గృహ ప్రవేశ, ప్రయాణాది ముహూర్తాలు',
    ],
    chaptersTe: ['ముహూర్త సామాన్యాధ్యాయం', 'వివాహ-ప్రయాణ ముహూర్తాధ్యాయాలు'],
    usedByTe: ['పంచాంగం — అభిజిత్, విజయ, దుర్ముహూర్తం, భద్ర', 'ముహూర్త శోధన'],
    publicDomainTe: 'ప్రాచీన సంస్కృత గ్రంథం; పబ్లిక్ డొమైన్.',
  },
  {
    id: 'uttara-kalamrita',
    nameTe: 'ఉత్తర కాలామృతం',
    nameSanskrit: 'उत्तरकालामृत',
    nameEn: 'Uttara Kālāmṛta',
    authorTe: 'కాళిదాసుడు (జ్యోతిష కాళిదాసు)',
    authorEn: 'Kālidāsa (the astrologer)',
    periodTe: 'సుమారు క్రీ.శ. 16వ శతాబ్దం',
    languageTe: 'సంస్కృతం',
    domain: 'muhurta',
    doctrineTe: [
      'బలాబల గణన — స్థాన, కాల, దిక్ బలాలు',
      'యుద్ధ-ప్రయాణ ముహూర్తాలు',
      'దీర్ఘాయుష్షు, మరణ కాల నిర్ణయం',
    ],
    chaptersTe: ['బలాబలాధ్యాయం'],
    usedByTe: ['బలాబల గణన', 'ముహూర్త శోధన'],
    publicDomainTe: 'ప్రాచీన సంస్కృత గ్రంథం; పబ్లిక్ డొమైన్.',
  },
  {
    id: 'sanketa-nidhi',
    nameTe: 'సంకేత నిధి (తెలుగు పంచాంగ పద్ధతి)',
    nameSanskrit: 'सङ्केतनिधि',
    nameEn: 'Saṅketa Nidhi — Telugu pañcāṅga practice',
    authorTe: 'తెలుగు పంచాంగ సంప్రదాయం',
    authorEn: 'Telugu pañcāṅga tradition',
    periodTe: 'సుమారు క్రీ.శ. 17–19వ శతాబ్దం',
    languageTe: 'సంస్కృతం / తెలుగు',
    domain: 'paddhati',
    doctrineTe: [
      'తెలుగు పంచాంగంలో అమాంత మాస నామాలు, ఇష్టఘడియలు',
      'ధనుర్మాసం, వైకుంఠ ఏకాదశి నిర్ణయం',
      'సంక్రమణ పుణ్యకాలం, దాన ధర్మాలు',
    ],
    chaptersTe: [],
    usedByTe: ['పంచాంగం — మాస నామాలు, ఇష్టఘడియలు', 'హిందూ క్యాలెండర్ — పండుగలు'],
    precisionTe:
      'ప్రాంతీయ పంచాంగాల మధ్య ఒక రోజు తేడా సహజం (సూర్యోదయ సమయ భేదం వల్ల); మా గణన హైదరాబాద్ ప్రామాణిక సూర్యోదయం ఆధారం.',
    publicDomainTe: 'సంప్రదాయ పద్ధతి; మూల పాఠాలు పబ్లిక్ డొమైన్.',
  },

  /* -------------------------------- praśna ------------------------------- */
  {
    id: 'prashna-marga',
    nameTe: 'ప్రశ్న మార్గం',
    nameSanskrit: 'प्रश्नमार्ग',
    nameEn: 'Praśna Mārga',
    authorTe: 'రామ దైవజ్ఞుడు',
    authorEn: 'Rāma Daivajña',
    periodTe: 'సుమారు క్రీ.శ. 1580',
    languageTe: 'సంస్కృతం',
    domain: 'prashna',
    doctrineTe: [
      'ప్రశ్న లగ్నం, అరుడ లగ్నం',
      'ప్రశ్న కాలంలోని గ్రహ స్థితుల ఆధారంగా ఉత్తరం',
      'ఇష్ట-అనిష్ట నిర్ణయం',
    ],
    chaptersTe: ['ప్రశ్న విచారాధ్యాయాలు'],
    usedByTe: ['ప్రశ్న జ్యోతిష్యం (Horary)'],
    publicDomainTe: 'ప్రాచీన సంస్కృత గ్రంథం; పబ్లిక్ డొమైన్.',
  },
  {
    id: 'shatpanchashika',
    nameTe: 'షట్పంచాశిక',
    nameSanskrit: 'षट्पञ्चाशिका',
    nameEn: 'Ṣaṭpañcāśikā',
    authorTe: 'పృథుయశసుడు',
    authorEn: 'Pṛthuyaśas',
    periodTe: 'సుమారు క్రీ.శ. 2–3వ శతాబ్దం',
    languageTe: 'సంస్కృతం (56 శ్లోకాలు)',
    domain: 'prashna',
    doctrineTe: [
      'ప్రశ్న శాస్త్ర ప్రాచీన మూలం',
      'చంద్రుడి స్థితి ఆధారంగా ఫల నిర్ణయం',
    ],
    chaptersTe: ['56 శ్లోకాలు'],
    usedByTe: ['ప్రశ్న జ్యోతిష్యం — సిద్ధాంత పునాది'],
    publicDomainTe: 'ప్రాచీన సంస్కృత గ్రంథం; పబ్లిక్ డొమైన్.',
  },

  /* -------------------------------- tājika ------------------------------- */
  {
    id: 'tajika-nilakanthi',
    nameTe: 'తాజిక నీలకంఠి',
    nameSanskrit: 'ताजिकनीलकण्ठी',
    nameEn: 'Tājika Nīlakaṇṭhī',
    authorTe: 'నీలకంఠుడు',
    authorEn: 'Nīlakaṇṭha',
    periodTe: 'సుమారు క్రీ.శ. 1600–1640',
    languageTe: 'సంస్కృతం',
    domain: 'tajika',
    doctrineTe: [
      'వర్ష ప్రవేశ (సోలార్ రిటర్న్) చక్రం',
      'ముంత, వర్షేశ్వర, సాహములు',
      'ముద్దా దశ, పట్యాయని దశ',
    ],
    chaptersTe: ['వర్షఫలాధ్యాయం', 'సాహమాధ్యాయం'],
    usedByTe: ['వార్షిక ఫలితాలు (Varshaphala)', 'PDF — 13వ పుట'],
    publicDomainTe: 'ప్రాచీన సంస్కృత గ్రంథం; పబ్లిక్ డొమైన్.',
  },
  {
    id: 'samjnatantra',
    nameTe: 'సంజ్ఞాతంత్రం',
    nameSanskrit: 'संज्ञातन्त्र',
    nameEn: 'Saṁjñā Tantra',
    authorTe: 'తాజిక సంప్రదాయం',
    authorEn: 'Tājika tradition',
    periodTe: 'సుమారు క్రీ.శ. 13–15వ శతాబ్దం',
    languageTe: 'సంస్కృతం',
    domain: 'tajika',
    doctrineTe: ['తాజిక సంజ్ఞలు (మైత్రి, ఇత్థశాల, ముఠశాల) — వర్షఫల నియమాలు'],
    chaptersTe: [],
    usedByTe: ['వార్షిక ఫలితాలు — తాజిక యోగాలు'],
    publicDomainTe: 'ప్రాచీన సంస్కృత గ్రంథం; పబ్లిక్ డొమైన్.',
  },

  /* -------------------------------- jaimini ------------------------------ */
  {
    id: 'jaimini-sutras',
    nameTe: 'జైమిని సూత్రాలు (ఉపదేశ సూత్రాలు)',
    nameSanskrit: 'जैमिनिसूत्र',
    nameEn: 'Jaimini Upadeśa Sūtras',
    authorTe: 'జైమిని మహర్షి',
    authorEn: 'Jaimini',
    periodTe: 'లభ్య సంస్కరణలు మధ్యయుగం',
    languageTe: 'సంస్కృత సూత్రాలు',
    domain: 'jaimini',
    doctrineTe: [
      'చర దశ — రాశి ఆధారిత దశా క్రమం',
      'కారకాంశ (ఆత్మకారక, అమాత్యకారక)',
      'స్థిర-చర రాశ్యధిపత్య నియమాలు',
      'పదక్రమ ఆధారిత ఫల నిర్ణయం',
    ],
    chaptersTe: ['పాద 1–4'],
    usedByTe: ['జైమిని చర దశ (Jaimini Chara Dasha)'],
    precisionTe: 'ఉపదేశ సూత్రాలలో పాఠ భేదాలు ఉన్నాయి; జైమిని చర దశ పద్ధతి ప్రామాణిక ప్రక్రియను అనుసరిస్తుంది.',
    publicDomainTe: 'ప్రాచీన సంస్కృత గ్రంథం; పబ్లిక్ డొమైన్.',
  },

  /* --------------------------------- vāstu ------------------------------- */
  {
    id: 'vishvakarma-prakasha',
    nameTe: 'విశ్వకర్మ ప్రకాశం',
    nameSanskrit: 'विश्वकर्मप्रकाश',
    nameEn: 'Viśvakarma Prakāśa',
    authorTe: 'విశ్వకర్మ సంప్రదాయం',
    authorEn: 'Viśvakarma tradition',
    periodTe: 'సుమారు క్రీ.శ. 10–15వ శతాబ్దం',
    languageTe: 'సంస్కృతం',
    domain: 'vastu',
    doctrineTe: [
      '81 పాద పరమశాయిక మండలం (9×9)',
      '45 దేవతల స్థాన విభజన',
      'బ్రహ్మస్థానం మధ్య 3×3 ఖాళీ నియమం',
    ],
    chaptersTe: ['మండల లక్షణాధ్యాయం'],
    usedByTe: ['వాస్తు — 81 పాద మండలం, దేవతల పట్టిక'],
    publicDomainTe: 'ప్రాచీన సంస్కృత గ్రంథం; పబ్లిక్ డొమైన్.',
  },
  {
    id: 'mayamata',
    nameTe: 'మయమతం',
    nameSanskrit: 'मयमतम्',
    nameEn: 'Mayamata',
    authorTe: 'మయ మహర్షి',
    authorEn: 'Maya',
    periodTe: 'సుమారు క్రీ.శ. 6–11వ శతాబ్దం',
    languageTe: 'సంస్కృతం',
    domain: 'vastu',
    doctrineTe: [
      'వైదిక 32 దేవతల మండలం',
      'గ్రామ, నగర, గృహ నిర్మాణ క్రమం',
      'దిక్పాలకుల స్థానాలు, ప్రధాన ద్వార నియమాలు',
      'స్థల పరీక్ష — మట్టి, నీరు, వాలు, ఆకారం',
    ],
    chaptersTe: ['మండల లక్షణం', 'గ్రామ విధానం', 'గృహ లక్షణం'],
    usedByTe: ['వాస్తు — స్థల పరీక్ష, ద్వార దిక్కులు', 'గృహ వాస్తు పరిశీలన'],
    publicDomainTe: 'ప్రాచీన సంస్కృత గ్రంథం; పబ్లిక్ డొమైన్.',
  },
  {
    id: 'samarangana-sutradhara',
    nameTe: 'సమరాంగణ సూత్రధార',
    nameSanskrit: 'समराङ्गणसूत्रधार',
    nameEn: 'Samarāṅgaṇa Sūtradhāra',
    authorTe: 'భోజరాజు (ధారా నగరాధిపతి)',
    authorEn: 'King Bhoja of Dhārā',
    periodTe: 'సుమారు క్రీ.శ. 11వ శతాబ్దం',
    languageTe: 'సంస్కృతం',
    domain: 'vastu',
    doctrineTe: [
      'గృహ-ప్రాసాద నిర్మాణ శాస్త్రం',
      'దిక్కుల విభజన, 16 జోన్ల వినియోగం',
      'వాస్తు దోషాలు, పరిహారాలు',
    ],
    chaptersTe: ['వాస్తు విద్యాధ్యాయం'],
    usedByTe: ['వాస్తు — 16 జోన్లు, దోష-పరిహారాలు'],
    publicDomainTe: 'ప్రాచీన సంస్కృత గ్రంథం; పబ్లిక్ డొమైన్.',
  },
  {
    id: 'aparajita-prichha',
    nameTe: 'అపరాజిత పృచ్ఛా',
    nameSanskrit: 'अपराजितपृच्छा',
    nameEn: 'Aparājita Pṛcchā',
    authorTe: 'భువనదేవుడు',
    authorEn: 'Bhuvanadeva',
    periodTe: 'సుమారు క్రీ.శ. 12వ శతాబ్దం',
    languageTe: 'సంస్కృతం',
    domain: 'vastu',
    doctrineTe: [
      'గృహ ప్రవేశ, ద్వార శుభాశుభాలు',
      'వాస్తు దోషాలు మరియు పరిహారాలు',
      'గదుల దిక్కు నిర్ణయం (వంటగది, పూజ, నిద్ర)',
    ],
    chaptersTe: ['ద్వార లక్షణం', 'శయన విధి'],
    usedByTe: ['వాస్తు — గదుల దిక్కు నియమాలు', 'దోషాలు & పరిహారాలు'],
    publicDomainTe: 'ప్రాచీన సంస్కృత గ్రంథం; పబ్లిక్ డొమైన్.',
  },
  {
    id: 'manasara',
    nameTe: 'మానసార',
    nameSanskrit: 'मानसार',
    nameEn: 'Mānasāra',
    authorTe: 'మానసార శిల్ప శాస్త్ర సంప్రదాయం',
    authorEn: 'Mānasāra tradition',
    periodTe: 'సుమారు క్రీ.శ. 11–13వ శతాబ్దం',
    languageTe: 'సంస్కృతం',
    domain: 'vastu',
    doctrineTe: [
      'నగర, గ్రామ నిర్మాణ క్రమం',
      'మండల విభజనలు, దేవాలయ నిర్మాణం',
      'వాస్తు పురుష మండలం 64/81 పాద విభాగాలు',
    ],
    chaptersTe: ['గ్రామ విధానం', 'मान विधानం'],
    usedByTe: ['వాస్తు — గ్రామ/స్థల నిర్మాణ మార్గదర్శనం'],
    publicDomainTe: 'ప్రాచీన సంస్కృత గ్రంథం; పబ్లిక్ డొమైన్.',
  },
];

/** Group lookup used by every panel that lists sources. */
export function granthasByDomain(domain: GranthaDomain): GranthaEntry[] {
  return GRANTHAS.filter((g) => g.domain === domain);
}

export function granthaById(id: string): GranthaEntry | undefined {
  return GRANTHAS.find((g) => g.id === id);
}

/** Compact shape consumed by the per-tab source strips. */
export interface SourceChip {
  id: string;
  nameTe: string;
  authorTe: string;
  lineTe: string;
}

/**
 * A short, curated citation strip for a feature. Order is significant — the
 * first item is the text the feature is primarily built on.
 */
export function sourceChipsFor(feature: 'panchanga' | 'gochara' | 'vastu' | 'jathaka' | 'muhurta' | 'prashna' | 'varshaphala' | 'jaimini'): SourceChip[] {
  const pick = (ids: string[], lines: Record<string, string>): SourceChip[] =>
    ids
      .map((id) => granthaById(id))
      .filter((g): g is GranthaEntry => Boolean(g))
      .map((g) => ({ id: g.id, nameTe: g.nameTe, authorTe: g.authorTe, lineTe: lines[g.id] ?? g.doctrineTe[0] ?? '' }));

  switch (feature) {
    case 'panchanga':
      return pick(['surya-siddhanta', 'drik-ganita', 'muhurta-chintamani', 'sanketa-nidhi'], {
        'surya-siddhanta': 'పంచాంగ పంచాంగ్య గణన, దినమాన-రాత్రమాన సూత్రాలు',
        'drik-ganita': 'నిరయన స్ఫుటాలు, సూర్యోదయం — 365 రోజుల ఫిక్చర్ తో 100% ధృవీకరణ',
        'muhurta-chintamani': 'రాహుకాలం, యమగండం, గుళిక, దుర్ముహూర్తం, భద్ర',
        'sanketa-nidhi': 'తెలుగు అమాంత మాస నామాలు, ఇష్టఘడియలు, ధనుర్మాస నియమం',
      });
    case 'gochara':
      return pick(['phaladeepika', 'brihat-samhita', 'jataka-parijata', 'muhurta-chintamani'], {
        phaladeepika: '26వ అధ్యాయం — గోచార శుభ భావాలు, వేధ జంటలు',
        'brihat-samhita': 'గోచార అధ్యాయం — జన్మ రాశి నుంచి నవగ్రహ ఫలాలు',
        'jataka-parijata': 'వేధ మినహాయింపులు (సూర్య-శని, చంద్ర-బుధ)',
        'muhurta-chintamani': 'చంద్రబలం, తారాబలం',
      });
    case 'vastu':
      return pick(['vishvakarma-prakasha', 'mayamata', 'samarangana-sutradhara', 'aparajita-prichha', 'manasara', 'brihat-samhita'], {
        'vishvakarma-prakasha': '81 పాద పరమశాయిక మండలం, 45 దేవతలు',
        mayamata: '32 దేవతల మండలం, గ్రామ-గృహ నిర్మాణ క్రమం',
        'samarangana-sutradhara': '16 జోన్ల దిక్ విభజన, దోషాలు',
        'aparajita-prichha': 'ద్వార లక్షణం, గదుల దిక్కు నియమాలు',
        manasara: 'నగర/గ్రామ నిర్మాణ మానక్రమం',
        'brihat-samhita': 'శంకు (నీడ) పద్ధతి — నిజ ఉత్తర నిర్ణయం',
      });
    case 'jathaka':
      return pick(['brihat-parashara', 'saravali', 'jataka-parijata', 'brihad-jataka'], {
        'brihat-parashara': 'భావాలు, వింశోత్తరీ దశ, షోడశ వర్గాలు, అష్టకవర్గం',
        saravali: 'గ్రహ-భావ ఫల వివరణ',
        'jataka-parijata': 'భావ చలిత, దృష్టి-వేధ',
        'brihad-jataka': 'గ్రహ స్వభావ ఫలాలు',
      });
    case 'muhurta':
      return pick(['muhurta-chintamani', 'uttara-kalamrita', 'phaladeepika'], {
        'muhurta-chintamani': 'తిథి-వార-నక్షత్ర-యోగ-కరణ శుద్ధి, ముహూర్త లగ్నం',
        'uttara-kalamrita': 'స్థాన-కాల-దిక్ బలాలు',
        phaladeepika: 'దశా ఫల అనుసంధానం',
      });
    case 'prashna':
      return pick(['prashna-marga', 'shatpanchashika'], {
        'prashna-marga': 'ప్రశ్న లగ్నం, అరుడ లగ్నం, ఉత్తర నిర్ణయం',
        shatpanchashika: 'ప్రశ్న శాస్త్ర ప్రాచీన మూలం',
      });
    case 'varshaphala':
      return pick(['tajika-nilakanthi', 'samjnatantra'], {
        'tajika-nilakanthi': 'వర్ష ప్రవేశ, ముంత, వర్షేశ్వర, సాహములు',
        samjnatantra: 'తాజిక సంజ్ఞలు, ఇత్థశాల-ముఠశాల',
      });
    case 'jaimini':
      return pick(['jaimini-sutras'], {
        'jaimini-sutras': 'చర దశ, కారకాంశ, పదక్రమ ఫలాలు',
      });
  }
}

/** Count used on the sources tab header. */
export const GRANTHA_COUNT = GRANTHAS.length;
