import { toDegrees } from "../../utils/math/toDegrees.js"
import { toRadians } from "../../utils/math/toRadians.js"
import { customEvent } from "../../utils/customEvent.js"
import { pointMarker } from "./items/pointMarker.js";


const DEFAULT_RADIUS = 6371008.8;

export class GPS {

    watchPositionID

    constructor({ UX, Coordinate, Polygon, VectorLayer }) {
        
        this.UX = UX

        this.myLocation = {lat: 0, lng: 0}

        this.Coordinate = Coordinate
        this.Polygon = Polygon

        this.status = false
        this.needExtent = true
        this.marker = null
        this.accuracyLayer = new VectorLayer('vector').addTo(this.UX.map)

        document.addEventListener('MyPosition', ev => this.location(ev))
    }


    /**
     * The function `startLocation` emits the event "MyPosition" and sets the status to true.
     */
    startLocation() {

        // Emit Event "MyPosition"
        this.watch()
        this.status = true
    }


    /**
     * The function creates a circular polygon with specified center, radius, number of vertices, and
     * sphere radius, using certain styling options.
     * @param center - The `center` parameter represents the center point of the circular shape you are
     * creating. It is typically an array or object containing the coordinates of the center point,
     * such as `[x, y]` or `{ x: xValue, y: yValue }`. This point serves as the origin of
     * @param radius - The `radius` parameter in the `circular` function represents the distance from
     * the center point to the outer edge of the circle. It defines how large or small the circle will
     * be.
     * @param n - The parameter `n` in the `circular` function represents the number of points to
     * generate along the circumference of the circle. It is used to determine the resolution or
     * smoothness of the circular shape. If `n` is not provided, it defaults to 32.
     * @param sphereRadius - The `sphereRadius` parameter in the `circular` function represents the
     * radius of a sphere. This value is used in the `sphereOffset` function to calculate the
     * coordinates of points on the circular path. The `sphereOffset` function likely uses this radius
     * to position points around the center of the
     * @returns The `circular` function is returning a polygon shape with specified properties such as
     * visibility, editability, cursor style, and styling options like line color, line width, fill
     * color, and opacity. The polygon is created by generating a series of flat coordinates based on
     * the center, radius, number of points (n), and sphere radius provided as parameters to the
     * function. The polygon is closed by adding
     */
    circular(center, radius, n, sphereRadius) {
        n = n ? n : 32;

        const flatCoordinates = [];

        // che OpenLayer ci perdoni per i nostri peccati
        for (let i = 0; i < n; ++i) {

            flatCoordinates.push(
                this.sphereOffset(center, radius, (2 * Math.PI * i) / n, sphereRadius)
            )
        }

        flatCoordinates.push(flatCoordinates[0])

        return new this.Polygon([ flatCoordinates ], {
            visible : true,
            editable : true,
            cursor : 'pointer',
            draggable : false,
            dragShadow : false, // display a shadow during dragging
            drawOnAxis : null,  // force dragging stick on a axis, can be: x, y
            symbol: {
                'lineColor' : '#34495e',
                'lineWidth' : 2,
                'polygonFill' : 'rgb(135,196,240)',
                'polygonOpacity' : 0.4
            }
        })
    }


    /**
     * The function `sphereOffset` calculates the coordinates of a point at a specified distance and
     * bearing from a given point on a sphere.
     * @param c1 - The `c1` parameter represents the coordinates of the center point on the sphere in
     * the format `{x: longitude, y: latitude}`.
     * @param distance - The `distance` parameter in the `sphereOffset` function represents the
     * distance you want to move from the initial point `c1` along a specific bearing. It is the
     * distance in the same units as the radius of the sphere.
     * @param bearing - The `bearing` parameter in the `sphereOffset` function represents the direction
     * in which you want to move from the starting point `c1`. It is typically measured in degrees
     * clockwise from true north.
     * @param radius - The `radius` parameter in the `sphereOffset` function represents the radius of
     * the sphere being used for calculations. If a `radius` value is provided when calling the
     * function, that value will be used. If no `radius` value is provided, the function will default
     * to using a `DEFAULT
     * @returns The `sphereOffset` function returns an array containing the longitude and latitude
     * coordinates of a point that is offset from the initial point `c1` by a specified distance,
     * bearing, and radius.
     */
    sphereOffset(c1, distance, bearing, radius) {

        radius = radius || DEFAULT_RADIUS;

        const lat1 = toRadians(c1.y);
        const lon1 = toRadians(c1.x);
        const dByR = distance / radius;
        const lat = Math.asin(
            Math.sin(lat1) * Math.cos(dByR) +
            Math.cos(lat1) * Math.sin(dByR) * Math.cos(bearing),
        );

        const lon = lon1 + Math.atan2(
            Math.sin(bearing) * Math.sin(dByR) * Math.cos(lat1),
            Math.cos(dByR) - Math.sin(lat1) * Math.sin(lat),
        );

        return [toDegrees(lon), toDegrees(lat)];
    }


