#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

cat << 'SCHEMAEOF' > "$TMP/schema1.json"
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "string"
}
SCHEMAEOF

cat << 'SCHEMAEOF' > "$TMP/schema2.json"
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "number"
}
SCHEMAEOF

# Test that -i flag works correctly and doesn't cause map::at error
"$1" lint "$TMP/schema1.json" "$TMP/schema2.json" -i "$TMP/schema1.json" > "$TMP/result.txt" 2>&1

# Should have no output since schema1 is ignored and schema2 is valid
cat << 'OUTPUTEOF' > "$TMP/output.txt"
OUTPUTEOF

diff "$TMP/result.txt" "$TMP/output.txt"
