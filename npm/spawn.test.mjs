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

const fixture = '#!/bin/sh\n' +
  'echo "stdout:$*"\n' +
  'echo "stderr:$*" 1>&2\n' +
  'exit 3\n';

test.before(() => {
  fs.mkdirSync(path.dirname(executable), { recursive: true });
  fs.writeFileSync(executable, fixture);
  fs.chmodSync(executable, 0o755);
});

test('spawn supports ESM named import usage', async () => {
  const result = await spawn([ 'version' ], { stdio: 'ignore' });

  assert.equal(result.code, 3);
  assert.equal(result.signal, null);
  assert.equal(result.stdout, '');
  assert.equal(result.stderr, '');
});
