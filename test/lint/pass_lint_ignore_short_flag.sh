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
cat << 'EOF' > "$TMP/ignored/bad.json"
/* invalid json */
EOF

"$1" lint "$TMP" -i "$TMP/ignored" > "$TMP/result.txt" 2>&1 || {
  echo "expected lint to succeed" >&2
  exit 1
}

cat << 'EOF' > "$TMP/expected.txt"
EOF

diff "$TMP/result.txt" "$TMP/expected.txt"

cat << 'EOF' > "$TMP/expected_schema.json"
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "string"
}
EOF

diff "$TMP/schema.json" "$TMP/expected_schema.json"
