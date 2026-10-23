/**
 * verify-conventions.ts — చట్రం (నిరయన/సాయన) మరియు ఉదయ నిర్వచనాల పరీక్ష
 * ------------------------------------------------------------------------
 * "మరో పంచాంగ యాప్ వేరే సమయాలు చూపుతోంది" అనే ప్రశ్నకు కొలవగల సమాధానం:
 * ఒకే రోజు, ఒకే ఊరు — రెండు నిర్వచనాలతో మన ఇంజిన్ ఏమిస్తుందో ఇక్కడ నిర్దిష్ట
 * సూచన విలువలతో పోలుస్తాము.
 *
 * సూచన (Siddipet 2026-10-23, Hindu Calendar యాప్ స్క్రీన్‌షాట్ —
 * **సాయన** చట్రం, బింబ కేంద్రం + వక్రీభవనం):
 *   సూర్యోదయం 06:11:31 · సూర్యాస్తమయం 17:46:01
 *   చంద్రోదయం 15:43:53 · చంద్రాస్తమయం 28:10:41 (= మరుసటి రోజు 04:10:41)
 *   సూర్యుడు వృశ్చికంలోకి 15:06:41 · చంద్రుడు మేషంలోకి 25:22:19
 *   మాసం కార్తీకం (అమావాస్యాంతం), Solar tithi 1 · మార్గశిరం
 *
 * రెండవ సూచన (drik-panchanga — డ్రిక్ పంచాంగం వెనుక ఉన్న అదే కోడ్,
 * నిరయన చిత్రపక్ష + హిందూ ఉదయ నిర్వచనం):
 *   సూర్యోదయం 06:14:02 · సూర్యాస్తమయం 17:43:39
 *
 * రెండూ మన ఇంజిన్‌తో కుదరడమే ఈ గేట్ నిరూపిస్తుంది — అంటే తేడా లెక్కలో
 * కాదు, **నిర్వచనంలో** ఉంది.
 */
import { computeDayPanchanga, type DayPanchanga } from '../src/engine/hinduCalendarEngine.ts';
import type { RiseConvention, SiderealMode } from '../src/engine/astroCore.ts';

const GEO = { lat: 18.1018, lng: 78.852, tzOffsetHours: 5.5, placeName: 'Siddipet' };

let checks = 0;
let failures = 0;
const check = (name: string, ok: boolean, detail: string) => {
  checks += 1;
  if (!ok) failures += 1;
  console.log(`  ${ok ? '✓' : '✗'} ${name} — ${detail}`);
};

const toMin = (hhmm: string): number => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};
const diffMin = (a: string, b: string) => {
  let d = toMin(a) - toMin(b);
  if (d > 720) d -= 1440;
  if (d < -720) d += 1440;
  return d;
};
const fmt = (d: number) => `${d > 0 ? '+' : ''}${d.toFixed(0)} నిమి`;

const run = (mode: SiderealMode, rise: RiseConvention): DayPanchanga =>
  computeDayPanchanga('2026-10-23', GEO, { siderealMode: mode, riseConvention: rise });

console.log('\n  ══ చట్రం & ఉదయ నిర్వచనం — Siddipet 2026-10-23 ══\n');

