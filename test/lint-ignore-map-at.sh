#!/usr/bin/env bash
set -euo pipefail

: "${JSONSCHEMA:?JSONSCHEMA binary path must be set}"

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

pushd "$WORK" >/dev/null

mkdir -p a b

cat > a/schema.json <<'JSON'
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "x": { "type": "number" }
  }
}
JSON

echo '{ invalid' > b/bad.json

if ! "$JSONSCHEMA" lint -i b -e json a >/dev/null 2>stderr1.txt; then
  echo "lint failed unexpectedly with -i on ignored dir"
  cat stderr1.txt
  exit 1
fi
if grep -q "unexpected error: map::at" stderr1.txt; then
  echo "saw unexpected error map::at in stderr"
  cat stderr1.txt
  exit 1
fi

if ! "$JSONSCHEMA" lint -i b -i a -e json >/dev/null 2>stderr2.txt; then
  echo "lint failed unexpectedly with multiple -i flags"
  cat stderr2.txt
  exit 1
fi
if grep -q "unexpected error: map::at" stderr2.txt; then
  echo "saw unexpected error map::at in stderr (multiple -i)"
  cat stderr2.txt
  exit 1
fi

popd >/dev/null
