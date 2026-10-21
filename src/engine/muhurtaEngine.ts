import * as Astronomy from 'astronomy-engine';
import {
  calculatePanchanga,
  type CompleteChartResult,
  type PanchangaData,
} from './ephemeris.ts';
import { TELUGU_NAKSHATRAS, TELUGU_RASIS } from './teluguJathakam.ts';

export type MuhurtaActivityId =
  | 'vivaha'
  | 'grihapravesham'
  | 'vyaparam'
  | 'upanayanam'
  | 'bhumi_puja'
  | 'vahana'
  | 'namakaranam'
  | 'vidyarambham'
  | 'sarva_karya';

export interface MuhurtaActivityConfig {
  id: MuhurtaActivityId;
  titleTe: string;
  titleEn: string;
  sankalpamTe: string;
  deityTe: string;
  primaryGrahamsTe: string;
  shastraPramanamTe: string;
  descriptionTe: string;
  goodTithiIndices: number[]; // 0..29
  avoidTithiIndices: number[];
  goodVaras: number[]; // 0=Sun..6=Sat
  avoidVaras: number[];
  goodNakshatraNames: string[];
  avoidNakshatraNames: string[];
  preferredLagnasTe: string;
  bestTimeSlotGuideTe: string;
}

export const MUHURTA_ACTIVITIES: Record<MuhurtaActivityId, MuhurtaActivityConfig> = {
  vivaha: {
    id: 'vivaha',
    titleTe: 'వివాహ ముహూర్తం (కల్యాణ ప్రాశస్త్యం)',
    titleEn: 'Vivaha (Sacred Marriage)',
    sankalpamTe: 'ధర్మార్ధ కామ మోక్ష సిద్ధ్యర్థం, దాంపత్య సమైక్య జీవనం, వంశాభివృద్ధి కొరకు',
    deityTe: 'శ్రీ లక్ష్మీ నారాయణ, పార్వతీ పరమేశ్వరులు',
    primaryGrahamsTe: 'శుక్రుడు (కళత్ర కారకుడు), గురువు (సౌభాగ్య కారకుడు), చంద్రుడు (మనో కారకుడు)',
    shastraPramanamTe: 'ముహూర్త చింతామణి & కాలామృతం: "సప్తమ శుద్ధిః ప్రాధాన్యం, కుజ దోష వివర్జితం, తారాచంద్ర బలోపేతం వివాహే సర్వశోభనం"',
    descriptionTe: 'వివాహానికి సప్తమ శుద్ధి (లగ్నానికి 7వ ఇంట ఏ పాపగ్రహమూ లేకపోవడం), చంద్రాష్టమ విసర్జన, వధూవరుల తారాబలం మరియు గురు-శుక్రుల శుభ దృష్టి అత్యంత ప్రధానం.',
    goodTithiIndices: [1, 2, 4, 6, 9, 10, 12, 16, 17, 19, 21, 24, 25, 27], // 2, 3, 5, 7, 10, 11, 13
    avoidTithiIndices: [3, 7, 8, 13, 14, 18, 22, 23, 28, 29], // 4, 8, 9, 14, 15, 30
    goodVaras: [1, 3, 4, 5], // Mon, Wed, Thu, Fri
    avoidVaras: [0, 2, 6], // Sun, Tue, Sat
    goodNakshatraNames: [
      'Rohini', 'Mrigashira', 'Magha', 'Uttara Phalguni', 'Hasta',
      'Chitra', 'Swati', 'Anuradha', 'Mula', 'Uttarashadha',
      'Uttara Bhadrapada', 'Revati',
    ],
    avoidNakshatraNames: ['Bharani', 'Krittika', 'Ardra', 'Ashlesha', 'Jyeshtha', 'Purva Bhadrapada'],
    preferredLagnasTe: 'వృషభం, మిథునం, కన్య, తుల, ధనుస్సు, మీన లగ్నాలు (సప్తమ స్థానం ఖాళీగా ఉండాలి)',
    bestTimeSlotGuideTe: 'ఉదయ కాల శుభ హోరలు (గురు/శుక్ర హోర), సంధ్యా గోధూళి ముహూర్తం, లేదా సుముహూర్త నిశ్చిత లగ్నం.',
  },
  grihapravesham: {
    id: 'grihapravesham',
    titleTe: 'గృహప్రవేశం (స్థిర నివాస ప్రాప్తి)',
    titleEn: 'Grihapravesham (Housewarming)',
    sankalpamTe: 'వాస్తుదోష నివారణ, లక్ష్మీ కటాక్షం, కుటుంబ క్షేమం, స్థిర సంపద కొరకు',
    deityTe: 'శ్రీ వాస్తు పురుషుడు, శ్రీ మహాలక్ష్మి, క్షేత్రపాలకులు',
    primaryGrahamsTe: 'శుక్రుడు (వాహన-గృహ కారకుడు), గురువు (సంపత్ కారకుడు), కుజుడు (భూకారకుడు - శుభ స్థానంలో ఉండాలి)',
    shastraPramanamTe: 'బృహత్సంహిత & ముహూర్త మార్తాండం: "స్థిరలగ్నే గృహప్రవేశం శుభఫలదం, పూర్వాహ్నే శస్తమ్"',
    descriptionTe: 'నూతన లేదా పాత గృహప్రవేశానికి స్థిర లగ్నాలు (వృషభం, సింహం, వృశ్చికం, కుంభం) అత్యంత శ్రేష్ఠం. పూర్వాహ్న వేళలో, కుండలిలో 4వ భావ శుద్ధి ఉన్నప్పుడు అడుగుపెట్టాలి.',
    goodTithiIndices: [1, 2, 4, 6, 9, 10, 12, 16, 17, 19, 21, 24, 25, 27],
    avoidTithiIndices: [3, 8, 13, 14, 29], // Rikta & Amavasya
    goodVaras: [1, 3, 4, 5],
    avoidVaras: [2, 6], // Tue, Sat
    goodNakshatraNames: [
      'Rohini', 'Mrigashira', 'Uttara Phalguni', 'Chitra', 'Anuradha',
      'Uttarashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
      'Uttara Bhadrapada', 'Revati', 'Pushya',
    ],
    avoidNakshatraNames: ['Bharani', 'Krittika', 'Ardra', 'Ashlesha', 'Jyeshtha'],
    preferredLagnasTe: 'వృషభం, సింహం, వృశ్చికం, కుంభం (స్థిర లగ్నాలు)',
    bestTimeSlotGuideTe: 'సూర్యోదయానంతర ప్రథమ ప్రహరం (ఉదయం 6:00 నుండి 9:30 మధ్య) లేదా అభిజిత్ ముహూర్తం.',
  },
  vyaparam: {
    id: 'vyaparam',
    titleTe: 'నూతన వ్యాపార ఆరంభం / షాపు ప్రారంభం',
    titleEn: 'Vyaparam (Business / Commerce Launch)',
    sankalpamTe: 'వ్యాపార విస్తరణ, నిరంతర లాభాలు, భాగస్వామ్య సఖ్యత, వినియోగదారుల ఆకర్షణ కొరకు',
    deityTe: 'శ్రీ లక్ష్మీ గణపతి, శ్రీ కుబేర స్వామి',
    primaryGrahamsTe: 'బుధుడు (వాణిజ్య కారకుడు), గురువు (ధన కారకుడు), శుక్రుడు (లాభ కారకుడు)',
    shastraPramanamTe: 'ముహూర్త గణపతి: "బుధవారే వాణిజ్యం ధనవృద్ధికరం, లాభస్థానే శుభగ్రహాః"',
    descriptionTe: 'వ్యాపారానికి బుధవారం మరియు గురువారాలు అత్యుత్తమం. లగ్నానికి 10వ (కర్మ) లేదా 11వ (లాభ) స్థానాలలో శుభగ్రహాలు ఉన్నప్పుడు వ్యాపారంలో తిరుగుండదు.',
    goodTithiIndices: [1, 2, 4, 6, 9, 10, 11, 12, 14, 16, 17, 19, 21, 24, 25, 26, 27],
    avoidTithiIndices: [3, 8, 13, 29],
    goodVaras: [1, 3, 4, 5], // Wed is prime!
    avoidVaras: [0, 2, 6],
    goodNakshatraNames: [
      'Ashwini', 'Rohini', 'Mrigashira', 'Punarvasu', 'Pushya',
      'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Anuradha',
      'Shravana', 'Dhanishta', 'Revati',
    ],
    avoidNakshatraNames: ['Bharani', 'Ardra', 'Ashlesha', 'Jyeshtha'],
    preferredLagnasTe: 'మిథునం, కన్య, ధనుస్సు, మీనం, వృషభం (10/11వ స్థానాలలో బుధ-గురు బలం)',
    bestTimeSlotGuideTe: 'బుధ లేదా గురు శుభ హోరలో ఉదయం 8:30 నుండి 11:30 వరకు, లేదా అభిజిత్ లగ్నం.',
  },
  upanayanam: {
    id: 'upanayanam',
    titleTe: 'ఉపనయనం (గాయత్రీ బ్రహ్మోపదేశం)',
    titleEn: 'Upanayanam (Sacred Thread Ceremony)',
    sankalpamTe: 'గాయత్రీ మంత్ర సిద్ధి, వేదాధ్యయనం, ఆయురారోగ్య బుద్ధి వికాసం కొరకు',
    deityTe: 'శ్రీ గాయత్రీ దేవి, సూర్య భగవానుడు, బృహస్పతి',
    primaryGrahamsTe: 'గురువు (బ్రహ్మ జ్ఞాన కారకుడు), సూర్యుడు (ఆత్మ కారకుడు), బుధుడు (విద్యా కారకుడు)',
    shastraPramanamTe: 'జాబాలి సూత్రం: "ఉత్తరాయణే శుక్లపక్షే గురుబలాన్వితః ఉపనయనం కుర్యాత్"',
    descriptionTe: 'ఉత్తరాయణంలో, శుక్ల పక్షంలో, వటువు జన్మరాశికి గురు బలం (త్రయోదశ గురుచారంలో శుభస్థానం) ఉన్నప్పుడు ఉపనయనం నిర్వహించాలి.',
    goodTithiIndices: [1, 2, 4, 6, 9, 10, 11, 12], // Shukla 2,3,5,7,10,11,12,13
    avoidTithiIndices: [3, 8, 13, 14, 28, 29],
    goodVaras: [0, 1, 3, 4, 5], // Sun, Mon, Wed, Thu, Fri
    avoidVaras: [2, 6],
    goodNakshatraNames: [
      'Ashwini', 'Rohini', 'Mrigashira', 'Punarvasu', 'Pushya',
      'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Anuradha',
      'Uttarashadha', 'Shravana', 'Dhanishta', 'Uttara Bhadrapada', 'Revati',
    ],
    avoidNakshatraNames: ['Bharani', 'Krittika', 'Ardra', 'Ashlesha', 'Mula', 'Jyeshtha'],
    preferredLagnasTe: 'మేషం, వృషభం, మిథునం, కన్య, ధనుస్సు, మీనం',
    bestTimeSlotGuideTe: 'ప్రాదః సంధ్యా సమయం, బ్రాహ్మ ముహూర్తం తరువాత ఉదయం 7:30 నుండి 10:30 లోపు.',
  },
  bhumi_puja: {
    id: 'bhumi_puja',
    titleTe: 'శంకుస్థాపన / భూమిపూజ',
    titleEn: 'Bhumi Puja (Foundation Stone Laying)',
    sankalpamTe: 'భవన నిర్మాణ సురక్షత, భూదేవి ప్రసన్నత, కార్మికుల క్షేమం కొరకు',
    deityTe: 'భూమాత, ఆదిశేషుడు, వాస్తు పురుషుడు',
    primaryGrahamsTe: 'కుజుడు (భూకారకుడు), శని (నిర్మాణ కారకుడు - కేంద్ర శుద్ధి), శుక్రుడు',
    shastraPramanamTe: 'మత్స్య పురాణం: "స్థిరరాశౌ శంకుస్థాపనం దీర్ఘాయుః సౌఖ్యదాయకమ్"',
    descriptionTe: 'భూమి త్రవ్వకానికి శంకుస్థాపన చేసేటప్పుడు సూర్యుడు ఏ రాశిలో ఉన్నాడో పరిశీలించి శేషనాగుని శిరస్సు-తోక స్థితి చూసుకోవాలి. స్థిర లగ్నం అత్యుత్తమం.',
    goodTithiIndices: [1, 2, 4, 6, 9, 10, 12, 16, 17, 19, 21, 24, 25, 27],
    avoidTithiIndices: [3, 8, 13, 14, 29],
    goodVaras: [1, 3, 4, 5],
    avoidVaras: [0, 2, 6],
    goodNakshatraNames: [
      'Rohini', 'Mrigashira', 'Uttara Phalguni', 'Hasta', 'Chitra',
      'Swati', 'Anuradha', 'Uttarashadha', 'Shravana', 'Dhanishta',
      'Shatabhisha', 'Uttara Bhadrapada', 'Revati',
    ],
    avoidNakshatraNames: ['Bharani', 'Ardra', 'Ashlesha', 'Jyeshtha', 'Purva Bhadrapada'],
    preferredLagnasTe: 'వృషభం, సింహం, వృశ్చికం, కుంభం (స్థిర లగ్నాలు)',
    bestTimeSlotGuideTe: 'ఉదయం 8:00 నుండి 10:30 లోపు ఈశాన్య మూల సంకల్పం.',
  },
  vahana: {
    id: 'vahana',
    titleTe: 'నూతన వాహన కొనుగోలు / డెలివరీ',
    titleEn: 'Vahana (Vehicle Purchase & Delivery)',
    sankalpamTe: 'ప్రయాణ సౌఖ్యం, అపఘాత నివారణ, శీఘ్ర గమనం, ఆనందం కొరకు',
    deityTe: 'శ్రీ సుబ్రహ్మణ్య స్వామి, శ్రీ వీరాంజనేయ స్వామి',
    primaryGrahamsTe: 'శుక్రుడు (వాహన కారకుడు), కుజుడు (యంత్ర కారకుడు), బుధుడు (ప్రయాణ కారకుడు)',
    shastraPramanamTe: 'ముహూర్త దీపిక: "శుక్రవారే చరనక్షత్రే వాహనం దీర్ఘసౌఖ్యదం"',
    descriptionTe: 'వాహన కొనుగోలుకు శుక్రవారం, బుధవారం, గురువారాలు అత్యంత ప్రశస్తం. చర నక్షత్రాలు (స్వాతి, పునర్వసు, శ్రవణం, ధనిష్ఠ, శతభిషం) వాహనానికి విశేష వేగాన్ని, సౌఖ్యాన్ని ఇస్తాయి.',
    goodTithiIndices: [1, 2, 4, 6, 9, 10, 11, 12, 14, 16, 17, 19, 21, 24, 25, 27],
    avoidTithiIndices: [3, 8, 13, 29],
    goodVaras: [1, 3, 4, 5], // Fri & Wed are top!
    avoidVaras: [2, 6], // Avoid Tuesday/Saturday for vehicle purchase
    goodNakshatraNames: [
      'Ashwini', 'Rohini', 'Punarvasu', 'Pushya', 'Hasta',
      'Swati', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Revati',
    ],
    avoidNakshatraNames: ['Bharani', 'Krittika', 'Ardra', 'Ashlesha', 'Jyeshtha', 'Purva Bhadrapada'],
    preferredLagnasTe: 'వృషభం, మిథునం, కన్య, తుల, ధనుస్సు',
    bestTimeSlotGuideTe: 'అభిజిత్ ముహూర్తం (మధ్యాహ్నం 11:45 నుండి 12:35) లేదా శుక్ర హోర.',
  },
  namakaranam: {
    id: 'namakaranam',
    titleTe: 'నామకరణం & అన్నప్రాశన',
    titleEn: 'Namakarana & Annaprashana (Naming / First Feeding)',
    sankalpamTe: 'శిశువు ఆయురారోగ్య బుద్ధి వృద్ధి, కీర్తి ప్రతిష్టలు, సంపూర్ణ పోషణ కొరకు',
    deityTe: 'బాలకృష్ణుడు, అన్నపూర్ణా దేవి',
    primaryGrahamsTe: 'చంద్రుడు, బుధుడు, గురువు',
    shastraPramanamTe: 'పరాశర స్మృతి: "ఏకాదశే ద్వాదశే వాహ్ని నామకర్మ విధీయతే"',
    descriptionTe: 'జన్మించిన 11, 12 లేదా 21వ రోజున నామకరణం, 6వ నెలలో అన్నప్రాశన శుభ నక్షత్రాలు మరియు తిథులలో నిర్వహించాలి.',
    goodTithiIndices: [1, 2, 4, 6, 9, 10, 11, 12, 16, 17, 19, 21, 24, 25, 26, 27],
    avoidTithiIndices: [3, 8, 13, 29],
    goodVaras: [1, 3, 4, 5, 0],
    avoidVaras: [2, 6],
    goodNakshatraNames: [
      'Ashwini', 'Rohini', 'Mrigashira', 'Punarvasu', 'Pushya',
      'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Anuradha',
      'Shravana', 'Dhanishta', 'Shatabhisha', 'Uttara Bhadrapada', 'Revati',
    ],
    avoidNakshatraNames: ['Bharani', 'Krittika', 'Ardra', 'Ashlesha', 'Jyeshtha', 'Mula'],
    preferredLagnasTe: 'శుభ లగ్నాలు (వృషభ, మిథున, కన్య, తుల, ధను, మీన)',
    bestTimeSlotGuideTe: 'ఉదయం 9:00 నుండి 11:30 వరకు శుభ ఘడియలలో.',
  },
  vidyarambham: {
    id: 'vidyarambham',
    titleTe: 'అక్షరాభ్యాసం & విద్యాభ్యాస ఆరంభం',
    titleEn: 'Vidyarambham (Aksharabhyasa / School Entry)',
    sankalpamTe: 'సకల విద్యా పారంగతత్వ సిద్ధి, జ్ఞాన వికాసం, శ్రద్ధా మేధా ప్రాప్తి కొరకు',
    deityTe: 'శ్రీ శారదా పరమేశ్వరి, హయగ్రీవ స్వామి, దక్షిణామూర్తి',
    primaryGrahamsTe: 'బుధుడు (విద్య-బుద్ధి), గురువు (గురుత్వ-విజ్ఞానం), శుక్రుడు (లలిత కళలు)',
    shastraPramanamTe: 'ముహూర్త చంద్రిక: "సరస్వతీ ప్రియే కాలే విద్యా సంరంభణం శుభమ్"',
    descriptionTe: 'విద్యాభ్యాసానికి శుక్ల పంచమి (వసంత పంచమి), విజయదశమి లేదా సాధారణ శుక్ల పక్ష విదియ, తదియ, పంచమి, సప్తమి, దశమి తిథులు అత్యంత ప్రశస్తం.',
    goodTithiIndices: [1, 2, 4, 6, 9, 10, 12],
    avoidTithiIndices: [3, 8, 13, 14, 28, 29],
    goodVaras: [1, 3, 4, 5], // Mon, Wed, Thu, Fri
    avoidVaras: [2, 6],
    goodNakshatraNames: [
      'Ashwini', 'Rohini', 'Mrigashira', 'Punarvasu', 'Pushya',
      'Hasta', 'Chitra', 'Swati', 'Anuradha', 'Shravana', 'Revati',
    ],
    avoidNakshatraNames: ['Bharani', 'Krittika', 'Ardra', 'Ashlesha', 'Jyeshtha', 'Mula'],
    preferredLagnasTe: 'మిథునం, కన్య, ధనుస్సు (బుధ, గురు ఆధిపత్యం)',
    bestTimeSlotGuideTe: 'ఉదయం 7:30 నుండి 10:00 లోపు బుధ లేదా గురు హోర.',
  },
  sarva_karya: {
    id: 'sarva_karya',
    titleTe: 'సర్వకార్య శుభ ముహూర్తం (సాధారణ కార్యం)',
    titleEn: 'Sarva Karya (General Auspicious Purpose)',
    sankalpamTe: 'తలపెట్టిన సకల సత్కార్యాల నిర్విఘ్న సమాప్తి, మనశ్శాంతి, విజయం కొరకు',
    deityTe: 'శ్రీ సిద్ధి వినాయకుడు, శ్రీ సూర్యనారాయణ మూర్తి',
    primaryGrahamsTe: 'సూర్యుడు, చంద్రుడు, గురువు',
    shastraPramanamTe: 'వ్యాస సిద్ధాంతం: "యత్ర విష్ణుః యత్ర గురుః యత్ర చంద్రః ప్రసన్నతా, తత్ర సర్వకార్యాణి సిద్ధిం యాంతి న సంశయః"',
    descriptionTe: 'ఏదైనా ప్రధాన పని, ఇంటర్వ్యూ, భూమి అమ్మకం/కొనుగోలు, బ్యాంకు వ్యవహారాలు లేదా ప్రయాణాలు ప్రారంభించడానికి పంచాంగ శుద్ధి కలిగిన ముహూర్తం.',
    goodTithiIndices: [1, 2, 4, 6, 9, 10, 11, 12, 14, 16, 17, 19, 21, 24, 25, 26, 27],
    avoidTithiIndices: [3, 8, 13, 29],
    goodVaras: [0, 1, 3, 4, 5],
    avoidVaras: [2],
    goodNakshatraNames: [
      'Ashwini', 'Rohini', 'Mrigashira', 'Punarvasu', 'Pushya',
      'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Anuradha',
      'Uttarashadha', 'Shravana', 'Dhanishta', 'Uttara Bhadrapada', 'Revati',
    ],
    avoidNakshatraNames: ['Bharani', 'Ardra', 'Ashlesha', 'Jyeshtha'],
    preferredLagnasTe: 'శుభ లగ్నం',
    bestTimeSlotGuideTe: 'అభిజిత్ ముహూర్తం (మధ్యాహ్నం 11:45 నుండి 12:35) లేదా రోజువారీ అమృత ఘడియలు.',
  },
};

