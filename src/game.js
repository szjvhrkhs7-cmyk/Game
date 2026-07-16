import { CAT_PROFILES, LEVELS, validateLevels } from "./levels.js";
import { calculatePhysicsSteps, getJumpKind } from "./physics.js";

const VIEW_WIDTH = 540;
const VIEW_HEIGHT = 960;
const GRAVITY = 1850;
const STORAGE_KEY = "banana-cat-bros-progress-v1";
const TAU = Math.PI * 2;

const canvas = document.querySelector("#gameCanvas");
const ctx = canvas.getContext("2d", { alpha: false });

const ui = {
  startScreen: document.querySelector("#startScreen"),
  dialogScreen: document.querySelector("#dialogScreen"),
  pauseScreen: document.querySelector("#pauseScreen"),
  startButton: document.querySelector("#startButton"),
  dialogButton: document.querySelector("#dialogButton"),
  menuButton: document.querySelector("#menuButton"),
  resumeButton: document.querySelector("#resumeButton"),
  restartButton: document.querySelector("#restartButton"),
  pauseButton: document.querySelector("#pauseButton"),
  soundButton: document.querySelector("#soundButton"),
  fullscreenButton: document.querySelector("#fullscreenButton"),
  touchControls: document.querySelector("#touchControls"),
  hud: document.querySelector("#hud"),
  hudLevel: document.querySelector("#hudLevel"),
  hudBananas: document.querySelector("#hudBananas"),
  hudScore: document.querySelector("#hudScore"),
  hudHealth: document.querySelector("#hudHealth"),
  dialogEyebrow: document.querySelector("#dialogEyebrow"),
  dialogTitle: document.querySelector("#dialogTitle"),
  dialogText: document.querySelector("#dialogText"),
  dialogStats: document.querySelector("#dialogStats"),
  toast: document.querySelector("#toast")
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function lerp(from, to, amount) {
  return from + (to - from) * amount;
}

function intersects(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function roundedRect(context, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.roundRect(x, y, width, height, r);
}

function loadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = source;
  });
}

function readProgress() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return {
      unlocked: clamp(Number(value?.unlocked) || 0, 0, LEVELS.length - 1),
      bestScore: Math.max(0, Number(value?.bestScore) || 0)
    };
  } catch {
    return { unlocked: 0, bestScore: 0 };
  }
}

function writeProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Игра остаётся работоспособной, даже если браузер запретил localStorage.
  }
}

class Input {
  constructor() {
    this.down = new Set();
    this.pressed = new Set();
    this.keyMap = new Map([
      ["ArrowLeft", "left"], ["KeyA", "left"],
      ["ArrowRight", "right"], ["KeyD", "right"],
      ["ArrowUp", "jump"], ["KeyW", "jump"], ["Space", "jump"],
      ["KeyX", "attack"], ["KeyK", "attack"],
      ["KeyQ", "switch"], ["KeyE", "switch"]
    ]);
    this.bindKeyboard();
    this.bindTouch();
  }

  bindKeyboard() {
    window.addEventListener("keydown", (event) => {
      const action = this.keyMap.get(event.code);
      if (action) {
        event.preventDefault();
        if (!this.down.has(action)) this.pressed.add(action);
        this.down.add(action);
      }
      if (event.code === "Escape" || event.code === "KeyP") {
        event.preventDefault();
        game.togglePause();
      }
    });

    window.addEventListener("keyup", (event) => {
      const action = this.keyMap.get(event.code);
      if (action) this.down.delete(action);
    });

    window.addEventListener("blur", () => this.down.clear());
  }

  bindTouch() {
    document.querySelectorAll("[data-input]").forEach((button) => {
      const action = button.dataset.input;
      const release = (event) => {
        event.preventDefault();
        this.down.delete(action);
        button.classList.remove("active");
      };
      button.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        button.setPointerCapture?.(event.pointerId);
        if (!this.down.has(action)) this.pressed.add(action);
        this.down.add(action);
        button.classList.add("active");
      });
      button.addEventListener("pointerup", release);
      button.addEventListener("pointercancel", release);
      button.addEventListener("pointerleave", (event) => {
        if (event.buttons === 0) release(event);
      });
    });

    document.querySelector("[data-action='switch']").addEventListener("pointerdown", (event) => {
      event.preventDefault();
      this.pressed.add("switch");
    });
  }

  isDown(action) {
    return this.down.has(action);
  }

  consume(action) {
    if (!this.pressed.has(action)) return false;
    this.pressed.delete(action);
    return true;
  }

  clearPressed() {
    this.pressed.clear();
  }
}

class SoundBank {
  constructor() {
    this.enabled = true;
    this.context = null;
  }

  unlock() {
    if (!this.context) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) this.context = new AudioContext();
    }
    this.context?.resume();
  }

  tone(frequency, duration = 0.08, type = "square", volume = 0.05, slide = 0) {
    if (!this.enabled || !this.context) return;
    const now = this.context.currentTime;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    oscillator.frequency.linearRampToValueAtTime(Math.max(40, frequency + slide), now + duration);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(gain).connect(this.context.destination);
    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  jump() { this.tone(310, 0.11, "square", 0.045, 190); }
  doubleJump() {
    this.tone(430, 0.09, "triangle", 0.045, 240);
    setTimeout(() => this.tone(690, 0.11, "sine", 0.04, 120), 55);
  }
  attack() { this.tone(520, 0.08, "triangle", 0.05, -220); }
  collect() { this.tone(760, 0.09, "sine", 0.055, 240); }
  hit() { this.tone(120, 0.18, "sawtooth", 0.06, -65); }
  stomp() { this.tone(185, 0.08, "square", 0.045, -80); }
  switchCat() { this.tone(380, 0.1, "triangle", 0.045, 260); }
  checkpoint() { this.tone(560, 0.16, "sine", 0.05, 300); }
  win() {
    [520, 660, 780].forEach((frequency, index) => setTimeout(() => this.tone(frequency, 0.16, "triangle", 0.05, 80), index * 110));
  }
}

class Particle {
  constructor(x, y, color, speed = 180, life = 0.5, size = 6) {
    const angle = Math.random() * TAU;
    this.x = x;
    this.y = y;
    this.vx = Math.cos(angle) * speed * (0.35 + Math.random() * 0.65);
    this.vy = Math.sin(angle) * speed * (0.35 + Math.random() * 0.65) - 70;
    this.life = life * (0.75 + Math.random() * 0.5);
    this.maxLife = this.life;
    this.size = size * (0.5 + Math.random() * 0.7);
    this.color = color;
  }

  update(dt) {
    this.life -= dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vy += GRAVITY * 0.35 * dt;
    return this.life > 0;
  }

  draw(context, cameraX) {
    context.save();
    context.globalAlpha = clamp(this.life / this.maxLife, 0, 1);
    context.fillStyle = this.color;
    context.beginPath();
    context.arc(this.x - cameraX, this.y, this.size, 0, TAU);
    context.fill();
    context.restore();
  }
}

class BananaBoomerang {
  constructor(x, y, direction, owner) {
    this.x = x;
    this.y = y;
    this.width = 38;
    this.height = 26;
    this.vx = direction * 580;
    this.vy = -70;
    this.owner = owner;
    this.age = 0;
    this.rotation = 0;
    this.done = false;
    this.hit = new Set();
  }

  update(dt) {
    this.age += dt;
    this.rotation += dt * 13;
    if (this.age > 0.34) {
      const targetX = this.owner.x + this.owner.width / 2;
      const targetY = this.owner.y + 28;
      const dx = targetX - this.x;
      const dy = targetY - this.y;
      const length = Math.max(1, Math.hypot(dx, dy));
      this.vx = (dx / length) * 690;
      this.vy = (dy / length) * 690;
      if (length < 45) this.done = true;
    }
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    if (this.age > 1.4) this.done = true;
  }

  get bounds() {
    return { x: this.x - 18, y: this.y - 13, width: this.width, height: this.height };
  }

