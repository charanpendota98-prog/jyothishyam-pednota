import assert from 'node:assert/strict';
import {
  INAUSPICIOUS_YOGA_INDEXES,
  YOGA_NAMES_EN,
  YOGA_NAMES_TE,
} from '../src/engine/hinduCalendarEngine.ts';

assert.equal(YOGA_NAMES_EN.length, 27, 'There must be 27 named nitya yogas');
assert.equal(YOGA_NAMES_TE.length, 27, 'Telugu yoga names must align with English names');
assert.equal(YOGA_NAMES_EN[26], 'Vaidhriti', 'The 27th yoga is Vaidhriti, not Vaibhava');
assert.equal(YOGA_NAMES_TE[26], 'వైధృతి', 'Telugu 27th yoga label must be Vaidhriti');
assert.deepEqual(INAUSPICIOUS_YOGA_INDEXES, [0, 5, 8, 9, 12, 14, 16, 18, 26]);

console.log('✓ Panchanga yoga nomenclature: 27 aligned names; Vaidhriti label and index verified');