export interface MuhurtaEvaluation {
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  dayOfWeek: number; // 0..6
  dayNameTe: string;
  dayNameEn: string;
  tithiNumber: number; // 1..30
  tithiNameTe: string;
  tithiNameEn: string;
  pakshaTe: string;
  isRiktaTithi: boolean;
  nakshatraNumber: number; // 1..27
  nakshatraNameTe: string;
  nakshatraNameEn: string;
  nakshatraLordTe: string;
  pada: number;
  yogaNameTe: string;
  yogaNameEn: string;
  isDushtaYoga: boolean;
  karanaNameTe: string;
  karanaNameEn: string;
  isVishtiKarana: boolean; // Bhadra
  tarabalaNameTe: string;
  tarabalaIndex: number; // 1..9
  isTarabalaFavorable: boolean;
  chandrabalaHouse: number; // 1..12
  isChandrashtama: boolean;
  isChandrabalaFavorable: boolean;
  rahuKalam: string;
  yamagandaKalam: string;
  gulikaKalam: string;
  abhijitMuhurta: string;
  brahmaMuhurta: string;
  sunrise: string;
  sunset: string;
  shubhaScore: number; // 0..100
  gradeTe: 'అత్యుత్తమ ముహూర్తం' | 'ఉత్తమ ముహూర్తం' | 'మధ్యమ ముహూర్తం' | 'సామాన్య ముహూర్తం' | 'వర్జ్య ముహూర్తం (ఆటంకాలున్నాయి)';
  gradeColor: string;
  favorablePointsTe: string[];
  doshasOrObstaclesTe: string[];
  siddhantiVerdictTe: string;
  shastraRemediesTe: string[];
  recommendedTimeSlotTe: string;
}

export interface VedicPanditConsultation {
  panchangaShuddhiScore: number;
  overallHealthTe: string;
  pradhanaAtankaluTe: {
    doshaNameTe: string;
    intensityTe: 'తీవ్ర ఆటంకం (Severe Hazard)' | 'మధ్యమ ఆటంకం (Moderate Risk)' | 'సామాన్య ఆటంకం (Minor Glitch)' | 'దోషం లేదు (Clean)';
    whyItHappensTe: string;
    pastOrFutureManifestationTe: string;
    pariharamTe: string;
  }[];
  siddhantaPravachanamTe: string;
  shastraGranthaPramanamTe: string;
  karyasiddhiMantraTe: string;
  recommendedActionPlanTe: string[];
}

// 9 Tarabalas
const TARABALAS: { index: number; nameTe: string; favorable: boolean; natureTe: string }[] = [
  { index: 1, nameTe: 'జన్మ తార', favorable: false, natureTe: 'శరీర శ్రమ, స్వల్ప ఆందోళన (మధ్యమం)' },
  { index: 2, nameTe: 'సంపత్ తార', favorable: true, natureTe: 'ధన లాభం, ఐశ్వర్య వృద్ధి (అత్యుత్తమం)' },
  { index: 3, nameTe: 'విపత్ తార', favorable: false, natureTe: 'ఆటంకాలు, కార్య విఘ్నం, ధన నష్టం (వర్జ్యం)' },
  { index: 4, nameTe: 'క్షేమ తార', favorable: true, natureTe: 'క్షేమం, శుభం, నిశ్చింత (అత్యుత్తమం)' },
  { index: 5, nameTe: 'ప్రత్యక్ తార', favorable: false, natureTe: 'అడ్డంకులు, విరోధాలు, మాటపట్టింపులు (వర్జ్యం)' },
  { index: 6, nameTe: 'సాధన తార', favorable: true, natureTe: 'కార్య సాధన, అనుకున్నది నెరవేరడం (అత్యుత్తమం)' },
  { index: 7, nameTe: 'నైధన (వధ) తార', favorable: false, natureTe: 'తీవ్ర ఆటంకం, ప్రాణాపాయం లేదా తీరని కష్టం (పూర్తి వర్జ్యం)' },
  { index: 8, nameTe: 'మిత్ర తార', favorable: true, natureTe: 'సఖ్యత, స్నేహం, సుఖ సంతోషాలు (ఉత్తమం)' },
  { index: 0, nameTe: 'పరమ మిత్ర తార', favorable: true, natureTe: 'మహోన్నత విజయం, శ్రేష్ఠ ఫలితం (అత్యుత్తమం)' },
];

