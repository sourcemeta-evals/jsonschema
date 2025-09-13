#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

cat << 'EOF' > "$TMP/bad_schema.json"
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "string",
  "enum": [ "foo" ]
}
EOF

cat << 'EOF' > "$TMP/good_schema.json"
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "string"
}
EOF

"$1" lint "$TMP" -i "$TMP/bad_schema.json" > "$TMP/result.txt" 2>&1 && CODE="$?" || CODE="$?"

test "$CODE" = "0" || exit 1

if grep -q "enum_with_type" "$TMP/result.txt"; then
  echo "ERROR: Ignored file was still processed"
  cat "$TMP/result.txt"
  exit 1
fi

echo "SUCCESS: Ignore functionality works correctly"
