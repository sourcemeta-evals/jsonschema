#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

cat << 'EOF2' > "$TMP/schema.json"
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "string",
  "enum": [ "foo" ]
}
EOF2

cd "$TMP"
"$1" lint "$TMP/schema.json" --exclude foo_bar >"$TMP/stdout.txt" 2>"$TMP/stderr.txt" && CODE="$?" || CODE="$?"
test "$CODE" = "1" || exit 1

cat << EOF2 > "$TMP/expected-stderr.txt"
warning: Cannot exclude unknown rule: foo_bar
EOF2

diff "$TMP/stderr.txt" "$TMP/expected-stderr.txt"

cat << EOF2 > "$TMP/expected-stdout.txt"
schema.json:4:3:
  Setting \`type\` alongside \`enum\` is considered an anti-pattern, as the enumeration choices already imply their respective types (enum_with_type)
    at location "/enum"
EOF2

diff "$TMP/stdout.txt" "$TMP/expected-stdout.txt"
