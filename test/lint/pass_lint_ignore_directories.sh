#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

mkdir -p "$TMP/.angular"
mkdir -p "$TMP/node_modules"

cat << 'EOF' > "$TMP/schema.json"
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "string"
}
EOF

cat << 'EOF' > "$TMP/.angular/bad.json"
{
  "invalid": "not a schema"
}
EOF

cat << 'EOF' > "$TMP/node_modules/bad.json"
{
  "invalid": "not a schema"
}
EOF

"$1" lint "$TMP" -i "$TMP/.angular" -i "$TMP/node_modules" > "$TMP/result.txt" 2>&1

cat << 'EOF' > "$TMP/output.txt"
EOF

diff "$TMP/result.txt" "$TMP/output.txt"
