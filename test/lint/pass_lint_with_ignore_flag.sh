#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

# Create a valid schema file
cat << 'SCHEMA' > "$TMP/schema.json"
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "string"
}
SCHEMA

# Create a directory to ignore
mkdir -p "$TMP/ignored"
cat << 'IGNORED' > "$TMP/ignored/other.json"
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "number"
}
IGNORED

# Test that -i flag works without causing map::at error
# This is a regression test for the bug where options.at("e") was called
# when options.contains("i") was true
"$1" lint "$TMP/schema.json" -i "$TMP/ignored" > "$TMP/result.txt" 2>&1

# Verify no error output
cat << 'EOF' > "$TMP/output.txt"
