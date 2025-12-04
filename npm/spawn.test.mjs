import test from 'node:test';
import assert from 'node:assert';
import { createRequire } from 'node:module';
import os from 'os';

const require = createRequire(import.meta.url);
const { spawn, getExecutablePath } = require('./main.js');

test('ESM: getExecutablePath returns a string', () => {
  const executablePath = getExecutablePath();
  assert.strictEqual(typeof executablePath, 'string');
  assert.ok(executablePath.length > 0);
});

test('ESM: getExecutablePath returns path with correct platform', () => {
  const executablePath = getExecutablePath();
  const platform = os.platform() === 'win32' ? 'windows' : os.platform();
  assert.ok(executablePath.includes(platform));
});

test('ESM: spawn is a function', () => {
  assert.strictEqual(typeof spawn, 'function');
});

test('ESM: spawn returns a promise', () => {
  const result = spawn(['--version']);
  assert.ok(result instanceof Promise);
});

test('ESM: spawn with --version returns code 0', async () => {
  const result = await spawn(['--version']);
  assert.strictEqual(result.code, 0);
  assert.strictEqual(typeof result.stdout, 'string');
  assert.strictEqual(typeof result.stderr, 'string');
});

test('ESM: spawn captures stdout', async () => {
  const result = await spawn(['--version']);
  assert.ok(result.stdout.length > 0);
});

test('ESM: spawn with invalid command returns non-zero code', async () => {
  const result = await spawn(['invalid-command-that-does-not-exist']);
  assert.notStrictEqual(result.code, 0);
});

test('ESM: spawn with stdio inherit returns empty stdout/stderr', async () => {
  const result = await spawn(['--version'], { stdio: 'inherit' });
  assert.strictEqual(result.code, 0);
  assert.strictEqual(result.stdout, '');
  assert.strictEqual(result.stderr, '');
});

test('ESM: spawn result has expected properties', async () => {
  const result = await spawn(['--version']);
  assert.ok('code' in result);
  assert.ok('stdout' in result);
  assert.ok('stderr' in result);
});
