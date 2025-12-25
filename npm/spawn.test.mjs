import { describe, it } from 'node:test';
import assert from 'node:assert';
import { spawn } from './main.mjs';

describe('spawn (ESM)', () => {
  it('should export spawn function', () => {
    assert.strictEqual(typeof spawn, 'function');
  });

  it('should return a promise', () => {
    const result = spawn(['--version']);
    assert.ok(result instanceof Promise);
  });

  it('should resolve with code, stdout, and stderr', async () => {
    const result = await spawn(['--version']);
    assert.strictEqual(typeof result.code, 'number');
    assert.strictEqual(typeof result.stdout, 'string');
    assert.strictEqual(typeof result.stderr, 'string');
  });

  it('should capture stdout when stdio is not inherit', async () => {
    const result = await spawn(['--version']);
    assert.ok(result.stdout.length > 0);
    assert.strictEqual(result.code, 0);
  });

  it('should handle stdio inherit option', async () => {
    const result = await spawn(['--version'], { stdio: 'inherit' });
    assert.strictEqual(result.code, 0);
    assert.strictEqual(result.stdout, '');
    assert.strictEqual(result.stderr, '');
  });

  it('should return non-zero exit code for invalid command', async () => {
    const result = await spawn(['invalid-command-that-does-not-exist']);
    assert.notStrictEqual(result.code, 0);
  });
});
