#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

cat << 'EOF' > "$TMP/schema.json"
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "properties": {
    "foo": {
      "type": "string"
    }
  }
}
EOF

cat << 'EOF' > "$TMP/instance.json"
{ "foo": "bar" }
EOF

cat << 'EOF' > "$TMP/template.json"
{ "foo": 1 }
EOF

"$1" validate "$TMP/schema.json" "$TMP/instance.json" \
  --verbose --template "$TMP/template.json" \
  > "$TMP/stdout.txt" 2> "$TMP/stderr.txt"

cat << 'EOF' > "$TMP/expected-stdout.txt"
EOF

cat << EOF > "$TMP/expected-stderr.txt"
Parsing pre-compiled schema template: $(realpath "$TMP")/template.json
warning: Failed to parse pre-compiled schema template. Compiling from scratch
ok: $(realpath "$TMP")/instance.json
  matches $(realpath "$TMP")/schema.json
annotation: "foo"
  at instance location "" (line 1, column 1)
  at evaluate path "/properties"
EOF

diff "$TMP/stdout.txt" "$TMP/expected-stdout.txt"
diff "$TMP/stderr.txt" "$TMP/expected-stderr.txt"
