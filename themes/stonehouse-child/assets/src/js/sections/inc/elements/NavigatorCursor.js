import { navigatorArrow } from "../items/NavigatorArrow.js"
import { toDegrees } from "../../../utils/math/toDegrees"
import { toRadians } from "../../../utils/math/toRadians.js"
import { normalizeAngle } from "../../../utils/math/normalizeAngle.js"

export class NavigatorCursor {

    constructor({ gps, firstDecodedPolyline }) {

        this.gps = gps

        this.center = this.gps.marker.getCenter()
        this.lastPosition = this.center
        this.originalGpsCursor = this.gps.marker.getContent()

        // Update gps cursor
        this.gps.marker.setContent(navigatorArrow())
        this.arrow = document.querySelector('.navigator-arrow')

        // init Cursor first rotation        
        this.arrow.style.transform = this.jsTrasformRotate(
            this.bearingAngle({
                firstPoint: this.center,
                lastPoint: { x: firstDecodedPolyline[0][1], y: firstDecodedPolyline[0][0] },
            })
        )

        document.addEventListener('MyPosition', ev => this.updateCursor(ev))
    }


    /**
     * The function `jsTrasformRotate` takes an angle as input and returns a string with the angle
     * value formatted for a CSS `rotate` transformation.
     * @param angle - The `angle` parameter in the `jsTrasformRotate` function represents the degree of
     * rotation that you want to apply to an element in CSS. This function generates a CSS `transform`
     * property value for rotating an element by the specified angle in degrees.
     * @returns The function `jsTrasformRotate(angle)` returns a string that represents a CSS `rotate`
     * transformation with the specified angle in degrees.
     */
    jsTrasformRotate( angle ) {
        return `rotate(${ angle }deg)`
    }


    /**
     * The `updateCursor` function in JavaScript updates the rotation based on the first and last
     * points provided.
     * @param ev - The `ev` parameter in the `updateCursor` function likely represents an event object
     * that contains details about a cursor movement or interaction. It seems to have a `detail`
     * property that includes `lng` and `lat` values representing longitude and latitude coordinates
     * respectively.
     */
    updateCursor( ev ) {

        this.arrow.style.transform = this.jsTrasformRotate(
            this.bearingAngle({
                firstPoint: { x: ev.detail.lng, y: ev.detail.lat },
                lastPoint: this.lastPosition
            })
        )
    }


    /**
     * The function calculates the bearing angle between two points on a map.
     * @returns The `bearingAngle` function calculates the bearing angle between two points on the
     * Earth's surface represented by their latitude and longitude coordinates. The function returns
     * the normalized bearing angle in degrees, ensuring that the angle is within the range of 0 to 360
     * degrees.
     */
    bearingAngle({ firstPoint, lastPoint }) {

        const lat1 = toRadians(firstPoint.y)
        const lat2 = toRadians(lastPoint.y)
        const deltaLon = toRadians(lastPoint.x - firstPoint.x)

        // Calculating the direction angle (bearing)
        const x = Math.sin(deltaLon) * Math.cos(lat2)
        const y = Math.cos(lat1) * Math.sin(lat2) - (Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLon))

        let angle = Math.atan2(x, y); // Use atan2 to manage dials
        angle = toDegrees(angle)

        // fix upside down arrow
        angle = (angle + 180) % 360 
        return normalizeAngle(angle)
    }
}