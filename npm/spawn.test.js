const { describe, it } = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const { spawn, EXECUTABLE } = require("./main.js");

describe("CommonJS", () => {
  describe("spawn", () => {
    it("should be a function", () => {
      assert.strictEqual(typeof spawn, "function");
    });

    it("should return a promise", () => {
      const result = spawn([]);
      assert.ok(result instanceof Promise);
      result.catch(() => {});
    });

    it("should reject if the executable does not exist", async () => {
      if (fs.existsSync(EXECUTABLE)) {
        return;
      }

      await assert.rejects(() => spawn([]), {
        name: "Error"
      });
    });

    it("should reject with a descriptive message if the executable does not exist", async () => {
      if (fs.existsSync(EXECUTABLE)) {
        return;
      }

      await assert.rejects(() => spawn([]), (error) => {
        assert.ok(error.message.includes(
          "The JSON Schema CLI NPM package does not support"));
        return true;
      });
    });

    it("should resolve with stdout, stderr, and code on success", async () => {
      if (!fs.existsSync(EXECUTABLE)) {
        return;
      }

      const result = await spawn(["--version"]);
      assert.strictEqual(typeof result.stdout, "string");
      assert.strictEqual(typeof result.stderr, "string");
      assert.strictEqual(typeof result.code, "number");
    });

    it("should capture stdout when stdio is not inherit", async () => {
      if (!fs.existsSync(EXECUTABLE)) {
        return;
      }

      const result = await spawn(["--version"]);
      assert.ok(result.stdout.length > 0);
      assert.strictEqual(result.code, 0);
    });

    it("should resolve with empty stdout and stderr when stdio is inherit", async () => {
      if (!fs.existsSync(EXECUTABLE)) {
        return;
      }

      const result = await spawn(["--version"], { stdio: "inherit" });
      assert.strictEqual(result.stdout, "");
      assert.strictEqual(result.stderr, "");
      assert.strictEqual(typeof result.code, "number");
    });

    it("should support passing options to child_process.spawn", async () => {
      if (!fs.existsSync(EXECUTABLE)) {
        return;
      }

      const result = await spawn(["--version"], { timeout: 30000 });
      assert.strictEqual(typeof result.code, "number");
    });

    it("should resolve with a non-zero code on invalid arguments", async () => {
      if (!fs.existsSync(EXECUTABLE)) {
        return;
      }

      const result = await spawn(["--unknown-flag-that-does-not-exist"]);
      assert.notStrictEqual(result.code, 0);
    });
  });
});
