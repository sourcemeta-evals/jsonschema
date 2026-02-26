const { describe, it } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");

const { spawn, EXECUTABLE } = require("./main.js");

describe("CommonJS spawn", function () {
  it("should export a spawn function", function () {
    assert.strictEqual(typeof spawn, "function");
  });

  it("should export an EXECUTABLE path", function () {
    assert.strictEqual(typeof EXECUTABLE, "string");
    assert.ok(EXECUTABLE.length > 0);
  });

  it("should reject if the executable does not exist", async function () {
    // Only run this test if the executable is not present
    if (fs.existsSync(EXECUTABLE)) {
      return;
    }

    await assert.rejects(function () {
      return spawn(["--version"]);
    }, function (error) {
      assert.ok(error instanceof Error);
      assert.ok(error.message.includes("does not support"));
      return true;
    });
  });

  it("should return a promise", function () {
    // Only run this test if the executable is present
    if (!fs.existsSync(EXECUTABLE)) {
      return;
    }

    const result = spawn(["--version"]);
    assert.ok(result instanceof Promise);
  });

  it("should resolve with code, stdout, and stderr", async function () {
    if (!fs.existsSync(EXECUTABLE)) {
      return;
    }

    const result = await spawn(["--version"]);
    assert.strictEqual(typeof result.code, "number");
    assert.strictEqual(typeof result.stdout, "string");
    assert.strictEqual(typeof result.stderr, "string");
  });

  it("should capture stdout output", async function () {
    if (!fs.existsSync(EXECUTABLE)) {
      return;
    }

    const result = await spawn(["--version"]);
    assert.strictEqual(result.code, 0);
    assert.ok(result.stdout.length > 0);
  });

  it("should return non-zero exit code on error", async function () {
    if (!fs.existsSync(EXECUTABLE)) {
      return;
    }

    const result = await spawn(["--unknown-flag-that-does-not-exist"]);
    assert.notStrictEqual(result.code, 0);
  });

  it("should accept options like child_process.spawn", async function () {
    if (!fs.existsSync(EXECUTABLE)) {
      return;
    }

    const result = await spawn(["--version"], { windowsHide: true });
    assert.strictEqual(typeof result.code, "number");
  });

  it("should handle empty args", async function () {
    if (!fs.existsSync(EXECUTABLE)) {
      return;
    }

    const result = await spawn([]);
    assert.strictEqual(typeof result.code, "number");
  });

  it("should handle stdio inherit option", async function () {
    if (!fs.existsSync(EXECUTABLE)) {
      return;
    }

    const result = await spawn(["--version"], { stdio: "inherit" });
    assert.strictEqual(typeof result.code, "number");
    // When stdio is inherited, stdout and stderr are empty strings
    assert.strictEqual(result.stdout, "");
    assert.strictEqual(result.stderr, "");
  });
});
