import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { spawn } from '@sourcemeta/jsonschema';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const platform = os.platform() === 'win32' ? 'windows' : os.platform();
const architecture = os.arch() === 'x64' ? 'x86_64' : os.arch();
const executable = path.join(
  __dirname,
  '..',
  'build',
  'github-releases',
  platform === 'windows'
    ? `jsonschema-${platform}-${architecture}.exe`
    : `jsonschema-${platform}-${architecture}`
);

const ensureExecutable = async () => {
  await fs.mkdir(path.dirname(executable), { recursive: true });
  await fs.writeFile(
    executable,
    [
      '#!/usr/bin/env node',
      'process.stdout.write("esm-stdout");',
      'process.stderr.write("esm-stderr");',
      'process.exit(3);',
      '',
    ].join('\n'),
    { mode: 0o755 }
  );
};

test('spawn is available as an ESM named import', async () => {
  await ensureExecutable();
  const output = await spawn(['inspect', 'schema.json']);

  assert.equal(output.code, 3);
  assert.equal(output.stderr, 'esm-stderr');
  assert.equal(output.stdout, 'esm-stdout');
});
