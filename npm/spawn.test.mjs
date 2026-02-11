import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import path from "path";
import fs from "fs";
import os from "os";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe("ESM", function () {
  it("should export a spawn function", function () {
    const main = require("./main.js");
    assert.ok(typeof main.spawn === "function");
  });

  it("spawn should return a promise", function () {
    const main = require("./main.js");
    const result = main.spawn(["--help"]);
    assert.ok(result instanceof Promise);
    result.catch(function () {});
  });

  it("spawn should reject if the executable does not exist", async function () {
    const main = require("./main.js");
    const PLATFORM = os.platform() === "win32" ? "windows" : os.platform();
    const ARCH = os.arch() === "x64" ? "x86_64" : os.arch();
    const expectedPath = path.join(__dirname, "..", "build", "github-releases",
      PLATFORM === "windows"
        ? `jsonschema-${PLATFORM}-${ARCH}.exe`
        : `jsonschema-${PLATFORM}-${ARCH}`);
    if (fs.existsSync(expectedPath)) {
      return;
    }

    await assert.rejects(function () {
      return main.spawn(["--help"]);
    }, function (error) {
      assert.ok(error instanceof Error);
      assert.ok(error.message.includes("does not support"));
      return true;
    });
  });
});
