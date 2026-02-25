const os = require('os');
const path = require('path');
const fs = require('fs');
const child_process = require('child_process');

const PLATFORM = os.platform() === 'win32' ? 'windows' : os.platform();
const ARCH = os.arch() === 'x64' ? 'x86_64' : os.arch();
const EXECUTABLE = PLATFORM === 'windows'
  ? path.join(__dirname, '..', 'build', 'github-releases', `jsonschema-${PLATFORM}-${ARCH}.exe`)
  : path.join(__dirname, '..', 'build', 'github-releases', `jsonschema-${PLATFORM}-${ARCH}`);

const spawn = (args, options) => {
  if (!fs.existsSync(EXECUTABLE)) {
    return Promise.reject(new Error(
      `The JSON Schema CLI NPM package does not support ${os.platform()} for ${ARCH} yet. ` +
      'Please open a GitHub issue at https://github.com/sourcemeta/jsonschema'));
  }

  if (PLATFORM === 'darwin') {
    child_process.spawnSync('/usr/bin/xattr', ['-c', EXECUTABLE], { stdio: 'inherit' });
  }

  return new Promise((resolve, reject) => {
    const spawnOptions = Object.assign({}, options, {
      // Do not open a command prompt on spawning
      windowsHide: true
    });

    const useInheritStdio = spawnOptions.stdio === 'inherit';
    const child = child_process.spawn(EXECUTABLE, args || [], spawnOptions);

    let stdout = '';
    let stderr = '';

    if (!useInheritStdio) {
      if (child.stdout) {
        child.stdout.on('data', (data) => {
          stdout += data.toString();
        });
      }

      if (child.stderr) {
        child.stderr.on('data', (data) => {
          stderr += data.toString();
        });
      }
    }

    child.on('error', (error) => {
      reject(error);
    });

    child.on('close', (code) => {
      resolve({ stdout, stderr, code });
    });
  });
};

module.exports = { spawn };
