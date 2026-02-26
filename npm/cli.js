#!/usr/bin/env node
const main = require("./main.js");

main.spawn(process.argv.slice(2), { stdio: "inherit" })
  .then(function (result) {
    process.exit(result.code);
  })
  .catch(function (error) {
    console.error(error.message);
    process.exit(1);
  });
