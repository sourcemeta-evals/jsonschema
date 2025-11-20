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
  "type": "string"
}
EOF

"$1" compile "$TMP/schema.json" --minify > "$TMP/result.json"

cat << 'EOF' > "$TMP/expected.json"
{"dynamic":false,"track":true,"instructions":[{"t":11,"s":"/type","i":"","k":"https://example.com#/type","r":2,"v":{"t":8,"v":4},"c":[]}]}
EOF

diff "$TMP/result.json" "$TMP/expected.json"

"$1" compile "$TMP/schema.json" -m > "$TMP/result2.json"
diff "$TMP/result2.json" "$TMP/expected.json"
