let lastTimeStamp = 0;
let timeElapsed = 0;
let activeAliens = 0;
let currentStageIndex = 0;
let levelCompleted = false;
let levelData = null;

const ALIEN_CLASS = {
    stationary: 1,
    vertical: 2,
    horizontal: 3,
    spiral: 4,
    random: 5
};

const baselevel = [
    {
        events: [
            { time: 2, type: 'announcement', data: { title: 'Stage 1', subtitle: 'Flight School!'} },
            { time: 11, type: 'spawn', data: [
                { class: ALIEN_CLASS.stationary, speed: 1 }
            ] }
        ]
    },
    {
        events: [
            { time: 2, type: 'announcement', data: { title: 'Stage 2', subtitle: 'Warm-up!'} },
            { time: 3, type: 'spawn', data: [
                { class: ALIEN_CLASS.stationary, speed: 1 }
            ] },
            { time: 7, type: 'spawn', data: [
                { class: ALIEN_CLASS.stationary, speed: 1 }
            ] },
            { time: 11, type: 'spawn', data: [
                { class: ALIEN_CLASS.stationary, speed: 1 }
            ] },
            { time: 16, type: 'spawn', data: [
                { class: ALIEN_CLASS.stationary, speed: 1 },
                { class: ALIEN_CLASS.stationary, speed: 1 }
            ] }
        ]
    },
    {
        events: [
            { time: 2, type: 'announcement', data: {title: 'Stage 3', subtitle: 'Ready?' } },
            { time: 3, type: 'spawn', data: [
                { class: ALIEN_CLASS.vertical, speed: 1 }
            ] },
            { time: 6, type: 'spawn', data: [
                { class: ALIEN_CLASS.horizontal, speed: 1 }
            ] },
            { time: 9, type: 'spawn', data: [
                { class: ALIEN_CLASS.vertical, speed: 1 },
                { class: ALIEN_CLASS.stationary, speed: 1 }
            ] },
            { time: 13, type: 'spawn', data: [
                { class: ALIEN_CLASS.horizontal, speed: 1 },
                { class: ALIEN_CLASS.stationary, speed: 1 }
            ] },
            { time: 17, type: 'spawn', data: [
                { class: ALIEN_CLASS.vertical, speed: 1.5 },
                { class: ALIEN_CLASS.horizontal, speed: 1.5 }
            ] }
        ]
    },
    {
        events: [
            { time: 2, type: 'announcement', data: { title: 'Stage 4', subtitle: 'Spirals!'} },
            { time: 3, type: 'spawn', data: [
                { class: ALIEN_CLASS.spiral, speed: 1 }
            ] },
            { time: 7, type: 'spawn', data: [
                { class: ALIEN_CLASS.spiral, speed: 1 }
            ] },
            { time: 11, type: 'spawn', data: [
                { class: ALIEN_CLASS.spiral, speed: 1 }
            ] },
            { time: 15, type: 'spawn', data: [
                { class: ALIEN_CLASS.spiral, speed: 2 }
            ] },
            { time: 16, type: 'spawn', data: [
                { class: ALIEN_CLASS.spiral, speed: 2 }
            ] }
        ]
    },
    {
        events: [
            { time: 2, type: 'announcement', data: { title: 'Stage 5', subtitle: 'Turkey Shoot!'} },
            { time: 3, type: 'spawn', data: [
                { class: ALIEN_CLASS.stationary, speed: 1 }
            ] },
            { time: 4, type: 'spawn', data: [
                { class: ALIEN_CLASS.stationary, speed: 1 }
            ] },
            { time: 5, type: 'spawn', data: [
                { class: ALIEN_CLASS.stationary, speed: 1 }
            ] },
            { time: 6, type: 'spawn', data: [
                { class: ALIEN_CLASS.stationary, speed: 1 }
            ] },
            { time: 7, type: 'spawn', data: [
                { class: ALIEN_CLASS.stationary, speed: 1 }
            ] },
            { time: 8, type: 'spawn', data: [
                { class: ALIEN_CLASS.stationary, speed: 1 }
            ] },
            { time: 8, type: 'spawn', data: [
                { class: ALIEN_CLASS.stationary, speed: 1 }
            ] },
            { time: 9, type: 'spawn', data: [
                { class: ALIEN_CLASS.stationary, speed: 1 }
            ] },
            { time: 10, type: 'spawn', data: [
                { class: ALIEN_CLASS.stationary, speed: 1 }
            ] },
            { time: 11, type: 'spawn', data: [
                { class: ALIEN_CLASS.stationary, speed: 1 }
            ] },
            { time: 12, type: 'spawn', data: [
                { class: ALIEN_CLASS.stationary, speed: 1 }
            ] },
            { time: 13, type: 'spawn', data: [
                { class: ALIEN_CLASS.stationary, speed: 1 }
            ] },
            { time: 14, type: 'spawn', data: [
                { class: ALIEN_CLASS.stationary, speed: 1 },
                { class: ALIEN_CLASS.stationary, speed: 1 }
            ] },
            { time: 15, type: 'spawn', data: [
                { class: ALIEN_CLASS.stationary, speed: 1 },
                { class: ALIEN_CLASS.stationary, speed: 1 }
            ] },
            { time: 16, type: 'spawn', data: [
                { class: ALIEN_CLASS.stationary, speed: 1 },
                { class: ALIEN_CLASS.stationary, speed: 1 }
            ] },
            { time: 17, type: 'spawn', data: [
                { class: ALIEN_CLASS.stationary, speed: 1 },
                { class: ALIEN_CLASS.stationary, speed: 1 }
            ] },
            { time: 18, type: 'spawn', data: [
                { class: ALIEN_CLASS.stationary, speed: 1 },
                { class: ALIEN_CLASS.stationary, speed: 1 }
            ] }
        ]
    },
    {
        events: [
            { time: 2, type: 'announcement', data: { title: 'Stage 6', subtitle: 'Catch Me If You Can!'} },
            { time: 3, type: 'spawn', data: [
                { class: ALIEN_CLASS.random, speed: 1 }
            ] },
            { time: 8, type: 'spawn', data: [
                { class: ALIEN_CLASS.random, speed: 3 }
            ] },
            { time: 12, type: 'spawn', data: [
                { class: ALIEN_CLASS.random, speed: 5 }
            ] }
        ]
    },
    {
        events: [
            { time: 2, type: 'announcement', data: { title: 'Stage 7', subtitle: 'A bit of everything!' } },
            { time: 3, type: 'spawn', data: [{ class: ALIEN_CLASS.horizontal, speed: 2 }] },
            { time: 5, type: 'spawn', data: [{ class: ALIEN_CLASS.vertical, speed: 2 }] },
            { time: 7, type: 'spawn', data: [{ class: ALIEN_CLASS.spiral, speed: 2 }] },
            { time: 9, type: 'spawn', data: [{ class: ALIEN_CLASS.stationary, speed: 1 }] },
            { time: 11, type: 'spawn', data: [{ class: ALIEN_CLASS.vertical, speed: 3 }] },
            { time: 14, type: 'spawn', data: [{ class: ALIEN_CLASS.horizontal, speed: 3 }] },
            { time: 17, type: 'spawn', data: [{ class: ALIEN_CLASS.stationary, speed: 1 }] },
            { time: 20, type: 'spawn', data: [
                { class: ALIEN_CLASS.spiral, speed: 2 },
                { class: ALIEN_CLASS.spiral, speed: 3 }
            ] }
        ]
    },
    {
        events: [
            { time: 2, type: 'announcement', data: { title: 'Stage 8', subtitle: 'Don\'t Panic!'} },
            { time: 3, type: 'spawn', data: [ { class: ALIEN_CLASS.random, speed: 3 }] },
            { time: 6, type: 'spawn', data: [ { class: ALIEN_CLASS.random, speed: 3 }] },
            { time: 7, type: 'spawn', data: [ { class: ALIEN_CLASS.random, speed: 4 }] },
            { time: 9, type: 'spawn', data: [ { class: ALIEN_CLASS.random, speed: 4 }] },
            { time: 15, type: 'spawn', data: [ { class: ALIEN_CLASS.random, speed: 5 }] },
            { time: 17, type: 'spawn', data: [ { class: ALIEN_CLASS.random, speed: 5 }] },
            { time: 19, type: 'spawn', data: [ { class: ALIEN_CLASS.random, speed: 5 }] },
            { time: 20, type: 'spawn', data: [ { class: ALIEN_CLASS.random, speed: 5 }] },
            { time: 21, type: 'spawn', data: [ { class: ALIEN_CLASS.random, speed: 5 }] }
        ]
    },
    {
        events: [
            { time: 2, type: 'announcement', data: { title: 'Stage 9', subtitle: 'Hang In There!'} },
            { time: 3, type: 'spawn', data: [
                { class: ALIEN_CLASS.horizontal, speed: 3 },
                { class: ALIEN_CLASS.vertical, speed: 3 }
            ] },
            { time: 6, type: 'spawn', data: [
                { class: ALIEN_CLASS.stationary, speed: 3 },
                { class: ALIEN_CLASS.spiral, speed: 3 }
            ] },
            { time: 9, type: 'spawn', data: [
                { class: ALIEN_CLASS.random, speed: 2 },
                { class: ALIEN_CLASS.random, speed: 4 }
            ] },
            { time: 11, type: 'spawn', data: [
                { class: ALIEN_CLASS.horizontal, speed: 4 },
                { class: ALIEN_CLASS.random, speed: 3 }
            ] },
            { time: 13, type: 'spawn', data: [
                { class: ALIEN_CLASS.stationary, speed: 3 },
                { class: ALIEN_CLASS.stationary, speed: 3 }
            ] },
            { time: 14, type: 'spawn', data: [
                { class: ALIEN_CLASS.spiral, speed: 3 },
                { class: ALIEN_CLASS.stationary, speed: 3 },
                { class: ALIEN_CLASS.spiral, speed: 5 }
            ] },
            { time: 15, type: 'spawn', data: [
                { class: ALIEN_CLASS.horizontal, speed: 4 },
                { class: ALIEN_CLASS.stationary, speed: 4 },
                { class: ALIEN_CLASS.vertical, speed: 3 }
            ] },
            { time: 16, type: 'spawn', data: [
                { class: ALIEN_CLASS.vertical, speed: 3 },
                { class: ALIEN_CLASS.random, speed: 3 },
                { class: ALIEN_CLASS.stationary, speed: 3 }
            ] },
            { time: 21, type: 'spawn', data: [
                { class: ALIEN_CLASS.random, speed: 3 },
                { class: ALIEN_CLASS.stationary, speed: 3 },
                { class: ALIEN_CLASS.spiral, speed: 3 },
                { class: ALIEN_CLASS.stationary, speed: 3 }
            ] },
            { time: 22, type: 'spawn', data: [
                { class: ALIEN_CLASS.random, speed: 4 },
                { class: ALIEN_CLASS.random, speed: 4 },
                { class: ALIEN_CLASS.stationary, speed: 4 },
                { class: ALIEN_CLASS.stationary, speed: 4 },
                { class: ALIEN_CLASS.spiral, speed: 4 }
            ] },
            { time: 23, type: 'spawn', data: [
                { class: ALIEN_CLASS.random, speed: 4 },
                { class: ALIEN_CLASS.random, speed: 4 },
                { class: ALIEN_CLASS.spiral, speed: 4 }
            ] },
            { time: 26, type: 'spawn', data: [
                { class: ALIEN_CLASS.random, speed: 4 },
                { class: ALIEN_CLASS.random, speed: 4 },
                { class: ALIEN_CLASS.stationary, speed: 4 },
                { class: ALIEN_CLASS.stationary, speed: 4 },
                { class: ALIEN_CLASS.spiral, speed: 4 }
            ] }
        ]
    },
    {
        events: [
            { time: 2, type: 'announcement', data: { title: 'Stage 10', subtitle: 'Final Stage!'} },
            { time: 3, type: 'spawn', data: [ { class: ALIEN_CLASS.stationary, speed: 3 }] },
            { time: 8, type: 'spawn', data: [ { class: ALIEN_CLASS.stationary, speed: 3 }] },
            { time: 12, type: 'spawn', data: [ { class: ALIEN_CLASS.stationary, speed: 4 }] },
            { time: 15, type: 'spawn', data: [
                { class: ALIEN_CLASS.stationary, speed: 4 },
                { class: ALIEN_CLASS.stationary, speed: 4 },
                { class: ALIEN_CLASS.stationary, speed: 4 }
            ] },
            { time: 18, type: 'spawn', data: [
                { class: ALIEN_CLASS.stationary, speed: 4 },
                { class: ALIEN_CLASS.stationary, speed: 4 },
                { class: ALIEN_CLASS.stationary, speed: 4 }
            ] },
            { time: 22, type: 'spawn', data: [
                { class: ALIEN_CLASS.stationary, speed: 4 },
                { class: ALIEN_CLASS.stationary, speed: 4 },
                { class: ALIEN_CLASS.stationary, speed: 4 }
            ] },
            { time: 25, type: 'spawn', data: [
                { class: ALIEN_CLASS.stationary, speed: 4 },
                { class: ALIEN_CLASS.stationary, speed: 4 },
                { class: ALIEN_CLASS.stationary, speed: 4 }
            ] },
            { time: 30, type: 'spawn', data: [
                { class: ALIEN_CLASS.vertical, speed: 1 },
                { class: ALIEN_CLASS.horizontal, speed: 1 },
                { class: ALIEN_CLASS.vertical, speed: 5 },
                { class: ALIEN_CLASS.horizontal, speed: 5 }
            ] },
            { time: 35, type: 'spawn', data: [
                { class: ALIEN_CLASS.vertical, speed: 1 },
                { class: ALIEN_CLASS.horizontal, speed: 1 },
                { class: ALIEN_CLASS.vertical, speed: 2 },
                { class: ALIEN_CLASS.spiral, speed: 2 }
            ] },
            { time: 40, type: 'spawn', data: [
                { class: ALIEN_CLASS.spiral, speed: 1 },
                { class: ALIEN_CLASS.vertical, speed: 1 },
                { class: ALIEN_CLASS.vertical, speed: 3 },
                { class: ALIEN_CLASS.spiral, speed: 5 }
            ] },
            { time: 45, type: 'spawn', data: [{ class: ALIEN_CLASS.random, speed: 1 } ]},
            { time: 46, type: 'spawn', data: [{ class: ALIEN_CLASS.random, speed: 1 } ]},
            { time: 47, type: 'spawn', data: [{ class: ALIEN_CLASS.random, speed: 2 } ]},
            { time: 48, type: 'spawn', data: [{ class: ALIEN_CLASS.random, speed: 2 } ]},
            { time: 49, type: 'spawn', data: [{ class: ALIEN_CLASS.random, speed: 3 } ]},
            { time: 50, type: 'spawn', data: [{ class: ALIEN_CLASS.random, speed: 3 } ]},
            { time: 51, type: 'spawn', data: [{ class: ALIEN_CLASS.random, speed: 4 } ]},
            { time: 52, type: 'spawn', data: [{ class: ALIEN_CLASS.random, speed: 5 } ]}
        ]
    }
];

