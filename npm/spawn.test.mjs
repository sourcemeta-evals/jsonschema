import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import fs from 'node:fs';
import child_process from 'node:child_process';
import { spawn } from './main.js';

const createSubprocess = function (code) {
  const subprocess = new EventEmitter();
  process.nextTick(() => {
    subprocess.emit('close', code, null);
  });
  return subprocess;
};

test('spawn supports ESM import and stdio inherit', async () => {
  const originalExistsSync = fs.existsSync;
  const originalSpawn = child_process.spawn;
  const originalSpawnSync = child_process.spawnSync;

  const calls = [];
  fs.existsSync = () => true;
  child_process.spawnSync = () => ({ status: 0 });
  child_process.spawn = (executable, argv, options) => {
    calls.push({ executable, argv, options });
    return createSubprocess(0);
  };

  try {
    const result = await spawn([ 'inspect', 'schema.json' ], { stdio: 'inherit' });

    assert.equal(calls.length, 1);
    assert.equal(calls[0].options.stdio, 'inherit');
    assert.equal(calls[0].options.windowsHide, true);
    assert.equal(result.stdout, '');
    assert.equal(result.stderr, '');
    assert.equal(result.code, 0);
  } finally {
    fs.existsSync = originalExistsSync;
    child_process.spawn = originalSpawn;
    child_process.spawnSync = originalSpawnSync;
  }
});
