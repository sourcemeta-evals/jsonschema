const os = require('os');
const path = require('path');
const fs = require('fs');
const child_process = require('child_process');

const PLATFORM = os.platform() === 'win32' ? 'windows' : os.platform();
const ARCH = os.arch() === 'x64' ? 'x86_64' : os.arch();
const EXECUTABLE = PLATFORM === 'windows'
  ? path.join(__dirname, '..', 'build', 'github-releases', `jsonschema-${PLATFORM}-${ARCH}.exe`)
  : path.join(__dirname, '..', 'build', 'github-releases', `jsonschema-${PLATFORM}-${ARCH}`);

const unsupportedError = () => new Error(
  `The JSON Schema CLI NPM package does not support ${os.platform()} for ${ARCH} yet\n` +
  'Please open a GitHub issue at https://github.com/sourcemeta/jsonschema'
);

const resolveExecutable = function (options) {
  const env = options?.env ?? process.env;
  return env.JSONSCHEMA_NPM_EXECUTABLE ?? EXECUTABLE;
};

const prepareExecutable = function (executable, options) {
  if (!fs.existsSync(executable)) {
    throw unsupportedError();
  }

  if (PLATFORM === 'darwin') {
    child_process.spawnSync('/usr/bin/xattr', [ '-c', executable ], {
      stdio: options?.stdio === 'inherit' ? 'inherit' : 'ignore'
    });
  }
};

const spawn = function (arguments_, options = {}) {
  if (!Array.isArray(arguments_)) {
    return Promise.reject(new TypeError('Expected an array of CLI arguments'));
  }

  const executable = resolveExecutable(options);

  try {
    prepareExecutable(executable, options);
  } catch (error) {
    return Promise.reject(error);
  }

  return new Promise((resolve, reject) => {
    const stdout = [];
    const stderr = [];
    const child = child_process.spawn(executable, arguments_, {
      ...options,
      windowsHide: options.windowsHide ?? true
    });

    child.once('error', reject);

    if (child.stdout) {
      child.stdout.on('data', (chunk) => {
        stdout.push(Buffer.from(chunk));
      });
    }

    if (child.stderr) {
      child.stderr.on('data', (chunk) => {
        stderr.push(Buffer.from(chunk));
      });
    }

    child.once('close', (code, signal) => {
      resolve({
        code,
        signal,
        stdout: Buffer.concat(stdout).toString('utf8'),
        stderr: Buffer.concat(stderr).toString('utf8')
      });
    });
  });
};

exports.spawn = spawn;
