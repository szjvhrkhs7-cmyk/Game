import { BUILDING_TYPES, FACTIONS, TERRAIN, UNIT_TYPES } from "./data.js";

const clone = (value) => JSON.parse(JSON.stringify(value));
const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));
const relationKey = (left, right) => [left, right].sort().join(":");

export const BATTLE_ORDERS = Object.freeze({
  charge: { id: "charge", name: "Стальной натиск", icon: "⚔", beats: "volley", description: "Сильный удар по стрелковой линии" },
  defend: { id: "defend", name: "Держать строй", icon: "▥", beats: "feint", description: "Надёжная защита и высокий боевой дух" },
  flank: { id: "flank", name: "Обход с фланга", icon: "➟", beats: "charge", description: "Эффективен при наличии конницы" },
  volley: { id: "volley", name: "Шквал стрел", icon: "⌁", beats: "flank", description: "Останавливает манёвр противника" },
  feint: { id: "feint", name: "Ложное отступление", icon: "↶", beats: "defend", description: "Выманивает обороняющихся из строя" },
});

export const BATTLE_FORMATIONS = Object.freeze({
  line: { id: "line", name: "Широкая линия", icon: "━", description: "Устойчива против обхода", bonus: { defend: 1.08, volley: 1.04 } },
  wedge: { id: "wedge", name: "Клин", icon: "▲", description: "Усиливает фронтальный удар", bonus: { charge: 1.1, feint: .96 } },
  echelon: { id: "echelon", name: "Косой строй", icon: "◩", description: "Поддерживает фланговый манёвр", bonus: { flank: 1.09, volley: .97 } },
});

export const SETTLEMENT_TIERS = Object.freeze({
  village: { id: "village", name: "Деревня", slots: 3, defense: 1 },
  town: { id: "town", name: "Город", slots: 4, defense: 1.08 },
  city: { id: "city", name: "Крупный город", slots: 5, defense: 1.15 },
  fortress: { id: "fortress", name: "Крепость", slots: 5, defense: 1.25 },
  castle: { id: "castle", name: "Замок", slots: 6, defense: 1.35 },
  capital: { id: "capital", name: "Столица", slots: 7, defense: 1.4 },
});

export const TAX_LEVELS = Object.freeze({
  low: { id: "low", name: "Низкие", income: 0.82, unrest: -8 },
  normal: { id: "normal", name: "Обычные", income: 1, unrest: 0 },
  high: { id: "high", name: "Высокие", income: 1.22, unrest: 7 },
});

export function emptyUnits(seed = {}) {
  return Object.fromEntries(Object.keys(UNIT_TYPES).map((id) => [id, Math.max(0, Number(seed[id]) || 0)]));
}

export function unitGroups(units) {
  return Object.values(units).reduce((sum, amount) => sum + amount, 0);
}

export function soldiersIn(units) {
  return Object.entries(units).reduce((sum, [id, amount]) => sum + amount * (UNIT_TYPES[id]?.soldiers ?? 0), 0);
}

export function strengthOf(units, factionId, orderId = null) {
  const groups = Math.max(1, unitGroups(units));
  let result = Object.entries(units).reduce((sum, [id, amount]) => sum + amount * (UNIT_TYPES[id]?.power ?? 0), 0);
  if (orderId === "flank") result *= 1 + Math.min(0.18, ((units.knights ?? 0) / groups) * 0.5);
  if (orderId === "volley") result *= 1 + Math.min(0.16, (((units.archers ?? 0) + (units.crossbowmen ?? 0)) / groups) * 0.4);
  if (orderId === "defend") result *= 1.08;
  if (orderId === "charge") result *= 1 + Math.min(0.12, ((units.heavyInfantry ?? 0) / groups) * 0.3);
  return result * (FACTIONS[factionId]?.powerBonus ?? 1);
}