  draw(context, cameraX) {
    context.save();
    context.translate(this.x - cameraX, this.y);
    context.rotate(this.rotation);
    drawBanana(context, 0, 0, 1.05);
    context.restore();
  }
}

class MouseEnemy {
  constructor(config) {
    this.x = config.x;
    this.y = config.y;
    this.startX = config.x;
    this.type = config.type || "walker";
    this.width = this.type === "baron" ? 96 : 46;
    this.height = this.type === "baron" ? 82 : 42;
    this.vx = this.type === "runner" ? -118 : -72;
    this.vy = 0;
    this.direction = -1;
    this.health = config.health || (this.type === "armored" ? 2 : 1);
    this.maxHealth = this.health;
    this.dead = false;
    this.onGround = false;
    this.jumpClock = 0.7 + Math.random();
    this.flash = 0;
    this.frame = Math.random() * 10;
  }

  update(dt, platforms, player) {
    if (this.dead) return;
    this.frame += dt;
    this.flash = Math.max(0, this.flash - dt);

    if (this.type === "jumper") {
      this.jumpClock -= dt;
      if (this.jumpClock <= 0 && this.onGround) {
        this.vy = -560;
        this.jumpClock = 1.3 + Math.random() * 0.7;
      }
    }

    if (this.type === "baron") {
      const distance = player.x - this.x;
      this.direction = Math.sign(distance) || this.direction;
      const enraged = this.health <= this.maxHealth / 2;
      this.vx = this.direction * (enraged ? 190 : 135);
      this.jumpClock -= dt;
      if (this.jumpClock <= 0 && this.onGround && Math.abs(distance) < 520) {
        this.vy = enraged ? -650 : -550;
        this.jumpClock = enraged ? 1.15 : 1.7;
      }
    } else if (this.onGround) {
      const probeX = this.direction < 0 ? this.x - 12 : this.x + this.width + 12;
      const probeY = this.y + this.height + 7;
      const floorAhead = platforms.some((platform) => (
        probeX >= platform.x && probeX <= platform.x + platform.width &&
        probeY >= platform.y - 3 && probeY <= platform.y + platform.height
      ));
      if (!floorAhead || Math.abs(this.x - this.startX) > 310) this.turn();
    }

    this.vy += GRAVITY * dt;
    this.move(dt, platforms);
    if (this.y > VIEW_HEIGHT + 160) this.dead = true;
  }

  move(dt, platforms) {
    const previousX = this.x;
    this.x += this.vx * dt;
    for (const platform of platforms) {
      if (!intersects(this.bounds, platform)) continue;
      if (this.vx > 0) this.x = platform.x - this.width;
      else if (this.vx < 0) this.x = platform.x + platform.width;
      if (this.type !== "baron") this.turn();
      else this.vx *= -0.4;
      if (Math.abs(this.x - previousX) < 0.01) break;
    }

    const previousBottom = this.y + this.height;
    this.y += this.vy * dt;
    this.onGround = false;
    for (const platform of platforms) {
      if (!intersects(this.bounds, platform)) continue;
      if (this.vy >= 0 && previousBottom <= platform.y + 9) {
        this.y = platform.y - this.height;
        this.vy = 0;
        this.onGround = true;
      } else if (this.vy < 0) {
        this.y = platform.y + platform.height;
        this.vy = 0;
      }
    }
  }

  turn() {
    this.direction *= -1;
    const speed = this.type === "runner" ? 118 : 72;
    this.vx = this.direction * speed;
    this.startX = this.x;
  }

  damage(amount = 1) {
    if (this.dead || this.flash > 0) return false;
    this.health -= amount;
    this.flash = 0.12;
    this.vy = -210;
    if (this.health <= 0) this.dead = true;
    return this.dead;
  }

  get bounds() {
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }

  draw(context, cameraX) {
    if (this.dead) return;
    drawMouse(context, this.x - cameraX, this.y, this, this.frame);
  }
}

class Game {
  constructor(images) {
    this.images = images;
    this.input = new Input();
    this.sound = new SoundBank();
    this.progress = readProgress();
    this.selectedCat = 0;
    this.activeCat = 0;
    this.state = "menu";
    this.levelIndex = 0;
    this.level = null;
    this.player = null;
    this.companion = null;
    this.enemies = [];
    this.collectibles = [];
    this.projectiles = [];
    this.particles = [];
    this.checkpoints = [];
    this.cameraX = 0;
    this.score = 0;
    this.levelScoreStart = 0;
    this.bananaCount = 0;
    this.health = 3;
    this.lives = 3;
    this.attackCooldown = 0;
    this.switchCooldown = 0;
    this.invincible = 0;
    this.companionAttack = 0;
    this.elapsed = 0;
    this.levelElapsed = 0;
    this.shake = 0;
    this.toastTimer = 0;
    this.lastTime = performance.now();
    this.bindUi();
    this.updateMenuProgress();
    requestAnimationFrame((time) => this.loop(time));
  }

