#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

cat << 'EOF' > "$TMP/schema1.json"
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object"
}
EOF

cat << 'EOF' > "$TMP/schema2.json"
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "string"
}
EOF

mkdir -p "$TMP/node_modules"
cat << 'EOF' > "$TMP/node_modules/test.json"
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "number"
}
EOF

mkdir -p "$TMP/.angular"
cat << 'EOF' > "$TMP/.angular/cache.json"
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "boolean"
}
EOF

cd "$TMP"

"$1" lint -i node_modules -i .angular 2>&1 | tee "$TMP/output.txt"

if grep -q "unexpected error: map::at" "$TMP/output.txt"; then
  echo "FAIL: map::at error still occurs" >&2
  exit 1
fi

if grep -q "error:" "$TMP/output.txt"; then
  echo "FAIL: lint command produced errors" >&2
  cat "$TMP/output.txt" >&2
  exit 1
fi

echo "PASS: lint with ignore flags works without positional arguments"