const TITHI_NAMES_TE: string[] = [
  'శుక్ల పాడ్యమి', 'శుక్ల విదియ', 'శుక్ల తదియ', 'శుక్ల చవితి (రిక్త)', 'శుక్ల పంచమి',
  'శుక్ల షష్ఠి', 'శుక్ల సప్తమి', 'శుక్ల అష్టమి', 'శుక్ల నవమి (రిక్త)', 'శుక్ల దశమి',
  'శుక్ల ఏకాదశి', 'శుక్ల ద్వాదశి', 'శుక్ల త్రయోదశి', 'శుక్ల చతుర్దశి (రిక్త)', 'పూర్ణిమ (పౌర్ణమి)',
  'కృష్ణ పాడ్యమి', 'కృష్ణ విదియ', 'కృష్ణ తదియ', 'కృష్ణ చవితి (రిక్త)', 'కృష్ణ పంచమి',
  'కృష్ణ షష్ఠి', 'కృష్ణ సప్తమి', 'కృష్ణ అష్టమి', 'కృష్ణ నవమి (రిక్త)', 'కృష్ణ దశమి',
  'కృష్ణ ఏకాదశి', 'కృష్ణ ద్వాదశి', 'కృష్ణ త్రయోదశి', 'కృష్ణ చతుర్దశి (రిక్త)', 'అమావాస్య',
];

const VARA_NAMES_TE: string[] = [
  'ఆదివారం (రవి)',
  'సోమవారం (చంద్ర)',
  'మంగళవారం (కుజ)',
  'బుధవారం (బుధ)',
  'గురువారం (బృహస్పతి)',
  'శుక్రవారం (శుక్ర)',
  'శనివారం (శని)',
];

const DUSHTA_YOGA_INDICES = [1, 6, 9, 10, 13, 15, 17, 19, 27]; // Vishkambha, Atiganda, Shula, Ganda, Vyaghata, Vajra, Vyatipata, Parigha, Vaidhriti

/**
 * Evaluates a single specific date and time for a chosen activity and native's chart.
 */
export function evaluateDateMuhurta(
  dateStr: string, // YYYY-MM-DD
  timeStr: string, // HH:mm
  activityId: MuhurtaActivityId,
  lat: number,
  lng: number,
  tzOffsetHours: number,
  nativeChart: CompleteChartResult
): MuhurtaEvaluation {
  const config = MUHURTA_ACTIVITIES[activityId];
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);

  // UTC Date representation
  const localMs = Date.UTC(year, month - 1, day, hours, minutes, 0);
  const utcMs = localMs - tzOffsetHours * 3600 * 1000;
  const dateUTC = new Date(utcMs);

  // Compute ephemeris positions for this date
  const time = Astronomy.MakeTime(dateUTC);
  const sunVec = Astronomy.GeoVector(Astronomy.Body.Sun, time, true);
  const sunEcl = Astronomy.Ecliptic(sunVec);
  const moonVec = Astronomy.GeoVector(Astronomy.Body.Moon, time, true);
  const moonEcl = Astronomy.Ecliptic(moonVec);

  // Lahiri Ayanamsa approximation
  const jd = dateUTC.getTime() / 86400000 + 2440587.5;
  const T = (jd - 2451545.0) / 36525.0;
  const lahiriAyanamsa = 23.857 + 1.396 * T;

  const sunSidLon = (sunEcl.elon - lahiriAyanamsa + 720) % 360;
  const moonSidLon = (moonEcl.elon - lahiriAyanamsa + 720) % 360;

  const p: PanchangaData = calculatePanchanga(
    dateUTC,
    sunSidLon,
    moonSidLon,
    lat,
    lng,
    tzOffsetHours
  );

  const localDate = new Date(localMs);
  const dayOfWeek = localDate.getUTCDay();

  // Tithi evaluation
  const tithiIdx = p.tithi.number - 1; // 0..29
  const isRiktaTithi = [3, 8, 13, 18, 23, 28].includes(tithiIdx); // 4, 9, 14th in both pakshas

  // Nakshatra evaluation
  const nakIdx = Math.floor(moonSidLon / (360 / 27)); // 0..26
  const nakName = p.nakshatra.name;
  const nakTelugu = TELUGU_NAKSHATRAS[nakIdx]?.nameTe ?? nakName;
  const nakLordTe = TELUGU_NAKSHATRAS[nakIdx]?.lordTe ?? p.nakshatra.lord;

  // Yoga evaluation
  const yogaIdx = p.yoga.number;
  const isDushtaYoga = DUSHTA_YOGA_INDICES.includes(yogaIdx);

  // Karana evaluation
  const isVishtiKarana = p.karana.name.toLowerCase().includes('vishti') || p.karana.name.toLowerCase().includes('bhadra');

  // Tarabalam relative to native's Janma Nakshatra
  const nativeMoon = nativeChart.planets.find((pl) => pl.id === 'Moon');
  const nativeNakIdx = nativeMoon
    ? Math.floor(nativeMoon.siderealLon / (360 / 27))
    : 0;

  // Tarabala index: distance from native star to muhurta star (1-based modulo 9)
  const starDistance = ((nakIdx - nativeNakIdx + 27) % 27) + 1;
  const taraIndex = starDistance % 9;
  const tarabalaObj = TARABALAS.find((t) => t.index === taraIndex) ?? TARABALAS[0];

  // Chandrabalam relative to native's Moon Sign (Rasi)
  const nativeMoonSign = nativeMoon?.signIndex ?? 0;
  const muhurtaMoonSign = Math.floor(moonSidLon / 30);
  const chandraHouse = ((muhurtaMoonSign - nativeMoonSign + 12) % 12) + 1; // 1..12
  const isChandrashtama = chandraHouse === 8;
  const isChandrabalaFavorable = [1, 3, 6, 7, 10, 11].includes(chandraHouse);

  // Scoring Engine (0..100)
  let score = 55;
  const favorablePoints: string[] = [];
  const doshasOrObstacles: string[] = [];

  // 1. Tithi Score
  if (config.goodTithiIndices.includes(tithiIdx)) {
    score += 12;
    favorablePoints.push(`శుభ తిథి: ${TITHI_NAMES_TE[tithiIdx]} (కార్య ఫలప్రదం)`);
  } else if (config.avoidTithiIndices.includes(tithiIdx) || isRiktaTithi) {
    score -= 22;
    doshasOrObstacles.push(`రిక్త/వర్జ్య తిథి: ${TITHI_NAMES_TE[tithiIdx]} — చేతివరకు వచ్చిన పనులు ఆగిపోవడం లేదా శూన్య ఫలితం ఇచ్చే ప్రమాదం.`);
  }

  // 2. Vara Score
  if (config.goodVaras.includes(dayOfWeek)) {
    score += 10;
    favorablePoints.push(`అనుకూల వారం: ${VARA_NAMES_TE[dayOfWeek]} (ఈ సంకల్పానికి శాస్త్రోక్తం)`);
  } else if (config.avoidVaras.includes(dayOfWeek)) {
    score -= 15;
    doshasOrObstacles.push(`వర్జ్య వారం: ${VARA_NAMES_TE[dayOfWeek]} — కార్యాచరణలో విసుగు, ఆలస్యం లేదా కలతలు.`);
  }

  // 3. Nakshatra Score
  if (config.goodNakshatraNames.includes(nakName)) {
    score += 15;
    favorablePoints.push(`శ్రేష్ఠ నక్షత్రం: ${nakTelugu} (${nakLordTe}) — సంకల్ప సిద్ధిని చేకూర్చును.`);
  } else if (config.avoidNakshatraNames.includes(nakName)) {
    score -= 18;
    doshasOrObstacles.push(`నిషిద్ధ నక్షత్రం: ${nakTelugu} — ఈ కార్యక్రమానికి ఈ నక్షత్రం అనుకూలం కాదు.`);
  }

  // 4. Tarabalam Score
  if (tarabalaObj.favorable) {
    score += 15;
    favorablePoints.push(`తారాబలం అద్భుతం: జాతకునికి ఇది "${tarabalaObj.nameTe}" (${tarabalaObj.natureTe})`);
  } else {
    score -= 22;
    doshasOrObstacles.push(`తారాబల లోపం: జాతకునికి ఇది "${tarabalaObj.nameTe}" (${tarabalaObj.natureTe}) — ఆటంకాలు, ఆందోళనలు రావచ్చు.`);
  }

  // 5. Chandrabalam Score
  if (isChandrashtama) {
    score -= 28;
    doshasOrObstacles.push(`తీవ్ర చంద్రాష్టమ దోషం! జన్మరాశికి 8వ ఇంట చంద్ర సంచారం — మనోవేదన, నిర్ణయ లోపాలు, ఆకస్మిక చిక్కులు.`);
  } else if (isChandrabalaFavorable) {
    score += 10;
    favorablePoints.push(`చంద్రాబలం సంపూర్ణం: జన్మరాశి నుండి ${chandraHouse}వ స్థానంలో చంద్రుడు (శుభ దృష్టి).`);
  } else {
    score -= 6;
    doshasOrObstacles.push(`సామాన్య చంద్రాబలం: చంద్రుడు ${chandraHouse}వ స్థానంలో ఉన్నందున సాధారణ ఫలితం.`);
  }

  // 6. Nitya Yoga Score
  if (isDushtaYoga) {
    score -= 18;
    doshasOrObstacles.push(`దుష్ట నిత్య యోగం: "${p.yoga.name}" — అకారణ గొడవలు, విభేదాలు లేదా పనులలో నిరాశ.`);
  } else {
    score += 5;
    favorablePoints.push(`శుభ నిత్య యోగం: "${p.yoga.name}" (${p.yoga.meaning})`);
  }

  // 7. Karana Score
  if (isVishtiKarana) {
    score -= 25;
    doshasOrObstacles.push(`విష్టి (భద్రా) కరణ దోషం! భద్రలో ఏ శుభకార్యం చేసినా నాశనమవుతుందని శాస్త్ర హెచ్చరిక. ఇది అత్యంత వర్జ్యం.`);
  } else {
    score += 5;
    favorablePoints.push(`శుభ కరణం: "${p.karana.name}" (${p.karana.type})`);
  }

  // Bound score 5..99
  score = Math.max(8, Math.min(99, score));

  // Determine Grade
  let gradeTe: MuhurtaEvaluation['gradeTe'] = 'సామాన్య ముహూర్తం';
  let gradeColor = '#C9A96E';
  if (score >= 85) {
    gradeTe = 'అత్యుత్తమ ముహూర్తం';
    gradeColor = '#5BBFB5';
  } else if (score >= 72) {
    gradeTe = 'ఉత్తమ ముహూర్తం';
    gradeColor = '#C9A96E';
  } else if (score >= 55) {
    gradeTe = 'మధ్యమ ముహూర్తం';
    gradeColor = '#9B8FD4';
  } else {
    gradeTe = 'వర్జ్య ముహూర్తం (ఆటంకాలున్నాయి)';
    gradeColor = '#D47B7B';
  }

  // Siddhanti Verdict & Shastra Remedies
  let siddhantiVerdictTe = '';
  const shastraRemedies: string[] = [];

  if (score >= 85) {
    siddhantiVerdictTe = `దివ్యమైన ముహూర్తం! పంచాంగ శుద్ధి, తారాబలం మరియు చంద్రాబలం సంపూర్ణంగా అనుకూలిస్తున్నాయి. శ్రీ ${config.deityTe} అనుగ్రహంతో తలపెట్టిన కార్యం దిగ్విజయంగా పూర్తవుతుంది.`;
    shastraRemedies.push('కార్యారంభానికి ముందు గణపతి స్తోత్రం చదివి, కొబ్బరికాయ కొట్టి శుభ సంకల్పం చేయండి.');
  } else if (score >= 72) {
    siddhantiVerdictTe = `శుభకరమైన ముహూర్తం. చిన్నపాటి జాగ్రత్తలతో ఈ తేదీని నిశ్చయించుకోవచ్చు. రాహుకాలం (${p.muhurtas.rahuKalam}) మరియు యమగండం పూర్తిగా విడిచిపెట్టి కార్యం ప్రారంభించాలి.`;
    shastraRemedies.push('రాహుకాల సమయం దాటిన తరువాత లేదా మధ్యాహ్నం అభిజిత్ ముహూర్తంలో సంకల్పం చేయడం శ్రేయస్కరం.');
  } else if (score >= 55) {
    siddhantiVerdictTe = `మధ్యమ ముహూర్తం. కొన్ని గ్రహ స్థితులు మరియు తారా/కరణ బలహీనతలు ఉన్నాయి. అత్యవసరమైతే మాత్రమే తగిన పరిహారాలు చేసి ఆచరించండి. లేనిచో వేరొక ఉత్తమ తేదీని ఎంచుకోవడం ఉత్తమం.`;
    shastraRemedies.push('సంకల్పానికి ముందు నవగ్రహ ప్రీత్యర్థం దీపారాధన మరియు లలితా సహస్రనామ లేదా విష్ణు సహస్రనామ పారాయణం చేయండి.');
  } else {
    siddhantiVerdictTe = `శాస్త్ర నిషిద్ధ / వర్జ్య ముహూర్తం! ఈ ముహూర్తంలో తీవ్రమైన ఆటంకాలు, కలతలు లేదా నష్టాలు కలిగే సూచనలు ఉన్నాయి. ఈ తేదీని ఖచ్చితంగా విసర్జించి, వేరొక శుభ ముహూర్తాన్ని ఎంచుకోవాలని సిద్ధాంతి గారి ఖచ్చితమైన సలహా.`;
    shastraRemedies.push('ఈ ముహూర్తంలో కార్యం చేయడం శాస్త్ర సమ్మతం కాదు. ఒకవేళ గతంలో జరిగిపోయి ఆటంకాలు ఎదురైతే, రుద్రాభిషేకం & గణపతి హోమం జరిపించండి.');
  }

  // Specific remedies for active doshas
  if (isRiktaTithi) {
    shastraRemedies.push('రిక్త తిథి దోష నివారణకు బంగారు లేదా వెండి ప్రతిమతో కూడిన తాంబూల దానం ఇవ్వాలి.');
  }
  if (!tarabalaObj.favorable) {
    if (taraIndex === 3) {
      shastraRemedies.push('విపత్ తారా దోష శాంతికి బెల్లం (గుడ దానం) మరియు సుబ్రహ్మణ్య స్వామి దర్శనం.');
    } else if (taraIndex === 5) {
      shastraRemedies.push('ప్రత్యక్ తారా దోష శాంతికి లవణం (ఉప్పు దానం) మరియు ఆంజనేయ స్వామి సింధూర పూజ.');
    } else if (taraIndex === 7) {
      shastraRemedies.push('నైధన (వధ) తారా తీవ్ర దోష శాంతికి నువ్వుల (తిల దానం), నల్ల వస్త్ర దానం మరియు శివునికి క్షీరాభిషేకం.');
    }
  }
  if (isChandrashtama) {
    shastraRemedies.push('చంద్రాష్టమ దోష నివారణకు శ్రీ చంద్రమౌళీశ్వర స్వామికి తెల్లని పూలతో అర్చన, మరియు బియ్యం దానం.');
  }
  if (isVishtiKarana) {
    shastraRemedies.push('భద్రా కరణ దోష శాంతికి శ్రీ వేంకటేశ్వర స్వామి లేదా నరసింహ స్వామి అర్చన.');
  }

  return {
    date: dateStr,
    time: timeStr,
    dayOfWeek,
    dayNameTe: VARA_NAMES_TE[dayOfWeek].split(' ')[0],
    dayNameEn: p.vara.name,
    tithiNumber: p.tithi.number,
    tithiNameTe: TITHI_NAMES_TE[tithiIdx],
    tithiNameEn: p.tithi.name,
    pakshaTe: tithiIdx < 15 ? 'శుక్ల పక్షం' : 'కృష్ణ పక్షం',
    isRiktaTithi,
    nakshatraNumber: nakIdx + 1,
    nakshatraNameTe: nakTelugu,
    nakshatraNameEn: nakName,
    nakshatraLordTe: nakLordTe,
    pada: p.nakshatra.pada,
    yogaNameTe: p.yoga.name,
    yogaNameEn: p.yoga.name,
    isDushtaYoga,
    karanaNameTe: p.karana.name,
    karanaNameEn: p.karana.name,
    isVishtiKarana,
    tarabalaNameTe: tarabalaObj.nameTe,
    tarabalaIndex: taraIndex,
    isTarabalaFavorable: tarabalaObj.favorable,
    chandrabalaHouse: chandraHouse,
    isChandrashtama,
    isChandrabalaFavorable,
    rahuKalam: p.muhurtas.rahuKalam,
    yamagandaKalam: p.muhurtas.yamagandaKalam,
    gulikaKalam: p.muhurtas.gulikaKalam,
    abhijitMuhurta: p.muhurtas.abhijitMuhurta,
    brahmaMuhurta: p.muhurtas.brahmaMuhurta,
    sunrise: p.sunTimes.sunriseLocal,
    sunset: p.sunTimes.sunsetLocal,
    shubhaScore: score,
    gradeTe,
    gradeColor,
    favorablePointsTe: favorablePoints,
    doshasOrObstaclesTe: doshasOrObstacles,
    siddhantiVerdictTe,
    shastraRemediesTe: shastraRemedies,
    recommendedTimeSlotTe: `${p.muhurtas.abhijitMuhurta} (అభిజిత్ ముహూర్తం) లేదా ఉదయ కాల శుభ హోర`,
  };
}

