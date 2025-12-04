const { test, describe } = require('node:test');
const assert = require('node:assert');
const { spawn, getExecutable, PLATFORM, ARCH } = require('./main.js');

describe('CommonJS spawn tests', () => {
  test('exports spawn function', () => {
    assert.strictEqual(typeof spawn, 'function');
  });

  test('exports getExecutable function', () => {
    assert.strictEqual(typeof getExecutable, 'function');
  });

  test('exports PLATFORM constant', () => {
    assert.strictEqual(typeof PLATFORM, 'string');
    assert.ok(['darwin', 'linux', 'windows'].includes(PLATFORM));
  });

  test('exports ARCH constant', () => {
    assert.strictEqual(typeof ARCH, 'string');
  });

  test('getExecutable returns path containing jsonschema', () => {
    const executable = getExecutable();
    assert.strictEqual(typeof executable, 'string');
    assert.ok(executable.includes('jsonschema'));
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

  test('spawn --help returns success code', async () => {
    const result = await spawn(['--help']);
    assert.strictEqual(result.code, 0);
  });

  test('spawn --help includes usage information', async () => {
    const result = await spawn(['--help']);
    assert.ok(result.stdout.includes('Usage'));
  });

  test('spawn --version returns success code', async () => {
    const result = await spawn(['--version']);
    assert.strictEqual(result.code, 0);
  });

  test('spawn with invalid command returns non-zero code', async () => {
    const result = await spawn(['invalid-command-that-does-not-exist']);
    assert.notStrictEqual(result.code, 0);
  });

  test('spawn with stdio inherit option', async () => {
    const result = await spawn(['--version'], { stdio: 'inherit' });
    assert.strictEqual(typeof result.code, 'number');
    assert.strictEqual(result.stdout, '');
    assert.strictEqual(result.stderr, '');
  });
});
