const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const { spawn, EXECUTABLE } = require('./main.js');

describe('spawn', function () {
  it('should export a spawn function', function () {
    assert.strictEqual(typeof spawn, 'function');
  });

  it('should export the EXECUTABLE path', function () {
    assert.strictEqual(typeof EXECUTABLE, 'string');
    assert.ok(EXECUTABLE.length > 0);
  });

  it('should return a promise', function () {
    const result = spawn([]);
    assert.ok(result instanceof Promise);
    // The promise will reject if no binary exists, so handle it
    result.catch(function () {});
  });

  it('should reject if the executable does not exist', async function () {
    if (fs.existsSync(EXECUTABLE)) {
      return;
    }

    await assert.rejects(function () {
      return spawn([]);
    }, function (error) {
      assert.ok(error instanceof Error);
      assert.ok(error.message.includes('does not support'));
      return true;
    });
  });

  it('should resolve with code, stdout, and stderr properties', async function () {
    if (!fs.existsSync(EXECUTABLE)) {
      return;
    }

    const result = await spawn(['--help']);
    assert.strictEqual(typeof result.code, 'number');
    assert.strictEqual(typeof result.stdout, 'string');
    assert.strictEqual(typeof result.stderr, 'string');
  });

  it('should pass arguments to the executable', async function () {
    if (!fs.existsSync(EXECUTABLE)) {
      return;
    }

    const result = await spawn(['--help']);
    assert.strictEqual(result.code, 0);
    assert.ok(result.stdout.length > 0 || result.stderr.length > 0);
  });

  it('should accept options like child_process.spawn', async function () {
    if (!fs.existsSync(EXECUTABLE)) {
      return;
    }

    const result = await spawn(['--help'], { windowsHide: true });
    assert.strictEqual(typeof result.code, 'number');
  });

  it('should handle empty arguments array', async function () {
    if (!fs.existsSync(EXECUTABLE)) {
      return;
    }

    const result = await spawn([]);
    assert.strictEqual(typeof result.code, 'number');
  });
});
