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

# Save the original file's modification time
if [ "$(uname)" = "Darwin" ]; then
  ORIGINAL_MTIME=$(stat -f "%m" "$TMP/schema.json")
else
  ORIGINAL_MTIME=$(stat -c "%Y" "$TMP/schema.json")
fi

# Wait a moment to ensure any file modification would change the mtime
sleep 1

# Run lint --fix
"$1" lint "$TMP/schema.json" --fix

# Check that the file was NOT modified (mtime should be the same)
if [ "$(uname)" = "Darwin" ]; then
  NEW_MTIME=$(stat -f "%m" "$TMP/schema.json")
else
  NEW_MTIME=$(stat -c "%Y" "$TMP/schema.json")
fi

if [ "$ORIGINAL_MTIME" != "$NEW_MTIME" ]; then
  echo "ERROR: File was modified when it should not have been"
  exit 1
fi

# Verify the file content is still the same (badly formatted)
cat << 'EXPECTED' > "$TMP/expected.json"
  {
             "$schema":
   "http://json-schema.org/draft-06/schema#",    "type"    : "string"
}
EXPECTED

diff "$TMP/schema.json" "$TMP/expected.json"
