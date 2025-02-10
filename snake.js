const canvas = document.getElementById('canvas-snake');
const context = canvas.getContext('2d');
let raf;

const config = {
    snakeLength: 5,
    cellSize: 20,
    snakeColor: '#00b300',
    foodColor: '#ff3636',
    backgroundColor: '#fffae6',
    gridColor: '#262626',
    initialDirection: 'right',
    frameDelay: 20 // Змейка будет двигаться каждые N кадров
};

const state = {
    snake: [],
    food: { x: 0, y: 0 },
    direction: config.initialDirection,
    directionQueue: config.initialDirection,
    score: 0,
    foodX: [],
    foodY: []
};

let frameCount = 0; // Счётчик кадров

// Заполняем массивы координат для еды
for (let i = 0; i <= canvas.width - config.cellSize; i += config.cellSize) {
    state.foodX.push(i);
    state.foodY.push(i);
}

// Делаем canvas фокусируемым
canvas.setAttribute('tabindex', 1);
canvas.style.outline = 'none';
canvas.focus();

// Отрисовка фона и сетки
function drawBackground() {
    context.fillStyle = config.backgroundColor;
    context.strokeStyle = config.gridColor;

    context.fillRect(0, 0, canvas.width, canvas.height);

    for (let x = 0; x <= canvas.width; x += config.cellSize) {
        context.moveTo(x, 0);
        context.lineTo(x, canvas.height);
    }
    for (let y = 0; y <= canvas.height; y += config.cellSize) {
        context.moveTo(0, y);
        context.lineTo(canvas.width, y);
    }

    context.stroke();
}

// Отрисовка квадрата (сегмент змейки или еда)
function drawSquare(x, y, color) {
    context.fillStyle = color;
    context.fillRect(x, y, config.cellSize, config.cellSize);
}

// Проверка столкновений
function checkCollision(x1, y1, x2, y2) {
    return x1 === x2 && y1 === y2;
}

// Создание еды
function createFood() {
    let collision;
    do {
        state.food.x = state.foodX[Math.floor(Math.random() * state.foodX.length)];
        state.food.y = state.foodY[Math.floor(Math.random() * state.foodY.length)];
        collision = state.snake.some(segment => checkCollision(state.food.x, state.food.y, segment.x, segment.y));
    } while (collision);
}

// Отрисовка еды
function drawFood() {
    drawSquare(state.food.x, state.food.y, config.foodColor);
}

// Создание змейки
function createSnake() {
    state.snake = [];
    for (let i = config.snakeLength; i > 0; i--) {
        state.snake.push({ x: i * config.cellSize, y: 0 });
    }
}

// Отрисовка змейки
function drawSnake() {
    state.snake.forEach(segment => drawSquare(segment.x, segment.y, config.snakeColor));
}

// Изменение направления
function changeDirection(keyCode) {
    const keyToDirection = {
        ArrowLeft: 'left',
        ArrowUp: 'up',
        ArrowRight: 'right',
        ArrowDown: 'down'
    };

    const newDirection = keyToDirection[keyCode];
    const oppositeDirections = {
        left: 'right',
        right: 'left',
        up: 'down',
        down: 'up'
    };

    if (newDirection && state.direction !== oppositeDirections[newDirection]) {
        state.directionQueue = newDirection;
    }
}

// Движение змейки
function moveSnake() {
    const head = { ...state.snake[0] };
    state.direction = state.directionQueue;

    switch (state.direction) {
        case 'right': head.x += config.cellSize; break;
        case 'left': head.x -= config.cellSize; break;
        case 'up': head.y -= config.cellSize; break;
        case 'down': head.y += config.cellSize; break;
    }

    state.snake.unshift(head);
    if (!checkCollision(head.x, head.y, state.food.x, state.food.y)) {
        state.snake.pop();
    } else {
        createFood();
        state.score += 10;
    }
}

// Проверка столкновений
function checkGameOver() {
    const head = state.snake[0];
    const hitWall = head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height;
    const hitSelf = state.snake.slice(1).some(segment => checkCollision(head.x, head.y, segment.x, segment.y));

    if (hitWall || hitSelf) {
        resetGame();
    }
}

// Сброс игры
function resetGame() {
    createSnake();
    createFood();
    state.direction = config.initialDirection;
    state.directionQueue = config.initialDirection;
    state.score = 0;
    frameCount = 0; // Сбрасываем счётчик кадров
}

// Основной игровой цикл
function game() {
    frameCount++;

    // Обновляем позицию змейки только каждые config.frameDelay кадров
    if (frameCount % config.frameDelay === 0) {
        checkGameOver();
        moveSnake();
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    drawSnake();
    drawFood();

    raf = window.requestAnimationFrame(game);
}

// Инициализация игры
function init() {
    canvas.addEventListener('keydown', (evt) => {
        evt.preventDefault();
        changeDirection(evt.code);
    });

    resetGame();
    drawBackground();
    game();
}

init();

// canvas.addEventListener('mouseout', function () {
//     window.cancelAnimationFrame(raf);
// });