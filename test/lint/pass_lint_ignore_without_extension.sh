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

mkdir -p "$TMP/node_modules"
cat << 'EOF' > "$TMP/node_modules/ignored.json"
{
  "invalid": "json"
}
EOF

"$1" lint "$TMP" -i "$TMP/node_modules" && CODE="$?" || CODE="$?"
test "$CODE" = "0" || exit 1
