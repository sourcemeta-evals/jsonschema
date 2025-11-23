#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

# Create a badly formatted schema that has no lint issues
cat << 'EOF' > "$TMP/schema.json"
  {
             "$schema":
   "http://json-schema.org/draft-06/schema#",    "type"    : "string"
}
EOF

# Save the original content
cp "$TMP/schema.json" "$TMP/original.json"

# Run lint --fix
"$1" lint "$TMP/schema.json" --fix

# The file should NOT be modified since no lint rules apply
diff "$TMP/schema.json" "$TMP/original.json"
