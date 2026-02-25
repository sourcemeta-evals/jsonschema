const child_process = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const platform = () => (os.platform() === 'win32' ? 'windows' : os.platform());
const architecture = () => (os.arch() === 'x64' ? 'x86_64' : os.arch());

const executablePath = () => {
  const extension = platform() === 'windows' ? '.exe' : '';
  return path.join(
    __dirname,
    '..',
    'build',
    'github-releases',
    `jsonschema-${platform()}-${architecture()}${extension}`
  );
};

const ensureExecutable = (executable) => {
  if (!fs.existsSync(executable)) {
    throw new Error(
      `The JSON Schema CLI NPM package does not support ${os.platform()} for ${architecture()} yet`
    );
  }

  if (platform() === 'darwin') {
    child_process.spawnSync('/usr/bin/xattr', ['-c', executable], {
      stdio: 'inherit',
      windowsHide: true,
    });
  }
};

const normalize = (first, second) => {
  if (typeof first === 'undefined') {
    return { args: [], options: second ?? {} };
  }

  if (Array.isArray(first)) {
    return { args: first, options: second ?? {} };
  }

  if (typeof first === 'object' && first !== null && typeof second === 'undefined') {
    return { args: [], options: first };
  }

  throw new TypeError('Expected spawn(args, options) or spawn(options)');
};

const spawn = (first, second) => {
  const { args, options } = normalize(first, second);

  return new Promise((resolve, reject) => {
    const executable = executablePath();

    try {
      ensureExecutable(executable);
    } catch (error) {
      reject(error);
      return;
    }

    const spawnOptions = { ...options };
    if (!Object.prototype.hasOwnProperty.call(spawnOptions, 'windowsHide')) {
      spawnOptions.windowsHide = true;
    }

    const stdout = [];
    const stderr = [];

    let child;
    try {
      child = child_process.spawn(executable, args, spawnOptions);
    } catch (error) {
      reject(error);
      return;
    }

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

    child.once('error', (error) => {
      reject(error);
    });

    child.once('close', (code, signal) => {
      resolve({
        code,
        signal,
        stdout: Buffer.concat(stdout).toString(),
        stderr: Buffer.concat(stderr).toString(),
      });
    });
  });
};

module.exports.spawn = spawn;
