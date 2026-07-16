import test from "node:test";
import assert from "node:assert/strict";
import { CAT_PROFILES, LEVELS, validateLevels } from "../src/levels.js";

test("все уровни проходят структурную проверку", () => {
  assert.deepEqual(validateLevels(), []);
  assert.equal(LEVELS.length, 4);
});

test("каждый уровень можно пройти слева направо", () => {
  for (const level of LEVELS) {
    assert.ok(level.goal.x > level.spawn.x);
    assert.ok(level.goal.x < level.worldWidth);
    assert.ok(level.enemies.length >= 7);
    assert.ok(level.bananas.length >= 15);
    assert.ok(level.checkpoints.length >= 1);
  }
});

test("у финального уровня есть босс", () => {
  const finalLevel = LEVELS.at(-1);
  assert.equal(finalLevel.boss.type, "baron");
  assert.ok(finalLevel.boss.health >= 8);
});

test("разрывы основного маршрута подходят для плавного темпа", () => {
  for (const level of LEVELS) {
    const ground = level.platforms
      .filter((platform) => platform.kind === "ground")
      .sort((left, right) => left.x - right.x);
    for (let index = 1; index < ground.length; index += 1) {
      const gap = ground[index].x - (ground[index - 1].x + ground[index - 1].width);
      assert.ok(gap <= 180, `${level.id}: разрыв ${gap}px слишком велик`);
    }
  }
});

test("профили двух героев отличаются", () => {
  assert.equal(CAT_PROFILES.length, 2);
  assert.notEqual(CAT_PROFILES[0].image, CAT_PROFILES[1].image);
  assert.notEqual(CAT_PROFILES[0].speed, CAT_PROFILES[1].speed);
});