export function createFieldArmy(id, factionId, regionId, options = {}) {
  return {
    id,
    factionId,
    regionId,
    commander: options.commander ?? `Сэр ${FACTIONS[factionId]?.ruler?.split(" ").at(-1) ?? "Командор"}`,
    units: emptyUnits(options.units),
    morale: options.morale ?? 72,
    experience: options.experience ?? 0,
    supply: options.supply ?? 100,
    movementPoints: options.movementPoints ?? 3,
    maxMovementPoints: 3,
    route: [],
    status: "ready",
    siege: null,
  };
}

export function armiesAt(state, regionId, factionId = null) {
  return Object.values(state.armies ?? {}).filter((army) => army.regionId === regionId && (!factionId || army.factionId === factionId));
}

export function buildingSlots(province) {
  const tier = SETTLEMENT_TIERS[province.settlement?.tier ?? "village"] ?? SETTLEMENT_TIERS.village;
  return tier.slots + (province.buildings.hall ?? 0) + (province.buildings.castle ?? 0);
}

export function occupiedBuildingSlots(province) {
  return Object.values(province.buildings).reduce((sum, level) => sum + level, 0)
    + (province.constructionQueue?.length ?? 0);
}

export function queueConstruction(state, provinceId, buildingId) {
  const province = state.provinces[provinceId];
  const type = BUILDING_TYPES[buildingId];
  if (!province || !type) return { ok: false, state, message: "Постройка недоступна" };
  if (province.owner !== state.playerFaction) return { ok: false, state, message: "Строить можно только в своих владениях" };
  if (type.coastalOnly && !province.coastal) return { ok: false, state, message: "Для порта нужен морской берег" };
  if ((province.constructionQueue?.length ?? 0) >= 2) return { ok: false, state, message: "Очередь строительства заполнена" };
  if (province.constructionQueue?.some((item) => item.buildingId === buildingId)) return { ok: false, state, message: "Это здание уже строится" };
  const currentLevel = province.buildings[buildingId] ?? 0;
  if (currentLevel >= 2) return { ok: false, state, message: "Достигнут высший уровень" };
  if (occupiedBuildingSlots(province) >= buildingSlots(province) && currentLevel === 0) {
    return { ok: false, state, message: "Нет свободных строительных ячеек" };
  }
  const level = currentLevel + 1;
  const gold = Math.round(type.baseCost * (1 + (level - 1) * 0.72));
  const authority = type.authorityCost * level;
  const treasury = state.factions[state.playerFaction];
  if (treasury.gold < gold || treasury.authority < authority) return { ok: false, state, message: "Не хватает золота или авторитета" };
  const next = clone(state);
  next.factions[state.playerFaction].gold -= gold;
  next.factions[state.playerFaction].authority -= authority;
  next.provinces[provinceId].constructionQueue.push({ buildingId, level, turnsRemaining: type.turns, totalTurns: type.turns });
  return { ok: true, state: next, message: `${type.name}: строительство начато (${type.turns} х.)` };
}

export function queueRecruitment(state, provinceId, unitId) {
  const province = state.provinces[provinceId];
  const unit = UNIT_TYPES[unitId];
  if (!province || !unit) return { ok: false, state, message: "Отряд недоступен" };
  if (province.owner !== state.playerFaction) return { ok: false, state, message: "Найм доступен только в своих владениях" };
  if ((province.recruitmentQueue?.length ?? 0) >= 3) return { ok: false, state, message: "Очередь найма заполнена" };
  if (unit.requirement && !(province.buildings[unit.requirement] > 0)) return { ok: false, state, message: `Требуется: ${BUILDING_TYPES[unit.requirement].name}` };
  const faction = state.factions[state.playerFaction];
  const gold = Math.round(unit.cost * (FACTIONS[state.playerFaction].recruitBonus ?? 1));
  if (faction.gold < gold || faction.food < unit.foodCost) return { ok: false, state, message: "Не хватает золота или продовольствия" };
  const next = clone(state);
  next.factions[state.playerFaction].gold -= gold;
  next.factions[state.playerFaction].food -= unit.foodCost;
  next.provinces[provinceId].recruitmentQueue.push({ unitId, turnsRemaining: unit.turns, totalTurns: unit.turns });
  return { ok: true, state: next, message: `${unit.name}: набор начат (${unit.turns} х.)` };
}

