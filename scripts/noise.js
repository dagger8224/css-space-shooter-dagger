const MAX_VERTICES = 256;
const MAX_VERTICES_MASK = MAX_VERTICES -1;
export class Simple1DNoise {
    constructor(amplitude) {
        this.amplitude = amplitude;
        this.scale = 1;
        this.r = [];
        for (let i = 0; i < MAX_VERTICES; ++i) {
            this.r.push(Math.random());
        }
    }
    getVal (x) {
        const scaledX = x * this.scale;
        const xFloor = Math.floor(scaledX);
        const t = scaledX - xFloor;
        const tRemapSmoothstep = t * t * ( 3 - 2 * t );
        /// Modulo using &
        const xMin = xFloor & MAX_VERTICES_MASK;
        const xMax = (xMin + 1) & MAX_VERTICES_MASK;
        return (this.r[xMin] * (1 - tRemapSmoothstep) + this.r[xMax] * tRemapSmoothstep) * this.amplitude;
    }
};
