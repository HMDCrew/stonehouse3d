import { sendHttpReq } from "../../utils/api/http"
import { decode } from "@mapbox/polyline"


export class MapBoxMiddleware {


    constructor ( router, lineString, lineColor = 'red' ) {

        this.router = router
        this.lineString = lineString
        this.lineColor = lineColor
    }


    line_route( profile, from, to ) {

        return new Promise((resolve, reject) => {

            this.router.selected_line && this.router.vector.removeGeometry(this.router.selected_line)
    
            this.build_route(profile, {from, to}).then(route_coordinates => {
    
                const line = new this.lineString(route_coordinates, {
                    symbol: {
                        lineColor: this.lineColor
                    }
                })

                resolve(line)
            })
        })
    }


    build_route(profile, { from = { lat, lng }, to = { lat, lng } }) {

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
}