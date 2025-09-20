#!/bin/bash
set -euo pipefail

TEST_DIR=$(mktemp -d)
trap 'rm -rf -- "$TEST_DIR"' EXIT

cat > "${TEST_DIR}/ignore.json" <<EOF
{
  "foo": "bar"
}
EOF

cat > "${TEST_DIR}/valid.json" <<EOF
{
  "bar": "baz"
}
EOF

./build/jsonschema lint "${TEST_DIR}" -i "${TEST_DIR}/ignore.json" &> /dev/null
