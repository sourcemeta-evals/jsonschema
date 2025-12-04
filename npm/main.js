const os = require('os');
const path = require('path');
const fs = require('fs');
const child_process = require('child_process');

const PLATFORM = os.platform() === 'win32' ? 'windows' : os.platform();
const ARCH = os.arch() === 'x64' ? 'x86_64' : os.arch();

function getExecutable() {
  // Try the npm distribution binary first (from GitHub releases)
  const npmBinary = PLATFORM === 'windows'
    ? path.join(__dirname, '..', 'build', 'github-releases', `jsonschema-${PLATFORM}-${ARCH}.exe`)
    : path.join(__dirname, '..', 'build', 'github-releases', `jsonschema-${PLATFORM}-${ARCH}`);

  if (fs.existsSync(npmBinary)) {
    return npmBinary;
  }

  // Fall back to local development build
  const localBinary = PLATFORM === 'windows'
    ? path.join(__dirname, '..', 'build', 'dist', 'bin', 'jsonschema.exe')
    : path.join(__dirname, '..', 'build', 'dist', 'bin', 'jsonschema');

  if (fs.existsSync(localBinary)) {
    return localBinary;
  }

  return null;
}

/**
 * Spawn the JSON Schema CLI with the given arguments
 * @param {string[]} args - Command line arguments to pass to the CLI
 * @param {object} [options] - Options for the spawn call
 * @param {string} [options.stdio] - stdio configuration (e.g., 'inherit')
 * @returns {Promise<{code: number, stdout: string, stderr: string}>}
 */
function spawn(args, options = {}) {
  return new Promise((resolve, reject) => {
    const executable = getExecutable();
    if (!executable) {
      reject(new Error(
        `The JSON Schema CLI NPM package does not support ${os.platform()} for ${ARCH} yet. ` +
        'Please open a GitHub issue at https://github.com/sourcemeta/jsonschema'
      ));
      return;
    }

    if (PLATFORM === 'darwin') {
      child_process.spawnSync('/usr/bin/xattr', ['-c', executable], { stdio: 'inherit' });
    }

    const useInherit = options.stdio === 'inherit';
    const spawnOptions = {
      windowsHide: true
    };

    if (useInherit) {
      spawnOptions.stdio = 'inherit';
    }

    const proc = child_process.spawn(executable, args, spawnOptions);

    let stdout = '';
    let stderr = '';

    if (!useInherit) {
      proc.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      proc.stderr.on('data', (data) => {
        stderr += data.toString();
      });
    }

    proc.on('error', (error) => {
      reject(error);
    });

    proc.on('close', (code) => {
      resolve({
        code: code,
        stdout: stdout,
        stderr: stderr
      });
    });
  });
}

module.exports = { spawn };
