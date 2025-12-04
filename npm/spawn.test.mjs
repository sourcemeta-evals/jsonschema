import test from 'node:test';
import assert from 'node:assert';
import { spawn } from './main.js';

test('spawn works', async () => {
  const result = await spawn(['--version']);
  assert.strictEqual(result.code, 0);
});
