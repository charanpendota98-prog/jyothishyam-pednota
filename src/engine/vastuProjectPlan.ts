/**
 * వాస్తు + ఇంజనీరింగ్ సమన్విత ప్రాజెక్ట్ ప్లాన్
 * (Vastu × Engineering integrated project plan).
 *
 * ఒక్కో గదికి: శాస్త్రీయ దిక్కు, కొలతలు, ద్వార-కిటికీ ప్రమాణం, సహజ వెలుతురు,
 * గాలి మార్పిడి (ACH), MEP (విద్యుత్/ప్లంబింగ్/HVAC), పదార్థాలు, వాస్తు నియమాలు,
 * ఇంజనీరింగ్ తనిఖీలు, మరియు 3-స్థాయి పరిహారాలు. ఇవి NBC 2016 మరియు
 * IS 456 / IS 3370 / IS 732 ప్రాథమిక ప్రమాణాలతో కలిపి రూపొందించబడ్డాయి.
 *
 * Units: lengths in feet unless noted; ACH = air changes per hour.
 */

import { DIK_BY_ID, type DikInfo, type RoomKey, type RoomMap } from './vastuShastraEngine.ts';

export interface Bi {
  te: string;
  en: string;
}
export const bi = (te: string, en: string): Bi => ({ te, en });
export const pickBi = (b: Bi, lang: 'te' | 'en'): string => (lang === 'te' ? b.te : b.en);

export type Compliance = 'best' | 'ok' | 'bad';

export interface RoomPlan {
  key: RoomKey;
  label: Bi;
  currentDik: DikInfo['id'];
  idealDik: DikInfo['id'];
  compliance: Compliance;
  size: Bi;
  door: Bi;
  window: Bi;
  daylight: Bi;
  ach: Bi;
  mep: Bi[];
  materials: Bi[];
  vastu: Bi[];
  engineering: Bi[];
  remedies: { level: 1 | 2 | 3; text: Bi }[];
}

export interface ServicePlan {
  key: string;
  title: Bi;
  primaryDik: DikInfo['id'];
  spec: Bi[];
  risks: Bi[];
}

export interface ActionItem {
  room: Bi;
  priority: number; // 1 = అత్యధిక ప్రాధాన్యం
  impact: number; // 0-100 స్కోరు మెరుగుదల అంచనా
  costBand: 'no-cost' | 'low' | 'medium' | 'high';
  action: Bi;
  rationale: Bi;
}

export interface ComplianceCheck {
  id: string;
  label: Bi;
  status: 'ok' | 'warn' | 'fail';
  detail: Bi;
}

export interface ProjectPlan {
  rooms: RoomPlan[];
  services: ServicePlan[];
  phases: { level: 1 | 2 | 3; title: Bi; items: Bi[] }[];
  grid: Bi[];
  ayadi: {
    perimeterFt: number;
    aya: number;
    vyaya: number;
    verdictBad: boolean;
    note: Bi;
  };
  engineeringSummary: Bi[];
  actionPlan: ActionItem[];
  compliance: ComplianceCheck[];
  scoreProjection: { current: number; afterPhase1: number; afterPhase2: number };
}

/* ------------------------------------------------------------------ */
/*  Per-room engineering + Vastu specification                         */
/* ------------------------------------------------------------------ */

interface RoomSpec {
  label: Bi;
  idealDik: DikInfo['id'];
  size: Bi;
  door: Bi;
  window: Bi;
  daylight: Bi;
  ach: Bi;
  mep: Bi[];
  materials: Bi[];
  vastu: Bi[];
  engineering: Bi[];
  remedies: Bi[];
}

