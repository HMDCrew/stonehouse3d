import { sendHttpReq } from "../../utils/api/http"
import { decode } from "@mapbox/polyline"
import { Route } from './elements/Route'
import { coord } from "./items/coord"
import { popupStartNavigation } from "./items/popupStartNavigation"

export class MapBoxRoutes extends Route {


    constructor ({ map, cluster, location, gps, LineVector, LineString, createElementFromHTML, lineColor = 'red' }) {

        super( LineVector )

        this.map = map
        this.cluster = cluster
        this.location = location
        this.gps = gps
        this.LineString = LineString
        this.createElementFromHTML = createElementFromHTML
        this.lineColor = lineColor
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




    start_location() {

        // Emit Event "MyPosition"
        this.gps.watch()
        this.gps.status = true
    }





    start_navigation(ev) {
        console.log(ev)
    }

    prepare_navigation( destination ) {

        // hide other markers
        this.cluster.forEach( async marker => {

            const marker_coord = coord( marker.getCoordinates() )

            if (
                marker_coord.lat !== destination.lat &&
                marker_coord.lng !== destination.lng
            ) marker.hide()
        })

        const dom = this.popup.getDOM()
        const close = dom.querySelector('.close-btn')

        const items_container = dom.querySelector('.routing-items')
        items_container.querySelectorAll('.btn-routing').forEach(async item => item.remove())
        items_container.classList.add('justify-around')

        const btn_start_nav = this.createElementFromHTML( popupStartNavigation() )
        btn_start_nav.addEventListener('click', ev => this.start_navigation(ev), false)


        close.addEventListener('click', ev => {

            this.cluster.forEach( async marker => marker.show() )

            this.routeVector.removeGeometry( this.selectedLine )

        }, false)

        items_container.append( btn_start_nav )
    }


    draw_route( profile, from, to ) {

        this.lineRoute( profile, from, to ).then(line => {

            line.addTo(this.routeVector)

            this.selectedLine = line

            ! this.gps.need_extent && this.map.fitExtent(line.getExtent())

            this.prepare_navigation( to )
        })
    }


    build_routing_path( destination, profile ) {

        if ( ! this.gps.status ) {

            ! this.gps.marker && this.start_location()

            // Observe Variable => this.gps.marker => for inescate route api request
            let observer_id
            const tick = ( marker ) => {

                if ( marker ) {

                    const gps_coord = this.gps.marker.getCoordinates()

                    this.draw_route( profile, coord(gps_coord), destination )
                    clearInterval(observer_id)
                }
            }
            observer_id = setInterval( () => tick(this.gps.marker), 10 )

        } else {

            const gps_coord = this.gps.marker.getCoordinates()

            this.draw_route( profile, coord(gps_coord), destination )
        }
    }
}