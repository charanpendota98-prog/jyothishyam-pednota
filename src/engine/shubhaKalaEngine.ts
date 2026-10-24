/**
 * shubhaKalaEngine.ts — ఈ జాతకుడికి శుభ ముహూర్తాలు & శుభ దిక్కులు.
 *
 * రెండు ప్రశ్నలు ఒకే చోట:
 *   1. "పెళ్లి / గృహప్రవేశం / వ్యాపారం ఎప్పుడు మొదలుపెట్టాలి?" —
 *      ముహూర్త ఇంజిన్ (తిథి · నక్షత్రం · యోగం · కరణం · తారాబల · చంద్రబల ·
 *      రాహుకాలం) ప్రకారం ఈ జాతకుడి జన్మ నక్షత్రానికి సరిపోయే నిజమైన తేదీలు.
 *   2. "నాకు శుభ దిక్కు ఏది?" — లగ్నాధిపతి, 10వ భావాధిపతి, 4వ భావాధిపతి
 *      గ్రహాల దిక్కుల నుంచి (బృహత్ పారాశర దిక్-బల నియమం).
 *
 * ఇక్కడ తేదీలు ఊహించబడవు — `searchFavorableMuhurtas` ప్రతి రోజును లెక్కించి,
 * నిర్దిష్ట స్కోరు దాటిన వాటిని మాత్రమే ఇస్తుంది.
 */
import type { CompleteChartResult } from './ephemeris.ts';
import { MUHURTA_ACTIVITIES, searchFavorableMuhurtas } from './muhurtaEngine.ts';
import type { MuhurtaActivityId } from './muhurtaEngine.ts';
import { TELUGU_PLANETS } from './teluguJathakam.ts';
import { TELUGU_RASIS } from './rasiNames.ts';

const DAY = 86400000;

/** జీవితంలో నిజంగా అడిగే ఐదు కార్యక్రమాలు. */
const ACTIVITIES: { id: MuhurtaActivityId; labelTe: string; whyTe: string }[] = [
  { id: 'vivaha', labelTe: 'వివాహం', whyTe: 'ఏడు జన్మల బంధం — గురు, శుక్ర, లగ్న బలం ముఖ్యం' },
  { id: 'grihapravesham', labelTe: 'గృహప్రవేశం', whyTe: 'కొత్త ఇల్లు — శుక్ర, చంద్ర, లగ్న శుద్ధి' },
  { id: 'vyaparam', labelTe: 'వ్యాపార ప్రారంభం', whyTe: 'బుధ, గురు బలం — మొదలు శుభమైతే నిలుస్తుంది' },
  { id: 'vahana', labelTe: 'వాహన కొనుగోలు', whyTe: 'శుక్ర, చంద్ర బలం — ప్రయాణ భయం తీరుతుంది' },
  { id: 'vidyarambham', labelTe: 'విద్యారంభం', whyTe: 'బుధ, గురు — అక్షరాభ్యాసానికి' },
];

/** గ్రహాల దిక్కులు — బృహత్ పారాశర దిక్-బల అధ్యాయం. */
const GRAHA_DIRECTION_TE: Record<string, string> = {
  Sun: 'తూర్పు',
  Moon: 'వాయువ్యం',
  Mars: 'దక్షిణం',
  Mercury: 'ఉత్తరం',
  Jupiter: 'ఈశాన్యం',
  Venus: 'ఆగ్నేయం',
  Saturn: 'పశ్చిమం',
  Rahu: 'నైఋతి',
  Ketu: 'నైఋతి',
};

const nameOf = (id: string) => (TELUGU_PLANETS[id]?.nameTe ?? id).split(' (')[0];
const rasiOf = (i: number) => TELUGU_RASIS[i]?.nameTe.split(' ')[0] ?? '—';

export interface ShubhaDateRow {
  dateISO: string;
  dayTe: string;
  tithiTe: string;
  nakshatraTe: string;
  tarabalaTe: string;
  timeSlotTe: string;
  score: number;
  gradeTe: string;
  rahuKalam: string;
  /** ఎన్ని అనుకూల అంశాలు కలిశాయి (తిథి · వారం · నక్షత్రం · తార · చంద్రబల · యోగం …) */
  favourableCount: number;
}

export interface ActivityWindows {
  id: MuhurtaActivityId;
  labelTe: string;
  whyTe: string;
  dates: ShubhaDateRow[];
  /** తగిన తేదీలు దొరకని నెలల సంఖ్య లేదా "సరిపోయే తేదీలు దొరకలేదు" */
  noteTe: string;
}

export interface DirectionRow {
  purposeTe: string;
  lordTe: string;
  directionTe: string;
  whyTe: string;
}

export interface ShubhaKalaReport {
  asOfISO: string;
  windows: ActivityWindows[];
  directions: DirectionRow[];
  summaryTe: string;
  methodNoteTe: string;
}

