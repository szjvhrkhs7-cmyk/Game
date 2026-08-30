import {
  BUILDING_TYPES,
  CAMPAIGN_START_YEAR,
  FACTIONS,
  PROVINCES,
  RANDOM_EVENTS,
  STARTING_RELATIONS,
  TERRAIN,
  UNIT_TYPES,
} from "./data.js";

export const SAVE_VERSION = 3;
export const SEASONS = Object.freeze(["Весна", "Лето", "Осень", "Зима"]);
export const TACTICS = Object.freeze({
  frontal: { id: "frontal", name: "Стальной натиск", description: "Надёжно против обстрела", icon: "⚔" },
  flank: { id: "flank", name: "Удар с фланга", description: "Сокрушает прямой натиск", icon: "➟" },
  volley: { id: "volley", name: "Шквал стрел", description: "Останавливает обход", icon: "➶" },
});

const clone = (value) => JSON.parse(JSON.stringify(value));
const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));
const relationKey = (left, right) => [left, right].sort().join(":");
const sumArmy = (army) => Object.values(army).reduce((sum, amount) => sum + amount, 0);

const createDiplomacy = () => {
  const relations = {};
  const factionIds = Object.keys(FACTIONS).filter((id) => id !== "rebels");
  for (let leftIndex = 0; leftIndex < factionIds.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < factionIds.length; rightIndex += 1) {
      const left = factionIds[leftIndex];
      const right = factionIds[rightIndex];
      const configuredStatus = STARTING_RELATIONS[left]?.[right]
        ?? STARTING_RELATIONS[right]?.[left]
        ?? "neutral";
      relations[relationKey(left, right)] = {
        status: configuredStatus,
        opinion: configuredStatus === "war" ? -65 : configuredStatus === "trade" ? 45 : 0,
      };
    }
  }
  return relations;
};

const createFactionState = (id, isPlayer) => ({
  id,
  gold: isPlayer ? 1_050 : id === "rebels" ? 0 : 760,
  food: isPlayer ? 190 : id === "rebels" ? 0 : 150,
  authority: isPlayer ? 64 : id === "rebels" ? 0 : 52,
  tradeIncome: 0,
  alive: true,
});

export function createCampaign(playerFaction) {
  if (!FACTIONS[playerFaction]?.playable) {
    throw new Error("Недоступная игровая держава");
  }

  const factions = Object.fromEntries(
    Object.keys(FACTIONS).map((id) => [id, createFactionState(id, id === playerFaction)]),
  );

  return {
    version: SAVE_VERSION,
    playerFaction,
    turn: 1,
    year: CAMPAIGN_START_YEAR,
    seasonIndex: 0,
    selectedProvince: FACTIONS[playerFaction].capital,
    factions,
    provinces: Object.fromEntries(PROVINCES.map((item) => [item.id, {
      ...clone(item),
      unrest: item.owner === "rebels" ? 35 : 8,
      moved: false,
      recruited: false,
    }])),
    diplomacy: createDiplomacy(),
    objectives: {
      provincesToWin: 55,
      capitalsToWin: 6,
    },
    statistics: {
      battles: 0,
      victories: 0,
      provincesConquered: 0,
    },
    eventLog: [{
      turn: 1,
      type: "crown",
      text: `${FACTIONS[playerFaction].ruler} принимает корону. Европа ждёт вашего решения.`,
    }],
    pendingEvent: null,
    gameOver: null,
  };
}

export function getProvince(state, provinceId) {
  return state.provinces[provinceId] ?? null;
}

export function getOwnedProvinces(state, factionId) {
  return Object.values(state.provinces).filter((item) => item.owner === factionId);
}

export function getDiplomacy(state, left, right) {
  if (left === right) return { status: "allied", opinion: 100 };
  if (left === "rebels" || right === "rebels") return { status: "war", opinion: -100 };
  return state.diplomacy[relationKey(left, right)] ?? { status: "neutral", opinion: 0 };
}

export function armySoldiers(army) {
  return Object.entries(army).reduce(
    (total, [unitId, amount]) => total + (UNIT_TYPES[unitId]?.soldiers ?? 0) * amount,
    0,
  );
}

