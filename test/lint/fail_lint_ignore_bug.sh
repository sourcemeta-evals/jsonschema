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
  "type": "object"
}
EOF

"$1" lint "$TMP/schema.json" -i "$TMP/ignore.json" > "$TMP/result.txt" 2>&1

test $? -eq 0 || exit 1

! grep -q "unexpected error: map::at" "$TMP/result.txt" || exit 1

echo "Test passed: No map::at error with -i flag"
