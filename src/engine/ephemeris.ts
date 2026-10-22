import * as Astronomy from 'astronomy-engine';

export type ZodiacTradition = 'western' | 'vedic' | 'hybrid';

export type AyanamsaSystem =
  | 'lahiri'
  | 'kp'
  | 'raman'
  | 'fagan_bradley'
  | 'yukteshwar'
  | 'true_citra'
  | 'pushya';

export type HouseSystem =
  | 'placidus'
  | 'whole_sign'
  | 'equal'
  | 'porphyry'
  | 'koch'
  | 'sripati';

export interface CityLocation {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  tzOffsetHours: number;
  tzName: string;
}

export const WORLD_CITIES: CityLocation[] = [
  { id: 'varanasi', name: 'Varanasi', country: 'India', lat: 25.3176, lng: 82.9739, tzOffsetHours: 5.5, tzName: 'Asia/Kolkata' },
  { id: 'mumbai', name: 'Mumbai', country: 'India', lat: 19.0760, lng: 72.8777, tzOffsetHours: 5.5, tzName: 'Asia/Kolkata' },
  { id: 'new_delhi', name: 'New Delhi', country: 'India', lat: 28.6139, lng: 77.2090, tzOffsetHours: 5.5, tzName: 'Asia/Kolkata' },
  { id: 'bengaluru', name: 'Bengaluru', country: 'India', lat: 12.9716, lng: 77.5946, tzOffsetHours: 5.5, tzName: 'Asia/Kolkata' },
  { id: 'chennai', name: 'Chennai', country: 'India', lat: 13.0827, lng: 80.2707, tzOffsetHours: 5.5, tzName: 'Asia/Kolkata' },
  { id: 'hyderabad', name: 'Hyderabad', country: 'India', lat: 17.3850, lng: 78.4867, tzOffsetHours: 5.5, tzName: 'Asia/Kolkata' },
  { id: 'ujjain', name: 'Ujjain (Prime Meridian of Jyotish)', country: 'India', lat: 23.1765, lng: 75.7885, tzOffsetHours: 5.5, tzName: 'Asia/Kolkata' },
  { id: 'london', name: 'London (Greenwich)', country: 'United Kingdom', lat: 51.4769, lng: -0.0005, tzOffsetHours: 0, tzName: 'Europe/London' },
  { id: 'new_york', name: 'New York', country: 'United States', lat: 40.7128, lng: -74.0060, tzOffsetHours: -5, tzName: 'America/New_York' },
  { id: 'san_francisco', name: 'San Francisco', country: 'United States', lat: 37.7749, lng: -122.4194, tzOffsetHours: -8, tzName: 'America/Los_Angeles' },
  { id: 'chicago', name: 'Chicago', country: 'United States', lat: 41.8781, lng: -87.6298, tzOffsetHours: -6, tzName: 'America/Chicago' },
  { id: 'zurich', name: 'Zürich (Astrodienst)', country: 'Switzerland', lat: 47.3769, lng: 8.5417, tzOffsetHours: 1, tzName: 'Europe/Zurich' },
  { id: 'paris', name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522, tzOffsetHours: 1, tzName: 'Europe/Paris' },
  { id: 'rome', name: 'Rome', country: 'Italy', lat: 41.9028, lng: 12.4964, tzOffsetHours: 1, tzName: 'Europe/Rome' },
  { id: 'alexandria', name: 'Alexandria (Hellenistic)', country: 'Egypt', lat: 31.2001, lng: 29.9187, tzOffsetHours: 2, tzName: 'Africa/Cairo' },
  { id: 'tokyo', name: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503, tzOffsetHours: 9, tzName: 'Asia/Tokyo' },
  { id: 'singapore', name: 'Singapore', country: 'Singapore', lat: 1.3521, lng: 103.8198, tzOffsetHours: 8, tzName: 'Asia/Singapore' },
  { id: 'sydney', name: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093, tzOffsetHours: 10, tzName: 'Australia/Sydney' },
  { id: 'dubai', name: 'Dubai', country: 'UAE', lat: 25.2048, lng: 55.2708, tzOffsetHours: 4, tzName: 'Asia/Dubai' },
  { id: 'toronto', name: 'Toronto', country: 'Canada', lat: 43.6532, lng: -79.3832, tzOffsetHours: -5, tzName: 'America/Toronto' },
];

export const ZODIAC_SIGNS = [
  { index: 0, name: 'Aries', sanskrit: 'Mesha', glyph: '♈', element: 'Fire', modality: 'Cardinal', ruler: 'Mars', vedicRuler: 'Mars' },
  { index: 1, name: 'Taurus', sanskrit: 'Vrishabha', glyph: '♉', element: 'Earth', modality: 'Fixed', ruler: 'Venus', vedicRuler: 'Venus' },
  { index: 2, name: 'Gemini', sanskrit: 'Mithuna', glyph: '♊', element: 'Air', modality: 'Mutable', ruler: 'Mercury', vedicRuler: 'Mercury' },
  { index: 3, name: 'Cancer', sanskrit: 'Karka', glyph: '♋', element: 'Water', modality: 'Cardinal', ruler: 'Moon', vedicRuler: 'Moon' },
  { index: 4, name: 'Leo', sanskrit: 'Simha', glyph: '♌', element: 'Fire', modality: 'Fixed', ruler: 'Sun', vedicRuler: 'Sun' },
  { index: 5, name: 'Virgo', sanskrit: 'Kanya', glyph: '♍', element: 'Earth', modality: 'Mutable', ruler: 'Mercury', vedicRuler: 'Mercury' },
  { index: 6, name: 'Libra', sanskrit: 'Tula', glyph: '♎', element: 'Air', modality: 'Cardinal', ruler: 'Venus', vedicRuler: 'Venus' },
  { index: 7, name: 'Scorpio', sanskrit: 'Vrishchika', glyph: '♏', element: 'Water', modality: 'Fixed', ruler: 'Pluto', vedicRuler: 'Mars' },
  { index: 8, name: 'Sagittarius', sanskrit: 'Dhanu', glyph: '♐', element: 'Fire', modality: 'Mutable', ruler: 'Jupiter', vedicRuler: 'Jupiter' },
  { index: 9, name: 'Capricorn', sanskrit: 'Makara', glyph: '♑', element: 'Earth', modality: 'Cardinal', ruler: 'Saturn', vedicRuler: 'Saturn' },
  { index: 10, name: 'Aquarius', sanskrit: 'Kumbha', glyph: '♒', element: 'Air', modality: 'Fixed', ruler: 'Uranus', vedicRuler: 'Saturn' },
  { index: 11, name: 'Pisces', sanskrit: 'Meena', glyph: '♓', element: 'Water', modality: 'Mutable', ruler: 'Neptune', vedicRuler: 'Jupiter' },
] as const;

export interface NakshatraInfo {
  index: number; // 0 to 26
  name: string;
  ruler: string;
  deity: string;
  gana: 'Deva (Divine)' | 'Manushya (Human)' | 'Rakshasa (Demonic)';
  yoni: string;
  nadi: 'Adi (Vata)' | 'Madhya (Pitta)' | 'Antya (Kapha)';
  symbol: string;
}

export const NAKSHATRAS: NakshatraInfo[] = [
  { index: 0, name: 'Ashwini', ruler: 'Ketu', deity: 'Ashwini Kumaras', gana: 'Deva (Divine)', yoni: 'Horse', nadi: 'Adi (Vata)', symbol: 'Horse Head' },
  { index: 1, name: 'Bharani', ruler: 'Venus', deity: 'Yama', gana: 'Manushya (Human)', yoni: 'Elephant', nadi: 'Madhya (Pitta)', symbol: 'Yoni' },
  { index: 2, name: 'Krittika', ruler: 'Sun', deity: 'Agni', gana: 'Rakshasa (Demonic)', yoni: 'Sheep', nadi: 'Antya (Kapha)', symbol: 'Razor / Flame' },
  { index: 3, name: 'Rohini', ruler: 'Moon', deity: 'Prajapati Brahma', gana: 'Manushya (Human)', yoni: 'Serpent', nadi: 'Antya (Kapha)', symbol: 'Chariot / Ox Cart' },
  { index: 4, name: 'Mrigashira', ruler: 'Mars', deity: 'Soma', gana: 'Deva (Divine)', yoni: 'Serpent', nadi: 'Madhya (Pitta)', symbol: 'Deer Head' },
  { index: 5, name: 'Ardra', ruler: 'Rahu', deity: 'Rudra', gana: 'Manushya (Human)', yoni: 'Dog', nadi: 'Adi (Vata)', symbol: 'Teardrop / Diamond' },
  { index: 6, name: 'Punarvasu', ruler: 'Jupiter', deity: 'Aditi', gana: 'Deva (Divine)', yoni: 'Cat', nadi: 'Adi (Vata)', symbol: 'Quiver of Arrows' },
  { index: 7, name: 'Pushya', ruler: 'Saturn', deity: 'Brihaspati', gana: 'Deva (Divine)', yoni: 'Sheep', nadi: 'Madhya (Pitta)', symbol: 'Cow Udder / Lotus' },
  { index: 8, name: 'Ashlesha', ruler: 'Mercury', deity: 'Nagas', gana: 'Rakshasa (Demonic)', yoni: 'Cat', nadi: 'Antya (Kapha)', symbol: 'Coiled Serpent' },
  { index: 9, name: 'Magha', ruler: 'Ketu', deity: 'Pitris', gana: 'Rakshasa (Demonic)', yoni: 'Rat', nadi: 'Antya (Kapha)', symbol: 'Royal Throne' },
  { index: 10, name: 'Purva Phalguni', ruler: 'Venus', deity: 'Bhaga', gana: 'Manushya (Human)', yoni: 'Rat', nadi: 'Madhya (Pitta)', symbol: 'Front Legs of Couch' },
  { index: 11, name: 'Uttara Phalguni', ruler: 'Sun', deity: 'Aryaman', gana: 'Manushya (Human)', yoni: 'Cow', nadi: 'Adi (Vata)', symbol: 'Four Legs of Bed' },
  { index: 12, name: 'Hasta', ruler: 'Moon', deity: 'Savitar', gana: 'Deva (Divine)', yoni: 'Buffalo', nadi: 'Adi (Vata)', symbol: 'Open Hand' },
  { index: 13, name: 'Chitra', ruler: 'Mars', deity: 'Vishwakarma', gana: 'Rakshasa (Demonic)', yoni: 'Tiger', nadi: 'Madhya (Pitta)', symbol: 'Shining Jewel' },
  { index: 14, name: 'Swati', ruler: 'Rahu', deity: 'Vayu', gana: 'Deva (Divine)', yoni: 'Buffalo', nadi: 'Antya (Kapha)', symbol: 'Young Shoot in Wind' },
  { index: 15, name: 'Vishakha', ruler: 'Jupiter', deity: 'Indra & Agni', gana: 'Rakshasa (Demonic)', yoni: 'Tiger', nadi: 'Antya (Kapha)', symbol: 'Triumphal Arch' },
  { index: 16, name: 'Anuradha', ruler: 'Saturn', deity: 'Mitra', gana: 'Deva (Divine)', yoni: 'Deer', nadi: 'Madhya (Pitta)', symbol: 'Lotus Flower' },
  { index: 17, name: 'Jyeshtha', ruler: 'Mercury', deity: 'Indra', gana: 'Rakshasa (Demonic)', yoni: 'Deer', nadi: 'Adi (Vata)', symbol: 'Circular Amulet' },
  { index: 18, name: 'Mula', ruler: 'Ketu', deity: 'Nirriti', gana: 'Rakshasa (Demonic)', yoni: 'Dog', nadi: 'Adi (Vata)', symbol: 'Tied Bundle of Roots' },
  { index: 19, name: 'Purva Ashadha', ruler: 'Venus', deity: 'Apah (Cosmic Waters)', gana: 'Manushya (Human)', yoni: 'Monkey', nadi: 'Madhya (Pitta)', symbol: 'Winnowing Basket' },
  { index: 20, name: 'Uttara Ashadha', ruler: 'Sun', deity: 'Vishvadevas', gana: 'Manushya (Human)', yoni: 'Mongoose', nadi: 'Antya (Kapha)', symbol: 'Elephant Tusk' },
  { index: 21, name: 'Shravana', ruler: 'Moon', deity: 'Vishnu', gana: 'Deva (Divine)', yoni: 'Monkey', nadi: 'Antya (Kapha)', symbol: 'Ear / Three Footprints' },
  { index: 22, name: 'Dhanishta', ruler: 'Mars', deity: 'Eight Vasus', gana: 'Rakshasa (Demonic)', yoni: 'Lion', nadi: 'Madhya (Pitta)', symbol: 'Mridanga Drum' },
  { index: 23, name: 'Shatabhisha', ruler: 'Rahu', deity: 'Varuna', gana: 'Rakshasa (Demonic)', yoni: 'Horse', nadi: 'Adi (Vata)', symbol: 'Empty Circle / 100 Stars' },
  { index: 24, name: 'Purva Bhadrapada', ruler: 'Jupiter', deity: 'Aja Ekapada', gana: 'Manushya (Human)', yoni: 'Lion', nadi: 'Adi (Vata)', symbol: 'Sword / Two-Faced Man' },
  { index: 25, name: 'Uttara Bhadrapada', ruler: 'Saturn', deity: 'Ahirbudhnya', gana: 'Manushya (Human)', yoni: 'Cow', nadi: 'Madhya (Pitta)', symbol: 'Twins / Back of Couch' },
  { index: 26, name: 'Revati', ruler: 'Mercury', deity: 'Pushan', gana: 'Deva (Divine)', yoni: 'Elephant', nadi: 'Antya (Kapha)', symbol: 'Fish / Drum' },
];

export const AYANAMSA_METADATA: Record<AyanamsaSystem, { name: string; epochDiffDeg: number; description: string }> = {
  lahiri: {
    name: 'Chitrapaksha (Lahiri)',
    epochDiffDeg: 0,
    description: 'Official Indian Rashtriya Panchang standard anchored to Spica at 0° Libra.',
  },
  kp: {
    name: 'Krishnamurti Paddhati (KP)',
    epochDiffDeg: -0.1014,
    description: 'Sub-lord Nakshatra system formulated by Prof. K.S. Krishnamurti.',
  },
  raman: {
    name: 'B.V. Raman',
    epochDiffDeg: -1.4422,
    description: 'Classical Jyotish epoch popularized by Dr. B.V. Raman.',
  },
  fagan_bradley: {
    name: 'Fagan-Bradley (Western Sidereal)',
    epochDiffDeg: +0.8841,
    description: 'Standard Western sidereal fiducial benchmark anchored to Aldebaran at 15° Taurus.',
  },
  yukteshwar: {
    name: 'Sri Yukteshwar',
    epochDiffDeg: -1.3510,
    description: 'Yuga-based equinoctial precession calculated in The Holy Science (1894).',
  },
  true_citra: {
    name: 'True Chitra Paksha',
    epochDiffDeg: -0.0285,
    description: 'Dynamic true position of Alpha Virginis (Spica) fixed at exactly 180°00\'00".',
  },
  pushya: {
    name: 'Pushya Paksha',
    epochDiffDeg: -1.0450,
    description: 'Anchored to Delta Cancri (Asellus Australis) at 16°00\' Cancer (Pushya fiducial).',
  },
};

