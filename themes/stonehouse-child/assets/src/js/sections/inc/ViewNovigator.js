import { customEvent } from "../../utils/customEvent.js"
import { Frame } from "./elements/Frame.js"

export class ViewNovigator extends Frame {

    constructor({ map, gps }) {

        super(map.getPitch(), map.getZoom())

        // console.log(map.getPitch())

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
            const moviment = 0.00001
 
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
                    loc.lat += moviment
                    test()
                    break;
                case 'KeyA':
                    loc.lng -= moviment
                    test()
                    break;
                case 'KeyS':
                    loc.lat -= moviment
                    test()
                    break;
                case 'KeyD':
                    loc.lng += moviment
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
            }
        })
    }


    reset() {
        this.map.setPitch( this.originalPitch )
        this.map.setZoom( this.originalZoom, {animation: false} )
        this.map.panTo( this.originalCenter )
    }



    // var now,delta,then = Date.now();
    // var interval = 1000/30;

    // function animate() {
    //     requestAnimationFrame (animate);
    //     now = Date.now();
    //     delta = now - then;
    //     //update time dependent animations here at 30 fps
    //     if (delta > interval) {
    //         sphereMesh.quaternion.multiplyQuaternions(autoRotationQuaternion, sphereMesh.quaternion);
    //         then = now - (delta % interval);
    //     }
    //     render();
    // }

    animateChangeView() {

        ! this.paused && requestAnimationFrame( () => this.animateChangeView() )


        this.now = Date.now();
        this.delta = this.now - this.then;

        // 
        if (this.delta > this.interval) {
            
            if ( this.currentPitch < this.maxPitch ) {
                this.currentPitch += 1
        
                this.map.setPitch( this.currentPitch )
            }
        
            if ( this.currentZoom < this.maxZoom ) {
                this.currentZoom += 0.1
        
                this.map.setZoom( this.currentZoom, {animation: false} )
            }


            this.then = this.now - (this.delta % this.interval);
        }


        if (
            this.currentPitch >= this.maxPitch &&
            this.currentZoom >= this.maxZoom
        ) {

            this.paused = true
            // setTimeout(() => requestAnimationFrame( () => this.animateChangeView() ), 1000 / 30)

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

        console.log(this.currentPitch, this.map.getMaxZoom(), this.map._zoomLevel)

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