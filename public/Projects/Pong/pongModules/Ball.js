const INITIAL_VELOCITY = 0.035;
const VELOCITY_INCREASE = 0.00001;

export default class Ball {
    constructor(ballElm) {
        this.ballElm = ballElm;

        this.reset();
    };

    get x() {
        return parseFloat(getComputedStyle(this.ballElm).getPropertyValue('--x'));
    }

    set x(value) {
        this.ballElm.style.setProperty('--x', value);
    }

    get y() {
        return parseFloat(getComputedStyle(this.ballElm).getPropertyValue('--y'));
    }

    set y(value) {
        this.ballElm.style.setProperty('--y', value);
    }

    rect() {
        return this.ballElm.getBoundingClientRect();
    }

    reset() {
        this.x = 50;
        this.y = 50;
        //this is the direction the ball is going to move in
        //the unit vector is a vector with a length of 1 so that we can multiply it by the speed to get the velocity
        this.direction = {
            x: 0,
            y: 0
        };
        
        while (Math.abs(this.direction.x) <= 0.2 || Math.abs(this.direction.x) >= 0.9) {
            const heading = randomNumberBetween(0, 2 * Math.PI);
            //since we use 0-360 we are working with radians instead of degrees
            //this allows us to use the cos and sin functions to get the x and y components of the vector
            this.direction = {
                x: Math.cos(heading),
                y: Math.sin(heading)
            };
        }
        this.velocity = INITIAL_VELOCITY; 
    }

    update(deltaTime, paddleRects) {
        this.x += this.direction.x * this.velocity * deltaTime;
        this.y += this.direction.y * this.velocity * deltaTime;
        this.velocity == VELOCITY_INCREASE * deltaTime;
        const rect = this.rect();

        //if the ball hits the top or bottom of the screen, reverse the y direction
        if (rect.bottom >= window.innerHeight || rect.top <= 0) {
            this.direction.y *= -1;
        }

        if (paddleRects.some(paddleRect => isCollidingWith(paddleRect, rect))) {
            this.direction.x *= -1;

            setTimeout(() => this.ballElm.classList.toggle('hit'), 200);
            setTimeout(() => this.ballElm.classList.toggle('hit'), 400);
            setTimeout(() => this.ballElm.classList.toggle('hit'), 600);
            setTimeout(() => this.ballElm.classList.toggle('hit'), 800);
        }
    };
};

function randomNumberBetween(min, max) {
    return Math.random() * (max - min) + min;
}

function isCollidingWith(rect1, rect2) {
    return rect1.left <= rect2.right && rect1.right >= rect2.left && rect1.top <= rect2.bottom && rect1.bottom >= rect2.top;
}