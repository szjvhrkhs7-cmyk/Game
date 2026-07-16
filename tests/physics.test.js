import test from "node:test";
import assert from "node:assert/strict";
import { calculatePhysicsSteps, getJumpKind } from "../src/physics.js";

test("первый прыжок работает с платформы и в coyote-окне", () => {
  assert.equal(getJumpKind(0.14, 0), "ground");
  assert.equal(getJumpKind(0.01, 1), "ground");
});

test("в воздухе разрешён ровно один дополнительный прыжок", () => {
  assert.equal(getJumpKind(0, 1), "air");
  assert.equal(getJumpKind(0, 2), null);
});

test("быстрое движение разбивается на физические подшаги", () => {
  assert.equal(calculatePhysicsSteps(300, 900, 1 / 30), 3);
  assert.equal(calculatePhysicsSteps(0, 0, 1 / 60), 1);
  assert.equal(calculatePhysicsSteps(3000, 3000, 1), 6);
});
