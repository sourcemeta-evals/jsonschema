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
ORIGINAL_MTIME=$(stat -c %Y "$TMP/schema.json")

"$1" lint "$TMP/schema.json" --fix

NEW_MTIME=$(stat -c %Y "$TMP/schema.json")

if [ "$ORIGINAL_MTIME" != "$NEW_MTIME" ]; then
  echo "ERROR: File was modified even though no lint rules should apply"
  echo "Original:"
  cat "$TMP/original.json"
  echo "After lint --fix:"
  cat "$TMP/schema.json"
  exit 1
fi

diff "$TMP/original.json" "$TMP/schema.json"
