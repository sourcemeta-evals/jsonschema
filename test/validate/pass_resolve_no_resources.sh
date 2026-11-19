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

cat << 'EOF' > "$TMP/no-resources.json"
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$ref": "#/definitions/foo",
  "definitions": {
    "foo": { "type": "string" }
  }
}
EOF

"$1" validate "$TMP/schema.json" "$TMP/instance.json" \
  --resolve "$TMP/no-resources.json" > "$TMP/stdout.txt" 2> "$TMP/stderr.txt"

cat << EOF > "$TMP/expected.txt"
warning: No schema resources were imported from this file
  at $(realpath "$TMP")/no-resources.json
Are you sure this schema sets any identifiers?
EOF

test ! -s "$TMP/stdout.txt"
diff "$TMP/stderr.txt" "$TMP/expected.txt"
