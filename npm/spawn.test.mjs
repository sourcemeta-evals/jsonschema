import test from 'node:test';
import assert from 'node:assert';
import { EventEmitter } from 'node:events';
import { createRequire } from 'node:module';
import { spawn } from './main.js';
import packageJson from '../package.json' with { type: 'json' };

const require = createRequire(import.meta.url);
const nodeFs = require('node:fs');
const childProcess = require('node:child_process');

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

test('spawn adds --json and parses JSON output when json option is set', async () => {
  const originalExistsSync = nodeFs.existsSync;
  const originalSpawn = childProcess.spawn;
  let capturedArgs;
  let capturedOptions;

  nodeFs.existsSync = () => true;
  childProcess.spawn = (executable, args, options) => {
    capturedArgs = args;
    capturedOptions = options;

    const subprocess = new EventEmitter();
    subprocess.stdout = new EventEmitter();
    subprocess.stderr = new EventEmitter();

    process.nextTick(() => {
      subprocess.stdout.emit('data', Buffer.from('{"valid":true}'));
      subprocess.emit('close', 0);
    });

    return subprocess;
  };

  try {
    const result = await spawn(['validate', 'schema.json', 'instance.json'], {
      json: true,
      cwd: '/tmp'
    });

    assert.deepStrictEqual(capturedArgs, ['validate', 'schema.json', 'instance.json', '--json']);
    assert.strictEqual(capturedOptions.windowsHide, true);
    assert.strictEqual(capturedOptions.cwd, '/tmp');
    assert.deepStrictEqual(result.stdout, { valid: true });
    assert.strictEqual(result.code, 0);
  } finally {
    nodeFs.existsSync = originalExistsSync;
    childProcess.spawn = originalSpawn;
  }
});
