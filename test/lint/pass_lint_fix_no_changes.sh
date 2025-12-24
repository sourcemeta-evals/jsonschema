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

ORIGINAL_MTIME=$(stat -c %Y "$TMP/schema.json")
ORIGINAL_HASH=$(md5sum "$TMP/schema.json" | cut -d' ' -f1)

"$1" lint "$TMP/schema.json" --fix 2>&1

NEW_MTIME=$(stat -c %Y "$TMP/schema.json")
NEW_HASH=$(md5sum "$TMP/schema.json" | cut -d' ' -f1)

if [ "$ORIGINAL_HASH" != "$NEW_HASH" ]; then
  echo "ERROR: File was modified even though no lint rules applied"
  echo "Original hash: $ORIGINAL_HASH"
  echo "New hash: $NEW_HASH"
  echo "File content after lint:"
  cat "$TMP/schema.json"
  exit 1
fi

cat << 'EOF' > "$TMP/expected.json"
  {
             "$schema":
   "http://json-schema.org/draft-06/schema#",    "type"    : "string"
}
EOF

diff "$TMP/schema.json" "$TMP/expected.json"
