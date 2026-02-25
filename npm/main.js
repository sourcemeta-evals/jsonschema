const fs = require('fs');
const os = require('os');
const path = require('path');
const childProcess = require('child_process');

const PLATFORM = os.platform() === 'win32' ? 'windows' : os.platform();
const ARCH = os.arch() === 'x64' ? 'x86_64' : os.arch();
const EXECUTABLE = PLATFORM === 'windows'
  ? path.join(__dirname, '..', 'build', 'github-releases', `jsonschema-${PLATFORM}-${ARCH}.exe`)
  : path.join(__dirname, '..', 'build', 'github-releases', `jsonschema-${PLATFORM}-${ARCH}`);

const spawn = function (argv = [], options = {}) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(EXECUTABLE)) {
      reject(new Error(
        `The JSON Schema CLI NPM package does not support ${os.platform()} for ${ARCH} yet`
      ));
      return;
    }

    if (PLATFORM === 'darwin') {
      childProcess.spawnSync('/usr/bin/xattr', [ '-c', EXECUTABLE ], {
        windowsHide: true,
        stdio: 'ignore'
      });
    }

    const child = childProcess.spawn(EXECUTABLE, argv, {
      windowsHide: true,
      ...options
    });

    const stdout = [];
    const stderr = [];

    if (child.stdout) {
      child.stdout.on('data', (chunk) => {
        stdout.push(chunk);
      });
    }

    if (child.stderr) {
      child.stderr.on('data', (chunk) => {
        stderr.push(chunk);
      });
    }

    child.once('error', (error) => {
      reject(error);
    });

    child.once('close', (code, signal) => {
      resolve({
        code,
        signal,
        stdout: child.stdout ? Buffer.concat(stdout).toString() : undefined,
        stderr: child.stderr ? Buffer.concat(stderr).toString() : undefined
      });
    });
  });
};

module.exports = { spawn };
