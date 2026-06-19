class Editor {
    constructor(canvas, ctx, level, camera, input, particles) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.level = level;
        this.camera = camera;
        this.input = input;
        this.particles = particles;
        this.selectedTool = 'ground';
        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.lastPlacedGx = -1;
        this.lastPlacedGy = -1;
        this.frame = 0;

        this.setupToolButtons();
    }

    setupToolButtons() {
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                this.selectedTool = btn.dataset.tool;
            });
        });
    }

    update() {
        this.frame++;

        if (this.input.mouseDown && this.input.mouseButton === 1) {
            if (!this.isDragging) {
                this.isDragging = true;
                this.dragStartX = this.input.mouseX;
                this.dragStartY = this.input.mouseY;
            } else {
                const dx = this.input.mouseX - this.dragStartX;
                const dy = this.input.mouseY - this.dragStartY;
                this.camera.setPosition(this.camera.x - dx, this.camera.y - dy);
                this.dragStartX = this.input.mouseX;
                this.dragStartY = this.input.mouseY;
            }
        } else {
            this.isDragging = false;
        }

        if (this.input.mouseDown && this.input.mouseButton === 0 && !this.isDragging) {
            const world = this.camera.screenToWorld(this.input.mouseX, this.input.mouseY);
            const gx = Math.floor(world.x / TILE);
            const gy = Math.floor(world.y / TILE);

            if (gx !== this.lastPlacedGx || gy !== this.lastPlacedGy) {
                if (this.selectedTool === 'eraser') {
                    this.level.removeTile(gx, gy);
                } else {
                    this.level.setTile(gx, gy, this.selectedTool);
                }
                this.lastPlacedGx = gx;
                this.lastPlacedGy = gy;
            }
        }

        if (this.input.mouseDown && this.input.mouseButton === 2) {
            const world = this.camera.screenToWorld(this.input.mouseX, this.input.mouseY);
            const gx = Math.floor(world.x / TILE);
            const gy = Math.floor(world.y / TILE);
            this.level.removeTile(gx, gy);
        }

        if (!this.input.mouseDown) {
            this.lastPlacedGx = -1;
            this.lastPlacedGy = -1;
        }

        if (this.input.isDown('KeyA') || this.input.isDown('ArrowLeft')) {
            this.camera.setPosition(this.camera.x - 8, this.camera.y);
        }
        if (this.input.isDown('KeyD') || this.input.isDown('ArrowRight')) {
            this.camera.setPosition(this.camera.x + 8, this.camera.y);
        }
        if (this.input.isDown('KeyW') || this.input.isDown('ArrowUp')) {
            this.camera.setPosition(this.camera.x, this.camera.y - 8);
        }
        if (this.input.isDown('KeyS') || this.input.isDown('ArrowDown')) {
            this.camera.setPosition(this.camera.x, this.camera.y + 8);
        }

        this.particles.update();
    }

    draw() {
        const { ctx, canvas, camera } = this;
        Sprites.drawBackground(ctx, canvas.width, canvas.height, camera.x, this.frame);
        Sprites.drawGrid(ctx, canvas.width, canvas.height, TILE, camera.x, camera.y);

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

        const world = camera.screenToWorld(this.input.mouseX, this.input.mouseY);
        const hoverGx = Math.floor(world.x / TILE);
        const hoverGy = Math.floor(world.y / TILE);
        const hoverScreen = camera.worldToScreen(hoverGx * TILE, hoverGy * TILE);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.strokeRect(hoverScreen.x, hoverScreen.y, TILE, TILE);

        if (this.selectedTool !== 'eraser') {
            ctx.globalAlpha = 0.5;
            Sprites.draw(this.selectedTool, ctx, hoverScreen.x, hoverScreen.y, TILE, this.frame);
            ctx.globalAlpha = 1;
        }

        this.particles.draw(ctx, camera);

        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(0, 0, 180, 24);
        ctx.fillStyle = '#fff';
        ctx.font = '12px monospace';
        ctx.fillText(`Grid: ${hoverGx}, ${hoverGy}  Tool: ${this.selectedTool}`, 8, 16);
    }
}
