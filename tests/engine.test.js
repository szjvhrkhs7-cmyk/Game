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
  assert.ok(PROVINCES.length >= 180, "континент должен быть разделён минимум на 180 регионов");
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
  england.provinces[FACTIONS.england.capital].army.levy = 99;
  assert.notEqual(france.provinces[FACTIONS.england.capital].army.levy, 99);
});

const ownedNeighborPair = (state, factionId) => {
  const from = getOwnedProvinces(state, factionId).find((item) => item.neighbors.some((neighborId) => state.provinces[neighborId].owner === factionId));
  return [from.id, from.neighbors.find((neighborId) => state.provinces[neighborId].owner === factionId)];
};

test("строительство списывает ресурсы и повышает уровень", () => {
  const state = createCampaign("england");
  const provinceId = getOwnedProvinces(state, "england").find((item) => !item.capital).id;
  const goldBefore = state.factions.england.gold;
  const result = constructBuilding(state, provinceId, "farm");
  assert.equal(result.ok, true);
  assert.equal(result.state.provinces[provinceId].buildings.farm, 1);
  assert.ok(result.state.factions.england.gold < goldBefore);
  assert.equal(state.provinces[provinceId].buildings.farm, undefined, "исходное состояние не мутирует");
});

test("для специальных отрядов требуются военные постройки", () => {
  const state = createCampaign("england");
  const ordinaryProvince = getOwnedProvinces(state, "england").find((item) => !item.capital);
  const locked = recruitUnit(state, ordinaryProvince.id, "archers");
  assert.equal(locked.ok, false);
  assert.match(locked.message, /Требуется/);
  const capitalId = FACTIONS.england.capital;
  const recruited = recruitUnit(state, capitalId, "knights");
  assert.equal(recruited.ok, true);
  assert.equal(recruited.state.provinces[capitalId].army.knights, state.provinces[capitalId].army.knights + 1);
});

test("армия перемещается между соседними своими землями и оставляет гарнизон", () => {
  const state = createCampaign("england");
  const [fromId, toId] = ownedNeighborPair(state, "england");
  state.provinces[fromId].army.levy = 4;
  const result = moveArmy(state, fromId, toId);
  assert.equal(result.ok, true);
  assert.equal(result.battle, undefined);
  assert.ok(result.state.provinces[fromId].army.levy >= 1);
  assert.ok(result.state.provinces[toId].army.levy > state.provinces[toId].army.levy);
  assert.equal(result.state.provinces[fromId].moved, true);
});

test("нейтральную державу нельзя атаковать без объявления войны", () => {
  const state = createCampaign("castile");
  assert.equal(getDiplomacy(state, "castile", "aragon").status, "neutral");
  const from = getOwnedProvinces(state, "castile").find((item) => item.neighbors.some((neighborId) => state.provinces[neighborId].owner === "aragon"));
  const targetId = from.neighbors.find((neighborId) => state.provinces[neighborId].owner === "aragon");
  from.army.levy = 4;
  assert.equal(canMarch(state, from.id, targetId).ok, false);
  const war = declareWar(state, "aragon");
  assert.equal(war.ok, true);
  assert.equal(getDiplomacy(war.state, "castile", "aragon").status, "war");
  assert.equal(canMarch(war.state, from.id, targetId).ok, true);
});

test("победа в бою передаёт провинцию атакующей стороне", () => {
  const state = createCampaign("england");
  const attacker = getOwnedProvinces(state, "england").find((item) => item.neighbors.some((neighborId) => state.provinces[neighborId].owner !== "england"));
  const defenderId = attacker.neighbors.find((neighborId) => state.provinces[neighborId].owner !== "england");
  state.diplomacy[["england", state.provinces[defenderId].owner].sort().join(":")] = { status: "war", opinion: -100 };
  state.provinces[attacker.id].army = { levy: 12, archers: 6, knights: 4 };
  state.provinces[defenderId].army = { levy: 1, archers: 0, knights: 0 };
  const result = resolveBattle(state, attacker.id, defenderId, "flank", fixedRandom(.5));
  assert.equal(result.ok, true);
  assert.equal(result.report.attackerWon, true);
  assert.equal(result.state.provinces[defenderId].owner, "england");
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
  state.provinces[FACTIONS.england.capital].moved = true;
  const result = endTurn(state, fixedRandom(.99));
  assert.equal(result.ok, true);
  assert.equal(result.state.turn, 2);
  assert.equal(result.state.seasonIndex, 1);
  assert.equal(result.state.provinces[FACTIONS.england.capital].moved, false);
  assert.ok(result.state.factions.england.gold > 0);
});

test("сохранение текущей версии восстанавливается, повреждённое отклоняется", () => {
  const state = createCampaign("poland");
  assert.deepEqual(hydrateCampaign(JSON.parse(JSON.stringify(state))), state);
  assert.equal(hydrateCampaign({ ...state, version: 1 }), null);
  const broken = JSON.parse(JSON.stringify(state));
  delete broken.provinces[FACTIONS.poland.capital];
  assert.equal(hydrateCampaign(broken), null);
});
