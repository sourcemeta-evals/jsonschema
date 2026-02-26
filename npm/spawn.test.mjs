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

test('spawn without json option returns string stdout', async () => {
  const result = await spawn(['--version']);
  assert.strictEqual(typeof result.stdout, 'string');
});

test('spawn with json option parses stdout as JSON', async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'jsonschema-test-'));
  try {
    const schemaPath = path.join(tmpDir, 'schema.json');
    const instancePath = path.join(tmpDir, 'instance.json');

    fs.writeFileSync(schemaPath, JSON.stringify({
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "$id": "https://example.com",
      "properties": {
        "foo": { "type": "string" }
      }
    }));

    fs.writeFileSync(instancePath, JSON.stringify({ "foo": "bar" }));

    const result = await spawn(
      ['validate', schemaPath, instancePath], { json: true });
    assert.strictEqual(result.code, 0);
    assert.strictEqual(typeof result.stdout, 'object');
    assert.strictEqual(result.stdout.valid, true);
  } finally {
    fs.rmSync(tmpDir, { recursive: true });
  }
});

test('spawn with json option does not pass json to child process options', async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'jsonschema-test-'));
  try {
    const schemaPath = path.join(tmpDir, 'schema.json');
    const instancePath = path.join(tmpDir, 'instance.json');

    fs.writeFileSync(schemaPath, JSON.stringify({
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "$id": "https://example.com",
      "properties": {
        "foo": { "type": "string" }
      }
    }));

    fs.writeFileSync(instancePath, JSON.stringify({ "foo": "bar" }));

    // Should not throw even with json option set
    const result = await spawn(
      ['validate', schemaPath, instancePath], { json: true });
    assert.strictEqual(result.code, 0);
  } finally {
    fs.rmSync(tmpDir, { recursive: true });
  }
});
