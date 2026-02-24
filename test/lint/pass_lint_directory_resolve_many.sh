#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

mkdir "$TMP/schemas"

cat << 'EOF' > "$TMP/schemas/1.json"
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "title": "Test",
  "description": "Test schema",
  "id": "https://example.com/1"
}
EOF

cat << 'EOF' > "$TMP/schemas/2.json"
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "title": "Test",
  "description": "Test schema",
  "id": "https://example.com/2"
}
EOF

"$1" lint --resolve "$TMP/schemas" "$TMP/schemas" --verbose > "$TMP/output.txt" 2>&1

cat << EOF > "$TMP/expected.txt"
Linting: $(realpath "$TMP")/schemas/1.json
Linting: $(realpath "$TMP")/schemas/2.json
EOF

diff "$TMP/output.txt" "$TMP/expected.txt"
