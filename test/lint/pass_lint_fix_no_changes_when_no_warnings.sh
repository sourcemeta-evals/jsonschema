#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

cat << 'EOF' > "$TMP/schema.json"
  {
             "$schema":
   "http://json-schema.org/draft-06/schema#",    "type"    : "string"
}
EOF

ORIGINAL_MTIME=$(stat -c %Y "$TMP/schema.json" 2>/dev/null || stat -f %m "$TMP/schema.json")
ORIGINAL_CONTENT=$(cat "$TMP/schema.json")

sleep 1

"$1" lint "$TMP/schema.json" --fix 2>&1

NEW_MTIME=$(stat -c %Y "$TMP/schema.json" 2>/dev/null || stat -f %m "$TMP/schema.json")
NEW_CONTENT=$(cat "$TMP/schema.json")

if [ "$ORIGINAL_CONTENT" != "$NEW_CONTENT" ]; then
  echo "ERROR: File content was modified when no lint warnings were present"
  echo "Original:"
  echo "$ORIGINAL_CONTENT"
  echo "New:"
  echo "$NEW_CONTENT"
  exit 1
fi

if [ "$ORIGINAL_MTIME" != "$NEW_MTIME" ]; then
  echo "ERROR: File was rewritten even though no lint warnings were present"
  exit 1
fi

echo "PASS: File was not modified when no lint warnings were present"
