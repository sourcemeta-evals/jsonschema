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

mkdir -p "$TMP/node_modules"
cat << 'IGNORED' > "$TMP/node_modules/test.json"
{
  "invalid": "schema"
}
IGNORED

# Test that -i flag works without causing map::at error
"$1" lint -i node_modules "$TMP/schema.json" > "$TMP/result.txt" 2>&1

# Should succeed with no output
cat << 'OUTPUT' > "$TMP/output.txt"
OUTPUT

diff "$TMP/result.txt" "$TMP/output.txt"
