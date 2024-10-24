let highsEl = null;
let lowsEl = null;

const getAverageValueInRange = (frequencyData, start, end) => {
    let sum = 0;
    for (let i = start; i <= end; i ++) {
        sum += frequencyData[i];
    }
    return sum / (end - start);
};

const tick = audioSource => {
    const frequencyData = audioSource.getAudioData().frequencyData;
    lowsEl.style.opacity = getAverageValueInRange(frequencyData, 0, 15) / 255;
    highsEl.style.opacity = getAverageValueInRange(frequencyData, 16, 25) / 255;
    setTimeout(() => tick(audioSource), 300);
};

export const visualizer = {
    setElement: el => {
        highsEl = el.querySelector('.highs');
        lowsEl = el.querySelector('.lows');
        highsEl.style.opacity = 0;
        lowsEl.style.opacity = 0;
    },
    start: audioSource => tick(audioSource)
};
