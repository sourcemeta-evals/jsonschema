const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');

const { spawn, EXECUTABLE } = require('./main.js');

describe('CommonJS', () => {
  describe('module exports', () => {
    it('should export spawn as a function', () => {
      assert.equal(typeof spawn, 'function');
    });

    it('should export EXECUTABLE as a string', () => {
      assert.equal(typeof EXECUTABLE, 'string');
    });
  });

  describe('spawn', () => {
    it('should return a promise', () => {
      const result = spawn(['--help']);
      assert.ok(result instanceof Promise);
      result.catch(() => {});
    });

    it('should reject if args is not an array', async () => {
      await assert.rejects(() => spawn('not-an-array'), {
        message: 'The first argument must be an array of strings'
      });
    });

    it('should reject if the executable does not exist and is missing', async () => {
      if (fs.existsSync(EXECUTABLE)) {
        return;
      }

      await assert.rejects(() => spawn(['--help']), (error) => {
        assert.ok(error.message.includes('does not support'));
        return true;
      });
    });

    it('should resolve with code, stdout, and stderr properties', async () => {
      if (!fs.existsSync(EXECUTABLE)) {
        return;
      }

      const result = await spawn(['--help']);
      assert.equal(typeof result.code, 'number');
      assert.equal(typeof result.stdout, 'string');
      assert.equal(typeof result.stderr, 'string');
    });

    it('should resolve with null stdout and stderr when stdio is inherit', async () => {
      if (!fs.existsSync(EXECUTABLE)) {
        return;
      }

      const result = await spawn(['--help'], { stdio: 'inherit' });
      assert.equal(result.stdout, null);
      assert.equal(result.stderr, null);
      assert.equal(typeof result.code, 'number');
    });

    it('should capture stdout output', async () => {
      if (!fs.existsSync(EXECUTABLE)) {
        return;
      }

      const result = await spawn(['--help']);
      assert.ok(result.stdout.length > 0);
    });

    it('should return a non-zero exit code on invalid arguments', async () => {
      if (!fs.existsSync(EXECUTABLE)) {
        return;
      }

      const result = await spawn(['--nonexistent-option-that-should-fail']);
      assert.notEqual(result.code, 0);
    });

    it('should pass options to the child process', async () => {
      if (!fs.existsSync(EXECUTABLE)) {
        return;
      }

      const result = await spawn(['--help'], { windowsHide: true });
      assert.equal(typeof result.code, 'number');
    });
  });
});
