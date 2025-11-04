#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

# Create a badly formatted schema that doesn't trigger any lint warnings
cat << 'SCHEMA' > "$TMP/schema.json"
  {
             "$schema":
   "http://json-schema.org/draft-06/schema#",    "type"    : "string"
}
SCHEMA

# Save the original file content
cp "$TMP/schema.json" "$TMP/schema_original.json"

# Run lint --fix
"$1" lint "$TMP/schema.json" --fix 2>&1

# Verify the file was NOT modified (no formatting changes)
diff "$TMP/schema.json" "$TMP/schema_original.json"
