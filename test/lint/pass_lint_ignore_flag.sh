#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

cat << 'EOF' > "$TMP/schema1.json"
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object"
}
EOF

cat << 'EOF' > "$TMP/schema2.json"
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "string"
}
EOF

cat << 'EOF' > "$TMP/schema3.json"
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "number"
}
EOF

"$1" lint "$TMP/schema1.json" "$TMP/schema2.json" "$TMP/schema3.json" -i "$TMP/schema1.json" -i "$TMP/schema2.json" >"$TMP/output.txt" 2>&1 && CODE="$?" || CODE="$?"
test "$CODE" = "0" || exit 1

cat "$TMP/output.txt"
