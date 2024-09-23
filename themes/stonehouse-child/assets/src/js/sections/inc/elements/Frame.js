export class Frame {

    paused = false
    currentPitch = 0
    currentZoom = 0
    interval = 1000/30

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
}