#!/bin/sh
set -eu

BIN="./build/dist/bin/jsonschema"

TMPDIR="$(mktemp -d)"
trap 'rm -rf "$TMPDIR"' EXIT

echo '{ invalid' > "$TMPDIR/bad.json"
mkdir -p "$TMPDIR/ignored"
echo '{}' > "$TMPDIR/ignored/ok.json"

OUT="$("$BIN" lint "$TMPDIR/bad.json" -i "$TMPDIR/ignored" 2>&1 || true)"

echo "$OUT" | grep -F "unexpected error: map::at" && {
  echo "Did not expect an unexpected error"; exit 1;
}

echo "$OUT" | grep -F "Failed to parse the JSON document" >/dev/null 2>&1 || {
  echo "Expected a JSON parse error message"; echo "$OUT"; exit 1;
}

exit 0
