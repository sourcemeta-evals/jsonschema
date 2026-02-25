const { before, test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('./main.js');

const platform = () => os.platform() === 'win32' ? 'windows' : os.platform();
const architecture = () => os.arch() === 'x64' ? 'x86_64' : os.arch();
const executable = () => platform() === 'windows'
  ? path.join(__dirname, '..', 'build', 'github-releases', `jsonschema-${platform()}-${architecture()}.exe`)
  : path.join(__dirname, '..', 'build', 'github-releases', `jsonschema-${platform()}-${architecture()}`);

const ensureExecutable = () => {
  const file = executable();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `#!/usr/bin/env node\nprocess.stdout.write('stdout:' + process.argv.slice(2).join(',') + '\\n');\nprocess.stderr.write('stderr:' + process.argv.slice(2).join(',') + '\\n');\nprocess.exit(Number(process.env.JSONSCHEMA_TEST_EXIT_CODE || '0'));\n`);
  fs.chmodSync(file, 0o755);
};

before(() => {
  ensureExecutable();
});

test('spawn captures stdout, stderr, and exit code', async () => {
  const result = await spawn(['inspect', 'schema.json'], {
    env: {
      ...process.env,
      JSONSCHEMA_TEST_EXIT_CODE: '7'
    }
  });

  assert.equal(result.code, 7);
  assert.equal(result.signal, null);
  assert.match(result.stdout, /stdout:inspect,schema\.json/);
  assert.match(result.stderr, /stderr:inspect,schema\.json/);
});

test('spawn supports inherited stdio', async () => {
  const result = await spawn(['inspect'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      JSONSCHEMA_TEST_EXIT_CODE: '0'
    }
  });

  assert.equal(result.code, 0);
  assert.equal(result.stdout, '');
  assert.equal(result.stderr, '');
});
