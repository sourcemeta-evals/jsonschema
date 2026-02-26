#!/usr/bin/env node
const { spawn } = require('./main.js');

spawn(process.argv.slice(2), { stdio: 'inherit' }).then(function (result) {
  process.exit(result.code);
}).catch(function (error) {
  console.error(error.message);
  process.exit(1);
});
