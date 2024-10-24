let ship = null;
let track = null;
let score = 0;
let lives = 3;
let gameStarted = false;
let gamePaused = false;
let gameLost = false;
let gameWon = false;

const shipStartingX = 3000;
const shipStartingY = 6000;
const keysDown = [];

const fillInScoreCard = () => {
    const data = game.getScoreCardInfo();

    const bestScore = localStorage['bestScore'];
    const bestStage = localStorage['bestStage'];

    if (typeof bestScore === 'undefined' || parseInt(bestScore.replace(',',''), 10) < parseInt(data.score.replace(',',''), 10)) {
            document.querySelector('.new-record.score').style.display = 'inline';
            localStorage['bestScore'] = bestScore = data.score;
    }
    if (typeof bestStage === 'undefined' || bestStage < data.stage) {
            document.querySelector('.new-record.stage').style.display = 'inline';
            localStorage['bestStage'] = bestStage = data.stage;
    }

    document.querySelector('.stage-reached').innerText = data.stage;
    document.querySelector('.best-stage').innerText = bestStage || data.stage;
    document.querySelector('.score-achieved').innerText = data.score;
    document.querySelector('.best-score').innerText = bestScore || data.score;
};

const tick = (timestamp, alienFactory, shotFactory, display, sfx, levelPlayer)  => {
    if (!gameStarted) {
        ship.x = shipStartingX;
        ship.y = shipStartingY;
    }
    if (gameStarted && !gameLost) {
        if (keysDown.length > 0) {
            if (keysDown.indexOf(39) !== -1) {
                ship.moveLeft();
            }
            if (keysDown.indexOf(37) !== -1) {
                ship.moveRight();
            }
            if (keysDown.indexOf(38) !== -1) {
                ship.moveUp();
            }
            if (keysDown.indexOf(40) !== -1) {
                ship.moveDown();
            }
            if (keysDown.indexOf(32) !== -1) {
                shotFactory.create(ship);
            }
        }
        const event = levelPlayer.getEvents(timestamp);
        alienFactory.spawn(event);
        display.update(event, shotFactory.firepower(), score);

        sfx.sounds.ship.setParameters(ship.x, ship.y, ship.vx, ship.vy);

        // randomly make alien noises
        if (Math.random() < 0.001) {
            const aliens = alienFactory.aliens();
            if (0 < aliens.length) {
                const alien = aliens[Math.floor(Math.random() * aliens.length)];
                sfx.sounds.alien.play(alien.x, alien.y, alien.z);
            }
        }
        // update alien drone noises and add the sfx if not already there
        alienFactory.aliens().forEach(function(alien) {
            if (typeof alien.sound === 'undefined') {
                alien.sound = sfx.sounds.alienDrone.create();
            }
            sfx.sounds.alienDrone.setParameters(alien.sound, alien, ship);
        })
    }

    ship.updatePosition(timestamp);
    track.update(ship);
    shotFactory.updatePositions(ship, timestamp);
    alienFactory.updatePositions(ship, timestamp);
    collisionDetector.check(shotFactory.shots(), alienFactory.aliens());

    if (event && event.type === 'completed') {
        if (!gameWon) {
            document.querySelector('.game-over-container').classList.remove('hidden');
            document.querySelector('.game-won').classList.remove('hidden');
            fillInScoreCard();
            gameWon = true;
        }
    }
    if (lives === 0) {
        if (!gameLost) {
            document.querySelector('.game-over-container').classList.remove('hidden');
            document.querySelector('.game-lost').classList.remove('hidden');
            fillInScoreCard();
            gameLost = true;
        }
    }

    if (!gamePaused) {
        window.requestAnimationFrame(ts => tick(ts, alienFactory, shotFactory, display, sfx, levelPlayer));
    }
};

