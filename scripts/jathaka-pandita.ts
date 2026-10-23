/**
 * scripts/jathaka-pandita.ts — పండిత విచారణ పత్రిక (print-ready HTML)
 * ---------------------------------------------------------------------------
 * ఉపయోగం:
 *   npx tsx scripts/jathaka-pandita.ts [--name mkjxc] [--date 2026-10-22] [--time 22:55]
 *                                     [--lat 17.3843] [--lng 78.4583] [--city హైదరాబాద్]
 *                                     [--out jathaka-pandita-vicharam.html]
 *
 * యాప్‌లో చూపే అదే ఇంజిన్ (panditaVicharamEngine) — కాబట్టి పత్రిక మరియు యాప్ ఫలితం ఒకటే.
 * ప్రతి వాక్యం గ్రహ స్ఫుటం / షడ్బలం / భావ బలం / అష్టకవర్గ బిందువు / దశా గణితం నుండి వస్తుంది.
 */

import { writeFileSync } from 'node:fs';
import { calculateChart } from '../src/engine/ephemeris.ts';
import { computePanditaVicharam } from '../src/engine/panditaVicharamEngine.ts';
import { RASI_TE } from '../src/engine/lagnaFunctionalEngine.ts';

const arg = (flag: string, fallback: string): string => {
  const i = process.argv.indexOf(flag);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
};

const PLACES: Record<string, { lat: number; lng: number; label: string }> = {
  Hyderabad: { lat: 17.3843, lng: 78.4583, label: 'హైదరాబాద్' },
  Warangal: { lat: 17.9784, lng: 79.5941, label: 'వరంగల్' },
  Vijayawada: { lat: 16.5062, lng: 80.648, label: 'విజయవాడ' },
  Visakhapatnam: { lat: 17.6868, lng: 83.2185, label: 'విశాఖపట్నం' },
  Tirupati: { lat: 13.6288, lng: 79.4192, label: 'తిరుపతి' },
  Bengaluru: { lat: 12.9716, lng: 77.5946, label: 'బెంగళూరు' },
  Chennai: { lat: 13.0827, lng: 80.2707, label: 'చెన్నై' },
};

const name = arg('--name', 'mkjxc');
const date = arg('--date', '2026-10-22');
const time = arg('--time', '22:55');
const placeKey = arg('--place', 'Hyderabad');
const outFile = arg('--out', 'jathaka-pandita-vicharam.html');
const place = PLACES[placeKey] ?? PLACES.Hyderabad;
const lat = Number(arg('--lat', String(place.lat)));
const lng = Number(arg('--lng', String(place.lng)));
const city = arg('--city', place.label);

const chart = calculateChart({
  name,
  gender: 'male',
  date,
  time,
  lat,
  lng,
  tzOffsetHours: 5.5,
  city,
  country: 'భారతదేశం',
  ayanamsa: 'lahiri',
  houseSystem: 'whole_sign',
} as Parameters<typeof calculateChart>[0]);

const r = computePanditaVicharam(chart);

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const GLYPH: Record<string, string> = {
  Sun: 'సూ', Moon: 'చం', Mars: 'కు', Mercury: 'బు', Jupiter: 'గు',
  Venus: 'శు', Saturn: 'శ', Rahu: 'రా', Ketu: 'కే',
};

/** దక్షిణ భారత చక్రం — స్థిర రాశి స్థానాలు (4×4) */
const GRID: (number | null)[][] = [
  [11, 0, 1, 2],
  [10, null, null, 3],
  [9, null, null, 4],
  [8, 7, 6, 5],
];

const signOfPlanet = (p: { siderealLon: number }) => Math.floor(p.siderealLon / 30) % 12;
const lagnaSign = Math.floor(chart.ascendant.siderealLon / 30) % 12;

