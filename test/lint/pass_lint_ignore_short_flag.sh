#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

# Create a valid schema
cat << 'SCHEMA' > "$TMP/schema.json"
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "string"
}
SCHEMA

# Create directories to ignore
mkdir -p "$TMP/node_modules"
mkdir -p "$TMP/.angular"

# Test that -i flag works without crashing (regression test for map::at error)
# This should succeed with no output when ignoring directories
"$1" lint -i "$TMP/node_modules" -i "$TMP/.angular" > "$TMP/result.txt" 2>&1

# Verify empty output
cat << 'EOF' > "$TMP/output.txt"
EOF

diff "$TMP/result.txt" "$TMP/output.txt"
