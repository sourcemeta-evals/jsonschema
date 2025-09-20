#!/bin/bash
set -euo pipefail

mkdir -p .angular
touch .angular/dummy.json
echo '{"$schema": "https://json-schema.org/draft/2020-12/schema"}' > test.json

./build/dist/bin/jsonschema lint -i .angular test.json
