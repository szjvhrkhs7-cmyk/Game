import fs from "node:fs";

const SOURCE = "/tmp/ne_admin1_10m.geojson";
const OUTPUT = new URL("../src/regions.js", import.meta.url);
const WIDTH = 1400;
const HEIGHT = 850;
const BOUNDS = { west: -14, east: 56, south: 17, north: 72 };

const targets = {
  GBR: 10, IRL: 4, FRA: 12, DEU: 10, ESP: 9, PRT: 4, ITA: 11, POL: 7,
  NOR: 6, SWE: 6, DNK: 3, FIN: 5, NLD: 3, BEL: 3, LUX: 1, CHE: 3,
  AUT: 4, CZE: 4, SVK: 3, HUN: 5, ROU: 6, BGR: 4, GRC: 5, ALB: 2,
  MKD: 2, SRB: 4, BIH: 3, HRV: 4, SVN: 2, MNE: 2, TUR: 9, UKR: 7,
  BLR: 4, LTU: 3, LVA: 3, EST: 3, MDA: 2, RUS: 8, MAR: 4, DZA: 5,
  TUN: 3, LBY: 4, EGY: 5, ISR: 2, LBN: 2, SYR: 3, JOR: 2, IRQ: 3,
  ARM: 2, GEO: 3, AZE: 3, CYP: 2,
};

const capitals = {
  england: [-0.12, 51.5], scotland: [-3.19, 55.95], france: [2.35, 48.86],
  hre: [8.68, 50.11], castile: [-4.03, 39.86], leon: [-5.57, 42.6],
  aragon: [-0.89, 41.65], denmark: [12.57, 55.68], poland: [19.94, 50.06],
  byzantium: [28.98, 41.01], venice: [12.32, 45.44], sicily: [13.36, 38.12],
  hungary: [19.04, 47.5], papacy: [12.5, 41.9],
};

const countryNames = {
  GBR: "Британия", IRL: "Ирландия", FRA: "Франция", DEU: "Германия", ESP: "Иберия",
  PRT: "Португалия", ITA: "Италия", POL: "Польша", NOR: "Норвегия", SWE: "Швеция",
  DNK: "Дания", FIN: "Финляндия", NLD: "Нидерланды", BEL: "Фландрия", CHE: "Швейцария",
  AUT: "Австрия", CZE: "Богемия", SVK: "Словакия", HUN: "Венгрия", ROU: "Валахия",
  BGR: "Болгария", GRC: "Греция", ALB: "Албания", MKD: "Македония", SRB: "Сербия",
  BIH: "Босния", HRV: "Хорватия", SVN: "Крайна", MNE: "Зета", TUR: "Анатолия",
  UKR: "Русь", BLR: "Русь", LTU: "Литва", LVA: "Ливония", EST: "Эстония",
  MDA: "Молдавия", RUS: "Русь", MAR: "Магриб", DZA: "Магриб", TUN: "Ифрикия",
  LBY: "Ливия", EGY: "Египет", ISR: "Палестина", LBN: "Левант", SYR: "Сирия",
  JOR: "Трансиордания", IRQ: "Месопотамия", ARM: "Армения", GEO: "Грузия",
  AZE: "Ширван", CYP: "Кипр", LUX: "Люксембург",
};

const slugify = (value) => value.normalize("NFKD").replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "").toLowerCase();
const project = ([lon, lat]) => [
  ((lon - BOUNDS.west) / (BOUNDS.east - BOUNDS.west)) * WIDTH,
  ((BOUNDS.north - lat) / (BOUNDS.north - BOUNDS.south)) * HEIGHT,
];
const squaredDistance = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;

function coordinatesOf(geometry) {
  if (geometry.type === "Polygon") return geometry.coordinates.flat(1);
  if (geometry.type === "MultiPolygon") return geometry.coordinates.flat(2);
  return [];
}

function centerOf(feature) {
  const propertyCenter = [Number(feature.properties.longitude), Number(feature.properties.latitude)];
  if (propertyCenter.every(Number.isFinite)) return propertyCenter;
  const points = coordinatesOf(feature.geometry);
  const xs = points.map((point) => point[0]);
  const ys = points.map((point) => point[1]);
  return [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2];
}

function perpendicularDistance(point, start, end) {
  const length = squaredDistance(start, end);
  if (!length) return Math.sqrt(squaredDistance(point, start));
  const t = Math.max(0, Math.min(1, ((point[0] - start[0]) * (end[0] - start[0]) + (point[1] - start[1]) * (end[1] - start[1])) / length));
  return Math.sqrt(squaredDistance(point, [start[0] + t * (end[0] - start[0]), start[1] + t * (end[1] - start[1])]));
}

