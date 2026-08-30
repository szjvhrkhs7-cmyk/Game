import test from "node:test";
import assert from "node:assert/strict";
import { FACTIONS, PLAYABLE_FACTIONS, PROVINCES } from "../src/data.js";
import {
  SAVE_VERSION,
  canMarch,
  constructBuilding,
  createCampaign,
  declareWar,
  endTurn,
  getDiplomacy,
  getOwnedProvinces,
  hydrateCampaign,
  moveArmy,
  offerTrade,
  recruitUnit,
  resolveBattle,
  validateCampaignData,
} from "../src/engine.js";

const fixedRandom = (value) => () => value;

test("карта и стартовые державы проходят структурную проверку", () => {
  assert.deepEqual(validateCampaignData(), []);
  assert.equal(PROVINCES.length, 41);
  assert.equal(PLAYABLE_FACTIONS.length, 8);
  assert.ok(PLAYABLE_FACTIONS.every((faction) => PROVINCES.some((province) => province.id === faction.capital)));
});

test("новая кампания создаёт независимое корректное состояние", () => {
  const england = createCampaign("england");
  const france = createCampaign("france");
  assert.equal(england.version, SAVE_VERSION);
  assert.equal(england.playerFaction, "england");
  assert.equal(england.selectedProvince, FACTIONS.england.capital);
  assert.ok(getOwnedProvinces(england, "england").length >= 2);
  england.provinces.england.army.levy = 99;
  assert.notEqual(france.provinces.england.army.levy, 99);
});

test("строительство списывает ресурсы и повышает уровень", () => {
  const state = createCampaign("england");
  const goldBefore = state.factions.england.gold;
  const result = constructBuilding(state, "wales", "farm");
  assert.equal(result.ok, true);
  assert.equal(result.state.provinces.wales.buildings.farm, 1);
  assert.ok(result.state.factions.england.gold < goldBefore);
  assert.equal(state.provinces.wales.buildings.farm, undefined, "исходное состояние не мутирует");
});

test("для специальных отрядов требуются военные постройки", () => {
  const state = createCampaign("england");
  const locked = recruitUnit(state, "wales", "archers");
  assert.equal(locked.ok, false);
  assert.match(locked.message, /Требуется/);
  const recruited = recruitUnit(state, "england", "knights");
  assert.equal(recruited.ok, true);
  assert.equal(recruited.state.provinces.england.army.knights, state.provinces.england.army.knights + 1);
});

test("армия перемещается между соседними своими землями и оставляет гарнизон", () => {
  const state = createCampaign("england");
  const result = moveArmy(state, "england", "wales");
  assert.equal(result.ok, true);
  assert.equal(result.battle, undefined);
  assert.ok(result.state.provinces.england.army.levy >= 1);
  assert.ok(result.state.provinces.wales.army.levy > state.provinces.wales.army.levy);
  assert.equal(result.state.provinces.england.moved, true);
});

test("нейтральную державу нельзя атаковать без объявления войны", () => {
  const state = createCampaign("castile");
  assert.equal(getDiplomacy(state, "castile", "aragon").status, "neutral");
  assert.equal(canMarch(state, "castile", "aragon").ok, false);
  const war = declareWar(state, "aragon");
  assert.equal(war.ok, true);
  assert.equal(getDiplomacy(war.state, "castile", "aragon").status, "war");
  assert.equal(canMarch(war.state, "castile", "aragon").ok, true);
});

test("победа в бою передаёт провинцию атакующей стороне", () => {
  const state = createCampaign("england");
  state.provinces.england.army = { levy: 12, archers: 6, knights: 4 };
  state.provinces.normandy.army = { levy: 1, archers: 0, knights: 0 };
  const result = resolveBattle(state, "england", "normandy", "flank", fixedRandom(.5));
  assert.equal(result.ok, true);
  assert.equal(result.report.attackerWon, true);
  assert.equal(result.state.provinces.normandy.owner, "england");
  assert.equal(result.state.statistics.victories, 1);
});

test("торговый договор заключается при благоприятном решении", () => {
  const state = createCampaign("venice");
  state.diplomacy[["venice", "hungary"].sort().join(":")].opinion = 40;
  const result = offerTrade(state, "hungary", fixedRandom(1));
  assert.equal(result.ok, true);
  assert.equal(result.accepted, true);
  assert.equal(getDiplomacy(result.state, "venice", "hungary").status, "trade");
});

test("конец хода начисляет доход, запускает ИИ и сбрасывает перемещение", () => {
  const state = createCampaign("england");
  state.provinces.england.moved = true;
  const result = endTurn(state, fixedRandom(.99));
  assert.equal(result.ok, true);
  assert.equal(result.state.turn, 2);
  assert.equal(result.state.seasonIndex, 1);
  assert.equal(result.state.provinces.england.moved, false);
  assert.ok(result.state.factions.england.gold > 0);
});

test("сохранение текущей версии восстанавливается, повреждённое отклоняется", () => {
  const state = createCampaign("poland");
  assert.deepEqual(hydrateCampaign(JSON.parse(JSON.stringify(state))), state);
  assert.equal(hydrateCampaign({ ...state, version: 1 }), null);
  const broken = JSON.parse(JSON.stringify(state));
  delete broken.provinces.poland;
  assert.equal(hydrateCampaign(broken), null);
});
