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

"$1" lint "$TMP/a_no_reformat.json" --fix

cat << 'EOF' > "$TMP/a_expected.json"
  {
        "title":     "A number",
     "$schema":
   "http://json-schema.org/draft-06/schema#",    "type"    : "number"
}
EOF

diff "$TMP/a_no_reformat.json" "$TMP/a_expected.json"
