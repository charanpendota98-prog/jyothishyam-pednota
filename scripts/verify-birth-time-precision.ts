import assert from 'node:assert/strict';
import { birthInputToUTCDate, calculateChart, type BirthInput } from '../src/engine/ephemeris.ts';

const base: BirthInput = {
  name: 'Precision fixture',
  date: '1995-08-14',
  time: '06:25:00',
  lat: 17.385,
  lng: 78.4867,
  tzOffsetHours: 5.5,
  city: 'Hyderabad',
  country: 'India',
  ayanamsa: 'lahiri',
  houseSystem: 'whole_sign',
  nodeConvention: 'mean',
};

const atZero = calculateChart(base);
const atThirty = calculateChart({ ...base, time: '06:25:30' });
assert.equal(atZero.utcIso, '1995-08-14T00:55:00.000Z');
assert.equal(atThirty.utcIso, '1995-08-14T00:55:30.000Z');
assert.throws(() => birthInputToUTCDate({ ...base, date: '2025-02-30' }), /valid calendar date/);
assert.throws(() => birthInputToUTCDate({ ...base, time: '25:00' }), /YYYY-MM-DD and HH:mm/);
assert.throws(() => birthInputToUTCDate({ ...base, tzOffsetHours: 15 }), /between -14 and \+14/);
assert.ok(Math.abs((atThirty.julianDay - atZero.julianDay) * 86400 - 30) < 0.001,
  'Chart Julian day must retain seconds; a 30-second input change must remain 30 seconds');

console.log('✓ Birth time precision: local seconds survive UTC conversion and chart JD');
