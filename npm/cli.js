#!/usr/bin/env node
const { spawn, checkExecutable, clearQuarantine } = require('./main.js');

checkExecutable();
clearQuarantine();

spawn(process.argv.slice(2), { stdio: 'inherit' }).then((result) => {
  process.exit(result.code);
}).catch((error) => {
  console.error(error.message);
  process.exit(1);
});
