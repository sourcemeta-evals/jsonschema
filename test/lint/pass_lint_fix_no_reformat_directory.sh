#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

mkdir -p "$TMP/schemas"

# This schema has bad formatting but no lint warnings - should remain unchanged
cat << 'EOF' > "$TMP/schemas/no_warnings.json"
  {
             "$schema":
   "http://json-schema.org/draft-06/schema#",    "type"    : "string"
}
EOF

# This schema has a lint warning (const makes type redundant) - should be modified
cat << 'EOF' > "$TMP/schemas/with_warnings.json"
{
  "$schema": "http://json-schema.org/draft-06/schema#",
  "type": "string",
  "const": "foo"
}
EOF

"$1" lint "$TMP/schemas" --fix

# no_warnings.json should remain unchanged (bad formatting preserved)
cat << 'EOF' > "$TMP/expected_no_warnings.json"
  {
             "$schema":
   "http://json-schema.org/draft-06/schema#",    "type"    : "string"
}
EOF

diff "$TMP/schemas/no_warnings.json" "$TMP/expected_no_warnings.json"

# with_warnings.json should be fixed (type removed since const makes it redundant)
cat << 'EOF' > "$TMP/expected_with_warnings.json"
{
  "$schema": "http://json-schema.org/draft-06/schema#",
  "const": "foo"
}
EOF

diff "$TMP/schemas/with_warnings.json" "$TMP/expected_with_warnings.json"
