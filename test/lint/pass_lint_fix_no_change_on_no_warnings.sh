#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

cat << 'SCHEMA' > "$TMP/schema.json"
  {
             "$schema":
   "http://json-schema.org/draft-06/schema#",    "type"    : "string"
}
SCHEMA

cp "$TMP/schema.json" "$TMP/expected.json"

"$1" lint "$TMP/schema.json" --fix

diff "$TMP/schema.json" "$TMP/expected.json"
