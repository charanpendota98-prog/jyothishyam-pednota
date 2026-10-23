/**
 * accuracySummary.ts — UI లో చూపే ఖచ్చితత్వ సంఖ్యలు ఒకే చోట.
 *
 * సంఖ్యలు `npm run verify:astro` / `npm run verify:jathaka` తిరిగి రాసే
 * `src/generated/*` ఫైళ్ల నుండి వస్తాయి — కాబట్టి పరీక్షలు పెరిగినప్పుడల్లా
 * యాప్‌లోని అంకెలు తనంతట తానే సరిపోతాయి. చేతితో రాసిన "0.003°" వంటి
 * ప్రకటనలు మళ్లీ రావు.
 */
import { EPHEMERIS_ACCURACY } from '../generated/ephemerisAccuracy.ts';
import {
  JATHAKA_GATES,
  JATHAKA_GATES_FAILED,
  JATHAKA_GATES_PASSED,
} from '../generated/verificationStats.ts';

const maxDeg = Math.max(...EPHEMERIS_ACCURACY.rows.map((r) => r.maxDeg));
const maxArcsec = Math.round(maxDeg * 3600);
const classicalArcsec = Math.round(EPHEMERIS_ACCURACY.classicalMaxDeg * 3600);

export const ACCURACY = {
  /** ఫిక్చర్‌లోని జనన క్షణాల సంఖ్య */
  epochs: EPHEMERIS_ACCURACY.fixtureEpochs,
  /** మొత్తం స్ఫుట కొలతలు (గ్రహాలు + లగ్నం + 7 అయనాంశ విధానాలు) */
  measurements: EPHEMERIS_ACCURACY.measurements,
  /** అన్ని కొలతల్లోనూ గరిష్ఠ భేదం — ఉదా. "0.008°" */
  maxDegText: `${maxDeg.toFixed(3)}°`,
  /** అదే భేదం ఆర్క్-సెకన్లలో — ఉదా. "29″" */
  maxArcsecText: `${maxArcsec}″`,
  /** ప్రధాన ఏడు గ్రహాలు + లగ్నం/అయనాంశం మాత్రమే — ఉదా. "24″" */
  classicalArcsecText: `${classicalArcsec}″`,
  /** పిన్-టు-పిన్ జాతక తనిఖీల సంఖ్య */
  gates: JATHAKA_GATES,
  gatesPassed: JATHAKA_GATES_PASSED,
  gatesFailed: JATHAKA_GATES_FAILED,
  /** పంచాంగ ఫిక్చర్ రోజులు */
  panchangaDays: 365,
} as const;
