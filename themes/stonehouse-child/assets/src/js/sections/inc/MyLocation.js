import { toDegrees } from "../../utils/math/toDegrees.js"
import { toRadians } from "../../utils/math/toRadians.js"
import { customEvent } from "../../utils/customEvent.js"


const DEFAULT_RADIUS = 6371008.8;

export class MyLocation {

    constructor() {}

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

        return flatCoordinates
    }

    /**
     * Returns the coordinate at the given distance and bearing from `c1`.
     *
     * @param {import("./coordinate.js").Coordinate} c1 The origin point (`[lon, lat]` in degrees).
     * @param {number} distance The great-circle distance between the origin
     *     point and the target point.
     * @param {number} bearing The bearing (in radians).
     * @param {number} [radius] The sphere radius to use.  Defaults to the Earth's
     *     mean radius using the WGS84 ellipsoid.
     * @return {import("./coordinate.js").Coordinate} The target point.
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

    watch() {

        if ( ! navigator.geolocation ) {

            customEvent(document, 'MyPosition', {
                status: 'error',
                message: 'Localization is not supported by browser',
            })

        } else {

            navigator.geolocation.watchPosition(

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
}