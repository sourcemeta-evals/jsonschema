#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

mkdir "$TMP/schemas"

cat << 'EOF' > "$TMP/schemas/schema1.json"
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "string"
}
EOF

cat << 'EOF' > "$TMP/schemas/schema2.json"
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": ["string"]
}
EOF

cat << 'EOF' > "$TMP/schemas/schema3.json"
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "number"
}
EOF

"$1" lint "$TMP/schemas" --ignore "$TMP/schemas/schema2.json" -i "$TMP/schemas/schema3.json" > "$TMP/result.txt" 2>&1

cat << 'EOF' > "$TMP/expected.txt"
EOF

diff "$TMP/result.txt" "$TMP/expected.txt"