export function setTaxLevel(state, provinceId, levelId) {
  if (!TAX_LEVELS[levelId]) return { ok: false, state, message: "Неизвестный уровень налогов" };
  const province = state.provinces[provinceId];
  if (!province || province.owner !== state.playerFaction) return { ok: false, state, message: "Управление недоступно" };
  const next = clone(state);
  next.provinces[provinceId].taxLevel = levelId;
  return { ok: true, state: next, message: `Налоги: ${TAX_LEVELS[levelId].name.toLowerCase()}` };
}

export function raiseFieldArmy(state, provinceId) {
  const province = state.provinces[provinceId];
  if (!province || province.owner !== state.playerFaction) return { ok: false, state, message: "Армию можно сформировать только в своих землях" };
  const available = emptyUnits(province.army);
  const detached = emptyUnits();
  for (const unitId of Object.keys(available)) detached[unitId] = Math.max(0, Math.floor(available[unitId] / 2));
  if (unitGroups(detached) < 2) return { ok: false, state, message: "Нужно не менее четырёх отрядов в гарнизоне" };
  const next = clone(state);
  for (const unitId of Object.keys(detached)) next.provinces[provinceId].army[unitId] -= detached[unitId];
  const id = `army-${next.nextArmyId}`;
  next.nextArmyId += 1;
  next.armies[id] = createFieldArmy(id, state.playerFaction, provinceId, { units: detached });
  next.selectedArmy = id;
  return { ok: true, state: next, message: "Полевая армия сформирована" };
}

export function transferUnit(state, provinceId, armyId, unitId, direction) {
  const province = state.provinces[provinceId];
  const army = state.armies?.[armyId];
  if (!province || !army || army.regionId !== provinceId || army.factionId !== state.playerFaction || !UNIT_TYPES[unitId]) {
    return { ok: false, state, message: "Передача отряда недоступна" };
  }
  const source = direction === "toArmy" ? province.army : army.units;
  if ((source[unitId] ?? 0) < 1) return { ok: false, state, message: "Нет доступного отряда" };
  const next = clone(state);
  const from = direction === "toArmy" ? next.provinces[provinceId].army : next.armies[armyId].units;
  const to = direction === "toArmy" ? next.armies[armyId].units : next.provinces[provinceId].army;
  from[unitId] -= 1;
  to[unitId] += 1;
  return { ok: true, state: next, message: "Отряд переведён" };
}

export function mergeArmies(state, sourceId, targetId) {
  const source = state.armies?.[sourceId];
  const target = state.armies?.[targetId];
  if (!source || !target || source.factionId !== state.playerFaction || target.factionId !== source.factionId || target.regionId !== source.regionId) {
    return { ok: false, state, message: "Армии должны находиться в одном регионе" };
  }
  const next = clone(state);
  for (const unitId of Object.keys(UNIT_TYPES)) next.armies[targetId].units[unitId] += next.armies[sourceId].units[unitId];
  next.armies[targetId].morale = Math.round((source.morale + target.morale) / 2);
  delete next.armies[sourceId];
  next.selectedArmy = targetId;
  return { ok: true, state: next, message: "Армии объединены" };
}

const movementCost = (province) => {
  const terrain = province.terrain === "hills" ? 2 : province.terrain === "forest" ? 1.5 : 1;
  return Math.max(0.5, terrain - (province.buildings.road ?? 0) * 0.35);
};

