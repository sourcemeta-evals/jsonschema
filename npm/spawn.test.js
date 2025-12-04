const test = require('node:test');
const assert = require('node:assert');
const { spawn } = require('./main.js');

test('spawn is a function', () => {
  assert.strictEqual(typeof spawn, 'function');
});

test('spawn returns a promise', () => {
  const result = spawn(['--help']);
  assert.ok(result instanceof Promise);
});

test('spawn resolves with code, stdout, and stderr', async () => {
  const result = await spawn(['--help']);
  assert.strictEqual(typeof result.code, 'number');
  assert.strictEqual(typeof result.stdout, 'string');
  assert.strictEqual(typeof result.stderr, 'string');
});

test('spawn --help returns exit code 0', async () => {
  const result = await spawn(['--help']);
  assert.strictEqual(result.code, 0);
});

test('spawn --help outputs usage information', async () => {
  const result = await spawn(['--help']);
  assert.ok(result.stdout.includes('Usage'));
});

test('spawn with invalid command returns non-zero exit code', async () => {
  const result = await spawn(['invalid-command-that-does-not-exist']);
  assert.notStrictEqual(result.code, 0);
});

test('spawn with stdio inherit returns empty stdout and stderr', async () => {
  const result = await spawn(['--help'], { stdio: 'inherit' });
  assert.strictEqual(result.stdout, '');
  assert.strictEqual(result.stderr, '');
  assert.strictEqual(result.code, 0);
});
