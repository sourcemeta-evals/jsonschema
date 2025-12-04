const test = require('node:test');
const assert = require('node:assert');
const { spawn } = require('./main.js');

test('spawn works', async () => {
  const result = await spawn(['--version']);
  assert.strictEqual(result.code, 0);
});
