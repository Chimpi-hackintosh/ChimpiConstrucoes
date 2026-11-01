const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const context = {module: {exports: {}}, URL, AbortController, setTimeout, clearTimeout, fetch: (...args) => global.fetch(...args)};
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../dist/support-notice.js'), 'utf8'), context);
const s = context.module.exports;
test('only a known older installed version gets a notice', () => {
  for (const v of ['3.0.1', '4.0.0', '3.0.1-build-3', 'bad', null]) assert.equal(s.notice('OpenCore-Helper', v), null);
  assert.equal(s.notice('ChimpiConstrucoes', '1.0.0'), null);
  assert.equal(s.notice('private', '1.0.0'), null);
  assert.ok(s.notice('OpenCore-Helper', '3.0.0'));
  assert.equal(s.compare(s.version('1.10.0'), s.version('1.9.0')), 1);
});
test('date switches exactly at 2026-11-04 UTC, with translated bodies', () => {
  for (const lang of Object.keys(s.MESSAGES)) {
    const before = s.notice('OpenCore-Helper', '2.0.0', s.POLICY, new Date('2026-11-03T23:59:59Z'), lang);
    const after = s.notice('OpenCore-Helper', '2.0.0', s.POLICY, new Date('2026-11-04T00:00:00Z'), lang);
    assert.equal(before.phase, 'before'); assert.equal(after.phase, 'after');
    assert.equal(before.title, s.MESSAGES[lang].before); assert.ok(!before.body.includes('{'));
  }
  assert.equal(s.language('pt-BR'), 'pt'); assert.equal(s.language('unknown'), 'en');
});
test('policy refuses untrusted downloads, downgrades, invalid data and unknown private apps', () => {
  for (const url of ['https://evil.test/', 'http://github.com/Chimpi-hackintosh/OpenCore-Helper', 'https://github.com/other/OpenCore-Helper']) {
    const candidate = structuredClone(s.POLICY);
    Object.assign(candidate.apps['OpenCore-Helper'], {minimum: '99.0.0', url});
    assert.deepEqual(s.checkedPolicy(candidate), s.POLICY);
  }
  const candidate = structuredClone(s.POLICY); candidate.apps['OpenCore-Helper'].minimum = '1.0.0';
  assert.deepEqual(s.checkedPolicy(candidate), s.POLICY);
  assert.deepEqual(s.checkedPolicy(null), s.POLICY);
  assert.equal(s.POLICY.apps['private-placeholder'], undefined);
});
test('unavailable network falls back without blocking app startup', async () => {
  const fetch = global.fetch; global.fetch = async () => { throw new Error('offline'); };
  try { assert.deepEqual(await s.fetchPolicy(), s.POLICY); } finally { global.fetch = fetch; }
});
test('web deployment revisions are separate from app release versions', () => {
  assert.equal(s.notice('ChimpiBlender-Online', '20261101'), null);
  assert.ok(s.notice('ChimpiBlender-Online', '20261031'));
  const candidate = structuredClone(s.POLICY);
  candidate.apps['ChimpiBlender-Online'].web_revision = 20261102;
  assert.ok(s.notice('ChimpiBlender-Online', '20261101', s.checkedPolicy(candidate)));
  candidate.apps['ChimpiBlender-Online'].url = 'https://evil.test/';
  assert.equal(s.notice('ChimpiBlender-Online', '20261101', s.checkedPolicy(candidate)), null);
});
