import { getInputDirection } from "./input.js";

export const SNAKE_SPEED = 5;
const snakeBody = [ 
    { x: 10, y: 11 }
];
let newSegments = 0;

export function update() {
    addSegment();
    const inputDirection = getInputDirection();

    //replace each segment of the snake with the segment ahead of it
    for (let i = snakeBody.length - 2; i >= 0; i-- ) {
        snakeBody[i + 1] = { ...snakeBody[i]};
    }
    //move the head of the snake
    snakeBody[0].x += inputDirection.x;
    snakeBody[0].y += inputDirection.y;
}

export function draw(gameBoard) {
    snakeBody.forEach(segment => {
        const snakeElm = document.createElement('div');
        snakeElm.style.gridRowStart = segment.y;
        snakeElm.style.gridColumnStart = segment.x;
        snakeElm.classList.add('snake');
        gameBoard.appendChild(snakeElm);
    })
}

export function expandSnake(amount) {
    newSegments += amount;
}

export function onSnake(position, { ignoreHead = false } = {}) {
    return snakeBody.some((segment, index) => {
        if (ignoreHead && index === 0) return false;
        return equalPositions(segment, position);
    })
};

export function getSnakeHead() {
    return snakeBody[0];
};

export function snakeIntersection() {
    return onSnake(snakeBody[0], { ignoreHead: true });
}

function equalPositions(pos1, pos2) {
    return pos1.x === pos2.x && pos1.y === pos2.y
}

function addSegment() {
    for (let i = 0; i < newSegments; i++) {
        snakeBody.push({ ...snakeBody[snakeBody.length - 1]});
    }

    newSegments = 0;
}