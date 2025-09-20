#!/bin/sh
set -eu

BIN=./build/dist/bin/jsonschema
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

cat > "$TMP/schema.json" <<'JSON'
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object"
}
JSON

cat > "$TMP/ignored.json" <<'JSON'
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "string"
}
JSON

OUT=$($BIN lint --ignore "$TMP/ignored.json" "$TMP/schema.json" "$TMP/ignored.json" 2>&1 || true)

echo "$OUT" | grep -q "unexpected error" && {
  echo "Found unexpected error in output:"
  echo "$OUT"
  exit 1
}

echo "Test passed: no unexpected error with --ignore option"
