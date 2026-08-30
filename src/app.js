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
  offerTrade,
  provinceEconomy,
  recruitUnit,
  resolveBattle,
  sendGift,
} from "./engine.js";
import { MAP_VIEWBOX } from "./regions.js";

const SAVE_KEY = "crown-and-conquest-campaign-v3";
const SVG_NS = "http://www.w3.org/2000/svg";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const formatNumber = (value) => new Intl.NumberFormat("ru-RU").format(Math.round(value));
const statusLabels = { war: "Война", neutral: "Нейтралитет", trade: "Торговля", allied: "Союз" };
const logIcons = { crown: "♛", build: "♜", army: "♟", march: "➟", victory: "⚔", defeat: "†", war: "⚑", diplomacy: "⚖", world: "◆", event: "☼" };

let campaign = null;
let selectedFaction = null;
let marchOrigin = null;
let pendingBattle = null;
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
  resetMapView();
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
  const seaLayer = $("#seaLayer");
  provinceLayer.replaceChildren();
  labelLayer.replaceChildren();
  armyLayer.replaceChildren();
  seaLayer.replaceChildren();

  for (const sea of SEAS) {
    const label = svgElement("text", { x: sea.x, y: sea.y, class: "sea-label" });
    label.textContent = sea.name;
    seaLayer.append(label);
  }

  const reachable = marchOrigin ? new Set(campaign.provinces[marchOrigin].neighbors) : new Set();
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
    if (item.capital || regionIndex % 4 === 0 || campaign.selectedProvince === item.id) {
      const label = svgElement("text", { x: centerX, y: centerY + 2, class: item.capital ? "province-label major" : "province-label" });
      label.textContent = item.name.toUpperCase();
      labelLayer.append(label);
    }

    const soldierCount = armySoldiers(item.army);
    if (soldierCount > 0 && (item.capital || item.id === campaign.selectedProvince || soldierCount >= 350)) {
      const markerX = centerX + 16;
      const markerY = centerY + 17;
      armyLayer.append(svgElement("circle", { cx: markerX, cy: markerY, r: 12, class: "army-marker" }));
      const icon = svgElement("text", { x: markerX, y: markerY - 1, class: "army-marker-icon" });
      icon.textContent = "♟";
      armyLayer.append(icon);
      const amount = svgElement("text", { x: markerX, y: markerY + 8, class: "army-marker-text" });
      amount.textContent = Math.max(1, Math.round(soldierCount / 100));
      armyLayer.append(amount);
    }
  }

  $("#mapModeLabel").textContent = marchOrigin ? `Армия из ${campaign.provinces[marchOrigin].name}: выберите соседнюю землю` : "Выберите провинцию";
  $("#mapHint").textContent = marchOrigin
    ? "Подсвечены доступные цели. Повторное нажатие отменит поход."
    : "Нажмите на провинцию, чтобы открыть управление";
  applyMapView();
}

