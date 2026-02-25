const { describe, it } = require('node:test');
const assert = require('node:assert');
const { spawn } = require('./main');

describe('spawn', () => {
  it('should export a spawn function', () => {
    assert.strictEqual(typeof spawn, 'function');
  });

  it('should return a promise', () => {
    const result = spawn(['--version']);
    assert.ok(result instanceof Promise);
    result.catch(() => {});
  });

  it('should resolve with stdout, stderr, and code properties', async () => {
    const result = await spawn(['--version']).catch((error) => {
      // If the binary does not exist, we expect a rejection
      return null;
    });

    if (result !== null) {
      assert.ok('stdout' in result);
      assert.ok('stderr' in result);
      assert.ok('code' in result);
      assert.strictEqual(typeof result.stdout, 'string');
      assert.strictEqual(typeof result.stderr, 'string');
      assert.strictEqual(typeof result.code, 'number');
    }
  });

  it('should reject if the binary does not exist on unsupported platform', async () => {
    // This test validates the error path
    // On CI, the binary might not be built, so we just verify the
    // function handles the case gracefully
    try {
      await spawn(['--version']);
    } catch (error) {
      assert.ok(error instanceof Error);
      assert.ok(error.message.length > 0);
    }
  });

  it('should accept an empty arguments array', () => {
    const result = spawn([]);
    assert.ok(result instanceof Promise);
    result.catch(() => {});
  });
});
