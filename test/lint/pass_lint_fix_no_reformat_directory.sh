#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

# Create a schema with bad formatting that won't trigger any linting warning
cat << 'JSON' > "$TMP/no_lint.json"
  {
             "$schema":
   "http://json-schema.org/draft-06/schema#",    "type"    : "string"
}
JSON

# Create a schema that will trigger a linting warning (type with const)
cat << 'JSON' > "$TMP/with_lint.json"
{
  "$schema": "http://json-schema.org/draft-06/schema#",
  "type": "string",
  "const": "foo"
}
JSON

# Save original content for comparison
cp "$TMP/no_lint.json" "$TMP/no_lint_original.json"

"$1" lint "$TMP" --fix

# The file without lint warnings should remain unchanged
diff "$TMP/no_lint.json" "$TMP/no_lint_original.json"

# The file with lint warnings should be modified
# (const_with_type rule removes redundant type)
cat << 'JSON' > "$TMP/with_lint_expected.json"
{
  "$schema": "http://json-schema.org/draft-06/schema#",
  "const": "foo"
}
JSON

diff "$TMP/with_lint.json" "$TMP/with_lint_expected.json"