export function armyStrength(army, factionId, tactic = null) {
  const faction = FACTIONS[factionId] ?? FACTIONS.rebels;
  const base = Object.entries(army).reduce(
    (total, [unitId, amount]) => total + (UNIT_TYPES[unitId]?.power ?? 0) * amount,
    0,
  );
  let tacticalComposition = 1;
  const unitCount = Math.max(1, sumArmy(army));
  if (tactic === "flank" && army.knights / unitCount >= 0.2) tacticalComposition = 1.12;
  if (tactic === "volley" && army.archers / unitCount >= 0.3) tacticalComposition = 1.12;
  if (tactic === "frontal" && army.levy / unitCount >= 0.45) tacticalComposition = 1.08;
  return base * (faction.powerBonus ?? 1) * tacticalComposition;
}

export function provinceEconomy(state, provinceId) {
  const item = getProvince(state, provinceId);
  if (!item) return { gold: 0, food: 0, upkeep: 0 };
  const faction = FACTIONS[item.owner] ?? FACTIONS.rebels;
  const orderFactor = clamp((100 - item.unrest) / 90, 0.35, 1.1);
  const marketLevels = item.buildings.market ?? 0;
  const farmLevels = item.buildings.farm ?? 0;
  const gold = Math.round((item.income + marketLevels * 70 * faction.marketBonus) * orderFactor);
  const food = Math.round((item.food + farmLevels * 24 * faction.farmBonus) * orderFactor);
  const upkeep = Object.entries(item.army).reduce(
    (total, [unitId, amount]) => total + (UNIT_TYPES[unitId]?.upkeep ?? 0) * amount,
    0,
  );
  return { gold, food, upkeep };
}

export function factionEconomy(state, factionId) {
  const provinces = getOwnedProvinces(state, factionId);
  const totals = provinces.reduce((result, item) => {
    const economy = provinceEconomy(state, item.id);
    result.gold += economy.gold;
    result.food += economy.food;
    result.upkeep += economy.upkeep;
    return result;
  }, { gold: 0, food: 0, upkeep: 0 });
  const tradePartners = Object.keys(FACTIONS).filter(
    (otherId) => otherId !== factionId && getDiplomacy(state, factionId, otherId).status === "trade",
  ).length;
  totals.trade = tradePartners * 85;
  totals.netGold = totals.gold + totals.trade - totals.upkeep;
  return totals;
}

export function buildingCost(province, buildingId) {
  const building = BUILDING_TYPES[buildingId];
  if (!building) return null;
  const nextLevel = (province.buildings[buildingId] ?? 0) + 1;
  return {
    gold: Math.round(building.baseCost * (1 + (nextLevel - 1) * 0.72)),
    authority: building.authorityCost * nextLevel,
    level: nextLevel,
  };
}

export function constructBuilding(state, provinceId, buildingId) {
  const next = clone(state);
  const item = next.provinces[provinceId];
  const building = BUILDING_TYPES[buildingId];
  if (!item || !building) return { ok: false, state, message: "Постройка недоступна" };
  if (item.owner !== state.playerFaction) return { ok: false, state, message: "Это не ваша провинция" };
  const cost = buildingCost(item, buildingId);
  if (cost.level > 2) return { ok: false, state, message: "Постройка уже достигла высшего уровня" };
  const treasury = next.factions[state.playerFaction];
  if (treasury.gold < cost.gold || treasury.authority < cost.authority) {
    return { ok: false, state, message: "Не хватает золота или авторитета" };
  }
  treasury.gold -= cost.gold;
  treasury.authority -= cost.authority;
  item.buildings[buildingId] = cost.level;
  item.unrest = Math.max(0, item.unrest - 4);
  addLog(next, "build", `${building.name} улучшены в провинции ${item.name}.`);
  return { ok: true, state: next, message: `${building.name}: уровень ${cost.level}` };
}

