/**
 * verify-sampradaya.ts — సప్త-సంప్రదాయ సమన్వయ ఇంజిన్ స్వీయ-పరీక్ష
 * ---------------------------------------------------------------------------
 * “ర్యాండమ్/డమీ” వాక్యాలు లేకుండా ఉండాలంటే ఇంజిన్ నియమాలను యాంత్రికంగా
 * తనిఖీ చేయాలి. ఈ గేట్ మూడు జనన క్షణాలపై నడుస్తుంది:
 *
 *  1. ప్రతి భావానికి (12) సరిగ్గా 7 సంప్రదాయ తీర్పులు ఉండాలి.
 *  2. ప్రతి స్కోరు −2 … +2 లోపు; సగటు = తీర్పుల సగటు; వ్యాప్తి = max−min.
 *  3. ప్రతి తీర్పుకు గణన ఆధారం (ఖాళీ కాదు) + గ్రంథ నియమం ఉండాలి.
 *  4. కారకులు 8 — ఒక్కో గ్రహం ఒకసారే (డూప్లికేట్ లేదు).
 *  5. కాల కిటికీలు భవిష్యత్తులో, 15 సంవత్సరాల లోపు; తేదీలు చెల్లుబాటు.
 *  6. వింశోత్తరి లార్డ్ పేర్లు గ్రహాల జాబితాలో ఉండాలి.
 *
 * Run: npm run verify:sampradaya
 */
import { calculateChart, type BirthInput } from '../src/engine/ephemeris.ts';
import { computeSampradayaSamanyaya } from '../src/engine/sampradayaSamanyayaEngine.ts';

const CASES: BirthInput[] = [
  {
    name: 'Reference', date: '2026-10-22', time: '22:55', lat: 17.385, lng: 78.4867,
    tzOffsetHours: 5.5, city: 'Hyderabad', country: 'India', ayanamsa: 'lahiri', houseSystem: 'whole_sign',
  },
  {
    name: 'Charan', date: '1998-05-14', time: '08:45', lat: 17.385, lng: 78.4867,
    tzOffsetHours: 5.5, city: 'Hyderabad', country: 'India', ayanamsa: 'lahiri', houseSystem: 'whole_sign',
  },
  {
    name: 'Delhi 1947', date: '1947-08-15', time: '00:00', lat: 28.6139, lng: 77.209,
    tzOffsetHours: 5.5, city: 'Delhi', country: 'India', ayanamsa: 'lahiri', houseSystem: 'placidus',
  },
];

const SCHOOLS = [
  'పారాశరీ',
  'అష్టకవర్గ',
  'జైమిని',
  'వింశోత్తరి',
  'కేపీ',
  'చరదశ',
  'తాజిక',
];
const N = SCHOOLS.length;
const PLANET_NAMES = ['సూర్యుడు', 'చంద్రుడు', 'కుజుడు', 'బుధుడు', 'గురువు', 'శుక్రుడు', 'శని', 'రాహువు', 'కేతువు'];

let checks = 0;
const fails: string[] = [];
const check = (ok: boolean, msg: string) => {
  checks += 1;
  if (!ok) fails.push(msg);
};

const now = Date.now();
const DAY = 86_400_000;

