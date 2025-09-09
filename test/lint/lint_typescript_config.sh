#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

cat << 'EOF' > "$TMP/tsconfig.json"
{
  // This is a comment that will cause JSON parsing to fail
  "compilerOptions": {
    "target": "es2020",
    "module": "commonjs"
  }
}
EOF

"$1" lint "$TMP/tsconfig.json" 2>"$TMP/stderr.txt" && CODE="$?" || CODE="$?"

if [ "$CODE" = "0" ]
then
  echo "Expected non-zero exit code for invalid JSON" 1>&2
  exit 1
fi

if grep -q "unexpected error: map::at" "$TMP/stderr.txt"
then
  echo "Still getting unhelpful map::at error for JSON parse failure" 1>&2
  cat "$TMP/stderr.txt" 1>&2
  exit 1
fi

if ! grep -q "Failed to parse the JSON document" "$TMP/stderr.txt"
then
  echo "Did not get expected JSON parse error message" 1>&2
  cat "$TMP/stderr.txt" 1>&2
  exit 1
fi
