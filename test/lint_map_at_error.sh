#!/bin/sh

set -o errexit
set -o nounset

TEST_DIR="$(mktemp -d)"
cd "$TEST_DIR"

cat > schema.json << 'EOF'
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object"
}
EOF

cat > tsconfig.json << 'EOF'
/**
 * This is a comment that causes parse errors
 */
{
  "compilerOptions": {
    "target": "es2020"
  }
}
EOF

echo "Testing lint command with ignore flags..."

if ! jsonschema lint schema.json -i tsconfig.json 2>&1; then
  echo "ERROR: lint command failed unexpectedly"
  exit 1
fi

if ! jsonschema lint schema.json -i tsconfig.json -i nonexistent.json 2>&1; then
  echo "ERROR: lint command with multiple ignore flags failed"
  exit 1
fi

if ! jsonschema lint schema.json --exclude nonexistent-rule 2>&1; then
  echo "ERROR: lint command with exclude flag failed"
  exit 1
fi

if ! jsonschema lint schema.json -x nonexistent-rule 2>&1; then
  echo "ERROR: lint command with -x flag failed"
  exit 1
fi

echo "All tests passed - no map::at errors occurred"

cd /
rm -rf "$TEST_DIR"