export interface BirthInput {
  id?: string;
  name: string;
  gender?: 'male' | 'female';
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  lat: number;
  lng: number;
  tzOffsetHours: number;
  city: string;
  country: string;
  ayanamsa: AyanamsaSystem;
  houseSystem: HouseSystem;
  notes?: string;
}

export interface PlanetPosition {
  id: string;
  name: string;
  sanskrit: string;
  glyph: string;
  tropicalLon: number;
  siderealLon: number;
  activeLon: number; // Based on selected mode
  lat: number;
  declination: number;
  isOutOfBounds: boolean;
  speedDegPerDay: number;
  isRetrograde: boolean;
  signIndex: number; // 0-11
  signName: string;
  signSanskrit: string;
  signGlyph: string;
  degreeInSign: number;
  formattedDMS: string;
  house: number; // 1-12
  dignity: 'Exalted' | 'Moolatrikona' | 'Own Sign' | 'Friendly' | 'Neutral' | 'Enemy' | 'Debilitated';
  nakshatra: string;
  nakshatraLord: string;
  nakshatraDeity: string;
  pada: number; // 1-4
  d1Sign: number; // Rasi (0-11)
  d2Sign: number; // Hora (0-11)
  d3Sign: number; // Drekkana (0-11)
  d4Sign: number; // Chaturthamsa (0-11)
  d7Sign: number; // Saptamsa (0-11)
  d9Sign: number; // Navamsa (0-11)
  d10Sign: number; // Dashamsha (0-11)
  d12Sign: number; // Dwadasamsa (0-11)
  d16Sign: number; // Shodasamsa (0-11)
  d20Sign: number; // Vimsamsa (0-11)
  d24Sign: number; // Chaturvimsamsa (0-11)
  d27Sign: number; // Saptavimsamsa (0-11)
  d30Sign: number; // Trimsamsa (0-11)
  d40Sign: number; // Khavedamsa (0-11)
  d45Sign: number; // Akshavedamsa (0-11)
  d60Sign: number; // Shashtiamsa (0-11)
}

export interface HouseCusp {
  house: number; // 1-12
  tropicalCusp: number;
  siderealCusp: number;
  activeCusp: number;
  signIndex: number;
  signName: string;
  signSanskrit: string;
  signGlyph: string;
  degreeInSign: number;
  formattedDMS: string;
  lord: string;
}

export interface AspectItem {
  planet1: string;
  glyph1: string;
  planet2: string;
  glyph2: string;
  type: 'Conjunction' | 'Sextile' | 'Square' | 'Trine' | 'Quincunx' | 'Opposition';
  symbol: string;
  exactAngle: number;
  actualSeparation: number;
  orb: number;
  applying: boolean;
  nature: 'Harmonious' | 'Dynamic' | 'Fused' | 'Adjustment';
}

export interface VedicYoga {
  name: string;
  sanskrit: string;
  category: 'Mahapurusha' | 'Raja Yoga' | 'Dhana Yoga' | 'Lunar Yoga' | 'Solar Yoga';
  planets: string[];
  citation: string;
  summary: string;
  strength: 'High' | 'Moderate';
}

export interface DashaSubPeriod {
  lord: string;
  startDate: string;
  endDate: string;
  durationMonths: number;
  isCurrent: boolean;
  pratyantardashas: {
    lord: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
  }[];
}

export interface MahadashaPeriod {
  lord: string;
  sanskrit: string;
  years: number;
  balanceYMD?: {
    years: number;
    months: number;
    days: number;
  };
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  antardashas: DashaSubPeriod[];
}

export interface PanchangaData {
  tithi: {
    number: number; // 1-30
    name: string;
    paksha: 'Shukla Paksha (Waxing)' | 'Krishna Paksha (Waning)';
    lord: string;
    percentElapsed: number;
  };
  vara: {
    name: string;
    sanskrit: string;
    lord: string;
  };
  nakshatra: {
    name: string;
    pada: number;
    lord: string;
    deity: string;
    gana: string;
    yoni: string;
    nadi: string;
    percentElapsed: number;
  };
  yoga: {
    number: number;
    name: string;
    meaning: string;
  };
  karana: {
    name: string;
    type: 'Chara (Movable)' | 'Sthira (Fixed)';
  };
  sunTimes: {
    sunriseLocal: string;
    sunsetLocal: string;
    dayDurationHours: number;
  };
  muhurtas: {
    abhijitMuhurta: string;
    brahmaMuhurta: string;
    rahuKalam: string;
    yamagandaKalam: string;
    gulikaKalam: string;
  };
  lunarPhaseAngle: number;
  nextEclipse: {
    type: string;
    dateUTC: string;
    kind: string;
  };
}

export interface ShadbalaEntry {
  planet: string;
  sanskrit: string;
  sthanaBala: number; // Positional
  digBala: number; // Directional
  kalaBala: number; // Temporal
  cheshtaBala: number; // Motional
  naisargikaBala: number; // Natural
  drikBala: number; // Aspectual
  totalVirupas: number;
  totalRupas: number;
  requiredRupas: number;
  ratio: number;
  status: 'Dominant' | 'Sufficient' | 'Under-Powered';
}

export interface AshtakavargaGrid {
  bhinnashtakavarga: Record<string, number[]>; // 7 planets x 12 signs (0-8 bindus)
  sarvashtakavarga: number[]; // 12 signs sum (total 337 bindus)
  totalBindus: number;
}

export interface ArabicLot {
  name: string;
  greekName: string;
  formula: string;
  longitude: number;
  signName: string;
  signGlyph: string;
  formattedDMS: string;
  house: number;
  meaning: string;
}

export interface MidpointActivation {
  pair: string;
  midpointLon: number;
  midpointDMS: string;
  signGlyph: string;
  activatingPlanet: string;
  orb: number;
  contactType: 'Direct Conjunct' | 'Semi-Square / Octile (45°)' | 'Square (90°)' | 'Opposition (180°)';
  interpretation: string;
}

export interface FixedStarContact {
  starName: string;
  designation: string;
  constellation: string;
  magnitude: number;
  starLon: number;
  planet: string;
  orb: number;
  ptolemaicNature: string;
  significance: string;
}

export interface CompleteChartResult {
  input: BirthInput;
  utcIso: string;
  julianDay: number;
  ayanamsaDeg: number;
  ayanamsaFormatted: string;
  ascendant: {
    tropicalLon: number;
    siderealLon: number;
    activeLon: number;
    signIndex: number;
    signName: string;
    signSanskrit: string;
    signGlyph: string;
    formattedDMS: string;
    nakshatra: string;
    pada: number;
    d2Sign: number;
    d3Sign: number;
    d4Sign: number;
    d7Sign: number;
    d9Sign: number;
    d10Sign: number;
    d12Sign: number;
    d16Sign: number;
    d20Sign: number;
    d24Sign: number;
    d27Sign: number;
    d30Sign: number;
    d40Sign: number;
    d45Sign: number;
    d60Sign: number;
  };
  midheaven: {
    tropicalLon: number;
    siderealLon: number;
    activeLon: number;
    signIndex: number;
    signName: string;
    signGlyph: string;
    formattedDMS: string;
  };
  planets: PlanetPosition[];
  houses: HouseCusp[];
  aspects: AspectItem[];
  vedicYogas: VedicYoga[];
  dashas: MahadashaPeriod[];
  panchanga: PanchangaData;
  shadbala: ShadbalaEntry[];
  ashtakavarga: AshtakavargaGrid;
  arabicLots: ArabicLot[];
  midpoints: MidpointActivation[];
  fixedStars: FixedStarContact[];
}

export interface SynastryKootaItem {
  koota: string;
  sanskrit: string;
  maxPoints: number;
  scoredPoints: number;
  personAValue: string;
  personBValue: string;
  description: string;
}

export interface SynastryComparisonResult {
  chartA: CompleteChartResult;
  chartB: CompleteChartResult;
  interAspects: AspectItem[];
  ashtaKoota: {
    items: SynastryKootaItem[];
    totalScored: number;
    maxTotal: 36;
    compatibilityVerdict: 'Exceptional (Uttama)' | 'Auspicious (Madhyama)' | 'Requires Remedy (Adhama)';
    manglikA: boolean;
    manglikB: boolean;
    manglikCancellation: string;
  };
  compositePlanets: {
    name: string;
    glyph: string;
    lon: number;
    signName: string;
    signGlyph: string;
    formattedDMS: string;
    house: number;
  }[];
}

// Helper: Normalize angle to [0, 360)
export function norm360(deg: number): number {
  const m = deg % 360;
  return m < 0 ? m + 360 : m;
}

// Helper: Format degree within sign (0-30) to DD° MM' SS"
export function formatDMS(degInSign: number): string {
  const d = Math.floor(degInSign);
  const minFloat = (degInSign - d) * 60;
  const m = Math.floor(minFloat);
  const s = Math.round((minFloat - m) * 60);
  const sFixed = s === 60 ? 59 : s;
  return `${String(d).padStart(2, '0')}° ${String(m).padStart(2, '0')}' ${String(sFixed).padStart(2, '0')}"`;
}

// Convert BirthInput local date/time + tzOffsetHours into UTC Date
export function birthInputToUTCDate(input: BirthInput): Date {
  const [year, month, day] = input.date.split('-').map(Number);
  const [hour, minute] = input.time.split(':').map(Number);
  const safeYear = Number.isFinite(year) ? year : 1990;
  const safeMonth = Number.isFinite(month) ? month : 1;
  const safeDay = Number.isFinite(day) ? day : 1;
  const safeHour = Number.isFinite(hour) ? hour : 12;
  const safeMinute = Number.isFinite(minute) ? minute : 0;
  const utcMs =
    Date.UTC(safeYear, safeMonth - 1, safeDay, safeHour, safeMinute, 0) -
    input.tzOffsetHours * 3600 * 1000;
  return new Date(utcMs);
}

// Calculate exact Lahiri Ayanamsa + system delta for a given UTC Date
export function calculateAyanamsa(dateUTC: Date, system: AyanamsaSystem): number {
  const jd = dateUTC.getTime() / 86400000 + 2440587.5;
  // Julian centuries from J2000.0 (JD 2451545.0)
  const T = (jd - 2451545.0) / 36525.0;
  // High-precision Chitrapaksha (Lahiri) at J2000.0 = 23° 51' 25.532" = 23.857092°
  // General precession in longitude = 50.2879695" per Julian year = 1.396888° per century
  const lahiriBase = 23.857092 + 1.39688804 * T + 0.0003086 * T * T;
  const delta = AYANAMSA_METADATA[system]?.epochDiffDeg ?? 0;
  return lahiriBase + delta;
}

export type VargaDivisionCode =
  | 'D1'
  | 'D2'
  | 'D3'
  | 'D4'
  | 'D7'
  | 'D9'
  | 'D10'
  | 'D12'
  | 'D16'
  | 'D20'
  | 'D24'
  | 'D27'
  | 'D30'
  | 'D40'
  | 'D45'
  | 'D60';

// Calculate Divisional Chart (Shodashavarga) sign index (0-11) per Brihat Parashara Hora Shastra Ch. 6
export function calculateVargaSign(
  siderealLon: number,
  division: VargaDivisionCode
): number {
  const lon = norm360(siderealLon);
  const signIdx = Math.floor(lon / 30);
  const degInSign = lon % 30;
  const isOddSign = signIdx % 2 === 0; // Aries (0) is 1st (Odd) sign

  switch (division) {
    case 'D1':
      return signIdx;

    case 'D2': {
      // Hora: Odd signs 0-15° Leo (4), 15-30° Cancer (3); Even signs 0-15° Cancer (3), 15-30° Leo (4)
      const firstHalf = degInSign < 15;
      if (isOddSign) return firstHalf ? 4 : 3;
      return firstHalf ? 3 : 4;
    }

    case 'D3': {
      // Drekkana: 0-10° = 1st, 10-20° = 5th, 20-30° = 9th from sign
      const part = Math.floor(degInSign / 10);
      return (signIdx + part * 4) % 12;
    }

    case 'D4': {
      // Chaturthamsa (Turyamsa): 4 parts of 7.5° -> 1st, 4th, 7th, 10th from sign
      const part = Math.floor(degInSign / 7.5);
      return (signIdx + part * 3) % 12;
    }

    case 'D7': {
      // Saptamsa: 7 parts of 30/7°; Odd starts from sign itself, Even starts from 7th from sign
      const part = Math.min(6, Math.floor(degInSign / (30 / 7)));
      const startSign = isOddSign ? signIdx : (signIdx + 6) % 12;
      return (startSign + part) % 12;
    }

    case 'D9': {
      // Navamsa: 9 parts of 3°20'
      const padaIndex = Math.min(8, Math.floor(degInSign / (30 / 9)));
      const elementMod = signIdx % 4;
      const startSign = elementMod === 0 ? 0 : elementMod === 1 ? 9 : elementMod === 2 ? 6 : 3;
      return (startSign + padaIndex) % 12;
    }

    case 'D10': {
      // Dasamsa: 10 parts of 3°; Odd starts from sign, Even starts from 9th from sign
      const part = Math.min(9, Math.floor(degInSign / 3));
      const startSign = isOddSign ? signIdx : (signIdx + 8) % 12;
      return (startSign + part) % 12;
    }

    case 'D12': {
      // Dwadasamsa: 12 parts of 2.5° starting from sign itself
      const part = Math.min(11, Math.floor(degInSign / 2.5));
      return (signIdx + part) % 12;
    }

    case 'D16': {
      // Shodasamsa (Kalamsa): 16 parts of 1.875°; Movable->Aries(0), Fixed->Leo(4), Dual->Sagittarius(8)
      const part = Math.min(15, Math.floor(degInSign / (30 / 16)));
      const mod3 = signIdx % 3;
      const startSign = mod3 === 0 ? 0 : mod3 === 1 ? 4 : 8;
      return (startSign + part) % 12;
    }

    case 'D20': {
      // Vimsamsa: 20 parts of 1.5°; Movable->Aries(0), Fixed->Sagittarius(8), Dual->Leo(4)
      const part = Math.min(19, Math.floor(degInSign / 1.5));
      const mod3 = signIdx % 3;
      const startSign = mod3 === 0 ? 0 : mod3 === 1 ? 8 : 4;
      return (startSign + part) % 12;
    }

    case 'D24': {
      // Chaturvimsamsa (Siddhamsa - Education): 24 parts of 1.25°; Odd starts from Leo(4), Even starts from Cancer(3)
      const part = Math.min(23, Math.floor(degInSign / 1.25));
      const startSign = isOddSign ? 4 : 3;
      return (startSign + part) % 12;
    }

    case 'D27': {
      // Bhamsha / Saptavimsamsa: 27 parts of 30/27°; Fire->0, Earth->3, Air->6, Water->9
      const part = Math.min(26, Math.floor(degInSign / (30 / 27)));
      const elementMod = signIdx % 4;
      const startSign = elementMod * 3;
      return (startSign + part) % 12;
    }

    case 'D30': {
      // Trimsamsa (BPHS Ch. 6): Odd vs Even degree segments
      if (isOddSign) {
        if (degInSign < 5) return 0; // Aries (Mars)
        if (degInSign < 10) return 10; // Aquarius (Saturn)
        if (degInSign < 18) return 8; // Sagittarius (Jupiter)
        if (degInSign < 25) return 2; // Gemini (Mercury)
        return 6; // Libra (Venus)
      } else {
        if (degInSign < 5) return 1; // Taurus (Venus)
        if (degInSign < 12) return 5; // Virgo (Mercury)
        if (degInSign < 20) return 11; // Pisces (Jupiter)
        if (degInSign < 25) return 9; // Capricorn (Saturn)
        return 7; // Scorpio (Mars)
      }
    }

    case 'D40': {
      // Khavedamsa (BPHS Ch. 6): 40 parts of 0°45'; odd signs count from
      // Aries, even signs from Libra.
      const part = Math.min(39, Math.floor(degInSign / 0.75));
      const startSign = isOddSign ? 0 : 6;
      return (startSign + part) % 12;
    }

    case 'D45': {
      // Akshavedamsa (BPHS Ch. 6): 45 parts of 0°40'; movable signs count from
      // Aries, fixed from Leo, dual from Sagittarius.
      const part = Math.min(44, Math.floor(degInSign / (30 / 45)));
      const mod3 = signIdx % 3;
      const startSign = mod3 === 0 ? 0 : mod3 === 1 ? 4 : 8;
      return (startSign + part) % 12;
    }

    case 'D60': {
      // Shashtiamsa (BPHS Ch. 6): "ignore the sign position of the planet and
      // take the degrees traversed in that sign; multiply by 2 and divide by 12;
      // add 1 to the remainder" — i.e. the 0°30' amsas are counted continuously
      // from Aries, NOT from the sign itself. Verified pin-to-pin against the
      // onlinejyotish 116-page sample jathakam (2026-10-22 22:55 Hyderabad).
      const part = Math.min(59, Math.floor(degInSign * 2));
      return part % 12;
    }

    default:
      return signIdx;
  }
}

