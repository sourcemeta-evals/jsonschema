#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

# Create a JSONL file with schemas that will trigger lint issues.
# JSONL files have null position tracking, so this tests the JSON output
# sorting with null positions.
cat << 'SCHEMA' > "$TMP/schemas.jsonl"
{"$schema": "http://json-schema.org/draft-04/schema#", "type": "string", "enum": ["foo"]}
{"$schema": "http://json-schema.org/draft-04/schema#", "type": "number"}
SCHEMA

"$1" lint "$TMP/schemas.jsonl" --json >"$TMP/output.json" 2>&1 && EXIT_CODE="$?" || EXIT_CODE="$?"
# Lint violation
test "$EXIT_CODE" = "2" || exit 1

cat << EOF > "$TMP/expected.json"
{
  "valid": false,
  "health": 0,
  "errors": [
    {
      "path": "$(realpath "$TMP")/schemas.jsonl",
      "id": "enum_with_type",
      "message": "Setting \`type\` alongside \`enum\` is considered an anti-pattern, as the enumeration choices already imply their respective types",
      "description": null,
      "schemaLocation": "/enum",
      "position": null
    },
    {
      "path": "$(realpath "$TMP")/schemas.jsonl",
      "id": "enum_with_type",
      "message": "Setting \`type\` alongside \`enum\` is considered an anti-pattern, as the enumeration choices already imply their respective types",
      "description": null,
      "schemaLocation": "/type",
      "position": null
    },
    {
      "path": "$(realpath "$TMP")/schemas.jsonl",
      "id": "top_level_title",
      "message": "Set a concise non-empty title at the top level of the schema to explain what the definition is about",
      "description": null,
      "schemaLocation": "",
      "position": null
    },
    {
      "path": "$(realpath "$TMP")/schemas.jsonl",
      "id": "top_level_description",
      "message": "Set a non-empty description at the top level of the schema to explain what the definition is about in detail",
      "description": null,
      "schemaLocation": "",
      "position": null
    },
    {
      "path": "$(realpath "$TMP")/schemas.jsonl",
      "id": "top_level_title",
      "message": "Set a concise non-empty title at the top level of the schema to explain what the definition is about",
      "description": null,
      "schemaLocation": "",
      "position": null
    },
    {
      "path": "$(realpath "$TMP")/schemas.jsonl",
      "id": "top_level_description",
      "message": "Set a non-empty description at the top level of the schema to explain what the definition is about in detail",
      "description": null,
      "schemaLocation": "",
      "position": null
    }
  ]
}
EOF

diff "$TMP/output.json" "$TMP/expected.json"
