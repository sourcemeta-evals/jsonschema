#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

# Create a badly formatted schema that won't trigger any lint warnings
cat << 'SCHEMA' > "$TMP/schema.json"
  {
             "$schema":
   "http://json-schema.org/draft-06/schema#",    "type"    : "string"
}
SCHEMA

# Store the original file's content
ORIGINAL_CONTENT=$(cat "$TMP/schema.json")

# Run lint --fix
"$1" lint "$TMP/schema.json" --fix 2>&1

# Get the new content
NEW_CONTENT=$(cat "$TMP/schema.json")

# Verify the file was not modified (content should be identical)
if [ "$ORIGINAL_CONTENT" != "$NEW_CONTENT" ]; then
  echo "ERROR: File was modified even though no lint rules applied"
  echo "Original:"
  echo "$ORIGINAL_CONTENT"
  echo "New:"
  echo "$NEW_CONTENT"
  exit 1
fi

# Success - file was not modified
exit 0
