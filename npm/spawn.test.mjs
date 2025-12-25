import { test, describe } from 'node:test';
import assert from 'node:assert';
import { spawn, getExecutablePath } from './main.mjs';
import path from 'path';
import fs from 'fs';
import os from 'os';

describe('ESM spawn tests', () => {
  test('spawn function is exported', () => {
    assert.strictEqual(typeof spawn, 'function');
  });

  test('getExecutablePath function is exported', () => {
    assert.strictEqual(typeof getExecutablePath, 'function');
  });

  test('getExecutablePath returns a string', () => {
    const execPath = getExecutablePath();
    assert.strictEqual(typeof execPath, 'string');
  });

  test('getExecutablePath returns path with correct platform suffix', () => {
    const execPath = getExecutablePath();
    const platform = os.platform() === 'win32' ? 'windows' : os.platform();
    const arch = os.arch() === 'x64' ? 'x86_64' : os.arch();
    assert.ok(execPath.includes(`jsonschema-${platform}-${arch}`));
  });

  test('spawn returns a promise', async () => {
    const result = spawn(['--help']);
    assert.ok(result instanceof Promise);
    try {
      await result;
    } catch (e) {
      // Expected when executable doesn't exist
    }
  });

  test('spawn rejects when executable does not exist', async () => {
    const execPath = getExecutablePath();
    if (!fs.existsSync(execPath)) {
      await assert.rejects(
        spawn(['--help']),
        /does not support/
      );
    }
  });

  test('spawn resolves with code, stdout, and stderr when executable exists', async () => {
    const execPath = getExecutablePath();
    if (fs.existsSync(execPath)) {
      const result = await spawn(['--help']);
      assert.strictEqual(typeof result.code, 'number');
      assert.strictEqual(typeof result.stdout, 'string');
      assert.strictEqual(typeof result.stderr, 'string');
    }
  });

  test('spawn with stdio inherit does not capture output', async () => {
    const execPath = getExecutablePath();
    if (fs.existsSync(execPath)) {
      const result = await spawn(['--help'], { stdio: 'inherit' });
      assert.strictEqual(typeof result.code, 'number');
      assert.strictEqual(result.stdout, '');
      assert.strictEqual(result.stderr, '');
    }
  });
});
