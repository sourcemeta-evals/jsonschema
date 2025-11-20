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

"$1" lint "$TMP/schema.json" -i "$TMP/schema.json" --verbose > "$TMP/result.txt" 2>&1

if grep -q "map::at" "$TMP/result.txt"; then
  echo "ERROR: Found 'map::at' in output"
  cat "$TMP/result.txt"
  exit 1
fi

if ! grep -q "Ignoring path:" "$TMP/result.txt"; then
  echo "ERROR: Verbose output not working"
  cat "$TMP/result.txt"
  exit 1
fi
