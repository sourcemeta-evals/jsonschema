#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

cat << 'EOF' > "$TMP/ok.json"
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "string"
}
EOF

cat << 'EOF' > "$TMP/bad.json"
{
  "$schema": "http://json-schema.org/draft-06/schema#",
  "properties": {
    "foo": {
      "type": "string",
      "default": 1
    }
  }
}
EOF

"$1" lint "$TMP" -i "$TMP/bad.json" > "$TMP/stderr.txt" 2>&1 && CODE="$?" || CODE="$?"
test "$CODE" = "0" || exit 1

cat << 'EOF' > "$TMP/expected.txt"
EOF
diff "$TMP/stderr.txt" "$TMP/expected.txt"
