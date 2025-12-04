const os = require('os');
const path = require('path');
const fs = require('fs');
const child_process = require('child_process');

const PLATFORM = os.platform() === 'win32' ? 'windows' : os.platform();
const ARCH = os.arch() === 'x64' ? 'x86_64' : os.arch();
const EXECUTABLE = PLATFORM === 'windows'
  ? path.join(__dirname, '..', 'build', 'github-releases', `jsonschema-${PLATFORM}-${ARCH}.exe`)
  : path.join(__dirname, '..', 'build', 'github-releases', `jsonschema-${PLATFORM}-${ARCH}`);

function getExecutable() {
  if (!fs.existsSync(EXECUTABLE)) {
    throw new Error(`The JSON Schema CLI NPM package does not support ${os.platform()} for ${ARCH} yet. Please open a GitHub issue at https://github.com/sourcemeta/jsonschema`);
  }
  return EXECUTABLE;
}

function clearQuarantine() {
  if (PLATFORM === 'darwin') {
    child_process.spawnSync('/usr/bin/xattr', ['-c', EXECUTABLE], { stdio: 'inherit' });
  }
}

function spawn(args, options = {}) {
  return new Promise((resolve, reject) => {
    try {
      const executable = getExecutable();
      clearQuarantine();

      const spawnOptions = {
        windowsHide: true
      };

      if (options.stdio === 'inherit') {
        spawnOptions.stdio = 'inherit';
      }

      const child = child_process.spawn(executable, args, spawnOptions);

      let stdout = '';
      let stderr = '';

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
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { spawn };