export function findRoute(state, armyId, destinationId) {
  const army = state.armies?.[armyId];
  if (!army || !state.provinces[destinationId]) return [];
  const distances = { [army.regionId]: 0 };
  const previous = {};
  const queue = new Set([army.regionId]);
  while (queue.size) {
    const current = [...queue].sort((a, b) => distances[a] - distances[b])[0];
    queue.delete(current);
    if (current === destinationId) break;
    for (const neighborId of state.provinces[current].neighbors) {
      const neighbor = state.provinces[neighborId];
      const relation = neighbor.owner === army.factionId ? "friendly" : state.diplomacy[relationKey(army.factionId, neighbor.owner)]?.status;
      if (neighbor.owner !== army.factionId && relation !== "war" && neighbor.owner !== "rebels") continue;
      const distance = distances[current] + movementCost(neighbor);
      if (distance < (distances[neighborId] ?? Infinity)) {
        distances[neighborId] = distance;
        previous[neighborId] = current;
        queue.add(neighborId);
      }
    }
  }
  if (destinationId !== army.regionId && !previous[destinationId]) return [];
  const route = [];
  let cursor = destinationId;
  while (cursor !== army.regionId) { route.unshift(cursor); cursor = previous[cursor]; }
  return route;
}

export function planArmyRoute(state, armyId, destinationId) {
  const army = state.armies?.[armyId];
  if (!army || army.factionId !== state.playerFaction) return { ok: false, state, message: "Выберите свою армию" };
  if (army.status === "sieging") return { ok: false, state, message: "Сначала снимите осаду" };
  const route = findRoute(state, armyId, destinationId);
  if (!route.length) return { ok: false, state, message: "Доступный маршрут не найден" };
  const next = clone(state);
  next.armies[armyId].route = route;
  return { ok: true, state: next, message: `Маршрут построен: ${route.length} регионов` };
}

export function cancelArmyRoute(state, armyId) {
  if (!state.armies?.[armyId]) return { ok: false, state, message: "Армия не найдена" };
  const next = clone(state);
  next.armies[armyId].route = [];
  return { ok: true, state: next, message: "Маршрут отменён" };
}

function orderAdvantage(attacker, defender) {
  if (BATTLE_ORDERS[attacker]?.beats === defender) return 1.2;
  if (BATTLE_ORDERS[defender]?.beats === attacker) return 0.86;
  return 1;
}

function applyLosses(units, survival) {
  return Object.fromEntries(Object.entries(units).map(([id, amount]) => [id, Math.max(0, Math.round(amount * survival))]));
}

export function previewFieldBattle(state, armyId, targetId) {
  const army = state.armies?.[armyId];
  const target = state.provinces[targetId];
  if (!army || !target) return null;
  const defenders = armiesAt(state, targetId, target.owner);
  const defenderUnits = emptyUnits(target.army);
  for (const defendingArmy of defenders) for (const id of Object.keys(UNIT_TYPES)) defenderUnits[id] += defendingArmy.units[id];
  return {
    kind: "field",
    armyId,
    fromId: army.regionId,
    toId: targetId,
    attacker: army.factionId,
    defender: target.owner,
    attackers: clone(army.units),
    defenders: defenderUnits,
    attackerSoldiers: soldiersIn(army.units),
    defenderSoldiers: soldiersIn(defenderUnits),
    terrain: TERRAIN[target.terrain],
    fortLevel: (target.buildings.castle ?? 0) + (target.buildings.walls ?? 0),
  };
}

export function moveFieldArmy(state, armyId, targetId) {
  const army = state.armies?.[armyId];
  const target = state.provinces[targetId];
  if (!army || army.factionId !== state.playerFaction) return { ok: false, state, message: "Выберите свою армию" };
  if (!state.provinces[army.regionId].neighbors.includes(targetId)) return { ok: false, state, message: "Армия может перейти только в соседний регион" };
  const cost = movementCost(target);
  if (army.movementPoints < cost) return { ok: false, state, message: "Не хватает очков движения" };
  if (target.owner !== army.factionId) {
    const status = target.owner === "rebels" ? "war" : state.diplomacy[relationKey(army.factionId, target.owner)]?.status;
    if (status !== "war") return { ok: false, state, message: `С державой «${FACTIONS[target.owner].shortName}» нет войны` };
    const fortified = (target.buildings.castle ?? 0) + (target.buildings.walls ?? 0) > 0;
    if (fortified) return startSiege(state, armyId, targetId);
    return { ok: true, state, battle: previewFieldBattle(state, armyId, targetId), message: "Противник преградил путь" };
  }
  const next = clone(state);
  next.armies[armyId].regionId = targetId;
  next.armies[armyId].movementPoints = Math.max(0, next.armies[armyId].movementPoints - cost);
  next.armies[armyId].route = next.armies[armyId].route.filter((id) => id !== targetId);
  next.selectedProvince = targetId;
  return { ok: true, state: next, message: `Армия прибыла в ${target.name}` };
}

