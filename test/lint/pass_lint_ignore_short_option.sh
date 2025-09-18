#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

mkdir -p "$TMP/.angular" "$TMP/node_modules"

cat << 'EOF' > "$TMP/.angular/ignored.json"
{"$schema":"https://json-schema.org/draft/2020-12/schema","type":"object"}
EOF

cat << 'EOF' > "$TMP/node_modules/ignored.json"
{"$schema":"https://json-schema.org/draft/2020-12/schema","type":"string"}
EOF

cat << 'EOF' > "$TMP/root.json"
{"$schema":"https://json-schema.org/draft/2020-12/schema","type":"number"}
EOF

cd "$TMP"
"$1" lint -i .angular -i node_modules --verbose > out.txt 2>&1

grep -q "Ignoring path:" out.txt
grep -q "Linting:" out.txt
