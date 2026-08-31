import {
  BUILDING_TYPES,
  FACTIONS,
  PLAYABLE_FACTIONS,
  PROVINCES,
  SEAS,
  TERRAIN,
  UNIT_TYPES,
} from "./data.js";
import {
  SEASONS,
  TACTICS,
  armySoldiers,
  armyStrength,
  buildingCost,
  campaignProgress,
  canMarch,
  constructBuilding,
  createCampaign,
  declareWar,
  endTurn,
  factionEconomy,
  getDiplomacy,
  getOwnedProvinces,
  hydrateCampaign,
  moveArmy,
  offerAlliance,
  offerPeace,
  offerTrade,
  provinceEconomy,
  recruitUnit,
  resolveBattle,
  sendGift,
  demandVassalage,
} from "./engine.js";
import { MAP_VIEWBOX } from "./regions.js";
import {
  BATTLE_ORDERS,
  BATTLE_FORMATIONS,
  SETTLEMENT_TIERS,
  TAX_LEVELS,
  armiesAt,
  assaultSiege,
  buildingSlots,
  cancelArmyRoute,
  liftSiege,
  mergeArmies,
  moveFieldArmy,
  occupiedBuildingSlots,
  planArmyRoute,
  raiseFieldArmy,
  resolveFieldBattle,
  setTaxLevel,
  soldiersIn,
  strengthOf,
  transferUnit,
} from "./systems.js";

const SAVE_KEY = "crown-and-conquest-campaign-v4";
const MAP_VIEW_KEY = "crown-and-conquest-map-view-v1";
const SVG_NS = "http://www.w3.org/2000/svg";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const formatNumber = (value) => new Intl.NumberFormat("ru-RU").format(Math.round(value));
const statusLabels = { war: "Война", truce: "Перемирие", neutral: "Нейтралитет", trade: "Торговля", allied: "Союз", vassal: "Вассалитет" };
const logIcons = { crown: "♛", build: "♜", army: "♟", march: "➟", victory: "⚔", defeat: "†", war: "⚑", diplomacy: "⚖", world: "◆", event: "☼" };

let campaign = null;
let selectedFaction = null;
let marchOrigin = null;
let pendingBattle = null;
let armyMoveMode = false;
let selectedFormation = "line";
let soundEnabled = true;
let toastTimer = null;
const MAP_RATIO = MAP_VIEWBOX.height / MAP_VIEWBOX.width;
let mapView = { x: 0, y: 0, width: MAP_VIEWBOX.width, height: MAP_VIEWBOX.height };
let dragging = null;
let draggedDistance = 0;

const screens = {
  welcome: $("#welcomeScreen"),
  faction: $("#factionScreen"),
  campaign: $("#campaignScreen"),
};

function showScreen(name) {
  for (const [screenName, element] of Object.entries(screens)) element.hidden = screenName !== name;
  window.scrollTo({ top: 0, behavior: "instant" });
}

function loadSavedCampaign() {
  try {
    const stored = localStorage.getItem(SAVE_KEY);
    return stored ? hydrateCampaign(JSON.parse(stored)) : null;
  } catch {
    return null;
  }
}

function saveCampaign(showConfirmation = false) {
  if (!campaign) return;
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(campaign));
    if (showConfirmation) toast("Кампания сохранена на этом устройстве");
  } catch {
    toast("Не удалось сохранить кампанию", true);
  }
}

function updateContinueButton() {
  $("#continueButton").hidden = !loadSavedCampaign();
}

function toast(message, isError = false) {
  const element = $("#toast");
  element.textContent = message;
  element.classList.toggle("error", isError);
  element.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => element.classList.remove("visible"), 2400);
}

function playTone(kind = "click") {
  if (!soundEnabled) return;
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = kind === "battle" ? "sawtooth" : "sine";
    oscillator.frequency.value = kind === "success" ? 520 : kind === "battle" ? 125 : 260;
    gain.gain.setValueAtTime(.035, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + (kind === "battle" ? .2 : .08));
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + (kind === "battle" ? .2 : .08));
    oscillator.addEventListener("ended", () => context.close());
  } catch {
    // Sound is a progressive enhancement and may be blocked by the browser.
  }
}

function renderFactionSelection() {
  $("#factionGrid").innerHTML = PLAYABLE_FACTIONS.map((faction) => `
    <button class="faction-card${selectedFaction === faction.id ? " selected" : ""}" type="button" data-faction="${faction.id}" style="--faction-color:${faction.color};--faction-accent:${faction.accent}">
      <span class="faction-card-top">
        <span class="faction-card-emblem">${faction.emblem}</span>
        <span class="difficulty">${faction.difficulty}</span>
      </span>
      <h3>${faction.shortName}</h3>
      <p class="faction-ruler">${faction.ruler}</p>
      <p class="faction-description">${faction.description}</p>
      <span class="faction-bonus"><span>✦</span><span><strong>${faction.trait}</strong><small>${faction.bonus}</small></span></span>
    </button>
  `).join("");

  $$(".faction-card").forEach((card) => card.addEventListener("click", () => selectFaction(card.dataset.faction)));
  if (selectedFaction) renderSelectedFactionSummary();
}

function selectFaction(factionId) {
  selectedFaction = factionId;
  playTone();
  renderFactionSelection();
}

function renderSelectedFactionSummary() {
  const faction = FACTIONS[selectedFaction];
  const summary = $("#selectedFactionSummary");
  summary.hidden = false;
  $("#summaryEmblem").textContent = faction.emblem;
  $("#summaryEmblem").style.cssText = `background:${faction.color};color:${faction.accent}`;
  $("#summaryName").textContent = faction.name;
  $("#summaryRuler").textContent = faction.ruler;
}

function beginCampaign() {
  if (!selectedFaction) return;
  campaign = createCampaign(selectedFaction);
  marchOrigin = null;
  resetMapView();
  saveCampaign();
  showScreen("campaign");
  renderCampaign();
  playTone("success");
  setTimeout(() => $("#helpDialog").showModal(), 350);
}

function continueCampaign() {
  const saved = loadSavedCampaign();
  if (!saved) {
    toast("Сохранение не найдено", true);
    updateContinueButton();
    return;
  }
  campaign = saved;
  selectedFaction = campaign.playerFaction;
  marchOrigin = null;
  restoreMapView();
  showScreen("campaign");
  renderCampaign();
}

