/**
 * వాస్తు శాస్త్రం — పూర్తి ద్విభాషా పొర (Telugu ⇄ English).
 *
 * ఇక్కడ ప్రతి ఆంగ్ల వాక్యం చేతితో రాయబడింది (machine-translation కాదు).
 * `localizeVastuReport()` ఇంజిన్ ఇచ్చిన నివేదికను అదే ఆకారంలో తిరిగి
 * ఇస్తుంది, కానీ `…Te` ఫీల్డ్‌లలో ఎంచుకున్న భాష టెక్స్ట్ ఉంటుంది —
 * అందువల్ల వ్యూ కోడ్ మార్చకుండానే తెలుగు/ఇంగ్లీష్ మారుతుంది.
 *
 * Source of truth for English wording. Keep the Te originals in
 * `vastuShastraEngine.ts`; edit both when content changes.
 */

import {
  DIK_BY_ID,
  NAMA_SYLLABLES_EN,
  ZONE_INFO,
  ROOM_RULES,
  type CompleteVastuReport,
  type DikInfo,
  type RoomKey,
  type ZoneInfo,
} from './vastuShastraEngine.ts';
import { STATE_DISTRICT_ATLAS } from './teluguJathakam.ts';

export type VastuLang = 'te' | 'en';

/* ------------------------------------------------------------------ */
/*  8 directions                                                       */
/* ------------------------------------------------------------------ */

export const DIK_EN: Record<DikInfo['id'], {
  qualities: string;
  keep: string;
  avoid: string;
  remedy: string;
  color: string;
}> = {
  N: {
    qualities: 'Wealth, prosperity, opportunity, career growth, mental peace.',
    keep: 'Cash, jewellery, puja articles, water source, employment papers, a mirror on the north wall.',
    avoid: 'Fire, stove, heavy machinery, garbage, toilet, top of a staircase.',
    remedy: 'A small water bowl or Kubera yantra in the north-east corner; Kubera stotra on Fridays.',
    color: 'Green, blue',
  },
  NE: {
    qualities: 'Wisdom, spirituality, health, divine grace, children, education.',
    keep: 'Puja room, meditation seat, drinking-water tank, tulsi, plants, light objects.',
    avoid: 'Toilet, kitchen, staircase, heavy construction, garbage, store room.',
    remedy: 'Keep the north-east clean and open; Shiva linga, conch, Kubera yantra, tulsi plant.',
    color: 'Yellow, white',
  },
  E: {
    qualities: 'Health, social respect, leadership, fame, male progeny.',
    keep: 'Main entrance, visitors’ room, study room, bathroom door, morning sunlight.',
    avoid: 'Toilet, heavy storage, kitchen corner.',
    remedy: 'Paint the east door yellow or gold; keep open floor space for Surya namaskara.',
    color: 'White, yellow',
  },
  SE: {
    qualities: 'Health, digestion, courage, fuel, progeny, food.',
    keep: 'Kitchen, stove (in the south-east corner), electrical equipment, hot-water system.',
    avoid: 'Water tank, borewell, puja room, bed head, wealth safe.',
    remedy: 'Place the stove against the south-east corner; the cook should face east.',
    color: 'Red, orange',
  },
  S: {
    qualities: 'Discipline, courage, stability, wealth, family lineage.',
    keep: 'Store room, staircase, heavy objects, staff room, grain.',
    avoid: 'Puja room, bed head (except in the south-west), water tank, main entrance.',
    remedy: 'Red on the south wall; Hanuman Chalisa recitation; a lamp on Mondays.',
    color: 'Red, pink',
  },
  SW: {
    qualities: 'Stability, family bonds, protection of wealth, marital happiness, blessings of the ancestors.',
    keep: 'Elders’ or owner’s bed (head to the south or east), wardrobe, wealth safe, heavy construction.',
    avoid: 'Puja room, borewell, water tank, staircase, open space, main entrance.',
    remedy: 'Always keep the south-west heavy; pitru tarpana; mustard-oil lamp on Saturdays.',
    color: 'Yellow, brown',
  },
  W: {
    qualities: 'Gains, reputation, progeny, contentment, enjoyment of food.',
    keep: 'Dining room, guest room, children’s study, water arrangements, upright storage.',
    avoid: 'Puja room, main entrance, heavy garbage, keeping the door shut tight.',
    remedy: 'Keep the west window open; Varuna mantra, white flowers, a water tap in front of the house.',
    color: 'White, blue',
  },
  NW: {
    qualities: 'Movement, relationships, hospitality, financial flow, creativity.',
    keep: 'Guest room, store room, vehicle, cattle, a well-ventilated area, windows.',
    avoid: 'Stove, heavy load, puja room, borewell, bed head.',
    remedy: 'Light objects in the north-west, a window for air flow, Chandra stotra.',
    color: 'White, grey',
  },
};

/* ------------------------------------------------------------------ */
/*  16 zones (22.5° each)                                              */
/* ------------------------------------------------------------------ */