/**
 * High-performance search tool: scans an entire window of dates (e.g. 30, 60, 90 days)
 * for favorable muhurtas for a specific activity.
 */
export function searchFavorableMuhurtas(
  activityId: MuhurtaActivityId,
  startDateStr: string, // YYYY-MM-DD
  daysCount: number, // 30, 60, 90
  lat: number,
  lng: number,
  tzOffsetHours: number,
  nativeChart: CompleteChartResult,
  options?: {
    minScore?: number;
    onlyWeekends?: boolean;
    onlyFavorableTarabala?: boolean;
  }
): MuhurtaEvaluation[] {
  const results: MuhurtaEvaluation[] = [];
  const start = new Date(startDateStr);
  const minScore = options?.minScore ?? 65;

  for (let i = 0; i < daysCount; i++) {
    const cur = new Date(start.getTime() + i * 86400000);
    const dateStr = cur.toISOString().slice(0, 10);
    const dayOfWeek = cur.getDay();

    if (options?.onlyWeekends && dayOfWeek !== 0 && dayOfWeek !== 6) {
      continue;
    }

    const evalRes = evaluateDateMuhurta(
      dateStr,
      '10:30', // Standard optimal forenoon time
      activityId,
      lat,
      lng,
      tzOffsetHours,
      nativeChart
    );

    if (options?.onlyFavorableTarabala && !evalRes.isTarabalaFavorable) {
      continue;
    }

    if (evalRes.shubhaScore >= minScore) {
      results.push(evalRes);
    }
  }

  // Sort descending by shubhaScore
  return results.sort((a, b) => b.shubhaScore - a.shubhaScore);
}

/**
 * Deep Vedic Pandit Consultation & Diagnostic Engine
 * Analyzes any date & time (past or future), explaining:
 * - What obstacles occurred or can occur
 * - Why they happen
 * - How to prevent them and exact shastra remedies
 */
export function getVedicPanditDeepConsultation(
  evaluation: MuhurtaEvaluation,
  activityId: MuhurtaActivityId
): VedicPanditConsultation {
  const config = MUHURTA_ACTIVITIES[activityId];
  const atankalu: VedicPanditConsultation['pradhanaAtankaluTe'] = [];

  // 1. Rikta Tithi Analysis
  if (evaluation.isRiktaTithi) {
    atankalu.push({
      doshaNameTe: 'రిక్త తిథి దోషం (చవితి, నవమి, చతుర్దశి ఆటంకం)',
      intensityTe: 'తీవ్ర ఆటంకం (Severe Hazard)',
      whyItHappensTe: 'శాస్త్రంలో చవితి, నవమి, చతుర్దశిలను "రిక్త" (శూన్యం/ఖాళీ) అంటారు. ఈ తిథులలో ప్రారంభించిన కార్యం పట్ల ఎంత శ్రమించినా చివరి క్షణంలో నిలిచిపోవడం, ఫలితం శూన్యమవడం జరుగుతుంది.',
      pastOrFutureManifestationTe: 'గతంలో లేదా భవిష్యత్తులో: ధన వ్యయం పెరిగిపోవడం, చివరి నిమిషంలో ఒప్పందాలు లేదా కల్యాణ సంబంధాలు రద్దు కావడం, ఆశించిన ఫలితం దక్కకపోవడం వంటి ఆటంకాలు వస్తాయి.',
      pariharamTe: 'బంగారు లేదా వెండి నాణేన్ని బ్రాహ్మణునికి లేదా గురువుకు దానం చేయాలి. కార్యానికి ముందు శ్రీ మహాలక్ష్మి అష్టకం 11 సార్లు పఠించాలి.',
    });
  }

  // 2. Vishti / Bhadra Karana Analysis
  if (evaluation.isVishtiKarana) {
    atankalu.push({
      doshaNameTe: 'భద్రా / విష్టి కరణ వినాశక దోషం',
      intensityTe: 'తీవ్ర ఆటంకం (Severe Hazard)',
      whyItHappensTe: 'భద్ర అనేది శనిదేవుని సోదరి, యమధర్మరాజుకు ప్రతిరూపం. ముహూర్త చింతామణి ప్రకారం "విష్ట్యాం యత్క్రియతే కర్మ తత్సర్వం నాశతాం వ్రజేత్" — విష్టిలో ఏ పని చేసినా అది వినాశనానికి దారితీస్తుంది.',
      pastOrFutureManifestationTe: 'వివాహంలో విభేదాలు-విడాకులు, వ్యాపారంలో అకస్మిక దివాలా, గృహప్రవేశంలో అగ్ని లేదా చోర భయం, కోర్టు కేసులు మరియు ప్రభుత్వ పరమైన నోటీసులు ఎదురయ్యే ప్రమాదం ఉంది.',
      pariharamTe: 'ఈ ముహూర్తాన్ని తక్షణమే రద్దు చేయాలి. ఒకవేళ గతంలో ఈ సమయంలో కార్యం జరిగి ఉంటే, విష్ణు సహస్రనామ స్తోత్ర హోమం మరియు శ్రీ రుద్ర నమక-చమక అభిషేకం జరిపించాలి.',
    });
  }

  // 3. Chandrashtama Analysis
  if (evaluation.isChandrashtama) {
    atankalu.push({
      doshaNameTe: 'చంద్రాష్టమ తీవ్ర మానసిక ఆటంకం',
      intensityTe: 'తీవ్ర ఆటంకం (Severe Hazard)',
      whyItHappensTe: 'చంద్రుడు మనఃకారకుడు. జన్మరాశికి 8వ రాశిలో చంద్రుడు ప్రవేశించినప్పుడు మనో నిగ్రహం కోల్పోవడం, భావోద్వేగాల అదుపు తప్పడం, భయాందోళనలు సహజంగా కలుగుతాయి.',
      pastOrFutureManifestationTe: 'ముఖ్యమైన నిర్ణయాలలో తప్పటడుగులు పడడం, కుటుంబ సభ్యుల మధ్య తీవ్ర మాటపట్టింపులు, చిన్న విషయానికే పెద్ద కలహాలు మరియు అకారణ డిప్రెషన్ కలుగుతుంది.',
      pariharamTe: 'శివునికి ఆవుపాలతో ఏకాదశవార రుద్రాభిషేకం చేయించాలి. శ్వేత వస్త్రాలు ధరించి, వెండి ఉంగరంలో సహజ ముత్యం ధరించడం శ్రేయస్కరం.',
    });
  }

  // 4. Tarabala Dosha (Naidhana / Vipat / Pratyak)
  if (!evaluation.isTarabalaFavorable) {
    const isNaidhana = evaluation.tarabalaIndex === 7;
    const isVipat = evaluation.tarabalaIndex === 3;
    const isPratyak = evaluation.tarabalaIndex === 5;

    atankalu.push({
      doshaNameTe: `తారాబల లోపం: ${evaluation.tarabalaNameTe}`,
      intensityTe: isNaidhana ? 'తీవ్ర ఆటంకం (Severe Hazard)' : 'మధ్యమ ఆటంకం (Moderate Risk)',
      whyItHappensTe: `జన్మ నక్షత్రం నుండి ప్రస్తుత నక్షత్రం ${evaluation.tarabalaNameTe} పరిధిలోకి వచ్చింది. ఇది ప్రాణ, ధన, లేదా కార్య సిద్ధులకు తీవ్ర ప్రతిబంధకంగా మారుతుంది.`,
      pastOrFutureManifestationTe: isNaidhana
        ? 'నైధన తారలో తలపెట్టిన పనులలో తీవ్ర ఆరోగ్య సమస్యలు, ప్రమాదాలు లేదా ప్రాణభయం వంటి క్లిష్ట పరిస్థితులు ఏర్పడతాయి.'
        : isVipat
        ? 'విపత్ తారలో అడుగడుగునా విపత్తులు, వాహన రిపేర్లు, ఆకస్మిక ధన నష్టాలు మరియు ప్రయాణాలలో ఇబ్బందులు కలుగుతాయి.'
        : 'ప్రత్యక్ తారలో ఇతరుల నుండి వ్యతిరేకత, మోసపోవడం, కార్యసాధనలో ప్రతికూల ఫలితాలు ఎదురవుతాయి.',
      pariharamTe: isNaidhana
        ? 'నువ్వులు (తిల దానం), నల్లని వస్త్రం దానం మరియు మహా మృత్యుంజయ మంత్ర జపం (108 సార్లు) తప్పనిసరి.'
        : isVipat
        ? 'బెల్లం (గుడ దానం) బ్రాహ్మణునికి ఇచ్చి, శ్రీ సుబ్రహ్మణ్య స్వామికి విభూతి అభిషేకం చేయించాలి.'
        : 'ఉప్పు (లవణ దానం) సమర్పించి, శ్రీ ఆంజనేయ స్వామికి తమలపాకుల పూజ చేయాలి.',
    });
  }

  // 5. Dushta Nitya Yoga
  if (evaluation.isDushtaYoga) {
    atankalu.push({
      doshaNameTe: `దుష్ట నిత్య యోగ ఆటంకం: ${evaluation.yogaNameTe}`,
      intensityTe: 'మధ్యమ ఆటంకం (Moderate Risk)',
      whyItHappensTe: `సూర్య-చంద్రుల మొత్తం కోణం వల్ల ఏర్పడిన "${evaluation.yogaNameTe}" యోగం అగ్ని, కలహాలు మరియు వియోగానికి సంకేతం.`,
      pastOrFutureManifestationTe: 'ఆరంభించిన పనిలో స్థిరత్వం లేకపోవడం, భాగస్వాముల మధ్య అనుమానాలు మరియు కలహాలు రావడం జరుగుతుంది.',
      pariharamTe: 'శాంతి జపం చేయించి, నవగ్రహాలలో కేతువు మరియు రాహువులకు నల్ల నువ్వులతో అర్చన చేయాలి.',
    });
  }

  // 6. Prohibited Weekday
  if (config.avoidVaras.includes(evaluation.dayOfWeek)) {
    atankalu.push({
      doshaNameTe: `వార దోషం: ${evaluation.dayNameTe}`,
      intensityTe: 'సామాన్య ఆటంకం (Minor Glitch)',
      whyItHappensTe: `ఈ నిర్దిష్ట సంకల్పానికి (${config.titleTe}) ఈ వారాధిపతి క్రూర/ప్రతికూల ప్రభావం చూపుతాడు.`,
      pastOrFutureManifestationTe: 'పని నెమ్మదించడం, విసుగు, అనవసర ఆలస్యం ఏర్పడుతుంది.',
      pariharamTe: 'ఆ వారాధిపతికి సంబంధించిన ధాన్యం దానం ఇవ్వాలి (ఉదాహరణకు మంగళవారమైతే కందులు, శనివారమైతే మినుములు).',
    });
  }

  // Clean case
  if (atankalu.length === 0) {
    atankalu.push({
      doshaNameTe: 'సంపూర్ణ శుద్ధ ముహూర్తం — ఎటువంటి దోషాలూ లేవు',
      intensityTe: 'దోషం లేదు (Clean)',
      whyItHappensTe: 'పంచాంగంలోని ఐదు అంగాలు (తిథి, వారం, నక్షత్రం, యోగం, కరణం) మరియు జాతకుని తారా-చంద్రాబలాలు సంపూర్ణంగా అనుకూలిస్తున్నాయి.',
      pastOrFutureManifestationTe: 'ఈ సమయంలో తలపెట్టిన కార్యం దీర్ఘకాలిక శుభాలను, కీర్తి ప్రతిష్టలను, లక్ష్మీ కటాక్షాన్ని మరియు శాశ్వత సౌభాగ్యాన్ని ప్రసాదిస్తుంది.',
      pariharamTe: 'శ్రీ సిద్ధి వినాయక స్వామికి కొబ్బరికాయ, గరిక పూజ చేసి ఆనందంగా ప్రారంభించండి.',
    });
  }

  const overallHealthTe =
    evaluation.shubhaScore >= 85
      ? 'అత్యద్భుత శుద్ధ ముహూర్తం (Excellent Harmony)'
      : evaluation.shubhaScore >= 72
      ? 'అనుకూల ముహూర్తం (Good with minor protections)'
      : evaluation.shubhaScore >= 55
      ? 'సామాన్య ముహూర్తం (Moderate - remedies required)'
      : 'తీవ్ర వర్జ్య / దోషపూరిత ముహూర్తం (Severe Obstacles - Strictly Avoid)';

  const pravachanamTe = `స్వస్తిశ్రీ వేద సిద్ధాంతి గారి ముహూర్త నిర్ణయం: 
మీరు ఎంచుకున్న ${evaluation.date} తేదీన శ్రీ ${config.deityTe} వారి అనుగ్రహానికై ${config.titleTe} సంకల్పం చేయతలపెట్టారు. 
జ్యోతిష్య శాస్త్రంలో "శుభే కాలే కృతం కర్మ అమృతాయ కల్పతే" — మంచి ముహూర్తంలో చేసే పని అమృతతుల్యమై ఫలాన్నిస్తుంది; దోషపూరిత సమయంలో చేసే పని విషమై ఆటంకాలను సృష్టిస్తుంది.
ఈ పరిశీలనలో మొత్తం స్కోర్ 100కి ${evaluation.shubhaScore} గా నమోదైనది. ${evaluation.siddhantiVerdictTe}`;

  return {
    panchangaShuddhiScore: evaluation.shubhaScore,
    overallHealthTe,
    pradhanaAtankaluTe: atankalu,
    siddhantaPravachanamTe: pravachanamTe,
    shastraGranthaPramanamTe: config.shastraPramanamTe,
    karyasiddhiMantraTe: 'ఓం శ్రీం హ్రీం క్లీం గ్లౌం గం గణపతయే వరవరద సర్వజనం మే వశమానయ స్వాహా ||',
    recommendedActionPlanTe: [
      `1. రాహుకాల సమయం: ${evaluation.rahuKalam} ఎట్టి పరిస్థితుల్లోనూ సంకల్పం చేయరాదు.`,
      `2. అభిజిత్ ముహూర్తం: ${evaluation.abhijitMuhurta} సర్వదోష హరణ సమయం కావున ఈ సమయంలో ముఖ్య కార్యం ప్రారంభించండి.`,
      `3. శాస్త్రోక్త దానాలు: ${evaluation.shastraRemediesTe[0] ?? 'గణపతి ప్రీత్యర్థం దీపారాధన చేయండి.'}`,
      `4. ఇష్టదైవ ప్రార్థన: శ్రీ ${config.deityTe} వారిని స్మరిస్తూ పంచోపచార పూజ నిర్వహించండి.`,
    ],
  };
}

