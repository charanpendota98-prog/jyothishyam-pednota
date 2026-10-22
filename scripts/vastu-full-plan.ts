/**
 * పూర్తి వాస్తు + ఇంజనీరింగ్ ప్లాన్ — ప్రింట్/PDF రూపంలో ఒకే ఫైల్ (HTML).
 *
 * ఉపయోగం:
 *   npx tsx scripts/vastu-full-plan.ts [--name Charan] [--place Hyderabad] [--len 40] [--wid 30]
 *                                       [--out vastu-full-plan.html] [--lang te|en]
 *
 * ఇది యాప్‌లో చూపే అదే ఇంజిన్‌లను (vastuShastraEngine + vastuProjectPlan) వాడుతుంది —
 * కాబట్టి డాక్యుమెంట్ మరియు యాప్ ఫలితం ఒకటే.
 */

import { writeFileSync } from 'node:fs';
import { generateVastuReport, DIK_BY_ID, type RoomMap } from '../src/engine/vastuShastraEngine.ts';
import { localizeVastuReport } from '../src/engine/vastuBilingual.ts';
import { buildVastuProjectPlan, pickBi } from '../src/engine/vastuProjectPlan.ts';
import { bilingualName } from '../src/engine/teluguTransliteration.ts';
import { latinAkshara } from '../src/engine/namaAksharaEngine.ts';

const arg = (flag: string, fallback: string): string => {
  const i = process.argv.indexOf(flag);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
};

const personName = arg('--name', 'Charan');
const placeNameRaw = arg('--place', 'Hyderabad');
const lengthFt = Number(arg('--len', '40'));
const widthFt = Number(arg('--wid', '30'));
const outFile = arg('--out', 'vastu-full-plan.html');
const lang = (arg('--lang', 'te') === 'en' ? 'en' : 'te') as 'te' | 'en';

const PLACES: Record<string, { lat: number; lng: number }> = {
  Hyderabad: { lat: 17.385, lng: 78.4867 },
  Warangal: { lat: 17.9784, lng: 79.5941 },
  Vijayawada: { lat: 16.5062, lng: 80.648 },
  Visakhapatnam: { lat: 17.6868, lng: 83.2185 },
  Tirupati: { lat: 13.6288, lng: 79.4192 },
  Bengaluru: { lat: 12.9716, lng: 77.5946 },
  Chennai: { lat: 13.0827, lng: 80.2707 },
};
const place = PLACES[placeNameRaw] ?? PLACES.Hyderabad;

/** ఇల్లు ఇప్పుడు ఉన్న స్థానాలు (గది → దిక్కు). ఇవి మార్చుకోవచ్చు. */
const rooms: RoomMap = {
  entrance: 'E',
  kitchen: 'SE',
  masterBed: 'SW',
  pooja: 'NE',
  toilet: 'NW',
  staircase: 'SW',
  waterTank: 'NE',
  borewell: 'NE',
  safe: 'N',
  study: 'E',
  living: 'E',
  guest: 'NW',
  children: 'W',
  dining: 'W',
  septic: 'NW',
  balcony: 'NE',
} as RoomMap;

const plot = { shape: 'rectangle', slope: 'north-east', road: 'E', lengthFt, widthFt } as const;

const nameBoth = bilingualName(personName);
const reportRaw = generateVastuReport({
  name: nameBoth.te,
  placeName: lang === 'te' ? 'హైదరాబాద్' : placeNameRaw,
  lat: place.lat,
  lng: place.lng,
  tzOffsetHours: 5.5,
  rooms,
  plot: plot as never,
});
const report = localizeVastuReport(reportRaw, lang, plot as never, personName);
const plan = buildVastuProjectPlan({ rooms, lengthFt, widthFt });

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const T = (b: { te: string; en: string }) => esc(pickBi(b, lang));
const both = (b: { te: string; en: string }) =>
  lang === 'te' ? esc(b.te) : esc(b.en);

