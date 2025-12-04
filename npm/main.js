const os = require('os');
const path = require('path');
const fs = require('fs');
const child_process = require('child_process');

const PLATFORM = os.platform() === 'win32' ? 'windows' : os.platform();
const ARCH = os.arch() === 'x64' ? 'x86_64' : os.arch();
const EXECUTABLE_RELEASE = PLATFORM === 'windows'
  ? path.join(__dirname, '..', 'build', 'github-releases', `jsonschema-${PLATFORM}-${ARCH}.exe`)
  : path.join(__dirname, '..', 'build', 'github-releases', `jsonschema-${PLATFORM}-${ARCH}`);
const EXECUTABLE_DEV = path.join(__dirname, '..', 'build', 'dist', 'bin', 'jsonschema');

function getExecutable() {
  if (fs.existsSync(EXECUTABLE_RELEASE)) {
    return EXECUTABLE_RELEASE;
  }
  if (fs.existsSync(EXECUTABLE_DEV)) {
    return EXECUTABLE_DEV;
  }
  throw new Error(`The JSON Schema CLI NPM package does not support ${os.platform()} for ${ARCH} yet`);
}

function clearXattr(executable) {
  if (PLATFORM === 'darwin') {
    child_process.spawnSync('/usr/bin/xattr', ['-c', executable], { stdio: 'inherit' });
  }
}

function spawn(args, options = {}) {
  return new Promise((resolve, reject) => {
    let executable;
    try {
      executable = getExecutable();
    } catch (error) {
      reject(error);
      return;
    }

    clearXattr(executable);

    const useInherit = options.stdio === 'inherit';
    const spawnOptions = {
      windowsHide: true
    };

    if (useInherit) {
      spawnOptions.stdio = 'inherit';
    }

    const child = child_process.spawn(executable, args, spawnOptions);

    let stdout = '';
    let stderr = '';

    if (!useInherit) {
      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

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
        stdout: useInherit ? '' : stdout,
        stderr: useInherit ? '' : stderr
      });
    });
  });
}

module.exports = { spawn };
