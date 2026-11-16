// Unit conversions and wind-bearing maths.
//
// Everything here is a pure function: no DOM, no Home Assistant objects, no
// `this`. That is deliberate — it is the part of the card that is easy to get
// wrong and the only part covered by unit tests (`npm test`).
//
// Unknown units are never fatal. A conversion asked for in a unit this table
// does not know returns the value unchanged, so an exotic `wind_speed_unit`
// shows a slightly wrong label instead of taking the whole card down.

// Multipliers to the base unit (m/s for speed, hPa for pressure).
const SPEED_TO_MS = {
  'm/s': 1,
  'km/h': 1 / 3.6,
  'mph': 0.44704,
  'kn': 0.5144444444444445,
  'kt': 0.5144444444444445,
  'knot': 0.5144444444444445,
  'knots': 0.5144444444444445,
  'ft/s': 0.3048,
};

const PRESSURE_TO_HPA = {
  'hPa': 1,
  'mbar': 1,
  'mmHg': 1.3332236842105263,
  'inHg': 33.86388666666671,
  'kPa': 10,
  'psi': 68.94757293168361,
};

// 16-point compass, as text, to degrees. Home Assistant's `wind_bearing` is
// usually numeric, but several integrations publish these abbreviations.
const CARDINAL_TO_BEARING = {
  N: 0,
  NNE: 22.5,
  NE: 45,
  ENE: 67.5,
  E: 90,
  ESE: 112.5,
  SE: 135,
  SSE: 157.5,
  S: 180,
  SSW: 202.5,
  SW: 225,
  WSW: 247.5,
  W: 270,
  WNW: 292.5,
  NW: 315,
  NNW: 337.5,
};

// Upper bounds of Beaufort 0..11 in km/h; anything above is 12.
const BEAUFORT_MAX_KMH = [1, 6, 12, 20, 29, 39, 50, 62, 75, 89, 103, 118];

// Numbers arrive both as numbers (attributes) and as strings (sensor states).
function toNumber(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const n = typeof value === 'number' ? value : parseFloat(value);
  return Number.isFinite(n) ? n : null;
}

function convert(value, from, to, table) {
  const n = toNumber(value);
  if (n === null) {
    return null;
  }
  if (from === to) {
    return n;
  }
  const fromFactor = table[from];
  const toFactor = table[to];
  if (typeof fromFactor !== 'number' || typeof toFactor !== 'number') {
    return n;
  }
  return (n * fromFactor) / toFactor;
}

function convertSpeed(value, from, to) {
  return convert(value, from, to, SPEED_TO_MS);
}

function convertPressure(value, from, to) {
  return convert(value, from, to, PRESSURE_TO_HPA);
}

function isKnownSpeedUnit(unit) {
  return typeof unit === 'string' && Object.prototype.hasOwnProperty.call(SPEED_TO_MS, unit);
}

function isKnownPressureUnit(unit) {
  return typeof unit === 'string' && Object.prototype.hasOwnProperty.call(PRESSURE_TO_HPA, unit);
}

// Beaufort number, or null when the source unit is not convertible — the
// caller then shows the raw speed instead of crashing on an exception.
function beaufortFromSpeed(value, unit) {
  const n = toNumber(value);
  if (n === null || !isKnownSpeedUnit(unit)) {
    return null;
  }
  const kmh = convertSpeed(n, unit, 'km/h');
  const index = BEAUFORT_MAX_KMH.findIndex((max) => kmh < max);
  return index === -1 ? 12 : index;
}

// Pressure keeps the rounding the card has always used: whole units for the
// coarse ones, decimals where a whole number would hide every change.
function roundPressure(value, unit) {
  const n = toNumber(value);
  if (n === null) {
    return null;
  }
  if (unit === 'inHg' || unit === 'psi') {
    return n.toFixed(2);
  }
  if (unit === 'kPa') {
    return n.toFixed(1);
  }
  return Math.round(n);
}

// Degrees from either a number or a compass abbreviation; null when neither.
function toBearing(value) {
  if (typeof value === 'string') {
    const key = value.trim().toUpperCase();
    if (Object.prototype.hasOwnProperty.call(CARDINAL_TO_BEARING, key)) {
      return CARDINAL_TO_BEARING[key];
    }
  }
  return toNumber(value);
}

// Index into cardinalDirectionsIcon (8 arrows + the wrap-around back to N).
function windDirIconIndex(bearing) {
  const deg = toBearing(bearing);
  if (deg === null) {
    return null;
  }
  return Math.floor((((deg % 360) + 360) % 360 + 22.5) / 45);
}

// Index into the localised 17-entry cardinalDirections list.
function cardinalIndex(bearing) {
  const deg = toBearing(bearing);
  if (deg === null) {
    return null;
  }
  return Math.floor((((deg % 360) + 360) % 360 + 11.25) / 22.5);
}

export {
  beaufortFromSpeed,
  cardinalIndex,
  convertPressure,
  convertSpeed,
  isKnownPressureUnit,
  isKnownSpeedUnit,
  roundPressure,
  toBearing,
  toNumber,
  windDirIconIndex,
};