for (const input of CASES) {
  const chart = calculateChart(input, 'vedic');
  const rep = computeSampradayaSamanyaya(chart);
  const tag = `${input.name} ${input.date}`;

  check(rep.domains.length === 12, `${tag}: భావాలు 12 కాదు (${rep.domains.length})`);
  check(rep.karakas.length === 8, `${tag}: కారకులు 8 కాదు`);
  check(new Set(rep.karakas.map((k) => k.planetTe)).size === 8, `${tag}: కారకుల్లో డూప్లికేట్`);

  for (const d of rep.domains) {
    check(d.verdicts.length === N, `${tag}: ${d.house}వ భావానికి ${N} తీర్పులు లేవు (${d.verdicts.length})`);
    check(
      SCHOOLS.every((s) => d.verdicts.some((v) => v.schoolTe === s)),
      `${tag}: ${d.house}వ భావంలో సంప్రదాయం మిస్ అయింది`
    );
    for (const v of d.verdicts) {
      check(v.score >= -2 && v.score <= 2, `${tag}: ${d.house}.${v.schoolTe} స్కోరు పరిధి దాటింది (${v.score})`);
      check(v.evidenceTe.trim().length > 20, `${tag}: ${d.house}.${v.schoolTe} ఆధారం లేదు`);
      check(v.ruleTe.trim().length > 10, `${tag}: ${d.house}.${v.schoolTe} గ్రంథ నియమం లేదు`);
    }
    const avg = d.verdicts.reduce((a, v) => a + v.score, 0) / N;
    check(Math.abs(avg - d.consensusScore) < 0.02, `${tag}: ${d.house} సగటు తప్పు`);
    const spread = Math.max(...d.verdicts.map((v) => v.score)) - Math.min(...d.verdicts.map((v) => v.score));
    check(Math.abs(spread - d.spread) < 0.02, `${tag}: ${d.house} వ్యాప్తి తప్పు`);
    // కొత్త రెండు పద్ధతులు (చరదశ · తాజిక) డమీ కావు — నిజ సంఖ్యలు ఉండాలి
    const charaV = d.verdicts.find((v) => v.schoolTe === 'చరదశ');
    const tajikaV = d.verdicts.find((v) => v.schoolTe === 'తాజిక');
    check(!!charaV && /\d{4}-\d{2}-\d{2}/.test(charaV.evidenceTe), `${tag}: ${d.house} చరదశ ఆధారంలో దశా తేదీలు లేవు`);
    check(!!charaV && /రాశి దృష్టి/.test(charaV.evidenceTe), `${tag}: ${d.house} చరదశ ఆధారంలో రాశి దృష్టి తనిఖీ లేదు`);
    check(!!tajikaV && /వర్ష లగ్నం/.test(tajikaV.evidenceTe) && /ముంథ/.test(tajikaV.evidenceTe), `${tag}: ${d.house} తాజిక ఆధారంలో వర్ష లగ్న/ముంథ లేదు`);
    check(!!tajikaV && /వర్షేశుడు/.test(tajikaV.evidenceTe), `${tag}: ${d.house} తాజిక ఆధారంలో వర్షేశుడు లేదు`);

    check(d.phalaTe.length > 15, `${tag}: ${d.house} ఫల వాక్యం లేదు`);
    check(d.polarityTe.includes('గమనిక'), `${tag}: ${d.house} పఠన గమనిక లేదు`);

    for (const w of d.windows) {
      const from = Date.parse(`${w.fromISO}T00:00:00Z`);
      const to = Date.parse(`${w.toISO}T00:00:00Z`);
      check(Number.isFinite(from) && Number.isFinite(to) && to > from, `${tag}: ${d.house} కిటికీ తేదీ తప్పు`);
      check(from >= now - 2 * DAY, `${tag}: ${d.house} కిటికీ గతంలో ఉంది (${w.fromISO})`);
      check(from <= now + 16 * 365.25 * DAY, `${tag}: ${d.house} కిటికీ 15 సం. దాటింది (${w.fromISO})`);
      check(
        PLANET_NAMES.some((p) => w.lordTe.includes(p)),
        `${tag}: ${d.house} కిటికీ లార్డ్ తప్పు (${w.lordTe})`
      );
    }
  }
  for (const school of ['చరదశ', 'తాజిక']) {
    const moved = rep.domains.filter((d) => {
      const v = d.verdicts.find((x) => x.schoolTe === school);
      return v && Math.abs(v.score) >= 0.4;
    }).length;
    check(moved >= 3, `${tag}: ${school} 12 భావాల్లో 3 కంటే తక్కువ స్పష్ట తీర్పులు (${moved}) — పద్ధతి పని చేయడం లేదు`);
  }
}

console.log(`\n  సప్త-సంప్రదాయ సమన్వయ గేట్ — ${CASES.length} జాతకాలు`);
console.log(`  మొత్తం తనిఖీలు: ${checks} — విజయం: ${checks - fails.length} — విఫలం: ${fails.length}`);
for (const f of fails.slice(0, 20)) console.log(`   ✗ ${f}`);
if (fails.length === 0) {
  console.log(`  ✓ 12 భావాలు × ${N} సంప్రదాయాలు · స్కోర్లు, ఆధారాలు, కిటికీలు — అన్నీ నియమాల్లో ఉన్నాయి\n`);
  process.exit(0);
}
console.log('');
process.exit(1);
