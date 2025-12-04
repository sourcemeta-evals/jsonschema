const test = require('node:test');
const assert = require('node:assert');
const path = require('path');
const fs = require('fs');
const os = require('os');

const { spawn } = require('./main.js');

test('spawn returns version with --version flag', async () => {
  const result = await spawn(['--version']);
  assert.strictEqual(result.code, 0);
  assert.match(result.stdout, /\d+\.\d+\.\d+/);
});

test('spawn returns help with --help flag', async () => {
  const result = await spawn(['--help']);
  assert.strictEqual(result.code, 0);
  assert.ok(result.stdout.length > 0);
});

test('spawn inspect command works with valid schema', async () => {
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

test('spawn returns non-zero code for invalid command', async () => {
  const result = await spawn(['invalid-command-that-does-not-exist']);
  assert.notStrictEqual(result.code, 0);
});

test('spawn with stdio inherit does not capture output', async () => {
  const result = await spawn(['--version'], { stdio: 'inherit' });
  assert.strictEqual(result.code, 0);
  assert.strictEqual(result.stdout, '');
  assert.strictEqual(result.stderr, '');
});