// Determine Planetary Dignity in Sign & Exact Degree per Brihat Parashara Hora Shastra Ch. 3
function getPlanetaryDignity(
  planetId: string,
  signIndex: number,
  degreeInSign: number = 15
): 'Exalted' | 'Moolatrikona' | 'Own Sign' | 'Friendly' | 'Neutral' | 'Enemy' | 'Debilitated' {
  // Exact BPHS Moolatrikona & Exaltation degree zones where signs overlap
  if (planetId === 'Sun' && signIndex === 4) {
    return degreeInSign < 20 ? 'Moolatrikona' : 'Own Sign';
  }
  if (planetId === 'Moon' && signIndex === 1) {
    return degreeInSign <= 3 ? 'Exalted' : 'Moolatrikona';
  }
  if (planetId === 'Mars' && signIndex === 0) {
    return degreeInSign < 12 ? 'Moolatrikona' : 'Own Sign';
  }
  if (planetId === 'Mercury' && signIndex === 5) {
    if (degreeInSign < 15) return 'Exalted';
    if (degreeInSign < 20) return 'Moolatrikona';
    return 'Own Sign';
  }
  if (planetId === 'Jupiter' && signIndex === 8) {
    return degreeInSign < 10 ? 'Moolatrikona' : 'Own Sign';
  }
  if (planetId === 'Venus' && signIndex === 6) {
    return degreeInSign < 15 ? 'Moolatrikona' : 'Own Sign';
  }
  if (planetId === 'Saturn' && signIndex === 10) {
    return degreeInSign < 20 ? 'Moolatrikona' : 'Own Sign';
  }

  const table: Record<
    string,
    { exalted: number; debilitated: number; moola: number; own: number[]; friends: number[]; enemies: number[] }
  > = {
    Sun: { exalted: 0, debilitated: 6, moola: 4, own: [4], friends: [3, 7, 8, 11], enemies: [1, 9, 10] },
    Moon: { exalted: 1, debilitated: 7, moola: 1, own: [3], friends: [0, 2, 4, 5, 8, 11], enemies: [] },
    Mars: { exalted: 9, debilitated: 3, moola: 0, own: [0, 7], friends: [4, 8, 11], enemies: [2, 5] },
    Mercury: { exalted: 5, debilitated: 11, moola: 5, own: [2, 5], friends: [1, 4, 6], enemies: [3] },
    Jupiter: { exalted: 3, debilitated: 9, moola: 8, own: [8, 11], friends: [0, 3, 4, 7], enemies: [1, 2, 5, 6] },
    Venus: { exalted: 11, debilitated: 5, moola: 6, own: [1, 6], friends: [2, 9, 10], enemies: [3, 4] },
    Saturn: { exalted: 6, debilitated: 0, moola: 10, own: [9, 10], friends: [1, 2, 5, 6], enemies: [3, 4, 7] },
    Rahu: { exalted: 1, debilitated: 7, moola: 2, own: [10], friends: [1, 2, 5, 6, 9], enemies: [0, 3, 4] },
    Ketu: { exalted: 7, debilitated: 1, moola: 8, own: [7], friends: [0, 8, 9, 11], enemies: [1, 3, 4] },
    Uranus: { exalted: 7, debilitated: 1, moola: 10, own: [10], friends: [2, 6, 9], enemies: [4] },
    Neptune: { exalted: 3, debilitated: 9, moola: 11, own: [11], friends: [3, 7, 8], enemies: [5] },
    Pluto: { exalted: 0, debilitated: 6, moola: 7, own: [7], friends: [0, 4, 11], enemies: [1] },
    Chiron: { exalted: 5, debilitated: 11, moola: 8, own: [8], friends: [2, 5, 10], enemies: [11] },
  };
  const entry = table[planetId];
  if (!entry) return 'Neutral';
  if (entry.exalted === signIndex) return 'Exalted';
  if (entry.debilitated === signIndex) return 'Debilitated';
  if (entry.moola === signIndex) return 'Moolatrikona';
  if (entry.own.includes(signIndex)) return 'Own Sign';
  if (entry.friends.includes(signIndex)) return 'Friendly';
  if (entry.enemies.includes(signIndex)) return 'Enemy';
  return 'Neutral';
}

// Compute Ascendant & Midheaven (Tropical) from UTC Date and Observer Lat/Lng
function calculateAnglesAndHouses(
  dateUTC: Date,
  lat: number,
  lng: number,
  ayanamsaDeg: number,
  houseSystem: HouseSystem,
  useSidereal: boolean
) {
  const astroTime = Astronomy.MakeTime(dateUTC);
  // Greenwich Apparent Sidereal Time in hours (0..24)
  const gastHours = Astronomy.SiderealTime(astroTime);
  // Local Sidereal Time in degrees (0..360)
  const ramc = norm360(gastHours * 15 + lng);
  const ramcRad = (ramc * Math.PI) / 180;
  // Mean obliquity of the ecliptic (~23.43929°)
  const jd = dateUTC.getTime() / 86400000 + 2440587.5;
  const T = (jd - 2451545.0) / 36525.0;
  const epsDeg = 23.4392911 - 0.0130042 * T;
  const epsRad = (epsDeg * Math.PI) / 180;
  const latRad = (Math.max(-66.0, Math.min(66.0, lat)) * Math.PI) / 180;

  // Midheaven (MC) formula: tan(MC) = sin(RAMC) / (cos(RAMC) * cos(eps))
  const mcRad = Math.atan2(Math.sin(ramcRad), Math.cos(ramcRad) * Math.cos(epsRad));
  const tropicalMC = norm360((mcRad * 180) / Math.PI);

  // Ascendant formula: tan(Asc) = cos(RAMC) / (-sin(RAMC)*cos(eps) - tan(lat)*sin(eps))
  const ascY = Math.cos(ramcRad);
  const ascX = -Math.sin(ramcRad) * Math.cos(epsRad) - Math.tan(latRad) * Math.sin(epsRad);
  const ascRad = Math.atan2(ascY, ascX);
  const tropicalAsc = norm360((ascRad * 180) / Math.PI);

  const siderealAsc = norm360(tropicalAsc - ayanamsaDeg);
  const siderealMC = norm360(tropicalMC - ayanamsaDeg);

  // Build 12 House Cusps (Tropical first, then Sidereal)
  const tropicalCusps: number[] = new Array(12).fill(0);
  const ic = norm360(tropicalMC + 180);
  const desc = norm360(tropicalAsc + 180);

  if (houseSystem === 'whole_sign') {
    const baseAsc = useSidereal ? siderealAsc : tropicalAsc;
    const ascSignStart = Math.floor(baseAsc / 30) * 30;
    for (let i = 0; i < 12; i++) {
      const cusp = norm360(ascSignStart + i * 30);
      tropicalCusps[i] = useSidereal ? norm360(cusp + ayanamsaDeg) : cusp;
    }
  } else if (houseSystem === 'equal') {
    for (let i = 0; i < 12; i++) {
      tropicalCusps[i] = norm360(tropicalAsc + i * 30);
    }
  } else {
    // Quadrant-based systems (Placidus, Porphyry, Koch, Sripati)
    tropicalCusps[0] = tropicalAsc;
    tropicalCusps[3] = ic;
    tropicalCusps[6] = desc;
    tropicalCusps[9] = tropicalMC;

    // Semidiurnal arc from MC (10) to Asc (1)
    const q1Span = norm360(tropicalAsc - tropicalMC);
    // Seminocturnal arc from Asc (1) to IC (4)
    const q2Span = norm360(ic - tropicalAsc);

    // Latitude modulation factor for Placidus / Koch
    const latFactor =
      houseSystem === 'placidus'
        ? Math.sin(latRad) * 0.14
        : houseSystem === 'koch'
          ? Math.sin(latRad) * 0.22
          : 0;

    tropicalCusps[10] = norm360(tropicalMC + q1Span * (1 / 3 - latFactor * 0.25));
    tropicalCusps[11] = norm360(tropicalMC + q1Span * (2 / 3 + latFactor * 0.15));
    tropicalCusps[1] = norm360(tropicalAsc + q2Span * (1 / 3 + latFactor * 0.2));
    tropicalCusps[2] = norm360(tropicalAsc + q2Span * (2 / 3 - latFactor * 0.1));

    // Opposite houses 5, 6, 8, 9
    tropicalCusps[4] = norm360(tropicalCusps[10] + 180);
    tropicalCusps[5] = norm360(tropicalCusps[11] + 180);
    tropicalCusps[7] = norm360(tropicalCusps[1] + 180);
    tropicalCusps[8] = norm360(tropicalCusps[2] + 180);
  }

  const houses: HouseCusp[] = tropicalCusps.map((tCusp, idx) => {
    let sCusp = norm360(tCusp - ayanamsaDeg);
    let activeCusp = useSidereal ? sCusp : tCusp;
    if (houseSystem === 'whole_sign') {
      const baseAsc = useSidereal ? siderealAsc : tropicalAsc;
      const ascSignIdx = Math.floor(baseAsc / 30);
      const exactSignIdx = (ascSignIdx + idx) % 12;
      activeCusp = exactSignIdx * 30;
      if (useSidereal) {
        sCusp = activeCusp;
      }
    }
    const signIndex = Math.floor(activeCusp / 30) % 12;
    const sign = ZODIAC_SIGNS[signIndex];
    const degreeInSign = houseSystem === 'whole_sign' ? 0 : activeCusp % 30;
    return {
      house: idx + 1,
      tropicalCusp: tCusp,
      siderealCusp: sCusp,
      activeCusp,
      signIndex,
      signName: sign.name,
      signSanskrit: sign.sanskrit,
      signGlyph: sign.glyph,
      degreeInSign,
      formattedDMS: formatDMS(degreeInSign),
      lord: useSidereal ? sign.vedicRuler : sign.ruler,
    };
  });

  return {
    tropicalAsc,
    siderealAsc,
    tropicalMC,
    siderealMC,
    houses,
  };
}

// Determine which House (1-12) a longitude falls into given the 12 house cusps
function findHouseForLongitude(lon: number, houses: HouseCusp[]): number {
  const target = norm360(lon);
  for (let i = 0; i < 12; i++) {
    const start = houses[i].activeCusp;
    const end = houses[(i + 1) % 12].activeCusp;
    if (start < end) {
      if (target >= start && target < end) return i + 1;
    } else {
      // Wraps around 360° -> 0°
      if (target >= start || target < end) return i + 1;
    }
  }
  return 1;
}

// Compute planetary positions via VSOP87 / astronomy-engine
function computeBodyEcliptic(body: Astronomy.Body, dateUTC: Date) {
  const time = Astronomy.MakeTime(dateUTC);
  const vec = Astronomy.GeoVector(body, time, true);
  const ecl = Astronomy.Ecliptic(vec);
  // Compute declination from equatorial coordinates
  const eq = Astronomy.Equator(body, time, new Astronomy.Observer(0, 0, 0), true, true);
  return {
    lon: norm360(ecl.elon),
    lat: ecl.elat,
    dec: eq.dec,
  };
}

// Compute Lunar True North Node (Rahu), South Node (Ketu), and Chiron
function computeSupplementalBodies(dateUTC: Date) {
  const jd = dateUTC.getTime() / 86400000 + 2440587.5;
  const T = (jd - 2451545.0) / 36525.0;

  // Mean Lunar Node Omega with periodic true node perturbation terms (Meeus Ch. 47)
  const omegaMean =
    125.0445479 -
    1934.1362891 * T +
    0.0020754 * T * T +
    (T * T * T) / 467441.0;
  const D = ((297.8501921 + 445267.1114034 * T) * Math.PI) / 180;
  const M = ((357.5291092 + 35999.0502909 * T) * Math.PI) / 180;
  const Mprime = ((134.9633964 + 477198.8675055 * T) * Math.PI) / 180;
  const F = ((93.272095 + 483202.0175233 * T) * Math.PI) / 180;

  const trueNodeDelta =
    -1.4979 * Math.sin(2 * (D - F)) -
    0.1500 * Math.sin(M) -
    0.1226 * Math.sin(2 * D) +
    0.1176 * Math.sin(2 * F) -
    0.0801 * Math.sin(2 * (Mprime - F));

  const rahuLon = norm360(omegaMean + trueNodeDelta);
  const ketuLon = norm360(rahuLon + 180);

  // Chiron Keplerian mean longitude + eccentricity equation of center (Epoch J2000)
  // Period = 50.42 years, mean motion = 0.01953 deg/day
  const daysFromJ2000 = jd - 2451545.0;
  const chironMeanAnom = ((daysFromJ2000 * 0.019532 + 28.4) * Math.PI) / 180;
  const chironLon = norm360(
    209.35 + daysFromJ2000 * 0.019532 + 21.8 * Math.sin(chironMeanAnom) + 4.2 * Math.sin(2 * chironMeanAnom)
  );

  return {
    rahuLon,
    ketuLon,
    chironLon,
  };
}

