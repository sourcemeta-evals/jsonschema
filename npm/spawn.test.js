const { test } = require('node:test');
const assert = require('node:assert');
const { spawn } = require('./main.js');

test('spawn returns a promise (CommonJS)', async () => {
  const result = spawn(['--version']);
  assert.ok(result instanceof Promise, 'spawn should return a Promise');
});

test('spawn resolves with code, stdout, and stderr (CommonJS)', async () => {
  const result = await spawn(['--version']);
  assert.ok(typeof result.code === 'number', 'result should have a numeric code');
  assert.ok(typeof result.stdout === 'string', 'result should have a string stdout');
  assert.ok(typeof result.stderr === 'string', 'result should have a string stderr');
});

test('spawn --version returns success (CommonJS)', async () => {
  const result = await spawn(['--version']);
  assert.strictEqual(result.code, 0, 'exit code should be 0');
  assert.ok(result.stdout.length > 0 || result.stderr.length > 0, 'should have some output');
});

test('spawn --help returns success (CommonJS)', async () => {
  const result = await spawn(['--help']);
  assert.strictEqual(result.code, 0, 'exit code should be 0');
});

test('spawn with invalid command returns non-zero exit code (CommonJS)', async () => {
  const result = await spawn(['invalid-command-that-does-not-exist']);
  assert.notStrictEqual(result.code, 0, 'exit code should be non-zero for invalid command');
});

test('spawn with stdio inherit does not capture output (CommonJS)', async () => {
  const result = await spawn(['--version'], { stdio: 'inherit' });
  assert.strictEqual(result.code, 0, 'exit code should be 0');
  assert.strictEqual(result.stdout, '', 'stdout should be empty when stdio is inherit');
  assert.strictEqual(result.stderr, '', 'stderr should be empty when stdio is inherit');
});

test('spawn help command works (CommonJS)', async () => {
  const result = await spawn(['help']);
  assert.strictEqual(result.code, 0, 'exit code should be 0');
  assert.ok(result.stdout.includes('JSON Schema CLI'), 'help output should contain CLI name');
});
