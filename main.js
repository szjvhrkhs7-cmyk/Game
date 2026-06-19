const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    const maxW = Math.min(window.innerWidth, 960);
    const ratio = LEVEL_HEIGHT * TILE / 960;
    canvas.width = 960;
    canvas.height = LEVEL_HEIGHT * TILE;
    canvas.style.width = maxW + 'px';
    canvas.style.height = (maxW * ratio) + 'px';
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const input = new InputManager();
input.attachCanvas(canvas);

const level = new Level();
const camera = new Camera(canvas.width, canvas.height);
const particles = new ParticleSystem();

let mode = 'edit';
let editor = new Editor(canvas, ctx, level, camera, input, particles);
let gameplay = null;

function createDefaultLevel() {
    for (let x = 0; x < 30; x++) {
        level.setTile(x, LEVEL_HEIGHT - 1, 'ground');
        level.setTile(x, LEVEL_HEIGHT - 2, 'ground');
    }

    for (let x = 35; x < 45; x++) {
        level.setTile(x, LEVEL_HEIGHT - 1, 'ground');
        level.setTile(x, LEVEL_HEIGHT - 2, 'ground');
    }

    for (let x = 48; x < 80; x++) {
        level.setTile(x, LEVEL_HEIGHT - 1, 'ground');
        level.setTile(x, LEVEL_HEIGHT - 2, 'ground');
    }

    level.setTile(10, LEVEL_HEIGHT - 5, 'brick');
    level.setTile(11, LEVEL_HEIGHT - 5, 'question');
    level.setTile(12, LEVEL_HEIGHT - 5, 'brick');
    level.setTile(13, LEVEL_HEIGHT - 5, 'question');
    level.setTile(14, LEVEL_HEIGHT - 5, 'brick');

    level.setTile(20, LEVEL_HEIGHT - 5, 'question');

    for (let i = 0; i < 4; i++) {
        level.setTile(22 + i, LEVEL_HEIGHT - 8, 'brick');
    }

    level.setTile(38, LEVEL_HEIGHT - 3, 'pipe_top');
    level.setTile(38, LEVEL_HEIGHT - 2, 'pipe_body');
    level.setTile(38, LEVEL_HEIGHT - 1, 'pipe_body');

    level.setTile(41, LEVEL_HEIGHT - 4, 'pipe_top');
    level.setTile(41, LEVEL_HEIGHT - 3, 'pipe_body');
    level.setTile(41, LEVEL_HEIGHT - 2, 'pipe_body');
    level.setTile(41, LEVEL_HEIGHT - 1, 'pipe_body');

    for (let i = 0; i < 5; i++) {
        level.setTile(55 + i, LEVEL_HEIGHT - 5, 'stone');
    }

    level.setTile(8, LEVEL_HEIGHT - 3, 'coin');
    level.setTile(9, LEVEL_HEIGHT - 3, 'coin');
    level.setTile(10, LEVEL_HEIGHT - 3, 'coin');
    level.setTile(22, LEVEL_HEIGHT - 9, 'coin');
    level.setTile(23, LEVEL_HEIGHT - 9, 'coin');
    level.setTile(24, LEVEL_HEIGHT - 9, 'coin');
    level.setTile(25, LEVEL_HEIGHT - 9, 'coin');

    level.setTile(15, LEVEL_HEIGHT - 3, 'goomba');
    level.setTile(26, LEVEL_HEIGHT - 3, 'goomba');
    level.setTile(50, LEVEL_HEIGHT - 3, 'koopa');

    for (let i = 0; i < 8; i++) {
        level.setTile(63 + i, LEVEL_HEIGHT - 3 - i, 'stone');
        for (let j = 0; j < i; j++) {
            level.setTile(63 + i, LEVEL_HEIGHT - 2 - j, 'stone');
        }
    }

    level.setTile(70, LEVEL_HEIGHT - 11, 'flag');

    level.setTile(2, LEVEL_HEIGHT - 3, 'spawn');
}

createDefaultLevel();

Sprites.initToolIcons();

function switchMode(newMode) {
    mode = newMode;
    document.getElementById('btn-edit').classList.toggle('active', mode === 'edit');
    document.getElementById('btn-play').classList.toggle('active', mode === 'play');
    document.getElementById('edit-tools').style.display = mode === 'edit' ? 'flex' : 'none';
    document.getElementById('play-hud').style.display = mode === 'play' ? 'flex' : 'none';
    hideOverlay();
    input.showTouchControls(mode);

    if (mode === 'play') {
        gameplay = new GamePlay(canvas, ctx, level, camera, input, particles);
        canvas.style.cursor = 'default';
    } else {
        gameplay = null;
        editor = new Editor(canvas, ctx, level, camera, input, particles);
        canvas.style.cursor = 'crosshair';
    }
}

function showOverlay(text) {
    const overlay = document.getElementById('overlay');
    const overlayText = document.getElementById('overlay-text');
    overlay.style.display = 'flex';
    overlayText.textContent = text;
}

function hideOverlay() {
    document.getElementById('overlay').style.display = 'none';
}

function saveLevel() {
    const data = level.serialize();
    localStorage.setItem('marioMakerLevel', data);

    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'level.json';
    a.click();
    URL.revokeObjectURL(url);

    showOverlay('SAVED!');
    setTimeout(hideOverlay, 1000);
}

function loadLevel() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.onchange = e => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => {
            if (level.deserialize(ev.target.result)) {
                editor = new Editor(canvas, ctx, level, camera, input, particles);
                showOverlay('LOADED!');
                setTimeout(hideOverlay, 1000);
            }
        };
        reader.readAsText(file);
    };
    fileInput.click();
}

function clearLevel() {
    if (confirm('Clear entire level?')) {
        level.tiles = {};
        level.spawnX = 2 * TILE;
        level.spawnY = (LEVEL_HEIGHT - 3) * TILE;
        editor = new Editor(canvas, ctx, level, camera, input, particles);
        showOverlay('CLEARED!');
        setTimeout(hideOverlay, 1000);
    }
}

function gameLoop() {
    if (mode === 'edit') {
        editor.update();
        editor.draw();
    } else if (mode === 'play') {
        const result = gameplay.update();
        gameplay.draw();
        if (result === 'edit') {
            switchMode('edit');
        }
    }

    input.endFrame();
    requestAnimationFrame(gameLoop);
}

camera.setPosition(0, 0);
gameLoop();
