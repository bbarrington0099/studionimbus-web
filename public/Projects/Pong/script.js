//Import the classes
import Ball from './pongModules/Ball.js';
import Paddle from './pongModules/Paddle.js';

//Update Loop
//the game is going to run inside of an update loop 
//this is a loop that will call a function every frame


const ball = new Ball(document.getElementById('ball'));
const playerPaddle = new Paddle(document.getElementById('player-paddle'));
const computerPaddle = new Paddle(document.getElementById('computer-paddle'));
const playerScore = document.getElementById('player-score');
const computerScore = document.getElementById('computer-score');

let lastTime;
function update(time) {

    if (lastTime != null) {
        //calculate the time since the last frame
        const deltaTime = time - lastTime;

        //update the ball based on the time since the last frame
        ball.update(deltaTime, [playerPaddle.rect(), computerPaddle.rect()]);
        computerPaddle.update(deltaTime, ball.y);
        const hue = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hue'));
        document.documentElement.style.setProperty('--hue', hue + 0.075);

        if (isLose()) handleLose();
    }

    lastTime = time;
    //continue the loop of calling the update function every frame
    window.requestAnimationFrame(update);
}

function isLose() {
    const rect = ball.rect();
    return rect.right >= window.innerWidth || rect.left <= 0;
}

function handleLose() {
    const rect = ball.rect();
    if (rect.right >= window.innerWidth) {
        playerScore.textContent = parseInt(playerScore.textContent) + 1;
    } else {
        computerScore.textContent = parseInt(computerScore.textContent) + 1;
    }
    ball.reset();
    computerPaddle.reset();
}

document.addEventListener('mousemove', event => {
    //set the position of the paddle to the y position of the mouse
    //because the paddle position is in vh, we need to convert the mouse position to vh from px
    playerPaddle.position = (event.y / window.innerHeight) * 100;
});

//this is a built in function that will call the update function every frame
window.requestAnimationFrame(update);