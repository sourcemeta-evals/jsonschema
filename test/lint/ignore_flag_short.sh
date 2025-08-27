#!/usr/bin/env bash
set -euo pipefail

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

mkdir -p "$TMP/ignored"
cat > "$TMP/schema.json" <<'JSON'
{ "$schema": "https://json-schema.org/draft/2020-12/schema", "type": "object" }
JSON

echo '{ invalid: }' > "$TMP/ignored/bad.json"

if [ ! -x "./build/jsonschema" ] && [ -x "./build/jsonschema_cli" ]; then
  ln -sf jsonschema_cli ./build/jsonschema
fi

OUTPUT="$(./build/jsonschema lint -i "$TMP/ignored" "$TMP/schema.json" 2>&1 || true)"

if grep -q "unexpected error" <<<"$OUTPUT"; then
  echo "lint crashed with unexpected error"
  exit 1
fi

if grep -q "$TMP/ignored/bad.json" <<<"$OUTPUT"; then
  echo "ignored file was processed"
  exit 1
fi

OUTPUT2="$(./build/jsonschema lint -i "$TMP/ignored" "$TMP/schema.json" 2>&1 || true)"
if grep -q "unexpected error" <<<"$OUTPUT2"; then
  echo "lint crashed with unexpected error (second run)"
  exit 1
fi

echo "ok"
