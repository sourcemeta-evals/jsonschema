const { describe, it } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const fs = require('fs');
const os = require('os');
const child_process = require('child_process');

const { spawn } = require('./main');

const PLATFORM = os.platform() === 'win32' ? 'windows' : os.platform();
const ARCH = os.arch() === 'x64' ? 'x86_64' : os.arch();
const EXECUTABLE = PLATFORM === 'windows'
  ? path.join(__dirname, '..', 'build', 'github-releases', `jsonschema-${PLATFORM}-${ARCH}.exe`)
  : path.join(__dirname, '..', 'build', 'github-releases', `jsonschema-${PLATFORM}-${ARCH}`);

describe('spawn (CommonJS)', function () {
  it('is a function', function () {
    assert.strictEqual(typeof spawn, 'function');
  });

  it('returns a promise', function () {
    const result = spawn([]);
    assert.ok(result instanceof Promise);
    result.catch(function () {});
  });

  it('rejects if executable is missing', async function () {
    if (fs.existsSync(EXECUTABLE)) {
      return;
    }

    await assert.rejects(function () {
      return spawn(['--help']);
    }, function (error) {
      assert.ok(error.message.includes('does not support'));
      return true;
    });
  });

  it('resolves with code, stdout, and stderr', async function () {
    if (!fs.existsSync(EXECUTABLE)) {
      return;
    }

    const result = await spawn([]);
    assert.strictEqual(typeof result.code, 'number');
    assert.strictEqual(typeof result.stdout, 'string');
    assert.strictEqual(typeof result.stderr, 'string');
  });

  it('captures stdout when stdio is not inherited', async function () {
    if (!fs.existsSync(EXECUTABLE)) {
      return;
    }

    const result = await spawn([]);
    assert.strictEqual(typeof result.stdout, 'string');
  });

  it('supports options parameter', async function () {
    if (!fs.existsSync(EXECUTABLE)) {
      return;
    }

    const result = await spawn([], { windowsHide: true });
    assert.strictEqual(typeof result.code, 'number');
  });

  it('passes arguments to the executable', async function () {
    if (!fs.existsSync(EXECUTABLE)) {
      return;
    }

    const result = await spawn(['--help']);
    assert.strictEqual(typeof result.code, 'number');
  });

  it('can be imported from the package main entry', function () {
    const main = require('./main');
    assert.strictEqual(typeof main.spawn, 'function');
  });
});
