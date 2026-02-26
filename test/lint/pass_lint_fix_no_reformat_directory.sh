#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

mkdir "$TMP/schemas"

# Schema with no lint warnings but badly formatted
# Should NOT be modified by lint --fix
cat << 'EOF' > "$TMP/schemas/clean.json"
  {
             "$schema":
   "http://json-schema.org/draft-06/schema#",    "type"    : "string"
}
EOF

# Schema with a lint warning (redundant type with const)
# Should be modified by lint --fix
cat << 'EOF' > "$TMP/schemas/needs_fix.json"
{
  "$schema": "http://json-schema.org/draft-06/schema#",
  "type": "string",
  "const": "foo"
}
EOF

"$1" lint "$TMP/schemas" --fix

# The clean schema should be left intact (preserving bad formatting)
cat << 'EOF' > "$TMP/expected_clean.json"
  {
             "$schema":
   "http://json-schema.org/draft-06/schema#",    "type"    : "string"
}
EOF

# The schema that needed fixing should be prettified
cat << 'EOF' > "$TMP/expected_needs_fix.json"
{
  "$schema": "http://json-schema.org/draft-06/schema#",
  "const": "foo"
}
EOF

diff "$TMP/schemas/clean.json" "$TMP/expected_clean.json"
diff "$TMP/schemas/needs_fix.json" "$TMP/expected_needs_fix.json"
