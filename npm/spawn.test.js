const { describe, it } = require('node:test');
const assert = require('node:assert');
const { spawn, getExecutablePath } = require('./main.js');
const fs = require('fs');

describe('CommonJS spawn tests', () => {
  it('should export spawn function', () => {
    assert.strictEqual(typeof spawn, 'function');
  });

  it('should export getExecutablePath function', () => {
    assert.strictEqual(typeof getExecutablePath, 'function');
  });

  it('should return executable path as string', () => {
    const execPath = getExecutablePath();
    assert.strictEqual(typeof execPath, 'string');
    assert.ok(execPath.includes('jsonschema'));
  });

  it('spawn should return a promise', async () => {
    const execPath = getExecutablePath();
    if (!fs.existsSync(execPath)) {
      await assert.rejects(spawn(['--help']), /does not support/);
    } else {
      const result = spawn(['--help']);
      assert.ok(result instanceof Promise);
      await result;
    }
  });

  it('spawn should resolve with code, stdout, and stderr', async () => {
    const execPath = getExecutablePath();
    if (!fs.existsSync(execPath)) {
      return;
    }

    const result = await spawn(['--help']);
    assert.strictEqual(typeof result.code, 'number');
    assert.strictEqual(typeof result.stdout, 'string');
    assert.strictEqual(typeof result.stderr, 'string');
  });

  it('spawn should handle version flag', async () => {
    const execPath = getExecutablePath();
    if (!fs.existsSync(execPath)) {
      return;
    }

    const result = await spawn(['--version']);
    assert.strictEqual(result.code, 0);
  });

  it('spawn should reject when executable does not exist', async () => {
    const execPath = getExecutablePath();
    if (fs.existsSync(execPath)) {
      return;
    }

    await assert.rejects(
      spawn(['--help']),
      /does not support/
    );
  });
});
