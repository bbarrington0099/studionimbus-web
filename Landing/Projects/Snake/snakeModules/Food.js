import { onSnake, expandSnake } from './Snake.js';
import { randomGridPosition } from './grid.js';

let food = getRandomFoodPosition();
const EXPANSION_RATE = 1;

export function update() {
    if (onSnake(food)) {
        expandSnake(EXPANSION_RATE);
        food = getRandomFoodPosition();
    }
}

export function draw(gameBoard) {
    const foodElm = document.createElement('div');
    foodElm.style.gridRowStart = food.y;
    foodElm.style.gridColumnStart = food.x;
    foodElm.classList.add('food');
    gameBoard.appendChild(foodElm);
}

function getRandomFoodPosition() {
    let newFoodPosition;
    while (newFoodPosition == null || onSnake(newFoodPosition)) {
        newFoodPosition = randomGridPosition();
    }
    return newFoodPosition;
}