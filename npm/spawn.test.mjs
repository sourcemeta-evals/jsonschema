import test from 'node:test';
import assert from 'node:assert';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs/promises';
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

test('spawn supports json option', async () => {
  const tmpdir = await fs.mkdtemp(path.join(os.tmpdir(), 'jsonschema-npm-'));
  const schemaPath = path.join(tmpdir, 'schema.json');
  const instancePath = path.join(tmpdir, 'instance.json');

  await fs.writeFile(schemaPath, JSON.stringify({
    type: 'object',
    properties: {
      name: { type: 'string' }
    },
    required: ['name']
  }));
  await fs.writeFile(instancePath, JSON.stringify({ name: 'Devin' }));

  try {
    const result = await spawn(['validate', schemaPath, instancePath], { json: true });
    assert.strictEqual(result.code, 0);
    assert.strictEqual(typeof result.stdout, 'object');
    assert.notStrictEqual(result.stdout, null);
    assert.strictEqual(result.stderr, '');
  } finally {
    await fs.rm(tmpdir, { recursive: true, force: true });
  }
});