function renderCampaign() {
  if (!campaign) return;
  renderHeader();
  renderRealmPanel();
  renderMap();
  renderProvincePanel();
  if (campaign.gameOver && !$("#endDialog").open) showGameOver();
}

function renderHeader() {
  const faction = FACTIONS[campaign.playerFaction];
  const resources = campaign.factions[campaign.playerFaction];
  const economy = factionEconomy(campaign, campaign.playerFaction);
  $("#realmEmblem").textContent = faction.emblem;
  $("#realmEmblem").style.cssText = `background:${faction.color};color:${faction.accent}`;
  $("#realmName").textContent = faction.shortName;
  $("#goldValue").textContent = formatNumber(resources.gold);
  $("#foodValue").textContent = formatNumber(resources.food);
  $("#authorityValue").textContent = formatNumber(resources.authority);
  $("#goldDelta").textContent = `${economy.netGold >= 0 ? "+" : ""}${formatNumber(economy.netGold)}`;
  $("#goldDelta").style.color = economy.netGold >= 0 ? "#7ea274" : "#c96b65";
  $("#foodDelta").textContent = `+${formatNumber(Math.max(0, economy.food - getOwnedProvinces(campaign, campaign.playerFaction).length * 12))}`;
}

function renderRealmPanel() {
  const progress = campaignProgress(campaign);
  $("#seasonValue").textContent = SEASONS[campaign.seasonIndex];
  $("#yearValue").textContent = campaign.year;
  $("#turnValue").textContent = campaign.turn;
  $("#progressPercent").textContent = `${Math.round(progress.percent)}%`;
  $("#progressBar").style.width = `${progress.percent}%`;
  $("#ownedProvinceCount").textContent = progress.provinces;
  $("#ownedCapitalCount").textContent = progress.capitals;
  $("#provinceGoal").textContent = `${progress.provincesTarget} провинций`;
  $("#capitalGoal").textContent = `${progress.capitalsTarget} столиц`;
  const wars = Object.keys(FACTIONS).filter((id) => id !== campaign.playerFaction && getDiplomacy(campaign, campaign.playerFaction, id).status === "war").length;
  $("#warCount").textContent = `${wars} ${wars === 1 ? "активная война" : "активных войн"}`;
  $("#chroniclePreview").innerHTML = campaign.eventLog.slice(0, 3).map((event) => `
    <div class="chronicle-item"><b>Ход ${event.turn}.</b> ${event.text}</div>
  `).join("");
}

function svgElement(tag, attributes = {}) {
  const element = document.createElementNS(SVG_NS, tag);
  for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, String(value));
  return element;
}

function renderMap() {
  const provinceLayer = $("#provinceLayer");
  const labelLayer = $("#labelLayer");
  const armyLayer = $("#armyLayer");
  const routeLayer = $("#routeLayer");
  const infrastructureLayer = $("#infrastructureLayer");
  const seaLayer = $("#seaLayer");
  provinceLayer.replaceChildren();
  labelLayer.replaceChildren();
  armyLayer.replaceChildren();
  routeLayer.replaceChildren();
  infrastructureLayer.replaceChildren();
  seaLayer.replaceChildren();

  for (const sea of SEAS) {
    const label = svgElement("text", { x: sea.x, y: sea.y, class: "sea-label" });
    label.textContent = sea.name;
    seaLayer.append(label);
  }

  const selectedFieldArmy = campaign.armies?.[campaign.selectedArmy];
  const reachable = armyMoveMode && selectedFieldArmy
    ? new Set(campaign.provinces[selectedFieldArmy.regionId].neighbors)
    : marchOrigin ? new Set(campaign.provinces[marchOrigin].neighbors) : new Set();
  for (const [regionIndex, template] of PROVINCES.entries()) {
    const item = campaign.provinces[template.id];
    const faction = FACTIONS[item.owner];
    const polygon = svgElement(item.path ? "path" : "polygon", {
      ...(item.path ? { d: item.path } : { points: item.points }),
      class: [
        "province",
        campaign.selectedProvince === item.id ? "selected" : "",
        reachable.has(item.id) ? "reachable" : "",
        reachable.has(item.id) && item.owner !== campaign.playerFaction ? "hostile-target" : "",
      ].filter(Boolean).join(" "),
      fill: faction.color,
      tabindex: "0",
      role: "button",
      "aria-label": `${item.name}, ${faction.shortName}, ${armySoldiers(item.army)} воинов`,
      "data-province": item.id,
    });
    const title = svgElement("title");
    title.textContent = `${item.name} • ${faction.shortName} • ${armySoldiers(item.army)} воинов`;
    polygon.append(title);
    polygon.addEventListener("click", (event) => {
      if (draggedDistance > 6) return;
      event.stopPropagation();
      handleProvinceClick(item.id);
    });
    polygon.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleProvinceClick(item.id);
      }
    });
    provinceLayer.append(polygon);

    const [centerX, centerY] = item.center;
    if (item.capital) {
      const capital = svgElement("text", { x: centerX, y: centerY - 9, class: "capital-label" });
      capital.textContent = "◆";
      labelLayer.append(capital);
    }
    const labelClass = item.capital ? "major" : regionIndex % 4 === 0 ? "medium" : "minor";
    const label = svgElement("text", { x: centerX, y: centerY + 2, class: `province-label ${labelClass}` });
    label.textContent = item.name.toUpperCase();
    labelLayer.append(label);

    if (item.coastal && (item.buildings.port ?? 0) > 0) {
      const port = svgElement("text", { x: centerX + 9, y: centerY - 7, class: "map-detail port-marker" });
      port.textContent = "⚓";
      labelLayer.append(port);
    }

    if (item.siege) {
      const siege = svgElement("text", { x: centerX - 13, y: centerY + 17, class: "siege-marker" });
      siege.textContent = "⊞";
      labelLayer.append(siege);
    }
  }

  const renderedRoads = new Set();
  for (const item of Object.values(campaign.provinces)) {
    if ((item.buildings.road ?? 0) < 1) continue;
    for (const neighborId of item.neighbors) {
      const neighbor = campaign.provinces[neighborId];
      if (!neighbor || (neighbor.buildings.road ?? 0) < 1 || neighbor.owner !== item.owner) continue;
      const key = [item.id, neighborId].sort().join(":");
      if (renderedRoads.has(key)) continue;
      renderedRoads.add(key);
      infrastructureLayer.append(svgElement("line", {
        x1: item.center[0], y1: item.center[1], x2: neighbor.center[0], y2: neighbor.center[1], class: "map-detail road-line",
      }));
    }
  }

  if (selectedFieldArmy?.route?.length) {
    const routePoints = [selectedFieldArmy.regionId, ...selectedFieldArmy.route]
      .map((id) => campaign.provinces[id]?.center)
      .filter(Boolean)
      .map((point) => point.join(","))
      .join(" ");
    routeLayer.append(svgElement("polyline", { points: routePoints, class: "army-route" }));
  }

  const regionArmyOffsets = {};
  for (const army of Object.values(campaign.armies ?? {})) {
    const province = campaign.provinces[army.regionId];
    if (!province) continue;
    const offset = regionArmyOffsets[army.regionId] ?? 0;
    regionArmyOffsets[army.regionId] = offset + 1;
    const [centerX, centerY] = province.center;
    const markerX = centerX + 14 + offset * 15;
    const markerY = centerY + 17;
    const group = svgElement("g", {
      class: `field-army${campaign.selectedArmy === army.id ? " selected" : ""}${army.status === "sieging" ? " sieging" : ""}`,
      tabindex: "0",
      role: "button",
      "data-army": army.id,
      "aria-label": `${army.commander}, ${formatNumber(soldiersIn(army.units))} воинов`,
    });
    group.append(svgElement("circle", { cx: markerX, cy: markerY, r: 12, class: "army-marker", fill: FACTIONS[army.factionId].darkColor }));
    const icon = svgElement("text", { x: markerX, y: markerY - 1, class: "army-marker-icon" });
    icon.textContent = army.status === "sieging" ? "⊞" : "♟";
    group.append(icon);
    const amount = svgElement("text", { x: markerX, y: markerY + 8, class: "army-marker-text" });
    amount.textContent = Math.max(1, Math.round(soldiersIn(army.units) / 100));
    group.append(amount);
    group.addEventListener("click", (event) => {
      event.stopPropagation();
      campaign.selectedArmy = army.id;
      campaign.selectedProvince = army.regionId;
      armyMoveMode = false;
      renderCampaign();
      toast(`${army.commander}: армия выбрана`);
    });
    group.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") group.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    armyLayer.append(group);
  }

  $("#mapModeLabel").textContent = armyMoveMode && selectedFieldArmy
    ? `${selectedFieldArmy.commander}: выберите пункт назначения`
    : "Выберите регион или армию";
  $("#mapHint").textContent = armyMoveMode
    ? "Можно выбрать соседнюю землю для немедленного перехода или дальний регион для маршрута."
    : "Нажмите на провинцию, чтобы открыть управление";
  applyMapView();
}

