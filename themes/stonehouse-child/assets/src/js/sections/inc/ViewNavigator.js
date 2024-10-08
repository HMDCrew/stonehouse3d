import { customEvent } from "../../utils/customEvent.js"
import { NavigatorCursor } from "./elements/NavigatorCursor.js"
import { toRadians } from "../../utils/math/toRadians.js"
import * as turf from "@turf/turf"

const FRAME = 60

export class ViewNavigator {

    routes
    route_id
    navigationStarted = false
    paused = false
    
    currentPitch = 0
    currentZoom = 0
    interval = 1000 / FRAME

    now
    delta
    then

    constructor({ UX, gps, Coordinate, VectorLayer, polylineDecoder, coord }) {

        this.UX = UX

        this.currentPitch = Number.parseFloat( this.UX.map.getPitch() )
        this.currentZoom = Number.parseFloat( this.UX.map.getZoom() )

        this.gps = gps

        this.maxPitch = 36.53
        this.maxZoom = this.UX.map.getMaxZoom()

        this.originalCenter = null
        this.originalZoom = null
        this.originalPitch = null
        this.originalBearing = null
        this.originalGpsMarker = null

        this.polylineDecoder = polylineDecoder
        this.coord = coord
        this.Coordinate = Coordinate
        this.VectorLayer = VectorLayer

        this.topControllers = document.querySelector('.navigation-controlls-top')
        this.bottomControllers = document.querySelector('.navigation-controlls-bottom')
        this.stopBtn = document.querySelector('.btn-stop-navigation')

        this.stopBtn.addEventListener('click', ev => this.stopNavigation(), false)
        this.indications = this.topControllers.querySelector('.indications .instruction')


        document.addEventListener('keyup', ev => {
            
            const loc = this.gps.myLocation
            const moviment = 0.001
            const center = this.UX.map.getCenter()
 
            const test = () => {
                customEvent(document, 'MyPosition', {
                    status: 'success',
                    lng: loc.lng,
                    lat: loc.lat,
                    accuracy: 1,
                })
            }

            switch(ev.code) {
                case 'KeyW':
                    loc.lat += moviment / 100
                    test()
                    break;
                case 'KeyA':
                    loc.lng -= moviment / 100
                    test()
                    break;
                case 'KeyS':
                    loc.lat -= moviment / 100
                    test()
                    break;
                case 'KeyD':
                    loc.lng += moviment / 100
                    test()
                    break;



                case 'KeyE':
                    loc.lat += moviment / 100
                    loc.lng += moviment / 100
                    test()
                    break;
                case 'KeyQ':
                    loc.lng -= moviment / 100
                    loc.lat += moviment / 100
                    test()
                    break;


                case 'KeyZ':
                    // angolazione
                    // this.UX.map.setPitch(36.53);
                    // this.UX.map.setPitch(this.pitch);
                    break;
                case 'KeyX':
                    // rotazione
                    // this.UX.map.setBearing(this.bearing++);
                    break;
                case 'KeyI':
                    this.UX.map.panTo({
                        x: center.x,
                        y: center.y + moviment
                    })
                    break;
                case 'KeyL':
                    this.UX.map.panTo({
                        x: center.x + moviment,
                        y: center.y
                    })
                    break;
                case 'KeyK':
                    this.UX.map.panTo({
                        x: center.x,
                        y: center.y - moviment
                    })
                    break;
                case 'KeyJ':
                    this.UX.map.panTo({
                        x: center.x - moviment,
                        y: center.y
                    })
                    break;
            }
        })

        document.addEventListener('MyPosition', ev => this.positionUpdated(ev))
    }


    /**
     * The function `frameICoordinate` calculates the coordinates of a point based on the given index,
     * start point, and end point.
     * @param i - The parameter `i` in the `frameICoordinate` function represents the current frame
     * number or iteration. It is used to calculate the intermediate coordinates between the `start`
     * and `end` points based on the total number of frames specified.
     * @param start - The `start` parameter represents the starting coordinates of a frame or
     * animation. It typically includes the x and y coordinates where the animation should begin.
     * @param end - The `end` parameter in the `frameICoordinate` function represents the end point of
     * a line segment in a 2D coordinate system. It is an object with `x` and `y` properties that
     * specify the coordinates of the end point.
     * @returns The function `frameICoordinate(i, start, end)` returns an object with `x` and `y`
     * properties. The `x` property is calculated as `start.x + i * ((end.x - start.x) / FRAME)`, and
     * the `y` property is calculated as `start.y + i * ((end.y - start.y) / FRAME)`.
     */
    frameICoordinate( i, start, end ) {

        return {
            x: start.x + i * ( (end.x - start.x) / FRAME ),
            y: start.y + i * ( (end.y - start.y) / FRAME )
        }
    }


