#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

cat << 'SCHEMA_EOF' > "$TMP/schema1.json"
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "string"
}
SCHEMA_EOF

cat << 'SCHEMA_EOF' > "$TMP/schema2.json"
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "object"
}
SCHEMA_EOF

# Test lint with -i flag (ignore schema2.json)
# This should succeed without "map::at" error
"$1" lint "$TMP" -i "$TMP/schema2.json" > "$TMP/result.txt" 2>&1

# The output should be empty (no lint errors)
cat << 'EOF' > "$TMP/output.txt"
EOF

diff "$TMP/result.txt" "$TMP/output.txt"
