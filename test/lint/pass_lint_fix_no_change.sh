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

"$1" lint --fix "$TMP/schema.json"

if ! cmp -s "$TMP/schema.json" "$TMP/original.json"; then
  echo "ERROR: File was modified when no lint rules should have applied"
  echo "Original:"
  cat "$TMP/original.json"
  echo "After lint --fix:"
  cat "$TMP/schema.json"
  exit 1
fi
