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

HASH_BEFORE="$(md5sum "$TMP/schema.json" | cut -d' ' -f1)"

"$1" lint "$TMP/schema.json" --fix

HASH_AFTER="$(md5sum "$TMP/schema.json" | cut -d' ' -f1)"

if [ "$HASH_BEFORE" != "$HASH_AFTER" ]; then
  echo "ERROR: File was modified even though no lint rules applied"
  exit 1
fi
