const { describe, it } = require('node:test');
const assert = require('node:assert');
const main = require('./main.js');

describe('CommonJS', function () {
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
