class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.w = TILE * 0.75;
        this.h = TILE * 0.9;
        this.vx = 0;
        this.vy = 0;
        this.onGround = false;
        this.facingRight = true;
        this.frame = 0;
        this.dead = false;
        this.won = false;
        this.jumpHeld = false;
        this.jumpTimer = 0;
        this.invincible = 0;
    }

    update(input, level) {
        if (this.dead || this.won) return;

        const accel = 0.5;
        const friction = 0.85;
        const maxSpeed = 5;
        const jumpForce = -10;
        const runMaxSpeed = 7;

        const running = input.isDown('ShiftLeft') || input.isDown('ShiftRight');
        const currentMax = running ? runMaxSpeed : maxSpeed;

        if (input.isDown('ArrowLeft') || input.isDown('KeyA')) {
            this.vx -= accel;
            this.facingRight = false;
        } else if (input.isDown('ArrowRight') || input.isDown('KeyD')) {
            this.vx += accel;
            this.facingRight = true;
        } else {
            this.vx *= friction;
        }

        if (Math.abs(this.vx) < 0.1) this.vx = 0;
        this.vx = Math.max(-currentMax, Math.min(currentMax, this.vx));

        const jumpPressed = input.isDown('ArrowUp') || input.isDown('KeyW') || input.isDown('Space');

        if (jumpPressed && this.onGround && !this.jumpHeld) {
            this.vy = jumpForce;
            this.onGround = false;
            this.jumpHeld = true;
            this.jumpTimer = 12;
        }

        if (jumpPressed && this.jumpTimer > 0) {
            this.vy -= 0.8;
            this.jumpTimer--;
        }

        if (!jumpPressed) {
            this.jumpHeld = false;
            this.jumpTimer = 0;
        }

        this.vy += GRAVITY;
        if (this.vy > MAX_FALL) this.vy = MAX_FALL;

        this.moveAndCollide(level);

        if (this.vx !== 0 && this.onGround) {
            this.frame++;
        }

        if (this.invincible > 0) this.invincible--;

        if (this.y > LEVEL_HEIGHT * TILE + 100) {
            this.dead = true;
        }
    }

    moveAndCollide(level) {
        this.x += this.vx;
        this.resolveHorizontal(level);
        this.y += this.vy;
        this.resolveVertical(level);
    }

    resolveHorizontal(level) {
        const left = Math.floor(this.x / TILE);
        const right = Math.floor((this.x + this.w - 1) / TILE);
        const top = Math.floor(this.y / TILE);
        const bottom = Math.floor((this.y + this.h - 1) / TILE);

        for (let gx = left; gx <= right; gx++) {
            for (let gy = top; gy <= bottom; gy++) {
                if (level.isSolid(gx, gy)) {
                    if (this.vx > 0) {
                        this.x = gx * TILE - this.w;
                        this.vx = 0;
                    } else if (this.vx < 0) {
                        this.x = (gx + 1) * TILE;
                        this.vx = 0;
                    }
                }
            }
        }

        if (this.x < 0) { this.x = 0; this.vx = 0; }
    }

    resolveVertical(level) {
        const left = Math.floor(this.x / TILE);
        const right = Math.floor((this.x + this.w - 1) / TILE);
        const top = Math.floor(this.y / TILE);
        const bottom = Math.floor((this.y + this.h - 1) / TILE);

        this.onGround = false;

        for (let gx = left; gx <= right; gx++) {
            for (let gy = top; gy <= bottom; gy++) {
                if (level.isSolid(gx, gy)) {
                    if (this.vy > 0) {
                        this.y = gy * TILE - this.h;
                        this.vy = 0;
                        this.onGround = true;
                    } else if (this.vy < 0) {
                        this.y = (gy + 1) * TILE;
                        this.vy = 0;
                    }
                }
            }
        }
    }

    draw(ctx, cam) {
        if (this.dead) return;
        if (this.invincible > 0 && Math.floor(this.invincible / 3) % 2 === 0) return;

        const s = cam.worldToScreen(this.x, this.y);
        Sprites.drawPlayer(ctx, s.x, s.y, this.w, this.h, this.frame,
            this.facingRight, !this.onGround);
    }

    getBounds() {
        return { x: this.x, y: this.y, w: this.w, h: this.h };
    }
}