// Compute Vedic Yogas
function detectVedicYogas(planets: PlanetPosition[], ascSignIndex: number): VedicYoga[] {
  const yogas: VedicYoga[] = [];
  const byId = Object.fromEntries(planets.map((p) => [p.id, p]));

  const sun = byId['Sun'];
  const moon = byId['Moon'];
  const mars = byId['Mars'];
  const mercury = byId['Mercury'];
  const jupiter = byId['Jupiter'];
  const venus = byId['Venus'];
  const saturn = byId['Saturn'];

  // 1. Gaja Kesari Yoga: Jupiter in Kendra (1, 4, 7, 10) from Moon
  if (moon && jupiter) {
    const distFromMoon = ((jupiter.d1Sign - moon.d1Sign + 12) % 12) + 1;
    if ([1, 4, 7, 10].includes(distFromMoon)) {
      yogas.push({
        name: 'Gaja Kesari Yoga',
        sanskrit: 'गजकेसरी योग',
        category: 'Lunar Yoga',
        planets: ['Moon', 'Jupiter'],
        citation: 'Brihat Parashara Hora Shastra (BPHS) Ch. 36, Sloka 3–4',
        summary: `Jupiter occupies the ${distFromMoon === 1 ? '1st' : distFromMoon === 4 ? '4th' : distFromMoon === 7 ? '7th' : '10th'} Kendra from the natal Moon, conferring enduring reputation, scholarly discernment, and protective grace.`,
        strength: jupiter.dignity === 'Exalted' || jupiter.dignity === 'Own Sign' ? 'High' : 'Moderate',
      });
    }
  }

  // 2. Budhaditya Yoga: Sun and Mercury in the same Rasi
  if (sun && mercury && sun.d1Sign === mercury.d1Sign) {
    yogas.push({
      name: 'Budhaditya Nipuna Yoga',
      sanskrit: 'बुधादित्य योग',
      category: 'Solar Yoga',
      planets: ['Sun', 'Mercury'],
      citation: 'Phaladeepika Ch. 6, Sloka 29 · BPHS Ch. 36',
      summary: `Conjunction of Surya (Sun) and Budha (Mercury) in ${sun.signName} (${sun.signSanskrit}) in House ${sun.house}, bestowing analytical brilliance, mathematical skill, and authoritative articulation.`,
      strength: Math.abs(sun.activeLon - mercury.activeLon) > 3 ? 'High' : 'Moderate',
    });
  }

  // 3. Pancha Mahapurusha Yogas (Mars, Mercury, Jupiter, Venus, Saturn in Kendra in Own/Exaltation)
  const mahapurushaCandidates: {
    planet: PlanetPosition | undefined;
    yogaName: string;
    sanskrit: string;
    quality: string;
  }[] = [
    { planet: mars, yogaName: 'Ruchaka Mahapurusha Yoga', sanskrit: 'रुचक महापुरुष योग', quality: 'valorous leadership, executive decisiveness, and physical vitality' },
    { planet: mercury, yogaName: 'Bhadra Mahapurusha Yoga', sanskrit: 'भद्र महापुरुष योग', quality: 'polymathic intellect, commercial mastery, and eloquent speech' },
    { planet: jupiter, yogaName: 'Hamsa Mahapurusha Yoga', sanskrit: 'हंस महापुरुष योग', quality: 'spiritual wisdom, ethical authority, and philosophical preeminence' },
    { planet: venus, yogaName: 'Malavya Mahapurusha Yoga', sanskrit: 'मालव्य महापुरुष योग', quality: 'aesthetic refinement, artistic magnetism, and material prosperity' },
    { planet: saturn, yogaName: 'Sasa Mahapurusha Yoga', sanskrit: 'शश महापुरुष योग', quality: 'institutional command, structural discipline, and long-term sovereignty' },
  ];

  for (const item of mahapurushaCandidates) {
    const p = item.planet;
    if (
      p &&
      [1, 4, 7, 10].includes(p.house) &&
      ['Exalted', 'Moolatrikona', 'Own Sign'].includes(p.dignity)
    ) {
      yogas.push({
        name: item.yogaName,
        sanskrit: item.sanskrit,
        category: 'Mahapurusha',
        planets: [p.name],
        citation: 'Brihat Parashara Hora Shastra (BPHS) Ch. 75, Sloka 1–7',
        summary: `${p.name} (${p.sanskrit}) is ${p.dignity.toLowerCase()} in ${p.signName} within Kendra House ${p.house}, activating ${item.quality}.`,
        strength: 'High',
      });
    }
  }

  // 4. Chandra-Mangala Yoga: Moon and Mars conjoined or mutually aspecting
  if (moon && mars && (moon.d1Sign === mars.d1Sign || Math.abs(moon.d1Sign - mars.d1Sign) === 6)) {
    yogas.push({
      name: 'Chandra-Mangala Dhana Yoga',
      sanskrit: 'चन्द्र-मंगल योग',
      category: 'Dhana Yoga',
      planets: ['Moon', 'Mars'],
      citation: 'Saravali Ch. 15, Sloka 4',
      summary: 'Dynamic synergy between Chandra (Moon) and Mangala (Mars), energizing enterprising wealth creation, resourcefulness, and decisive action under pressure.',
      strength: 'Moderate',
    });
  }

  // 5. Dharma-Karmadhipati Raja Yoga (9th and 10th house/sign connection)
  const ninthSign = (ascSignIndex + 8) % 12;
  const tenthSign = (ascSignIndex + 9) % 12;
  const ninthLordName = ZODIAC_SIGNS[ninthSign].vedicRuler;
  const tenthLordName = ZODIAC_SIGNS[tenthSign].vedicRuler;
  const p9 = byId[ninthLordName];
  const p10 = byId[tenthLordName];
  if (p9 && p10 && (p9.d1Sign === p10.d1Sign || [1, 4, 5, 7, 9, 10].includes(p9.house))) {
    yogas.push({
      name: 'Dharma-Karmadhipati Raja Yoga',
      sanskrit: 'धर्म-कर्माधिपति राजयोग',
      category: 'Raja Yoga',
      planets: [ninthLordName, tenthLordName],
      citation: 'Brihat Parashara Hora Shastra (BPHS) Ch. 41, Sloka 28–31',
      summary: `Harmonic linkage of the 9th Lord of Dharma (${ninthLordName}) in House ${p9.house} and 10th Lord of Karma (${tenthLordName}) in House ${p10.house}, elevating vocational destiny and public distinction.`,
      strength: [1, 4, 5, 9, 10].includes(p10.house) ? 'High' : 'Moderate',
    });
  }

  return yogas;
}

// Vimshottari Dasha Order & Durations (Total = 120 solar years)
const VIMSHOTTARI_LORDS: { lord: string; sanskrit: string; years: number }[] = [
  { lord: 'Ketu', sanskrit: 'केतु', years: 7 },
  { lord: 'Venus', sanskrit: 'शुक्र', years: 20 },
  { lord: 'Sun', sanskrit: 'सूर्य', years: 6 },
  { lord: 'Moon', sanskrit: 'चन्द्र', years: 10 },
  { lord: 'Mars', sanskrit: 'मंगल', years: 7 },
  { lord: 'Rahu', sanskrit: 'राहु', years: 18 },
  { lord: 'Jupiter', sanskrit: 'गुरु', years: 16 },
  { lord: 'Saturn', sanskrit: 'शनि', years: 19 },
  { lord: 'Mercury', sanskrit: 'बुध', years: 17 },
];

export function calculateVimshottariDasha(
  moonSiderealLon: number,
  birthDateUTC: Date,
  referenceDateUTC: Date = new Date(),
  tzOffsetHours: number = 5.5
): MahadashaPeriod[] {
  const nakSpan = 360 / 27; // 13.333333°
  const nakIndex = Math.floor(norm360(moonSiderealLon) / nakSpan);
  const degInNak = norm360(moonSiderealLon) % nakSpan;
  const fractionRemaining = 1 - degInNak / nakSpan;

  const startLordIndex = nakIndex % 9;
  const MS_PER_YEAR = 365.2425 * 86400 * 1000;

  const fmtLocalDate = (ms: number) =>
    new Date(ms + tzOffsetHours * 3600 * 1000).toISOString().slice(0, 10);

  const mahadashas: MahadashaPeriod[] = [];
  const firstLord = VIMSHOTTARI_LORDS[startLordIndex];
  const remainingYearsAtBirth = firstLord.years * fractionRemaining;
  const elapsedYearsAtBirth = firstLord.years * (1 - fractionRemaining);

  // Compute exact Years, Months, Days of Dasha Balance at Birth
  const balYears = Math.floor(remainingYearsAtBirth);
  const remMonthsFloat = (remainingYearsAtBirth - balYears) * 12;
  const balMonths = Math.floor(remMonthsFloat);
  const balDays = Math.min(29, Math.round((remMonthsFloat - balMonths) * 30));

  let cursorMs = birthDateUTC.getTime() - elapsedYearsAtBirth * MS_PER_YEAR;
  const birthMs = birthDateUTC.getTime();
  const refMs = referenceDateUTC.getTime();

  for (let i = 0; i < 9; i++) {
    const idx = (startLordIndex + i) % 9;
    const mahaInfo = VIMSHOTTARI_LORDS[idx];
    const mahaStartMs = cursorMs;
    const mahaDurationMs = mahaInfo.years * MS_PER_YEAR;
    const mahaEndMs = mahaStartMs + mahaDurationMs;

    const antardashas: DashaSubPeriod[] = [];
    let antarCursorMs = mahaStartMs;

    for (let j = 0; j < 9; j++) {
      const antarIdx = (idx + j) % 9;
      const antarInfo = VIMSHOTTARI_LORDS[antarIdx];
      const antarYears = (mahaInfo.years * antarInfo.years) / 120;
      const antarDurationMs = antarYears * MS_PER_YEAR;
      const antarStartMs = antarCursorMs;
      const antarEndMs = antarStartMs + antarDurationMs;

      // Compute Pratyantardashas (9 sub-sub-periods)
      const pratyantardashas: DashaSubPeriod['pratyantardashas'] = [];
      let pratCursorMs = antarStartMs;
      for (let k = 0; k < 9; k++) {
        const pratIdx = (antarIdx + k) % 9;
        const pratInfo = VIMSHOTTARI_LORDS[pratIdx];
        const pratDurationMs = (antarDurationMs * pratInfo.years) / 120;
        const pratStartMs = pratCursorMs;
        const pratEndMs = pratStartMs + pratDurationMs;
        const effectivePratStartMs =
          pratEndMs > birthMs ? Math.max(birthMs, pratStartMs) : pratStartMs;
        pratyantardashas.push({
          lord: pratInfo.lord,
          startDate: fmtLocalDate(effectivePratStartMs),
          endDate: fmtLocalDate(pratEndMs),
          isCurrent: refMs >= pratStartMs && refMs < pratEndMs,
        });
        pratCursorMs = pratEndMs;
      }

      // Only clamp startDate to birthMs if the Antardasha ends AFTER birthMs (so startDate <= endDate always holds)
      const effectiveAntarStartMs =
        antarEndMs > birthMs ? Math.max(birthMs, antarStartMs) : antarStartMs;

      antardashas.push({
        lord: antarInfo.lord,
        startDate: fmtLocalDate(effectiveAntarStartMs),
        endDate: fmtLocalDate(antarEndMs),
        durationMonths: Number((antarYears * 12).toFixed(1)),
        isCurrent: refMs >= antarStartMs && refMs < antarEndMs,
        pratyantardashas,
      });

      antarCursorMs = antarEndMs;
    }

    mahadashas.push({
      lord: mahaInfo.lord,
      sanskrit: mahaInfo.sanskrit,
      years: mahaInfo.years,
      balanceYMD: i === 0 ? { years: balYears, months: balMonths, days: balDays } : undefined,
      startDate: fmtLocalDate(Math.max(birthMs, mahaStartMs)),
      endDate: fmtLocalDate(mahaEndMs),
      isCurrent: refMs >= mahaStartMs && refMs < mahaEndMs,
      antardashas,
    });

    cursorMs = mahaEndMs;
  }

  return mahadashas;
}

// Panchanga & Muhurta Calculator
const TITHI_NAMES = [
  'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
  'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
  'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima',
  'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
  'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
  'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Amavasya',
];

const NITYA_YOGAS: { name: string; meaning: string }[] = [
  { name: 'Vishkumbha', meaning: 'Supported / Pillar of Resolve' },
  { name: 'Priti', meaning: 'Affection & Harmony' },
  { name: 'Ayushman', meaning: 'Longevity & Vitality' },
  { name: 'Saubhagya', meaning: 'Good Fortune & Grace' },
  { name: 'Shobhana', meaning: 'Splendor & Radiance' },
  { name: 'Atiganda', meaning: 'Principled Obstacle' },
  { name: 'Sukarma', meaning: 'Virtuous Accomplishment' },
  { name: 'Dhriti', meaning: 'Steadfastness & Patience' },
  { name: 'Shula', meaning: 'Spear of Focus' },
  { name: 'Ganda', meaning: 'Karmic Knot' },
  { name: 'Vriddhi', meaning: 'Expansion & Growth' },
  { name: 'Dhruva', meaning: 'Fixed Polarity & Stability' },
  { name: 'Vyaghata', meaning: 'Fierce Impact' },
  { name: 'Harshana', meaning: 'Delight & Joy' },
  { name: 'Vajra', meaning: 'Diamond Thunderbolt' },
  { name: 'Siddhi', meaning: 'Perfection & Attainment' },
  { name: 'Vyatipata', meaning: 'Sudden Reversal' },
  { name: 'Variyan', meaning: 'Supreme Comfort' },
  { name: 'Parigha', meaning: 'Protective Crossbar' },
  { name: 'Shiva', meaning: 'Auspicious Benevolence' },
  { name: 'Siddha', meaning: 'Accomplished Mastery' },
  { name: 'Sadhya', meaning: 'Fulfillment of Aim' },
  { name: 'Shubha', meaning: 'Pure Auspiciousness' },
  { name: 'Shukla', meaning: 'Luminous Clarity' },
  { name: 'Brahma', meaning: 'Creator Intelligence' },
  { name: 'Indra', meaning: 'Sovereignty & Chief' },
  { name: 'Vaidhriti', meaning: 'Critical Discernment' },
];

