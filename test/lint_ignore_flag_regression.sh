#!/bin/bash

set -euo pipefail


echo "Testing lint command with ignore flags to prevent map::at regression..."

echo "Test 1: lint -i flag without positional arguments"
if ./build/dist/bin/jsonschema lint -i .angular -i node_modules 2>&1 | grep -q "unexpected error: map::at"; then
  echo "FAIL: Still getting map::at error"
  exit 1
fi

echo "Test 2: lint with glob patterns and ignore flags"
cat > test_schema.json << 'EOF'
{"$schema": "http://json-schema.org/draft-07/schema#", "type": "object"}
EOF
if ./build/dist/bin/jsonschema lint test_schema.json -i nonexistent 2>&1 | grep -q "unexpected error: map::at"; then
  echo "FAIL: Still getting map::at error with schema file"
  exit 1
fi

echo "Test 3: lint with multiple ignore flags"
if ./build/dist/bin/jsonschema lint -i test1 -i test2 -i test3 2>&1 | grep -q "unexpected error: map::at"; then
  echo "FAIL: Still getting map::at error with multiple ignore flags"
  exit 1
fi

rm -f test_schema.json

echo "All tests passed - no map::at regression detected"
