#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

# Create a valid schema
cat << 'SCHEMA' > "$TMP/schema.json"
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "string"
}
SCHEMA

# Create a directory to ignore
mkdir -p "$TMP/node_modules"
cat << 'SCHEMA' > "$TMP/node_modules/bad.json"
{
  "invalid": "schema"
}
SCHEMA

# Run lint with -i flag (this used to crash with "unexpected error: map::at")
"$1" lint "$TMP" -i "$TMP/node_modules" > "$TMP/result.txt" 2>&1

# Should succeed without crashing
exit 0
