const os = require('os');
const path = require('path');
const fs = require('fs');
const child_process = require('child_process');

const platform = function () {
  return os.platform() === 'win32' ? 'windows' : os.platform();
};

const arch = function () {
  return os.arch() === 'x64' ? 'x86_64' : os.arch();
};

const executable = function () {
  const currentPlatform = platform();
  const currentArch = arch();

  if (currentPlatform === 'windows') {
    return path.join(__dirname, '..', 'build', 'github-releases',
      `jsonschema-${currentPlatform}-${currentArch}.exe`);
  }

  return path.join(__dirname, '..', 'build', 'github-releases',
    `jsonschema-${currentPlatform}-${currentArch}`);
};

const unsupportedError = function () {
  return new Error(
    `The JSON Schema CLI NPM package does not support ${os.platform()} for ${arch()} yet\n` +
    'Please open a GitHub issue at https://github.com/sourcemeta/jsonschema'
  );
};

const prepare = function (target) {
  if (!fs.existsSync(target)) {
    throw unsupportedError();
  }

  if (platform() === 'darwin') {
    child_process.spawnSync('/usr/bin/xattr', [ '-c', target ], {
      windowsHide: true
    });
  }
};

const spawn = function (args = [], options = {}) {
  if (!Array.isArray(args)) {
    return Promise.reject(new TypeError('Expected an array of arguments'));
  }

  let target;
  try {
    target = executable();
    prepare(target);
  } catch (error) {
    return Promise.reject(error);
  }

  return new Promise((resolve, reject) => {
    const result = {
      stdout: '',
      stderr: ''
    };

    const child = child_process.spawn(target, args, {
      ...options,
      // Do not open a command prompt on spawning
      windowsHide: true
    });

    if (child.stdout) {
      child.stdout.setEncoding('utf8');
      child.stdout.on('data', (chunk) => {
        result.stdout += chunk;
      });
    }

    if (child.stderr) {
      child.stderr.setEncoding('utf8');
      child.stderr.on('data', (chunk) => {
        result.stderr += chunk;
      });
    }

    child.once('error', reject);
    child.once('close', (code, signal) => {
      resolve({
        ...result,
        code,
        signal
      });
    });
  });
};

module.exports = {
  spawn
};
