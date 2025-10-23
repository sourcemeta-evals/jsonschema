#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

cat << 'EOF' > "$TMP/schema.json"
{
  "$id": "https://example.com",
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "additionalProperties": {
    "type": "string"
  }
}
EOF

"$1" compile "$TMP/schema.json" --minify > "$TMP/template.json"

if [ "$(grep -cv '^$' "$TMP/template.json")" -ne 1 ]; then
  echo "Expected minified output to be a single line"
  exit 1
fi

grep -q '"dynamic":false' "$TMP/template.json"
grep -q '"track":true' "$TMP/template.json"
grep -q '"instructions":\[' "$TMP/template.json"

python3 -c "import json; json.load(open('$TMP/template.json'))"