export const ZONE_EN: Record<string, {
  element: string;
  planet: string;
  chakra: string;
  lifeArea: string;
  keep: string;
  avoid: string;
  imbalance: string;
  remedy: string;
}> = {
  North: {
    element: 'Water', planet: 'Mercury', chakra: 'Vishuddhi',
    lifeArea: 'Income, opportunities, employment',
    keep: 'Wealth storage, files, mirror, water',
    avoid: 'Fire, dirt, heavy machinery',
    imbalance: 'Income stalls, opportunities shrink',
    remedy: 'Mirror on the north wall, water bowl, green colour',
  },
  'North-North-East': {
    element: 'Water', planet: 'Jupiter', chakra: 'Ajna',
    lifeArea: 'Children, health, education',
    keep: 'Puja, medicines, plants',
    avoid: 'Toilet, garbage, heavy construction',
    imbalance: 'Health problems, difficulty with progeny',
    remedy: 'Tulsi, conch, yellow colour, cleanliness',
  },
  'North-East': {
    element: 'Water + Space', planet: 'Jupiter', chakra: 'Sahasrara',
    lifeArea: 'Spirituality, wisdom, liberation',
    keep: 'Puja room, meditation, drinking water',
    avoid: 'Kitchen, toilet, staircase',
    imbalance: 'Mental unrest, fear, indecision',
    remedy: 'Keep the north-east open and clean; Shiva linga, Kubera yantra',
  },
  'East-North-East': {
    element: 'Space', planet: 'Jupiter', chakra: 'Vishuddhi',
    lifeArea: 'Devotion, meditation, creativity',
    keep: 'Meditation, study, music',
    avoid: 'Noise, clutter, kitchen',
    imbalance: 'Despondency, lack of inspiration',
    remedy: 'A quiet corner, white flowers, incense',
  },
  East: {
    element: 'Air + Fire', planet: 'Sun', chakra: 'Anahata',
    lifeArea: 'Respect, health, leadership',
    keep: 'Main entrance, visitors, sunlight',
    avoid: 'Dirt, weight, closed windows',
    imbalance: 'Lack of recognition, low confidence',
    remedy: 'East door in yellow or white, Surya worship',
  },
  'East-South-East': {
    element: 'Fire', planet: 'Venus', chakra: 'Manipura',
    lifeArea: 'Happiness, beauty, relationships',
    keep: 'Bathroom, décor, beauty articles',
    avoid: 'Fire, heavy construction',
    imbalance: 'Discontent, friction in relationships',
    remedy: 'White or rose colour, fragrances, cleanliness',
  },
  'South-East': {
    element: 'Fire', planet: 'Venus', chakra: 'Manipura',
    lifeArea: 'Health, courage, fuel',
    keep: 'Kitchen, stove, electricity',
    avoid: 'Water, borewell, puja, wealth safe',
    imbalance: 'Digestive problems, financial loss',
    remedy: 'Stove in the south-east corner; red colour; keep water away',
  },
  'South-South-East': {
    element: 'Fire + Earth', planet: 'Venus', chakra: 'Swadhisthana',
    lifeArea: 'Confidence, competition',
    keep: 'Exercise, equipment',
    avoid: 'Bed, puja',
    imbalance: 'Anxiety, anger',
    remedy: 'Red or orange colour, grounding',
  },
  South: {
    element: 'Fire + Earth', planet: 'Mars', chakra: 'Muladhara',
    lifeArea: 'Discipline, wealth, stability',
    keep: 'Storage, staircase, heavy objects',
    avoid: 'Puja, main entrance, water',
    imbalance: 'Fatigue, fear, expenditure',
    remedy: 'Red colour, Hanuman worship, correct load balance',
  },
  'South-South-West': {
    element: 'Earth', planet: 'Rahu', chakra: 'Swadhisthana',
    lifeArea: 'Sleep, health, comfort',
    keep: 'Bedroom, calm',
    avoid: 'Puja, water, emptiness',
    imbalance: 'Insomnia, fear',
    remedy: 'Yellow colour, calm, a night lamp',
  },
  'South-West': {
    element: 'Earth', planet: 'Rahu', chakra: 'Muladhara',
    lifeArea: 'Protection of wealth, marriage, stability',
    keep: 'Owner’s bed, wardrobe, heavy construction',
    avoid: 'Water, puja, open space',
    imbalance: 'Instability, financial loss, family friction',
    remedy: 'Increase weight, yellow or brown colour, head to the south',
  },
  'West-South-West': {
    element: 'Water', planet: 'Saturn', chakra: 'Manipura',
    lifeArea: 'Savings, grasping power, analysis',
    keep: 'Study, storage',
    avoid: 'Garbage, dampness, stale air',
    imbalance: 'Dejection, delays',
    remedy: 'Blue or black colour, cleanliness, Om Shanaischaraya namah',
  },
  West: {
    element: 'Water', planet: 'Saturn', chakra: 'Anahata',
    lifeArea: 'Gains, reputation, progeny',
    keep: 'Dining, guests, study',
    avoid: 'Puja, main entrance',
    imbalance: 'Gains stop, difficulty with progeny',
    remedy: 'Varuna mantra, white colour, a water tap',
  },
  'West-North-West': {
    element: 'Air', planet: 'Moon', chakra: 'Ajna',
    lifeArea: 'Thought, mental stability',
    keep: 'Storage, calm',
    avoid: 'Noise, clutter',
    imbalance: 'Anxiety, delayed decisions',
    remedy: 'White colour, Chandra stotra, air circulation',
  },
  'North-West': {
    element: 'Air', planet: 'Moon', chakra: 'Vishuddhi',
    lifeArea: 'Relationships, guests, vehicles',
    keep: 'Guest room, vehicle, storage, windows',
    avoid: 'Fire, weight, puja',
    imbalance: 'Distance in relationships, financial instability',
    remedy: 'Light objects, white colour, Om Somaya namah',
  },
  'North-North-West': {
    element: 'Water + Air', planet: 'Mercury', chakra: 'Anahata',
    lifeArea: 'Income, aspirations, motivation',
    keep: 'Money, inspiration board, water',
    avoid: 'Garbage, heavy equipment',
    imbalance: 'Lost hope, falling income',
    remedy: 'Green colour, water bowl, Kubera stotra',
  },
};

/* ------------------------------------------------------------------ */
/*  45 Vastu Purusha devatas                                           */
/* ------------------------------------------------------------------ */

