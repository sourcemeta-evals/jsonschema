const os = require('os');
const path = require('path');
const fs = require('fs');
const child_process = require('child_process');

const PLATFORM = os.platform() === 'win32' ? 'windows' : os.platform();
const ARCH = os.arch() === 'x64' ? 'x86_64' : os.arch();

const resolveExecutable = () => {
  const executable = PLATFORM === 'windows'
    ? path.join(__dirname, '..', 'build', 'github-releases', `jsonschema-${PLATFORM}-${ARCH}.exe`)
    : path.join(__dirname, '..', 'build', 'github-releases', `jsonschema-${PLATFORM}-${ARCH}`);

  if (!fs.existsSync(executable)) {
    throw new Error(
      `The JSON Schema CLI NPM package does not support ${os.platform()} for ${ARCH} yet\n`
      + 'Please open a GitHub issue at https://github.com/sourcemeta/jsonschema'
    );
  }

  return executable;
};

const spawn = (args = [], options = {}) => {
  return new Promise((resolve, reject) => {
    const executable = resolveExecutable();

    if (PLATFORM === 'darwin') {
      child_process.spawnSync('/usr/bin/xattr', ['-c', executable], {
        stdio: 'ignore',
        windowsHide: true
      });
    }

    const subprocess = child_process.spawn(executable, args, {
      windowsHide: true,
      ...options
    });

    let stdout = '';
    let stderr = '';

    if (subprocess.stdout) {
      subprocess.stdout.on('data', (chunk) => {
        stdout += chunk.toString();
      });
    }

    if (subprocess.stderr) {
      subprocess.stderr.on('data', (chunk) => {
        stderr += chunk.toString();
      });
    }

    subprocess.on('error', (error) => {
      reject(error);
    });

    subprocess.on('close', (code, signal) => {
      resolve({ code, signal, stdout, stderr });
    });
  });
};

exports.spawn = spawn;