  bindUi() {
    document.querySelectorAll(".cat-card").forEach((card) => {
      card.addEventListener("click", () => {
        this.selectedCat = Number(card.dataset.cat);
        document.querySelectorAll(".cat-card").forEach((item) => {
          const selected = item === card;
          item.classList.toggle("selected", selected);
          item.setAttribute("aria-checked", String(selected));
        });
      });
    });

    ui.startButton.addEventListener("click", () => {
      this.sound.unlock();
      this.startRun();
    });
    ui.dialogButton.addEventListener("click", () => this.handleDialogAction());
    ui.menuButton.addEventListener("click", () => this.showMenu());
    ui.resumeButton.addEventListener("click", () => this.togglePause(false));
    ui.restartButton.addEventListener("click", () => {
      this.score = this.levelScoreStart;
      this.startLevel(this.levelIndex, true);
    });
    ui.pauseButton.addEventListener("click", () => this.togglePause());
    ui.soundButton.addEventListener("click", () => {
      this.sound.unlock();
      this.sound.enabled = !this.sound.enabled;
      ui.soundButton.textContent = this.sound.enabled ? "🔊" : "🔇";
      ui.soundButton.setAttribute("aria-label", this.sound.enabled ? "Выключить звук" : "Включить звук");
    });
    ui.fullscreenButton.addEventListener("click", async () => {
      try {
        if (document.fullscreenElement) await document.exitFullscreen();
        else await document.querySelector(".game-shell").requestFullscreen();
      } catch {
        this.showToast("Полноэкранный режим недоступен");
      }
    });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden && this.state === "playing") this.togglePause(true);
    });
  }

  updateMenuProgress() {
    const suffix = this.progress.bestScore > 0 ? ` · рекорд ${this.progress.bestScore.toLocaleString("ru-RU")}` : "";
    document.querySelector(".lead").textContent = `Четыре атмосферных уровня, двойной прыжок и один Золотой банан${suffix}. Выбирай ведущего и начинай погоню.`;
    ui.startButton.querySelector("span").textContent = this.progress.unlocked > 0
      ? `Продолжить с уровня ${LEVELS[this.progress.unlocked].id}`
      : "Начать погоню";
  }

  startRun() {
    this.score = 0;
    this.bananaCount = 0;
    this.lives = 3;
    this.levelIndex = this.progress.unlocked;
    this.activeCat = this.selectedCat;
    this.startLevel(this.levelIndex, false);
  }

  startLevel(index, keepRun = true) {
    this.levelIndex = clamp(index, 0, LEVELS.length - 1);
    this.level = LEVELS[this.levelIndex];
    if (!keepRun) {
      this.score = 0;
      this.bananaCount = 0;
      this.lives = 3;
    }
    this.levelScoreStart = this.score;
    this.health = 3;
    this.elapsed = 0;
    this.levelElapsed = 0;
    this.cameraX = 0;
    this.attackCooldown = 0;
    this.switchCooldown = 0;
    this.invincible = 0;
    this.projectiles = [];
    this.particles = [];
    this.checkpoints = this.level.checkpoints.map((checkpoint) => ({ ...checkpoint, active: false }));
    this.collectibles = this.level.bananas.map((banana) => ({ ...banana, collected: false, bob: Math.random() * TAU }));
    this.enemies = this.level.enemies.map((enemy) => new MouseEnemy(enemy));
    if (this.level.boss) this.enemies.push(new MouseEnemy(this.level.boss));
    this.createPlayer(this.level.spawn.x, this.level.spawn.y);
    this.state = "playing";
    ui.startScreen.hidden = true;
    ui.dialogScreen.hidden = true;
    ui.pauseScreen.hidden = true;
    ui.hud.hidden = false;
    ui.touchControls.hidden = false;
    ui.pauseButton.disabled = false;
    this.input.clearPressed();
    this.updateHud();
    this.showToast(`${this.level.id} · ${this.level.title}`);
  }

  createPlayer(x, y) {
    this.player = {
      x,
      y,
      width: 56,
      height: 78,
      vx: 0,
      vy: 0,
      onGround: false,
      facing: 1,
      coyote: 0,
      jumpBuffer: 0,
      jumpsUsed: 0,
      squash: 0,
      airSpin: 0,
      runFrame: 0
    };
    this.companion = {
      x: x - 64,
      y,
      facing: 1,
      bounce: 0
    };
  }

  loop(time) {
    const dt = Math.min(0.033, Math.max(0, (time - this.lastTime) / 1000));
    this.lastTime = time;
    if (this.state === "playing") this.update(dt);
    this.draw();
    this.input.clearPressed();
    requestAnimationFrame((nextTime) => this.loop(nextTime));
  }

  update(dt) {
    this.elapsed += dt;
    this.levelElapsed += dt;
    this.attackCooldown = Math.max(0, this.attackCooldown - dt);
    this.switchCooldown = Math.max(0, this.switchCooldown - dt);
    this.invincible = Math.max(0, this.invincible - dt);
    this.companionAttack = Math.max(0, this.companionAttack - dt);
    this.shake = Math.max(0, this.shake - dt * 2.5);
    this.toastTimer = Math.max(0, this.toastTimer - dt);
    if (this.toastTimer === 0) ui.toast.classList.remove("visible");

    this.updatePlayer(dt);
    this.updateCompanion(dt);
    this.updateEnemies(dt);
    this.updateProjectiles(dt);
    this.updateCollectibles();
    this.updateCheckpoints();
    this.updateGoal();
    this.particles = this.particles.filter((particle) => particle.update(dt));

    const velocityLook = clamp(this.player.vx * 0.34, -72, 92);
    const targetCamera = this.player.x - VIEW_WIDTH * 0.35 + 118 + velocityLook;
    this.cameraX = lerp(this.cameraX, clamp(targetCamera, 0, this.level.worldWidth - VIEW_WIDTH), 1 - Math.pow(0.0032, dt));
    this.updateHud();
  }

  updatePlayer(dt) {
    const profile = CAT_PROFILES[this.activeCat];
    const player = this.player;
    const move = Number(this.input.isDown("right")) - Number(this.input.isDown("left"));
    const acceleration = player.onGround ? 2050 : 1320;
    const targetSpeed = move * profile.speed;
    player.vx += clamp(targetSpeed - player.vx, -acceleration * dt, acceleration * dt);
    if (move === 0 && player.onGround) player.vx *= Math.pow(0.0007, dt);
    if (move !== 0) player.facing = Math.sign(move);

    player.coyote = player.onGround ? 0.14 : Math.max(0, player.coyote - dt);
    if (this.input.consume("jump")) player.jumpBuffer = 0.16;
    else player.jumpBuffer = Math.max(0, player.jumpBuffer - dt);

    if (player.jumpBuffer > 0) {
      const jumpKind = getJumpKind(player.coyote, player.jumpsUsed);
      if (jumpKind) this.performJump(jumpKind === "air");
    }
    if (!this.input.isDown("jump") && player.vy < -230) player.vy += GRAVITY * 1.45 * dt;

    if (this.input.consume("attack")) this.attack();
    if (this.input.consume("switch")) this.switchCat();

    const nearApex = Math.abs(player.vy) < 115 && this.input.isDown("jump");
    const gravityScale = nearApex ? 0.68 : player.vy > 0 ? 1.08 : 1;
    player.vy = Math.min(940, player.vy + GRAVITY * gravityScale * dt);
    this.movePlayer(dt);
    player.squash = Math.max(0, player.squash - dt * 5.5);
    if (!player.onGround && player.jumpsUsed > 1) player.airSpin += dt * 7.5;
    else player.airSpin = lerp(player.airSpin, 0, 1 - Math.pow(0.001, dt));
    player.runFrame += Math.abs(player.vx) * dt * 0.035;

    if (player.y > VIEW_HEIGHT + 130) this.loseHealth(true);
    for (const hazard of this.level.hazards) {
      const hitbox = { x: hazard.x + 7, y: hazard.y - 8, width: hazard.width - 14, height: 30 };
      if (intersects(this.playerBounds, hitbox)) this.loseHealth(true);
    }
  }

  performJump(isDoubleJump) {
    const player = this.player;
    const force = this.activeProfile.jump * (isDoubleJump ? 0.91 : 1);
    player.vy = -force;
    player.onGround = false;
    player.coyote = 0;
    player.jumpBuffer = 0;
    player.jumpsUsed = isDoubleJump ? 2 : 1;
    if (isDoubleJump) {
      player.airSpin = 0.01;
      this.sound.doubleJump();
      this.burst(player.x + player.width / 2, player.y + player.height * 0.7, "#b9efff", 14, 175, 0.48, 4.5);
      this.burst(player.x + player.width / 2, player.y + player.height * 0.7, "#ffffff", 7, 105, 0.35, 3);
    } else {
      this.sound.jump();
      this.burst(player.x + player.width / 2, player.y + player.height, "#d5e8e7", 7, 100, 0.36, 4);
    }
  }

  movePlayer(dt) {
    const player = this.player;
    const steps = calculatePhysicsSteps(player.vx, player.vy, dt);
    const stepDt = dt / steps;
    let landed = false;
    for (let step = 0; step < steps; step += 1) {
      if (this.movePlayerStep(stepDt)) landed = true;
    }
    if (landed) {
      player.onGround = true;
      player.jumpsUsed = 0;
      player.squash = 1;
    }
  }

  movePlayerStep(dt) {
    const player = this.player;
    const previousX = player.x;
    player.x += player.vx * dt;
    player.x = clamp(player.x, 0, this.level.worldWidth - player.width);
    for (const platform of this.level.platforms) {
      if (!intersects(this.playerBounds, platform)) continue;
      if (player.vx > 0) player.x = platform.x - player.width;
      else if (player.vx < 0) player.x = platform.x + platform.width;
      player.vx = 0;
      if (Math.abs(player.x - previousX) < 0.01) break;
    }

    const previousBottom = player.y + player.height;
    player.y += player.vy * dt;
    player.onGround = false;
    let landed = false;
    for (const platform of this.level.platforms) {
      if (!intersects(this.playerBounds, platform)) continue;
      if (player.vy >= 0 && previousBottom <= platform.y + 11) {
        player.y = platform.y - player.height;
        player.vy = 0;
        player.onGround = true;
        landed = true;
      } else if (player.vy < 0) {
        player.y = platform.y + platform.height;
        player.vy = 20;
      }
    }
    return landed;
  }

  updateCompanion(dt) {
    const offset = this.player.facing > 0 ? -70 : 70;
    const targetX = this.player.x + offset;
    this.companion.x = lerp(this.companion.x, targetX, 1 - Math.pow(0.001, dt));
    this.companion.y = lerp(this.companion.y, this.player.y + (this.player.onGround ? 3 : 16), 1 - Math.pow(0.0004, dt));
    this.companion.facing = this.player.facing;
    this.companion.bounce += dt * (4 + Math.abs(this.player.vx) * 0.03);

    if (this.companionAttack <= 0) {
      const target = this.enemies.find((enemy) => !enemy.dead && Math.abs(enemy.x - this.companion.x) < 92 && Math.abs(enemy.y - this.companion.y) < 85);
      if (target) {
        const defeated = target.damage(1);
        this.companionAttack = 0.9;
        this.sound.attack();
        this.burst(target.x + target.width / 2, target.y + target.height / 2, "#ffe16a", 7, 170, 0.4, 5);
        if (defeated) this.defeatEnemy(target, true);
      }
    }
  }

  updateEnemies(dt) {
    for (const enemy of this.enemies) {
      if (enemy.dead) continue;
      enemy.update(dt, this.level.platforms, this.player);
      if (!intersects(this.playerBounds, enemy.bounds) || this.invincible > 0) continue;

      const playerBottomBefore = this.player.y + this.player.height - this.player.vy * dt;
      const stomping = this.player.vy > 80 && playerBottomBefore <= enemy.y + 16;
      if (stomping) {
        this.player.y = enemy.y - this.player.height;
        this.player.vy = -440;
        this.player.jumpsUsed = 1;
        const defeated = enemy.damage(this.activeProfile.power);
        this.sound.stomp();
        this.burst(enemy.x + enemy.width / 2, enemy.y + 8, "#ffffff", 8, 190, 0.38, 5);
        if (defeated) this.defeatEnemy(enemy);
      } else {
        this.loseHealth(false, enemy.x + enemy.width / 2);
      }
    }
  }

  updateProjectiles(dt) {
    for (const projectile of this.projectiles) {
      projectile.update(dt);
      for (const enemy of this.enemies) {
        if (enemy.dead || projectile.hit.has(enemy) || !intersects(projectile.bounds, enemy.bounds)) continue;
        projectile.hit.add(enemy);
        const defeated = enemy.damage(this.activeProfile.power);
        this.sound.stomp();
        this.burst(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, "#ffe166", 9, 210, 0.45, 5);
        if (defeated) this.defeatEnemy(enemy);
      }
    }
    this.projectiles = this.projectiles.filter((projectile) => !projectile.done);
  }

  updateCollectibles() {
    for (const collectible of this.collectibles) {
      if (collectible.collected) continue;
      const bounds = { x: collectible.x - 15, y: collectible.y - 20, width: 30, height: 38 };
      if (!intersects(this.playerBounds, bounds)) continue;
      collectible.collected = true;
      this.bananaCount += 1;
      this.score += 100;
      this.sound.collect();
      this.burst(collectible.x, collectible.y, "#ffe36d", 10, 160, 0.5, 5);
    }
  }

  updateCheckpoints() {
    for (const checkpoint of this.checkpoints) {
      if (checkpoint.active || this.player.x < checkpoint.x) continue;
      checkpoint.active = true;
      this.sound.checkpoint();
      this.score += 250;
      this.showToast("Клубок сохранения найден");
      this.burst(checkpoint.x, checkpoint.y, "#8cd8ff", 14, 180, 0.65, 5);
    }
  }

  updateGoal() {
    const bossAlive = this.enemies.some((enemy) => enemy.type === "baron" && !enemy.dead);
    if (bossAlive || this.player.x + this.player.width < this.level.goal.x - 24) return;
    this.completeLevel();
  }

  attack() {
    if (this.attackCooldown > 0 || this.projectiles.length > 0) return;
    const x = this.player.x + this.player.width / 2 + this.player.facing * 26;
    const y = this.player.y + 33;
    this.projectiles.push(new BananaBoomerang(x, y, this.player.facing, this.player));
    this.attackCooldown = 0.32;
    this.sound.attack();
  }

  switchCat() {
    if (this.switchCooldown > 0) return;
    this.activeCat = this.activeCat === 0 ? 1 : 0;
    this.switchCooldown = 0.45;
    this.sound.switchCat();
    this.burst(this.player.x + this.player.width / 2, this.player.y + 35, this.activeProfile.scarf, 12, 190, 0.48, 5);
    this.showToast(`Ведущий — ${this.activeProfile.shortName}`);
  }

  defeatEnemy(enemy, byCompanion = false) {
    const points = enemy.type === "baron" ? 2500 : enemy.type === "armored" ? 350 : 200;
    this.score += points;
    this.burst(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.type === "baron" ? "#ffcf5a" : "#c7a997", enemy.type === "baron" ? 28 : 12, enemy.type === "baron" ? 290 : 210, 0.65, 6);
    if (enemy.type === "baron") {
      this.sound.win();
      this.shake = 0.8;
      this.showToast("Барон Мышильдо побеждён!");
    } else if (byCompanion) {
      this.showToast(`${this.companionProfile.shortName} помог!`);
    }
  }

  loseHealth(fromHazard, sourceX = null) {
    if (this.invincible > 0 || this.state !== "playing") return;
    this.health -= 1;
    this.invincible = 1.25;
    this.shake = 0.45;
    this.sound.hit();
    this.burst(this.player.x + this.player.width / 2, this.player.y + 32, "#ff6577", 14, 230, 0.55, 5);

    if (this.health <= 0) {
      this.lives -= 1;
      if (this.lives <= 0) {
        this.gameOver();
        return;
      }
      this.health = 3;
      this.respawn();
      this.showToast(`Осталось попыток: ${this.lives}`);
      return;
    }

    if (fromHazard) {
      this.respawn();
    } else {
      const direction = sourceX === null ? -this.player.facing : Math.sign(this.player.x - sourceX) || -1;
      this.player.vx = direction * 310;
      this.player.vy = -400;
    }
  }

  respawn() {
    const lastCheckpoint = [...this.checkpoints].reverse().find((checkpoint) => checkpoint.active);
    const target = lastCheckpoint || this.level.spawn;
    this.player.x = target.x;
    this.player.y = target.y;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.jumpsUsed = 0;
    this.player.coyote = 0;
    this.player.jumpBuffer = 0;
    this.companion.x = this.player.x - 65;
    this.companion.y = this.player.y;
    this.cameraX = clamp(this.player.x - VIEW_WIDTH * 0.3, 0, this.level.worldWidth - VIEW_WIDTH);
  }

  completeLevel() {
    if (this.state !== "playing") return;
    this.state = "levelComplete";
    const remainingHealthBonus = this.health * 400;
    const timeBonus = Math.max(0, Math.round(5000 - this.levelElapsed * 30));
    this.score += remainingHealthBonus + timeBonus;
    this.progress.unlocked = Math.max(this.progress.unlocked, Math.min(LEVELS.length - 1, this.levelIndex + 1));
    this.progress.bestScore = Math.max(this.progress.bestScore, this.score);
    writeProgress(this.progress);
    this.sound.win();
    ui.touchControls.hidden = true;
    ui.dialogEyebrow.textContent = this.levelIndex === LEVELS.length - 1 ? "Миссия выполнена" : "Уровень пройден";
    ui.dialogTitle.textContent = this.levelIndex === LEVELS.length - 1 ? "Золотой банан спасён!" : `${this.level.title} пройдена!`;
    ui.dialogText.textContent = this.levelIndex === LEVELS.length - 1
      ? "Котики вернули трофей домой, а мыши пообещали больше не трогать чужой завтрак. По крайней мере сегодня."
      : LEVELS[this.levelIndex + 1].intro;
    ui.dialogStats.innerHTML = this.statsMarkup();
    ui.dialogButton.querySelector("span").textContent = this.levelIndex === LEVELS.length - 1 ? "Сыграть ещё" : "Следующий уровень";
    ui.dialogScreen.hidden = false;
  }

  gameOver() {
    this.state = "gameOver";
    ui.touchControls.hidden = true;
    ui.dialogEyebrow.textContent = "Погоня сорвалась";
    ui.dialogTitle.textContent = "Мыши ускользнули";
    ui.dialogText.textContent = "Но котики уже знают дорогу. Ещё одна попытка — и банан будет спасён.";
    ui.dialogStats.innerHTML = this.statsMarkup();
    ui.dialogButton.querySelector("span").textContent = "Повторить уровень";
    ui.dialogScreen.hidden = false;
  }

  statsMarkup() {
    const defeated = this.enemies.filter((enemy) => enemy.dead).length;
    const collected = this.collectibles.filter((banana) => banana.collected).length;
    return `<div><small>Очки</small><strong>${this.score.toLocaleString("ru-RU")}</strong></div><div><small>Бананы</small><strong>${collected}/${this.collectibles.length}</strong></div><div><small>Мыши</small><strong>${defeated}/${this.enemies.length}</strong></div>`;
  }

  handleDialogAction() {
    ui.dialogScreen.hidden = true;
    if (this.state === "levelComplete" && this.levelIndex < LEVELS.length - 1) {
      this.startLevel(this.levelIndex + 1, true);
    } else if (this.state === "levelComplete") {
      this.score = 0;
      this.bananaCount = 0;
      this.lives = 3;
      this.startLevel(0, false);
    } else {
      this.score = this.levelScoreStart;
      this.lives = 3;
      this.startLevel(this.levelIndex, true);
    }
  }

  togglePause(force) {
    if (!["playing", "paused"].includes(this.state)) return;
    const shouldPause = typeof force === "boolean" ? force : this.state === "playing";
    this.state = shouldPause ? "paused" : "playing";
    ui.pauseScreen.hidden = !shouldPause;
    ui.touchControls.hidden = shouldPause;
    ui.pauseButton.textContent = shouldPause ? "▶" : "Ⅱ";
    if (!shouldPause) this.lastTime = performance.now();
  }

  showMenu() {
    this.state = "menu";
    ui.dialogScreen.hidden = true;
    ui.pauseScreen.hidden = true;
    ui.startScreen.hidden = false;
    ui.hud.hidden = true;
    ui.touchControls.hidden = true;
    ui.pauseButton.textContent = "Ⅱ";
    this.updateMenuProgress();
  }

  updateHud() {
    ui.hudLevel.textContent = this.level.id;
    ui.hudBananas.textContent = String(this.bananaCount);
    ui.hudScore.textContent = String(this.score).padStart(6, "0");
    ui.hudHealth.textContent = "♥".repeat(this.health) + "♡".repeat(3 - this.health);
    ui.hudHealth.setAttribute("aria-label", `${this.health} из 3 единиц здоровья`);
  }

  showToast(message) {
    ui.toast.textContent = message;
    ui.toast.classList.add("visible");
    this.toastTimer = 2.1;
  }

  burst(x, y, color, count, speed, life, size) {
    for (let index = 0; index < count; index += 1) this.particles.push(new Particle(x, y, color, speed, life, size));
  }

  get activeProfile() {
    return CAT_PROFILES[this.activeCat];
  }

  get companionProfile() {
    return CAT_PROFILES[this.activeCat === 0 ? 1 : 0];
  }

  get playerBounds() {
    return { x: this.player.x, y: this.player.y, width: this.player.width, height: this.player.height };
  }

  draw() {
    ctx.save();
    if (this.shake > 0) {
      const amount = this.shake * 7;
      ctx.translate((Math.random() - 0.5) * amount, (Math.random() - 0.5) * amount);
    }

    if (!this.level) {
      drawBackground(ctx, "kitchen", 0, this.elapsed);
      drawPlatform(ctx, { x: -30, y: 790, width: 620, height: 170, kind: "ground" }, 0, "kitchen");
      drawCat(ctx, 145, 700, CAT_PROFILES[0], this.images[0], 1, 0, true, 1);
      drawCat(ctx, 315, 707, CAT_PROFILES[1], this.images[1], -1, 1.2, true, 1);
    } else {
      drawBackground(ctx, this.level.palette, this.cameraX, this.elapsed);
      this.drawWorld();
    }
    ctx.restore();
  }

  drawWorld() {
    for (const platform of this.level.platforms) {
      if (platform.x + platform.width < this.cameraX - 40 || platform.x > this.cameraX + VIEW_WIDTH + 40) continue;
      drawPlatform(ctx, platform, this.cameraX, this.level.palette);
    }

    for (const hazard of this.level.hazards) {
      if (hazard.x + hazard.width < this.cameraX || hazard.x > this.cameraX + VIEW_WIDTH) continue;
      drawHazard(ctx, hazard, this.cameraX, this.elapsed);
    }

    for (const collectible of this.collectibles) {
      if (collectible.collected || Math.abs(collectible.x - this.cameraX - VIEW_WIDTH / 2) > VIEW_WIDTH / 2 + 50) continue;
      ctx.save();
      ctx.translate(collectible.x - this.cameraX, collectible.y + Math.sin(this.elapsed * 4 + collectible.bob) * 6);
      drawBanana(ctx, 0, 0, 0.72);
      ctx.restore();
    }

    for (const checkpoint of this.checkpoints) this.drawCheckpoint(checkpoint);
    this.drawGoal();

    for (const enemy of this.enemies) enemy.draw(ctx, this.cameraX);
    for (const projectile of this.projectiles) projectile.draw(ctx, this.cameraX);

    const companionAlpha = this.invincible > 0 && Math.floor(this.invincible * 12) % 2 === 0 ? 0.5 : 0.9;
    drawCat(
      ctx,
      this.companion.x - this.cameraX,
      this.companion.y + Math.sin(this.companion.bounce) * 2,
      this.companionProfile,
      this.images[this.activeCat === 0 ? 1 : 0],
      this.companion.facing,
      this.companion.bounce,
        this.companionAttack > 0.62,
        companionAlpha,
        true,
        !this.player.onGround,
        0,
        0
    );

    const playerVisible = this.invincible <= 0 || Math.floor(this.invincible * 14) % 2 === 0;
    if (playerVisible) {
      drawCat(
        ctx,
        this.player.x - this.cameraX,
        this.player.y,
        this.activeProfile,
        this.images[this.activeCat],
        this.player.facing,
        this.player.runFrame,
        this.attackCooldown > 0.16,
        1,
        false,
        !this.player.onGround,
        this.player.jumpsUsed > 1 ? this.player.airSpin : 0,
        this.player.squash
      );
    }

    for (const particle of this.particles) particle.draw(ctx, this.cameraX);
    this.drawBossHealth();
  }

  drawCheckpoint(checkpoint) {
    const x = checkpoint.x - this.cameraX;
    if (x < -60 || x > VIEW_WIDTH + 60) return;
    ctx.save();
    ctx.translate(x, checkpoint.y);
    ctx.strokeStyle = checkpoint.active ? "#76d9ff" : "#8790a8";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(0, 4);
    ctx.lineTo(0, -58);
    ctx.stroke();
    ctx.fillStyle = checkpoint.active ? "#8ce1ff" : "#a3a8b5";
    ctx.beginPath();
    ctx.arc(0, -66, 15, 0, TAU);
    ctx.strokeStyle = "rgba(255,255,255,.75)";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-11, -76);
    ctx.quadraticCurveTo(0, -88, 11, -76);
    ctx.quadraticCurveTo(18, -67, 10, -55);
    ctx.quadraticCurveTo(0, -45, -11, -55);
    ctx.quadraticCurveTo(-18, -67, -11, -76);
    ctx.fill();
    ctx.restore();
  }

  drawGoal() {
    const x = this.level.goal.x - this.cameraX;
    if (x < -100 || x > VIEW_WIDTH + 100) return;
    const bossAlive = this.enemies.some((enemy) => enemy.type === "baron" && !enemy.dead);
    ctx.save();
    ctx.translate(x, this.level.goal.y);
    ctx.globalAlpha = bossAlive ? 0.42 : 1;
    ctx.fillStyle = "#423347";
    roundedRect(ctx, -33, 59, 66, 49, 9);
    ctx.fill();
    ctx.fillStyle = "#78627e";
    roundedRect(ctx, -26, 50, 52, 20, 7);
    ctx.fill();
    ctx.translate(0, 23 + Math.sin(this.elapsed * 2.4) * 5);
    ctx.scale(1.45, 1.45);
    drawBanana(ctx, 0, 0, 1);
    ctx.restore();
  }

  drawBossHealth() {
    const boss = this.enemies.find((enemy) => enemy.type === "baron" && !enemy.dead);
    if (!boss || Math.abs(boss.x - this.player.x) > 720) return;
    const width = 310;
    const x = (VIEW_WIDTH - width) / 2;
    const y = 90;
    ctx.save();
    ctx.fillStyle = "rgba(10,14,28,.82)";
    roundedRect(ctx, x - 7, y - 22, width + 14, 42, 13);
    ctx.fill();
    ctx.fillStyle = "#a2374b";
    roundedRect(ctx, x, y, width, 11, 6);
    ctx.fill();
    ctx.fillStyle = "#ffcc4d";
    roundedRect(ctx, x, y, width * (boss.health / boss.maxHealth), 11, 6);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "800 10px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("БАРОН МЫШИЛЬДО", VIEW_WIDTH / 2, y - 7);
    ctx.restore();
  }
}

