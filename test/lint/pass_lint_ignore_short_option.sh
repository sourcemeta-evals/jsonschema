#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

mkdir "$TMP/schemas"
mkdir "$TMP/ignored"

cat << 'EOF' > "$TMP/schemas/valid.json"
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "string"
}
EOF

cat << 'EOF' > "$TMP/ignored/invalid.json"
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "properties": {
    "foo": {
      "type": "string",
      "default": 1
    }
  }
}
EOF

"$1" lint "$TMP/schemas" "$TMP/ignored" -i "$TMP/ignored" > "$TMP/result.txt" 2>&1

cat << 'EOF' > "$TMP/expected.txt"
EOF

diff "$TMP/result.txt" "$TMP/expected.txt"
