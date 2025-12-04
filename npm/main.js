const os = require('os');
const path = require('path');
const fs = require('fs');
const child_process = require('child_process');

const PLATFORM = os.platform() === 'win32' ? 'windows' : os.platform();
const ARCH = os.arch() === 'x64' ? 'x86_64' : os.arch();
const EXECUTABLE_NPM = PLATFORM === 'windows'
  ? path.join(__dirname, '..', 'build', 'github-releases', `jsonschema-${PLATFORM}-${ARCH}.exe`)
  : path.join(__dirname, '..', 'build', 'github-releases', `jsonschema-${PLATFORM}-${ARCH}`);
const EXECUTABLE_LOCAL = PLATFORM === 'windows'
  ? path.join(__dirname, '..', 'build', 'dist', 'bin', 'jsonschema.exe')
  : path.join(__dirname, '..', 'build', 'dist', 'bin', 'jsonschema');

function getExecutable() {
  if (fs.existsSync(EXECUTABLE_NPM)) {
    return EXECUTABLE_NPM;
  }
  if (fs.existsSync(EXECUTABLE_LOCAL)) {
    return EXECUTABLE_LOCAL;
  }
  throw new Error(`The JSON Schema CLI NPM package does not support ${os.platform()} for ${ARCH} yet`);
}

function clearQuarantine(executable) {
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

    clearQuarantine(executable);

    const spawnOptions = {
      windowsHide: true,
      ...options
    };

    const useInherit = options.stdio === 'inherit';

    if (!useInherit) {
      spawnOptions.stdio = ['pipe', 'pipe', 'pipe'];
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
        stdout: stdout,
        stderr: stderr
      });
    });
  });
}

module.exports = { spawn };
