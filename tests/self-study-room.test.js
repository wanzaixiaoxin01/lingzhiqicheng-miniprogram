import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { SELF_STUDY_GALLERY, SELF_STUDY_ROOMS } from "../utils/self-study-room.js";

test("self-study room content includes the three opened locations", () => {
  assert.deepEqual(
    SELF_STUDY_ROOMS.map((room) => room.name),
    ["郾城服务点", "莲花服务点", "北舞渡服务点"]
  );
  assert.ok(SELF_STUDY_ROOMS.every((room) => room.address && room.phone));
});

test("self-study room gallery includes local interior photos", () => {
  assert.deepEqual(
    SELF_STUDY_GALLERY.map((image) => image.src),
    ["../../assets/self-study/room-interior-01.png", "../../assets/self-study/room-interior-02.png"]
  );
});

test("self-study room gallery files are inside the mini-program root", () => {
  const miniProgramRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  assert.ok(
    SELF_STUDY_GALLERY.every((image) =>
      existsSync(resolve(miniProgramRoot, "pages/self-study", image.src))
    )
  );
});
