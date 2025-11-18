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

# Create a directory to ignore
mkdir -p "$TMP/ignored_dir"
cat << 'IGNORED' > "$TMP/ignored_dir/ignored.json"
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "number"
}
IGNORED

# Run lint with -i flag (this used to crash with "map::at" error)
"$1" lint "$TMP" -i "$TMP/ignored_dir" > "$TMP/result.txt" 2>&1

# Should succeed with no output (schema is valid)
cat << 'EOF' > "$TMP/output.txt"
EOF

diff "$TMP/result.txt" "$TMP/output.txt"