function drawBackground(context, palette, cameraX, time) {
  const themes = {
    kitchen: { top: "#10192a", bottom: "#334851", far: "#243743", near: "#172731", glow: "#bce9d4" },
    pantry: { top: "#121421", bottom: "#3b3342", far: "#282638", near: "#191a29", glow: "#d9c7a3" },
    rooftop: { top: "#11172b", bottom: "#38435c", far: "#263249", near: "#172130", glow: "#d9efff" },
    fortress: { top: "#0c0f1d", bottom: "#302b40", far: "#211f32", near: "#141522", glow: "#ccbdf2" }
  };
  const theme = themes[palette] || themes.kitchen;
  const gradient = context.createLinearGradient(0, 0, 0, VIEW_HEIGHT);
  gradient.addColorStop(0, theme.top);
  gradient.addColorStop(1, theme.bottom);
  context.fillStyle = gradient;
  context.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);

  context.save();
  if (palette === "kitchen") {
    // Огромные окна превращают знакомую кухню в сумеречный сказочный зал.
    context.fillStyle = "rgba(180,225,217,.08)";
    for (let index = -1; index < 4; index += 1) {
      const x = index * 210 - (cameraX * 0.07) % 210;
      context.beginPath();
      context.moveTo(x + 18, 390);
      context.lineTo(x + 18, 176);
      context.quadraticCurveTo(x + 84, 76, x + 150, 176);
      context.lineTo(x + 150, 390);
      context.closePath();
      context.fill();
      context.strokeStyle = "rgba(191,235,226,.12)";
      context.lineWidth = 4;
      context.stroke();
    }
    drawHills(context, cameraX * 0.13, 570, theme.far, 175);
    drawHangingSilhouettes(context, cameraX * 0.18, "rgba(7,14,22,.36)");
  } else if (palette === "pantry") {
    context.fillStyle = "rgba(8,9,17,.44)";
    for (let index = -1; index < 6; index += 1) {
      const x = index * 138 - (cameraX * 0.09) % 138;
      context.fillRect(x, 175, 102, 430);
      context.fillStyle = "rgba(221,204,165,.1)";
      roundedRect(context, x + 20, 235, 60, 100, 19);
      context.fill();
      context.fillStyle = "rgba(8,9,17,.44)";
    }
    const glow = context.createRadialGradient(270, 220, 5, 270, 220, 260);
    glow.addColorStop(0, "rgba(222,205,165,.17)");
    glow.addColorStop(1, "rgba(222,205,165,0)");
    context.fillStyle = glow;
    context.fillRect(0, 0, VIEW_WIDTH, 520);
  } else if (palette === "rooftop") {
    const moonGlow = context.createRadialGradient(420, 148, 10, 420, 148, 120);
    moonGlow.addColorStop(0, "rgba(222,243,255,.34)");
    moonGlow.addColorStop(1, "rgba(222,243,255,0)");
    context.fillStyle = moonGlow;
    context.fillRect(280, 10, 260, 270);
    context.fillStyle = "rgba(222,243,255,.78)";
    context.beginPath();
    context.arc(420, 145, 46, 0, TAU);
    context.fill();
    context.fillStyle = "rgba(17,23,43,.78)";
    context.beginPath();
    context.arc(440, 128, 43, 0, TAU);
    context.fill();
    drawClouds(context, cameraX * 0.08, time);
    drawSkyline(context, cameraX * 0.13, 590, theme.far, 145);
    drawSkyline(context, cameraX * 0.24, 675, theme.near, 205);
  } else {
    context.fillStyle = "rgba(196,181,231,.08)";
    for (let index = -1; index < 5; index += 1) {
      const x = index * 190 - (cameraX * 0.09) % 190;
      context.fillRect(x, 75, 134, 570);
      context.fillStyle = "rgba(5,6,14,.47)";
      context.beginPath();
      context.arc(x + 67, 310, 40, Math.PI, 0);
      context.lineTo(x + 107, 560);
      context.lineTo(x + 27, 560);
      context.closePath();
      context.fill();
      context.fillStyle = "rgba(196,181,231,.08)";
    }
  }

  drawAmbientMotes(context, cameraX, time, theme.glow);
  drawFog(context, cameraX, time, theme.glow);
  drawForegroundSilhouettes(context, cameraX, palette);

  const vignette = context.createRadialGradient(VIEW_WIDTH / 2, VIEW_HEIGHT * 0.43, 180, VIEW_WIDTH / 2, VIEW_HEIGHT * 0.48, 570);
  vignette.addColorStop(0, "rgba(3,6,14,0)");
  vignette.addColorStop(0.72, "rgba(3,6,14,.12)");
  vignette.addColorStop(1, "rgba(3,6,14,.62)");
  context.fillStyle = vignette;
  context.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
  context.restore();
}