function handleProvinceClick(provinceId) {
  playTone();
  if (armyMoveMode && campaign.selectedArmy) {
    const army = campaign.armies[campaign.selectedArmy];
    if (army?.regionId === provinceId) {
      armyMoveMode = false;
      renderCampaign();
      toast("Выбор маршрута отменён");
      return;
    }
    const planned = planArmyRoute(campaign, campaign.selectedArmy, provinceId);
    if (!planned.ok) {
      toast(planned.message, true);
      return;
    }
    campaign = planned.state;
    const firstStep = campaign.armies[campaign.selectedArmy].route[0];
    if (campaign.provinces[campaign.armies[campaign.selectedArmy].regionId].neighbors.includes(firstStep)) {
      handleFieldMove(campaign.selectedArmy, firstStep);
      return;
    }
    armyMoveMode = false;
    saveCampaign();
    renderCampaign();
    toast(planned.message);
    return;
  }
  if (marchOrigin) {
    if (provinceId === marchOrigin) {
      marchOrigin = null;
      renderCampaign();
      toast("Поход отменён");
      return;
    }
    if (campaign.provinces[marchOrigin].neighbors.includes(provinceId)) {
      handleMarch(marchOrigin, provinceId);
      return;
    }
    toast("Выберите соседнюю подсвеченную провинцию", true);
    return;
  }
  campaign.selectedProvince = provinceId;
  renderMap();
  renderProvincePanel();
}

function renderProvincePanel() {
  const item = campaign.provinces[campaign.selectedProvince];
  $("#emptyProvince").hidden = Boolean(item);
  $("#provinceDetails").hidden = !item;
  if (!item) return;
  const owner = FACTIONS[item.owner];
  const economy = provinceEconomy(campaign, item.id);
  const order = 100 - item.unrest;
  $("#provinceOwnerBadge").textContent = owner.shortName;
  $("#provinceOwnerBadge").style.background = owner.darkColor;
  $("#provinceName").textContent = item.name;
  $("#provinceTerrain").textContent = `${TERRAIN[item.terrain].icon} ${TERRAIN[item.terrain].name}`;
  $("#provinceCoastal").textContent = item.coastal ? "Морской берег" : "Внутренние земли";
  $("#provinceEmblem").textContent = owner.emblem;
  $("#provinceEmblem").style.cssText = `background:${owner.color};color:${owner.accent}`;
  $(".province-header").style.setProperty("--owner-glow", `${owner.color}33`);
  $("#provinceIncome").textContent = `+${formatNumber(economy.gold)}`;
  $("#provinceFood").textContent = `+${formatNumber(economy.food)}`;
  $("#provinceOrder").textContent = `${order}%`;
  $("#orderStatus").textContent = order >= 75 ? "спокойно" : order >= 45 ? "неспокойно" : "мятеж";
  $("#armySoldiers").textContent = `${formatNumber(armySoldiers(item.army))} воинов`;
  $("#armyStrength").textContent = armyStrength(item.army, item.owner).toFixed(1);
  $("#armyComposition").innerHTML = Object.values(UNIT_TYPES).map((unit) => `
    <div class="army-unit"><span>${unit.icon}</span><span><strong>${item.army[unit.id]}</strong><small>${unit.short}</small></span></div>
  `).join("");
  renderActionTab(item);
  renderRecruitTab(item);
  renderBuildTab(item);
}

