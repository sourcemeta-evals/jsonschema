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

cp "$TMP/schema.json" "$TMP/original.json"
ORIGINAL_MTIME=$(stat -c %Y "$TMP/schema.json" 2>/dev/null || stat -f %m "$TMP/schema.json")

sleep 1

"$1" lint "$TMP/schema.json" --fix 2>&1

NEW_MTIME=$(stat -c %Y "$TMP/schema.json" 2>/dev/null || stat -f %m "$TMP/schema.json")

if [ "$ORIGINAL_MTIME" != "$NEW_MTIME" ]; then
  echo "ERROR: File was modified when it should not have been"
  exit 1
fi

diff "$TMP/schema.json" "$TMP/original.json"
