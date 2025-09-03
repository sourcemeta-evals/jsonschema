#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

cat << 'EOF' > "$TMP/schema.json"
  {
             "$schema":
   "http://json-schema.org/draft-06/schema#",    "type"    : "string"
}
EOF

"$1" lint "$TMP/schema.json" --fix

cp "$TMP/schema.json" "$TMP/original.json"

diff "$TMP/original.json" "$TMP/schema.json"
