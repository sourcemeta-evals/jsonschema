#!/bin/bash

set -euo pipefail

cd "$(dirname "$0")/.."


mkdir -p test_temp
cd test_temp

echo '{"type": "string"}' > valid_schema.json

mkdir -p node_modules .angular
echo '{"invalid": json}' > node_modules/bad.json
echo '{"another": invalid}' > .angular/config.json

echo "Testing basic ignore functionality..."
if ! ../build/jsonschema lint valid_schema.json -i node_modules -i .angular; then
  echo "FAIL: Basic ignore functionality failed"
  cd ..
  rm -rf test_temp
  exit 1
fi

echo "Testing multiple ignore flags..."
if ! ../build/jsonschema lint -i node_modules -i .angular; then
  echo "FAIL: Multiple ignore flags caused error"
  cd ..
  rm -rf test_temp
  exit 1
fi

echo "Testing ignore of non-existent directories..."
if ! ../build/jsonschema lint valid_schema.json -i nonexistent_dir; then
  echo "FAIL: Ignoring non-existent directory caused error"
  cd ..
  rm -rf test_temp
  exit 1
fi

echo "All ignore flag tests passed!"

cd ..
rm -rf test_temp
