import test from 'node:test';
import assert from 'node:assert';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { spawn } = require('./main.js');

test('spawn returns version information (ESM)', async () => {
  const result = await spawn(['--version']);
  assert.strictEqual(result.code, 0);
  assert.ok(result.stdout.trim().length > 0);
});

test('spawn returns help information (ESM)', async () => {
  const result = await spawn(['--help']);
  assert.strictEqual(result.code, 0);
  assert.ok(result.stdout.includes('JSON Schema'));
});

test('spawn handles invalid command with non-zero exit code (ESM)', async () => {
  const result = await spawn(['invalid-command-that-does-not-exist']);
  assert.notStrictEqual(result.code, 0);
});

test('spawn with stdio inherit returns empty stdout/stderr (ESM)', async () => {
  const result = await spawn(['--version'], { stdio: 'inherit' });
  assert.strictEqual(result.code, 0);
  assert.strictEqual(result.stdout, '');
  assert.strictEqual(result.stderr, '');
});

test('spawn result has expected properties (ESM)', async () => {
  const result = await spawn(['--version']);
  assert.ok('code' in result);
  assert.ok('stdout' in result);
  assert.ok('stderr' in result);
  assert.strictEqual(typeof result.code, 'number');
  assert.strictEqual(typeof result.stdout, 'string');
  assert.strictEqual(typeof result.stderr, 'string');
});
