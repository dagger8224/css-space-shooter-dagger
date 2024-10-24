export class Track {
    constructor (el) {
        this.container = el;
        this.stop();
    }
    start () {
        this.container.querySelectorAll('.track').forEach(track => {
            track.style.webkitAnimationPlayState = 'running';
            track.style.animationPlayState = 'running';
        });
    }
    stop () {
        this.container.querySelectorAll('.track').forEach(track => {
            track.style.webkitAnimationPlayState = 'paused';
            track.style.animationPlayState = 'paused';
        });
    }
    update (ship) {
        this.container.style.transform = `translateX(${ship.x * -0.3}px) translateY(${ship.y * -0.3}px)`;
    }
}