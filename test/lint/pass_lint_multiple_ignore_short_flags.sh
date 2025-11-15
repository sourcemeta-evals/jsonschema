#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

mkdir -p "$TMP/node_modules"
mkdir -p "$TMP/.angular"

cat << 'EOF' > "$TMP/schema.json"
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "string"
}
EOF

cat << 'EOF' > "$TMP/node_modules/test.json"
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "number"
}
EOF

cat << 'EOF' > "$TMP/.angular/test.json"
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "boolean"
}
EOF

"$1" lint "$TMP" -i "$TMP/.angular" -i "$TMP/node_modules" > "$TMP/result.txt" 2>&1

cat << 'EOF' > "$TMP/output.txt"
EOF

diff "$TMP/result.txt" "$TMP/output.txt"
