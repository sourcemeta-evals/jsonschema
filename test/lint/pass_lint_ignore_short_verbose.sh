#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

cat << 'EOF' > "$TMP/schema1.json"
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "string"
}
EOF

cat << 'EOF' > "$TMP/schema2.json"
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "number"
}
EOF

"$1" lint "$TMP" -i "$TMP/schema2.json" --verbose >"$TMP/stderr.txt" 2>&1

cat << EOF > "$TMP/expected.txt"
Ignoring path: $(realpath "$TMP")/schema2.json
Linting: $(realpath "$TMP")/schema1.json
EOF

diff "$TMP/stderr.txt" "$TMP/expected.txt"

cat << 'EOF' > "$TMP/expected1.json"
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "string"
}
EOF

diff "$TMP/schema1.json" "$TMP/expected1.json"
