#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

cat << 'EOF' > "$TMP/schema.json"
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "string"
}
EOF

cat << 'EOF' > "$TMP/instance.json"
"foo"
EOF

# In draft 7, a top-level reference overrides the resource identifier.
cat << 'EOF' > "$TMP/ref.json"
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$ref": "#"
}
EOF

"$1" validate "$TMP/schema.json" "$TMP/instance.json" \
  --resolve "$TMP/ref.json" > "$TMP/stdout.txt" 2> "$TMP/stderr.txt"

cat << EOF > "$TMP/expected-stderr.txt"
warning: No schema resources were imported from this file
  at $(realpath "$TMP")/ref.json
Are you sure this schema sets any identifiers?
EOF

diff "$TMP/stderr.txt" "$TMP/expected-stderr.txt"
test ! -s "$TMP/stdout.txt"
