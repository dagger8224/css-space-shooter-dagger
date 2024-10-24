// dimensions of the alien's collision bounding box
const alienBBX = document.documentElement.clientWidth * 0.01;
const alienBBY = document.documentElement.clientHeight * 0.01;
const alienBBZ = 100;

export const collisionDetector = {
    check: (shots, aliens) => aliens.forEach(alien => shots.forEach(shot => {
        if (Math.abs(shot.z - alien.z) < alienBBZ && Math.abs(shot.x - alien.actualX) < (alienBBX * (1 + (alien.z + 15000) / 1500)) && Math.abs(shot.y - alien.actualY) < (alienBBY * (1 + (alien.z + 15000) / 1500))) {
            if (!alien.hit) {
                alien.hit = true;
                document.dispatchEvent(new CustomEvent('hit', {
                    'detail': {
                        x: alien.x,
                        y: alien.y,
                        z: alien.z
                    }
                }));
            }
            shot.hit = true;
        }
    }))
};