const cellHtml = (sign: number | null): string => {
  if (sign === null) return '<td class="void"></td>';
  const inSign = chart.planets.filter(
    (p) => ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'].includes(p.id) && signOfPlanet(p) === sign
  );
  const isLagna = sign === lagnaSign;
  return `<td class="${isLagna ? 'lagna' : ''}">
    <div class="sign">${RASI_TE[sign]}<span class="num">${sign + 1}</span></div>
    ${isLagna ? '<div class="asc">లగ్నం</div>' : ''}
    <div class="planets">
      ${inSign
        .map((p) => {
          const deg = p.degreeInSign ?? p.siderealLon % 30;
          const d = Math.floor(deg);
          const m = Math.floor((deg - d) * 60);
          return `<span class="${p.dignity === 'Exalted' ? 'ex' : p.dignity === 'Debilitated' ? 'deb' : ''}">${GLYPH[p.id] ?? p.id} ${d}°${String(m).padStart(2, '0')}′${p.isRetrograde ? ' <b class="r">వ</b>' : ''}</span>`;
        })
        .join('')}
    </div>
  </td>`;
};

const chartGrid = `<table class="kundali">
  ${GRID.map((row) => `<tr>${row.map(cellHtml).join('')}</tr>`).join('\n')}
</table>`;

const balaBars = r.grahaBala
  .map(
    (g) => `<tr>
      <td class="nm">${esc(g.nameTe)}</td>
      <td>${esc(g.rasiTe)} · ${g.house}వ</td>
      <td>${esc(g.dignityTe)}${g.isRetrograde ? ' · వక్ర' : ''}</td>
      <td class="mono">${g.shadbalaPct.toFixed(1)}%</td>
      <td class="bar"><span style="width:${Math.min(100, (g.shadbalaPct / 150) * 100)}%"></span></td>
      <td class="small">${esc(g.functionalTe)}</td>
    </tr>`
  )
  .join('');

const bhavaRows = r.bhava
  .map(
    (b) => `<tr class="g-${b.gradeTe === 'బలవత్' ? 'ok' : b.gradeTe === 'మధ్యమ' ? 'mid' : 'low'}">
      <td class="mono center">${b.house}</td>
      <td>${esc(b.rasiTe)}</td>
      <td>${esc(b.lordTe)} <span class="small">(${b.lordHouse}వ)</span></td>
      <td class="small">${esc(b.occupantsTe)}</td>
      <td class="mono center">${b.sav}</td>
      <td class="mono center">${b.bhavaBalaRank}</td>
      <td class="grade">${esc(b.gradeTe)}</td>
    </tr>`
  )
  .join('');

const bhavaDeep = r.bhava
  .filter((b) => [2, 3, 5, 7, 9, 10].includes(b.house))
  .map(
    (b) => `<div class="bhava-card">
      <h4>${b.house}. ${esc(b.rasiTe)} · ${b.sav} బిందువులు · భావ బలం ${b.bhavaBalaRank}వ స్థానం · ${esc(b.gradeTe)}</h4>
      <p>${esc(b.readingTe)}</p>
    </div>`
  )
  .join('');

const yogaRows = r.yogaDosha
  .map(
    (y) => `<tr>
      <td class="nm">${esc(y.nameTe)}</td>
      <td class="status">${esc(y.statusTe)}</td>
      <td class="small">${esc(y.detailTe)}</td>
    </tr>`
  )
  .join('');

const dashaRows = r.dashaKrama
  .map(
    (d) => `<tr>
      <td class="nm">${esc(d.lordTe)}</td>
      <td class="mono">${d.fromTe}</td>
      <td class="mono">${d.toTe}</td>
      <td class="mono">${esc(d.ageTe)}</td>
      <td class="small">${esc(d.themeTe)}</td>
    </tr>`
  )
  .join('');

