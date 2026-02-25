const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { spawn } = require('./main');

const platform = os.platform() === 'win32' ? 'windows' : os.platform();
const architecture = os.arch() === 'x64' ? 'x86_64' : os.arch();
const executable = path.join(
  __dirname,
  '..',
  'build',
  'github-releases',
  platform === 'windows'
    ? `jsonschema-${platform}-${architecture}.exe`
    : `jsonschema-${platform}-${architecture}`
);

const ensureExecutable = async () => {
  await fs.mkdir(path.dirname(executable), { recursive: true });
  await fs.writeFile(
    executable,
    [
      '#!/usr/bin/env node',
      'const payload = JSON.stringify({',
      '  argv: process.argv.slice(2),',
      '  cwd: process.cwd(),',
      '});',
      'process.stdout.write(payload);',
      'process.stderr.write("stderr-output");',
      'process.exit(7);',
      '',
    ].join('\n'),
    { mode: 0o755 }
  );
};

test('spawn resolves with stdout, stderr, and exit code in CommonJS', async () => {
  await ensureExecutable();
  const output = await spawn(['inspect', 'path/to/schema.json']);
  const payload = JSON.parse(output.stdout);

  assert.equal(output.code, 7);
  assert.equal(output.signal, null);
  assert.equal(output.stderr, 'stderr-output');
  assert.deepEqual(payload.argv, ['inspect', 'path/to/schema.json']);
});

test('spawn forwards child_process options in CommonJS', async () => {
  await ensureExecutable();
  const cwd = await fs.mkdtemp(path.join(os.tmpdir(), 'jsonschema-npm-spawn-'));
  const output = await spawn([], { cwd });
  const payload = JSON.parse(output.stdout);

  assert.equal(payload.cwd, cwd);
  await fs.rm(cwd, { recursive: true, force: true });
});