export const DEVATA_EN: Record<string, { governs: string; vithi: string; zone: string }> = {
  Brahma: {
    governs: 'Creation, balance, life force — the centre must always stay empty, clean and bright',
    vithi: 'Brahma vithi (centre)', zone: 'Brahmasthanam (central 3×3)',
  },
  // Inner ring
  Prithvidhara: { governs: 'Support of the earth, stability', vithi: 'Deva / Manushya vithi (inner ring)', zone: 'North centre' },
  Apaha: { governs: 'Water, vital force, purification', vithi: 'Deva / Manushya vithi (inner ring)', zone: 'North-east centre' },
  Apavatsa: { governs: 'Health, well-being', vithi: 'Deva / Manushya vithi (inner ring)', zone: 'North-east centre' },
  Aryama: { governs: 'Friendship, social relations', vithi: 'Deva / Manushya vithi (inner ring)', zone: 'East centre' },
  Savita: { governs: 'Inspiration, beginnings', vithi: 'Deva / Manushya vithi (inner ring)', zone: 'South-east centre' },
  Savitra: { governs: 'Continuity, perseverance', vithi: 'Deva / Manushya vithi (inner ring)', zone: 'South-east centre' },
  Vivasvan: { governs: 'Radiance, illumination', vithi: 'Deva / Manushya vithi (inner ring)', zone: 'South centre' },
  Mitra: { governs: 'Friendship, agreements', vithi: 'Deva / Manushya vithi (inner ring)', zone: 'West centre' },
  Indra: { governs: 'Power, protection', vithi: 'Deva / Manushya vithi (inner ring)', zone: 'South-west centre' },
  Indrajaya: { governs: 'Victory, dominance', vithi: 'Deva / Manushya vithi (inner ring)', zone: 'South-west centre' },
  Rudra: { governs: 'Transformation, removal of obstacles', vithi: 'Deva / Manushya vithi (inner ring)', zone: 'North-west centre' },
  Rajayakshma: { governs: 'Kingship, mental strength', vithi: 'Deva / Manushya vithi (inner ring)', zone: 'North-west centre' },
  // Outer ring (32)
  Aditi: { governs: 'Freedom, expansion, protection', vithi: 'Paishachika vithi (outer ring)', zone: 'Boundary pada' },
  Diti: { governs: 'Despair, endurance, restraint', vithi: 'Paishachika vithi (outer ring)', zone: 'Boundary pada' },
  Shikhi: { governs: 'Creative thought, vision', vithi: 'Paishachika vithi (outer ring)', zone: 'Boundary pada' },
  Parjanya: { governs: 'Rain, abundance of crops, nourishment', vithi: 'Paishachika vithi (outer ring)', zone: 'Boundary pada' },
  Jayanta: { governs: 'Victory, enthusiasm, leadership', vithi: 'Paishachika vithi (outer ring)', zone: 'Boundary pada' },
  Mahendra: { governs: 'Authority, administration', vithi: 'Paishachika vithi (outer ring)', zone: 'Boundary pada' },
  Surya: { governs: 'Health, radiance, fame', vithi: 'Paishachika vithi (outer ring)', zone: 'Boundary pada' },
  Satya: { governs: 'Truth, reputation, trust', vithi: 'Paishachika vithi (outer ring)', zone: 'Boundary pada' },
  Bhrisa: { governs: 'Industry, discipline', vithi: 'Paishachika vithi (outer ring)', zone: 'Boundary pada' },
  Akasha: { governs: 'Expansion, revelation', vithi: 'Paishachika vithi (outer ring)', zone: 'Boundary pada' },
  Anila: { governs: 'Movement, breath, energy', vithi: 'Paishachika vithi (outer ring)', zone: 'Boundary pada' },
  Pusha: { governs: 'Nourishment, food, care', vithi: 'Paishachika vithi (outer ring)', zone: 'Boundary pada' },
  Vitatha: { governs: 'Mental steadiness, discernment', vithi: 'Paishachika vithi (outer ring)', zone: 'Boundary pada' },
  Grihakshata: { governs: 'Protection of the house, progeny', vithi: 'Paishachika vithi (outer ring)', zone: 'Boundary pada' },
  Yama: { governs: 'Dharma, death, order', vithi: 'Paishachika vithi (outer ring)', zone: 'Boundary pada' },
  Gandharva: { governs: 'Arts, music, joy', vithi: 'Paishachika vithi (outer ring)', zone: 'Boundary pada' },
  Bhringaraja: { governs: 'Health, vitality', vithi: 'Paishachika vithi (outer ring)', zone: 'Boundary pada' },
  Mriga: { governs: 'Curiosity, skill', vithi: 'Paishachika vithi (outer ring)', zone: 'Boundary pada' },
  Pitru: { governs: 'Ancestral grace, lineage', vithi: 'Paishachika vithi (outer ring)', zone: 'Boundary pada' },
  Dauvarika: { governs: 'Doorway protection, removal of fear', vithi: 'Paishachika vithi (outer ring)', zone: 'Boundary pada' },
  Sugriva: { governs: 'Leadership, coordination', vithi: 'Paishachika vithi (outer ring)', zone: 'Boundary pada' },
  Pushpadanta: { governs: 'Beauty, attraction', vithi: 'Paishachika vithi (outer ring)', zone: 'Boundary pada' },
  Varuna: { governs: 'Water, love, fame', vithi: 'Paishachika vithi (outer ring)', zone: 'Boundary pada' },
  Asura: { governs: 'Competition, courage, illusion', vithi: 'Paishachika vithi (outer ring)', zone: 'Boundary pada' },
  Shosha: { governs: 'Purification, elimination', vithi: 'Paishachika vithi (outer ring)', zone: 'Boundary pada' },
  Papayakshma: { governs: 'Cure of disease, release', vithi: 'Paishachika vithi (outer ring)', zone: 'Boundary pada' },
  Roga: { governs: 'Diagnosis of health, patience', vithi: 'Paishachika vithi (outer ring)', zone: 'Boundary pada' },
  Naga: { governs: 'Desires, wealth, vitality', vithi: 'Paishachika vithi (outer ring)', zone: 'Boundary pada' },
  Mukhya: { governs: 'Centrality, direction', vithi: 'Paishachika vithi (outer ring)', zone: 'Boundary pada' },
  Bhallata: { governs: 'Growth of wealth, results', vithi: 'Paishachika vithi (outer ring)', zone: 'Boundary pada' },
  Soma: { governs: 'Flow of wealth, mind', vithi: 'Paishachika vithi (outer ring)', zone: 'Boundary pada' },
  Bhujaga: { governs: 'Hidden wealth, stability', vithi: 'Paishachika vithi (outer ring)', zone: 'Boundary pada' },
};