export function resolveFieldBattle(state, armyId, targetId, orderId, random = Math.random, options = {}) {
  if (!BATTLE_ORDERS[orderId]) return { ok: false, state, message: "Неизвестный приказ" };
  const preview = previewFieldBattle(state, armyId, targetId);
  if (!preview) return { ok: false, state, message: "Сражение недоступно" };
  const next = clone(state);
  const army = next.armies[armyId];
  const target = next.provinces[targetId];
  const defenderOrders = Object.keys(BATTLE_ORDERS);
  const defenderOrder = defenderOrders[Math.floor(random() * defenderOrders.length) % defenderOrders.length];
  const terrain = TERRAIN[target.terrain]?.defense ?? 1;
  const fort = options.assault ? Math.max(1, 1 + preview.fortLevel * 0.18 - (army.siege?.turns ?? 0) * 0.08) : 1;
  const supply = clamp(army.supply / 100, 0.55, 1);
  const morale = clamp(army.morale / 70, 0.65, 1.25);
  const formation = BATTLE_FORMATIONS[options.formationId] ?? BATTLE_FORMATIONS.line;
  const formationBonus = formation.bonus[orderId] ?? 1;
  const attack = strengthOf(army.units, army.factionId, orderId) * orderAdvantage(orderId, defenderOrder) * formationBonus * supply * morale * (0.92 + random() * 0.16);
  const defense = strengthOf(preview.defenders, target.owner, defenderOrder) * terrain * fort * (FACTIONS[target.owner]?.defenseBonus ?? 1) * (0.92 + random() * 0.16);
  const won = attack > defense;
  const ratio = attack / Math.max(0.1, defense);
  const attackerAfter = applyLosses(army.units, won ? clamp(0.52 + ratio * 0.16, 0.58, 0.9) : clamp(0.2 + ratio * 0.16, 0.2, 0.5));
  const defenderAfter = applyLosses(preview.defenders, won ? clamp(0.12 + 0.14 / Math.max(ratio, 0.2), 0.1, 0.42) : clamp(0.54 + 0.12 / Math.max(ratio, 0.2), 0.55, 0.9));
  const previousOwner = target.owner;
  delete target.siege;
  army.units = attackerAfter;
  army.route = [];
  army.movementPoints = 0;
  army.siege = null;
  army.status = won ? "occupying" : "recovering";
  if (won) {
    for (const defender of armiesAt(next, targetId, previousOwner)) delete next.armies[defender.id];
    target.owner = army.factionId;
    target.army = emptyUnits();
    target.army.levy = Math.max(1, defenderAfter.levy ?? 0);
    target.unrest = 55;
    army.regionId = targetId;
    next.statistics.provincesConquered += army.factionId === state.playerFaction ? 1 : 0;
  } else {
    target.army = defenderAfter;
  }
  next.statistics.battles += army.factionId === state.playerFaction ? 1 : 0;
  if (won && army.factionId === state.playerFaction) next.statistics.victories += 1;
  const report = {
    attackerWon: won,
    province: target.name,
    attacker: army.factionId,
    defender: previousOwner,
    attackerTactic: orderId,
    defenderTactic: defenderOrder,
    formation: formation.id,
    attackerBefore: preview.attackerSoldiers,
    defenderBefore: preview.defenderSoldiers,
    attackerAfter: soldiersIn(attackerAfter),
    defenderAfter: soldiersIn(defenderAfter),
    advantage: orderAdvantage(orderId, defenderOrder),
  };
  return { ok: true, state: next, report, message: won ? "Победа" : "Поражение" };
}

