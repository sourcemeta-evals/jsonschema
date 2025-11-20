#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

cat << 'EOF' > "$TMP/schema.json"
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "string"
}
EOF

mkdir -p "$TMP/ignore_dir"

cat << 'EOF' > "$TMP/ignore_dir/schema2.json"
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "number"
}
EOF

"$1" lint "$TMP/schema.json" -i "$TMP/ignore_dir" > "$TMP/result.txt" 2>&1

cat << 'EOF' > "$TMP/output.txt"
EOF

diff "$TMP/result.txt" "$TMP/output.txt"
