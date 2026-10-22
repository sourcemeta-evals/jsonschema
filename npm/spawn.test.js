const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const child_process = require('child_process');
const os = require('os');
const path = require('path');
const { spawn } = require('./main.js');
const packageJson = require('../package.json');

test('spawn returns version with --version flag', async () => {
  const result = await spawn(['--version']);
  assert.strictEqual(result.code, 0);
  assert.strictEqual(result.stdout.trim(), packageJson.version);
  assert.strictEqual(typeof result.stdout, 'string');
  assert.strictEqual(typeof result.stderr, 'string');
  assert.strictEqual(typeof result.code, 'number');
});

test('spawn returns help with --help flag', async () => {
  const result = await spawn(['--help']);
  assert.strictEqual(result.code, 0);
  assert.match(result.stdout, /Usage:/);
  assert.match(result.stdout, /Commands:/);
});

test('spawn returns non-zero exit code for invalid command', async () => {
  const result = await spawn(['invalid-command']);
  assert.strictEqual(result.code, 1);
});

test('spawn captures stderr on error', async () => {
  const result = await spawn(['validate']);
  assert.strictEqual(result.code, 1);
  assert.ok(result.stderr.length > 0);
});

test('spawn preserves multibyte output that spans stream chunks', async () => {
  // Three-byte characters on purpose: a read boundary cannot stay aligned with
  // them, so an implementation that decodes each chunk on its own corrupts the
  // characters the boundary cuts through. Two-byte characters would leave the
  // boundaries aligned and assert nothing.
  const description = '\u2192'.repeat(120000);
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'jsonschema-spawn-'));
  const schema = path.join(directory, 'schema.json');

  try {
    fs.writeFileSync(schema, JSON.stringify({
      $schema: 'http://json-schema.org/draft-07/schema#',
      description: description,
      type: 'string'
    }));

    const result = await spawn(['bundle', schema]);
    assert.strictEqual(result.code, 0);
    assert.strictEqual(JSON.parse(result.stdout).description, description);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test('spawn forwards caller options to the child', async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'jsonschema-spawn-'));

  try {
    fs.writeFileSync(path.join(directory, 'schema.json'), JSON.stringify({
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'string'
    }));

    // The relative path only resolves if `cwd` reached the child
    const result = await spawn([ 'bundle', 'schema.json' ], { cwd: directory });
    assert.strictEqual(result.code, 0);
    assert.strictEqual(JSON.parse(result.stdout).type, 'string');
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test('spawn reports no captured output when nothing is piped', async () => {
  const result = await spawn([ '--version' ], { stdio: 'ignore' });
  assert.strictEqual(result.code, 0);
  assert.ok(result.stdout === '' || result.stdout === null || result.stdout === undefined,
    `expected no captured stdout, got ${JSON.stringify(result.stdout)}`);
});

test('the command line entrypoint delegates and forwards the exit status', async () => {
  function run(args) {
    return new Promise((resolve) => {
      const child = child_process.spawn(process.execPath,
        [ path.join(__dirname, 'cli.js'), ...args ], { stdio: [ 'ignore', 'pipe', 'pipe' ] });
      let stdout = '';
      child.stdout.setEncoding('utf8');
      child.stdout.on('data', (data) => {
        stdout += data;
      });
      child.on('close', (code) => resolve({ code, stdout }));
    });
  }

  const succeeded = await run([ '--version' ]);
  assert.strictEqual(succeeded.code, 0);
  assert.strictEqual(succeeded.stdout.trim(), packageJson.version);

  const failed = await run([ 'definitely-not-a-command' ]);
  assert.strictEqual(failed.code, 1);

  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'jsonschema-spawn-'));

  try {
    fs.writeFileSync(path.join(directory, 'schema.json'), JSON.stringify({
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'string'
    }));
    fs.writeFileSync(path.join(directory, 'instance.json'), '42');

    // The CLI answers a failed validation with 2 rather than 1, so a wrapper
    // that reports any failure as 1 cannot be told apart by the status alone
    const invalid = await run([ 'validate', path.join(directory, 'schema.json'),
      path.join(directory, 'instance.json') ]);
    assert.strictEqual(invalid.code, 2);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test('spawn keeps caller options when the arguments are omitted', async () => {
  // `child_process.spawn` turns a null or undefined `args` into an empty list
  // before it treats a non-array as the options object. Refusing the call
  // outright is a stricter contract and stays correct, so only silently
  // dropping the options the caller did supply is a failure here
  for (const omitted of [ undefined, null ]) {
    let result;

    try {
      result = await spawn(omitted, { stdio: 'ignore' });
    } catch {
      continue;
    }

    assert.ok(result.stdout === '' || result.stdout === null || result.stdout === undefined,
      `expected no captured stdout for ${omitted}, got ${JSON.stringify(result.stdout)}`);
    assert.ok(result.stderr === '' || result.stderr === null || result.stderr === undefined,
      `expected no captured stderr for ${omitted}, got ${JSON.stringify(result.stderr)}`);
  }
});

test('spawn rejects when no executable is staged for this platform', async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'jsonschema-spawn-'));

  try {
    fs.cpSync(__dirname, path.join(directory, 'npm'), { recursive: true });
    fs.copyFileSync(path.join(__dirname, '..', 'package.json'),
      path.join(directory, 'package.json'));

    const isolated = require(path.join(directory, 'npm', 'main.js'));
    const isolatedSpawn = isolated.spawn || isolated.default.spawn;
    await assert.rejects(() => isolatedSpawn(['--version']), (error) => error instanceof Error);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test('an unusable option value stays inside the returned promise', async () => {
  // Nothing asks for an `encoding` option, but wrappers that add one decode in
  // a stream callback, where a throw escapes the promise and kills the caller
  // instead of reaching the `catch` the interface promises
  const promise = spawn(['--version'], { encoding: 'not-an-encoding' });
  assert.strictEqual(typeof promise.then, 'function',
    'an unusable option must come back as a rejected promise, not a synchronous throw');

  try {
    await promise;
  } catch (error) {
    assert.ok(error instanceof Error);
  }
});

test('a launch failure reaches the caller instead of the process', () => {
  // A working directory that does not exist makes the launch fail through an
  // asynchronous `error` event rather than at the call itself. A wrapper that
  // never listens for that event, or that throws out of the executor right
  // after launching and so never gets as far as listening, leaves the event
  // unhandled, and an unhandled `error` event takes the caller's process down
  // with it instead of reaching the `catch` the interface promises
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'jsonschema-spawn-'));
  const missing = path.join(directory, 'missing');

  try {
    for (const options of [ {}, { encoding: 'not-an-encoding' }, { stdio: 'ignore', input: 'x' } ]) {
      const caller = child_process.spawnSync(process.execPath, [ '-e', `
        const { spawn } = require(${JSON.stringify(path.join(__dirname, 'main.js'))});
        let promise = null;

        try {
          promise = spawn([ '--version' ],
            Object.assign({ cwd: ${JSON.stringify(missing)} }, ${JSON.stringify(options)}));
        } catch {
          console.log('outcome:threw');
        }

        if (promise && typeof promise.then === 'function') {
          promise.then(() => console.log('outcome:resolved'),
            () => console.log('outcome:rejected'));
        }

        setTimeout(() => {}, 200);
      ` ], { encoding: 'utf8' });

      assert.strictEqual(caller.status, 0,
        `the caller did not survive the launch failure with ${JSON.stringify(options)}: ${caller.stderr}`);
      assert.match(caller.stdout, /outcome:rejected/,
        `the launch failure did not reach the caller with ${JSON.stringify(options)}: ${caller.stdout}`);
    }
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
