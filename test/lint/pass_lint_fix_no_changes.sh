#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

# Create a badly formatted schema with no lint violations
cat << 'SCHEMA_EOF' > "$TMP/schema.json"
  {
             "$schema":
   "http://json-schema.org/draft-06/schema#",    "type"    : "string"
}
SCHEMA_EOF

# Make a copy to compare against
cp "$TMP/schema.json" "$TMP/original.json"

# Run lint --fix
"$1" lint "$TMP/schema.json" --fix

# The file should remain unchanged since no lint rules apply
diff "$TMP/original.json" "$TMP/schema.json"