const SPECS: Record<RoomKey, RoomSpec> = {
  entrance: {
    label: bi('ప్రధాన ద్వారం', 'Main entrance'),
    idealDik: 'E',
    size: bi('ద్వారం వెడల్పు 3′6″–4′6″, ఎత్తు 6′8″–7′0″; ఒకే తలుపు ఆకు', 'Door width 3′6″–4′6″, height 6′8″–7′0″; a single leaf'),
    door: bi('తూర్పు/ఉత్తర ముఖం; తలుపు లోపలికి తెరిచేలా (శుభం)', 'Facing east or north; the leaf should open inwards'),
    window: bi('ద్వారం పక్కనే కిటికీ వద్దు — కాంతి ఫాన్‌లైట్ ద్వారా', 'Avoid a window directly beside the door — use a fanlight above'),
    daylight: bi('ప్రవేశ ద్వారంలో కనీసం 150 lux; ఉదయం సూర్య కిరణాలు నేరుగా', 'At least 150 lux at the threshold; direct morning sun'),
    ach: bi('2–3 ACH (ద్వారం తెరిచి ఉన్నప్పుడు సహజ ప్రసరణ)', '2–3 ACH through natural cross-flow when open'),
    mep: [
      bi('ఇంటర్‌కామ్, వీడియో డోర్ ఫోన్, ద్వారం పైన 6″ కండ్యూట్', 'Intercom and video door phone; a 6″ conduit above the door'),
      bi('బాహ్య ప్రకాశం కోసం IP65 LED, సెన్సార్ కలిగినది', 'IP65 LED for outdoor lighting, sensor-controlled'),
      bi('మెయిన్ ఎర్త్ పిట్ ద్వారానికి దూరంగా (నైరుతి) — 3 మీ కనిష్ఠం', 'Earth pit kept away from the door (south-west), minimum 3 m'),
    ],
    materials: [
      bi('ఇంటి ముఖానికి పసుపు/తెలుపు రంగు; కలప తలుపు (సాగ్ లేదా టేకు)', 'Yellow or white facade; wooden door — teak or seasoned hardwood'),
      bi('థ్రెషోల్డ్ (గడప) స్టోన్ — 1″ పైకి; నడిమి ఉండకూడదు', 'Stone threshold raised 1″; never split at the centre'),
    ],
    vastu: [
      bi('ఈశాన్యం/తూర్పు/ఉత్తరం శ్రేష్ఠం; నైరుతి-దక్షిణం దోషం', 'North-east, east or north are best; south-west and south are defects'),
      bi('ద్వారం ముందు నేరుగా చెట్టు/స్తంభం/విద్యుద్ స్తంభం ఉండకూడదు', 'No tree, column or electric pole directly in front of the door'),
      bi('ద్వారానికి ఎదురుగా అద్దం ఉండకూడదు', 'No mirror facing the entrance door'),
    ],
    engineering: [
      bi('ద్వారం పైన లింటెల్ కనీసం 6″ లోతు; 1.2 మీ పొడవు నిర్మాణ భారం', 'Lintel at least 6″ deep to carry 1.2 m of masonry above the opening'),
      bi('థ్రెషోల్డ్ కింద DPC + 50 mm granite; వర్షపు నీరు లోపలికి రాకుండా 1:50 వాలు', 'DPC under the threshold plus 50 mm granite; a 1:50 fall keeps rain out'),
      bi('ద్వారం-కిటికీ ఫ్రేమ్‌లకు MS ఆంకర్ @600 mm', 'MS anchors at 600 mm centres for door and window frames'),
    ],
    remedies: [
      bi('గణపతి/ద్వారపాలక విగ్రహాలు, పసుపు రంగు, “ఓం” చిహ్నం', 'Ganesha or dvarapalaka images, yellow paint, an “Om” symbol'),
      bi('తప్పు దిక్కు అయితే: ద్వారం మీద త్రిశూలం + కుబేర యంత్రం, రాత్రి దీపం', 'If wrongly placed: trishula above the door, Kubera yantra, a night lamp'),
      bi('తీవ్ర దోషం అయితే: ద్వారాన్ని సాధ్యమైనంత తూర్పు/ఉత్తరానికి మార్చడం', 'If severe: shift the doorway towards east or north'),
    ],
  },
  kitchen: {
    label: bi('వంటగది', 'Kitchen'),
    idealDik: 'SE',
    size: bi('8′×10′ నుండి 10′×12′; పొయ్యి-సింక్ మధ్య 3′ కనిష్ఠం', '8′×10′ to 10′×12′; at least 3′ between stove and sink'),
    door: bi('తూర్పు/ఉత్తర ముఖం; వంట చేసేవారు తూర్పు ముఖంగా', 'Door facing east or north; the cook faces east'),
    window: bi('వెడల్పు కిటికీ తూర్పు/ఉత్తర గోడపై; ఎగ్జాస్ట్ ఫ్యాన్ పొయ్యి పైన', 'A wide window on the east or north wall; exhaust fan directly above the stove'),
    daylight: bi('వంట బల్లపై 300–500 lux', '300–500 lux on the worktop'),
    ach: bi('10–12 ACH (ఎగ్జాస్ట్‌తో); CO₂ < 1000 ppm', '10–12 ACH with exhaust; keep CO₂ below 1000 ppm'),
    mep: [
      bi('LPG లైన్ ఎగ్జాస్ట్ కింద నుండి; గ్యాస్ డిటెక్టర్ నేలకు 30 సెం.మీ ఎత్తున', 'LPG line below the exhaust; a gas detector 30 cm above floor level'),
      bi('సింక్ → 50 mm ట్రాప్ → 75 mm వేస్ట్ లైన్ (నైరుతి వైపు వాలు)', 'Sink → 50 mm trap → 75 mm waste line, falling towards the south-west'),
      bi('పొయ్యి బ్యాక్‌స్ప్లాష్ కు ఫైర్-రెసిస్టెంట్ బోర్డ్; 20 A వేరు సర్క్యూట్', 'Fire-resistant board behind the hob; a dedicated 20 A circuit'),
    ],
    materials: [
      bi('ఆగ్నేయానికి ఎరుపు/నారింజ రంగు; గ్రానైట్ టాప్; యాంటీ-స్కిడ్ ఫ్లోర్', 'Red or orange in the south-east; granite worktop; anti-skid floor'),
      bi('మొదటి అంతస్తు ఉంటే వంటగది పైన మరుగుదొడ్డి వద్దు', 'No toilet directly above a kitchen on an upper floor'),
    ],
    vastu: [
      bi('పొయ్యి ఆగ్నేయ మూలలో; సింక్ ఈశాన్యం/ఉత్తరానికి', 'Stove in the south-east corner; sink towards the north-east or north'),
      bi('పొయ్యి-సింక్ ఒకే లైన్‌లో ఎదురెదురుగా ఉండకూడదు', 'Stove and sink must not face each other in a straight line'),
      bi('మైక్రోవేవ్/ఫ్రిజ్ దక్షిణ/పడమర గోడకు', 'Microwave and refrigerator against the south or west wall'),
    ],
    engineering: [
      bi('ఎగ్జాస్ట్ డక్ట్ 150 mm, బయటికి నేరుగా; బెండ్‌లు 2 కంటే ఎక్కువ వద్దు', '150 mm exhaust duct running straight out; no more than two bends'),
      bi('ఫ్లోర్ 1:100 వాలు + 50 mm ఫ్లోర్ ట్రాప్', 'Floor at a 1:100 fall with a 50 mm floor trap'),
      bi('తడి ప్రాంతాలలో 300 mm DPC; స్కర్టింగ్ 100 mm', '300 mm DPC in wet zones; 100 mm skirting'),
    ],
    remedies: [
      bi('తప్పు దిక్కు అయితే పొయ్యిని ఆగ్నేయానికి కదిలించండి; ఎరుపు రంగు, అగ్ని దీపం', 'If misplaced, move the stove to the south-east; red colour, an Agni lamp'),
      bi('ఉత్తర-ఈశాన్యంలో వంటగది ఉంటే: ఈశాన్యాన్ని తెల్లగా, నీటి పాత్ర, తులసి', 'Kitchen in the north-east: keep that corner white, with a water bowl and tulsi'),
    ],
  },
  masterBed: {
    label: bi('యజమాని నిద్ర గది', 'Master bedroom'),
    idealDik: 'SW',
    size: bi('12′×14′ నుండి 14′×16′; మంచం చుట్టూ 2′6″ ఖాళీ', '12′×14′ to 14′×16′; 2′6″ clear around the bed'),
    door: bi('తూర్పు/ఉత్తర ముఖం; తలుపు తెరిచినప్పుడు మంచం కనిపించకూడదు', 'Door facing east or north; the bed should not be visible when the door opens'),
    window: bi('తూర్పు/ఉత్తర గోడపై కిటికీ; ఫ్లోర్ వైశాల్యంలో 15–20%', 'Windows on the east or north wall; 15–20% of the floor area'),
    daylight: bi('150–300 lux; నేరుగా ఉదయపు సూర్యుడు', '150–300 lux, with direct morning sun'),
    ach: bi('3–4 ACH సహజ ప్రసరణ', '3–4 ACH natural cross-ventilation'),
    mep: [
      bi('మంచం తలభాగంలో ప్లగ్ పాయింట్లు వద్దు; 2-వే పిన్ సాకెట్లు గోడకు 300 mm ఎత్తున', 'No socket at the head of the bed; two-pin sockets at 300 mm above floor'),
      bi('AC ఇండోర్ యూనిట్ తూర్పు/ఉత్తర గోడకు; డ్రెయిన్ బయటికి', 'AC indoor unit on the east or north wall; drain led outdoors'),
      bi('నైరుతి బరువైన బీరువా; స్ట్రక్చరల్ గోడకు ఆంకర్', 'Heavy wardrobe in the south-west, anchored to a structural wall'),
    ],
    materials: [
      bi('నైరుతికి పసుపు/గోధుమ/బేసి రంగులు; కలప మంచం', 'Yellow, beige or earth tones in the south-west; a wooden bed'),
      bi('అద్దం మంచం ఎదురుగా ఉండకూడదు; ఉంటే రాత్రి కవర్ చేయండి', 'No mirror facing the bed; cover it at night if unavoidable'),
    ],
    vastu: [
      bi('తల దక్షిణానికి (లేదా తూర్పుకు); ఉత్తరానికి తల వద్దు', 'Head of the bed to the south (or east); never to the north'),
      bi('నైరుతి గది యజమానికి; పిల్లలకు పడమర/వాయవ్యం', 'South-west for the owner; west or north-west for children'),
      bi('మంచం కింద నిల్వ/ఇనుప వస్తువులు వద్దు', 'No storage or iron objects under the bed'),
    ],
    engineering: [
      bi('నైరుతి గోడ 230 mm బ్రిక్/ఆర్సీసీ — బీరువా భారం కోసం', '230 mm brick or RCC wall in the south-west to carry wardrobe loads'),
      bi('అకౌస్టిక్: పార్టీ వాల్ 100 mm + 50 mm గ్లాస్‌వూల్ (35 dB)', 'Acoustics: a 100 mm party wall plus 50 mm glass wool (about 35 dB)'),
      bi('బాల్కనీ తలుపుకు 1.05 m పారాపెట్ + సేఫ్టీ గ్రిల్', 'Balcony door with a 1.05 m parapet and safety grill'),
    ],
    remedies: [
      bi('తప్పు దిక్కు అయితే: మంచాన్ని నైరుతి మూలకు, తల దక్షిణం; భారీ వస్తువులు నైరుతికి', 'If misplaced: move the bed to the south-west corner, head south; heavy items to the south-west'),
      bi('తూర్పు/ఈశాన్యంలో నిద్ర గది ఉంటే: తెల్ల/ఆకుపచ్చ రంగు, తేలిక బల్ల', 'Bedroom in the east or north-east: white or green tones, light furniture'),
    ],
  },
  pooja: {
    label: bi('పూజా మందిరం', 'Puja room'),
    idealDik: 'NE',
    size: bi('4′×6′ నుండి 5′×7′; మండపం నేలకు 6″–1′ ఎత్తు', '4′×6′ to 5′×7′; the altar raised 6″–1′ above floor'),
    door: bi('తూర్పు/ఉత్తర ముఖం; డబుల్ తలుపు శుభం', 'Door facing east or north; double doors are auspicious'),
    window: bi('ఈశాన్యంలో చిన్న కిటికీ; ఉదయపు కాంతి', 'A small window in the north-east for morning light'),
    daylight: bi('250–400 lux, ప్రకాశవంతం కానీ నేరుగా కాదు', '250–400 lux — bright but without glare'),
    ach: bi('2–3 ACH; ధూపం కోసం వెంటిలేషన్', '2–3 ACH; ventilation for incense smoke'),
    mep: [
      bi('దీపం కోసం ప్రత్యేక 6 A సర్క్యూట్ + RCD', 'A dedicated 6 A circuit with RCD for the lamp'),
      bi('నీటి సరఫరా: చిన్న వాష్ బేసిన్; డ్రెయిన్ ఈశాన్యానికి వద్దు', 'Water: a small wash basin; avoid a drain outlet in the north-east'),
    ],
    materials: [
      bi('తెలుపు/పసుపు/లేత నీలం; మార్బుల్ లేదా గ్రానైట్ మండపం', 'White, yellow or pale blue; a marble or granite altar'),
      bi('బ్రహ్మస్థానంలో పూజ గది ఉంటే అది ఖాళీగా, నిర్మాణం లేకుండా', 'If the puja room is at the Brahmasthan, keep it light and open'),
    ],
    vastu: [
      bi('విగ్రహాలు తూర్పు/పడమర ముఖం; పూజ చేసేవారు తూర్పు ముఖం', 'Idols face east or west; the worshipper faces east'),
      bi('పూజ గదిలో శౌచ గృహం పక్కన ఉండకూడదు', 'No toilet sharing a wall with the puja room'),
      bi('గర్భగుడి కింద/పైన మరే గది ఉండకూడదు', 'No room directly above or below the sanctum'),
    ],
    engineering: [
      bi('ధూపం కోసం ఎగ్జాస్ట్ 100 mm; ఫైర్ అలారం (స్మోక్)', 'A 100 mm incense exhaust; a smoke alarm nearby'),
      bi('మండపం కింద కేబుల్ డక్ట్ దాచి, ఎడమ వైపు స్విచ్', 'Conceal the cable duct below the altar; switch on the left side'),
    ],
    remedies: [
      bi('తప్పు దిక్కు అయితే: ఈశాన్యంలో కనీసం ఒక దీప స్థలం, శంఖం, తులసి', 'If misplaced: at least keep a lamp niche, conch and tulsi in the north-east'),
      bi('దక్షిణ/నైరుతిలో పూజ ఉంటే: గోమయం/పసుపు రంగు, ప్రతిరోజూ శుభ్రత', 'Puja in the south or south-west: use cow-dung or yellow tones and clean daily'),
    ],
  },
  toilet: {
    label: bi('మరుగుదొడ్డి', 'Toilet'),
    idealDik: 'NW',
    size: bi('4′×6′ కనిష్ఠం; షవర్ 3′×3′', 'Minimum 4′×6′; a 3′×3′ shower'),
    door: bi('తూర్పు/ఉత్తర ముఖం; తలుపు బయటికి తెరవాలి', 'Door facing east or north; it should open outwards'),
    window: bi('వాయవ్య/Pడమర గోడపై వెంటిలేటర్ + కిటికీ', 'A ventilator and window on the north-west or west wall'),
    daylight: bi('150 lux కనిష్ఠం; నేరుగా సూర్యుడు అవసరం లేదు', 'Minimum 150 lux; direct sun not required'),
    ach: bi('10 ACH (ఇంటర్మిటెంట్ ఎగ్జాస్ట్) — తడి గదులకు తప్పనిసరి', '10 ACH intermittent exhaust — essential for wet rooms'),
    mep: [
      bi('వాటర్ క్లోజెట్ 110 mm లైన్; ఫ్లోర్ ట్రాప్ 50 mm; వెంట్ పైపు టెర్రస్ దాటి', '110 mm WC line, 50 mm floor trap, vent pipe taken above the terrace'),
      bi('జియోబ్యాక్టీరియల్ ఫ్లోర్ ట్రాప్‌లు; 300 mm DPC; వాటర్ ప్రూఫింగ్ IS 3370', 'Geobacterial floor traps; 300 mm DPC; waterproofing to IS 3370'),
      bi('ఎగ్జాస్ట్ ఫ్యాన్ ఈశాన్యానికి ఎదురుగా కాకుండా', 'The exhaust fan must not face the north-east corner'),
    ],
    materials: [
      bi('యాంటీ-స్కిడ్ టైల్స్ (R11); తెలుపు/లేత రంగులు', 'Anti-skid tiles (R11 rating); white or light colours'),
      bi('నైరుతి గోడకు 100 mm సీల్; తడి గోడలపై టైల్ ఎత్తు 7′', 'Seal the south-west wall; tile wet walls to 7′ height'),
    ],
    vastu: [
      bi('ఈశాన్యం/నైరుతి/కేంద్రంలో మరుగుదొడ్డి తీవ్ర దోషం', 'A toilet in the north-east, south-west or centre is a severe defect'),
      bi('మరుగుదొడ్డి తలుపు వంటగది/పూజ గదికి ఎదురుగా ఉండకూడదు', 'The toilet door must not face the kitchen or puja room'),
      bi('మంచం తలభాగం మరుగుదొడ్డి గోడకు ఆని ఉండకూడదు', 'The head of the bed must not touch a toilet wall'),
    ],
    engineering: [
      bi('నేల 1:80 వాలు; థ్రెషోల్డ్ 25 mm; రెండు-పొర వాటర్ ప్రూఫింగ్', 'Floor at a 1:80 fall, a 25 mm threshold, two-coat waterproofing'),
      bi('సీలింగ్ కింద 150 mm క్లియరెన్స్ (డక్ట్/పైపులకు)', '150 mm clearance below the ceiling for ducts and pipes'),
      bi('IS 3370 ప్రకారం 24-గంటల పాండింగ్ టెస్ట్', 'A 24-hour ponding test as per IS 3370'),
    ],
    remedies: [
      bi('తప్పు దిక్కు అయితే: తలుపు మూసి ఉంచడం, ఉప్పు పాత్ర, ఎగ్జాస్ట్, నలుపు/నీలం రంగు', 'If misplaced: keep the door shut, a bowl of rock salt, an exhaust, dark blue tones'),
      bi('ఈశాన్యంలో ఉంటే: రాగి/పసుపు తాంబూలం, తులసి మొక్క, ప్రతి నెలా ఉప్పు మార్చడం', 'If in the north-east: a copper vessel, tulsi plant, and refresh the salt monthly'),
    ],
  },
  staircase: {
    label: bi('మెట్లు', 'Staircase'),
    idealDik: 'SW',
    size: bi('వెడల్పు 3′6″; రైజర్ 6″–6.5″, ట్రెడ్ 10″–11″', 'Width 3′6″; riser 6″–6.5″, tread 10″–11″'),
    door: bi('దక్షిణ/పడమర నుండి ప్రవేశం; సవ్యదిశలో (clockwise) ఎక్కడం', 'Entry from the south or west; ascend clockwise'),
    window: bi('పై భాగంలో కిటికీ — వెలుతురు, గాలి', 'A window at the top for light and air'),
    daylight: bi('100 lux కనిష్ఠం; ప్రమాదకర చీకటి వద్దు', 'At least 100 lux; avoid dangerous darkness'),
    ach: bi('సహజ ప్రసరణ 2 ACH', '2 ACH natural ventilation'),
    mep: [
      bi('బేస్‌లో ఎమర్జెన్సీ లైట్; రెండు-వైపుల హ్యాండ్‌రైల్', 'An emergency light at the base; handrails on both sides'),
      bi('వైరింగ్ మెట్ల కింద కాకుండా గోడలో; ఫైర్-రేటెడ్ కేబుల్', 'Wiring inside the wall, not under the steps; fire-rated cable'),
    ],
    materials: [
      bi('స్టీల్/కాంక్రీట్; నాన్-స్లిప్ నోసింగ్; రైజర్ మూసి ఉండాలి', 'Steel or concrete with non-slip nosing; risers closed'),
      bi('నైరుతి/దక్షిణ గోడకు ఆనించి; కేంద్రంలో మెట్లు వద్దు', 'Built against the south-west or south wall; never at the centre'),
    ],
    vastu: [
      bi('బ్రహ్మస్థానంలో మెట్లు తీవ్ర దోషం', 'A staircase at the Brahmasthan is a severe defect'),
      bi('మెట్ల కింద నిల్వ/పూజ/మంచం వద్దు', 'No storage, puja or bed under the staircase'),
      bi('మెట్ల సంఖ్య బేసి (15, 17, 19, 21) శుభం', 'An odd number of steps (15, 17, 19, 21) is auspicious'),
    ],
    engineering: [
      bi('వాፍల డిజైన్: రైజర్+ట్రెడ్ = 17″–18″; హెడ్‌రూమ్ 2.1 మీ', 'Comfort rule: riser + tread = 17″–18″; headroom 2.1 m'),
      bi('స్ట్రింగర్ MS 200 mm; రెండు-వైపుల ఆంకర్; లైవ్ లోడ్ 3 kN/m²', 'MS stringer 200 mm, anchored both sides; live load 3 kN/m²'),
      bi('మెట్ల పైన రెయిలింగ్ 1.0–1.05 మీ; వెడల్పు 4″', 'Railing 1.0–1.05 m high above the steps; 4″ wide'),
    ],
    remedies: [
      bi('తప్పు దిక్కు అయితే: మెట్ల కింద ఉప్పు/పసుపు పాత్ర, హనుమాన్ చిత్రం', 'If misplaced: rock salt or turmeric in a vessel under the stairs, a Hanuman image'),
      bi('మెట్లు కేంద్రంలో ఉంటే: తెరచి ఉంచకుండా తలుపు, కుబేర యంత్రం', 'Stairs at the centre: keep them enclosed with a door, and place a Kubera yantra'),
    ],
  },
  waterTank: {
    label: bi('మంచినీటి ట్యాంక్ (పైన)', 'Overhead water tank'),
    idealDik: 'NE',
    size: bi('1000 L/వ్యక్తికి నెలకు; 2 రోజుల నిల్వ', 'Size for two days of storage at about 1000 L per person per month'),
    door: bi('తూర్పు/ఉత్తర ముఖం; ట్యాంక్ మూత గట్టిగా', 'Access from the east or north; keep the lid sealed'),
    window: bi('—', '—'),
    daylight: bi('నేరుగా సూర్యుడు వద్దు (నీరు వేడెక్కకూడదు)', 'No direct sun — the water must not heat up'),
    ach: bi('—', '—'),
    mep: [
      bi('ఓవర్‌ఫ్లో → నైరుతి డ్రెయిన్; లెవెల్ కంట్రోలర్ + డ్రై-రన్ ప్రొటెక్షన్', 'Overflow led to a north-west drain; level controller with dry-run protection'),
      bi('ఇన్సులేటెడ్ ట్యాంక్; 6″ స్లాబ్ పైన ఎత్తు — నిర్మాణ భారం తనిఖీ', 'Insulated tank on a 6″ platform, with the structural load checked'),
    ],
    materials: [
      bi('HDPE/స్టెయిన్‌లెస్; UV-స్టెబిలైజ్డ్; వార్షిక శుభ్రత', 'HDPE or stainless steel, UV stabilised; clean annually'),
      bi('ట్యాంక్ కింద స్లాబ్‌లో అదనపు రీబార్', 'Extra rebar in the slab beneath the tank'),
    ],
    vastu: [
      bi('ఈశాన్యం/ఉత్తరం శ్రేష్ఠం; నైరుతిలో ట్యాంక్ దోషం', 'North-east or north is best; a south-west tank is a defect'),
      bi('ఆగ్నేయంలో నీటి ట్యాంక్ = అగ్ని-జల ఘర్షణ', 'A tank in the south-east creates a fire-water clash'),
    ],
    engineering: [
      bi('2000 L = 2 t స్థిర భారం; స్లాబ్ డిజైన్ 2.5 kN/m² అదనంగా', '2000 L ≈ 2 t dead load; design the slab for an extra 2.5 kN/m²'),
      bi('ట్యాంక్ గోడల మధ్య 300 mm ఖాళీ — నిర్వహణకు', '300 mm clearance around the tank for maintenance'),
    ],
    remedies: [
      bi('నైరుతిలో ఉంటే: ట్యాంక్ తరలించడం లేదా కింద భారీ రాయి + నలుపు రంగు', 'If in the south-west: relocate it, or place a heavy stone beneath and use dark tones'),
      bi('ఈశాన్యానికి మార్చలేకపోతే: నేల స్థాయి సంప్ + పంప్', 'If it cannot be moved to the north-east: use a ground-level sump with a pump'),
    ],
  },
  borewell: {
    label: bi('బోరు / బావి', 'Borewell / well'),
    idealDik: 'NE',
    size: bi('6″ బోరు; ఇంటి పునాదికి కనీసం 5′ దూరం', 'A 6″ bore, at least 5′ from the foundation'),
    door: bi('—', '—'),
    window: bi('—', '—'),
    daylight: bi('—', '—'),
    ach: bi('—', '—'),
    mep: [
      bi('సబ్‌మెర్సిబుల్ పంప్, 1.5 HP వరకు; డ్రై-రన్ ప్రొటెక్షన్', 'Submersible pump up to 1.5 HP with dry-run protection'),
      bi('బోరు నీరు ట్యాంక్‌కు — ఫిల్టర్ + UV శుద్ధి', 'Borewell water to the tank through a filter and UV treatment'),
    ],
    materials: [
      bi('PVC కేసింగ్ 4″; గ్రౌటింగ్ సిమెంట్', '4″ PVC casing with cement grouting'),
      bi('బోరు చుట్టూ 3′ కాంక్రీట్ ఎప్రన్', 'A 3′ concrete apron around the bore'),
    ],
    vastu: [
      bi('ఈశాన్యం/తూర్పు/ఉత్తరం మాత్రమే; నైరుతిలో బోరు ధన నష్టం', 'Only north-east, east or north; a south-west bore causes loss of wealth'),
      bi('పూజ గది/వంటగదిలో బోరు వద్దు', 'No bore inside the puja room or kitchen'),
    ],
    engineering: [
      bi('యీల్డ్ టెస్ట్: 4-గంటల పంపింగ్; రికవరీ రేటు నమోదు', 'Yield test: four hours of pumping, recording the recovery rate'),
      bi('పునాది నుంచి 5′ దూరం — సెటిల్‌మెంట్ నివారణకు', 'Keep 5′ from footings to avoid settlement'),
    ],
    remedies: [
      bi('తప్పు స్థానంలో ఉంటే: మూసి, పైన భారీ రాయి, పసుపు రంగు', 'If wrongly placed: seal it, place a heavy stone above, use yellow'),
    ],
  },
  safe: {
    label: bi('ధన నిల్వ / లాకర్', 'Wealth safe / locker'),
    idealDik: 'N',
    size: bi('తలుపు ఉత్తరం/తూర్పు ముఖం; స్పష్టమైన దృష్టి లైన్', 'Door opening north or east, in a clear line of sight'),
    door: bi('ఉత్తర/తూర్పు ముఖం; లోపల అద్దం', 'Facing north or east; a small mirror inside'),
    window: bi('—', '—'),
    daylight: bi('—', '—'),
    ach: bi('—', '—'),
    mep: [
      bi('సీక్రెట్ కంపార్ట్‌మెంట్ గోడలో; డబుల్ లాక్', 'A secret compartment in the wall; double lock'),
      bi('CCTV కవరేజ్ + మోషన్ సెన్సర్', 'CCTV coverage plus a motion sensor'),
    ],
    materials: [
      bi('ఉత్తర గోడలో ఉక్కు లాకర్; కింద గ్రానైట్ బేస్', 'A steel locker in the north wall on a granite base'),
      bi('లోపల కుబేర యంత్రం/బంగారు నాణెం', 'A Kubera yantra or a gold coin inside'),
    ],
    vastu: [
      bi('ఉత్తరం/నైరుతి శ్రేష్ఠం; దక్షిణం/ఆగ్నేయం దోషం', 'North or south-west is best; south or south-east is a defect'),
      bi('లాకర్ మీద బరువైన వస్తువులు వద్దు', 'No heavy objects stacked on the safe'),
    ],
    engineering: [
      bi('లాకర్ భారం 250–400 kg — గోడ/స్లాబ్ తనిఖీ', 'Safe weight 250–400 kg — check the wall or slab capacity'),
      bi('ఫైర్-రేటెడ్ బాక్స్ (1 గంట) డాక్యుమెంట్లకు', 'A one-hour fire-rated box for documents'),
    ],
    remedies: [
      bi('తప్పు దిక్కు అయితే: ఉత్తర గోడకు మార్చడం; తాత్కాలికంగా కుబేర యంత్రం', 'If misplaced: shift it to the north wall; meanwhile place a Kubera yantra'),
    ],
  },
  study: {
    label: bi('చదువు గది', 'Study room'),
    idealDik: 'E',
    size: bi('8′×10′; బల్ల 2′6″×4′, తూర్పు ముఖం', '8′×10′; a 2′6″×4′ desk facing east'),
    door: bi('తూర్పు/ఉత్తర ముఖం', 'Door facing east or north'),
    window: bi('తూర్పు/ఉత్తర గోడపై పెద్ద కిటికీ; ఎడమ వైపు కాంతి', 'A large window on the east or north wall; light from the left'),
    daylight: bi('500 lux (చదువుకు అనుకూలం)', '500 lux for reading comfort'),
    ach: bi('4–5 ACH; CO₂ < 800 ppm', '4–5 ACH; CO₂ below 800 ppm'),
    mep: [
      bi('బల్ల వద్ద 4 సాకెట్లు; UPS/ఇన్వర్టర్ కనెక్షన్', 'Four sockets at the desk; a UPS or inverter connection'),
      bi('LED ప్యానెల్ 4000K; నీడ లేకుండా', 'A 4000 K LED panel without shadows'),
    ],
    materials: [
      bi('ఆకుపచ్చ/తెలుపు/లేత పసుపు; చెక్క బల్ల', 'Green, white or pale yellow; a wooden desk'),
      bi('గోడపై స్ఫూర్తి బోర్డ్ (ఈశాన్యం)', 'An inspiration board on the north-east wall'),
    ],
    vastu: [
      bi('చదువుతున్నప్పుడు తూర్పు/ఉత్తర ముఖం; వీపు గోడకు', 'Face east or north while studying, with the back to a wall'),
      bi('బల్ల కింద కాళ్లు ఖాళీగా; తలుపు వెనుక కూర్చోకూడదు', 'Keep the space under the desk clear; never sit with your back to a door'),
    ],
    engineering: [
      bi('బల్ల ఎత్తు 750 mm; కుర్చీ 450 mm; మణికట్టు 90°', 'Desk height 750 mm, chair 450 mm, wrists at 90°'),
      bi('కిటికీ-బల్ల మధ్య 1.5 మీ — ప్రకాశం నేరుగా కళ్లకు రాకుండా', 'Keep 1.5 m between window and desk to avoid glare'),
    ],
    remedies: [
      bi('తప్పు దిక్కు అయితే: బల్లను తూర్పు ముఖంగా తిప్పడం; సరస్వతి చిత్రం', 'If misplaced: turn the desk to face east; a Saraswati image'),
    ],
  },
  living: {
    label: bi('హాల్ / లివింగ్ రూమ్', 'Living room'),
    idealDik: 'E',
    size: bi('14′×18′ నుండి 16′×22′; ఉత్తర-తూర్పు తేలిక', '14′×18′ to 16′×22′; keep the north-east light'),
    door: bi('తూర్పు/ఉత్తర ముఖం; ప్రవేశం విశాలంగా', 'Facing east or north, with a generous entry'),
    window: bi('తూర్పు/ఉత్తరం పెద్ద కిటికీలు; క్రాస్ వెంటిలేషన్', 'Large windows to the east and north for cross-ventilation'),
    daylight: bi('300 lux; ఉదయం 2 గంటలు నేరుగా సూర్యుడు', '300 lux, with two hours of direct morning sun'),
    ach: bi('4–6 ACH', '4–6 ACH'),
    mep: [
      bi('TV పడమర/దక్షిణ గోడకు; సోఫా తూర్పు/ఉత్తర ముఖం', 'TV on the west or south wall; sofa facing east or north'),
      bi('సీలింగ్ ఫ్యాన్ 1.4 మీ; 2.4 మీ ఎత్తు', 'Ceiling fan 1.4 m diameter at 2.4 m height'),
    ],
    materials: [
      bi('తెలుపు/క్రీమ్/లేత ఆకుపచ్చ; మొక్కలు ఈశాన్యంలో', 'White, cream or light green; plants in the north-east'),
      bi('నైరుతిలో భారీ సోఫా; పడమర టీవీ', 'Heavy sofa in the south-west; TV on the west'),
    ],
    vastu: [
      bi('అతిథుల కుర్చీలు దక్షిణ/పడమర ముఖం', 'Guest seating facing south or west'),
      bi('ప్రవేశ ద్వారానికి ఎదురుగా అద్దం — కుటుంబ విభేదాలు', 'A mirror directly facing the entrance causes family discord'),
    ],
    engineering: [
      bi('స్లాబ్ స్పాన్ 4.5 మీ వరకు 125 mm; బీమ్ లోతు స్పాన్/12', 'Slab 125 mm up to a 4.5 m span; beam depth = span/12'),
      bi('అకౌస్టిక్ సీలింగ్ (TV జోన్) 25 mm', 'A 25 mm acoustic ceiling over the TV zone'),
    ],
    remedies: [
      bi('తప్పు దిక్కు అయితే: ఈశాన్యాన్ని ఖాళీ, ప్రకాశవంతం; తులసి', 'If misplaced: keep the north-east empty and bright; add tulsi'),
    ],
  },
  guest: {
    label: bi('అతిథి గది', 'Guest room'),
    idealDik: 'NW',
    size: bi('10′×12′; తేలిక బల్ల', '10′×12′ with light furniture'),
    door: bi('తూర్పు/ఉత్తర ముఖం', 'Door facing east or north'),
    window: bi('వాయవ్య/పడమర కిటికీ — గాలి', 'A north-west or west window for air'),
    daylight: bi('150–250 lux', '150–250 lux'),
    ach: bi('3–4 ACH', '3–4 ACH'),
    mep: [
      bi('అతిథి గదిలో AC + చార్జింగ్ పాయింట్లు', 'AC and charging points in the guest room'),
      bi('బాత్‌రూమ్ షేర్ — వాయవ్యం', 'A shared bathroom on the north-west side'),
    ],
    materials: [
      bi('తెలుపు/బూడిద; తేలిక కలప', 'White or grey; light wood'),
    ],
    vastu: [
      bi('నైరుతిలో అతిథి గది వద్దు — అతిథులు ఎక్కువ కాలం ఉండటం', 'No guest room in the south-west — guests tend to overstay'),
      bi('గదిలో ధన నిల్వ వద్దు', 'No valuables stored there'),
    ],
    engineering: [
      bi('గదికి వేరు ఎగ్జాస్ట్/AC; సౌండ్ ఇన్సులేషన్ 30 dB', 'A separate exhaust or AC; 30 dB sound insulation'),
    ],
    remedies: [
      bi('అతిథి గదిని నైరుతిలో ఉంచకపోవడమే పరిహారం; ఉంటే తలుపు మూసి ఉంచండి', 'Keep the guest room out of the south-west; if it is there, keep the door closed'),
    ],
  },
  children: {
    label: bi('పిల్లల గది', 'Children’s room'),
    idealDik: 'W',
    size: bi('10′×12′; బల్ల 2′×4′', '10′×12′; a 2′×4′ desk'),
    door: bi('తూర్పు/ఉత్తర ముఖం', 'Door facing east or north'),
    window: bi('పడమర/వాయవ్య కిటికీ; భద్రతా గ్రిల్', 'A west or north-west window with a safety grill'),
    daylight: bi('300 lux; నేరుగా కాంతి కళ్లకు రాకుండా', '300 lux, avoiding direct glare'),
    ach: bi('3–4 ACH', '3–4 ACH'),
    mep: [
      bi('నైట్ ల్యాంప్, చైల్డ్-సేఫ్ సాకెట్లు (శటర్)', 'A night lamp and child-safe sockets with shutters'),
      bi('స్టడీ డెస్క్ తూర్పు ముఖం; ల్యాంప్ ఎడమ వైపు', 'A study desk facing east, with the lamp on the left'),
    ],
    materials: [
      bi('లేత నీలం/ఆకుపచ్చ/పసుపు; నాన్-టాక్సిక్ పెయింట్', 'Light blue, green or yellow; non-toxic paint'),
      bi('నిల్వ తక్కువ; నేలపై ఆడుకోవడానికి ఖాళీ', 'Low storage; open floor space for play'),
    ],
    vastu: [
      bi('పశ్చిమ/వాయవ్యం పిల్లలకు శ్రేష్ఠం; నైరుతి భారం వద్దు', 'West or north-west suits children; avoid south-west heaviness'),
      bi('మంచం తల దక్షిణం/తూర్పు', 'Head of the bed to the south or east'),
    ],
    engineering: [
      bi('గ్రిల్ ఖాళీ 4″ కంటే తక్కువ; కిటికీ లాక్ 1.2 మీ ఎత్తున', 'Grill spacing under 4″; window locks at 1.2 m height'),
      bi('రౌండ్ ఎడ్జ్ ఫర్నిచర్; నేల R10 నాన్-స్లిప్', 'Rounded furniture edges; R10 non-slip flooring'),
    ],
    remedies: [
      bi('తప్పు దిక్కు అయితే: బల్లను తూర్పు ముఖంగా; ఆకుపచ్చ రంగు', 'If misplaced: face the desk east; use green tones'),
    ],
  },
  dining: {
    label: bi('భోజన గది', 'Dining room'),
    idealDik: 'W',
    size: bi('10′×12′; బల్ల చుట్టూ 3′ ఖాళీ', '10′×12′; 3′ clear around the table'),
    door: bi('తూర్పు/ఉత్తర ముఖం', 'Door facing east or north'),
    window: bi('పడమర కిటికీ; క్రాస్ వెంటిలేషన్', 'A west window with cross-ventilation'),
    daylight: bi('250–300 lux', '250–300 lux'),
    ach: bi('4 ACH', '4 ACH'),
    mep: [
      bi('డైనింగ్ ల్యాంప్ 2700–3000K; 800 mm బల్ల పైన', 'A 2700–3000 K pendant 800 mm above the table'),
      bi('వాష్ బేసిన్ ఈశాన్యం/ఉత్తరానికి', 'A wash basin towards the north-east or north'),
    ],
    materials: [
      bi('పడమర రంగులు — లేత నీలం/తెలుపు; చెక్క బల్ల', 'West tones — pale blue or white; a wooden table'),
    ],
    vastu: [
      bi('తూర్పు ముఖంగా భోజనం; నైరుతిలో తినడం వద్దు', 'Eat facing east; avoid eating in the south-west'),
      bi('భోజన గదిలో మరుగుదొడ్డి తలుపు ఎదురుగా వద్దు', 'No toilet door opening into the dining room'),
    ],
    engineering: [
      bi('బల్ల ఎత్తు 750 mm; కుర్చీ 450 mm; 600 mm/వ్యక్తి', 'Table 750 mm, chair 450 mm, 600 mm per person'),
    ],
    remedies: [
      bi('తప్పు దిక్కు అయితే: బల్లను పడమర/తూర్పు దిశకు; తెలుపు రంగు', 'If misplaced: orient the table west or east; use white tones'),
    ],
  },
  septic: {
    label: bi('సెప్టిక్ ట్యాంక్', 'Septic tank'),
    idealDik: 'NW',
    size: bi('వ్యక్తికి 30 L; కనీసం 1000 L', '30 L per person; minimum 1000 L'),
    door: bi('—', '—'),
    window: bi('—', '—'),
    daylight: bi('—', '—'),
    ach: bi('—', '—'),
    mep: [
      bi('సాయిల్ పైప్ టెర్రస్ దాటి; వెంటిలేషన్ తప్పనిసరి', 'A soil pipe above the terrace; ventilation is essential'),
      bi('బయో-డైజెస్టర్/సెప్టిక్ + సోక్ పిట్ 2 మీ దూరం', 'A bio-digester or septic tank with a soak pit 2 m away'),
    ],
    materials: [
      bi('RCC ట్యాంక్ (IS 3370); 150 mm గోడలు', 'An RCC tank to IS 3370 with 150 mm walls'),
    ],
    vastu: [
      bi('వాయవ్యం/పడమర శ్రేష్ఠం; ఈశాన్యం/నైరుతి తీవ్ర దోషం', 'North-west or west is best; north-east or south-west is a severe defect'),
      bi('బోరు నుంచి కనీసం 15 మీ దూరం', 'At least 15 m from any borewell'),
    ],
    engineering: [
      bi('స్లాప్ 1:100 వాలు; ఇన్‌స్పెక్షన్ చాంబర్ 600 mm', 'A 1:100 pipe fall; a 600 mm inspection chamber'),
      bi('గ్రౌండ్ వాటర్ లెవల్ కంటే 1 మీ పైన', 'The base at least 1 m above the water table'),
    ],
    remedies: [
      bi('తప్పు స్థానంలో ఉంటే: మూత గట్టిగా, అరటి/వేప చెట్టు, ప్రతి 6 నెలలకు శుభ్రత', 'If wrongly placed: seal the cover, plant banana or neem, clean every six months'),
    ],
  },
  balcony: {
    label: bi('బాల్కనీ', 'Balcony'),
    idealDik: 'NE',
    size: bi('4′ గాఢత; పారాపెట్ 3′6″ (1.05 మీ)', '4′ deep; parapet 3′6″ (1.05 m)'),
    door: bi('తూర్పు/ఉత్తర ముఖం; స్లైడింగ్', 'Facing east or north; sliding'),
    window: bi('బయటికి తెరిచే కిటికీ; మొక్కలు', 'Openable windows with planter boxes'),
    daylight: bi('సహజ కాంతి 500+ lux', 'Natural light 500+ lux'),
    ach: bi('5+ ACH (బయటి గాలి)', '5+ ACH from outdoor air'),
    mep: [
      bi('కాంతి + సీలింగ్ ఫ్యాన్; వాటర్ ప్రూఫింగ్', 'Lighting and a ceiling fan; waterproofing'),
      bi('బాల్కనీ డ్రెయిన్ బయటికి (నైరుతి వైపు)', 'A balcony drain led out towards the north-west'),
    ],
    materials: [
      bi('నాన్-స్లిప్ టైల్స్; ఇనుప రైలింగ్ 1.05 మీ', 'Non-slip tiles; a metal railing 1.05 m high'),
    ],
    vastu: [
      bi('ఈశాన్యం/తూర్పు/ఉత్తరం బాల్కనీ శుభం; నైరుతిలో బరువు వద్దు', 'A north-east, east or north balcony is auspicious; no load in the south-west'),
      bi('బాల్కనీలో చెత్త/నిల్వ వద్దు', 'No junk or storage on the balcony'),
    ],
    engineering: [
      bi('కాంక్రీట్ పారాపెట్ 100 mm; లైవ్ లోడ్ 3 kN/m²', 'A 100 mm concrete parapet; 3 kN/m² live load'),
      bi('అల్యూమినియం స్లైడింగ్ — విండ్ లోడ్ తనిఖీ (IS 875-3)', 'Aluminium sliding shutters checked for wind load (IS 875-3)'),
    ],
    remedies: [
      bi('నైరుతిలో బాల్కనీ ఉంటే: తేలిక వస్తువులు, మొక్కలు, శుభ్రత', 'Balcony in the south-west: keep it light, add plants, keep it clean'),
    ],
  },
};

