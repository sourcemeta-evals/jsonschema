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
mkdir -p "$TMP/.angular"

cat << 'EOF' > "$TMP/node_modules/ignored.json"
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "enum": [ "foo" ]
}
EOF

"$1" lint "$TMP" -i "$TMP/node_modules" -i "$TMP/.angular" > "$TMP/result.txt" 2>&1

cat << 'EOF' > "$TMP/output.txt"
EOF

diff "$TMP/result.txt" "$TMP/output.txt"
