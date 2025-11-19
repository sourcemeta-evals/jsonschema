#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

mkdir -p "$TMP/node_modules"
mkdir -p "$TMP/.angular"

cat << 'SCHEMA_EOF' > "$TMP/schema.json"
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "string"
}
SCHEMA_EOF

# Test that using -i with directories doesn't crash with map::at error
# This reproduces the user's scenario: jsonschema lint -i .angular -i node_modules
cd "$TMP"
"$1" lint -i node_modules -i .angular > "$TMP/result.txt" 2>&1

# Should succeed with no output (linting current directory, ignoring those paths)
cat << 'OUTPUT_EOF' > "$TMP/output.txt"
OUTPUT_EOF

diff "$TMP/result.txt" "$TMP/output.txt"
