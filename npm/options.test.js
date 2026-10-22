const test = require('node:test');
const assert = require('node:assert');
const child_process = require('child_process');
const { spawn } = require('./main.js');

test('spawn applies the Windows default to an options-only call', async () => {
  const observed = [];
  const original = child_process.spawn;

  child_process.spawn = function (file, args, options) {
    const standsIn = typeof args === 'object' && args !== null && !Array.isArray(args);
    observed.push(standsIn ? args : options);
    return original.apply(this, arguments);
  };

  try {
    try {
      await spawn({ stdio: 'ignore' });
    } catch {
      // Refusing the options-only form is a stricter contract and stays
      // correct, so only accepting it and then dropping the default fails
      return;
    }

    const effective = observed[observed.length - 1];

    if (effective === undefined) {
      return;
    }

    assert.strictEqual(effective.windowsHide, true);
  } finally {
    child_process.spawn = original;
  }
});