export function computeShubhaKala(
  chart: CompleteChartResult,
  nowMs: number = Date.now(),
  monthsAhead = 6
): ShubhaKalaReport {
  const tz = chart.input.tzOffsetHours ?? 5.5;
  const lat = chart.input.lat;
  const lng = chart.input.lng;
  const startISO = new Date(nowMs + tz * 3600000).toISOString().slice(0, 10);

  const windows: ActivityWindows[] = ACTIVITIES.map((act) => {
    const cfg = MUHURTA_ACTIVITIES[act.id];
    const days = Math.round((monthsAhead * 365.25) / 12);

    // 183 రోజులను పంచాంగ శుద్ధితో వడపోత చేస్తాము.
    const raw = searchFavorableMuhurtas(act.id, startISO, days, lat, lng, tz, chart, {
      minScore: 55,
      onlyFavorableTarabala: true,
    });

    // నిషిద్ధ వారం / తిథి / నక్షత్రం / చంద్రాష్టమం / భద్ర / దుష్ట యోగం — ఉన్న రోజు
    // స్కోరు ఎంత ఉన్నా ముహూర్తానికి పనికిరాదు. పంచాంగ శుద్ధి లేని తేదీ ఇవ్వడం మోసం.
    const clean = raw.filter((r) => {
      const tithiIdx = r.tithiNumber - 1;
      return (
        !cfg.avoidVaras.includes(r.dayOfWeek) &&
        !cfg.avoidTithiIndices.includes(tithiIdx) &&
        !cfg.avoidNakshatraNames.includes(r.nakshatraNameEn) &&
        !r.isChandrashtama &&
        !r.isVishtiKarana &&
        !r.isDushtaYoga
      );
    });

    // ఒక నెలకు ఒకటే ఉత్తమ తేదీ — ఆ నెలలో ఎక్కువ అనుకూల అంశాలు కలిసిన రోజు.
    const byMonth = new Map<string, (typeof clean)[number]>();
    for (const r of clean) {
      const key = r.date.slice(0, 7);
      const cur = byMonth.get(key);
      const better =
        !cur ||
        r.favorablePointsTe.length > cur.favorablePointsTe.length ||
        (r.favorablePointsTe.length === cur.favorablePointsTe.length && r.date < cur.date);
      if (better) byMonth.set(key, r);
    }
    const monthKeys = [...byMonth.keys()].sort();
    const bestPerMonth = monthKeys
      .map((k) => byMonth.get(k)!)
      .sort(
        (a, b) =>
          b.favorablePointsTe.length - a.favorablePointsTe.length ||
          b.shubhaScore - a.shubhaScore ||
          a.date.localeCompare(b.date)
      );

    // వరుస నెలలు కాకుండా — కాలంలో చెల్లాచెదురుగా మూడు అవకాశాలు (తేదీ ఎంచుకోవడానికి వీలుగా).
    const picked: typeof bestPerMonth = [];
    for (const cand of bestPerMonth) {
      const monthIdx = Number(cand.date.slice(5, 7));
      const farEnough = picked.every((p) => Math.abs(Number(p.date.slice(5, 7)) - monthIdx) >= 2);
      if (farEnough) picked.push(cand);
      if (picked.length === 3) break;
    }
    for (const cand of bestPerMonth) {
      if (picked.length >= 3) break;
      if (!picked.includes(cand)) picked.push(cand);
    }

    const found: ShubhaDateRow[] = picked
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((r) => ({
        dateISO: r.date,
        dayTe: r.dayNameTe,
        tithiTe: r.tithiNameTe,
        nakshatraTe: r.nakshatraNameTe,
        tarabalaTe: r.tarabalaNameTe,
        timeSlotTe: r.recommendedTimeSlotTe.split(' లేదా ')[0],
        score: r.shubhaScore,
        gradeTe: r.gradeTe,
        rahuKalam: r.rahuKalam,
        favourableCount: r.favorablePointsTe.length,
      }));

    return {
      id: act.id,
      labelTe: act.labelTe,
      whyTe: act.whyTe,
      dates: found,
      noteTe: found.length
        ? `${days} రోజుల్లో ${clean.length} రోజులు పంచాంగ శుద్ధి దాటాయి · ${found.length} ఉత్తమ తేదీలు (ఒక్కో నెలకు ఒకటి)`
        : `${days} రోజుల్లో ఈ కార్యానికి తారాబల + పంచాంగ శుద్ధి రెండూ కలిసిన తేదీ దొరకలేదు. ` +
          'దగ్గరి పంచాంగం చూసి, పురోహితుడితో సరిచూసుకోవడం మంచిది.',
    };
  });

  // ---- శుభ దిక్కులు ----
  const lagnaSign = ((Math.floor(chart.ascendant.siderealLon / 30) % 12) + 12) % 12;
  const lordOf = (house: number) => {
    const sign = (lagnaSign + house - 1) % 12;
    return TELUGU_RASIS[sign]?.lordTe?.replace(' (అంగారకుడు)', '') ?? '';
  };
  const planetIdFromLordTe = (lordTe: string): string => {
    const entry = Object.entries(TELUGU_PLANETS).find(
      ([, v]) => v.nameTe.split(' (')[0] === lordTe.split(' (')[0]
    );
    return entry?.[0] ?? 'Sun';
  };

  const lagnaLord = planetIdFromLordTe(lordOf(1));
  const tenthLord = planetIdFromLordTe(lordOf(10));
  const fourthLord = planetIdFromLordTe(lordOf(4));
  const ninthLord = planetIdFromLordTe(lordOf(9));

  const directions: DirectionRow[] = [
    {
      purposeTe: 'మొత్తం జీవితానికి ఇష్ట దిక్కు (లగ్నాధిపతి దిక్కు)',
      lordTe: `లగ్నాధిపతి ${nameOf(lagnaLord)}`,
      directionTe: GRAHA_DIRECTION_TE[lagnaLord] ?? '—',
      whyTe: `లగ్నం ${rasiOf(lagnaSign)} కాబట్టి లగ్నాధిపతి ${nameOf(lagnaLord)} — ఈ దిక్కుకు ముఖం పెట్టి కూర్చోవడం, ఇంటి ప్రధాన ద్వారం ఈ దిక్కున ఉండటం శుభం`,
    },
    {
      purposeTe: 'ఉద్యోగం · వృత్తి · కీర్తి',
      lordTe: `10వ భావాధిపతి ${nameOf(tenthLord)}`,
      directionTe: GRAHA_DIRECTION_TE[tenthLord] ?? '—',
      whyTe: '10వ భావం (కర్మ స్థానం) అధిపతి దిక్కున ఉద్యోగం, వ్యాపార స్థలం లేదా పని బల్ల ఉండటం వృత్తికి తోడ్పడుతుంది',
    },
    {
      purposeTe: 'నిద్ర · మనశ్శాంతి',
      lordTe: `4వ భావాధిపతి ${nameOf(fourthLord)}`,
      directionTe: GRAHA_DIRECTION_TE[fourthLord] ?? '—',
      whyTe: '4వ భావం (సుఖ స్థానం) అధిపతి దిక్కున తల వేసుకుని నిద్రించడం — తల తూర్పు/దక్షిణం అనే సాధారణ నియమానికి ఇది అదనపు సూచన',
    },
    {
      purposeTe: 'పూజ · ధర్మం · గురువు ఆశీర్వాదం',
      lordTe: `9వ భావాధిపతి ${nameOf(ninthLord)}`,
      directionTe: GRAHA_DIRECTION_TE[ninthLord] ?? '—',
      whyTe: '9వ భావం (భాగ్య స్థానం) అధిపతి దిక్కున పూజా మందిరం ఉండటం ధర్మానుకూలం',
    },
  ];

  const totalDates = windows.reduce((a, w) => a + w.dates.length, 0);
  const best = windows
    .flatMap((w) => w.dates.map((d) => ({ ...d, labelTe: w.labelTe })))
    .sort((a, b) => b.score - a.score)[0];

  return {
    asOfISO: startISO,
    windows,
    directions,
    summaryTe:
      `రాబోయే ${monthsAhead} నెలల్లో ${totalDates} శుభ తేదీలు దొరికాయి` +
      (best ? `; వాటిలో అత్యుత్తమం ${best.dateISO} (${best.labelTe}, ${best.score}/100)` : '') +
      `. ఇష్ట దిక్కు ${GRAHA_DIRECTION_TE[lagnaLord] ?? '—'}, వృత్తి దిక్కు ${GRAHA_DIRECTION_TE[tenthLord] ?? '—'}.`,
    methodNoteTe:
      'తేదీలు: తిథి · నక్షత్రం · యోగం · కరణం · తారాబల (జన్మ నక్షత్రం నుంచి) · చంద్రబల · రాహుకాలం — ఇవన్నీ ప్రతి రోజుకూ లెక్కించి, ' +
      'కార్యానికి తగిన స్కోరు దాటిన రోజులే ఇవ్వబడ్డాయి. తారాబల ప్రతికూలంగా ఉన్న రోజులు ముందే తీసేయబడ్డాయి. ' +
      'ముహూర్తం అనేది కుటుంబ సంప్రదాయం, పురోహితుడి అనుమతి, స్థలం బట్టి మారుతుంది — ఇది సిద్ధమైన జాబితా, తుది నిర్ణయం కాదు. ' +
      'దిక్కులు: బృహత్ పారాశర దిక్-బల అధ్యాయం ప్రకారం ప్రతి గ్రహానికి ఒక దిక్కు; సంబంధిత భావాధిపతి దిక్కు ఆ కార్యానికి అనుకూలం.',
  };
}
