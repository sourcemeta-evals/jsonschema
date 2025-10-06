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

"$1" compile "$TMP/schema.json" --fast --minify > "$TMP/template.json"

lines=$(wc -l < "$TMP/template.json")
if [ "$lines" -ne "1" ]; then
  echo "Expected 1 line, got $lines"
  exit 1
fi

python3 -c "import sys, json; json.load(sys.stdin)" < "$TMP/template.json" 2>/dev/null
