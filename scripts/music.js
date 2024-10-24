class MP3AudioSource {
    constructor (player) {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        const source = audioCtx.createMediaElementSource(player);
        source.connect(analyser);
        analyser.connect(audioCtx.destination);
        // public properties and methods
        this.volume = 0;
        this.streamData = new Uint8Array(128);
        this.player = player;
        setInterval(() => {
            analyser.getByteFrequencyData(this.streamData);
            // calculate an overall volume value
            let total = 0;
            for (let i = 0; i < 80; i++) { // get the volume from the first 80 bins, else it gets too loud with treble
                total += this.streamData[i];
            }
            this.volume = total;
        }, 20);
    }
    playStream (streamUrl) {
        // get the input stream from the audio element
        this.player.addEventListener('ended', () => player.play());
        this.player.setAttribute('src', streamUrl);
        this.player.play();
    }
};

class MP3Loader {
    constructor (player) {
        this.sound = {};
        this.streamUrl = () => '';
        this.errorMessage = '';
        this.player = player;
        this.successfullyLoaded = false;
    }
    loadStream (track_url, successCallback, errorCallback) {
        this.successfullyLoaded = true;
        this.streamUrl = () => track_url;
        successCallback();
    }
};

const player =  document.getElementById('player');
const loader = new MP3Loader(player);
const audioSource = new MP3AudioSource(player);

export const music = {
    load: (trackUrl, callback = () => {}) => loader.loadStream(trackUrl,
        callback,
        () => console.log("Error: ", loader.errorMessage)
    ),
    play: () => {
        if (loader.successfullyLoaded) {
            audioSource.playStream(loader.streamUrl());
        }
    },
    pause: () => player.pause(),
    resume: () => player.play(),
    getAudioData: () => ({
        volume: audioSource.volume,
        frequencyData: audioSource.streamData
    })
};
