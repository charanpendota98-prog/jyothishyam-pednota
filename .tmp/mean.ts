import { trueNodeTropical, ayanamsaDegrees } from '../src/engine/astroCore.ts';
const jdOf = (iso: string) => new Date(iso).getTime()/86400000 + 2440587.5;
function meanNodeTropical(jd: number) {
  const T = (jd - 2451545.0) / 36525;
  const om = 125.0445479 - 1934.1362891*T + 0.0020754*T*T + (T*T*T)/467441 - (T**4)/60616000;
  return ((om % 360) + 360) % 360;
}
for (const iso of ['2026-10-22T17:25:00Z','1998-05-14T03:15:00Z','1947-08-14T18:30:00Z','2000-01-01T12:00:00Z']) {
  const jd = jdOf(iso);
  console.log(iso, 'sidTrue', (trueNodeTropical(jd)-ayanamsaDegrees(jd,'lahiri')).toFixed(5), 'sidMean', (meanNodeTropical(jd)-ayanamsaDegrees(jd,'lahiri')).toFixed(5));
}
