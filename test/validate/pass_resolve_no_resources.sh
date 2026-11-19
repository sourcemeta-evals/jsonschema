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

# In Draft 7 and older, `$ref` overrides its sibling keywords, so a top-level
# schema that sets `$ref` does not introduce any schema resource
cat << 'EOF' > "$TMP/no-resources.json"
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
  --resolve "$TMP/no-resources.json" \
  > "$TMP/stdout.txt" 2> "$TMP/stderr.txt"

cat << 'EOF' > "$TMP/expected-stdout.txt"
EOF

cat << EOF > "$TMP/expected-stderr.txt"
warning: No schema resources were imported from this file
  at $(realpath "$TMP")/no-resources.json
Are you sure this schema sets any identifiers?
EOF

diff "$TMP/stdout.txt" "$TMP/expected-stdout.txt"
diff "$TMP/stderr.txt" "$TMP/expected-stderr.txt"
