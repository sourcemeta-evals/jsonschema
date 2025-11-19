#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

cat << 'EOF' > "$TMP/valid.json"
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object"
}
EOF

cat << 'EOF' > "$TMP/invalid.json"
/**
 * This is a comment that makes it invalid JSON
 */
{
  "type": "object"
}
EOF

"$1" lint "$TMP" -i "$TMP/invalid.json" > "$TMP/result.txt" 2>&1

cat << 'EOF' > "$TMP/output.txt"
EOF

diff "$TMP/result.txt" "$TMP/output.txt"
