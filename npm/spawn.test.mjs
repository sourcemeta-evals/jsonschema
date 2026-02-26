import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from './main.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const platform = os.platform() === 'win32' ? 'windows' : os.platform();
const arch = os.arch() === 'x64' ? 'x86_64' : os.arch();
const executable = platform === 'windows'
  ? path.join(__dirname, '..', 'build', 'github-releases', `jsonschema-${platform}-${arch}.exe`)
  : path.join(__dirname, '..', 'build', 'github-releases', `jsonschema-${platform}-${arch}`);

const prepareStub = function () {
  fs.mkdirSync(path.dirname(executable), { recursive: true });

  if (platform === 'windows') {
    fs.writeFileSync(executable, '@echo off\r\necho stdout:%1\r\n>&2 echo stderr:%2\r\nexit /b 7\r\n');
  } else {
    fs.writeFileSync(executable, '#!/bin/sh\nprintf "stdout:%s\\n" "$1"\nprintf "stderr:%s\\n" "$2" 1>&2\nexit 7\n');
    fs.chmodSync(executable, 0o755);
  }
};

test('spawn supports ESM import', async () => {
  prepareStub();
  const result = await spawn([ 'one', 'two' ]);
  assert.equal(result.stdout, 'stdout:one\n');
  assert.equal(result.stderr, 'stderr:two\n');
  assert.equal(result.code, 7);
});
