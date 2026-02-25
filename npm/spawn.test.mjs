import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, before, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { spawn } from './main.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const platform = os.platform() === 'win32' ? 'windows' : os.platform();
const arch = os.arch() === 'x64' ? 'x86_64' : os.arch();
const executable = platform === 'windows'
  ? path.join(__dirname, '..', 'build', 'github-releases', `jsonschema-${platform}-${arch}.exe`)
  : path.join(__dirname, '..', 'build', 'github-releases', `jsonschema-${platform}-${arch}`);
const backup = `${executable}.backup`;

const writeFakeExecutable = function () {
  if (platform === 'windows') {
    fs.writeFileSync(executable, [
      '@echo off',
      'echo stdout:%*',
      'echo stderr:%* 1>&2',
      'exit /b 5'
    ].join('\r\n'));
    return;
  }

  fs.writeFileSync(executable, [
    '#!/usr/bin/env node',
    'process.stdout.write(`stdout:${process.argv.slice(2).join(",")}`);',
    'process.stderr.write(`stderr:${process.argv.slice(2).join(",")}`);',
    'process.exit(5);'
  ].join('\n'));
  fs.chmodSync(executable, 0o755);
};

before(() => {
  fs.mkdirSync(path.dirname(executable), { recursive: true });

  if (fs.existsSync(backup)) {
    fs.rmSync(backup, { force: true });
  }

  if (fs.existsSync(executable)) {
    fs.copyFileSync(executable, backup);
  }

  writeFakeExecutable();
});

after(() => {
  if (fs.existsSync(backup)) {
    fs.copyFileSync(backup, executable);
    fs.rmSync(backup, { force: true });
    return;
  }

  if (fs.existsSync(executable)) {
    fs.rmSync(executable, { force: true });
  }
});

test('spawn supports ESM imports', async () => {
  const result = await spawn([ 'inspect', 'schema.json' ]);
  assert.equal(result.code, 5);
  assert.match(result.stdout, /^stdout:inspect,schema\.json$/);
  assert.match(result.stderr, /^stderr:inspect,schema\.json$/);
});
