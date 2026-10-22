const os = require('os');
const path = require('path');
const fs = require('fs');
const child_process = require('child_process');

const PLATFORM = os.platform() === 'win32' ? 'windows' : os.platform();
const ARCH = os.arch() === 'x64' ? 'x86_64' : os.arch();
const EXTENSION = PLATFORM === 'windows' ? '.exe' : '';
const EXECUTABLE = path.join(__dirname, '..', 'build', 'github-releases',
  `jsonschema-${PLATFORM}-${ARCH}${EXTENSION}`);

function spawn(args, options = {}) {
  return new Promise((resolve, reject) => {
    // `child_process.spawn` lets options stand in for the arguments, but it
    // reads them from the first parameter and ignores the third, which would
    // drop the defaults merged in below. Resolve that here instead, and note
    // that a null or undefined `args` is an empty list rather than options
    if (typeof args === 'object' && args !== null && !Array.isArray(args)) {
      options = args;
      args = [];
    }

    if (!fs.existsSync(EXECUTABLE)) {
      reject(new Error(
        `The JSON Schema CLI NPM package does not support ${os.platform()} for ${os.arch()} yet. ` +
        'Please open a GitHub issue at https://github.com/sourcemeta/jsonschema'
      ));
      return;
    }

    if (PLATFORM === 'darwin') {
      child_process.spawnSync('/usr/bin/xattr', ['-c', EXECUTABLE], { stdio: 'inherit' });
    }

    const spawnOptions = {
      windowsHide: true,
      ...options
    };

    const process = child_process.spawn(EXECUTABLE, args, spawnOptions);

    let stdout = '';
    let stderr = '';

    if (process.stdout) {
      process.stdout.setEncoding('utf8');
      process.stdout.on('data', (data) => {
        stdout += data;
      });
    }

    if (process.stderr) {
      process.stderr.setEncoding('utf8');
      process.stderr.on('data', (data) => {
        stderr += data;
      });
    }

    process.on('error', (error) => {
      reject(error);
    });

    process.on('close', (code, signal) => {
      resolve({
        code: code,
        signal: signal,
        stdout: stdout,
        stderr: stderr
      });
    });
  });
}

module.exports = { spawn };