const getSecondsElapsed = timestamp => {
    if (typeof lastTimeStamp === 'undefined' ||
        100 < timestamp - lastTimeStamp) {
        lastTimeStamp = timestamp;
    }
    timeElapsed += (timestamp - lastTimeStamp);
    lastTimeStamp = timestamp;
    return Math.floor(timeElapsed / 1000);
};

const getCurrentStage = () => {
    const stageEvents = levelData[currentStageIndex].events;
    if (stageEvents[stageEvents.length - 1].fired && activeAliens === 0) {
        if (currentStageIndex < levelData.length - 1) {
            currentStageIndex++;
            activeAliens = 0;
            timeElapsed = 0;
        } else {
            levelCompleted = true;
        }
    }
    return levelData[currentStageIndex];
};

const getEventAtTime = (secondsElapsed, currentStage) => {
    if (!levelCompleted) {
        for (let e = 0; e < currentStage.events.length; e++) {
            const event = currentStage.events[e];

            if (event.time === secondsElapsed) {
                if (!event.fired) {
                    event.fired = true;
                    if (event.type === 'spawn') {
                        activeAliens += event.data.length;
                    }
                    return event;
                }
            }
        }
        return {};
    } else {
        // return level complete event
        return {
            type: 'completed'
        };
    }
};
 
 export const levelPlayer = {
    resetLevel: () => {
        levelData = JSON.parse(JSON.stringify(baselevel));
    },
    getEvents: timestamp => getEventAtTime(getSecondsElapsed(timestamp), getCurrentStage()),
    alienRemoved: () => {
        activeAliens = Math.max(activeAliens - 1, 0);
    },
    getCurrentStage: () => Math.round(currentStageIndex + 1)
 };