export function recruitUnit(state, provinceId, unitId) {
  const next = clone(state);
  const item = next.provinces[provinceId];
  const unit = UNIT_TYPES[unitId];
  if (!item || !unit) return { ok: false, state, message: "Отряд недоступен" };
  if (item.owner !== state.playerFaction) return { ok: false, state, message: "Набирать войска можно только в своих землях" };
  if (item.recruited) return { ok: false, state, message: "В этой провинции уже шёл набор в текущем ходу" };
  if (unit.requirement && !(item.buildings[unit.requirement] > 0)) {
    return { ok: false, state, message: `Требуется: ${BUILDING_TYPES[unit.requirement].name}` };
  }
  const faction = next.factions[state.playerFaction];
  const goldCost = Math.round(unit.cost * FACTIONS[state.playerFaction].recruitBonus);
  if (faction.gold < goldCost || faction.food < unit.foodCost) {
    return { ok: false, state, message: "Не хватает золота или продовольствия" };
  }
  faction.gold -= goldCost;
  faction.food -= unit.foodCost;
  item.army[unitId] += 1;
  item.recruited = true;
  addLog(next, "army", `${unit.name} набраны в провинции ${item.name}.`);
  return { ok: true, state: next, message: `${unit.name} присоединились к армии` };
}

const marchingArmy = (army) => {
  const moving = { levy: 0, archers: 0, knights: 0 };
  for (const unitId of Object.keys(moving)) {
    const amount = army[unitId] ?? 0;
    moving[unitId] = amount <= 1 ? 0 : Math.max(1, Math.floor(amount * 0.67));
  }
  if (sumArmy(moving) === 0 && sumArmy(army) > 0) {
    const available = Object.keys(moving).find((unitId) => army[unitId] > 0);
    moving[available] = 1;
  }
  return moving;
};

const subtractArmy = (army, detached) => {
  for (const unitId of Object.keys(detached)) army[unitId] -= detached[unitId];
};

const addArmy = (army, reinforcements) => {
  for (const unitId of Object.keys(reinforcements)) army[unitId] += reinforcements[unitId];
};

export function canMarch(state, fromId, toId) {
  const from = getProvince(state, fromId);
  const to = getProvince(state, toId);
  if (!from || !to) return { ok: false, reason: "Провинция не найдена" };
  if (from.owner !== state.playerFaction) return { ok: false, reason: "Выберите свою армию" };
  if (!from.neighbors.includes(toId)) return { ok: false, reason: "Провинции не граничат" };
  if (from.moved) return { ok: false, reason: "Эта армия уже двигалась" };
  if (sumArmy(from.army) < 2) return { ok: false, reason: "Для похода нужно оставить гарнизон" };
  if (to.owner !== from.owner && getDiplomacy(state, from.owner, to.owner).status !== "war") {
    return { ok: false, reason: `С державой «${FACTIONS[to.owner].shortName}» нет войны` };
  }
  return { ok: true, reason: "" };
}

export function moveArmy(state, fromId, toId) {
  const permission = canMarch(state, fromId, toId);
  if (!permission.ok) return { ok: false, state, message: permission.reason };
  const next = clone(state);
  const from = next.provinces[fromId];
  const to = next.provinces[toId];
  if (from.owner !== to.owner) {
    return {
      ok: true,
      state,
      battle: previewBattle(state, fromId, toId),
      message: "Выберите тактику перед сражением",
    };
  }
  const moving = marchingArmy(from.army);
  subtractArmy(from.army, moving);
  addArmy(to.army, moving);
  from.moved = true;
  to.moved = true;
  addLog(next, "march", `Армия выступила из ${from.name} в ${to.name}.`);
  return { ok: true, state: next, message: `Войска прибыли в ${to.name}` };
}

export function previewBattle(state, fromId, toId) {
  const from = getProvince(state, fromId);
  const to = getProvince(state, toId);
  if (!from || !to) return null;
  const attackers = marchingArmy(from.army);
  return {
    fromId,
    toId,
    attacker: from.owner,
    defender: to.owner,
    attackers,
    defenders: clone(to.army),
    attackerSoldiers: armySoldiers(attackers),
    defenderSoldiers: armySoldiers(to.army),
    terrain: TERRAIN[to.terrain],
    fortLevel: to.buildings.castle ?? 0,
  };
}

