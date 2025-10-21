#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

cat << 'EOF' > "$TMP/schema1.json"
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "string"
}
EOF

cat << 'EOF' > "$TMP/schema2.json"
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "number"
}
EOF

OLDPWD="$(pwd)"
cd "$TMP"
"$1" lint -i schema1.json -i schema2.json >"$TMP/stderr.txt" 2>&1 && CODE="$?" || CODE="$?"
cd "$OLDPWD"

test "$CODE" = "0" || exit 1

[ ! -s "$TMP/stderr.txt" ]
