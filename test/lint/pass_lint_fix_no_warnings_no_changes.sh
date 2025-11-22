#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

# Create a badly formatted schema that won't trigger any lint warnings
cat << 'EOF' > "$TMP/schema.json"
  {
             "$schema":
   "http://json-schema.org/draft-06/schema#",    "type"    : "string"
}
EOF

# Store the original file's modification time and content
ORIGINAL_MTIME=$(stat -c %Y "$TMP/schema.json" 2>/dev/null || stat -f %m "$TMP/schema.json")
ORIGINAL_CONTENT=$(cat "$TMP/schema.json")

# Sleep briefly to ensure modification time would change if file is written
sleep 1

# Run lint --fix
"$1" lint "$TMP/schema.json" --fix 2>&1

# Get the new modification time and content
NEW_MTIME=$(stat -c %Y "$TMP/schema.json" 2>/dev/null || stat -f %m "$TMP/schema.json")
NEW_CONTENT=$(cat "$TMP/schema.json")

# Verify the file was not modified (same mtime and content)
if [ "$ORIGINAL_MTIME" != "$NEW_MTIME" ]; then
  echo "ERROR: File modification time changed when it shouldn't have"
  exit 1
fi

if [ "$ORIGINAL_CONTENT" != "$NEW_CONTENT" ]; then
  echo "ERROR: File content changed when it shouldn't have"
  echo "Original:"
  echo "$ORIGINAL_CONTENT"
  echo "New:"
  echo "$NEW_CONTENT"
  exit 1
fi

echo "PASS: File was not modified when no lint warnings were present"