/* ------------------------------------------------------------------ */
/*  Rooms                                                              */
/* ------------------------------------------------------------------ */

export const ROOM_EN: Record<RoomKey, {
  label: string;
  best: string;
  badEffect: string;
  remedy: string;
}> = {
  entrance: {
    label: 'Main entrance',
    best: 'East, north, north-east — prosperity, health, progress.',
    badEffect: 'Entrance in the south-west or south — financial loss, family friction, health troubles.',
    remedy: 'Ganesha or dvarapalaka images on both sides of the door, yellow colour, “Om” symbol, trishula.',
  },
  kitchen: {
    label: 'Kitchen',
    best: 'South-east (Agneya) — the fire corner; the cook faces east while cooking.',
    badEffect: 'Kitchen in the north-east or north-west — digestive problems and financial drain.',
    remedy: 'Keep the stove in the south-east corner, keep water away from the flame, use red or orange.',
  },
  masterBed: {
    label: 'Master bedroom',
    best: 'South-west — stability, authority, marital harmony; head of the bed to the south or east.',
    badEffect: 'Master bedroom in the south-east or north-east — unrest, disputes, weak sleep.',
    remedy: 'Heavy wooden bed in the south-west, head to the south, avoid mirrors facing the bed.',
  },
  pooja: {
    label: 'Puja room',
    best: 'North-east — the seat of the divine; the worshipper faces east or north.',
    badEffect: 'Puja room in the south or south-west — obstructed results, mental unrest.',
    remedy: 'Clean, bright, north-east; idols at eye level; lamp in the north-east corner.',
  },
  toilet: {
    label: 'Toilet',
    best: 'North-west or west — the zone of elimination.',
    badEffect: 'Toilet in the north-east or south-east — loss of wealth, health and blessings.',
    remedy: 'Keep the door closed, a small exhaust fan, sea salt in a bowl, a bowl of rock salt refreshed monthly.',
  },
  staircase: {
    label: 'Staircase',
    best: 'South, south-west or west — ascending clockwise.',
    badEffect: 'Staircase in the north-east or centre — obstruction of prosperity.',
    remedy: 'Clockwise ascent, odd number of steps, no staircase in the Brahmasthanam.',
  },
  waterTank: {
    label: 'Water tank (overhead)',
    best: 'North-east or north — cool, auspicious water.',
    badEffect: 'Overhead tank in the south-west — heavy load on the earth corner; in the south-east — fire-water conflict.',
    remedy: 'Shift to the north-east, keep the tank clean, cover it, avoid leakage.',
  },
  borewell: {
    label: 'Borewell / well',
    best: 'North-east, east or north — water source in a water zone.',
    badEffect: 'Borewell in the south-west — loss of wealth and stability.',
    remedy: 'North-east or east; if already in the south-west, fill and seal it and place a heavy stone above.',
  },
  safe: {
    label: 'Wealth safe / locker',
    best: 'North or south-west — with the door opening to the north or east.',
    badEffect: 'Safe in the south-east or north-east — money leaks, expenses rise.',
    remedy: 'Place in the north wall opening north; keep a Kubera yantra and a small mirror inside the door.',
  },
  study: {
    label: 'Study room',
    best: 'East, north-east or north — concentration and memory.',
    badEffect: 'Study in the south-west or south — mental fatigue, slow progress.',
    remedy: 'Face east or north while studying; keep the south-east wall free of heavy shelves.',
  },
  living: {
    label: 'Living room',
    best: 'East or north — light, openness and social grace.',
    badEffect: 'Living room in the south-west — heaviness, guests feel unwelcome.',
    remedy: 'Keep the east and north sides light; a mirror on the north wall increases prosperity.',
  },
  guest: {
    label: 'Guest room',
    best: 'North-west — the zone of movement and hospitality.',
    badEffect: 'Guest room in the south-west — guests overstay and dominate the family space.',
    remedy: 'Light furniture, white walls, no valuables kept there.',
  },
  children: {
    label: 'Children’s room',
    best: 'West or north-west — growth and freedom.',
    badEffect: 'Children’s room in the south-west — pressure, disobedience, disturbed sleep.',
    remedy: 'Study desk facing east or north, light colours, avoid heavy dark furniture.',
  },
  dining: {
    label: 'Dining room',
    best: 'West or east — food enjoyed with contentment.',
    badEffect: 'Dining in the south-west — heaviness and digestive sluggishness.',
    remedy: 'Face east while eating, keep the dining table clean and free of clutter.',
  },
  septic: {
    label: 'Septic tank',
    best: 'North-west or west, away from the plot boundary.',
    badEffect: 'Septic tank in the north-east or south-west — severe Vastu defect.',
    remedy: 'Shift to the north-west; keep it covered, and plant a banana or neem near it.',
  },
  balcony: {
    label: 'Balcony',
    best: 'North-east, east or north — morning light and air.',
    badEffect: 'Heavy balcony in the south-west — acceptable, but keep it light and uncluttered.',
    remedy: 'Keep the balcony clean, grow tulsi or flowering plants, avoid storing junk.',
  },
};

export const VERDICT_EN = { best: 'Excellent', ok: 'Acceptable', bad: 'Defect' } as const;
export const SEVERITY_EN = { severe: 'Severe', medium: 'Moderate' } as const;

export const GRADE_EN: { min: number; te: string; en: string; enDetail: string }[] = [
  { min: 88, te: 'వాస్తు శ్రేష్ఠం (ఉత్తమ గృహం)', en: 'Excellent', enDetail: 'Excellent Vastu (an ideal home)' },
  { min: 74, te: 'వాస్తు శుభం', en: 'Good', enDetail: 'Auspicious Vastu' },
  { min: 60, te: 'మధ్యమ వాస్తు — సరిదిద్దుకోదగినది', en: 'Average', enDetail: 'Average Vastu — worth correcting' },
  { min: 45, te: 'వాస్తు దోష యుక్తం — పరిహారాలు అవసరం', en: 'Needs correction', enDetail: 'Vastu defects present — remedies needed' },
  { min: 0, te: 'తీవ్ర వాస్తు దోషం — మార్పులు తప్పనిసరి', en: 'Severe defects', enDetail: 'Severe Vastu defects — changes are essential' },
];

