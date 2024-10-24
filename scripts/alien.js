let alienElement = null;
const range = -15000;
const aliens = [];
const viewportWidth = document.documentElement.clientWidth;
const viewportHeight = document.documentElement.clientHeight;

class Alien {
    constructor (el, x, y, alienDefinition) {
        this.el = el;
        this.x = x;
        this.y = y;
        this.z = range;
        this.actualX = x; // actual values include modifications made by the motion function, and should be
        this.actualY = y; // used by external methods to query the actual position of the alien.
        this.lastTimestamp = null;
        this.hit = false; // has the alien been hit by a shot?
        this.destroyed = false; // has it exploded from being hit?
        /**
                 * Alien motion functions. All take the z position of the alien as an argument, and return
                 * an object with x and y properties.
                 * The functions are called within the context of an alien object, so `this` will refer to
                 * the alien itself.
                 */
        let colorClass = '';
        if (alienDefinition.class === ALIEN_CLASS.stationary) {
            colorClass = 'orange';
            this.motionFunction = () => ({
                x: this.x,
                y: this.y
            });
        } else if (alienDefinition.class === ALIEN_CLASS.vertical) {
            colorClass = 'red';
            this.motionFunction = () => ({
                x: this.x,
                y: this.y + Math.sin(this.z / 1000 * alienDefinition.speed) * viewportHeight / 4
            });
        } else if (alienDefinition.class === ALIEN_CLASS.horizontal) {
            colorClass = 'blue';
            this.motionFunction = () => ({
                x: this.x + Math.sin(this.z / 1000 * alienDefinition.speed) * viewportWidth / 4,
                y: this.y
            });
        } else if (alienDefinition.class === ALIEN_CLASS.spiral) {
            colorClass = 'green';
            this.motionFunction = () => ({
                x: this.x + Math.sin(this.z / 1000 * alienDefinition.speed) * viewportWidth / 4,
                y: this.y + Math.cos(this.z / 1000 * alienDefinition.speed) * viewportWidth / 4
            });
        } else if (alienDefinition.class === ALIEN_CLASS.random) {
            colorClass = 'white';
            const noiseX = new Simple1DNoise(viewportWidth / 2);
            const noiseY = new Simple1DNoise(viewportHeight / 2);
            this.motionFunction = () => ({
                x: this.x + noiseX.getVal(this.z / 1000 * alienDefinition.speed),
                y: this.y + noiseY.getVal(this.z / 1000 * alienDefinition.speed)
            });
        }
        this.el.classList.add(colorClass);
    }
    updatePosition (shipX, shipY, timestamp) {
        const actualPosition = this.motionFunction();
        const offsetX = this.x - shipX;
        const offsetY = this.y - shipY;
        const opacity =  Math.min(1 - this.z / range / 2, 1);

        this.actualX = actualPosition.x;
        this.actualY = actualPosition.y;

        if (this.lastTimestamp === null || 100 < timestamp - this.lastTimestamp) {
            this.lastTimestamp = timestamp;
        }
        const zSpeed = 1000; // how fast it advances towards the player
        this.z += (timestamp - this.lastTimestamp) / 1000 * zSpeed;
        this.lastTimestamp = timestamp;
        this.el.style.transform = `translateY(${actualPosition.y + offsetY}px) translateX(${actualPosition.x + offsetX}px) translateZ(${this.z}px)`;
        this.el.style.opacity = opacity;
        this.el.style.display = 'block';
        if (this.hit) {
            this.el.classList.add('hit');
            setTimeout(() => {
                this.destroyed = true;
            }, 1200);
        }
        if (500 < this.z && this.hit === false) {
            document.dispatchEvent(new CustomEvent('miss', { 'detail': -500 }));
        }
        return 500 < this.z || this.destroyed;
    }
};

export const alienFactory = {
    setTemplate: el => {
        alienElement = el.cloneNode(true);
    },
    spawn: event => {
        if (event.type && event.type === 'spawn') {
            event.data.forEach(alienDefinition => {
                const newElement = alienElement.cloneNode(true);
                const spawnX = viewportWidth * (Math.random() - 0.5) * 0.7;
                const spawnY = viewportHeight * (Math.random() - 0.5) * 0.5;
                const sceneDiv = document.querySelector('.scene');
                sceneDiv.insertBefore(newElement, sceneDiv.children[0]);
                aliens.push(new Alien(newElement, spawnX, spawnY, alienDefinition));
            });
        }
    },
    updatePositions: (ship, timestamp) => {
        let el = null;
        let remove = null;
        const aliensToRemove = [];
        for(let i = 0; i < aliens.length; i++) {
            remove = aliens[i].updatePosition(ship.x, ship.y, timestamp);
            if (remove) {
                aliensToRemove.push(i);
            }
        }
        // remove any aliens that have made it past the player
        for(let i = aliensToRemove.length - 1; i >= 0; --i) {
            el = aliens[aliensToRemove[i]].el;
            aliens.splice(aliensToRemove[i], 1)[0].sound.stop();
            document.querySelector('.scene').removeChild(el);
        }
        return aliensToRemove.length;
    },
    aliens: () => aliens
};
