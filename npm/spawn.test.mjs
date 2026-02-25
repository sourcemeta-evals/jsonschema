import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
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
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'jsonschema-test-'));
  const schemaPath = path.join(tmpDir, 'schema.json');
  const instancePath = path.join(tmpDir, 'instance.json');
  fs.writeFileSync(schemaPath, JSON.stringify({
    '$schema': 'http://json-schema.org/draft-07/schema#',
    'type': 'string'
  }));
  fs.writeFileSync(instancePath, JSON.stringify('hello'));

  const result = await spawn(['validate', schemaPath, instancePath],
    { json: true });
  assert.strictEqual(result.code, 0);
  assert.strictEqual(typeof result.stdout, 'object');
  assert.ok(result.stdout !== null);
  assert.strictEqual(result.stdout.valid, true);

  fs.rmSync(tmpDir, { recursive: true });
});

test('spawn without json option returns stdout as string', async () => {
  const result = await spawn(['--version']);
  assert.strictEqual(result.code, 0);
  assert.strictEqual(typeof result.stdout, 'string');
});

test('spawn with json false does not pass --json', async () => {
  const result = await spawn(['--help'], { json: false });
  assert.strictEqual(result.code, 0);
  assert.strictEqual(typeof result.stdout, 'string');
  assert.match(result.stdout, /Usage:/);
});
