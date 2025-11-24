#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

mkdir -p "$TMP/ignored_dir"

cat << 'EOF' > "$TMP/schema.json"
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "string"
}
EOF

cat << 'EOF' > "$TMP/ignored_dir/ignored_schema.json"
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "invalid"
}
EOF

# Test that -i flag works and ignores the specified directory
"$1" lint "$TMP" -i "$TMP/ignored_dir" > "$TMP/result.txt" 2>&1

# Should only lint schema.json, not ignored_schema.json
cat << 'EOF' > "$TMP/output.txt"
EOF

diff "$TMP/result.txt" "$TMP/output.txt"
