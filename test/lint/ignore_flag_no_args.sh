#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

cd "$TMP"

"$1" lint -i .angular -i node_modules 2>"$TMP/stderr.txt" || EXIT_CODE="$?"

if [ "${EXIT_CODE:-0}" -eq 0 ]; then
  echo "FAIL: Expected non-zero exit code" 1>&2
  exit 1
fi

if grep -q "map::at" "$TMP/stderr.txt"; then
  echo "FAIL: Still contains map::at error" 1>&2
  cat "$TMP/stderr.txt" 1>&2
  exit 1
fi

if ! grep -q "Internal options parsing error\|missing command arguments\|invalid option usage" "$TMP/stderr.txt"; then
  echo "FAIL: Missing helpful error message" 1>&2
  cat "$TMP/stderr.txt" 1>&2
  exit 1
fi

echo "PASS: -i flag without arguments handled gracefully"
