class Announcer {
    constructor (el) {
        this.container = el;
    }
    showMessage (message, autoHide) {
        autoHide = autoHide || false;
        this.container.querySelector('.title').innerHTML = (typeof title === 'undefined') ? '' : title;
        this.container.querySelector('.subtitle').innerHTML = (typeof message.subtitle === 'undefined') ? '' : message.subtitle;
        this.container.classList.add('visible');
        if (autoHide) {
            setTimeout(() => this.hideMessage(), 2000);
        }
    }
    hideMessage () {
        this.container.classList.remove('visible');
    }
    setTitle (title) {
        this.container.querySelector('.title').innerHTML = (typeof title === 'undefined') ? '' : title;
    }
};

let announcer = null;
let firepowerContainer = null;
let score = null;
let livesContainer = null;

export const display = {
    setAnnouncerElement: el => {
        announcer = new Announcer(el);
    },
    setFirepowerElement: el => {
        firepowerContainer = el;
    },
    setScoreElement: el => {
        score = el;
    },
    setLivesElement: el => {
        livesContainer = el;
    },
    hideAll: () => {
        firepowerContainer.classList.add('hidden');
        score.parentElement.classList.add('hidden');
        livesContainer.classList.add('hidden');
    },
    showAll: () => {
        firepowerContainer.classList.remove('hidden');
        score.parentElement.classList.remove('hidden');
        livesContainer.classList.remove('hidden');
    },
    update: (event, firepower, newScore) => {
        if (event.type && event.type === 'announcement') {
            announcer.showMessage(event.data, true);
        }
        firepowerContainer.style.width = (firepower * 30) + 'px';
        score.innerHTML = Math.round(newScore).toLocaleString();
    },
    showPausedMessage: () => {
        announcer.showMessage({ title: 'Paused', subtitle: 'Press "p" to resume'});
    },
    hidePausedMessage: () => {
        announcer.hideMessage();
    },
    updateLives: livesRemaining => {
        const totalLives = 3;
        for (let i = totalLives; i > 0; i--) {
            if (i <= livesRemaining) {
                livesContainer.children[i-1].classList.remove('hidden');
            } else {
                livesContainer.children[i - 1].classList.add('hidden');
            }
        }
    }
};
