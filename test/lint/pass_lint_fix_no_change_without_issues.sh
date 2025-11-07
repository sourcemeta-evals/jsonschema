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

CHECKSUM_BEFORE="$(md5sum "$TMP/schema.json" | cut -d' ' -f1)"

"$1" lint "$TMP/schema.json" --fix 2>&1

CHECKSUM_AFTER="$(md5sum "$TMP/schema.json" | cut -d' ' -f1)"

if [ "$CHECKSUM_BEFORE" != "$CHECKSUM_AFTER" ]; then
  echo "ERROR: File was modified even though there were no lint issues"
  echo "Before: $CHECKSUM_BEFORE"
  echo "After: $CHECKSUM_AFTER"
  exit 1
fi
