#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

cat << 'EOF' > "$TMP/schema.json"
  {
             "$schema":
   "http://json-schema.org/draft-06/schema#",    "type"    : "string"
}
EOF

MOD_TIME_BEFORE=$(stat -c %Y "$TMP/schema.json")

sleep 1.1

"$1" lint "$TMP/schema.json" --fix

MOD_TIME_AFTER=$(stat -c %Y "$TMP/schema.json")

if [ "$MOD_TIME_BEFORE" != "$MOD_TIME_AFTER" ]; then
  echo "Error: File was modified even though no lint rules applied"
  exit 1
fi

cat << 'EOF' > "$TMP/expected.json"
  {
             "$schema":
   "http://json-schema.org/draft-06/schema#",    "type"    : "string"
}
EOF

diff "$TMP/schema.json" "$TMP/expected.json"
