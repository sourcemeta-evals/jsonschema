#!/usr/bin/env sh
set -eu

TMPDIR="$(mktemp -d)"
trap 'rm -rf "$TMPDIR"' EXIT

mkdir -p "$TMPDIR/sub"

cat > "$TMPDIR/schema.json" <<'JSON'
{"$schema":"https://json-schema.org/draft/2020-12/schema","type":"object"}
JSON

echo '/** invalid /**' > "$TMPDIR/bad.json"

if OUT="$(./build/jsonschema lint -i "$TMPDIR" 2>&1)"; then
  echo "$OUT" | grep -qi 'unexpected error' && { echo "Found unexpected error"; echo "$OUT"; exit 1; }
else
  echo "$OUT" | grep -qi 'unexpected error' && { echo "Found unexpected error"; echo "$OUT"; exit 1; }
fi

exit 0
