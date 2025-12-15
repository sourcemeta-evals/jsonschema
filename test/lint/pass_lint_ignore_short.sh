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

mkdir "$TMP/ignored"
cat << 'EOF' > "$TMP/ignored/other.json"
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "enum": [ 1, 2, 3 ],
  "type": "integer"
}
EOF

"$1" lint "$TMP" -i "$TMP/ignored" > "$TMP/result.txt" 2>&1

cat << 'EOF' > "$TMP/output.txt"
EOF

diff "$TMP/result.txt" "$TMP/output.txt"