const tacticAdvantage = (attacker, defender) => {
  const beats = { frontal: "volley", flank: "frontal", volley: "flank" };
  if (beats[attacker] === defender) return 1.2;
  if (beats[defender] === attacker) return 0.86;
  return 1;
};

const applyCasualties = (army, survivalRate) => {
  const survivors = {};
  for (const [unitId, amount] of Object.entries(army)) {
    survivors[unitId] = Math.max(0, Math.round(amount * survivalRate));
  }
  return survivors;
};

export function resolveBattle(state, fromId, toId, tacticId, random = Math.random) {
  const permission = canMarch(state, fromId, toId);
  if (!permission.ok) return { ok: false, state, message: permission.reason };
  if (!TACTICS[tacticId]) return { ok: false, state, message: "Неизвестная тактика" };
  const next = clone(state);
  const from = next.provinces[fromId];
  const to = next.provinces[toId];
  const attacking = marchingArmy(from.army);
  subtractArmy(from.army, attacking);
  from.moved = true;

  const defenderTactics = Object.keys(TACTICS);
  const defenderTactic = defenderTactics[Math.floor(random() * defenderTactics.length) % defenderTactics.length];
  const attackRoll = 0.9 + random() * 0.2;
  const defenseRoll = 0.9 + random() * 0.2;
  const factionDefense = FACTIONS[to.owner]?.defenseBonus ?? 1;
  const terrainDefense = TERRAIN[to.terrain]?.defense ?? 1;
  const fortDefense = 1 + (to.buildings.castle ?? 0) * 0.3;
  const attackerPower = armyStrength(attacking, from.owner, tacticId)
    * tacticAdvantage(tacticId, defenderTactic)
    * attackRoll;
  const defenderPower = armyStrength(to.army, to.owner, defenderTactic)
    * factionDefense
    * terrainDefense
    * fortDefense
    * defenseRoll;
  const attackerWon = attackerPower > defenderPower;
  const ratio = attackerPower / Math.max(0.1, defenderPower);
  const attackerSurvival = attackerWon
    ? clamp(0.45 + ratio * 0.2, 0.5, 0.88)
    : clamp(0.18 + ratio * 0.18, 0.18, 0.48);
  const defenderSurvival = attackerWon
    ? clamp(0.16 + (1 / ratio) * 0.15, 0.12, 0.42)
    : clamp(0.48 + (1 / ratio) * 0.15, 0.52, 0.88);
  const attackerAfter = applyCasualties(attacking, attackerSurvival);
  const defenderAfter = applyCasualties(to.army, defenderSurvival);
  const previousOwner = to.owner;

  if (attackerWon) {
    to.owner = from.owner;
    to.army = attackerAfter;
    if (sumArmy(to.army) === 0) to.army.levy = 1;
    to.unrest = 48;
    to.moved = true;
    next.statistics.provincesConquered += from.owner === state.playerFaction ? 1 : 0;
  } else {
    to.army = defenderAfter;
    if (sumArmy(to.army) === 0) to.army.levy = 1;
    addArmy(from.army, attackerAfter);
  }

  next.statistics.battles += from.owner === state.playerFaction ? 1 : 0;
  if (attackerWon && from.owner === state.playerFaction) next.statistics.victories += 1;
  updateFactionSurvival(next);
  const report = {
    attackerWon,
    fromId,
    toId,
    province: to.name,
    attacker: from.owner,
    defender: previousOwner,
    attackerTactic: tacticId,
    defenderTactic,
    attackerBefore: armySoldiers(attacking),
    defenderBefore: armySoldiers(state.provinces[toId].army),
    attackerAfter: armySoldiers(attackerAfter),
    defenderAfter: armySoldiers(defenderAfter),
    advantage: tacticAdvantage(tacticId, defenderTactic),
  };
  addLog(next, attackerWon ? "victory" : "defeat", attackerWon
    ? `${FACTIONS[from.owner].shortName} захватывает провинцию ${to.name}.`
    : `Штурм провинции ${to.name} отбит.`);
  checkGameOver(next);
  return { ok: true, state: next, report, message: attackerWon ? "Победа" : "Поражение" };
}

