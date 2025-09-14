#!/bin/sh
set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

cat << 'EOF' > "$TMP/invalid.json"
/**
 * This is invalid JSON due to comments
 */
{
  "test": "value"
}
EOF

cat << 'EOF' > "$TMP/valid.json"
{
  "test": "value"
}
EOF

"$1" lint -i "$TMP/invalid.json" "$TMP" 2>/dev/null || true

"$1" lint -i "$TMP/invalid.json" -i "nonexistent" "$TMP" 2>/dev/null || true

"$1" lint --ignore "$TMP/invalid.json" "$TMP" 2>/dev/null || true

"$1" lint -i "$TMP/invalid.json" "$TMP/valid.json" || true
