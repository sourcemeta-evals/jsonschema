#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

mkdir -p "$TMP/node_modules"

cat << 'EOF' > "$TMP/schema.json"
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "string"
}
EOF

cat << 'EOF' > "$TMP/node_modules/ignored.json"
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "invalid"
}
EOF

"$1" lint -i "$TMP/node_modules" "$TMP/schema.json" --verbose > "$TMP/result.txt" 2>&1

grep -q "Ignoring path" "$TMP/result.txt"
grep -q "Linting" "$TMP/result.txt"
