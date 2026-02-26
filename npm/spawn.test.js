const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const fs = require('fs');
const os = require('os');

describe('CommonJS', function () {
  describe('spawn export', function () {
    it('should export a spawn function', function () {
      const main = require('./main.js');
      assert.strictEqual(typeof main.spawn, 'function');
    });

    it('should export the EXECUTABLE path', function () {
      const main = require('./main.js');
      assert.strictEqual(typeof main.EXECUTABLE, 'string');
      assert.ok(main.EXECUTABLE.length > 0);
    });
  });

  describe('spawn function', function () {
    const PLATFORM = os.platform() === 'win32' ? 'windows' : os.platform();
    const ARCH = os.arch() === 'x64' ? 'x86_64' : os.arch();
    const buildDir = path.join(__dirname, '..', 'build', 'github-releases');
    const executableName = PLATFORM === 'windows'
      ? `jsonschema-${PLATFORM}-${ARCH}.exe`
      : `jsonschema-${PLATFORM}-${ARCH}`;
    const executablePath = path.join(buildDir, executableName);
    let hadExecutable = false;

    before(function () {
      hadExecutable = fs.existsSync(executablePath);
    });

    describe('when executable is missing', function () {
      before(function () {
        if (fs.existsSync(executablePath)) {
          fs.renameSync(executablePath, executablePath + '.bak');
        }

        // Clear the require cache to pick up fresh state
        delete require.cache[require.resolve('./main.js')];
      });

      after(function () {
        if (fs.existsSync(executablePath + '.bak')) {
          fs.renameSync(executablePath + '.bak', executablePath);
        }
      });

      it('should reject with an error when the executable does not exist', async function () {
        const main = require('./main.js');
        delete require.cache[require.resolve('./main.js')];
        await assert.rejects(function () {
          return main.spawn(['--help'], {});
        }, function (error) {
          assert.ok(error instanceof Error);
          assert.ok(error.message.includes('does not support'));
          return true;
        });
      });
    });

    describe('when executable exists', function () {
      const mockScript = path.join(buildDir, executableName);

      before(function () {
        fs.mkdirSync(buildDir, { recursive: true });
        fs.writeFileSync(mockScript,
          '#!/bin/sh\necho "mock-stdout $@"\necho "mock-stderr $@" >&2\nexit 0\n');
        fs.chmodSync(mockScript, 0o755);

        // Clear the require cache to pick up fresh state
        delete require.cache[require.resolve('./main.js')];
      });

      after(function () {
        if (!hadExecutable) {
          fs.rmSync(mockScript, { force: true });
          // Clean up empty directories if we created them
          try {
            fs.rmdirSync(buildDir);
          } catch (_error) {
            // Directory not empty or doesn't exist, ignore
          }
        }

        delete require.cache[require.resolve('./main.js')];
      });

      it('should resolve with code, stdout, and stderr', async function () {
        const main = require('./main.js');
        const result = await main.spawn(['arg1', 'arg2'], {});
        assert.strictEqual(typeof result.code, 'number');
        assert.strictEqual(typeof result.stdout, 'string');
        assert.strictEqual(typeof result.stderr, 'string');
        assert.strictEqual(result.code, 0);
        assert.ok(result.stdout.includes('mock-stdout'));
        assert.ok(result.stderr.includes('mock-stderr'));
      });

      it('should pass arguments to the executable', async function () {
        const main = require('./main.js');
        const result = await main.spawn(['hello', 'world'], {});
        assert.ok(result.stdout.includes('hello'));
        assert.ok(result.stdout.includes('world'));
      });

      it('should support stdio inherit option', async function () {
        const main = require('./main.js');
        const result = await main.spawn(['test'], { stdio: 'inherit' });
        assert.strictEqual(result.code, 0);
        // When stdio is inherit, stdout/stderr are not captured
        assert.strictEqual(result.stdout, '');
        assert.strictEqual(result.stderr, '');
      });
    });
  });
});
