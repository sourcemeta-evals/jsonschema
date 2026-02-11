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

test('spawn with json option passes --json and parses stdout', async () => {
  const fs = await import('node:fs');
  const path = await import('node:path');
  const os = await import('node:os');
  const schemaPath = path.join(os.tmpdir(), 'spawn-test-schema.json');
  const instancePath = path.join(os.tmpdir(), 'spawn-test-instance.json');
  fs.writeFileSync(schemaPath, JSON.stringify({
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "string"
  }));
  fs.writeFileSync(instancePath, JSON.stringify("hello"));
  const result = await spawn(['validate', schemaPath, instancePath],
    { json: true });
  assert.strictEqual(result.code, 0);
  assert.deepStrictEqual(result.stdout, { valid: true });
  fs.unlinkSync(schemaPath);
  fs.unlinkSync(instancePath);
});

test('spawn without json option returns stdout as string', async () => {
  const result = await spawn(['--version']);
  assert.strictEqual(result.code, 0);
  assert.strictEqual(typeof result.stdout, 'string');
});
