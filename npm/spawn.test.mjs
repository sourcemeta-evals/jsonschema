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

test('spawn with json option passes --json flag and parses stdout', async () => {
  const fs = await import('node:fs');
  const os = await import('node:os');
  const path = await import('node:path');

  // Create a temporary schema file
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
    assert.ok(result.stdout !== null);
  } finally {
    fs.unlinkSync(schemaPath);
    fs.rmdirSync(tmpDir);
  }
});

test('spawn without json option returns raw stdout string', async () => {
  const fs = await import('node:fs');
  const os = await import('node:os');
  const path = await import('node:path');

  // Create a temporary schema file
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'jsonschema-test-'));
  const schemaPath = path.join(tmpDir, 'schema.json');
  fs.writeFileSync(schemaPath, JSON.stringify({
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://example.com",
    "type": "string"
  }));

  try {
    const result = await spawn(['inspect', schemaPath]);
    assert.strictEqual(result.code, 0);
    assert.strictEqual(typeof result.stdout, 'string');
  } finally {
    fs.unlinkSync(schemaPath);
    fs.rmdirSync(tmpDir);
  }
});

test('spawn with json option returns raw stdout when parsing fails', async () => {
  // --version returns plain text, not JSON, so parsing should fail gracefully
  const result = await spawn(['--version'], { json: true });
  assert.strictEqual(result.code, 0);
  // Should return the raw string since it's not valid JSON
  assert.strictEqual(typeof result.stdout, 'string');
});
