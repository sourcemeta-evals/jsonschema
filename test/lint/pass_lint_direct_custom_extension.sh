#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

mkdir "$TMP/schemas"

cat << 'EOF' > "$TMP/schema.json.schema"
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "id": "https://example.com"
}
EOF

"$1" lint --resolve "$TMP/schema.json.schema" "$TMP/schema.json.schema" || true
