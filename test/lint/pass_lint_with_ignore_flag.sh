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

"$1" lint "$TMP/schema.json" -i "$TMP/node_modules" > "$TMP/result.txt" 2>&1

cat << 'EOF' > "$TMP/output.txt"
EOF

diff "$TMP/result.txt" "$TMP/output.txt"

"$1" lint "$TMP/schema.json" -i "$TMP/node_modules" -i "$TMP/.angular" > "$TMP/result2.txt" 2>&1

cat << 'EOF' > "$TMP/output2.txt"
EOF

diff "$TMP/result2.txt" "$TMP/output2.txt"
