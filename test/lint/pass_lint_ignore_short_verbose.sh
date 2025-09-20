#!/bin/sh
set -e

TMP="$(mktemp -d)"
cleanup() { rm -rf "$TMP"; }
trap cleanup EXIT

cat <<'EOF' > "$TMP/invalid.json"
/** invalid json */
EOF

"$1" lint "$TMP/invalid.json" -i "$TMP/invalid.json" --verbose 1>/dev/null 2>"$TMP/stderr.txt"

grep -q "Ignoring path: $(realpath "$TMP")/invalid.json" "$TMP/stderr.txt"
