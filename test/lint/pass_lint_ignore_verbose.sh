#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

mkdir -p "$TMP/dir"
cat << 'EOF' > "$TMP/dir/schema.json"
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "string",
  "enum": [ "foo" ]
}
EOF

"$1" lint "$TMP/dir" --verbose -i "$TMP/dir" >"$TMP/stderr.txt" 2>&1 && CODE="$?" || CODE="$?"
test "$CODE" = "0" || exit 1

REAL_IGNORED="$(realpath "$TMP")/dir"
cat << EOF > "$TMP/expected.txt"
Ignoring path: $REAL_IGNORED
EOF

diff "$TMP/stderr.txt" "$TMP/expected.txt"
