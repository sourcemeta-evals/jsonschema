import test from 'node:test';
import assert from 'node:assert';
import { spawn } from './main.js';
import packageJson from '../package.json' with { type: 'json' };

test('spawn returns version with --version flag', async () => {
  const result = await spawn(['--version']);
  assert.strictEqual(result.code, 0);
  assert.strictEqual(result.stdout.trim(), packageJson.version);
});

test('spawn returns help with --help flag', async () => {
  const result = await spawn(['--help']);
  assert.strictEqual(result.code, 0);
  assert.match(result.stdout, /Usage:/);
  assert.match(result.stdout, /Commands:/);
});

test('spawn returns non-zero exit code for invalid command', async () => {
  const result = await spawn(['invalid-command']);
  assert.strictEqual(result.code, 1);
});

test('spawn captures stderr on error', async () => {
  const result = await spawn(['validate']);
  assert.strictEqual(result.code, 1);
  assert.ok(result.stderr.length > 0);
});

test('spawn with json option appends --json flag', async () => {
  const result = await spawn(['validate'], { json: true });
  assert.strictEqual(result.code, 1);
  assert.strictEqual(typeof result.stdout, 'object');
  assert.ok('error' in result.stdout);
});

test('spawn with json option returns string stdout when output is empty', async () => {
  const result = await spawn(['invalid-command'], { json: true });
  assert.strictEqual(result.code, 1);
  assert.strictEqual(typeof result.stdout, 'string');
});

test('spawn without json option returns string stdout', async () => {
  const result = await spawn(['--version']);
  assert.strictEqual(result.code, 0);
  assert.strictEqual(typeof result.stdout, 'string');
});

test('spawn with json false behaves like default', async () => {
  const result = await spawn(['--version'], { json: false });
  assert.strictEqual(result.code, 0);
  assert.strictEqual(typeof result.stdout, 'string');
  assert.ok(result.stdout.trim().length > 0);
});
