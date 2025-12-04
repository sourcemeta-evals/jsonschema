import { spawn } from './main.js';
import { test } from 'node:test';
import assert from 'node:assert';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';

const PLATFORM = os.platform() === 'win32' ? 'windows' : os.platform();
const ARCH = os.arch() === 'x64' ? 'x86_64' : os.arch();
const EXECUTABLE = PLATFORM === 'windows'
  ? path.join(import.meta.dirname, '..', 'build', 'github-releases', `jsonschema-${PLATFORM}-${ARCH}.exe`)
  : path.join(import.meta.dirname, '..', 'build', 'github-releases', `jsonschema-${PLATFORM}-${ARCH}`);

const hasExecutable = fs.existsSync(EXECUTABLE);

test('spawn returns a promise', { skip: !hasExecutable }, async () => {
  const result = spawn(['--help']);
  assert.ok(result instanceof Promise);
  await result;
});

test('spawn resolves with code, stdout, and stderr', { skip: !hasExecutable }, async () => {
  const result = await spawn(['--help']);
  assert.strictEqual(typeof result.code, 'number');
  assert.strictEqual(typeof result.stdout, 'string');
  assert.strictEqual(typeof result.stderr, 'string');
});

test('spawn captures stdout when stdio is not inherit', { skip: !hasExecutable }, async () => {
  const result = await spawn(['--help']);
  assert.ok(result.stdout.length > 0);
  assert.strictEqual(result.code, 0);
});

test('spawn with stdio inherit returns empty stdout/stderr', { skip: !hasExecutable }, async () => {
  const result = await spawn(['--help'], { stdio: 'inherit' });
  assert.strictEqual(result.stdout, '');
  assert.strictEqual(result.stderr, '');
  assert.strictEqual(result.code, 0);
});

test('spawn returns non-zero code for invalid command', { skip: !hasExecutable }, async () => {
  const result = await spawn(['invalid-command']);
  assert.notStrictEqual(result.code, 0);
});

test('spawn rejects when executable does not exist', async () => {
  const originalPlatform = process.platform;
  const main = await import('./main.js');

  if (!hasExecutable) {
    await assert.rejects(
      () => main.spawn(['--help']),
      /does not support/
    );
  }
});
