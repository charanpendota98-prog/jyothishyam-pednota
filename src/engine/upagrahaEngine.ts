/**
 * ఉపగ్రహ చక్రం — Upagraha (aprakāśa graha) engine.
 *
 * Two families are covered, exactly as a classical Telugu patrikā prints them
 * on its "ఉపగ్రహ కుండలి" page:
 *
 * 1. **Sun-derived (aprakāśa) upagrahas** — BPHS ch. 25 / Santhanam tr.:
 *      Dhūma       = Sun + 133°20′
 *      Vyatīpāta   = 360° − Dhūma
 *      Pariveṣa    = Vyatīpāta + 180°   (= Paridhi)
 *      Indracāpa   = 360° − Pariveṣa     (= Cāpa / Kodanda)
 *      Upaketu     = Indracāpa + 16°40′  (= Sun − 30°)
 *    These five are strictly Sun-relative, so they can be — and in the
 *    verification harness are — pinned to the second of arc.
 *
 * 2. **Kāla-velā upagrahas** — the eight equal parts of the *day* (sunrise →
 *    sunset) or of the *night* (sunset → next sunrise), each ruled by a weekday
 *    lord in the order Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn.
 *      • the part lord Mars     → **Mṛtyu**
 *      • the part lord Mercury  → **Arthaprahāra**
 *      • the part lord Jupiter  → **Yamakaṇṭaka**
 *      • the part lord Sun      → **Kāla**
 *      • the part lord Saturn   → **Gulika**
 *      • the part lord Moon     → **Paridhi**   (southern patrikā usage)
 *      • the part lord Venus    → **Kodaṇḍa**   (southern patrikā usage)
 *    The upagraha's longitude is the **ascendant at the start of its part**.
 *    **Māndi** is the ascendant at the *end* of Saturn's part — which is why in
 *    printed patrikās Māndi and Kāla frequently fall on exactly the same point.
 *
 * Reference convention notes (documented deliberately, not silently):
 *   • For a night birth the first part starts at *sunset of the birth date*;
 *     for births after midnight the night belongs to the previous weekday, so
 *     the part lords are taken from the weekday on which the night began.
 *   • Printed patrikās differ from this engine by ≲1.5° in the kāla-velā set
 *     when their sunrise/sunset differs by a few minutes; the Sun-derived five
 *     are exact.
 */

import {
  civilWeekdayAt,
  localHoursOfDay,
  localMidnightJd,
  norm360,
  riseSetForLocalDate,
} from './astroCore.ts';
import { ascendantTropical, ayanamsaDegrees } from './astroCore.ts';
import {
  degToDmsShort,
  BHAVA_RASI_SHORT_TE,
  BHAVA_RASI_TE,
} from './bhavaSandhiEngine.ts';
import type { CompleteChartResult } from './ephemeris.ts';

export type UpagrahaKind = 'sun' | 'kala';

export interface UpagrahaRow {
  id: string;
  nameTe: string;
  nameEn: string;
  sanskrit: string;
  kind: UpagrahaKind;
  /** sidereal longitude */
  lon: number;
  rasiTe: string;
  rasiShortTe: string;
  signIndex: number;
  degInSign: number;
  dms: string;
  house: number;
  /** part lord (kāla family only) */
  partLordTe?: string;
  partNumber?: number;
  partStartLocal?: string;
  natureTe: string;
  effectTe: string;
  /** how the longitude is derived (Sun-derived family) */
  chainTe?: string;
}

export interface UpagrahaReport {
  rows: UpagrahaRow[];
  sunLon: number;
  sunriseTe: string;
  sunsetTe: string;
  birthInDayTime: boolean;
  partLengthMinutes: number;
  methodNoteTe: string;
  caveatTe: string;
}

