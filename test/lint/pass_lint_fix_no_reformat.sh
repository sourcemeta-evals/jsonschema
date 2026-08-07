#!/bin/bash

set -eu

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

cat << 'EOF' > "$TMP/a_no_reformat.json"
  {
        "title":     "A number",
     "$schema":
   "http://json-schema.org/draft-06/schema#",    "type"    : "number"
}
EOF

ORIGINAL_SIZE=$(wc -c < "$TMP/a_no_reformat.json")

"$1" lint "$TMP/a_no_reformat.json" --fix

CURRENT_SIZE=$(wc -c < "$TMP/a_no_reformat.json")

test "$ORIGINAL_SIZE" -eq "$CURRENT_SIZE"