function simplify(points, tolerance = 0.055) {
  if (points.length <= 4) return points;
  let maximum = 0;
  let index = 0;
  for (let i = 1; i < points.length - 1; i += 1) {
    const distance = perpendicularDistance(points[i], points[0], points.at(-1));
    if (distance > maximum) { maximum = distance; index = i; }
  }
  if (maximum <= tolerance) return [points[0], points.at(-1)];
  return [...simplify(points.slice(0, index + 1), tolerance).slice(0, -1), ...simplify(points.slice(index), tolerance)];
}

function geometryPath(geometry) {
  const polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  return polygons.flatMap((polygon) => polygon.map((ring) => {
    const points = simplify(ring).map(project);
    if (points.length < 3) return "";
    return `M${points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join("L")}Z`;
  })).filter(Boolean).join("");
}

function clusterFeatures(features, count) {
  if (features.length <= count) return features.map((feature) => [feature]);
  const points = features.map(centerOf);
  const centers = [points.reduce((best, point) => point[0] < best[0] ? point : best, points[0])];
  while (centers.length < count) {
    const next = points.reduce((best, point) => {
      const distance = Math.min(...centers.map((center) => squaredDistance(point, center)));
      return distance > best.distance ? { point, distance } : best;
    }, { point: points[0], distance: -1 }).point;
    centers.push(next);
  }
  let assignments = [];
  for (let iteration = 0; iteration < 18; iteration += 1) {
    assignments = points.map((point) => centers.reduce((best, center, index) => {
      const distance = squaredDistance(point, center);
      return distance < best.distance ? { index, distance } : best;
    }, { index: 0, distance: Infinity }).index);
    centers.forEach((center, index) => {
      const members = points.filter((_, pointIndex) => assignments[pointIndex] === index);
      if (members.length) centers[index] = [members.reduce((sum, point) => sum + point[0], 0) / members.length, members.reduce((sum, point) => sum + point[1], 0) / members.length];
    });
  }
  return centers.map((_, index) => features.filter((__, featureIndex) => assignments[featureIndex] === index)).filter((group) => group.length);
}

function chooseOwner(country, [lon, lat]) {
  if (country === "GBR") return lat > 54.8 ? "scotland" : "england";
  if (country === "FRA") return "france";
  if (["DEU", "AUT", "CZE", "CHE", "NLD", "BEL", "LUX"].includes(country)) return "hre";
  if (country === "ESP") {
    if (lon > -0.8) return "aragon";
    if (lon < -5.2 && lat > 40.5) return "leon";
    return "castile";
  }
  if (country === "DNK" || country === "NOR") return "denmark";
  if (country === "POL") return "poland";
  if (["HUN", "SVK", "HRV"].includes(country)) return "hungary";
  if (country === "ITA") {
    if (lat < 41.1) return "sicily";
    if (lat < 43.4) return "papacy";
    if (lon > 11.2 && lat > 44.2) return "venice";
    return "hre";
  }
  if (["GRC", "BGR", "MKD", "SRB", "ALB", "MNE"].includes(country)) return "byzantium";
  if (country === "TUR") return lon < 32 ? "byzantium" : "rebels";
  return "rebels";
}

function terrainFor(country, [lon, lat]) {
  if (["CHE", "AUT", "GEO", "ARM", "ALB", "MNE", "BIH", "MKD"].includes(country)) return "hills";
  if (["NOR", "SWE", "FIN", "RUS", "BLR", "LTU", "LVA", "EST"].includes(country)) return "forest";
  if (["MAR", "DZA", "TUN", "LBY", "EGY", "ISR", "JOR", "IRQ", "SYR"].includes(country) && lat < 34) return "hills";
  if ((country === "ESP" && lat > 40) || (country === "ITA" && lat > 44) || (country === "TUR" && lon > 30)) return "hills";
  return "plains";
}

const source = JSON.parse(fs.readFileSync(SOURCE, "utf8"));
const selected = source.features.filter((feature) => {
  const country = feature.properties.adm0_a3;
  if (!targets[country]) return false;
  const [lon, lat] = centerOf(feature);
  return lon >= BOUNDS.west - 2 && lon <= BOUNDS.east + 2 && lat >= BOUNDS.south - 2 && lat <= BOUNDS.north + 2;
});