class Enemy {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.w = TILE * 0.8;
        this.h = TILE * 0.8;
        this.vx = type === 'koopa' ? -1.5 : -1;
        this.vy = 0;
        this.alive = true;
        this.frame = 0;
        this.facingLeft = true;
        this.squishTimer = 0;
    }

    update(level) {
        if (!this.alive) {
            this.squishTimer--;
            return this.squishTimer > 0;
        }

        this.frame++;
        this.x += this.vx;
        this.vy += GRAVITY;
        if (this.vy > MAX_FALL) this.vy = MAX_FALL;
        this.y += this.vy;

        const left = Math.floor(this.x / TILE);
        const right = Math.floor((this.x + this.w - 1) / TILE);
        const top = Math.floor(this.y / TILE);
        const bottom = Math.floor((this.y + this.h - 1) / TILE);

        for (let gx = left; gx <= right; gx++) {
            for (let gy = top; gy <= bottom; gy++) {
                if (level.isSolid(gx, gy)) {
                    if (this.vy > 0) {
                        this.y = gy * TILE - this.h;
                        this.vy = 0;
                    }
                }
            }
        }

        const nextGx = Math.floor((this.x + (this.vx > 0 ? this.w : 0)) / TILE);
        const feetGy = Math.floor((this.y + this.h) / TILE);
        if (level.isSolid(nextGx, Math.floor((this.y + this.h / 2) / TILE))) {
            this.vx *= -1;
            this.facingLeft = this.vx < 0;
        }

        const aheadGx = Math.floor((this.x + this.w / 2 + (this.vx > 0 ? this.w / 2 + 2 : -this.w / 2 - 2)) / TILE);
        if (!level.isSolid(aheadGx, feetGy) && this.y + this.h >= (feetGy - 1) * TILE) {
            const belowGy = feetGy;
            if (!level.isSolid(aheadGx, belowGy)) {
                this.vx *= -1;
                this.facingLeft = this.vx < 0;
            }
        }

        if (this.y > LEVEL_HEIGHT * TILE + 100) return false;

        return true;
    }

    squish() {
        this.alive = false;
        this.squishTimer = 15;
    }

    draw(ctx, cam) {
        const s = cam.worldToScreen(this.x, this.y);
        if (!this.alive) {
            ctx.globalAlpha = this.squishTimer / 15;
            ctx.save();
            ctx.translate(s.x, s.y + this.h * 0.6);
            ctx.scale(1, 0.3);
            if (this.type === 'goomba') {
                Sprites.drawGoomba(ctx, 0, 0, TILE, this.frame);
            } else {
                Sprites.drawKoopa(ctx, 0, 0, TILE, this.frame, this.facingLeft);
            }
            ctx.restore();
            ctx.globalAlpha = 1;
            return;
        }

        if (this.type === 'goomba') {
            Sprites.drawGoomba(ctx, s.x, s.y, TILE, this.frame);
        } else if (this.type === 'koopa') {
            Sprites.drawKoopa(ctx, s.x, s.y, TILE, this.frame, this.facingLeft);
        }
    }

    getBounds() {
        return { x: this.x, y: this.y, w: this.w, h: this.h };
    }
}

class CoinEntity {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.collected = false;
        this.frame = 0;
    }

    update() {
        this.frame++;
        return !this.collected;
    }

    draw(ctx, cam) {
        if (this.collected) return;
        const s = cam.worldToScreen(this.x, this.y);
        Sprites.drawCoin(ctx, s.x, s.y, TILE, this.frame);
    }

    getBounds() {
        return { x: this.x + 8, y: this.y + 4, w: TILE - 16, h: TILE - 8 };
    }
}

class FloatingText {
    constructor(x, y, text, color = '#fff') {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
        this.life = 40;
    }

    update() {
        this.y -= 1.5;
        this.life--;
        return this.life > 0;
    }

    draw(ctx, cam) {
        const s = cam.worldToScreen(this.x, this.y);
        ctx.globalAlpha = this.life / 40;
        ctx.fillStyle = this.color;
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(this.text, s.x, s.y);
        ctx.textAlign = 'start';
        ctx.globalAlpha = 1;
    }
}

class GamePlay {
    constructor(canvas, ctx, level, camera, input, particles) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.level = level.clone();
        this.camera = camera;
        this.input = input;
        this.particles = particles;
        this.frame = 0;
        this.coins = 0;
        this.lives = 3;
        this.timeLeft = 300;
        this.timeAccum = 0;
        this.state = 'playing';
        this.stateTimer = 0;
        this.floatingTexts = [];

        this.player = new Player(this.level.spawnX, this.level.spawnY);
        this.enemies = [];
        this.coinEntities = [];
        this.flagX = -1;
        this.flagY = -1;
        this.spikePositions = [];

