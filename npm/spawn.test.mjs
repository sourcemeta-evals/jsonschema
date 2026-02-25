import test from 'node:test';
import assert from 'node:assert';
import { EventEmitter } from 'node:events';
import { PassThrough } from 'node:stream';
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

test('spawn appends --json and parses stdout when json option is enabled', async () => {
  const originalSpawn = childProcess.spawn;
  const originalExistsSync = fs.existsSync;

  let observedArgs;

  childProcess.spawn = (_, args) => {
    observedArgs = args;

    const process = new EventEmitter();
    process.stdout = new PassThrough();
    process.stderr = new PassThrough();

    queueMicrotask(() => {
      process.stdout.end('{"hello":"world"}');
      process.emit('close', 0);
    });

    return process;
  };

  fs.existsSync = () => true;

  try {
    const result = await spawn(['fmt'], { json: true });
    assert.deepStrictEqual(observedArgs, ['fmt', '--json']);
    assert.deepStrictEqual(result.stdout, { hello: 'world' });
    assert.strictEqual(result.code, 0);
  } finally {
    childProcess.spawn = originalSpawn;
    fs.existsSync = originalExistsSync;
  }
});
