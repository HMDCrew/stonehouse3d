import { sendHttpReq } from "../../utils/api/http"
// import { popupStartNavigation } from "./items/popups/startNavigation"

export class MapBoxRoutes {

    popup = null
    routeVector = null
    selectedLine = null

    constructor ({ UX, navigator, LineVector, LineString, createElementFromHTML, coord, polylineDecoder, lineColor = 'red', selectedLineColor = 'red', lineColorOpaced = 'red', selectedLineColorOpaced = 'red' }) {

        this.UX = UX

        this.navigator = navigator

        this.LineString = LineString
        this.routeVector = LineVector
        this.polylineDecoder = polylineDecoder
        this.createElementFromHTML = createElementFromHTML
        this.coord = coord

        this.lineColor = lineColor
        this.selectedLineColor = selectedLineColor
        this.lineColorOpaced = lineColorOpaced
        this.selectedLineColorOpaced = selectedLineColorOpaced

        this.topControllers = document.querySelector('.navigation-controlls-top')

        this.bottomControllers = document.querySelector('.navigation-controlls-bottom')
        this.btnStartNavigation = this.bottomControllers.querySelector('.btn-start-navigation')
        this.btnCloseNavigation = this.bottomControllers.querySelector('.btn-stop-navigation')

        this.btnStartNavigation.addEventListener('click', ev => this.startNavigation(), false)
        this.btnCloseNavigation.addEventListener('click', ev => this.closeNavigation(), false)
    }


    /**
     * The function `getRoutesSteps` takes an array of routes, extracts the steps from each route's
     * legs, decodes the polyline geometry, and returns an array of steps for each route.
     * @param routes - The `getRoutesSteps` function takes an array of routes as input. Each route in
     * the array should have a `legs` property, which is an array of legs. Each leg should have a
     * `steps` property, which is an array of steps. Each step should have a `geometry`
     * @returns The `getRoutesSteps` function returns an array of steps for each route in the input
     * `routes` array. Each step is decoded using the `polylineDecoder` method with a precision of 5.
     * The decoded steps are then reversed and stored in the `steps` array, which is returned at the
     * end of the function.
     */
    getRoutesSteps( routes ) {

        const steps = []

        Array.from( routes ).forEach( ( route, i ) => {

            const leg_steps = route.legs[0].steps

            leg_steps.forEach( step => steps[i] = [...steps[i] || [], ...this.polylineDecoder(step.geometry, 5)] )

            steps[i] = steps[i].map((item, idx) => [].concat(steps[i][idx]).reverse())
        })

        return steps
    }


    /**
     * The buildRoute function sends a HTTP request to the Mapbox API to get directions between two
     * locations and returns a Promise with the route steps.
     * @param profile - The `profile` parameter in the `buildRoute` function is used to specify the
     * type of route profile to be used for the directions. It could be values like "driving",
     * "walking", "cycling", etc., depending on the mode of transportation for which the route is being
     * generated.
     * @returns The `buildRoute` function returns a Promise that makes an HTTP request to the Mapbox
     * Directions API to get route information from the specified `from` location to the `to` location
     * using the provided `profile`. Once the response is received, it parses the JSON response, sets
     * the routes in the navigator, and resolves with the steps of the routes.
     */
    buildRoute( profile, { from = { lat, lng }, to = { lat, lng } } ) {

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

                this.navigator.setRoutes(res.routes)

                resolve( this.getRoutesSteps( res.routes ) )
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
    linesRoutes( profile, from, to ) {

        return new Promise((resolve, reject) => {

            this.selectedLine && this.routeVector.removeGeometry(this.selectedLine)
    
            this.buildRoute(profile, {from, to}).then(routes_steps => {

                const lines = []
                const opaced = []

                const smoothness = 0.3

                routes_steps.forEach( steps => {

                    lines.push(

                        new this.LineString( steps, {
                            smoothness,
                            symbol: {
                                lineColor: this.lineColor,
                                lineWidth: 4
                            }
                        })
                    )

                    opaced.push(

                        new this.LineString( steps, {
                            smoothness,
                            symbol: {
                                lineColor: this.lineColorOpaced,
                                lineWidth: 8
                            }
                        })
                    )
                })

                resolve({ lines, opaced })
            })
        })
    }


    startNavigation() {

        this.bottomControllers.classList.add('closed')
        this.topControllers.classList.remove('closed')

        this.navigator.navigationStarted = true
        this.navigator.startNavigation()
    }


    closeNavigation() {

        this.navigator.navigationStarted = false
        this.bottomControllers.classList.add('closed')

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

        this.popup.remove()

        this.bottomControllers.classList.remove('closed')
    }


    selectRoute( idx, lines, opaced ) {

        lines.forEach((line, i) => {

            line.bringToBack()
            opaced[i].bringToBack()

            line.updateSymbol({ lineColor: this.lineColor })
            opaced[i].updateSymbol({ lineColor: this.lineColorOpaced })
        })

        lines[idx].updateSymbol({ lineColor: this.selectedLineColor })
        opaced[idx].updateSymbol({ lineColor: this.selectedLineColorOpaced })

        lines[idx].bringToFront()
        opaced[idx].bringToFront()

        this.selectedLine = lines[idx]
    }


    drawRoute( profile, from, to ) {

        this.linesRoutes( profile, from, to ).then( ({ lines, opaced }) => {

            let lastExcent = false

            lines.forEach( line => {

                line.addTo(this.routeVector)

                lastExcent = (
                    lastExcent
                    ? lastExcent.combine(line.getExtent())
                    : line.getExtent()
                )
            })

            opaced.forEach( (line, i) => {

                line.on('click', ev => this.selectRoute( i, lines, opaced ))

                line.addTo(this.routeVector)
            })

            this.selectRoute( 0, lines, opaced )
            this.UX.map.fitExtent(lastExcent, -1)
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