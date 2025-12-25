import { test } from 'node:test';
import assert from 'node:assert';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { spawn, getExecutablePath } = require('./main.js');

test('getExecutablePath returns a string path', () => {
  const executablePath = getExecutablePath();
  assert.strictEqual(typeof executablePath, 'string');
  assert.ok(executablePath.length > 0);
});

test('spawn returns a promise', () => {
  const result = spawn(['--version']);
  assert.ok(result instanceof Promise);
});

test('spawn resolves with code, stdout, and stderr', async () => {
  const result = await spawn(['--version']);
  assert.strictEqual(typeof result.code, 'number');
  assert.strictEqual(typeof result.stdout, 'string');
  assert.strictEqual(typeof result.stderr, 'string');
});

test('spawn --version returns exit code 0', async () => {
  const result = await spawn(['--version']);
  assert.strictEqual(result.code, 0);
});

test('spawn --version outputs version string', async () => {
  const result = await spawn(['--version']);
  assert.ok(result.stdout.length > 0 || result.stderr.length > 0);
});

test('spawn with invalid command returns non-zero exit code', async () => {
  const result = await spawn(['invalid-command-that-does-not-exist']);
  assert.notStrictEqual(result.code, 0);
});

test('spawn with stdio inherit returns empty stdout and stderr', async () => {
  const result = await spawn(['--version'], { stdio: 'inherit' });
  assert.strictEqual(result.code, 0);
  assert.strictEqual(result.stdout, '');
  assert.strictEqual(result.stderr, '');
});
