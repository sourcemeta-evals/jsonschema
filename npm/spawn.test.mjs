import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import childProcess from 'node:child_process';
import { EventEmitter } from 'node:events';

import { spawn } from './main.js';

test('spawn can be imported from ESM and collect process output', async (t) => {
  const originalExistsSync = fs.existsSync;
  const originalSpawn = childProcess.spawn;
  const originalSpawnSync = childProcess.spawnSync;

  t.after(() => {
    fs.existsSync = originalExistsSync;
    childProcess.spawn = originalSpawn;
    childProcess.spawnSync = originalSpawnSync;
  });

  fs.existsSync = () => true;
  childProcess.spawnSync = () => ({ status: 0 });
  childProcess.spawn = () => {
    const subprocess = new EventEmitter();
    subprocess.stdout = new EventEmitter();
    subprocess.stderr = new EventEmitter();

    process.nextTick(() => {
      subprocess.stdout.emit('data', 'esm');
      subprocess.stderr.emit('data', 'test');
      subprocess.emit('close', 0, null);
    });

    return subprocess;
  };

  const result = await spawn(['help'], { stdio: 'pipe' });

  assert.equal(result.code, 0);
  assert.equal(result.stdout, 'esm');
  assert.equal(result.stderr, 'test');
});
