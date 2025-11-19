#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

cat << 'SCHEMA' > "$TMP/schema.json"
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "string"
}
SCHEMA

cat << 'SCHEMA' > "$TMP/ignore.json"
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "number"
}
SCHEMA

"$1" lint "$TMP" -i "$TMP/ignore.json" > "$TMP/result.txt" 2>&1

cat << 'OUTPUT' > "$TMP/output.txt"
OUTPUT

diff "$TMP/result.txt" "$TMP/output.txt"
