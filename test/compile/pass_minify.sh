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

"$1" compile "$TMP/schema.json" > "$TMP/template_pretty.json"
"$1" compile -m "$TMP/schema.json" > "$TMP/template_min.json"

MIN_LINES=$(wc -l < "$TMP/template_min.json")
if [ "$MIN_LINES" -ne 1 ]
then
  echo "FAIL: Minified output is not a single line" 1>&2
  exit 1
fi

PRETTY_NOWS=$(tr -d '[:space:]' < "$TMP/template_pretty.json")
MINI_NOWS=$(tr -d '[:space:]' < "$TMP/template_min.json")

if [ "$PRETTY_NOWS" != "$MINI_NOWS" ]
then
  echo "FAIL: Minified content differs from pretty output when ignoring whitespace" 1>&2
  exit 1
fi

echo "PASS" 1>&2
