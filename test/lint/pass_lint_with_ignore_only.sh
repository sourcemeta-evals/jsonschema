#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

# Create a directory structure with some JSON files
mkdir -p "$TMP/schemas"
mkdir -p "$TMP/node_modules"

cat << 'SCHEMA_EOF' > "$TMP/schemas/schema.json"
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "string"
}
SCHEMA_EOF

cat << 'SCHEMA_EOF' > "$TMP/node_modules/ignored.json"
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "number"
}
SCHEMA_EOF

# Test: Run lint with -i flag but no positional arguments
# This should scan the current directory and ignore node_modules
# The key test is that it doesn't crash with "map::at" error
cd "$TMP"
BINARY="$1"
"$BINARY" lint -i node_modules > "$TMP/result.txt" 2>&1 || true

# Check that we didn't get the "map::at" error
if grep -q "map::at" "$TMP/result.txt"; then
  echo "ERROR: Got map::at error"
  cat "$TMP/result.txt"
  exit 1
fi

# The command should have run without crashing
exit 0
