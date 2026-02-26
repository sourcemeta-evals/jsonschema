const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('./main.js');

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

test('spawn captures stdout and stderr by default (CommonJS)', async () => {
  prepareStub();
  const result = await spawn([ 'alpha', 'beta' ]);
  assert.equal(result.stdout, 'stdout:alpha\n');
  assert.equal(result.stderr, 'stderr:beta\n');
  assert.equal(result.code, 7);
});

test('spawn supports stdio inherit (CommonJS)', async () => {
  prepareStub();
  const result = await spawn([ 'gamma', 'delta' ], { stdio: 'inherit' });
  assert.equal(result.code, 7);
  assert.equal(result.stdout, undefined);
  assert.equal(result.stderr, undefined);
});
