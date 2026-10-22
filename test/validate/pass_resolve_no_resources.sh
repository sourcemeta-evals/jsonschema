#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

mkdir "$TMP/schemas"

cat << 'EOF' > "$TMP/schemas/only_reference.json"
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$ref": "https://example.com/other"
}
EOF

cat << 'EOF' > "$TMP/schema.json"
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "string"
}
EOF

cat << 'EOF' > "$TMP/instance.json"
"foo"
EOF

"$1" validate "$TMP/schema.json" "$TMP/instance.json" --resolve "$TMP/schemas" \
  > "$TMP/stdout.txt" 2> "$TMP/stderr.txt"

cat << EOF > "$TMP/expected-stderr.txt"
warning: No schema resources were imported from this file
  at $(realpath "$TMP")/schemas/only_reference.json
Are you sure this schema sets any identifiers?
EOF

diff "$TMP/stderr.txt" "$TMP/expected-stderr.txt"

cat << EOF > "$TMP/expected-stdout.txt"
EOF

diff "$TMP/stdout.txt" "$TMP/expected-stdout.txt"
