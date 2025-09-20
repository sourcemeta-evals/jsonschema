#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

cat << 'EOF' > "$TMP/tsconfig.json"
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "string"
}
EOF

cat << 'EOF' > "$TMP/tsconfig.app.json"
/**
 * Comment that makes this invalid JSON
 */
{
  "type": "string"
}
EOF

"$1" lint "$TMP"/tsconfig*.json -i "$TMP/tsconfig.app.json" >"$TMP/output.txt" 2>&1 && CODE="$?" || CODE="$?"
test "$CODE" = "0" || exit 1

! grep -q "unexpected error" "$TMP/output.txt" || exit 1