const dikName = (id: keyof typeof DIK_BY_ID) => (lang === 'te' ? DIK_BY_ID[id].nameTe : DIK_BY_ID[id].nameEn);
/** పాదాక్షరం — తెలుగు మోడ్‌లో తెలుగు అక్షరం, ఆంగ్ల మోడ్‌లో దాని లాటిన్ రూపం. */
const aksharaText = (s: string) => (lang === 'te' ? s : latinAkshara(s));

const roomRows = plan.rooms
  .map((r) => {
    const tone = r.compliance === 'best' ? '#0f7b6c' : r.compliance === 'ok' ? '#8a6d1f' : '#a2382c';
    const label = r.compliance === 'best' ? (lang === 'te' ? 'అనుకూలం' : 'Aligned') : r.compliance === 'ok' ? (lang === 'te' ? 'మధ్యమం' : 'Acceptable') : lang === 'te' ? 'దోషం' : 'Defect';
    return `<tr>
      <td class="room">${T(r.label)}<div class="sub">${both(r.size)}</div></td>
      <td style="color:${tone};font-weight:600">${label}</td>
      <td>${dikName(r.currentDik)} → <b>${dikName(r.idealDik)}</b></td>
      <td>${both(r.door)}</td>
      <td>${both(r.window)}</td>
      <td class="num">${both(r.daylight)}</td>
      <td class="num">${both(r.ach)}</td>
    </tr>`;
  })
  .join('\n');

const roomDetails = plan.rooms
  .map((r) => {
    const list = (arr: { te: string; en: string }[]) => arr.map((x) => `<li>${both(x)}</li>`).join('');
    return `<section class="room-card">
      <h3>${T(r.label)} <span class="pill">${dikName(r.idealDik)}</span></h3>
      <div class="grid2">
        <div><h4>${lang === 'te' ? 'MEP (విద్యుత్ · ప్లంబింగ్ · HVAC)' : 'MEP (electrical · plumbing · HVAC)'}</h4><ul>${list(r.mep)}</ul></div>
        <div><h4>${lang === 'te' ? 'పదార్థాలు & నిర్మాణం' : 'Materials & construction'}</h4><ul>${list(r.materials)}</ul></div>
        <div><h4>${lang === 'te' ? 'వాస్తు నియమాలు' : 'Vastu rules'}</h4><ul>${list(r.vastu)}</ul></div>
        <div><h4>${lang === 'te' ? 'ఇంజనీరింగ్ తనిఖీలు' : 'Engineering checks'}</h4><ul>${list(r.engineering)}</ul></div>
      </div>
      <h4>${lang === 'te' ? 'పరిహారాలు (దశల వారీగా)' : 'Remedies (by phase)'}</h4>
      <ol class="remedies">${r.remedies.map((x) => `<li><b>P${x.level}</b> ${both(x.text)}</li>`).join('')}</ol>
    </section>`;
  })
  .join('\n');

const serviceCards = plan.services
  .map(
    (s) => `<section class="room-card">
    <h3>${T(s.title)} <span class="pill">${dikName(s.primaryDik)}</span></h3>
    <ul>${s.spec.map((x) => `<li>${both(x)}</li>`).join('')}</ul>
    <h4>${lang === 'te' ? 'ప్రమాదాలు' : 'Risks'}</h4>
    <ul class="risk">${s.risks.map((x) => `<li>${both(x)}</li>`).join('')}</ul>
  </section>`
  )
  .join('\n');

const actions = plan.actionPlan.length
  ? plan.actionPlan
      .map(
        (a) => `<tr><td class="num">${a.priority}</td><td>${T(a.action)}<div class="sub">${both(a.rationale)}</div></td>
        <td class="num">+${a.impact}</td><td>${a.costBand}</td></tr>`
      )
      .join('')
  : `<tr><td colspan="4">${lang === 'te' ? 'ప్రతి గది అనుకూల దిక్కులో ఉంది — సరిదిద్దే పని లేదు.' : 'Every room already sits in its favourable direction — nothing to correct.'}</td></tr>`;

