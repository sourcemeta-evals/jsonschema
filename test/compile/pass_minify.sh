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

LINES="$(wc -l < "$TMP/template.json")"
if [ "$LINES" -ne 1 ]; then
  echo "Expected minified output to be 1 line, got $LINES lines"
  exit 1
fi

cat << 'EOF' > "$TMP/verify.sh"
#!/bin/sh
grep -q '"dynamic":false' "$1" || exit 1
grep -q '"track":true' "$1" || exit 1
grep -q '"instructions":\[' "$1" || exit 1
EOF

chmod +x "$TMP/verify.sh"
"$TMP/verify.sh" "$TMP/template.json"
