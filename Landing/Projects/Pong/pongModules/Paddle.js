const SPEED = .02;

export default class Paddle {
    constructor(paddleElm) {
        this.paddleElm = paddleElm;
        this.reset();
    }

    get position() {
        return parseFloat(getComputedStyle(this.paddleElm).getPropertyValue('--position'));
    }

    set position(value) {
        this.paddleElm.style.setProperty('--position', value);
    }

    rect() {
        return this.paddleElm.getBoundingClientRect();
    }

    reset() {
        this.position = 50;
    }

    update(deltaTime, ballHeight) {
        //if the ball is above the paddle, move the paddle up; if the ball is below the paddle, move the paddle down
        //the paddle will move faster the further away it is from the ball
        this.position += (ballHeight - this.position) * SPEED * deltaTime;
    }
}