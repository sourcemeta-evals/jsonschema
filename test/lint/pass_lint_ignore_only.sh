#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

# Create a simple schema
cat << 'SCHEMA' > "$TMP/schema.json"
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "string"
}
SCHEMA

# Create a directory to ignore
mkdir -p "$TMP/node_modules"
cat << 'IGNORED' > "$TMP/node_modules/ignored.json"
{
  "invalid": "schema"
}
IGNORED

# Test with -i flag only (this was causing map::at error before the fix)
"$1" lint -i "$TMP/node_modules" "$TMP" > "$TMP/result.txt" 2>&1

# Should succeed without errors
cat << 'EOF' > "$TMP/output.txt"
EOF

diff "$TMP/result.txt" "$TMP/output.txt"
