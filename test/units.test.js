import test from 'node:test';
import assert from 'node:assert/strict';

import {
  beaufortFromSpeed,
  cardinalIndex,
  convertPressure,
  convertSpeed,
  isKnownSpeedUnit,
  roundPressure,
  toBearing,
  toNumber,
  windDirIconIndex,
} from '../src/units.js';

const close = (actual, expected, tolerance = 1e-6) => {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `expected ${actual} to be within ${tolerance} of ${expected}`,
  );
};

test('toNumber accepts numbers, numeric strings and nothing else', () => {
  assert.equal(toNumber(12), 12);
  assert.equal(toNumber('12.5'), 12.5);
  assert.equal(toNumber(''), null);
  assert.equal(toNumber(null), null);
  assert.equal(toNumber(undefined), null);
  assert.equal(toNumber('unavailable'), null);
  assert.equal(toNumber(NaN), null);
});

test('convertSpeed converts between the units Home Assistant publishes', () => {
  close(convertSpeed(36, 'km/h', 'm/s'), 10);
  close(convertSpeed(10, 'm/s', 'km/h'), 36);
  close(convertSpeed(1, 'mph', 'km/h'), 1.609344);
  close(convertSpeed(1, 'km/h', 'mph'), 0.621371, 1e-5);
  close(convertSpeed(1, 'kn', 'km/h'), 1.852, 1e-5);
  close(convertSpeed(1, 'ft/s', 'm/s'), 0.3048);
});

test('convertSpeed is a no-op for the same unit and for unknown units', () => {
  assert.equal(convertSpeed(7, 'm/s', 'm/s'), 7);
  // An integration with an exotic unit must not change the number silently.
  assert.equal(convertSpeed(7, 'furlong/fortnight', 'km/h'), 7);
  assert.equal(convertSpeed(7, 'km/h', 'furlong/fortnight'), 7);
  assert.equal(convertSpeed('unavailable', 'km/h', 'm/s'), null);
});

test('beaufortFromSpeed covers the scale and every supported unit', () => {
  assert.equal(beaufortFromSpeed(0, 'km/h'), 0);
  assert.equal(beaufortFromSpeed(0.9, 'km/h'), 0);
  assert.equal(beaufortFromSpeed(1, 'km/h'), 1);
  assert.equal(beaufortFromSpeed(11.9, 'km/h'), 2);
  assert.equal(beaufortFromSpeed(12, 'km/h'), 3);
  assert.equal(beaufortFromSpeed(117, 'km/h'), 11);
  assert.equal(beaufortFromSpeed(118, 'km/h'), 12);
  assert.equal(beaufortFromSpeed(500, 'km/h'), 12);
  // 10 m/s = 36 km/h -> force 5
  assert.equal(beaufortFromSpeed(10, 'm/s'), 5);
  // 20 kn = 37.04 km/h -> force 5
  assert.equal(beaufortFromSpeed(20, 'kn'), 5);
  assert.equal(beaufortFromSpeed(30, 'ft/s'), 5);
});

test('beaufortFromSpeed returns null instead of throwing on bad input', () => {
  // This used to throw and take the whole render down.
  assert.equal(beaufortFromSpeed(10, 'parsec/day'), null);
  assert.equal(beaufortFromSpeed(10, undefined), null);
  assert.equal(beaufortFromSpeed('unknown', 'km/h'), null);
});

test('isKnownSpeedUnit knows the units the scale can be computed from', () => {
  assert.ok(isKnownSpeedUnit('kn'));
  assert.ok(isKnownSpeedUnit('ft/s'));
  assert.ok(!isKnownSpeedUnit('Bft'));
  assert.ok(!isKnownSpeedUnit(undefined));
});

test('convertPressure converts between the units Home Assistant publishes', () => {
  close(convertPressure(1013, 'hPa', 'hPa'), 1013);
  close(convertPressure(1013.25, 'hPa', 'inHg'), 29.9213, 1e-3);
  close(convertPressure(29.9213, 'inHg', 'hPa'), 1013.25, 1e-2);
  close(convertPressure(1000, 'hPa', 'mmHg'), 750.062, 1e-2);
  close(convertPressure(750, 'mmHg', 'inHg'), 29.5276, 1e-3);
  close(convertPressure(1013, 'mbar', 'hPa'), 1013);
  close(convertPressure(101.3, 'kPa', 'hPa'), 1013);
  assert.equal(convertPressure(1013, 'hPa', 'barleycorn'), 1013);
});

test('roundPressure keeps decimals only where they matter', () => {
  assert.equal(roundPressure(1013.4, 'hPa'), 1013);
  assert.equal(roundPressure(750.6, 'mmHg'), 751);
  assert.equal(roundPressure(29.92131, 'inHg'), '29.92');
  assert.equal(roundPressure(14.6959, 'psi'), '14.70');
  assert.equal(roundPressure(101.325, 'kPa'), '101.3');
  assert.equal(roundPressure(null, 'hPa'), null);
});

test('toBearing understands the full 16-point compass', () => {
  assert.equal(toBearing('N'), 0);
  assert.equal(toBearing('wnw'), 292.5);
  assert.equal(toBearing(' SSE '), 157.5);
  assert.equal(toBearing(225), 225);
  assert.equal(toBearing('225'), 225);
  assert.equal(toBearing('nowhere'), null);
  assert.equal(toBearing(undefined), null);
});

test('windDirIconIndex points the arrow where the wind is going', () => {
  // Bearing is where the wind comes from, so north blows the arrow down.
  assert.equal(windDirIconIndex(0), 0);
  assert.equal(windDirIconIndex('N'), 0);
  assert.equal(windDirIconIndex(45), 1);
  assert.equal(windDirIconIndex(180), 4);
  assert.equal(windDirIconIndex('NW'), 7);
  // WNW used to land on index 8 (the north arrow), 135 degrees off.
  assert.equal(windDirIconIndex('WNW'), 7);
  // Index 8 is the wrap-around back to north and draws the same arrow as 0.
  assert.equal(windDirIconIndex(350), 8);
  assert.equal(windDirIconIndex(-10), 8);
  assert.equal(windDirIconIndex(360), 0);
  assert.equal(windDirIconIndex('nowhere'), null);
});

test('cardinalIndex maps onto the 17-entry localised list', () => {
  assert.equal(cardinalIndex(0), 0);
  assert.equal(cardinalIndex(22.5), 1);
  assert.equal(cardinalIndex('WNW'), 13);
  assert.equal(cardinalIndex(355), 16);
  assert.equal(cardinalIndex('nowhere'), null);
});
