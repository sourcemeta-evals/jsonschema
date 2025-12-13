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

mkdir -p "$TMP/ignored1"
cat << 'EOF' > "$TMP/ignored1/bad1.json"
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "string",
  "enum": [ "foo" ]
}
EOF

mkdir -p "$TMP/ignored2"
cat << 'EOF' > "$TMP/ignored2/bad2.json"
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "string",
  "enum": [ "bar" ]
}
EOF

"$1" lint "$TMP" -i "$TMP/ignored1" -i "$TMP/ignored2" > "$TMP/result.txt" 2>&1

cat << 'EOF' > "$TMP/output.txt"
EOF

diff "$TMP/result.txt" "$TMP/output.txt"
