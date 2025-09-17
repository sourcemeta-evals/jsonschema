#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

cat << 'EOF' > "$TMP/schema.json.schema"
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "id": "https://example.com"
}
EOF

"$1" lint "$TMP/schema.json.schema" --verbose > "$TMP/output.txt" 2>&1

cat << EOF > "$TMP/expected.txt"
Linting: $(realpath "$TMP")/schema.json.schema
EOF

diff "$TMP/output.txt" "$TMP/expected.txt"