/* ------------------------------------------------------------------ */
/*  Services (per-service advanced plan)                               */
/* ------------------------------------------------------------------ */

const SERVICES: ServicePlan[] = [
  {
    key: 'electrical',
    title: bi('విద్యుత్ వ్యవస్థ (Electrical)', 'Electrical system'),
    primaryDik: 'SE',
    spec: [
      bi('మీటర్ బోర్డ్ + DB ఆగ్నేయ/దక్షిణ గోడకు; ఎర్త్ పిట్ నైరుతి', 'Meter board and DB on the south-east or south wall; earth pit in the south-west'),
      bi('MCB + RCCB 30 mA; ఒక్కో ఫ్లోర్‌కు వేరు DB', 'MCB with a 30 mA RCCB; a separate DB per floor'),
      bi('లైటింగ్ 6 A, పవర్ 16 A; వంటగది/AC కి ప్రత్యేక సర్క్యూట్', '6 A lighting, 16 A power; dedicated circuits for kitchen and AC'),
      bi('కేబుల్: 1.5 mm² లైటింగ్, 2.5 mm² సాకెట్లు, 4 mm² AC, 6 mm² మెయిన్', 'Cable: 1.5 mm² lighting, 2.5 mm² sockets, 4 mm² AC, 6 mm² mains'),
      bi('ఇన్వర్టర్ + సోలార్ రెడీ; ఎర్తింగ్ ≤ 1 Ω (IS 732)', 'Inverter and solar-ready; earthing ≤ 1 Ω to IS 732'),
    ],
    risks: [
      bi('నైరుతిలో ఎర్త్ పిట్ లేకపోతే లీకేజ్ ప్రమాదం', 'No earth pit in the south-west raises the risk of leakage'),
      bi('ఈశాన్యంలో భారీ ట్రాన్స్‌ఫార్మర్/DB = వాస్తు దోషం', 'A heavy transformer or DB in the north-east is a Vastu defect'),
    ],
  },
  {
    key: 'plumbing',
    title: bi('ప్లంబింగ్ & నీటి వ్యవస్థ', 'Plumbing and water'),
    primaryDik: 'NW',
    spec: [
      bi('సప్లై రైజర్ తూర్పు/ఉత్తరం; డ్రెయిన్ రైజర్ నైరుతి/పడమర', 'Supply risers on the east or north; drainage risers on the south-west or west'),
      bi('మంచినీరు ఈశాన్యం; వేడి నీరు ఆగ్నేయం', 'Drinking water in the north-east; hot water in the south-east'),
      bi('CPVC సప్లై, PVC 110 mm డ్రెయిన్; ప్రతి 3 మీ ట్రాప్', 'CPVC supply, 110 mm PVC drainage, a trap every 3 m'),
      bi('సంప్ 25 L/వ్యక్తి/రోజు × 2 రోజులు; రెయిన్ వాటర్ హార్వెస్టింగ్', 'Sump at 25 L per person per day for two days; rainwater harvesting'),
      bi('ప్రతి తడి గదిలో 24-గంటల పాండింగ్ టెస్ట్', 'A 24-hour ponding test in every wet room'),
    ],
    risks: [
      bi('ఈశాన్యంలో డ్రెయిన్ → ఆర్థిక నష్టం, తేమ', 'A drain in the north-east leads to financial loss and damp'),
      bi('నైరుతిలో సప్లై లైన్ లీక్ → పునాది క్షయం', 'Supply-line leakage in the south-west erodes the foundation'),
    ],
  },
  {
    key: 'hvac',
    title: bi('HVAC & గాలి నాణ్యత', 'HVAC and air quality'),
    primaryDik: 'NW',
    spec: [
      bi('అవుట్‌డోర్ యూనిట్ వాయవ్యం/ఉత్తరం; ఎండ నేరుగా వద్దు', 'Outdoor units in the north-west or north, out of direct sun'),
      bi('ఇండోర్ యూనిట్ తూర్పు/ఉత్తర గోడ; తలకు ఎదురుగా కాదు', 'Indoor units on the east or north wall, never blowing at the head'),
      bi('ఫ్రెష్ ఎయిర్ 10 L/s/వ్యక్తి; CO₂ సెన్సర్', 'Fresh air 10 L/s per person with a CO₂ sensor'),
      bi('వంటగది 10–12 ACH, మరుగుదొడ్డి 10 ACH ఎగ్జాస్ట్', 'Kitchen exhaust 10–12 ACH; toilet exhaust 10 ACH'),
      bi('PM2.5 ఫిల్టర్ (MERV 13) — నగర వాతావరణానికి', 'MERV 13 filtration for urban air'),
    ],
    risks: [
      bi('దక్షిణం/నైరుతిలో అవుట్‌డోర్ యూనిట్ = వేడి గాలి తిరిగి లోపలికి', 'An outdoor unit in the south or south-west recycles hot air indoors'),
      bi('ఎగ్జాస్ట్ లేని తడి గదులు → తేమ, అచ్చు', 'Wet rooms without exhaust breed damp and mould'),
    ],
  },
  {
    key: 'solar',
    title: bi('సోలార్ & ఇనర్జీ', 'Solar and energy'),
    primaryDik: 'S',
    spec: [
      bi('ప్యానెల్స్ దక్షిణం/నైరుతి పైకప్పుపై 15° వాలుతో', 'Panels on the south or south-west roof at a 15° tilt'),
      bi('ఇన్వర్టర్ + బ్యాటరీ నైరుతి/దక్షిణ గదిలో; వెంటిలేషన్', 'Inverter and battery in the south-west or south room with ventilation'),
      bi('3 kW = సుమారు 12 kWh/రోజు (హైదరాబాద్ సగటు 4.5 kWh/m²/రోజు)', 'A 3 kW array yields about 12 kWh a day (Hyderabad averages 4.5 kWh/m²/day)'),
      bi('నెట్ మీటరింగ్ + ఆర్థింగ్; DC కేబుల్ డబుల్ ఇన్సులేటెడ్', 'Net metering with earthing; double-insulated DC cable'),
    ],
    risks: [
      bi('ఈశాన్యంలో ప్యానెల్స్ = తక్కువ ఉత్పత్తి + వాస్తు దోషం', 'Panels in the north-east mean poor yield and a Vastu defect'),
      bi('పైకప్పు భారం: 3 kW ≈ 600 kg — స్ట్రక్చరల్ తనిఖీ', 'Roof load: 3 kW ≈ 600 kg — get the structure checked'),
    ],
  },
  {
    key: 'fire',
    title: bi('అగ్ని భద్రత', 'Fire safety'),
    primaryDik: 'SE',
    spec: [
      bi('స్మోక్ అలారం ప్రతి పడక గదిలో; హీట్ డిటెక్టర్ వంటగదిలో', 'Smoke alarms in every bedroom; a heat detector in the kitchen'),
      bi('AB C డ్రై పౌడర్ ఎక్స్‌టింగ్విషర్ వంటగది దగ్గర', 'An ABC dry-powder extinguisher near the kitchen'),
      bi('LPG సిలిండర్ బయట/వెంటిలేటెడ్ గూడులో; రెగ్యులేటర్ తనిఖీ', 'The LPG cylinder outside or in a ventilated niche; check the regulator'),
      bi('ఎస్కేప్ రూట్: మెట్లు 900 mm, ఎమర్జెన్సీ లైట్', 'Escape route: a 900 mm staircase with emergency lighting'),
    ],
    risks: [
      bi('వంటగదిలో సింక్-పొయ్యి దగ్గర → నీరు-అగ్ని ఘర్షణ, ప్రమాదం', 'A sink next to the stove is both a Vastu clash and a fire risk'),
      bi('ఒకే ఎగ్జిట్ → అగ్ని ప్రమాదంలో చిక్కుకోవడం', 'A single exit means being trapped in a fire'),
    ],
  },
  {
    key: 'acoustics',
    title: bi('అకౌస్టిక్స్ & ప్రశాంతత', 'Acoustics and calm'),
    primaryDik: 'NW',
    spec: [
      bi('పడక గది పార్టీ వాల్ 100 mm + గ్లాస్‌వూల్ 50 mm (35 dB)', 'Bedroom party wall 100 mm plus 50 mm glass wool (35 dB)'),
      bi('పూజ గది/చదువు గది బయటి శబ్దం నుంచి దూరం', 'Keep the puja and study rooms away from outdoor noise'),
      bi('మెట్లలో ఎకో చికిత్స; తలుపులపై రబ్బర్ స్ట్రిప్', 'Treat echo in the staircase; rubber strips on doors'),
      bi('AC/ఫ్యాన్ శబ్దం < 35 dB (రాత్రి)', 'AC and fan noise below 35 dB at night'),
    ],
    risks: [
      bi('నైరుతిలో పడక గది + రోడ్డు శబ్దం → నిద్ర లోపం', 'A south-west bedroom next to road noise disturbs sleep'),
    ],
  },
  {
    key: 'water',
    title: bi('వర్షపు నీరు, సంప్ & రీచార్జ్', 'Rainwater, sump and recharge'),
    primaryDik: 'NE',
    spec: [
      bi('పైకప్పు వర్షపు నీరు → ఫిల్టర్ → 5,000 L భూగర్భ ట్యాంక్ (ఈశాన్యం/ఉత్తరం)', 'Roof runoff → first-flush filter → 5,000 L underground tank in the north-east or north'),
      bi('అధిక నీరు → రీచార్జ్ పిట్ 1.5 × 1.5 × 3 మీ, ఈశాన్యం; ఇసుక-జల్లి పొరలు', 'Overflow → a 1.5 × 1.5 × 3 m recharge pit in the north-east, layered with sand and gravel'),
      bi('తాగునీరు 25 L/వ్యక్తి/రోజు; ఓవర్‌హెడ్ ట్యాంక్ పశ్చిమ/నైరుతి (నీటి భారం)', 'Potable water at 25 L per person per day; overhead tank to the west or south-west, where a water load belongs'),
      bi('బోర్‌వెల్ రీచార్జ్: 100 mm బోరింగ్ → ఫిల్టర్ → డిశ్చార్జ్ పైపు', 'Borewell recharge: 100 mm bore, filter media, discharge pipe'),
      bi('ట్యాంక్ లైనింగ్: 20 mm సిమెంట్ ప్లాస్టర్ + వాటర్‌ప్రూఫింగ్; 20 L/మీ² పరీక్ష', 'Tank lining: 20 mm cement plaster plus waterproofing; test at 20 L/m²'),
    ],
    risks: [
      bi('సంప్/సెప్టిక్ ఈశాన్యంలో → ఆర్థిక, ఆరోగ్య దోషం (అత్యంత వర్జనీయం)', 'A sump or septic tank in the north-east is the gravest Vastu and health defect'),
      bi('రీచార్జ్ లేకపోతే భూగర్భ జల మట్టం పడిపోతుంది; పునాది దగ్గర ఊట', 'No recharge lowers the water table and can waterlog the foundation'),
    ],
  },
  {
    key: 'sewage',
    title: bi('మురుగు, చెత్త & సెప్టిక్', 'Sewage, waste and septic'),
    primaryDik: 'NW',
    spec: [
      bi('సెప్టిక్ ట్యాంక్ / STP పశ్చిమ-వాయవ్యం; అంచు నుంచి 1 మీ లోపల ఉండకూడదు', 'Septic tank or STP to the west or north-west, never within 1 m of the boundary'),
      bi('మురుగు వాలు 1:60 నుంచి 1:100; ఇన్‌స్పెక్షన్ చాంబర్ ప్రతి 6 మీ', 'Drainage gradient 1:60 to 1:100 with an inspection chamber every 6 m'),
      bi('వంటగది గ్రీజ్ ట్రాప్; తడి చెత్త → కంపోస్ట్ పిట్ (దక్షిణం/పశ్చిమం)', 'A grease trap for the kitchen; wet waste to a compost pit in the south or west'),
      bi('STP శుద్ధి నీరు తోటకు — 5-రోజుల BOD < 10 mg/L', 'Treated STP water goes to the garden with BOD under 10 mg/L over five days'),
      bi('చెత్త విభజన: ఆకుపచ్చ/నీలం/ఎరుపు; నైరుతిలో చెత్త గది కాదు', 'Segregate waste into green, blue and red; never a garbage room in the south-west'),
    ],
    risks: [
      bi('ఈశాన్యంలో సెప్టిక్ → దోషం; నైరుతిలో చెత్త → ధన నష్టం', 'A septic tank in the north-east or garbage in the south-west both drain prosperity'),
      bi('వాలు తప్పితే బ్యాక్‌ఫ్లో → నీరు నిలిచి తేమ, అచ్చు', 'A wrong gradient causes backflow, standing water and mould'),
    ],
  },
  {
    key: 'structure',
    title: bi('నిర్మాణం, పునాది & భూమి', 'Structure, foundation and soil'),
    primaryDik: 'SW',
    spec: [
      bi('SBC పరీక్ష (IS 1888); ≥ 150 kN/m² ఉంటే isolated footing, తక్కువైతే raft', 'Test the safe bearing capacity to IS 1888: isolated footings above 150 kN/m², a raft below that'),
      bi('M25 కాంక్రీట్, Fe 500D స్టీల్; కవర్: పునాది 50 mm, స్లాబ్ 20 mm', 'M25 concrete with Fe 500D steel; 50 mm cover at footings, 20 mm in slabs'),
      bi('సీస్మిక్ జోన్ III (హైదరాబాద్) — IS 13920 డక్టైల్ వివరాలు', 'Seismic Zone III at Hyderabad — IS 13920 ductile detailing'),
      bi('ప్లింత్ కనీసం 450 mm; DPC + ఆంటీ-టెర్మైట్ చికిత్స', 'Plinth at least 450 mm high, with a DPC and anti-termite treatment'),
      bi('నైరుతి భాగం 25–50 mm ఎత్తు — శాస్త్రీయ వాలు, వర్షపు నీరు ఈశాన్యానికి', 'Keep the south-west 25–50 mm higher — the classical slope, with runoff to the north-east'),
    ],
    risks: [
      bi('నైరుతి కట్టడం తక్కువ ఎత్తులో → వాస్తు దోషం + నీరు నిలవడం', 'A lower south-west mass is both a Vastu defect and a water trap'),
      bi('SBC పరీక్ష లేకుండా నిర్మాణం → అసమ డిఫరెన్షియల్ సెటిల్‌మెంట్, పగుళ్లు', 'Building without an SBC test risks differential settlement and cracks'),
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Plan builder                                                       */
/* ------------------------------------------------------------------ */

const BEST: Record<RoomKey, DikInfo['id'][]> = {
  entrance: ['E', 'N', 'NE'], kitchen: ['SE'], masterBed: ['SW'], pooja: ['NE'],
  toilet: ['NW', 'W'], staircase: ['SW', 'S', 'W'], waterTank: ['NE', 'N'], borewell: ['NE', 'E', 'N'],
  safe: ['N', 'SW'], study: ['E', 'NE', 'N'], living: ['E', 'N'], guest: ['NW'],
  children: ['W', 'NW'], dining: ['W', 'E'], septic: ['NW', 'W'], balcony: ['NE', 'E', 'N'],
};
const OK: Record<RoomKey, DikInfo['id'][]> = {
  entrance: ['W', 'NW'], kitchen: ['E', 'S'], masterBed: ['S', 'W'], pooja: ['E', 'N'],
  toilet: ['S', 'W'], staircase: ['N'], waterTank: ['E'], borewell: ['W'],
  safe: ['E', 'NE'], study: ['W'], living: ['W'], guest: ['N', 'W'],
  children: ['S'], dining: ['S', 'N'], septic: ['S'], balcony: ['N', 'W'],
};

const complianceOf = (key: RoomKey, dik: DikInfo['id']): Compliance =>
  BEST[key].includes(dik) ? 'best' : OK[key].includes(dik) ? 'ok' : 'bad';

/**
 * Vastu Ayadi — శాస్త్రీయ చుట్టుకొలత అంకగణితం.
 *
 * సూత్రం (సంప్రదాయ ఆయాది గణితం): చుట్టుకొలత P అయితే
 *   ఆయం  = (8 × P) మిగిలినది 12 తో భాగించగా  → 1…12
 *   వ్యయం = (9 × P) మిగిలినది 10 తో భాగించగా  → 1…10
 * మిగిలినది 0 అయితే భాజకమే (12 లేదా 10) తీసుకోవాలి.
 * ఆయం > వ్యయం అయితే సంపద వృద్ధి; వ్యయం ఎక్కువైతే ఖర్చు ఎక్కువ.
 */
export function ayadiCheck(lengthFt: number, widthFt: number): ProjectPlan['ayadi'] {
  const perimeterFt = Math.round(2 * (Math.max(lengthFt, widthFt) + Math.min(lengthFt, widthFt)));
  const rem = (v: number, mod: number) => {
    const r = v % mod;
    return r === 0 ? mod : r;
  };
  const aya = rem(perimeterFt * 8, 12);
  const vyaya = rem(perimeterFt * 9, 10);
  const verdictBad = aya <= vyaya;
  return {
    perimeterFt,
    aya,
    vyaya,
    verdictBad,
    note: verdictBad
      ? bi(
          `చుట్టుకొలత ${perimeterFt}′ → ఆయం ${aya}, వ్యయం ${vyaya}. వ్యయం సమానం/ఎక్కువ — కొలతలను కొద్దిగా మార్చి (ఉదా. పొడవు ±1′) ఆయం పెంచుకోవడం మేలు.`,
          `Perimeter ${perimeterFt}′ → ayam ${aya}, vyayam ${vyaya}. Expenditure equals or exceeds profit — adjust the dimensions slightly (e.g. ±1′ in length) so that ayam prevails.`
        )
      : bi(
          `చుట్టుకొలత ${perimeterFt}′ → ఆయం ${aya} > వ్యయం ${vyaya}. ఆయాది శుభం — సంపద వృద్ధి.`,
          `Perimeter ${perimeterFt}′ → ayam ${aya} > vyayam ${vyaya}. The Ayadi proportion is auspicious — wealth grows.`
        ),
  };
}

export function buildVastuProjectPlan(input: {
  rooms: RoomMap;
  lengthFt: number;
  widthFt: number;
}): ProjectPlan {
  const rooms: RoomPlan[] = (Object.keys(SPECS) as RoomKey[]).map((key) => {
    const spec = SPECS[key];
    const currentDik = (input.rooms[key] ?? spec.idealDik) as DikInfo['id'];
    const compliance = complianceOf(key, currentDik);
    return {
      key,
      label: spec.label,
      currentDik,
      idealDik: spec.idealDik,
      compliance,
      size: spec.size,
      door: spec.door,
      window: spec.window,
      daylight: spec.daylight,
      ach: spec.ach,
      mep: spec.mep,
      materials: spec.materials,
      vastu: spec.vastu,
      engineering: spec.engineering,
      remedies: spec.remedies.map((text, i) => ({ level: (i + 1) as 1 | 2 | 3, text })),
    };
  });

  const phases: ProjectPlan['phases'] = [
    {
      level: 1,
      title: bi('దశ 1 — పరిహారాలు (నిర్మాణం లేకుండా, 0–7 రోజులు)', 'Phase 1 — remedies only (no construction, 0–7 days)'),
      items: rooms
        .filter((r) => r.compliance !== 'best')
        .flatMap((r) => r.remedies.slice(0, 1))
        .map((r) => r.text)
        .slice(0, 8),
    },
    {
      level: 2,
      title: bi('దశ 2 — చిన్న మార్పులు (1–4 వారాలు)', 'Phase 2 — minor changes (1–4 weeks)'),
      items: rooms
        .filter((r) => r.compliance === 'bad')
        .flatMap((r) => r.remedies.slice(1, 2))
        .map((r) => r.text)
        .slice(0, 8),
    },
    {
      level: 3,
      title: bi('దశ 3 — నిర్మాణ స్థాయి మార్పులు (ప్రణాళికతో)', 'Phase 3 — construction-level changes (with drawings)'),
      items: rooms
        .filter((r) => r.compliance === 'bad')
        .slice(0, 6)
        .map((r) =>
          bi(
            `${r.label.te}: ${DIK_BY_ID[r.currentDik].nameTe} నుండి ${DIK_BY_ID[r.idealDik].nameTe} కి మార్చడం (వాస్తు + MEP మార్పులతో).`,
            `${r.label.en}: shift from ${DIK_BY_ID[r.currentDik].nameEn} to ${DIK_BY_ID[r.idealDik].nameEn}, including MEP changes.`
          )
        ),
    },
  ];

  // ── ప్రాధాన్యత క్రమంలో చర్యలు (impact × room weight) ──────────────
  const weights: Record<RoomKey, number> = {
    entrance: 22, kitchen: 18, masterBed: 14, pooja: 12, toilet: 10,
    staircase: 8, waterTank: 6, borewell: 5, safe: 6, study: 5,
    living: 5, guest: 3, children: 4, dining: 3, septic: 5, balcony: 2,
  };
  const actionPlan: ActionItem[] = rooms
    .filter((r) => r.compliance !== 'best')
    .map((r) => {
      const bad = r.compliance === 'bad';
      const impact = Math.round((bad ? 100 : 45) * (weights[r.key] / 22));
      const costBand: ActionItem['costBand'] = bad
        ? ['kitchen', 'toilet', 'waterTank', 'septic', 'borewell', 'staircase', 'entrance'].includes(r.key)
          ? 'high'
          : 'medium'
        : 'low';
      return {
        room: r.label,
        priority: 0,
        impact,
        costBand,
        action: bi(
          `${r.label.te}: ${DIK_BY_ID[r.currentDik].nameTe} నుండి ${DIK_BY_ID[r.idealDik].nameTe} వైపు మార్చండి — ${r.remedies[0].text.te}`,
          `${r.label.en}: move from ${DIK_BY_ID[r.currentDik].nameEn} towards ${DIK_BY_ID[r.idealDik].nameEn} — ${r.remedies[0].text.en}`
        ),
        rationale: bi(
          `ప్రస్తుత స్థానం "${bad ? 'దోషం' : 'మధ్యమం'}" — ${bad ? 'తీవ్ర' : 'స్వల్ప'} ప్రభావం; భావ భారం ${weights[r.key]}/22.`,
          `Current placement is ${bad ? 'defective' : 'merely acceptable'} — ${bad ? 'high' : 'low'} severity; weight ${weights[r.key]}/22.`
        ),
      };
    })
    .sort((a, b) => b.impact - a.impact)
    .map((a, i) => ({ ...a, priority: i + 1 }));

  const totalWeight = rooms.reduce((sum, r) => sum + weights[r.key], 0);
  const currentScore = Math.round(
    (rooms.reduce((sum, r) => sum + (r.compliance === 'best' ? 100 : r.compliance === 'ok' ? 70 : 30) * weights[r.key], 0) /
      totalWeight)
  );
  const p1Gain = Math.min(100 - currentScore, Math.round(actionPlan.filter((a) => a.costBand !== 'high').reduce((s, a) => s + a.impact, 0) * 0.35));
  const p2Gain = Math.min(
    100 - currentScore - p1Gain,
    Math.round(actionPlan.filter((a) => a.costBand === 'high').reduce((s, a) => s + a.impact, 0) * 0.6)
  );

  // ── NBC 2016 / IS ఆధారిత సాధారణ సమ్మతి తనిఖీలు ─────────────────
  const compliance: ComplianceCheck[] = [
    {
      id: 'height',
      label: bi('గది ఎత్తు 2.75 మీ (NBC 2016)', 'Room height 2.75 m (NBC 2016)'),
      status: 'ok',
      detail: bi('నివాస గదులకు కనీసం 2.75 మీ; వంటగది/స్నాన గది 2.4 మీ.', 'Minimum 2.75 m for habitable rooms; 2.4 m for kitchen and bath.'),
    },
    {
      id: 'daylight',
      label: bi('సహజ వెలుతురు — కిటికీ వైశాల్యం 15–20%', 'Daylight — window area 15–20% of floor'),
      status: 'ok',
      detail: bi('ప్రతి నివాస గదికి కనీసం ఒక కిటికీ + క్రాస్ వెంటిలేషన్.', 'At least one window per habitable room plus cross-ventilation.'),
    },
    {
      id: 'stair',
      label: bi('మెట్ల వెడల్పు ≥ 0.9 మీ, రైజర్ ≤ 190 మ్మీ', 'Stair width ≥ 0.9 m, riser ≤ 190 mm'),
      status: rooms.some((r) => r.key === 'staircase' && r.compliance === 'bad') ? 'warn' : 'ok',
      detail: bi('రైజర్ 150–165 మ్మీ, ట్రెడ్ 280–300 మ్మీ, హెడ్‌రూమ్ 2.1 మీ.', 'Riser 150–165 mm, tread 280–300 mm, headroom 2.1 m.'),
    },
    {
      id: 'wet',
      label: bi('తడి గదుల వాటర్ ప్రూఫింగ్ (IS 3370)', 'Wet-area waterproofing (IS 3370)'),
      status: 'ok',
      detail: bi('24-గంటల పాండింగ్ టెస్ట్ + 1:80 వాలు + 25 మ్మీ థ్రెషోల్డ్.', '24-hour ponding test, 1:80 fall and a 25 mm threshold.'),
    },
    {
      id: 'brahma',
      label: bi('బ్రహ్మస్థానం ఖాళీ (వాస్తు)', 'Brahmasthan kept open (Vastu)'),
      status: rooms.some((r) => r.compliance === 'bad' && r.key === 'staircase') ? 'fail' : 'ok',
      detail: bi('మధ్య 3×3 పాదాలలో మెట్లు/మరుగుదొడ్డి/భారీ నిర్మాణం ఉండకూడదు.', 'No staircase, toilet or heavy structure within the central 3×3 padas.'),
    },
    {
      id: 'ne',
      label: bi('ఈశాన్యం తేలిక & శుభ్రం', 'North-east light and clean'),
      status: ['kitchen', 'toilet', 'septic', 'borewell'].some((k) => rooms.some((r) => r.key === k && r.compliance === 'bad')) ? 'fail' : 'ok',
      detail: bi('ఈశాన్యంలో వంటగది/మరుగుదొడ్డి/సెప్టిక్ ఉంటే తీవ్ర దోషం — తక్షణ పరిహారం అవసరం.', 'A kitchen, toilet or septic tank in the north-east is severe — remedy immediately.'),
    },
  ];

  const scoreProjection = {
    current: currentScore,
    afterPhase1: Math.min(100, currentScore + Math.max(0, p1Gain)),
    afterPhase2: Math.min(100, currentScore + Math.max(0, p1Gain) + Math.max(0, p2Gain)),
  };

  return {
    rooms,
    services: SERVICES,
    phases,
    grid: [
      bi('నిర్మాణ గ్రిడ్ 9×9 (పరమశాయిక): స్తంభాలు పాద మధ్యలో కాకుండా గ్రిడ్ లైన్లపై', 'Structural grid 9×9 (Paramasayika): columns on grid lines, never at pada centres'),
      bi('స్తంభాల అంతరం 10′–15′; బీమ్ లోతు = స్పాన్/12', 'Column spacing 10′–15′; beam depth = span/12'),
      bi('స్లాబ్ 125 mm (4.5 మీ వరకు), 150 mm (6 మీ వరకు); M20 కాంక్రీట్', 'Slab 125 mm up to 4.5 m, 150 mm up to 6 m; M20 concrete'),
      bi('బ్రహ్మస్థానం (మధ్య 3×3) ఖాళీ — స్తంభం/బీమ్ ఉండకూడదు', 'The Brahmasthan (centre 3×3) stays open — no column or beam through it'),
      bi('పునాది: సముద్ర మట్టానికి −5′ వరకు; నైరుతి భాగం భారీగా', 'Footings to −5′ below ground; the south-west portion made heavier'),
    ],
    ayadi: ayadiCheck(input.lengthFt, input.widthFt),
    engineeringSummary: [
      bi('నిర్మాణ భారం: నివాస భారం 2 kN/m² (IS 875-1); పైకప్పు లైవ్ లోడ్ 1.5 kN/m²', 'Structural loading: residential live load 2 kN/m² (IS 875-1); roof live load 1.5 kN/m²'),
      bi('భూకంప మండలం II (హైదరాబాద్) — IS 1893 ప్రకారం నిర్మాణ వివరాలు', 'Seismic Zone II (Hyderabad) — detailing to IS 1893'),
      bi('వాటర్ ప్రూఫింగ్: టెర్రస్ 2 కోట్లు + 24 గంటల పాండింగ్ టెస్ట్', 'Waterproofing: two coats on the terrace plus a 24-hour ponding test'),
      bi('వెంటిలేషన్: ప్రతి గదికి కనీసం 2 కిటికీలు/ద్వారం + కిటికీ (క్రాస్ వెంటిలేషన్)', 'Ventilation: at least two openings per room for cross-flow'),
      bi('సహజ వెలుతురు: కిటికీ వైశాల్యం = నేల వైశాల్యంలో 15–20%', 'Daylight: window area = 15–20% of the floor area'),
    ],
    actionPlan,
    compliance,
    scoreProjection,
  };
}