/* ---------- 1. సాయన + కేంద్రం/వక్రీభవనం → Hindu Calendar యాప్ ---------- */
{
  const d = run('sayana', 'centre-refraction');
  const dr = diffMin(d.sunrise, '06:11');
  const ds = diffMin(d.sunset, '17:46');
  const dmr = diffMin(d.moonrise, '15:44');
  const dms = diffMin(d.moonset, '04:11');
  check(
    'సాయన చట్రం + కేంద్రం/వక్రీభవనం — సూర్యోదయం/అస్తమయం ఆ యాప్‌తో',
    Math.abs(dr) <= 1 && Math.abs(ds) <= 1,
    `మనం ${d.sunrise}/${d.sunset} · యాప్ 06:11:31/17:46:01 · భేదం ${fmt(dr)} / ${fmt(ds)}`
  );
  check(
    'సాయన చట్రం — చంద్రోదయం/అస్తమయం ఆ యాప్‌తో (≤2 నిమి)',
    Math.abs(dmr) <= 2 && Math.abs(dms) <= 3,
    `మనం ${d.moonrise}/${d.moonset} · యాప్ 15:43:53/04:10:41 · భేదం ${fmt(dmr)} / ${fmt(dms)}`
  );
  check(
    'సాయన చట్రం — సూర్యుడు వృశ్చికంలోకి (ట్రాపికల్ 210°) ఆ యాప్ తోటే',
    !!d.sunSignEnd && d.sunSignEnd.sameDay && Math.abs(diffMin(d.sunSignEnd.time, '15:07')) <= 5,
    `మనం ${d.sunSignEnd?.dateISO} ${d.sunSignEnd?.time} · యాప్ 15:06:41`
  );
  check(
    'సాయన చట్రం — చంద్రుడు మేషంలోకి ఆ యాప్ తోటే',
    !!d.moonSignEnd && Math.abs(diffMin(d.moonSignEnd.time, '01:22')) <= 2,
    `మనం ${d.moonSignEnd?.dateISO} ${d.moonSignEnd?.time} · యాప్ 25:22:19`
  );
  check(
    'సాయన చట్రం — మాసం (అమావాస్యాంతం) కార్తీకం',
    d.era.masaTe === 'కార్తీకం',
    `మనం ${d.era.masaTe} · యాప్ కార్తీకం`
  );
}

/* ---------- 2. నిరయన + హిందూ (డ్రిక్) → drik-panchanga ---------- */
{
  const d = run('lahiri', 'hindu');
  const dr = diffMin(d.sunrise, '06:14');
  const ds = diffMin(d.sunset, '17:44');
  const dmr = diffMin(d.moonrise, '15:50');
  const dms = diffMin(d.moonset, '04:12');
  check(
    'నిరయన + హిందూ నిర్వచనం — సూర్యోదయం/అస్తమయం డ్రిక్ తో',
    Math.abs(dr) <= 1 && Math.abs(ds) <= 1,
    `మనం ${d.sunrise}/${d.sunset} · డ్రిక్ 06:14:02/17:43:39 · భేదం ${fmt(dr)} / ${fmt(ds)}`
  );
  check(
    'నిరయన + హిందూ నిర్వచనం — చంద్రోదయం/అస్తమయం డ్రిక్ తో',
    Math.abs(dmr) <= 1 && Math.abs(dms) <= 1,
    `మనం ${d.moonrise}/${d.moonset} · డ్రిక్ 15:50:21/04:11:46 · భేదం ${fmt(dmr)} / ${fmt(dms)}`
  );
  check(
    'నిరయన చట్రం — సూర్యుడు తులలోనే (వృశ్చిక ప్రవేశం నవంబరులో), మాసం ఆశ్వయుజం',
    d.sunSignIndex === 6 && d.era.masaTe === 'ఆశ్వయుజం' && !!d.sunSignEnd && !d.sunSignEnd.sameDay,
    `సూర్య రాశి ${d.sunSignIndex + 1} · మాసం ${d.era.masaTe} · ప్రవేశం ${d.sunSignEnd?.dateISO}`
  );
  const say = run('sayana', 'hindu');
  check(
    'సాయన చట్రంలో అయనాంశం సున్నా; నిరయనలో 24.23° (లహిరి)',
    say.ayanamsaDeg === 0 && Math.abs(d.ayanamsaDeg - 24.2316) < 0.01,
    `సాయన ${say.ayanamsaDeg.toFixed(4)}° · లహిరి ${d.ayanamsaFormatted}`
  );
}

console.log(`\n  మొత్తం: ${checks} — విజయం ${checks - failures} — విఫలం ${failures}\n`);
if (failures > 0) process.exit(1);
