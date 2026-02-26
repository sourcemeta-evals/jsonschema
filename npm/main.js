const os = require('os');
const path = require('path');
const fs = require('fs');
const child_process = require('child_process');

const PLATFORM = os.platform() === 'win32' ? 'windows' : os.platform();
const ARCH = os.arch() === 'x64' ? 'x86_64' : os.arch();
const EXECUTABLE = PLATFORM === 'windows'
  ? path.join(__dirname, '..', 'build', 'github-releases', `jsonschema-${PLATFORM}-${ARCH}.exe`)
  : path.join(__dirname, '..', 'build', 'github-releases', `jsonschema-${PLATFORM}-${ARCH}`);

function spawn(args, options) {
  return new Promise(function (resolve, reject) {
    if (!fs.existsSync(EXECUTABLE)) {
      reject(new Error(
        `The JSON Schema CLI NPM package does not support ${os.platform()} for ${ARCH} yet. ` +
        'Please open a GitHub issue at https://github.com/sourcemeta/jsonschema'
      ));
      return;
    }

    if (PLATFORM === 'darwin') {
      child_process.spawnSync('/usr/bin/xattr', ['-c', EXECUTABLE], { stdio: 'ignore' });
    }

    const spawnOptions = Object.assign({}, options, {
      // Do not open a command prompt on spawning
      windowsHide: true
    });

    const child = child_process.spawn(EXECUTABLE, args, spawnOptions);

    let stdout = '';
    let stderr = '';

    if (child.stdout) {
      child.stdout.on('data', function (data) {
        stdout += data.toString();
      });
    }

    if (child.stderr) {
      child.stderr.on('data', function (data) {
        stderr += data.toString();
      });
    }

    child.on('error', function (error) {
      reject(error);
    });

    child.on('close', function (code) {
      resolve({ code: code, stdout: stdout, stderr: stderr });
    });
  });
}

module.exports = { spawn: spawn, EXECUTABLE: EXECUTABLE };
