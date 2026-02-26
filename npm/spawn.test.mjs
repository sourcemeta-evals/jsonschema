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
  const tmpDir = os.default.tmpdir();
  const schemaPath = path.default.join(tmpDir, 'test_spawn_json.json');
  fs.default.writeFileSync(schemaPath, JSON.stringify({
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "type": "string"
  }));

  try {
    const result = await spawn(['lint', schemaPath], { json: true });
    assert.strictEqual(result.code, 0);
    assert.strictEqual(typeof result.stdout, 'object');
    assert.strictEqual(result.stdout.valid, true);
  } finally {
    fs.default.unlinkSync(schemaPath);
  }
});

test('spawn without json option returns stdout as string', async () => {
  const result = await spawn(['--version']);
  assert.strictEqual(result.code, 0);
  assert.strictEqual(typeof result.stdout, 'string');
});

test('spawn with json option does not pass json to child process options', async () => {
  const fs = await import('node:fs');
  const path = await import('node:path');
  const os = await import('node:os');
  const tmpDir = os.default.tmpdir();
  const schemaPath = path.default.join(tmpDir, 'test_spawn_json2.json');
  fs.default.writeFileSync(schemaPath, JSON.stringify({
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "type": "string"
  }));

  try {
    const result = await spawn(['lint', schemaPath], { json: true });
    assert.strictEqual(result.code, 0);
    assert.ok(Array.isArray(result.stdout.errors));
  } finally {
    fs.default.unlinkSync(schemaPath);
  }
});
