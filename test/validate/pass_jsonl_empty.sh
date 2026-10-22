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

"$1" validate "$TMP/schema.json" "$TMP/instance.jsonl" > "$TMP/stdout.txt" 2> "$TMP/stderr.txt"

grep -q "warning: The JSONL file is empty" "$TMP/stderr.txt"
