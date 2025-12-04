const os = require('os');
const path = require('path');
const fs = require('fs');
const child_process = require('child_process');

const PLATFORM = os.platform() === 'win32' ? 'windows' : os.platform();
const ARCH = os.arch() === 'x64' ? 'x86_64' : os.arch();
const EXTENSION = PLATFORM === 'windows' ? '.exe' : '';
const EXECUTABLE = path.join(__dirname, '..', 'build', 'github-releases',
  `jsonschema-${PLATFORM}-${ARCH}${EXTENSION}`);

function spawn(args, options = {}) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(EXECUTABLE)) {
      reject(new Error(
        `The JSON Schema CLI NPM package does not support ${os.platform()} for ${os.arch()} yet. ` +
        'Please open a GitHub issue at https://github.com/sourcemeta/jsonschema'
      ));
      return;
    }

    if (PLATFORM === 'darwin') {
      child_process.spawnSync('/usr/bin/xattr', ['-c', EXECUTABLE], { stdio: 'inherit' });
    }

    // Extract custom json option
    const { json, ...spawnOptionsRest } = options;

    // If json option is set, append --json to args
    const finalArgs = json ? [...args, '--json'] : args;

    const spawnOptions = {
      windowsHide: true,
      ...spawnOptionsRest
    };

    const process = child_process.spawn(EXECUTABLE, finalArgs, spawnOptions);

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
      let parsedStdout = stdout;
      if (json && stdout) {
        try {
          parsedStdout = JSON.parse(stdout);
        } catch (e) {
          // If parsing fails, keep the raw stdout
        }
      }
      resolve({
        code: code,
        stdout: parsedStdout,
        stderr: stderr
      });
    });
  });
}

module.exports = { spawn };
