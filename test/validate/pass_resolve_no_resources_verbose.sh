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

# A Draft 7 top-level reference overrides the implicit file identifier.
cat << 'EOF' > "$TMP/unused.json"
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$ref": "#/definitions/foo",
  "definitions": {
    "foo": { "type": "string" }
  }
}
EOF

"$1" validate "$TMP/schema.json" "$TMP/instance.json" \
  --resolve "$TMP/unused.json" --verbose > "$TMP/stdout.txt" 2> "$TMP/stderr.txt"

cat << EOF > "$TMP/expected.txt"
Detecting schema resources from file: $(realpath "$TMP")/unused.json
warning: No schema resources were imported from this file
  at $(realpath "$TMP")/unused.json
Are you sure this schema sets any identifiers?
ok: $(realpath "$TMP")/instance.json
  matches $(realpath "$TMP")/schema.json
EOF

test ! -s "$TMP/stdout.txt"
diff "$TMP/stderr.txt" "$TMP/expected.txt"
