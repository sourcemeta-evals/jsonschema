const fs = require('fs');
const os = require('os');
const path = require('path');
const childProcess = require('child_process');

const platform = () => os.platform() === 'win32' ? 'windows' : os.platform();
const architecture = () => os.arch() === 'x64' ? 'x86_64' : os.arch();

const executablePath = () => {
  const executable = `jsonschema-${platform()}-${architecture()}`;
  return platform() === 'windows'
    ? path.join(__dirname, '..', 'build', 'github-releases', `${executable}.exe`)
    : path.join(__dirname, '..', 'build', 'github-releases', executable);
};

const unsupportedError = () => new Error(
  `The JSON Schema CLI NPM package does not support ${os.platform()} for ${architecture()} yet\n` +
  'Please open a GitHub issue at https://github.com/sourcemeta/jsonschema'
);

const prepareExecutable = (executable) => {
  if (!fs.existsSync(executable)) {
    throw unsupportedError();
  }

  if (platform() === 'darwin') {
    childProcess.spawnSync('/usr/bin/xattr', ['-c', executable], {
      stdio: 'inherit',
      windowsHide: true
    });
  }
};

const spawn = (arguments_ = [], options = {}) => new Promise((resolve, reject) => {
  const executable = executablePath();

  try {
    prepareExecutable(executable);
  } catch (error) {
    reject(error);
    return;
  }

  const child = childProcess.spawn(executable, arguments_, {
    ...options,
    windowsHide: options.windowsHide ?? true
  });

  let stdout = '';
  let stderr = '';

  if (child.stdout) {
    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });
  }

  if (child.stderr) {
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });
  }

  child.once('error', reject);
  child.once('close', (code, signal) => {
    resolve({
      code: typeof code === 'number' ? code : 1,
      signal,
      stdout,
      stderr
    });
  });
});

exports.spawn = spawn;
