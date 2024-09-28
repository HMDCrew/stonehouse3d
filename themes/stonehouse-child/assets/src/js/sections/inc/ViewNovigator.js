import { customEvent } from "../../utils/customEvent.js"
import { Frame } from "./elements/Frame.js"
import { NavigatorCursor } from "./elements/NavigatorCursor.js"

export class ViewNovigator extends Frame {

    routes


    constructor({ map, miniMap, menu, gps, LineString, polylineDecoder }) {

        super(map.getPitch(), map.getZoom())

        this.map = map
        this.miniMap = miniMap
        this.menu = menu
        this.gps = gps

        this.maxPitch = 36.53
        this.maxZoom = this.map.getMaxZoom()

        this.originalCenter = null
        this.originalZoom = null
        this.originalPitch = null
        this.originalBearing = null
        this.originalGpsMarker = null

        this.LineString = LineString
        this.polylineDecoder = polylineDecoder

        this.bottomControllers = document.querySelector('.navigation-controlls-bottom')
        this.stopBtn = document.querySelector('.btn-stop-navigation')

        this.stopBtn.addEventListener('click', ev => this.stopNavigation(), false)

        document.addEventListener("keyup", ev => {
            
            const loc = this.gps.myLocation
            const moviment = 0.001
            const center = this.map.getCenter()
 
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
                    // this.map.setPitch(36.53);
                    // this.map.setPitch(this.pitch);
                    break;
                case 'KeyX':
                    // rotazione
                    // this.map.setBearing(this.bearing++);
                    break;
                case 'KeyI':
                    this.map.panTo({
                        x: center.x,
                        y: center.y + moviment
                    })
                    break;
                case 'KeyL':
                    this.map.panTo({
                        x: center.x + moviment,
                        y: center.y
                    })
                    break;
                case 'KeyK':
                    this.map.panTo({
                        x: center.x,
                        y: center.y - moviment
                    })
                    break;
                case 'KeyJ':
                    this.map.panTo({
                        x: center.x - moviment,
                        y: center.y
                    })
                    break;
            }
        })
    }


    stopMapInteractions() {
        this.map.setOptions({
            draggable : false,
            dragPan : false,
            dragRotate : false,
            dragPitch : false,
            scrollWheelZoom : false,
            touchZoom : false,
            doubleClickZoom : false
        })
    }


    enableMapInteractions() {
        this.map.setOptions({
            draggable: true,
            dragPan: true,
            dragRotate: true,
            dragPitch: true,
            scrollWheelZoom: true,
            touchZoom: true,
            doubleClickZoom: true
        })
    }


    animateViewOut() {

        ! this.pausedOut && requestAnimationFrame( () => this.animateViewOut() )

        this.now = Date.now()
        this.delta = this.now - this.then;

        // framerate condition
        if ( this.delta > this.interval ) {

            this.map.setCenter(
                this.frameICoordinate( this.i++, this.map.getCenter(), this.originalCenter )
            )

            this.currentPitch = this.frameOf(this.currentPitch, this.originalPitch, this.i)
            this.currentZoom = this.frameOf(this.currentZoom, this.originalZoom, this.i)

            this.map.setPitch( this.currentPitch )
            this.map.setZoom( this.currentZoom, { animation: false } )

            this.then = this.now - (this.delta % this.interval);
        }

        if (
            this.currentPitch <= this.originalPitch &&
            this.currentZoom <= this.originalZoom
        ) {

            this.pausedOut = true
            this.enableMapInteractions()

            this.bottomControllers.classList.add('closed')
        }
    }


    stopNavigation() {

        this.stopMapInteractions()
        this.miniMap._containerDOM.classList.remove('hide')
        this.miniMap.stopListeners = false
        this.menu.show()

        this.now, this.delta, this.then = Date.now()
        this.i = 0

        this.animateViewOut()

        this.gps.marker.setContent( this.originalGpsMarkerContent )
    }


    animateViewIn() {

        ! this.pausedIn && requestAnimationFrame( () => this.animateViewIn() )

        this.now = Date.now()
        this.delta = this.now - this.then;

        // framerate condition
        if ( this.delta > this.interval ) {

            this.map.setCenter(
                this.frameICoordinate( this.i++, this.map.getCenter(), this.gps.marker.getCenter() )
            )

            this.currentPitch = this.frameOf(this.currentPitch, this.maxPitch, this.i)
            this.currentZoom = this.frameOf(this.currentZoom, this.maxZoom, this.i)

            this.map.setPitch( this.currentPitch )
            this.map.setZoom( this.currentZoom, { animation: false } )

            this.then = this.now - (this.delta % this.interval);
        }


        if (
            this.currentPitch >= this.maxPitch &&
            this.currentZoom >= this.maxZoom
        ) {

            this.pausedIn = true
            this.enableMapInteractions()

            this.bottomControllers.classList.remove('closed')
        }
    }


    startNavigation(ev) {

        this.stopMapInteractions()
        this.miniMap._containerDOM.classList.add('hide')
        this.miniMap.stopListeners = true
        this.menu.hide()

        this.now, this.delta, this.then = Date.now()
        this.i = 0

        this.originalCenter  = this.map.getCenter()
        this.originalZoom    = this.map.getZoom()
        this.originalPitch   = this.map.getPitch()
        this.originalBearing = this.map.getBearing()

        this.originalGpsMarkerContent = this.gps.marker.getContent()

        const cursor = new NavigatorCursor({
            gps: this.gps,
            firstDecodedPolyline: this.polylineDecoder(this.routes[0].legs[0].steps[0].geometry),
        })

        this.animateViewIn()
    }


    setRoutes( routes ) {
        this.routes = routes
    }
}