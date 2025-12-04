import { test, describe } from 'node:test';
import assert from 'node:assert';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { spawn } = require('./main.js');

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
    assert.ok('code' in result);
    assert.ok('stdout' in result);
    assert.ok('stderr' in result);
    assert.strictEqual(typeof result.code, 'number');
    assert.strictEqual(typeof result.stdout, 'string');
    assert.strictEqual(typeof result.stderr, 'string');
  });

  test('should capture stdout when stdio is not inherit', async () => {
    const result = await spawn(['--version']);
    assert.strictEqual(result.code, 0);
    assert.ok(result.stdout.length > 0);
  });

  test('should return empty stdout/stderr when stdio is inherit', async () => {
    const result = await spawn(['--version'], { stdio: 'inherit' });
    assert.strictEqual(result.code, 0);
    assert.strictEqual(result.stdout, '');
    assert.strictEqual(result.stderr, '');
  });

  test('should return non-zero code for invalid command', async () => {
    const result = await spawn(['invalid-command']);
    assert.notStrictEqual(result.code, 0);
  });

  test('should handle help command', async () => {
    const result = await spawn(['--help']);
    assert.strictEqual(result.code, 0);
    assert.ok(result.stdout.includes('jsonschema') || result.stdout.includes('JSON'));
  });
});