const compliance = plan.compliance
  .map((c) => {
    const g = c.status === 'ok' ? '✓' : c.status === 'warn' ? '!' : '✕';
    return `<li><b>${g}</b> ${T(c.label)}<div class="sub">${both(c.detail)}</div></li>`;
  })
  .join('');

const phases = plan.phases
  .map(
    (p) => `<section class="room-card"><h3>${T(p.title)}</h3><ul>${p.items.map((i) => `<li>${both(i)}</li>`).join('')}</ul></section>`
  )
  .join('\n');

const nama = report.nama;
const html = `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(lang === 'te' ? nameBoth.te : personName)} — ${lang === 'te' ? 'పూర్తి వాస్తు ప్లాన్' : 'Complete Vastu Plan'}</title>
<style>
  :root { --ink:#1c1a17; --muted:#6a6257; --gold:#9b7b3a; --line:#dcd3c4; --bg:#faf7f1; }
  * { box-sizing: border-box; }
  body { margin:0; background:var(--bg); color:var(--ink); font-family: "Noto Sans Telugu","Gautami",system-ui,-apple-system,"Segoe UI",sans-serif; line-height:1.55; }
  .wrap { max-width: 1080px; margin: 0 auto; padding: 28px 22px 60px; }
  h1 { font-size: 24px; margin: 0 0 4px; letter-spacing: .2px; }
  h2 { font-size: 16px; margin: 30px 0 10px; padding-bottom: 6px; border-bottom: 2px solid var(--gold); color:#3b3325; }
  h3 { font-size: 13.5px; margin: 0 0 8px; }
  h4 { font-size: 11px; text-transform: uppercase; letter-spacing: .06em; color: var(--muted); margin: 10px 0 4px; }
  .meta { color: var(--muted); font-size: 12px; }
  .card { background:#fff; border:1px solid var(--line); border-radius:10px; padding:14px 16px; margin-bottom:12px; }
  .kpis { display:grid; grid-template-columns: repeat(auto-fit, minmax(150px,1fr)); gap:10px; }
  .kpi { background:#fff; border:1px solid var(--line); border-radius:10px; padding:10px 12px; }
  .kpi b { display:block; font-size:18px; color:var(--gold); }
  .kpi span { font-size:11px; color:var(--muted); }
  table { width:100%; border-collapse: collapse; background:#fff; font-size:11.5px; }
  th, td { border:1px solid var(--line); padding:6px 8px; vertical-align: top; text-align:left; }
  th { background:#f2ecdf; font-size:10.5px; text-transform:uppercase; letter-spacing:.05em; }
  td.room { font-weight:600; }
  td.num { text-align:center; white-space:nowrap; }
  .sub { color:var(--muted); font-weight:400; font-size:10.5px; margin-top:2px; }
  .room-card { background:#fff; border:1px solid var(--line); border-radius:10px; padding:12px 14px; margin-bottom:10px; break-inside: avoid; }
  .room-card ul, .room-card ol { margin:4px 0 0 16px; padding:0; font-size:11.5px; }
  .room-card li { margin:2px 0; }
  .grid2 { display:grid; grid-template-columns:1fr 1fr; gap:8px 18px; }
  .pill { font-size:10px; background:#f2ecdf; color:#6b5320; border-radius:20px; padding:1px 8px; margin-left:6px; }
  .risk li { color:#a2382c; }
  .remedies b { color:var(--gold); margin-right:4px; }
  .note { font-size:11px; color:var(--muted); }
  ul.checks { list-style:none; margin:0; padding:0; font-size:11.5px; }
  ul.checks li { margin:5px 0; }
  @media print {
    body { background:#fff; }
    .wrap { max-width:none; padding:0 10mm; }
    h2 { break-before: auto; }
    .room-card, table { break-inside: avoid; }
    @page { size: A4; margin: 12mm; }
  }
  @media (max-width: 720px) { .grid2 { grid-template-columns: 1fr; } }
</style>
</head>
<body>
<div class="wrap">
  <header class="card">
    <h1>${lang === 'te' ? `${esc(nameBoth.te)} గారి పూర్తి వాస్తు + ఇంజనీరింగ్ ప్లాన్` : `${esc(personName)} — Complete Vastu + Engineering Plan`}</h1>
    <div class="meta">
      ${esc(placeNameRaw)} · ${lengthFt}′ × ${widthFt}′ ${lang === 'te' ? 'స్థలం' : 'plot'} ·
      ${lang === 'te' ? 'నిజ ఉత్తర అయస్కాంత దిక్పాతం' : 'true-north magnetic declination'} ${report.place.magneticDeclinationDeg}° ·
      ${new Date().toISOString().slice(0, 10)}
    </div>
    <p class="note" style="margin-top:8px">${esc(report.summaryTe)}</p>
  </header>

  <h2>${lang === 'te' ? '1. నామ వాస్తు — పేరు అక్షరం నుంచి దిక్కు' : '1. Nama Vastu — from the name syllable to a direction'}</h2>
  <div class="kpis">
    <div class="kpi"><b>${esc(aksharaText(nama.matchedSyllable))}</b><span>${lang === 'te' ? 'పాదాక్షరం' : 'pada syllable'}${nama.inputAkshara && nama.inputAkshara !== nama.matchedSyllable ? ` (${esc(aksharaText(nama.inputAkshara))} → ${esc(aksharaText(nama.matchedSyllable))})` : ''}</span></div>
    <div class="kpi"><b>${esc(nama.nakshatraTe)} ${nama.pada}</b><span>${lang === 'te' ? 'నక్షత్రం · పాదం' : 'nakshatra · pada'}</span></div>
    <div class="kpi"><b>${esc(nama.rasiTe)}</b><span>${lang === 'te' ? 'నామ రాశి' : 'name rasi'}</span></div>
    <div class="kpi"><b>${nama.favourableDiks.map((d) => dikName(d)).join(' · ')}</b><span>${lang === 'te' ? 'అనుకూల దిక్కులు' : 'favourable directions'}</span></div>
    <div class="kpi"><b>${dikName(nama.entranceDik)}</b><span>${lang === 'te' ? 'ప్రధాన ద్వారం' : 'main entrance'}</span></div>
    <div class="kpi"><b>${nama.nameNumber}</b><span>${lang === 'te' ? 'నామ అంకం' : 'name number'}</span></div>
  </div>
  <p class="note">${esc(report.nama.noteTe)}</p>

  <h2>${lang === 'te' ? '2. గృహ వాస్తు స్కోరు' : '2. House Vastu score'}</h2>
  <div class="kpis">
    <div class="kpi"><b>${report.audit.totalScore}/100</b><span>${esc(report.audit.gradeTe)}</span></div>
    <div class="kpi"><b>${esc(report.audit.strongestRoomTe)}</b><span>${lang === 'te' ? 'బలమైన భాగం' : 'strongest'}</span></div>
    <div class="kpi"><b>${esc(report.audit.weakestRoomTe)}</b><span>${lang === 'te' ? 'సరిదిద్దవలసినది' : 'to fix'}</span></div>
    <div class="kpi"><b>${report.plot.score}/100</b><span>${lang === 'te' ? 'స్థల పరిశీలన' : 'plot'}</span></div>
    <div class="kpi"><b>${plan.scoreProjection.current} → ${plan.scoreProjection.afterPhase1} → ${plan.scoreProjection.afterPhase2}</b><span>${lang === 'te' ? 'ఇప్పుడు → దశ 1 → దశ 2' : 'now → phase 1 → phase 2'}</span></div>
  </div>

  <h2>${lang === 'te' ? '3. ఆయాది గణితం (చుట్టుకొలత)' : '3. Ayadi arithmetic (perimeter)'}</h2>
  <div class="card">
    <div><b>${lang === 'te' ? 'ఆయం' : 'Ayam'}</b> ${plan.ayadi.aya} · <b>${lang === 'te' ? 'వ్యయం' : 'Vyayam'}</b> ${plan.ayadi.vyaya} ·
      ${lang === 'te' ? 'చుట్టుకొలత' : 'perimeter'} ${plan.ayadi.perimeterFt}′</div>
    <p class="note">${T(plan.ayadi.note)}</p>
  </div>

  <h2>${lang === 'te' ? '4. గది వారీ ప్లాన్ (16 గదులు)' : '4. Room-by-room plan (16 rooms)'}</h2>
  <table>
    <thead><tr>
      <th>${lang === 'te' ? 'గది' : 'Room'}</th>
      <th>${lang === 'te' ? 'స్థితి' : 'Status'}</th>
      <th>${lang === 'te' ? 'ప్రస్తుతం → శాస్త్రీయ దిక్కు' : 'Now → ideal'}</th>
      <th>${lang === 'te' ? 'ద్వారం' : 'Door'}</th>
      <th>${lang === 'te' ? 'కిటికీ' : 'Window'}</th>
      <th>${lang === 'te' ? 'వెలుతురు' : 'Daylight'}</th>
      <th>ACH</th>
    </tr></thead>
    <tbody>${roomRows}</tbody>
  </table>
  <div style="height:10px"></div>
  ${roomDetails}

  <h2>${lang === 'te' ? '5. సేవల ప్లాన్ (MEP · నీరు · మంటి · సోలార్ · అగ్ని)' : '5. Service plan (MEP · water · sewage · solar · fire)'}</h2>
  ${serviceCards}

  <h2>${lang === 'te' ? '6. ప్రాధాన్యత క్రమంలో చర్యలు' : '6. Priority actions'}</h2>
  <table>
    <thead><tr>
      <th>#</th><th>${lang === 'te' ? 'చర్య' : 'Action'}</th>
      <th>${lang === 'te' ? 'ప్రభావం' : 'Impact'}</th>
      <th>${lang === 'te' ? 'ఖర్చు' : 'Cost'}</th>
    </tr></thead>
    <tbody>${actions}</tbody>
  </table>

  <h2>${lang === 'te' ? '7. సమ్మతి తనిఖీలు' : '7. Compliance checks'}</h2>
  <div class="card"><ul class="checks">${compliance}</ul></div>

  <h2>${lang === 'te' ? '8. మూడు దశల అమలు' : '8. Three-phase execution'}</h2>
  ${phases}

  <h2>${lang === 'te' ? '9. నిర్మాణ గ్రిడ్ & లోడ్' : '9. Structural grid & loads'}</h2>
  <div class="card"><ul>${plan.grid.map((g) => `<li>${both(g)}</li>`).join('')}</ul>
    <h4>${lang === 'te' ? 'ఇంజనీరింగ్ సారాంశం' : 'Engineering summary'}</h4>
    <ul>${plan.engineeringSummary.map((g) => `<li>${both(g)}</li>`).join('')}</ul>
  </div>

  <p class="note" style="margin-top:22px">
    ${lang === 'te'
      ? 'ఆధారం: బృహత్ పరాశర హోరా శాస్త్రం, మానుష్యాలయ చంద్రిక, సమరాంగణ సూత్రధార, మయమతం; ఇంజనీరింగ్ — NBC 2016, IS 456, IS 875, IS 3370, IS 1893. ఇది సాంప్రదాయ మార్గదర్శనం; నిర్మాణానికి ముందు లైసెన్స్ పొందిన ఇంజనీర్/వాస్తు నిపుణుల అనుమతి తప్పనిసరి.'
      : 'Sources: Brihat Parashara Hora Shastra, Manushyalaya Chandrika, Samarangana Sutradhara, Mayamata; engineering — NBC 2016, IS 456, IS 875, IS 3370, IS 1893. Traditional guidance only; get a licensed engineer and Vastu consultant to sign off before construction.'}
  </p>
</div>
</body>
</html>`;

writeFileSync(outFile, html, 'utf8');
console.log(`✓ ${outFile} — ${(html.length / 1024).toFixed(0)} KB, ${plan.rooms.length} rooms, ${plan.services.length} services, ${plan.actionPlan.length} actions`);
