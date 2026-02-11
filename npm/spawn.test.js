const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const os = require('os');
const path = require('path');
const fs = require('fs');
const { spawn } = require('./main.js');

const PLATFORM = os.platform() === 'win32' ? 'windows' : os.platform();
const ARCH = os.arch() === 'x64' ? 'x86_64' : os.arch();
const BUILD_DIR = path.join(__dirname, '..', 'build', 'github-releases');
const EXECUTABLE = PLATFORM === 'windows'
  ? path.join(BUILD_DIR, `jsonschema-${PLATFORM}-${ARCH}.exe`)
  : path.join(BUILD_DIR, `jsonschema-${PLATFORM}-${ARCH}`);

describe('CommonJS', function () {
  describe('spawn with no executable', function () {
    let originalExecutable;

    before(function () {
      if (fs.existsSync(EXECUTABLE)) {
        originalExecutable = EXECUTABLE + '.bak';
        fs.renameSync(EXECUTABLE, originalExecutable);
      }
    });

    after(function () {
      if (originalExecutable && fs.existsSync(originalExecutable)) {
        fs.renameSync(originalExecutable, EXECUTABLE);
      }
    });

    it('should reject when the executable does not exist', async function () {
      if (fs.existsSync(EXECUTABLE)) {
        return;
      }

      await assert.rejects(function () {
        return spawn(['--help']);
      }, function (error) {
        assert.ok(error instanceof Error);
        assert.ok(error.message.includes('does not support'));
        return true;
      });
    });
  });

  describe('spawn with executable', function () {
    let created = false;

    before(function () {
      if (!fs.existsSync(EXECUTABLE)) {
        fs.mkdirSync(BUILD_DIR, { recursive: true });
        fs.writeFileSync(EXECUTABLE,
          '#!/bin/sh\necho "mock-stdout"\necho "mock-stderr" >&2\nexit 0\n');
        fs.chmodSync(EXECUTABLE, 0o755);
        created = true;
      }
    });

    after(function () {
      if (created && fs.existsSync(EXECUTABLE)) {
        fs.unlinkSync(EXECUTABLE);
      }
    });

    it('should resolve with code, stdout, and stderr', async function () {
      const result = await spawn([]);
      assert.strictEqual(typeof result.code, 'number');
      assert.strictEqual(typeof result.stdout, 'string');
      assert.strictEqual(typeof result.stderr, 'string');
    });

    it('should capture stdout', async function () {
      if (!created) {
        return;
      }

      const result = await spawn([]);
      assert.ok(result.stdout.includes('mock-stdout'));
    });

    it('should capture stderr', async function () {
      if (!created) {
        return;
      }

      const result = await spawn([]);
      assert.ok(result.stderr.includes('mock-stderr'));
    });

    it('should resolve with exit code 0', async function () {
      const result = await spawn([]);
      assert.strictEqual(result.code, 0);
    });

    it('should support stdio inherit option', async function () {
      const result = await spawn([], { stdio: 'inherit' });
      assert.strictEqual(result.code, 0);
      assert.strictEqual(result.stdout, '');
      assert.strictEqual(result.stderr, '');
    });

    it('should pass arguments to the executable', async function () {
      if (!created) {
        return;
      }

      const result = await spawn(['arg1', 'arg2']);
      assert.strictEqual(result.code, 0);
    });

    it('should default to empty args', async function () {
      const result = await spawn();
      assert.strictEqual(result.code, 0);
    });
  });
});
