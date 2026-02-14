import { describe, it } from "node:test";
import assert from "node:assert";
import { createRequire } from "node:module";
import fs from "fs";

const require = createRequire(import.meta.url);
const { spawn, EXECUTABLE } = require("./main.js");

describe("spawn (ESM)", function () {
  it("should export a spawn function", function () {
    assert.strictEqual(typeof spawn, "function");
  });

  it("should export the EXECUTABLE path", function () {
    assert.strictEqual(typeof EXECUTABLE, "string");
    assert.ok(EXECUTABLE.length > 0);
  });

  it("should return a promise", function () {
    const result = spawn(["--help"]);
    assert.ok(result instanceof Promise);
    result.catch(function () {});
  });

  it("should reject if the executable does not exist", async function () {
    if (fs.existsSync(EXECUTABLE)) {
      return;
    }

    await assert.rejects(function () {
      return spawn(["--help"]);
    }, /does not support/);
  });

  it("should reject with a descriptive error message", async function () {
    if (fs.existsSync(EXECUTABLE)) {
      return;
    }

    await assert.rejects(
      function () {
        return spawn(["--help"]);
      },
      function (error) {
        assert.ok(error instanceof Error);
        assert.ok(error.message.includes("JSON Schema CLI NPM package"));
        return true;
      }
    );
  });

  it("should resolve with code, stdout, and stderr on success", async function () {
    if (!fs.existsSync(EXECUTABLE)) {
      return;
    }

    const result = await spawn(["--help"]);
    assert.strictEqual(typeof result.code, "number");
    assert.strictEqual(typeof result.stdout, "string");
    assert.strictEqual(typeof result.stderr, "string");
  });

  it("should capture stdout when stdio is not inherited", async function () {
    if (!fs.existsSync(EXECUTABLE)) {
      return;
    }

    const result = await spawn(["--help"]);
    assert.ok(result.stdout.length > 0);
  });

  it("should pass options to child_process.spawn", async function () {
    if (!fs.existsSync(EXECUTABLE)) {
      return;
    }

    const result = await spawn(["--help"], { timeout: 30000 });
    assert.strictEqual(typeof result.code, "number");
  });

  it("should handle empty arguments", async function () {
    if (fs.existsSync(EXECUTABLE)) {
      const result = await spawn([]);
      assert.strictEqual(typeof result.code, "number");
    } else {
      await assert.rejects(function () {
        return spawn([]);
      }, /does not support/);
    }
  });

  it("should handle undefined arguments", async function () {
    if (fs.existsSync(EXECUTABLE)) {
      const result = await spawn();
      assert.strictEqual(typeof result.code, "number");
    } else {
      await assert.rejects(function () {
        return spawn();
      }, /does not support/);
    }
  });

  it("should handle undefined options", async function () {
    if (fs.existsSync(EXECUTABLE)) {
      const result = await spawn(["--help"], undefined);
      assert.strictEqual(typeof result.code, "number");
    } else {
      await assert.rejects(function () {
        return spawn(["--help"], undefined);
      }, /does not support/);
    }
  });
});
