#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

cat << 'EOF' > "$TMP/schema.json"
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "enum": [ "foo" ]
}
EOF

cat << 'EOF' > "$TMP/ignored.json"
{
  "invalid": "json"
EOF

"$1" lint "$TMP/schema.json" -i "$TMP/ignored.json" > /dev/null
