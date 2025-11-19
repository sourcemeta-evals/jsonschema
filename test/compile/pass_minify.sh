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

LINE_COUNT="$(wc -l < "$TMP/template.json")"
if [ "$LINE_COUNT" -ne 1 ]; then
  echo "Expected minified output to be on a single line, but got $LINE_COUNT lines"
  exit 1
fi

cat << 'EOF' > "$TMP/check.sh"
#!/bin/sh
if ! command -v jq > /dev/null 2>&1; then
  grep -q '"dynamic"' "$1" && grep -q '"track"' "$1" && grep -q '"instructions"' "$1"
else
  jq -e '.dynamic != null and .track != null and .instructions != null' "$1" > /dev/null
fi
EOF
chmod +x "$TMP/check.sh"

"$TMP/check.sh" "$TMP/template.json"
