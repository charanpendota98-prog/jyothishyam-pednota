/**
 * AUTO-GENERATED — ఈ ఫైలును చేతితో మార్చవద్దు.
 * మూలం: scripts/verify-astro.ts (npm run verify:astro)
 * ప్రమాణం: Swiss Ephemeris 2.10.03, SIDM_LAHIRI, TRUE_NODE, whole-sign houses, FLG_SWIEPH
 * తయారీ: scripts/golden/make-ephemeris-golden.py (pyswisseph)
 */
export interface EphemerisAccuracyRow {
  key: string;
  labelTe: string;
  maxDeg: number;
  maxArcsec: number;
  tolDeg: number;
  where: string;
}

export const EPHEMERIS_ACCURACY = {
  "source": "Swiss Ephemeris 2.10.03, SIDM_LAHIRI, TRUE_NODE, whole-sign houses, FLG_SWIEPH",
  "fixtureEpochs": 30,
  "firstUtc": "1900-06-15T00:00:00",
  "lastUtc": "2030-12-31T23:59:00",
  "measurements": 630,
  "passed": 630,
  "failed": 0,
  "rows": [
    {
      "key": "ay:lahiri",
      "labelTe": "లహిరి (చిత్రపక్ష)",
      "maxDeg": 0.000049,
      "maxArcsec": 0.18,
      "tolDeg": 0.001,
      "where": "Nadi sample 1947-08-15 00:00 IST Delhi"
    },
    {
      "key": "ay:raman",
      "labelTe": "రామన్",
      "maxDeg": 0.00005,
      "maxArcsec": 0.18,
      "tolDeg": 0.001,
      "where": "Nadi sample 1947-08-15 00:00 IST Delhi"
    },
    {
      "key": "ay:kp",
      "labelTe": "కృష్ణమూర్తి (KP)",
      "maxDeg": 0.000048,
      "maxArcsec": 0.17,
      "tolDeg": 0.001,
      "where": "random 11"
    },
    {
      "key": "ay:fagan_bradley",
      "labelTe": "ఫాగన్-బ్రాడ్లీ",
      "maxDeg": 0.000048,
      "maxArcsec": 0.17,
      "tolDeg": 0.001,
      "where": "random 14"
    },
    {
      "key": "ay:yukteshwar",
      "labelTe": "యుక్తేశ్వర్",
      "maxDeg": 0.000049,
      "maxArcsec": 0.18,
      "tolDeg": 0.001,
      "where": "1900 Chennai"
    },
    {
      "key": "ay:true_citra",
      "labelTe": "నిజ చిత్రా",
      "maxDeg": 0.005191,
      "maxArcsec": 18.69,
      "tolDeg": 0.008,
      "where": "random 14"
    },
    {
      "key": "ay:pushya",
      "labelTe": "పుష్య",
      "maxDeg": 0.005678,
      "maxArcsec": 20.44,
      "tolDeg": 0.008,
      "where": "1900 Chennai"
    },
    {
      "key": "asc",
      "labelTe": "లగ్నం",
      "maxDeg": 0.005436,
      "maxArcsec": 19.57,
      "tolDeg": 0.03,
      "where": "random 2"
    },
    {
      "key": "mc",
      "labelTe": "మధ్యాకాశం",
      "maxDeg": 0.004708,
      "maxArcsec": 16.95,
      "tolDeg": 0.05,
      "where": "random 17"
    },
    {
      "key": "Sun",
      "labelTe": "సూర్యుడు",
      "maxDeg": 0.004621,
      "maxArcsec": 16.64,
      "tolDeg": 0.01,
      "where": "random 14"
    },
    {
      "key": "Moon",
      "labelTe": "చంద్రుడు",
      "maxDeg": 0.005558,
      "maxArcsec": 20.01,
      "tolDeg": 0.02,
      "where": "Sydney 2030"
    },
    {
      "key": "Mars",
      "labelTe": "కుజుడు",
      "maxDeg": 0.00608,
      "maxArcsec": 21.89,
      "tolDeg": 0.03,
      "where": "random 10"
    },
    {
      "key": "Mercury",
      "labelTe": "బుధుడు",
      "maxDeg": 0.004777,
      "maxArcsec": 17.2,
      "tolDeg": 0.03,
      "where": "Nadi sample 1947-08-15 00:00 IST Delhi"
    },
    {
      "key": "Jupiter",
      "labelTe": "గురువు",
      "maxDeg": 0.005979,
      "maxArcsec": 21.52,
      "tolDeg": 0.03,
      "where": "random 7"
    },
    {
      "key": "Venus",
      "labelTe": "శుక్రుడు",
      "maxDeg": 0.005345,
      "maxArcsec": 19.24,
      "tolDeg": 0.03,
      "where": "random 7"
    },
    {
      "key": "Saturn",
      "labelTe": "శని",
      "maxDeg": 0.006657,
      "maxArcsec": 23.97,
      "tolDeg": 0.03,
      "where": "random 6"
    },
    {
      "key": "Uranus",
      "labelTe": "యురేనస్",
      "maxDeg": 0.007001,
      "maxArcsec": 25.2,
      "tolDeg": 0.03,
      "where": "J2000 Greenwich"
    },
    {
      "key": "Neptune",
      "labelTe": "నెప్ట్యూన్",
      "maxDeg": 0.008023,
      "maxArcsec": 28.88,
      "tolDeg": 0.03,
      "where": "random 1"
    },
    {
      "key": "Pluto",
      "labelTe": "ప్లూటో",
      "maxDeg": 0.005455,
      "maxArcsec": 19.64,
      "tolDeg": 0.03,
      "where": "1900 Chennai"
    },
    {
      "key": "Rahu",
      "labelTe": "రాహు",
      "maxDeg": 0.006681,
      "maxArcsec": 24.05,
      "tolDeg": 0.03,
      "where": "1900 Chennai"
    },
    {
      "key": "Ketu",
      "labelTe": "కేతు",
      "maxDeg": 0.006681,
      "maxArcsec": 24.05,
      "tolDeg": 0.03,
      "where": "1900 Chennai"
    }
  ],
  "classicalMaxDeg": 0.0066809999999577485
} as {
  source: string;
  fixtureEpochs: number;
  firstUtc: string;
  lastUtc: string;
  measurements: number;
  passed: number;
  failed: number;
  rows: EphemerisAccuracyRow[];
  classicalMaxDeg: number;
};
