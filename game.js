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
            return true;
        }
        return false;
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
        player1 = new Player(maze.start.x, maze.start.y, player1Color);
        player2 = new Player(maze.end.x, maze.end.y, player2Color);
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

    // 单次按键移动处理
    window.addEventListener('keydown', (e) => {
        if (!maze) return;

        // 玩家1 (方向键)
        if (e.key === 'ArrowUp' && player1.move('up', maze)) {
            if (showTrail) player1.addTrail();
            e.preventDefault();
        } else if (e.key === 'ArrowDown' && player1.move('down', maze)) {
            if (showTrail) player1.addTrail();
            e.preventDefault();
        } else if (e.key === 'ArrowLeft' && player1.move('left', maze)) {
            if (showTrail) player1.addTrail();
            e.preventDefault();
        } else if (e.key === 'ArrowRight' && player1.move('right', maze)) {
            if (showTrail) player1.addTrail();
            e.preventDefault();
        }

        // 玩家2 (WASD)
        if (e.key === 'w' && player2.move('up', maze)) {
            if (showTrail) player2.addTrail();
            e.preventDefault();
        } else if (e.key === 's' && player2.move('down', maze)) {
            if (showTrail) player2.addTrail();
            e.preventDefault();
        } else if (e.key === 'a' && player2.move('left', maze)) {
            if (showTrail) player2.addTrail();
            e.preventDefault();
        } else if (e.key === 'd' && player2.move('right', maze)) {
            if (showTrail) player2.addTrail();
            e.preventDefault();
        }

        // 检查玩家是否相遇
        if (player1.x === player2.x && player1.y === player2.y) {

            setTimeout(() => {
                // 创建全新迷宫实例
                const rows = parseInt(rowsInput.value);
                const cols = parseInt(colsInput.value);
                maze = new Maze(rows, cols);
                maze.generate();
            resetPlayers();
            player1Trail = [];
            player2Trail = [];
            drawGame();
    
            }, 1000);
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