const { describe, it } = require('node:test');
const assert = require('node:assert');
const { spawn } = require('./main.js');

describe('spawn (CommonJS)', () => {
  it('should export spawn function', () => {
    assert.strictEqual(typeof spawn, 'function');
  });

  it('should return a promise', () => {
    const result = spawn(['--version']);
    assert.ok(result instanceof Promise);
  });

  it('should resolve with code, stdout, and stderr properties', async () => {
    const result = await spawn(['--version']);
    assert.ok('code' in result);
    assert.ok('stdout' in result);
    assert.ok('stderr' in result);
  });

  it('should capture stdout when stdio is not inherited', async () => {
    const result = await spawn(['--version']);
    assert.strictEqual(result.code, 0);
    assert.ok(result.stdout.length > 0);
  });

  it('should return non-zero exit code for invalid command', async () => {
    const result = await spawn(['invalid-command-that-does-not-exist']);
    assert.notStrictEqual(result.code, 0);
  });

  it('should work with stdio inherit option', async () => {
    const result = await spawn(['--version'], { stdio: 'inherit' });
    assert.strictEqual(result.code, 0);
    assert.strictEqual(result.stdout, '');
    assert.strictEqual(result.stderr, '');
  });
});
