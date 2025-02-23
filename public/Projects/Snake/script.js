import { SNAKE_SPEED, update as updateSnake, draw as drawSnake, getSnakeHead, snakeIntersection } from './snakeModules/Snake.js';
import { update as updateFood, draw as drawFood } from './snakeModules/Food.js';
import { outsideGrid } from './snakeModules/grid.js';
let lastRenderTime = 0;
let gameOver = false;
const gameBoard = document.getElementById('gameBoard');

//game loop, function that repeats itself on a set interval to update the render
//such as snake position, food, etc

function main(currentTime) {
    if (gameOver) {
        if (confirm('You lost. Press OK to restart.')) {
            window.location = './index.html';
        }
        return;
    }
    window.requestAnimationFrame(main);
    const secondsSinceLastRender = (currentTime - lastRenderTime) / 1000;
    if (secondsSinceLastRender < 1 / SNAKE_SPEED) return;

    lastRenderTime = currentTime;

    update();
    draw();
}

window.requestAnimationFrame(main);

function update() {
    updateSnake();
    updateFood();
    checkDeath();
}

function draw() {
    gameBoard.innerHTML = '';
    drawSnake(gameBoard);
    drawFood(gameBoard);
}

function checkDeath() {
    gameOver = outsideGrid(getSnakeHead()) || snakeIntersection();
};