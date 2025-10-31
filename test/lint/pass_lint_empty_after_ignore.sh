#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

cat << 'EOF' > "$TMP/schema.json"
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object"
}
EOF

"$1" lint "$TMP/schema.json" -i "$TMP/schema.json" --verbose >"$TMP/output.txt" 2>&1 && CODE="$?" || CODE="$?"
test "$CODE" = "0" || exit 1

cat << EOF > "$TMP/expected.txt"
warning: No input files matched after applying ignore filters
EOF

diff "$TMP/output.txt" "$TMP/expected.txt"
