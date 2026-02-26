const assert = require('node:assert/strict');
const test = require('node:test');
const { EventEmitter } = require('node:events');
const fs = require('node:fs');
const child_process = require('node:child_process');

const createSubprocess = function ({ stdout, stderr, code, signal }) {
  const subprocess = new EventEmitter();

  if (stdout !== null) {
    subprocess.stdout = new EventEmitter();
  }

  if (stderr !== null) {
    subprocess.stderr = new EventEmitter();
  }

  process.nextTick(() => {
    if (subprocess.stdout && typeof stdout === 'string') {
      subprocess.stdout.emit('data', Buffer.from(stdout));
    }

    if (subprocess.stderr && typeof stderr === 'string') {
      subprocess.stderr.emit('data', Buffer.from(stderr));
    }

    subprocess.emit('close', code, signal ?? null);
  });

  return subprocess;
};

test('spawn resolves with piped stdout and stderr in CommonJS', async () => {
  const originalExistsSync = fs.existsSync;
  const originalSpawn = child_process.spawn;
  const originalSpawnSync = child_process.spawnSync;

  const calls = [];
  fs.existsSync = () => true;
  child_process.spawnSync = () => ({ status: 0 });
  child_process.spawn = (executable, argv, options) => {
    calls.push({ executable, argv, options });
    return createSubprocess({
      stdout: 'hello\n',
      stderr: 'warn\n',
      code: 7
    });
  };

  try {
    const { spawn } = require('./main.js');
    const result = await spawn([ 'inspect', 'schema.json' ], { cwd: '/tmp/demo' });

    assert.equal(calls.length, 1);
    assert.deepEqual(calls[0].argv, [ 'inspect', 'schema.json' ]);
    assert.equal(calls[0].options.cwd, '/tmp/demo');
    assert.equal(calls[0].options.windowsHide, true);
    assert.equal(result.stdout, 'hello\n');
    assert.equal(result.stderr, 'warn\n');
    assert.equal(result.code, 7);
  } finally {
    fs.existsSync = originalExistsSync;
    child_process.spawn = originalSpawn;
    child_process.spawnSync = originalSpawnSync;
  }
});

test('spawn rejects when the packaged executable does not exist', async () => {
  const originalExistsSync = fs.existsSync;
  const originalSpawn = child_process.spawn;

  fs.existsSync = () => false;
  child_process.spawn = () => {
    throw new Error('spawn should not be called');
  };

  try {
    const { spawn } = require('./main.js');
    await assert.rejects(
      spawn([ 'version' ]),
      /does not support/);
  } finally {
    fs.existsSync = originalExistsSync;
    child_process.spawn = originalSpawn;
  }
});
