import test from 'node:test';
import assert from 'node:assert';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { spawn } = require('./main.js');

test('spawn is a function (ESM)', () => {
  assert.strictEqual(typeof spawn, 'function');
});

test('spawn returns a promise (ESM)', () => {
  const result = spawn(['--help']);
  assert.ok(result instanceof Promise);
});

test('spawn resolves with code, stdout, and stderr (ESM)', async () => {
  const result = await spawn(['--help']);
  assert.strictEqual(typeof result.code, 'number');
  assert.strictEqual(typeof result.stdout, 'string');
  assert.strictEqual(typeof result.stderr, 'string');
});

test('spawn --help returns exit code 0 (ESM)', async () => {
  const result = await spawn(['--help']);
  assert.strictEqual(result.code, 0);
});

test('spawn --help outputs usage information (ESM)', async () => {
  const result = await spawn(['--help']);
  assert.ok(result.stdout.includes('Usage'));
});

test('spawn with invalid command returns non-zero exit code (ESM)', async () => {
  const result = await spawn(['invalid-command-that-does-not-exist']);
  assert.notStrictEqual(result.code, 0);
});

test('spawn with stdio inherit returns empty stdout and stderr (ESM)', async () => {
  const result = await spawn(['--help'], { stdio: 'inherit' });
  assert.strictEqual(result.stdout, '');
  assert.strictEqual(result.stderr, '');
  assert.strictEqual(result.code, 0);
});
