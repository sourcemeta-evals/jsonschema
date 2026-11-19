#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

cat << 'EOF' > "$TMP/schema.json"
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "string"
}
EOF

cat << 'EOF' > "$TMP/instance.json"
"foo"
EOF

# On Draft 7 and older, a top-level `$ref` overrides its sibling keywords, so
# without any identifier there is no schema resource to import from this file
cat << 'EOF' > "$TMP/no-id.json"
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$ref": "#/definitions/string",
  "definitions": {
    "string": {
      "type": "string"
    }
  }
}
EOF

"$1" validate "$TMP/schema.json" "$TMP/instance.json" \
  --resolve "$TMP/no-id.json" > "$TMP/stdout.txt" 2> "$TMP/stderr.txt"

cat << EOF > "$TMP/expected-stdout.txt"
EOF

cat << EOF > "$TMP/expected-stderr.txt"
warning: No schema resources were imported from this file
  at $(realpath "$TMP")/no-id.json
Are you sure this schema sets any identifiers?
EOF

diff "$TMP/stdout.txt" "$TMP/expected-stdout.txt"
diff "$TMP/stderr.txt" "$TMP/expected-stderr.txt"
