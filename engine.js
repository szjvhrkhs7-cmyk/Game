const TILE = 32;
const GRAVITY = 0.6;
const MAX_FALL = 12;

const LEVEL_WIDTH = 200;
const LEVEL_HEIGHT = 15;

const SOLID_TILES = new Set(['ground', 'brick', 'question', 'stone', 'pipe_top', 'pipe_body']);

class Level {
    constructor() {
        this.tiles = {};
        this.entities = [];
        this.spawnX = 2 * TILE;
        this.spawnY = (LEVEL_HEIGHT - 3) * TILE;
    }

    setTile(gx, gy, type) {
        if (gx < 0 || gx >= LEVEL_WIDTH || gy < 0 || gy >= LEVEL_HEIGHT) return;
        const key = `${gx},${gy}`;
        if (type === 'spawn') {
            this.spawnX = gx * TILE;
            this.spawnY = gy * TILE;
            this.tiles[key] = type;
        } else if (type === 'coin' || type === 'goomba' || type === 'koopa' || type === 'spike' || type === 'flag') {
            this.tiles[key] = type;
        } else if (type) {
            this.tiles[key] = type;
        }
    }

    removeTile(gx, gy) {
        delete this.tiles[`${gx},${gy}`];
    }

    getTile(gx, gy) {
        return this.tiles[`${gx},${gy}`] || null;
    }

    isSolid(gx, gy) {
        const t = this.getTile(gx, gy);
        return t && SOLID_TILES.has(t);
    }

    serialize() {
        return JSON.stringify({
            tiles: this.tiles,
            spawnX: this.spawnX,
            spawnY: this.spawnY
        });
    }

    deserialize(json) {
        try {
            const data = JSON.parse(json);
            this.tiles = data.tiles || {};
            this.spawnX = data.spawnX ?? 2 * TILE;
            this.spawnY = data.spawnY ?? (LEVEL_HEIGHT - 3) * TILE;
            return true;
        } catch {
            return false;
        }
    }

    clone() {
        const l = new Level();
        l.tiles = { ...this.tiles };
        l.spawnX = this.spawnX;
        l.spawnY = this.spawnY;
        return l;
    }
}

class Camera {
    constructor(canvasWidth, canvasHeight) {
        this.x = 0;
        this.y = 0;
        this.w = canvasWidth;
        this.h = canvasHeight;
    }

    follow(targetX, targetY) {
        const targetCamX = targetX - this.w / 3;
        const targetCamY = targetY - this.h / 2;
        this.x += (targetCamX - this.x) * 0.1;
        this.y += (targetCamY - this.y) * 0.1;
        this.x = Math.max(0, Math.min(this.x, LEVEL_WIDTH * TILE - this.w));
        this.y = Math.max(0, Math.min(this.y, LEVEL_HEIGHT * TILE - this.h));
    }

    setPosition(x, y) {
        this.x = Math.max(0, Math.min(x, LEVEL_WIDTH * TILE - this.w));
        this.y = Math.max(0, Math.min(y, LEVEL_HEIGHT * TILE - this.h));
    }

    screenToWorld(sx, sy) {
        return { x: sx + this.x, y: sy + this.y };
    }

    worldToScreen(wx, wy) {
        return { x: wx - this.x, y: wy - this.y };
    }

    isVisible(wx, wy, ww, wh) {
        return wx + ww > this.x && wx < this.x + this.w &&
               wy + wh > this.y && wy < this.y + this.h;
    }
}

class Particle {
    constructor(x, y, vx, vy, life, color, size) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.life = life;
        this.maxLife = life;
        this.color = color;
        this.size = size;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.15;
        this.life--;
        return this.life > 0;
    }

    draw(ctx, cam) {
        const alpha = this.life / this.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        const s = cam.worldToScreen(this.x, this.y);
        ctx.fillRect(s.x, s.y, this.size, this.size);
        ctx.globalAlpha = 1;
    }
}

