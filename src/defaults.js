// One source of truth for the card's on/off options.
//
// The card and the visual editor used to disagree: the card treated a missing
// `show_feels_like` as off, while the editor drew its toggle with
// `!== false`, so the switch said "on" for a row that was not rendered.
// Both now read these tables, so a toggle always shows what the card does.

// Options that are on until the user turns them off.
const CARD_OPTION_DEFAULTS = {
  show_main: true,
  show_temperature: true,
  show_current_condition: true,
  show_attributes: true,
  show_humidity: true,
  show_pressure: true,
  show_sun: true,
  show_wind_direction: true,
  show_wind_speed: true,

  // Options that are off until the user turns them on.
  show_feels_like: false,
  show_description: false,
  show_dew_point: false,
  show_wind_gust_speed: false,
  show_visibility: false,
  show_last_changed: false,
  show_time: false,
  show_time_seconds: false,
  // Translucent card over a blurred background. Only worth turning on when
  // something is actually visible behind the card, such as a view background
  // image - over a flat background it is just a lighter card.
  glass: false,
  show_day: false,
  show_date: false,
  use_12hour_format: false,
  autoscroll: false,
  animated_icons: false,
};

const FORECAST_OPTION_DEFAULTS = {
  condition_icons: true,
  show_wind_forecast: true,
  // Precipitation bars fade towards the top; temperature lines are coloured
  // by value instead of one flat colour each.
  precip_gradient: true,
  temperature_gradient: true,
  round_temp: false,
  show_probability: false,
  disable_animation: false,
};

function resolve(defaults, config, key) {
  const value = config ? config[key] : undefined;
  if (typeof value === 'boolean') {
    return value;
  }
  // YAML written by hand sometimes carries the strings instead of booleans.
  if (value === 'true') {
    return true;
  }
  if (value === 'false') {
    return false;
  }
  return defaults[key] === true;
}

// Is this card-level option on, given the user's config?
function cardOption(config, key) {
  return resolve(CARD_OPTION_DEFAULTS, config, key);
}

// Is this forecast option on? `forecast` is the config's `forecast:` section.
function forecastOption(forecast, key) {
  return resolve(FORECAST_OPTION_DEFAULTS, forecast, key);
}

export {
  CARD_OPTION_DEFAULTS,
  FORECAST_OPTION_DEFAULTS,
  cardOption,
  forecastOption,
};
