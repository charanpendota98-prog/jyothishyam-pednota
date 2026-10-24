import { civilDateAt, localMidnightJd, nextSignIngressJd } from '../src/engine/astroCore.ts';

/**
 * OnlineJyotish public Sade-Sati Saturn transit table (Aries Moon sign),
 * fetched from /sadesathi/mesha-rashi.php. The test checks the observable
 * sign-ingress civil dates, including retrograde return ingresses. It does not
 * copy or validate the site's interpretive prose.
 */
const tz = 5.5;
const expected = [
  ['2020-01-24', 9], // Capricorn
  ['2022-04-29', 10], // Aquarius
  ['2022-07-12', 9], // retrograde return to Capricorn
  ['2023-01-17', 10], // Aquarius
  ['2025-03-29', 11], // Pisces: Aries Moon's Sade Sati begins
  ['2027-06-03', 0], // Aries
  ['2027-10-20', 11], // retrograde return to Pisces
  ['2028-02-23', 0], // Aries
  ['2029-08-08', 1], // Taurus
  ['2029-10-05', 0], // retrograde return to Aries
  ['2030-04-17', 1], // Taurus
  ['2032-05-31', 2], // Gemini; Sade Sati ends for Aries Moon
] as const;

let cursor = localMidnightJd('2019-01-01', tz);
let failures = 0;
for (const [dateISO, signIndex] of expected) {
  const ingress = nextSignIngressJd('Saturn', cursor + 0.02, 'lahiri');
  const actualDate = civilDateAt(ingress.jd, tz);
  if (actualDate !== dateISO || ingress.signIndex !== signIndex) {
    failures++;
    console.error(`✗ Saturn ingress: expected ${dateISO}/sign ${signIndex}, got ${actualDate}/sign ${ingress.signIndex}`);
  }
  cursor = ingress.jd;
}

if (failures) {
  throw new Error(`OnlineJyotish Saturn transit regression: ${failures}/${expected.length} mismatches`);
}
console.log(`✓ OnlineJyotish Aries Sade-Sati Saturn ingress dates: ${expected.length}/${expected.length} match (2020–2032, Lahiri, Asia/Kolkata)`);