export function declareWar(state, targetFaction) {
  if (!FACTIONS[targetFaction] || targetFaction === state.playerFaction) {
    return { ok: false, state, message: "Нельзя объявить войну этой державе" };
  }
  const next = clone(state);
  const player = next.factions[state.playerFaction];
  if (player.authority < 10) return { ok: false, state, message: "Нужно 10 авторитета" };
  const key = relationKey(state.playerFaction, targetFaction);
  if (next.diplomacy[key]?.status === "war") return { ok: false, state, message: "Война уже идёт" };
  player.authority -= 10;
  next.diplomacy[key] = { status: "war", opinion: -80 };
  addLog(next, "war", `Объявлена война державе «${FACTIONS[targetFaction].shortName}».`);
  return { ok: true, state: next, message: "Война объявлена" };
}

export function sendGift(state, targetFaction) {
  const next = clone(state);
  const player = next.factions[state.playerFaction];
  if (player.gold < 180) return { ok: false, state, message: "Для дара нужно 180 золота" };
  const key = relationKey(state.playerFaction, targetFaction);
  if (!next.diplomacy[key]) return { ok: false, state, message: "Посольство недоступно" };
  player.gold -= 180;
  next.diplomacy[key].opinion = clamp(next.diplomacy[key].opinion + 22, -100, 100);
  addLog(next, "diplomacy", `Дары улучшили отношения с державой «${FACTIONS[targetFaction].shortName}».`);
  return { ok: true, state: next, message: "Послы приняли дар" };
}

export function offerTrade(state, targetFaction, random = Math.random) {
  const next = clone(state);
  const player = next.factions[state.playerFaction];
  const key = relationKey(state.playerFaction, targetFaction);
  const relation = next.diplomacy[key];
  if (!relation || relation.status === "war") return { ok: false, state, message: "Во время войны торговый договор невозможен" };
  if (relation.status === "trade") return { ok: false, state, message: "Торговый договор уже действует" };
  if (player.authority < 5) return { ok: false, state, message: "Нужно 5 авторитета" };
  player.authority -= 5;
  const accepted = relation.opinion + random() * 70 >= 25;
  relation.opinion = clamp(relation.opinion + (accepted ? 12 : -4), -100, 100);
  if (accepted) relation.status = "trade";
  addLog(next, "diplomacy", accepted
    ? `Заключён торговый договор с державой «${FACTIONS[targetFaction].shortName}».`
    : `${FACTIONS[targetFaction].shortName} отклоняет торговое предложение.`);
  return { ok: true, state: next, accepted, message: accepted ? "Договор заключён" : "Предложение отклонено" };
}

const collectIncome = (state, factionId) => {
  const faction = state.factions[factionId];
  if (!faction?.alive || factionId === "rebels") return;
  const economy = factionEconomy(state, factionId);
  faction.gold = Math.max(0, faction.gold + economy.netGold);
  faction.food = Math.max(0, faction.food + economy.food - getOwnedProvinces(state, factionId).length * 12);
  const ownedCount = getOwnedProvinces(state, factionId).length;
  const authorityGain = factionId === "hre" ? Math.max(1, Math.floor(ownedCount / 3)) : Math.max(1, Math.floor(ownedCount / 5));
  faction.authority = clamp(faction.authority + authorityGain, 0, 100);
  for (const item of getOwnedProvinces(state, factionId)) {
    item.unrest = clamp(item.unrest + (faction.food === 0 ? 10 : -4), 0, 100);
  }
};

const aiRecruit = (state, factionId) => {
  const faction = state.factions[factionId];
  if (!faction || faction.gold < 160) return;
  const owned = getOwnedProvinces(state, factionId);
  const border = owned
    .filter((item) => item.neighbors.some((id) => state.provinces[id]?.owner !== factionId))
    .sort((left, right) => armyStrength(left.army, factionId) - armyStrength(right.army, factionId))[0]
    ?? owned[0];
  if (!border) return;
  let unitId = "levy";
  if (border.buildings.castle && faction.gold >= UNIT_TYPES.knights.cost) unitId = "knights";
  else if (border.buildings.barracks && faction.gold >= UNIT_TYPES.archers.cost) unitId = "archers";
  const unit = UNIT_TYPES[unitId];
  faction.gold -= Math.round(unit.cost * FACTIONS[factionId].recruitBonus);
  faction.food = Math.max(0, faction.food - unit.foodCost);
  border.army[unitId] += 1;
};

