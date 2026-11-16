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

`index.html` holds the three cases that used to go wrong:

1. metric entity with `units.speed: Bft` — Beaufort conversion, wind gusts and a
   textual `WNW` bearing;
2. wind reported in knots, pressure shown in inHg — a unit the locale files have
   no label for;
3. an entity that only supports `twice_daily` forecasts, reporting wind in a unit
   nothing can convert.

`layout.html` is the layout bench: the same card at 360, 500, 760 and 1040 px,
plus two variants that stress the header (the absolutely positioned clock, and
a card with almost every reading switched off). It stubs `ha-icon` and
`ha-card` the way Home Assistant defines them — an icon that occupies real
space, and a card that is a positioning context — because without those two the
spacing and the clock's placement are both wrong.

Useful checks to run against it from the browser console:

```js
// nothing clipped, nothing overlapping, nothing past the card edge
[...document.querySelectorAll('weather-chart-card')].flatMap((el) =>
  [...el.shadowRoot.querySelectorAll('.attribute')].map((n) => n.getBoundingClientRect()));
```
