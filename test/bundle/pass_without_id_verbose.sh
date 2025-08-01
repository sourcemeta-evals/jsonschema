#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

cat << 'EOF' > "$TMP/schema.json"
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://example.com",
  "$ref": "nested"
}
EOF

mkdir "$TMP/schemas"
cat << 'EOF' > "$TMP/schemas/remote.json"
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://example.com/nested",
  "type": "string"
}
EOF

"$1" bundle "$TMP/schema.json" --resolve "$TMP/schemas" --without-id --verbose 1> "$TMP/result.json" 2>&1

cat << EOF > "$TMP/expected.json"
Detecting schema resources from file: $(realpath "$TMP")/schemas/remote.json
Importing schema into the resolution context: file://$(realpath "$TMP")/schemas/remote.json
Importing schema into the resolution context: https://example.com/nested
warning: You are opting in to remove schema identifiers in the bundled schema.
The only legit use case of this advanced feature we know of it to workaround
non-compliant JSON Schema implementations such as Visual Studio Code.
In other case, this is not needed and may harm other use cases. For example,
you will be unable to reference the resulting schema from other schemas
using the --resolve/-r option.
{
  "\$schema": "https://json-schema.org/draft/2020-12/schema",
  "\$ref": "#/\$defs/https%3A~1~1example.com~1nested",
  "\$defs": {
    "https://example.com/nested": {
      "\$schema": "https://json-schema.org/draft/2020-12/schema",
      "type": "string"
    }
  }
}
EOF

diff "$TMP/result.json" "$TMP/expected.json"