function drawHangingSilhouettes(context, offset, color) {
  context.strokeStyle = color;
  context.lineCap = "round";
  for (let index = -1; index < 7; index += 1) {
    const x = index * 112 - offset % 112;
    const length = 120 + (index % 3) * 44;
    context.lineWidth = 5;
    context.beginPath();
    context.moveTo(x, 0);
    context.bezierCurveTo(x + 9, length * 0.4, x - 8, length * 0.7, x + 4, length);
    context.stroke();
    context.beginPath();
    context.ellipse(x + 4, length + 15, 12, 21, 0.1, 0, TAU);
    context.fillStyle = color;
    context.fill();
  }
}

function drawAmbientMotes(context, cameraX, time, color) {
  context.save();
  context.fillStyle = color;
  for (let index = 0; index < 28; index += 1) {
    const span = VIEW_WIDTH + 100;
    const x = ((index * 83 - cameraX * 0.14 + time * (4 + index % 4)) % span + span) % span - 50;
    const y = 90 + (index * 137) % 610 + Math.sin(time * 0.8 + index) * 12;
    context.globalAlpha = 0.08 + (index % 5) * 0.035;
    context.beginPath();
    context.arc(x, y, 1 + (index % 3) * 0.8, 0, TAU);
    context.fill();
  }
  context.restore();
}

