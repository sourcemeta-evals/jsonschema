#!/usr/bin/env node
const { spawn } = require('./main');

spawn(process.argv.slice(2), { stdio: 'inherit' }).then((result) => {
  process.exit(result.code ?? 1);
}).catch((error) => {
  console.error(error.message);
  console.error('Please open a GitHub issue at https://github.com/sourcemeta/jsonschema');
  process.exit(1);
});
