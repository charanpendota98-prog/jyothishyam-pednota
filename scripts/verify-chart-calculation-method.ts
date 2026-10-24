import assert from 'node:assert/strict';
import { calculateChart, type BirthInput } from '../src/engine/ephemeris.ts';

const base: BirthInput = {
  name: 'OnlineJyotish profile fixture',
  date: '1995-08-14',
  time: '06:25:30',
  lat: 17.385,
  lng: 78.4867,
  tzOffsetHours: 5.5,
  city: 'Hyderabad',
  country: 'India',
  ayanamsa: 'lahiri',
  houseSystem: 'whole_sign',
  // OnlineJyotish UI describes Mean Node as the default.
};

const standard = calculateChart(base);
const explicitGeocentric = calculateChart({ ...base, calculationMethod: 'geocentric' });
const topocentric = calculateChart({ ...base, calculationMethod: 'topocentric' });
const trueNode = calculateChart({ ...base, nodeConvention: 'true' });
const moonGeo = standard.planets.find((planet) => planet.id === 'Moon')!;
const moonTopo = topocentric.planets.find((planet) => planet.id === 'Moon')!;
const angle = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180);

assert.equal(standard.calculationMethod, 'geocentric', 'Geocentric must remain the chart default');
assert.equal(standard.nodeSphuta.convention, 'mean', 'Mean Node must remain the default');
assert.equal(trueNode.nodeSphuta.convention, 'true', 'Node metadata must report the selected True Node method');
assert.equal(topocentric.calculationMethod, 'topocentric');
assert.ok(angle(moonGeo.tropicalLon, moonTopo.tropicalLon) > 0.1,
  'Topocentric Moon must include observer parallax, not silently reuse geocentric longitude');
assert.equal(standard.planets.find((planet) => planet.id === 'Sun')?.tropicalLon,
  explicitGeocentric.planets.find((planet) => planet.id === 'Sun')?.tropicalLon,
  'Explicit geocentric selection must preserve standard output');

console.log(`✓ Chart method selection: geocentric default + mean node; topocentric Moon parallax ${angle(moonGeo.tropicalLon, moonTopo.tropicalLon).toFixed(4)}°`);
console.log('! Topocentric public-reference exact-degree parity remains a separate open fixture gate.');
