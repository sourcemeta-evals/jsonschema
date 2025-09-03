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

"$1" lint "$TMP/schema.json" --fix

if ! diff "$TMP/schema.json" "$TMP/original.json" > /dev/null 2>&1; then
  echo "ERROR: File was modified when it should not have been"
  echo "Original:"
  cat "$TMP/original.json"
  echo "Modified:"
  cat "$TMP/schema.json"
  exit 1
fi
