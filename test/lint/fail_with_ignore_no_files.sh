#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

cat << 'EOF' > "$TMP/tsconfig.json"
{
  /** This is a comment that causes JSON parse error */
  "compilerOptions": {
    "target": "es2015"
  }
}
EOF

"$1" lint -i "$TMP/tsconfig.json" 2>"$TMP/stderr.txt" && CODE="$?" || CODE="$?"

if [ "$CODE" = "1" ]
then
  cat "$TMP/stderr.txt"
  grep -q "error: Missing required arguments" "$TMP/stderr.txt"
  grep -q "Use '--help' for usage information" "$TMP/stderr.txt"
else
  echo "Expected exit code 1 but got $CODE" 1>&2
  exit 1
fi
