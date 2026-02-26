import test from 'node:test';
import assert from 'node:assert';
import { EventEmitter } from 'node:events';
import childProcess from 'node:child_process';
import fs from 'node:fs';
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

test('spawn json option appends --json and parses stdout', async (t) => {
  t.mock.method(fs, 'existsSync', () => true);
  t.mock.method(childProcess, 'spawnSync', () => ({ status: 0 }));
  t.mock.method(childProcess, 'spawn', (_command, args) => {
    const process = new EventEmitter();
    process.stdout = new EventEmitter();
    process.stderr = new EventEmitter();

    queueMicrotask(() => {
      process.stdout.emit('data', '{"ok":true}');
      process.emit('close', 0);
    });

    process.spawnedArgs = args;
    return process;
  });

  const result = await spawn(['validate'], { json: true });
  assert.deepStrictEqual(result.stdout, { ok: true });
  assert.deepStrictEqual(childProcess.spawn.mock.calls[0].arguments[1], ['validate', '--json']);
});

test('spawn json option avoids duplicate --json flags', async (t) => {
  t.mock.method(fs, 'existsSync', () => true);
  t.mock.method(childProcess, 'spawnSync', () => ({ status: 0 }));
  t.mock.method(childProcess, 'spawn', (_command, args) => {
    const process = new EventEmitter();
    process.stdout = new EventEmitter();
    process.stderr = new EventEmitter();

    queueMicrotask(() => {
      process.stdout.emit('data', '[]');
      process.emit('close', 0);
    });

    return process;
  });

  await spawn(['validate', '--json'], { json: true });
  assert.deepStrictEqual(childProcess.spawn.mock.calls[0].arguments[1], ['validate', '--json']);
});
