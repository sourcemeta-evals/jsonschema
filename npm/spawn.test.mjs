import assert from 'node:assert/strict';
import test from 'node:test';
import { spawn } from './main.js';

test('spawn is available from ESM and supports inherited stdio', async () => {
  const result = await spawn([
    '-e',
    'process.exit(0);'
  ], {
    stdio: 'inherit',
    env: {
      ...process.env,
      JSONSCHEMA_NPM_EXECUTABLE: process.execPath
    }
  });

  assert.equal(result.code, 0);
  assert.equal(result.stdout, '');
  assert.equal(result.stderr, '');
});
