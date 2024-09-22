import { customEvent } from "../../utils/customEvent.js"

export class ViewNovigator {

    constructor({map, gps}) {

        this.map = map
        this.gps = gps

        this.originalPitch = this.map.getPitch()
        this.originalBearing = this.map.getBearing()

        document.addEventListener("keyup", ev => {

            const loc = this.gps.myLocation
 
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
                    loc.lat += 0.0001
                    test()
                    break;
                case 'KeyA':
                    loc.lng -= 0.0001
                    test()
                    break;
                case 'KeyS':
                    loc.lat -= 0.0001
                    test()
                    break;
                case 'KeyD':
                    loc.lng += 0.0001
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

    startNavigation(ev) {

        this.map.setPitch(36.53)
        this.map.setZoom( this.map.getMaxZoom(), {animation: false} )
        this.map.panTo( this.gps.marker.getCenter() )

        console.log(ev, this.map.getMaxZoom(), this.map._zoomLevel)
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