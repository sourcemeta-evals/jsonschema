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

cat << 'EOF' > "$TMP/ignore.json"
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "number"
}
EOF

"$1" lint "$TMP/schema.json" -i "$TMP/ignore.json" >"$TMP/output.txt" 2>&1 && CODE="$?" || CODE="$?"

test "$CODE" = "0" || exit 1
