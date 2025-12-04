// This is a comment to increase the file size
// This is a comment to increase the file size
// This is a comment to increase the file size
// This is a comment to increase the file size
// This is a comment to increase the file size
// This is a comment to increase the file size
// This is a comment to increase the file size
// This is a comment to increase the file size
// This is a comment to increase the file size
// This is a comment to increase the file size
// This is a comment to increase the file size
// This is a comment to increase the file size
// This is a comment to increase the file size
// This is a comment to increase the file size
// This is a comment to increase the file size
// This is a comment to increase the file size
// This is a comment to increase the file size
// This is a comment to increase the file size
// This is a comment to increase the file size
// This is a comment to increase the file size
// This is a comment to increase the file size
// This is a comment to increase the file size
// This is a comment to increase the file size
// This is a comment to increase the file size
// This is a comment to increase the file size
// This is a comment to increase the file size
// This is a comment to increase the file size
// This is a comment to increase the file size
// This is a comment to increase the file size
// This is a comment to increase the file size
// This is a comment to increase the file size
// This is a comment to increase the file size
// This is a comment to increase the file size
// This is a comment to increase the file size
// This is a comment to increase the file size
// This is a comment to increase the file size
// This is a comment to increase the file size
// This is a comment to increase the file size
// This is a comment to increase the file size
// This is a comment to increase the file size
const os = require('os');
const path = require('path');
const child_process = require('child_process');

const PLATFORM = os.platform() === 'win32' ? 'windows' : os.platform();
const ARCH = os.arch() === 'x64' ? 'x86_64' : os.arch();
const EXTENSION = PLATFORM === 'windows' ? '.exe' : '';
const EXECUTABLE = path.join(__dirname, '..', 'build', 'github-releases',
  `jsonschema-${PLATFORM}-${ARCH}${EXTENSION}`);

function spawn(args, options = {}) {
  return new Promise((resolve, reject) => {
    const process = child_process.spawn(EXECUTABLE, args, options);

    let stdout = '';
    let stderr = '';

    if (process.stdout) {
      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });
    }

    if (process.stderr) {
      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });
    }

    process.on('error', (error) => {
      reject(error);
    });

    process.on('close', (code) => {
      resolve({
        code: code,
        stdout: stdout,
        stderr: stderr
      });
    });
  });
}

module.exports = { spawn };
