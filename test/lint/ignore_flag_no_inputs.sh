#!/bin/sh
set -eu

BIN="./build/dist/bin/jsonschema"

TMPDIR="$(mktemp -d)"
trap 'rm -rf "$TMPDIR"' EXIT

echo '{}' > "$TMPDIR/ok.json"

OUT="$("$BIN" lint -i "$TMPDIR" 2>&1 || true)"

echo "$OUT" | grep -F "unexpected error" && {
  echo "Did not expect an unexpected error"; exit 1;
}

exit 0