export const GRADE_DETAIL_EN = (score: number): string =>
  (GRADE_EN.find((g) => score >= g.min) ?? GRADE_EN[GRADE_EN.length - 1]).enDetail;

/* ------------------------------------------------------------------ */
/*  Nama Vastu                                                         */
/* ------------------------------------------------------------------ */

export const NUMEROLOGY_EN: Record<number, { planet: string; nature: string }> = {
  1: { planet: 'Sun', nature: 'leadership, self-confidence' },
  2: { planet: 'Moon', nature: 'emotion, creativity' },
  3: { planet: 'Jupiter', nature: 'wisdom, expansion' },
  4: { planet: 'Rahu', nature: 'invention, restlessness' },
  5: { planet: 'Mercury', nature: 'intellect, commerce' },
  6: { planet: 'Venus', nature: 'beauty, comfort' },
  7: { planet: 'Ketu', nature: 'spirituality, detachment' },
  8: { planet: 'Saturn', nature: 'discipline, endurance' },
  9: { planet: 'Mars', nature: 'energy, courage' },
};

export const NAMA_NOTE_EN =
  'First letter of the name → nakshatra pada → birth rasi → direction (Nama Vastu). If the birth nakshatra is known, that is authoritative; the name-based analysis is supportive guidance only.';

/* ------------------------------------------------------------------ */
/*  Place / site text                                                  */
/* ------------------------------------------------------------------ */

const dikNamesEn = (ids: DikInfo['id'][]): string => ids.map((d) => DIK_BY_ID[d].nameEn).join(', ');

export const PLACE_EN = {
  trueNorthNote:
    'Vastu is always measured from true north (the geographic pole). A compass needle does not point to true north — it must be corrected for local magnetic declination.',
  magneticNote:
    'A compass needle points to magnetic north; in India this differs from true north by roughly 0°–2° depending on the region. For an exact value use the current WMM/IGRF chart or a local survey — the sun-and-shadow methods below give an exact, magnetism-free determination.',
  plotRatio:
    'A length-to-width ratio of 1:1 (square) is best; up to 1:2 is acceptable. Beyond 1:2 it becomes an “elongated rectangle defect” — divide the plot internally or extend the built area to correct it.',
};

export const buildPlaceTextEn = (p: {
  solarNoonTime: string;
  solarNoonShadowAzimuth: number;
  sunriseShadowAzimuth: number;
  sunriseAzimuth: number;
  sunsetAzimuth: number;
  magneticDeclinationDeg: number;
  lat: number;
  placeDikTe: string;
  placeNakshatraTe: string;
  nearestEquinoxSunriseAz: number;
}) => ({
  trueNorthSteps: [
    `Exact method 1 — noon shadow: at this place solar noon is at ${p.solarNoonTime}; the sun is then at 180° azimuth, so the shadow of a vertical gnomon falls towards ${p.solarNoonShadowAzimuth.toFixed(1)}°. That line is the true north–south axis.`,
    'Exact method 2 — equal shadows (Indian circle): mark the tip of one stick’s shadow twice, at equal times before and after solar noon; the line joining the two marks is exactly east–west, and its perpendicular is true north–south — a purely geometric method free of magnetic error.',
    'Alternatively, at sunrise the shadow points to the west; the sunrise azimuth on the equinox is 90° (due east), giving an immediate check on the east–west axis.',
    'If you use a compass: magnetic north in India lies about 0°–2° away from true north depending on the region; verify with the current magnetic chart or a local survey before construction.',
    'At night, Polaris (the pole star) marks true north in the northern hemisphere and can be sighted directly on site.',
  ],
  orientationAdvice: `At this latitude (${p.lat.toFixed(2)}°) the equinox sunrise occurs at ${p.sunriseAzimuth.toFixed(1)}° and sunset at ${p.sunsetAzimuth.toFixed(1)}°. Aligning the house front parallel to this true east–west axis keeps sunlight balanced through the year.`,
  gatewayAdvice: `The main gate of the village or colony is best placed in the north-east or north; a south-west gate leads to pitru dosha. Favourable directions for this place: ${p.placeDikTe}.`,
  placeNakshatra: `${p.placeNakshatraTe} — derived from Nama Vastu`,
});

/* ------------------------------------------------------------------ */
/*  Plot                                                               */
/* ------------------------------------------------------------------ */

export const PLOT_SHAPE_EN: Record<string, string> = {
  square: 'Square plot — the best in Vastu Shastra (balanced energy).',
  rectangle: 'Rectangular plot — acceptable; a longer north–south axis is preferable.',
  'l-shaped': 'L-shaped plot — the missing corner must be built over; a missing south-west corner is a severe defect.',
  triangular: 'Triangular plot — a Vastu defect; reshape the boundary to a square.',
  irregular: 'Irregular shape — cut corners are a defect; regularise the boundary.',
};

export const PLOT_SLOPE_EN: Record<string, string> = {
  'north-east': 'Slope towards the north-east, north or east — water flows to the auspicious side; excellent.',
  north: 'Slope towards the north — water flows to the auspicious side; excellent.',
  east: 'Slope towards the east — water flows to the auspicious side; excellent.',
  'south-west': 'Slope towards the south-west or south — a wealth-loss defect; fill the south-west and regrade towards the north-east.',
  south: 'Slope towards the south — a wealth-loss defect; fill the south-west and regrade towards the north-east.',
  flat: 'Level plot — good; grade it so the north-east is slightly lower.',
};