const html = `<!doctype html>
<html lang="te">
<head>
<meta charset="utf-8" />
<title>పండిత విచారణ — ${esc(name)}</title>
<style>
  :root { --ink:#12141c; --gold:#8a6a2f; --gold2:#c9a96e; --muted:#5b5f6e; --line:#d8cfbd; --bg:#fbf8f2; }
  * { box-sizing: border-box; }
  body { margin:0; background:#ece7dc; color:var(--ink);
         font-family: "Noto Serif Telugu","Gautami","Nirmala UI",Georgia,serif; line-height:1.75; }
  .page { max-width: 900px; margin: 0 auto; background: var(--bg); padding: 34px 40px 60px; }
  h1 { font-size: 27px; margin: 0 0 6px; letter-spacing: .2px; }
  h2 { font-size: 19px; margin: 34px 0 10px; padding-bottom: 6px; border-bottom: 2px solid var(--gold2); color:#2a2113; }
  h3 { font-size: 15.5px; margin: 18px 0 6px; color:#3a2f1c; }
  h4 { font-size: 14px; margin: 0 0 4px; color:#3a2f1c; }
  p { margin: 6px 0; font-size: 13.6px; }
  .cover { text-align:center; border:2px solid var(--gold2); padding: 22px 18px; background:#fffdf8; }
  .cover .om { font-size: 12px; letter-spacing: 2px; color: var(--gold); }
  .cover .sub { font-size: 13px; color: var(--muted); margin-top: 4px; }
  .meta { display:flex; flex-wrap:wrap; gap: 8px 18px; justify-content:center; margin-top: 12px; font-size: 12.5px; }
  .meta b { color: var(--gold); font-weight:600; }
  .lead { font-size: 13.5px; color:#3d3a33; background:#fffdf8; border-left:4px solid var(--gold2); padding: 10px 14px; margin-top:14px; text-align:left; }
  table { width:100%; border-collapse: collapse; font-size: 12.6px; background:#fffdf8; }
  th, td { border:1px solid var(--line); padding: 6px 8px; vertical-align: top; text-align:left; }
  th { background:#f3ede0; font-weight:700; font-size:12px; color:#43351d; }
  .mono { font-variant-numeric: tabular-nums; white-space:nowrap; }
  .center { text-align:center; }
  .small { font-size: 11.6px; color:#4b4a45; }
  .nm { font-weight:700; }
  .bar { width:120px; } .bar span { display:block; height:7px; background: linear-gradient(90deg,#c9a96e,#7f9f6a); border-radius:4px; }
  .grade { font-weight:700; }
  tr.g-ok .grade { color:#3f6b2e; } tr.g-mid .grade { color:#8a6a2f; } tr.g-low .grade { color:#a3502f; }
  .kundali { border-collapse:collapse; width:100%; max-width:520px; margin: 10px auto; table-layout:fixed; }
  .kundali td { border:1.5px solid #b8a887; background:#fffdf8; height:96px; width:25%; padding:4px 6px; position:relative; vertical-align:top; }
  .kundali td.lagna { background:#f6efdc; box-shadow: inset 0 0 0 2px var(--gold2); }
  .kundali td.void { background:#efe8d8; }
  .kundali .sign { font-size:11.5px; color:#6b5c3c; font-weight:700; }
  .kundali .num { float:right; color:#a89a7c; font-weight:400; }
  .kundali .asc { font-size:10.5px; color:#8a6a2f; font-weight:700; margin-top:-2px; }
  .kundali .planets { margin-top: 4px; display:flex; flex-direction:column; gap:1px; }
  .kundali .planets span { font-size: 11.6px; }
  .kundali .ex { color:#2f6b3f; font-weight:700; }
  .kundali .deb { color:#a3502f; font-weight:700; }
  .kundali .r { color:#8a6a2f; }
  .pillar { background:#fffdf8; border:1px solid var(--line); border-top:3px solid var(--gold2); padding: 10px 14px; margin: 12px 0; page-break-inside: avoid; }
  .facts { margin: 6px 0 8px; padding-left: 18px; font-size: 12.6px; color:#3d3a33; }
  .facts li { margin: 2px 0; }
  .bhava-card { background:#fffdf8; border:1px solid var(--line); padding: 9px 13px; margin: 9px 0; page-break-inside: avoid; }
  .qa { background:#fffdf8; border:1px solid var(--line); border-left:4px solid var(--gold2); padding: 9px 14px; margin: 10px 0; page-break-inside: avoid; }
  .qa h3 { margin: 0 0 4px; color:#5a4620; }
  .sara { background:#fffaf0; border:2px solid var(--gold2); padding: 14px 18px; }
  .sara ol { margin: 6px 0 0; padding-left: 22px; }
  .sara li { margin: 6px 0; font-size: 13.4px; }
  .nishedha { background:#fdf6ef; border-left:4px solid #b06a3b; padding: 10px 16px; }
  .nishedha li { font-size: 13px; margin: 5px 0; }
  .foot { margin-top: 34px; border-top:1px solid var(--line); padding-top: 10px; font-size: 11px; color:#6d6a60; }
  @media print {
    body { background:#fff; }
    .page { max-width:none; padding: 0 8mm; }
    h2 { page-break-after: avoid; }
    table { page-break-inside: auto; }
    tr { page-break-inside: avoid; }
    @page { size: A4; margin: 14mm 12mm; }
  }
</style>
</head>
<body>
<div class="page">

  <div class="cover">
    <div class="om">॥ శ్రీ గణేశాయ నమః ॥</div>
    <h1>పండిత విచారణ — జాతక పరిశీలన</h1>
    <div class="sub">గ్రహ స్ఫుటం · షడ్బలం · భావ బలం · అష్టకవర్గం · వింశోత్తరి దశ — ఐదింటి సమన్వయం</div>
    <div class="meta">
      <span><b>జాతకుడు:</b> ${esc(name)}</span>
      <span><b>తేదీ:</b> ${esc(date)} · ${esc(time)}</span>
      <span><b>స్థలం:</b> ${esc(city)} (${lat.toFixed(3)}°N, ${lng.toFixed(3)}°E)</span>
    </div>
    <div class="lead">${esc(r.uddeshyamTe)}</div>
  </div>

  <h2>1. జన్మ వివరాలు (పంచాంగ సహితం)</h2>
  <table>
    <thead><tr><th style="width:26%">అంశం</th><th style="width:30%">వివరం</th><th>గమనిక</th></tr></thead>
    <tbody>
      ${r.snapshot.map((s) => `<tr><td class="nm">${esc(s.labelTe)}</td><td>${esc(s.valueTe)}</td><td class="small">${esc(s.noteTe ?? '')}</td></tr>`).join('')}
    </tbody>
  </table>

  <h2>2. రాశి చక్రం (దక్షిణ భారత పద్ధతి)</h2>
  ${chartGrid}
  <p class="small" style="text-align:center">సూ=సూర్యుడు · చం=చంద్రుడు · కు=కుజుడు · బు=బుధుడు · గు=గురువు · శు=శుక్రుడు · శ=శని · రా=రాహువు · కే=కేతువు · వ=వక్ర · ఆకుపచ్చ=ఉచ్ఛ · ఎరుపు=నీచ</p>

  <h2>3. మూడు స్తంభాలు — జాతకానికి ప్రాణం</h2>
  ${r.pillars
    .map(
      (p) => `<div class="pillar">
      <h3 style="margin-top:0">${esc(p.titleTe)} <span class="small">— ${esc(p.subtitleTe)}</span></h3>
      <ul class="facts">${p.factsTe.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
      <p><b>తీర్పు:</b> ${esc(p.verdictTe)}</p>
      <p>${esc(p.deepTe)}</p>
    </div>`
    )
    .join('')}

  <h2>4. గ్రహ బల క్రమం (షడ్బలం — BPHS అధ్యాయం 27)</h2>
  <p class="small">బలమైన గ్రహం జాతకాన్ని నడుపుతుంది; బలహీన గ్రహం దాని దశలో ఓర్పు కోరుతుంది. బలం = మొత్తం విరూపాలు ÷ శాస్త్రీయ అవసరం.</p>
  <table>
    <thead><tr><th>గ్రహం</th><th>రాశి · భావం</th><th>క్షేత్రం</th><th>షడ్బలం</th><th></th><th>లగ్నానికి స్వభావం</th></tr></thead>
    <tbody>${balaBars}</tbody>
  </table>

  <h2>5. ద్వాదశ భావ విచారణ</h2>
  <p class="small">బిందువులు = సర్వాష్టకవర్గం (మొత్తం 337; సగటు భావానికి ≈ 28). భావ బలం ర్యాంక్ = షడ్బల ఆధారిత భావ బలం (1 = అత్యధికం).</p>
  <table>
    <thead><tr><th>భావం</th><th>రాశి</th><th>అధిపతి (ఎక్కడ)</th><th>భావంలో గ్రహాలు</th><th>బిందువులు</th><th>బల ర్యాంక్</th><th>గ్రేడ్</th></tr></thead>
    <tbody>${bhavaRows}</tbody>
  </table>

  <h3>ముఖ్య భావాల లోతైన విచారణ (2 · 3 · 5 · 7 · 9 · 10)</h3>
  ${bhavaDeep}

  <h2>6. యోగ — దోష పరిశీలన</h2>
  <table>
    <thead><tr><th style="width:22%">అంశం</th><th style="width:18%">స్థితి</th><th>గణన ఆధారం</th></tr></thead>
    <tbody>${yogaRows}</tbody>
  </table>

  <h2>7. దశా క్రమం — జీవిత పర్వాలు</h2>
  <table>
    <thead><tr><th>మహాదశ</th><th>ఆరంభం</th><th>ముగింపు</th><th>వయస్సు</th><th>ఏ గ్రహం ఎలా నడుపుతుంది</th></tr></thead>
    <tbody>${dashaRows}</tbody>
  </table>

  <h2>8. మీ ప్రశ్నలకు నేరుగా సమాధానాలు</h2>
  <p class="small">ప్రతి సమాధానం వెనుక కారణం ఇవ్వబడింది — ఏ భావం, ఏ గ్రహం, ఏ బిందువు, ఏ దశ. కారణం లేని వాక్యం లేదు.</p>
  ${r.prashnottaralu
    .map(
      (q, i) => `<div class="qa">
      <h3>${i + 1}. ${esc(q.prashnaTe)}</h3>
      <p>${esc(q.uttaramTe)}</p>
    </div>`
    )
    .join('')}

  <h2>9. సారాంశం — “అసలు ఈ జాతకం ఏమిటి?”</h2>
  <div class="sara">
    <ol>${r.sara.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>
  </div>

  <h2>10. ఈ జాతకం ఏమి చెప్పదు (నిషేధ పట్టిక)</h2>
  <div class="nishedha">
    <ul>${r.nishedha.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
  </div>

  <h2>11. మార్గదర్శనం</h2>
  ${r.margadarshanam.map((m) => `<h3>${esc(m.headingTe)}</h3><p>${esc(m.bodyTe)}</p>`).join('')}

  <div class="foot">
    గణన ప్రమాణం: లహిరి అయనాంశ ${esc(chart.ayanamsaFormatted)} · సంపూర్ణ రాశి భావ పద్ధతి ·
    బృహత్ పరాశర హోరా శాస్త్రం (షడ్బలం అధ్యాయం 27, భావ బలం, యోగాలు) · సారావళి · జాతక పారిజాతం ·
    ఫలదీపిక · అష్టకవర్గం (సర్వాష్టకవర్గం 337) · వింశోత్తరి దశ.<br />
    ఇది శాస్త్రీయ గణన ఆధారిత విశ్లేషణ. వైద్య, న్యాయ, ఆర్థిక నిర్ణయాలకు సంబంధిత నిపుణుల సలహా తప్పనిసరి.
  </div>

</div>
</body>
</html>
`;

writeFileSync(outFile, html, 'utf8');
const kb = Math.round(Buffer.byteLength(html, 'utf8') / 1024);
console.log(`✓ ${outFile} — ${kb} KB · భావాలు ${r.bhava.length} · గ్రహాలు ${r.grahaBala.length} · దశలు ${r.dashaKrama.length}`);
console.log(`  లగ్నం: ${chart.ascendant.signName} ${chart.ascendant.formattedDMS} · సూర్యుడు ${r.grahaBala.find((g) => g.id === 'Sun')?.shadbalaPct.toFixed(1)}% · గురువు ${r.grahaBala[0].nameTe} ${r.grahaBala[0].shadbalaPct.toFixed(1)}%`);
