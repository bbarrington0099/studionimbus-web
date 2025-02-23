const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const increaseBtn = document.getElementById('increase');
const decreaseBtn = document.getElementById('decrease');
const sizeElm = document.getElementById('size');
const colorElm = document.getElementById('color');
const clearElm = document.getElementById('clear');

let isPressed = false;
let size = 10;
let color = 'black';
let x;
let y;

canvas.addEventListener('mousedown', (e) => {
    isPressed = true;

    x = e.offsetX;
    y = e.offsetY;
})

canvas.addEventListener('mouseup', () => {
    isPressed = false;

    x = undefined;
    y = undefined;
})

canvas.addEventListener('mousemove', (e) => {
    if (isPressed) {
        const xNext = e.offsetX;
        const yNext = e.offsetY;

        drawCircle(xNext, yNext);
        drawLine(x, y, xNext, yNext);

        x = xNext;
        y = yNext;
    }
})

function drawCircle(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
}

function drawLine(xStart, yStart, xEnd, yEnd) {
    ctx.beginPath();
    //move to is like start your pen here
    ctx.moveTo(xStart, yStart);
    //line to is like draw a line to here
    ctx.lineTo(xEnd, yEnd);
    ctx.strokeStyle = color;
    ctx.lineWidth = size * 2;
    ctx.stroke();
}

function updateSizeOnScreen() {
    sizeElm.innerText = size;
}

increaseBtn.addEventListener('click', () => {
    size += 5;

    if (size > 50) {
        size = 50;
    }

    updateSizeOnScreen();
})

decreaseBtn.addEventListener('click', () => {
    size -= 5;

    if (size < 5) {
        size = 5;
    }

    updateSizeOnScreen();
})

colorElm.addEventListener('change', (e) => {
    color = e.target.value;
})

clearElm.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
})