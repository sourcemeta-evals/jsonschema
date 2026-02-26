const os = require('os');
const path = require('path');
const fs = require('fs');
const child_process = require('child_process');

const executablePath = function () {
  const platform = os.platform() === 'win32' ? 'windows' : os.platform();
  const arch = os.arch() === 'x64' ? 'x86_64' : os.arch();
  const executable = platform === 'windows'
    ? path.join(__dirname, '..', 'build', 'github-releases', `jsonschema-${platform}-${arch}.exe`)
    : path.join(__dirname, '..', 'build', 'github-releases', `jsonschema-${platform}-${arch}`);

  return {
    platform,
    arch,
    executable
  };
};

const prepareExecutable = function (platform, executable) {
  if (platform === 'darwin') {
    child_process.spawnSync('/usr/bin/xattr', [ '-c', executable ], { stdio: 'inherit' });
  }
};

const spawn = function (arguments_, options = {}) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(arguments_)) {
      reject(new TypeError('Expected an array of CLI arguments'));
      return;
    }

    const { platform, arch, executable } = executablePath();

    if (!fs.existsSync(executable)) {
      reject(new Error(
        `The JSON Schema CLI NPM package does not support ${os.platform()} for ${arch} yet\n` +
        'Please open a GitHub issue at https://github.com/sourcemeta/jsonschema'
      ));
      return;
    }

    prepareExecutable(platform, executable);

    const child = child_process.spawn(executable, arguments_, {
      ...options,
      // Do not open a command prompt on spawning
      windowsHide: options.windowsHide ?? true
    });

    let stdout = '';
    let stderr = '';

    if (child.stdout) {
      child.stdout.setEncoding('utf8');
      child.stdout.on('data', (chunk) => {
        stdout += chunk;
      });
    }

    if (child.stderr) {
      child.stderr.setEncoding('utf8');
      child.stderr.on('data', (chunk) => {
        stderr += chunk;
      });
    }

    child.once('error', (error) => {
      reject(error);
    });

    child.once('close', (code, signal) => {
      resolve({
        stdout: child.stdout ? stdout : undefined,
        stderr: child.stderr ? stderr : undefined,
        code,
        signal
      });
    });
  });
};

module.exports = {
  spawn
};
