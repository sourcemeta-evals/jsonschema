#!/usr/bin/env bash
# shellcheck disable=SC1091

set -euo pipefail

source "$(dirname "$0")/../utils.sh"

init_tmpdir

if "$JSONSCHEMA" lint -i "$TMPDIR" 2>stderr.txt 1>stdout.txt; then
  echo "Expected non-zero exit when no positional inputs are provided"
  exit 1
fi

assert_file_contains stderr.txt "error: This command expects one or more paths to schemas."
assert_file_not_contains stderr.txt "unexpected error: map::at"