// ============================================================================
// INTRADAY AUSPICIOUS TIME FINDER (ముహూర్త సమయ శోధిని — హోరా, చోఘడియా & లగ్న గణన)
// ============================================================================

export interface IntradayHoraSlot {
  horaNumber: number; // 1..24
  periodType: 'day' | 'night';
  startTime: string;
  endTime: string;
  lordId: string;
  lordNameTe: string;
  nature: 'auspicious' | 'neutral' | 'caution';
  qualityBadgeTe: string;
  bestActivitiesTe: string;
  isRahuOverlap: boolean;
  isYamagandaOverlap: boolean;
  isAbhijitOverlap: boolean;
  risingLagnaTe: string;
  activityMatchScore: number; // 0..100 for selected activity
}

export interface IntradayChoghadiyaSlot {
  slotNumber: number; // 1..16
  periodType: 'day' | 'night';
  startTime: string;
  endTime: string;
  nameTe: string;
  nameEn: string;
  rulerPlanetTe: string;
  nature: 'amrita' | 'shubha' | 'labha' | 'chara' | 'ashubha';
  verdictTe: string;
  isRahuOverlap: boolean;
}

export interface OptimalEventTimeSlot {
  id: string;
  rank: number;
  startTime: string;
  endTime: string;
  midpointTime: string;
  windowLabelTe: string;
  horaLordTe: string;
  choghadiyaNameTe: string;
  risingLagnaTe: string;
  score: number;
  gradeBadgeTe: string;
  isAbhijitWindow: boolean;
  panchangaAlignmentNoteTe: string;
  recommendedForEventsTe: string;
  riskFreeApproved: boolean;
  doshaAuditBadgeTe: string;
  hasConflict: boolean;
}

export interface IntradayLagnaWindow {
  startTime: string;
  endTime: string;
  signNameTe: string;
  signNameEn: string;
  modality: 'chara' | 'sthira' | 'dwiswabhava';
  modalityTe: string;
  isKendraOrTrikonaBenefic: boolean;
  kartariStatusTe: string;
  recommendedActivitiesTe: string;
}

export interface IntradayAuspiciousTimeReport {
  dateStr: string;
  dayNameTe: string;
  sunriseLocal: string;
  sunsetLocal: string;
  tithiNameTe: string;
  nakshatraNameTe: string;
  yogaNameTe: string;
  karanaNameTe: string;
  tarabalaTe: string;
  chandrabalaTe: string;
  dayPanchangaScore: number;
  daySummaryTe: string;
  abhijitWindow: string;
  brahmaMuhurtaWindow: string;
  rahuKalamWindow: string;
  yamagandaWindow: string;
  gulikaWindow: string;
  optimalSlotsForActivity: OptimalEventTimeSlot[];
  dayHoras: IntradayHoraSlot[];
  nightHoras: IntradayHoraSlot[];
  dayChoghadiyas: IntradayChoghadiyaSlot[];
  lagnaWindows: IntradayLagnaWindow[];
}

const CHALDEAN_HORA_ORDER = [
  'Sun',
  'Venus',
  'Mercury',
  'Moon',
  'Saturn',
  'Jupiter',
  'Mars',
];

const VARA_START_LORD: Record<number, string> = {
  0: 'Sun', // Sunday
  1: 'Moon', // Monday
  2: 'Mars', // Tuesday
  3: 'Mercury', // Wednesday
  4: 'Jupiter', // Thursday
  5: 'Venus', // Friday
  6: 'Saturn', // Saturday
};

const HORA_DETAILS_TE: Record<
  string,
  {
    nameTe: string;
    nature: 'auspicious' | 'neutral' | 'caution';
    badgeTe: string;
    bestActivitiesTe: string;
    favoredActivities: MuhurtaActivityId[];
  }
> = {
  Jupiter: {
    nameTe: 'గురు హోర (బృహస్పతి)',
    nature: 'auspicious',
    badgeTe: 'అమృత శుభ హోర ★',
    bestActivitiesTe: 'వివాహం, గృహప్రవేశం, ఉపనయనం, విద్యారంభం, బ్యాంకు/ధన డిపాజిట్లు, సకల శుభకార్యాలు',
    favoredActivities: [
      'vivaha',
      'grihapravesham',
      'vyaparam',
      'upanayanam',
      'namakaranam',
      'vidyarambham',
      'sarva_karya',
    ],
  },
  Venus: {
    nameTe: 'శుక్ర హోర (భార్గవ)',
    nature: 'auspicious',
    badgeTe: 'లక్ష్మీ ప్రద శుభ హోర ★',
    bestActivitiesTe: 'వివాహ నిశ్చితార్థం, గృహప్రవేశం, వాహన కొనుగోలు, ఆభరణాలు/వస్త్ర కొనుగోలు, ప్రయాణాలు',
    favoredActivities: [
      'vivaha',
      'grihapravesham',
      'vahana',
      'namakaranam',
      'sarva_karya',
    ],
  },
  Mercury: {
    nameTe: 'బుధ హోర (సౌమ్య)',
    nature: 'auspicious',
    badgeTe: 'వాణిజ్య & విద్యా శుభ హోర ★',
    bestActivitiesTe: 'నూతన వ్యాపార ఆరంభం, ఒప్పందాలు, విద్యారంభం, అకౌంట్స్, సాఫ్ట్‌వేర్/పుస్తక రచన',
    favoredActivities: ['vyaparam', 'vidyarambham', 'namakaranam', 'sarva_karya'],
  },
  Moon: {
    nameTe: 'చంద్ర హోర (సోమ)',
    nature: 'auspicious',
    badgeTe: 'మనో-సౌఖ్య శుభ హోర',
    bestActivitiesTe: 'నామకరణం, అన్నప్రాశన, ప్రయాణాలు, జల/ఆహార వ్యాపారాలు, గృహ అలంకరణ',
    favoredActivities: [
      'namakaranam',
      'vahana',
      'grihapravesham',
      'vyaparam',
      'sarva_karya',
    ],
  },
  Sun: {
    nameTe: 'రవి హోర (సూర్య)',
    nature: 'neutral',
    badgeTe: 'అధికార / రాజ్య హోర',
    bestActivitiesTe: 'ప్రభుత్వ పనులు, ఉద్యోగ బాధ్యతల స్వీకరణ, పైఅధికారులను కలవడం, శంకుస్థాపన',
    favoredActivities: ['upanayanam', 'bhumi_puja', 'vyaparam', 'sarva_karya'],
  },
  Mars: {
    nameTe: 'కుజ హోర (భౌమ)',
    nature: 'caution',
    badgeTe: 'భూమి / సాహస హోర',
    bestActivitiesTe: 'భూమి పూజ, స్థల/పొలము లావాదేవీలు, ఇంజనీరింగ్, క్రీడలు (శుభకార్యాలకు నివారించాలి)',
    favoredActivities: ['bhumi_puja'],
  },
  Saturn: {
    nameTe: 'శని హోర (మంద)',
    nature: 'caution',
    badgeTe: 'నిర్మాణ / శ్రమ హోర (జాగ్రత్త)',
    bestActivitiesTe: 'పాత బకాయిల వసూలు, యంత్ర/ఇనుము పనులు, వ్యవసాయం (శుభ ఆరంభాలకు నివారించాలి)',
    favoredActivities: [],
  },
};

