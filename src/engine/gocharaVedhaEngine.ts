/**
 * gocharaVedhaEngine.ts — గోచార ఫలం (transit results from the natal Moon)
 *
 * Classical basis
 * ---------------
 *  • Favourable transit houses from the janma rāśi and the paired *vedha*
 *    (obstruction) houses are taken from Bṛhat Saṁhitā 104.4 and Phaladīpikā 26.3-8:
 *      Sun     3(9)  6(12) 10(4) 11(5)
 *      Moon    1(5)  3(9)  6(12) 7(2) 10(4) 11(8)
 *      Mars    3(12) 6(9)  11(5)
 *      Mercury 2(5)  4(3)  6(9)  8(1) 10(8) 11(12)
 *      Jupiter 2(12) 5(4)  7(3)  9(2) 11(10)
 *      Venus   1(8)  2(7)  3(1)  4(9) 5(10) 8(11) 9(5) 11(3) 12(6)
 *      Saturn  3(6)  6(3)  11(12)
 *    with the two classical exemptions — Sun and Saturn never obstruct each
 *    other, Moon and Mercury never obstruct each other.
 *  • Positions are true nirāyaṇa longitudes (Lahiri) of the nine grahas; the
 *    nodes use the true (perturbed) node. Ingress instants are root-found on the
 *    exact longitude crossing, so "Saturn enters Kumbha on …" is a real instant.
 *  • Sāḍe-sātī is Saturn transiting the 12th, 1st and 2nd from the janma rāśi;
 *    its exact start/end are Saturn's ingress instants into those signs.
 */
import {
  civilDateAt,
  formatLocalHM,
  grahaSiderealLongitude,
  grahaMeanMotion,
  jdFromMs,
  localMidnightJd,
  nextSignIngressJd,
  previousSignIngressJd,
  type GrahaId,
  type SiderealMode,
} from './astroCore.ts';
import { TELUGU_NAKSHATRAS, TELUGU_RASIS } from './teluguJathakam.ts';

export const GRAHA_ORDER: GrahaId[] = [
  'Sun',
  'Moon',
  'Mars',
  'Mercury',
  'Jupiter',
  'Venus',
  'Saturn',
  'Rahu',
  'Ketu',
];

export const GRAHA_NAMES_TE: Record<GrahaId, string> = {
  Sun: 'సూర్యుడు',
  Moon: 'చంద్రుడు',
  Mars: 'కుజుడు',
  Mercury: 'బుధుడు',
  Jupiter: 'గురుడు',
  Venus: 'శుక్రుడు',
  Saturn: 'శని',
  Rahu: 'రాహువు',
  Ketu: 'కేతువు',
};

export const GRAHA_NAMES_EN: Record<GrahaId, string> = {
  Sun: 'Sun',
  Moon: 'Moon',
  Mars: 'Mars',
  Mercury: 'Mercury',
  Jupiter: 'Jupiter',
  Venus: 'Venus',
  Saturn: 'Saturn',
  Rahu: 'Rahu',
  Ketu: 'Ketu',
};

