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

"$1" compile "$TMP/schema.json" --fast --minify > "$TMP/template_long.json"
"$1" compile "$TMP/schema.json" --fast -m > "$TMP/template_short.json"

cat << 'EOF' > "$TMP/expected.json"
{"dynamic":false,"track":false,"instructions":[{"t":72,"s":"/additionalProperties","i":"","k":"https://example.com#/additionalProperties","r":2,"v":{"t":8,"v":4},"c":[]}]}
EOF

diff "$TMP/template_long.json" "$TMP/expected.json"
diff "$TMP/template_short.json" "$TMP/expected.json"
