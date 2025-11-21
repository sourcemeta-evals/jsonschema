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
  "type": "string"
}
EOF

"$1" compile "$TMP/schema.json" --minify > "$TMP/template.json"

# Check that the output is minified (single line)
LINES=$(wc -l < "$TMP/template.json")
if [ "$LINES" -ne 1 ]; then
  echo "Expected minified output to be a single line, got $LINES lines"
  exit 1
fi

# Check that the output contains the expected content (without pretty-printing)
if ! grep -q '{"dynamic":false,"track":true,"instructions":\[' "$TMP/template.json"; then
  echo "Minified output does not contain expected content"
  cat "$TMP/template.json"
  exit 1
fi

# Compare with non-minified output to ensure they produce different formatting
"$1" compile "$TMP/schema.json" > "$TMP/template_pretty.json"

# The pretty version should have more lines than the minified version
PRETTY_LINES=$(wc -l < "$TMP/template_pretty.json")
if [ "$PRETTY_LINES" -le 1 ]; then
  echo "Expected pretty output to have multiple lines, got $PRETTY_LINES lines"
  exit 1
fi
