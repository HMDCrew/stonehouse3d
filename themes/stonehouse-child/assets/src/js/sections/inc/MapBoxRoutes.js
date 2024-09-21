import { sendHttpReq } from "../../utils/api/http"
import { decode } from "@mapbox/polyline"
import { Route } from './elements/Route'
import { popupStartNavigation } from "./items/popups/startNavigation"

export class MapBoxRoutes extends Route {


    constructor ({ map, cluster, gps, LineVector, LineString, createElementFromHTML, coord, lineColor = 'red' }) {

        super( LineVector )

        this.map = map
        this.cluster = cluster
        this.gps = gps
        this.LineString = LineString
        this.createElementFromHTML = createElementFromHTML
        this.coord = coord
        this.lineColor = lineColor
    }


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

                console.log(res.routes)

                const steps = res.routes[0].legs[0].steps

                let result = []

                steps.forEach(step =>
                    result = [...result, ...decode(step.geometry, 5)]
                )

                // flip latitude e longitude
                result = result.map((item, idx) => [].concat(result[idx]).reverse())

                resolve(result)
            })
        })
    }


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
        console.log(ev)
    }


    prepareNavigation( destination ) {

        // hide other markers
        this.cluster.forEach( async marker => {

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


        close.addEventListener('click', ev => {

            this.cluster.forEach( async marker => marker.show() )

            this.routeVector.removeGeometry( this.selectedLine )

        }, false)

        items.append( start_nav )
    }


    drawRoute( profile, from, to ) {

        this.lineRoute( profile, from, to ).then(line => {

            line.addTo(this.routeVector)

            this.selectedLine = line

            ! this.gps.need_extent && this.map.fitExtent(line.getExtent())

            this.prepareNavigation( to )
        })
    }


    buildRoutingPath( destination, profile ) {

        if ( ! this.gps.status ) {

            ! this.gps.marker && this.gps.startLocation()

            // Observe Variable => this.gps.marker => for inescate route api request
            let observerId
            const tick = ( marker ) => {

                if ( marker ) {

                    const gps_coord = this.gps.marker.getCoordinates()

                    this.drawRoute( profile, this.coord(gps_coord), destination )
                    clearInterval(observerId)
                }
            }
            observerId = setInterval( () => tick(this.gps.marker), 10 )

        } else {

            const gps_coord = this.gps.marker.getCoordinates()

            this.drawRoute( profile, this.coord(gps_coord), destination )
        }
    }
}