const os = require('os');
const path = require('path');
const fs = require('fs');
const child_process = require('child_process');

const PLATFORM = os.platform() === 'win32' ? 'windows' : os.platform();
const ARCH = os.arch() === 'x64' ? 'x86_64' : os.arch();
const EXTENSION = PLATFORM === 'windows' ? '.exe' : '';
const EXECUTABLE = path.join(__dirname, '..', 'build', 'github-releases',
  `jsonschema-${PLATFORM}-${ARCH}${EXTENSION}`);

/**
 * Spawn the JSON Schema CLI with the given arguments and options.
 * @param {string[]} args - The arguments to pass to the CLI.
 * @param {Object} [options={}] - The options for spawning the process.
 * @param {boolean} [options.json=false] - When set to true, automatically passes
 *   the --json flag to the CLI and parses the standard output as JSON.
 * @returns {Promise<{code: number, stdout: string|Object, stderr: string}>}
 *   A promise that resolves with the exit code, stdout (string or parsed JSON
 *   object if json option is true), and stderr.
 */
function spawn(args, options = {}) {
  const json = options.json === true;
  const spawnArgs = json ? [...args, '--json'] : args;

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

    const spawnOptions = {
      windowsHide: true,
      ...options
    };

    delete spawnOptions.json;

    const process = child_process.spawn(EXECUTABLE, spawnArgs, spawnOptions);

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
        stdout: json ? JSON.parse(stdout) : stdout,
        stderr: stderr
      });
    });
  });
}

module.exports = { spawn };
