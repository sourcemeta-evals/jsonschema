#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

# This file has bad formatting but is valid JSON and has no lint errors
cat << 'EOF' > "$TMP/schema.json"
  {
             "$schema":
   "http://json-schema.org/draft-06/schema#",    "type"    : "string"
}
EOF

# Run lint --fix
"$1" lint "$TMP/schema.json" --fix

# The file should NOT have changed because there were no lint errors
# Even though the formatting is weird, lint --fix should only touch files with lint errors
cat << 'EOF' > "$TMP/expected.json"
  {
             "$schema":
   "http://json-schema.org/draft-06/schema#",    "type"    : "string"
}
EOF

diff "$TMP/schema.json" "$TMP/expected.json"