export const game = {
    init: ({ display, sfx, Ship, Track, shotFactory, alienFactory, levelPlayer }) => {
        ship = new Ship(document.querySelector('.ship-container'));
        ship.y = shipStartingY;
        ship.x = shipStartingX;
        track = new Track(document.querySelector('.midground'));
        display.setAnnouncerElement(document.querySelector('.announcement'));
        display.setFirepowerElement(document.querySelector('.firepower-meter-container'));
        display.setScoreElement(document.querySelector('.score'));
        display.setLivesElement(document.querySelector('.lives-container'));
        shotFactory.setTemplate(document.querySelector('.shot'));
        alienFactory.setTemplate(document.querySelector('.alien-container'));
        levelPlayer.resetLevel();
        // set up the audio
        sfx.loadSounds(() => {
            music.load('./assets/sfx/music.mp3', () => {
                document.querySelector('.loader').classList.add('hidden');
                document.addEventListener('keydown', (e) => {
                    const keyCode = e.which;
                    if (keyCode === 32) {
                        if (game.state() === 'initialized') {
                            document.querySelector('.browser-warning').style.display = 'none';
                            game.start();
                            music.play();
                            visualizer.start(music);
                            document.querySelector('.title-screen-container').classList.add('hidden');
                        }
                    }
                    if (keyCode === 80) {
                        if (game.state() === 'paused') {
                            game.resume();
                            music.resume();
                        } else {
                            game.pause();
                            music.pause();
                        }
                    }
                    if (keyCode === 82) {
                        if (game.state() === 'won' || game.state() === 'lost') {
                            document.location.reload();
                        }
                    }
                });
            
                const instructionsDiv = document.querySelector('.instructions');
                const aboutDiv = document.querySelector('.about');
            
                instructionsDiv.querySelector('.open-instructions').addEventListener('click', function(e) {
                    instructionsDiv.classList.add('display');
                    e.preventDefault();
                });
                instructionsDiv.querySelector('.close-instructions').addEventListener('click', function(e) {
                    instructionsDiv.classList.remove('display');
                    e.preventDefault();
                });
                aboutDiv.querySelector('.open-about').addEventListener('click', function(e) {
                    aboutDiv.classList.add('display');
                    e.preventDefault();
                });
                aboutDiv.querySelector('.close-about').addEventListener('click', function(e) {
                    aboutDiv.classList.remove('display');
                    e.preventDefault();
                });
            });
            visualizer.setElement(document.querySelector('.visualizer'));
        });
        window.requestAnimationFrame(ts => tick(ts, alienFactory, shotFactory, display, sfx, levelPlayer));
    },
    start: (display, sfx) => {
        gameStarted = true;
        display.showAll();
        sfx.sounds.ship.play(ship.x, ship.y);
        setTimeout(track.start, 1000);
        document.addEventListener('keydown', function (e) {
            const keyCode = e.which;
            if (keysDown.indexOf(keyCode) === -1) {
                keysDown.push(keyCode);
                if (keyCode === 65) {
                    alienFactory.spawn();
                }
            }
        });
        document.addEventListener('keyup', function (e) {
            const keyCode = e.which;
            keysDown.splice(keysDown.indexOf(keyCode), 1);
        });
    
        document.addEventListener('hit', function (e) {
            const position = e.detail;
            score += 100 * shotFactory.firepower();
            levelPlayer.alienRemoved();
            sfx.sounds.explosion.play(position.x, position.y, position.z);
        });
    
        document.addEventListener('shot', function (e) {
            sfx.sounds.gun.play(ship, e.detail.firepower);
        });
    
        document.addEventListener('miss', function (e) {
            if (0 < lives) {
                lives--;
                display.updateLives(lives);
                sfx.sounds.alarm.play();
            }
            levelPlayer.alienRemoved();
        });
        document.body.style.cursor = 'none'; // TODO
    },
    pause: (display, sfx, track) => {
        gamePaused = true;
        display.showPausedMessage();
        track.stop();
        sfx.setGain(0);
        document.body.style.cursor = 'inherit';
    },
    resume: (display, sfx, track) => {
        gamePaused = false;
        display.hidePausedMessage();
        track.start();
        sfx.setGain(1);
        document.body.style.cursor = 'none';
        requestAnimationFrame(ts => tick(ts, alienFactory, shotFactory, display, sfx, levelPlayer));
    },
    state: () => {
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
    },
    getScoreCardInfo: levelPlayer => ({
        score: Math.round(score).toLocaleString(),
        stage: levelPlayer.getCurrentStage()
    })
};
