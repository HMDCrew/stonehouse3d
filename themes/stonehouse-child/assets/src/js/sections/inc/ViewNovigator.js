import { customEvent } from "../../utils/customEvent.js"
import { Frame } from "./elements/Frame.js"

export class ViewNovigator extends Frame {

    constructor({ map, gps }) {

        super(map.getPitch(), map.getZoom())

        this.map = map
        this.gps = gps

        this.maxPitch = 36.53
        this.maxZoom = this.map.getMaxZoom()
        this.originalCenter = this.map.getCenter()
        this.originalZoom = this.currentZoom
        this.originalPitch = this.currentPitch
        this.originalBearing = this.map.getBearing()

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


    reset() {
        this.map.setPitch( this.originalPitch )
        this.map.setZoom( this.originalZoom, {animation: false} )
        this.map.panTo( this.originalCenter )
    }


    frameIntermedio(i, inizio, fine) {

        return {
            x: inizio.x + i * ( (fine.x - inizio.x) / 60 ),
            y: inizio.y + i * ( (fine.y - inizio.y) / 60 )
        }
    }


    animateChangeView() {

        ! this.paused && requestAnimationFrame( () => this.animateChangeView() )

        this.now = Date.now()
        this.delta = this.now - this.then;

        // framerate condition
        if (this.delta > this.interval) {

            this.map.setCenter(
                this.frameIntermedio( this.i++, this.map.getCenter(), this.gps.marker.getCenter() )
            )

            this.currentPitch += this.frameOf( this.maxPitch - this.currentPitch )
            this.currentZoom += this.frameOf( this.maxZoom - this.currentZoom )
        
            this.map.setPitch( this.currentPitch )
            this.map.setZoom( this.currentZoom, {animation: false} )

            this.then = this.now - (this.delta % this.interval);
        }


        if (
            this.currentPitch >= this.maxPitch &&
            this.currentZoom >= this.maxZoom
        ) {

            this.paused = true

        } /*else {

            // console.log('stop animation frame')
            this.map.panTo( this.gps.marker.getCenter() )
        }*/
    }


    startNavigation(ev) {

        // this.map.setPitch( this.maxPitch )
        // this.map.setZoom( this.maxZoom, {animation: false} )
        // this.map.panTo( this.gps.marker.getCenter() )

        this.now, this.delta, this.then = Date.now()
        this.i = 0

        // console.log(this.currentPitch, this.map.getMaxZoom(), this.map._zoomLevel)

        this.animateChangeView()
    }
}


// function changeView() {
//     if (pitch > 50) {
//       d = 'down';
//     } else if (pitch < 0) {
//       d = 'up';
//     }
//     if (d === 'down') {
//       pitch--;
//     } else {
//       pitch++;
//     }
//     map.setPitch(pitch);
//     map.setBearing(bearing++);
//     if (!paused) {
//       requestAnimationFrame(changeView);
//     }
//   }

//   function reset() {
//     requestAnimationFrame(function() {
//       paused = true;
//       pitch = 0;
//       bearing = 0;
//       map.setPitch(0);
//       map.setBearing(0);
//     });
//   }