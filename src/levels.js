const ground = (segments, y = 790) => segments.map(([x, width]) => ({ x, y, width, height: 170, kind: "ground" }));
const ledge = (x, y, width, kind = "ledge") => ({ x, y, width, height: 24, kind });
const mouse = (x, y = 744, type = "walker") => ({ x, y, type });
const bananaLine = (x, y, count, gap = 54) => Array.from({ length: count }, (_, index) => ({ x: x + index * gap, y }));

export const LEVELS = [
  {
    id: "1-1",
    title: "Кухня на рассвете",
    intro: "Мыши выскочили из хлебницы. Догоним их, пока не остыл завтрак!",
    palette: "kitchen",
    worldWidth: 4200,
    spawn: { x: 120, y: 690 },
    goal: { x: 4000, y: 682 },
    platforms: [
      ...ground([[0, 900], [1030, 820], [1970, 1050], [3150, 1050]]),
      ledge(420, 650, 210, "table"),
      ledge(1180, 660, 180, "shelf"),
      ledge(1460, 570, 240, "shelf"),
      ledge(2140, 650, 220, "table"),
      ledge(2490, 555, 190, "shelf"),
      ledge(3290, 665, 200, "table"),
      ledge(3620, 570, 220, "shelf")
    ],
    hazards: [{ x: 1760, y: 772, width: 82 }, { x: 2920, y: 772, width: 82 }],
    enemies: [
      mouse(650), mouse(1240, 614, "runner"), mouse(1620, 524),
      mouse(2220, 604, "runner"), mouse(2700, 744, "jumper"),
      mouse(3410, 619), mouse(3720, 524, "runner")
    ],
    bananas: [
      ...bananaLine(240, 700, 5), ...bananaLine(1100, 610, 4),
      ...bananaLine(2020, 704, 5), ...bananaLine(2470, 500, 4),
      ...bananaLine(3200, 710, 6)
    ],
    checkpoints: [{ x: 2040, y: 712 }]
  },
  {
    id: "1-2",
    title: "Тайная кладовая",
    intro: "За банками варенья спрятан мышиный тоннель. Здесь темно, но пахнет бананами.",
    palette: "pantry",
    worldWidth: 4700,
    spawn: { x: 100, y: 690 },
    goal: { x: 4500, y: 682 },
    platforms: [
      ...ground([[0, 720], [850, 650], [1620, 960], [2720, 650], [3500, 1200]]),
      ledge(250, 600, 210, "crate"),
      ledge(920, 670, 180, "crate"),
      ledge(1160, 555, 220, "crate"),
      ledge(1730, 640, 220, "crate"),
      ledge(2060, 535, 210, "crate"),
      ledge(2390, 625, 150, "crate"),
      ledge(2800, 590, 220, "crate"),
      ledge(3100, 490, 170, "crate"),
      ledge(3620, 640, 230, "crate"),
      ledge(4020, 545, 230, "crate")
    ],
    hazards: [
      { x: 720, y: 772, width: 130 }, { x: 1490, y: 772, width: 130 },
      { x: 2580, y: 772, width: 140 }, { x: 3370, y: 772, width: 130 }
    ],
    enemies: [
      mouse(470, 554, "runner"), mouse(980, 624), mouse(1280, 509, "jumper"),
      mouse(1810, 594, "armored"), mouse(2220, 489, "runner"),
      mouse(2870, 544, "jumper"), mouse(3150, 444, "armored"),
      mouse(3710, 594, "runner"), mouse(4140, 499, "armored")
    ],
    bananas: [
      ...bananaLine(130, 675, 4), ...bananaLine(870, 610, 5),
      ...bananaLine(1670, 700, 6), ...bananaLine(2770, 535, 5),
      ...bananaLine(3530, 700, 6), ...bananaLine(4020, 485, 4)
    ],
    checkpoints: [{ x: 1750, y: 712 }, { x: 3540, y: 712 }]
  },
  {
    id: "2-1",
    title: "Крыши большого дома",
    intro: "След ведёт наверх. Ветер сильный, трубы горячие, а мыши надели каски.",
    palette: "rooftop",
    worldWidth: 5200,
    spawn: { x: 100, y: 650 },
    goal: { x: 5000, y: 612 },
    platforms: [
      ...ground([[0, 610], [760, 700], [1600, 610], [2360, 720], [3250, 650], [4070, 1130]], 735),
      ledge(230, 585, 180, "roof"),
      ledge(820, 565, 210, "roof"),
      ledge(1130, 470, 190, "roof"),
      ledge(1660, 565, 190, "roof"),
      ledge(2420, 540, 220, "roof"),
      ledge(2750, 445, 190, "roof"),
      ledge(3330, 555, 210, "roof"),
      ledge(4140, 520, 230, "roof"),
      ledge(4520, 420, 210, "roof")
    ],
    hazards: [
      { x: 610, y: 717, width: 150 }, { x: 1460, y: 717, width: 140 },
      { x: 2210, y: 717, width: 150 }, { x: 3080, y: 717, width: 170 },
      { x: 3900, y: 717, width: 170 }
    ],
    enemies: [
      mouse(310, 539, "jumper"), mouse(880, 519, "runner"),
      mouse(1210, 424, "armored"), mouse(1730, 519, "runner"),
      mouse(2500, 494, "armored"), mouse(2830, 399, "jumper"),
      mouse(3400, 509, "runner"), mouse(4210, 474, "armored"),
      mouse(4590, 374, "runner")
    ],
    bananas: [
      ...bananaLine(80, 620, 5), ...bananaLine(790, 510, 5),
      ...bananaLine(1620, 510, 5), ...bananaLine(2380, 485, 5),
      ...bananaLine(3290, 500, 5), ...bananaLine(4100, 465, 6)
    ],
    checkpoints: [{ x: 1650, y: 657 }, { x: 3300, y: 657 }]
  },
  {
    id: "2-2",
    title: "Сырная крепость",
    intro: "Барон Мышильдо ждёт в крепости. Пора вернуть Золотой банан домой.",
    palette: "fortress",
    worldWidth: 5700,
    spawn: { x: 110, y: 690 },
    goal: { x: 5500, y: 682 },
    platforms: [
      ...ground([[0, 780], [930, 700], [1780, 760], [2700, 650], [3520, 700], [4380, 1320]]),
      ledge(310, 630, 190, "stone"),
      ledge(1020, 610, 190, "stone"),
      ledge(1320, 505, 190, "stone"),
      ledge(1880, 620, 210, "stone"),
      ledge(2220, 510, 190, "stone"),
      ledge(2780, 590, 210, "stone"),
      ledge(3090, 480, 190, "stone"),
      ledge(3590, 625, 210, "stone"),
      ledge(3950, 510, 200, "stone"),
      ledge(4480, 620, 200, "stone")
    ],
    hazards: [
      { x: 780, y: 772, width: 150 }, { x: 1630, y: 772, width: 150 },
      { x: 2540, y: 772, width: 160 }, { x: 3350, y: 772, width: 170 },
      { x: 4220, y: 772, width: 160 }
    ],
    enemies: [
      mouse(380, 584, "armored"), mouse(1080, 564, "runner"),
      mouse(1390, 459, "jumper"), mouse(1950, 574, "armored"),
      mouse(2280, 464, "runner"), mouse(2840, 544, "armored"),
      mouse(3160, 434, "jumper"), mouse(3660, 579, "armored"),
      mouse(4020, 464, "runner"), mouse(4550, 574, "armored")
    ],
    boss: { x: 5000, y: 690, type: "baron", health: 8 },
    bananas: [
      ...bananaLine(130, 690, 5), ...bananaLine(980, 555, 5),
      ...bananaLine(1810, 565, 5), ...bananaLine(2740, 535, 5),
      ...bananaLine(3520, 570, 6), ...bananaLine(4400, 565, 5)
    ],
    checkpoints: [{ x: 1830, y: 712 }, { x: 3560, y: 712 }, { x: 4450, y: 712 }]
  }
];