function renderActionTab(item) {
  const container = $("#provinceActionContent");
  if (item.owner !== campaign.playerFaction) {
    const relation = getDiplomacy(campaign, campaign.playerFaction, item.owner);
    container.innerHTML = `
      <div class="foreign-notice">
        <strong>Владение державы «${FACTIONS[item.owner].shortName}»</strong>
        Сейчас между державами: ${statusLabels[relation.status].toLowerCase()}. Чтобы атаковать, выберите соседнюю свою провинцию с армией.
      </div>
      ${relation.status !== "war" && item.owner !== "rebels" ? `<button class="option-button" id="openDiplomacyFromProvince" type="button"><span class="option-icon">⚖</span><span><strong>Открыть дипломатию</strong><small>Договоры, дары или объявление войны</small></span><span class="option-price">›</span></button>` : ""}
    `;
    $("#openDiplomacyFromProvince")?.addEventListener("click", openDiplomacy);
    return;
  }
  const stationed = armiesAt(campaign, item.id, campaign.playerFaction);
  const selected = stationed.find((army) => army.id === campaign.selectedArmy) ?? stationed[0] ?? null;
  if (selected) campaign.selectedArmy = selected.id;
  const tax = TAX_LEVELS[item.taxLevel] ?? TAX_LEVELS.normal;
  container.innerHTML = `
    <div class="action-card">
      <div class="section-heading"><span>Полевая армия</span><b>${stationed.length} в регионе</b></div>
      ${selected ? `
        <div class="commander-card">
          <span class="commander-seal">${selected.status === "sieging" ? "⊞" : "♟"}</span>
          <span><strong>${selected.commander}</strong><small>${formatNumber(soldiersIn(selected.units))} воинов • дух ${selected.morale}% • снабжение ${selected.supply}%</small></span>
        </div>
        <div class="army-unit-transfer">
          ${Object.values(UNIT_TYPES).filter((unit) => (selected.units[unit.id] ?? 0) + (item.army[unit.id] ?? 0) > 0).map((unit) => `
            <div><span>${unit.icon} ${unit.short}</span><button type="button" data-transfer="fromArmy" data-unit="${unit.id}" ${(selected.units[unit.id] ?? 0) < 1 ? "disabled" : ""}>−</button><b>${selected.units[unit.id] ?? 0}</b><button type="button" data-transfer="toArmy" data-unit="${unit.id}" ${(item.army[unit.id] ?? 0) < 1 ? "disabled" : ""}>+</button></div>
          `).join("")}
        </div>
        ${selected.siege ? `
          <div class="siege-status"><strong>Осада: ${campaign.provinces[selected.siege.targetId].name}</strong><span>Ход ${selected.siege.turns + 1} • подготовка ${selected.siege.progress}%</span></div>
          <div class="button-row"><button id="assaultButton" class="small-action danger" type="button">Начать штурм</button><button id="liftSiegeButton" class="small-action" type="button">Снять осаду</button></div>
        ` : `
          <button id="fieldMarchButton" class="option-button" type="button" ${selected.movementPoints <= 0 ? "disabled" : ""}>
            <span class="option-icon">➟</span><span><strong>Проложить маршрут</strong><small>${selected.route.length ? `В пути: ${selected.route.length} регионов` : `${selected.movementPoints.toFixed(1)} очка движения`}</small></span><span class="option-price">Карта</span>
          </button>
          ${selected.route.length ? `<button id="cancelRouteButton" class="small-action" type="button">Отменить маршрут</button>` : ""}
        `}
      ` : `
        <p>Сформируйте самостоятельную армию из половины гарнизона. Она получит собственный маршрут, снабжение и очки движения.</p>
        <button id="raiseArmyButton" class="option-button" type="button">
          <span class="option-icon">♟</span><span><strong>Сформировать армию</strong><small>Требуется не менее четырёх отрядов</small></span><span class="option-price">Создать</span>
        </button>
      `}
      ${stationed.length > 1 && selected ? `<button id="mergeArmiesButton" class="small-action" type="button">Объединить с другой армией</button>` : ""}
    </div>
    <div class="action-card">
      <div class="section-heading"><span>Налоги и управление</span><b>${tax.name}</b></div>
      <p>Высокие налоги увеличивают доход, но постепенно снижают порядок.</p>
      <div class="tax-selector">
        ${Object.values(TAX_LEVELS).map((level) => `<button type="button" data-tax="${level.id}" class="${level.id === tax.id ? "active" : ""}">${level.name}</button>`).join("")}
      </div>
    </div>
  `;
  $("#raiseArmyButton")?.addEventListener("click", () => applyPlayerAction(raiseFieldArmy(campaign, item.id), "success"));
  $("#fieldMarchButton")?.addEventListener("click", () => {
    armyMoveMode = true;
    renderMap();
    toast("Выберите пункт назначения на карте");
  });
  $("#cancelRouteButton")?.addEventListener("click", () => applyPlayerAction(cancelArmyRoute(campaign, selected.id)));
  $("#liftSiegeButton")?.addEventListener("click", () => applyPlayerAction(liftSiege(campaign, selected.id)));
  $("#assaultButton")?.addEventListener("click", () => openBattleDialog({ ...campaign.armies[selected.id].siege, ...campaign.armies[selected.id], kind: "siege", armyId: selected.id, toId: selected.siege.targetId, attacker: selected.factionId, defender: campaign.provinces[selected.siege.targetId].owner, attackerSoldiers: soldiersIn(selected.units), defenderSoldiers: armySoldiers(campaign.provinces[selected.siege.targetId].army), terrain: TERRAIN[campaign.provinces[selected.siege.targetId].terrain] }));
  $("#mergeArmiesButton")?.addEventListener("click", () => applyPlayerAction(mergeArmies(campaign, selected.id, stationed.find((army) => army.id !== selected.id).id)));
  $$('[data-transfer]', container).forEach((button) => button.addEventListener("click", () => applyPlayerAction(transferUnit(campaign, item.id, selected.id, button.dataset.unit, button.dataset.transfer))));
  $$('[data-tax]', container).forEach((button) => button.addEventListener("click", () => applyPlayerAction(setTaxLevel(campaign, item.id, button.dataset.tax))));
}