export const plotRoadEn = (dik: DikInfo['id']): { text: string; good: boolean | null } => {
  const name = DIK_BY_ID[dik].nameEn;
  if (dik === 'N' || dik === 'E' || dik === 'NE') {
    return { text: `Road on the ${name} side — auspicious; the main entrance may face that side.`, good: true };
  }
  if (dik === 'SW' || dik === 'S' || dik === 'SE') {
    return { text: `Road on the ${name} side — do not place the entrance there; keep the entrance east or north.`, good: false };
  }
  return { text: `Road on the ${name} side — acceptable; keep the entrance towards the north-east or east.`, good: null };
};

/* ------------------------------------------------------------------ */
/*  Report localisation                                                */
/* ------------------------------------------------------------------ */

export interface VastuPlotParams {
  shape: 'square' | 'rectangle' | 'irregular' | 'triangular' | 'l-shaped';
  slope: 'north-east' | 'north' | 'east' | 'south-west' | 'south' | 'flat';
  road: DikInfo['id'];
  lengthFt: number;
  widthFt: number;
}

/** ఇంజిన్ నివేదికను ఎంచుకున్న భాషలో తిరిగి ఇచ్చు (అదే ఆకారం). */
export function localizeVastuReport(
  report: CompleteVastuReport,
  lang: VastuLang,
  plotParams?: VastuPlotParams,
  displayName?: string
): CompleteVastuReport {
  if (lang === 'te') return report;

  const dikList = report.dikList.map((d) => {
    const en = DIK_EN[d.id];
    return {
      ...d,
      nameTe: d.nameEn,
      deityTe: d.deityEn,
      elementTe: d.elementEn,
      planetTe: d.planetTe === 'శని' ? 'Saturn' : PLANET_EN[d.planetTe] ?? d.planetTe,
      qualitiesTe: en.qualities,
      keepTe: en.keep,
      avoidTe: en.avoid,
      remedyTe: en.remedy,
      colorTe: en.color,
    };
  });

  const zones = report.zones.map((z) => {
    const en = ZONE_EN[z.nameEn];
    if (!en) return z;
    return {
      ...z,
      nameTe: z.nameEn,
      elementTe: en.element,
      planetTe: PLANET_EN[z.planetTe] ?? z.planetTe,
      chakraTe: en.chakra,
      lifeAreaTe: en.lifeArea,
      keepTe: en.keep,
      avoidTe: en.avoid,
      imbalanceTe: en.imbalance,
      remedyTe: en.remedy,
    };
  });

  const devatas = report.devatas.map((d) => {
    const en = DEVATA_EN[d.nameEn];
    return {
      ...d,
      nameTe: d.nameEn,
      vithiTe: en?.vithi ?? d.vithiTe,
      zoneTe: en?.zone ?? d.zoneTe,
      governsTe: en?.governs ?? d.governsTe,
    };
  });

  const rooms = report.audit.rooms.map((r) => {
    const en = ROOM_EN[r.key];
    return {
      ...r,
      labelTe: en?.label ?? r.labelTe,
      dikNameTe: DIK_BY_ID[r.dik].nameEn,
      verdictTe: VERDICT_EN[r.verdict],
      adviceTe:
        r.verdict === 'best'
          ? en?.best ?? r.adviceTe
          : r.verdict === 'bad'
            ? en?.badEffect ?? r.adviceTe
            : 'Neutral placement — better to relocate if possible.',
      remedyTe: en?.remedy ?? r.remedyTe,
    };
  });

  const doshas = report.audit.doshas.map((d) => {
    const room = rooms.find((r) => d.nameTe.startsWith(r.labelTe === d.nameTe ? '' : '\u0000'));
    void room;
    // nameTe is "label — dik" in Telugu; rebuild in English from the room rows
    const matched = report.audit.rooms.find((r) => d.nameTe.startsWith(r.labelTe));
    const en = matched ? ROOM_EN[matched.key] : undefined;
    const nameEn = matched ? `${en?.label ?? matched.labelTe} — ${DIK_BY_ID[matched.dik].nameEn}` : d.nameTe;
    const severeKeys: RoomKey[] = ['entrance', 'kitchen', 'pooja', 'toilet', 'waterTank', 'septic', 'borewell'];
    return {
      nameTe: nameEn,
      severityTe: matched && severeKeys.includes(matched.key) ? SEVERITY_EN.severe : SEVERITY_EN.medium,
      effectTe: en?.badEffect ?? d.effectTe,
      remedyTe: en?.remedy ?? d.remedyTe,
    };
  });

  const worst = report.audit.rooms.find((r) => r.verdict === 'bad');
  const bestRoom = [...report.audit.rooms].sort((a, b) => b.score - a.score)[0];

  const audit = {
    ...report.audit,
    rooms,
    doshas,
    gradeTe: GRADE_DETAIL_EN(report.audit.totalScore),
    strongestRoomTe: bestRoom ? `${ROOM_EN[bestRoom.key]?.label ?? bestRoom.labelTe} (${DIK_BY_ID[bestRoom.dik].nameEn})` : '',
    weakestRoomTe: worst ? `${ROOM_EN[worst.key]?.label ?? worst.labelTe} (${DIK_BY_ID[worst.dik].nameEn})` : 'No major defects',
    topRemediesTe: rooms
      .filter((r) => r.verdict === 'bad')
      .slice(0, 4)
      .map((r) => `${r.labelTe}: ${r.remedyTe}`),
  };

  const nama = {
    ...report.nama,
    name: displayName ?? report.nama.name,
    nakshatraTe: report.nama.nakshatraEn || report.nama.nakshatraTe,
    rasiTe: RASI_EN[report.nama.rasiIndex] ?? report.nama.rasiTe,
    rasiLordTe: PLANET_EN[stripParen(report.nama.rasiLordTe)] ?? report.nama.rasiLordTe,
    nakshatraLordTe: PLANET_EN[stripParen(report.nama.nakshatraLordTe)] ?? report.nama.nakshatraLordTe,
    nameDeityTe: DEITY_EN[stripParen(report.nama.nameDeityTe)] ?? report.nama.nameDeityTe,
    nameElementTe: ELEMENT_EN[report.nama.nameElementTe] ?? report.nama.nameElementTe,
    nameNumerologyTe: numerologyEn(report.nama.nameNumber),
    noteTe: NAMA_NOTE_EN,
  };

  const place = localizePlace(report);

  const plot = localizePlot(report, plotParams);

  const mandala = report.mandala.map((c) => ({
    ...c,
    ringTe: RING_EN[c.ringTe] ?? c.ringTe,
    zoneNameTe: ZONE_NAME_EN[c.zoneNameTe] ?? c.zoneNameTe,
    devata: c.devata
      ? {
          ...c.devata,
          nameTe: c.devata.nameEn,
          vithiTe: DEVATA_EN[c.devata.nameEn]?.vithi ?? c.devata.vithiTe,
          zoneTe: DEVATA_EN[c.devata.nameEn]?.zone ?? c.devata.zoneTe,
          governsTe: DEVATA_EN[c.devata.nameEn]?.governs ?? c.devata.governsTe,
        }
      : null,
  }));

  const personalDirectionsTe = [
    {
      purposeTe: 'Sleep (head of the bed)',
      dikTe: DIK_BY_ID[report.nama.sleepHeadDik].nameEn,
      reasonTe:
        'Sleeping with the head to the south or east improves blood circulation to the brain; the head should never point north.',
    },
    {
      purposeTe: 'Study / work desk (facing)',
      dikTe: DIK_BY_ID[report.nama.studyFaceDik].nameEn,
      reasonTe:
        'Facing a direction favourable to the birth rasi improves concentration and the chances of success.',
    },
    {
      purposeTe: 'Main entrance',
      dikTe: DIK_BY_ID[report.nama.entranceDik].nameEn,
      reasonTe: 'An entrance aligned with the birth rasi brings auspiciousness to the griha pravesha.',
    },
    {
      purposeTe: 'Wealth safe / locker',
      dikTe: 'South-west (door facing north or east)',
      reasonTe:
        'Kubera, lord of wealth, rules the north; stability belongs to the south-west — the combination is best.',
    },
    {
      purposeTe: 'Puja room',
      dikTe: 'North-east',
      reasonTe: 'The north-east is the root of the devatas; the worshipper should face east.',
    },
  ];

  const summaryTe =
    `${displayName ?? report.nama.name} — first syllable “${latinSyllable(report.nama.nakshatraIndex, report.nama.pada)}” → ${nama.nakshatraTe} nakshatra, pada ${report.nama.pada} → ${nama.rasiTe} (name number ${report.nama.nameNumber}). ` +
    `For ${placeNameEn(report.place.placeName)}, true north must be fixed by the sun-and-shadow method (estimated magnetic declination ${report.place.magneticDeclinationDeg}°). ` +
    `Current house Vastu score ${report.audit.totalScore}/100 — ${audit.gradeTe}. Strongest part: ${audit.strongestRoomTe}. To be corrected: ${audit.weakestRoomTe}. Site inspection score ${report.plot.score}/100.`;

  const placeEn = { ...place, placeName: placeNameEn(place.placeName) };

  return {
    ...report,
    dikList,
    zones,
    devatas,
    audit,
    nama,
    place: placeEn,
    plot,
    mandala,
    personalDirectionsTe,
    summaryTe,
  };
}

