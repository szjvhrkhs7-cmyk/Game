#!/bin/bash
CSS=$(cat /home/user/Game/style.css)
JS1=$(cat /home/user/Game/sprites.js)
JS2=$(cat /home/user/Game/engine.js)
JS3=$(cat /home/user/Game/editor.js)
JS4=$(cat /home/user/Game/game.js)
JS5=$(cat /home/user/Game/main.js)

cat > /home/user/Game/mario-maker.html << HTMLEOF
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Mario Maker</title>
    <style>
${CSS}
    </style>
</head>
<body>
    <div id="game-container">
        <canvas id="gameCanvas"></canvas>

        <div id="toolbar">
            <div id="mode-buttons">
                <button id="btn-edit" class="mode-btn active" onclick="switchMode('edit')">Build</button>
                <button id="btn-play" class="mode-btn" onclick="switchMode('play')">Play</button>
            </div>
            <div id="edit-tools" class="tool-section">
                <div class="tool-group">
                    <span class="group-label">Blocks</span>
                    <button class="tool-btn selected" data-tool="ground" title="Ground"><canvas class="tool-icon" data-icon="ground"></canvas></button>
                    <button class="tool-btn" data-tool="brick" title="Brick"><canvas class="tool-icon" data-icon="brick"></canvas></button>
                    <button class="tool-btn" data-tool="question" title="? Block"><canvas class="tool-icon" data-icon="question"></canvas></button>
                    <button class="tool-btn" data-tool="pipe_top" title="Pipe Top"><canvas class="tool-icon" data-icon="pipe_top"></canvas></button>
                    <button class="tool-btn" data-tool="pipe_body" title="Pipe Body"><canvas class="tool-icon" data-icon="pipe_body"></canvas></button>
                    <button class="tool-btn" data-tool="stone" title="Stone"><canvas class="tool-icon" data-icon="stone"></canvas></button>
                </div>
                <div class="tool-group">
                    <span class="group-label">Items</span>
                    <button class="tool-btn" data-tool="coin" title="Coin"><canvas class="tool-icon" data-icon="coin"></canvas></button>
                    <button class="tool-btn" data-tool="spawn" title="Spawn Point"><canvas class="tool-icon" data-icon="spawn"></canvas></button>
                    <button class="tool-btn" data-tool="flag" title="Goal Flag"><canvas class="tool-icon" data-icon="flag"></canvas></button>
                </div>
                <div class="tool-group">
                    <span class="group-label">Enemies</span>
                    <button class="tool-btn" data-tool="goomba" title="Goomba"><canvas class="tool-icon" data-icon="goomba"></canvas></button>
                    <button class="tool-btn" data-tool="koopa" title="Koopa"><canvas class="tool-icon" data-icon="koopa"></canvas></button>
                    <button class="tool-btn" data-tool="spike" title="Spike"><canvas class="tool-icon" data-icon="spike"></canvas></button>
                </div>
                <div class="tool-group">
                    <span class="group-label">Tools</span>
                    <button class="tool-btn" data-tool="eraser" title="Eraser"><canvas class="tool-icon" data-icon="eraser"></canvas></button>
                </div>
                <div class="tool-group">
                    <span class="group-label">Level</span>
                    <button class="action-btn" onclick="saveLevel()">Save</button>
                    <button class="action-btn" onclick="loadLevel()">Load</button>
                    <button class="action-btn" onclick="clearLevel()">Clear</button>
                </div>
            </div>
            <div id="play-hud" class="tool-section" style="display:none">
                <div class="hud-item"><span class="hud-label">COINS</span><span id="hud-coins" class="hud-value">0</span></div>
                <div class="hud-item"><span class="hud-label">LIVES</span><span id="hud-lives" class="hud-value">3</span></div>
                <div class="hud-item"><span class="hud-label">TIME</span><span id="hud-time" class="hud-value">300</span></div>
            </div>
        </div>

        <div id="overlay" style="display:none"><div id="overlay-text"></div></div>

        <div id="touch-controls">
            <div class="touch-dpad">
                <div class="touch-spacer"></div>
                <button class="touch-btn" data-key="ArrowUp" id="touch-up">&#9650;</button>
                <div class="touch-spacer"></div>
                <button class="touch-btn" data-key="ArrowLeft" id="touch-left">&#9664;</button>
                <div class="touch-spacer"></div>
                <button class="touch-btn" data-key="ArrowRight" id="touch-right">&#9654;</button>
            </div>
            <div class="touch-actions">
                <button class="touch-btn large" data-key="Space" id="touch-jump">&#8593;</button>
                <button class="touch-btn large" data-key="ShiftLeft" id="touch-run">&#9733;</button>
            </div>
        </div>
    </div>

    <script>
${JS1}

${JS2}

${JS3}

${JS4}

${JS5}
    </script>
</body>
</html>
HTMLEOF
