#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

cat << 'EOF' > "$TMP/tsconfig.app.json"
/* This is a comment that makes JSON parsing fail */
{
  "compilerOptions": {
    "strict": true
  }
}
EOF

cat << 'EOF' > "$TMP/tsconfig.doc.json"
/* This is a comment that makes JSON parsing fail */
{
  "compilerOptions": {
    "strict": true
  }
}
EOF

cat << 'EOF' > "$TMP/tsconfig.json"
/* This is a comment that makes JSON parsing fail */
{
  "compilerOptions": {
    "strict": true
  }
}
EOF

cat << 'EOF' > "$TMP/tsconfig.spec.json"
/* This is a comment that makes JSON parsing fail */
{
  "compilerOptions": {
    "strict": true
  }
}
EOF

"$1" lint "$TMP"/tsconfig*.json -i "$TMP/tsconfig.app.json" -i "$TMP/tsconfig.doc.json" -i "$TMP/tsconfig.json" -i "$TMP/tsconfig.spec.json" > "$TMP/result.txt" 2>&1 && CODE="$?" || CODE="$?"

test "$CODE" = "0" || exit 1

if grep -q "unexpected error: map::at" "$TMP/result.txt"; then
  echo "ERROR: Found 'unexpected error: map::at' in output"
  cat "$TMP/result.txt"
  exit 1
fi
