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

LINES=$(wc -l < "$TMP/template.json")
if [ "$LINES" -ne 1 ]; then
  echo "Expected 1 line, got $LINES"
  exit 1
fi

cat << 'EOF' > "$TMP/check.sh"
import json
import sys

with open(sys.argv[1], 'r') as f:
    data = json.load(f)
    
assert 'dynamic' in data, "Missing 'dynamic' field"
assert 'track' in data, "Missing 'track' field"
assert 'instructions' in data, "Missing 'instructions' field"
assert isinstance(data['instructions'], list), "'instructions' should be a list"
assert len(data['instructions']) > 0, "'instructions' should not be empty"

print("Minified output is valid")
EOF

python3 "$TMP/check.sh" "$TMP/template.json"
