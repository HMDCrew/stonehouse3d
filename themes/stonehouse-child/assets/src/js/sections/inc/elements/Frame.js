
const FRAME = 60

export class Frame {

    paused = false
    
    currentPitch = 0
    currentZoom = 0
    interval = 1000 / FRAME

    now
    delta
    then

    constructor(currentPitch, currentZoom) {
        this.currentPitch = Number.parseFloat(currentPitch)
        this.currentZoom = Number.parseFloat(currentZoom)
    }


    // const rounded = roundTo(4.687, 2)
    // console.log(rounded) // Outputs: 4.69
    roundTo(num, precision) {

        const factor = Math.pow(10, precision)

        return Math.round(num * factor) / factor
    }


    frameICoordinate(i, start, end) {

        return {
            x: start.x + i * ( (end.x - start.x) / FRAME ),
            y: start.y + i * ( (end.y - start.y) / FRAME )
        }
    }

    frameOf(current, target, currentFrame) {

        const t = currentFrame / FRAME;

        return this.lerp(current, target, t);
    }
    
    lerp(start, end, t) {
        return start + t * (end - start);
    }
}