function drawFog(context, cameraX, time, color) {
  context.save();
  for (let index = -1; index < 4; index += 1) {
    const x = index * 250 - ((cameraX * 0.2 - time * 9) % 250);
    const y = 515 + (index % 2) * 92;
    const fog = context.createRadialGradient(x, y, 10, x, y, 165);
    fog.addColorStop(0, `${color}18`);
    fog.addColorStop(1, `${color}00`);
    context.fillStyle = fog;
    context.fillRect(x - 180, y - 90, 360, 180);
  }
  context.restore();
}

function drawForegroundSilhouettes(context, cameraX, palette) {
  const color = palette === "rooftop" ? "rgba(7,12,20,.46)" : "rgba(4,8,14,.56)";
  context.fillStyle = color;
  const offset = (cameraX * 0.44) % 150;
  for (let index = -1; index < 6; index += 1) {
    const x = index * 150 - offset;
    context.beginPath();
    context.moveTo(x, VIEW_HEIGHT);
    context.bezierCurveTo(x + 8, 830, x + 34, 786, x + 52, 760);
    context.bezierCurveTo(x + 45, 825, x + 78, 870, x + 94, VIEW_HEIGHT);
    context.closePath();
    context.fill();
  }
}

function drawHills(context, offset, baseY, color, height) {
  context.fillStyle = color;
  context.beginPath();
  context.moveTo(0, VIEW_HEIGHT);
  for (let index = -1; index < 5; index += 1) {
    const x = index * 210 - offset % 210;
    context.quadraticCurveTo(x + 100, baseY - height, x + 210, baseY);
  }
  context.lineTo(VIEW_WIDTH, VIEW_HEIGHT);
  context.closePath();
  context.fill();
}

