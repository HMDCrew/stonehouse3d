import { customEvent } from "../../utils/customEvent.js"
import { navigatorArrow } from "./items/NavigatorArrow.js"
import { Frame } from "./elements/Frame.js"

export class ViewNovigator extends Frame {

    routes

    constructor({ map, miniMap, menu, gps, LineVector, LineString, polylineDecoder }) {

        super(map.getPitch(), map.getZoom())

        this.map = map
        this.miniMap = miniMap
        this.menu = menu
        this.gps = gps

        this.maxPitch = 36.53
        this.maxZoom = this.map.getMaxZoom()
        this.originalCenter = this.map.getCenter()
        this.originalZoom = this.currentZoom
        this.originalPitch = this.currentPitch
        this.originalBearing = this.map.getBearing()

        this.LineVector = LineVector
        this.LineString = LineString
        this.polylineDecoder = polylineDecoder

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
        this.map.setZoom( this.originalZoom, {animation: true} )
        this.map.panTo( this.originalCenter )
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


    animateChangeView() {

        ! this.paused && requestAnimationFrame( () => this.animateChangeView() )

        this.now = Date.now()
        this.delta = this.now - this.then;

        // framerate condition
        if (this.delta > this.interval) {

            this.map.setCenter(
                this.frameICoordinate( this.i++, this.map.getCenter(), this.gps.marker.getCenter() )
            )

            this.currentPitch = this.frameOf(this.currentPitch, this.maxPitch, this.i)
            this.currentZoom = this.frameOf(this.currentZoom, this.maxZoom, this.i)
        
            this.map.setPitch( this.currentPitch )
            this.map.setZoom( this.currentZoom, {animation: false} )

            this.then = this.now - (this.delta % this.interval);
        }


        if (
            this.currentPitch >= this.maxPitch &&
            this.currentZoom >= this.maxZoom
        ) {

            this.paused = true
            this.enableMapInteractions()
        }
    }

    calcolaRettaDiRegressione(punti) {
        const n = punti.length;

        // Somme necessarie per calcolare m e b
        let sommaX = 0;
        let sommaY = 0;
        let sommaXY = 0;
        let sommaX2 = 0;

        // Calcola le somme
        for (let i = 0; i < n; i++) {
            const x = punti[i][0];
            const y = punti[i][1];

            sommaX += x;
            sommaY += y;
            sommaXY += x * y;
            sommaX2 += x * x;
        }

        // Calcola il coefficiente angolare m e l'intercetta b
        const m = (n * sommaXY - sommaX * sommaY) / (n * sommaX2 - sommaX * sommaX);

        return {
            m: m,
            b: (sommaY - m * sommaX) / n
        }
    }


    rettaDiRegressioneForLineString(arrayCoordinate) {

        const lineStringArray = []

        const reg = this.calcolaRettaDiRegressione(arrayCoordinate)
        const gps_center = this.gps.marker.getCenter()

        const y = (x) => (reg.m * x) + reg.b

        const coordinate = (item) => {

            const x = item[0]

            return [x, y(x)]
        }

        lineStringArray.push([ gps_center.x, y( gps_center.x ) ])
        arrayCoordinate.forEach( coord => lineStringArray.push(coordinate(coord)) )

        return {
            line: lineStringArray,
            reg: reg
        }
    }

    startNavigation(ev) {

        // this.map.setPitch( this.maxPitch )
        // this.map.setZoom( this.maxZoom, {animation: false} )
        // this.map.panTo( this.gps.marker.getCenter() )

        const gps_center = this.gps.marker.getCenter()

        this.stopMapInteractions()
        this.miniMap._containerDOM.classList.add('hide')
        this.miniMap.stopListeners = true
        this.menu.hide()

        this.now, this.delta, this.then = Date.now()
        this.i = 0

        const line = this.polylineDecoder(this.routes[0].legs[0].steps[0].geometry)
        const result = line.map((item, idx) => [].concat(line[idx]).reverse())
        result.push([gps_center.x, gps_center.y])

        const reg = this.rettaDiRegressioneForLineString(result)

        const line2 = new this.LineString(reg.line, {
            symbol: {
                lineColor: '#1bbc9b'
            }
        })

        this.originalGpsCursor = this.gps.marker.getContent()
        this.gps.marker.setContent(navigatorArrow())


        // Converti m in un angolo in radianti
        let theta_radianti = Math.atan(reg.reg.m);
        let theta_gradi = theta_radianti * (180 / Math.PI);

        const arrow = document.querySelector('.navigator-arrow')
        // 90 - theta_gradi => per via dei assi x,y invertiti
        console.log(arrow, reg, gps_center, reg.reg, 90 - theta_gradi )

        // big problem
        arrow.style.transform = 'rotate('+(90 - theta_gradi)+'deg)'; 

        line2.addTo(this.LineVector)

        this.animateChangeView()
    }

    setRoutes( routes ) {
        this.routes = routes
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