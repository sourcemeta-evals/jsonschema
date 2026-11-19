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

# Draft 7 ignores identifiers next to a reference, leaving no resources to import.
cat << 'EOF' > "$TMP/remote.json"
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$ref": "http://json-schema.org/draft-07/schema#"
}
EOF

"$1" validate "$TMP/schema.json" "$TMP/instance.json" \
  --resolve "$TMP/remote.json" > "$TMP/stdout.txt" 2> "$TMP/stderr.txt"

cat << EOF > "$TMP/expected.txt"
warning: No schema resources were imported from this file
  at $(realpath "$TMP")/remote.json
Are you sure this schema sets any identifiers?
EOF

diff "$TMP/stderr.txt" "$TMP/expected.txt"
test ! -s "$TMP/stdout.txt"