const regions = [];
for (const [country, target] of Object.entries(targets)) {
  const features = selected.filter((feature) => feature.properties.adm0_a3 === country);
  for (const [groupIndex, group] of clusterFeatures(features, target).entries()) {
    const rawCenters = group.map(centerOf);
    const geoCenter = [rawCenters.reduce((sum, point) => sum + point[0], 0) / rawCenters.length, rawCenters.reduce((sum, point) => sum + point[1], 0) / rawCenters.length];
    const representative = group.reduce((best, feature) => {
      const distance = squaredDistance(centerOf(feature), geoCenter);
      return distance < best.distance ? { feature, distance } : best;
    }, { feature: group[0], distance: Infinity }).feature;
    const baseName = representative.properties.name_ru || representative.properties.name_en || countryNames[country];
    const name = baseName.length > 22 ? countryNames[country] : baseName;
    const id = `${country.toLowerCase()}-${slugify(representative.properties.name_en || baseName) || groupIndex + 1}-${groupIndex + 1}`;
    regions.push({
      id, name, country, owner: chooseOwner(country, geoCenter), geoCenter,
      center: project(geoCenter).map((value) => Number(value.toFixed(1))),
      path: group.map((feature) => geometryPath(feature.geometry)).join(""),
      terrain: terrainFor(country, geoCenter),
      income: 64 + ((regions.length * 37) % 67), food: 20 + ((regions.length * 17) % 24),
      population: 1 + (regions.length % 4), capital: false,
      coastal: ["GBR", "IRL", "PRT", "ESP", "FRA", "ITA", "NOR", "SWE", "DNK", "FIN", "NLD", "BEL", "HRV", "GRC", "ALB", "MNE", "TUR", "UKR", "ROU", "BGR", "MAR", "DZA", "TUN", "LBY", "EGY", "ISR", "LBN", "SYR", "GEO", "CYP"].includes(country),
      army: { levy: 2, archers: 0, knights: 0 }, buildings: {}, neighbors: [],
    });
  }
}

for (const [faction, coordinate] of Object.entries(capitals)) {
  const candidates = regions.filter((region) => region.owner === faction);
  if (!candidates.length) continue;
  const capital = candidates.reduce((best, region) => squaredDistance(region.geoCenter, coordinate) < squaredDistance(best.geoCenter, coordinate) ? region : best, candidates[0]);
  capital.capital = true;
  capital.army = { levy: 4, archers: 2, knights: 1 };
  capital.buildings = { market: 1, castle: 1, barracks: 1 };
  capital.income += 55;
}

for (const region of regions) {
  const distances = regions.filter((other) => other !== region).map((other) => ({ other, distance: Math.sqrt(squaredDistance(region.center, other.center)) })).sort((left, right) => left.distance - right.distance);
  for (const { other, distance } of distances) {
    if (region.neighbors.length >= 3 && distance > 78) break;
    if (distance > 145 && region.neighbors.length >= 2) break;
    region.neighbors.push(other.id);
    if (region.neighbors.length >= 5) break;
  }
}
for (const region of regions) for (const neighborId of [...region.neighbors]) {
  const neighbor = regions.find((item) => item.id === neighborId);
  if (neighbor && !neighbor.neighbors.includes(region.id)) neighbor.neighbors.push(region.id);
}

const output = regions.map(({ geoCenter, country, ...region }) => region);
const capitalProvinces = Object.fromEntries(regions.filter((region) => region.capital).map((region) => [region.owner, region.id]));
const seas = [
  { name: "АТЛАНТИЧЕСКИЙ ОКЕАН", x: 85, y: 470 }, { name: "СЕВЕРНОЕ МОРЕ", x: 435, y: 250 },
  { name: "БАЛТИЙСКОЕ МОРЕ", x: 670, y: 225 }, { name: "СРЕДИЗЕМНОЕ МОРЕ", x: 570, y: 690 },
  { name: "ЧЁРНОЕ МОРЕ", x: 965, y: 525 }, { name: "КАСПИЙСКОЕ МОРЕ", x: 1300, y: 470 },
];
const contents = `// Generated from Natural Earth public-domain admin-1 data.\n// Run: node scripts/generate-regions.mjs\nexport const MAP_VIEWBOX = Object.freeze({ width: ${WIDTH}, height: ${HEIGHT} });\nexport const CAPITAL_PROVINCES = Object.freeze(${JSON.stringify(capitalProvinces, null, 2)});\nexport const REGIONS = Object.freeze(${JSON.stringify(output, null, 2)});\nexport const MAP_SEAS = Object.freeze(${JSON.stringify(seas, null, 2)});\n`;
fs.writeFileSync(OUTPUT, contents);
console.log(`Generated ${output.length} campaign regions in ${OUTPUT.pathname}`);
