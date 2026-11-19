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

cat << 'EOF' > "$TMP/instance.json"
"foo"
EOF

cat << 'EOF' > "$TMP/no-resources.json"
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "$ref": "http://json-schema.org/draft-04/schema#"
}
EOF

"$1" validate "$TMP/schema.json" "$TMP/instance.json" \
  --resolve "$TMP/no-resources.json" --verbose > "$TMP/stdout.txt" 2> "$TMP/stderr.txt"

cat << EOF > "$TMP/expected.txt"
Detecting schema resources from file: $(realpath "$TMP")/no-resources.json
warning: No schema resources were imported from this file
  at $(realpath "$TMP")/no-resources.json
Are you sure this schema sets any identifiers?
ok: $(realpath "$TMP")/instance.json
  matches $(realpath "$TMP")/schema.json
EOF

diff "$TMP/stderr.txt" "$TMP/expected.txt"
test ! -s "$TMP/stdout.txt"
