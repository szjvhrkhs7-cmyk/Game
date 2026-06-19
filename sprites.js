const Sprites = {
    TILE_SIZE: 32,

    drawGround(ctx, x, y, size) {
        ctx.fillStyle = '#c84c09';
        ctx.fillRect(x, y, size, size);
        ctx.fillStyle = '#e09050';
        ctx.fillRect(x + 2, y + 2, size - 4, size / 2 - 2);
        ctx.fillStyle = '#a03800';
        ctx.fillRect(x, y + size / 2, size, 2);
        for (let i = 0; i < 3; i++) {
            ctx.fillRect(x + i * (size / 3), y + size - 4, size / 3 - 1, 4);
        }
    },

    drawBrick(ctx, x, y, size) {
        ctx.fillStyle = '#c84c09';
        ctx.fillRect(x, y, size, size);
        ctx.fillStyle = '#e09050';
        ctx.fillRect(x + 1, y + 1, size - 2, size - 2);
        ctx.strokeStyle = '#8b3000';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 1, y + 1, size - 2, size - 2);
        ctx.fillStyle = '#c84c09';
        ctx.fillRect(x + size / 2 - 1, y, 2, size);
        ctx.fillRect(x, y + size / 2 - 1, size, 2);
        ctx.fillRect(x + size / 4, y + size / 4 - 1, size / 4, 2);
    },

    drawQuestion(ctx, x, y, size, frame = 0) {
        ctx.fillStyle = '#e8a010';
        ctx.fillRect(x, y, size, size);
        ctx.fillStyle = '#ffd040';
        ctx.fillRect(x + 2, y + 2, size - 4, size - 4);
        ctx.strokeStyle = '#c08000';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 1, y + 1, size - 2, size - 2);
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${size * 0.6}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const bounce = Math.sin(frame * 0.1) * 2;
        ctx.fillText('?', x + size / 2, y + size / 2 + bounce);
        ctx.fillStyle = '#c08000';
        ctx.fillText('?', x + size / 2 + 1, y + size / 2 + 1 + bounce);
        ctx.textAlign = 'start';
    },

    drawStone(ctx, x, y, size) {
        ctx.fillStyle = '#888';
        ctx.fillRect(x, y, size, size);
        ctx.fillStyle = '#aaa';
        ctx.fillRect(x + 2, y + 2, size - 4, size - 4);
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 1, y + 1, size - 2, size - 2);
        ctx.fillStyle = '#999';
        ctx.fillRect(x + size / 3, y + size / 3, size / 3, size / 3);
    },

    drawPipeTop(ctx, x, y, size) {
        ctx.fillStyle = '#1a8a1a';
        ctx.fillRect(x - 2, y, size + 4, size);
        ctx.fillStyle = '#2ecc40';
        ctx.fillRect(x, y + 2, size - 4, size - 4);
        ctx.fillStyle = '#4dff4d';
        ctx.fillRect(x + 2, y + 2, 4, size - 4);
        ctx.strokeStyle = '#0d5e0d';
        ctx.lineWidth = 2;
        ctx.strokeRect(x - 2, y, size + 4, size);
    },

    drawPipeBody(ctx, x, y, size) {
        ctx.fillStyle = '#1a8a1a';
        ctx.fillRect(x, y, size, size);
        ctx.fillStyle = '#2ecc40';
        ctx.fillRect(x + 2, y, size - 6, size);
        ctx.fillStyle = '#4dff4d';
        ctx.fillRect(x + 4, y, 4, size);
        ctx.strokeStyle = '#0d5e0d';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + size);
        ctx.moveTo(x + size, y);
        ctx.lineTo(x + size, y + size);
        ctx.stroke();
    },

    drawCoin(ctx, x, y, size, frame = 0) {
        const stretch = Math.abs(Math.cos(frame * 0.08));
        const w = size * 0.5 * Math.max(0.2, stretch);
        const h = size * 0.6;
        const cx = x + size / 2;
        const cy = y + size / 2;
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.ellipse(cx, cy, w, h / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#b8960f';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        if (stretch > 0.3) {
            ctx.fillStyle = '#fff4a0';
            ctx.beginPath();
            ctx.ellipse(cx - w * 0.2, cy, w * 0.3, h * 0.3, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    },

    drawSpawn(ctx, x, y, size) {
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(x + 2, y + 2, size - 4, size - 4);
        ctx.setLineDash([]);
        ctx.fillStyle = '#00ff88';
        ctx.font = `bold ${size * 0.4}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('S', x + size / 2, y + size / 2);
        ctx.textAlign = 'start';
    },

    drawFlag(ctx, x, y, size) {
        ctx.fillStyle = '#888';
        ctx.fillRect(x + size / 2 - 2, y, 4, size);
        ctx.fillStyle = '#e94560';
        ctx.beginPath();
        ctx.moveTo(x + size / 2 + 2, y + 2);
        ctx.lineTo(x + size - 2, y + size / 4);
        ctx.lineTo(x + size / 2 + 2, y + size / 2 - 2);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(x + size / 2, y, 4, 0, Math.PI * 2);
        ctx.fill();
    },

    drawGoomba(ctx, x, y, size, frame = 0) {
        const step = Math.floor(frame / 10) % 2;
        ctx.fillStyle = '#8b4513';
        ctx.beginPath();
        ctx.ellipse(x + size / 2, y + size * 0.35, size * 0.45, size * 0.35, 0, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = '#d2691e';
        ctx.beginPath();
        ctx.ellipse(x + size / 2, y + size * 0.55, size * 0.38, size * 0.28, 0, 0, Math.PI);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(x + size * 0.35, y + size * 0.35, 4, 0, Math.PI * 2);
        ctx.arc(x + size * 0.65, y + size * 0.35, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(x + size * 0.35 + 1, y + size * 0.36, 2, 0, Math.PI * 2);
        ctx.arc(x + size * 0.65 - 1, y + size * 0.36, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#6b3410';
        const footOffset = step === 0 ? 2 : -2;
        ctx.fillRect(x + size * 0.15 + footOffset, y + size * 0.75, size * 0.25, size * 0.25);
        ctx.fillRect(x + size * 0.6 - footOffset, y + size * 0.75, size * 0.25, size * 0.25);
    },

    drawKoopa(ctx, x, y, size, frame = 0, facingLeft = true) {
        const step = Math.floor(frame / 12) % 2;
        const dir = facingLeft ? 1 : -1;
        ctx.fillStyle = '#2ecc40';
        ctx.beginPath();
        ctx.ellipse(x + size / 2, y + size * 0.55, size * 0.35, size * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#e8a010';
        ctx.beginPath();
        ctx.ellipse(x + size / 2, y + size * 0.55, size * 0.28, size * 0.33, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#2ecc40';
        const headX = x + size / 2 + dir * size * 0.2;
        ctx.beginPath();
        ctx.arc(headX, y + size * 0.2, size * 0.18, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(headX + dir * 3, y + size * 0.18, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(headX + dir * 4, y + size * 0.18, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#e8a010';
        const footOff = step === 0 ? 1 : -1;
        ctx.fillRect(x + size * 0.2, y + size * 0.85 + footOff, size * 0.2, size * 0.15);
        ctx.fillRect(x + size * 0.6, y + size * 0.85 - footOff, size * 0.2, size * 0.15);
    },

    drawSpike(ctx, x, y, size) {
        ctx.fillStyle = '#888';
        ctx.fillRect(x + 2, y + size * 0.4, size - 4, size * 0.6);
        ctx.fillStyle = '#aaa';
        const spikes = 4;
        for (let i = 0; i < spikes; i++) {
            const sx = x + 2 + (i * (size - 4)) / spikes;
            const sw = (size - 4) / spikes;
            ctx.beginPath();
            ctx.moveTo(sx, y + size * 0.4);
            ctx.lineTo(sx + sw / 2, y + 2);
            ctx.lineTo(sx + sw, y + size * 0.4);
            ctx.closePath();
            ctx.fill();
        }
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 2, y + size * 0.4, size - 4, size * 0.6);
    },

    drawEraser(ctx, x, y, size) {
        ctx.strokeStyle = '#e94560';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x + 4, y + 4);
        ctx.lineTo(x + size - 4, y + size - 4);
        ctx.moveTo(x + size - 4, y + 4);
        ctx.lineTo(x + 4, y + size - 4);
        ctx.stroke();
    },

    drawPlayer(ctx, x, y, w, h, frame = 0, facingRight = true, isJumping = false, isBig = false) {
        ctx.save();
        if (!facingRight) {
            ctx.translate(x + w, y);
            ctx.scale(-1, 1);
            x = 0;
            y = 0;
        }

        const step = Math.floor(frame / 6) % 3;

        ctx.fillStyle = '#e94560';
        ctx.fillRect(x + w * 0.2, y, w * 0.6, h * 0.25);
        ctx.fillRect(x + w * 0.1, y + h * 0.05, w * 0.8, h * 0.15);

        ctx.fillStyle = '#ffd4a0';
        ctx.fillRect(x + w * 0.15, y + h * 0.15, w * 0.55, h * 0.2);
        ctx.fillRect(x + w * 0.6, y + h * 0.2, w * 0.2, h * 0.1);

        ctx.fillStyle = '#000';
        ctx.fillRect(x + w * 0.5, y + h * 0.2, w * 0.08, h * 0.06);

        ctx.fillStyle = '#8b4513';
        ctx.fillRect(x + w * 0.25, y + h * 0.3, w * 0.1, h * 0.1);

        ctx.fillStyle = '#e94560';
        ctx.fillRect(x + w * 0.1, y + h * 0.35, w * 0.7, h * 0.3);

        ctx.fillStyle = '#3366ff';
        ctx.fillRect(x + w * 0.15, y + h * 0.55, w * 0.3, h * 0.15);
        ctx.fillRect(x + w * 0.45, y + h * 0.55, w * 0.3, h * 0.15);

        ctx.fillStyle = '#ffd4a0';
        if (isJumping) {
            ctx.fillRect(x + w * 0.7, y + h * 0.35, w * 0.25, h * 0.12);
        } else {
            ctx.fillRect(x + w * 0.0, y + h * 0.4, w * 0.15, h * 0.12);
            ctx.fillRect(x + w * 0.75, y + h * 0.4, w * 0.15, h * 0.12);
        }

        if (isJumping) {
            ctx.fillStyle = '#8b4513';
            ctx.fillRect(x + w * 0.1, y + h * 0.7, w * 0.3, h * 0.3);
            ctx.fillRect(x + w * 0.5, y + h * 0.65, w * 0.3, h * 0.25);
        } else {
            ctx.fillStyle = '#8b4513';
            if (step === 0) {
                ctx.fillRect(x + w * 0.1, y + h * 0.7, w * 0.3, h * 0.3);
                ctx.fillRect(x + w * 0.5, y + h * 0.7, w * 0.3, h * 0.3);
            } else if (step === 1) {
                ctx.fillRect(x + w * 0.05, y + h * 0.7, w * 0.3, h * 0.3);
                ctx.fillRect(x + w * 0.55, y + h * 0.72, w * 0.3, h * 0.28);
            } else {
                ctx.fillRect(x + w * 0.15, y + h * 0.72, w * 0.3, h * 0.28);
                ctx.fillRect(x + w * 0.5, y + h * 0.7, w * 0.3, h * 0.3);
            }
        }

        ctx.restore();
    },

    drawBackground(ctx, width, height, cameraX, frame) {
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#5c94fc');
        gradient.addColorStop(0.7, '#87ceeb');
        gradient.addColorStop(1, '#b0e0f0');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#fff';
        ctx.globalAlpha = 0.8;
        this._drawCloud(ctx, (100 - cameraX * 0.1) % (width + 200), 40, 60);
        this._drawCloud(ctx, (350 - cameraX * 0.15) % (width + 200), 70, 45);
        this._drawCloud(ctx, (600 - cameraX * 0.12) % (width + 200), 30, 55);
        this._drawCloud(ctx, (850 - cameraX * 0.08) % (width + 200), 90, 40);

        ctx.globalAlpha = 0.15;
        ctx.fillStyle = '#2d5016';
        this._drawHill(ctx, (150 - cameraX * 0.3) % (width + 400) - 100, height, 200, 100);
        this._drawHill(ctx, (500 - cameraX * 0.3) % (width + 400) - 100, height, 150, 80);
        this._drawHill(ctx, (800 - cameraX * 0.3) % (width + 400) - 100, height, 180, 90);

        ctx.globalAlpha = 1;
    },

    _drawCloud(ctx, x, y, w) {
        const h = w * 0.5;
        ctx.beginPath();
        ctx.arc(x, y + h * 0.4, h * 0.5, 0, Math.PI * 2);
        ctx.arc(x + w * 0.3, y, h * 0.6, 0, Math.PI * 2);
        ctx.arc(x + w * 0.6, y + h * 0.1, h * 0.5, 0, Math.PI * 2);
        ctx.arc(x + w * 0.8, y + h * 0.4, h * 0.45, 0, Math.PI * 2);
        ctx.fill();
    },

    _drawHill(ctx, x, baseY, w, h) {
        ctx.beginPath();
        ctx.moveTo(x - w / 2, baseY);
        ctx.quadraticCurveTo(x, baseY - h, x + w / 2, baseY);
        ctx.closePath();
        ctx.fill();
    },

    drawGrid(ctx, width, height, tileSize, cameraX, cameraY) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 0.5;
        const offsetX = -(cameraX % tileSize);
        const offsetY = -(cameraY % tileSize);
        for (let x = offsetX; x <= width; x += tileSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        for (let y = offsetY; y <= height; y += tileSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
    },

    draw(type, ctx, x, y, size, frame) {
        switch (type) {
            case 'ground': this.drawGround(ctx, x, y, size); break;
            case 'brick': this.drawBrick(ctx, x, y, size); break;
            case 'question': this.drawQuestion(ctx, x, y, size, frame); break;
            case 'stone': this.drawStone(ctx, x, y, size); break;
            case 'pipe_top': this.drawPipeTop(ctx, x, y, size); break;
            case 'pipe_body': this.drawPipeBody(ctx, x, y, size); break;
            case 'coin': this.drawCoin(ctx, x, y, size, frame); break;
            case 'spawn': this.drawSpawn(ctx, x, y, size); break;
            case 'flag': this.drawFlag(ctx, x, y, size); break;
            case 'goomba': this.drawGoomba(ctx, x, y, size, frame); break;
            case 'koopa': this.drawKoopa(ctx, x, y, size, frame); break;
            case 'spike': this.drawSpike(ctx, x, y, size); break;
            case 'eraser': this.drawEraser(ctx, x, y, size); break;
        }
    },

    initToolIcons() {
        document.querySelectorAll('.tool-icon').forEach(canvas => {
            canvas.width = 28;
            canvas.height = 28;
            const ctx = canvas.getContext('2d');
            const type = canvas.dataset.icon;
            this.draw(type, ctx, 0, 0, 28, 0);
        });
    }
};
