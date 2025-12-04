const os = require('os');
const path = require('path');
const fs = require('fs');
const child_process = require('child_process');

const PLATFORM = os.platform() === 'win32' ? 'windows' : os.platform();
const ARCH = os.arch() === 'x64' ? 'x86_64' : os.arch();

function getExecutablePath() {
  // First try the npm package distribution path (github-releases)
  const npmExecutable = PLATFORM === 'windows'
    ? path.join(__dirname, '..', 'build', 'github-releases', `jsonschema-${PLATFORM}-${ARCH}.exe`)
    : path.join(__dirname, '..', 'build', 'github-releases', `jsonschema-${PLATFORM}-${ARCH}`);

  if (fs.existsSync(npmExecutable)) {
    return npmExecutable;
  }

  // Fall back to local development build path
  const localExecutable = PLATFORM === 'windows'
    ? path.join(__dirname, '..', 'build', 'dist', 'bin', 'jsonschema.exe')
    : path.join(__dirname, '..', 'build', 'dist', 'bin', 'jsonschema');

  if (fs.existsSync(localExecutable)) {
    return localExecutable;
  }

  // Return the npm path for error messaging
  return npmExecutable;
}

function checkExecutable(executablePath) {
  if (!fs.existsSync(executablePath)) {
    throw new Error(`The JSON Schema CLI NPM package does not support ${os.platform()} for ${ARCH} yet. Please open a GitHub issue at https://github.com/sourcemeta/jsonschema`);
  }
}

function clearQuarantine(executablePath) {
  if (PLATFORM === 'darwin') {
    child_process.spawnSync('/usr/bin/xattr', ['-c', executablePath], { stdio: 'inherit' });
  }
}

function spawn(args, options = {}) {
  return new Promise((resolve, reject) => {
    const executablePath = getExecutablePath();

    try {
      checkExecutable(executablePath);
      clearQuarantine(executablePath);
    } catch (error) {
      reject(error);
      return;
    }

    const spawnOptions = {
      windowsHide: true
    };

    if (options.stdio) {
      spawnOptions.stdio = options.stdio;
    }

    const child = child_process.spawn(executablePath, args, spawnOptions);

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
  });
}

module.exports = {
  spawn,
  getExecutablePath,
  checkExecutable,
  clearQuarantine
};