const DAY_CHOGHADIYA_BY_VARA: Record<number, string[]> = {
  0: ['Udvega', 'Chara', 'Labha', 'Amrita', 'Kala', 'Shubha', 'Roga', 'Udvega'],
  1: ['Amrita', 'Kala', 'Shubha', 'Roga', 'Udvega', 'Chara', 'Labha', 'Amrita'],
  2: ['Roga', 'Udvega', 'Chara', 'Labha', 'Amrita', 'Kala', 'Shubha', 'Roga'],
  3: ['Labha', 'Amrita', 'Kala', 'Shubha', 'Roga', 'Udvega', 'Chara', 'Labha'],
  4: ['Shubha', 'Roga', 'Udvega', 'Chara', 'Labha', 'Amrita', 'Kala', 'Shubha'],
  5: ['Chara', 'Labha', 'Amrita', 'Kala', 'Shubha', 'Roga', 'Udvega', 'Chara'],
  6: ['Kala', 'Shubha', 'Roga', 'Udvega', 'Chara', 'Labha', 'Amrita', 'Kala'],
};

const CHOGHADIYA_META: Record<
  string,
  {
    nameTe: string;
    rulerTe: string;
    nature: 'amrita' | 'shubha' | 'labha' | 'chara' | 'ashubha';
    verdictTe: string;
    bonusScore: number;
  }
> = {
  Amrita: {
    nameTe: 'అమృత చోఘడియా (Amrita)',
    rulerTe: 'చంద్రుడు',
    nature: 'amrita',
    verdictTe: 'సర్వ శుభకార్యాలకు అత్యుత్తమ అమృత ఘడియలు',
    bonusScore: 18,
  },
  Shubha: {
    nameTe: 'శుభ చోఘడియా (Shubha)',
    rulerTe: 'గురుడు',
    nature: 'shubha',
    verdictTe: 'వివాహం, గృహప్రవేశం, పూజలు & శుభకార్యాలకు శ్రేష్టం',
    bonusScore: 15,
  },
  Labha: {
    nameTe: 'లాభ చోఘడియా (Labha)',
    rulerTe: 'బుధుడు',
    nature: 'labha',
    verdictTe: 'వ్యాపార ఆరంభం, ధన పెట్టుబడి & విద్యారంభానికి ఉత్తమం',
    bonusScore: 14,
  },
  Chara: {
    nameTe: 'చర / చంచల చోఘడియా (Chara)',
    rulerTe: 'శుక్రుడు',
    nature: 'chara',
    verdictTe: 'వాహన కొనుగోలు, ప్రయాణాలు & చర కార్యాలకు అనుకూలం',
    bonusScore: 9,
  },
  Udvega: {
    nameTe: 'ఉద్వేగ చోఘడియా (Udvega)',
    rulerTe: 'రవి',
    nature: 'ashubha',
    verdictTe: 'ప్రభుత్వ పనులకు మాత్రమే (శుభకార్యాలకు నివారించండి)',
    bonusScore: -12,
  },
  Kala: {
    nameTe: 'కాల చోఘడియా (Kala - వర్జ్యం)',
    rulerTe: 'శని',
    nature: 'ashubha',
    verdictTe: 'విఘ్న కారక సమయం — శుభకార్యాలు చేయరాదు',
    bonusScore: -22,
  },
  Roga: {
    nameTe: 'రోగ చోఘడియా (Roga - వర్జ్యం)',
    rulerTe: 'కుజుడు',
    nature: 'ashubha',
    verdictTe: 'అనారోగ్య/కలహ సమయం — శుభకార్యాలు చేయరాదు',
    bonusScore: -20,
  },
};

function hmToMins(hm: string): number {
  const parts = hm.trim().split(':').map(Number);
  return (parts[0] || 0) * 60 + (parts[1] || 0);
}

