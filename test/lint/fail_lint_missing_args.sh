#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

"$1" lint -i .angular -i node_modules >"$TMP/stderr.txt" 2>&1 && CODE="$?" || CODE="$?"
test "$CODE" = "1" || exit 1

grep -q "Missing required arguments" "$TMP/stderr.txt"
grep -q "Use '--help' for usage information" "$TMP/stderr.txt"
