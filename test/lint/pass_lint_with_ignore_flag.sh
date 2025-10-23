#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

cat << 'EOF' > "$TMP/schema.json"
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "string"
}
EOF

mkdir -p "$TMP/node_modules"
cat << 'EOF' > "$TMP/node_modules/ignored.json"
{
  "invalid": "schema"
}
EOF

"$1" lint -i "$TMP/node_modules" "$TMP/schema.json" > "$TMP/result.txt" 2>&1

cat << 'EOF' > "$TMP/output.txt"
EOF

diff "$TMP/result.txt" "$TMP/output.txt"

"$1" lint --ignore "$TMP/node_modules" "$TMP/schema.json" > "$TMP/result2.txt" 2>&1

diff "$TMP/result2.txt" "$TMP/output.txt"
