import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
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

test('spawn with json option passes --json flag and parses stdout', async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'jsonschema-test-'));
  const schemaPath = path.join(tmpDir, 'schema.json');

  try {
    fs.writeFileSync(schemaPath, JSON.stringify({
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "$id": "https://example.com",
      "type": "string"
    }));

    const result = await spawn(['inspect', schemaPath], { json: true });
    assert.strictEqual(result.code, 0);
    assert.strictEqual(typeof result.stdout, 'object');
    assert.ok(result.stdout.locations);
    assert.ok(result.stdout.references);
  } finally {
    fs.rmSync(tmpDir, { recursive: true });
  }
});

test('spawn without json option returns stdout as string', async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'jsonschema-test-'));
  const schemaPath = path.join(tmpDir, 'schema.json');

  try {
    fs.writeFileSync(schemaPath, JSON.stringify({
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "$id": "https://example.com",
      "type": "string"
    }));

    const result = await spawn(['inspect', schemaPath]);
    assert.strictEqual(result.code, 0);
    assert.strictEqual(typeof result.stdout, 'string');
    assert.ok(result.stdout.includes('RESOURCE'));
  } finally {
    fs.rmSync(tmpDir, { recursive: true });
  }
});

test('spawn with json option keeps stdout as string when parsing fails', async () => {
  const result = await spawn(['--version'], { json: true });
  assert.strictEqual(result.code, 0);
  // --version output is not valid JSON, so it should remain as string
  assert.strictEqual(typeof result.stdout, 'string');
  assert.strictEqual(result.stdout.trim(), packageJson.version);
});
