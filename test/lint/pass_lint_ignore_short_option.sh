#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

cat << 'EOF' > "$TMP/schema.json"
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "string"
}
EOF

cat << 'EOF' > "$TMP/tsconfig.json"
/**
 * JSONC comments are not valid JSON
 */
{
  "compilerOptions": {}
}
EOF

"$1" lint "$TMP" -i "$TMP/tsconfig.json" >"$TMP/stdout.txt" 2>"$TMP/stderr.txt" && CODE="$?" || CODE="$?"
test "$CODE" = "0" || exit 1

test ! -s "$TMP/stdout.txt"
test ! -s "$TMP/stderr.txt"
