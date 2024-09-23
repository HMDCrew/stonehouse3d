
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


    frameOf(number, limitLoop = true, limit = 0.0001, valueLimit = 0.001 ) {
        
        const frame_n = number / FRAME
        
        return (
            limitLoop
            ? (frame_n > limit ? frame_n : valueLimit )
            : frame_n
        )
    }
}