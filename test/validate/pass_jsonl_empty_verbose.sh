#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

cat << 'EOF' > "$TMP/schema.json"
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "properties": {
    "foo": {
      "type": "string"
    }
  }
}
EOF

touch "$TMP/instance.jsonl"

"$1" validate "$TMP/schema.json" "$TMP/instance.jsonl" --verbose > "$TMP/stdout.txt" 2> "$TMP/stderr.txt"

cat << EOF > "$TMP/expected.txt"
Interpreting input as JSONL: $(realpath "$TMP")/instance.jsonl
warning: The JSONL file is empty
EOF

test ! -s "$TMP/stdout.txt"
diff "$TMP/stderr.txt" "$TMP/expected.txt"