/** స్థలం పేరు తెలుగులో ఉంటే ఆట్లాస్ నుండి ఇంగ్లీషు పేరు. */
const PLACE_TE_EN: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  for (const st of STATE_DISTRICT_ATLAS) {
    for (const d of st.districts) {
      map[d.hqTe] = d.hqEn;
      map[d.nameTe] = d.nameEn;
    }
  }
  return map;
})();

function placeNameEn(name: string): string {
  const key = (name ?? '').trim();
  if (!/[\u0C00-\u0C7F]/.test(key)) return key;
  if (PLACE_TE_EN[key]) return PLACE_TE_EN[key];
  const withoutState = key.replace(/\s*\(.*?\)\s*/g, '').trim();
  return PLACE_TE_EN[withoutState] ?? key;
}

/** తెలుగు పాదాక్షరానికి సమానమైన లాటిన్ అక్షరం (Cha, Kre, …) */
export function latinSyllable(nakshatraIndex: number, pada: number): string {
  const found = NAMA_SYLLABLES_EN.find((s) => s.nakshatraIndex === nakshatraIndex && s.pada === pada);
  return found ? found.syllable : '';
}

const stripParen = (s: string): string => s.replace(/\s*\(.*?\)\s*/g, '').trim();

const PLANET_EN: Record<string, string> = {
  సూర్యుడు: 'Sun', రవి: 'Sun', చంద్రుడు: 'Moon', కుజుడు: 'Mars', అంగారకుడు: 'Mars',
  బుధుడు: 'Mercury', గురుడు: 'Jupiter', గురువు: 'Jupiter', బృహస్పతి: 'Jupiter',
  శుక్రుడు: 'Venus', శని: 'Saturn', మందుడు: 'Saturn', రాహువు: 'Rahu', కేతువు: 'Ketu',
};

const RASI_EN: Record<number, string> = {
  0: 'Aries', 1: 'Taurus', 2: 'Gemini', 3: 'Cancer', 4: 'Leo', 5: 'Virgo',
  6: 'Libra', 7: 'Scorpio', 8: 'Sagittarius', 9: 'Capricorn', 10: 'Aquarius', 11: 'Pisces',
};

const ELEMENT_EN: Record<string, string> = {
  'అగ్ని తత్వం': 'Fire element', 'భూమి తత్వం': 'Earth element',
  'వాయు తత్వం': 'Air element', 'జల తత్వం': 'Water element',
};