const aiBuild = (state, factionId, random) => {
  const faction = state.factions[factionId];
  if (!faction || faction.gold < 520 || random() > 0.5) return;
  const owned = getOwnedProvinces(state, factionId);
  const target = owned[Math.floor(random() * owned.length) % owned.length];
  if (!target) return;
  const buildingId = (target.buildings.farm ?? 0) <= (target.buildings.market ?? 0) ? "farm" : "market";
  const cost = buildingCost(target, buildingId);
  if (cost && cost.level <= 2 && faction.gold >= cost.gold) {
    faction.gold -= cost.gold;
    target.buildings[buildingId] = cost.level;
  }
};

const aiCampaign = (state, factionId, random) => {
  if (!state.factions[factionId]?.alive || factionId === "rebels") return;
  aiRecruit(state, factionId);
  aiBuild(state, factionId, random);
  const candidates = [];
  for (const from of getOwnedProvinces(state, factionId)) {
    if (sumArmy(from.army) < 3) continue;
    for (const neighborId of from.neighbors) {
      const target = state.provinces[neighborId];
      if (!target || target.owner === factionId) continue;
      if (getDiplomacy(state, factionId, target.owner).status !== "war") continue;
      const score = armyStrength(from.army, factionId) - armyStrength(target.army, target.owner)
        + (target.capital ? 3 : 0) + random();
      candidates.push({ from, target, score });
    }
  }
  candidates.sort((left, right) => right.score - left.score);
  const move = candidates[0];
  if (!move || move.score < -1.5) return;
  const tactics = Object.keys(TACTICS);
  resolveAiBattle(state, move.from.id, move.target.id, tactics[Math.floor(random() * tactics.length) % tactics.length], random);
};

const resolveAiBattle = (state, fromId, toId, tacticId, random) => {
  const from = state.provinces[fromId];
  const to = state.provinces[toId];
  const attacking = marchingArmy(from.army);
  subtractArmy(from.army, attacking);
  const defenderTactics = Object.keys(TACTICS);
  const defenderTactic = defenderTactics[Math.floor(random() * defenderTactics.length) % defenderTactics.length];
  const attackPower = armyStrength(attacking, from.owner, tacticId) * tacticAdvantage(tacticId, defenderTactic) * (0.9 + random() * 0.2);
  const defensePower = armyStrength(to.army, to.owner, defenderTactic)
    * (FACTIONS[to.owner]?.defenseBonus ?? 1)
    * (TERRAIN[to.terrain]?.defense ?? 1)
    * (1 + (to.buildings.castle ?? 0) * 0.3)
    * (0.9 + random() * 0.2);
  const won = attackPower > defensePower;
  const ratio = attackPower / Math.max(0.1, defensePower);
  if (won) {
    to.army = applyCasualties(attacking, clamp(0.5 + ratio * 0.15, 0.52, 0.85));
    if (sumArmy(to.army) === 0) to.army.levy = 1;
    const defeated = to.owner;
    to.owner = from.owner;
    to.unrest = 50;
    addLog(state, "world", `${FACTIONS[from.owner].shortName} захватывает ${to.name} у державы «${FACTIONS[defeated].shortName}».`);
  } else {
    to.army = applyCasualties(to.army, clamp(0.55 + (1 / ratio) * 0.12, 0.55, 0.88));
    if (sumArmy(to.army) === 0) to.army.levy = 1;
    addArmy(from.army, applyCasualties(attacking, clamp(0.2 + ratio * 0.15, 0.2, 0.48)));
  }
};

const applyRandomEvent = (state, random) => {
  if (state.turn % 3 !== 0) return;
  const event = RANDOM_EVENTS[Math.floor(random() * RANDOM_EVENTS.length) % RANDOM_EVENTS.length];
  const player = state.factions[state.playerFaction];
  player.gold = Math.max(0, player.gold + event.gold);
  player.food = Math.max(0, player.food + event.food);
  player.authority = clamp(player.authority + event.authority, 0, 100);
  state.pendingEvent = clone(event);
  addLog(state, "event", `${event.title}: ${event.text}`);
};

