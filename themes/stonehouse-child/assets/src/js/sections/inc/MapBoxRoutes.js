import { sendHttpReq } from "../../utils/api/http"
import { popupStartNavigation } from "./items/popups/startNavigation"

export class MapBoxRoutes {

    popup = null
    routeVector = null
    selectedLine = null

    constructor ({ UX, navigator, LineVector, LineString, createElementFromHTML, coord, polylineDecoder, lineColor = 'red' }) {

        this.UX = UX

        this.navigator = navigator

        this.LineString = LineString
        this.routeVector = LineVector
        this.polylineDecoder = polylineDecoder
        this.createElementFromHTML = createElementFromHTML
        this.coord = coord
        this.lineColor = lineColor
    }


    /**
     * The `buildRoute` function uses the Mapbox API to generate a route between two locations and
     * returns a Promise with the decoded route steps.
     * @param profile - The `profile` parameter in the `buildRoute` function represents the type of
     * routing profile to use for the directions. It could be values like `driving`, `walking`,
     * `cycling`, etc., depending on the mode of transportation for which you want to generate the
     * route.
     * @returns The `buildRoute` function returns a Promise that resolves with an array of decoded
     * route coordinates after making a request to the Mapbox Directions API. The decoded route
     * coordinates are obtained by decoding the geometry of each step in the route and flipping the
     * latitude and longitude values.
     */
    buildRoute(profile, { from = { lat, lng }, to = { lat, lng } }) {

        return new Promise((resolve, reject) => {

            sendHttpReq({
                url: `https://api.mapbox.com/directions/v5/${profile}/${from.lng},${from.lat};${to.lng},${to.lat}`,
                data: {
                    overview: false,
                    alternatives: true,
                    steps: true,
                    access_token: process.env.ROUTING_MAPBOX
                }
            }).then(res => {

                res = JSON.parse(res)

                // console.log(res.routes)

                this.navigator.setRoutes(res.routes)

                const steps = res.routes[0].legs[0].steps

                let result = []

                // need review and perform code
                // const way = new this.VectorLayer('waypoints').addTo(this.UX.map)

                steps.forEach(step => {
                    result = [...result, ...this.polylineDecoder(step.geometry, 5)]

                    // console.log(step.maneuver.instruction)
                    // const coord = new this.Coordinate(Array.from(step.maneuver.location))
                    
                    // const point = this.setMarker(coord, 'default', pointHelpPointTemplate('test') )

                    // const popup = this.setHtmlMarker(coord, '<span class="content-marker"><span class="popup popup-test">' + step.maneuver.instruction + '</span>')
                    // popup.addTo(this.UX.map).hide()
                    // popup.on('click', ev => popup.hide())

                    // point.on('click', ev => popup.show())
                    // point.addTo(way)

                    // this.UX.map.setCenter(coord)
                })

                // flip latitude e longitude
                result = result.map((item, idx) => [].concat(result[idx]).reverse())

                resolve(result)
            })
        })
    }


    /**
     * The `lineRoute` function creates a route line between two points based on a specified profile.
     * @param profile - Profile refers to the type of route being requested, such as walking, driving,
     * or cycling.
     * @param from - From is the starting point or origin of the route. It is the location from where
     * the route will begin.
     * @param to - The `to` parameter in the `lineRoute` function represents the destination or
     * endpoint of the route that is being calculated. It is the location where the route will end.
     * @returns A Promise is being returned from the lineRoute function.
     */
    lineRoute( profile, from, to ) {

        return new Promise((resolve, reject) => {

            this.selectedLine && this.routeVector.removeGeometry(this.selectedLine)
    
            this.buildRoute(profile, {from, to}).then(route_coordinates => {
    
                const line = new this.LineString(route_coordinates, {
                    symbol: {
                        lineColor: this.lineColor
                    }
                })

                resolve(line)
            })
        })
    }


    startNavigation(ev) {
        this.popup.remove()
        this.navigator.startNavigation(ev)
    }


    closeNavigation() {
        this.UX.cluster.forEach( async marker => marker.show() )
        this.routeVector.removeGeometry( this.selectedLine )
    }


    prepareNavigation( destination ) {

        // hide other markers
        this.UX.cluster.forEach( async marker => {

            const markerCoord = this.coord( marker.getCoordinates() )

            if (
                markerCoord.lat !== destination.lat &&
                markerCoord.lng !== destination.lng
            ) marker.hide()
        })

        const dom = this.popup.getDOM()
        const close = dom.querySelector('.close-btn')

        const items = dom.querySelector('.routing-items')
        items.querySelectorAll('.btn-routing').forEach(async item => item.remove())
        items.classList.add('justify-around')

        const start_nav = this.createElementFromHTML( popupStartNavigation() )
        start_nav.addEventListener('click', ev => this.startNavigation(ev), false)

        close.addEventListener('click', ev => this.closeNavigation(), false)

        items.append( start_nav )
    }


    drawRoute( profile, from, to ) {

        this.lineRoute( profile, from, to ).then(line => {

            line.addTo(this.routeVector)

            this.selectedLine = line

            this.UX.map.fitExtent(line.getExtent())

            this.prepareNavigation( to )
        })
    }


    /**
     * The function `buildRoutingPath` determines the route from the current GPS location to a
     * specified destination using a given profile.
     * @param destination - The `destination` parameter in the `buildRoutingPath` function is the
     * destination location to which the route will be calculated and displayed.
     * @param profile - The `profile` parameter in the `buildRoutingPath` function is used to specify
     * the type of routing profile or method to be used for calculating the route. It could be options
     * like "driving", "walking", "cycling", etc., depending on the available routing services and
     * their supported profiles
     */
    buildRoutingPath( destination, profile ) {

        if ( ! this.navigator.gps.status ) {

            if ( ! this.navigator.gps.marker ) {

                this.navigator.gps.needExtent = false
                this.navigator.gps.startLocation()
            }


            // Observe Variable => this.navigator.gps.marker => for inescate route api request
            let observerId
            const tick = ( marker ) => {

                if ( marker ) {

                    const gpsCoord = this.navigator.gps.marker.getCoordinates()

                    this.drawRoute( profile, this.coord(gpsCoord), destination )
                    clearInterval(observerId)
                }
            }
            observerId = setInterval( () => tick(this.navigator.gps.marker), 10 )

        } else {

            const gpsCoord = this.navigator.gps.marker.getCoordinates()

            this.drawRoute( profile, this.coord(gpsCoord), destination )
        }
    }
}