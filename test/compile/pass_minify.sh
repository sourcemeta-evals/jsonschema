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

LINE_COUNT=$(wc -l < "$TMP/template.json")

if [ "$LINE_COUNT" -ne 1 ]; then
  echo "Expected minified output to be 1 line, got $LINE_COUNT"
  cat "$TMP/template.json"
  exit 1
fi

cat << 'EOF' > "$TMP/verify.sh"
import json
import sys
with open(sys.argv[1], 'r') as f:
    content = f.read()
    data = json.loads(content)
    assert 'dynamic' in data
    assert 'track' in data
    assert 'instructions' in data
EOF

python3 "$TMP/verify.sh" "$TMP/template.json"