function canStartMarch(item) {
  return !item.moved && Object.values(item.army).reduce((sum, value) => sum + value, 0) >= 2;
}

function renderRecruitTab(item) {
  const own = item.owner === campaign.playerFaction;
  const faction = FACTIONS[campaign.playerFaction];
  const queue = item.recruitmentQueue ?? [];
  $("#recruitOptions").innerHTML = `
    <div class="production-summary"><span>Очередь найма</span><strong>${queue.length}/3</strong>${queue.map((entry) => `<small>${UNIT_TYPES[entry.unitId].name}: ${entry.turnsRemaining} х.</small>`).join("")}</div>
    ${Object.values(UNIT_TYPES).map((unit) => {
    const requirementMet = !unit.requirement || item.buildings[unit.requirement] > 0;
    const price = Math.round(unit.cost * faction.recruitBonus);
    const disabled = !own || queue.length >= 3 || !requirementMet;
    const detail = !own ? "Только в своих землях" : queue.length >= 3 ? "Очередь заполнена" : requirementMet
      ? `${unit.soldiers} воинов • ${unit.turns} х. • содержание ${unit.upkeep}`
      : `Требуется: ${BUILDING_TYPES[unit.requirement].name}`;
    return `<button class="option-button" type="button" data-recruit="${unit.id}" ${disabled ? "disabled" : ""}>
      <span class="option-icon">${unit.icon}</span><span><strong>${unit.name}</strong><small class="${requirementMet ? "" : "locked-message"}">${detail}</small></span><span class="option-price"><span>● ${price}</span><span>♨ ${unit.foodCost}</span></span>
    </button>`;
  }).join("")}`;
  $$('[data-recruit]').forEach((button) => button.addEventListener("click", () => applyPlayerAction(recruitUnit(campaign, item.id, button.dataset.recruit), "success")));
}

function renderBuildTab(item) {
  const own = item.owner === campaign.playerFaction;
  const queue = item.constructionQueue ?? [];
  const slots = buildingSlots(item);
  const occupied = occupiedBuildingSlots(item);
  $("#buildOptions").innerHTML = `
    <div class="production-summary"><span>${SETTLEMENT_TIERS[item.settlement?.tier]?.name ?? "Поселение"} • ячейки ${occupied}/${slots}</span><strong>${queue.length}/2</strong>${queue.map((entry) => `<small>${BUILDING_TYPES[entry.buildingId].name}: ${entry.turnsRemaining} х.</small>`).join("")}</div>
    ${Object.values(BUILDING_TYPES).map((building) => {
    const cost = buildingCost(item, building.id);
    const level = item.buildings[building.id] ?? 0;
    const maxed = level >= 2;
    const queued = queue.some((entry) => entry.buildingId === building.id);
    const unavailable = building.coastalOnly && !item.coastal;
    const disabled = !own || maxed || queued || unavailable || queue.length >= 2 || (occupied >= slots && level === 0);
    const detail = maxed ? "Достигнут высший уровень" : queued ? "Уже строится" : unavailable ? "Требуется морской берег" : `${building.description} • ${building.turns} х.`;
    return `<button class="option-button" type="button" data-build="${building.id}" ${disabled ? "disabled" : ""}>
      <span class="option-icon">${building.icon}</span><span><strong>${building.name} ${level ? `• ур. ${level}` : ""}</strong><small>${detail}</small></span><span class="option-price">${maxed ? "Макс." : `<span>● ${cost.gold}</span>${cost.authority ? `<span>✦ ${cost.authority}</span>` : ""}`}</span>
    </button>`;
  }).join("")}`;
  $$('[data-build]').forEach((button) => button.addEventListener("click", () => applyPlayerAction(constructBuilding(campaign, item.id, button.dataset.build), "success")));
}

function applyPlayerAction(result, tone = "click") {
  if (!result.ok) {
    toast(result.message, true);
    playTone("battle");
    return;
  }
  campaign = result.state;
  saveCampaign();
  renderCampaign();
  toast(result.message);
  playTone(tone);
}

function handleFieldMove(armyId, targetId) {
  const result = moveFieldArmy(campaign, armyId, targetId);
  if (!result.ok) {
    toast(result.message, true);
    return;
  }
  armyMoveMode = false;
  if (result.battle) {
    pendingBattle = result.battle;
    openBattleDialog(result.battle);
    return;
  }
  campaign = result.state;
  campaign.selectedProvince = campaign.armies[armyId]?.regionId ?? targetId;
  saveCampaign();
  renderCampaign();
  toast(result.message);
}

function handleMarch(fromId, toId) {
  const result = moveArmy(campaign, fromId, toId);
  if (!result.ok) {
    toast(result.message, true);
    if (campaign.provinces[toId]?.owner !== campaign.playerFaction) {
      const owner = campaign.provinces[toId].owner;
      if (owner !== "rebels" && getDiplomacy(campaign, campaign.playerFaction, owner).status !== "war") openDiplomacy();
    }
    return;
  }
  if (result.battle) {
    pendingBattle = result.battle;
    openBattleDialog(result.battle);
    return;
  }
  campaign = result.state;
  campaign.selectedProvince = toId;
  marchOrigin = null;
  saveCampaign();
  renderCampaign();
  toast(result.message);
}

