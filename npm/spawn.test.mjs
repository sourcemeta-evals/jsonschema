import { describe, it } from 'node:test';
import assert from 'node:assert';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const main = require('./main.js');

describe('ESM', function () {
  it('should export a spawn function', function () {
    assert.strictEqual(typeof main.spawn, 'function');
  });

  it('spawn should return a promise', function () {
    const result = main.spawn(['--help']);
    assert.ok(result instanceof Promise);
    result.catch(function () {});
  });

  it('spawn should reject if executable does not exist', async function () {
    await assert.rejects(function () {
      return main.spawn(['--help']);
    }, function (error) {
      assert.ok(error instanceof Error);
      assert.ok(error.message.includes('does not support'));
      return true;
    });
  });

  it('spawn should reject with no arguments', async function () {
    await assert.rejects(function () {
      return main.spawn();
    }, function (error) {
      assert.ok(error instanceof Error);
      return true;
    });
  });
});
