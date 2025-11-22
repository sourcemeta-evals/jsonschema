#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

# Create directories to ignore
mkdir -p "$TMP/.angular"
mkdir -p "$TMP/node_modules"
mkdir -p "$TMP/schemas"

# Run lint with ignore flags but no schema files in an empty directory
# This should not crash with "map::at" error
"$1" lint "$TMP/schemas" -i "$TMP/.angular" -i "$TMP/node_modules" > "$TMP/result.txt" 2>&1

# Expected output should be empty (no schemas to lint)
cat << 'EOF' > "$TMP/output.txt"
EOF

diff "$TMP/result.txt" "$TMP/output.txt"
