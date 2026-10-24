/**
 * OnlineJyotish reference gate: Hyderabad, 24 Oct 2026.
 * Golden values transcribed from user-provided OnlineJyotish screenshots.
 * Timing fields are matched at the precision the reference displays; this is
 * a benchmark fixture, not an assertion that every school uses identical rules.
 */
import { computeDayPanchanga } from '../src/engine/hinduCalendarEngine.ts';

const geo = { lat: 17.385, lng: 78.4867, tzOffsetHours: 5.5, placeName: 'Hyderabad' };
const day = computeDayPanchanga('2026-10-24', geo, { siderealMode: 'lahiri', riseConvention: 'hindu' });
const checks: [string, boolean, string][] = [];
const check = (label: string, ok: boolean, value: string) => checks.push([label, ok, value]);

check('సూర్యోదయం 06:15', day.sunrise === '06:15', day.sunriseHms);
check('సూర్యాస్తమయం 17:45', day.sunset === '17:45', day.sunsetHms);
check('చంద్రోదయం 16:31', day.moonrise === '16:31', day.moonriseHms);
check('చంద్రాస్తమయం మరుసటి రోజు 05:08', day.moonset === '05:08' && day.moonsetNextDay, day.moonsetHms);
check('తిథి శుక్ల త్రయోదశి', day.tithi.number === 13, day.tithi.nameTe);
check('త్రయోదశి ముగింపు 13:37', day.tithi.endTime === '13:37', day.tithi.endClock);
check('నక్షత్రం ఉత్తరాభాద్ర', day.nakshatra.number === 26, day.nakshatra.nameTe);
check('ఉత్తరాభాద్ర ముగింపు 20:32', day.nakshatra.endTime === '20:32', day.nakshatra.endClock);
check('యోగం వ్యాఘాత', day.yoga.number === 13, day.yoga.nameTe);
check('కరణం తైతిల', day.karana.nameTe === 'తైతిల', day.karana.nameTe);
check('చంద్ర రాశి మీనం', day.moonSignIndex === 11, String(day.moonSignIndex));
check('సూర్య రాశి తుల', day.sunSignIndex === 6, String(day.sunSignIndex));
const rahu = day.kalas.find((k) => k.key === 'rahu');
check('రాహుకాలం 09:07–10:33', rahu?.startTime === '09:07' && rahu.endTime === '10:33', `${rahu?.startTime}–${rahu?.endTime}`);
const abhijit = day.kalas.find((k) => k.key === 'abhijit');
check('అభిజిత్ 11:37–12:23', abhijit?.startTime === '11:37' && abhijit.endTime === '12:23', `${abhijit?.startTime}–${abhijit?.endTime}`);
const varjyam = day.kalas.find((k) => k.key === 'varjyam');
check('వర్జ్యం 06:26–08:00', varjyam?.startTime === '06:26' && varjyam.endTime === '08:00', `${varjyam?.startTime}–${varjyam?.endTime}`);

let failures = 0;
for (const [label, ok, value] of checks) {
  console.log(`  ${ok ? '✓' : '✗'} ${label} — ${value}`);
  if (!ok) failures++;
}
console.log(`\n  OnlineJyotish screenshot gates: ${checks.length - failures}/${checks.length}`);
if (failures) process.exitCode = 1;
