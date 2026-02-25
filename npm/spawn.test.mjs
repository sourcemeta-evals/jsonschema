import test from 'node:test';
import assert from 'node:assert';
import os from 'node:os';
import path from 'node:path';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
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

test('spawn appends --json and parses JSON output when requested', async () => {
  const temporary = await mkdtemp(path.join(os.tmpdir(), 'jsonschema-npm-'));

  try {
    const schemaPath = path.join(temporary, 'schema.json');
    await writeFile(schemaPath, JSON.stringify({
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'string'
    }));

    const result = await spawn(['inspect', schemaPath], { json: true });
    assert.strictEqual(result.code, 0);
    assert.strictEqual(typeof result.stdout, 'object');
    assert.ok(result.stdout);
    assert.ok('locations' in result.stdout);
    assert.strictEqual(result.stderr, '');
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
});
