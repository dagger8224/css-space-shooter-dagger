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
export class SFX {
    constructor () {
        this.sfxGun = null;
        this.sfxShip = null;
        this.sfxExplosion = null;
        this.sfxAlien = null;
        this.sfxAlarm = null;
        
        this.context = new AudioContext();
        this.masterGain = this.context.createGain();
        this.masterGain.connect(this.context.destination);
        this.sounds = {
            gun: {
                play: (ship, firepower) => {
                    // vx = ship.vx / 5;
                    // vy = ship.vy / 5;
                    this.sfxGun.setPosition(ship.x / 100, ship.y / 100, -3);
                    // sfxGun.setVelocity(vx, vy, 0);
                    this.sfxGun.setPlaybackRate(0.5 + firepower / 20);
                    this.sfxGun.play(this.masterGain);
                }
            },
            ship: {
                play: (x, y) => {
                    x /= 100;
                    y /= 100;
                    this.sfxShip.setPosition(x, y, -3);
                    this.sfxShip.play(this.masterGain, true);
                },
                setParameters: (x, y, vx, vy) => {
                    x /= 50;
                    y /= 50;
                    vx /= 10;
                    vy /= 10;
                    this.sfxShip.setPosition(x, y, -3);
                    // sfxShip.setVelocity(vx, vy, 0);
                }
            },
            explosion: {
                play: (x, y, z) => {
                    x /= 100;
                    y /= 100;
                    z /= 1000;
                    this.sfxExplosion.setPosition(x, y, z);
                    this.sfxExplosion.play(this.masterGain);
                }
            },
            alien: {
                play: (x, y, z) => {
                    x /= 100;
                    y /= 100;
                    z /= 1000;
                    this.sfxAlien.setPosition(x, y, z);
                    this.sfxAlien.play(this.masterGain);
                }
            },
            alienDrone: {
                create: () => {
                    const sfxAlienDrone = new Sound(this.bufferList[4], this.context);
                    sfxAlienDrone.setPannerParameters({
                        coneOuterGain: 0.1,
                        coneOuterAngle: 90,
                        coneInnerAngle: 0,
                        rolloffFactor: 2
                    });
                    sfxAlienDrone.setGain(1.5);
                    sfxAlienDrone.play(this.masterGain, true);
                    return sfxAlienDrone;
                },
                /**
                 * We take the alien and the ship as parameters so we can calculate the distance between the two,
                 * which determines the panning.
                 * @param sound
                 * @param alien
                 * @param ship
                 */
                setParameters: (sound, alien, ship) => sound.setPosition((alien.x - ship.x) / 100, (alien.y - ship.y) / 100, alien.z / 1000)
            },
            alarm: {
                play: () => this.sfxAlarm.play(this.masterGain)
            }
        };
    }
    loadSounds (callback) {
        const bufferLoader = new BufferLoader(
            this.context,
            [
                'assets/sfx/gun.mp3',
                'assets/sfx/ship_drone.mp3',
                'assets/sfx/explosion.mp3',
                'assets/sfx/alien.mp3',
                'assets/sfx/alien_drone.mp3',
                'assets/sfx/alarm.mp3'
            ],
            bufferList => {
                this.sfxGun = new Sound(bufferList[0], this.context);
                this.sfxShip = new Sound(bufferList[1], this.context);
                this.sfxExplosion = new Sound(bufferList[2], this.context);
                this.sfxAlien = new Sound(bufferList[3], this.context);
                this.sfxAlarm = new Sound(bufferList[5], this.context);
                this.bufferList = bufferList;
                // set some initial values
                this.sfxExplosion.setGain(2);
                this.sfxAlien.setGain(2);
                this.sfxGun.setPannerParameters({
                    coneOuterGain: 0.9,
                    coneOuterAngle: 40,
                    coneInnerAngle: 0,
                    rolloffFactor: 0.1
                });
                this.sfxGun.setGain(0.1);
                this.sfxShip.setPannerParameters({
                    coneOuterGain: 1,
                    coneOuterAngle: 360,
                    coneInnerAngle: 0,
                    rolloffFactor: 0.3
                });
                this.sfxShip.setGain(2.5);
                callback();
            }
        );
        bufferLoader.load();
    }
    setGain (value) {
        this.masterGain.gain.value = value;
    }
};
