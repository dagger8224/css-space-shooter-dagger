class BufferLoader {
    constructor (context, urlList, callback) {
        this.context = context;
        this.urlList = urlList;
        this.onload = callback;
        this.bufferList = [];
        this.loadCount = 0;
    }
    load () {
        for (let i = 0; i < this.urlList.length; ++i) {
            this.loadBuffer(this.urlList[i], i);
        }
    }
    loadBuffer (url, index) {
        // Load buffer asynchronously
        const request = new XMLHttpRequest();
        request.open("GET", url, true);
        request.responseType = "arraybuffer";
        request.onload = () => {
          // Asynchronously decode the audio file data in request.response
          this.context.decodeAudioData(
            request.response,
            buffer => {
              if (!buffer) {
                alert('error decoding file data: ' + url);
                return;
              }
              this.bufferList[index] = buffer;
              if (++this.loadCount == this.urlList.length) {
                this.onload(this.bufferList);
              }
            },
            error => console.error('decodeAudioData error', error)
          );
        };
        request.onerror = () => alert('BufferLoader: XHR error');
        request.send();
      }
};


class Sound {
    constructor (buffer, context) {
        this.context = context;
        this.buffer = buffer;
        this.panner = context.createPanner();
        this.gain = context.createGain();
        this.playbackRate = 1;
    }
    setPannerParameters (options) {
        for(const option in options) {
            if (options.hasOwnProperty(option)) {
                this.panner[option] = options[option];
            }
        }
    }
    setPlaybackRate (value) {
        this.playbackRate = value;
    }
    setGain (value) {
        this.gain.gain.value = value;
    }
    setPosition (x, y, z) {
        this.panner.setPosition(x, y, z);
    }
    setVelocity (vx, vy, vz) {
        // this.panner.setVelocity(vx, vy, vz);
    }
    play (outputNode, loop) {
        loop = loop || false;
        this.source = this.context.createBufferSource();
        this.source.buffer = this.buffer;
        this.source.playbackRate.value = this.playbackRate;
        if (loop) {
            this.source.loop = true;
        }
        this.source.connect(this.gain);
        this.gain.connect(this.panner);
        this.panner.connect(outputNode);
        this.source.start();
    }
    stop () {
        this.source.stop();
    }
};

window.AudioContext = window.AudioContext || window.webkitAudioContext;
const context = new AudioContext();
const masterGain = context.createGain();
masterGain.connect(context.destination);

export const sfx = {
    sounds: {
        gun: {
            play: (ship, firepower) => {
                x = ship.x / 100;
                y = ship.y / 100;
                vx = ship.vx / 5;
                vy = ship.vy / 5;
                sfxGun.setPosition(x, y, -3);
                // sfxGun.setVelocity(vx, vy, 0);
                sfxGun.setPlaybackRate(0.5 + firepower / 20);
                sfxGun.play(masterGain);
            }
        },
        ship: {
            play: (x, y) => {
                x /= 100;
                y /= 100;
                sfxShip.setPosition(x, y, -3);
                sfxShip.play(masterGain, true);
            },
            setParameters: (x, y, vx, vy) => {
                x /= 50;
                y /= 50;
                vx /= 10;
                vy /= 10;
                sfxShip.setPosition(x, y, -3);
                // sfxShip.setVelocity(vx, vy, 0);
            }
        },
        explosion: {
            play: (x, y, z) => {
                x /= 100;
                y /= 100;
                z /= 1000;
                sfxExplosion.setPosition(x, y, z);
                sfxExplosion.play(masterGain);
            }
        },
        alien: {
            play: (x, y, z) => {
                x /= 100;
                y /= 100;
                z /= 1000;
                sfxAlien.setPosition(x, y, z);
                sfxAlien.play(masterGain);
            }
        },
        alienDrone: {
            create: () => {
                const sfxAlienDrone = new Sound(bufferList[4], context);
                sfxAlienDrone.setPannerParameters({
                    coneOuterGain: 0.1,
                    coneOuterAngle: 90,
                    coneInnerAngle: 0,
                    rolloffFactor: 2
                });
                sfxAlienDrone.setGain(1.5);
                sfxAlienDrone.play(masterGain, true);
                return sfxAlienDrone;
            },
            /**
             * We take the alien and the ship as parameters so we can calculate the distance between the two,
             * which determines the panning.
             * @param sound
             * @param alien
             * @param ship
             */
            setParameters: (sound, alien, ship) => {
                x = (alien.x - ship.x) / 100;
                y = (alien.y - ship.y) / 100;
                z = alien.z / 1000;
                sound.setPosition(x, y, z);
            }
        },
        alarm: {
            play: () => sfxAlarm.play(masterGain)
        }
    },
    loadSounds: callback => {
        const bufferLoader = new BufferLoader(
            context,
            [
                'assets/sfx/gun.mp3',
                'assets/sfx/ship_drone.mp3',
                'assets/sfx/explosion.mp3',
                'assets/sfx/alien.mp3',
                'assets/sfx/alien_drone.mp3',
                'assets/sfx/alarm.mp3'
            ],
            bufferList => {
                const sfxGun = new Sound(bufferList[0], context);
                const sfxShip = new Sound(bufferList[1], context);
                const sfxExplosion = new Sound(bufferList[2], context);
                const sfxAlien = new Sound(bufferList[3], context);
                const sfxAlarm = new Sound(bufferList[5], context);
                // set some initial values
                sfxExplosion.setGain(2);
                sfxAlien.setGain(2);
                sfxGun.setPannerParameters({
                    coneOuterGain: 0.9,
                    coneOuterAngle: 40,
                    coneInnerAngle: 0,
                    rolloffFactor: 0.1
                });
                sfxGun.setGain(0.1);
                sfxShip.setPannerParameters({
                    coneOuterGain: 1,
                    coneOuterAngle: 360,
                    coneInnerAngle: 0,
                    rolloffFactor: 0.3
                });
                sfxShip.setGain(2.5);
                callback();
            }
        );
        bufferLoader.load();
    },
    setGain: value => {
        masterGain.gain.value = value;
    }
};

