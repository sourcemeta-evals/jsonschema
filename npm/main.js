const child_process = require('child_process');

function spawn(args) {
  // Broken: uses spawnSync instead of async, wrong return structure
  const result = child_process.spawnSync('echo', ['hello']);
  return Promise.resolve({ exitCode: result.status });
}

module.exports = { spawn };
