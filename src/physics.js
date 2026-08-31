export const SURFACES = Object.freeze({
  asphalt: { id: "asphalt", name: "Асфальт", grip: 1, drag: 0.018, dust: 0 },
  wetAsphalt: { id: "wetAsphalt", name: "Мокрый асфальт", grip: .78, drag: .022, dust: 0 },
  dirt: { id: "dirt", name: "Грунт", grip: .68, drag: .052, dust: .8 },
  gravel: { id: "gravel", name: "Гравий", grip: .62, drag: .06, dust: 1 },
  grass: { id: "grass", name: "Трава", grip: .54, drag: .085, dust: .2 },
  sand: { id: "sand", name: "Песок", grip: .42, drag: .15, dust: .9 },
  mud: { id: "mud", name: "Грязь", grip: .3, drag: .22, dust: .25 },
  water: { id: "water", name: "Мелкая вода", grip: .36, drag: .25, dust: 0 },
});

export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function createVehicleState(seed = {}) {
  return {
    x: seed.x ?? 0,
    z: seed.z ?? -210,
    heading: seed.heading ?? 0,
    speed: seed.speed ?? 0,
    steer: 0,
    rpm: 850,
    gear: seed.gear ?? "D",
    engineOn: seed.engineOn ?? false,
    fuel: seed.fuel ?? 42,
    money: seed.money ?? 1200,
    damage: seed.damage ?? 0,
    suspensionDamage: seed.suspensionDamage ?? 0,
    tireDamage: seed.tireDamage ?? 0,
    distance: seed.distance ?? 0,
    headlights: seed.headlights ?? false,
    upgrades: seed.upgrades ?? { tires: 0, suspension: 0, engine: 0, tank: 0 },
  };
}

export function stepVehicle(source, input, dt, surfaceId = "asphalt") {
  const state = { ...source, upgrades: { ...source.upgrades } };
  const surface = SURFACES[surfaceId] ?? SURFACES.grass;
  const step = clamp(dt, 0, 1 / 20);
  const tireBonus = state.upgrades.tires * .08;
  const damagePower = 1 - clamp(state.damage / 130, 0, .62);
  const grip = clamp(surface.grip + tireBonus - state.tireDamage * .004, .18, 1.15);
  const direction = state.gear === "R" ? -1 : 1;
  const maxSpeed = direction < 0 ? 9 : 31 + state.upgrades.engine * 2.8;
  const throttle = state.engineOn && state.fuel > 0 ? clamp(input.throttle ?? 0, 0, 1) : 0;
  const brake = clamp(input.brake ?? 0, 0, 1);
  const handbrake = clamp(input.handbrake ?? 0, 0, 1);
  const desiredSteer = clamp(input.steer ?? 0, -1, 1);
  state.steer += (desiredSteer - state.steer) * Math.min(1, step * 8);

  let acceleration = throttle * 5.6 * damagePower * (1 - Math.min(.92, Math.abs(state.speed) / maxSpeed));
  acceleration *= direction;
  const rolling = (surface.drag * 25 + .08) * Math.sign(state.speed);
  const braking = brake * 9.5 * Math.sign(state.speed);
  const handbraking = handbrake * 12 * Math.sign(state.speed);
  state.speed += (acceleration - rolling - braking - handbraking) * step;
  if (!throttle && Math.abs(state.speed) < .12) state.speed = 0;
  state.speed = clamp(state.speed, -maxSpeed, maxSpeed);

  const steeringGrip = handbrake > .2 ? grip * .36 : grip;
  const steeringEffect = state.steer * clamp(Math.abs(state.speed) / 3.5, 0, 1) * steeringGrip;
  state.heading += steeringEffect * state.speed * step / 3.1;
  const slip = Math.abs(state.steer) * Math.abs(state.speed) * (1 - grip) * .014;
  const travel = state.speed * step * (1 - slip);
  state.x += Math.sin(state.heading) * travel;
  state.z += Math.cos(state.heading) * travel;
  state.distance += Math.abs(travel);
  state.fuel = Math.max(0, state.fuel - (Math.abs(throttle) * .0027 + Math.abs(state.speed) * .000025) * step * 60);

  const displaySpeed = Math.abs(state.speed) * 3.6;
  const autoGear = displaySpeed < 1 ? 1 : displaySpeed < 22 ? 1 : displaySpeed < 43 ? 2 : displaySpeed < 67 ? 3 : 4;
  state.rpm = state.engineOn ? clamp(780 + displaySpeed * (autoGear === 1 ? 96 : 48) + throttle * 900, 780, 6100) : 0;
  return state;
}

export function collisionDamage(speed, severity = 1) {
  const energy = Math.max(0, Math.abs(speed) - 2.5);
  return Math.round(energy * energy * .42 * clamp(severity, .2, 2));
}

export function repairVehicle(source, full = false) {
  const cost = full ? Math.ceil(source.damage * 18 + source.suspensionDamage * 24 + source.tireDamage * 20) : Math.ceil(source.damage * 8);
  if (source.money < cost) return { ok: false, state: source, cost, message: "Не хватает денег на ремонт" };
  return {
    ok: true,
    cost,
    state: { ...source, money: source.money - cost, damage: full ? 0 : Math.max(0, source.damage - 30), suspensionDamage: full ? 0 : source.suspensionDamage, tireDamage: full ? 0 : source.tireDamage },
    message: full ? "Автомобиль полностью отремонтирован" : "Кузов и двигатель отремонтированы",
  };
}

export function refuelVehicle(source, liters = 10) {
  const capacity = 45 + source.upgrades.tank * 8;
  const amount = Math.min(liters, capacity - source.fuel);
  const cost = Math.ceil(amount * 6);
  if (amount <= 0) return { ok: false, state: source, message: "Бак уже заполнен" };
  if (source.money < cost) return { ok: false, state: source, message: "Не хватает денег на топливо" };
  return { ok: true, cost, state: { ...source, money: source.money - cost, fuel: source.fuel + amount }, message: `Заправлено ${Math.round(amount)} л` };
}

export function applyUpgrade(source, type) {
  const prices = { tires: 900, suspension: 1200, engine: 1600, tank: 750 };
  if (!(type in prices) || source.upgrades[type] >= 2) return { ok: false, state: source, message: "Улучшение недоступно" };
  const cost = prices[type] * (source.upgrades[type] + 1);
  if (source.money < cost) return { ok: false, state: source, message: "Не хватает денег" };
  return { ok: true, state: { ...source, money: source.money - cost, upgrades: { ...source.upgrades, [type]: source.upgrades[type] + 1 } }, cost, message: "Улучшение установлено" };
}
