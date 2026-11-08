import test from "node:test";
import assert from "node:assert/strict";

import { savedMaterialKey } from "../utils/material-file.js";

test("savedMaterialKey is stable for the same material", () => {
  assert.equal(savedMaterialKey(42), "saved-material:42");
  assert.equal(savedMaterialKey("42"), "saved-material:42");
});

test("savedMaterialKey separates different materials", () => {
  assert.notEqual(savedMaterialKey(42), savedMaterialKey(43));
});
