#!/bin/sh
set -o errexit
set -o nounset

TMP="$(mktemp -d)"
cd "$TMP"

OUTPUT=$("$1" lint -i .angular -i node_modules 2>&1 || true)

if echo "$OUTPUT" | grep -q "unexpected error: map::at"; then
  echo "FAIL: Still getting map::at error"
  echo "Output: $OUTPUT"
  exit 1
fi

echo "PASS: No map::at crash detected"
