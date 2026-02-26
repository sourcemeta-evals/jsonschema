import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from './main.mjs';

describe('spawn (ESM)', () => {
  it('should export a spawn function', () => {
    assert.strictEqual(typeof spawn, 'function');
  });

  it('should return a promise', () => {
    const result = spawn(['--version']);
    assert.ok(result instanceof Promise);
    // Consume the promise to avoid unhandled rejection
    result.catch(() => {});
  });

  it('should reject when the executable is not found', async () => {
    await assert.rejects(() => spawn(['--version']), {
      name: 'Error'
    });
  });

  it('should reject with a descriptive message when the executable is not found', async () => {
    await assert.rejects(() => spawn(['--version']), (error) => {
      assert.ok(error.message.includes('does not support'));
      return true;
    });
  });

  it('should reject when passing no arguments and executable is missing', async () => {
    await assert.rejects(() => spawn([], {}), {
      name: 'Error'
    });
  });

  it('should handle undefined arguments', async () => {
    await assert.rejects(() => spawn(), {
      name: 'Error'
    });
  });

  it('should handle null arguments', async () => {
    await assert.rejects(() => spawn(null, null), {
      name: 'Error'
    });
  });
});