export function startSiege(state, armyId, targetId) {
  const army = state.armies?.[armyId];
  const target = state.provinces[targetId];
  if (!army || !target || !state.provinces[army.regionId].neighbors.includes(targetId)) return { ok: false, state, message: "Осада недоступна" };
  const next = clone(state);
  next.armies[armyId].status = "sieging";
  next.armies[armyId].siege = { targetId, turns: 0, progress: 0 };
  next.armies[armyId].route = [];
  next.armies[armyId].movementPoints = 0;
  next.provinces[targetId].siege = { armyId, attacker: army.factionId, turns: 0 };
  return { ok: true, state: next, siege: true, message: `Начата осада: ${target.name}` };
}

export function assaultSiege(state, armyId, orderId, random = Math.random, options = {}) {
  const army = state.armies?.[armyId];
  if (!army?.siege) return { ok: false, state, message: "Армия не ведёт осаду" };
  return resolveFieldBattle(state, armyId, army.siege.targetId, orderId, random, { ...options, assault: true });
}

export function liftSiege(state, armyId) {
  const army = state.armies?.[armyId];
  if (!army?.siege) return { ok: false, state, message: "Осада не ведётся" };
  const next = clone(state);
  delete next.provinces[army.siege.targetId].siege;
  next.armies[armyId].siege = null;
  next.armies[armyId].status = "ready";
  return { ok: true, state: next, message: "Осада снята" };
}

export function processCampaignSystems(state) {
  for (const province of Object.values(state.provinces)) {
    province.constructionQueue ??= [];
    province.recruitmentQueue ??= [];
    for (const item of province.constructionQueue) item.turnsRemaining -= 1;
    const completedBuildings = province.constructionQueue.filter((item) => item.turnsRemaining <= 0);
    province.constructionQueue = province.constructionQueue.filter((item) => item.turnsRemaining > 0);
    for (const item of completedBuildings) province.buildings[item.buildingId] = item.level;
    for (const item of province.recruitmentQueue) item.turnsRemaining -= 1;
    const completedUnits = province.recruitmentQueue.filter((item) => item.turnsRemaining <= 0);
    province.recruitmentQueue = province.recruitmentQueue.filter((item) => item.turnsRemaining > 0);
    for (const item of completedUnits) province.army[item.unitId] = (province.army[item.unitId] ?? 0) + 1;
    const taxes = TAX_LEVELS[province.taxLevel] ?? TAX_LEVELS.normal;
    province.unrest = clamp(province.unrest + taxes.unrest, 0, 100);
  }
  for (const army of Object.values(state.armies ?? {})) {
    army.movementPoints = army.maxMovementPoints;
    army.supply = clamp(army.supply + (state.provinces[army.regionId].owner === army.factionId ? 18 : -12), 0, 100);
    if (army.status === "recovering" || army.status === "occupying") army.status = "ready";
    if (army.siege) {
      army.siege.turns += 1;
      army.siege.progress = clamp(army.siege.progress + 24 + (army.units.siege ?? 0) * 8, 0, 100);
      const target = state.provinces[army.siege.targetId];
      target.siege.turns = army.siege.turns;
      target.army = applyLosses(target.army, 0.9);
      target.unrest = clamp(target.unrest + 8, 0, 100);
      army.supply = clamp(army.supply - 10, 0, 100);
      continue;
    }
    while (army.route.length) {
      const targetId = army.route[0];
      const target = state.provinces[targetId];
      if (!target || target.owner !== army.factionId) break;
      const cost = movementCost(target);
      if (army.movementPoints < cost) break;
      army.regionId = targetId;
      army.movementPoints -= cost;
      army.route.shift();
    }
  }
}
