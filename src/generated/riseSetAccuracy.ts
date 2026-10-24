/**
 * AUTO-GENERATED — ఈ ఫైలును చేతిమీద మార్చవద్దు.
 * మూలం: scripts/verify-rise.ts (npm run verify:rise)
 * ప్రమాణం: స్విస్ ఎఫెమెరిస్ 2.10.03 rise_trans(rsmi = CALC_*|BIT_HINDU_RISING) —
 * భూకేంద్ర స్థానం, విషువత్ అక్షాంశం సున్నా, వక్రీభవనం లేదు, బింబ కేంద్రం
 * క్షితిజంపై. ఇదే డ్రిక్ పంచాంగ నిర్వచనం. సూర్య ఘటనలు [అర్ధరాత్రి, మరుసటి
 * అర్ధరాత్రి), చంద్ర ఘటనలు [సూర్యోదయం, మరుసటి సూర్యోదయం).
 * (పాత ప్రమాణం — ఎగువ అంచు + 34′ — హైదరాబాద్‌లో 4 నిమిషాలు ముందుగా ఇచ్చేది.)
 */
export interface RiseSetAccuracyRow {
  key: string;
  labelTe: string;
  maxSeconds: number;
  tolSeconds: number;
  where: string;
}

export const RISE_SET_ACCURACY = {
  source: "Swiss Ephemeris 2.10.03, FLG_SWIEPH, SIDM_LAHIRI, rise_trans(rsmi = BIT_HINDU_RISING | CALC_RISE/SET) — బింబ కేంద్రం, వక్రీభవనం లేదు, వక్రీభవన రహిత క్షితిజం (డ్రిక్ పంచాంగ నిర్వచనం), 0 m; tithi/nakshatra/yoga/karana సూర్యోదయ క్షణంలో",
  definitionTe: 'బింబ కేంద్రం క్షితిజంపై, వక్రీభవనం లేదు, భూకేంద్ర స్థానం (డ్రిక్ పంచాంగ ప్రమాణం)',
  definitionEn: 'geocentric position, zero ecliptic latitude, disc centre, no refraction (Drik Panchanga standard)',
  polarNoteTe:
    'ధ్రువ/అధిక అక్షాంశం (|lat| ≥ 50°) దినాలు విడిగా లెక్కించబడ్డాయి — అక్కడ బింబం క్షితిజాన్ని తాకి తాకనట్టు (grazing) కదులుతుంది, కాబట్టి నిమిషాల భేదం సహజం.',
  cases: 528,
  checks: 4752,
  passed: 4752,
  failed: 0,
  rows: [
  {
    "key": "sunrise",
    "labelTe": "సూర్యోదయం",
    "maxSeconds": 30,
    "tolSeconds": 60,
    "where": "Mumbai 2026-02-15"
  },
  {
    "key": "sunset",
    "labelTe": "సూర్యాస్తమయం",
    "maxSeconds": 30,
    "tolSeconds": 60,
    "where": "Delhi 2026-12-21"
  },
  {
    "key": "moonrise",
    "labelTe": "చంద్రోదయం",
    "maxSeconds": 30,
    "tolSeconds": 120,
    "where": "Hyderabad 2025-12-21"
  },
  {
    "key": "moonset",
    "labelTe": "చంద్రాస్తమయం",
    "maxSeconds": 30,
    "tolSeconds": 120,
    "where": "Chennai 2025-01-14"
  }
],
} as const;
