#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

cat << 'EOF' > "$TMP/tsconfig.json"
{
  "compilerOptions": {
    "target": "es5"
  }
}
EOF

cat << 'EOF' > "$TMP/schema.json"
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "string"
}
EOF

"$1" lint "$TMP" -i "$TMP/tsconfig.json" > "$TMP/result.txt" 2>&1

if grep -q "unexpected error: map::at" "$TMP/result.txt"; then
  echo "ERROR: map::at error still occurs"
  cat "$TMP/result.txt"
  exit 1
fi

echo "SUCCESS: No map::at error"
