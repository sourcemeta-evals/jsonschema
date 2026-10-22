// The Windows default has no observable effect on the platforms these tests
// run on, so it has to be watched at the boundary. The instrumentation is
// installed before the wrapper loads, which means a binding the wrapper
// captures at load time is the forwarding one and cannot slip past unseen
const child_process = require('child_process');

const observed = [];
const original = child_process.spawn;

child_process.spawn = function (file, args, options) {
  const standsIn = typeof args === 'object' && args !== null && !Array.isArray(args);
  observed.push(standsIn ? args : options);
  return original.apply(this, arguments);
};

const test = require('node:test');
const assert = require('node:assert');
const { spawn } = require('./main.js');

async function forwarded(options) {
  observed.length = 0;
  await spawn(['--version'], options);
  assert.notStrictEqual(observed.length, 0, 'no launch was observed, so nothing was verified');
  return observed[observed.length - 1];
}

test('spawn defaults windowsHide when the caller supplies no value', async () => {
  assert.strictEqual((await forwarded(undefined)).windowsHide, true);
  assert.strictEqual((await forwarded({})).windowsHide, true);
});

test('spawn leaves a caller-supplied windowsHide alone', async () => {
  assert.strictEqual((await forwarded({ windowsHide: false })).windowsHide, false);
  assert.strictEqual((await forwarded({ windowsHide: true })).windowsHide, true);
});
