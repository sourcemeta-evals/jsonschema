#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

mkdir -p "$TMP/node_modules"
mkdir -p "$TMP/angular"

cat << 'EOF' > "$TMP/schema.json"
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "string"
}
EOF

cat << 'EOF' > "$TMP/node_modules/schema.json"
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "string",
  "enum": [ "foo" ]
}
EOF

cat << 'EOF' > "$TMP/angular/schema.json"
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "number",
  "enum": [ 1 ]
}
EOF

BINARY="$(realpath "$1")"
cd "$TMP"
"$BINARY" lint -i node_modules -i angular > "$TMP/output.txt" 2>&1

cat << EOF > "$TMP/expected.txt"
EOF

diff "$TMP/output.txt" "$TMP/expected.txt"
