#!/bin/sh
set -eu

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

cat << 'EOF' > "$TMP/schema.json"
  {
             "$schema":
   "http://json-schema.org/draft-06/schema#",    "type"    : "string"
}
EOF

cp "$TMP/schema.json" "$TMP/expected.json"

"$1" lint "$TMP/schema.json" --fix > "$TMP/output.txt" 2>&1 && CODE="$?" || CODE="$?"
test "$CODE" = "0" || exit 1

: > "$TMP/empty.txt"
diff "$TMP/output.txt" "$TMP/empty.txt"

diff "$TMP/schema.json" "$TMP/expected.json"
