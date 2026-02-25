import test from 'node:test';
import assert from 'node:assert';
import os from 'node:os';
import path from 'node:path';
import { mkdtemp, writeFile } from 'node:fs/promises';
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

test('spawn appends --json and parses stdout when json is true', async () => {
  const workspace = await mkdtemp(path.join(os.tmpdir(), 'jsonschema-spawn-'));
  const schemaPath = path.join(workspace, 'schema.json');
  const instancePath = path.join(workspace, 'instance.json');

  await writeFile(schemaPath, JSON.stringify({
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    type: 'integer'
  }));
  await writeFile(instancePath, '1');

  const result = await spawn(['validate', schemaPath, instancePath], { json: true });
  assert.strictEqual(result.code, 0);
  assert.deepStrictEqual(result.stdout, { valid: true });
});

test('spawn rejects if json output cannot be parsed', async () => {
  await assert.rejects(spawn(['--version'], { json: true }), SyntaxError);
});
