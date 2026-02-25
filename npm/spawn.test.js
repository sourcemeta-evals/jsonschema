const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { spawn } = require('./main');

const platform = os.platform() === 'win32' ? 'windows' : os.platform();
const arch = os.arch() === 'x64' ? 'x86_64' : os.arch();
const executable = platform === 'windows'
  ? path.join(__dirname, '..', 'build', 'github-releases', `jsonschema-${platform}-${arch}.exe`)
  : path.join(__dirname, '..', 'build', 'github-releases', `jsonschema-${platform}-${arch}`);

const fixture = '#!/bin/sh\n' +
  'echo "stdout:$*:${JSONSCHEMA_SPAWN_TEST_VALUE:-missing}"\n' +
  'echo "stderr:$*" 1>&2\n' +
  'exit 7\n';

test.before(() => {
  fs.mkdirSync(path.dirname(executable), { recursive: true });
  fs.writeFileSync(executable, fixture);
  fs.chmodSync(executable, 0o755);
});

test('spawn captures stdout, stderr, exit code, and forwards options', async () => {
  const result = await spawn([ 'inspect', 'schema.json' ], {
    env: {
      ...process.env,
      JSONSCHEMA_SPAWN_TEST_VALUE: 'forwarded'
    }
  });

  assert.equal(result.code, 7);
  assert.equal(result.signal, null);
  assert.equal(result.stdout, 'stdout:inspect schema.json:forwarded\n');
  assert.equal(result.stderr, 'stderr:inspect schema.json\n');
});
