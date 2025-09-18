#!/bin/sh

set -o errexit
set -o nounset

BIN="$1"

TMP="$(mktemp -d)"
cleanup() { rm -rf "$TMP"; }
trap cleanup EXIT

cd "$TMP"

mkdir -p .angular node_modules
printf '/** comment to break JSON parser */\n' > tsconfig.app.json
printf '/** comment to break JSON parser */\n' > tsconfig.doc.json
printf '/** comment to break JSON parser */\n' > tsconfig.json
printf '/** comment to break JSON parser */\n' > tsconfig.spec.json

cat << 'EOF' > schema.json
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "string"
}
EOF

# 1) Using -i should never crash with "unexpected error: map::at"
"$BIN" lint -i .angular -i node_modules > "$TMP/out1.txt" 2>&1 || true
if grep -q "unexpected error: map::at" "$TMP/out1.txt"; then
  echo "Found unexpected error in ignore-only run" 1>&2
  cat "$TMP/out1.txt"
  exit 1
fi

"$BIN" lint tsconfig*.json > "$TMP/out2.txt" 2>&1 && CODE="$?" || CODE="$?"
test "$CODE" != "0" || (echo "Expected non-zero exit code" 1>&2 && exit 1)
grep -q "Failed to parse the JSON document" "$TMP/out2.txt"

"$BIN" lint tsconfig*.json -i tsconfig.app.json > "$TMP/out3.txt" 2>&1 || true
if grep -q "unexpected error: map::at" "$TMP/out3.txt"; then
  echo "Found unexpected error when ignoring a file" 1>&2
  cat "$TMP/out3.txt"
  exit 1
fi

"$BIN" lint --verbose -i .angular -i node_modules > "$TMP/out4.txt" 2>&1 || true
if grep -q "unexpected error: map::at" "$TMP/out4.txt"; then
  echo "Found unexpected error in verbose ignore-only run" 1>&2
  cat "$TMP/out4.txt"
  exit 1
fi

"$BIN" lint schema.json > "$TMP/out5.txt" 2>&1
if [ -s "$TMP/out5.txt" ]; then
  echo "Expected no output for valid lint" 1>&2
  cat "$TMP/out5.txt"
  exit 1
fi
