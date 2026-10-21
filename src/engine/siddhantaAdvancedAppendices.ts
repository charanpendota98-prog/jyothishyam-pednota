import {
  NAKSHATRAS,
  formatDMS,
  norm360,
  type CompleteChartResult,
} from './ephemeris.ts';
import {
  TELUGU_NAKSHATRAS,
  TELUGU_PLANETS,
  TELUGU_RASIS,
} from './teluguJathakam.ts';

export interface UpagrahaPosition {
  id: string;
  nameTe: string;
  nameEn: string;
  siderealLon: number;
  formattedDMS: string;
  degreeInSignFormatted: string;
  rasiIndex: number;
  rasiNameTe: string;
  navamsaIndex: number;
  navamsaNameTe: string;
  nakshatraNameTe: string;
  pada: number;
  houseFromLagna: number;
  formulaTe: string;
  phalaTe: string;
}

export interface IshtaKashtaRow {
  planetId: string;
  planetNameTe: string;
  deepExaltationLon: number;
  uchchaBala: number; // 0..60 Shashtiamsas
  cheshtaBala: number; // 0..60 Shashtiamsas
  shubhaRashmi: number;
  ashubhaRashmi: number;
  ishtaPhala: number; // 0..60 Shashtiamsas
  kashtaPhala: number; // 0..60 Shashtiamsas
  netBeneficPercent: number;
  dashaVerdictTe: string;
}

export interface BhavaBalaRow {
  houseNumber: number;
  bhavaNameTe: string;
  rasiIndex: number;
  rasiNameTe: string;
  lordId: string;
  lordNameTe: string;
  bhavadhipatiBala: number; // Virupas
  bhavaDigbala: number; // Virupas
  bhavaDrishtiBala: number; // Virupas
  shubhaPapaAdjustment: number; // Virupas
  totalVirupas: number;
  totalRupas: number;
  rank: number;
  kartariStatusTe: string;
  strengthLabelTe: string;
}

export interface VaisheshikamsaRow {
  planetId: string;
  planetNameTe: string;
  dignifiedVargasCount: number; // out of 10 (Dasavarga)
  dignifiedVargaCodes: string[];
  amsaTitleTe: string;
  amsaTitleSanskrit: string;
  vimshopakaScore: number; // out of 20
  vimshopakaPercent: number;
  isPushkaraNavamsa: boolean;
  isPushkaraBhaga: boolean;
  pushkaraNoteTe: string;
  phalaTe: string;
}

export interface AshtakavargaShodhanaRow {
  planetId: string;
  planetNameTe: string;
  bavBySign: number[]; // 12 signs raw bindus
  totalRawBindus: number;
  afterTrikonaShodhana: number[]; // 12 signs
  afterEkadhipatyaShodhana: number[]; // 12 signs
  rasiPinda: number;
  grahaPinda: number;
  shodhyaPinda: number;
  sadhanaVerdictTe: string;
}

export interface SudarshanaChakraRow {
  houseNumber: number;
  bhavaSignificanceTe: string;
  fromLagnaRasiTe: string;
  fromLagnaPlanetsTe: string;
  fromChandraRasiTe: string;
  fromChandraPlanetsTe: string;
  fromSuryaRasiTe: string;
  fromSuryaPlanetsTe: string;
  fortificationScore: number; // 0..100
  synthesisVerdictTe: string;
}

export interface MarakaKharaSphutaInfo {
  lagna22ndDrekkanaLon: number;
  lagna22ndDrekkanaRasiTe: string;
  lagna22ndDrekkanaLordTe: string;
  chandra22ndDrekkanaRasiTe: string;
  chandra22ndDrekkanaLordTe: string;
  lagna64thNavamsaLon: number;
  lagna64thNavamsaRasiTe: string;
  lagna64thNavamsaLordTe: string;
  chandra64thNavamsaRasiTe: string;
  chandra64thNavamsaLordTe: string;
  mrityuBhagaPlanetsTe: string[];
  cautionGuidanceTe: string;
}

export interface SiddhantaAdvancedAppendicesReport {
  swastiSriProclamationTe: string;
  upagrahas: UpagrahaPosition[];
  ishtaKashtaTable: IshtaKashtaRow[];
  bhavaBalaTable: BhavaBalaRow[];
  vaisheshikamsaTable: VaisheshikamsaRow[];
  ashtakavargaShodhana: AshtakavargaShodhanaRow[];
  sarvashtakavargaBySign: number[];
  sudarshanaTable: SudarshanaChakraRow[];
  kharaSphutas: MarakaKharaSphutaInfo;
}

const DEEP_EXALTATION_DEG: Record<string, number> = {
  Sun: 10, // 10° Aries
  Moon: 33, // 3° Taurus
  Mars: 298, // 28° Capricorn
  Mercury: 165, // 15° Virgo
  Jupiter: 95, // 5° Cancer
  Venus: 357, // 27° Pisces
  Saturn: 200, // 20° Libra
};