export function endTurn(state, random = Math.random) {
  if (state.gameOver) return { ok: false, state, message: "Кампания завершена" };
  const next = clone(state);
  next.pendingEvent = null;
  for (const factionId of Object.keys(next.factions)) collectIncome(next, factionId);
  for (const factionId of Object.keys(next.factions)) {
    if (factionId !== next.playerFaction) aiCampaign(next, factionId, random);
  }
  for (const item of Object.values(next.provinces)) {
    item.moved = false;
    item.recruited = false;
  }
  next.turn += 1;
  next.seasonIndex = (next.seasonIndex + 1) % SEASONS.length;
  if (next.seasonIndex === 0) next.year += 1;
  applyRandomEvent(next, random);
  updateFactionSurvival(next);
  checkGameOver(next);
  return { ok: true, state: next, message: `Начался ход ${next.turn}` };
}

const updateFactionSurvival = (state) => {
  for (const [factionId, faction] of Object.entries(state.factions)) {
    if (factionId === "rebels") continue;
    faction.alive = getOwnedProvinces(state, factionId).length > 0;
  }
};

const checkGameOver = (state) => {
  const playerProvinces = getOwnedProvinces(state, state.playerFaction);
  const capitals = playerProvinces.filter((item) => item.capital).length;
  if (playerProvinces.length === 0) {
    state.gameOver = { result: "defeat", title: "Корона утрачена", text: "Ваш последний оплот пал. Европа помнит смелую, но недолгую династию." };
  } else if (playerProvinces.length >= state.objectives.provincesToWin || capitals >= state.objectives.capitalsToWin) {
    state.gameOver = { result: "victory", title: "Владыка Европы", text: "Великие столицы признали вашу власть. Начинается эпоха единой короны." };
  }
};

const addLog = (state, type, text) => {
  state.eventLog.unshift({ turn: state.turn, type, text });
  state.eventLog = state.eventLog.slice(0, 24);
};

export function campaignProgress(state) {
  const owned = getOwnedProvinces(state, state.playerFaction);
  const capitals = owned.filter((item) => item.capital).length;
  return {
    provinces: owned.length,
    provincesTarget: state.objectives.provincesToWin,
    capitals,
    capitalsTarget: state.objectives.capitalsToWin,
    percent: Math.min(100, Math.max(
      owned.length / state.objectives.provincesToWin,
      capitals / state.objectives.capitalsToWin,
    ) * 100),
  };
}

export function validateCampaignData() {
  const errors = [];
  const ids = new Set(PROVINCES.map((item) => item.id));
  for (const item of PROVINCES) {
    if (!FACTIONS[item.owner]) errors.push(`${item.id}: неизвестный владелец`);
    if (!(item.path || item.points) || item.center.length !== 2) errors.push(`${item.id}: некорректная геометрия`);
    for (const neighbor of item.neighbors) {
      if (!ids.has(neighbor)) errors.push(`${item.id}: неизвестный сосед ${neighbor}`);
      else if (!PROVINCES.find((candidate) => candidate.id === neighbor).neighbors.includes(item.id)) {
        errors.push(`${item.id}: граница с ${neighbor} не взаимна`);
      }
    }
    for (const unitId of Object.keys(UNIT_TYPES)) {
      if (!Number.isInteger(item.army[unitId]) || item.army[unitId] < 0) errors.push(`${item.id}: некорректная армия`);
    }
  }
  for (const faction of Object.values(FACTIONS).filter((item) => item.playable)) {
    if (!ids.has(faction.capital)) errors.push(`${faction.id}: столица не найдена`);
  }
  return errors;
}

export function hydrateCampaign(rawState) {
  if (!rawState || rawState.version !== SAVE_VERSION || !FACTIONS[rawState.playerFaction]) return null;
  const next = clone(rawState);
  for (const item of PROVINCES) {
    if (!next.provinces[item.id]) return null;
  }
  next.pendingEvent ??= null;
  next.gameOver ??= null;
  return next;
}
