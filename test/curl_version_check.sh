#!/bin/bash

set -o errexit
set -o nounset

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CURLVER_H="$ROOT/vendor/hydra/vendor/curl/include/curl/curlver.h"

if [ ! -f "$CURLVER_H" ]; then
  echo "FAIL: cURL version header not found at $CURLVER_H" >&2
  exit 1
fi

VERSION=$(grep '#define LIBCURL_VERSION ' "$CURLVER_H" | cut -d '"' -f 2)

if [ "$VERSION" = "8.14.0" ]; then
  echo "PASS: cURL version is correctly set to 8.14.0"
  exit 0
else
  echo "FAIL: Expected cURL version 8.14.0, but found: $VERSION" >&2
  exit 1
fi