function drawClouds(context, offset, time) {
  context.fillStyle = "rgba(198,220,235,.13)";
  for (let index = -1; index < 4; index += 1) {
    const x = index * 240 - (offset + time * 4) % 240;
    const y = 190 + (index % 2) * 90;
    context.beginPath();
    context.arc(x, y, 32, 0, TAU);
    context.arc(x + 37, y - 13, 43, 0, TAU);
    context.arc(x + 81, y + 2, 29, 0, TAU);
    context.fill();
  }
}

function drawSkyline(context, offset, baseY, color, height) {
  context.fillStyle = color;
  for (let index = -1; index < 10; index += 1) {
    const x = index * 82 - offset % 82;
    const buildingHeight = height * (0.55 + ((index * 37) % 40) / 100);
    context.fillRect(x, baseY - buildingHeight, 64, buildingHeight + VIEW_HEIGHT - baseY);
    context.fillStyle = "rgba(255,225,142,.35)";
    for (let row = 0; row < 3; row += 1) {
      context.fillRect(x + 13 + row * 17, baseY - buildingHeight + 24, 7, 11);
    }
    context.fillStyle = color;
  }
}

function drawPlatform(context, platform, cameraX, palette) {
  const x = platform.x - cameraX;
  const y = platform.y;
  const theme = {
    kitchen: ["#3f6360", "#17292f", "#8fb6a7", "#8ee1bd"],
    pantry: ["#544a5a", "#211f2c", "#97879d", "#c1a9cf"],
    rooftop: ["#405165", "#182631", "#839aaa", "#9edcf0"],
    fortress: ["#494455", "#1a1925", "#81798d", "#b5a7d0"]
  }[palette] || ["#46585a", "#1c272b", "#819799", "#9fc9bd"];

  const bodyGradient = context.createLinearGradient(0, y, 0, Math.min(VIEW_HEIGHT, y + platform.height));
  bodyGradient.addColorStop(0, theme[0]);
  bodyGradient.addColorStop(0.18, theme[1]);
  bodyGradient.addColorStop(1, "#0d141c");
  context.fillStyle = bodyGradient;
  roundedRect(context, x, y, platform.width, platform.height + 18, platform.kind === "ground" ? 7 : 13);
  context.fill();

  context.strokeStyle = theme[2];
  context.lineWidth = 3;
  context.beginPath();
  context.moveTo(x + 5, y + 3);
  for (let point = 0; point <= platform.width - 10; point += 22) {
    context.quadraticCurveTo(x + point + 11, y - 2 - (point % 44 === 0 ? 3 : 0), x + point + 22, y + 3);
  }
  context.stroke();

  context.strokeStyle = "rgba(6,10,17,.43)";
  context.lineWidth = 2;
  const cell = platform.kind === "ground" ? 58 : 46;
  for (let tileX = Math.floor(platform.x / cell) * cell; tileX < platform.x + platform.width; tileX += cell) {
    const screenX = tileX - cameraX;
    const depth = 35 + ((tileX / cell) % 3) * 11;
    context.beginPath();
    context.moveTo(screenX + 7, y + 15);
    context.bezierCurveTo(screenX - 2, y + depth, screenX + 16, y + depth + 17, screenX + 4, y + depth + 35);
    context.stroke();
  }

  context.fillStyle = theme[3];
  for (let sprig = 16; sprig < platform.width - 10; sprig += 64) {
    const sprigX = x + sprig;
    context.globalAlpha = 0.38;
    context.beginPath();
    context.ellipse(sprigX, y - 4, 3, 9, -0.35, 0, TAU);
    context.ellipse(sprigX + 7, y - 3, 3, 7, 0.45, 0, TAU);
    context.fill();
  }
  context.globalAlpha = 1;
}

function drawHazard(context, hazard, cameraX, time) {
  const x = hazard.x - cameraX;
  const count = Math.max(2, Math.floor(hazard.width / 24));
  const width = hazard.width / count;
  context.save();
  const glow = context.createLinearGradient(0, hazard.y - 20, 0, hazard.y + 18);
  glow.addColorStop(0, "#e8f7f5");
  glow.addColorStop(1, "#6f7687");
  context.fillStyle = glow;
  context.strokeStyle = "#272b3a";
  context.lineWidth = 2;
  for (let index = 0; index < count; index += 1) {
    context.beginPath();
    context.moveTo(x + index * width, hazard.y + 18);
    context.lineTo(x + index * width + width / 2, hazard.y - 15 - Math.sin(time * 3 + index) * 2);
    context.lineTo(x + (index + 1) * width, hazard.y + 18);
    context.closePath();
    context.fill();
    context.stroke();
  }
  context.restore();
}

function drawBanana(context, x, y, scale = 1) {
  context.save();
  context.translate(x, y);
  context.scale(scale, scale);
  context.rotate(-0.35);
  context.shadowColor = "rgba(255,220,91,.55)";
  context.shadowBlur = 10;
  context.strokeStyle = "#70501f";
  context.lineWidth = 11;
  context.lineCap = "round";
  context.beginPath();
  context.arc(0, -2, 17, 0.15, Math.PI * 0.94);
  context.stroke();
  context.strokeStyle = "#f6d96a";
  context.lineWidth = 8;
  context.beginPath();
  context.arc(0, -2, 17, 0.15, Math.PI * 0.94);
  context.stroke();
  context.fillStyle = "#63431c";
  context.beginPath();
  context.arc(17, 1, 2.8, 0, TAU);
  context.fill();
  context.shadowBlur = 0;
  context.restore();
}

