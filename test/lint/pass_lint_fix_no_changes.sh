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

BEFORE="$(cksum < "$TMP/schema.json")"

"$1" lint --fix "$TMP/schema.json" 1> "$TMP/output.txt" 2>&1

AFTER="$(cksum < "$TMP/schema.json")"

if [ "$BEFORE" != "$AFTER" ]; then
  echo "FAIL: File was modified even though no lint rules applied" >&2
  echo "Before checksum: $BEFORE" >&2
  echo "After checksum: $AFTER" >&2
  exit 1
fi

if [ ! -f "$TMP/output.txt" ]; then
  echo "FAIL: Expected output file not created" >&2
  exit 1
fi
