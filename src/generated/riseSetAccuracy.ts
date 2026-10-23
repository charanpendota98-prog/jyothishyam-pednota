/**
 * AUTO-GENERATED — ఈ ఫైలును చేతిమీద మార్చవద్దు.
 * మూలం: scripts/verify-rise.ts (npm run verify:rise)
 * ప్రమాణం: స్విస్ ఎఫెమెరిస్ 2.10.03 rise_trans — CALC_RISE|CALC_SET తో
 * BIT_DISC_CENTER|BIT_NO_REFRACTION: బింబ కేంద్రం క్షితిజ సమతలంపై, వక్రీభవనం
 * లేదు. సూర్యుడికి ఇది BIT_HINDU_RISING తో సమానం — ఇదే డ్రిక్ పంచాంగ నిర్వచనం.
 * (పాత ప్రమాణం — ఎగువ అంచు + 34′ — 2026-10-23న సరిదిద్దబడింది; అది
 * హైదరాబాద్‌లో 4 నిమిషాలు ముందుగా ఇచ్చేది.)
 */
export interface RiseSetAccuracyRow {
  key: string;
  labelTe: string;
  maxSeconds: number;
  tolSeconds: number;
  where: string;
}

export const RISE_SET_ACCURACY = {
  source: "Swiss Ephemeris 2.10.03, SIDM_LAHIRI; rise_trans(rsmi = CALC_*|BIT_DISC_CENTER|BIT_NO_REFRACTION) = బింబ కేంద్రం క్షితిజంపై, వక్రీభవనం లేదు — డ్రిక్/హిందూ పంచాంగ సంప్రదాయం (సూర్యుడికి BIT_HINDU_RISING తో సమానం); tithi/nakshatra/yoga/karana సూర్యోదయ క్షణంలో, 1-ఆధారితం",
  definitionTe: 'బింబ కేంద్రం క్షితిజంపై, వక్రీభవనం లేదు (డ్రిక్ పంచాంగ ప్రమాణం)',
  definitionEn: 'disc centre on the geometric horizon, no refraction (Drik Panchanga standard)',
  polarNoteTe:
    'ధ్రువ/అధిక అక్షాంశం (|lat| ≥ 50°) దినాలు విడిగా లెక్కించబడ్డాయి — అక్కడ బింబం క్షితిజాన్ని తాకి తాకనట్టు (grazing) కదులుతుంది, కాబట్టి నిమిషాల భేదం సహజం.',
  cases: 528,
  checks: 4746,
  passed: 4746,
  failed: 0,
  rows: [
  {
    "key": "sunrise",
    "labelTe": "సూర్యోదయం",
    "maxSeconds": 51,
    "tolSeconds": 60,
    "where": "Sydney 2026-06-21"
  },
  {
    "key": "sunset",
    "labelTe": "సూర్యాస్తమయం",
    "maxSeconds": 50,
    "tolSeconds": 60,
    "where": "Delhi 2026-12-21"
  },
  {
    "key": "moonrise",
    "labelTe": "చంద్రోదయం",
    "maxSeconds": 55,
    "tolSeconds": 120,
    "where": "New York 2026-12-21"
  },
  {
    "key": "moonset",
    "labelTe": "చంద్రాస్తమయం",
    "maxSeconds": 53,
    "tolSeconds": 120,
    "where": "Tokyo 2026-02-15"
  }
],
} as const;
