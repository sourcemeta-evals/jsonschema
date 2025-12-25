const { test } = require('node:test');
const assert = require('node:assert');
const { spawn } = require('./main.js');

test('spawn is a function', () => {
  assert.strictEqual(typeof spawn, 'function');
});

test('spawn returns a promise', () => {
  const result = spawn(['--version']);
  assert.ok(result instanceof Promise);
});

test('spawn resolves with code, stdout, and stderr properties', async () => {
  const result = await spawn(['--version']);
  assert.ok('code' in result);
  assert.ok('stdout' in result);
  assert.ok('stderr' in result);
});

test('spawn --version returns exit code 0', async () => {
  const result = await spawn(['--version']);
  assert.strictEqual(result.code, 0);
});

test('spawn --version returns version in stdout', async () => {
  const result = await spawn(['--version']);
  assert.ok(result.stdout.length > 0);
});

test('spawn with invalid command returns non-zero exit code', async () => {
  const result = await spawn(['invalid-command-that-does-not-exist']);
  assert.notStrictEqual(result.code, 0);
});

test('spawn with stdio inherit still resolves', async () => {
  const result = await spawn(['--version'], { stdio: 'inherit' });
  assert.strictEqual(result.code, 0);
  assert.strictEqual(result.stdout, '');
  assert.strictEqual(result.stderr, '');
});
