const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { after, before, test } = require('node:test');
const { spawn } = require('./main');

const PLATFORM = os.platform() === 'win32' ? 'windows' : os.platform();
const ARCH = os.arch() === 'x64' ? 'x86_64' : os.arch();
const EXECUTABLE = PLATFORM === 'windows'
  ? path.join(__dirname, '..', 'build', 'github-releases', `jsonschema-${PLATFORM}-${ARCH}.exe`)
  : path.join(__dirname, '..', 'build', 'github-releases', `jsonschema-${PLATFORM}-${ARCH}`);
const BACKUP = `${EXECUTABLE}.backup`;

const writeFakeExecutable = function () {
  if (PLATFORM === 'windows') {
    fs.writeFileSync(EXECUTABLE, [
      '@echo off',
      'echo stdout:%*',
      'echo stderr:%* 1>&2',
      'exit /b 5'
    ].join('\r\n'));
    return;
  }

  fs.writeFileSync(EXECUTABLE, [
    '#!/usr/bin/env node',
    'process.stdout.write(`stdout:${process.argv.slice(2).join(",")}`);',
    'process.stderr.write(`stderr:${process.argv.slice(2).join(",")}`);',
    'process.exit(5);'
  ].join('\n'));
  fs.chmodSync(EXECUTABLE, 0o755);
};

before(() => {
  fs.mkdirSync(path.dirname(EXECUTABLE), { recursive: true });

  if (fs.existsSync(BACKUP)) {
    fs.rmSync(BACKUP, { force: true });
  }

  if (fs.existsSync(EXECUTABLE)) {
    fs.copyFileSync(EXECUTABLE, BACKUP);
  }

  writeFakeExecutable();
});

after(() => {
  if (fs.existsSync(BACKUP)) {
    fs.copyFileSync(BACKUP, EXECUTABLE);
    fs.rmSync(BACKUP, { force: true });
    return;
  }

  if (fs.existsSync(EXECUTABLE)) {
    fs.rmSync(EXECUTABLE, { force: true });
  }
});

test('spawn resolves with stdout, stderr and exit code', async () => {
  const result = await spawn([ 'inspect', 'schema.json' ]);
  assert.equal(result.code, 5);
  assert.match(result.stdout, /^stdout:inspect,schema\.json$/);
  assert.match(result.stderr, /^stderr:inspect,schema\.json$/);
});

test('spawn resolves without captured output when stdio is inherited', async () => {
  const result = await spawn([ 'inspect', 'schema.json' ], { stdio: 'inherit' });
  assert.equal(result.code, 5);
  assert.equal(result.stdout, undefined);
  assert.equal(result.stderr, undefined);
});

test('spawn rejects when the executable is missing', async () => {
  const temporary = `${EXECUTABLE}.tmp`;
  fs.renameSync(EXECUTABLE, temporary);

  try {
    await assert.rejects(spawn([]), /does not support/);
  } finally {
    fs.renameSync(temporary, EXECUTABLE);
  }
});