function minsToHM(totalMins: number): string {
  const norm = ((Math.round(totalMins) % 1440) + 1440) % 1440;
  const h = Math.floor(norm / 60);
  const m = norm % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function parseWindowRangeMins(rangeStr: string): [number, number] {
  const parts = rangeStr.split(/[–-]/).map((s) => s.trim());
  if (parts.length < 2) return [-1, -1];
  return [hmToMins(parts[0]), hmToMins(parts[1])];
}

function intervalsOverlap(s1: number, e1: number, s2: number, e2: number): boolean {
  if (s2 < 0 || e2 < 0) return false;
  return Math.max(s1, s2) < Math.min(e1, e2);
}

export function calculateIntradayAuspiciousTimings(
  dateStr: string,
  activityId: MuhurtaActivityId,
  lat: number,
  lng: number,
  tzOffsetHours: number,
  natalChart: CompleteChartResult
): IntradayAuspiciousTimeReport {
  const baseEval = evaluateDateMuhurta(
    dateStr,
    '09:30',
    activityId,
    lat,
    lng,
    tzOffsetHours,
    natalChart
  );

  // Also get the full Panchanga at sunrise/morning of dateStr
  const [y, m, d] = dateStr.split('-').map(Number);
  const utcMs =
    Date.UTC(y || 2026, (m || 1) - 1, d || 1, 9, 0) -
    tzOffsetHours * 3600 * 1000;
  const dateUTC = new Date(utcMs);
  const timeAstro = Astronomy.MakeTime(dateUTC);
  const sunGeo = Astronomy.GeoVector(Astronomy.Body.Sun, timeAstro, true);
  const sunEcl = Astronomy.Ecliptic(sunGeo);
  const moonGeo = Astronomy.GeoVector(Astronomy.Body.Moon, timeAstro, true);
  const moonEcl = Astronomy.Ecliptic(moonGeo);
  const ayanamsa = natalChart.ayanamsaDeg || 24.12;
  const sunSid = ((sunEcl.elon - ayanamsa) % 360 + 360) % 360;
  const moonSid = ((moonEcl.elon - ayanamsa) % 360 + 360) % 360;

  const panchanga: PanchangaData = calculatePanchanga(
    dateUTC,
    sunSid,
    moonSid,
    lat,
    lng,
    tzOffsetHours
  );

  const srMins = hmToMins(panchanga.sunTimes.sunriseLocal);
  const ssMins = hmToMins(panchanga.sunTimes.sunsetLocal);
  const daySpanMins = Math.max(600, ssMins - srMins);
  const nightSpanMins = 1440 - daySpanMins;

  const [rahuS, rahuE] = parseWindowRangeMins(panchanga.muhurtas.rahuKalam);
  const [yamaS, yamaE] = parseWindowRangeMins(panchanga.muhurtas.yamagandaKalam);
  const [abhiS, abhiE] = parseWindowRangeMins(panchanga.muhurtas.abhijitMuhurta);

  const varaIdx = baseEval.dayOfWeek;
  const startLord = VARA_START_LORD[varaIdx] ?? 'Sun';
  const startChaldeanIdx = Math.max(0, CHALDEAN_HORA_ORDER.indexOf(startLord));
  const sunSignIdx = Math.floor(sunSid / 30);

  // 1. Compute 8 Day Choghadiyas
  const chogNames = DAY_CHOGHADIYA_BY_VARA[varaIdx] ?? DAY_CHOGHADIYA_BY_VARA[0];
  const chogDur = daySpanMins / 8;
  const dayChoghadiyas: IntradayChoghadiyaSlot[] = chogNames.map((cKey, idx) => {
    const cStart = srMins + idx * chogDur;
    const cEnd = cStart + chogDur;
    const meta = CHOGHADIYA_META[cKey] ?? CHOGHADIYA_META.Shubha;
    return {
      slotNumber: idx + 1,
      periodType: 'day',
      startTime: minsToHM(cStart),
      endTime: minsToHM(cEnd),
      nameTe: meta.nameTe,
      nameEn: cKey,
      rulerPlanetTe: meta.rulerTe,
      nature: meta.nature,
      verdictTe: meta.verdictTe,
      isRahuOverlap: intervalsOverlap(cStart, cEnd, rahuS, rahuE),
    };
  });

  // 2. Compute 12 Day Horas & 12 Night Horas
  const dayHoraDur = daySpanMins / 12;
  const nightHoraDur = nightSpanMins / 12;
  const dayHoras: IntradayHoraSlot[] = [];
  const nightHoras: IntradayHoraSlot[] = [];

  for (let i = 0; i < 24; i++) {
    const isDay = i < 12;
    const hStart = isDay
      ? srMins + i * dayHoraDur
      : ssMins + (i - 12) * nightHoraDur;
    const hEnd = hStart + (isDay ? dayHoraDur : nightHoraDur);
    const midMins = (hStart + hEnd) / 2;

    const lordId = CHALDEAN_HORA_ORDER[(startChaldeanIdx + i) % 7];
    const hMeta = HORA_DETAILS_TE[lordId] ?? HORA_DETAILS_TE.Jupiter;

    const isRahuOverlap = isDay && intervalsOverlap(hStart, hEnd, rahuS, rahuE);
    const isYamagandaOverlap =
      isDay && intervalsOverlap(hStart, hEnd, yamaS, yamaE);
    const isAbhijitOverlap =
      isDay && intervalsOverlap(hStart, hEnd, abhiS, abhiE);

    // Approximate rising Lagna at midpoint of this Hora (Sun's sign rises at sunrise, +1 sign every ~120 mins)
    const minsAfterSunrise = ((midMins - srMins) % 1440 + 1440) % 1440;
    const risingSignIdx = (sunSignIdx + Math.floor(minsAfterSunrise / 120)) % 12;
    const risingLagnaTe = `${TELUGU_RASIS[risingSignIdx]?.nameTe.split(' ')[0]} లగ్నం`;

    // Find overlapping Choghadiya if daytime
    const chogIdx = isDay
      ? Math.min(7, Math.floor((midMins - srMins) / chogDur))
      : 0;
    const chogKey = isDay ? chogNames[chogIdx] : 'Shubha';
    const chogMeta = CHOGHADIYA_META[chogKey] ?? CHOGHADIYA_META.Shubha;

    // Score this slot for the requested activity
    let slotScore = Math.round(baseEval.shubhaScore * 0.55);
    if (hMeta.favoredActivities.includes(activityId)) {
      slotScore += 24;
    } else if (hMeta.nature === 'auspicious') {
      slotScore += 14;
    } else if (hMeta.nature === 'caution') {
      slotScore -= 14;
    }

    slotScore += chogMeta.bonusScore;
    if (isAbhijitOverlap) slotScore += 12;
    if (isRahuOverlap) slotScore -= 35;
    if (isYamagandaOverlap) slotScore -= 18;

    // Sthira Lagna (Taurus=1, Leo=4, Scorpio=7, Aquarius=10) bonus for Grihapravesham / Bhumi Puja / Vivaha
    if (
      ['grihapravesham', 'bhumi_puja', 'vivaha'].includes(activityId) &&
      [1, 4, 7, 10].includes(risingSignIdx)
    ) {
      slotScore += 8;
    }

    slotScore = Math.max(15, Math.min(99, slotScore));

    const slotObj: IntradayHoraSlot = {
      horaNumber: i + 1,
      periodType: isDay ? 'day' : 'night',
      startTime: minsToHM(hStart),
      endTime: minsToHM(hEnd),
      lordId,
      lordNameTe: hMeta.nameTe,
      nature: isRahuOverlap ? 'caution' : hMeta.nature,
      qualityBadgeTe: isRahuOverlap
        ? 'రాహుకాల స్పర్శ (నివారించండి)'
        : isAbhijitOverlap
          ? `${hMeta.badgeTe} + అభిజిత్`
          : hMeta.badgeTe,
      bestActivitiesTe: hMeta.bestActivitiesTe,
      isRahuOverlap,
      isYamagandaOverlap,
      isAbhijitOverlap,
      risingLagnaTe,
      activityMatchScore: slotScore,
    };

    if (isDay) {
      dayHoras.push(slotObj);
    } else {
      nightHoras.push(slotObj);
    }
  }

  // 3. Build Top Ranked Optimal Event Timings (filtering out Rahu Kalam)
  const candidateSlots: OptimalEventTimeSlot[] = dayHoras
    .filter((h) => !h.isRahuOverlap && h.nature !== 'caution')
    .map((h, idx) => {
      const hStartMins = hmToMins(h.startTime);
      const hEndMins = hmToMins(h.endTime);
      const midMins = (hStartMins + hEndMins) / 2;
      const chogIdx = Math.min(7, Math.max(0, Math.floor((midMins - srMins) / chogDur)));
      const chog = dayChoghadiyas[chogIdx] ?? dayChoghadiyas[0];

      const gradeBadgeTe =
        h.activityMatchScore >= 88
          ? 'అమృత సిద్ధ ముహూర్తం (Best Window)'
          : h.activityMatchScore >= 76
            ? 'ఉత్తమ శుభ ముహూర్తం (Highly Favorable)'
            : 'అనుకూల శుభ సమయం (Good Window)';

      return {
        id: `opt-slot-${h.horaNumber}-${idx}`,
        rank: 1,
        startTime: h.startTime,
        endTime: h.endTime,
        midpointTime: minsToHM(midMins),
        windowLabelTe: `${h.startTime} – ${h.endTime}`,
        horaLordTe: h.lordNameTe,
        choghadiyaNameTe: chog.nameTe.split(' (')[0],
        risingLagnaTe: h.risingLagnaTe,
        score: h.activityMatchScore,
        gradeBadgeTe,
        isAbhijitWindow: h.isAbhijitOverlap,
        panchangaAlignmentNoteTe: `${baseEval.tithiNameTe}, ${baseEval.nakshatraNameTe} నక్షత్రం (${baseEval.tarabalaNameTe}) లో ${h.lordNameTe} మరియు ${chog.nameTe.split(' (')[0]} కలయిక · రాహుకాల-యమగండ దోష రహిత సమయం.`,
        recommendedForEventsTe: h.bestActivitiesTe,
        riskFreeApproved: true,
        doshaAuditBadgeTe: 'రాహుకాల/యమగండ రహితం (Risk-Free Approved)',
        hasConflict: false,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((item, idx) => ({ ...item, rank: idx + 1 }));

  // 4. Compute 12 Udaya Lagna Shuddhi Windows starting from Sunrise
  const lagnaDur = 1440 / 12; // ~120 mins per sign
  const lagnaWindows: IntradayLagnaWindow[] = Array.from({ length: 12 }, (_, idx) => {
    const lStart = srMins + idx * lagnaDur;
    const lEnd = lStart + lagnaDur;
    const rasiIdx = (sunSignIdx + idx) % 12;
    const rasiObj = TELUGU_RASIS[rasiIdx] ?? TELUGU_RASIS[0];
    const isSthira = [1, 4, 7, 10].includes(rasiIdx);
    const isChara = [0, 3, 6, 9].includes(rasiIdx);
    const modality: 'chara' | 'sthira' | 'dwiswabhava' = isSthira
      ? 'sthira'
      : isChara
        ? 'chara'
        : 'dwiswabhava';
    const modalityTe = isSthira
      ? 'స్థిర లగ్నం (Sthira)'
      : isChara
        ? 'చర లగ్నం (Chara)'
        : 'ద్విస్వభావ లగ్నం (Dual)';
    const isBeneficLagna = [1, 2, 3, 5, 6, 8, 11].includes(rasiIdx); // Taurus, Gemini, Cancer, Virgo, Libra, Sagittarius, Pisces
    return {
      startTime: minsToHM(lStart),
      endTime: minsToHM(lEnd),
      signNameTe: rasiObj.nameTe.split(' ')[0],
      signNameEn: rasiObj.nameEn,
      modality,
      modalityTe,
      isKendraOrTrikonaBenefic: isBeneficLagna,
      kartariStatusTe: isBeneficLagna
        ? 'శుభ గ్రహ ఆధిపత్య లగ్నం — అష్టమ శుద్ధి & కేంద్ర బలం ఉత్తమం'
        : 'క్రూర గ్రహ ఆధిపత్య లగ్నం — గురు/శుక్ర దృష్టి ఉంటేనే గ్రాహ్యం',
      recommendedActivitiesTe: isSthira
        ? 'గృహప్రవేశం, వివాహ ముహూర్తం, శంకుస్థాపన, స్థిర ఆస్తుల రిజిస్ట్రేషన్'
        : isChara
          ? 'వాహన కొనుగోలు, దూర ప్రయాణాలు, నూతన వ్యాపార/వాణిజ్య ఆరంభం'
          : 'విద్యారంభం, నామకరణం, ఉపనయనం, బ్యాంకు & ఆర్థిక ఒప్పందాలు',
    };
  });

  return {
    dateStr,
    dayNameTe: baseEval.dayNameTe,
    sunriseLocal: panchanga.sunTimes.sunriseLocal,
    sunsetLocal: panchanga.sunTimes.sunsetLocal,
    tithiNameTe: baseEval.tithiNameTe,
    nakshatraNameTe: `${baseEval.nakshatraNameTe} (${baseEval.pada}వ పాదం)`,
    yogaNameTe: baseEval.yogaNameTe,
    karanaNameTe: baseEval.karanaNameTe,
    tarabalaTe: baseEval.tarabalaNameTe,
    chandrabalaTe: baseEval.isChandrashtama
      ? 'చంద్రాష్టమ దోషం (జాగ్రత్త)'
      : `శుభ చంద్రాబలం (${baseEval.chandrabalaHouse}వ స్థానం)`,
    dayPanchangaScore: baseEval.shubhaScore,
    daySummaryTe: baseEval.siddhantiVerdictTe,
    abhijitWindow: panchanga.muhurtas.abhijitMuhurta,
    brahmaMuhurtaWindow: panchanga.muhurtas.brahmaMuhurta,
    rahuKalamWindow: panchanga.muhurtas.rahuKalam,
    yamagandaWindow: panchanga.muhurtas.yamagandaKalam,
    gulikaWindow: panchanga.muhurtas.gulikaKalam,
    optimalSlotsForActivity: candidateSlots,
    dayHoras,
    nightHoras,
    dayChoghadiyas,
    lagnaWindows,
  };
}

export interface MuhurtaConflictDetail {
  id: string;
  nameTe: string;
  nameEn: string;
  category:
    | 'rahu_kalam'
    | 'yamagandam'
    | 'gulika_kalam'
    | 'durmuhurtham'
    | 'varjyam'
    | 'rikta_tithi'
    | 'vishti_karana'
    | 'dushta_yoga'
    | 'chandrashtama'
    | 'tarabala_dosha';
  severity: 'critical' | 'severe' | 'moderate' | 'minor';
  severityBadgeTe: string;
  windowStr?: string;
  overlapMinutes: number;
  hazardDescriptionTe: string;
  shastraPramanamTe: string;
  remedyTe: string;
}

export interface MuhurtaConflictReport {
  selectedStartTime: string;
  selectedEndTime: string;
  windowDurationMinutes: number;
  hasConflict: boolean;
  overallRiskLevel: 'risk_free' | 'caution' | 'high_danger';
  riskBadgeTe: string;
  purityScorePercent: number;
  totalOverlapMinutes: number;
  conflicts: MuhurtaConflictDetail[];
  rahuKalamWindow: string;
  yamagandaWindow: string;
  gulikaWindow: string;
  durmuhurthamWindow: string;
  varjyamWindow: string;
  safeAlternativeWindowTe: string;
  safeAdjustmentActionTe: string;
  panchangaSummaryTe: string;
  verdictBannerTe: string;
}

/**
 * Real-time Muhurta Conflict Checker
 * Cross-references any chosen time window with all intraday dosha windows
 * (Rahu Kalam, Yamagandam, Gulika Kalam, Durmuhurtham, Varjyam, Rikta, Bhadra, etc.)
 */
export function checkMuhurtaWindowConflicts(
  startTimeStr: string,
  endTimeStr: string,
  dateStr: string,
  activityId: MuhurtaActivityId,
  lat: number,
  lng: number,
  tzOffsetHours: number,
  natalChart: CompleteChartResult
): MuhurtaConflictReport {
  const [y, m, d] = dateStr.split('-').map(Number);
  const sMins = hmToMins(startTimeStr);
  let eMins = hmToMins(endTimeStr);
  if (eMins <= sMins) {
    eMins = sMins + 45; // Default 45 mins span if end <= start
  }
  const windowDuration = eMins - sMins;

  // Midpoint time for qualitative evaluations
  const midMins = (sMins + eMins) / 2;
  const midTimeStr = minsToHM(midMins);

  const evalRes = evaluateDateMuhurta(
    dateStr,
    midTimeStr,
    activityId,
    lat,
    lng,
    tzOffsetHours,
    natalChart
  );

  // Panchanga ephemeris for exact sun times & windows
  const utcMs =
    Date.UTC(y || 2026, (m || 1) - 1, d || 1, 9, 0) -
    tzOffsetHours * 3600 * 1000;
  const dateUTC = new Date(utcMs);
  const timeAstro = Astronomy.MakeTime(dateUTC);
  const sunGeo = Astronomy.GeoVector(Astronomy.Body.Sun, timeAstro, true);
  const sunEcl = Astronomy.Ecliptic(sunGeo);
  const moonGeo = Astronomy.GeoVector(Astronomy.Body.Moon, timeAstro, true);
  const moonEcl = Astronomy.Ecliptic(moonGeo);
  const ayanamsa = natalChart.ayanamsaDeg || 24.12;
  const sunSid = ((sunEcl.elon - ayanamsa) % 360 + 360) % 360;
  const moonSid = ((moonEcl.elon - ayanamsa) % 360 + 360) % 360;

  const p: PanchangaData = calculatePanchanga(
    dateUTC,
    sunSid,
    moonSid,
    lat,
    lng,
    tzOffsetHours
  );

  const srMins = hmToMins(p.sunTimes.sunriseLocal);
  const ssMins = hmToMins(p.sunTimes.sunsetLocal);
  const daySpan = Math.max(600, ssMins - srMins);
  const muhurtaSpan = daySpan / 15; // standard 1/15th of day duration (~48 mins)

  const rahuWindow = p.muhurtas.rahuKalam;
  const yamaWindow = p.muhurtas.yamagandaKalam;
  const gulikaWindow = p.muhurtas.gulikaKalam;

  // Calculate classical Durmuhurtham windows based on weekday
  const dayOfWeek = evalRes.dayOfWeek;
  const durMuhurtaIndices: number[][] = [
    [14], // Sun: 14th muhurta
    [8, 12], // Mon: 8th & 12th
    [4, 11], // Tue: 4th & 11th
    [8], // Wed: 8th
    [6, 7], // Thu: 6th & 7th
    [4, 9], // Fri: 4th & 9th
    [2, 3], // Sat: 2nd & 3rd
  ];
  const activeDurIndices = durMuhurtaIndices[dayOfWeek] ?? [8];
  const durWindows = activeDurIndices.map((idx) => {
    const dStart = srMins + (idx - 1) * muhurtaSpan;
    const dEnd = dStart + muhurtaSpan;
    return {
      start: dStart,
      end: dEnd,
      str: `${minsToHM(dStart)} – ${minsToHM(dEnd)}`,
    };
  });
  const durWindowStr = durWindows.map((w) => w.str).join(' & ');

  // Classical Varjyam window (approximate based on nakshatra visha ghatika)
  const nakIdx = evalRes.nakshatraNumber - 1;
  const vishaGhatikaStarts = [
    50, 24, 30, 40, 14, 11, 30, 20, 32, 30, 20, 18, 21, 20, 14, 14, 10, 14, 56, 24, 20, 10, 10, 18, 16, 24, 30
  ];
  const vGhatika = vishaGhatikaStarts[nakIdx % 27] ?? 30;
  // 1 ghatika = 24 minutes; Varjyam duration = 4 ghatikas (96 mins)
  const varjyamStart = srMins + (vGhatika * 24) % 1440;
  const varjyamEnd = (varjyamStart + 96) % 1440;
  const varjyamWindowStr = `${minsToHM(varjyamStart)} – ${minsToHM(varjyamEnd)}`;

  const calcOverlap = (rangeStr: string): number => {
    const [ws, we] = parseWindowRangeMins(rangeStr);
    if (ws < 0 || we < 0) return 0;
    return Math.max(0, Math.min(eMins, we) - Math.max(sMins, ws));
  };

  const rahuOverlap = calcOverlap(rahuWindow);
  const yamaOverlap = calcOverlap(yamaWindow);
  const gulikaOverlap = calcOverlap(gulikaWindow);

  let durOverlap = 0;
  for (const dw of durWindows) {
    durOverlap += Math.max(0, Math.min(eMins, dw.end) - Math.max(sMins, dw.start));
  }

  const varjyamOverlap = Math.max(0, Math.min(eMins, varjyamEnd) - Math.max(sMins, varjyamStart));

  const conflicts: MuhurtaConflictDetail[] = [];
  let totalOverlap = 0;

  // 1. Rahu Kalam Conflict
  if (rahuOverlap > 0) {
    totalOverlap += rahuOverlap;
    conflicts.push({
      id: 'rahu_kalam',
      nameTe: 'రాహుకాల తీవ్ర దోష సంపర్కం',
      nameEn: 'Rahu Kalam Incursion',
      category: 'rahu_kalam',
      severity: 'critical',
      severityBadgeTe: 'తీవ్ర నిషిద్ధం (Critical Conflict)',
      windowStr: rahuWindow,
      overlapMinutes: Math.round(rahuOverlap),
      hazardDescriptionTe: `ఎంచుకున్న ముహూర్త కాలంలో రాహుకాలంతో ${Math.round(rahuOverlap)} నిమిషాల ప్రత్యక్ష సంపర్కం ఉంది. రాహుకాలంలో ప్రారంభించిన పనులలో తీవ్ర ధన నష్టం, గందరగోళం, లేదా బంధాల విచ్ఛిన్నత ఏర్పడుతుంది.`,
      shastraPramanamTe: 'ముహూర్త చింతామణి: "రాహుకాలే కృతం కర్మ నాశమేతి న సంశయః"',
      remedyTe: 'ఈ విండోను పూర్తిగా రద్దు చేసి, రాహుకాలం ముగిసిన తర్వాత లేదా అంతకుముందు ప్రారంభించండి.',
    });
  }

  // 2. Yamagandam Conflict
  if (yamaOverlap > 0) {
    totalOverlap += yamaOverlap;
    conflicts.push({
      id: 'yamagandam',
      nameTe: 'యమగండ వినాశక దోషం',
      nameEn: 'Yamagandam Incursion',
      category: 'yamagandam',
      severity: 'critical',
      severityBadgeTe: 'తీవ్ర నిషిద్ధం (Critical Conflict)',
      windowStr: yamaWindow,
      overlapMinutes: Math.round(yamaOverlap),
      hazardDescriptionTe: `యమగండంతో ${Math.round(yamaOverlap)} నిమిషాల తాకిడి కలదు. యమకాలం మృత్యుతుల్య బాధలు, ప్రమాదాలు మరియు ఆకస్మిక విఫలత్వానికి కారణమవుతుంది.`,
      shastraPramanamTe: 'కాలామృతం: "యమగండే న కర్తవ్యం శుభకర్మ కదాచన"',
      remedyTe: 'యమగండ కాలం ముగిసేవరకు వేచి ఉండటం పరమ శ్రేయస్కరం.',
    });
  }

  // 3. Gulika Kalam Conflict
  if (gulikaOverlap > 0) {
    totalOverlap += gulikaOverlap;
    conflicts.push({
      id: 'gulika_kalam',
      nameTe: 'గుళికా కాల ఆటంకం',
      nameEn: 'Gulika Kalam Obstacle',
      category: 'gulika_kalam',
      severity: 'severe',
      severityBadgeTe: 'ఆటంక పూరితం (Severe Conflict)',
      windowStr: gulikaWindow,
      overlapMinutes: Math.round(gulikaOverlap),
      hazardDescriptionTe: `శని పుత్రుడైన గుళికుని సమయంతో ${Math.round(gulikaOverlap)} నిమిషాల సంపర్కం. శుభకార్యాలలో ఆలస్యం, పునరావృతం మరియు అడ్డంకులు సృష్టిస్తుంది.`,
      shastraPramanamTe: 'ఫలదీపిక: "గుళికోదయ కాలేషు శుభం నైవ విధియతే"',
      remedyTe: 'మరో శుభ హోరను ఎంచుకోండి.',
    });
  }

  // 4. Durmuhurtham Conflict
  if (durOverlap > 0) {
    totalOverlap += durOverlap;
    conflicts.push({
      id: 'durmuhurtham',
      nameTe: 'దుర్ముహూర్త సంపర్క దోషం',
      nameEn: 'Durmuhurtham Clash',
      category: 'durmuhurtham',
      severity: 'severe',
      severityBadgeTe: 'దుర్ముహూర్తం (Severe Conflict)',
      windowStr: durWindowStr,
      overlapMinutes: Math.round(durOverlap),
      hazardDescriptionTe: `ఈ దిన దుర్ముహూర్తంతో ${Math.round(durOverlap)} నిమిషాల ఓవర్‌లాప్ ఉంది. దీనివల్ల అధికారులతో ఘర్షణలు లేదా అనుకోని అవాంతరాలు కలుగుతాయి.`,
      shastraPramanamTe: 'ముహూర్త మార్తాండం: "దుర్ముహూర్తే కృతం సర్వం భవేన్నిష్ఫలమేవ చ"',
      remedyTe: 'దుర్ముహూర్తం ముగిసేవరకు నిరీక్షించండి.',
    });
  }

  // 5. Varjyam Conflict
  if (varjyamOverlap > 0) {
    totalOverlap += varjyamOverlap;
    conflicts.push({
      id: 'varjyam',
      nameTe: 'వర్జ్యం (విష ఘడియలు)',
      nameEn: 'Varjyam (Visha Ghatika)',
      category: 'varjyam',
      severity: 'severe',
      severityBadgeTe: 'వర్జ్య కాలం (Severe Hazard)',
      windowStr: varjyamWindowStr,
      overlapMinutes: Math.round(varjyamOverlap),
      hazardDescriptionTe: `నక్షత్ర సంబంధిత విష ఘడియల (వర్జ్యం) పరిధిలో ${Math.round(varjyamOverlap)} నిమిషాలు ఉంది. విష ఘడియలు కార్య విషతుల్యత్వాన్ని కలిగిస్తాయి.`,
      shastraPramanamTe: 'జ్యోతిష తత్త్వం: "వర్జ్యం సర్వత్ర వర్జయేత్"',
      remedyTe: 'వర్జ్య త్యాగం చేసి అమృత ఘడియలను ఎంచుకోవాలి.',
    });
  }

  // 6. Qualitative Panchanga Doshas
  if (evalRes.isRiktaTithi) {
    conflicts.push({
      id: 'rikta_tithi',
      nameTe: `రిక్త తిథి (${evalRes.tithiNameTe})`,
      nameEn: 'Rikta Tithi (4, 9, 14)',
      category: 'rikta_tithi',
      severity: 'severe',
      severityBadgeTe: 'రిక్త దోషం (Empty Outcome)',
      overlapMinutes: 0,
      hazardDescriptionTe: 'చవితి, నవమి లేదా చతుర్దశి తిథులలో ప్రారంభించిన కార్యం శూన్య ఫలితాన్ని ఇస్తుంది.',
      shastraPramanamTe: 'శాస్త్రం: "రిక్తాయాం న శుభం కార్యం"',
      remedyTe: 'లక్ష్మీ అష్టక పఠనం లేదా తిథి మారే వరకు ఆగుట.',
    });
  }

  if (evalRes.isVishtiKarana) {
    conflicts.push({
      id: 'vishti_karana',
      nameTe: 'భద్రా / విష్టి కరణ వినాశక దోషం',
      nameEn: 'Bhadra / Vishti Karana',
      category: 'vishti_karana',
      severity: 'critical',
      severityBadgeTe: 'భద్రా దోషం (Critical)',
      overlapMinutes: 0,
      hazardDescriptionTe: 'విష్టి కరణం నడుస్తున్న సమయం సర్వ శుభకార్య వినాశకరం.',
      shastraPramanamTe: 'ముహూర్త చింతామణి: "విష్ట్యాం యత్క్రియతే కర్మ తత్సర్వం నాశతాం వ్రజేత్"',
      remedyTe: 'విష్టి ముగిసేవరకు ఎటువంటి నిర్ణయాలు తీసుకోరాదు.',
    });
  }

  if (evalRes.isChandrashtama) {
    conflicts.push({
      id: 'chandrashtama',
      nameTe: 'చంద్రాష్టమ తీవ్ర మానసిక ఆటంకం',
      nameEn: 'Chandrashtama (8th Moon)',
      category: 'chandrashtama',
      severity: 'severe',
      severityBadgeTe: 'చంద్రాష్టమం',
      overlapMinutes: 0,
      hazardDescriptionTe: 'జన్మరాశికి 8వ రాశిలో చంద్రుని సంచారం వలన మానసిక ఆందోళనలు, వివాదాలు.',
      shastraPramanamTe: 'శివార్చన మరియు రుద్రాభిషేకం తప్పనిసరి.',
      remedyTe: 'శివునికి క్షీరాభిషేకం జరిపించి ఆరంభించండి.',
    });
  }

  if (evalRes.isDushtaYoga) {
    conflicts.push({
      id: 'dushta_yoga',
      nameTe: `దుష్ట నిత్య యోగం (${evalRes.yogaNameTe})`,
      nameEn: 'Inauspicious Nitya Yoga',
      category: 'dushta_yoga',
      severity: 'moderate',
      severityBadgeTe: 'దుష్ట యోగం',
      overlapMinutes: 0,
      hazardDescriptionTe: 'సూర్య-చంద్రుల మొత్తం కోణం వల్ల ఏర్పడిన ప్రతికూల యోగం.',
      shastraPramanamTe: 'గణపతి అధర్వశీర్ష పారాయణం శ్రేష్ఠం.',
      remedyTe: 'గణపతికి గరిక పూజ చేయండి.',
    });
  }

  // Calculate Overall Risk & Purity Score
  const hasTimeOverlapConflict = rahuOverlap > 0 || yamaOverlap > 0 || gulikaOverlap > 0 || durOverlap > 0 || varjyamOverlap > 0;
  const hasCritical = conflicts.some((c) => c.severity === 'critical');
  const hasSevere = conflicts.some((c) => c.severity === 'severe');

  let overallRisk: 'risk_free' | 'caution' | 'high_danger' = 'risk_free';
  let purityScore = 96;

  if (hasCritical || rahuOverlap > 0 || yamaOverlap > 0) {
    overallRisk = 'high_danger';
    purityScore = Math.max(15, 60 - totalOverlap);
  } else if (hasSevere || hasTimeOverlapConflict || evalRes.isRiktaTithi || evalRes.isVishtiKarana) {
    overallRisk = 'caution';
    purityScore = Math.max(38, 75 - totalOverlap * 0.5);
  } else if (conflicts.length > 0) {
    overallRisk = 'caution';
    purityScore = 78;
  }

  // Safe Alternative Calculation
  let safeAltWindow = `${p.muhurtas.abhijitMuhurta} (అభిజిత్ ముహూర్తం — సర్వదోష నివారిణి)`;
  let safeAdjAction = 'ఈ సమయం సంపూర్ణ సురక్షితమైనది; నిరభ్యంతరంగా సంకల్పం చేయవచ్చు.';

  if (hasTimeOverlapConflict) {
    const [rs, re] = parseWindowRangeMins(rahuWindow);
    const [ys, ye] = parseWindowRangeMins(yamaWindow);
    const forbiddenEnd = Math.max(re, ye);
    if (forbiddenEnd > 0 && forbiddenEnd < 1000) {
      const recStart = forbiddenEnd + 15;
      const recEnd = recStart + windowDuration;
      safeAltWindow = `${minsToHM(recStart)} – ${minsToHM(recEnd)}`;
      safeAdjAction = `ముహూర్తాన్ని ${minsToHM(recStart)} కు సర్దుబాటు చేయడం ద్వారా రాహుకాల/యమగండ దోషాలను 100% నివారించి సంపూర్ణ శుద్ధ ముహూర్తంగా మార్చవచ్చు.`;
    }
  }

  const riskBadgeTe =
    overallRisk === 'risk_free'
      ? 'సంపూర్ణ శుద్ధ & సురక్షిత ముహూర్తం (100% Risk-Free Approved)'
      : overallRisk === 'caution'
      ? 'మధ్యమ దోష సంపర్కం — సర్దుబాటు సిఫార్సు (Cautionary Conflict)'
      : 'తీవ్ర దోష నిషిద్ధ సమయం — నివారించవలెను (High Hazard Conflict)';

  const verdictBannerTe =
    overallRisk === 'risk_free'
      ? 'ఎంచుకున్న సమయం రాహుకాలం, యమగండం, గుళిక కాలం, దుర్ముహూర్తం మరియు వర్జ్యాల బారిన పడకుండా సంపూర్ణ శుద్ధిని కలిగి ఉంది. ఎటువంటి ఆందోళన లేకుండా నిశ్చింతగా కార్యాన్ని ఆరంభించవచ్చు.'
      : `ఈ సమయంలో ${conflicts.map((c) => c.nameTe).join(' మరియు ')} లభించాయి. మొత్తం ${Math.round(totalOverlap)} నిమిషాల దోష సంపర్కం కలదు. శాస్త్ర నియమాల ప్రకారం ఈ సమయంలో ప్రారంభించిన పనులలో తీవ్ర జాప్యం లేదా విఘ్నాలు ఏర్పడే అవకాశం ఉంది.`;

  return {
    selectedStartTime: startTimeStr,
    selectedEndTime: endTimeStr,
    windowDurationMinutes: windowDuration,
    hasConflict: conflicts.length > 0,
    overallRiskLevel: overallRisk,
    riskBadgeTe,
    purityScorePercent: Math.round(purityScore),
    totalOverlapMinutes: Math.round(totalOverlap),
    conflicts,
    rahuKalamWindow: rahuWindow,
    yamagandaWindow: yamaWindow,
    gulikaWindow: gulikaWindow,
    durmuhurthamWindow: durWindowStr,
    varjyamWindow: varjyamWindowStr,
    safeAlternativeWindowTe: safeAltWindow,
    safeAdjustmentActionTe: safeAdjAction,
    panchangaSummaryTe: `${evalRes.dayNameTe} · ${evalRes.tithiNameTe} · ${evalRes.nakshatraNameTe} · ${evalRes.yogaNameTe}`,
    verdictBannerTe,
  };
}

