// The running version, printed to the console on registration.
//
// It is here, not read from package.json, because the bundle has to carry it
// without a build-time plugin. `npm test` asserts the two agree, so a release
// that forgets to bump this fails before it ships.
const CARD_VERSION = '1.3.1';

export { CARD_VERSION };
