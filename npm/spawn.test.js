const test = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const fs = require('node:fs');
const child_process = require('node:child_process');

const { spawn } = require('./main');

test('spawn forwards arguments and collects output', async (t) => {
  const originalExistsSync = fs.existsSync;
  const originalSpawn = child_process.spawn;
  const originalSpawnSync = child_process.spawnSync;

  t.after(() => {
    fs.existsSync = originalExistsSync;
    child_process.spawn = originalSpawn;
    child_process.spawnSync = originalSpawnSync;
  });

  let invocation;
  fs.existsSync = () => true;
  child_process.spawnSync = () => ({ status: 0 });
  child_process.spawn = (executable, args, options) => {
    invocation = { executable, args, options };

    const subprocess = new EventEmitter();
    subprocess.stdout = new EventEmitter();
    subprocess.stderr = new EventEmitter();

    process.nextTick(() => {
      subprocess.stdout.emit('data', 'hello');
      subprocess.stderr.emit('data', Buffer.from('world'));
      subprocess.emit('close', 12, null);
    });

    return subprocess;
  };

  const result = await spawn(['inspect', 'schema.json'], { stdio: 'pipe' });

  assert.equal(result.code, 12);
  assert.equal(result.stdout, 'hello');
  assert.equal(result.stderr, 'world');
  assert.equal(invocation.args[0], 'inspect');
  assert.equal(invocation.args[1], 'schema.json');
  assert.equal(invocation.options.stdio, 'pipe');
  assert.equal(invocation.options.windowsHide, true);
  assert.match(invocation.executable, /build[\\/]github-releases[\\/]jsonschema-/);
});

test('spawn rejects if the executable does not exist', async (t) => {
  const originalExistsSync = fs.existsSync;

  t.after(() => {
    fs.existsSync = originalExistsSync;
  });

  fs.existsSync = () => false;

  await assert.rejects(() => spawn(['inspect', 'schema.json']), /does not support/);
});
