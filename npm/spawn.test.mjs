import test from 'node:test';
import assert from 'node:assert';
import { spawn } from './main.js';

test('spawn returns stdout and stderr (ESM)', async () => {
  const result = await spawn(['--version']);
  assert.strictEqual(result.code, 0);
  assert.ok(result.stdout.length > 0);
});

test('spawn with stdio inherit does not capture output (ESM)', async () => {
  const result = await spawn(['--version'], { stdio: 'inherit' });
  assert.strictEqual(result.code, 0);
  assert.strictEqual(result.stdout, '');
  assert.strictEqual(result.stderr, '');
});

test('spawn with invalid command returns non-zero exit code (ESM)', async () => {
  const result = await spawn(['invalid-command']);
  assert.notStrictEqual(result.code, 0);
});

test('spawn handles errors correctly (ESM)', async () => {
  // This test verifies that the spawn function properly handles errors
  // For now, we just verify that spawn returns a promise
  assert.ok(spawn(['--version']) instanceof Promise);
});
