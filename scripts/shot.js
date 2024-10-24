
const range = 15000; // how far into the distance before it disappears
const speed = 5000; // distance (in pixels) travelled in 1 second;

class Shot {
    constructor (el, x, y) {
        this.lastTimestamp = null;
        this.el = el;
        this.x = x;
        this.y = y;
        this.z = 0;
        this.hit = false; // has the shot collided with an alien?
    }
    updatePosition (x, y, timestamp) {
        if (this.lastTimestamp === null ||
            100 < timestamp - this.lastTimestamp) {
            this.lastTimestamp = timestamp;
        }
        this.z -= (timestamp - this.lastTimestamp) / 1000 * speed;
        this.lastTimestamp = timestamp;
        const offsetX = this.x - x;
        const offsetY = this.y - y;
        const opacity = (range + this.z) / range;
        this.el.style.transform = `translateY(${this.y + offsetY}px) translateX(${this.x + offsetX}px) translateZ(${this.z}px) rotateX(90deg)`;
        this.el.style.opacity = opacity;
        return this.z < -range || this.hit;
    }
};


let canFire = true;
const throttle = (fn, delay) => {
    if (canFire) {
        fn();
        canFire = false;
        setTimeout(() => {
            canFire = true;
        }, delay);
    }
};

const MAX_FIREPOWER = 10;
const FIREPOWER_GAIN_PER_SECOND = 4;
const shots = [];
let shotElement = null;
let lastTimestamp = null;
let firepower = MAX_FIREPOWER;

export const shotFactory = {
    setTemplate: el => {
        shotElement = el.cloneNode(false);
        shotElement.style.display = 'block';
    },
    create: ship => {
        if (0 < Math.round(firepower)) {
            throttle(() => {
                if (3 < firepower) {
                    const spread = document.documentElement.clientWidth * 0.03;
                    const shotL = {
                        x: ship.x - spread * Math.cos(ship.ry * (Math.PI/180)),
                        y: ship.y - Math.tan(ship.ry * (Math.PI/180)) * spread
                    };
                    const shotR = {
                        x: ship.x + spread * Math.cos(ship.ry * (Math.PI/180)),
                        y: ship.y + Math.tan(ship.ry * (Math.PI/180)) * spread
                    };
                    const shotLeftElement = shotElement.cloneNode(false);
                    document.querySelector('.scene').appendChild(shotLeftElement);
                    shots.push(new Shot(shotLeftElement, shotL.x, shotL.y));
                    const shotRightElement = shotElement.cloneNode(false);
                    document.querySelector('.scene').appendChild(shotRightElement);
                    shots.push(new Shot(shotRightElement, shotR.x, shotR.y));

                } else {
                    const newElement = shotElement.cloneNode(false);
                    document.querySelector('.scene').appendChild(newElement);
                    shots.push(new Shot(newElement, ship.x, ship.y));
                }
                document.dispatchEvent(new CustomEvent('shot', { 'detail': { firepower } }));
                firepower--;

            }, 150);
        }
    },
    updatePositions: (ship, timestamp) => {
        const shotsToRemove = [];
        for(let i = 0; i < shots.length; i++) {
            if (shots[i].updatePosition(ship.x, ship.y, timestamp)) {
                shotsToRemove.push(i);
            }
        }
        // remove any shots that have gone too distant
        for(i = shotsToRemove.length - 1; i >= 0; --i) {
            const el = shots[shotsToRemove[i]].el;
            shots.splice(shotsToRemove[i], 1);
            document.querySelector('.scene').removeChild(el);
        }
        if (lastTimestamp === null ||
            100 < timestamp - lastTimestamp) {
            lastTimestamp = timestamp;
        }
        if (firepower < MAX_FIREPOWER) {
            firepower += (timestamp - lastTimestamp) * FIREPOWER_GAIN_PER_SECOND / 1000;
        }
        lastTimestamp = timestamp;
    },
    shots: () => shots,
    firepower: () => firepower
};