function openBattleDialog(battle) {
  pendingBattle = battle;
  selectedFormation = "line";
  const attacker = FACTIONS[battle.attacker];
  const defender = FACTIONS[battle.defender];
  $("#battleSubtitle").textContent = `Битва за ${campaign.provinces[battle.toId].name}. ${battle.terrain.name.toLowerCase()} и укрепления влияют на защитников.`;
  $("#battleAttackerEmblem").textContent = attacker.emblem;
  $("#battleAttackerEmblem").style.cssText = `background:${attacker.color};color:${attacker.accent}`;
  $("#battleDefenderEmblem").textContent = defender.emblem;
  $("#battleDefenderEmblem").style.cssText = `background:${defender.color};color:${defender.accent}`;
  $("#battleAttackerCount").textContent = `${formatNumber(battle.attackerSoldiers)} воинов`;
  $("#battleDefenderCount").textContent = `${formatNumber(battle.defenderSoldiers)} воинов`;
  const tactics = battle.kind === "field" || battle.kind === "siege" ? BATTLE_ORDERS : TACTICS;
  $("#formationList").hidden = !(battle.kind === "field" || battle.kind === "siege");
  $("#formationList").innerHTML = Object.values(BATTLE_FORMATIONS).map((formation) => `
    <button class="formation-button${formation.id === selectedFormation ? " active" : ""}" type="button" data-formation="${formation.id}"><span>${formation.icon}</span><strong>${formation.name}</strong><small>${formation.description}</small></button>
  `).join("");
  $$('[data-formation]').forEach((button) => button.addEventListener("click", () => {
    selectedFormation = button.dataset.formation;
    $$('[data-formation]').forEach((item) => item.classList.toggle("active", item === button));
  }));
  $("#tacticsList").innerHTML = Object.values(tactics).map((tactic) => `
    <button class="tactic-button" type="button" data-tactic="${tactic.id}"><span>${tactic.icon}</span><strong>${tactic.name}</strong><small>${tactic.description}</small></button>
  `).join("");
  $$('[data-tactic]').forEach((button) => button.addEventListener("click", () => fightBattle(button.dataset.tactic), { once: true }));
  $("#autoResolveButton").onclick = () => fightBattle(battle.kind === "field" || battle.kind === "siege" ? "defend" : "frontal");
  $("#battleDialog").showModal();
  playTone("battle");
}

function fightBattle(tacticId) {
  if (!pendingBattle) return;
  const result = pendingBattle.kind === "siege"
    ? assaultSiege(campaign, pendingBattle.armyId, tacticId, Math.random, { formationId: selectedFormation })
    : pendingBattle.kind === "field"
      ? resolveFieldBattle(campaign, pendingBattle.armyId, pendingBattle.toId, tacticId, Math.random, { formationId: selectedFormation })
      : resolveBattle(campaign, pendingBattle.fromId, pendingBattle.toId, tacticId);
  if (!result.ok) {
    toast(result.message, true);
    return;
  }
  $("#battleDialog").close();
  campaign = result.state;
  campaign.selectedProvince = pendingBattle.toId;
  campaign.selectedArmy = pendingBattle.armyId ?? campaign.selectedArmy;
  marchOrigin = null;
  pendingBattle = null;
  saveCampaign();
  renderCampaign();
  showBattleResult(result.report);
}

function showBattleResult(report) {
  const dialog = $("#resultDialog");
  dialog.classList.toggle("victory", report.attackerWon);
  dialog.classList.toggle("defeat", !report.attackerWon);
  $("#resultSeal").textContent = report.attackerWon ? "♛" : "†";
  $("#resultOverline").textContent = report.attackerWon ? "Поле осталось за вами" : "Армия отступает";
  $("#resultTitle").textContent = report.attackerWon ? `Победа у ${report.province}` : `Поражение у ${report.province}`;
  const tacticText = report.advantage > 1 ? "Тактический выбор дал преимущество." : report.advantage < 1 ? "Противник предугадал ваш манёвр." : "Тактики сторон оказались равноценны.";
  const formationText = report.formation ? ` Построение: ${BATTLE_FORMATIONS[report.formation].name.toLowerCase()}.` : "";
  $("#resultText").textContent = tacticText + formationText;
  const attackerLosses = Math.max(0, report.attackerBefore - report.attackerAfter);
  const defenderLosses = Math.max(0, report.defenderBefore - report.defenderAfter);
  $("#resultStats").innerHTML = `
    <div><small>Ваши потери</small><strong>${formatNumber(attackerLosses)}</strong></div>
    <div><small>Потери врага</small><strong>${formatNumber(defenderLosses)}</strong></div>
    <div><small>Ваш приказ</small><strong>${(BATTLE_ORDERS[report.attackerTactic] ?? TACTICS[report.attackerTactic]).icon}</strong></div>
  `;
  dialog.showModal();
  playTone(report.attackerWon ? "success" : "battle");
}

function openDiplomacy() {
  renderDiplomacy();
  $("#diplomacyDialog").showModal();
}

function renderDiplomacy() {
  const playerId = campaign.playerFaction;
  const factions = Object.values(FACTIONS).filter((faction) => faction.id !== playerId && faction.id !== "rebels" && campaign.factions[faction.id]?.alive);
  $("#diplomacyList").innerHTML = factions.map((faction) => {
    const relation = getDiplomacy(campaign, playerId, faction.id);
    return `<article class="diplomacy-row">
      <span class="diplomacy-emblem" style="background:${faction.color};color:${faction.accent}">${faction.emblem}</span>
      <span class="diplomacy-name"><strong>${faction.shortName}</strong><small>${faction.ruler} • отношение ${relation.opinion > 0 ? "+" : ""}${relation.opinion}</small></span>
      <span class="relation-status ${relation.status}">${statusLabels[relation.status]}</span>
      <span class="diplomacy-actions">
        ${relation.status !== "war" ? `<button class="small-action" type="button" data-diplomacy="gift" data-target="${faction.id}">Дар ●180</button>` : ""}
        ${["neutral", "truce"].includes(relation.status) ? `<button class="small-action" type="button" data-diplomacy="trade" data-target="${faction.id}">Торговля ✦5</button>` : ""}
        ${relation.status === "war" ? `<button class="small-action" type="button" data-diplomacy="peace" data-target="${faction.id}">Предложить мир</button>` : ""}
        ${["trade", "truce", "neutral"].includes(relation.status) ? `<button class="small-action" type="button" data-diplomacy="alliance" data-target="${faction.id}">Союз ✦12</button>` : ""}
        ${relation.status !== "war" && relation.status !== "vassal" ? `<button class="small-action" type="button" data-diplomacy="vassal" data-target="${faction.id}">Вассалитет</button>` : ""}
        ${relation.status !== "war" ? `<button class="small-action war-action" type="button" data-diplomacy="war" data-target="${faction.id}">Война ✦10</button>` : ""}
      </span>
    </article>`;
  }).join("");
  $$('[data-diplomacy]').forEach((button) => button.addEventListener("click", () => handleDiplomacyAction(button.dataset.diplomacy, button.dataset.target)));
}

