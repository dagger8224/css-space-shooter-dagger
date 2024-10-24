// Constants
const A = 50; // acceleration factor
const D = 200; // deceleration factor
const AA = 100; // angular acceleration factor
const AD = 130; // angular deceleration factor
const MAX_V = 500; // maximum permitted linear velocity
const MAX_AV = 200; // maximum permitted angular acceleration
// field boundary limits
const MIN_X = -document.documentElement.clientWidth * 0.4;
const MAX_X = document.documentElement.clientWidth * 0.4;
const MAX_Y = document.documentElement.clientHeight * 0.4;
const MIN_Y = -document.documentElement.clientHeight * 0.4;

const applyDeceleration = (oldValue, decelerationFactor) => {
    let newValue = 0;
    if (0 < oldValue) {
        newValue  =  oldValue - decelerationFactor;
    } else if (oldValue < 0) {
        newValue = oldValue + decelerationFactor;
    } else {
        newValue = oldValue;
    }
    if (Math.abs(oldValue) < decelerationFactor) {
        newValue = 0;
    }
    if (MAX_V < newValue) {
        newValue = MAX_V;
    }
    if (newValue < -MAX_V) {
        newValue = -MAX_V;
    }
    return newValue;
};

const applyRotationalDeceleration = (oldValue, currentAngle, targetAngle, decelerationFactor) => {
    let newValue = 0;
    const delta = currentAngle - targetAngle;
    if (0 < delta) {
        newValue =  -delta * decelerationFactor;
    } else if (delta < 0) {
        newValue = -delta * decelerationFactor;
    } else {
        newValue = oldValue;
    }
    if (Math.abs(targetAngle - currentAngle) < decelerationFactor) {
       newValue = 0;
    }
    if (MAX_AV < newValue) {
        newValue = MAX_AV;
    }
    if (newValue < -MAX_AV) {
        newValue = -MAX_AV;
    }
    return newValue;
};

export class Ship {
    constructor (containerElement) {
        this.el = containerElement;
        this.lastTimestamp = null;
        // linear position
        this.x = 0;
        this.y = 100;
        this.z = 0;
        // linear velocity
        this.vx = 0;
        this.vy = 0;
        // rotational position
        this.rx = 90;
        this.ry = 0;
        this.rz = 0;
        // rotational velocity
        this.vrx = 0;
        this.vry = 0;
        this.vrz = 0;
    }
    moveLeft () {
        this.vx += A;
        this.vry += AA;
        this.vrz += AA/2;
    }
    moveRight () {
        this.vx-= A;
        this.vry -= AA;
        this.vrz -= AA/2;
    }
    moveUp () {
        this.vy -= A;
        this.vrx -= AA/1.3;
    }
    moveDown () {
        this.vy += A;
        this.vrx += AA/1.3;
    };
    updatePosition (timestamp) {
        let step = 0;
        if (this.lastTimestamp === null ||
            100 < timestamp - this.lastTimestamp) {
            this.lastTimestamp = timestamp;
        }
        step = (timestamp - this.lastTimestamp) / 1000;
        this.lastTimestamp = timestamp;
        const bounceFactor = 0.5;
        let delta = 0;
        if (MAX_X < this.x) {
            delta = this.x - MAX_X;
            this.vx -= delta * bounceFactor;
        }
        if (this.x < MIN_X) {
            delta = MIN_X - this.x;
            this.vx += delta * bounceFactor;
        }
        if (MAX_Y < this.y) {
            delta = this.y - MAX_Y;
            this.vy -= delta * bounceFactor;
        }
        if (this.y < MIN_Y) {
            delta = MIN_Y - this.y;
            this.vy += delta * bounceFactor;
        }
        this.x += this.vx * step;
        this.y += this.vy * step;
        this.ry += this.vry * step;
        this.rz += this.vrz * step;
        this.rx += this.vrx * step;
        this.vx = applyDeceleration(this.vx, D * step);
        this.vy = applyDeceleration(this.vy, D * step);
        this.vrx = applyRotationalDeceleration(this.vrx, this.rx, 90, AD * step);
        this.vry = applyRotationalDeceleration(this.vry, this.ry, 0, AD * step);
        this.vrz = applyRotationalDeceleration(this.vrz, this.rz, 0, AD * step);
        this.el.style.transform = `translateZ(${this.z}px) translateX(${this.x}px) translateY(${this.y}px) rotateX(${this.rx}deg) rotateY(${this.ry}deg) rotateZ(${this.rz}deg)`;
    }
};
