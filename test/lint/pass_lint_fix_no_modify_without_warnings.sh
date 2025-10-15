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

if command -v stat >/dev/null 2>&1; then
  ORIGINAL_MTIME=$(stat -c %Y "$TMP/schema.json" 2>/dev/null || stat -f %m "$TMP/schema.json")
else
  cp "$TMP/schema.json" "$TMP/schema_original.json"
fi

sleep 1

"$1" lint "$TMP/schema.json" --fix

if [ -f "$TMP/schema_original.json" ]; then
  if ! diff "$TMP/schema.json" "$TMP/schema_original.json" >/dev/null 2>&1; then
    echo "Error: File was modified even though no lint rules applied"
    exit 1
  fi
else
  NEW_MTIME=$(stat -c %Y "$TMP/schema.json" 2>/dev/null || stat -f %m "$TMP/schema.json")
  if [ "$ORIGINAL_MTIME" != "$NEW_MTIME" ]; then
    echo "Error: File was modified even though no lint rules applied"
    exit 1
  fi
fi

cat << 'EOF' > "$TMP/expected.json"
  {
             "$schema":
   "http://json-schema.org/draft-06/schema#",    "type"    : "string"
}
EOF

diff "$TMP/schema.json" "$TMP/expected.json"
