const between = (value, min, max) => value >= min && value <= max;

export const WORLD_SIZE = 520;

export const MISSIONS = Object.freeze([
  { id: "shop", title: "Продукты для Анны Петровны", text: "Заберите продукты у магазина и отвезите к дому у леса.", start: [8, -180], finish: [-128, 118], reward: 480, cargo: "Продукты" },
  { id: "farm", title: "Запчасти на ферму", text: "На ферме остановился трактор. Доставьте коробку деталей.", start: [-16, -92], finish: [174, 172], reward: 650, cargo: "Запчасти" },
  { id: "station", title: "До вечернего поезда", text: "Подвезите пассажира к маленькой станции.", start: [2, 42], finish: [-196, 214], reward: 720, cargo: "Пассажир" },
  { id: "sawmill", title: "Документы для пилорамы", text: "Проедьте лесной дорогой и передайте документы мастеру.", start: [-4, 142], finish: [188, -128], reward: 780, cargo: "Документы" },
  { id: "rain", title: "Доставка под дождём", text: "Отвезите хрупкий груз на дальний хутор, не разбив машину.", start: [32, -214], finish: [-205, -156], reward: 980, cargo: "Хрупкий груз", weather: "rain" },
]);

export function surfaceAt(x, z, weather = "clear") {
  const wet = weather === "rain";
  if (between(z, 250, 272) && !between(x, -12, 14) && !between(x, 108, 132)) return "water";
  if (between(x, 102, 138) && between(z, 248, 276)) return "gravel";
  if (Math.abs(x) < 8 && between(z, -250, 270)) return wet ? "wetAsphalt" : "asphalt";
  if (Math.abs(z - 30) < 7 && between(x, -220, 205)) return wet ? "wetAsphalt" : "asphalt";
  if (Math.abs(z + 182) < 6 && between(x, -220, 42)) return "gravel";
  if (Math.abs(x - 170) < 7 && between(z, -150, 185)) return wet ? "mud" : "dirt";
  if (Math.abs(x + 126) < 8 && between(z, 92, 220)) return wet ? "mud" : "dirt";
  if (between(x, 60, 145) && between(z, 85, 145)) return "mud";
  if (between(x, -225, -155) && between(z, -210, -125)) return "sand";
  return "grass";
}

export function createWorld() {
  const objects = [];
  const obstacles = [];
  const add = (type, x, y, z, sx, sy, sz, color, solid = true, label = "") => {
    objects.push({ type, x, y, z, sx, sy, sz, color, label });
    if (solid) obstacles.push({ x, z, rx: sx * .55, rz: sz * .55, type });
  };

  for (let z = -220; z <= 210; z += 42) {
    const side = Math.floor((z + 220) / 42) % 2 ? 1 : -1;
    add("house", -25, 2.8, z, 11, 5.6, 9, side > 0 ? "#8f795f" : "#756b58", true);
    add("roof", -25, 7.1, z, 12, 3, 10, "#57443a", false);
    add("house", 27, 2.5, z + 16, 10, 5, 8, side > 0 ? "#80715d" : "#9a866b", true);
    add("roof", 27, 6.4, z + 16, 11, 2.8, 9, "#4e4942", false);
  }
  add("shop", 19, 3, -180, 15, 6, 12, "#65776a", true, "МАГАЗИН");
  add("farm", 174, 4, 172, 32, 8, 20, "#7c6754", true, "ФЕРМА");
  add("sawmill", 188, 3.5, -128, 28, 7, 15, "#6b5945", true, "ПИЛОРАМА");
  add("station", -196, 3, 214, 24, 6, 10, "#8a806e", true, "СТАНЦИЯ");
  add("chapel", 42, 5, 55, 8, 10, 8, "#b0a68c", true, "ЧАСОВНЯ");
  add("tower", -78, 13, -78, 5, 26, 5, "#69777a", true, "БАШНЯ");
  add("elevator", 115, 9, -65, 17, 18, 16, "#777166", true, "ЭЛЕВАТОР");

  let seed = 431;
  const random = () => { seed = seed * 16807 % 2147483647; return (seed - 1) / 2147483646; };
  for (let index = 0; index < 95; index += 1) {
    const x = random() * 470 - 235;
    const z = random() * 470 - 235;
    if (Math.abs(x) < 44 || Math.abs(z - 30) < 30 || surfaceAt(x, z) !== "grass") continue;
    const size = 2.1 + random() * 2.5;
    add("tree", x, size * 1.5, z, size, size * 3, size, "#435d3c", true);
  }
  return { objects, obstacles };
}

export function nearestMission(state, x, z) {
  const completed = new Set(state.completedMissions ?? []);
  return MISSIONS.find((mission) => !completed.has(mission.id) && Math.hypot(x - mission.start[0], z - mission.start[1]) < 13) ?? null;
}

export function missionDistance(mission, x, z, active = false) {
  if (!mission) return Infinity;
  const target = active ? mission.finish : mission.start;
  return Math.hypot(x - target[0], z - target[1]);
}

export function checkCollision(obstacles, x, z, radius = 1.5) {
  return obstacles.find((item) => Math.abs(x - item.x) < item.rx + radius && Math.abs(z - item.z) < item.rz + radius) ?? null;
}