const FAVOURABLE: Record<GrahaId, number[]> = {
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

const VEDHA: Record<GrahaId, Record<number, number>> = {
  Sun: { 3: 9, 6: 12, 10: 4, 11: 5 },
  Moon: { 1: 5, 3: 9, 6: 12, 7: 2, 10: 4, 11: 8 },
  Mars: { 3: 12, 6: 9, 11: 5 },
  Mercury: { 2: 5, 4: 3, 6: 9, 8: 1, 10: 8, 11: 12 },
  Jupiter: { 2: 12, 5: 4, 7: 3, 9: 2, 11: 10 },
  Venus: { 1: 8, 2: 7, 3: 1, 4: 9, 5: 10, 8: 11, 9: 5, 11: 3, 12: 6 },
  Saturn: { 3: 6, 6: 3, 11: 12 },
  Rahu: { 3: 9, 6: 12, 10: 4, 11: 5 },
  Ketu: { 3: 9, 6: 12, 10: 4, 11: 5 },
};

/** Houses where a graha casts no vedha (father–son and Moon–Mercury pairs). */
const VEDHA_EXEMPT: Record<GrahaId, GrahaId[]> = {
  Sun: ['Saturn'],
  Moon: ['Mercury'],
  Mars: [],
  Mercury: ['Moon'],
  Jupiter: [],
  Venus: [],
  Saturn: ['Sun'],
  Rahu: [],
  Ketu: [],
};

const HOUSE_THEME_TE: Record<number, string> = {
  1: 'దేహం, ఆత్మవిశ్వాసం, జీవన ప్రవాహం',
  2: 'ధనం, కుటుంబం, వాక్కు',
  3: 'ప్రయత్నం, సోదరులు, సాహసం',
  4: 'గృహం, మాతృసుఖం, మనశ్శాంతి',
  5: 'సంతానం, విద్య, పూర్వ పుణ్యం',
  6: 'రోగం, శత్రువులు, ప్రతిస్పర్ధ',
  7: 'దాంపత్యం, భాగస్వామ్యం, ప్రజా సంబంధాలు',
  8: 'ఆయుష్షు, ఆకస్మిక మార్పులు, గుప్త విషయాలు',
  9: 'భాగ్యం, ధర్మం, గురు అనుగ్రహం',
  10: 'కర్మ, ఉద్యోగం, ప్రతిష్ఠ',
  11: 'లాభం, ఆదాయం, కోరికలు నెరవేరడం',
  12: 'వ్యయం, విదేశ యాత్ర, మోక్షం',
};

export interface GocharaGrahaEntry {
  id: GrahaId;
  nameTe: string;
  nameEn: string;
  siderealDeg: number;
  signIndex: number;
  signTe: string;
  signEn: string;
  degreeInSign: number;
  nakshatraTe: string;
  pada: number;
  isRetrograde: boolean;
  houseFromMoon: number;
  houseThemeTe: string;
  isFavourableHouse: boolean;
  verdict: 'good' | 'blocked' | 'bad';
  verdictTe: string;
  vedhaHouse: number | null;
  vedhaBy: string | null;
  effectTe: string;
  nextIngressISO: string;
  nextIngressSignTe: string;
  daysToIngress: number;
}

export interface SadeSatiInfo {
  active: boolean;
  phaseIndex: 1 | 2 | 3 | null;
  phaseTe: string | null;
  startISO: string | null;
  endISO: string | null;
  /** ప్రస్తుతం సాడే సాతి లేకపోతే తదుపరి కాలం (26 సంవత్సరాల శని గమనం నుంచి). */
  nextStartISO: string | null;
  nextEndISO: string | null;
  noteTe: string;
}

export interface GocharaReport {
  asOfISO: string;
  janmaRasiIndex: number;
  janmaRasiTe: string;
  janmaNakshatraTe: string;
  grahas: GocharaGrahaEntry[];
  sadeSati: SadeSatiInfo;
  ashtamaShani: boolean;
  kantakaShani: boolean;
  favourableCount: number;
  blockedCount: number;
  summaryTe: string;
  upcomingIngresses: {
    grahaId: GrahaId;
    grahaTe: string;
    dateISO: string;
    timeLocal: string;
    signTe: string;
    daysAway: number;
  }[];
}

const RASI_TE = TELUGU_RASIS.map((r) => r.nameTe);
const RASI_EN = TELUGU_RASIS.map((r) => r.nameEn);

function houseFromMoonCount(signIndex: number, moonSignIndex: number): number {
  return ((signIndex - moonSignIndex + 12) % 12) + 1;
}

export interface GocharaOptions {
  siderealMode?: SiderealMode;
  tzOffsetHours?: number;
  asOfISO?: string;
  /**
   * తేలికైన మోడ్ — రాశి ప్రవేశ క్షణాలు, సాడే సాతి కిటికీలు లెక్కించబడవు.
   * రోజువారీ/నెలవారీ ఫలాల్లో వందల సార్లు పిలిచేటప్పుడు ఇది అవసరం.
   */
  light?: boolean;
}

/**
 * Builds the transit (gochara) report for a native whose natal Moon occupies
 * `natalMoonSignIndex`. All transit positions are computed for the given date.
 */
export function computeGocharaReport(
  natalMoonSignIndex: number,
  natalMoonNakshatraIndex: number,
  options: GocharaOptions = {}
): GocharaReport {
  const mode = options.siderealMode ?? 'lahiri';
  const tz = options.tzOffsetHours ?? 5.5;
  const asOfISO =
    options.asOfISO ??
    (() => {
      const n = new Date();
      return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
    })();
  const jd = localMidnightJd(asOfISO, tz) + 0.5; // local noon — stable for the whole civil day

  const light = options.light === true;
  const positions = GRAHA_ORDER.map((id) => {
    const lon = grahaSiderealLongitude(id, jd, mode);
    const signIndex = Math.floor(lon / 30) % 12;
    const next = light
      ? { jd: Number.NaN, signIndex }
      : nextSignIngressJd(id, jd, mode);
    return { id, lon, signIndex, next };
  });

  /** Occupied houses (counted from the natal Moon) for vedha detection. */
  const occupiedHouses = new Map<number, GrahaId[]>();
  for (const p of positions) {
    const house = houseFromMoonCount(p.signIndex, natalMoonSignIndex);
    occupiedHouses.set(house, [...(occupiedHouses.get(house) ?? []), p.id]);
  }

  const grahas: GocharaGrahaEntry[] = positions.map((p) => {
    const house = houseFromMoonCount(p.signIndex, natalMoonSignIndex);
    const isFavourableHouse = FAVOURABLE[p.id].includes(house);
    const vedhaHouse = VEDHA[p.id][house] ?? null;
    const blockers =
      vedhaHouse === null
        ? []
        : (occupiedHouses.get(vedhaHouse) ?? []).filter((other) => !VEDHA_EXEMPT[p.id].includes(other));
    const vedhaBy = blockers.length > 0 ? blockers.map((b) => GRAHA_NAMES_TE[b]).join(', ') : null;

    let verdict: 'good' | 'blocked' | 'bad';
    let verdictTe: string;
    if (isFavourableHouse && !vedhaBy) {
      verdict = 'good';
      verdictTe = 'శుభ సంచారం';
    } else if (isFavourableHouse && vedhaBy) {
      verdict = 'blocked';
      verdictTe = `వేధ (${vedhaBy} వల్ల ఫలం నిరోధం)`;
    } else {
      verdict = 'bad';
      verdictTe = 'అశుభ సంచారం';
    }

    const theme = HOUSE_THEME_TE[house] ?? '';
    const effectTe =
      verdict === 'good'
        ? `${GRAHA_NAMES_TE[p.id]} ${house}వ భావంలో — ${theme} పట్ల శుభ ఫలితం.`
        : verdict === 'blocked'
          ? `${GRAHA_NAMES_TE[p.id]} ${house}వ భావంలో శుభ స్థానమే కానీ ${vedhaBy} వేధ వల్ల ఫలం ఆలస్యం/నిరోధం.`
          : `${GRAHA_NAMES_TE[p.id]} ${house}వ భావంలో — ${theme} విషయంలో జాగ్రత్త అవసరం.`;

    const daysToIngress = light ? 0 : Math.round(p.next.jd - jd);
    return {
      id: p.id,
      nameTe: GRAHA_NAMES_TE[p.id],
      nameEn: GRAHA_NAMES_EN[p.id],
      siderealDeg: lon(p.lon),
      signIndex: p.signIndex,
      signTe: RASI_TE[p.signIndex],
      signEn: RASI_EN[p.signIndex],
      degreeInSign: p.lon % 30,
      nakshatraTe: TELUGU_NAKSHATRAS[Math.floor(p.lon / (360 / 27))]?.nameTe ?? '',
      pada: Math.floor((p.lon % (360 / 27)) / (360 / 108)) + 1,
      isRetrograde: isRetrogradeGraha(p.id, jd, mode),
      houseFromMoon: house,
      houseThemeTe: theme,
      isFavourableHouse,
      verdict,
      verdictTe,
      vedhaHouse,
      vedhaBy,
      effectTe,
      nextIngressISO: light ? '' : civilDateAt(p.next.jd, tz),
      nextIngressSignTe: RASI_TE[p.next.signIndex],
      daysToIngress,
    };
  });

  /* ---------------- sāḍe-sātī ---------------- */
  const saturn = grahas.find((g) => g.id === 'Saturn')!;
  const saturnHouse = saturn.houseFromMoon;
  const isSadeSati = saturnHouse === 12 || saturnHouse === 1 || saturnHouse === 2;

  const s12 = (natalMoonSignIndex + 11) % 12;
  const s02 = (natalMoonSignIndex + 1) % 12;
  const s03 = (natalMoonSignIndex + 2) % 12;
  const s11 = (natalMoonSignIndex + 10) % 12;

  /**
   * Continuous list of Saturn sign-changes: 11 years back to **26 years ahead**.
   * 26 సంవత్సరాల లోతు ఎందుకు? — శని ఒక రాశిలో ~2.5 సం. ఉంటాడు; సాడే సాతి ~7.5 సం.
   * కాబట్టి తదుపరి సాడే సాతి కిటికీని (ఉదా. 2041–2049) చూపాలంటే రెండు శని చక్రాల లోతు కావాలి.
   */
  const saturnIngresses = (() => {
    if (light) return [] as { jd: number; signIndex: number }[];
    const out: { jd: number; signIndex: number }[] = [];
    let cursor = jd - 11 * 365.25;
    out.push({ jd: cursor, signIndex: Math.floor(grahaSiderealLongitude('Saturn', cursor, mode) / 30) % 12 });
    for (let i = 0; i < 60; i++) {
      const nx = nextSignIngressJd('Saturn', cursor + 0.02, mode);
      out.push(nx);
      cursor = nx.jd;
      if (nx.jd > jd + 26 * 365.25) break;
    }
    return out;
  })();

  /** 12వ భావ ప్రవేశం (సాడే సాతి ఆరంభం) → 3వ భావ ప్రవేశం (ముగింపు) జతలు */
  const sadeSatiWindows: { startJd: number; endJd: number }[] = [];
  for (let i = 1; i < saturnIngresses.length; i++) {
    if (saturnIngresses[i].signIndex !== s12 || saturnIngresses[i - 1].signIndex !== s11) continue;
    const startJd = saturnIngresses[i].jd;
    let endJd = Number.NaN;
    for (let j = i + 1; j < saturnIngresses.length; j++) {
      if (saturnIngresses[j].signIndex === s03 && saturnIngresses[j - 1].signIndex === s02) {
        endJd = saturnIngresses[j].jd;
        break;
      }
    }
    if (Number.isFinite(endJd)) sadeSatiWindows.push({ startJd, endJd });
  }
  const nextSadeSati = sadeSatiWindows.find((w) => w.startJd > jd) ?? null;

  const sadeSati: SadeSatiInfo = (() => {
    if (!isSadeSati) {
      return {
        active: false,
        phaseIndex: null,
        phaseTe: null,
        startISO: null,
        endISO: null,
        nextStartISO: nextSadeSati ? civilDateAt(nextSadeSati.startJd, tz) : null,
        nextEndISO: nextSadeSati ? civilDateAt(nextSadeSati.endJd, tz) : null,
        noteTe:
          'ప్రస్తుతం సాడే సాతి కాలం లేదు. శని జన్మ రాశికి 12, 1, 2 భావాల్లో సంచరించినప్పుడు సాడే సాతి ఏర్పడుతుంది.' +
          (nextSadeSati
            ? ` తదుపరి సాడే సాతి: ${civilDateAt(nextSadeSati.startJd, tz)} నుండి ${civilDateAt(nextSadeSati.endJd, tz)} వరకు (శని ${RASI_TE[s12]} నుండి ${RASI_TE[s03]} వరకు సంచరించే కాలం).`
            : ''),
      };
    }
    const phaseIndex = (saturnHouse === 12 ? 1 : saturnHouse === 1 ? 2 : 3) as 1 | 2 | 3;
    const phaseTe =
      phaseIndex === 1
        ? 'ప్రథమ దశ (ఆరంభ) — 12వ భావం'
        : phaseIndex === 2
          ? 'ద్వితీయ దశ (గరిష్ఠ) — జన్మ రాశిపై శని'
          : 'తృతీయ దశ (అంత్య) — 2వ భావం';

    // start = most recent 11th → 12th ingress; end = the 2nd → 3rd ingress ahead
    let startJd: number | null = null;
    for (let i = 1; i < saturnIngresses.length; i++) {
      const cur = saturnIngresses[i];
      if (cur.signIndex === s12 && saturnIngresses[i - 1].signIndex === s11 && cur.jd <= jd) startJd = cur.jd;
    }
    let endJd: number | null = null;
    for (let i = 1; i < saturnIngresses.length; i++) {
      const cur = saturnIngresses[i];
      if (cur.signIndex === s03 && saturnIngresses[i - 1].signIndex === s02 && cur.jd > jd) {
        endJd = cur.jd;
        break;
      }
    }

    return {
      active: true,
      phaseIndex,
      phaseTe,
      startISO: startJd === null ? null : civilDateAt(startJd, tz),
      endISO: endJd === null ? null : civilDateAt(endJd, tz),
      nextStartISO: null,
      nextEndISO: null,
      noteTe: `శని ${saturn.signTe}లో సంచరిస్తోంది — జన్మ రాశికి ${saturnHouse}వ భావం. ${
        phaseIndex === 2
          ? 'శని జన్మ రాశిపై ఉన్న కాలం — ఆరోగ్యం, ఉద్యోగ భారం, కుటుంబ బాధ్యతలపై శ్రద్ధ అవసరం; శని శాంతి, హనుమత్ ఆరాధన శ్రేయస్కరం.'
          : phaseIndex === 1
            ? 'ఆరంభ దశ — వ్యయాలు, నిద్రలోపం, దూర ప్రయాణాలు పెరగవచ్చు; దీర్ఘకాలిక నిర్ణయాలు సమీక్షించండి.'
            : 'అంత్య దశ — భారం తగ్గుతుంది, పునర్నిర్మాణానికి అవకాశం; కుటుంబ సంబంధాలపై శ్రద్ధ పెట్టండి.'
      }`,
    };
  })();

  const ashtamaShani = saturnHouse === 8;
  const kantakaShani = saturnHouse === 4;

  const favourableCount = grahas.filter((g) => g.verdict === 'good').length;
  const blockedCount = grahas.filter((g) => g.verdict === 'blocked').length;

  const upcomingIngresses = (light ? [] : grahas)
    .filter((g) => g.daysToIngress <= 400)
    .sort((a, b) => a.daysToIngress - b.daysToIngress)
    .slice(0, 10)
    .map((g) => {
      const next = nextSignIngressJd(g.id, jd, mode);
      return {
        grahaId: g.id,
        grahaTe: GRAHA_NAMES_TE[g.id],
        dateISO: civilDateAt(next.jd, tz),
        timeLocal: formatLocalHM(next.jd, tz),
        signTe: RASI_TE[next.signIndex],
        daysAway: g.daysToIngress,
      };
    });

  const summaryTe = `జన్మ రాశి ${RASI_TE[natalMoonSignIndex]} (${TELUGU_NAKSHATRAS[natalMoonNakshatraIndex]?.nameTe ?? ''}). ప్రస్తుతం ${favourableCount} గ్రహాలు శుభ స్థానంలో, ${blockedCount} గ్రహాలకు వేధ ఉంది. ${
    sadeSati.active ? `సాడే సాతి ${sadeSati.phaseTe} నడుస్తోంది.` : 'సాడే సాతి లేదు.'
  }${ashtamaShani ? ' అష్టమ శని కాలం — ఆరోగ్య జాగ్రత్త.' : ''}${
    kantakaShani ? ' కంటక శని (4వ భావం) — గృహ/మాతృ సంబంధ విషయాల్లో శ్రద్ధ.' : ''
  }`;

  return {
    asOfISO,
    janmaRasiIndex: natalMoonSignIndex,
    janmaRasiTe: RASI_TE[natalMoonSignIndex],
    janmaNakshatraTe: TELUGU_NAKSHATRAS[natalMoonNakshatraIndex]?.nameTe ?? '',
    grahas,
    sadeSati,
    ashtamaShani,
    kantakaShani,
    favourableCount,
    blockedCount,
    summaryTe,
    upcomingIngresses,
  };
}

function lon(x: number): number {
  return Math.round(x * 10000) / 10000;
}

function isRetrogradeGraha(id: GrahaId, jd: number, mode: SiderealMode): boolean {
  if (id === 'Sun' || id === 'Moon') return false;
  if (id === 'Rahu' || id === 'Ketu') return true; // always retrograde
  const step = 0.5;
  const a = grahaSiderealLongitude(id, jd - step, mode);
  const b = grahaSiderealLongitude(id, jd + step, mode);
  let diff = b - a;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return diff < 0;
}

export { FAVOURABLE as GOCHARA_FAVOURABLE_HOUSES, VEDHA as GOCHARA_VEDHA_HOUSES };
export { grahaMeanMotion };
export { jdFromMs };
