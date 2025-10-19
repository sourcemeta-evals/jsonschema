#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

mkdir -p "$TMP/node_modules"
mkdir -p "$TMP/.angular"

cat << 'EOF' > "$TMP/node_modules/package.json"
{
  "name": "test",
  "version": "1.0.0"
}
EOF

cat << 'EOF' > "$TMP/.angular/config.json"
{
  "version": 1
}
EOF

"$1" lint -i "$TMP/node_modules" -i "$TMP/.angular" > "$TMP/result.txt" 2>&1 && CODE="$?" || CODE="$?"

test "$CODE" = "0" || exit 1

if grep -q "unexpected error: map::at" "$TMP/result.txt"; then
  echo "ERROR: Found 'unexpected error: map::at' in output"
  cat "$TMP/result.txt"
  exit 1
fi