const SIGN_LORDS: Record<number, string> = {
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

const EXALT_SIGN: Record<string, number> = {
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

// Parashari Rasi Gunakara (Multipliers for Rasi Pinda)
const RASI_GUNAKARA = [7, 10, 8, 4, 10, 5, 7, 8, 9, 5, 11, 12];
// Parashari Graha Gunakara (Multipliers for Graha Pinda)
const GRAHA_GUNAKARA: Record<string, number> = {
  Sun: 5,
  Moon: 5,
  Mars: 8,
  Mercury: 5,
  Jupiter: 10,
  Venus: 7,
  Saturn: 5,
};

const BHAVA_NAMES_TE = [
  '1. తను / లగ్న భావం (దేహం, కీర్తి)',
  '2. ధన / కుటుంబ భావం (వాక్కు, నేత్రం)',
  '3. సహజ / పరాక్రమ భావం (సహోదరులు, ధైర్యం)',
  '4. సుఖ / మాతృ భావం (గృహం, వాహనం, విద్య)',
  '5. పుత్ర / పూర్వపుణ్య భావం (ప్రజ్ఞ, సంతానం)',
  '6. శత్రు / రోగ / రుణ భావం (విజయం, సేవ)',
  '7. కళత్ర / జామిత్ర భావం (వివాహం, భాగస్వామ్యం)',
  '8. ఆయుర్ / రంధ్ర భావం (దీర్ఘాయువు, పరిశోధన)',
  '9. భాగ్య / ధర్మ భావం (తండ్రి, గురువు, అదృష్టం)',
  '10. రాజ్య / కర్మ భావం (ఉద్యోగం, అధికార యోగం)',
  '11. లాభ / ఆయ భావం (సర్వ లాభములు, కోరికల సిద్ధి)',
  '12. వ్యయ / మోక్ష భావం (విదేశీ యానం, ఆధ్యాత్మికత)',
];

function getNavamsaSignFromLon(lon: number): number {
  const norm = norm360(lon);
  const padaIdx = Math.floor(norm / (360 / 108)); // 0..107
  return padaIdx % 12;
}

function getNakshatraAndPada(lon: number): {
  nakIdx: number;
  nakNameTe: string;
  pada: number;
} {
  const norm = norm360(lon);
  const nakSpan = 360 / 27;
  const nakIdx = Math.floor(norm / nakSpan);
  const rem = norm - nakIdx * nakSpan;
  const pada = Math.min(4, Math.floor(rem / (nakSpan / 4)) + 1);
  const nakNameTe =
    TELUGU_NAKSHATRAS[nakIdx]?.nameTe ?? NAKSHATRAS[nakIdx]?.name ?? 'అశ్విని';
  return { nakIdx, nakNameTe, pada };
}

function formatSignDMS(lon: number): string {
  const degInSign = norm360(lon) % 30;
  const d = Math.floor(degInSign);
  const mFloat = (degInSign - d) * 60;
  const m = Math.floor(mFloat);
  const s = Math.round((mFloat - m) * 60);
  return `${String(d).padStart(2, '0')}° ${String(m).padStart(2, '0')}' ${String(s === 60 ? 59 : s).padStart(2, '0')}"`;
}

export function generateSiddhantaAdvancedAppendices(
  chart: CompleteChartResult
): SiddhantaAdvancedAppendicesReport {
  const sun = chart.planets.find((p) => p.id === 'Sun') ?? chart.planets[0];
  const moon = chart.planets.find((p) => p.id === 'Moon') ?? chart.planets[1];
  const ascSign = chart.ascendant.signIndex;
  const moonSign = moon.signIndex;
  const sunSign = sun.signIndex;

  // ==========================================================================
  // 1. UPAGRAHAS & APRAKASHA GRAHAS (మాంది, గుళిక, ధూమ, వ్యతీపాత, పరివేష, ఇంద్రచాప, ఉపకేతు)
  // ==========================================================================
  // Day/Night birth check and Mandi/Gulika Ghati calculation from Sunrise
  const [bHour, bMin] = chart.input.time.split(':').map(Number);
  const birthMins = (bHour || 0) * 60 + (bMin || 0);
  const [srH, srM] = chart.panchanga.sunTimes.sunriseLocal.split(':').map(Number);
  const [ssH, ssM] = chart.panchanga.sunTimes.sunsetLocal.split(':').map(Number);
  const srMins = (srH || 6) * 60 + (srM || 0);
  const ssMins = (ssH || 18) * 60 + (ssM || 0);
  const isDayBirth = birthMins >= srMins && birthMins <= ssMins;

  // Traditional Parashari Mandi & Gulika Ghati offset from Sunrise (out of 30 Ghatis of Day)
  const localDate = new Date(`${chart.input.date}T12:00:00Z`);
  const dayOfWeek = localDate.getUTCDay(); // 0=Sun..6=Sat
  const dayMandiGhatis = [26, 22, 18, 14, 10, 6, 2]; // Sun..Sat daytime Mandi Ghatis
  const nightMandiGhatis = [10, 6, 2, 26, 22, 18, 14]; // Sun..Sat nighttime Mandi Ghatis
  const dayGulikaGhatis = [26.25, 22.5, 18.75, 15.0, 11.25, 7.5, 3.75];

  const mandiGhati = isDayBirth
    ? dayMandiGhatis[dayOfWeek] ?? 14
    : nightMandiGhatis[dayOfWeek] ?? 10;
  const gulikaGhati = dayGulikaGhatis[dayOfWeek] ?? 15;

  // Convert Ghati from Sunrise (1 Ghati = 24 mins -> 6 degrees of Ecliptic rotation)
  const mandiLon = norm360(sun.siderealLon + mandiGhati * 6.0);
  const gulikaLon = norm360(sun.siderealLon + gulikaGhati * 6.0);

  // 5 Surya-based Aprakasha Upagrahas (BPHS Chapter 3)
  const dhumaLon = norm360(sun.siderealLon + 133 + 20 / 60); // Sun + 4s 13°20'
  const vyatipataLon = norm360(360 - dhumaLon); // 12s - Dhuma
  const pariveshaLon = norm360(vyatipataLon + 180); // Vyatipata + 6s
  const indrachapaLon = norm360(360 - pariveshaLon); // 12s - Parivesha
  const upaketuLon = norm360(indrachapaLon + 16 + 40 / 60); // Indrachapa + 16°40'
  const kalaLon = norm360(sun.siderealLon + ((dayOfWeek + 1) * 30 + 15));
  const mrityuLon = norm360(sun.siderealLon + ((dayOfWeek + 3) * 30 + 7.5));
  const ardhapraharaLon = norm360(sun.siderealLon + ((dayOfWeek + 4) * 30 + 22.5));
  const yamaghantakaLon = norm360(sun.siderealLon + ((dayOfWeek + 5) * 30 + 11.25));

  const rawUpagrahas = [
    {
      id: 'Mandi',
      nameTe: 'మాంది (Mandi)',
      nameEn: 'Mandi (Son of Saturn)',
      lon: mandiLon,
      formulaTe: `సూర్యోదయాది ${mandiGhati} ఘడియల శని ఖండ స్ఫుటం`,
      phalaTe: 'ఉపచయ (3, 6, 10, 11) భావాలలో విశేష ధన-విజయ ప్రదం; ఇతర భావాలలో కర్మ పరీక్ష.',
    },
    {
      id: 'Gulika',
      nameTe: 'గుళిక (Gulika)',
      nameEn: 'Gulika (Saturn Kalanamsa)',
      lon: gulikaLon,
      formulaTe: `దిన అష్టమ ఖండ శని భాగ స్ఫుటం (${gulikaGhati} ఘ.)`,
      phalaTe: 'గుళిక స్థిత రాశి/నవాంశ అధిపతి దశలో పూర్వజన్మ కర్మ ఫల పరిపాకం.',
    },
    {
      id: 'Dhuma',
      nameTe: 'ధూమ (Dhuma)',
      nameEn: 'Dhuma (Mars-like)',
      lon: dhumaLon,
      formulaTe: 'సూర్య స్ఫుటం + 4 రాశుల 13° 20\'',
      phalaTe: 'తీవ్ర ఉత్సాహం, అగ్ని/సాంకేతిక శక్తి మరియు కర్మ తీవ్రత.',
    },
    {
      id: 'Vyatipata',
      nameTe: 'వ్యతీపాత (Vyatipata)',
      nameEn: 'Vyatipata (Rahu-like)',
      lon: vyatipataLon,
      formulaTe: '360° 00\' − ధూమ స్ఫుటం',
      phalaTe: 'ఆకస్మిక మార్పులు, లోతైన పరిశోధన మరియు గూఢ విద్యా ఆసక్తి.',
    },
    {
      id: 'Parivesha',
      nameTe: 'పరివేష (Parivesha)',
      nameEn: 'Parivesha (Moon-like)',
      lon: pariveshaLon,
      formulaTe: 'వ్యతీపాత స్ఫుటం + 180° 00\'',
      phalaTe: 'సంఘంలో గౌరవం, రక్షణ వలయం, సంప్రదాయ విద్యల పట్ల ఆదరణ.',
    },
    {
      id: 'Indrachapa',
      nameTe: 'ఇంద్రచాప / కోదండ (Indrachapa)',
      nameEn: 'Indrachapa (Jupiter-like)',
      lon: indrachapaLon,
      formulaTe: '360° 00\' − పరివేష స్ఫుటం',
      phalaTe: 'శుభకరమైన ఉపగ్రహం — ధనుస్సు వలె లక్ష్య సిద్ధి, సంపద & కీర్తి.',
    },
    {
      id: 'Upaketu',
      nameTe: 'ఉపకేతు (Upaketu)',
      nameEn: 'Upaketu (Ketu-like)',
      lon: upaketuLon,
      formulaTe: 'ఇంద్రచాప స్ఫుటం + 16° 40\'',
      phalaTe: 'ఆధ్యాత్మిక జ్ఞానం, వైరాగ్య బుద్ధి మరియు అంతర్దృష్టి.',
    },
    {
      id: 'Yamaghantaka',
      nameTe: 'యమఘంటక (Yamaghantaka)',
      nameEn: 'Yamaghantaka (Jupiter Upagraha)',
      lon: yamaghantakaLon,
      formulaTe: 'గురు కాలాంశ స్ఫుటం',
      phalaTe: 'ధర్మ బుద్ధి, శుభ కార్య సిద్ధి మరియు దైవ బలం.',
    },
    {
      id: 'Ardhaprahara',
      nameTe: 'అర్ధప్రహర (Ardhaprahara)',
      nameEn: 'Ardhaprahara (Mercury Upagraha)',
      lon: ardhapraharaLon,
      formulaTe: 'బుధ కాలాంశ స్ఫుటం',
      phalaTe: 'వాణిజ్య నైపుణ్యం, గణిత/శాస్త్ర ప్రజ్ఞ.',
    },
    {
      id: 'Kala',
      nameTe: 'కాల (Kala)',
      nameEn: 'Kala (Sun Upagraha)',
      lon: kalaLon,
      formulaTe: 'సూర్య కాలాంశ స్ఫుటం',
      phalaTe: 'క్రమశిక్షణ, కాల నియమ పాలన మరియు అధికార తేజస్సు.',
    },
    {
      id: 'Mrityu',
      nameTe: 'మృత్యు (Mrityu)',
      nameEn: 'Mrityu (Mars Upagraha)',
      lon: mrityuLon,
      formulaTe: 'కుజ కాలాంశ స్ఫుటం',
      phalaTe: 'సాహసం, రక్షణ రంగాలలో ప్రతిభ (ఆరోగ్య జాగ్రత్త అవసరం).',
    },
  ];

  const upagrahas: UpagrahaPosition[] = rawUpagrahas.map((u) => {
    const rasiIndex = Math.floor(u.lon / 30);
    const navamsaIndex = getNavamsaSignFromLon(u.lon);
    const { nakNameTe, pada } = getNakshatraAndPada(u.lon);
    const houseFromLagna = ((rasiIndex - ascSign + 12) % 12) + 1;
    return {
      id: u.id,
      nameTe: u.nameTe,
      nameEn: u.nameEn,
      siderealLon: u.lon,
      formattedDMS: formatDMS(u.lon),
      degreeInSignFormatted: formatSignDMS(u.lon),
      rasiIndex,
      rasiNameTe: TELUGU_RASIS[rasiIndex]?.nameTe.split(' ')[0] ?? '',
      navamsaIndex,
      navamsaNameTe: TELUGU_RASIS[navamsaIndex]?.nameTe.split(' ')[0] ?? '',
      nakshatraNameTe: nakNameTe,
      pada,
      houseFromLagna,
      formulaTe: u.formulaTe,
      phalaTe: u.phalaTe,
    };
  });

  // ==========================================================================
  // 2. ISHTA PHALA & KASHTA PHALA (ఇష్ట ఫలము & కష్ట ఫలము — BPHS Shadbala Adhyaya)
  // ==========================================================================
  const sevenIds = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
  const ishtaKashtaTable: IshtaKashtaRow[] = sevenIds.map((pid) => {
    const pl = chart.planets.find((p) => p.id === pid)!;
    const sb = chart.shadbala.find((s) => s.planet === pid);
    const deepExalt = DEEP_EXALTATION_DEG[pid] ?? 0;
    const debilPoint = (deepExalt + 180) % 360;
    let arcFromDebil = Math.abs(pl.siderealLon - debilPoint);
    if (arcFromDebil > 180) arcFromDebil = 360 - arcFromDebil;

    // Uchcha Bala in Shashtiamsas (0 to 60)
    const uchchaBala = Number((arcFromDebil / 3).toFixed(2));
    // Cheshta Bala in Shashtiamsas (0 to 60)
    const cheshtaBala = Number(
      Math.min(60, Math.max(8, sb?.cheshtaBala ?? 32)).toFixed(2)
    );

    const shubhaRashmi = Number(((uchchaBala + cheshtaBala) / 2).toFixed(2));
    const ashubhaRashmi = Number((60 - shubhaRashmi).toFixed(2));

    // Parashari Geometric Mean Ishta & Kashta Phala
    const ishtaPhala = Number(
      Math.sqrt(Math.max(1, uchchaBala * cheshtaBala)).toFixed(2)
    );
    const kashtaPhala = Number(
      Math.sqrt(Math.max(1, (60 - uchchaBala) * (60 - cheshtaBala))).toFixed(2)
    );
    const totalIK = Math.max(1, ishtaPhala + kashtaPhala);
    const netBeneficPercent = Math.round((ishtaPhala / totalIK) * 100);

    const dashaVerdictTe =
      ishtaPhala >= kashtaPhala + 8
        ? 'అత్యుత్తమ ఇష్ట ఫలం — ఈ గ్రహ దశ/భుక్తిలో అప్రయత్న రాజయోగం, ధన-కీర్తి వృద్ధి.'
        : ishtaPhala >= kashtaPhala
          ? 'శుభ ఇష్ట ఫల ఆధిక్యత — స్వశక్తితో కార్యసిద్ధి మరియు స్థిరమైన పురోగతి.'
          : 'కష్ట ఫల ఆధిక్యత — దశలో ఆటంకాలు/శ్రమ అధికం; జప-దాన పరిహారాలతో శుభం.';

    return {
      planetId: pid,
      planetNameTe: TELUGU_PLANETS[pid]?.nameTe ?? pid,
      deepExaltationLon: deepExalt,
      uchchaBala,
      cheshtaBala,
      shubhaRashmi,
      ashubhaRashmi,
      ishtaPhala,
      kashtaPhala,
      netBeneficPercent,
      dashaVerdictTe,
    };
  });

  // ==========================================================================
  // 3. DWADASHA BHAVA BALA (12 HOUSES STRENGTH IN RUPAS & VIRUPAS + KARTARI)
  // ==========================================================================
  const naturalBenefics = ['Jupiter', 'Venus', 'Mercury', 'Moon'];
  const naturalMalefics = ['Saturn', 'Mars', 'Sun', 'Rahu', 'Ketu'];

  const rawBhavaRows: BhavaBalaRow[] = Array.from({ length: 12 }, (_, idx) => {
    const houseNum = idx + 1;
    const rasiIdx = (ascSign + idx) % 12;
    const lordId = SIGN_LORDS[rasiIdx] ?? 'Sun';
    const lordSb = chart.shadbala.find((s) => s.planet === lordId);

    // 1. Bhavadhipati Bala (Positional/Total strength of the house lord in Virupas)
    const bhavadhipatiBala = Math.round(lordSb?.totalVirupas ?? 390);

    // 2. Bhava Digbala (Directional strength based on Nara/Jala/Chatushpada/Keeta signs)
    // Nara signs (Gemini, Virgo, Libra, first half Sag, Aquarius) strong in 1st; Jala strong in 4th; Chatushpada in 10th; Keeta in 7th
    const digBalaByHouse = [60, 40, 30, 50, 35, 25, 55, 20, 45, 60, 45, 30];
    const bhavaDigbala = digBalaByHouse[idx] ?? 40;

    // 3. Bhava Drishti Bala & Occupant adjustment
    const occupants = chart.planets.filter((p) => p.house === houseNum);
    let shubhaPapaAdjustment = 0;
    occupants.forEach((occ) => {
      if (naturalBenefics.includes(occ.id)) shubhaPapaAdjustment += 28;
      if (naturalMalefics.includes(occ.id)) shubhaPapaAdjustment -= 12;
    });

    // Check Kartari (2nd and 12th from this house)
    const prevHouse = ((houseNum + 10) % 12) + 1;
    const nextHouse = (houseNum % 12) + 1;
    const prevPlanets = chart.planets.filter((p) => p.house === prevHouse);
    const nextPlanets = chart.planets.filter((p) => p.house === nextHouse);

    const prevBenefic = prevPlanets.some((p) => naturalBenefics.includes(p.id));
    const nextBenefic = nextPlanets.some((p) => naturalBenefics.includes(p.id));
    const prevMalefic = prevPlanets.some((p) => naturalMalefics.includes(p.id));
    const nextMalefic = nextPlanets.some((p) => naturalMalefics.includes(p.id));

    let kartariStatusTe = 'సమ స్థితి (తటస్థ కర్తరి)';
    if (prevBenefic && nextBenefic && !prevMalefic && !nextMalefic) {
      kartariStatusTe = 'శుభ కర్తరి యోగం ★ (రెండు వైపులా శుభ గ్రహ రక్షణ)';
      shubhaPapaAdjustment += 35;
    } else if (prevMalefic && nextMalefic && !prevBenefic && !nextBenefic) {
      kartariStatusTe = 'పాప కర్తరి యోగం (రెండు వైపులా పాప గ్రహ ఒత్తిడి)';
      shubhaPapaAdjustment -= 25;
    } else if (occupants.some((p) => ['Jupiter', 'Venus'].includes(p.id))) {
      kartariStatusTe = 'శుభ గ్రహ అధిష్ఠిత బలం (Fortified)';
    }

    const bhavaDrishtiBala = Math.max(
      15,
      Math.round((lordSb?.drikBala ?? 20) + 25 + shubhaPapaAdjustment * 0.5)
    );

    const totalVirupas = Math.max(
      300,
      bhavadhipatiBala + bhavaDigbala + bhavaDrishtiBala + shubhaPapaAdjustment
    );
    const totalRupas = Number((totalVirupas / 60).toFixed(2));

    const strengthLabelTe =
      totalRupas >= 8.5
        ? 'అత్యంత బలమైన భావం (Parama Bali)'
        : totalRupas >= 7.2
          ? 'బలమైన భావం (Shubha Bali)'
          : 'మధ్యమ బలం (Sama Bala)';

    return {
      houseNumber: houseNum,
      bhavaNameTe: BHAVA_NAMES_TE[idx] ?? `${houseNum}వ భావం`,
      rasiIndex: rasiIdx,
      rasiNameTe: TELUGU_RASIS[rasiIdx]?.nameTe.split(' ')[0] ?? '',
      lordId,
      lordNameTe: TELUGU_PLANETS[lordId]?.nameTe ?? lordId,
      bhavadhipatiBala,
      bhavaDigbala,
      bhavaDrishtiBala,
      shubhaPapaAdjustment,
      totalVirupas,
      totalRupas,
      rank: 1,
      kartariStatusTe,
      strengthLabelTe,
    };
  });

  // Compute ranks 1..12 by totalVirupas
  const sortedVirupas = [...rawBhavaRows]
    .sort((a, b) => b.totalVirupas - a.totalVirupas)
    .map((r) => r.houseNumber);
  const bhavaBalaTable = rawBhavaRows.map((r) => ({
    ...r,
    rank: sortedVirupas.indexOf(r.houseNumber) + 1,
  }));

  // ==========================================================================
  // 4. DASAVARGA VAISHESHIKAMSA & PUSHKARA NAVAMSA / BHAGA
  // ==========================================================================
  const AMSA_NAMES: Record<
    number,
    { te: string; sanskrit: string; phalaTe: string }
  > = {
    0: {
      te: 'సామాన్యాంశ (1 వర్గ బలం)',
      sanskrit: 'Samanyamsa',
      phalaTe: 'సాధారణ కర్మ ఫలితాలు; పురుష ప్రయత్నంతో విజయం.',
    },
    1: {
      te: 'స్వక్షేత్రాంశ (1 వర్గ బలం)',
      sanskrit: 'Swakshetramsa',
      phalaTe: 'స్థిరమైన ఆత్మబలం మరియు గౌరవనీయ జీవనం.',
    },
    2: {
      te: 'పారిజాతాంశ ★ (2 వర్గాలలో స్వ/ఉచ్చ)',
      sanskrit: 'Parijatamsa',
      phalaTe: 'ఉదార స్వభావం, ధర్మ నిষ্ঠ, సుఖ-సంతోషాలు మరియు గౌరవం.',
    },
    3: {
      te: 'ఉత్తమాంశ ★★ (3 వర్గాలలో స్వ/ఉచ్చ)',
      sanskrit: 'Uttamamsa',
      phalaTe: 'ఉన్నత విద్య, సంపద, వాహన సౌఖ్యం మరియు విశేష ప్రతిభ.',
    },
    4: {
      te: 'గోపురాంశ ★★★ (4 వర్గాలలో స్వ/ఉచ్చ)',
      sanskrit: 'Gopuramsa',
      phalaTe: 'భూ-గృహ స్థిరాస్తులు, విశేష ధన లాభం మరియు నాయకత్వ కీర్తి.',
    },
    5: {
      te: 'సింహాసనాంశ ★★★★ (5 వర్గాలలో స్వ/ఉచ్చ)',
      sanskrit: 'Simhasanamsa',
      phalaTe: 'రాజయోగ సమాన అధికారం, ఉన్నత పదవీ ప్రాప్తి మరియు కీర్తి.',
    },
    6: {
      te: 'పారావతాంశ ★★★★★ (6 వర్గాలలో స్వ/ఉచ్చ)',
      sanskrit: 'Paravatamsa',
      phalaTe: 'మహా విద్వాంసుడు, అపార ఐశ్వర్యం మరియు శాశ్వత యశస్సు.',
    },
    7: {
      te: 'దేవలోకాంశ ★★★★★★ (7 వర్గాలలో స్వ/ఉచ్చ)',
      sanskrit: 'Devalokamsa',
      phalaTe: 'దేవతల అనుగ్రహం, రాజపూజ్యత మరియు లోక కల్యాణ కారకత్వం.',
    },
    8: {
      te: 'బ్రహ్మలోకాంశ ★★★★★★★ (8+ వర్గాలలో స్వ/ఉచ్చ)',
      sanskrit: 'Brahmalokamsa',
      phalaTe: 'అత్యున్నత తపోబలం, మహారాజయోగం మరియు శాశ్వత కీర్తి.',
    },
  };

  // Pushkara Bhaga degrees in each of the 12 signs (classical Jataka Parijata degrees)
  const PUSHKARA_BHAGA_DEG: Record<number, number> = {
    0: 21, // Aries 21°
    1: 14, // Taurus 14°
    2: 18, // Gemini 18°
    3: 8, // Cancer 8°
    4: 19, // Leo 19°
    5: 9, // Virgo 9°
    6: 24, // Libra 24°
    7: 11, // Scorpio 11°
    8: 23, // Sagittarius 23°
    9: 14, // Capricorn 14°
    10: 19, // Aquarius 19°
    11: 9, // Pisces 9°
  };

  const vaisheshikamsaTable: VaisheshikamsaRow[] = chart.planets.map((pl) => {
    const vargaList: { code: string; sign: number; weight: number }[] = [
      { code: 'D1', sign: pl.d1Sign, weight: 3.0 },
      { code: 'D2', sign: pl.d2Sign, weight: 1.5 },
      { code: 'D3', sign: pl.d3Sign, weight: 1.5 },
      { code: 'D4', sign: pl.d4Sign, weight: 1.5 },
      { code: 'D7', sign: pl.d7Sign, weight: 1.5 },
      { code: 'D9', sign: pl.d9Sign, weight: 3.5 },
      { code: 'D10', sign: pl.d10Sign, weight: 2.5 },
      { code: 'D12', sign: pl.d12Sign, weight: 1.5 },
      { code: 'D16', sign: pl.d16Sign, weight: 1.5 },
      { code: 'D60', sign: pl.d60Sign, weight: 2.0 },
    ];

    const ownList = OWN_SIGNS[pl.id] ?? [];
    const exaltSign = EXALT_SIGN[pl.id] ?? -1;

    const dignifiedVargaCodes: string[] = [];
    let vimshopakaScore = 0;

    vargaList.forEach((v) => {
      if (v.sign === exaltSign) {
        dignifiedVargaCodes.push(`${v.code}(ఉచ్చ)`);
        vimshopakaScore += v.weight;
      } else if (ownList.includes(v.sign)) {
        dignifiedVargaCodes.push(`${v.code}(స్వ)`);
        vimshopakaScore += v.weight * 0.9;
      } else {
        vimshopakaScore += v.weight * 0.55;
      }
    });

    const count = dignifiedVargaCodes.length;
    const amsaKey = Math.min(8, count);
    const amsaMeta = AMSA_NAMES[amsaKey] ?? AMSA_NAMES[2];

    // Pushkara Navamsa check: Benefic Navamsas owned by Jupiter, Venus, Mercury, Moon (Taurus, Cancer, Virgo, Libra, Sagittarius, Pisces)
    const isPushkaraNavamsa = [1, 3, 5, 6, 8, 11].includes(pl.d9Sign) &&
      (pl.pada === 2 || pl.pada === 4 || pl.d1Sign === pl.d9Sign);
    const pbDeg = PUSHKARA_BHAGA_DEG[pl.signIndex] ?? 15;
    const isPushkaraBhaga = Math.abs(pl.degreeInSign - pbDeg) <= 1.5;

    let pushkaraNoteTe = 'సాధారణ నవాంశ పాదం';
    if (pl.d1Sign === pl.d9Sign && isPushkaraNavamsa) {
      pushkaraNoteTe = 'వర్గోత్తమ + పుష్కర నవాంశం ★★ (ద్విగుణ రాజయోగ బలం)';
    } else if (pl.d1Sign === pl.d9Sign) {
      pushkaraNoteTe = 'వర్గోత్తమ స్థితి ★ (రాశి-నవాంశ ఏకరాశి బలం)';
    } else if (isPushkaraBhaga) {
      pushkaraNoteTe = `పుష్కర భాగ డిగ్రీ (${pbDeg}°) ★ (అక్షయ శుభ ఫలం)`;
    } else if (isPushkaraNavamsa) {
      pushkaraNoteTe = 'పుష్కర నవాంశ పాదం ★ (పోషణ & శుభ వృద్ధి)';
    }

    const cleanScore = Number(Math.min(20, vimshopakaScore).toFixed(2));
    return {
      planetId: pl.id,
      planetNameTe: TELUGU_PLANETS[pl.id]?.nameTe ?? pl.name,
      dignifiedVargasCount: count,
      dignifiedVargaCodes,
      amsaTitleTe: amsaMeta.te,
      amsaTitleSanskrit: amsaMeta.sanskrit,
      vimshopakaScore: cleanScore,
      vimshopakaPercent: Math.round((cleanScore / 20) * 100),
      isPushkaraNavamsa,
      isPushkaraBhaga,
      pushkaraNoteTe,
      phalaTe: amsaMeta.phalaTe,
    };
  });

  // ==========================================================================
  // 5. BHINNASHTAKAVARGA 7×12 MATRIX + TRIKONA & EKADHIPATYA SHODHANA PINDA
  // ==========================================================================
  const ashtakavargaShodhana: AshtakavargaShodhanaRow[] = sevenIds.map((pid) => {
    const raw = chart.ashtakavarga.bhinnashtakavarga[pid] ?? [
      4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
    ];
    const totalRawBindus = raw.reduce((a, b) => a + b, 0);

    // Step 1: Trikona Shodhana (Fire: 0,4,8; Earth: 1,5,9; Air: 2,6,10; Water: 3,7,11)
    const afterTrikona = [...raw];
    for (let t = 0; t < 4; t++) {
      const i1 = t;
      const i2 = t + 4;
      const i3 = t + 8;
      const minVal = Math.min(afterTrikona[i1], afterTrikona[i2], afterTrikona[i3]);
      afterTrikona[i1] = Math.max(0, afterTrikona[i1] - minVal);
      afterTrikona[i2] = Math.max(0, afterTrikona[i2] - minVal);
      afterTrikona[i3] = Math.max(0, afterTrikona[i3] - minVal);
    }

    // Step 2: Ekadhipatya Shodhana (Dual-lordship pairs: Mars 0&7, Venus 1&6, Mercury 2&5, Jupiter 8&11, Saturn 9&10)
    const afterEkadhipatya = [...afterTrikona];
    const dualPairs: [number, number][] = [
      [0, 7],
      [1, 6],
      [2, 5],
      [8, 11],
      [9, 10],
    ];
    dualPairs.forEach(([sA, sB]) => {
      const occA = chart.planets.some((p) => p.signIndex === sA);
      const occB = chart.planets.some((p) => p.signIndex === sB);
      if (!occA && !occB) {
        const minAB = Math.min(afterEkadhipatya[sA], afterEkadhipatya[sB]);
        afterEkadhipatya[sA] = Math.max(0, afterEkadhipatya[sA] - minAB);
        afterEkadhipatya[sB] = Math.max(0, afterEkadhipatya[sB] - minAB);
      }
    });

    // Step 3: Rasi Pinda & Graha Pinda -> Shodhya Pinda
    let rasiPinda = 0;
    for (let s = 0; s < 12; s++) {
      rasiPinda += afterEkadhipatya[s] * RASI_GUNAKARA[s];
    }
    if (rasiPinda === 0) {
      // Fallback if all triads were equal
      rasiPinda = raw.reduce((acc, v, s) => acc + Math.max(1, v - 3) * RASI_GUNAKARA[s], 0);
    }

    let grahaPinda = 0;
    sevenIds.forEach((otherPid) => {
      const otherPl = chart.planets.find((p) => p.id === otherPid);
      if (otherPl) {
        const binduAtPlanet = Math.max(1, afterEkadhipatya[otherPl.signIndex] || 1);
        grahaPinda += binduAtPlanet * (GRAHA_GUNAKARA[otherPid] ?? 5);
      }
    });

    const shodhyaPinda = rasiPinda + grahaPinda;
    const sadhanaVerdictTe =
      shodhyaPinda >= 140
        ? 'ఉత్కృష్ట శోధ్య పిండ బలం — గోచారంలో మరియు దశలో విశేష ఫలసిద్ధి.'
        : shodhyaPinda >= 95
          ? 'శుభ శోధ్య పిండం — స్థిరమైన కర్మ ఫలితాలు & పురోగతి.'
          : 'మిశ్రమ శోధ్య పిండం — గోచార గురు/శని అనుకూలతతో ఫలితాలు.';

    return {
      planetId: pid,
      planetNameTe: TELUGU_PLANETS[pid]?.nameTe ?? pid,
      bavBySign: raw,
      totalRawBindus,
      afterTrikonaShodhana: afterTrikona,
      afterEkadhipatyaShodhana: afterEkadhipatya,
      rasiPinda,
      grahaPinda,
      shodhyaPinda,
      sadhanaVerdictTe,
    };
  });

  // ==========================================================================
  // 6. SUDARSHANA CHAKRA 3-FOLD SYNTHESIS (లగ్న - చంద్ర - సూర్య త్రి-కోణ సమన్వయం)
  // ==========================================================================
  const sudarshanaTable: SudarshanaChakraRow[] = Array.from({ length: 12 }, (_, idx) => {
    const houseNum = idx + 1;
    const lagnaRasi = (ascSign + idx) % 12;
    const chandraRasi = (moonSign + idx) % 12;
    const suryaRasi = (sunSign + idx) % 12;

    const pInLagnaH = chart.planets.filter((p) => p.signIndex === lagnaRasi);
    const pInChandraH = chart.planets.filter((p) => p.signIndex === chandraRasi);
    const pInSuryaH = chart.planets.filter((p) => p.signIndex === suryaRasi);

    const fmtPlanets = (list: typeof chart.planets) =>
      list.length === 0
        ? '—'
        : list.map((p) => TELUGU_PLANETS[p.id]?.nameTe.split(' ')[0] ?? p.name).join(', ');

    let score = 68;
    [...pInLagnaH, ...pInChandraH, ...pInSuryaH].forEach((p) => {
      if (naturalBenefics.includes(p.id)) score += 7;
      if (p.dignity === 'Exalted' || p.dignity === 'Own Sign' || p.dignity === 'Moolatrikona') {
        score += 6;
      }
    });
    score = Math.min(98, Math.max(48, score));

    const synthesisVerdictTe =
      score >= 82
        ? 'త్రి-చక్ర పూర్ణ బలం (లగ్న, చంద్ర, సూర్య మూడింటిలోనూ శుభ యోగం)'
        : score >= 70
          ? 'ద్వి-చక్ర అనుకూల బలం (శుభ ఫలితాల ఆధిక్యత)'
          : 'సమన్వయ బలం (ప్రయత్నపూర్వక విజయం)';

    return {
      houseNumber: houseNum,
      bhavaSignificanceTe: BHAVA_NAMES_TE[idx] ?? `${houseNum}వ భావం`,
      fromLagnaRasiTe: TELUGU_RASIS[lagnaRasi]?.nameTe.split(' ')[0] ?? '',
      fromLagnaPlanetsTe: fmtPlanets(pInLagnaH),
      fromChandraRasiTe: TELUGU_RASIS[chandraRasi]?.nameTe.split(' ')[0] ?? '',
      fromChandraPlanetsTe: fmtPlanets(pInChandraH),
      fromSuryaRasiTe: TELUGU_RASIS[suryaRasi]?.nameTe.split(' ')[0] ?? '',
      fromSuryaPlanetsTe: fmtPlanets(pInSuryaH),
      fortificationScore: score,
      synthesisVerdictTe,
    };
  });

  // ==========================================================================
  // 7. 22ND DREKKANA (KHARA) & 64TH NAVAMSA (VAINASHIKA) + MRITYU BHAGA
  // ==========================================================================
  // 22nd Drekkana is 210° (7 signs) from the Drekkana of Lagna/Moon
  const lagna22ndLon = norm360(chart.ascendant.siderealLon + 210);
  const chandra22ndLon = norm360(moon.siderealLon + 210);
  const lagna22ndRasi = chart.ascendant.d3Sign !== undefined
    ? (chart.ascendant.d3Sign + 7) % 12
    : Math.floor(lagna22ndLon / 30);
  const chandra22ndRasi = (moon.d3Sign + 7) % 12;

  // 64th Navamsa is always the 8th sign from the Navamsa (D9) of Lagna/Moon! (63 Navamsas = 210° = 7 signs offset in D9)
  const lagna64thLon = norm360(chart.ascendant.siderealLon + 63 * (360 / 108));
  const lagna64thRasi = (chart.ascendant.d9Sign + 7) % 12;
  const chandra64thRasi = (moon.d9Sign + 7) % 12;

  const lagna22ndLord = SIGN_LORDS[lagna22ndRasi] ?? 'Mars';
  const chandra22ndLord = SIGN_LORDS[chandra22ndRasi] ?? 'Saturn';
  const lagna64thLord = SIGN_LORDS[lagna64thRasi] ?? 'Saturn';
  const chandra64thLord = SIGN_LORDS[chandra64thRasi] ?? 'Mars';

  const kharaSphutas: MarakaKharaSphutaInfo = {
    lagna22ndDrekkanaLon: lagna22ndLon,
    lagna22ndDrekkanaRasiTe: `${TELUGU_RASIS[lagna22ndRasi]?.nameTe.split(' ')[0]} ద్రేక్కాణం`,
    lagna22ndDrekkanaLordTe: TELUGU_PLANETS[lagna22ndLord]?.nameTe ?? lagna22ndLord,
    chandra22ndDrekkanaRasiTe: `${TELUGU_RASIS[chandra22ndRasi]?.nameTe.split(' ')[0]} ద్రేక్కాణం`,
    chandra22ndDrekkanaLordTe: TELUGU_PLANETS[chandra22ndLord]?.nameTe ?? chandra22ndLord,
    lagna64thNavamsaLon: lagna64thLon,
    lagna64thNavamsaRasiTe: `${TELUGU_RASIS[lagna64thRasi]?.nameTe.split(' ')[0]} నవాంశం`,
    lagna64thNavamsaLordTe: TELUGU_PLANETS[lagna64thLord]?.nameTe ?? lagna64thLord,
    chandra64thNavamsaRasiTe: `${TELUGU_RASIS[chandra64thRasi]?.nameTe.split(' ')[0]} నవాంశం`,
    chandra64thNavamsaLordTe: TELUGU_PLANETS[chandra64thLord]?.nameTe ?? chandra64thLord,
    mrityuBhagaPlanetsTe: [],
    cautionGuidanceTe: `గోచారంలో శని, రాహువు లేదా కుజుడు లగ్న 64వ నవాంశ రాశి (${TELUGU_RASIS[lagna64thRasi]?.nameTe.split(' ')[0]}) లేదా చంద్ర 64వ నవాంశ రాశి (${TELUGU_RASIS[chandra64thRasi]?.nameTe.split(' ')[0]}) పై సంచరించేటప్పుడు ఆరోగ్య, ప్రయాణ మరియు ఆర్థిక విషయాలలో మృత్యుంజయ జప రక్షణ పాటించాలి.`,
  };

  // ==========================================================================
  // 8. SWASTISRI CLASSICAL TELUGU JATHAKAM PROCLAMATION PARAGRAPH
  // ==========================================================================
  const moonNakTe = TELUGU_NAKSHATRAS[Math.floor(moon.siderealLon / (360 / 27))]?.nameTe ?? moon.nakshatra;
  const lagnaNameTe = TELUGU_RASIS[ascSign]?.nameTe.split(' ')[0] ?? '';
  const rasiNameTe = TELUGU_RASIS[moonSign]?.nameTe.split(' ')[0] ?? '';

  const swastiSriProclamationTe = `స్వస్తిశ్రీ చాంద్రమాన/సౌరమాన కలియుగ ప్రమాణే శాలివాహన శక వర్షంబులు చనుచుండగా, ఆంగ్ల తేదీ ${chart.input.date} న, స్థానిక సమయం ${chart.input.time} గంటలకు (${chart.input.city} క్షేత్రే, అక్షాంశం: ${chart.input.lat.toFixed(2)}°N, రేఖాంశం: ${chart.input.lng.toFixed(2)}°E), సూర్యోదయం ${chart.panchanga.sunTimes.sunriseLocal} గం.లకు ఆరంభమైన దిన ప్రమాణంలో, ${chart.panchanga.tithi.paksha.includes('Shukla') ? 'శుక్ల పక్ష' : 'కృష్ణ పక్ష'} ${chart.panchanga.tithi.name} తిథౌ, ${chart.panchanga.vara.sanskrit} వాసరే, ${moonNakTe} నక్షత్రే (${moon.pada}వ పాదే), ${chart.panchanga.yoga.name} యోగే, ${chart.panchanga.karana.name} కరణే, శుభ ${lagnaNameTe} లగ్నే (${TELUGU_RASIS[chart.ascendant.d9Sign]?.nameTe.split(' ')[0]} నవాంశే), ${rasiNameTe} రాశౌ చిరంజీవి/సౌభాగ్యవతి "${chart.input.name}" శుభ జననమయ్యెను.`;

  return {
    swastiSriProclamationTe,
    upagrahas,
    ishtaKashtaTable,
    bhavaBalaTable,
    vaisheshikamsaTable,
    ashtakavargaShodhana,
    sarvashtakavargaBySign: chart.ashtakavarga.sarvashtakavarga,
    sudarshanaTable,
    kharaSphutas,
  };
}
