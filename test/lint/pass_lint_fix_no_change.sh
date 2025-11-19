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

BEFORE="$(cat "$TMP/schema.json")"

"$1" lint "$TMP/schema.json" --fix

AFTER="$(cat "$TMP/schema.json")"

if [ "$BEFORE" != "$AFTER" ]; then
  echo "FAIL: File was modified even though no lint warnings applied" >&2
  exit 1
fi
