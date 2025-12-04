import { describe, it } from 'node:test';
import assert from 'node:assert';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { spawn } = require('./main.js');

describe('spawn (ESM)', () => {
  it('should export spawn function', () => {
    assert.strictEqual(typeof spawn, 'function');
  });

  it('should return a promise', () => {
    const result = spawn(['--version']);
    assert.ok(result instanceof Promise);
    return result.catch(() => {});
  });

  it('should resolve with code, stdout, and stderr properties', async () => {
    const result = await spawn(['--version']);
    assert.ok('code' in result);
    assert.ok('stdout' in result);
    assert.ok('stderr' in result);
    assert.strictEqual(typeof result.code, 'number');
    assert.strictEqual(typeof result.stdout, 'string');
    assert.strictEqual(typeof result.stderr, 'string');
  });

  it('should capture stdout when stdio is not inherited', async () => {
    const result = await spawn(['--version']);
    assert.strictEqual(result.code, 0);
    assert.ok(result.stdout.length > 0);
  });

  it('should return exit code 0 for successful commands', async () => {
    const result = await spawn(['--version']);
    assert.strictEqual(result.code, 0);
  });
});
