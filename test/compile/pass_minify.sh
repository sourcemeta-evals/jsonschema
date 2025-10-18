#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

cat << 'SCHEMA_EOF' > "$TMP/schema.json"
{
  "$id": "https://example.com",
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "additionalProperties": {
    "type": "string"
  }
}
SCHEMA_EOF

"$1" compile "$TMP/schema.json" --minify > "$TMP/template.json"

cat << 'EXPECTED_EOF' > "$TMP/expected.json"
{"dynamic":false,"track":true,"instructions":[{"t":61,"s":"/additionalProperties","i":"","k":"https://example.com#/additionalProperties","r":2,"v":{"t":0,"v":null},"c":[{"t":11,"s":"/type","i":"","k":"https://example.com#/additionalProperties/type","r":2,"v":{"t":8,"v":4},"c":[]},{"t":46,"s":"","i":"","k":"https://example.com#/additionalProperties","r":2,"v":{"t":0,"v":null},"c":[]}]}]}
EXPECTED_EOF

diff "$TMP/template.json" "$TMP/expected.json"
