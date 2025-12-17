#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

# A schema that has no lint warnings but is badly formatted
# The --fix option should NOT modify this file since no lint rules apply
cat << 'EOF' > "$TMP/schema.json"
{
             "$schema":
   "http://json-schema.org/draft-06/schema#",    "type"    : "string"
}
EOF

cp "$TMP/schema.json" "$TMP/expected.json"

"$1" lint "$TMP/schema.json" --fix

# The file should remain unchanged since no lint rules applied
diff "$TMP/schema.json" "$TMP/expected.json"
