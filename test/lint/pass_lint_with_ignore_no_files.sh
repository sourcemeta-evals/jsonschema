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

mkdir "$TMP/ignore_dir"
cat << 'EOF' > "$TMP/ignore_dir/schema2.json"
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "number"
}
EOF

cd "$TMP"
"$1" lint -i ignore_dir > "$TMP/result.txt" 2>&1

cat << 'EOF' > "$TMP/expected_output.txt"
EOF

diff "$TMP/result.txt" "$TMP/expected_output.txt"
