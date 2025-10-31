#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

cat << 'EOF' > "$TMP/schema.json"
{ "foo": "bar" }
EOF

"$1" lint "$TMP/schema.json" >"$TMP/output.txt" 2>&1 && CODE="$?" || CODE="$?"
test "$CODE" = "1" || exit 1

cat << EOF > "$TMP/expected.txt"
error: The input does not appear to be a JSON Schema
  $TMP/schema.json

The lint command is designed to check JSON Schema documents, not arbitrary JSON.
If this is a JSON Schema, ensure it contains at least one schema keyword
(e.g., \$schema, \$id, type, properties, \$ref, etc.)
EOF

diff "$TMP/output.txt" "$TMP/expected.txt"