function handleProvinceClick(provinceId) {
  playTone();
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

  const neighbors = item.neighbors.map((id) => campaign.provinces[id]);
  container.innerHTML = `
    <div class="action-card">
      <h3>${item.moved ? "Армия уже двигалась" : "Военный поход"}</h3>
      <p>В поход выступит около двух третей гарнизона. Один отряд останется защищать землю.</p>
      <button id="startMarchButton" class="option-button" type="button" ${canStartMarch(item) ? "" : "disabled"}>
        <span class="option-icon">➟</span><span><strong>Выбрать цель на карте</strong><small>${canStartMarch(item) ? "Доступные земли будут подсвечены" : "Нужно не менее двух отрядов и свободное перемещение"}</small></span><span class="option-price">Карта</span>
      </button>
    </div>
    <div class="action-card">
      <h3>Соседние земли</h3>
      <div class="neighbor-grid">
        ${neighbors.map((neighbor) => {
          const relation = getDiplomacy(campaign, campaign.playerFaction, neighbor.owner);
          const allowed = canMarch(campaign, item.id, neighbor.id).ok;
          return `<button class="neighbor-button${neighbor.owner !== campaign.playerFaction ? " hostile" : ""}" type="button" data-march-target="${neighbor.id}" ${allowed ? "" : "disabled"} style="--neighbor-color:${FACTIONS[neighbor.owner].color}">
            <i></i><span><strong>${neighbor.name}</strong><small>${FACTIONS[neighbor.owner].shortName} • ${armySoldiers(neighbor.army)} воинов</small></span><b>${neighbor.owner === campaign.playerFaction ? "Перейти" : relation.status === "war" ? "Атаковать" : "Мир"}</b>
          </button>`;
        }).join("")}
      </div>
    </div>
  `;
  $("#startMarchButton")?.addEventListener("click", () => {
    marchOrigin = item.id;
    renderMap();
    toast("Выберите подсвеченную соседнюю провинцию");
  });
  $$('[data-march-target]', container).forEach((button) => button.addEventListener("click", () => handleMarch(item.id, button.dataset.marchTarget)));
}

function canStartMarch(item) {
  return !item.moved && Object.values(item.army).reduce((sum, value) => sum + value, 0) >= 2;
}

function renderRecruitTab(item) {
  const own = item.owner === campaign.playerFaction;
  const faction = FACTIONS[campaign.playerFaction];
  $("#recruitOptions").innerHTML = Object.values(UNIT_TYPES).map((unit) => {
    const requirementMet = !unit.requirement || item.buildings[unit.requirement] > 0;
    const price = Math.round(unit.cost * faction.recruitBonus);
    const disabled = !own || item.recruited || !requirementMet;
    const detail = !own ? "Только в своих землях" : item.recruited ? "Набор доступен раз за ход" : requirementMet
      ? `${unit.soldiers} воинов • содержание ${unit.upkeep}`
      : `Требуется: ${BUILDING_TYPES[unit.requirement].name}`;
    return `<button class="option-button" type="button" data-recruit="${unit.id}" ${disabled ? "disabled" : ""}>
      <span class="option-icon">${unit.icon}</span><span><strong>${unit.name}</strong><small class="${requirementMet ? "" : "locked-message"}">${detail}</small></span><span class="option-price"><span>● ${price}</span><span>♨ ${unit.foodCost}</span></span>
    </button>`;
  }).join("");
  $$('[data-recruit]').forEach((button) => button.addEventListener("click", () => applyPlayerAction(recruitUnit(campaign, item.id, button.dataset.recruit), "success")));
}

function renderBuildTab(item) {
  const own = item.owner === campaign.playerFaction;
  $("#buildOptions").innerHTML = Object.values(BUILDING_TYPES).map((building) => {
    const cost = buildingCost(item, building.id);
    const level = item.buildings[building.id] ?? 0;
    const maxed = level >= 2;
    return `<button class="option-button" type="button" data-build="${building.id}" ${!own || maxed ? "disabled" : ""}>
      <span class="option-icon">${building.icon}</span><span><strong>${building.name} ${level ? `• ур. ${level}` : ""}</strong><small>${maxed ? "Достигнут высший уровень" : building.description}</small></span><span class="option-price">${maxed ? "Макс." : `<span>● ${cost.gold}</span>${cost.authority ? `<span>✦ ${cost.authority}</span>` : ""}`}</span>
    </button>`;
  }).join("");
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
  const attacker = FACTIONS[battle.attacker];
  const defender = FACTIONS[battle.defender];
  $("#battleSubtitle").textContent = `Битва за ${campaign.provinces[battle.toId].name}. ${battle.terrain.name.toLowerCase()} и укрепления влияют на защитников.`;
  $("#battleAttackerEmblem").textContent = attacker.emblem;
  $("#battleAttackerEmblem").style.cssText = `background:${attacker.color};color:${attacker.accent}`;
  $("#battleDefenderEmblem").textContent = defender.emblem;
  $("#battleDefenderEmblem").style.cssText = `background:${defender.color};color:${defender.accent}`;
  $("#battleAttackerCount").textContent = `${formatNumber(battle.attackerSoldiers)} воинов`;
  $("#battleDefenderCount").textContent = `${formatNumber(battle.defenderSoldiers)} воинов`;
  $("#tacticsList").innerHTML = Object.values(TACTICS).map((tactic) => `
    <button class="tactic-button" type="button" data-tactic="${tactic.id}"><span>${tactic.icon}</span><strong>${tactic.name}</strong><small>${tactic.description}</small></button>
  `).join("");
  $$('[data-tactic]').forEach((button) => button.addEventListener("click", () => fightBattle(button.dataset.tactic), { once: true }));
  $("#battleDialog").showModal();
  playTone("battle");
}

