#!/bin/sh

set -o errexit
set -o nounset

TEST_DIR="$(mktemp -d)"
cd "$TEST_DIR"

cat > tsconfig.json << 'EOF'
/**
 * This is a comment that causes JSON parsing to fail
 */
{
  "compilerOptions": {
    "target": "es2015"
  }
}
EOF

cat > tsconfig.app.json << 'EOF'
/**
 * Another comment
 */
{
  "extends": "./tsconfig.json"
}
EOF

echo "Testing lint command with ignore flags..."

if "$1" lint -i tsconfig.app.json 2>&1 | grep -q "unexpected error: map::at"; then
  echo "FAIL: Still getting map::at error"
  exit 1
fi

if "$1" lint -i tsconfig.app.json --verbose 2>&1 | grep -q "unexpected error: map::at"; then
  echo "FAIL: Still getting map::at error with verbose"
  exit 1
fi

echo "PASS: No map::at errors detected"

cd /
rm -rf "$TEST_DIR"