const SUN_PARTS: { id: string; nameTe: string; nameEn: string; sanskrit: string; lonOf: (sun: number) => number; chainTe: string; natureTe: string; effectTe: string }[] = [
  {
    id: 'Dhuma', nameTe: 'ధూముడు', nameEn: 'Dhuma', sanskrit: 'धूम', lonOf: (sun) => sun + 133 + 20 / 60, chainTe: 'సూర్యుడు + 133°20′',
    natureTe: 'పాప గ్రహం',
    effectTe: 'పొగ వంటి ఆవరణ — ఆరోగ్య భంగం, అపవాదు, గందరగోళం. ఏ భావంలో ఉంటే ఆ భావ విషయాలపై మసక పడుతుంది.',
  },
  {
    id: 'Vyatipata', nameTe: 'వ్యతీపాతుడు', nameEn: 'Vyatipata', sanskrit: 'व्यतीपात', lonOf: (sun) => 226 + 40 / 60 - sun, chainTe: '360° − ధూమ',
    natureTe: 'అతి పాప గ్రహం',
    effectTe: 'అకస్మాత్తు పతనం, ప్రమాదం, ఆస్తి నష్టం. దశలో వచ్చినపుడు ప్రయాణాలు, ఒప్పందాలు మొదలుపెట్టకూడదు.',
  },
  {
    id: 'Parivesha', nameTe: 'పరివేషుడు', nameEn: 'Parivesha', sanskrit: 'परिवेष', lonOf: (sun) => 46 + 40 / 60 - sun, chainTe: 'వ్యతీపాత + 180°',
    natureTe: 'పాప గ్రహం',
    effectTe: 'పరివేషం (హాలో) — బాహ్యంగా కాంతి, లోపల బంధనం. ప్రసిద్ధి కలిగినా స్వాతంత్ర్యం తక్కువ.',
  },
  {
    id: 'Indrachapa', nameTe: 'ఇంద్రచాపుడు', nameEn: 'Indrachapa', sanskrit: 'इन्द्रचाप', lonOf: (sun) => sun + 133 + 20 / 60 + 180, chainTe: '360° − పరివేష (= ధూమ + 180°)',
    natureTe: 'పాప గ్రహం (కోదండం)',
    effectTe: 'ఇంద్రధనుస్సు — ఆశ్చర్యకర మార్పులు, హఠాత్తుగా లాభం తర్వాత నష్టం; ఆయుధ/శిలాఘాత భయం.',
  },
  {
    id: 'Upaketu', nameTe: 'ఉపకేతువు', nameEn: 'Upaketu', sanskrit: 'उपकेतु', lonOf: (sun) => sun + 330, chainTe: 'ఇంద్రచాప + 16°40′ (= సూర్యుడు − 30°)',
    natureTe: 'పాప గ్రహం',
    effectTe: 'కేతు స్వరూపం — వైరాగ్యం, మోక్షాభిముఖ్యం, మాయ. సూర్యుడికి 30° వెనుక నిలుస్తుంది.',
  },
];

const WEEKDAY_LORDS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
const WEEKDAY_LORDS_TE: Record<string, string> = {
  Sun: 'సూర్యుడు', Moon: 'చంద్రుడు', Mars: 'కుజుడు', Mercury: 'బుధుడు',
  Jupiter: 'గురువు', Venus: 'శుక్రుడు', Saturn: 'శని',
};

