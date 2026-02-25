import { before, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from './main.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const platform = () => os.platform() === 'win32' ? 'windows' : os.platform();
const architecture = () => os.arch() === 'x64' ? 'x86_64' : os.arch();
const executable = () => platform() === 'windows'
  ? path.join(__dirname, '..', 'build', 'github-releases', `jsonschema-${platform()}-${architecture()}.exe`)
  : path.join(__dirname, '..', 'build', 'github-releases', `jsonschema-${platform()}-${architecture()}`);

const ensureExecutable = () => {
  const file = executable();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `#!/usr/bin/env node\nprocess.stdout.write('stdout:' + process.argv.slice(2).join(',') + '\\n');\nprocess.stderr.write('stderr:' + process.argv.slice(2).join(',') + '\\n');\nprocess.exit(Number(process.env.JSONSCHEMA_TEST_EXIT_CODE || '0'));\n`);
  fs.chmodSync(file, 0o755);
};

before(() => {
  ensureExecutable();
});

test('esm import exposes spawn named export', async () => {
  const result = await spawn(['inspect', 'schema.json'], {
    env: {
      ...process.env,
      JSONSCHEMA_TEST_EXIT_CODE: '3'
    }
  });

  assert.equal(result.code, 3);
  assert.equal(result.signal, null);
  assert.match(result.stdout, /stdout:inspect,schema\.json/);
  assert.match(result.stderr, /stderr:inspect,schema\.json/);
});