export const CAT_PROFILES = [
  {
    name: "Кот Бородыч",
    shortName: "Бородыч",
    image: "assets/face-boroda.webp",
    fur: "#c87936",
    furDark: "#8e4c26",
    scarf: "#f5c84b",
    speed: 265,
    jump: 690,
    power: 2
  },
  {
    name: "Кот Рыжик",
    shortName: "Рыжик",
    image: "assets/face-ryzhik.webp",
    fur: "#6e8daf",
    furDark: "#455e7a",
    scarf: "#ff725f",
    speed: 300,
    jump: 735,
    power: 1
  }
];

export function validateLevels(levels = LEVELS) {
  const errors = [];
  levels.forEach((level, index) => {
    const prefix = `Уровень ${index + 1}`;
    if (!level.id || !level.title) errors.push(`${prefix}: нет идентификатора или названия`);
    if (!Number.isFinite(level.worldWidth) || level.worldWidth < 1000) errors.push(`${prefix}: неверная ширина мира`);
    if (!level.spawn || level.spawn.x < 0 || level.spawn.x >= level.worldWidth) errors.push(`${prefix}: неверная точка старта`);
    if (!level.goal || level.goal.x <= level.spawn.x || level.goal.x >= level.worldWidth) errors.push(`${prefix}: неверная цель`);
    if (!Array.isArray(level.platforms) || !level.platforms.length) errors.push(`${prefix}: нет платформ`);
    level.platforms?.forEach((platform, platformIndex) => {
      if (![platform.x, platform.y, platform.width, platform.height].every(Number.isFinite)) {
        errors.push(`${prefix}: платформа ${platformIndex + 1} содержит неверные координаты`);
      }
    });
  });
  return errors;
}
