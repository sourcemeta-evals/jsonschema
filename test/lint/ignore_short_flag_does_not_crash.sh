#!/usr/bin/env sh
set -eu

TMPDIR="$(mktemp -d)"
trap 'rm -rf "$TMPDIR"' EXIT

echo '{}' > "$TMPDIR/valid.json"
echo '/** invalid json **/' > "$TMPDIR/invalid.json"

if OUTPUT="$(jsonschema lint "$TMPDIR"/valid.json "$TMPDIR"/invalid.json -i "$TMPDIR/invalid.json" 2>&1)"; then
  :
else
  true
fi
echo "$OUTPUT" | grep -qv "unexpected error: map::at"

if OUTPUT2="$(jsonschema lint "$TMPDIR"/invalid.json 2>&1)"; then
  :
else
  true
fi
echo "$OUTPUT2" | grep -q "error: Failed to parse" || echo "$OUTPUT2" | grep -q "error:"

if OUTPUT3="$(jsonschema lint "$TMPDIR"/valid.json -i "$TMPDIR/valid.json" 2>&1)"; then
  :
else
  true
fi
echo "$OUTPUT3" | grep -qv "unexpected error: map::at"
