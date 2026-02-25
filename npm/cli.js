#!/usr/bin/env node
const { spawn } = require('./main');

spawn(process.argv.slice(2), { stdio: 'inherit' }).then((result) => {
  process.exit(typeof result.code === 'number' ? result.code : 1);
}).catch((error) => {
  console.error(error.message);
  process.exit(1);
});
