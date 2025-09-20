#!/bin/sh

set -eu

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

cat << 'EOF' > "$TMP/schema.json"
  {
             "$schema":
   "http://json-schema.org/draft-06/schema#",    "type"    : "string"
}
EOF

cp "$TMP/schema.json" "$TMP/original.json"

"$1" lint "$TMP/schema.json" --fix > "$TMP/output.txt" 2>&1 || true

if ! cmp -s "$TMP/schema.json" "$TMP/original.json"; then
  echo "Expected no changes to file when no lint warnings apply" >&2
  echo "----- original -----" >&2
  cat "$TMP/original.json" >&2
  echo "----- actual -----" >&2
  cat "$TMP/schema.json" >&2
  exit 1
fi

: > "$TMP/expected_output.txt"
cmp -s "$TMP/output.txt" "$TMP/expected_output.txt"
