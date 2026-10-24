/**
 * AUTO-GENERATED — ఈ ఫైలును చేతిమీద మార్చవద్దు.
 * మూలం: scripts/verify-calendar-lunar.ts (npm run verify:calendar)
 * ప్రమాణం: స్విస్ ఎఫెమెరిస్ 2.10.03 (SIDM_LAHIRI) — అమావాస్య క్షణం, సంక్రమణి క్షణం,
 * చాంద్రమాస ఆరంభం, అధిక మాసం, ఉగాది (క్షయ ప్రతిపద సహా).
 */
export const LUNAR_CALENDAR_ACCURACY = {
  source: "Swiss Ephemeris 2.10.03, FLG_SWIEPH, SIDM_LAHIRI — amanta lunar months",
  checks: 411,
  passed: 411,
  failed: 0,
  newMoonTolMinutes: 2,
  sankrantiTolMinutes: 2,
  maxNewMoonMinutes: 0.69,
  maxSankrantiMinutes: 0.63,
  maxMasaStartMinutes: 0.69,
  newMoons: 102,
  sankrantis: 98,
  amantaMonths: 101,
  adhikaMonths: 3,
  ugadis: 8,
  frameNoteTe: 'నిరయనం = మధ్యమ విషువత్తు (పోషణ రహిత) చట్రం — లహిరి అయనాంశంతో',
  frameNoteEn: 'sidereal = mean equinox frame (nutation removed) + Lahiri ayanamsa',
} as const;
