class Maze {
  constructor(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    this.grid = [];
    this.start = this.getRandomEdgeCell();
    this.end = this.getRandomEdgeCell(this.start);
    this.initGrid();
  }

  // 获取随机边缘单元格作为起点或终点
  getRandomEdgeCell(exclude = null) {
    // 随机选择一个边缘
    const edge = Math.floor(Math.random() * 4);
    let cell;

    do {
      switch(edge) {
        case 0: // 上边缘
          cell = { x: Math.floor(Math.random() * this.cols), y: 0 };
          break;
        case 1: // 右边缘
          cell = { x: this.cols - 1, y: Math.floor(Math.random() * this.rows) };
          break;
        case 2: // 下边缘
          cell = { x: Math.floor(Math.random() * this.cols), y: this.rows - 1 };
          break;
        case 3: // 左边缘
          cell = { x: 0, y: Math.floor(Math.random() * this.rows) };
          break;
      }
    } while (exclude && cell.x === exclude.x && cell.y === exclude.y);

    return cell;
  }

  initGrid() {
    for (let y = 0; y < this.rows; y++) {
      let row = [];
      for (let x = 0; x < this.cols; x++) {
        row.push({
          top: true,
          right: true,
          bottom: true,
          left: true,
          visited: false
        });
      }
      this.grid.push(row);
    }
  }

  generate() {
    // 重新初始化网格
    this.initGrid();
    
    // 随机选择起点单元格
    let startX = Math.floor(Math.random() * this.cols);
    let startY = Math.floor(Math.random() * this.rows);
    let current = { x: startX, y: startY };
    this.grid[current.y][current.x].visited = true;
    let walls = [];

    this.addWalls(current, walls);

    while (walls.length > 0) {
      let randomIndex = Math.floor(Math.random() * walls.length);
      let wall = walls[randomIndex];
      walls.splice(randomIndex, 1);

      let neighbor = wall.neighbor;
      let currentCell = wall.current;

      if (!this.grid[neighbor.y][neighbor.x].visited) {
        this.removeWall(currentCell, neighbor);
        this.grid[neighbor.y][neighbor.x].visited = true;
        this.addWalls(neighbor, walls);
      }
    }

    // 为起点和终点创建入口/出口
    this.createEdgeOpening(this.start);
    this.createEdgeOpening(this.end);
  }

  // 创建边缘开口
  createEdgeOpening(cell) {
    // 判断单元格位于哪个边缘
    if (cell.y === 0) this.grid[cell.y][cell.x].top = false; // 上边缘
    else if (cell.x === this.cols - 1) this.grid[cell.y][cell.x].right = false; // 右边缘
    else if (cell.y === this.rows - 1) this.grid[cell.y][cell.x].bottom = false; // 下边缘
    else if (cell.x === 0) this.grid[cell.y][cell.x].left = false; // 左边缘
  }

  addWalls(cell, walls) {
    let directions = [
      { dx: 0, dy: -1, wall: 'top' },
      { dx: 1, dy: 0, wall: 'right' },
      { dx: 0, dy: 1, wall: 'bottom' },
      { dx: -1, dy: 0, wall: 'left' }
    ];

    // 随机打乱方向顺序
    for (let i = directions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [directions[i], directions[j]] = [directions[j], directions[i]];
    }

    for (let dir of directions) {
      let neighbor = { x: cell.x + dir.dx, y: cell.y + dir.dy };
      if (this.isValid(neighbor.x, neighbor.y)) {
        walls.push({
          current: cell,
          neighbor: neighbor,
          wall: dir.wall
        });
      }
    }
  }

  removeWall(current, neighbor) {
    if (neighbor.x > current.x) {
      this.grid[current.y][current.x].right = false;
      this.grid[neighbor.y][neighbor.x].left = false;
    } else if (neighbor.x < current.x) {
      this.grid[current.y][current.x].left = false;
      this.grid[neighbor.y][neighbor.x].right = false;
    } else if (neighbor.y > current.y) {
      this.grid[current.y][current.x].bottom = false;
      this.grid[neighbor.y][neighbor.x].top = false;
    } else if (neighbor.y < current.y) {
      this.grid[current.y][current.x].top = false;
      this.grid[neighbor.y][neighbor.x].bottom = false;
    }
  }

  isValid(x, y) {
    return x >= 0 && x < this.cols && y >= 0 && y < this.rows;
  }

  canMove(x, y, direction) {
    // 检查坐标是否有效
    if (!this.isValid(x, y)) return false;
    
    const cell = this.grid[y][x];
    switch(direction) {
      case 'up': return !cell.top && this.isValid(x, y - 1);
      case 'right': return !cell.right && this.isValid(x + 1, y);
      case 'down': return !cell.bottom && this.isValid(x, y + 1);
      case 'left': return !cell.left && this.isValid(x - 1, y);
      default: return false;
    }
  }
}