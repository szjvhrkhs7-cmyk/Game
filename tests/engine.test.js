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
  offerAlliance,
  recruitUnit,
  resolveBattle,
  validateCampaignData,
} from "../src/engine.js";
import {
  armiesAt,
  cancelArmyRoute,
  findRoute,
  moveFieldArmy,
  planArmyRoute,
  raiseFieldArmy,
  soldiersIn,
  resolveFieldBattle,
  setTaxLevel,
} from "../src/systems.js";

const fixedRandom = (value) => () => value;

test("карта и стартовые державы проходят структурную проверку", () => {
  assert.deepEqual(validateCampaignData(), []);
  assert.ok(PROVINCES.length >= 180, "континент должен быть разделён минимум на 180 регионов");
  assert.equal(new Set(PROVINCES.map((province) => province.id)).size, PROVINCES.length, "идентификаторы регионов должны быть уникальны");
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

test("строительство списывает ресурсы, занимает очередь и завершается по ходу", () => {
  const state = createCampaign("england");
  const provinceId = getOwnedProvinces(state, "england").find((item) => !item.capital).id;
  const goldBefore = state.factions.england.gold;
  const result = constructBuilding(state, provinceId, "farm");
  assert.equal(result.ok, true);
  assert.equal(result.state.provinces[provinceId].buildings.farm, undefined);
  assert.equal(result.state.provinces[provinceId].constructionQueue.length, 1);
  assert.ok(result.state.factions.england.gold < goldBefore);
  assert.equal(state.provinces[provinceId].buildings.farm, undefined, "исходное состояние не мутирует");
  const completed = endTurn(result.state, fixedRandom(.99));
  assert.equal(completed.state.provinces[provinceId].buildings.farm, 1);
});

test("для специальных отрядов требуются военные постройки", () => {
  const state = createCampaign("england");
  const ordinaryProvince = getOwnedProvinces(state, "england").find((item) => !item.capital);
  const locked = recruitUnit(state, ordinaryProvince.id, "archers");
  assert.equal(locked.ok, false);
  assert.match(locked.message, /Требуется/);
  const capitalId = FACTIONS.england.capital;
  const recruited = recruitUnit(state, capitalId, "levy");
  assert.equal(recruited.ok, true);
  assert.equal(recruited.state.provinces[capitalId].recruitmentQueue.length, 1);
  const completed = endTurn(recruited.state, fixedRandom(.99));
  assert.equal(completed.state.provinces[capitalId].army.levy, state.provinces[capitalId].army.levy + 1);
});

test("полевая армия является самостоятельным объектом", () => {
  const state = createCampaign("england");
  const province = getOwnedProvinces(state, "england").find((item) => !armiesAt(state, item.id, "england").length);
  province.army.levy = 4;
  province.army.spearmen = 2;
  const result = raiseFieldArmy(state, province.id);
  assert.equal(result.ok, true);
  const army = result.state.armies[result.state.selectedArmy];
  assert.equal(army.regionId, province.id);
  assert.ok(soldiersIn(army.units) > 0);
  assert.equal(state.armies[army.id], undefined, "исходное состояние не мутирует");
});

test("армии строят маршрут и отменяют его", () => {
  const state = createCampaign("england");
  const army = state.armies[state.selectedArmy];
  const destination = getOwnedProvinces(state, "england").find((item) => item.id !== army.regionId);
  const route = findRoute(state, army.id, destination.id);
  assert.ok(route.length > 0);
  const planned = planArmyRoute(state, army.id, destination.id);
  assert.equal(planned.ok, true);
  assert.deepEqual(planned.state.armies[army.id].route, route);
  const cancelled = cancelArmyRoute(planned.state, army.id);
  assert.deepEqual(cancelled.state.armies[army.id].route, []);
});

test("укреплённый вражеский регион запускает осаду", () => {
  const state = createCampaign("england");
  const border = getOwnedProvinces(state, "england").find((item) => item.neighbors.some((id) => state.provinces[id].owner !== "england"));
  const targetId = border.neighbors.find((id) => state.provinces[id].owner !== "england");
  const army = state.armies[state.selectedArmy];
  army.regionId = border.id;
  army.movementPoints = 3;
  state.provinces[targetId].buildings.walls = 1;
  const enemy = state.provinces[targetId].owner;
  if (enemy !== "rebels") state.diplomacy[["england", enemy].sort().join(":")] = { status: "war", opinion: -100 };
  const result = moveFieldArmy(state, army.id, targetId);
  assert.equal(result.ok, true);
  assert.equal(result.siege, true);
  assert.equal(result.state.armies[army.id].status, "sieging");
  assert.equal(result.state.provinces[targetId].siege.armyId, army.id);
});

test("полевой бой учитывает построение и захватывает неукреплённую землю", () => {
  const state = createCampaign("england");
  const border = getOwnedProvinces(state, "england").find((item) => item.neighbors.some((id) => state.provinces[id].owner !== "england"));
  const targetId = border.neighbors.find((id) => state.provinces[id].owner !== "england");
  const target = state.provinces[targetId];
  const army = state.armies[state.selectedArmy];
  army.regionId = border.id;
  army.units = { levy: 30, spearmen: 8, swordsmen: 8, archers: 6, heavyInfantry: 4, knights: 4, crossbowmen: 2, siege: 0 };
  target.army = { levy: 1, spearmen: 0, swordsmen: 0, archers: 0, heavyInfantry: 0, knights: 0, crossbowmen: 0, siege: 0 };
  target.buildings = {};
  const result = resolveFieldBattle(state, army.id, targetId, "charge", fixedRandom(.5), { formationId: "wedge" });
  assert.equal(result.ok, true);
  assert.equal(result.report.attackerWon, true);
  assert.equal(result.report.formation, "wedge");
  assert.equal(result.state.provinces[targetId].owner, "england");
});

test("налоговая политика меняет коэффициент дохода без мутации исходного состояния", () => {
  const state = createCampaign("france");
  const provinceId = FACTIONS.france.capital;
  const result = setTaxLevel(state, provinceId, "high");
  assert.equal(result.ok, true);
  assert.equal(result.state.provinces[provinceId].taxLevel, "high");
  assert.equal(state.provinces[provinceId].taxLevel, "normal");
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

test("союз требует авторитет и сохраняется в дипломатическом статусе", () => {
  const state = createCampaign("venice");
  const key = ["venice", "hungary"].sort().join(":");
  state.diplomacy[key].status = "trade";
  state.diplomacy[key].opinion = 60;
  const authorityBefore = state.factions.venice.authority;
  const result = offerAlliance(state, "hungary", fixedRandom(1));
  assert.equal(result.accepted, true);
  assert.equal(getDiplomacy(result.state, "venice", "hungary").status, "allied");
  assert.equal(result.state.factions.venice.authority, authorityBefore - 12);
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
