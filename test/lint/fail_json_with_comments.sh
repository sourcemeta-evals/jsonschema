#!/bin/bash

set -euo pipefail

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

cat << 'EOF' > "$TMP/tsconfig.app.json"
/** TypeScript app config */ { "compilerOptions": { "target": "es2020" } }
EOF

cat << 'EOF' > "$TMP/tsconfig.doc.json"
/** Doc config */ { "compilerOptions": { "target": "es2020" } }
EOF

cat << 'EOF' > "$TMP/tsconfig.json"
/** Main config */ { "compilerOptions": { "target": "es2020" } }
EOF

cat << 'EOF' > "$TMP/tsconfig.spec.json"
/** Spec config */ { "compilerOptions": { "target": "es2020" } }
EOF

if "$1" lint "$TMP"/tsconfig*.json -i "$TMP/tsconfig.app.json" -i "$TMP/tsconfig.doc.json" -i "$TMP/tsconfig.json" -i "$TMP/tsconfig.spec.json" 2> "$TMP/stderr.txt"; then
  echo "Expected lint to fail but it succeeded"
  exit 1
fi

if grep -q "unexpected error: map::at" "$TMP/stderr.txt"; then
  echo "Still getting unhelpful 'unexpected error: map::at' message"
  cat "$TMP/stderr.txt"
  exit 1
fi

if ! grep -q "Internal processing error\|invalid JSON syntax\|valid JSON" "$TMP/stderr.txt"; then
  echo "Not getting expected helpful error message"
  cat "$TMP/stderr.txt"
  exit 1
fi

if ! grep -q "This may be caused by invalid JSON syntax" "$TMP/stderr.txt"; then
  echo "Not getting the specific improved error message"
  cat "$TMP/stderr.txt"
  exit 1
fi

echo "Test passed: Got helpful error message instead of 'unexpected error: map::at'"