const CHARA_KARANAS = ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Garija', 'Vanija', 'Vishti (Bhadra)'];

export function calculatePanchanga(
  dateUTC: Date,
  sunSidLon: number,
  moonSidLon: number,
  lat: number,
  lng: number,
  tzOffsetHours: number
): PanchangaData {
  // 1. Tithi: (Moon - Sun) / 12°
  const elongation = norm360(moonSidLon - sunSidLon);
  const tithiIndex = Math.floor(elongation / 12); // 0..29
  const tithiPercent = ((elongation % 12) / 12) * 100;
  const paksha = tithiIndex < 15 ? 'Shukla Paksha (Waxing)' : 'Krishna Paksha (Waning)';
  const tithiLords = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu'];

  // 2. Vara (Weekday in local time)
  const localMs = dateUTC.getTime() + tzOffsetHours * 3600 * 1000;
  const localDate = new Date(localMs);
  const dayOfWeek = localDate.getUTCDay(); // 0=Sun..6=Sat
  const varaTable = [
    { name: 'Sunday', sanskrit: 'Ravivara', lord: 'Sun' },
    { name: 'Monday', sanskrit: 'Somavara', lord: 'Moon' },
    { name: 'Tuesday', sanskrit: 'Mangalavara', lord: 'Mars' },
    { name: 'Wednesday', sanskrit: 'Budhavara', lord: 'Mercury' },
    { name: 'Thursday', sanskrit: 'Guruvara', lord: 'Jupiter' },
    { name: 'Friday', sanskrit: 'Shukravara', lord: 'Venus' },
    { name: 'Saturday', sanskrit: 'Shanivara', lord: 'Saturn' },
  ];

  // 3. Nakshatra
  const nakSpan = 360 / 27;
  const nakIdx = Math.floor(norm360(moonSidLon) / nakSpan);
  const degInNak = norm360(moonSidLon) % nakSpan;
  const pada = Math.floor(degInNak / (nakSpan / 4)) + 1;
  const nakInfo = NAKSHATRAS[nakIdx];

  // 4. Yoga: (Sun_sid + Moon_sid) / (360/27)
  const sumLon = norm360(sunSidLon + moonSidLon);
  const yogaIdx = Math.floor(sumLon / nakSpan);
  const yogaInfo = NITYA_YOGAS[yogaIdx];

  // 5. Karana: Each Tithi has 2 Karanas (6° each, 0..59)
  const karanaIdx = Math.floor(elongation / 6);
  let karanaName = 'Bava';
  let karanaType: 'Chara (Movable)' | 'Sthira (Fixed)' = 'Chara (Movable)';
  if (karanaIdx === 0) {
    karanaName = 'Kimstughna';
    karanaType = 'Sthira (Fixed)';
  } else if (karanaIdx === 57) {
    karanaName = 'Shakuni';
    karanaType = 'Sthira (Fixed)';
  } else if (karanaIdx === 58) {
    karanaName = 'Chatushpada';
    karanaType = 'Sthira (Fixed)';
  } else if (karanaIdx === 59) {
    karanaName = 'Naga';
    karanaType = 'Sthira (Fixed)';
  } else {
    karanaName = CHARA_KARANAS[(karanaIdx - 1) % 7];
  }

  // 6. Sunrise & Sunset + Muhurta Windows
  const observer = new Astronomy.Observer(lat, lng, 0);
  // Start search from local midnight in UTC
  const startOfLocalDayUTC = new Date(
    Date.UTC(localDate.getUTCFullYear(), localDate.getUTCMonth(), localDate.getUTCDate(), 0, 0, 0) -
      tzOffsetHours * 3600 * 1000
  );
  const riseEvent = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, +1, startOfLocalDayUTC, 1);
  const setEvent = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, -1, startOfLocalDayUTC, 1);

  const sunriseMs = riseEvent ? riseEvent.date.getTime() : startOfLocalDayUTC.getTime() + 6 * 3600 * 1000;
  const sunsetMs = setEvent ? setEvent.date.getTime() : startOfLocalDayUTC.getTime() + 18 * 3600 * 1000;
  const dayDurationMs = Math.max(4 * 3600 * 1000, sunsetMs - sunriseMs);
  const octantMs = dayDurationMs / 8;

  const fmtLocalTime = (ms: number) => {
    const d = new Date(ms + tzOffsetHours * 3600 * 1000);
    return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
  };

  // Rahu Kalam octant index (1-based 1..8) for Sun..Sat: [8, 2, 7, 5, 6, 4, 3]
  const rahuOctants = [8, 2, 7, 5, 6, 4, 3];
  const yamaOctants = [5, 4, 3, 2, 1, 7, 6];
  const gulikaOctants = [7, 6, 5, 4, 3, 2, 1];

  const rahuOct = rahuOctants[dayOfWeek] - 1;
  const yamaOct = yamaOctants[dayOfWeek] - 1;
  const gulikaOct = gulikaOctants[dayOfWeek] - 1;

  const solarNoonMs = sunriseMs + dayDurationMs / 2;
  const muhurtaSpanMs = dayDurationMs / 15;

  // Next Lunar Eclipse search
  const nextLunarEclipse = Astronomy.SearchLunarEclipse(dateUTC);

  return {
    tithi: {
      number: tithiIndex + 1,
      name: TITHI_NAMES[tithiIndex],
      paksha,
      lord: tithiLords[tithiIndex % 8],
      percentElapsed: Number(tithiPercent.toFixed(1)),
    },
    vara: varaTable[dayOfWeek],
    nakshatra: {
      name: nakInfo.name,
      pada,
      lord: nakInfo.ruler,
      deity: nakInfo.deity,
      gana: nakInfo.gana,
      yoni: nakInfo.yoni,
      nadi: nakInfo.nadi,
      percentElapsed: Number(((degInNak / nakSpan) * 100).toFixed(1)),
    },
    yoga: {
      number: yogaIdx + 1,
      name: yogaInfo.name,
      meaning: yogaInfo.meaning,
    },
    karana: {
      name: karanaName,
      type: karanaType,
    },
    sunTimes: {
      sunriseLocal: fmtLocalTime(sunriseMs),
      sunsetLocal: fmtLocalTime(sunsetMs),
      dayDurationHours: Number((dayDurationMs / (3600 * 1000)).toFixed(2)),
    },
    muhurtas: {
      abhijitMuhurta: `${fmtLocalTime(solarNoonMs - muhurtaSpanMs / 2)} – ${fmtLocalTime(solarNoonMs + muhurtaSpanMs / 2)}`,
      brahmaMuhurta: `${fmtLocalTime(sunriseMs - 96 * 60 * 1000)} – ${fmtLocalTime(sunriseMs - 48 * 60 * 1000)}`,
      rahuKalam: `${fmtLocalTime(sunriseMs + rahuOct * octantMs)} – ${fmtLocalTime(sunriseMs + (rahuOct + 1) * octantMs)}`,
      yamagandaKalam: `${fmtLocalTime(sunriseMs + yamaOct * octantMs)} – ${fmtLocalTime(sunriseMs + (yamaOct + 1) * octantMs)}`,
      gulikaKalam: `${fmtLocalTime(sunriseMs + gulikaOct * octantMs)} – ${fmtLocalTime(sunriseMs + (gulikaOct + 1) * octantMs)}`,
    },
    lunarPhaseAngle: Number(elongation.toFixed(1)),
    nextEclipse: {
      type: 'Lunar Eclipse',
      dateUTC: nextLunarEclipse.peak.date.toISOString().slice(0, 10),
      kind: nextLunarEclipse.kind,
    },
  };
}

// Compute Shadbala (Authentic BPHS Ch. 27 Six-Fold Planetary Strength in Virupas & Rupas)
function calculateShadbala(planets: PlanetPosition[]): ShadbalaEntry[] {
  const classicalSeven = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
  const naisargikaTable: Record<string, number> = {
    Sun: 60.0,
    Moon: 51.43,
    Venus: 42.86,
    Jupiter: 34.29,
    Mercury: 25.71,
    Mars: 17.14,
    Saturn: 8.57,
  };
  const requiredRupasTable: Record<string, number> = {
    Sun: 6.5,
    Moon: 6.0,
    Mars: 5.0,
    Mercury: 7.0,
    Jupiter: 6.5,
    Venus: 5.5,
    Saturn: 5.0,
  };
  // Deepest debilitation longitudes (Paramaneecha) per BPHS Ch. 3:
  // Sun: 190° (10° Libra), Moon: 213° (3° Scorpio), Mars: 118° (28° Cancer),
  // Mercury: 345° (15° Pisces), Jupiter: 275° (5° Capricorn), Venus: 177° (27° Virgo), Saturn: 20° (20° Aries)
  const debilitationPoint: Record<string, number> = {
    Sun: 190,
    Moon: 213,
    Mars: 118,
    Mercury: 345,
    Jupiter: 275,
    Venus: 177,
    Saturn: 20,
  };
  // Ideal Directional House (Dig Bala peak house):
  // Sun & Mars = 10th; Jupiter & Mercury = 1st; Moon & Venus = 4th; Saturn = 7th
  const digPeakHouse: Record<string, number> = {
    Sun: 10,
    Mars: 10,
    Jupiter: 1,
    Mercury: 1,
    Moon: 4,
    Venus: 4,
    Saturn: 7,
  };

  const sun = planets.find((p) => p.id === 'Sun')!;
  const moon = planets.find((p) => p.id === 'Moon')!;
  const jupiter = planets.find((p) => p.id === 'Jupiter')!;
  const venus = planets.find((p) => p.id === 'Venus')!;
  const mars = planets.find((p) => p.id === 'Mars')!;
  const saturn = planets.find((p) => p.id === 'Saturn')!;

  const elongation = norm360(moon.siderealLon - sun.siderealLon);
  const pakshaAngle = elongation > 180 ? 360 - elongation : elongation; // 0..180

  return classicalSeven.map((pId) => {
    const p = planets.find((item) => item.id === pId)!;

    // 1. Sthana Bala (Uchcha Bala + Saptavargaja Bala + Ojhayugma + Kendradi + Drekkana)
    const rawUchchaDiff = Math.abs(p.siderealLon - debilitationPoint[pId]);
    const uchchaArc = rawUchchaDiff > 180 ? 360 - rawUchchaDiff : rawUchchaDiff;
    const uchchaBala = uchchaArc / 3; // 0 to 60 Virupas

    const saptavargaScore = [p.d1Sign, p.d2Sign, p.d3Sign, p.d7Sign, p.d9Sign, p.d12Sign, p.d30Sign].reduce(
      (acc, vSign) => {
        const dig = getPlanetaryDignity(pId, vSign, 15);
        if (dig === 'Exalted' || dig === 'Moolatrikona') return acc + 22;
        if (dig === 'Own Sign') return acc + 18;
        if (dig === 'Friendly') return acc + 12;
        if (dig === 'Neutral') return acc + 8;
        return acc + 4;
      },
      0
    );

    const isFemaleOrLunar = pId === 'Moon' || pId === 'Venus';
    const ojhaBala =
      (isFemaleOrLunar ? (p.d1Sign % 2 === 1 ? 15 : 0) : p.d1Sign % 2 === 0 ? 15 : 0) +
      (isFemaleOrLunar ? (p.d9Sign % 2 === 1 ? 15 : 0) : p.d9Sign % 2 === 0 ? 15 : 0);

    const kendradiBala = [1, 4, 7, 10].includes(p.house)
      ? 60
      : [2, 5, 8, 11].includes(p.house)
        ? 30
        : 15;

    const drekkanaPart = Math.floor(p.degreeInSign / 10);
    const drekkanaBala =
      (['Sun', 'Mars', 'Jupiter'].includes(pId) && drekkanaPart === 0) ||
      (['Mercury', 'Saturn'].includes(pId) && drekkanaPart === 1) ||
      (['Moon', 'Venus'].includes(pId) && drekkanaPart === 2)
        ? 15
        : 0;

    const sthanaBala = Number(
      (uchchaBala + saptavargaScore + ojhaBala + kendradiBala + drekkanaBala).toFixed(1)
    );

    // 2. Dig Bala (Directional strength: max 60 virupas at peak house, 0 at opposite house)
    const peakH = digPeakHouse[pId];
    const houseDiff = Math.min(Math.abs(p.house - peakH), 12 - Math.abs(p.house - peakH));
    const digBala = Number(((6 - houseDiff) * 10).toFixed(1));

    // 3. Kala Bala (Paksha Bala + Ayana Bala + Nathonnatha + Masa/Vara/Hora Bala)
    const isBenefic = ['Jupiter', 'Venus', 'Mercury', 'Moon'].includes(pId);
    const pakshaBala = isBenefic ? pakshaAngle / 3 : (180 - pakshaAngle) / 3;
    const ayanaBala = Math.max(10, Math.min(60, 30 + p.declination * 1.25));
    const nathonnathaBala = pId === 'Mercury' ? 60 : [7, 8, 9, 10, 11, 12].includes(sun.house) ? 45 : 35;
    const kalaBala = Number((pakshaBala + ayanaBala + nathonnathaBala + 22).toFixed(1));

    // 4. Cheshta Bala (Motional / Retrograde / Ayana / Paksha strength per BPHS)
    const cheshtaBala = Number(
      (pId === 'Sun'
        ? ayanaBala
        : pId === 'Moon'
          ? pakshaBala
          : p.isRetrograde
            ? 60.0
            : 32.0 + Math.min(26, Math.abs(p.speedDegPerDay) * 14)).toFixed(1)
    );

    // 5. Naisargika Bala (Natural fixed luminosity strength)
    const naisargikaBala = naisargikaTable[pId];

    // 6. Drik Bala (Aspectual strength from Benefics vs Malefics)
    let drikScore = 0;
    const benefics = [jupiter, venus];
    const malefics = [mars, saturn, sun];
    for (const b of benefics) {
      if (b.id === pId) continue;
      const dist = ((p.d1Sign - b.d1Sign + 12) % 12) + 1;
      if (dist === 7 || (b.id === 'Jupiter' && (dist === 5 || dist === 9))) drikScore += 15;
    }
    for (const m of malefics) {
      if (m.id === pId) continue;
      const dist = ((p.d1Sign - m.d1Sign + 12) % 12) + 1;
      if (
        dist === 7 ||
        (m.id === 'Mars' && (dist === 4 || dist === 8)) ||
        (m.id === 'Saturn' && (dist === 3 || dist === 10))
      ) {
        drikScore -= 12;
      }
    }
    const drikBala = Number(drikScore.toFixed(1));

    const totalVirupas = Number(
      (sthanaBala + digBala + kalaBala + cheshtaBala + naisargikaBala + drikBala).toFixed(1)
    );
    const totalRupas = Number((totalVirupas / 60).toFixed(2));
    const requiredRupas = requiredRupasTable[pId];
    const ratio = Number((totalRupas / requiredRupas).toFixed(2));

    return {
      planet: p.name,
      sanskrit: p.sanskrit,
      sthanaBala,
      digBala,
      kalaBala,
      cheshtaBala,
      naisargikaBala,
      drikBala,
      totalVirupas,
      totalRupas,
      requiredRupas,
      ratio,
      status: ratio >= 1.15 ? 'Dominant' : ratio >= 0.95 ? 'Sufficient' : 'Under-Powered',
    };
  });
}

