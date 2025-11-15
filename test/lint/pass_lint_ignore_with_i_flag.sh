#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

# Create a directory structure with some files to ignore
mkdir -p "$TMP/node_modules"
mkdir -p "$TMP/src"

cat << 'SCHEMA' > "$TMP/src/schema.json"
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "string"
}
SCHEMA

cat << 'SCHEMA' > "$TMP/node_modules/ignored.json"
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "invalid"
}
SCHEMA

# Run lint with -i flag to ignore node_modules
# This should not crash with "unexpected error: map::at"
"$1" lint -i node_modules "$TMP/src" > "$TMP/result.txt" 2>&1

# The output should be empty (no lint errors)
cat << 'OUTPUT' > "$TMP/output.txt"
OUTPUT

diff "$TMP/result.txt" "$TMP/output.txt"