function fightBattle(tacticId) {
  if (!pendingBattle) return;
  const result = resolveBattle(campaign, pendingBattle.fromId, pendingBattle.toId, tacticId);
  if (!result.ok) {
    toast(result.message, true);
    return;
  }
  $("#battleDialog").close();
  campaign = result.state;
  campaign.selectedProvince = pendingBattle.toId;
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
  $("#resultText").textContent = tacticText;
  const attackerLosses = Math.max(0, report.attackerBefore - report.attackerAfter);
  const defenderLosses = Math.max(0, report.defenderBefore - report.defenderAfter);
  $("#resultStats").innerHTML = `
    <div><small>Ваши потери</small><strong>${formatNumber(attackerLosses)}</strong></div>
    <div><small>Потери врага</small><strong>${formatNumber(defenderLosses)}</strong></div>
    <div><small>Ваша тактика</small><strong>${TACTICS[report.attackerTactic].icon}</strong></div>
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
        ${relation.status === "neutral" ? `<button class="small-action" type="button" data-diplomacy="trade" data-target="${faction.id}">Торговля ✦5</button>` : ""}
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
  $("#campaignMap").setAttribute("viewBox", `${mapView.x} ${mapView.y} ${mapView.width} ${mapView.height}`);
}

function zoomMap(factor) {
  const newWidth = mapView.width * factor;
  const newHeight = newWidth * MAP_RATIO;
  setMapView({
    width: newWidth,
    height: newHeight,
    x: mapView.x + (mapView.width - newWidth) / 2,
    y: mapView.y + (mapView.height - newHeight) / 2,
  });
}

function resetMapView() {
  mapView = { x: 0, y: 0, width: MAP_VIEWBOX.width, height: MAP_VIEWBOX.height };
  applyMapView();
}

function bindMapInteractions() {
  const svg = $("#campaignMap");
  svg.addEventListener("wheel", (event) => {
    event.preventDefault();
    zoomMap(event.deltaY > 0 ? 1.12 : .88);
  }, { passive: false });
  svg.addEventListener("pointerdown", (event) => {
    svg.setPointerCapture(event.pointerId);
    dragging = { clientX: event.clientX, clientY: event.clientY, view: { ...mapView } };
    draggedDistance = 0;
  });
  svg.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    const rect = svg.getBoundingClientRect();
    const dx = event.clientX - dragging.clientX;
    const dy = event.clientY - dragging.clientY;
    draggedDistance = Math.max(draggedDistance, Math.abs(dx) + Math.abs(dy));
    setMapView({
      ...dragging.view,
      x: dragging.view.x - dx * dragging.view.width / rect.width,
      y: dragging.view.y - dy * dragging.view.height / rect.height,
    });
  });
  const endDrag = () => { dragging = null; setTimeout(() => { draggedDistance = 0; }, 0); };
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
  $("#zoomInButton").addEventListener("click", () => zoomMap(.8));
  $("#zoomOutButton").addEventListener("click", () => zoomMap(1.25));
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
