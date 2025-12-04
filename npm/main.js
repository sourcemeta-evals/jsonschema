const os = require('os');
const path = require('path');
const fs = require('fs');
const child_process = require('child_process');

const PLATFORM = os.platform() === 'win32' ? 'windows' : os.platform();
const ARCH = os.arch() === 'x64' ? 'x86_64' : os.arch();
const EXECUTABLE = PLATFORM === 'windows'
  ? path.join(__dirname, '..', 'build', 'github-releases', `jsonschema-${PLATFORM}-${ARCH}.exe`)
  : path.join(__dirname, '..', 'build', 'github-releases', `jsonschema-${PLATFORM}-${ARCH}`);

function getExecutablePath() {
  return EXECUTABLE;
}

function checkExecutable() {
  if (!fs.existsSync(EXECUTABLE)) {
    throw new Error(
      `The JSON Schema CLI NPM package does not support ${os.platform()} for ${ARCH} yet. ` +
      'Please open a GitHub issue at https://github.com/sourcemeta/jsonschema'
    );
  }
}

function clearQuarantine() {
  if (PLATFORM === 'darwin') {
    child_process.spawnSync('/usr/bin/xattr', ['-c', EXECUTABLE], { stdio: 'inherit' });
  }
}

function spawn(args, options = {}) {
  return new Promise((resolve, reject) => {
    try {
      checkExecutable();
      clearQuarantine();
    } catch (error) {
      reject(error);
      return;
    }

    const useInherit = options.stdio === 'inherit';
    const spawnOptions = {
      stdio: useInherit ? 'inherit' : 'pipe',
      windowsHide: true
    };

    const proc = child_process.spawn(EXECUTABLE, args, spawnOptions);

    let stdout = '';
    let stderr = '';

    if (!useInherit) {
      proc.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      proc.stderr.on('data', (data) => {
        stderr += data.toString();
      });
    }

    proc.on('error', (error) => {
      reject(error);
    });

    proc.on('close', (code) => {
      resolve({
        code: code,
        stdout: stdout,
        stderr: stderr
      });
    });
  });
}

module.exports = {
  spawn,
  getExecutablePath,
  checkExecutable,
  clearQuarantine,
  PLATFORM,
  ARCH,
  EXECUTABLE
};
