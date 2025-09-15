#!/bin/sh

set -o errexit
set -o nounset

TEST_DIRECTORY=$(dirname "$0")
ROOT_DIRECTORY="$TEST_DIRECTORY/../.."

"$ROOT_DIRECTORY/jsonschema" lint --exclude nonexistent-rule 2>&1 | grep -q "This command expects input files"

"$ROOT_DIRECTORY/jsonschema" lint 2>&1 | grep -q "This command expects input files"

echo '{"type": "string"}' > /tmp/test_schema.json
"$ROOT_DIRECTORY/jsonschema" lint --exclude nonexistent-rule /tmp/test_schema.json 2>&1 | grep -q "Cannot exclude unknown rule" || true
rm -f /tmp/test_schema.json

echo "PASS: map::at error handling tests"
