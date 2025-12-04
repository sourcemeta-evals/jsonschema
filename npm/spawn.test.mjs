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

test('spawn with json option passes --json flag and parses output', async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'jsonschema-test-'));
  const schemaPath = path.join(tmpDir, 'schema.json');
  fs.writeFileSync(schemaPath, JSON.stringify({
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://example.com",
    "type": "string"
  }));

  try {
    const result = await spawn(['inspect', schemaPath], { json: true });
    assert.strictEqual(result.code, 0);
    assert.strictEqual(typeof result.stdout, 'object');
    assert.ok(result.stdout.locations);
    assert.ok(result.stdout.references);
  } finally {
    fs.rmSync(tmpDir, { recursive: true });
  }
});

test('spawn with json option returns string if JSON parsing fails', async () => {
  // --version does not output JSON, so parsing should fail gracefully
  const result = await spawn(['--version'], { json: true });
  assert.strictEqual(result.code, 0);
  // stdout should remain a string since it's not valid JSON
  assert.strictEqual(typeof result.stdout, 'string');
});

test('spawn without json option returns string stdout', async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'jsonschema-test-'));
  const schemaPath = path.join(tmpDir, 'schema.json');
  fs.writeFileSync(schemaPath, JSON.stringify({
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://example.com",
    "type": "string"
  }));

  try {
    // Without json option, stdout should be a string even for inspect command
    const result = await spawn(['inspect', schemaPath]);
    assert.strictEqual(result.code, 0);
    assert.strictEqual(typeof result.stdout, 'string');
  } finally {
    fs.rmSync(tmpDir, { recursive: true });
  }
});
