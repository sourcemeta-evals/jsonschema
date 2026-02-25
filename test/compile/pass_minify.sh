#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

cat << 'EOF' > "$TMP/schema.json"
{
  "$id": "https://example.com",
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "additionalProperties": {
    "type": "string"
  }
}
EOF

"$1" compile "$TMP/schema.json" > "$TMP/template-pretty.json"
"$1" compile "$TMP/schema.json" --minify > "$TMP/template-minify.json"

[ "$(wc -l < "$TMP/template-minify.json")" -eq 1 ]

printf '%s\n' "$(tr -d ' \n' < "$TMP/template-pretty.json")" \
  > "$TMP/expected-minify.json"

diff "$TMP/template-minify.json" "$TMP/expected-minify.json"
