/**
 * AUTO-GENERATED — ఈ ఫైలును చేతితో మార్చవద్దు.
 * మూలం: scripts/verify-astro.ts (npm run verify:astro)
 * ప్రమాణం: Swiss Ephemeris 2.10.03, SIDM_LAHIRI, whole-sign houses, FLG_SWIEPH; Rahu/Ketu are TRUE_NODE, RahuMean/KetuMean are MEAN_NODE (పంచాంగ సంప్రదాయం)
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
  "source": "Swiss Ephemeris 2.10.03, SIDM_LAHIRI, whole-sign houses, FLG_SWIEPH; Rahu/Ketu are TRUE_NODE, RahuMean/KetuMean are MEAN_NODE (పంచాంగ సంప్రదాయం)",
  "fixtureEpochs": 30,
  "firstUtc": "1900-06-15T00:00:00",
  "lastUtc": "2030-12-31T23:59:00",
  "measurements": 660,
  "passed": 660,
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
      "maxDeg": 0.000731,
      "maxArcsec": 2.63,
      "tolDeg": 0.008,
      "where": "1900 Chennai"
    },
    {
      "key": "ay:pushya",
      "labelTe": "పుష్య",
      "maxDeg": 0.001178,
      "maxArcsec": 4.24,
      "tolDeg": 0.008,
      "where": "1900 Chennai"
    },
    {
      "key": "asc",
      "labelTe": "లగ్నం",
      "maxDeg": 0.000073,
      "maxArcsec": 0.26,
      "tolDeg": 0.01,
      "where": "Charan 1998-05-14 08:45 IST Hyderabad"
    },
    {
      "key": "mc",
      "labelTe": "మధ్యాకాశం",
      "maxDeg": 0.000071,
      "maxArcsec": 0.26,
      "tolDeg": 0.01,
      "where": "random 14"
    },
    {
      "key": "Sun",
      "labelTe": "సూర్యుడు",
      "maxDeg": 0.000414,
      "maxArcsec": 1.49,
      "tolDeg": 0.01,
      "where": "random 17"
    },
    {
      "key": "Moon",
      "labelTe": "చంద్రుడు",
      "maxDeg": 0.001274,
      "maxArcsec": 4.59,
      "tolDeg": 0.01,
      "where": "mkjxc 2026-10-22 22:55 IST Hyderabad"
    },
    {
      "key": "Mars",
      "labelTe": "కుజుడు",
      "maxDeg": 0.003109,
      "maxArcsec": 11.19,
      "tolDeg": 0.01,
      "where": "Year forecast 1988-09-21 10:18 IST Hansi"
    },
    {
      "key": "Mercury",
      "labelTe": "బుధుడు",
      "maxDeg": 0.002278,
      "maxArcsec": 8.2,
      "tolDeg": 0.01,
      "where": "2024 total solar eclipse Dallas"
    },
    {
      "key": "Jupiter",
      "labelTe": "గురువు",
      "maxDeg": 0.001579,
      "maxArcsec": 5.68,
      "tolDeg": 0.01,
      "where": "random 7"
    },
    {
      "key": "Venus",
      "labelTe": "శుక్రుడు",
      "maxDeg": 0.005657,
      "maxArcsec": 20.37,
      "tolDeg": 0.01,
      "where": "mkjxc 2026-10-22 22:55 IST Hyderabad"
    },
    {
      "key": "Saturn",
      "labelTe": "శని",
      "maxDeg": 0.002888,
      "maxArcsec": 10.4,
      "tolDeg": 0.01,
      "where": "mkjxc 2026-10-22 22:55 IST Hyderabad"
    },
    {
      "key": "Uranus",
      "labelTe": "యురేనస్",
      "maxDeg": 0.003101,
      "maxArcsec": 11.16,
      "tolDeg": 0.01,
      "where": "J2000 Greenwich"
    },
    {
      "key": "Neptune",
      "labelTe": "నెప్ట్యూన్",
      "maxDeg": 0.004839,
      "maxArcsec": 17.42,
      "tolDeg": 0.01,
      "where": "Mumbai 2015"
    },
    {
      "key": "Pluto",
      "labelTe": "ప్లూటో",
      "maxDeg": 0.000955,
      "maxArcsec": 3.44,
      "tolDeg": 0.01,
      "where": "1900 Chennai"
    },
    {
      "key": "Rahu",
      "labelTe": "రాహు (మధ్యమ)",
      "maxDeg": 0.004688,
      "maxArcsec": 16.88,
      "tolDeg": 0.01,
      "where": "random 14"
    },
    {
      "key": "Ketu",
      "labelTe": "కేతు (మధ్యమ)",
      "maxDeg": 0.004688,
      "maxArcsec": 16.88,
      "tolDeg": 0.01,
      "where": "random 14"
    },
    {
      "key": "RahuTrue",
      "labelTe": "రాహు (సత్య)",
      "maxDeg": 0.006374,
      "maxArcsec": 22.95,
      "tolDeg": 0.01,
      "where": "New York 1975"
    }
  ],
  "classicalMaxDeg": 0.006374000000050728
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
