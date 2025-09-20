#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

cat << 'EOF' > "$TMP/schema.json"
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "string"
}
EOF

"$1" lint "$TMP/schema.json" -i "$TMP/nonexistent" >"$TMP/output.txt" 2>&1 && CODE="$?" || CODE="$?"
test "$CODE" = "0" || exit 1

! grep -q "unexpected error" "$TMP/output.txt" || exit 1
