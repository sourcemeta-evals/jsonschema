#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

cat << 'JSON' > "$TMP/schema.json"
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "string"
}
JSON

cat << 'JSON' > "$TMP/ignored.json"
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "string"
}
JSON

"$1" lint "$TMP/schema.json" -i "$TMP/ignored.json" > "$TMP/result.txt" 2>&1

cat << 'EXPECTED' > "$TMP/output.txt"
EXPECTED

diff "$TMP/result.txt" "$TMP/output.txt"