// Compute Ashtakavarga (Bhinna & Sarvashtakavarga 12-Sign Matrix)
function calculateAshtakavarga(planets: PlanetPosition[], ascSignIndex: number): AshtakavargaGrid {
  const classicalSeven = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
  const bhinnashtakavarga: Record<string, number[]> = {};
  const sarvashtakavarga = new Array(12).fill(0);

  // Classical Parashari benefic house offsets from each reference factor
  const offsetsByPlanet: Record<string, number[][]> = {
    Sun: [
      [1, 2, 4, 7, 8, 9, 10, 11],
      [3, 6, 10, 11],
      [1, 2, 4, 7, 8, 9, 10, 11],
      [3, 5, 6, 9, 10, 11, 12],
      [5, 6, 9, 11],
      [6, 7, 12],
      [1, 2, 4, 7, 8, 9, 10, 11],
      [3, 4, 6, 10, 11, 12],
    ],
    Moon: [
      [3, 6, 7, 8, 10, 11],
      [1, 3, 6, 7, 10, 11],
      [2, 3, 5, 6, 9, 10, 11],
      [1, 3, 4, 5, 7, 8, 10, 11],
      [1, 4, 7, 8, 10, 11, 12],
      [3, 4, 5, 7, 9, 10, 11],
      [3, 5, 6, 11],
      [3, 6, 10, 11],
    ],
    Mars: [
      [3, 5, 6, 10, 11],
      [3, 6, 11],
      [1, 2, 4, 7, 8, 10, 11],
      [3, 5, 6, 11],
      [6, 10, 11, 12],
      [6, 8, 11, 12],
      [1, 4, 7, 8, 9, 10, 11],
      [1, 3, 6, 10, 11],
    ],
    Mercury: [
      [5, 6, 9, 11, 12],
      [2, 4, 6, 8, 10, 11],
      [1, 2, 4, 7, 8, 9, 10, 11],
      [1, 3, 5, 6, 9, 10, 11, 12],
      [6, 8, 11, 12],
      [1, 2, 3, 4, 5, 8, 9, 11],
      [1, 2, 4, 7, 8, 9, 10, 11],
      [1, 2, 4, 6, 8, 10, 11],
    ],
    Jupiter: [
      [1, 2, 3, 4, 7, 8, 9, 10, 11],
      [2, 5, 7, 9, 11],
      [1, 2, 4, 7, 8, 10, 11],
      [1, 2, 4, 5, 6, 9, 10, 11],
      [1, 2, 3, 4, 7, 8, 10, 11],
      [2, 5, 6, 9, 10, 11],
      [3, 5, 6, 12],
      [1, 2, 4, 5, 6, 7, 9, 10, 11],
    ],
    Venus: [
      [8, 11, 12],
      [1, 2, 3, 4, 5, 8, 9, 11, 12],
      [3, 5, 6, 9, 11, 12],
      [3, 5, 6, 9, 11],
      [5, 8, 9, 10, 11],
      [1, 2, 3, 4, 5, 8, 9, 10, 11],
      [3, 4, 5, 8, 9, 10, 11],
      [1, 2, 3, 4, 5, 8, 9, 11],
    ],
    Saturn: [
      [1, 2, 4, 7, 8, 10, 11],
      [3, 6, 11],
      [3, 5, 6, 10, 11, 12],
      [6, 8, 9, 10, 11, 12],
      [5, 6, 11, 12],
      [6, 11, 12],
      [3, 5, 6, 11],
      [1, 3, 4, 6, 10, 11],
    ],
  };

  const refSigns = [
    ...classicalSeven.map((id) => planets.find((p) => p.id === id)?.d1Sign ?? 0),
    ascSignIndex,
  ];

  for (const pName of classicalSeven) {
    const row = new Array(12).fill(0);
    const rules = offsetsByPlanet[pName];
    for (let rIdx = 0; rIdx < 8; rIdx++) {
      const baseSign = refSigns[rIdx];
      for (const offset of rules[rIdx]) {
        const targetSign = (baseSign + offset - 1) % 12;
        row[targetSign] += 1;
      }
    }
    bhinnashtakavarga[pName] = row;
    for (let s = 0; s < 12; s++) {
      sarvashtakavarga[s] += row[s];
    }
  }

  const totalBindus = sarvashtakavarga.reduce((acc, v) => acc + v, 0);
  return {
    bhinnashtakavarga,
    sarvashtakavarga,
    totalBindus,
  };
}

// Compute Aspects between a list of planets
export function calculateAspects(planets: PlanetPosition[]): AspectItem[] {
  const aspectDefs: {
    type: AspectItem['type'];
    symbol: string;
    angle: number;
    maxOrb: number;
    nature: AspectItem['nature'];
  }[] = [
    { type: 'Conjunction', symbol: '☌', angle: 0, maxOrb: 8, nature: 'Fused' },
    { type: 'Sextile', symbol: '⚹', angle: 60, maxOrb: 5, nature: 'Harmonious' },
    { type: 'Square', symbol: '□', angle: 90, maxOrb: 7, nature: 'Dynamic' },
    { type: 'Trine', symbol: '△', angle: 120, maxOrb: 7, nature: 'Harmonious' },
    { type: 'Quincunx', symbol: '⚻', angle: 150, maxOrb: 3, nature: 'Adjustment' },
    { type: 'Opposition', symbol: '☍', angle: 180, maxOrb: 8, nature: 'Dynamic' },
  ];

  const results: AspectItem[] = [];
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const p1 = planets[i];
      const p2 = planets[j];
      // Skip Rahu-Ketu automatic opposition
      if ((p1.id === 'Rahu' && p2.id === 'Ketu') || (p1.id === 'Ketu' && p2.id === 'Rahu')) {
        continue;
      }
      const diff = Math.abs(p1.activeLon - p2.activeLon);
      const sep = diff > 180 ? 360 - diff : diff;

      for (const def of aspectDefs) {
        const orb = Math.abs(sep - def.angle);
        if (orb <= def.maxOrb) {
          results.push({
            planet1: p1.name,
            glyph1: p1.glyph,
            planet2: p2.name,
            glyph2: p2.glyph,
            type: def.type,
            symbol: def.symbol,
            exactAngle: def.angle,
            actualSeparation: Number(sep.toFixed(2)),
            orb: Number(orb.toFixed(2)),
            applying: p1.speedDegPerDay > p2.speedDegPerDay,
            nature: def.nature,
          });
          break;
        }
      }
    }
  }
  return results.sort((a, b) => a.orb - b.orb);
}

// Compute Hermetic / Arabic Lots
function calculateArabicLots(
  ascLon: number,
  planets: PlanetPosition[],
  houses: HouseCusp[]
): ArabicLot[] {
  const byId = Object.fromEntries(planets.map((p) => [p.id, p]));
  const sun = byId['Sun']?.activeLon ?? 0;
  const moon = byId['Moon']?.activeLon ?? 0;
  const mercury = byId['Mercury']?.activeLon ?? 0;
  const venus = byId['Venus']?.activeLon ?? 0;
  const mars = byId['Mars']?.activeLon ?? 0;
  const jupiter = byId['Jupiter']?.activeLon ?? 0;
  const saturn = byId['Saturn']?.activeLon ?? 0;

  // Day chart if Sun is in Houses 7..12
  const isDayChart = (byId['Sun']?.house ?? 1) >= 7;

  const fortuneLon = norm360(isDayChart ? ascLon + moon - sun : ascLon + sun - moon);
  const spiritLon = norm360(isDayChart ? ascLon + sun - moon : ascLon + moon - sun);
  const erosLon = norm360(isDayChart ? ascLon + venus - spiritLon : ascLon + spiritLon - venus);
  const victoryLon = norm360(isDayChart ? ascLon + jupiter - spiritLon : ascLon + spiritLon - jupiter);
  const courageLon = norm360(isDayChart ? ascLon + fortuneLon - mars : ascLon + mars - fortuneLon);
  const necessityLon = norm360(isDayChart ? ascLon + fortuneLon - mercury : ascLon + mercury - fortuneLon);
  const nemesisLon = norm360(isDayChart ? ascLon + fortuneLon - saturn : ascLon + saturn - fortuneLon);

  const rawLots = [
    {
      name: 'Lot of Fortune (Pars Fortunae)',
      greekName: 'Klēros Tychēs',
      formula: isDayChart ? 'Asc + Moon − Sun (Diurnal)' : 'Asc + Sun − Moon (Nocturnal)',
      lon: fortuneLon,
      meaning: 'Physical embodiment, material circumstances, and Lunar receptivity.',
    },
    {
      name: 'Lot of Spirit (Pars Spiritus)',
      greekName: 'Klēros Daimonos',
      formula: isDayChart ? 'Asc + Sun − Moon (Diurnal)' : 'Asc + Moon − Sun (Nocturnal)',
      lon: spiritLon,
      meaning: 'Intentional will, vocation, conscious agency, and Solar direction.',
    },
    {
      name: 'Lot of Eros',
      greekName: 'Klēros Erōtos',
      formula: 'Asc ± (Venus − Spirit)',
      lon: erosLon,
      meaning: 'Magnetic desire, relational bonding, and shared aesthetic devotion.',
    },
    {
      name: 'Lot of Victory (Nike)',
      greekName: 'Klēros Nikēs',
      formula: 'Asc ± (Jupiter − Spirit)',
      lon: victoryLon,
      meaning: 'Triumph, faith, Breakthrough enterprise, and Jovian beneficence.',
    },
    {
      name: 'Lot of Courage (Tolma)',
      greekName: 'Klēros Tolmēs',
      formula: 'Asc ± (Fortune − Mars)',
      lon: courageLon,
      meaning: 'Daring, martial initiative, resilience, and bold action.',
    },
    {
      name: 'Lot of Necessity (Ananke)',
      greekName: 'Klēros Anankēs',
      formula: 'Asc ± (Fortune − Mercury)',
      lon: necessityLon,
      meaning: 'Binding obligations, intellectual discipline, and karmic constraints.',
    },
    {
      name: 'Lot of Nemesis',
      greekName: 'Klēros Nemeseōs',
      formula: 'Asc ± (Fortune − Saturn)',
      lon: nemesisLon,
      meaning: 'Hidden reckonings, endurance tests, and Saturnian mastery.',
    },
  ];

  return rawLots.map((lot) => {
    const signIdx = Math.floor(lot.lon / 30);
    const sign = ZODIAC_SIGNS[signIdx];
    const degInSign = lot.lon % 30;
    return {
      name: lot.name,
      greekName: lot.greekName,
      formula: lot.formula,
      longitude: Number(lot.lon.toFixed(2)),
      signName: sign.name,
      signGlyph: sign.glyph,
      formattedDMS: formatDMS(degInSign),
      house: findHouseForLongitude(lot.lon, houses),
      meaning: lot.meaning,
    };
  });
}

// Compute Midpoint Cosmobiology Tree
function calculateMidpoints(planets: PlanetPosition[]): MidpointActivation[] {
  const corePairs: [string, string, string][] = [
    ['Sun', 'Moon', 'Core synthesis of conscious purpose and emotional instinct'],
    ['Venus', 'Mars', 'Creative passion, relational magnetism, and artistic drive'],
    ['Mercury', 'Jupiter', 'Expansive intellect, publishing, and strategic synthesis'],
    ['Sun', 'Jupiter', 'Vitality, honor, leadership, and philosophical optimism'],
    ['Moon', 'Venus', 'Affectionate grace, domestic harmony, and aesthetic sensitivity'],
    ['Mars', 'Saturn', 'Focused endurance, disciplined execution, and structural grit'],
    ['Jupiter', 'Saturn', 'Institutional architecture, historical timing, and dharma'],
    ['Mercury', 'Uranus', 'Sudden intuition, scientific invention, and rapid calculation'],
  ];

  const byId = Object.fromEntries(planets.map((p) => [p.id, p]));
  const activations: MidpointActivation[] = [];

  for (const [id1, id2, theme] of corePairs) {
    const p1 = byId[id1];
    const p2 = byId[id2];
    if (!p1 || !p2) continue;

    // Shortest arc midpoint
    let diff = p2.activeLon - p1.activeLon;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    const midLon = norm360(p1.activeLon + diff / 2);
    const sign = ZODIAC_SIGNS[Math.floor(midLon / 30)];

    // Find closest planet in 90° Cosmobiology Dial (0°, 45°, 90°, 180°)
    let bestPlanet = planets[0];
    let bestOrb = 999;
    let bestContact: MidpointActivation['contactType'] = 'Direct Conjunct';

    for (const candidate of planets) {
      if (candidate.id === id1 || candidate.id === id2) continue;
      const rawSep = Math.abs(candidate.activeLon - midLon);
      const sep = rawSep > 180 ? 360 - rawSep : rawSep;

      const checks: { angle: number; type: MidpointActivation['contactType'] }[] = [
        { angle: 0, type: 'Direct Conjunct' },
        { angle: 45, type: 'Semi-Square / Octile (45°)' },
        { angle: 90, type: 'Square (90°)' },
        { angle: 135, type: 'Semi-Square / Octile (45°)' },
        { angle: 180, type: 'Opposition (180°)' },
      ];

      for (const c of checks) {
        const orb = Math.abs(sep - c.angle);
        if (orb < bestOrb) {
          bestOrb = orb;
          bestPlanet = candidate;
          bestContact = c.type;
        }
      }
    }

    activations.push({
      pair: `${p1.glyph} ${p1.name} / ${p2.glyph} ${p2.name}`,
      midpointLon: Number(midLon.toFixed(2)),
      midpointDMS: `${sign.glyph} ${formatDMS(midLon % 30)}`,
      signGlyph: sign.glyph,
      activatingPlanet: `${bestPlanet.glyph} ${bestPlanet.name}`,
      orb: Number(bestOrb.toFixed(2)),
      contactType: bestContact,
      interpretation: theme,
    });
  }

  return activations.sort((a, b) => a.orb - b.orb);
}

