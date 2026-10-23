/**
 * dashaGocharaSamanvayaEngine.ts — దశా × గోచార సమన్వయం.
 *
 * ఒక జాతకంలో "ఇప్పుడు ఏమి జరుగుతోంది" అనే ప్రశ్నకు రెండు కారణాలు ఉంటాయి:
 *   1. దశా — నడుస్తున్న మహాదశ/భుక్తి/ప్రత్యంతర అధిపతి,
 *   2. గోచారం — ఆ కాలంలో గ్రహాలు ఎక్కడ సంచరిస్తున్నాయి.
 * రెండూ కలిసి ఫలిస్తాయి; ఒకటి మాత్రమే చూసి చెప్పడం అసంపూర్ణం.
 *
 * ఈ మాడ్యూల్ రాబోయే 12 నెలలను నెలవారీగా విభజించి, ప్రతి నెలకూ
 *   (అ) నడుస్తున్న దశా గొలుసు, (బి) ప్రధాన గోచార మార్పులు,
 *   (సి) ఆ గోచార రాశి సర్వాష్టకవర్గ బిందువులు,
 *   (డి) వాటి నుంచి ఏర్పడే ఒక తీర్మానం — ఇస్తుంది.
 * ఏ తీర్మానమూ స్థిరంగా రాయబడదు; అన్నీ నియమాల నుంచి లెక్కిస్తాయి.
 */
import type { CompleteChartResult } from './ephemeris.ts';
import { siderealLongitude, meanNodeTropical, ayanamsaDegrees, nutationLongitudeDeg } from './astroCore.ts';
import { computeVimshottariDeep, dashaChainAt, formatLocalDateOnly } from './vimshottariDeepEngine.ts';
import { TELUGU_PLANETS } from './teluguJathakam.ts';
import { TELUGU_RASIS } from './rasiNames.ts';
import { computeGocharaReport } from './gocharaVedhaEngine.ts';

const DAY = 86400000;

/** గోచారంలో శుభ స్థానాలు — జన్మ రాశి నుంచి (ఫలదీపికా 26 / గోచార వాక్యాలు). */
const GOOD_HOUSES: Record<string, number[]> = {
  Sun: [3, 6, 10, 11],
  Moon: [1, 3, 6, 7, 10, 11],
  Mars: [3, 6, 11],
  Mercury: [2, 4, 6, 8, 10, 11],
  Jupiter: [2, 5, 7, 9, 11],
  Venus: [1, 2, 3, 4, 5, 8, 9, 11, 12],
  Saturn: [3, 6, 11],
  Rahu: [3, 6, 10, 11],
  Ketu: [3, 6, 10, 11],
};

/** దశాధిపతి ఎక్కడ ఉంటే ఫలం బలంగా ఉంటుంది — కేంద్ర/త్రికోణ/లాభం. */
const DASHA_GOOD_HOUSES = [1, 2, 4, 5, 7, 9, 10, 11];

const nameOf = (id: string) => (TELUGU_PLANETS[id]?.nameTe ?? id).split(' (')[0];
const rasiOf = (i: number) => TELUGU_RASIS[i]?.nameTe.split(' ')[0] ?? '—';

export interface SamanvayaMonthRow {
  /** నెల పేరు + సంవత్సరం */
  monthTe: string;
  startISO: string;
  endISO: string;
  /** నెల మధ్యలో నడుస్తున్న దశలు */
  mdTe: string;
  adTe: string;
  pdTe: string;
  /** ఆ నెలలో రాశి మార్చే గ్రహాలు (గోచారం) */
  ingressTe: string;
  /** శని · గురు · రాహు జన్మ రాశి నుంచి ఎన్నో స్థానంలో */
  keyTransitsTe: string;
  /** శని సంచరించే రాశికి సర్వాష్టకవర్గ బిందువులు */
  savBindus: number;
  /** 0–100 సమన్వయ స్కోరు (దశ + గోచారం + బిందువులు) */
  score: number;
  verdictTe: string;
}

export interface PratyantarRow {
  lordTe: string;
  startISO: string;
  endISO: string;
  widthTe: string;
  running: boolean;
}

export interface DashaGocharaReport {
  asOfISO: string;
  months: SamanvayaMonthRow[];
  pratyantars: PratyantarRow[];
  runningTe: string;
  summaryTe: string;
  methodNoteTe: string;
  strongestMonth: SamanvayaMonthRow;
  weakestMonth: SamanvayaMonthRow;
}

