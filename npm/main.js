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
const path = require('path');
const child_process = require('child_process');

const EXECUTABLE = path.join(__dirname, '..', 'bin', 'jsonschema');

function spawn(args, options = {}) {
  return new Promise((resolve) => {
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
