const test = require('node:test');
const assert = require('node:assert');
const path = require('path');
const fs = require('fs');
const os = require('os');

const { spawn, getExecutablePath, PLATFORM, ARCH } = require('./main.js');

test('CommonJS: spawn function is exported', () => {
  assert.strictEqual(typeof spawn, 'function');
});

test('CommonJS: getExecutablePath returns correct path', () => {
  const execPath = getExecutablePath();
  assert.ok(execPath.includes('jsonschema'));
  assert.ok(execPath.includes(PLATFORM));
  assert.ok(execPath.includes(ARCH));
});

test('CommonJS: PLATFORM is detected correctly', () => {
  const expectedPlatform = os.platform() === 'win32' ? 'windows' : os.platform();
  assert.strictEqual(PLATFORM, expectedPlatform);
});

test('CommonJS: ARCH is detected correctly', () => {
  const expectedArch = os.arch() === 'x64' ? 'x86_64' : os.arch();
  assert.strictEqual(ARCH, expectedArch);
});

test('CommonJS: spawn returns a Promise', async () => {
  const result = spawn(['--help']);
  assert.ok(result instanceof Promise);
  try {
    await result;
  } catch (error) {
  }
});

test('CommonJS: spawn resolves with code, stdout, stderr', async () => {
  const execPath = getExecutablePath();
  if (!fs.existsSync(execPath)) {
    return;
  }

  const result = await spawn(['--help']);
  assert.ok('code' in result);
  assert.ok('stdout' in result);
  assert.ok('stderr' in result);
  assert.strictEqual(typeof result.code, 'number');
  assert.strictEqual(typeof result.stdout, 'string');
  assert.strictEqual(typeof result.stderr, 'string');
});

test('CommonJS: spawn with stdio inherit returns empty stdout/stderr', async () => {
  const execPath = getExecutablePath();
  if (!fs.existsSync(execPath)) {
    return;
  }

  const result = await spawn(['--help'], { stdio: 'inherit' });
  assert.ok('code' in result);
  assert.strictEqual(result.stdout, '');
  assert.strictEqual(result.stderr, '');
});

test('CommonJS: spawn rejects when executable not found', async () => {
  const originalExecutable = require('./main.js').EXECUTABLE;
  const main = require('./main.js');
  const savedExecutable = main.EXECUTABLE;

  Object.defineProperty(main, 'EXECUTABLE', {
    value: '/nonexistent/path/jsonschema',
    writable: true,
    configurable: true
  });

  try {
    await spawn(['--help']);
    assert.fail('Expected spawn to reject');
  } catch (error) {
    assert.ok(error.message.includes('does not support'));
  } finally {
    Object.defineProperty(main, 'EXECUTABLE', {
      value: savedExecutable,
      writable: true,
      configurable: true
    });
  }
});
