#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

# Create a directory structure with schemas
mkdir -p "$TMP/schemas"
mkdir -p "$TMP/ignored"

cat << 'SCHEMA' > "$TMP/schemas/schema.json"
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "string"
}
SCHEMA

cat << 'SCHEMA' > "$TMP/ignored/bad_schema.json"
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "allOf": [
    { "type": "string" }
  ]
}
SCHEMA

# Test that lint works with -i flag (this was causing map::at error)
cd "$TMP/schemas"
"$1" lint -i "$TMP/ignored" > "$TMP/result.txt" 2>&1

# Should succeed without errors
cat << 'OUTPUT' > "$TMP/output.txt"
OUTPUT

diff "$TMP/result.txt" "$TMP/output.txt"
