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

# The output should be minified (single line, no extra whitespace)
# Check that it doesn't contain multiple lines with indentation
if grep -q "^  " "$TMP/template.json"; then
  echo "Error: Output contains indentation, expected minified output"
  exit 1
fi

# Check that the output is valid JSON and contains expected fields
if ! grep -q '"dynamic"' "$TMP/template.json"; then
  echo "Error: Output doesn't contain expected 'dynamic' field"
  exit 1
fi

if ! grep -q '"track"' "$TMP/template.json"; then
  echo "Error: Output doesn't contain expected 'track' field"
  exit 1
fi

if ! grep -q '"instructions"' "$TMP/template.json"; then
  echo "Error: Output doesn't contain expected 'instructions' field"
  exit 1
fi

# Verify it's a single line (excluding the final newline)
line_count=$(wc -l < "$TMP/template.json")
if [ "$line_count" -ne 1 ]; then
  echo "Error: Expected single line output, got $line_count lines"
  exit 1
fi
