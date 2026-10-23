/**
 * jathakaClaimAudit.ts — గ్రంథంలోని ప్రతి స్థాన-వాదనను స్వతంత్రంగా తనిఖీ చేసే ఆడిటర్
 * ---------------------------------------------------------------------------
 * సమస్య: పాఠ్యం (“బుధుడు 11వ ఇంట”, “7వ భావం (ధనుస్సు)”) చేతితో రాసినప్పుడు కుండలితో
 * తేడా వస్తుంది; అలాంటి తప్పులు కంటికి కనిపించవు. ఇక్కడ పాఠ్యాన్ని *చదివి* గ్రహ స్థానాలు
 * లెక్కించి పోలుస్తాము — గ్రంథం తనలో తాను నిజం చెబుతోందా అని.
 *
 * నియమం: ప్రతి వాదనా ఒక “వాదన రకం + ఆశించిన విలువ + లభించిన విలువ”గా నమోదు అవుతుంది.
 * ఒక్క తేడా ఉన్నా ఆడిట్ విఫలం. అంతర్గత పరీక్ష (verify-jathaka) దీన్ని ప్రతి జాతకంపై
 * నడిపి, తేడాలు సున్నా అని నిర్ధారిస్తుంది.
 */

import { RASI_TE } from './lagnaFunctionalEngine.ts';
import type { CompleteChartResult } from './ephemeris.ts';

export interface ClaimCheck {
  kindTe: string;
  claimTe: string;
  expectedTe: string;
  actualTe: string;
  ok: boolean;
  /** ఏ ఫీల్డ్‌లో ఉంది (మూలాన్ని కనిపెట్టడానికి) */
  path: string;
}

export interface ClaimAuditResult {
  checked: number;
  failed: number;
  checks: ClaimCheck[];
  /** ఏ గ్రహాన్ని ఉద్దేశించిందో స్పష్టంగా తెలియని వాక్యాలు — తప్పుగా లెక్కించము */
  skipped: number;
}

const PLANET_NAMES: [string, string][] = [
  ['సూర్యుడు', 'Sun'],
  ['చంద్రుడు', 'Moon'],
  ['కుజుడు', 'Mars'],
  ['బుధుడు', 'Mercury'],
  ['గురువు', 'Jupiter'],
  ['శుక్రుడు', 'Venus'],
  ['శని', 'Saturn'],
  ['రాహువు', 'Rahu'],
  ['కేతువు', 'Ketu'],
];

const rasiClean = (idx: number) => RASI_TE[idx].replace(' రాశి', '');

/** 27 నక్షత్రాలు — క్రమం + తెలుగు పేరు (ఇంజిన్ ఆంగ్ల పేరుతో కలపడానికి) */
const NAK_TE: [string, string][] = [
  ['Ashwini', 'అశ్విని'], ['Bharani', 'భరణి'], ['Krittika', 'కృత్తిక'], ['Rohini', 'రోహిణి'],
  ['Mrigashira', 'మృగశిర'], ['Ardra', 'ఆర్ద్ర'], ['Punarvasu', 'పునర్వసు'], ['Pushya', 'పుష్యమి'],
  ['Ashlesha', 'ఆశ్లేష'], ['Magha', 'మఘ'], ['P.Phalguni', 'పూర్వాఫల్గుణి'], ['U.Phalguni', 'ఉత్తరాఫల్గుణి'],
  ['Hasta', 'హస్త'], ['Chitra', 'చిత్త'], ['Swati', 'స్వాతి'], ['Vishakha', 'విశాఖ'],
  ['Anuradha', 'అనురాధ'], ['Jyeshtha', 'జ్యేష్ఠ'], ['Mula', 'మూల'], ['P.Ashadha', 'పూర్వాషాఢ'],
  ['U.Ashadha', 'ఉత్తరాషాఢ'], ['Shravana', 'శ్రవణం'], ['Dhanishta', 'ధనిష్ఠ'], ['Shatabhisha', 'శతభిషం'],
  ['Purva Bhadrapada', 'పూర్వాభాద్ర'], ['P.Bhadrapada', 'పూర్వాభాద్ర'],
  ['Uttara Bhadrapada', 'ఉత్తరాభాద్ర'], ['U.Bhadrapada', 'ఉత్తరాభాద్ర'],
  ['Revati', 'రేవతి'],
  ['Anuradha', 'అనూరాధ'],
];
const nakTeOf = (name: string) => NAK_TE.find(([en]) => en === name)?.[1] ?? name;
/**
 * తెలుగు పదాల పోలిక — ఇత్వ/దీర్ఘ/సున్న భేదాలు పట్టించుకోము (“కుంభం” = “కుంభ”,
 * “అనురాధ” = “అనూరాధ”). అచ్చు గుర్తులు తీసేసి హల్లుల క్రమాన్ని పోలుస్తాము.
 */
