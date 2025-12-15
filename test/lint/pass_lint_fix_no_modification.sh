#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

# Create a badly formatted schema that does not trigger any lint warnings
cat << 'EOF' > "$TMP/schema.json"
  {
             "$schema":
   "http://json-schema.org/draft-06/schema#",    "type"    : "string"
}
EOF

# Save the original content
cp "$TMP/schema.json" "$TMP/original.json"

"$1" lint "$TMP/schema.json" --fix

# The file should NOT be modified since no lint rules applied
diff "$TMP/schema.json" "$TMP/original.json"
