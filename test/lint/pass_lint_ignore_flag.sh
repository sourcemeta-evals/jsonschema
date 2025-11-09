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

cat << 'EOF' > "$TMP/ignored.json"
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "number"
}
EOF

"$1" lint "$TMP/schema.json" -i "$TMP/ignored.json" > "$TMP/result.txt" 2>&1

if grep -q "unexpected error: map::at" "$TMP/result.txt"; then
  echo "FAIL: Found 'unexpected error: map::at' in output"
  cat "$TMP/result.txt"
  exit 1
fi

cat << 'EOF' > "$TMP/output.txt"
EOF

diff "$TMP/result.txt" "$TMP/output.txt"
