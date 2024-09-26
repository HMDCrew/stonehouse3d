import { navigatorArrow } from "../items/NavigatorArrow.js"
import { toDegrees } from "../../../utils/math/toDegrees"

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
        const m = ( this.center.x - firstDecodedPolyline[0][1] ) / (this.center.y - firstDecodedPolyline[0][0])
        let theta_radianti = Math.atan(m)

        this.arrow.style.transform = this.jsTrasformRotate( toDegrees(theta_radianti) )

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
     * The function `updateRotation` calculates the rotation angle based on the difference between two
     * points and updates the rotation of an arrow element accordingly.
     */
    updateRotation({ firsPoint, lastPoint }) {

        if (
            firsPoint.x !== lastPoint.x &&
            firsPoint.y !== lastPoint.y
        ) {

            const delta_x = firsPoint.x - lastPoint.x
            const delta_y = firsPoint.y - lastPoint.y
    
            // Maptalks has reversed axes
            const reverseAxes = {
                x: delta_y,
                y: delta_x
            }
    
            const theta = Math.atan2(reverseAxes.y, reverseAxes.x)
            this.arrow.style.transform = this.jsTrasformRotate( toDegrees(theta) )
        }
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

        this.updateRotation({
            firsPoint: { x: ev.detail.lng, y: ev.detail.lat },
            lastPoint: this.lastPosition
        })
    }
}