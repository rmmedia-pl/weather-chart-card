# Harness

A standalone page that runs the built card against a stubbed `hass` object, so
the render path can be exercised without a Home Assistant instance.

```bash
npm run build
python3 -m http.server 8902 --bind 127.0.0.1
# then open http://localhost:8902/harness/index.html
```

It loads `../dist/weather-chart-card.js`, mounts three cards and collects every
uncaught error into `window.__errors` (shown at the bottom of the page) and the
rendered values into `window.__rendered`, which makes assertions from a browser
console or an automation straightforward.

The three cases are the ones that used to go wrong:

1. metric entity with `units.speed: Bft` — Beaufort conversion, wind gusts and a
   textual `WNW` bearing;
2. wind reported in knots, pressure shown in inHg — a unit the locale files have
   no label for;
3. an entity that only supports `twice_daily` forecasts, reporting wind in a unit
   nothing can convert.
