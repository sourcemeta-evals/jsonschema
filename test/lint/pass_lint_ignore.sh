#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

cat << 'EOF' > "$TMP/schema_1.json"
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "string"
}
EOF

cat << 'EOF' > "$TMP/schema_2.json"
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "number"
}
EOF

cat << 'EOF' > "$TMP/schema_3.json"
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "boolean"
}
EOF

"$1" lint "$TMP" --ignore "$TMP/schema_1.json"
"$1" lint "$TMP" -i "$TMP/schema_1.json"
"$1" lint "$TMP" -i "$TMP/schema_1.json" -i "$TMP/schema_2.json"
"$1" lint "$TMP/schema_1.json" "$TMP/schema_2.json" "$TMP/schema_3.json" -i "$TMP/schema_1.json" -i "$TMP/schema_2.json"
