import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs/promises';
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

test('spawn parses JSON output when json option is enabled', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'jsonschema-'));
  const schema = path.join(directory, 'schema.json');
  const instance = path.join(directory, 'instance.json');

  try {
    await fs.writeFile(schema, JSON.stringify({
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: { foo: { type: 'string' } }
    }));
    await fs.writeFile(instance, JSON.stringify({ foo: 'bar' }));

    const result = await spawn(['validate', schema, instance], { json: true });
    assert.strictEqual(result.code, 0);
    assert.strictEqual(typeof result.stdout, 'object');
    assert.strictEqual(result.stdout.valid, true);
    assert.ok(Array.isArray(result.stdout.annotations));
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
});