class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    emit(x, y, count, color, speed = 3, size = 4, life = 30) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const spd = Math.random() * speed;
            this.particles.push(new Particle(
                x, y,
                Math.cos(angle) * spd,
                Math.sin(angle) * spd - 2,
                life + Math.random() * 10,
                color,
                size * (0.5 + Math.random() * 0.5)
            ));
        }
    }

    coinBurst(x, y) {
        this.emit(x, y, 8, '#ffd700', 4, 3, 25);
        this.emit(x, y, 4, '#fff4a0', 2, 2, 15);
    }

    brickBreak(x, y) {
        this.emit(x, y, 12, '#c84c09', 5, 5, 40);
        this.emit(x, y, 6, '#e09050', 3, 3, 30);
    }

    enemyPoof(x, y) {
        this.emit(x, y, 10, '#fff', 3, 4, 20);
    }

    update() {
        this.particles = this.particles.filter(p => p.update());
    }

    draw(ctx, cam) {
        this.particles.forEach(p => p.draw(ctx, cam));
    }
}

class InputManager {
    constructor() {
        this.keys = {};
        this.justPressed = {};
        this.mouseX = 0;
        this.mouseY = 0;
        this.mouseDown = false;
        this.mouseButton = 0;
        this.mouseJustDown = false;
        this.isTouchDevice = false;
        this.activeTouches = {};

        window.addEventListener('keydown', e => {
            if (!this.keys[e.code]) this.justPressed[e.code] = true;
            this.keys[e.code] = true;
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
                e.preventDefault();
            }
        });
        window.addEventListener('keyup', e => {
            this.keys[e.code] = false;
        });

        this.detectTouch();
    }

    detectTouch() {
        const check = () => {
            this.isTouchDevice = true;
            this.setupTouchButtons();
            window.removeEventListener('touchstart', check);
        };
        window.addEventListener('touchstart', check, { once: true });

        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
            this.isTouchDevice = true;
            this.setupTouchButtons();
        }
    }

    setupTouchButtons() {
        document.querySelectorAll('.touch-btn[data-key]').forEach(btn => {
            const key = btn.dataset.key;

            btn.addEventListener('touchstart', e => {
                e.preventDefault();
                this.keys[key] = true;
                this.justPressed[key] = true;
                btn.classList.add('pressed');
            }, { passive: false });

            btn.addEventListener('touchend', e => {
                e.preventDefault();
                this.keys[key] = false;
                btn.classList.remove('pressed');
            }, { passive: false });

            btn.addEventListener('touchcancel', e => {
                this.keys[key] = false;
                btn.classList.remove('pressed');
            });
        });
    }

    attachCanvas(canvas) {
        this.canvas = canvas;

        canvas.addEventListener('mousemove', e => {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            this.mouseX = (e.clientX - rect.left) * scaleX;
            this.mouseY = (e.clientY - rect.top) * scaleY;
        });
        canvas.addEventListener('mousedown', e => {
            this.mouseDown = true;
            this.mouseButton = e.button;
            this.mouseJustDown = true;
            e.preventDefault();
        });
        canvas.addEventListener('mouseup', () => {
            this.mouseDown = false;
        });
        canvas.addEventListener('contextmenu', e => e.preventDefault());

        canvas.addEventListener('touchstart', e => {
            e.preventDefault();
            const touch = e.changedTouches[0];
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            this.mouseX = (touch.clientX - rect.left) * scaleX;
            this.mouseY = (touch.clientY - rect.top) * scaleY;
            this.mouseDown = true;
            this.mouseButton = 0;
            this.mouseJustDown = true;
        }, { passive: false });

        canvas.addEventListener('touchmove', e => {
            e.preventDefault();
            const touch = e.changedTouches[0];
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            this.mouseX = (touch.clientX - rect.left) * scaleX;
            this.mouseY = (touch.clientY - rect.top) * scaleY;
        }, { passive: false });

        canvas.addEventListener('touchend', e => {
            e.preventDefault();
            this.mouseDown = false;
        }, { passive: false });
    }

    showTouchControls(mode) {
        const playControls = document.getElementById('touch-controls');
        if (this.isTouchDevice && mode === 'play') {
            playControls.classList.add('active');
        } else {
            playControls.classList.remove('active');
        }
    }

    isDown(code) {
        return !!this.keys[code];
    }

    wasPressed(code) {
        return !!this.justPressed[code];
    }

    endFrame() {
        this.justPressed = {};
        this.mouseJustDown = false;
    }
}
