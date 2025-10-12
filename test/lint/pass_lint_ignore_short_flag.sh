#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

cat << 'EOF' > "$TMP/schema.json"
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "string"
}
EOF

cat << 'EOF' > "$TMP/ignore.json"
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "integer"
}
EOF

"$1" lint "$TMP" -i "$TMP/ignore.json" 2>&1
