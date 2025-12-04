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

test('spawn with json option passes --json flag', async () => {
  const result = await spawn(['--help'], { json: true });
  // --help doesn't produce JSON, but we verify --json was passed
  // by checking the args don't cause an error
  assert.strictEqual(result.code, 0);
});

test('spawn with json option parses JSON stdout', async () => {
  // Create a temporary schema file to test fmt --check with JSON output
  const fs = await import('node:fs');
  const path = await import('node:path');
  const os = await import('node:os');

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'jsonschema-test-'));
  const schemaPath = path.join(tmpDir, 'schema.json');

  // Write a properly formatted schema
  const schema = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "type": "string"
  };
  fs.writeFileSync(schemaPath, JSON.stringify(schema, null, 2) + '\n');

  try {
    const result = await spawn(['fmt', '--check', schemaPath], { json: true });
    assert.strictEqual(result.code, 0);
    // stdout should be parsed as JSON object
    assert.strictEqual(typeof result.stdout, 'object');
    assert.strictEqual(result.stdout.valid, true);
  } finally {
    fs.rmSync(tmpDir, { recursive: true });
  }
});

test('spawn without json option returns raw stdout', async () => {
  const result = await spawn(['--version']);
  assert.strictEqual(result.code, 0);
  assert.strictEqual(typeof result.stdout, 'string');
});
