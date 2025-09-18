#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() {
  rm -rf "$TMP"
}
trap clean EXIT

cat <<'EOF' >"$TMP/test.json"
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object"
}
EOF

"$1" lint "$TMP/test.json" -i non-existent-file 2>&1 |
  grep -v "unexpected error: map::at" || {
  echo "FAIL: map::at error still occurs with -i flag"
  exit 1
}
