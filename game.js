document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('mazeCanvas');
    const ctx = canvas.getContext('2d');
    const rowsInput = document.getElementById('rows');
    const colsInput = document.getElementById('cols');
    const generateBtn = document.getElementById('generate');
    const darkModeBtn = document.getElementById('darkModeBtn');
const trailModeBtn = document.getElementById('trailModeBtn');
    const statusText = document.getElementById('status');

    let maze = null;
// 玩家类 - 封装玩家数据和行为
class Player {
    constructor(startX, startY, color) {
        this.x = startX;
        this.y = startY;
        this.color = color;
        this.trail = [];
        this.autoMoveInterval = null;
        this.lastDirection = 'right'; // 初始方向
        this.autoMoveEnabled = false; // 自动移动开关状态
    }

    // 移动玩家并返回是否成功
    move(direction, maze) {
        if (maze.canMove(this.x, this.y, direction)) {
            switch(direction) {
                case 'up': this.y--; break;
                case 'down': this.y++; break;
                case 'left': this.x--; break;
                case 'right': this.x++; break;
            }
            this.lastDirection = direction;
            return true;
        }
        return false;
    }

    // 自动移动 - 使用右手法则
    autoMove(maze) {
        // 尝试右转优先
        const directions = {
            'up': ['right', 'up', 'left', 'down'],
            'right': ['down', 'right', 'up', 'left'],
            'down': ['left', 'down', 'right', 'up'],
            'left': ['up', 'left', 'down', 'right']
        };
        
        const priority = directions[this.lastDirection];
        for (const dir of priority) {
            if (this.move(dir, maze)) {
                if (showTrail) this.addTrail();
                return;
            }
        }
    }

    // 开始自动移动
    startAutoMove(maze) {
        this.stopAutoMove();
        this.autoMoveEnabled = true;
        this.autoMoveInterval = setInterval(() => {
            this.autoMove(maze);
        }, 1000);
    }

    // 停止自动移动
    stopAutoMove() {
        this.autoMoveEnabled = false;
        if (this.autoMoveInterval) {
            clearInterval(this.autoMoveInterval);
            this.autoMoveInterval = null;
        }
    }

    // 停止自动移动
    stopAutoMove() {
        if (this.autoMoveInterval) {
            clearInterval(this.autoMoveInterval);
            this.autoMoveInterval = null;
        }
    }

    // 添加轨迹点
    addTrail() {
        this.trail.push({x: this.x, y: this.y});
    }

    // 重置玩家位置和轨迹
    reset(startX, startY) {
        this.x = startX;
        this.y = startY;
        this.trail = [];
    }
}

