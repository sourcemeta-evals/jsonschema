#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

"$1" lint 2>"$TMP/stderr.txt" && CODE="$?" || CODE="$?"

if [ "$CODE" = "0" ]
then
  echo "Expected non-zero exit code" 1>&2
  exit 1
fi

if grep -q "unexpected error: map::at" "$TMP/stderr.txt"
then
  echo "Still getting unhelpful map::at error" 1>&2
  cat "$TMP/stderr.txt" 1>&2
  exit 1
fi

if ! grep -q "This command expects at least one schema file or directory" "$TMP/stderr.txt"
then
  echo "Did not get expected error message" 1>&2
  cat "$TMP/stderr.txt" 1>&2
  exit 1
fi
