import { customEvent } from "../../utils/customEvent.js"
import { NavigatorCursor } from "./elements/NavigatorCursor.js"

const FRAME = 60

export class ViewNovigator {

    routes
    paused = false
    
    currentPitch = 0
    currentZoom = 0
    interval = 1000 / FRAME

    now
    delta
    then

    constructor({ UX, gps, LineString, polylineDecoder }) {

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

        this.LineString = LineString
        this.polylineDecoder = polylineDecoder

        this.bottomControllers = document.querySelector('.navigation-controlls-bottom')
        this.stopBtn = document.querySelector('.btn-stop-navigation')

        this.stopBtn.addEventListener('click', ev => this.stopNavigation(), false)

        document.addEventListener("keyup", ev => {
            
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
    }


    frameICoordinate(i, start, end) {

        return {
            x: start.x + i * ( (end.x - start.x) / FRAME ),
            y: start.y + i * ( (end.y - start.y) / FRAME )
        }
    }


    frameOf(current, target, currentFrame) {

        const t = currentFrame / FRAME;

        return this.lerp(current, target, t);
    }
    

    lerp(start, end, t) {
        return start + t * (end - start);
    }


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


    animateView({ mapDestination, pitchTarget, zoomTarget, onEnd }) {

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

            this.then = this.now - (this.delta % this.interval)
        }

        onEnd(mapDestination, pitchTarget, zoomTarget)
    }


    startNavigation( ev ) {

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
            firstDecodedPolyline: this.polylineDecoder(this.routes[0].legs[0].steps[0].geometry),
        })

        this.animateView({
            mapDestination: this.gps.marker.getCenter(),
            pitchTarget: this.maxPitch,
            zoomTarget: this.maxZoom,
            onEnd: (mapDestination, pitchTarget, zoomTarget) => {

                if (
                    this.currentPitch >= pitchTarget &&
                    this.currentZoom >= zoomTarget
                ) {

                    this.paused = true
                    this.enableMapInteractions()

                    this.bottomControllers.classList.remove('closed')
                }
            }
        })
    }


    stopNavigation() {

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


    setRoutes( routes ) {
        this.routes = routes
    }
}