const PART_UPAGRAHA: Record<string, { id: string; nameTe: string; nameEn: string; sanskrit: string; natureTe: string; effectTe: string }> = {
  Mars: {
    id: 'Mrityu', nameTe: 'మృత్యువు', nameEn: 'Mrityu', sanskrit: 'मृत्यु', natureTe: 'పాప గ్రహం',
    effectTe: 'మృత్యు స్థానం — ఆయుర్విషయాలు, హఠాత్తు భయాలు, దీర్ఘ రోగాల సూచన.',
  },
  Mercury: {
    id: 'Arthaprahara', nameTe: 'అర్థప్రహరుడు', nameEn: 'Arthaprahara', sanskrit: 'अर्थप्रहर', natureTe: 'పాప గ్రహం',
    effectTe: 'ధన, వాక్కు, వాణిజ్య హాని; ఒప్పందాలలో మోసం.',
  },
  Jupiter: {
    id: 'Yamaghantaka', nameTe: 'యమకంటకుడు', nameEn: 'Yamaghantaka', sanskrit: 'यमघण्टक', natureTe: 'పాప గ్రహం',
    effectTe: 'యముని గంట — ఆకస్మిక ఆటంకాలు, ధర్మ కార్యాలలో అడ్డంకి.',
  },
  Sun: {
    id: 'Kaala', nameTe: 'కాలుడు', nameEn: 'Kaala', sanskrit: 'काल', natureTe: 'పాప గ్రహం',
    effectTe: 'కాల పురుషుడు — జీవిత కాలక్రమం, తండ్రి, ఆధికారంపై ప్రభావం.',
  },
  Saturn: {
    id: 'Gulika', nameTe: 'గుళికుడు', nameEn: 'Gulika', sanskrit: 'गुलिक', natureTe: 'అతి పాప గ్రహం',
    effectTe: 'శని అంశ — కష్టం, ఆలస్యం, శిక్ష. దశలో తీవ్ర శ్రమ అవసరం; పరిహారానికి అత్యంత ముఖ్యమైన ఉపగ్రహం.',
  },
  Moon: {
    id: 'Paridhi', nameTe: 'పరిధి', nameEn: 'Paridhi', sanskrit: 'परिधि', natureTe: 'పాప గ్రహం',
    effectTe: 'పరిధి — మనోవికారం, భ్రమ, చంద్ర సంబంధ విషయాలలో అస్థిరత.',
  },
  Venus: {
    id: 'Kodanda', nameTe: 'కోదండుడు', nameEn: 'Kodanda', sanskrit: 'कोदण्ड', natureTe: 'పాప గ్రహం',
    effectTe: 'కోదండం — స్త్రీ, కళ, వాహన విషయాలలో హాని; శుక్ర స్వభావానికి వ్యతిరేక ఫలితం.',
  },
};

