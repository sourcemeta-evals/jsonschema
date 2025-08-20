#!/bin/sh

set -o errexit
set -o nounset

JSONSCHEMA="$(pwd)/build/dist/bin/jsonschema"

TEMP_DIR=$(mktemp -d)
trap 'rm -rf "$TEMP_DIR"' EXIT

cd "$TEMP_DIR"

cat > valid.json << 'EOF'
{"$schema": "https://json-schema.org/draft/2020-12/schema", "type": "object"}
EOF

"$JSONSCHEMA" lint -i .angular -i node_modules valid.json

"$JSONSCHEMA" lint -i nonexistent_dir valid.json

"$JSONSCHEMA" lint -i .angular -i node_modules -i test_files valid.json

echo "All ignore pattern tests passed"
