import test from 'node:test';
import assert from 'node:assert';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { spawn } = require('./main');

test('spawn returns version with --version flag (ESM)', async () => {
  const result = await spawn(['--version']);
  assert.strictEqual(result.code, 0);
  assert.ok(result.stdout.length > 0);
});

test('spawn returns help with --help flag (ESM)', async () => {
  const result = await spawn(['--help']);
  assert.strictEqual(result.code, 0);
  assert.ok(result.stdout.includes('JSON Schema'));
});

test('spawn returns non-zero exit code for invalid command (ESM)', async () => {
  const result = await spawn(['invalid-command']);
  assert.notStrictEqual(result.code, 0);
});

test('spawn with stdio inherit returns empty stdout/stderr (ESM)', async () => {
  const result = await spawn(['--version'], { stdio: 'inherit' });
  assert.strictEqual(result.code, 0);
  assert.strictEqual(result.stdout, '');
  assert.strictEqual(result.stderr, '');
});
