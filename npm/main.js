const os = require('os');
const path = require('path');
const fs = require('fs');
const child_process = require('child_process');

const PLATFORM = os.platform() === 'win32' ? 'windows' : os.platform();
const ARCH = os.arch() === 'x64' ? 'x86_64' : os.arch();
const EXECUTABLE = PLATFORM === 'windows'
  ? path.join(__dirname, '..', 'build', 'github-releases', `jsonschema-${PLATFORM}-${ARCH}.exe`)
  : path.join(__dirname, '..', 'build', 'github-releases', `jsonschema-${PLATFORM}-${ARCH}`);

function spawn(args, options = {}) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(EXECUTABLE)) {
      return reject(new Error(`The JSON Schema CLI NPM package does not support ${os.platform()} for ${ARCH} yet. Please open a GitHub issue at https://github.com/sourcemeta/jsonschema`));
    }

    // Remove macOS quarantine attribute
    if (PLATFORM === 'darwin') {
      try {
        child_process.spawnSync('/usr/bin/xattr', [ '-c', EXECUTABLE ]);
      } catch (error) {
        // Ignore errors from xattr
      }
    }

    // Merge options with defaults
    const spawnOptions = {
      windowsHide: true,
      ...options
    };

    const child = child_process.spawn(EXECUTABLE, args, spawnOptions);

    let stdout = '';
    let stderr = '';

    // Collect stdout if not inherited
    if (child.stdout) {
      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });
    }

    // Collect stderr if not inherited
    if (child.stderr) {
      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });
    }

    child.on('error', (error) => {
      reject(error);
    });

    child.on('close', (code) => {
      resolve({
        code: code,
        stdout: stdout,
        stderr: stderr
      });
    });
  });
}

module.exports = { spawn };