function handleDiplomacyAction(action, target) {
  let result;
  if (action === "gift") result = sendGift(campaign, target);
  if (action === "trade") result = offerTrade(campaign, target);
  if (action === "peace") result = offerPeace(campaign, target);
  if (action === "alliance") result = offerAlliance(campaign, target);
  if (action === "vassal") result = demandVassalage(campaign, target);
  if (action === "war") result = declareWar(campaign, target);
  if (!result?.ok) {
    toast(result?.message ?? "Действие недоступно", true);
    return;
  }
  campaign = result.state;
  saveCampaign();
  renderCampaign();
  renderDiplomacy();
  toast(result.message);
  playTone(result.accepted === false ? "battle" : "success");
}

function openChronicle() {
  $("#chronicleList").innerHTML = campaign.eventLog.map((event) => `
    <article class="chronicle-row"><time>Ход ${event.turn}</time><i>${logIcons[event.type] ?? "◆"}</i><p>${event.text}</p></article>
  `).join("");
  $("#chronicleDialog").showModal();
}

function handleEndTurn() {
  $("#endTurnButton").disabled = true;
  playTone();
  const result = endTurn(campaign);
  $("#endTurnButton").disabled = false;
  if (!result.ok) {
    toast(result.message, true);
    return;
  }
  campaign = result.state;
  marchOrigin = null;
  saveCampaign();
  renderCampaign();
  toast(`${SEASONS[campaign.seasonIndex]}, ${campaign.year} год. Ход ${campaign.turn}`);
  if (campaign.pendingEvent) showRandomEvent(campaign.pendingEvent);
}

function showRandomEvent(event) {
  $("#eventTitle").textContent = event.title;
  $("#eventText").textContent = event.text;
  const effects = [];
  if (event.gold) effects.push(`<span class="${event.gold > 0 ? "positive" : "negative"}">● ${event.gold > 0 ? "+" : ""}${event.gold}</span>`);
  if (event.food) effects.push(`<span class="${event.food > 0 ? "positive" : "negative"}">♨ ${event.food > 0 ? "+" : ""}${event.food}</span>`);
  if (event.authority) effects.push(`<span class="${event.authority > 0 ? "positive" : "negative"}">✦ ${event.authority > 0 ? "+" : ""}${event.authority}</span>`);
  $("#eventEffect").innerHTML = effects.join("");
  $("#eventDialog").showModal();
}

function showGameOver() {
  const ending = campaign.gameOver;
  const victory = ending.result === "victory";
  const faction = FACTIONS[campaign.playerFaction];
  $("#endEmblem").textContent = victory ? "♛" : "†";
  $("#endEmblem").style.color = victory ? faction.accent : "#bd5f5a";
  $("#endOverline").textContent = victory ? "Великая кампания завершена" : "Последняя страница хроники";
  $("#endTitle").textContent = ending.title;
  $("#endText").textContent = ending.text;
  $("#endStats").innerHTML = `
    <div><small>Ходов</small><strong>${campaign.turn}</strong></div>
    <div><small>Побед</small><strong>${campaign.statistics.victories}</strong></div>
    <div><small>Завоевано</small><strong>${campaign.statistics.provincesConquered}</strong></div>
  `;
  $("#endDialog").showModal();
}

function selectTab(tabId) {
  $$("#provinceTabs button").forEach((button) => {
    const selected = button.dataset.tab === tabId;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-selected", String(selected));
  });
  $$('[data-tab-content]').forEach((content) => content.classList.toggle("active", content.dataset.tabContent === tabId));
}

function setMapView(next) {
  const width = Math.max(420, Math.min(MAP_VIEWBOX.width, next.width));
  const height = width * MAP_RATIO;
  const x = Math.max(0, Math.min(MAP_VIEWBOX.width - width, next.x));
  const y = Math.max(0, Math.min(MAP_VIEWBOX.height - height, next.y));
  mapView = { x, y, width, height };
  applyMapView();
}

function applyMapView() {
  const map = $("#campaignMap");
  map.setAttribute("viewBox", `${mapView.x} ${mapView.y} ${mapView.width} ${mapView.height}`);
  map.classList.toggle("detail-view", mapView.width < 900);
  map.classList.toggle("close-view", mapView.width < 620);
}

function saveMapView() {
  try { localStorage.setItem(MAP_VIEW_KEY, JSON.stringify(mapView)); } catch { /* Non-critical preference. */ }
}

function restoreMapView() {
  try {
    const stored = JSON.parse(localStorage.getItem(MAP_VIEW_KEY));
    if (stored && [stored.x, stored.y, stored.width].every(Number.isFinite)) {
      setMapView(stored);
      return;
    }
  } catch { /* Fall through to the complete map. */ }
  resetMapView();
}

function zoomMap(factor, anchor = null) {
  const newWidth = mapView.width * factor;
  const newHeight = newWidth * MAP_RATIO;
  const rect = $("#campaignMap").getBoundingClientRect();
  const relativeX = anchor ? Math.max(0, Math.min(1, (anchor.x - rect.left) / rect.width)) : .5;
  const relativeY = anchor ? Math.max(0, Math.min(1, (anchor.y - rect.top) / rect.height)) : .5;
  setMapView({
    width: newWidth,
    height: newHeight,
    x: mapView.x + relativeX * (mapView.width - newWidth),
    y: mapView.y + relativeY * (mapView.height - newHeight),
  });
}

function resetMapView() {
  mapView = { x: 0, y: 0, width: MAP_VIEWBOX.width, height: MAP_VIEWBOX.height };
  applyMapView();
  saveMapView();
}