function monthKeyTe(ms: number, tz: number): string {
  const d = new Date(ms + tz * 3600000);
  const months = [
    'జనవరి',
    'ఫిబ్రవరి',
    'మార్చి',
    'ఏప్రిల్',
    'మే',
    'జూన్',
    'జూలై',
    'ఆగస్టు',
    'సెప్టెంబరు',
    'అక్టోబరు',
    'నవంబరు',
    'డిసెంబరు',
  ];
  return `${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/**
 * జూలియన్ దినం → సిడెరియల్ రేఖాంశం (డిగ్రీ).
 * రాహువు/కేతువు ఛాయా గ్రహాలు — ఎఫెమెరిస్ బాడీలు కావు, మధ్యమ పాతంతో లెక్కిస్తాము
 * (జాతక గణనలో వాడే అదే మధ్యమ రాహు సంప్రదాయం).
 */
function lonAt(planet: string, jd: number, mode: string): number {
  if (planet === 'Rahu' || planet === 'Ketu') {
    const tropical = meanNodeTropical(jd);
    const sid = tropical - nutationLongitudeDeg(jd) - ayanamsaDegrees(jd, mode as never);
    return ((sid % 360) + 360) % 360 + (planet === 'Ketu' ? 180 : 0);
  }
  return siderealLongitude(planet as never, jd, mode as never);
}

const JD_UNIX_EPOCH = 2440587.5;

export function computeDashaGocharaSamanvaya(
  chart: CompleteChartResult,
  nowMs: number = Date.now()
): DashaGocharaReport {
  const tz = chart.input.tzOffsetHours ?? 5.5;
  const mode = (chart.input.ayanamsa as string) ?? 'lahiri';
  const moon = chart.planets.find((p) => p.id === 'Moon');
  const moonSign = moon?.signIndex ?? 0;
  const sav = (chart.ashtakavarga?.sarvashtakavarga as number[] | undefined) ?? new Array(12).fill(0);
  const shadbalaByPlanet = new Map(chart.shadbala.map((s) => [s.planet, s]));

  const deep = computeVimshottariDeep(chart);
  const chain = dashaChainAt(nowMs, tz, deep.mahadashas[0].lord, deep.mahadashas[0].startMs);
  const runningMD = [...deep.mahadashas].reverse().find((m) => m.startMs <= nowMs);
  const runningAD = runningMD?.children.find((a) => a.startMs <= nowMs && nowMs < a.endMs);

  // ---- నడుస్తున్న భుక్తిలోని 9 ప్రత్యంతర దశలు ----
  const pratyantars: PratyantarRow[] = (runningAD?.children ?? []).map((n) => ({
    lordTe: n.lordTe,
    startISO: n.startLocal.slice(0, 10),
    endISO: n.endLocal.slice(0, 10),
    widthTe: n.widthTe,
    running: n.startMs <= nowMs && nowMs < n.endMs,
  }));

  // ---- రాబోయే 12 నెలలు ----
  const months: SamanvayaMonthRow[] = [];
  const cursorStart = new Date(nowMs);

  for (let i = 0; i < 12; i += 1) {
    const startMs = Date.UTC(
      cursorStart.getUTCFullYear(),
      cursorStart.getUTCMonth() + i,
      1
    ) - tz * 3600000;
    const endMs = Date.UTC(cursorStart.getUTCFullYear(), cursorStart.getUTCMonth() + i + 1, 1) - tz * 3600000;
    const midMs = startMs + (endMs - startMs) / 2;

    // ఆ నెల మధ్యలో దశా గొలుసు
    const chainMid = dashaChainAt(midMs, tz, deep.mahadashas[0].lord, deep.mahadashas[0].startMs);
    const mdN = chainMid.find((c) => c.level === 'MD');
    const adN = chainMid.find((c) => c.level === 'AD');
    const pdN = chainMid.find((c) => c.level === 'PD');

    // గోచార రాశి మార్పులు — నెల మొదటి & చివరి రోజు పోలిక
    const jdStart = startMs / DAY + JD_UNIX_EPOCH;
    const jdEnd = endMs / DAY + JD_UNIX_EPOCH;
    const ingress: string[] = [];
    const transitHouses: string[] = [];
    let saturnSign = 0;
    for (const pid of ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu']) {
      const s0 = Math.floor(lonAt(pid, jdStart, mode) / 30) % 12;
      const s1 = Math.floor(lonAt(pid, jdEnd, mode) / 30) % 12;
      if (s0 !== s1) ingress.push(`${nameOf(pid)} → ${rasiOf(s1)}`);
      if (pid === 'Saturn') saturnSign = s1;
      if (['Saturn', 'Jupiter', 'Rahu'].includes(pid)) {
        const house = ((Math.floor(lonAt(pid, midMs / DAY + JD_UNIX_EPOCH, mode) / 30) % 12) - moonSign + 12) % 12 + 1;
        transitHouses.push(`${nameOf(pid)} ${house}`);
      }
    }
    const savBindus = sav[saturnSign] ?? 0;

    // ---- సమన్వయ స్కోరు ----
    const adLordId = adN?.lord ?? 'Sun';
    const adPlanet = chart.planets.find((p) => p.id === adLordId);
    const adHouse = adPlanet?.house ?? 0;
    const adShadbala = shadbalaByPlanet.get(adLordId);
    let score = 50;
    if (DASHA_GOOD_HOUSES.includes(adHouse)) score += 12;
    else if ([6, 8, 12].includes(adHouse)) score -= 12;
    if (adShadbala) score += adShadbala.ratio >= 1.2 ? 10 : adShadbala.ratio >= 1 ? 4 : adShadbala.ratio >= 0.8 ? -4 : -10;
    if ((adPlanet?.dignity ?? '').toLowerCase().includes('exalt')) score += 8;
    if ((adPlanet?.dignity ?? '').toLowerCase().includes('debilit')) score -= 8;

    // గోచారం: జన్మ రాశి నుంచి శని/గురు స్థానాలు
    for (const pid of ['Saturn', 'Jupiter']) {
      const lon = lonAt(pid, midMs / DAY + JD_UNIX_EPOCH, mode);
      const house = ((Math.floor(lon / 30) % 12) - moonSign + 12) % 12 + 1;
      if (GOOD_HOUSES[pid]?.includes(house)) score += 8;
      else if ([8, 12].includes(house)) score -= 8;
    }
    if (savBindus >= 32) score += 8;
    else if (savBindus <= 24) score -= 8;
    score = Math.max(5, Math.min(95, Math.round(score)));

    const band =
      score >= 72 ? 'అనుకూలం' : score >= 60 ? 'మెరుగైనది' : score >= 45 ? 'మధ్యమం' : score >= 32 ? 'శ్రమతో కూడినది' : 'జాగ్రత్త అవసరం';
    const bits: string[] = [];
    bits.push(`${band} (${score}/100)`);
    bits.push(
      `భుక్తి అధిపతి ${nameOf(adLordId)} ${adHouse ? `${adHouse}వ భావంలో` : 'భావం లెక్కలో లేదు'}${
        adShadbala ? `, షడ్బల నిష్పత్తి ${adShadbala.ratio.toFixed(2)}` : ''
      }`
    );
    bits.push(`శని రాశికి SAV ${savBindus} బిందువులు`);
    if (ingress.length) bits.push(`ఈ నెల రాశి మార్పు: ${ingress.join(', ')}`);

    months.push({
      monthTe: monthKeyTe(startMs, tz),
      startISO: formatLocalDateOnly(startMs, tz),
      endISO: formatLocalDateOnly(endMs - DAY, tz),
      mdTe: mdN?.lordTe ?? runningMD?.lordTe ?? '—',
      adTe: adN?.lordTe ?? '—',
      pdTe: pdN?.lordTe ?? '—',
      ingressTe: ingress.length ? ingress.join(' · ') : 'ప్రధాన రాశి మార్పు లేదు',
      keyTransitsTe: transitHouses.join(' · '),
      savBindus,
      score,
      verdictTe: bits.join(' · '),
    });
  }

  const sorted = [...months].sort((a, b) => b.score - a.score);
  const strongestMonth = sorted[0];
  const weakestMonth = sorted[sorted.length - 1];

  // ఈ క్షణపు గోచార సారాంశం (ఉన్న ఇంజిన్ నుంచే — రెండు చోట్లా ఒకే తీర్పు రావాలి)
  const goch = computeGocharaReport(moonSign, Math.floor((moon?.siderealLon ?? 0) / (360 / 27)), {
    asOfISO: formatLocalDateOnly(nowMs, tz),
    tzOffsetHours: tz,
    siderealMode: mode as never,
  });

  const runningTe =
    chain
      .filter((c) => c.level === 'MD' || c.level === 'AD' || c.level === 'PD')
      .map((c) => `${c.level === 'MD' ? 'మహాదశ' : c.level === 'AD' ? 'భుక్తి' : 'ప్రత్యంతర'} ${c.lordTe} (${c.startLocal.slice(0, 10)} → ${c.endLocal.slice(0, 10)})`)
      .join(' · ') || '—';

  return {
    asOfISO: formatLocalDateOnly(nowMs, tz),
    months,
    pratyantars,
    runningTe,
    summaryTe:
      `రాబోయే 12 నెలల్లో అత్యంత అనుకూల నెల ${strongestMonth?.monthTe} (${strongestMonth?.score}/100), ` +
      `అత్యంత తక్కువ స్కోరు నెల ${weakestMonth?.monthTe} (${weakestMonth?.score}/100). ` +
      `ఈ రోజు గోచారం: ${goch.summaryTe}`,
    methodNoteTe:
      'సమన్వయ స్కోరు నియమం: భుక్తి అధిపతి యొక్క జన్మ భావం (కేంద్ర/త్రికోణ/లాభం +12, దుష్ట 6/8/12 −12), షడ్బల నిష్పత్తి, గ్రహ స్థితి (ఉచ్చ +8, నీచ −8), ' +
      'జన్మ రాశి నుంచి శని/గురు గోచార స్థానం (±8), శని సంచరించే రాశికి సర్వాష్టకవర్గ బిందువులు (32+ +8, 24− −8). ' +
      'ఇది సంభావ్యత సూచిక — ఫలానా తేదీన ఫలానా జరుగుతుంది అని చెప్పే జ్యోతిష్యం లేదు, సిద్ధత చూపే సూచిక మాత్రమే.',
    strongestMonth,
    weakestMonth,
  };
}
