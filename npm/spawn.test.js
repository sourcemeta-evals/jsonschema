const assert = require('node:assert/strict');
const test = require('node:test');
const { spawn } = require('./main.js');

const executable = process.execPath;

test('spawn captures stdout, stderr, and exit code in CommonJS', async () => {
  const result = await spawn([
    '-e',
    'process.stdout.write("hello"); process.stderr.write("warn"); process.exit(7);'
  ], {
    env: {
      ...process.env,
      JSONSCHEMA_NPM_EXECUTABLE: executable
    }
  });

  assert.equal(result.code, 7);
  assert.equal(result.stdout, 'hello');
  assert.equal(result.stderr, 'warn');
});

test('spawn rejects when the resolved executable does not exist in CommonJS', async () => {
  await assert.rejects(() => spawn([], {
    env: {
      ...process.env,
      JSONSCHEMA_NPM_EXECUTABLE: '/definitely/missing/jsonschema'
    }
  }), /does not support/);
});