function bindMapInteractions() {
  const svg = $("#campaignMap");
  const pointers = new Map();
  let pinch = null;
  let inertiaFrame = null;
  const stopInertia = () => {
    if (inertiaFrame) cancelAnimationFrame(inertiaFrame);
    inertiaFrame = null;
  };
  svg.addEventListener("wheel", (event) => {
    event.preventDefault();
    stopInertia();
    zoomMap(event.deltaY > 0 ? 1.12 : .88, { x: event.clientX, y: event.clientY });
    saveMapView();
  }, { passive: false });
  svg.addEventListener("pointerdown", (event) => {
    stopInertia();
    svg.setPointerCapture(event.pointerId);
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.size === 1) {
      dragging = { clientX: event.clientX, clientY: event.clientY, lastX: event.clientX, lastY: event.clientY, lastTime: performance.now(), velocityX: 0, velocityY: 0, view: { ...mapView } };
      pinch = null;
    } else if (pointers.size === 2) {
      const [first, second] = [...pointers.values()];
      pinch = { distance: Math.hypot(second.x - first.x, second.y - first.y), view: { ...mapView } };
      dragging = null;
    }
    draggedDistance = 0;
  });
  svg.addEventListener("pointermove", (event) => {
    if (!pointers.has(event.pointerId)) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.size === 2 && pinch) {
      const [first, second] = [...pointers.values()];
      const distance = Math.hypot(second.x - first.x, second.y - first.y);
      const center = { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 };
      const rect = svg.getBoundingClientRect();
      const relativeX = Math.max(0, Math.min(1, (center.x - rect.left) / rect.width));
      const relativeY = Math.max(0, Math.min(1, (center.y - rect.top) / rect.height));
      const width = pinch.view.width * pinch.distance / Math.max(1, distance);
      const height = width * MAP_RATIO;
      draggedDistance = Math.max(draggedDistance, Math.abs(distance - pinch.distance));
      setMapView({
        width, height,
        x: pinch.view.x + relativeX * (pinch.view.width - width),
        y: pinch.view.y + relativeY * (pinch.view.height - height),
      });
      return;
    }
    if (!dragging) return;
    const rect = svg.getBoundingClientRect();
    const dx = event.clientX - dragging.clientX;
    const dy = event.clientY - dragging.clientY;
    const now = performance.now();
    const elapsed = Math.max(1, now - dragging.lastTime);
    dragging.velocityX = (event.clientX - dragging.lastX) / elapsed;
    dragging.velocityY = (event.clientY - dragging.lastY) / elapsed;
    dragging.lastX = event.clientX;
    dragging.lastY = event.clientY;
    dragging.lastTime = now;
    draggedDistance = Math.max(draggedDistance, Math.abs(dx) + Math.abs(dy));
    setMapView({
      ...dragging.view,
      x: dragging.view.x - dx * dragging.view.width / rect.width,
      y: dragging.view.y - dy * dragging.view.height / rect.height,
    });
  });
  const endDrag = (event) => {
    pointers.delete(event.pointerId);
    if (pointers.size === 1) {
      const [remaining] = [...pointers.values()];
      dragging = { clientX: remaining.x, clientY: remaining.y, lastX: remaining.x, lastY: remaining.y, lastTime: performance.now(), velocityX: 0, velocityY: 0, view: { ...mapView } };
      pinch = null;
      return;
    }
    if (dragging && draggedDistance > 6) {
      const rect = svg.getBoundingClientRect();
      let velocityX = -dragging.velocityX * mapView.width / rect.width * 16;
      let velocityY = -dragging.velocityY * mapView.height / rect.height * 16;
      const animate = () => {
        velocityX *= .9;
        velocityY *= .9;
        if (Math.abs(velocityX) + Math.abs(velocityY) < .08) { inertiaFrame = null; saveMapView(); return; }
        setMapView({ ...mapView, x: mapView.x + velocityX, y: mapView.y + velocityY });
        inertiaFrame = requestAnimationFrame(animate);
      };
      inertiaFrame = requestAnimationFrame(animate);
    } else {
      saveMapView();
    }
    dragging = null;
    pinch = null;
    setTimeout(() => { draggedDistance = 0; }, 0);
  };
  svg.addEventListener("pointerup", endDrag);
  svg.addEventListener("pointercancel", endDrag);
}

function bindEvents() {
  $("#newCampaignButton").addEventListener("click", () => {
    selectedFaction = null;
    $("#selectedFactionSummary").hidden = true;
    renderFactionSelection();
    showScreen("faction");
  });
  $("#continueButton").addEventListener("click", continueCampaign);
  $("#backToWelcomeButton").addEventListener("click", () => showScreen("welcome"));
  $("#beginCampaignButton").addEventListener("click", beginCampaign);
  $("#endTurnButton").addEventListener("click", handleEndTurn);
  $("#saveButton").addEventListener("click", () => saveCampaign(true));
  $("#exitButton").addEventListener("click", () => {
    saveCampaign();
    marchOrigin = null;
    updateContinueButton();
    showScreen("welcome");
  });
  $("#diplomacyButton").addEventListener("click", openDiplomacy);
  $("#chronicleButton").addEventListener("click", openChronicle);
  $("#realmButton").addEventListener("click", openDiplomacy);
  $("#helpButton").addEventListener("click", () => $("#helpDialog").showModal());
  $("#soundButton").addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    $("#soundButton").classList.toggle("muted", !soundEnabled);
    $("#soundButton").setAttribute("aria-label", soundEnabled ? "Выключить звук" : "Включить звук");
    if (soundEnabled) playTone();
  });
  $("#fullscreenButton").addEventListener("click", async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      toast("Полноэкранный режим недоступен", true);
    }
  });
  $("#zoomInButton").addEventListener("click", () => { zoomMap(.8); saveMapView(); });
  $("#zoomOutButton").addEventListener("click", () => { zoomMap(1.25); saveMapView(); });
  $("#resetViewButton").addEventListener("click", resetMapView);
  $$("#provinceTabs button").forEach((button) => button.addEventListener("click", () => selectTab(button.dataset.tab)));
  $("#battleDialog").addEventListener("close", () => {
    if ($("#battleDialog").returnValue === "cancel") {
      pendingBattle = null;
      marchOrigin = null;
      renderCampaign();
    }
  });
  $("#newAfterEndButton").addEventListener("click", () => {
    localStorage.removeItem(SAVE_KEY);
    campaign = null;
    selectedFaction = null;
    $("#selectedFactionSummary").hidden = true;
    renderFactionSelection();
    showScreen("faction");
  });
  bindMapInteractions();
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }
}

bindEvents();
renderFactionSelection();
updateContinueButton();
registerServiceWorker();