        this.initEntities();
    }

    initEntities() {
        for (const [key, type] of Object.entries(this.level.tiles)) {
            const [gx, gy] = key.split(',').map(Number);
            if (type === 'goomba' || type === 'koopa') {
                this.enemies.push(new Enemy(gx * TILE, gy * TILE, type));
                delete this.level.tiles[key];
            } else if (type === 'coin') {
                this.coinEntities.push(new CoinEntity(gx * TILE, gy * TILE));
                delete this.level.tiles[key];
            } else if (type === 'flag') {
                this.flagX = gx * TILE;
                this.flagY = gy * TILE;
            } else if (type === 'spike') {
                this.spikePositions.push({ x: gx * TILE, y: gy * TILE });
            } else if (type === 'spawn') {
                delete this.level.tiles[key];
            }
        }
    }

    update() {
        this.frame++;

        if (this.state === 'dead') {
            this.stateTimer--;
            if (this.stateTimer <= 0) {
                this.lives--;
                if (this.lives <= 0) {
                    this.state = 'gameover';
                    this.stateTimer = 120;
                } else {
                    this.respawn();
                }
            }
            this.updateHUD();
            return;
        }

        if (this.state === 'gameover' || this.state === 'win') {
            this.stateTimer--;
            if (this.stateTimer <= 0) {
                return 'edit';
            }
            this.updateHUD();
            return;
        }

        this.timeAccum++;
        if (this.timeAccum >= 60) {
            this.timeAccum = 0;
            this.timeLeft--;
            if (this.timeLeft <= 0) {
                this.playerDie();
            }
        }

        this.player.update(this.input, this.level);

        this.camera.follow(this.player.x, this.player.y);

        this.enemies = this.enemies.filter(e => e.update(this.level));

        this.coinEntities = this.coinEntities.filter(c => c.update());

        this.checkCollisions();

        this.floatingTexts = this.floatingTexts.filter(t => t.update());

        this.particles.update();

        if (this.player.dead && this.state === 'playing') {
            this.playerDie();
        }

        this.updateHUD();
    }

    checkCollisions() {
        if (this.player.dead || this.player.invincible > 0) return;

        const pb = this.player.getBounds();

        for (const coin of this.coinEntities) {
            if (coin.collected) continue;
            const cb = coin.getBounds();
            if (this.aabb(pb, cb)) {
                coin.collected = true;
                this.coins++;
                this.particles.coinBurst(coin.x + TILE / 2, coin.y + TILE / 2);
                this.floatingTexts.push(new FloatingText(
                    coin.x + TILE / 2, coin.y, '+1', '#ffd700'));
            }
        }

        for (const enemy of this.enemies) {
            if (!enemy.alive) continue;
            const eb = enemy.getBounds();
            if (this.aabb(pb, eb)) {
                if (this.player.vy > 0 && pb.y + pb.h - 8 < eb.y + eb.h / 2) {
                    if (enemy.type !== 'spike') {
                        enemy.squish();
                        this.player.vy = -8;
                        this.particles.enemyPoof(enemy.x + TILE / 2, enemy.y + TILE / 2);
                        this.floatingTexts.push(new FloatingText(
                            enemy.x + TILE / 2, enemy.y, '100', '#fff'));
                    } else {
                        this.playerDie();
                    }
                } else {
                    this.playerDie();
                }
            }
        }

        for (const spike of this.spikePositions) {
            const sb = { x: spike.x + 4, y: spike.y + 4, w: TILE - 8, h: TILE - 8 };
            if (this.aabb(pb, sb)) {
                this.playerDie();
            }
        }

        if (this.flagX >= 0) {
            const fb = { x: this.flagX, y: this.flagY, w: TILE, h: TILE };
            if (this.aabb(pb, fb)) {
                this.state = 'win';
                this.stateTimer = 120;
                this.player.won = true;
            }
        }
    }

    aabb(a, b) {
        return a.x < b.x + b.w && a.x + a.w > b.x &&
               a.y < b.y + b.h && a.y + a.h > b.y;
    }

    playerDie() {
        this.player.dead = true;
        this.state = 'dead';
        this.stateTimer = 60;
        this.particles.emit(this.player.x + this.player.w / 2,
            this.player.y + this.player.h / 2, 15, '#e94560', 5, 4, 40);
    }

    respawn() {
        this.player = new Player(this.level.spawnX, this.level.spawnY);
        this.player.invincible = 60;
        this.state = 'playing';
    }

    updateHUD() {
        document.getElementById('hud-coins').textContent = this.coins;
        document.getElementById('hud-lives').textContent = this.lives;
        document.getElementById('hud-time').textContent = Math.max(0, this.timeLeft);
    }

    draw() {
        const { ctx, canvas, camera } = this;
        Sprites.drawBackground(ctx, canvas.width, canvas.height, camera.x, this.frame);

        const startGx = Math.floor(camera.x / TILE);
        const endGx = Math.ceil((camera.x + canvas.width) / TILE);
        const startGy = Math.floor(camera.y / TILE);
        const endGy = Math.ceil((camera.y + canvas.height) / TILE);

        for (let gx = startGx; gx <= endGx; gx++) {
            for (let gy = startGy; gy <= endGy; gy++) {
                const tile = this.level.getTile(gx, gy);
                if (tile) {
                    const screen = camera.worldToScreen(gx * TILE, gy * TILE);
                    Sprites.draw(tile, ctx, screen.x, screen.y, TILE, this.frame);
                }
            }
        }

        this.coinEntities.forEach(c => c.draw(ctx, camera));
        this.enemies.forEach(e => e.draw(ctx, camera));
        this.player.draw(ctx, camera);
        this.floatingTexts.forEach(t => t.draw(ctx, camera));
        this.particles.draw(ctx, camera);

        if (this.state === 'gameover') {
            showOverlay('GAME OVER');
        } else if (this.state === 'win') {
            showOverlay('LEVEL CLEAR!');
        } else if (this.state === 'dead') {
            showOverlay('OOPS!');
        } else {
            hideOverlay();
        }
    }
}
