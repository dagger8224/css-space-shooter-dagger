
let score = 0;
let lives = 3;
let gameStarted = false;
let gamePaused = false;
let gameLost = false;
let gameWon = false;

const shipStartingX = 3000;
const shipStartingY = 6000;
const keysDown = [];

export class Game {
    constructor ({ display, SFX, Ship, Track, shotFactory, alienFactory, levelPlayer, music, visualizer, collisionDetector }) {
        this.ship = new Ship(document.querySelector('.ship-container'));
        this.ship.y = shipStartingY;
        this.ship.x = shipStartingX;
        this.track = new Track(document.querySelector('.midground'));
        this.display = display;
        this.shotFactory = shotFactory;
        this.alienFactory = alienFactory;
        this.levelPlayer = levelPlayer;
        this.sfx = new SFX();
        this.collisionDetector = collisionDetector;
        display.setAnnouncerElement(document.querySelector('.announcement'));
        display.setFirepowerElement(document.querySelector('.firepower-meter-container'));
        display.setScoreElement(document.querySelector('.score'));
        display.setLivesElement(document.querySelector('.lives-container'));
        shotFactory.setTemplate(document.querySelector('.shot'));
        alienFactory.setTemplate(document.querySelector('.alien-container'));
        levelPlayer.resetLevel();
        // set up the audio
        this.sfx.loadSounds(() => {
            music.load('./assets/sfx/music.mp3', () => {
                document.querySelector('.loader').classList.add('hidden');
                document.addEventListener('keydown', e => {
                    const { code } = e;
                    if (code === 'Space') {
                        if (this.state() === 'initialized') {
                            document.querySelector('.browser-warning').style.display = 'none';
                            this.start();
                            music.play();
                            visualizer.start(music);
                            document.querySelector('.title-screen-container').classList.add('hidden');
                        }
                    } else if (code === 'KeyP') {
                        if (this.state() === 'paused') {
                            this.resume();
                            music.resume();
                        } else {
                            this.pause();
                            music.pause();
                        }
                    } else if (code === 'KeyR') {
                        if (this.state() === 'won' || this.state() === 'lost') {
                            document.location.reload();
                        }
                    }
                });
                const instructionsDiv = document.querySelector('.instructions');
                const aboutDiv = document.querySelector('.about');
                instructionsDiv.querySelector('.open-instructions').addEventListener('click', e => {
                    instructionsDiv.classList.add('display');
                    e.preventDefault();
                });
                instructionsDiv.querySelector('.close-instructions').addEventListener('click', e => {
                    instructionsDiv.classList.remove('display');
                    e.preventDefault();
                });
                aboutDiv.querySelector('.open-about').addEventListener('click', e => {
                    aboutDiv.classList.add('display');
                    e.preventDefault();
                });
                aboutDiv.querySelector('.close-about').addEventListener('click', e => {
                    aboutDiv.classList.remove('display');
                    e.preventDefault();
                });
            });
            visualizer.setElement(document.querySelector('.visualizer'));
        });
        window.requestAnimationFrame(ts => this.tick(ts));
    }
    start () {
        gameStarted = true;
        this.display.showAll();
        this.sfx.sounds.ship.play(this.ship.x, this.ship.y);
        setTimeout(() => this.track.start(), 1000);
        document.addEventListener('keydown', e => {
            const { code } = e;
            if (keysDown.indexOf(code) === -1) {
                keysDown.push(code);
                if (code === 'KeyA') {
                    this.alienFactory.spawn();
                }
            }
        });
        document.addEventListener('keyup', e => {
            const { code } = e;
            keysDown.splice(keysDown.indexOf(code), 1);
        });
        document.addEventListener('hit', e => {
            const position = e.detail;
            score += 100 * this.shotFactory.firepower();
            this.levelPlayer.alienRemoved();
            this.sfx.sounds.explosion.play(position.x, position.y, position.z);
        });
        document.addEventListener('shot', e => {
            this.sfx.sounds.gun.play(this.ship, e.detail.firepower);
        });
        document.addEventListener('miss', e => {
            if (0 < lives) {
                lives--;
                this.display.updateLives(lives);
                this.sfx.sounds.alarm.play();
            }
            this.levelPlayer.alienRemoved();
        });
        document.body.style.cursor = 'none'; // TODO
    }
    pause () {
        gamePaused = true;
        this.display.showPausedMessage();
        this.track.stop();
        this.sfx.setGain(0);
        document.body.style.cursor = 'inherit';
    }
    resume () {
        gamePaused = false;
        this.display.hidePausedMessage();
        this.track.start();
        this.sfx.setGain(1);
        document.body.style.cursor = 'none';
        requestAnimationFrame(ts => this.tick(ts));
    }
    state () {
        let status = '';
        if (gameWon) {
            status = 'won';
        } else if (gameLost) {
            status = 'lost';
        } else if (!gameStarted) {
            status = 'initialized';
        } else if (gamePaused) {
            status = 'paused';
        } else {
            status = 'running';
        }
        return status;
    }
    fillInScoreCard () {
        const data = {
            score: Math.round(this.score).toLocaleString(),
            stage: this.levelPlayer.getCurrentStage()
        };
        const bestScore = localStorage['bestScore'];
        const bestStage = localStorage['bestStage'];
        if (typeof bestScore === 'undefined' || parseInt(bestScore.replace(',',''), 10) < parseInt(data.score.replace(',',''), 10)) {
            document.querySelector('.new-record.score').style.display = 'inline';
            bestScore = data.score;
            localStorage.setItem('bestScore', bestScore);
        }
        if (typeof bestStage === 'undefined' || bestStage < data.stage) {
            document.querySelector('.new-record.stage').style.display = 'inline';
            bestStage = data.stage;
            localStorage.setItem('bestStage', bestStage);
        }
        document.querySelector('.stage-reached').innerText = data.stage;
        document.querySelector('.best-stage').innerText = bestStage || data.stage;
        document.querySelector('.score-achieved').innerText = data.score;
        document.querySelector('.best-score').innerText = bestScore || data.score;
    }
    tick (timestamp) {
        let event = null;
        const ship = this.ship;
        if (!gameStarted) {
            ship.x = shipStartingX;
            ship.y = shipStartingY;
        }
        if (gameStarted && !gameLost) {
            if (keysDown.length > 0) {
                if (keysDown.indexOf('ArrowRight') !== -1) {
                    ship.moveLeft();
                }
                if (keysDown.indexOf('ArrowLeft') !== -1) {
                    ship.moveRight();
                }
                if (keysDown.indexOf('ArrowUp') !== -1) {
                    ship.moveUp();
                }
                if (keysDown.indexOf('ArrowDown') !== -1) {
                    ship.moveDown();
                }
                if (keysDown.indexOf('Space') !== -1) {
                    this.shotFactory.create(ship);
                }
            }
            event = this.levelPlayer.getEvents(timestamp);
            this.alienFactory.spawn(event);
            this.display.update(event, this.shotFactory.firepower(), score);
    
            this.sfx.sounds.ship.setParameters(ship.x, ship.y, ship.vx, ship.vy);
    
            // randomly make alien noises
            if (Math.random() < 0.001) {
                const aliens = this.alienFactory.aliens();
                if (0 < aliens.length) {
                    const alien = aliens[Math.floor(Math.random() * aliens.length)];
                    this.sfx.sounds.alien.play(alien.x, alien.y, alien.z);
                }
            }
            // update alien drone noises and add the sfx if not already there
            this.alienFactory.aliens().forEach(alien => {
                if (typeof alien.sound === 'undefined') {
                    alien.sound = this.sfx.sounds.alienDrone.create();
                }
                this.sfx.sounds.alienDrone.setParameters(alien.sound, alien, ship);
            })
        }
        ship.updatePosition(timestamp);
        this.track.update(ship);
        this.shotFactory.updatePositions(ship, timestamp);
        this.alienFactory.updatePositions(ship, timestamp);
        this.collisionDetector.check(this.shotFactory.shots(), this.alienFactory.aliens());
        if (event && event.type === 'completed') {
            if (!gameWon) {
                document.querySelector('.game-over-container').classList.remove('hidden');
                document.querySelector('.game-won').classList.remove('hidden');
                this.fillInScoreCard();
                gameWon = true;
            }
        }
        if (lives === 0) {
            if (!gameLost) {
                document.querySelector('.game-over-container').classList.remove('hidden');
                document.querySelector('.game-lost').classList.remove('hidden');
                this.fillInScoreCard();
                gameLost = true;
            }
        }
    
        if (!gamePaused) {
            window.requestAnimationFrame(ts => this.tick(ts));
        }
    }
};