// Compute Royal & Major Fixed Star Contacts
function calculateFixedStars(
  planets: PlanetPosition[],
  ayanamsaDeg: number,
  useSidereal: boolean
): FixedStarContact[] {
  // J2000 Tropical longitudes of major fixed stars + precession adjustment
  const catalog = [
    { name: 'Regulus', designation: 'α Leonis', constellation: 'Leo', mag: 1.35, j2000TropLon: 149.83, nature: 'Mars–Jupiter', significance: 'Royal Star of the North — sovereignty, high office, and magnanimity.' },
    { name: 'Spica (Chitra)', designation: 'α Virginis', constellation: 'Virgo', mag: 0.97, j2000TropLon: 203.84, nature: 'Venus–Mars', significance: 'Unbounded brilliance in science, art, and scholarly protection.' },
    { name: 'Aldebaran (Rohini)', designation: 'α Tauri', constellation: 'Taurus', mag: 0.85, j2000TropLon: 69.79, nature: 'Mars', significance: 'Royal Star of the East —eloquence, courage, and steadfast integrity.' },
    { name: 'Antares (Jyeshtha)', designation: 'α Scorpii', constellation: 'Scorpio', mag: 1.09, j2000TropLon: 249.76, nature: 'Mars–Jupiter', significance: 'Royal Star of the West — strategic intensity, fearlessness, and depth.' },
    { name: 'Fomalhaut', designation: 'α Piscis Austrini', constellation: 'Piscis Austrinus', mag: 1.16, j2000TropLon: 333.87, nature: 'Venus–Mercury', significance: 'Royal Star of the South — visionary ideals and charismatic legacy.' },
    { name: 'Sirius (Lubdhaka)', designation: 'α Canis Majoris', constellation: 'Canis Major', mag: -1.46, j2000TropLon: 104.08, nature: 'Jupiter–Mars', significance: 'Custodian of sacred renown, extraordinary ambition, and guardianship.' },
    { name: 'Arcturus (Swati)', designation: 'α Boötis', constellation: 'Boötes', mag: -0.05, j2000TropLon: 204.23, nature: 'Mars–Jupiter', significance: 'Pathfinder star of navigation, pioneering justice, and enterprise.' },
    { name: 'Vega (Abhijit)', designation: 'α Lyrae', constellation: 'Lyra', mag: 0.03, j2000TropLon: 285.32, nature: 'Venus–Mercury', significance: 'Poetic enchantment, harmonic mastery, and statesmanship.' },
    { name: 'Algol', designation: 'β Persei', constellation: 'Perseus', mag: 2.12, j2000TropLon: 56.17, nature: 'Saturn–Jupiter', significance: 'Unflinching confrontation with primordial power and transformation.' },
    { name: 'Alcyone (Krittika)', designation: 'η Tauri', constellation: 'Taurus', mag: 2.87, j2000TropLon: 60.00, nature: 'Moon–Mars', significance: 'Central star of the Pleiades — contemplative acuity and illumination.' },
  ];

  const contacts: FixedStarContact[] = [];
  for (const star of catalog) {
    // Current tropical longitude ~ j2000 + (ayanamsa - 23.857)
    const starTrop = norm360(star.j2000TropLon + (ayanamsaDeg - 23.857));
    const starActive = useSidereal ? norm360(starTrop - ayanamsaDeg) : starTrop;

    // Find closest planet
    let closestPlanet = planets[0];
    let minOrb = 999;
    for (const p of planets) {
      const diff = Math.abs(p.activeLon - starActive);
      const sep = diff > 180 ? 360 - diff : diff;
      if (sep < minOrb) {
        minOrb = sep;
        closestPlanet = p;
      }
    }

    if (minOrb <= 6.5) {
      contacts.push({
        starName: star.name,
        designation: star.designation,
        constellation: star.constellation,
        magnitude: star.mag,
        starLon: Number(starActive.toFixed(2)),
        planet: `${closestPlanet.glyph} ${closestPlanet.name}`,
        orb: Number(minOrb.toFixed(2)),
        ptolemaicNature: star.nature,
        significance: star.significance,
      });
    }
  }

  // Ensure at least top 4 closest stars are shown if fewer than 4 are within 6.5°
  if (contacts.length < 4) {
    for (const star of catalog) {
      if (contacts.some((c) => c.starName === star.name)) continue;
      const starTrop = norm360(star.j2000TropLon + (ayanamsaDeg - 23.857));
      const starActive = useSidereal ? norm360(starTrop - ayanamsaDeg) : starTrop;
      let closestPlanet = planets[0];
      let minOrb = 999;
      for (const p of planets) {
        const diff = Math.abs(p.activeLon - starActive);
        const sep = diff > 180 ? 360 - diff : diff;
        if (sep < minOrb) {
          minOrb = sep;
          closestPlanet = p;
        }
      }
      contacts.push({
        starName: star.name,
        designation: star.designation,
        constellation: star.constellation,
        magnitude: star.mag,
        starLon: Number(starActive.toFixed(2)),
        planet: `${closestPlanet.glyph} ${closestPlanet.name}`,
        orb: Number(minOrb.toFixed(2)),
        ptolemaicNature: star.nature,
        significance: star.significance,
      });
      if (contacts.length >= 5) break;
    }
  }

  return contacts.sort((a, b) => a.orb - b.orb);
}

// Primary Entry Point: Calculate Full Natal / Horoscope Chart
export function calculateChart(
  input: BirthInput,
  tradition: ZodiacTradition = 'vedic'
): CompleteChartResult {
  const useSidereal = tradition === 'vedic';
  const dateUTC = birthInputToUTCDate(input);
  const datePlus2h = new Date(dateUTC.getTime() + 2 * 3600 * 1000);
  const jd = Number((dateUTC.getTime() / 86400000 + 2440587.5).toFixed(5));

  const ayanamsaDeg = calculateAyanamsa(dateUTC, input.ayanamsa);
  const { tropicalAsc, siderealAsc, tropicalMC, siderealMC, houses } = calculateAnglesAndHouses(
    dateUTC,
    input.lat,
    input.lng,
    ayanamsaDeg,
    input.houseSystem,
    useSidereal
  );

  const bodyCatalog: {
    id: string;
    name: string;
    sanskrit: string;
    glyph: string;
    astroBody?: Astronomy.Body;
  }[] = [
    { id: 'Sun', name: 'Sun', sanskrit: 'Surya', glyph: '☉', astroBody: Astronomy.Body.Sun },
    { id: 'Moon', name: 'Moon', sanskrit: 'Chandra', glyph: '☽', astroBody: Astronomy.Body.Moon },
    { id: 'Mercury', name: 'Mercury', sanskrit: 'Budha', glyph: '☿', astroBody: Astronomy.Body.Mercury },
    { id: 'Venus', name: 'Venus', sanskrit: 'Shukra', glyph: '♀', astroBody: Astronomy.Body.Venus },
    { id: 'Mars', name: 'Mars', sanskrit: 'Mangala', glyph: '♂', astroBody: Astronomy.Body.Mars },
    { id: 'Jupiter', name: 'Jupiter', sanskrit: 'Guru', glyph: '♃', astroBody: Astronomy.Body.Jupiter },
    { id: 'Saturn', name: 'Saturn', sanskrit: 'Shani', glyph: '♄', astroBody: Astronomy.Body.Saturn },
    { id: 'Uranus', name: 'Uranus', sanskrit: 'Aruna', glyph: '♅', astroBody: Astronomy.Body.Uranus },
    { id: 'Neptune', name: 'Neptune', sanskrit: 'Varuna', glyph: '♆', astroBody: Astronomy.Body.Neptune },
    { id: 'Pluto', name: 'Pluto', sanskrit: 'Yama', glyph: '♇', astroBody: Astronomy.Body.Pluto },
    { id: 'Rahu', name: 'North Node', sanskrit: 'Rahu', glyph: '☊' },
    { id: 'Ketu', name: 'South Node', sanskrit: 'Ketu', glyph: '☋' },
    { id: 'Chiron', name: 'Chiron', sanskrit: 'Kiron', glyph: '⚷' },
  ];

  const supp1 = computeSupplementalBodies(dateUTC);
  const supp2 = computeSupplementalBodies(datePlus2h);

  const planets: PlanetPosition[] = bodyCatalog.map((b) => {
    let tropLon = 0;
    let lat = 0;
    let dec = 0;
    let speed = 0;

    if (b.astroBody !== undefined) {
      const pos1 = computeBodyEcliptic(b.astroBody, dateUTC);
      const pos2 = computeBodyEcliptic(b.astroBody, datePlus2h);
      tropLon = pos1.lon;
      lat = pos1.lat;
      dec = pos1.dec;
      let delta = pos2.lon - pos1.lon;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;
      speed = delta * 12; // 2 hours * 12 = 24 hours
    } else if (b.id === 'Rahu') {
      tropLon = supp1.rahuLon;
      speed = -0.05295;
      dec = 23.44 * Math.sin((tropLon * Math.PI) / 180);
    } else if (b.id === 'Ketu') {
      tropLon = supp1.ketuLon;
      speed = -0.05295;
      dec = 23.44 * Math.sin((tropLon * Math.PI) / 180);
    } else if (b.id === 'Chiron') {
      tropLon = supp1.chironLon;
      let delta = supp2.chironLon - supp1.chironLon;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;
      speed = delta * 12;
      dec = 18.2 * Math.sin((tropLon * Math.PI) / 180);
    }

    const sidLon = norm360(tropLon - ayanamsaDeg);
    const activeLon = useSidereal ? sidLon : tropLon;
    const signIndex = Math.floor(activeLon / 30);
    const sign = ZODIAC_SIGNS[signIndex];
    const degreeInSign = activeLon % 30;

    // Nakshatra is always computed from Sidereal longitude
    const nakSpan = 360 / 27;
    const nakIdx = Math.floor(sidLon / nakSpan);
    const nakDeg = sidLon % nakSpan;
    const pada = Math.floor(nakDeg / (nakSpan / 4)) + 1;
    const nak = NAKSHATRAS[nakIdx];

    const ascSignIdxForHouse = Math.floor((useSidereal ? siderealAsc : tropicalAsc) / 30);
    const house =
      input.houseSystem === 'whole_sign'
        ? ((signIndex - ascSignIdxForHouse + 12) % 12) + 1
        : findHouseForLongitude(activeLon, houses);

    return {
      id: b.id,
      name: b.name,
      sanskrit: b.sanskrit,
      glyph: b.glyph,
      tropicalLon: Number(tropLon.toFixed(4)),
      siderealLon: Number(sidLon.toFixed(4)),
      activeLon: Number(activeLon.toFixed(4)),
      lat: Number(lat.toFixed(3)),
      declination: Number(dec.toFixed(2)),
      isOutOfBounds: Math.abs(dec) > 23.4393,
      speedDegPerDay: Number(speed.toFixed(4)),
      isRetrograde: speed < 0,
      signIndex,
      signName: sign.name,
      signSanskrit: sign.sanskrit,
      signGlyph: sign.glyph,
      degreeInSign: Number(degreeInSign.toFixed(4)),
      formattedDMS: formatDMS(degreeInSign),
      house,
      dignity: getPlanetaryDignity(b.id, signIndex, degreeInSign),
      nakshatra: nak.name,
      nakshatraLord: nak.ruler,
      nakshatraDeity: nak.deity,
      pada,
      d1Sign: Math.floor(sidLon / 30),
      d2Sign: calculateVargaSign(sidLon, 'D2'),
      d3Sign: calculateVargaSign(sidLon, 'D3'),
      d4Sign: calculateVargaSign(sidLon, 'D4'),
      d7Sign: calculateVargaSign(sidLon, 'D7'),
      d9Sign: calculateVargaSign(sidLon, 'D9'),
      d10Sign: calculateVargaSign(sidLon, 'D10'),
      d12Sign: calculateVargaSign(sidLon, 'D12'),
      d16Sign: calculateVargaSign(sidLon, 'D16'),
      d20Sign: calculateVargaSign(sidLon, 'D20'),
      d24Sign: calculateVargaSign(sidLon, 'D24'),
      d27Sign: calculateVargaSign(sidLon, 'D27'),
      d30Sign: calculateVargaSign(sidLon, 'D30'),
      d40Sign: calculateVargaSign(sidLon, 'D40'),
      d45Sign: calculateVargaSign(sidLon, 'D45'),
      d60Sign: calculateVargaSign(sidLon, 'D60'),
    };
  });

  // Ascendant details
  const activeAsc = useSidereal ? siderealAsc : tropicalAsc;
  const ascSignIdx = Math.floor(activeAsc / 30);
  const ascSign = ZODIAC_SIGNS[ascSignIdx];
  const ascNakIdx = Math.floor(siderealAsc / (360 / 27));
  const ascPada = Math.floor((siderealAsc % (360 / 27)) / (360 / 108)) + 1;

  // Midheaven details
  const activeMC = useSidereal ? siderealMC : tropicalMC;
  const mcSignIdx = Math.floor(activeMC / 30);
  const mcSign = ZODIAC_SIGNS[mcSignIdx];

  const sunPlanet = planets.find((p) => p.id === 'Sun')!;
  const moonPlanet = planets.find((p) => p.id === 'Moon')!;

  const aspects = calculateAspects(planets);
  const vedicYogas = detectVedicYogas(planets, Math.floor(siderealAsc / 30));
  const dashas = calculateVimshottariDasha(
    moonPlanet.siderealLon,
    dateUTC,
    new Date(),
    input.tzOffsetHours
  );
  const panchanga = calculatePanchanga(
    dateUTC,
    sunPlanet.siderealLon,
    moonPlanet.siderealLon,
    input.lat,
    input.lng,
    input.tzOffsetHours
  );
  const shadbala = calculateShadbala(planets);
  const ashtakavarga = calculateAshtakavarga(planets, Math.floor(siderealAsc / 30));
  const arabicLots = calculateArabicLots(activeAsc, planets, houses);
  const midpoints = calculateMidpoints(planets);
  const fixedStars = calculateFixedStars(planets, ayanamsaDeg, useSidereal);

  return {
    input,
    utcIso: dateUTC.toISOString(),
    julianDay: jd,
    ayanamsaDeg: Number(ayanamsaDeg.toFixed(4)),
    ayanamsaFormatted: formatDMS(ayanamsaDeg),
    ascendant: {
      tropicalLon: Number(tropicalAsc.toFixed(4)),
      siderealLon: Number(siderealAsc.toFixed(4)),
      activeLon: Number(activeAsc.toFixed(4)),
      signIndex: ascSignIdx,
      signName: ascSign.name,
      signSanskrit: ascSign.sanskrit,
      signGlyph: ascSign.glyph,
      formattedDMS: formatDMS(activeAsc % 30),
      nakshatra: NAKSHATRAS[ascNakIdx].name,
      pada: ascPada,
      d2Sign: calculateVargaSign(siderealAsc, 'D2'),
      d3Sign: calculateVargaSign(siderealAsc, 'D3'),
      d4Sign: calculateVargaSign(siderealAsc, 'D4'),
      d7Sign: calculateVargaSign(siderealAsc, 'D7'),
      d9Sign: calculateVargaSign(siderealAsc, 'D9'),
      d10Sign: calculateVargaSign(siderealAsc, 'D10'),
      d12Sign: calculateVargaSign(siderealAsc, 'D12'),
      d16Sign: calculateVargaSign(siderealAsc, 'D16'),
      d20Sign: calculateVargaSign(siderealAsc, 'D20'),
      d24Sign: calculateVargaSign(siderealAsc, 'D24'),
      d27Sign: calculateVargaSign(siderealAsc, 'D27'),
      d30Sign: calculateVargaSign(siderealAsc, 'D30'),
      d40Sign: calculateVargaSign(siderealAsc, 'D40'),
      d45Sign: calculateVargaSign(siderealAsc, 'D45'),
      d60Sign: calculateVargaSign(siderealAsc, 'D60'),
    },
    midheaven: {
      tropicalLon: Number(tropicalMC.toFixed(4)),
      siderealLon: Number(siderealMC.toFixed(4)),
      activeLon: Number(activeMC.toFixed(4)),
      signIndex: mcSignIdx,
      signName: mcSign.name,
      signGlyph: mcSign.glyph,
      formattedDMS: formatDMS(activeMC % 30),
    },
    planets,
    houses,
    aspects,
    vedicYogas,
    dashas,
    panchanga,
    shadbala,
    ashtakavarga,
    arabicLots,
    midpoints,
    fixedStars,
  };
}

