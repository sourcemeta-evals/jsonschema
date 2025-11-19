#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

cat << 'SCHEMA_EOF' > "$TMP/schema.json"
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "string"
}
SCHEMA_EOF

cat << 'SCHEMA_EOF' > "$TMP/ignored.json"
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "number"
}
SCHEMA_EOF

"$1" lint "$TMP/schema.json" -i "$TMP/ignored.json" > "$TMP/result.txt" 2>&1

cat << 'OUTPUT_EOF' > "$TMP/output.txt"
OUTPUT_EOF

diff "$TMP/result.txt" "$TMP/output.txt"