let player1;
let player2;
let cellSize = 30;
const showTrailCheckbox = document.getElementById('showTrail');
    // 移除controls对象，使用单次按键事件处理移动

    // 初始化游戏
    function initGame() {
        const rows = parseInt(rowsInput.value);
        const cols = parseInt(colsInput.value);
        maze = new Maze(rows, cols);
        maze.generate();
            resetPlayers();
            player1.trail = [];
            player2.trail = [];
            resizeCanvas();
            drawGame();
    }

    // 重置玩家位置
    function resetPlayers() {
        const player1Color = getComputedStyle(document.documentElement).getPropertyValue('--player1-color');
        const player2Color = getComputedStyle(document.documentElement).getPropertyValue('--player2-color');
        const p1Auto = player1 ? !!player1.autoMoveInterval : false;
        const p2Auto = player2 ? !!player2.autoMoveInterval : false;
        
        player1 = new Player(maze.start.x, maze.start.y, player1Color);
        player2 = new Player(maze.end.x, maze.end.y, player2Color);
        
        if (p1Auto) {
            player1.startAutoMove(maze);
            document.getElementById('autoMoveBtn1').classList.add('active');
        }
        if (p2Auto) {
            player2.startAutoMove(maze);
            document.getElementById('autoMoveBtn2').classList.add('active');
        }
    }

    // 调整画布大小
    function resizeCanvas() {
        const containerWidth = canvas.parentElement.clientWidth;
        const maxCellSize = Math.floor(containerWidth / maze.cols);
        cellSize = Math.min(maxCellSize, 50); // 限制最大单元格大小
        canvas.width = maze.cols * cellSize;
        canvas.height = maze.rows * cellSize;
    }

    // 绘制游戏元素
    function drawGame() {
    // 确保画布尺寸与显示尺寸一致
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
        // 清空画布
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--maze-path');
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        drawMaze();
        if (showTrail) drawTrails();
        drawPlayers();
    }

    // 绘制迷宫
    function drawMaze() {
        const wallColor = getComputedStyle(document.documentElement).getPropertyValue('--maze-wall');
        ctx.strokeStyle = wallColor;
        ctx.lineWidth = 2;

        for (let y = 0; y < maze.rows; y++) {
            for (let x = 0; x < maze.cols; x++) {
                const cell = maze.grid[y][x];
                const xPos = x * cellSize;
                const yPos = y * cellSize;

                // 绘制墙壁
                if (cell.top) {
                    ctx.beginPath();
                    ctx.moveTo(xPos, yPos);
                    ctx.lineTo(xPos + cellSize, yPos);
                    ctx.stroke();
                }
                if (cell.right) {
                    ctx.beginPath();
                    ctx.moveTo(xPos + cellSize, yPos);
                    ctx.lineTo(xPos + cellSize, yPos + cellSize);
                    ctx.stroke();
                }
                if (cell.bottom) {
                    ctx.beginPath();
                    ctx.moveTo(xPos, yPos + cellSize);
                    ctx.lineTo(xPos + cellSize, yPos + cellSize);
                    ctx.stroke();
                }
                if (cell.left) {
                    ctx.beginPath();
                    ctx.moveTo(xPos, yPos);
                    ctx.lineTo(xPos, yPos + cellSize);
                    ctx.stroke();
                }
            }
        }
    }

    // 绘制移动轨迹
    function drawTrails() {
        if (!showTrail) return;

        // 绘制玩家1轨迹
        player1.trail.forEach((pos, index) => {
            const opacity = Math.max(0.1, 0.5 - (index / player1.trail.length) * 0.4);
            ctx.fillStyle = `rgba(0, 0, 255, ${opacity})`;
            ctx.beginPath();
            ctx.arc(
                pos.x * cellSize + cellSize / 2,
                pos.y * cellSize + cellSize / 2,
                cellSize * 0.2,
                0,
                Math.PI * 2
            );
            ctx.fill();
        });

        // 绘制玩家2轨迹
        player2.trail.forEach((pos, index) => {
            const opacity = Math.max(0.1, 0.5 - (index / player2.trail.length) * 0.4);
            ctx.fillStyle = `rgba(255, 0, 0, ${opacity})`;
            ctx.beginPath();
            ctx.arc(
                pos.x * cellSize + cellSize / 2,
                pos.y * cellSize + cellSize / 2,
                cellSize * 0.2,
                0,
                Math.PI * 2
            );
            ctx.fill();
        });
    }

    // 绘制玩家
    function drawPlayers() {
        // 玩家1 (蓝色)
        ctx.fillStyle = player1.color;
        ctx.fillRect(
            player1.x * cellSize + cellSize * 0.2,
            player1.y * cellSize + cellSize * 0.2,
            cellSize * 0.6,
            cellSize * 0.6
        );

        // 玩家2 (红色)
        ctx.fillStyle = player2.color;
        ctx.fillRect(
            player2.x * cellSize + cellSize * 0.2,
            player2.y * cellSize + cellSize * 0.2,
            cellSize * 0.6,
            cellSize * 0.6
        );
    }

    // 游戏循环
    function gameLoop() {
        if (maze) {
            drawGame();
            
            // 检查玩家是否相遇
            if (player1.x === player2.x && player1.y === player2.y) {
                setTimeout(() => {
                    // 创建全新迷宫实例
                    const rows = parseInt(rowsInput.value);
                    const cols = parseInt(colsInput.value);
                    maze = new Maze(rows, cols);
                    maze.generate();
                    resetPlayers();
                    player1.trail = [];
                    player2.trail = [];
                    drawGame();
                }, 1000);
            }
        }
        requestAnimationFrame(gameLoop);
    }

    // 设置面板切换功能
    const toggleSettingsBtn = document.getElementById('toggleSettings');
    const settingsContent = document.getElementById('settingsContent');

    toggleSettingsBtn.addEventListener('click', () => {
        settingsContent.classList.toggle('active');
        toggleSettingsBtn.innerHTML = settingsContent.classList.contains('active') ? '设置 ▲' : '设置 ▼';
    });

    // 事件监听器
    generateBtn.addEventListener('click', initGame);

    // 深色模式按钮切换
    darkModeBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        darkModeBtn.classList.toggle('active');
        if (maze) drawGame();
    });

    // 轨迹模式按钮切换
    let showTrail = false; // 默认关闭轨迹
    trailModeBtn.addEventListener('click', () => {
          showTrail = !showTrail;
          trailModeBtn.classList.toggle('active', showTrail);
          if (!showTrail) {
              player1.trail = [];
              player2.trail = [];
          }
    });

    // 创建按钮容器
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.gap = '10px';
    buttonContainer.style.margin = '10px 0';

    // 自动移动按钮
    const autoMoveBtn1 = document.createElement('button');
    autoMoveBtn1.id = 'autoMoveBtn1';
    autoMoveBtn1.textContent = '蓝';
    autoMoveBtn1.style.padding = '5px 15px';
    autoMoveBtn1.style.border = '1px solid #3498db';
    autoMoveBtn1.style.borderRadius = '4px';
    autoMoveBtn1.style.backgroundColor = '#e6f2fa';
    autoMoveBtn1.style.color = '#3498db';
    autoMoveBtn1.style.cursor = 'pointer';
    autoMoveBtn1.style.transition = 'all 0.3s';
    autoMoveBtn1.addEventListener('click', () => {
        if (player1.autoMoveInterval) {
            player1.stopAutoMove();
            autoMoveBtn1.classList.remove('active');
        } else {
            player1.startAutoMove(maze);
            autoMoveBtn1.classList.add('active');
        }
        localStorage.setItem('player1AutoMove', !!player1.autoMoveInterval);
    });

    const autoMoveBtn2 = document.createElement('button');
    autoMoveBtn2.id = 'autoMoveBtn2';
    autoMoveBtn2.textContent = '红';
    autoMoveBtn2.style.padding = '5px 15px';
    autoMoveBtn2.style.border = '1px solid #e74c3c';
    autoMoveBtn2.style.borderRadius = '4px';
    autoMoveBtn2.style.backgroundColor = '#fae6e6';
    autoMoveBtn2.style.color = '#e74c3c';
    autoMoveBtn2.style.cursor = 'pointer';
    autoMoveBtn2.style.transition = 'all 0.3s';
    autoMoveBtn2.addEventListener('click', () => {
        if (player2.autoMoveInterval) {
            player2.stopAutoMove();
            autoMoveBtn2.classList.remove('active');
        } else {
            player2.startAutoMove(maze);
            autoMoveBtn2.classList.add('active');
        }
        localStorage.setItem('player2AutoMove', !!player2.autoMoveInterval);
    });

    // 初始化自动移动按钮状态
    if (localStorage.getItem('player1AutoMove') === 'true') {
        autoMoveBtn1.classList.add('active');
    }
    if (localStorage.getItem('player2AutoMove') === 'true') {
        autoMoveBtn2.classList.add('active');
    }

    // 添加按钮到容器
    buttonContainer.appendChild(autoMoveBtn1);
    buttonContainer.appendChild(autoMoveBtn2);
    
    // 将容器添加到设置面板中的settings div
    const settingsDiv = document.querySelector('.settings');
    settingsDiv.appendChild(buttonContainer);

    // 更新轨迹按钮样式以匹配
    trailModeBtn.style.padding = '5px 15px';
    trailModeBtn.style.border = '1px solid #2ecc71';
    trailModeBtn.style.borderRadius = '4px';
    trailModeBtn.style.backgroundColor = '#e6f7ed';
    trailModeBtn.style.color = '#2ecc71';
    trailModeBtn.style.cursor = 'pointer';
    trailModeBtn.style.transition = 'all 0.3s';

    // 更新深色模式按钮样式
    darkModeBtn.style.padding = '5px 15px';
    darkModeBtn.style.border = '1px solid #9b59b6';
    darkModeBtn.style.borderRadius = '4px';
    darkModeBtn.style.backgroundColor = '#f3e6f8';
    darkModeBtn.style.color = '#9b59b6';
    darkModeBtn.style.cursor = 'pointer';
    darkModeBtn.style.transition = 'all 0.3s';

    // 更新生成按钮样式
    generateBtn。style。padding = '5px 15px';
    generateBtn。style。border = '1px solid #3498db';
    generateBtn。style。borderRadius = '4px';
    generateBtn。style。backgroundColor = '#e6f2fa';
    generateBtn。style。color = '#3498db';
    generateBtn。style。cursor = 'pointer';
    generateBtn。style。transition = 'all 0.3s';

    // 单次按键移动处理
    window.addEventListener('keydown', (e) => {
        if (!maze) return;

        // 玩家1 (方向键)
        if (!player1。autoMoveInterval && e。key === 'ArrowUp' && player1。move('up'， maze)) {
            if (showTrail) player1。addTrail();
            e.preventDefault();
        } else if (!player1.autoMoveInterval && e.key === 'ArrowDown' && player1.move('down', maze)) {
            if (showTrail) player1.addTrail();
            e.preventDefault();
        } else if (!player1。autoMoveInterval && e。key === 'ArrowLeft' && player1。move('left'， maze)) {
            if (showTrail) player1.addTrail();
            e.preventDefault();
        } else if (!player1。autoMoveInterval && e。key === 'ArrowRight' && player1。move('right'， maze)) {
            if (showTrail) player1.addTrail();
            e。preventDefault();
        }

        // 玩家2 (WASD)
        if (!player2.autoMoveInterval && e.key === 'w' && player2.move('up', maze)) {
            if (showTrail) player2.addTrail();
            e.preventDefault();
        } else if (!player2.autoMoveInterval && e.key === 's' && player2.move('down', maze)) {
            if (showTrail) player2.addTrail();
            e.preventDefault();
        } else if (!player2.autoMoveInterval && e.key === 'a' && player2.move('left', maze)) {
            if (showTrail) player2.addTrail();
            e.preventDefault();
        } else if (!player2.autoMoveInterval && e.key === 'd' && player2.move('right', maze)) {
            if (showTrail) player2.addTrail();
            e.preventDefault();
        }
    });

    window.addEventListener('resize', () => {
        if (maze) resizeCanvas();
        drawGame();
    });

    // 启动游戏
    gameLoop();
    initGame();
});