    /**
     * The `watch` function checks if geolocation is supported by the browser and then continuously
     * watches the user's position, triggering custom events for success and error cases.
     */
    watch() {

        if ( ! navigator.geolocation ) {

            customEvent(document, 'MyPosition', {
                status: 'error',
                message: 'Localization is not supported by browser',
            })

        } else {

            this.watchPositionID = navigator.geolocation.watchPosition(

                // success
                (pos) => {

                    customEvent(document, 'MyPosition', {
                        status: 'success',
                        lng: pos.coords.longitude,
                        lat: pos.coords.latitude,
                        accuracy: pos.coords.accuracy,
                    })
                },

                // error
                (err) => {

                    customEvent(document, 'MyPosition', {
                        status: 'error',
                        message: 'Unable to locate your position',
                        error: err
                    })
                },

                // options
                {
                    enableHighAccuracy: true,
                    timeout: 800,
                    maximumAge: 0
                }
            )
        }
    }


    /**
     * The function `stopWatch` clears the geolocation watch position if it is currently active.
     */
    stopWatch() {

        if ( this.watchPositionID )
            navigator.geolocation.clearWatch(this.watchPositionID)
    }


    /**
     * The function `getPosition` returns a Promise that resolves with the user's current geolocation
     * coordinates or rejects with an error message if geolocation is not supported or retrieval fails.
     * @returns The `getPosition()` function returns a Promise. If the geolocation is supported by the
     * browser, it attempts to retrieve the current position using
     * `navigator.geolocation.getCurrentPosition()`. If successful, it resolves the Promise with an
     * object containing the status, latitude, longitude, and accuracy of the position. If there is an
     * error or the geolocation is not supported, it rejects the Promise with an error object
     */
    getPosition() {

        return new Promise((resolve, reject) => {

            if (!navigator.geolocation) {

                reject({ status: "error", message: "Geolocation is not supported by your browser" })

            } else {

                navigator.geolocation.getCurrentPosition(

                    // success
                    (position) => {
                        resolve({ status: "success", lat: position.coords.latitude, lng: position.coords.longitude, accuracy: position.coords.accuracy })
                    },

                    // error
                    () => {
                        reject({ status: "error", message: "Unable to retrieve your location" })
                    }
                );
            }
        })
    }


    /**
     * The function updates the location marker on a map based on the received coordinates and accuracy
     * information.
     * @param ev - The `ev` parameter in the `location` function seems to be an event object. It is
     * likely being used to capture details related to geolocation, such as longitude, latitude, and
     * accuracy. The function then processes this information to update a marker on a map and adjust
     * the map view accordingly.
     */
    location( ev ) {

        const res = ev.detail

        // console.log(res)

        // fix browser on multiple click for geoloation on watching position
        if ( res?.lng && res?.lat ) {

            const coord = new this.Coordinate([res.lng, res.lat])

            this.myLocation = { lat: res.lat, lng: res.lng }

            if ( ! this.marker ) {

                this.marker = this.UX.setHtmlMarker(coord, pointMarker(), 'middle')
                this.marker.addTo(this.UX.map).show()

            } else {

                this.marker.setCoordinates(coord)
                this.accuracyLayer.clear()
            }

            if ( res.accuracy > 5 ) {
                const circle = this.circular(coord, res.accuracy)
                circle.addTo( this.accuracyLayer )
            }

            this.needExtent && this.UX.map.fitExtent(circle.getExtent())
            this.needExtent = false
        }
    }
}