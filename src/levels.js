const ground = (segments, y = 790) => segments.map(([x, width]) => ({ x, y, width, height: 170, kind: "ground" }));
const ledge = (x, y, width, kind = "ledge") => ({ x, y, width, height: 24, kind });
const mouse = (x, y = 744, type = "walker") => ({ x, y, type });
const bananaLine = (x, y, count, gap = 54) => Array.from({ length: count }, (_, index) => ({ x: x + index * gap, y }));
const bananaArc = (x, y, count, gap = 52, lift = 84) => Array.from({ length: count }, (_, index) => ({
  x: x + index * gap,
  y: y - Math.sin((index / Math.max(1, count - 1)) * Math.PI) * lift
}));

export const LEVELS = [
  {
    id: "1-1",
    title: "Сумеречная кухня",
    intro: "Мыши погасили лампы и скрылись среди высоких шкафов. Свет банана укажет путь.",
    palette: "kitchen",
    worldWidth: 4200,
    spawn: { x: 120, y: 690 },
    goal: { x: 4000, y: 682 },
    platforms: [
      ...ground([[0, 900], [1030, 820], [1970, 1050], [3150, 1050]]),
      ledge(380, 660, 250, "table"),
      ledge(1110, 675, 220, "shelf"),
      ledge(1390, 600, 250, "shelf"),
      ledge(1665, 530, 150, "shelf"),
      ledge(2070, 670, 250, "table"),
      ledge(2390, 600, 220, "shelf"),
      ledge(2670, 525, 190, "shelf"),
      ledge(3230, 675, 250, "table"),
      ledge(3540, 605, 240, "shelf")
    ],
    hazards: [{ x: 1780, y: 772, width: 62 }, { x: 2940, y: 772, width: 62 }],
    enemies: [
      mouse(650), mouse(1240, 614, "runner"), mouse(1620, 524),
      mouse(2220, 604, "runner"), mouse(2700, 744, "jumper"),
      mouse(3410, 619), mouse(3720, 524, "runner")
    ],
    bananas: [
      ...bananaLine(210, 700, 4), ...bananaArc(760, 690, 6, 52, 92),
      ...bananaArc(1320, 565, 6, 50, 74), ...bananaArc(1800, 690, 6, 54, 96),
      ...bananaArc(2400, 560, 6, 50, 78), ...bananaArc(2890, 690, 6, 54, 92),
      ...bananaArc(3520, 565, 6, 50, 72)
    ],
    checkpoints: [{ x: 2040, y: 712 }]
  },
  {
    id: "1-2",
    title: "Шепчущая кладовая",
    intro: "За банками варенья дышит старый тоннель. В тумане слышны только лапки и далёкий звон.",
    palette: "pantry",
    worldWidth: 4700,
    spawn: { x: 100, y: 690 },
    goal: { x: 4500, y: 682 },
    platforms: [
      ...ground([[0, 720], [850, 650], [1620, 960], [2720, 650], [3500, 1200]]),
      ledge(220, 635, 240, "crate"),
      ledge(900, 680, 210, "crate"),
      ledge(1160, 605, 230, "crate"),
      ledge(1430, 530, 145, "crate"),
      ledge(1700, 665, 250, "crate"),
      ledge(2020, 585, 230, "crate"),
      ledge(2310, 520, 190, "crate"),
      ledge(2780, 640, 240, "crate"),
      ledge(3070, 560, 190, "crate"),
      ledge(3580, 665, 260, "crate"),
      ledge(3900, 585, 240, "crate")
    ],
    hazards: [
      { x: 750, y: 772, width: 80 }, { x: 1520, y: 772, width: 80 },
      { x: 2610, y: 772, width: 90 }, { x: 3400, y: 772, width: 80 }
    ],
    enemies: [
      mouse(470, 554, "runner"), mouse(980, 624), mouse(1280, 509, "jumper"),
      mouse(1810, 594, "armored"), mouse(2220, 489, "runner"),
      mouse(2870, 544, "jumper"), mouse(3150, 444, "armored"),
      mouse(3710, 594, "runner"), mouse(4140, 499, "armored")
    ],
    bananas: [
      ...bananaArc(110, 700, 6, 52, 80), ...bananaArc(820, 660, 6, 52, 92),
      ...bananaArc(1500, 690, 6, 54, 100), ...bananaArc(2180, 570, 6, 50, 76),
      ...bananaArc(2680, 680, 7, 52, 105), ...bananaArc(3500, 690, 6, 54, 96),
      ...bananaArc(4010, 550, 5, 50, 72)
    ],
    checkpoints: [{ x: 1750, y: 712 }, { x: 3540, y: 712 }]
  },
  {
    id: "2-1",
    title: "Лунные крыши",
    intro: "Над трубами плывёт белый туман. Второй прыжок поможет пересечь самые глубокие пролёты.",
    palette: "rooftop",
    worldWidth: 5200,
    spawn: { x: 100, y: 650 },
    goal: { x: 5000, y: 612 },
    platforms: [
      ...ground([[0, 610], [760, 700], [1600, 610], [2360, 720], [3250, 650], [4070, 1130]], 735),
      ledge(210, 610, 220, "roof"),
      ledge(800, 610, 230, "roof"),
      ledge(1080, 535, 210, "roof"),
      ledge(1320, 465, 150, "roof"),
      ledge(1630, 600, 230, "roof"),
      ledge(2390, 590, 240, "roof"),
      ledge(2680, 510, 210, "roof"),
      ledge(2940, 435, 160, "roof"),
      ledge(3290, 605, 240, "roof"),
      ledge(4110, 575, 250, "roof"),
      ledge(4420, 500, 220, "roof"),
      ledge(4690, 425, 150, "roof")
    ],
    hazards: [
      { x: 640, y: 717, width: 90 }, { x: 1490, y: 717, width: 90 },
      { x: 2240, y: 717, width: 90 }, { x: 3120, y: 717, width: 100 },
      { x: 3940, y: 717, width: 100 }
    ],
    enemies: [
      mouse(310, 539, "jumper"), mouse(880, 519, "runner"),
      mouse(1210, 424, "armored"), mouse(1730, 519, "runner"),
      mouse(2500, 494, "armored"), mouse(2830, 399, "jumper"),
      mouse(3400, 509, "runner"), mouse(4210, 474, "armored"),
      mouse(4590, 374, "runner")
    ],
    bananas: [
      ...bananaArc(70, 650, 6, 52, 84), ...bananaArc(700, 620, 7, 52, 112),
      ...bananaArc(1440, 610, 7, 52, 110), ...bananaArc(2240, 610, 7, 52, 118),
      ...bananaArc(3110, 620, 7, 52, 120), ...bananaArc(3930, 600, 7, 52, 115),
      ...bananaArc(4550, 485, 5, 48, 68)
    ],
    checkpoints: [{ x: 1650, y: 657 }, { x: 3300, y: 657 }]
  },
  {
    id: "2-2",
    title: "Сырная цитадель",
    intro: "За чёрными воротами ждёт Барон Мышильдо. Древний свет Золотого банана уже близко.",
    palette: "fortress",
    worldWidth: 5700,
    spawn: { x: 110, y: 690 },
    goal: { x: 5500, y: 682 },
    platforms: [
      ...ground([[0, 780], [930, 700], [1780, 760], [2700, 650], [3520, 700], [4380, 1320]]),
      ledge(280, 665, 230, "stone"),
      ledge(990, 655, 230, "stone"),
      ledge(1270, 580, 210, "stone"),
      ledge(1510, 505, 145, "stone"),
      ledge(1840, 650, 250, "stone"),
      ledge(2160, 570, 220, "stone"),
      ledge(2730, 635, 250, "stone"),
      ledge(3040, 555, 210, "stone"),
      ledge(3300, 485, 150, "stone"),
      ledge(3550, 655, 250, "stone"),
      ledge(3890, 575, 230, "stone"),
      ledge(4430, 650, 250, "stone")
    ],
    hazards: [
      { x: 810, y: 772, width: 90 }, { x: 1660, y: 772, width: 90 },
      { x: 2570, y: 772, width: 100 }, { x: 3390, y: 772, width: 100 },
      { x: 4250, y: 772, width: 100 }
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
      ...bananaArc(110, 700, 6, 52, 82), ...bananaArc(860, 680, 7, 52, 110),
      ...bananaArc(1660, 690, 7, 52, 115), ...bananaArc(2500, 670, 7, 52, 108),
      ...bananaArc(3340, 690, 7, 52, 118), ...bananaArc(4180, 675, 7, 52, 106),
      ...bananaLine(4920, 650, 5, 50)
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