function hm(jd: number, tz: number): string {
  const h = localHoursOfDay(jd, tz);
  const hh = Math.floor(h);
  const mm = Math.floor((h - hh) * 60);
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

function ascSiderealAt(jd: number, lat: number, lng: number): number {
  return norm360(ascendantTropical(jd, lat, lng) - ayanamsaDegrees(jd, 'lahiri'));
}

export function computeUpagrahas(chart: CompleteChartResult): UpagrahaReport {
  const sun = chart.planets.find((p) => p.id === 'Sun');
  const sunLon = sun ? norm360(sun.siderealLon) : 0;
  const lat = chart.input.lat;
  const lng = chart.input.lng;
  const tz = chart.input.tzOffsetHours;
  const jd = chart.julianDay;
  const ascSign = chart.ascendant.signIndex;

  const houseOf = (lon: number) => ((Math.floor(norm360(lon) / 30) - ascSign + 12) % 12) + 1;

  const makeRow = (
    lon: number,
    base: Omit<UpagrahaRow, 'lon' | 'rasiTe' | 'rasiShortTe' | 'signIndex' | 'degInSign' | 'dms' | 'house'>
  ): UpagrahaRow => {
    const L = norm360(lon);
    const signIndex = Math.floor(L / 30);
    return {
      ...base,
      lon: Number(L.toFixed(4)),
      rasiTe: BHAVA_RASI_TE[signIndex],
      rasiShortTe: BHAVA_RASI_SHORT_TE[signIndex],
      signIndex,
      degInSign: Number((L % 30).toFixed(4)),
      dms: degToDmsShort(L % 30),
      house: houseOf(L),
    };
  };

  const rows: UpagrahaRow[] = SUN_PARTS.map((p) => {
    const row = makeRow(p.lonOf(sunLon), {
      id: p.id,
      nameTe: p.nameTe,
      nameEn: p.nameEn,
      sanskrit: p.sanskrit,
      kind: 'sun',
      natureTe: p.natureTe,
      effectTe: p.effectTe,
    });
    return { ...row, chainTe: p.chainTe };
  });

  // ── kāla-velā family ────────────────────────────────────────────────
  const rs = riseSetForLocalDate(chart.input.date, lat, lng, tz);
  const sunriseJd = rs.sunriseJd ?? jd;
  const sunsetJd = rs.sunsetJd ?? jd + 0.25;
  const birthHours = localHoursOfDay(jd, tz);
  const sunriseHours = localHoursOfDay(sunriseJd, tz);
  const sunsetHours = localHoursOfDay(sunsetJd, tz);
  // Night spans sunset → next sunrise (add 1 day to the sunrise JD).
  const isDay = birthHours >= sunriseHours && birthHours < sunsetHours;
  const partStartJd = isDay ? sunriseJd : sunsetJd;
  const partEndJd = isDay ? sunsetJd : sunriseJd + 1;
  const partLength = (partEndJd - partStartJd) / 8;
  const partLengthMinutes = partLength * 1440;

  // Weekday that rules the *segment*: for a night birth the night belongs to the
  // weekday on which it began, so use the weekday of the sunset instant.
  const weekdayIndex = civilWeekdayAt(isDay ? jd : sunsetJd, tz); // 0 = Sunday
  const sessionOffsetDays = isDay ? 0 : 4; // 5th weekday *including* the day itself
  const startLordIndex = (weekdayIndex + sessionOffsetDays) % 7;

  for (let i = 0; i < 7; i++) {
    const lord = WEEKDAY_LORDS[(startLordIndex + i) % 7];
    const meta = PART_UPAGRAHA[lord];
    if (!meta) continue;
    const startJd = partStartJd + i * partLength;
    const lon = ascSiderealAt(startJd, lat, lng);
    rows.push(
      makeRow(lon, {
        id: meta.id,
        nameTe: meta.nameTe,
        nameEn: meta.nameEn,
        sanskrit: meta.sanskrit,
        kind: 'kala',
        partLordTe: WEEKDAY_LORDS_TE[lord],
        partNumber: i + 1,
        partStartLocal: hm(startJd, tz),
        natureTe: meta.natureTe,
        effectTe: meta.effectTe,
      })
    );
    if (meta.id === 'Gulika') {
      // Māndi = ascendant at the *end* of Saturn's part (start of the next part).
      rows.push(
        makeRow(ascSiderealAt(startJd + partLength, lat, lng), {
          id: 'Mandi',
          nameTe: 'మాంది',
          nameEn: 'Mandi',
          sanskrit: 'मान्दि',
          kind: 'kala',
          partLordTe: 'శని',
          partNumber: i + 1,
          partStartLocal: hm(startJd + partLength, tz),
          natureTe: 'అతి పాప గ్రహం',
          effectTe:
            'గుళిక అంత్య స్థానం — మాంది. శని అంశ ముగింపు క్షణపు లగ్నం; గుళికతో సమానంగా వచ్చినపుడు శని ప్రభావం రెట్టింపు.',
        })
      );
    }
  }

  return {
    rows,
    sunLon: Number(sunLon.toFixed(4)),
    sunriseTe: hm(sunriseJd, tz),
    sunsetTe: hm(sunsetJd, tz),
    birthInDayTime: isDay,
    partLengthMinutes: Number(partLengthMinutes.toFixed(1)),
    methodNoteTe:
      'సూర్యాధారిత ఉపగ్రహాలు (ధూమ, వ్యతీపాత, పరివేష, ఇంద్రచాప, ఉపకేతు) BPHS 25వ అధ్యాయం ప్రకారం సూర్య స్థానం నుండి స్థిర కోణాలలో నిలుస్తాయి. కాల వేళ ఉపగ్రహాలు (మృత్యు, అర్థప్రహర, యమకంటక, కాల, గుళిక, మాంది) పగలు/రాత్రిని ఎనిమిది సమాన భాగాలుగా విభజించి, ఆ భాగాధిపతి ప్రారంభ క్షణపు లగ్నాన్ని తీసుకోవడం ద్వారా కనుగొంటారు.',
    caveatTe: `పగలు ${isDay ? 'జననం — సూర్యోదయం నుండి' : 'జననం — సూర్యాస్తమయం నుండి'} లెక్క. భాగ కాలం ${partLengthMinutes.toFixed(1)} నిమిషాలు. గుళిక = శని భాగారంభ లగ్నం; మాంది = ఆ భాగ ముగింపు లగ్నం. కొన్ని పత్రికలు మాందిని భాగ మధ్యానికి తీసుకుంటాయి — తేడా నమోదు చేయబడింది.`,
  };
}
