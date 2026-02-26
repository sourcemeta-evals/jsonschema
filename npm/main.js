const os = require('os');
const path = require('path');
const fs = require('fs');
const child_process = require('child_process');

const unsupportedTargetError = function () {
  const arch = os.arch() === 'x64' ? 'x86_64' : os.arch();
  return new Error(
    `The JSON Schema CLI NPM package does not support ${os.platform()} for ${arch} yet`);
};

const executablePath = function () {
  if (process.env.JSONSCHEMA_NPM_EXECUTABLE) {
    return process.env.JSONSCHEMA_NPM_EXECUTABLE;
  }

  const platform = os.platform() === 'win32' ? 'windows' : os.platform();
  const arch = os.arch() === 'x64' ? 'x86_64' : os.arch();

  return platform === 'windows'
    ? path.join(__dirname, '..', 'build', 'github-releases',
      `jsonschema-${platform}-${arch}.exe`)
    : path.join(__dirname, '..', 'build', 'github-releases',
      `jsonschema-${platform}-${arch}`);
};

const ensureExecutable = function (executable) {
  if (!fs.existsSync(executable)) {
    throw unsupportedTargetError();
  }
};

const clearQuarantine = function (executable, options) {
  if (os.platform() !== 'darwin') {
    return;
  }

  child_process.spawnSync('/usr/bin/xattr', [ '-c', executable ], {
    stdio: options.stdio === 'inherit' ? 'inherit' : 'ignore',
    windowsHide: true
  });
};

const spawn = function (arguments_, options) {
  const argv = Array.isArray(arguments_) ? arguments_ : [];
  const spawnOptions = {
    ...(options || {}),
    windowsHide: options && Object.prototype.hasOwnProperty.call(options, 'windowsHide')
      ? options.windowsHide : true
  };

  try {
    const executable = executablePath();
    ensureExecutable(executable);
    clearQuarantine(executable, spawnOptions);

    let stdout = '';
    let stderr = '';

    const subprocess = child_process.spawn(executable, argv, spawnOptions);
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

    const promise = new Promise((resolve, reject) => {
      subprocess.once('error', (error) => {
        reject(error);
      });

      subprocess.once('close', (code, signal) => {
        resolve({
          stdout,
          stderr,
          code,
          signal
        });
      });
    });

    promise.subprocess = subprocess;
    return promise;
  } catch (error) {
    return Promise.reject(error);
  }
};

exports.spawn = spawn;
