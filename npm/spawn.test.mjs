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

test('spawn with json option parses stdout as object', async () => {
  const fs = await import('node:fs');
  const os = await import('node:os');
  const path = await import('node:path');

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'jsonschema-test-'));

  fs.writeFileSync(path.join(tmp, 'schema.json'), JSON.stringify({
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://example.com",
    "properties": {
      "foo": { "type": "string" }
    }
  }));

  fs.writeFileSync(path.join(tmp, 'instance.json'), JSON.stringify({
    "foo": "bar"
  }));

  const result = await spawn(
    ['validate', path.join(tmp, 'schema.json'), path.join(tmp, 'instance.json')],
    { json: true });
  assert.strictEqual(result.code, 0);
  assert.strictEqual(typeof result.stdout, 'object');
  assert.strictEqual(result.stdout.valid, true);

  fs.rmSync(tmp, { recursive: true });
});

test('spawn without json option returns stdout as string', async () => {
  const result = await spawn(['--version']);
  assert.strictEqual(result.code, 0);
  assert.strictEqual(typeof result.stdout, 'string');
});

test('spawn with json option does not pass json to child_process', async () => {
  const fs = await import('node:fs');
  const os = await import('node:os');
  const path = await import('node:path');

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'jsonschema-test-'));

  fs.writeFileSync(path.join(tmp, 'schema.json'), JSON.stringify({
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://example.com",
    "properties": {
      "foo": { "type": "string" }
    }
  }));

  fs.writeFileSync(path.join(tmp, 'instance.json'), JSON.stringify({
    "foo": "bar"
  }));

  const result = await spawn(
    ['validate', path.join(tmp, 'schema.json'), path.join(tmp, 'instance.json')],
    { json: true });
  assert.strictEqual(result.code, 0);
  assert.ok(Array.isArray(result.stdout.annotations));

  fs.rmSync(tmp, { recursive: true });
});
