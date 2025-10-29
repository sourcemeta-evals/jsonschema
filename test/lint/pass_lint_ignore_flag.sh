#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

cat << 'EOF' > "$TMP/schema.json"
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "name": {
      "type": "string"
    }
  }
}
EOF

"$1" lint -i .angular -i node_modules --json >"$TMP/output.json" 2>&1

cat << EOF > "$TMP/expected.json"
{
  "valid": true,
  "errors": []
}
EOF

diff "$TMP/output.json" "$TMP/expected.json"
