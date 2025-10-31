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
  "type": "object",
  "properties": {
    "name": {
      "type": "string"
    }
  }
}
EOF

"$1" compile "$TMP/schema.json" --minify > "$TMP/template.json"

LINES=$(wc -l < "$TMP/template.json")
if [ "$LINES" -ne 1 ]; then
  echo "Expected minified output to be a single line, but got $LINES lines"
  exit 1
fi

if ! command -v python3 > /dev/null 2>&1; then
  echo "Python3 not found, skipping JSON validation"
  exit 0
fi

python3 -c "import json; json.load(open('$TMP/template.json'))" || {
  echo "Output is not valid JSON"
  exit 1
}

python3 -c "
import json
data = json.load(open('$TMP/template.json'))
assert 'dynamic' in data, 'Missing dynamic field'
assert 'track' in data, 'Missing track field'
assert 'instructions' in data, 'Missing instructions field'
assert isinstance(data['instructions'], list), 'instructions should be a list'
print('Minified output is valid')
"
