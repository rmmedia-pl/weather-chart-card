import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { CARD_VERSION } from '../src/version.js';

test('CARD_VERSION matches the version in package.json', () => {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  assert.equal(
    CARD_VERSION,
    pkg.version,
    'bump src/version.js together with package.json - the console banner is how we tell which copy of the card won registration',
  );
});
