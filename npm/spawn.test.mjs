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
  const path = await import('node:path');
  const os = await import('node:os');

  const tmpDir = os.tmpdir();
  const schemaPath = path.join(tmpDir, 'test-schema-json-option.json');
  const schema = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "type": "string"
  };
  fs.writeFileSync(schemaPath, JSON.stringify(schema));

  try {
    const result = await spawn(['inspect', schemaPath], { json: true });
    assert.strictEqual(result.code, 0);
    assert.strictEqual(typeof result.stdout, 'object');
    assert.ok(result.stdout.locations);
    assert.ok(result.stdout.references);
  } finally {
    fs.unlinkSync(schemaPath);
  }
});

test('spawn with json option returns raw stdout on parse failure', async () => {
  const result = await spawn(['--version'], { json: true });
  assert.strictEqual(result.code, 0);
  assert.strictEqual(typeof result.stdout, 'string');
});

test('spawn without json option returns raw stdout', async () => {
  const fs = await import('node:fs');
  const path = await import('node:path');
  const os = await import('node:os');

  const tmpDir = os.tmpdir();
  const schemaPath = path.join(tmpDir, 'test-schema-no-json.json');
  const schema = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "type": "string"
  };
  fs.writeFileSync(schemaPath, JSON.stringify(schema));

  try {
    const result = await spawn(['inspect', schemaPath, '--json']);
    assert.strictEqual(result.code, 0);
    assert.strictEqual(typeof result.stdout, 'string');
    const parsed = JSON.parse(result.stdout);
    assert.ok(parsed.locations);
  } finally {
    fs.unlinkSync(schemaPath);
  }
});
