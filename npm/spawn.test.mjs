import test from 'node:test';
import assert from 'node:assert';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { spawn } = require('./main.js');

test('spawn returns version with --version flag (ESM)', async () => {
  const result = await spawn(['--version']);
  assert.strictEqual(result.code, 0);
  assert.match(result.stdout, /\d+\.\d+\.\d+/);
});

test('spawn returns help with --help flag (ESM)', async () => {
  const result = await spawn(['--help']);
  assert.strictEqual(result.code, 0);
  assert.ok(result.stdout.length > 0);
});

test('spawn inspect command works with valid schema (ESM)', async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'jsonschema-test-'));
  const schemaPath = path.join(tmpDir, 'schema.json');
  fs.writeFileSync(schemaPath, JSON.stringify({
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "type": "object"
  }));

  try {
    const result = await spawn(['inspect', schemaPath]);
    assert.strictEqual(result.code, 0);
    assert.ok(result.stdout.length > 0);
  } finally {
    fs.rmSync(tmpDir, { recursive: true });
  }
});

test('spawn returns non-zero code for invalid command (ESM)', async () => {
  const result = await spawn(['invalid-command-that-does-not-exist']);
  assert.notStrictEqual(result.code, 0);
});

test('spawn with stdio inherit does not capture output (ESM)', async () => {
  const result = await spawn(['--version'], { stdio: 'inherit' });
  assert.strictEqual(result.code, 0);
  assert.strictEqual(result.stdout, '');
  assert.strictEqual(result.stderr, '');
});
