import assert from 'node:assert/strict';
import { calculateChart, type BirthInput } from '../src/engine/ephemeris.ts';
import { resolveLocalCivilTime } from '../src/engine/localCivilTime.ts';

const winter = resolveLocalCivilTime('2026-01-15', '12:00:00', 'America/New_York');
const summer = resolveLocalCivilTime('2026-07-15', '12:00:00', 'America/New_York');
assert.equal(winter.offsetHours, -5);
assert.equal(summer.offsetHours, -4);
assert.equal(summer.instant.toISOString(), '2026-07-15T16:00:00.000Z');
assert.throws(() => resolveLocalCivilTime('2026-03-08', '02:30:00', 'America/New_York'), /does not exist/);
assert.throws(() => resolveLocalCivilTime('2026-11-01', '01:30:00', 'America/New_York'), /ambiguous/);
const repeatedEarly = resolveLocalCivilTime('2026-11-01', '01:30:00', 'America/New_York', -4);
const repeatedLate = resolveLocalCivilTime('2026-11-01', '01:30:00', 'America/New_York', -5);
assert.equal(repeatedEarly.instant.toISOString(), '2026-11-01T05:30:00.000Z');
assert.equal(repeatedLate.instant.toISOString(), '2026-11-01T06:30:00.000Z');

const birth: BirthInput = {
  name: 'IANA timezone fixture', date: '2026-07-15', time: '12:00:00',
  lat: 40.7128, lng: -74.006, tzOffsetHours: -5, timezone: 'America/New_York',
  city: 'New York', country: 'US', ayanamsa: 'lahiri', houseSystem: 'whole_sign',
};
const chart = calculateChart(birth);
assert.equal(chart.utcIso, '2026-07-15T16:00:00.000Z');
assert.equal(chart.input.tzOffsetHours, -4, 'Chart settings must store the actual DST offset at birth');

console.log('✓ IANA birth timezone: DST offsets, nonexistent/ambiguous clocks and chart normalization verified');