    /**
     * The `frameOf` function calculates the intermediate value between `current` and `target` based on
     * the current frame number.
     * @param current - The `current` parameter represents the current value of the frame.
     * @param target - The `target` parameter in the `frameOf` function represents the value that the
     * `current` parameter is being interpolated towards.
     * @param currentFrame - The `currentFrame` parameter represents the current frame number in an
     * animation or transition. It is used to calculate the progress of the animation or transition
     * relative to the total number of frames.
     * @returns the result of linear interpolation (lerp) between the current and target values based
     * on the current frame progress.
     */
    frameOf( current, target, currentFrame ) {

        const t = currentFrame / FRAME;

        return this.lerp(current, target, t);
    }
    

    /**
     * The lerp function calculates a linear interpolation between two values based on a given
     * interpolation factor.
     * @param start - The `start` parameter in the `lerp` function represents the starting value from
     * which the interpolation will begin. This is the initial value that you want to interpolate from.
     * @param end - The `end` parameter in the `lerp` function represents the ending value or target
     * value towards which you want to interpolate. It is the value that you want to reach when `t` is
     * equal to 1.
     * @param t - The parameter `t` in the `lerp` function represents a value between 0 and 1 that
     * determines the interpolation factor between the `start` and `end` values. When `t` is 0, the
     * function returns the `start` value, and when `t` is
     * @returns The function `lerp` returns a linear interpolation value between the `start` and `end`
     * values based on the parameter `t`.
     */
    lerp( start, end, t ) {
        return start + t * (end - start);
    }


    /**
     * The function `stopMapInteractions` disables various map interactions in a JavaScript
     * application.
     */
    stopMapInteractions() {
        this.UX.map.setOptions({
            draggable : false,
            dragPan : false,
            dragRotate : false,
            dragPitch : false,
            scrollWheelZoom : false,
            touchZoom : false,
            doubleClickZoom : false
        })
    }


    /**
     * The function `enableMapInteractions` enables various map interactions like dragging, scrolling,
     * zooming, and rotating.
     */
    enableMapInteractions() {
        this.UX.map.setOptions({
            draggable: true,
            dragPan: true,
            dragRotate: true,
            dragPitch: true,
            scrollWheelZoom: true,
            touchZoom: true,
            doubleClickZoom: true
        })
    }


    /**
     * The `animateView` function animates the view of a map by updating its center, pitch, and zoom
     * properties over time until reaching the specified targets.
     */
    animateView({ mapDestination, pitchTarget, zoomTarget, onMiddle = () => {}, onEnd }) {
        
        ! this.paused && requestAnimationFrame( () => this.animateView({ mapDestination, pitchTarget, zoomTarget, onEnd }) )

        this.now = Date.now()
        this.delta = this.now - this.then

        // framerate condition
        if ( this.delta > this.interval ) {


            this.UX.map.setCenter(
                this.frameICoordinate( this.i++, this.UX.map.getCenter(), mapDestination )
            )

            this.currentPitch = this.frameOf(this.currentPitch, pitchTarget, this.i)
            this.currentZoom = this.frameOf(this.currentZoom, zoomTarget, this.i)

            this.UX.map.setPitch( this.currentPitch )
            this.UX.map.setZoom( this.currentZoom, { animation: false } )

            onMiddle()

            this.then = this.now - (this.delta % this.interval)
        }

        onEnd(mapDestination, pitchTarget, zoomTarget)
    }


    pointsDistance( p1, p2 ) {
        // return Math.sqrt(
        //     Math.pow( p1.x - p2.x, 2 ) + 
        //     Math.pow( p1.y - p2.y, 2 )
        // )

        p1 = { x: toRadians(p1.x), y: toRadians(p1.y) }
        p2 = { x: toRadians(p2.x), y: toRadians(p2.y) }

        return 2 * 6371000 * Math.asin(
            Math.sqrt(
                Math.pow(
                    Math.sin( ( p2.y - p1.y ) / 2 ),
                    2
                ) +
                Math.cos( p1.y ) * Math.cos( p2.y ) *
                Math.pow(
                    Math.sin( (p2.x - p1.x) / 2 ),
                    2
                )
            )
        )
    }

    turfCoordSystem( coordinates ) {
        return coordinates.map( item => [item.x, item.y] )
    }

    updateInstruction( step ) {
        this.indications.textContent = step.maneuver.instruction
    }


