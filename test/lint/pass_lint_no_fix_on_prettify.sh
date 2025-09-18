#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

echo '{"$schema":"http://json-schema.org/draft-06/schema#","type":"string"}' > "$TMP/schema.json"

cp "$TMP/schema.json" "$TMP/schema.json.bak"

"$1" lint "$TMP/schema.json" --fix

diff "$TMP/schema.json" "$TMP/schema.json.bak"
