#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

cat << 'SCHEMA' > "$TMP/schema.json"
{
  "$id": "https://example.com",
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "additionalProperties": {
    "type": "string"
  }
}
SCHEMA

"$1" compile "$TMP/schema.json" --minify > "$TMP/template.json"

# Check that output is minified (no newlines except the final one)
# Count lines - should be 1 line (plus the trailing newline)
LINE_COUNT=$(wc -l < "$TMP/template.json")
if [ "$LINE_COUNT" -ne 1 ]; then
  echo "Error: Expected 1 line in minified output, got $LINE_COUNT"
  exit 1
fi

# Verify it's valid JSON and contains expected fields
cat << 'EXPECTED' > "$TMP/expected.json"
{"dynamic":false,"track":true,"instructions":[{"t":61,"s":"/additionalProperties","i":"","k":"https://example.com#/additionalProperties","r":2,"v":{"t":0,"v":null},"c":[{"t":11,"s":"/type","i":"","k":"https://example.com#/additionalProperties/type","r":2,"v":{"t":8,"v":4},"c":[]},{"t":46,"s":"","i":"","k":"https://example.com#/additionalProperties","r":2,"v":{"t":0,"v":null},"c":[]}]}]}
EXPECTED

diff "$TMP/template.json" "$TMP/expected.json"
