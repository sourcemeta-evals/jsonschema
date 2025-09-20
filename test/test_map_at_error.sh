#!/bin/sh
set -e

mkdir -p test_temp
echo '{ /* comment */ "compilerOptions": {} }' > test_temp/tsconfig.json
echo '{ "extends": "./tsconfig.json" }' > test_temp/tsconfig.app.json

if jsonschema lint test_temp/*.json 2>&1 | grep -q "unexpected error: map::at"; then
  echo "FAIL: Still getting map::at error"
  exit 1
else
  echo "PASS: map::at error is handled gracefully"
fi

rm -rf test_temp
