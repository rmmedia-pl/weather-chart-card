// Colour maths for the chart gradients.
//
// Pure functions only, like units.js: no canvas, no Chart.js, no `this`.
// The card turns what comes out of here into a CanvasGradient.

// Temperature scale in degrees Celsius. The thresholds follow the ones the
// eye expects from a weather chart: freezing blue, mild green, hot red.
const TEMP_STOPS_C = [
  [-10, [74, 127, 212]],
  [0, [79, 168, 224]],
  [8, [73, 191, 160]],
  [18, [232, 197, 82]],
  [26, [232, 144, 78]],
  [34, [217, 83, 79]],
];

function toCelsius(value, unit) {
  return unit === '°F' ? (value - 32) * 5 / 9 : value;
}

function mix(a, b, t) {
  return Math.round(a + (b - a) * t);
}

// The colour for a temperature, clamped at both ends of the scale.
function colorAtCelsius(celsius) {
  if (!Number.isFinite(celsius)) {
    return rgb(TEMP_STOPS_C[0][1]);
  }
  const first = TEMP_STOPS_C[0];
  const last = TEMP_STOPS_C[TEMP_STOPS_C.length - 1];
  if (celsius <= first[0]) {
    return rgb(first[1]);
  }
  if (celsius >= last[0]) {
    return rgb(last[1]);
  }
  for (let i = 1; i < TEMP_STOPS_C.length; i += 1) {
    const [hi, hiColor] = TEMP_STOPS_C[i];
    if (celsius <= hi) {
      const [lo, loColor] = TEMP_STOPS_C[i - 1];
      const t = (celsius - lo) / (hi - lo);
      return rgb([0, 1, 2].map((c) => mix(loColor[c], hiColor[c], t)));
    }
  }
  return rgb(last[1]);
}

function rgb(parts) {
  return `rgb(${parts[0]}, ${parts[1]}, ${parts[2]})`;
}

// Stops for a vertical gradient over a temperature range, as
// [offset 0..1, colour] with 0 at the BOTTOM of the axis (the coldest end).
//
// The ends are always included and interpolated, so a chart whose whole range
// sits between two thresholds still gets a gradient instead of an empty one -
// a CanvasGradient without stops paints nothing, which would wipe the line.
function temperatureGradientStops(minValue, maxValue, unit) {
  const minC = toCelsius(minValue, unit);
  const maxC = toCelsius(maxValue, unit);
  if (!Number.isFinite(minC) || !Number.isFinite(maxC) || maxC <= minC) {
    return [[0, colorAtCelsius(Number.isFinite(minC) ? minC : 0)]];
  }
  const stops = [[0, colorAtCelsius(minC)]];
  for (const [celsius] of TEMP_STOPS_C) {
    if (celsius > minC && celsius < maxC) {
      stops.push([(celsius - minC) / (maxC - minC), colorAtCelsius(celsius)]);
    }
  }
  stops.push([1, colorAtCelsius(maxC)]);
  return stops;
}

export { colorAtCelsius, temperatureGradientStops, toCelsius };
