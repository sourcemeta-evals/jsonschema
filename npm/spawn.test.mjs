import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';

import { spawn } from './main.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PLATFORM = os.platform() === 'win32' ? 'windows' : os.platform();
const ARCH = os.arch() === 'x64' ? 'x86_64' : os.arch();
const RELEASES_DIR = path.join(__dirname, '..', 'build', 'github-releases');
const EXECUTABLE_NAME = PLATFORM === 'windows'
  ? `jsonschema-${PLATFORM}-${ARCH}.exe`
  : `jsonschema-${PLATFORM}-${ARCH}`;
const EXECUTABLE = path.join(RELEASES_DIR, EXECUTABLE_NAME);

describe('spawn (ESM)', () => {
  let hadExecutable = false;

  before(() => {
    hadExecutable = fs.existsSync(EXECUTABLE);
    if (!hadExecutable) {
      fs.mkdirSync(RELEASES_DIR, { recursive: true });
      fs.writeFileSync(EXECUTABLE,
        '#!/bin/sh\necho "mock stdout"\necho "mock stderr" >&2\nexit 0\n');
      fs.chmodSync(EXECUTABLE, 0o755);
    }
  });

  after(() => {
    if (!hadExecutable) {
      fs.unlinkSync(EXECUTABLE);
    }
  });

  it('should export a spawn function', () => {
    assert.strictEqual(typeof spawn, 'function');
  });

  it('should resolve with stdout, stderr, and code', async () => {
    const result = await spawn([]);
    assert.strictEqual(typeof result.stdout, 'string');
    assert.strictEqual(typeof result.stderr, 'string');
    assert.strictEqual(typeof result.code, 'number');
  });

  it('should capture stdout when stdio is not inherited', async () => {
    const result = await spawn([]);
    assert.ok(result.stdout.length > 0);
  });

  it('should capture stderr when stdio is not inherited', async () => {
    const result = await spawn([]);
    assert.ok(result.stderr.length > 0);
  });

  it('should return code zero on success', async () => {
    const result = await spawn([]);
    assert.strictEqual(result.code, 0);
  });

  it('should accept options like child_process.spawn', async () => {
    const result = await spawn([], { windowsHide: true });
    assert.strictEqual(typeof result.code, 'number');
  });

  it('should handle stdio inherit option', async () => {
    const result = await spawn([], { stdio: 'inherit' });
    assert.strictEqual(typeof result.code, 'number');
    assert.strictEqual(result.stdout, '');
    assert.strictEqual(result.stderr, '');
  });
});

describe('spawn missing executable (ESM)', () => {
  it('should reject when executable does not exist', async () => {
    const backup = EXECUTABLE + '.backup';
    const existed = fs.existsSync(EXECUTABLE);
    if (existed) {
      fs.renameSync(EXECUTABLE, backup);
    }

    try {
      await assert.rejects(
        () => spawn([]),
        (error) => {
          assert.ok(error instanceof Error);
          assert.ok(error.message.includes('does not support'));
          return true;
        }
      );
    } finally {
      if (existed) {
        fs.renameSync(backup, EXECUTABLE);
      }
    }
  });
});