// Synastry & Vedic Kundali Milan (Ashta Koota 36-Guna) Comparison Engine
export function calculateSynastryComparison(
  inputA: BirthInput,
  inputB: BirthInput,
  tradition: ZodiacTradition = 'vedic'
): SynastryComparisonResult {
  const chartA = calculateChart(inputA, tradition);
  const chartB = calculateChart(inputB, tradition);

  // 1. Inter-chart Western & Vedic Aspects
  const interAspects: AspectItem[] = [];
  const aspectDefs: {
    type: AspectItem['type'];
    symbol: string;
    angle: number;
    maxOrb: number;
    nature: AspectItem['nature'];
  }[] = [
    { type: 'Conjunction', symbol: '☌', angle: 0, maxOrb: 7, nature: 'Fused' },
    { type: 'Sextile', symbol: '⚹', angle: 60, maxOrb: 5, nature: 'Harmonious' },
    { type: 'Square', symbol: '□', angle: 90, maxOrb: 6, nature: 'Dynamic' },
    { type: 'Trine', symbol: '△', angle: 120, maxOrb: 6, nature: 'Harmonious' },
    { type: 'Opposition', symbol: '☍', angle: 180, maxOrb: 7, nature: 'Dynamic' },
  ];

  const mainIds = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Rahu'];
  for (const pA of chartA.planets.filter((p) => mainIds.includes(p.id))) {
    for (const pB of chartB.planets.filter((p) => mainIds.includes(p.id))) {
      const diff = Math.abs(pA.activeLon - pB.activeLon);
      const sep = diff > 180 ? 360 - diff : diff;
      for (const def of aspectDefs) {
        const orb = Math.abs(sep - def.angle);
        if (orb <= def.maxOrb) {
          interAspects.push({
            planet1: `${pA.name} (A)`,
            glyph1: pA.glyph,
            planet2: `${pB.name} (B)`,
            glyph2: pB.glyph,
            type: def.type,
            symbol: def.symbol,
            exactAngle: def.angle,
            actualSeparation: Number(sep.toFixed(2)),
            orb: Number(orb.toFixed(2)),
            applying: true,
            nature: def.nature,
          });
          break;
        }
      }
    }
  }

  // 2. Ashta Koota (8-Fold 36-Guna Vedic Matching based on Moon Nakshatra & Rasi)
  const moonA = chartA.planets.find((p) => p.id === 'Moon')!;
  const moonB = chartB.planets.find((p) => p.id === 'Moon')!;
  const nakIdxA = Math.floor(moonA.siderealLon / (360 / 27));
  const nakIdxB = Math.floor(moonB.siderealLon / (360 / 27));
  const nakA = NAKSHATRAS[nakIdxA];
  const nakB = NAKSHATRAS[nakIdxB];
  const rasiA = moonA.d1Sign;
  const rasiB = moonB.d1Sign;

  // Varna (1 pt) — Groom's Varna >= Bride's Varna yields 1 pt, otherwise 0
  const varnaOrder = ['Brahmin', 'Kshatriya', 'Vaishya', 'Shudra'];
  const getVarna = (r: number) =>
    [3, 7, 11].includes(r) ? 0 : [0, 4, 8].includes(r) ? 1 : [1, 5, 9].includes(r) ? 2 : 3;
  const vA = getVarna(rasiA);
  const vB = getVarna(rasiB);
  const varnaScore = vA <= vB ? 1 : 0;

  // Vashya (2 pts) — Authentic Rasi Vashya classification
  const getVashya = (r: number) => {
    if ([0, 1].includes(r)) return 'Chatushpada (Quadruped)';
    if ([2, 5, 6, 10].includes(r)) return 'Manava (Biped)';
    if ([3, 11].includes(r)) return 'Jalachara (Water)';
    if (r === 4) return 'Vanachara (Wild)';
    if (r === 7) return 'Keeta (Insect)';
    return 'Chatushpada/Manava';
  };
  const vashyaA = getVashya(rasiA);
  const vashyaB = getVashya(rasiB);
  const vashyaScore = vashyaA === vashyaB ? 2 : vashyaA.includes('Manava') && vashyaB.includes('Chatushpada') ? 1 : 1;

  // Tara / Dina (3 pts) — Mutual Janma Nakshatra count mod 9
  const nakDistAB = ((nakIdxB - nakIdxA + 27) % 27) % 9;
  const nakDistBA = ((nakIdxA - nakIdxB + 27) % 27) % 9;
  const taraNames = ['Janma', 'Sampat', 'Vipat', 'Kshema', 'Pratyak', 'Sadhana', 'Naidhana', 'Mitra', 'Parama Mitra'];
  const badTaras = [2, 4, 6]; // Vipat (3rd), Pratyak (5th), Naidhana (7th) in 0-indexed
  const abGood = !badTaras.includes(nakDistAB);
  const baGood = !badTaras.includes(nakDistBA);
  const taraScore = abGood && baGood ? 3 : abGood || baGood ? 1.5 : 0;

  // Yoni (4 pts) — Authentic 14-Animal Swabhava & Swabasha Vaira (Mortal Enemies = 0 pts)
  const yoniAnimalA = nakA.yoni.split(' ')[0];
  const yoniAnimalB = nakB.yoni.split(' ')[0];
  const hostileYoniPairs: [string, string][] = [
    ['Ashwa', 'Mahisha'],
    ['Gaja', 'Simha'],
    ['Mesha', 'Vanara'],
    ['Sarpa', 'Nakula'],
    ['Shwana', 'Mriga'],
    ['Marjara', 'Mushika'],
    ['Go', 'Vyaghra'],
  ];
  const isHostileYoni = hostileYoniPairs.some(
    ([x, y]) => (yoniAnimalA === x && yoniAnimalB === y) || (yoniAnimalA === y && yoniAnimalB === x)
  );
  const yoniScore = yoniAnimalA === yoniAnimalB ? 4 : isHostileYoni ? 0 : 2;

  // Graha Maitri (5 pts) — Authentic Naisargika Maitri between Moon Sign Lords
  const lordA = ZODIAC_SIGNS[rasiA].vedicRuler;
  const lordB = ZODIAC_SIGNS[rasiB].vedicRuler;
  const friendMap: Record<string, { friends: string[]; neutral: string[]; enemies: string[] }> = {
    Sun: { friends: ['Moon', 'Mars', 'Jupiter'], neutral: ['Mercury'], enemies: ['Venus', 'Saturn'] },
    Moon: { friends: ['Sun', 'Mercury'], neutral: ['Mars', 'Jupiter', 'Venus', 'Saturn'], enemies: [] },
    Mars: { friends: ['Sun', 'Moon', 'Jupiter'], neutral: ['Venus', 'Saturn'], enemies: ['Mercury'] },
    Mercury: { friends: ['Sun', 'Venus'], neutral: ['Mars', 'Jupiter', 'Saturn'], enemies: ['Moon'] },
    Jupiter: { friends: ['Sun', 'Moon', 'Mars'], neutral: ['Saturn'], enemies: ['Mercury', 'Venus'] },
    Venus: { friends: ['Mercury', 'Saturn'], neutral: ['Mars', 'Jupiter'], enemies: ['Sun', 'Moon'] },
    Saturn: { friends: ['Mercury', 'Venus'], neutral: ['Jupiter'], enemies: ['Sun', 'Moon', 'Mars'] },
  };
  const relAB =
    lordA === lordB
      ? 'Same'
      : friendMap[lordA]?.friends.includes(lordB)
        ? 'Friend'
        : friendMap[lordA]?.neutral.includes(lordB)
          ? 'Neutral'
          : 'Enemy';
  const relBA =
    lordA === lordB
      ? 'Same'
      : friendMap[lordB]?.friends.includes(lordA)
        ? 'Friend'
        : friendMap[lordB]?.neutral.includes(lordA)
          ? 'Neutral'
          : 'Enemy';
  const maitriScore =
    relAB === 'Same' || (relAB === 'Friend' && relBA === 'Friend')
      ? 5
      : (relAB === 'Friend' && relBA === 'Neutral') || (relAB === 'Neutral' && relBA === 'Friend')
        ? 4
        : relAB === 'Neutral' && relBA === 'Neutral'
          ? 3
          : (relAB === 'Friend' && relBA === 'Enemy') || (relAB === 'Enemy' && relBA === 'Friend')
            ? 1
            : (relAB === 'Neutral' && relBA === 'Enemy') || (relAB === 'Enemy' && relBA === 'Neutral')
              ? 0.5
              : 0;

  // Gana (6 pts) — Deva, Manushya, Rakshasa compatibility
  const gA = nakA.gana.split(' ')[0];
  const gB = nakB.gana.split(' ')[0];
  const ganaScore =
    gA === gB
      ? 6
      : (gA === 'Deva' && gB === 'Manushya') || (gA === 'Manushya' && gB === 'Deva')
        ? 5
        : (gA === 'Deva' && gB === 'Rakshasa') || (gA === 'Rakshasa' && gB === 'Deva')
          ? 1
          : 0;

  // Bhakoot (7 pts) — 2/12 (Dwidwadasha), 6/8 (Shadashtaka), 5/9 (Navapanchama)
  const rasiDist = ((rasiB - rasiA + 12) % 12) + 1;
  const bhakootScore = [1, 3, 4, 7, 10, 11].includes(rasiDist)
    ? 7
    : maitriScore >= 4
      ? 7 // Rasyadhipati Maitri cancels Bhakoot Dosha per Muhurta Chintamani
      : 0;

  // Nadi (8 pts) — Most vital Koota: different Nadi gives full 8 points!
  const nadiScore = nakA.nadi !== nakB.nadi ? 8 : 0;

  const kootaItems: SynastryKootaItem[] = [
    { koota: 'Varna', sanskrit: 'वर्ण कूट', maxPoints: 1, scoredPoints: varnaScore, personAValue: varnaOrder[vA], personBValue: varnaOrder[vB], description: 'Spiritual temperament and ego refinement.' },
    { koota: 'Vashya', sanskrit: 'वश्य कूट', maxPoints: 2, scoredPoints: vashyaScore, personAValue: vashyaA, personBValue: vashyaB, description: 'Mutual magnetic attraction and cooperative influence.' },
    { koota: 'Tara (Dina)', sanskrit: 'तारा कूट', maxPoints: 3, scoredPoints: taraScore, personAValue: nakA.name, personBValue: `${nakB.name} (${taraNames[nakDistAB]})`, description: 'Nakshatra star resonance, health, and fortune longevity.' },
    { koota: 'Yoni', sanskrit: 'योनि कूट', maxPoints: 4, scoredPoints: yoniScore, personAValue: nakA.yoni, personBValue: nakB.yoni, description: 'Instinctual affinity, biological rhythm, and intimacy.' },
    { koota: 'Graha Maitri', sanskrit: 'ग्रह मैत्री', maxPoints: 5, scoredPoints: maitriScore, personAValue: lordA, personBValue: lordB, description: 'Psychological disposition of Moon Sign Lords.' },
    { koota: 'Gana', sanskrit: 'गण कूट', maxPoints: 6, scoredPoints: ganaScore, personAValue: nakA.gana.split(' ')[0], personBValue: nakB.gana.split(' ')[0], description: 'Core behavioral archetype (Deva, Manushya, Rakshasa).' },
    { koota: 'Bhakoot', sanskrit: 'भकूट कूट', maxPoints: 7, scoredPoints: bhakootScore, personAValue: ZODIAC_SIGNS[rasiA].sanskrit, personBValue: `${ZODIAC_SIGNS[rasiB].sanskrit} (${rasiDist}/12 axis)`, description: 'Emotional flow, family prosperity, and dharma growth.' },
    { koota: 'Nadi', sanskrit: 'नाडी कूट', maxPoints: 8, scoredPoints: nadiScore, personAValue: nakA.nadi, personBValue: nakB.nadi, description: 'Pranic pulse constitution (Vata, Pitta, Kapha) and vitality.' },
  ];

  const totalScored = Number(kootaItems.reduce((s, item) => s + item.scoredPoints, 0).toFixed(1));
  const marsA = chartA.planets.find((p) => p.id === 'Mars')!;
  const marsB = chartB.planets.find((p) => p.id === 'Mars')!;
  const manglikHouses = [1, 2, 4, 7, 8, 12];
  const manglikA = manglikHouses.includes(marsA.house);
  const manglikB = manglikHouses.includes(marsB.house);

  // Composite Midpoint Planets
  const compositePlanets = chartA.planets.slice(0, 10).map((pA, idx) => {
    const pB = chartB.planets[idx];
    let diff = pB.activeLon - pA.activeLon;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    const midLon = norm360(pA.activeLon + diff / 2);
    const sign = ZODIAC_SIGNS[Math.floor(midLon / 30)];
    return {
      name: pA.name,
      glyph: pA.glyph,
      lon: Number(midLon.toFixed(2)),
      signName: sign.name,
      signGlyph: sign.glyph,
      formattedDMS: formatDMS(midLon % 30),
      house: ((Math.floor(midLon / 30) - chartA.ascendant.signIndex + 12) % 12) + 1,
    };
  });

  return {
    chartA,
    chartB,
    interAspects: interAspects.sort((a, b) => a.orb - b.orb),
    ashtaKoota: {
      items: kootaItems,
      totalScored,
      maxTotal: 36,
      compatibilityVerdict:
        totalScored >= 26
          ? 'Exceptional (Uttama)'
          : totalScored >= 18
            ? 'Auspicious (Madhyama)'
            : 'Requires Remedy (Adhama)',
      manglikA,
      manglikB,
      manglikCancellation:
        manglikA === manglikB
          ? 'Balanced Kuja Parity (Mutual Cancellation or Non-Manglik)'
          : 'Asymmetric Kuja Placement — mitigated by Jupiter/Venus aspect or Kumbha Vivaha',
    },
    compositePlanets,
  };
}
