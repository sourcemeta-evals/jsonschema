#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

cat << 'EOF' > "$TMP/schema.json"
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "string",
  "minLength": 1
}
EOF

cp "$TMP/schema.json" "$TMP/original.json"

"$1" lint "$TMP/schema.json" --fix

diff "$TMP/original.json" "$TMP/schema.json"
