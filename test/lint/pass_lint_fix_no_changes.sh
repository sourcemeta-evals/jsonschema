#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

# Create a badly formatted schema that won't trigger any lint warnings
cat << 'EOF' > "$TMP/schema.json"
  {
             "$schema":
   "http://json-schema.org/draft-06/schema#",    "type"    : "string"
}
EOF

# Save the original content for comparison
cp "$TMP/schema.json" "$TMP/original.json"

# Run lint --fix
"$1" lint "$TMP/schema.json" --fix 2>&1

# The file should remain unchanged since no lint rules applied
diff "$TMP/schema.json" "$TMP/original.json"
