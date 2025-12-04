import { test, describe } from 'node:test';
import assert from 'node:assert';
import { spawn } from './main.js';

describe('spawn (ESM)', () => {
  test('should export spawn function', () => {
    assert.strictEqual(typeof spawn, 'function');
  });

  test('should return a promise', () => {
    const result = spawn(['--version']);
    assert.ok(result instanceof Promise);
  });

  test('should resolve with code, stdout, and stderr', async () => {
    const result = await spawn(['--version']);
    assert.strictEqual(typeof result.code, 'number');
    assert.strictEqual(typeof result.stdout, 'string');
    assert.strictEqual(typeof result.stderr, 'string');
  });

  test('should return exit code 0 for --version', async () => {
    const result = await spawn(['--version']);
    assert.strictEqual(result.code, 0);
  });

  test('should capture stdout for --version', async () => {
    const result = await spawn(['--version']);
    assert.ok(result.stdout.length > 0);
  });

  test('should return non-zero exit code for invalid command', async () => {
    const result = await spawn(['invalid-command-that-does-not-exist']);
    assert.notStrictEqual(result.code, 0);
  });

  test('should work with stdio inherit option', async () => {
    const result = await spawn(['--version'], { stdio: 'inherit' });
    assert.strictEqual(result.code, 0);
    assert.strictEqual(result.stdout, '');
    assert.strictEqual(result.stderr, '');
  });

  test('should handle multiple arguments', async () => {
    const result = await spawn(['--help']);
    assert.strictEqual(result.code, 0);
    assert.ok(result.stdout.length > 0);
  });
});
