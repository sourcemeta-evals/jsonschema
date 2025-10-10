#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

cat << 'SCHEMA' > "$TMP/schema1.json"
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "string"
}
SCHEMA

cat << 'SCHEMA' > "$TMP/schema2.json"
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "number"
}
SCHEMA

"$1" lint "$TMP/schema1.json" "$TMP/schema2.json" -i "$TMP/schema1.json" > "$TMP/result.txt" 2>&1

cat << 'OUTPUT' > "$TMP/output.txt"
OUTPUT

diff "$TMP/result.txt" "$TMP/output.txt"
