#!/bin/sh
#

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
cleanup() { rm -rf "$TMP"; }
trap cleanup EXIT

mkdir -p "$TMP/ignored_dir"
mkdir -p "$TMP/check_dir"

cat << 'EOF' > "$TMP/check_dir/schema.json"
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object"
}
EOF

echo '{}' > "$TMP/ignored_dir/ignored.json"

"$1" lint -i "$TMP/ignored_dir" "$TMP/check_dir" >"$TMP/stdout.txt" 2>"$TMP/stderr.txt"

if grep -q "unexpected error: map::at" "$TMP/stderr.txt"; then
  echo "Found unexpected crash message in stderr"
  exit 1
fi

test ! -s "$TMP/stderr.txt"
