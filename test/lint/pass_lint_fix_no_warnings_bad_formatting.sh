#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

cat << 'SCHEMA' > "$TMP/schema.json"
  {
             "$schema":
   "http://json-schema.org/draft-06/schema#",    "type"    : "string"
}
SCHEMA

# Save the original file for comparison
cp "$TMP/schema.json" "$TMP/schema_original.json"

# Run lint --fix
"$1" lint "$TMP/schema.json" --fix > "$TMP/result.txt" 2>&1

# Output should be empty (no lint warnings)
cat << 'OUTPUT' > "$TMP/expected_output.txt"
OUTPUT

diff "$TMP/result.txt" "$TMP/expected_output.txt"

# File should NOT be modified (even though it has bad formatting)
diff "$TMP/schema.json" "$TMP/schema_original.json"
