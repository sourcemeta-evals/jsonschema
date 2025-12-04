const test = require('node:test');
const assert = require('node:assert');
const { spawn, getExecutablePath } = require('./main.js');
const fs = require('fs');
const path = require('path');
const os = require('os');

test('CommonJS: getExecutablePath returns a string', () => {
  const executablePath = getExecutablePath();
  assert.strictEqual(typeof executablePath, 'string');
  assert.ok(executablePath.length > 0);
});

test('CommonJS: getExecutablePath returns path with correct platform', () => {
  const executablePath = getExecutablePath();
  const platform = os.platform() === 'win32' ? 'windows' : os.platform();
  assert.ok(executablePath.includes(platform));
});

test('CommonJS: spawn is a function', () => {
  assert.strictEqual(typeof spawn, 'function');
});

test('CommonJS: spawn returns a promise', () => {
  const result = spawn(['--version']);
  assert.ok(result instanceof Promise);
});

test('CommonJS: spawn with --version returns code 0', async () => {
  const result = await spawn(['--version']);
  assert.strictEqual(result.code, 0);
  assert.strictEqual(typeof result.stdout, 'string');
  assert.strictEqual(typeof result.stderr, 'string');
});

test('CommonJS: spawn captures stdout', async () => {
  const result = await spawn(['--version']);
  assert.ok(result.stdout.length > 0);
});

test('CommonJS: spawn with invalid command returns non-zero code', async () => {
  const result = await spawn(['invalid-command-that-does-not-exist']);
  assert.notStrictEqual(result.code, 0);
});

test('CommonJS: spawn with stdio inherit returns empty stdout/stderr', async () => {
  const result = await spawn(['--version'], { stdio: 'inherit' });
  assert.strictEqual(result.code, 0);
  assert.strictEqual(result.stdout, '');
  assert.strictEqual(result.stderr, '');
});

test('CommonJS: spawn result has expected properties', async () => {
  const result = await spawn(['--version']);
  assert.ok('code' in result);
  assert.ok('stdout' in result);
  assert.ok('stderr' in result);
});
