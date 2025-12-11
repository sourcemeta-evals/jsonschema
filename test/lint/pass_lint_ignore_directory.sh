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

mkdir "$TMP/ignored"
cat << 'EOF' > "$TMP/ignored/schema.json"
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "enum": [ "foo" ],
  "type": "string"
}
EOF

"$1" lint "$TMP" -i "$TMP/ignored"

cat << 'EOF' > "$TMP/expected.json"
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "string"
}
EOF

diff "$TMP/schema.json" "$TMP/expected.json"
