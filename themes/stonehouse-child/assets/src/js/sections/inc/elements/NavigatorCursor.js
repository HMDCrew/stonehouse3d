import { regressionLine } from "../../../utils/math/regressionLine"
import { navigatorArrow } from "../items/NavigatorArrow.js"
import { toDegrees } from "../../../utils/math/toDegrees"

export class NavigatorCursor {

    constructor({gps, firstPolylineDecoded}) {

        this.gps = gps

        this.center = this.gps.marker.getCenter()
        this.originalGpsCursor = this.gps.marker.getContent()

        // Update gps cursor
        this.gps.marker.setContent(navigatorArrow())
        this.arrow = document.querySelector('.navigator-arrow')

        // init Cursor first rotation        
        const result = []
        result.push([this.center.x, this.center.y])
        result.push([firstPolylineDecoded[0][1], firstPolylineDecoded[0][0]])
        
        const reg = this.regressionLineForDirection(result)

        // Convert m to an angle in radians
        let theta_radianti = Math.atan(reg.m)

        this.arrow.style.transform = this.jsTrasformRotate( 90 - toDegrees(theta_radianti) )

        document.addEventListener('MyPosition', ev => this.updateCursor(ev))
    }


    regressionLineForDirection(coordinates) {

        const directionPoints = []
        const reg = regressionLine(coordinates)

        const y = (x) => (reg.m * x) + reg.b
        const coordinate = (item) => {
            const x = item[0]
            return [x, y(x)]
        }

        directionPoints.push([ this.center.x, y( this.center.x ) ])
        coordinates.forEach( coord => directionPoints.push(coordinate(coord)) )

        return {
            points: directionPoints,
            ...reg
        }
    }


    jsTrasformRotate( angle ) {
        return `'rotate(${ angle }deg)'`
    }

    updateCursor(ev) {
        console.log(ev.detail)
    }
}