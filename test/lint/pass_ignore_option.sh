#!/bin/sh

TMP="$(mktemp -d)"

cleanup() {
  rm -rf "$TMP"
}
trap cleanup EXIT INT HUP

mkdir -p "$TMP/schemas" "$TMP/ignored"

cat << 'EOF' > "$TMP/schemas/schema.json"
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "string"
}
EOF

cat << 'EOF' > "$TMP/ignored/bad.json"
/** not json */
EOF

"$1" lint "$TMP/schemas" -i "$TMP/ignored" --json > "$TMP/result.json"

cat << 'EOF' > "$TMP/expected.json"
{
  "valid": true,
  "errors": []
}
EOF

diff -u "$TMP/expected.json" "$TMP/result.json"
