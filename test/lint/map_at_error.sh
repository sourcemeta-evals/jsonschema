#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

echo '/** This is a comment */' > "$TMP/malformed.json"
cat > "$TMP/valid.json" << 'EOF'
{"$schema": "http://json-schema.org/draft-07/schema#", "type": "object"}
EOF

"$1" lint "$TMP/valid.json" "$TMP/malformed.json" 2>&1 | grep -q "Invalid access to JSON data structure"

"$1" lint --verbose "$TMP/valid.json" 2>&1 | grep -q "Processing file:"

"$1" lint "$TMP/valid.json" > /dev/null

echo "PASS: map::at error handling test"
