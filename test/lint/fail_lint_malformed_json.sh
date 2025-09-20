#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

cat << 'EOF' > "$TMP/malformed.json"
/**
 * This is not valid JSON
 */
{
  "type": "string"
}
EOF

"$1" lint "$TMP/malformed.json" >"$TMP/stderr.txt" 2>&1 && CODE="$?" || CODE="$?"
test "$CODE" = "1" || exit 1

grep -q "Failed to parse the JSON document at line 1 and column 1" "$TMP/stderr.txt" || exit 1
grep -q "malformed.json" "$TMP/stderr.txt" || exit 1
! grep -q "unexpected error" "$TMP/stderr.txt" || exit 1
