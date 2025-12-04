const { spawn } = require('./main.js');
const { test } = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');

const PLATFORM = os.platform() === 'win32' ? 'windows' : os.platform();
const ARCH = os.arch() === 'x64' ? 'x86_64' : os.arch();
const EXECUTABLE = PLATFORM === 'windows'
  ? path.join(__dirname, '..', 'build', 'github-releases', `jsonschema-${PLATFORM}-${ARCH}.exe`)
  : path.join(__dirname, '..', 'build', 'github-releases', `jsonschema-${PLATFORM}-${ARCH}`);

const hasExecutable = fs.existsSync(EXECUTABLE);

test('spawn returns a promise (CommonJS)', { skip: !hasExecutable }, async () => {
  const result = spawn(['--help']);
  assert.ok(result instanceof Promise);
  await result;
});

test('spawn resolves with code, stdout, and stderr (CommonJS)', { skip: !hasExecutable }, async () => {
  const result = await spawn(['--help']);
  assert.strictEqual(typeof result.code, 'number');
  assert.strictEqual(typeof result.stdout, 'string');
  assert.strictEqual(typeof result.stderr, 'string');
});

test('spawn captures stdout when stdio is not inherit (CommonJS)', { skip: !hasExecutable }, async () => {
  const result = await spawn(['--help']);
  assert.ok(result.stdout.length > 0);
  assert.strictEqual(result.code, 0);
});

test('spawn with stdio inherit returns empty stdout/stderr (CommonJS)', { skip: !hasExecutable }, async () => {
  const result = await spawn(['--help'], { stdio: 'inherit' });
  assert.strictEqual(result.stdout, '');
  assert.strictEqual(result.stderr, '');
  assert.strictEqual(result.code, 0);
});

test('spawn returns non-zero code for invalid command (CommonJS)', { skip: !hasExecutable }, async () => {
  const result = await spawn(['invalid-command']);
  assert.notStrictEqual(result.code, 0);
});

test('spawn rejects when executable does not exist (CommonJS)', async () => {
  if (!hasExecutable) {
    await assert.rejects(
      () => spawn(['--help']),
      /does not support/
    );
  }
});
