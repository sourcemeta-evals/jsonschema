import test from 'node:test';
import assert from 'node:assert';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { spawn } = require('./main.js');

test('spawn returns version with --version flag (ESM)', async () => {
  const result = await spawn(['--version']);
  assert.strictEqual(result.code, 0);
  assert.ok(result.stdout.length > 0 || result.stderr.length > 0);
});

test('spawn returns help with --help flag (ESM)', async () => {
  const result = await spawn(['--help']);
  assert.strictEqual(result.code, 0);
});

test('spawn captures stdout when stdio is not inherit (ESM)', async () => {
  const result = await spawn(['--version']);
  assert.strictEqual(typeof result.stdout, 'string');
  assert.strictEqual(typeof result.stderr, 'string');
  assert.strictEqual(typeof result.code, 'number');
});

test('spawn returns non-zero code for invalid command (ESM)', async () => {
  const result = await spawn(['invalid-command-that-does-not-exist']);
  assert.notStrictEqual(result.code, 0);
});

test('spawn with stdio inherit returns result object (ESM)', async () => {
  const result = await spawn(['--version'], { stdio: 'inherit' });
  assert.strictEqual(result.code, 0);
  assert.strictEqual(typeof result.stdout, 'string');
  assert.strictEqual(typeof result.stderr, 'string');
});
