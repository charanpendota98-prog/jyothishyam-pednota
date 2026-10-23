/**
 * AUTO-GENERATED — ఈ ఫైలును చేతిమీద మార్చవద్దు.
 * మూలం: scripts/verify-rise.ts (npm run verify:rise)
 * ప్రమాణం: స్విస్ ఎఫెమెరిస్ 2.10.03 rise_trans — బింబపు ఎగువ అంచు + 34′
 * వాతావరణ వక్రీభవనం (1013.25 hPa, 15 °C, సముద్ర మట్టం). ఇదే దృక్ పంచాంగ నిర్వచనం.
 */
export interface RiseSetAccuracyRow {
  key: string;
  labelTe: string;
  maxSeconds: number;
  tolSeconds: number;
  where: string;
}

export const RISE_SET_ACCURACY = {
  source: "Swiss Ephemeris 2.10.03, FLG_SWIEPH, SIDM_LAHIRI, rise_trans (upper limb + 34' refraction, 0 m)",
  definitionTe: 'ఎగువ అంచు + వాతావరణ వక్రీభవనం (దృక్ పంచాంగం)',
  definitionEn: 'upper limb + atmospheric refraction (Drik Panchanga standard)',
  cases: 528,
  checks: 4745,
  passed: 4745,
  failed: 0,
  rows: [
  {
    "key": "sunrise",
    "labelTe": "సూర్యోదయం",
    "maxSeconds": 29,
    "tolSeconds": 60,
    "where": "Reykjavik 2026-06-21"
  },
  {
    "key": "sunset",
    "labelTe": "సూర్యాస్తమయం",
    "maxSeconds": 19,
    "tolSeconds": 60,
    "where": "Reykjavik 2025-12-21"
  },
  {
    "key": "moonrise",
    "labelTe": "చంద్రోదయం",
    "maxSeconds": 24,
    "tolSeconds": 120,
    "where": "Reykjavik 2026-12-21"
  },
  {
    "key": "moonset",
    "labelTe": "చంద్రాస్తమయం",
    "maxSeconds": 21,
    "tolSeconds": 120,
    "where": "Reykjavik 2025-01-14"
  }
],
} as const;