const DEITY_EN: Record<string, string> = {
  అగ్ని: 'Agni', బ్రహ్మ: 'Brahma', విష్ణువు: 'Vishnu', శివుడు: 'Shiva', ఇంద్రుడు: 'Indra',
  యముడు: 'Yama', వరుణుడు: 'Varuna', కుబేరుడు: 'Kubera', చంద్రుడు: 'Moon', సూర్యుడు: 'Sun',
  గణపతి: 'Ganapati', సరస్వతి: 'Saraswati', లక్ష్మి: 'Lakshmi', దుర్గ: 'Durga',
  నిరృతి: 'Nirriti', వాయువు: 'Vayu', పూష: 'Pusha', అశ్వినీలు: 'Ashwins',
  బృహస్పతి: 'Brihaspati',
};

const RING_EN: Record<string, string> = {
  బ్రహ్మస్థానం: 'Brahmasthanam',
  'దేవ / మనుష్య వీథి': 'Deva / Manushya vithi',
  'పైశాచిక వీథి': 'Paishachika vithi',
};

const ZONE_NAME_EN: Record<string, string> = {
  'ఉత్తరం (N)': 'North', 'ఉత్తర-ఈశాన్యం (NNE)': 'North-North-East', 'ఈశాన్యం (NE)': 'North-East',
  'తూర్పు-ఈశాన్యం (ENE)': 'East-North-East', 'తూర్పు (E)': 'East', 'తూర్పు-ఆగ్నేయం (ESE)': 'East-South-East',
  'ఆగ్నేయం (SE)': 'South-East', 'దక్షిణ-ఆగ్నేయం (SSE)': 'South-South-East', 'దక్షిణం (S)': 'South',
  'దక్షిణ-నైరుతి (SSW)': 'South-South-West', 'నైరుతి (SW)': 'South-West', 'పడమర-నైరుతి (WSW)': 'West-South-West',
  'పడమర (W)': 'West', 'పడమర-వాయవ్యం (WNW)': 'West-North-West', 'వాయవ్యం (NW)': 'North-West',
  'ఉత్తర-వాయవ్యం (NNW)': 'North-North-West', బ్రహ్మస్థానం: 'Brahmasthanam',
};

function numerologyEn(n: number): string {
  const info = NUMEROLOGY_EN[n] ?? NUMEROLOGY_EN[1];
  const diks = (ROOMlessDiks[n] ?? []).map((d) => DIK_BY_ID[d].nameEn).join(', ');
  return `${info.planet} (${n}) — ${info.nature}. Favourable directions: ${diks}`;
}

const ROOMlessDiks: Record<number, DikInfo['id'][]> = {
  1: ['E', 'NE'], 2: ['NW', 'N'], 3: ['NE', 'N'], 4: ['SW', 'W'], 5: ['N', 'NW'],
  6: ['SE', 'E'], 7: ['NE', 'S'], 8: ['W', 'SW'], 9: ['S', 'SE'],
};

function localizePlace(report: CompleteVastuReport): CompleteVastuReport['place'] {
  const p = report.place;
  const diksEn = p.placeDikTe
    .split(',')
    .map((s) => s.trim())
    .map((te) => Object.values(DIK_BY_ID).find((d) => d.nameTe === te)?.nameEn ?? te)
    .join(', ');
  const nakshatraEn = (() => {
    const raw = p.placeNakshatraTe.split('(')[0].trim();
    void raw;
    const nakEn = report.nama.nakshatraEn || raw;
    return `${nakEn} (pada ${report.nama.pada}) — per Nama Vastu`;
  })();
  const text = buildPlaceTextEn({
    solarNoonTime: p.solarNoonTime,
    solarNoonShadowAzimuth: p.solarNoonShadowAzimuth,
    sunriseShadowAzimuth: p.sunriseShadowAzimuth,
    sunriseAzimuth: p.sunriseAzimuth,
    sunsetAzimuth: p.sunsetAzimuth,
    magneticDeclinationDeg: p.magneticDeclinationDeg,
    lat: p.lat,
    placeDikTe: diksEn,
    placeNakshatraTe: nakshatraEn,
    nearestEquinoxSunriseAz: p.sunriseAzimuth,
  });
  return {
    ...p,
    trueNorthNoteTe: PLACE_EN.trueNorthNote,
    magneticDeclinationNoteTe: PLACE_EN.magneticNote,
    trueNorthStepsTe: text.trueNorthSteps,
    orientationAdviceTe: text.orientationAdvice,
    gatewayAdviceTe: text.gatewayAdvice,
    placeNakshatraTe: text.placeNakshatra,
    placeDikTe: diksEn,
    plotRatioAdviceTe: PLACE_EN.plotRatio,
  };
}

function localizePlot(
  report: CompleteVastuReport,
  params?: VastuPlotParams
): CompleteVastuReport['plot'] {
  if (!params) return report.plot;
  const parts: string[] = [PLOT_SHAPE_EN[params.shape] ?? report.plot.shapeAdviceTe];
  const slope = PLOT_SLOPE_EN[params.slope] ?? report.plot.slopeAdviceTe;
  const road = plotRoadEn(params.road);
  const ratio =
    Math.max(params.lengthFt, params.widthFt) / Math.max(1, Math.min(params.lengthFt, params.widthFt));
  if (ratio > 2) {
    parts.push(
      'The length-to-width ratio exceeds 1:2 — divide the built area into two blocks to correct it.'
    );
  }
  return {
    shapeAdviceTe: parts.join(' '),
    slopeAdviceTe: slope,
    roadAdviceTe: road.text,
    score: report.plot.score,
  };
}

/* ------------------------------------------------------------------ */
/*  Static helpers used by the view                                    */
/* ------------------------------------------------------------------ */

export const ZONE_NAME_EN_BY_INDEX: Record<number, string> = ZONE_INFO.reduce(
  (acc, z) => {
    acc[z.index] = z.nameEn;
    return acc;
  },
  {} as Record<number, string>
);

export const ROOM_LABEL_EN: Record<RoomKey, string> = ROOM_RULES.reduce(
  (acc, r) => {
    acc[r.key] = ROOM_EN[r.key]?.label ?? r.labelTe;
    return acc;
  },
  {} as Record<RoomKey, string>
);

export const ZONE_BY_INDEX = (i: number): ZoneInfo => ZONE_INFO[i];
