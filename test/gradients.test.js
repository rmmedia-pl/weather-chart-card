import test from 'node:test';
import assert from 'node:assert/strict';

import { colorAtCelsius, temperatureGradientStops, toCelsius } from '../src/gradients.js';

test('toCelsius leaves Celsius alone and converts Fahrenheit', () => {
  assert.equal(toCelsius(12, '°C'), 12);
  assert.equal(toCelsius(32, '°F'), 0);
  assert.equal(Math.round(toCelsius(212, '°F')), 100);
});

test('colorAtCelsius clamps at both ends of the scale', () => {
  assert.equal(colorAtCelsius(-40), colorAtCelsius(-10));
  assert.equal(colorAtCelsius(60), colorAtCelsius(34));
  assert.equal(colorAtCelsius(NaN), colorAtCelsius(-10));
});

test('colorAtCelsius interpolates between thresholds', () => {
  // Halfway between 0 (79,168,224) and 8 (73,191,160).
  assert.equal(colorAtCelsius(4), 'rgb(76, 180, 192)');
  assert.equal(colorAtCelsius(0), 'rgb(79, 168, 224)');
  assert.equal(colorAtCelsius(34), 'rgb(217, 83, 79)');
});

test('gradient stops always cover the whole range in order', () => {
  const stops = temperatureGradientStops(-5, 30, '°C');
  assert.equal(stops[0][0], 0);
  assert.equal(stops[stops.length - 1][0], 1);
  const offsets = stops.map((s) => s[0]);
  assert.deepEqual(offsets, [...offsets].sort((a, b) => a - b));
  assert.ok(offsets.every((o) => o >= 0 && o <= 1));
});

test('a range between two thresholds still gets both ends', () => {
  // 10..16 degrees sits inside one segment: without interpolated ends this
  // produced a gradient with no stops, which paints nothing at all.
  const stops = temperatureGradientStops(10, 16, '°C');
  assert.equal(stops.length, 2);
  assert.equal(stops[0][0], 0);
  assert.equal(stops[1][0], 1);
  assert.notEqual(stops[0][1], stops[1][1]);
});

test('a degenerate range falls back to a single colour', () => {
  assert.equal(temperatureGradientStops(5, 5, '°C').length, 1);
  assert.equal(temperatureGradientStops(NaN, 10, '°C').length, 1);
});

test('Fahrenheit ranges map onto the same colours as Celsius', () => {
  const c = temperatureGradientStops(0, 20, '°C');
  const f = temperatureGradientStops(32, 68, '°F');
  assert.equal(c[0][1], f[0][1]);
  assert.equal(c[c.length - 1][1], f[f.length - 1][1]);
});
