import { test } from 'node:test';
import assert from 'node:assert';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { spawn } = require('./main.js');

test('spawn returns version with --version flag', async () => {
  const result = await spawn(['--version']);
  assert.strictEqual(result.code, 0);
  assert.match(result.stdout, /\d+\.\d+\.\d+/);
  assert.strictEqual(result.stderr, '');
});

test('spawn returns help with --help flag', async () => {
  const result = await spawn(['--help']);
  assert.strictEqual(result.code, 0);
  assert.ok(result.stdout.includes('Usage'));
  assert.strictEqual(result.stderr, '');
});

test('spawn returns non-zero exit code for invalid command', async () => {
  const result = await spawn(['invalid-command']);
  assert.notStrictEqual(result.code, 0);
});

test('spawn with stdio inherit returns empty stdout/stderr', async () => {
  const result = await spawn(['--version'], { stdio: 'inherit' });
  assert.strictEqual(result.code, 0);
  assert.strictEqual(result.stdout, '');
  assert.strictEqual(result.stderr, '');
});

test('spawn help inspect command works', async () => {
  const result = await spawn(['help', 'inspect']);
  assert.strictEqual(result.code, 0);
  assert.ok(result.stdout.includes('inspect'));
});
