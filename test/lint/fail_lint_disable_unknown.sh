#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

cat << 'EOF' > "$TMP/schema.json"
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "string",
  "contentMediaType": "application/json",
  "enum": [ "foo" ]
}
EOF

cd "$TMP"
"$1" lint "$TMP/schema.json" --exclude foo_bar >"$TMP/stdout.txt" 2>"$TMP/stderr.txt" && CODE="$?" || CODE="$?"
test "$CODE" = "1" || exit 1

cat << EOF > "$TMP/expected-stderr.txt"
warning: Cannot exclude unknown rule: foo_bar
EOF

cat << EOF > "$TMP/expected-stdout.txt"
schema.json:4:3:
  The \`contentMediaType\` keyword is meaningless without the presence of the \`contentEncoding\` keyword (content_media_type_without_encoding)
    at location "/contentMediaType"
schema.json:5:3:
  An \`enum\` of a single value can be expressed as \`const\` (enum_to_const)
    at location "/enum"
schema.json:5:3:
  Setting \`type\` alongside \`enum\` is considered an anti-pattern, as the enumeration choices already imply their respective types (enum_with_type)
    at location "/enum"
EOF

diff "$TMP/stderr.txt" "$TMP/expected-stderr.txt"
diff "$TMP/stdout.txt" "$TMP/expected-stdout.txt"
