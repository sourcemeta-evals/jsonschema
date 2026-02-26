const os = require('os');
const path = require('path');
const fs = require('fs');
const child_process = require('child_process');

function getExecutablePath() {
  const platform = os.platform() === 'win32' ? 'windows' : os.platform();
  const arch = os.arch() === 'x64' ? 'x86_64' : os.arch();
  return {
    platform,
    arch,
    executable: platform === 'windows'
      ? path.join(__dirname, '..', 'build', 'github-releases', `jsonschema-${platform}-${arch}.exe`)
      : path.join(__dirname, '..', 'build', 'github-releases', `jsonschema-${platform}-${arch}`)
  };
}

function spawn(args, options) {
  return new Promise((resolve, reject) => {
    const { platform, arch, executable } = getExecutablePath();

    if (!fs.existsSync(executable)) {
      reject(new Error(`The JSON Schema CLI NPM package does not support ${os.platform()} for ${arch} yet`));
      return;
    }

    if (platform === 'darwin') {
      child_process.spawnSync('/usr/bin/xattr', ['-c', executable], { stdio: 'inherit' });
    }

    const spawnOptions = Object.assign({ windowsHide: true }, options || {});
    const child = child_process.spawn(executable, args || [], spawnOptions);

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
      resolve({ stdout, stderr, code });
    });
  });
}

module.exports = { spawn };
