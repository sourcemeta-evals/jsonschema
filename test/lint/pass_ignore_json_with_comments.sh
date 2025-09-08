#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

cat << 'EOF' > "$TMP/valid-schema.json"
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "object"
}
EOF

cat << 'EOF' > "$TMP/tsconfig.app.json"
/**
 * This is a comment that should cause JSON parsing to fail
 */
{
  "compilerOptions": {
    "target": "ES2020"
  }
}
EOF

"$1" lint "$TMP"/*.json -i "$TMP/tsconfig.app.json"
