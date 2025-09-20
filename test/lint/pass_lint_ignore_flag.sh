#!/bin/sh
set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

mkdir -p "$TMP/ignored"

cat << 'EOF' > "$TMP/schema.json"
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "string"
}
EOF

cat << 'EOF' > "$TMP/ignored/schema2.json"
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "number"
}
EOF

"$1" lint "$TMP" --ignore "$TMP/ignored" --verbose > "$TMP/output.txt" 2>&1

grep -q "Linting:" "$TMP/output.txt"
! grep -q "unexpected error: map::at" "$TMP/output.txt"