const baseTe = (x: string) => x.trim().replace(/[\u0C00-\u0C04\u0C3E-\u0C56\u0C62-\u0C63]/g, '');
const rasiIndexOf = (name: string) =>
  RASI_TE.findIndex((_, i) => rasiClean(i) === name);

function flatten(value: unknown, path = '', out: { path: string; text: string }[] = []) {
  if (typeof value === 'string') {
    out.push({ path, text: value });
  } else if (Array.isArray(value)) {
    value.forEach((v, i) => flatten(v, `${path}[${i}]`, out));
  } else if (value && typeof value === 'object') {
    for (const k of Object.keys(value as Record<string, unknown>)) {
      flatten((value as Record<string, unknown>)[k], path ? `${path}.${k}` : k, out);
    }
  }
  return out;
}

/**
 * ఒక జాతక గ్రంథంలోని అన్ని పాఠ్యాలను పరిశీలించి, స్థాన-వాదనలను కుండలితో పోలుస్తుంది.
 */
export function auditJathakaClaims(
  jathakam: unknown,
  chart: CompleteChartResult
): ClaimAuditResult {
  const houseOf = new Map<string, number>();
  const signOf = new Map<string, number>();
  const nakOf = new Map<string, string>();
  for (const p of chart.planets) {
    houseOf.set(p.id, p.house);
    signOf.set(p.id, p.signIndex);
    nakOf.set(p.id, nakTeOf(p.nakshatra));
  }
  const lagnaSign = chart.ascendant.signIndex;
  const expectedHouseSign = (house: number) => rasiClean((lagnaSign + house - 1) % 12);

  const checks: ClaimCheck[] = [];
  let skipped = 0;
  const texts = flatten(jathakam);

  // ── 1) “<గ్రహం> … nవ భావం / ఇంట” ────────────────────────────────────────
  const planetHouseRe =
    /(సూర్యుడు|చంద్రుడు|కుజుడు|బుధుడు|గురువు|శుక్రుడు|శని|రాహువు|కేతువు)([^।\n]{0,24}?)(\d{1,2})వ\s*(భావంలో|భావానికి|భావం|ఇంటలో|ఇంటికి|ఇంట|స్థానంలో|స్థానం)/g;

  for (const { path, text } of texts) {
    for (const m of text.matchAll(planetHouseRe)) {
      const [, nameTe, between, numStr, suffix] = m;
      // గ్రహ జాబితాలు (“శుక్రుడు, శని …”), బాధక/అధిపత్య వాక్యాలు — ఇవి స్థాన వాదనలు కావు
      if (/[,.]|మరియు|·|మొదలగు|ఆది|బాధక|స్థాన|భావాధిపతి|అధిపతి|లోర్డ్/.test(between)) {
        skipped++;
        continue;
      }
      const id = PLANET_NAMES.find(([n]) => n === nameTe)?.[1];
      if (!id) {
        skipped++;
        continue;
      }
      const claimed = Number(numStr);
      const actual = houseOf.get(id);
      if (actual === undefined || claimed < 1 || claimed > 12) {
        skipped++;
        continue;
      }
      checks.push({
        kindTe: 'గ్రహం → భావం',
        claimTe: m[0],
        expectedTe: `${nameTe} ${actual}వ భావం`,
        actualTe: `${nameTe} ${claimed}వ ${suffix}`,
        ok: claimed === actual,
        path,
      });
    }

    // ── 2) “nవ భావం (రాశి)” — లగ్నం నుంచి లెక్క ─────────────────────────
    for (const m of text.matchAll(/(\d{1,2})వ\s*భావం\s*\(([^)]{0,20})\)/g)) {
      const claimed = Number(m[1]);
      const inner = m[2].trim();
      const signName = inner.split(/[\s,·]/)[0].replace(/ా$/, '');
      const matchIdx = rasiIndexOf(signName);
      if (claimed < 1 || claimed > 12 || matchIdx < 0) {
        skipped++;
        continue;
      }
      const expected = expectedHouseSign(claimed);
      checks.push({
        kindTe: 'భావం → రాశి',
        claimTe: m[0],
        expectedTe: `${claimed}వ భావం ${expected}`,
        actualTe: `${claimed}వ భావం ${rasiClean(matchIdx)}`,
        ok: rasiClean(matchIdx) === expected,
        path,
      });
    }
  }

  // ── 3) ప్రతి గ్రహానికీ “రాశి” వాదన (గ్రహం … లో) — ఖచ్చితమైన నమూనాలు మాత్రమే ──
  const planetSignRe =
    /(సూర్యుడు|చంద్రుడు|కుజుడు|బుధుడు|గురువు|శుక్రుడు|శని|రాహువు|కేతువు)\s+([ఀ-౿]+?)లో\s+(\d{1,2})వ/g;
  for (const { path, text } of texts) {
    for (const m of text.matchAll(planetSignRe)) {
      const [, nameTe, signTe, houseStr] = m;
      const id = PLANET_NAMES.find(([n]) => n === nameTe)?.[1];
      const idx = rasiIndexOf(signTe);
      if (!id || idx < 0) {
        skipped++;
        continue;
      }
      const actualHouse = houseOf.get(id)!;
      const actualSign = signOf.get(id)!;
      checks.push({
        kindTe: 'గ్రహం → రాశి+భావం',
        claimTe: m[0],
        expectedTe: `${nameTe} ${rasiClean(actualSign)}లో ${actualHouse}వ`,
        actualTe: `${nameTe} ${signTe}లో ${houseStr}వ`,
        ok: idx === actualSign && Number(houseStr) === actualHouse,
        path,
      });
    }
  }

  // ── 4) “<గ్రహం> nవ ఇంట (రాశి, నక్షత్రం)” — దశా ఫల వాక్యాల్లో ─────────────
  const planetSignNakRe =
    /(సూర్యుడు|చంద్రుడు|కుజుడు|బుధుడు|గురువు|శుక్రుడు|శని|రాహువు|కేతువు)\s+(\d{1,2})వ\s*ఇంట\s*\(([^,()]{1,14})\s*రాశి,\s*([^,()]{1,14})\s*నక్షత్రం\)/g;
  for (const { path, text } of texts) {
    for (const m of text.matchAll(planetSignNakRe)) {
      const [, nameTe, houseStr, signTe, nakTe] = m;
      const id = PLANET_NAMES.find(([n]) => n === nameTe)?.[1];
      if (!id) {
        skipped++;
        continue;
      }
      const expected = `${rasiClean(signOf.get(id)!)} · ${nakOf.get(id)}`;
      const actual = `${signTe.trim()} · ${nakTe.trim()}`;
      checks.push({
        kindTe: 'గ్రహం → భావం+రాశి+నక్షత్రం',
        claimTe: m[0],
        expectedTe: `${nameTe} ${houseOf.get(id)}వ ఇంట ${expected}`,
        actualTe: `${nameTe} ${houseStr}వ ఇంట ${actual}`,
        ok:
          Number(houseStr) === houseOf.get(id) &&
          baseTe(signTe) === baseTe(rasiClean(signOf.get(id)!)) &&
          baseTe(nakTe) === baseTe(nakOf.get(id)!),
        path,
      });
    }
  }

  return {
    checked: checks.length,
    failed: checks.filter((c) => !c.ok).length,
    checks,
    skipped,
  };
}
