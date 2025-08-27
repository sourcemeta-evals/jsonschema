#!/bin/sh

set -o errexit
set -o nounset

TMP="$(mktemp -d)"
clean() { rm -rf "$TMP"; }
trap clean EXIT

cd "$TMP"

mkdir -p .angular node_modules src
echo '{"test": true}' > src/test.json
echo '{"angular": true}' > .angular/config.json
echo '{"node": true}' > node_modules/package.json

"$1" lint -i .angular -i node_modules 2>&1 | grep -v "unexpected error: map::at" || {
  echo "FAIL: -i flags caused map::at error"
  exit 1
}

"$1" lint -i .angular -i node_modules --verbose 2>&1 | grep -v "unexpected error: map::at" || {
  echo "FAIL: -i flags with verbose caused map::at error"
  exit 1
}

"$1" lint -i nonexistent_dir 2>&1 | grep -v "unexpected error: map::at" || {
  echo "FAIL: -i with non-existent directory caused map::at error"
  exit 1
}

echo "PASS: All ignore flag tests passed"
