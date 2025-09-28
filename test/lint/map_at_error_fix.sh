#!/bin/sh

set -o errexit
set -o nounset

TEST_DIR="$(dirname "$0")"
ROOT_DIR="$TEST_DIR/../.."

cd "$ROOT_DIR"

mkdir -p test_files
echo '{}' > test_files/empty.json
echo '{"test": true}' > test_files/valid.json

echo "Testing lint with ignore flags..."
if ! "$ROOT_DIR/jsonschema" lint test_files/valid.json -i test_files/empty.json 2>&1; then
    echo "FAIL: lint with ignore flag failed"
    exit 1
fi

echo "Testing lint with exclude flags..."
if ! "$ROOT_DIR/jsonschema" lint test_files/valid.json --exclude nonexistent-rule 2>&1; then
    echo "FAIL: lint with exclude flag failed"
    exit 1
fi

echo "Testing lint with minimal arguments..."
if ! "$ROOT_DIR/jsonschema" lint test_files/valid.json 2>&1; then
    echo "FAIL: basic lint failed"
    exit 1
fi

rm -rf test_files

echo "PASS: All map::at error fix tests passed"