    refreshNavigation() {

        const mapBox = this.UX.manager.mapBox
        const gpsCoord = this.gps.marker.getCoordinates()

        mapBox.routeVector.clear()
        mapBox.linesRoutes( mapBox.profile, this.coord(gpsCoord), mapBox.destination ).then( ({ lines, opaced }) => {
    
            mapBox.lines = lines
    
            lines[0].addTo(mapBox.routeVector)
            opaced[0].addTo(mapBox.routeVector)

            mapBox.selectRoute( 0, lines, opaced )
        })

        this.selectedLine = mapBox.selectedLine
        this.turfLineString = turf.lineString(this.turfCoordSystem( this.selectedLine.getCoordinates() ))
        this.selectedStep = 0
    }


    positionUpdated( ev ) {

        if ( this.navigationStarted ) {

            const path = this.routes[this.route_id]
            const step = path.legs[0].steps[this.selectedStep]

            this.UX.map.setCenter(this.gps.marker.getCenter())
            
            if ( step ) {

                const coord = new this.Coordinate(step.maneuver.location)
                const myLocation = this.gps.marker.getCenter()

                // Recalculates the position when you go the wrong way
                const cursorPoint = turf.point([myLocation.x, myLocation.y])
                const distance = turf.pointToLineDistance(cursorPoint, this.turfLineString, { units: 'meters' })

                if ( distance >= 8 ) {
                    // this.refreshNavigation()
                }

                const distanceHelp = this.pointsDistance( myLocation, coord )

                if (
                    distanceHelp <= 4 ||
                    step.maneuver.bearing_before <= 4
                ) {

                    this.selectedStep++
                    this.updateInstruction( path.legs[0].steps[this.selectedStep] )
                }
            }
        }
    }


    /**
     * The function `startNavigation` initializes a navigation process by setting up various parameters
     * and animating the map view towards a specific destination.
     * @param ev - The `ev` parameter in the `startNavigation` function likely stands for an event
     * object that is being passed to the function. Event objects are commonly used in JavaScript to
     * provide information about events that occur in the browser, such as mouse clicks, key presses,
     * or form submissions.
     */
    startNavigation( selectedLine ) {

        this.selectedLine = selectedLine
        // this.accuracyLayer = new this.VectorLayer('vector-helps').addTo(this.UX.map)
        this.turfLineString = turf.lineString(this.turfCoordSystem( this.selectedLine.getCoordinates() ))
        this.selectedStep = 0


        // const path = this.routes[this.route_id]
        // console.log(path)
        // Array.from( path.legs[0].steps ).forEach( async step => {
        //     const marker = this.UX.setHtmlMarker(step.maneuver.location, pointMarker(), 'middle')
        //     marker.addTo(this.UX.map).show()
        // })

        this.positionUpdated( true )

        this.stopMapInteractions()
        this.UX.miniMap._containerDOM.classList.add('hide')
        this.UX.miniMap.stopListeners = true
        this.UX.menu.hide()

        this.now, this.delta, this.then = Date.now()
        this.paused = false
        this.i = 0

        this.originalCenter  = this.UX.map.getCenter()
        this.originalZoom    = this.UX.map.getZoom()
        this.originalPitch   = this.UX.map.getPitch()
        this.originalBearing = this.UX.map.getBearing()

        this.originalGpsMarkerContent = this.gps.marker.getContent()

        const cursor = new NavigatorCursor({
            gps: this.gps,
            map: this.UX.map,
            firstDecodedPolyline: this.polylineDecoder(this.routes[0].legs[0].steps[0].geometry),
        })

        this.animateView({
            mapDestination: this.gps.marker.getCenter(),
            pitchTarget: this.maxPitch,
            zoomTarget: this.maxZoom,
            onMiddle: () => {},
            onEnd: (mapDestination, pitchTarget, zoomTarget) => {
    
                if (
                    this.currentPitch >= pitchTarget &&
                    this.currentZoom >= zoomTarget
                ) {
    
                    this.paused = true
                    this.enableMapInteractions()
                }
            }
        })
    }


    /**
     * The function `stopNavigation` stops map interactions, shows the mini map, and animates the view
     * back to its original state.
     */
    stopNavigation() {

        if ( this.navigationStarted ) {

            this.stopMapInteractions()
            this.UX.miniMap._containerDOM.classList.remove('hide')
            this.UX.miniMap.stopListeners = false
            this.UX.menu.show()
    
            this.now, this.delta, this.then = Date.now()
            this.paused = false
            this.i = 0
    
            this.animateView({
                mapDestination: this.originalCenter,
                pitchTarget: this.originalPitch,
                zoomTarget: this.originalZoom,
                onEnd: (mapDestination, pitchTarget, zoomTarget) => {
    
                    if (
                        this.currentPitch <= pitchTarget &&
                        this.currentZoom <= zoomTarget
                    ) {
    
                        this.paused = true
                        this.enableMapInteractions()
    
                        this.bottomControllers.classList.add('closed')
                    }
                }
            })
    
            this.gps.marker.setContent( this.originalGpsMarkerContent )
        }
    }
}