function drawCat(context, x, y, profile, image, facing, frame, attacking, alpha = 1, companion = false, airborne = false, airSpin = 0, squash = 0) {
  const walk = airborne ? 0 : Math.sin(frame * 1.8) * 3;
  const bob = airborne ? -3 : Math.abs(Math.sin(frame * 0.9)) * 2;
  const scale = companion ? 0.9 : 1;
  const squashX = 1 + squash * 0.12;
  const squashY = 1 - squash * 0.1;
  context.save();
  context.globalAlpha = alpha;
  context.translate(x + 28, y + 39 + bob);
  if (airSpin) context.rotate(Math.sin(airSpin) * 0.11);
  context.scale(facing * scale * squashX, scale * squashY);

  // Хвост и тело образуют один мягкий силуэт без жёстких пиксельных граней.
  context.strokeStyle = profile.furDark;
  context.lineWidth = 9;
  context.lineCap = "round";
  context.beginPath();
  context.moveTo(-18, 18);
  context.bezierCurveTo(-43, 13, -43, -12, -33, -23);
  context.bezierCurveTo(-25, -31, -20, -24, -23, -16);
  context.stroke();

  const bodyGradient = context.createLinearGradient(0, -5, 0, 52);
  bodyGradient.addColorStop(0, profile.fur);
  bodyGradient.addColorStop(1, profile.furDark);
  context.fillStyle = bodyGradient;
  context.beginPath();
  context.moveTo(-21, 2);
  context.bezierCurveTo(-29, 17, -26, 39, -20, 49);
  context.quadraticCurveTo(-10, 45, -2, 50);
  context.quadraticCurveTo(8, 44, 21, 49);
  context.bezierCurveTo(27, 34, 30, 16, 20, 2);
  context.closePath();
  context.fill();
  context.strokeStyle = "rgba(9,16,29,.24)";
  context.lineWidth = 2;
  context.stroke();

  // Лапы слегка запаздывают относительно корпуса, делая бег живее.
  context.strokeStyle = profile.furDark;
  context.lineWidth = 11;
  context.beginPath();
  context.moveTo(-11, 34);
  context.lineTo(-14 + walk, 49);
  context.moveTo(11, 34);
  context.lineTo(14 - walk, 49);
  context.stroke();

  // Уши и наружный контур головы остаются кошачьими, а лицо вписано внутрь.
  context.fillStyle = profile.fur;
  context.beginPath();
  context.moveTo(-23, -8);
  context.lineTo(-18, -39);
  context.lineTo(-3, -24);
  context.quadraticCurveTo(0, -26, 4, -24);
  context.lineTo(18, -39);
  context.lineTo(24, -7);
  context.bezierCurveTo(26, 8, 16, 17, 0, 18);
  context.bezierCurveTo(-16, 17, -26, 8, -23, -8);
  context.closePath();
  context.fill();
  context.strokeStyle = profile.furDark;
  context.lineWidth = 3;
  context.stroke();

  context.fillStyle = "rgba(225,154,157,.72)";
  context.beginPath();
  context.moveTo(-17, -17);
  context.lineTo(-15, -33);
  context.lineTo(-7, -22);
  context.closePath();
  context.fill();
  context.beginPath();
  context.moveTo(8, -22);
  context.lineTo(15, -33);
  context.lineTo(18, -16);
  context.closePath();
  context.fill();

  // Фотография не рисуется отдельным кругом: маска повторяет лоб, щёки и подбородок.
  context.save();
  context.beginPath();
  context.moveTo(-19, -17);
  context.bezierCurveTo(-17, -28, -9, -31, 0, -31);
  context.bezierCurveTo(11, -31, 19, -25, 20, -14);
  context.bezierCurveTo(22, -1, 16, 11, 6, 15);
  context.bezierCurveTo(1, 18, -5, 17, -11, 13);
  context.bezierCurveTo(-20, 7, -22, -5, -19, -17);
  context.closePath();
  context.clip();
  context.scale(facing, 1);
  context.filter = "saturate(.72) contrast(1.08) brightness(.88)";
  context.drawImage(image, -24, -33, 48, 51);
  context.filter = "none";
  const edge = context.createRadialGradient(0, -8, 9, 0, -8, 27);
  edge.addColorStop(0.5, "rgba(0,0,0,0)");
  edge.addColorStop(0.78, `${profile.fur}22`);
  edge.addColorStop(1, profile.fur);
  context.fillStyle = edge;
  context.fillRect(-28, -36, 56, 58);
  context.restore();

  context.strokeStyle = profile.furDark;
  context.lineWidth = 2.3;
  context.beginPath();
  context.moveTo(-19, -17);
  context.bezierCurveTo(-17, -28, -9, -31, 0, -31);
  context.bezierCurveTo(11, -31, 19, -25, 20, -14);
  context.bezierCurveTo(22, -1, 16, 11, 6, 15);
  context.bezierCurveTo(1, 18, -5, 17, -11, 13);
  context.bezierCurveTo(-20, 7, -22, -5, -19, -17);
  context.stroke();

  context.strokeStyle = "rgba(235,242,239,.72)";
  context.lineWidth = 1.2;
  [-1, 4].forEach((offset) => {
    context.beginPath();
    context.moveTo(-17, offset);
    context.lineTo(-31, offset - 3);
    context.moveTo(17, offset);
    context.lineTo(31, offset - 3);
    context.stroke();
  });

  context.strokeStyle = profile.scarf;
  context.lineWidth = 6;
  context.beginPath();
  context.arc(0, 9, 19, 0.18, Math.PI - 0.18);
  context.stroke();

  context.strokeStyle = profile.furDark;
  context.lineWidth = 9;
  context.beginPath();
  context.moveTo(17, 12);
  context.lineTo(attacking ? 38 : 28, attacking ? -3 : 24);
  context.stroke();
  context.save();
  context.translate(attacking ? 42 : 31, attacking ? -8 : 20);
  context.rotate(attacking ? -0.7 : 0.4);
  drawBanana(context, 0, 0, 0.72);
  context.restore();

  context.restore();
}

function drawMouse(context, x, y, enemy, time) {
  const boss = enemy.type === "baron";
  const scale = boss ? 1.55 : 1;
  const flash = enemy.flash > 0;
  context.save();
  context.translate(x + enemy.width / 2, y + enemy.height / 2);
  context.scale(enemy.direction * scale, scale);
  context.translate(0, Math.sin(time * 9) * (enemy.onGround ? 1.5 : 0));

  context.strokeStyle = "#b49183";
  context.lineWidth = boss ? 5 : 4;
  context.lineCap = "round";
  context.beginPath();
  context.moveTo(-17, 8);
  context.quadraticCurveTo(-33, 11, -35, -4);
  context.quadraticCurveTo(-36, -12, -42, -8);
  context.stroke();

  context.fillStyle = flash ? "#fff" : boss ? "#725969" : "#8a7372";
  context.beginPath();
  context.ellipse(0, 6, 22, 17, 0, 0, TAU);
  context.fill();
  context.beginPath();
  context.arc(15, -4, 14, 0, TAU);
  context.fill();

  context.fillStyle = "#d3a6a9";
  context.beginPath();
  context.arc(8, -15, 8, 0, TAU);
  context.fill();
  context.fillStyle = "#593e4a";
  context.beginPath();
  context.arc(18, -6, 2.5, 0, TAU);
  context.fill();
  context.fillStyle = "#f4c4ca";
  context.beginPath();
  context.arc(29, 0, 4, 0, TAU);
  context.fill();

  context.strokeStyle = "rgba(255,255,255,.75)";
  context.lineWidth = 1.5;
  [-4, 2, 8].forEach((offset) => {
    context.beginPath();
    context.moveTo(25, offset);
    context.lineTo(40, offset - 2);
    context.stroke();
  });

  if (enemy.type === "armored" || boss) {
    context.fillStyle = boss ? "#d5ae3b" : "#74859d";
    context.beginPath();
    context.arc(12, -8, 16, Math.PI, TAU);
    context.lineTo(28, -7);
    context.lineTo(-4, -7);
    context.closePath();
    context.fill();
    context.fillStyle = boss ? "#ef5964" : "#a7b7ca";
    context.fillRect(-6, -10, 35, 4);
  }

  if (boss) {
    context.fillStyle = "#ffd75a";
    context.beginPath();
    context.moveTo(-4, -24);
    context.lineTo(2, -39);
    context.lineTo(10, -27);
    context.lineTo(19, -40);
    context.lineTo(25, -24);
    context.closePath();
    context.fill();
  }
  context.restore();
}

const levelErrors = validateLevels();
if (levelErrors.length) {
  console.error("Level validation failed", levelErrors);
  ui.startButton.disabled = true;
  ui.startButton.querySelector("span").textContent = "Ошибка уровней";
}

let game;
Promise.all(CAT_PROFILES.map((profile) => loadImage(profile.image)))
  .then((images) => {
    game = new Game(images);
  })
  .catch(() => {
    ui.startButton.disabled = true;
    ui.startButton.querySelector("span").textContent = "Не удалось загрузить героев";
  });

if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
}
